from flask import Flask, request, jsonify
import uuid
import time
import google.generativeai as genai
from openai import OpenAI
import json 
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()

# --- API Configs ---
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel("models/gemini-1.5-flash-8b-latest")

groq = OpenAI(api_key=os.environ.get('GROQ_API_KEY'), base_url="https://api.groq.com/openai/v1")
openrouter = OpenAI(api_key=os.environ.get('OPENROUTER_API_KEY'), base_url="https://openrouter.ai/api/v1")

# --- App Setup ---
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
sessions = {}

# --- Question Categories for Comprehensive Medical Assessment ---
QUESTION_CATEGORIES = [
    "chief_complaint",
    "symptoms_detail",
    "duration_progression",
    "aggravating_relieving_factors",
    "medical_history",
    "lifestyle_factors",
    "physical_examination",
    "systemic_symptoms",
    "psychological_impact",
    "previous_treatments"
]

# --- Helper Functions ---

def get_gemini_response(prompt):
    try:
        return gemini_model.generate_content(prompt).text.strip()
    except Exception as e:
        return f"[Gemini Error] {e}"

def get_groq_response(prompt):
    try:
        return groq.chat.completions.create(
            model="llama3-8b-8192", messages=[{"role": "user", "content": prompt}]
        ).choices[0].message.content.strip()
    except Exception as e:
        return f"[Groq Error] {e}"

def get_openrouter_response(prompt):
    try:
        return openrouter.chat.completions.create(
            model="openai/gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]
        ).choices[0].message.content.strip()
    except Exception as e:
        return f"[OpenRouter Error] {e}"

def vote_best_response(responses):
    # Filter out error responses
    valid_responses = [r for r in responses if not r.startswith("[") or "Error" not in r]
    if not valid_responses:
        return responses[0]
    return max(set(valid_responses), key=valid_responses.count)

def get_next_question_category(session):
    """Determine which category of questions to ask next based on completeness and confidence"""
    asked_categories = session.get("asked_categories", [])
    
    # First, check if we have enough confidence to stop
    if session.get("confidence", 0) >= 0.8:  # 80% confidence threshold
        return None
    
    # Then check for unasked categories
    for category in QUESTION_CATEGORIES:
        if category not in asked_categories:
            return category
    
    # If all categories asked but still low confidence, prioritize follow-up in most relevant categories
    if session.get("confidence", 0) < 0.6:
        # Identify key categories based on initial answers
        if "chief_complaint" in session and "symptoms_detail" in session:
            return random.choice(["symptoms_detail", "physical_examination", "aggravating_relieving_factors"])
    
    return None

def assess_confidence_and_completeness(session):
    """Evaluate how confident we are in the diagnosis and if we have enough information"""
    history_text = "\n".join([f"Q: {x['question']}\nA: {x['answer']}" for x in session["chat_history"]])
    
    prompt = f"""Evaluate the following medical Q&A session and provide a confidence score (0-1) about whether we have enough information for a diagnosis.

User Summary: {session['summary']}
Q&A Session:
{history_text}

Consider:
1. Have we covered all relevant symptom details?
2. Do we understand the progression and duration?
3. Have we identified aggravating/relieving factors?
4. Is the medical history complete enough?
5. Are there any obvious gaps in information?

Respond ONLY with a JSON object containing:
{{
  "confidence": <0-1>,
  "missing_info": [<list of key missing information pieces>],
  "sufficient_for_diagnosis": <true/false>
}}"""

    responses = [get_gemini_response(prompt), get_groq_response(prompt), get_openrouter_response(prompt)]
    best_response = vote_best_response(responses)
    
    try:
        evaluation = json.loads(best_response)
        session["confidence"] = evaluation.get("confidence", 0)
        session["missing_info"] = evaluation.get("missing_info", [])
        return evaluation
    except:
        # Default values if parsing fails
        session["confidence"] = min(0.5, len(session["chat_history"]) / 10)  # Basic heuristic
        return {
            "confidence": session["confidence"],
            "missing_info": [],
            "sufficient_for_diagnosis": False
        }

