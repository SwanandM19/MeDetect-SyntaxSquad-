from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@app.route("/process", methods=["POST"])
def process():
    data = request.get_json()
    user_input = data.get("message", "")
    language = data.get("language", "en")

    prompt = f"You are a helpful AI assistant. Respond in the same language as the user.\nUser ({language}): {user_input}\nAssistant:"

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-8b-8192"
    )

    return jsonify({"response": response.choices[0].message.content.strip()})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
