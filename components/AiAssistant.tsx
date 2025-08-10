// "use client";
// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Send, X, Bot, Mic, MicOff } from 'lucide-react';

// // Add these declarations only if they don't exist
// declare global {
//   interface Window {
//     SpeechRecognition: any;
//     webkitSpeechRecognition: any;
//   }
// type MySpeechRecognitionEvent = Event & {
//   results: SpeechRecognitionResultList;
// };

//   var SpeechRecognition: any;
//   var webkitSpeechRecognition: any;
// }
// type MySpeechRecognitionErrorEvent = Event & {
//   error: string;
//   message: string;
// };

// interface RouteKeywords {
//   [key: string]: string[];
// }

// interface FormFields {
//   [key: string]: string[];
// }

// interface Message {
//   text: string;
//   sender: 'user' | 'ai';
// }

// interface FormFillResponse {
//   field: string;
//   value: string;
// }

// interface AIResponse {
//   navigation?: string;
//   formFill?: FormFillResponse;
//   response?: string;
// }

// const ROUTES: { [key: string]: string } = {
//   dashboard: '/dashboard',
//   activity: '/activity',
//   help: '/help',
//   login: '/login',
//   profilesetup: '/profilesetup'
// };

// const ROUTE_KEYWORDS: RouteKeywords = {
//   dashboard: ['dashboard', 'main page', 'home', 'overview'],
//   activity: ['activity', 'log', 'tracking', 'progress'],
//   help: ['help', 'support', 'assistance', 'guide'],
//   login: ['login', 'sign in', 'access'],
//   profilesetup: ['profile', 'setup profile', 'create profile', 'personalize']
// };

// const FORM_FIELDS: FormFields = {
//   firstName: ['first name', 'firstname', 'first'],
//   middleName: ['middle name', 'middlename', 'middle'],
//   lastName: ['last name', 'lastname', 'last'],
//   dob: ['date of birth', 'birthday', 'birth date'],
//   gender: ['gender', 'sex'],
//   contactNumber: ['contact number', 'phone', 'telephone', 'mobile'],
//   address: ['address', 'location', 'home address'],
//   chronicIllness: ['chronic illness', 'medical condition'],
//   pastSurgeries: ['past surgeries', 'previous surgeries'],
//   existingDisabilities: ['existing disabilities', 'disabilities'],
//   medicationName: ['medication name', 'medicine'],
//   dosageFrequency: ['dosage', 'frequency', 'dosage and frequency'],
//   prescribingDoctor: ['prescribing doctor', 'doctor']
// };

// const AIAssistant = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [inputText, setInputText] = useState<string>('');
//   const [response, setResponse] = useState<string>('');
//   const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isListening, setIsListening] = useState<boolean>(false);
//   // const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
//   const speechRecognitionRef = useRef<any>(null);
//   const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

//   const detectRouteChange = useCallback((input: string): string | null => {
//     const lowercaseInput = input.toLowerCase();

//     for (const [routeName, keywords] of Object.entries(ROUTE_KEYWORDS)) {
//       if (keywords.some(keyword => lowercaseInput.includes(keyword))) {
//         return ROUTES[routeName];
//       }
//     }
//     return null;
//   }, []);

//   const detectFormFill = useCallback((input: string): FormFillResponse | null => {
//     if (pathname !== '/profilesetup') return null;

//     const lowercaseInput = input.toLowerCase();

//     for (const [field, keywords] of Object.entries(FORM_FIELDS)) {
//       const matchedKeyword = keywords.find(keyword =>
//         lowercaseInput.includes(keyword)
//       );

//       if (matchedKeyword) {
//         const value = lowercaseInput.split(matchedKeyword)[1].trim().split(' ')[0];
//         return { field, value };
//       }
//     }
//     return null;
//   }, [pathname]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const loadVoices = () => {
//         const availableVoices = window.speechSynthesis.getVoices();
//         setVoices(availableVoices);
//       };

//       window.speechSynthesis.onvoiceschanged = loadVoices;
//       loadVoices();

//       return () => {
//         window.speechSynthesis.cancel();
//       };
//     }
//   }, []);

//   const speak = useCallback((text: string) => {
//     if (typeof window !== 'undefined') {
//       window.speechSynthesis.cancel();

//       const utterance = new SpeechSynthesisUtterance(text);

//       const femaleVoice = voices.find(
//         (voice) =>
//           voice.name.includes('Zira') ||
//           voice.name.includes('Hazel') ||
//           voice.name.includes('Susan') ||
//           voice.name.includes('Aria') ||
//           voice.name.includes('Heera')
//       );