def ask_detailed_question(user_summary, chat_history, category, session):
    """Ask comprehensive medical questions based on category"""
    history_text = "\n".join([f"Q: {x['question']}\nA: {x['answer']}" for x in chat_history])
    
    # If we have missing info from confidence assessment, prioritize those
    if session.get("missing_info"):
        missing_prompt = f"""Based on the medical Q&A session below, ask exactly ONE concise, clear multiple-choice question to clarify: {session['missing_info'][0]}

User Summary: {user_summary}
Previous Answers:
{history_text}

IMPORTANT FORMATTING RULES:
1. Your response must start immediately with "Question:" followed by the question text
2. After the question, include exactly 3 options labeled "Options:" followed by:
   1. <option 1>
   2. <option 2>
   3. <option 3>
3. Do NOT include any introductory text, explanations, or other content
4. Keep the question concise (1 sentence) and options brief (2-5 words each)

Example of required format:
Question: What time of day is your pain usually worst?
Options:
1. Morning
2. Afternoon
3. Evening

Now generate your question following these rules exactly:"""
        
        responses = [get_gemini_response(missing_prompt), get_groq_response(missing_prompt), get_openrouter_response(missing_prompt)]
        return vote_best_response(responses)
    
    # Common format instructions for all categories
    format_instructions = """IMPORTANT FORMATTING RULES:
1. Your response must start immediately with "Question:" followed by the question text
2. After the question, include exactly 3 options labeled "Options:" followed by:
   1. <option 1>
   2. <option 2>
   3. <option 3>
3. Do NOT include any introductory text, explanations, or other content
4. Keep the question concise (1 sentence) and options brief (2-5 words each)

Example of required format:
Question: What time of day is your pain usually worst?
Options:
1. Morning
2. Afternoon
3. Evening

Now generate your question following these rules exactly:"""
    
    category_prompts = {
        "chief_complaint": f"""Ask a detailed question about the user's main complaint based on their initial summary: "{user_summary}"

Focus on getting specific details about what bothers them most. Ask about location, sensation, or appearance.

{format_instructions}""",

        "symptoms_detail": f"""Ask about specific symptoms the user is experiencing based on:
User summary: {user_summary}
Previous answers: {history_text}

Focus on visible signs, sensations, or changes they've noticed. Ask about one specific symptom at a time.

{format_instructions}""",

        "duration_progression": f"""Ask about when the problem started and how it has changed over time based on:
User summary: {user_summary}
Previous answers: {history_text}

Ask specifically about timeline, frequency, or progression patterns.

{format_instructions}""",

        # [Other categories follow the same pattern...]
    }
    
    # For brevity, I've shown a few categories - all should follow the same pattern:
    # 1. Context about what to ask
    # 2. The strict format_instructions
    
    prompt = category_prompts.get(category, category_prompts["chief_complaint"])
    responses = [get_gemini_response(prompt), get_groq_response(prompt), get_openrouter_response(prompt)]
    
    # Additional validation step
    valid_responses = []
    for response in responses:
        # Basic check if response follows required format
        if response.startswith("Question:") and "Options:" in response:
            valid_responses.append(response)
    
    if valid_responses:
        return vote_best_response(valid_responses)
    else:
        # Fallback question if all responses fail format check
        return """Question: How would you describe the severity of your symptoms?
Options:
1. Mild
2. Moderate
3. Severe"""

