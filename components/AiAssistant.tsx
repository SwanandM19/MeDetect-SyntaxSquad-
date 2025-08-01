"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Mic, MicOff } from 'lucide-react';

interface RouteKeywords {
  [key: string]: string[];
}

interface FormFields {
  [key: string]: string[];
}

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

interface FormFillResponse {
  field: string;
  value: string;
}

interface AIResponse {
  navigation?: string;
  formFill?: FormFillResponse;
  response?: string;
}

const ROUTES: { [key: string]: string } = {
  dashboard: '/dashboard',
  activity: '/activity',
  help: '/help',
  login: '/login',
  profilesetup: '/profilesetup'
};

const ROUTE_KEYWORDS: RouteKeywords = {
  dashboard: ['dashboard', 'main page', 'home', 'overview'],
  activity: ['activity', 'log', 'tracking', 'progress'],
  help: ['help', 'support', 'assistance', 'guide'],
  login: ['login', 'sign in', 'access'],
  profilesetup: ['profile', 'setup profile', 'create profile', 'personalize']
};

const FORM_FIELDS: FormFields = {
  firstName: ['first name', 'firstname', 'first'],
  middleName: ['middle name', 'middlename', 'middle'],
  lastName: ['last name', 'lastname', 'last'],
  dob: ['date of birth', 'birthday', 'birth date'],
  gender: ['gender', 'sex'],
  contactNumber: ['contact number', 'phone', 'telephone', 'mobile'],
  address: ['address', 'location', 'home address'],
  chronicIllness: ['chronic illness', 'medical condition'],
  pastSurgeries: ['past surgeries', 'previous surgeries'],
  existingDisabilities: ['existing disabilities', 'disabilities'],
  medicationName: ['medication name', 'medicine'],
  dosageFrequency: ['dosage', 'frequency', 'dosage and frequency'],
  prescribingDoctor: ['prescribing doctor', 'doctor']
};

const AIAssistant = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const detectRouteChange = useCallback((input: string): string | null => {
    const lowercaseInput = input.toLowerCase();

    for (const [routeName, keywords] of Object.entries(ROUTE_KEYWORDS)) {
      if (keywords.some(keyword => lowercaseInput.includes(keyword))) {
        return ROUTES[routeName];
      }
    }
    return null;
  }, []);

  const detectFormFill = useCallback((input: string): FormFillResponse | null => {
    if (pathname !== '/profilesetup') return null;

    const lowercaseInput = input.toLowerCase();

    for (const [field, keywords] of Object.entries(FORM_FIELDS)) {
      const matchedKeyword = keywords.find(keyword =>
        lowercaseInput.includes(keyword)
      );

      if (matchedKeyword) {
        const value = lowercaseInput.split(matchedKeyword)[1].trim().split(' ')[0];
        return { field, value };
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const femaleVoice = voices.find(
        (voice) =>
          voice.name.includes('Zira') ||
          voice.name.includes('Hazel') ||
          voice.name.includes('Susan') ||
          voice.name.includes('Aria') ||
          voice.name.includes('Heera')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.volume = 1.0;
      }

      speechSynthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  }, [voices]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setInputText(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      }

      return () => {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
        }
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      if (speechRecognitionRef.current) {
        setInputText('');
        speechRecognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    try {
      const aiResponse = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const aiData: AIResponse = await aiResponse.json();

      if (aiData.navigation) {
        router.push(aiData.navigation);
        const routeResponse = `Redirecting you to ${aiData.navigation.substring(1)} page.`;
        setResponse(routeResponse);
        speak(routeResponse);
        setMessages(prev => [...prev, { text: routeResponse, sender: 'ai' }]);
        setInputText('');
        return;
      }

      if (aiData.formFill) {
        window.dispatchEvent(new CustomEvent('ai-form-fill', {
          detail: {
            field: aiData.formFill.field,
            value: aiData.formFill.value
          }
        }));

        const fillResponse = `Filling ${aiData.formFill.field} with ${aiData.formFill.value}`;
        setResponse(fillResponse);
        speak(fillResponse);
        setMessages(prev => [...prev, { text: fillResponse, sender: 'ai' }]);
        setInputText('');
        return;
      }

      if (aiData.response) {
        setResponse(aiData.response);
        speak(aiData.response);
        setMessages(prev => [...prev, { text: aiData.response, sender: 'ai' }]);
        setInputText('');
      }
    } catch (error) {
      console.error('Error processing AI response:', error);
      const errorMessage = "Sorry, I couldn't process your request. Please try again.";
      setResponse(errorMessage);
      speak(errorMessage);
      setMessages(prev => [...prev, { text: errorMessage, sender: 'ai' }]);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    }

    setIsOpen(false);
    setIsListening(false);
  };

  useEffect(() => {
    if (isOpen) {
      const greeting = "Hi, I'm Maggie, your AI assistant. How can I help you today?";
      setResponse(greeting);
      speak(greeting);
      setMessages([{ text: greeting, sender: 'ai' }]);
    }
  }, [isOpen, voices, speak]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Bot Button with Spline Model */}
      <motion.div
  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer shadow-2xl hover:shadow-xl transition-all fixed bottom-10 right-10 z-50"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.9 }}
  onClick={() => setIsOpen(!isOpen)}
>
  <img
    src="/aiassistant.png" // Replace with your actual PNG path
    alt="AI Assistant"
    className="w-full h-full object-cover"
  />
</motion.div>


      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="w-96 bg-white rounded-2xl shadow-2xl overflow-hidden absolute bottom-24 right-0 border border-gray-200 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Maggie - AI Assistant</h3>
              </div>
              <button
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
                onClick={handleClose}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-3 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  onClick={toggleVoiceInput}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
              <button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:opacity-90 transition-all"
                onClick={handleSubmit}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
};

export default AIAssistant;