//       if (femaleVoice) {
//         utterance.voice = femaleVoice;
//         utterance.pitch = 1.0;
//         utterance.rate = 1.0;
//         utterance.volume = 1.0;
//       }

//       speechSynthesisRef.current = utterance;
//       speechSynthesis.speak(utterance);
//     }
//   }, [voices]);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const SpeechRecognition =
//         window.SpeechRecognition ||
//         window.webkitSpeechRecognition;

//       if (SpeechRecognition) {
//         const recognition = new SpeechRecognition();
//         recognition.continuous = false;
//         recognition.interimResults = true;
//         recognition.lang = 'en-US';

//         recognition.onresult = (event: MySpeechRecognitionEvent) =>{
//           const transcript = Array.from(event.results)
//             .map(result => result[0].transcript)
//             .join('');
//           setInputText(transcript);
//         };

//         recognition.onerror = (event: MySpeechRecognitionErrorEvent) =>  {
//           console.error('Speech recognition error:', event.error);
//           setIsListening(false);
//         };

//         recognition.onend = () => {
//           setIsListening(false);
//         };

//         speechRecognitionRef.current = recognition;
//       }

//       return () => {
//         if (speechRecognitionRef.current) {
//           speechRecognitionRef.current.stop();
//         }
//       };
//     }
//   }, []);

//   const toggleVoiceInput = () => {
//     if (isListening) {
//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.stop();
//       }
//       setIsListening(false);
//     } else {
//       if (speechRecognitionRef.current) {
//         setInputText('');
//         speechRecognitionRef.current.start();
//         setIsListening(true);
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     if (!inputText.trim()) return;

//     const userMessage: Message = { text: inputText, sender: 'user' };
//     setMessages(prev => [...prev, userMessage]);

//     try {
//       const aiResponse = await fetch('http://localhost:5000/process', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text: inputText }),
//       });
//       const aiData: AIResponse = await aiResponse.json();

//       if (aiData.navigation) {
//         router.push(aiData.navigation);
//         const routeResponse = `Redirecting you to ${aiData.navigation.substring(1)} page.`;
//         setResponse(routeResponse);
//         speak(routeResponse);
//         setMessages(prev => [...prev, { text: routeResponse, sender: 'ai' }]);
//         setInputText('');
//         return;
//       }

//       if (aiData.formFill) {
//         window.dispatchEvent(new CustomEvent('ai-form-fill', {
//           detail: {
//             field: aiData.formFill.field,
//             value: aiData.formFill.value
//           }
//         }));

//         const fillResponse = `Filling ${aiData.formFill.field} with ${aiData.formFill.value}`;
//         setResponse(fillResponse);
//         speak(fillResponse);
//         setMessages(prev => [...prev, { text: fillResponse, sender: 'ai' }]);
//         setInputText('');
//         return;
//       }

//       if (aiData.response) {
//         setResponse(aiData.response);
//         speak(aiData.response);
//         setMessages(prev => [...prev, { text: aiData.response ?? '', sender: 'ai' }]);
//         setInputText('');
//       }
//     } catch (error) {
//       console.error('Error processing AI response:', error);
//       const errorMessage = "Sorry, I couldn't process your request. Please try again.";
//       setResponse(errorMessage);
//       speak(errorMessage);
//       setMessages(prev => [...prev, { text: errorMessage, sender: 'ai' }]);
//     }
//   };

//   const handleClose = () => {
//     if (typeof window !== 'undefined') {
//       window.speechSynthesis.cancel();

//       if (speechRecognitionRef.current) {
//         speechRecognitionRef.current.stop();
//       }
//     }

//     setIsOpen(false);
//     setIsListening(false);
//   };

