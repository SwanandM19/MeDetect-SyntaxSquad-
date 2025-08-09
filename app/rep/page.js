"use client"
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  User, Calendar, MapPin, Clock, AlertCircle,
  FileText, Download, Activity, Thermometer,
  Heart, Shield, CheckCircle, XCircle, Stethoscope,
  Pill, Camera, Navigation, Brain, MessageCircle,
  Send, Loader, ChevronRight
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Update this to your Flask app URL

const MedicalReportApp = () => {
  const [currentView, setCurrentView] = useState('questionnaire'); // 'questionnaire' or 'report'
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Questionnaire state
  const [initialSummary, setInitialSummary] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 10 });
  
  // Report state
  const [reportData, setReportData] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const reportRef = useRef();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced body part mapping for GLB model (adjusted positions for human model)
  const bodyPartMap = {
    // Head and Face - adjusted to match the actual head position and size
    'forehead': { position: [0, 1.82, 0.08], color: 0xff0000, size: 0.04 },
    'leftCheek': { position: [-0.06, 1.72, 0.06], color: 0x00ff00, size: 0.035 },
    'rightCheek': { position: [0.06, 1.72, 0.06], color: 0xff0000, size: 0.035 },
    'nose': { position: [0, 1.72, 0.1], color: 0x00ff00, size: 0.025 },
    'chin': { position: [0, 1.62, 0.08], color: 0xff0000, size: 0.03 },
    
    // Ears - positioned on sides of head
    'leftEar': { position: [-0.08, 1.75, 0.02], color: 0x00ff00, size: 0.025 },
    'rightEar': { position: [0.08, 1.75, 0.02], color: 0xff0000, size: 0.025 },
    
    // Eyes and temples
    'leftEye': { position: [-0.03, 1.75, 0.09], color: 0x00ff00, size: 0.02 },
    'rightEye': { position: [0.03, 1.75, 0.09], color: 0xff0000, size: 0.02 },
    'leftTemple': { position: [-0.07, 1.77, 0.05], color: 0x00ff00, size: 0.03 },
    'rightTemple': { position: [0.07, 1.77, 0.05], color: 0xff0000, size: 0.03 },
    
    // Neck - positioned between head and torso
    'neck': { position: [0, 1.5, 0.05], color: 0xff0000, size: 0.035 },
    
    // Shoulders - at the connection points of arms to torso
    'leftShoulder': { position: [-0.2, 1.4, 0.02], color: 0x00ff00, size: 0.04 },
    'rightShoulder': { position: [0.2, 1.4, 0.02], color: 0xff0000, size: 0.04 },
    
    // Arms - positioned along the extended arms
    'leftUpperArm': { position: [-0.5, 1.4, 0], color: 0x00ff00, size: 0.035 },
    'rightUpperArm': { position: [0.5, 1.4, 0], color: 0xff0000, size: 0.035 },
    'leftElbow': { position: [-0.75, 1.4, 0], color: 0x00ff00, size: 0.03 },
    'rightElbow': { position: [0.75, 1.4, 0], color: 0xff0000, size: 0.03 },
    'leftForearm': { position: [-0.5, 1.4, 0], color: 0x00ff00, size: 0.03 },
    'rightForearm': { position: [0.5, 1.4, 0], color: 0xff0000, size: 0.03 },
    'leftWrist': { position: [-0.70, 1.4, 0], color: 0x00ff00, size: 0.025 },
    'rightWrist': { position: [0.7, 1.4, 0], color: 0xff0000, size: 0.025 },
    'leftHand': { position: [-0.5, 1.4, 0], color: 0x00ff00, size: 0.03 },
    'rightHand': { position: [0.5, 1.4, 0], color: 0xff0000, size: 0.03 },
    
    // Torso - centered on the body
    'chest': { position: [0, 1.25, 0.08], color: 0xff0000, size: 0.05 },
    'leftRib': { position: [-0.08, 1.2, 0.06], color: 0x00ff00, size: 0.035 },
    'rightRib': { position: [0.08, 1.2, 0.06], color: 0xff0000, size: 0.035 },
    'abdomen': { position: [0, 1.05, 0.08], color: 0x00ff00, size: 0.04 },
    'back': { position: [0, 1.15, -0.08], color: 0xff0000, size: 0.05 },
    
    // Hips and pelvis area
    'leftHip': { position: [-0.08, 0.9, 0.05], color: 0x00ff00, size: 0.035 },
    'rightHip': { position: [0.08, 0.9, 0.05], color: 0xff0000, size: 0.035 },
    
    // Thighs - upper leg area
    'leftThigh': { position: [-0.06, 0.7, 0.04], color: 0x00ff00, size: 0.04 },
    'rightThigh': { position: [0.06, 0.7, 0.04], color: 0xff0000, size: 0.04 },
    
    // Knees - at the joint between thigh and shin
    'leftKnee': { position: [-0.06, 0.45, 0.06], color: 0x00ff00, size: 0.035 },
    'rightKnee': { position: [0.06, 0.45, 0.06], color: 0xff0000, size: 0.035 },
    
    // Lower legs
    'leftShin': { position: [-0.06, 0.2, 0.04], color: 0x00ff00, size: 0.03 },
    'rightShin': { position: [0.06, 0.2, 0.04], color: 0xff0000, size: 0.03 },
    'leftCalf': { position: [-0.06, 0.2, -0.04], color: 0x00ff00, size: 0.03 },
    'rightCalf': { position: [0.06, 0.2, -0.04], color: 0xff0000, size: 0.03 },
    
    // Ankles and feet
    'leftAnkle': { position: [-0.06, 0.1, 0.02], color: 0x00ff00, size: 0.025 },
    'rightAnkle': { position: [0.06, 0.1, 0.02], color: 0xff0000, size: 0.025 },
    'leftFoot': { position: [-0.06, 0.05, 0.08], color: 0x00ff00, size: 0.035 },
    'rightFoot': { position: [0.06, 0.05, 0.08], color: 0xff0000, size: 0.035 }
  };

  // API Functions
  const startSession = async (summary) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary })
      });
      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        await getNextQuestion(data.session_id);
      } else {
        throw new Error(data.error || 'Failed to start session');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextQuestion = async (id = sessionId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/question?session_id=${id}`);
      const data = await response.json();
      if (data.question) {
        setCurrentQuestion(data.question);
        if (data.progress) {
          setProgress(data.progress);
        }
      } else {
        // No more questions, get diagnosis
        await getDiagnosis();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, answer })
      });
      const data = await response.json();
      
      // Add to chat history
      const questionText = currentQuestion.split('Question:')[1]?.split('Options:')[0]?.trim() || currentQuestion;
      setChatHistory(prev => [...prev, { question: questionText, answer }]);
      
      // Get next question
      await getNextQuestion();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiagnosis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/diagnosis?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.report) {
        setReportData(data.report);
        setCurrentView('report');
      } else {
        throw new Error(data.error || 'Failed to generate diagnosis');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // GLB Human Model Component
  const HumanModel = ({ affectedAreas }) => {
    const group = useRef();
    const { scene } = useGLTF('/X Bot.glb');
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    
    // Configure the model material
    useEffect(() => {
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            // Set default skin color and material properties
            child.material = new THREE.MeshLambertMaterial({
              color: 0xd4b5a0, // Skin color
              transparent: false,
              opacity: 1.0
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [clonedScene]);
    
    // Highlight spheres for affected areas
    const highlightSpheres = useMemo(() => {
      if (!affectedAreas || affectedAreas.length === 0) return [];
      
      return affectedAreas.map(area => {
        const bodyPartInfo = bodyPartMap[area.bodyPart];
        if (!bodyPartInfo) return null;

        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(bodyPartInfo.size, 16, 16),
          new THREE.MeshBasicMaterial({
            color: area.severity === 'Severe' ? 0xff0000 : 
                   area.severity === 'Moderate' ? 0xff8800 : 0xffff00,
            transparent: true,
            opacity: 0.9
          })
        );
        
        sphere.position.set(...bodyPartInfo.position);
        sphere.userData.areaInfo = area;
        return sphere;
      }).filter(Boolean);
    }, [affectedAreas]);

    return (
      <group ref={group}>
        {/* GLB Human Model */}
        <primitive 
          object={clonedScene} 
          scale={[1, 1, 1]} 
          position={[0, -0.5, 0]}
          rotation={[0, 0, 0]}
        />
        
        {/* Highlight spheres */}
        {highlightSpheres.map((sphere, i) => (
          <primitive
            key={i}
            object={sphere}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedArea(sphere.userData.areaInfo);
            }}
          />
        ))}

        {/* Area labels */}
        {affectedAreas && affectedAreas.map((area, i) => {
          const bodyPartInfo = bodyPartMap[area.bodyPart];
          if (!bodyPartInfo) return null;
          
          return (
            <Html
              key={`label-${i}`}
              position={[
                bodyPartInfo.position[0],
                bodyPartInfo.position[1] + 0.08,
                bodyPartInfo.position[2]
              ]}
              center
            >
              <div className={`px-3 py-1 rounded-md text-xs font-semibold pointer-events-none shadow-lg text-white ${
                area.severity === 'Severe' ? 'bg-red-600' :
                area.severity === 'Moderate' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}>
                {area.severity}
              </div>
            </Html>
          );
        })}
      </group>
    );
  };

  // Loading fallback for the 3D model
  const ModelLoadingFallback = () => (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg">
        <Loader className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </Html>
  );

  const downloadPDF = async () => {
    try {
      const element = reportRef.current;
      if (!element) return;

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Medical_Report_${reportData?.patient?.name?.replace(/\s+/g, '_') || 'Patient'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Critical": return "border-l-red-500 bg-red-50";
      case "High": return "border-l-orange-500 bg-orange-50";
      case "Medium": return "border-l-yellow-500 bg-yellow-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medical report...</p>
        </div>
      </div>
    );
  }

  // Questionnaire View
  if (currentView === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Medical Consultation</h1>
                  <p className="text-blue-100 text-lg">AI-Assisted Health Assessment</p>
                </div>
              </div>
              {sessionId && (
                <div className="mt-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm">{progress.current}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!sessionId ? (
              // Initial Summary Input
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Describe Your Health Concern</h2>
                  <p className="text-gray-600 mb-4">
                    Please describe your symptoms, concerns, or health issues in detail. 
                    Be as specific as possible about what you're experiencing.
                  </p>
                  
                  <textarea
                    value={initialSummary}
                    onChange={(e) => setInitialSummary(e.target.value)}
                    placeholder="Example: I have been experiencing red, itchy patches on my hands for the past week. The redness started on my left hand and now has spread to both hands..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={() => startSession(initialSummary)}
                  disabled={!initialSummary.trim() || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Starting Consultation...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Start Medical Consultation</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // Q&A Interface
              <div className="space-y-6">
                {/* Chat History */}
                {chatHistory.length > 0 && (
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-800">Previous Questions:</h3>
                    {chatHistory.map((chat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-800 mb-2">Q: {chat.question}</p>
                        <p className="text-blue-600">A: {chat.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current Question */}
                {currentQuestion && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Current Question:</h3>
                    
                    {currentQuestion.includes('Options:') ? (
                      // Multiple choice question
                      <div className="space-y-4">
                        <p className="text-gray-800 font-medium">
                          {currentQuestion.split('Options:')[0].replace('Question:', '').trim()}
                        </p>
                        
                        <div className="space-y-2">
                          {currentQuestion.split('Options:')[1]
                            .split('\n')
                            .filter(line => line.trim())
                            .map((option, i) => {
                              const cleanOption = option.replace(/^\d+\.\s*/, '').trim();
                              if (!cleanOption) return null;
                              
                              return (
                                <button
                                  key={i}
                                  onClick={() => submitAnswer(cleanOption)}
                                  disabled={isLoading}
                                  className="w-full text-left p-3 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                  <span className="font-medium text-blue-800">{i + 1}.</span> {cleanOption}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      // Free text question
                      <div className="space-y-4">
                        <p className="text-gray-800 font-medium">{currentQuestion}</p>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value.trim()) {
                                submitAnswer(e.target.value.trim());
                                e.target.value = '';
                              }
                            }}
                            disabled={isLoading}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              if (input.value.trim()) {
                                submitAnswer(input.value.trim());
                                input.value = '';
                              }
                            }}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoading && (
                      <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Processing your answer...</span>
                      </div>
                    )}
                  </div>
                )}

                {!currentQuestion && !isLoading && chatHistory.length > 0 && (
                  <div className="text-center">
                    <div className="bg-green-50 rounded-lg p-6">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Consultation Complete!
                      </h3>
                      <p className="text-green-700 mb-4">
                        Generating your comprehensive medical report...
                      </p>
                      <button
                        onClick={getDiagnosis}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Generate Medical Report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Report View
  if (currentView === 'report' && reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div ref={reportRef} className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Medical Report</h1>
                    <p className="text-blue-100 text-lg">AI-Generated Health Assessment</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setCurrentView('questionnaire')}
                    className="bg-white/20 hover:bg-white/30 transition-colors duration-200 px-6 py-3 rounded-xl flex items-center space-x-2 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                    <span className="font-semibold">Back to Questions</span>
                  </button>
                  <button 
                    onClick={downloadPDF}
                    className="bg-white/20 hover:bg-white/30 transition-colors duration-200 px-6 py-3 rounded-xl flex items-center space-x-2 backdrop-blur-sm"
                  >
                    <Download className="h-5 w-5" />
                    <span className="font-semibold">Download Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Overview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Patient Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.contactNumber}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.dateOfReport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.occupation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Group:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height/Weight:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.height}, {reportData.patient.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BMI:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.bmi}</span>
                    </div>
                  </div>
                </div>

                {/* Allergies and Medications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {reportData.patient.allergies.map((allergy, i) => (
                        <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">Current Medications</h3>
                    <div className="flex flex-wrap gap-2">
                      {reportData.patient.currentMedications.map((med, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lifestyle Factors */}
                <div className="bg-orange-50 p-4 rounded-lg mt-6">
                  <h3 className="font-semibold text-orange-800 mb-3">Lifestyle Factors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Smoking:</span>
                      <span className={`font-semibold ${reportData.patient.lifestyleFactors.smoking ? 'text-red-600' : 'text-green-600'}`}>
                        {reportData.patient.lifestyleFactors.smoking ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alcohol:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.lifestyleFactors.alcohol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diet:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.lifestyleFactors.diet}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exercise:</span>
                      <span className="font-semibold text-gray-800">{reportData.patient.lifestyleFactors.exercise}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Model */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Navigation className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Interactive Body Map</h2>
                </div>
                
                <div className="h-[500px] relative border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Canvas 
                    camera={{ position: [0, 1.2, 2.5], fov: 45 }}
                    style={{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)' }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 5, 5]} intensity={0.8} />
                    <pointLight position={[-5, 5, 5]} intensity={0.3} />
                    <Suspense fallback={<ModelLoadingFallback />}>
                      <HumanModel affectedAreas={reportData.physicalFindings.affectedAreas} />
                    </Suspense>
                    <OrbitControls 
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={1.5}
                      maxDistance={5}
                      target={[0, 0.5, 0]}
                    />
                  </Canvas>
                  
                  {/* Selected area details */}
                  {selectedArea && (
                    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-xl max-w-sm border-l-4 border-red-500 z-10">
                      <h3 className="font-bold text-lg text-red-800">{selectedArea.name}</h3>
                      <p className="text-sm mt-2 text-gray-700">{selectedArea.description}</p>
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {selectedArea.symptoms.map((symptom, i) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedArea.severity === 'Severe' ? 'bg-red-200 text-red-800' :
                          selectedArea.severity === 'Moderate' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {selectedArea.severity}
                        </span>
                        <button 
                          onClick={() => setSelectedArea(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
                    <h4 className="font-semibold text-sm mb-2 text-black">Severity Legend</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className="text-black">Severe</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-black">Moderate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-black">Mild</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
                    <h4 className="font-semibold text-sm mb-1 text-black">3D Model</h4>
                    <p className="text-xs text-gray-600">Mixamo Human</p>
                    <p className="text-xs text-gray-500">Click spheres for details</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Consultation Details</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Chief Complaint */}
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-red-800 mb-3">Chief Complaint</h3>
                    <p className="text-gray-800 text-lg mb-2">"{reportData.consultation.chiefComplaint}"</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-800 ml-2">{reportData.consultation.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Onset:</span>
                        <span className="font-semibold text-gray-800 ml-2">{reportData.consultation.onset}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Progression:</span>
                        <span className="font-semibold text-gray-800 ml-2">{reportData.consultation.progression}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Severity:</span>
                        <span className="font-semibold text-gray-800 ml-2">{reportData.consultation.severity}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Symptoms and Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-3">Symptoms</h3>
                      <div className="flex flex-wrap gap-2">
                        {reportData.consultation.symptoms.map((symptom, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-800 mb-3">Aggravating Factors</h3>
                      <div className="space-y-1">
                        {reportData.consultation.aggravatingFactors.map((factor, i) => (
                          <div key={i} className="text-sm text-gray-700">• {factor}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-3">Relieving Factors</h3>
                      <div className="space-y-1">
                        {reportData.consultation.relievingFactors.map((factor, i) => (
                          <div key={i} className="text-sm text-gray-700">• {factor}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-3">Previous Treatments</h3>
                      <div className="space-y-1">
                        {reportData.consultation.previousTreatments.map((treatment, i) => (
                          <div key={i} className="text-sm text-gray-700">• {treatment}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Systemic Symptoms */}
                  {reportData.consultation.systemicSymptoms && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-indigo-800 mb-3">Systemic Symptoms</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fever:</span>
                          <span className={`font-semibold ${reportData.consultation.systemicSymptoms.fever ? 'text-red-600' : 'text-green-600'}`}>
                            {reportData.consultation.systemicSymptoms.fever ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fatigue:</span>
                          <span className={`font-semibold ${reportData.consultation.systemicSymptoms.fatigue ? 'text-red-600' : 'text-green-600'}`}>
                            {reportData.consultation.systemicSymptoms.fatigue ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight Loss:</span>
                          <span className={`font-semibold ${reportData.consultation.systemicSymptoms.weightLoss ? 'text-red-600' : 'text-green-600'}`}>
                            {reportData.consultation.systemicSymptoms.weightLoss ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Appetite:</span>
                          <span className="font-semibold text-gray-800">{reportData.consultation.systemicSymptoms.appetite}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Clinical Assessment</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Primary Diagnosis */}
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="font-semibold text-purple-800 mb-3">Primary Diagnosis</h3>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <p className="text-lg font-medium text-gray-800">
                        {reportData.assessment.likelyDiagnosis}
                      </p>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        {reportData.assessment.confidence} confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Urgency:</span>
                        <span className={`font-semibold ml-2 ${
                          reportData.assessment.urgency === 'Urgent' ? 'text-red-600' :
                          reportData.assessment.urgency === 'Semi-urgent' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {reportData.assessment.urgency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Referral Needed:</span>
                        <span className={`font-semibold ml-2 ${reportData.assessment.referralNeeded ? 'text-red-600' : 'text-green-600'}`}>
                          {reportData.assessment.referralNeeded ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Differential Diagnoses */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Differential Diagnoses</h3>
                    <div className="space-y-2">
                      {reportData.assessment.differentialDiagnoses.map((diagnosis, i) => (
                        <div key={i} className="flex items-center p-2 bg-white rounded border">
                          <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                          <span className="text-sm text-black">{diagnosis}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Risk Factors */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">Risk Factors</h3>
                    <div className="space-y-1">
                      {reportData.assessment.riskFactors.map((factor, i) => (
                        <div key={i} className="text-sm text-gray-700">• {factor}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Affected Areas */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Camera className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-800">Affected Areas</h2>
                </div>
                
                <div className="space-y-4">
                  {reportData.physicalFindings.affectedAreas.map((area, i) => (
                    <div 
                      key={i} 
                      className={`border-l-4 p-4 rounded-r-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        area.severity === 'Severe' ? 'border-red-600 bg-red-50' :
                        area.severity === 'Moderate' ? 'border-orange-500 bg-orange-50' :
                        'border-yellow-500 bg-yellow-50'
                      }`}
                      onClick={() => setSelectedArea(area)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`font-semibold ${
                          area.severity === 'Severe' ? 'text-red-800' :
                          area.severity === 'Moderate' ? 'text-orange-800' :
                          'text-yellow-800'
                        }`}>
                          {area.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          area.severity === 'Severe' ? 'bg-red-200 text-red-800' :
                          area.severity === 'Moderate' ? 'bg-orange-200 text-orange-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {area.severity}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{area.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {area.symptoms.map((symptom, j) => (
                          <span key={j} className={`px-2 py-1 text-xs rounded-full ${
                            area.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                            area.severity === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment Plan */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Pill className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Treatment Plan</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Immediate Treatment */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Immediate Treatment</h3>
                    <div className="space-y-1">
                      {reportData.treatmentPlan.immediate.map((treatment, i) => (
                        <div key={i} className="text-sm text-gray-700">• {treatment}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Long-term Management */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Long-term Management</h3>
                    <div className="space-y-1">
                      {reportData.treatmentPlan.longTerm.map((management, i) => (
                        <div key={i} className="text-sm text-gray-700">• {management}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Lifestyle Modifications */}
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-orange-800 mb-2">Lifestyle Modifications</h3>
                    <div className="space-y-1">
                      {reportData.treatmentPlan.lifestyle.map((modification, i) => (
                        <div key={i} className="text-sm text-gray-700">• {modification}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="space-y-3">
                    {reportData.recommendations.map((rec, i) => (
                      <div key={i} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                            rec.type === 'avoidance' ? 'bg-red-100 text-red-600' :
                            rec.type === 'treatment' ? 'bg-blue-100 text-blue-600' :
                            rec.type === 'symptom' ? 'bg-green-100 text-green-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {rec.type}
                          </span>
                          <span className={`text-xs font-semibold ${
                            rec.priority === 'Critical' ? 'text-red-600' :
                            rec.priority === 'High' ? 'text-orange-600' :
                            'text-yellow-600'
                          }`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{rec.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Follow-up Plan</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start p-3 bg-green-50 rounded-lg">
                    <Clock className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Next Visit</p>
                      <p className="text-sm text-gray-700">{reportData.followUp.nextVisit}</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Emergency Criteria</h3>
                    <div className="space-y-1">
                      {reportData.followUp.emergencyCriteria.map((criteria, i) => (
                        <div key={i} className="flex items-start">
                          <AlertCircle className="h-3 w-3 text-red-600 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{criteria}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Monitoring</h3>
                    <div className="space-y-1">
                      {reportData.followUp.monitoring.map((item, i) => (
                        <div key={i} className="flex items-start">
                          <Activity className="h-3 w-3 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Tests */}
              {reportData.diagnosticTests && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-800">Diagnostic Tests</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Recommended</h3>
                      <div className="space-y-1">
                        {reportData.diagnosticTests.recommended.map((test, i) => (
                          <div key={i} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{test}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Not Required</h3>
                      <div className="space-y-1">
                        {reportData.diagnosticTests.notRequired.map((test, i) => (
                          <div key={i} className="flex items-start">
                            <XCircle className="h-3 w-3 text-gray-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{test}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <p className="text-gray-600 text-sm font-medium">
                This report is generated based on patient-reported symptoms and AI analysis.
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              Always consult with a qualified healthcare provider for definitive diagnosis and treatment.
            </p>
            <div className="mt-3 text-xs text-gray-400">
              Report generated on {reportData.patient.dateOfReport} | Patient ID: {reportData.patient.id}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  );
};

export default MedicalReportApp;