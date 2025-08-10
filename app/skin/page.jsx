// "use client";
// import React, { useState } from "react";
// import Head from "next/head";
// import Image from "next/image";
// import Link from "next/link";
// import ProfileMenu from "@/components/ProfileMenu";

// export default function Skin() {
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [collapsed, setCollapsed] = useState(false);
//     const [files, setFiles] = useState<File[]>([]); // store uploaded files
//     const [showQR, setShowQR] = useState(false); // toggle QR image

//     // Handle file selection
//     const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//         if (event.target.files) {
//             const uploadedFiles = Array.from(event.target.files);
//             setFiles(uploadedFiles);
//             console.log("Files uploaded:", uploadedFiles);
//         }
//     };

//     return (
//         <div
//             className="relative min-h-screen text-white"
//             style={{ fontFamily: "'Readex Pro', sans-serif" }}
//         >
//             <Head>
//                 <link
//                     href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400&display=swap"
//                     rel="stylesheet"
//                 />
//             </Head>

//             {/* Background */}
//             <div className="absolute inset-0 -z-10">
//                 <iframe
//                     src="https://my.spline.design/particlenebula-Lhnk9Kvv9ioPiRHGvmCTlGEa/"
//                     frameBorder="0"
//                     width="100%"
//                     height="100%"
//                     className="w-full h-full"
//                 ></iframe>
//             </div>

//             {/* Top Bar */}
//             <header className="w-full px-6 py-4 border-white/10 flex items-center justify-between">
//                 {/* Logo & Title */}
//                 <div className="flex items-center space-x-6">
//                     <Link href="/" className="relative w-10 h-10 block">
//                         <Image
//                             src="/onlylogo.png"
//                             alt="Medetect Logo"
//                             fill
//                             className="object-contain"
//                         />
//                     </Link>
//                     <h1 className="text-xl font-light">Disease detection of skin</h1>
//                 </div>

//                 {/* Center Icons */}
//                 <nav className="flex items-center space-x-40 opacity-70 ml-[-160px]">
//                     <Image src="/icons/home.png" alt="Home" width={24} height={24} />
//                     <Image src="/icons/agents.png" alt="Agents" width={24} height={24} />
//                     <Link href="/analytics">
//                         <Image
//                             src="/icons/data-analytics.png"
//                             alt="Analytics"
//                             width={24}
//                             height={24}
//                             className="cursor-pointer"
//                         />
//                     </Link>
//                     <Image src="/icons/exit.png" alt="Exit" width={24} height={24} />
//                 </nav>

//                 {/* Profile */}
//                 <ProfileMenu />
//             </header>

//             {/* Main Content */}
//             <main className="p-6 grid grid-cols-[auto_1fr_300px] gap-4 h-[calc(100vh-72px)] transition-all duration-300">

//                 {/* Sources Panel - Collapsible */}
//                 <div
//                     className={`bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-2 flex flex-col items-center transition-all duration-300 ${collapsed ? "w-[50px]" : "w-64"
//                         }`}
//                 >
//                     {/* Collapse Icon */}
//                     <button
//                         onClick={() => setCollapsed(!collapsed)}
//                         className="p-2 rounded hover:bg-white/20 transition"
//                     >
//                         {collapsed ? "»" : "«"}
//                     </button>

//                     {!collapsed ? (
//                         <div className="flex-1 flex flex-col justify-center items-center text-gray-300">
//                             <p className="text-sm mb-2">Saved sources will appear here.</p>

//                             {/* Upload Button */}
//                             <label className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition cursor-pointer">
//                                 Upload a source
//                                 <input
//                                     type="file"
//                                     multiple
//                                     className="hidden"
//                                     onChange={handleFileUpload}
//                                 />
//                             </label>

//                             <p className="text-xs mt-2">upload any type of file</p>

//                             {/* Show uploaded file names */}
//                             {files.length > 0 && (
//                                 <ul className="mt-4 text-xs text-gray-300 text-center space-y-1">
//                                     {files.map((file, index) => (
//                                         <li key={index}>{file.name}</li>
//                                     ))}
//                                 </ul>
//                             )}
//                         </div>
//                     ) : (
//                         <div className="flex flex-col space-y-4 mt-4">
//                             <Image src="/icons/add.png" alt="Add" width={20} height={20} />
//                         </div>
//                     )}
//                 </div>

//                 {/* Chat Panel */}
//                 <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col items-center justify-center">
//                     <p className="text-gray-300 mb-4">Start Advance Diagnose</p>
//                     <button className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition">
//                         Start
//                     </button>
//                 </div>

