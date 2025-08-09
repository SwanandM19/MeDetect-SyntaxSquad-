'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.error("SpeechRecognition not supported in this browser.");
          return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'hi-IN'; // ✅ Hindi (India

        recognitionRef.current.onresult = (event) => {
          const speech = event.results[0][0].transcript;
          setTranscript(speech);
          sendToBackend(speech);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (err) => {
          console.error("SpeechRecognition Error:", err);
          setIsListening(false);
        };

        synthRef.current = window.speechSynthesis;
      } catch (error) {
        console.error("VoiceAssistant useEffect Error:", error);
      }
    }
  }, []);

  const sendToBackend = async (message) => {
    try {
      const res = await axios.post('http://localhost:5000/process', {
        message,
        language: 'hi',
      });
      const botReply = res.data.response;
      setResponse(botReply);
      speak(botReply);
    } catch (error) {
      console.error("Error communicating with backend:", error);
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // ✅ For correct Hindi pronunciation
      synthRef.current.speak(utterance);
    } else {
      console.warn("Speech synthesis not available.");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-white shadow-xl text-black w-full max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">🌐 Multilingual Voice Assistant</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={toggleListening}
      >
        {isListening ? '🎙️ Stop Listening' : '🎧 Start Talking'}
      </button>
      <div className="mt-4">
        <p><strong>You:</strong> {transcript}</p>
        <p><strong>Assistant:</strong> {response}</p>
      </div>
    </div>
  );
}
