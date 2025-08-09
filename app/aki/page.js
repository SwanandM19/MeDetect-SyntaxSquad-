"use client"
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MedicalDiagnosis() {
  const [sessionId, setSessionId] = useState('');
  const [summary, setSummary] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [step, setStep] = useState('summary');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneInstance = useRef(null);
  const animationFrameRef = useRef(null);

  const API_BASE = 'http://localhost:5000';

  // 3D Scene Setup
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    sceneRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Floating DNA Helix
    const helixGroup = new THREE.Group();
    const helixGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10, 8);
    const helixMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00d4ff, 
      transparent: true, 
      opacity: 0.8,
      emissive: 0x001122
    });
    
    for (let i = 0; i < 60; i++) {
      const helix = new THREE.Mesh(helixGeometry, helixMaterial);
      const angle = (i / 60) * Math.PI * 4;
      const height = (i / 60) * 20 - 10;
      helix.position.x = Math.cos(angle) * 3;
      helix.position.z = Math.sin(angle) * 3;
      helix.position.y = height;
      helix.rotation.z = angle;
      helixGroup.add(helix);
    }
    
    scene.add(helixGroup);
    
    // Floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 15;
    
    sceneInstance.current = { scene, camera, renderer, helixGroup, particlesMesh };
    rendererRef.current = renderer;
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (helixGroup) {
        helixGroup.rotation.y += 0.01;
        helixGroup.rotation.x += 0.005;
      }
      
      if (particlesMesh) {
        particlesMesh.rotation.y += 0.002;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sceneRef.current && renderer.domElement) {
        sceneRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Simulate loading progress for dramatic effect
  useEffect(() => {
    if (loadingQuestion) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [loadingQuestion]);

  const startSession = async () => {
    if (!summary.trim()) {
      alert('Please enter a summary of your symptoms');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary }),
      });

      const data = await response.json();
      if (response.ok) {
        setSessionId(data.session_id);
        setStep('questions');
        getNextQuestion(data.session_id);
      } else {
        alert('Error starting session: ' + data.error);
      }
    } catch (error) {
      alert('Error connecting to server: ' + error.message);
    }
    setLoading(false);
  };

  const getNextQuestion = async (id = sessionId) => {
    setLoadingQuestion(true);
    
    // Simulate network delay for dramatic loading effect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const response = await fetch(`${API_BASE}/question?session_id=${id}`);
      const data = await response.json();

      if (response.ok) {
        if (data.message && data.message.includes('Question limit reached')) {
          getDiagnosis();
          return;
        }

        let questionText = '';
        let optionsList = [];

        if (data.question.includes('Question:') && data.question.includes('Options:')) {
          questionText = data.question.split('Question:')[1]?.split('Options:')[0]?.trim();
          const optionsText = data.question.split('Options:')[1]?.trim();
          optionsList = optionsText ? optionsText.split('\n').filter(line => line.trim()) : [];
        } else {
          questionText = data.question;
          const lines = data.question.split('\n');
          const questionLines = [];
          const optionLines = [];
          let foundOptions = false;

          for (const line of lines) {
            if (line.match(/^\d+\./)) {
              foundOptions = true;
              optionLines.push(line.trim());
            } else if (!foundOptions) {
              questionLines.push(line.trim());
            }
          }

          if (optionLines.length > 0) {
            questionText = questionLines.join(' ').trim();
            optionsList = optionLines;
          }
        }

        setCurrentQuestion(questionText || data.question);
        setOptions(optionsList);
        setSelectedAnswer('');
      } else {
        alert('Error getting question: ' + data.error);
      }
    } catch (error) {
      alert('Error connecting to server: ' + error.message);
    }
    setLoadingQuestion(false);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) {
      alert('Please select an answer');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer: selectedAnswer,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatHistory(prev => [...prev, {
          question: currentQuestion,
          answer: selectedAnswer
        }]);

        setCurrentQuestion('');
        setOptions([]);
        getNextQuestion();
      } else {
        alert('Error submitting answer: ' + data.error);
      }
    } catch (error) {
      alert('Error connecting to server: ' + error.message);
    }
    setLoading(false);
  };

  const getDiagnosis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/diagnosis?session_id=${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setDiagnosis(data.results);
        setStep('diagnosis');
      } else {
        alert('Error getting diagnosis: ' + data.error);
      }
    } catch (error) {
      alert('Error connecting to server: ' + error.message);
    }
    setLoading(false);
  };

  const resetSession = () => {
    setSessionId('');
    setSummary('');
    setCurrentQuestion('');
    setOptions([]);
    setSelectedAnswer('');
    setChatHistory([]);
    setDiagnosis(null);
    setStep('summary');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* 3D Background Scene */}
      <div 
        ref={sceneRef} 
        className="fixed inset-0 z-0 opacity-30"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Animated Grid Overlay */}
      <div className="fixed inset-0 z-10 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite'
      }} />

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-6 py-8 max-w-4xl">
        {/* Header with Holographic Effect */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl transform rotate-1" />
          <div className="relative bg-black/40 backdrop-blur-lg rounded-3xl border border-cyan-500/30 p-8 shadow-2xl">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 animate-pulse">
              MediCore AI
            </h1>
            <p className="text-cyan-300 text-xl opacity-80">Advanced Neural Diagnostic System</p>
            <div className="mt-4 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-32 mx-auto animate-pulse" />
          </div>
        </div>

        {/* Summary Input Phase */}
        {step === 'summary' && (
          <div className="glass-card animate-slideIn">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mr-3 animate-pulse" />
              Neural Symptom Analysis
            </h2>
            
            <div className="relative group">
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe your symptoms with precise detail for optimal AI analysis..."
                className="w-full h-40 bg-black/60 border-2 border-cyan-500/30 rounded-2xl p-6 text-white placeholder-cyan-300/60 text-lg resize-none transition-all duration-300 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/25 group-hover:border-cyan-400/60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <button
              onClick={startSession}
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">
                {loading ? 'Initializing Neural Network...' : 'Begin AI Diagnosis'}
              </span>
            </button>
          </div>
        )}

        {/* Questions Phase */}
        {step === 'questions' && (
          <div className="space-y-8">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="glass-card animate-slideIn">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 animate-pulse" />
                  Neural Conversation Log
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {chatHistory.map((item, index) => (
                    <div key={index} className="bg-black/40 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                      <div className="text-cyan-300 font-semibold mb-2">Q: {item.question}</div>
                      <div className="text-green-300 opacity-90">A: {item.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Question Animation */}
            {loadingQuestion && (
              <div className="glass-card animate-slideIn">
                <div className="text-center py-12">
                  {/* DNA Helix Loading Animation */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 mx-auto relative">
                      <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-cyan-400 border-r-transparent border-b-blue-400 border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                      <div className="absolute inset-4 border-4 border-t-purple-400 border-r-transparent border-b-pink-400 border-l-transparent rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                      <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-black/60 rounded-full h-4 mb-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4 animate-pulse">
                    Neural Network Processing...
                  </h3>
                  <p className="text-cyan-300 text-lg mb-4">
                    AI is analyzing {loadingProgress.toFixed(0)}% of symptom patterns
                  </p>
                  <div className="text-sm text-blue-300 opacity-70">
                    Correlating medical databases • Pattern recognition • Question generation
                  </div>
                </div>
              </div>
            )}

            {/* Current Question */}
            {!loadingQuestion && currentQuestion && (
              <div className="glass-card animate-slideIn">
                <h3 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3 animate-pulse" />
                  AI Generated Query
                </h3>
                
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 mb-6 border border-cyan-500/30">
                  <p className="text-white text-xl leading-relaxed">{currentQuestion}</p>
                </div>

                {options.length > 0 ? (
                  <div className="space-y-3">
                    {options.map((option, index) => (
                      <label key={index} className="block cursor-pointer group">
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedAnswer === option
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                            : 'border-cyan-500/30 bg-black/40 hover:border-cyan-400/60 hover:bg-cyan-500/10'
                        }`}>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={selectedAnswer === option}
                              onChange={(e) => setSelectedAnswer(e.target.value)}
                              className="w-5 h-5 text-cyan-500 mr-4"
                            />
                            <span className="text-white text-lg">{option}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Provide detailed response for optimal analysis..."
                    className="w-full h-32 bg-black/60 border-2 border-cyan-500/30 rounded-2xl p-4 text-white placeholder-cyan-300/60 text-lg resize-none transition-all duration-300 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/25"
                  />
                )}

                <button
                  onClick={submitAnswer}
                  disabled={loading || !selectedAnswer}
                  className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 text-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">
                    {loading ? 'Processing Neural Response...' : 'Submit to AI Core'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Diagnosis Phase */}
        {step === 'diagnosis' && (
          <div className="space-y-8 animate-slideIn">
            {/* Final Chat History */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 animate-pulse" />
                Complete Diagnostic Session
              </h3>
              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                {chatHistory.map((item, index) => (
                  <div key={index} className="bg-black/40 rounded-xl p-4 border border-cyan-500/20">
                    <div className="text-cyan-300 font-semibold mb-2">Q: {item.question}</div>
                    <div className="text-green-300 opacity-90">A: {item.answer}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis Results */}
            {diagnosis && (
              <div className="glass-card">
                <h3 className="text-3xl font-bold text-cyan-400 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 animate-pulse" />
                  AI Neural Analysis Complete
                </h3>
                
                <div className="space-y-6">
                  {diagnosis.map((result, index) => {
                    let parsedResult = result;
                    
                    if (result.raw && !result.diagnosis) {
                      let jsonText = result.raw.replace(/```json\s*/g, '').replace(/```\s*/g, '');
                      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        try {
                          parsedResult = JSON.parse(jsonMatch[0]);
                        } catch (e) {}
                      }
                      
                      if (!parsedResult.diagnosis && !parsedResult.type) {
                        const diagnosisMatch = jsonText.match(/(?:diagnosis|Diagnosis)["']?\s*:\s*["']?([^",\n}]+)/i);
                        const confidenceMatch = jsonText.match(/(?:confidence|Confidence)["']?\s*:\s*["']?([^",\n}]+)/i);
                        const adviceMatch = jsonText.match(/(?:advice|Advice)["']?\s*:\s*["']?([^",\n}]+)/i);
                        
                        if (diagnosisMatch || confidenceMatch || adviceMatch) {
                          parsedResult = {
                            diagnosis: diagnosisMatch ? diagnosisMatch[1].replace(/["']/g, '').trim() : null,
                            confidence: confidenceMatch ? confidenceMatch[1].replace(/["']/g, '').trim() : null,
                            advice: adviceMatch ? adviceMatch[1].replace(/["']/g, '').trim() : null
                          };
                        }
                      }
                    }

                    return (
                      <div key={index} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-black/60 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-lg">
                          <h4 className="text-xl font-bold text-purple-400 mb-4">
                            Neural Model {index + 1} Analysis
                          </h4>
                          
                          {parsedResult.diagnosis || parsedResult.type ? (
                            <div className="space-y-4">
                              {parsedResult.diagnosis && (
                                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                                  <div className="text-red-300 font-bold text-lg mb-2">🔬 Diagnosis:</div>
                                  <div className="text-white text-lg">{parsedResult.diagnosis}</div>
                                </div>
                              )}
                              
                              {parsedResult.confidence && (
                                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                                  <div className="text-blue-300 font-bold text-lg mb-2">📊 Confidence Level:</div>
                                  <div className="text-white text-lg">{parsedResult.confidence}</div>
                                </div>
                              )}
                              
                              {parsedResult.advice && (
                                <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                                  <div className="text-green-300 font-bold text-lg mb-2">💡 Recommendation:</div>
                                  <div className="text-white text-lg">{parsedResult.advice}</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-900/60 border border-gray-500/30 rounded-xl p-4">
                              <div className="text-gray-300 font-bold mb-2">Raw Neural Output:</div>
                              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                {result.raw || JSON.stringify(result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={resetSession}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-8 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg text-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Initialize New Diagnosis Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-t-cyan-400 border-r-transparent border-b-blue-400 border-l-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                <div className="absolute inset-4 border-4 border-t-purple-400 border-r-transparent border-b-pink-400 border-l-transparent rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                <div className="absolute inset-8 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-cyan-400 mb-4 animate-pulse">
              Processing Neural Pathways...
            </h3>
            <p className="text-cyan-300 text-xl">Please wait while AI analyzes your data</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.8s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .glass-card {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 25px 50px rgba(6, 182, 212, 0.2);
          transform: translateY(-5px);
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(0, 0, 0, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #0891b2, #2563eb);
        }
        
        /* Floating Animation for Medical Icons */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        
        /* Pulse Effect for Important Elements */
        @keyframes medicalPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 20px rgba(6, 182, 212, 0);
            transform: scale(1.05);
          }
        }
        
        .medical-pulse {
          animation: medicalPulse 2s infinite;
        }
        
        /* Holographic Text Effect */
        .holographic {
          background: linear-gradient(45deg, #ff006e, #06ffa5, #8338ec, #3a86ff);
          background-size: 400% 400%;
          animation: holographicShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes holographicShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Neural Network Visualization */
        .neural-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
          animation: neuralPulse 8s ease-in-out infinite alternate;
        }
        
        @keyframes neuralPulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
        
        /* Glitch Effect for Error States */
        .glitch {
          position: relative;
        }
        
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch::before {
          animation: glitch-1 0.5s infinite;
          color: #ff00ff;
          z-index: -1;
        }
        
        .glitch::after {
          animation: glitch-2 0.5s infinite;
          color: #00ffff;
          z-index: -2;
        }
        
        @keyframes glitch-1 {
          0%, 14%, 15%, 49%, 50%, 99%, 100% {
            transform: translate(0);
          }
          15%, 49% {
            transform: translate(-2px, 0);
          }
        }
        
        @keyframes glitch-2 {
          0%, 20%, 21%, 62%, 63%, 99%, 100% {
            transform: translate(0);
          }
          21%, 62% {
            transform: translate(2px, 0);
          }
        }
        
        /* Matrix-style Text Rain Effect */
        .matrix-rain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .matrix-char {
          position: absolute;
          color: #00ff41;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          animation: matrixFall linear infinite;
        }
        
        @keyframes matrixFall {
          0% {
            transform: translateY(-100vh);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        /* Cyberpunk Button Effects */
        .cyber-button {
          position: relative;
          overflow: hidden;
        }
        
        .cyber-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .cyber-button:hover::before {
          left: 100%;
        }
        
        /* Medical Cross Animation */
        .medical-cross {
          position: relative;
          width: 30px;
          height: 30px;
          margin: 0 auto;
        }
        
        .medical-cross::before,
        .medical-cross::after {
          content: '';
          position: absolute;
          background: #ff4757;
          border-radius: 2px;
        }
        
        .medical-cross::before {
          width: 6px;
          height: 30px;
          left: 12px;
          top: 0;
          animation: crossPulse 2s infinite;
        }
        
        .medical-cross::after {
          width: 30px;
          height: 6px;
          left: 0;
          top: 12px;
          animation: crossPulse 2s infinite 0.5s;
        }
        
        @keyframes crossPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        
        /* DNA Helix Loading */
        .dna-helix {
          width: 60px;
          height: 60px;
          position: relative;
          margin: 0 auto;
        }
        
        .dna-strand {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00d4ff;
          border-radius: 50%;
          animation: dnaRotate 2s linear infinite;
        }
        
        .dna-strand:nth-child(1) { animation-delay: 0s; }
        .dna-strand:nth-child(2) { animation-delay: 0.1s; }
        .dna-strand:nth-child(3) { animation-delay: 0.2s; }
        .dna-strand:nth-child(4) { animation-delay: 0.3s; }
        .dna-strand:nth-child(5) { animation-delay: 0.4s; }
        .dna-strand:nth-child(6) { animation-delay: 0.5s; }
        
        @keyframes dnaRotate {
          0% {
            transform: rotateY(0deg) translateX(25px) rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg) translateX(25px) rotateY(-360deg);
          }
        }
        
        /* Heartbeat Animation */
        @keyframes heartbeat {
          0%, 50%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          75% { transform: scale(1.1); }
        }
        
        .heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        
        /* Scan Line Effect */
        .scan-line {
          position: relative;
          overflow: hidden;
        }
        
        .scan-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff41, transparent);
          animation: scanMove 3s linear infinite;
        }
        
        @keyframes scanMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}