//                 {/* Studio Panel */}
//                 <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col">
//                     <h2 className="text-sm font-medium mb-4">Result</h2>

//                     {/* Show QR Code if generated */}
//                     {showQR && (
//                         <div className="mt-40 flex justify-center">
//                             <img
//                                 src="/icons/qr.png" // Replace with your QR image
//                                 alt="Generated QR Code"
//                                 className="w-32 h-32 object-contain"
//                             />
//                         </div>
//                     )}

//                     <div className="mt-auto text-center">
//                         <div className="flex justify-center gap-3">
//                             <button className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition">
//                                 Get Hospital Help
//                             </button>
//                             <button
//                                 onClick={() => setShowQR(!showQR)}
//                                 className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition"
//                             >
//                                 QR Generate
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// }
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Skin() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [files, setFiles] = useState([]);
    const [showQR, setShowQR] = useState(false);
    
    // Roboflow API config
    const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
    const MODEL_URL = "https://detect.roboflow.com/skin-disease-detection-phsnp/2";
    const [prediction, setPrediction] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);

    // Diagnosis states
    const [summary, setSummary] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [questionOptions, setQuestionOptions] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const [stage, setStage] = useState("input"); // "input", "questioning", "diagnosis"

    // Handle file selection & send to Roboflow
    const handleFileUpload = async (event) => {
        if (!event.target.files) return;
        const uploadedFiles = Array.from(event.target.files);
        setFiles(uploadedFiles);

        if (uploadedFiles.length > 0) {
            await sendToRoboflow(uploadedFiles[0]);
        }
    };

    // Send image to Roboflow
    const sendToRoboflow = async (file) => {
        try {
            setImageLoading(true);
            setPrediction(null);

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${MODEL_URL}?api_key=${ROBOFLOW_API_KEY}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();
            console.log("Roboflow result:", result);

            // Extract first prediction
            if (result.predictions && result.predictions.length > 0) {
                const best = result.predictions[0];
                setPrediction({
                    class: best.class,
                    confidence: (best.confidence * 100).toFixed(2)
                });
            } else {
                setPrediction({ class: "No disease detected", confidence: null });
            }
        } catch (error) {
            console.error("Error sending image to Roboflow:", error);
        } finally {
            setImageLoading(false);
        }
    };

    // Start diagnosis session
    const startSession = async () => {
        if (!summary.trim() && !prediction) {
            alert("Please enter a summary of your condition or upload an image");
            return;
        }

        setIsLoading(true);
        try {
            const requestBody = {
                summary: summary.trim(),
                image_prediction: prediction ? {
                    class: prediction.class,
                    confidence: prediction.confidence
                } : null
            };

            const response = await fetch('http://localhost:5000/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            if (response.ok) {
                setSessionId(data.session_id);
                setStage("questioning");
                getNextQuestion(data.session_id);
            } else {
                alert("Error starting session: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to server. Make sure the backend is running.");
        }
        setIsLoading(false);
    };

    // Get next question
    const getNextQuestion = async (sessionIdToUse = sessionId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/question?session_id=${sessionIdToUse}`);
            const data = await response.json();
            
            if (response.ok) {
                if (data.message && data.message.includes("Sufficient information")) {
                    // Ready for diagnosis
                    getDiagnosis(sessionIdToUse);
                } else if (data.question) {
                    parseQuestion(data.question);
                }
            } else {
                alert("Error getting question: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to get question");
        }
        setIsLoading(false);
    };

    // Parse question and options
    const parseQuestion = (questionText) => {
        const lines = questionText.split('\n');
        let question = "";
        let options = [];
        
        let currentSection = "";
        for (let line of lines) {
            line = line.trim();
            if (line.startsWith("Question:")) {
                question = line.replace("Question:", "").trim();
                currentSection = "question";
            } else if (line.startsWith("Options:")) {
                currentSection = "options";
            } else if (currentSection === "options" && line.match(/^\d+\./)) {
                options.push(line.replace(/^\d+\.\s*/, ""));
            } else if (currentSection === "question" && line) {
                question += " " + line;
            }
        }
        
        setCurrentQuestion(question);
        setQuestionOptions(options);
        setSelectedAnswer("");
    };

    // Submit answer
    const submitAnswer = async () => {
        if (!selectedAnswer) {
            alert("Please select an answer");
            return;
        }

        // Add to chat history immediately
        setChatHistory(prev => [...prev, {
            question: currentQuestion,
            answer: selectedAnswer
        }]);

        // Clear current question and start loading
        setCurrentQuestion("");
        setQuestionOptions([]);
        setSelectedAnswer("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    answer: selectedAnswer
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                // Get next question
                getNextQuestion();
            } else {
                alert("Error submitting answer: " + (data.error || "Unknown error"));
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to submit answer");
            setIsLoading(false);
        }
    };

    // Get diagnosis
    const getDiagnosis = async (sessionIdToUse = sessionId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/diagnosis?session_id=${sessionIdToUse}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                setDiagnosis(data.report);
                setStage("diagnosis");
            } else {
                alert("Error getting diagnosis: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to get diagnosis");
        }
        setIsLoading(false);
    };

    // Reset for new session
    const resetSession = () => {
        setSessionId(null);
        setSummary("");
        setCurrentQuestion("");
        setQuestionOptions([]);
        setSelectedAnswer("");
        setChatHistory([]);
        setDiagnosis(null);
        setPrediction(null);
        setFiles([]);
        setStage("input");
    };

    return (
        <div
            className="relative min-h-screen text-white"
            style={{ fontFamily: "'Readex Pro', sans-serif" }}
        >
            {/* Google Font */}
            <link
                href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400&display=swap"
                rel="stylesheet"
            />

            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <iframe
                    src="https://my.spline.design/particlenebula-Lhnk9Kvv9ioPiRHGvmCTlGEa/"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    className="w-full h-full"
                ></iframe>
            </div>

            {/* Top Bar */}
            <header className="w-full px-6 py-4 border-white/10 flex items-center justify-between">
                {/* Logo & Title */}
                <div className="flex items-center space-x-6">
                    <a href="/" className="relative w-10 h-10 block">
                        <img
                            src="/onlylogo.png"
                            alt="Medetect Logo"
                            className="object-contain w-full h-full"
                        />
                    </a>
                    <h1 className="text-xl font-light">Disease detection of skin</h1>
                </div>

                {/* Center Icons */}
                <nav className="flex items-center space-x-40 opacity-70 ml-[-160px]">
                    <img src="/icons/home.png" alt="Home" width={24} height={24} />
                    <img src="/icons/agents.png" alt="Agents" width={24} height={24} />
                    <a href="/analytics">
                        <img
                            src="/icons/data-analytics.png"
                            alt="Analytics"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                        />
                    </a>
                    <img src="/icons/exit.png" alt="Exit" width={24} height={24} />
                </nav>
            </header>

            {/* Main Content */}
            <main className="p-6 grid grid-cols-[auto_1fr_300px] gap-4 h-[calc(100vh-72px)] transition-all duration-300">

                {/* Sources Panel - Collapsible */}
                <div
                    className={`bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-2 flex flex-col items-center transition-all duration-300 ${collapsed ? "w-[50px]" : "w-64"
                        }`}
                >
                    {/* Collapse Icon */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded hover:bg-white/20 transition"
                    >
                        {collapsed ? "»" : "«"}
                    </button>

                    {!collapsed ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-gray-300 space-y-4">
                            <p className="text-sm mb-2">Upload a skin image or describe your condition</p>

                            {/* Upload Button */}
                            <label className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition cursor-pointer">
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            {/* Image Prediction Result */}
                            {imageLoading ? (
                                <p className="text-xs">Analyzing image...</p>
                            ) : prediction ? (
                                <div className="text-center text-xs">
                                    <p className="text-white">Image Analysis:</p>
                                    <p>{prediction.class}</p>
                                    {prediction.confidence && (
                                        <p>Confidence: {prediction.confidence}%</p>
                                    )}
                                </div>
                            ) : null}

                            {/* Show uploaded file names */}
                            {files.length > 0 && (
                                <ul className="text-xs text-gray-300 text-center space-y-1">
                                    {files.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            )}

                            {/* Summary Input */}
                            <div className="w-full mt-4">
                                <label className="block text-xs text-gray-300 mb-2">
                                    Or describe your condition:
                                </label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Brief description of your skin condition..."
                                    className="w-full h-20 p-2 text-sm bg-white/10 border border-white/30 rounded text-white placeholder-gray-400 resize-none"
                                    disabled={stage !== "input"}
                                />
                            </div>

                            {/* Start Session Button */}
                            {stage === "input" && (
                                <button 
                                    onClick={startSession}
                                    disabled={isLoading || (!summary.trim() && !prediction)}
                                    className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition disabled:opacity-50"
                                >
                                    {isLoading ? "Starting..." : "Start Session"}
                                </button>
                            )}

                            {/* New Session Button */}
                            {stage !== "input" && (
                                <button 
                                    onClick={resetSession}
                                    className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition"
                                >
                                    New Session
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4 mt-4">
                            <img src="/icons/add.png" alt="Add" width={20} height={20} />
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col">
                    {stage === "input" && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-300">
                                {prediction 
                                    ? `Image analysis complete: ${prediction.class} (${prediction.confidence}%)`
                                    : "Enter your condition summary or upload an image to start session"}
                            </p>
                        </div>
                    )}

                    {stage === "questioning" && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto mb-4">
                                {/* Chat History */}
                                {chatHistory.map((chat, index) => (
                                    <div key={index} className="mb-4 p-2 bg-white/5 rounded">
                                        <p className="text-sm text-gray-300 mb-1">Q: {chat.question}</p>
                                        <p className="text-sm text-white">A: {chat.answer}</p>
                                    </div>
                                ))}

                                {/* Current Question */}
                                {currentQuestion && (
                                    <div className="bg-white/10 p-3 rounded mb-4">
                                        <p className="text-white mb-3">{currentQuestion}</p>
                                        
                                        {/* Options */}
                                        <div className="space-y-2">
                                            {questionOptions.map((option, index) => (
                                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="answer"
                                                        value={option}
                                                        checked={selectedAnswer === option}
                                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                                        className="text-white"
                                                    />
                                                    <span className="text-sm text-gray-300">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            {currentQuestion && (
                                <button
                                    onClick={submitAnswer}
                                    disabled={isLoading || !selectedAnswer}
                                    className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition disabled:opacity-50"
                                >
                                    {isLoading ? "Submitting..." : "Submit Answer"}
                                </button>
                            )}

                            {isLoading && !currentQuestion && (
                                <div className="text-center text-gray-300">
                                    Processing your responses...
                                </div>
                            )}
                        </div>
                    )}

                    {stage === "diagnosis" && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-300">Diagnosis complete! Check the result panel.</p>
                        </div>
                    )}
                </div>

                {/* Studio Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col">
                    <h2 className="text-sm font-medium mb-4">Result</h2>

                    {/* Image Prediction Display */}
                    {prediction && !diagnosis && (
                        <div className="mb-4 p-2 bg-white/5 rounded">
                            <p className="text-white font-medium">Image Analysis:</p>
                            <p className="text-gray-300">{prediction.class}</p>
                            {prediction.confidence && (
                                <p className="text-gray-300">Confidence: {prediction.confidence}%</p>
                            )}
                        </div>
                    )}

                    {/* Diagnosis Display */}
                    {diagnosis && (
                        <div className="flex-1 overflow-y-auto text-xs space-y-2">
                            <div className="bg-white/5 p-2 rounded">
                                <p className="text-white font-medium">Primary Diagnosis:</p>
                                <p className="text-gray-300">{diagnosis.assessment?.likelyDiagnosis || "Not specified"}</p>
                            </div>
                            
                            <div className="bg-white/5 p-2 rounded">
                                <p className="text-white font-medium">Confidence:</p>
                                <p className="text-gray-300">{diagnosis.assessment?.confidence || "Not specified"}</p>
                            </div>

                            {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                                <div className="bg-white/5 p-2 rounded">
                                    <p className="text-white font-medium">Recommendations:</p>
                                    {diagnosis.recommendations.slice(0, 3).map((rec, index) => (
                                        <p key={index} className="text-gray-300 text-xs">• {rec.text}</p>
                                    ))}
                                </div>
                            )}

                            <div className="bg-white/5 p-2 rounded">
                                <p className="text-white font-medium">Urgency:</p>
                                <p className="text-gray-300">{diagnosis.assessment?.urgency || "Not specified"}</p>
                            </div>
                        </div>
                    )}

                    {/* Show QR Code if generated */}
                    {showQR && (
                        <div className="mt-40 flex justify-center">
                            <img
                                src="/icons/qr.png"
                                alt="Generated QR Code"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                    )}

                    {!diagnosis && !prediction && !showQR && (
                        <div className="flex-1"></div>
                    )}

                    <div className="mt-auto text-center">
                        <div className="flex justify-center gap-3">
                            <button className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition text-xs">
                                Get Hospital Help
                            </button>
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition text-xs"
                            >
                                QR Generate
                            </button>
                            <button
                                onClick={() => router.push("/skinreport")}
                                className="border border-white/80 px-4 py-2 rounded hover:bg-white/10 transition text-xs"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}