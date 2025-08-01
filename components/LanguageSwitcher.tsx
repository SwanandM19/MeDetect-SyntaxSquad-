"use client"

import { useState, useEffect, useRef } from "react"
import { Globe } from "lucide-react"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
]

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    window.googleTranslateElementInit = () => {
      ;new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: languages.map((lang) => lang.code).join(",") },
        "google_translate_element",
      )
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.body.removeChild(script)
      delete (window as any).googleTranslateElementInit
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const changeLanguage = (languageCode: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement
    if (select) {
      select.value = languageCode
      select.dispatchEvent(new Event("change"))
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50" ref={dropdownRef}>
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-48 max-h-60 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <div id="google_translate_element" className="hidden" />
    </div>
  )
}