def generate_comprehensive_medical_report(user_summary, chat_history):
    """Generate complete medical report data"""
    history_text = "\n".join([f"Q: {x['question']}\nA: {x['answer']}" for x in chat_history])
    
    prompt = f"""You are an expert medical AI assistant. Based on the user's initial summary and detailed Q&A, generate a comprehensive medical report in JSON format.

User's initial summary: {user_summary}

Detailed Q&A session:
{history_text}

Generate a JSON response with the following structure (fill all fields based on available information, use reasonable medical defaults where information is missing):

{{
  "patient": {{
    "id": "PAT-{random.randint(100000, 999999)}",
    "name": "Patient Name",
    "age": <estimated age based on context>,
    "gender": "<Male/Female/Unknown>",
    "location": "City, State",
    "dateOfReport": "{datetime.now().strftime('%A, %B %d, %Y at %I:%M %p IST')}",
    "submittedBy": "AI Dermatology Assistant",
    "contactNumber": "+91 98765 43210",
    "emergencyContact": "+91 98765 43211",
    "occupation": "<inferred from context or 'Not specified'>",
    "maritalStatus": "<inferred or 'Not specified'>",
    "bloodGroup": "Unknown",
    "height": "Not specified",
    "weight": "Not specified",
    "bmi": "Not calculated",
    "allergies": [<list based on answers or ["None reported"]>],
    "currentMedications": [<list based on answers or ["None reported"]>],
    "familyHistory": [<list based on answers or ["No relevant family history reported"]>],
    "lifestyleFactors": {{
      "smoking": <true/false based on context>,
      "alcohol": "<frequency or 'Not specified'>",
      "diet": "<type or 'Not specified'>",
      "exercise": "<frequency or 'Not specified'>",
      "sleepPattern": "<pattern or 'Not specified'>",
      "stressLevel": "<level or 'Not specified'>",
      "occupationHazards": [<list based on occupation/answers>]
    }}
  }},
  "consultation": {{
    "chiefComplaint": "<main complaint from summary and answers>",
    "duration": "<duration from answers>",
    "onset": "<sudden/gradual from context>",
    "progression": "<improving/worsening/stable>",
    "severity": "<mild/moderate/severe>",
    "impactOnDailyLife": "<description based on answers>",
    "symptoms": [<list of symptoms mentioned>],
    "aggravatingFactors": [<list from answers>],
    "relievingFactors": [<list from answers>],
    "previousTreatments": [<list from answers>],
    "medicalHistory": [<relevant history from answers>],
    "systemicSymptoms": {{
      "fever": <true/false>,
      "fatigue": <true/false>,
      "weightLoss": <true/false>,
      "appetite": "<normal/decreased/increased>",
      "sleep": "<quality from answers>"
    }},
    "psychologicalImpact": {{
      "anxiety": <true/false based on context>,
      "depression": <true/false based on context>,
      "socialIsolation": <true/false based on context>,
      "workImpact": "<none/mild/moderate/severe>"
    }}
  }},
  "physicalFindings": {{
    "affectedAreas": [
      {{
        "id": 1,
        "bodyPart": "<map to body part from: forehead, leftCheek, rightCheek, nose, chin, leftEar, rightEar, leftEye, rightEye, leftTemple, rightTemple, neck, leftShoulder, rightShoulder, leftUpperArm, rightUpperArm, leftElbow, rightElbow, leftForearm, rightForearm, leftWrist, rightWrist, leftHand, rightHand, chest, leftRib, rightRib, abdomen, back, leftHip, rightHip, leftThigh, rightThigh, leftKnee, rightKnee, leftShin, rightShin, leftCalf, rightCalf, leftAnkle, rightAnkle, leftFoot, rightFoot>",
        "name": "<descriptive name of affected area>",
        "description": "<detailed description based on answers>",
        "severity": "<Mild/Moderate/Severe>",
        "symptoms": [<list of symptoms for this area>],
        "images": [],
        "distribution": "<Localized/Scattered/Linear/Symmetric>",
        "symmetry": "<Symmetric/Asymmetric>",
        "borders": "<Well-defined/Ill-defined>",
        "texture": "<description>",
        "tenderness": "<None/Mild/Moderate/Severe>",
        "temperature": "<Normal/Warm/Cool>"
      }}
    ],
    "otherFindings": "<additional observations>",
    "vitalSigns": {{
      "temperature": "98.6°F",
      "pulse": "72/min",
      "bloodPressure": "120/80 mmHg",
      "respiratoryRate": "16/min"
    }},
    "generalExamination": {{
      "consciousness": "Alert and oriented",
      "hydration": "Well hydrated",
      "nutrition": "Adequate",
      "lymphNodes": "Not palpable",
      "joints": "No swelling or tenderness"
    }}
  }},
  "assessment": {{
    "likelyDiagnosis": "<most likely diagnosis based on all information>",
    "confidence": "<High/Medium/Low>",
    "differentialDiagnoses": [<list of 2-3 possible alternatives>],
    "riskFactors": [<list based on answers>],
    "complications": [<potential complications>],
    "urgency": "<Non-urgent/Semi-urgent/Urgent>",
    "referralNeeded": <true/false>
  }},
  "recommendations": [
    {{
      "type": "avoidance",
      "text": "<specific avoidance recommendation>",
      "priority": "Critical"
    }},
    {{
      "type": "treatment",
      "text": "<treatment recommendation>",
      "priority": "High"
    }},
    {{
      "type": "symptom",
      "text": "<symptom management>",
      "priority": "High"
    }},
    {{
      "type": "followup",
      "text": "<follow-up recommendation>",
      "priority": "Medium"
    }}
  ],
  "diagnosticTests": {{
    "recommended": [<list of recommended tests>],
    "notRequired": [<list of tests not needed>]
  }},
  "treatmentPlan": {{
    "immediate": [<immediate treatment steps>],
    "longTerm": [<long-term management>],
    "lifestyle": [<lifestyle modifications>]
  }},
  "followUp": {{
    "nextVisit": "<timeframe>",
    "emergencyCriteria": [<when to seek immediate care>],
    "monitoring": [<what to monitor>]
  }}
}}

Important: 
1. For bodyPart in affectedAreas, ONLY use the exact values from the list provided above
2. Generate at least 1-3 affected areas based on the user's complaints
3. Make all recommendations specific and actionable
4. Ensure the diagnosis and recommendations are medically sound
5. Fill in realistic values even if some information wasn't directly provided"""

    responses = [get_gemini_response(prompt), get_groq_response(prompt), get_openrouter_response(prompt)]
    return responses

def parse_medical_json(response_text):
    """Parse and validate the medical report JSON"""
    try:
        # Try to extract JSON from the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            return {"error": "No valid JSON found in response", "raw": response_text}
    except json.JSONDecodeError as e:
        return {"error": f"JSON parsing error: {str(e)}", "raw": response_text}