//   useEffect(() => {
//     if (isOpen) {
//       const greeting = "Hi, I'm Maggie, your AI assistant. How can I help you today?";
//       setResponse(greeting);
//       speak(greeting);
//       setMessages([{ text: greeting, sender: 'ai' }]);
//     }
//   }, [isOpen, voices, speak]);

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   return (
//     <div className="fixed bottom-8 right-8 z-50">
//       {/* Bot Button with Spline Model */}
//       <motion.div
//   className="w-10 h-10 rounded-full overflow-hidden cursor-pointer shadow-2xl hover:shadow-xl transition-all fixed bottom-10 right-10 z-50"
//   whileHover={{ scale: 1.05 }}
//   whileTap={{ scale: 0.9 }}
//   onClick={() => setIsOpen(!isOpen)}
// >
//   <img
//     src="/aiassistant.png" // Replace with your actual PNG path
//     alt="AI Assistant"
//     className="w-full h-full object-cover"
//   />
// </motion.div>


//       {/* Chat Window */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="w-96 bg-white rounded-2xl shadow-2xl overflow-hidden absolute bottom-24 right-0 border border-gray-200 z-50"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             transition={{ duration: 0.3 }}
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
//               <div className="flex items-center space-x-2">
//                 <Bot className="w-6 h-6" />
//                 <h3 className="text-lg font-semibold">Maggie - AI Assistant</h3>
//               </div>
//               <button
//                 className="hover:bg-white/20 rounded-full p-1 transition-colors"
//                 onClick={handleClose}
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Chat Messages */}
//             <div className="p-4 h-80 overflow-y-auto space-y-3 bg-gray-50">
//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
//                     }`}
//                 >
//                   <div
//                     className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sender === 'user'
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-gray-200 text-gray-800'
//                       }`}
//                   >
//                     {msg.text}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Input Box */}
//             <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
//               <div className="flex-1 relative">
//                 <input
//                   type="text"
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   onKeyDown={handleKeyPress}
//                   placeholder="Type your message..."
//                   className="w-full p-3 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                 />
//                 <button
//                   className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
//                     }`}
//                   onClick={toggleVoiceInput}
//                 >
//                   {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
//                 </button>
//               </div>
//               <button
//                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:opacity-90 transition-all"
//                 onClick={handleSubmit}
//               >
//                 <Send className="w-5 h-5" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>

//   );
// };

// export default AIAssistant;
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, Mic, MicOff, X, Bot } from "lucide-react";

/**
 * VoiceAgent.tsx
 * - Loads dom-schema from /dom-schema.json (public/)
 * - Records speech -> text
 * - Sends (text + current page schema) to Groq LLM
 * - Parses LLM response JSON and executes safe actions: navigate, click, fill
 *
 * IMPORTANT:
 *  - Put dom-schema.json in public/
 *  - Provide NEXT_PUBLIC_GROQ_API_KEY in env for dev (or run through server proxy)
 */

type SchemaElement = {
  tag?: string;
  type?: string | null; // input type
  label?: string | null;
  placeholder?: string | null;
  id?: string | null;
  href?: string | null;
  // you can extend as needed
};

type PageSchema = {
  url: string;
  elements: SchemaElement[];
};

type DOMSchema = PageSchema[];

type LLMAction =
  | { action: "navigate"; url: string }
  | { action: "click"; selector?: Partial<SchemaElement> }
  | { action: "fill"; selector?: Partial<SchemaElement>; value?: string }
  | { action: "multi"; steps: LLMAction[] }
  | { action: "noop" };

