# Medetect: An AI-Powered Medical Assistance System

This document provides a detailed overview of the website flow for the Medetect project. The flow describes the user interaction from signing up or logging in to generating a medical report and displaying nearby hospitals and contacts.

---

## 1. User Sign-Up / Login

The entry point for all users is the **Sign-Up / Login** page.

- **Existing Users:** Log in using their credentials to access the dashboard.
- **New Users:** Must sign up and provide personal details.

---

## 2. First-Time User Check

After login/sign-up, the system checks if the user is logging in for the first time.

- **If Yes (First-Time User):**  
  The user is redirected to enter their personal and medical details.

- **If No (Returning User):**  
  The user is directed to the dashboard to upload photos for processing.

---

## 3. Enter User Details (For First-Time Users)

First-time users are required to fill in their details, which will be stored for generating reports.

- **Name**
- **Age**
- **Blood Group**
- **Emergency Contact Number**
- **Family Doctor Contact**
- **Hospital Name**
- **Hospital Contact (if any)**

---

## 4. Dashboard & Image Upload

Once on the **Dashboard**, users can:

- Upload the **photos to be processed**.
- The photos are passed to the roboflow model (Vision Transformer architecture) for prediction and analysis.

---

## 5. Prediction & Result (JSON)

The uploaded images are processed by the ViT model:

- The model returns:
  - **Predicted Class/Condition**
  - **Confidence Level**
- The results are returned in **JSON format**.

---

## 6. Medical Report Generation (PDF)

Using the predictions:

- A **Medical Report** is automatically generated.
- The report is compiled as a **PDF** file for easy access and sharing.

---

## 7. Display Nearby Hospitals and Contacts

After generating the report:

- The system displays a **map** with:
  - **Nearby hospitals**
  - **Emergency contacts**
  
This assists users in taking immediate action if required.

---
## *Additional Feature*
## Medibot - Your 24/7 virtual assistant.
The website also features our chatbot - 'Medibot', trained on our custom data.
Medibot features - 
- Multi-lingual language support with over 50+ languages.
- Voice command features (Voice-to-text)
- Answer provided in regional scripts and dialects.


## Website Flow Summary

<img width="3103" height="1821" alt="image" src="https://github.com/user-attachments/assets/ee3085e7-ea83-47da-8898-8e52882f10ae" />



