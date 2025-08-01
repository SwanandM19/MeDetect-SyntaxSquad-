# Medetect: An AI-Powered Medical Assistance System

This project is an AI-driven medical assistance system that supports both **smartphones** and **basic phones**. It enables users to collect symptoms, get AI-powered diagnoses, generate medical reports, receive emergency assistance, and access hospital information. The system supports **offline and online modes**, **multilingual voice assistance**, and **secure report sharing**.

---

## Overview

The project is designed to:

1. Allow users to interact with the system through a **mobile app** or **SMS for basic phones**.
2. Collect **symptom data** via camera input or SMS-based Q&A.
3. Perform **AI-based medical inference** both offline (on-device) and online (backend server).
4. Generate and securely share **medical reports**.
5. Provide **emergency support** and **temporary care guidance**.
6. Sync data with the backend when online and cache locally when offline.

---

## System Flow

The process flow of the system is as follows:

1. **Device Detection**
   - Detect whether the user is using a **smartphone** or **basic phone**.

2. **Language Selection**
   - Smartphone: i18next / Flutter Intl
   - Basic Phone: SMS-based selection

3. **Input Collection**
   - Smartphone: Camera API for image capture
   - Basic Phone: SMS Q&A Session (Twilio)

4. **Mode Detection (Offline or Online)**
   - **Offline Mode:** 
     - On-device AI Model Inference using Tensorflow/Keras model.
   - **Online Mode:** 
     - Secure Image using Roboflow (ViT) model via HTTPS requests.

5. **Symptom Q&A Interaction**
   - SMS Chatbot with NLP backend for user interaction.
   - Botpress custom chatbot integration for website.

6. **Diagnosis Refinement**
   - Combine AI results with Q&A responses for final analysis.

7. **Medical Report Generation**
   - Generate PDF Reports using ReportLab / pdf-lib
   - Encrypt Reports using libsodium / OpenSSL for E2EE

8. **Report Handling and Sharing**
   - Show report to user on smartphone
   - Send summary report via SMS for basic phones
   - Share report with nearby hospitals (HTTPS + E2EE)
   - Send hospital information via SMS

9. **Emergency Support**
   - Locate nearby hospitals using Google Maps API & Geolocation
   - Emergency call button for direct calls
   - Temporary offline text/voice care guidance

10. **Data Management**
    - **Online Mode:** Sync data with backend (REST API / Firebase)
    - **Offline Mode:** Cache data locally (SQLite / Hive / PouchDB)

11. **Voice Assistance**
    - Multilingual voice assistance using Google, Mozilla, Vosk TTS

12. **Monitoring and Logging**
    - Error and usage analytics using Sentry, ELK, and other monitoring tools

---

## Technologies Used

- **Frontend:** Flutter (Mobile)
- **Backend:** Flask / FastAPI
- **Databases:** SQLite, Hive, PouchDB, MongoDB
- **AI/ML:** Tensorflow, Keras, Roboflow
- **Chatbot:** Botpress / Ollama
- **NLP:** SMS Chatbot with NLP Backend
- **APIs:** Google Maps API, Twilio
- **Security:** libsodium, OpenSSL
- **Monitoring:** Sentry, ELK Stack
- **Reporting:** ReportLab, pdf-lib

---

## Project Flow Diagram
<img width="1974" height="423" alt="image" src="https://github.com/user-attachments/assets/c9448e01-7ba5-4e80-9333-8c977fafb096" />