export default function VoiceAgent() {
  const router = useRouter();

  // UI/voice state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<string>(""); // status message for UI
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [domSchema, setDomSchema] = useState<DOMSchema | null>(null);
  const recognitionRef = useRef<any>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // load voices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = load;
    load();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // load dom schema from public folder
  useEffect(() => {
    fetch("/dom-schema.json")
      .then((r) => {
        if (!r.ok) throw new Error("dom-schema.json not found in public/");
        return r.json();
      })
      .then((json: DOMSchema) => setDomSchema(json))
      .catch((err) => {
        console.warn("Could not load dom-schema.json:", err.message);
        setDomSchema(null);
      });
  }, []);

  // init speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      console.warn("SpeechRecognition is not available in this browser.");
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (ev: any) => {
      const text = Array.from(ev.results).map((r: any) => r[0].transcript).join("");
      setTranscript(text);
      setStatus("Captured voice: " + text);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
      setStatus("Speech recognition error");
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {}
    };
  }, []);

  // speak helper
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      // pick a female-ish voice if available (optional)
      const female = voices.find((v) => /Zira|Hazel|Aria|Google UK Female|Samantha|Heera/i.test(v.name));
      if (female) u.voice = female;
      utterRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [voices]
  );

  // utility: find current page schema
  const getCurrentPageSchema = useCallback((): PageSchema | null => {
    if (!domSchema) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const full = origin + pathname;
    // try exact match or startsWith
    let page = domSchema.find((p) => p.url === full || p.url === full + "/" || p.url === window.location.href);
    if (!page) {
      page = domSchema.find((p) => p.url.endsWith(pathname));
    }
    return page || null;
  }, [domSchema]);

  // helper to match element in DOM using schema hints
  const findElementFromHint = useCallback((hint: Partial<SchemaElement>): Element | null => {
    // Try id
    if (hint.id) {
      const el = document.getElementById(hint.id);
      if (el) return el;
    }

    // Try href (links)
    if (hint.href) {
      const selector = `a[href$="${hint.href}"], a[href="${hint.href}"]`;
      const el = document.querySelector(selector);
      if (el) return el;
    }

    // Try by input type + placeholder
    if (hint.type) {
      const candidates = Array.from(document.querySelectorAll(`input,textarea,select`));
      const byType = candidates.find((c) => (c.getAttribute("type") || "").toLowerCase() === (hint.type || "").toLowerCase());
      if (byType) return byType;
    }

    // Try by placeholder
    if (hint.placeholder) {
      const el = Array.from(document.querySelectorAll("input,textarea")).find((el) =>
        (el.getAttribute("placeholder") || "").toLowerCase().includes((hint.placeholder || "").toLowerCase())
      );
      if (el) return el || null;
    }

    // Try by label text (button/link text)
    if (hint.label) {
      const text = hint.label.trim().toLowerCase();

      // look for exact text match on buttons and links
      const buttons = Array.from(document.querySelectorAll("button, a")).find((el) =>
        (el.textContent || "").trim().toLowerCase() === text
      );
      if (buttons) return buttons;

      // partial match
      const partial = Array.from(document.querySelectorAll("button, a")).find((el) =>
        (el.textContent || "").trim().toLowerCase().includes(text)
      );
      if (partial) return partial;
    }

    // last resort: generic selectors from hint properties
    // if tag present, try tag + label match
    if (hint.tag) {
      const els = Array.from(document.querySelectorAll(hint.tag));
      if (hint.label) {
        const match = els.find((el) => (el.textContent || "").toLowerCase().includes((hint.label || "").toLowerCase()));
        if (match) return match;
      }
      if (els.length) return els[0];
    }

    return null;
  }, []);

  // execute a single LLMAction safely
  const executeAction = useCallback(
    async (act: LLMAction) => {
      if (!act) return;
      if (act.action === "noop") return;

      if (act.action === "navigate" && (act as any).url) {
        const url = (act as any).url;
        // allow both absolute and relative
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          // next/router push is client-side navigation
          try {
            router.push(url);
          } catch {
            window.location.href = url;
          }
        }
        setStatus(`Navigating to ${url}`);
        speak(`Navigating to ${url}`);
        return;
      }

      if (act.action === "click") {
        const sel = act.selector || {};
        const el = findElementFromHint(sel);
        if (!el) {
          setStatus("Could not find element to click");
          speak("I couldn't find the element to click");
          return;
        }
        (el as HTMLElement).click();
        setStatus("Clicked element");
        speak("Clicked");
        return;
      }

      if (act.action === "fill") {
        const sel = act.selector || {};
        const val = act.value ?? "";
        const el = findElementFromHint(sel) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        if (!el) {
          setStatus("Could not find field to fill");
          speak("I couldn't find the field to fill");
          return;
        }
        if ("value" in el) {
          (el as any).value = val;
          // dispatch input events so React/other frameworks respond
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
          setStatus(`Filled field with ${val}`);
          speak(`Filled the field with ${val}`);
        } else {
          setStatus("Target is not fillable");
          speak("Target is not fillable");
        }
        return;
      }

      if (act.action === "multi" && Array.isArray((act as any).steps)) {
        for (const s of (act as any).steps) {
          // small delay between steps
          // eslint-disable-next-line no-await-in-loop
          await executeAction(s as LLMAction);
          await new Promise((res) => setTimeout(res, 200));
        }
      }
    },
    [findElementFromHint, router, speak]
  );

  // build safe prompt for LLM
  const buildPrompt = useCallback((text: string, pageSchema: PageSchema | null) => {
    const shortSchema = pageSchema
      ? {
          url: pageSchema.url,
          elements: pageSchema.elements.map((el) => ({
            tag: el.tag || null,
            type: el.type || null,
            label: el.label || el.text || el.placeholder || null,
            id: el.id || null,
            href: el.href || null,
          })),
        }
      : { url: window.location.href, elements: [] };

    const prompt = `You are a safe web automation assistant. Input: a user voice command. You are given a compact structured schema of the CURRENT PAGE (only elements relevant to automation). Schema:\n${JSON.stringify(
      shortSchema,
      null,
      2
    )}\n\nUser command: "${text}"\n\nReturn ONLY JSON describing the action the browser should take. Allowed actions: navigate (url), click (selector hint), fill (selector hint + value), or multi (steps array). Example outputs:\n{"action":"navigate","url":"/login"}\n{"action":"click","selector":{"label":"Login","tag":"button"}}\n{"action":"fill","selector":{"placeholder":"Email","tag":"input","type":"email"},"value":"john@example.com"}\n{"action":"multi","steps":[{\"action\":\"fill\",\"selector\":{\"placeholder\":\"Email\"},\"value\":\"a@b.com\"},{\"action\":\"click\",\"selector\":{\"label\":\"Login\"}}]\n\nDo NOT output any other text. The selector fields are hints (label, id, tag, type, placeholder, href). Keep output minimal JSON.`;
    return prompt;
  }, []);

  // call Groq endpoint
  const callGroq = useCallback(
    async (userText: string, pageSchema: PageSchema | null): Promise<LLMAction | null> => {
      const key = "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";
      if (!key) {
        setStatus("Missing Groq API key (NEXT_PUBLIC_GROQ_API_KEY).");
        return null;
      }

      const prompt = buildPrompt(userText, pageSchema);

      try {
        setStatus("Calling LLM...");
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b", // change if you prefer other model
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 800,
          }),
        });
        const data = await res.json();
        // find assistant content - adapt to Groq's response format
        const raw = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? null;
        if (!raw) {
          setStatus("LLM returned no content");
          return null;
        }
        // attempt to parse JSON out of the text
        let jsonText = raw;
        // Sometimes LLMs wrap JSON in ``` or extra text. try to extract the first {...}
        const firstBrace = jsonText.indexOf("{");
        const lastBrace = jsonText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = jsonText.slice(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonText) as LLMAction;
        return parsed;
      } catch (err) {
        console.error("Groq/parse error:", err);
        setStatus("Error calling LLM or parsing response");
        return null;
      }
    },
    [buildPrompt]
  );

  // submit handler (triggered after we stop listening or press send)
  const handleSubmit = useCallback(
    async (text?: string) => {
      const cmd = (text ?? transcript).trim();
      if (!cmd) {
        setStatus("No command to send");
        return;
      }
      setStatus("Processing command: " + cmd);
      // get schema for current page
      const page = getCurrentPageSchema();
      const llmAction = await callGroq(cmd, page);

      if (!llmAction) {
        setStatus("No action returned");
        speak("I couldn't understand the command");
        return;
      }

      setStatus("Executing action...");
      await executeAction(llmAction);
      setStatus("Action executed");
    },
    [transcript, callGroq, executeAction, getCurrentPageSchema, speak]
  );

  // toggle listening
  const toggleListen = () => {
    if (!recognitionRef.current) {
      setStatus("Speech recognition not available");
      return;
    }
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript("");
      setIsListening(true);
      setStatus("Listening...");
      recognitionRef.current.start();
    }
  };

  // automatically call handleSubmit when recognition stops and transcript exists
  useEffect(() => {
    if (!isListening && transcript) {
      // small delay to let UI update
      const t = setTimeout(() => {
        handleSubmit(transcript);
      }, 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      <div
        className="w-14 h-14 rounded-full overflow-hidden cursor-pointer shadow-2xl hover:shadow-xl transition-all"
        onClick={() => setIsOpen((s) => !s)}
        role="button"
      >
        <img src="/aiassistant.png" alt="Assistant" className="w-full h-full object-cover" />
      </div>

      {/* Panel */}
      {isOpen && (
        <div className="w-96 bg-white rounded-2xl shadow-2xl overflow-hidden absolute bottom-20 right-0 border border-gray-200 z-50">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Voice Agent</span>
            </div>
            <button className="p-1" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <div className="text-sm text-gray-600">Status: {status || "idle"}</div>

            <div className="bg-gray-50 p-2 rounded-md min-h-[60px]">
              <div className="text-sm text-gray-800 break-words">{transcript || "Say something or press the mic"}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleListen}
                className={`p-3 rounded-full ${isListening ? "bg-red-500 text-white" : "bg-gray-200"}`}
                title="Toggle voice"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleSubmit()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Execute
              </button>

              <button
                onClick={() => {
                  setTranscript("");
                  setStatus("");
                }}
                className="px-3 py-2 rounded-md border border-gray-200"
              >
                Clear
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Schema loaded: {domSchema ? `${domSchema.length} pages` : "not loaded"}.
            </div>

            <div className="text-xs text-gray-400 pt-2">
              Tip: Try commands like "Go to login", "Fill email with john at example dot com", "Click Login".
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