# --- API Routes ---

@app.route('/start', methods=['POST'])
def start_session():
    data = request.json
    summary = data.get('summary', '')
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "summary": summary, 
        "chat_history": [], 
        "questions_asked": 0,
        "asked_categories": [],
        "confidence": 0,
        "missing_info": []
    }
    return jsonify({"session_id": session_id, "message": "Session started."})

@app.route('/question', methods=['GET'])
def get_question():
    session_id = request.args.get("session_id")
    session = sessions.get(session_id)
    if not session:
        return jsonify({"error": "Invalid session ID"}), 400
    
    # First assess our current confidence level
    assessment = assess_confidence_and_completeness(session)
    
    # Check if we have enough information
    if assessment.get("sufficient_for_diagnosis", False) or session["confidence"] >= 0.8:
        return jsonify({"message": "Sufficient information gathered. Fetch diagnosis instead."})

    # Get next question category
    category = get_next_question_category(session)
    if not category:
        return jsonify({"message": "All question categories completed. Fetch diagnosis."})

    question = ask_detailed_question(session["summary"], session["chat_history"], category, session)
    session["last_question"] = question
    session["last_category"] = category
    session["questions_asked"] += 1
    
    return jsonify({
        "question": question,
        "category": category,
        "progress": {
            "current": session["questions_asked"],
            "confidence": session["confidence"],
            "completed_categories": session["asked_categories"],
            "missing_info": session.get("missing_info", [])
        }
    })

@app.route('/answer', methods=['POST'])
def submit_answer():
    data = request.json
    session_id = data.get("session_id")
    answer = data.get("answer")

    session = sessions.get(session_id)
    if not session or "last_question" not in session:
        return jsonify({"error": "Invalid session or missing question"}), 400

    # Extract question text
    question_text = session["last_question"].split("Question:")[1].split("Options:")[0].strip() if "Question:" in session["last_question"] else session["last_question"]
    
    session["chat_history"].append({"question": question_text, "answer": answer})
    
    # Mark category as completed if this was a category-based question
    if "last_category" in session:
        category = session["last_category"]
        if category not in session["asked_categories"]:
            session["asked_categories"].append(category)
        del session["last_category"]
    
    del session["last_question"]

    # Update confidence after new answer
    assess_confidence_and_completeness(session)

    return jsonify({
        "message": "Answer recorded.",
        "progress": {
            "current": len(session["chat_history"]),
            "confidence": session["confidence"],
            "completed_categories": session["asked_categories"],
            "missing_info": session.get("missing_info", [])
        }
    })

@app.route('/diagnosis', methods=['GET'])
def get_diagnosis():
    session_id = request.args.get("session_id")
    session = sessions.get(session_id)
    if not session:
        return jsonify({"error": "Invalid session ID"}), 400

    # Generate comprehensive medical report
    results = generate_comprehensive_medical_report(session["summary"], session["chat_history"])
    parsed_results = []

    for result in results:
        parsed = parse_medical_json(result)
        parsed_results.append(parsed)

    # Find the best valid result
    valid_results = [r for r in parsed_results if "error" not in r]
    
    if valid_results:
        final_report = valid_results[0]  # Use the first valid result
        
        # Add session summary to the report
        complete_report = {
            "success": True,
            "report": final_report,
            "session_summary": {
                "session_id": session_id,
                "total_questions": len(session["chat_history"]),
                "categories_covered": session["asked_categories"],
                "final_confidence": session["confidence"],
                "generated_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }
        
        # Save JSON file to specified directory
        try:
            # Define the target directory and filename
            target_directory = r"C:\Users\omgos\OneDrive\Desktop\Om\HaskBois\test\public"
            filename = "report.json"
            file_path = os.path.join(target_directory, filename)
            
            # Create directory if it doesn't exist
            os.makedirs(target_directory, exist_ok=True)
            
            # Save the file
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(complete_report, f, indent=2, ensure_ascii=False)
            
            print(f"Medical report saved to: {file_path}")
            
        except Exception as e:
            print(f"Error saving JSON file: {e}")
            # Continue execution even if file save fails
        
        return jsonify(complete_report)
    else:
        return jsonify({
            "success": False,
            "error": "Failed to generate valid medical report",
            "raw_results": parsed_results
        })

@app.route('/session/<session_id>', methods=['GET'])
def get_session_info(session_id):
    session = sessions.get(session_id)
    if not session:
        return jsonify({"error": "Invalid session ID"}), 400
    
    return jsonify({
        "summary": session["summary"],
        "questions_asked": session["questions_asked"],
        "confidence": session["confidence"],
        "completed_categories": session["asked_categories"],
        "chat_history": session["chat_history"],
        "missing_info": session.get("missing_info", [])
    })

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)