"use client"
import React, { useState, useEffect } from 'react';
import { Upload, Loader, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';

const GoogleDriveUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });
  const [serverUrl, setServerUrl] = useState('https://localhost:5000');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await fetch('/report.json');
      if (!response.ok) throw new Error('Failed to load report');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      setResult({
        type: 'error',
        message: 'Failed to load report data. Make sure report.json exists in the public folder.'
      });
    }
  };

  const checkAuthStatus = async () => {
    try {
      let response;
      try {
        response = await fetch(`${serverUrl}/auth/status`, { credentials: 'include' });
      } catch (httpsError) {
        setServerUrl('http://localhost:5000');
        response = await fetch('http://localhost:5000/auth/status', { credentials: 'include' });
      }
      
      const data = await response.json();
      setAuthStatus({ ...data, loading: false });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({ authenticated: false, loading: false });
    }
  };

  const startGoogleAuth = async () => {
    try {
      setResult({ type: 'info', message: 'Starting Google authentication...' });
      
      const response = await fetch(`${serverUrl}/auth/google`, { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        setResult({ type: 'info', message: 'Opening Google authorization...' });
        const authWindow = window.open(data.auth_url, 'google-auth', 'width=500,height=600');
        
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            checkAuthStatus();
          }
        }, 1000);
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to start authentication'
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setResult({
        type: 'error',
        message: 'Failed to start authentication. Make sure Flask server is running.'
      });
    }
  };

  const generateQRCode = (url) => {
    // Using QR Server API to generate QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&format=png&bgcolor=FFFFFF&color=000000&qzone=2&margin=10`;
    return qrApiUrl;
  };
//     try {
//       await fetch(`${serverUrl}/logout`, { credentials: 'include' });
//       setAuthStatus({ authenticated: false, loading: false });
//       setResult({ type: 'info', message: 'Logged out successfully' });
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

  const generatePdfHtml = () => {
    if (!reportData || !reportData.report) return '';
    
    const { report, session_summary } = reportData;
    
    // Helper functions
    const renderList = (items) => items.map((item, index) => 
      `<li class="list-item">${item}</li>`
    ).join('');
    
    const renderObject = (obj, excludeKeys = []) => Object.entries(obj)
      .filter(([key]) => !excludeKeys.includes(key))
      .map(([key, value]) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') value = value ? 'Yes' : 'No';
        if (Array.isArray(value) && value.length === 0) value = 'None';
        
        // Format key name
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        // Handle long text values - especially for session summary
        let displayValue = value;
        if (typeof value === 'string' && value.length > 50) {
          // For very long strings, add word breaks
          displayValue = value.replace(/,/g, ', ').replace(/_/g, '_<wbr>');
        }
        
        return `
          <div class="info-row">
            <span class="info-label">${formattedKey}:</span>
            <span class="info-value">${displayValue}</span>
          </div>
        `;
      }).join('');

    const renderRecommendations = (recs) => recs.map(rec => `
      <div class="recommendation priority-${rec.priority.toLowerCase()}">
        <div class="rec-header">
          <span class="rec-type">${getPriorityIcon(rec.priority)} ${rec.type.toUpperCase()}</span>
          <span class="rec-priority priority-${rec.priority.toLowerCase()}">${rec.priority.toUpperCase()}</span>
        </div>
        <div class="rec-text">${rec.text}</div>
      </div>
    `).join('');

    const renderAffectedAreas = (areas) => areas.map(area => `
      <div class="affected-area-card">
        <div class="area-header">
          <h4>${area.name || area.bodyPart}</h4>
        </div>
        <div class="area-details">
          ${renderObject(area, ['id', 'images', 'name', 'bodyPart'])}
        </div>
      </div>
    `).join('');

    const getPriorityIcon = (priority) => {
      switch(priority.toLowerCase()) {
        case 'critical': return '⚠';
        case 'high': return '◉';
        case 'medium': return '◐';
        default: return '○';
      }
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Medical Report - ${report.patient.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.4;
              color: #2c3e50;
              background: white;
              font-size: 12px;
            }

            .report-container {
              width: 100%;
              margin: 0;
              background: white;
            }

            /* Header */
            .header {
              background: #34495e;
              color: white;
              padding: 20px;
              text-align: center;
              border-bottom: 4px solid #3498db;
            }

            .header h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }

            .header-subtitle {
              font-size: 14px;
              margin-bottom: 15px;
              opacity: 0.9;
            }

            .header-meta {
              display: flex;
              justify-content: space-around;
              margin-top: 15px;
            }

            .header-meta-item {
              text-align: center;
            }

            .header-meta-label {
              font-size: 10px;
              opacity: 0.8;
              display: block;
            }

            .header-meta-value {
              font-size: 12px;
              font-weight: bold;
              margin-top: 2px;
            }

            /* Patient Overview - Two Column Layout */
            .patient-overview {
              padding: 20px;
              background: #ecf0f1;
              border-bottom: 3px solid #3498db;
            }

            .patient-overview h2 {
              font-size: 18px;
              margin-bottom: 15px;
              color: #2c3e50;
              text-align: center;
              border-bottom: 2px solid #3498db;
              padding-bottom: 8px;
            }

            .two-column {
              display: flex;
              gap: 20px;
            }

            .left-column, .right-column {
              flex: 1;
            }

            .patient-card {
              background: white;
              border: 1px solid #bdc3c7;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 15px;
              border-left: 4px solid #3498db;
            }

            .patient-card h3 {
              font-size: 14px;
              margin-bottom: 8px;
              color: #34495e;
              font-weight: bold;
            }

            .patient-card-value {
              font-size: 13px;
              color: #2c3e50;
              font-weight: 600;
            }

            .patient-card-subtitle {
              font-size: 11px;
              color: #7f8c8d;
              margin-top: 5px;
            }

            /* Main Content - Two Column Layout */
            .main-content {
              display: flex;
              gap: 20px;
              padding: 20px;
            }

            .content-left {
              flex: 1.2;
            }

            .content-right {
              flex: 0.8;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }

            /* Section Styles */
            .section {
              margin-bottom: 25px;
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              overflow: hidden;
            }

            .section-header {
              background: #34495e;
              color: white;
              padding: 12px 15px;
              font-size: 14px;
              font-weight: bold;
            }

            .section-content {
              padding: 15px;
            }

            /* Info Rows */
            .info-row {
              display: flex;
              flex-direction: column;
              padding: 8px 0;
              border-bottom: 1px solid #ecf0f1;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }

            .info-row:last-child {
              border-bottom: none;
            }

            .info-label {
              font-weight: bold;
              color: #34495e;
              font-size: 11px;
              margin-bottom: 2px;
            }

            .info-value {
              color: #2c3e50;
              font-size: 10px;
              line-height: 1.3;
              word-wrap: break-word;
              overflow-wrap: break-word;
              hyphens: auto;
            }

            /* Lists */
            .symptom-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-top: 10px;
            }

            .list-item {
              background: #e8f4f8;
              padding: 8px 12px;
              border-radius: 4px;
              border-left: 3px solid #3498db;
              list-style: none;
              font-size: 11px;
            }

            /* Recommendations */
            .recommendation {
              margin-bottom: 10px;
              border-radius: 6px;
              overflow: hidden;
              border: 1px solid #dee2e6;
              background: white;
            }

            .rec-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 12px;
              background: #2c3e50;
              color: white;
              font-size: 10px;
            }

            .rec-type {
              font-weight: bold;
              font-size: 10px;
            }

            .rec-priority {
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 9px;
              font-weight: bold;
            }

            .priority-critical .rec-priority {
              background: #e74c3c;
              color: white;
            }

            .priority-high .rec-priority {
              background: #f39c12;
              color: white;
            }

            .priority-medium .rec-priority {
              background: #3498db;
              color: white;
            }

            .priority-low .rec-priority {
              background: #27ae60;
              color: white;
            }

            .rec-text {
              padding: 10px 12px;
              background: white;
              font-size: 10px;
              line-height: 1.4;
              border-top: 1px solid #dee2e6;
            }

            /* Affected Areas */
            .affected-area-card {
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              margin-bottom: 10px;
              overflow: hidden;
            }

            .area-header {
              background: #34495e;
              color: white;
              padding: 8px 12px;
              font-size: 12px;
            }

            .area-header h4 {
              font-size: 12px;
              font-weight: bold;
            }

            .area-details {
              padding: 10px 12px;
            }

            /* Treatment Plan */
            .treatment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 10px;
            }

            .treatment-section {
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 12px;
            }

            .treatment-section h4 {
              color: #34495e;
              font-size: 12px;
              margin-bottom: 8px;
              padding-bottom: 5px;
              border-bottom: 2px solid #3498db;
              font-weight: bold;
            }

            /* Right Column Specific Styles */
            .summary-card {
              background: white;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 15px;
            }

            .summary-card h3 {
              font-size: 13px;
              color: #34495e;
              margin-bottom: 8px;
              padding-bottom: 5px;
              border-bottom: 1px solid #dee2e6;
              font-weight: bold;
            }

            .key-info {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 15px;
            }

            .key-info h3 {
              font-size: 13px;
              color: #856404;
              margin-bottom: 8px;
              font-weight: bold;
            }

            .emergency-info {
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 15px;
            }

            .emergency-info h3 {
              font-size: 13px;
              color: #721c24;
              margin-bottom: 8px;
              font-weight: bold;
            }

            /* Footer */
            .footer {
              background: #34495e;
              color: white;
              padding: 15px 20px;
              text-align: center;
              margin-top: 30px;
            }

            .footer-grid {
              display: flex;
              justify-content: space-around;
              margin-bottom: 15px;
            }

            .footer-section {
              text-align: center;
            }

            .footer-section h4 {
              font-size: 12px;
              margin-bottom: 5px;
              font-weight: bold;
            }

            .footer-section p {
              font-size: 10px;
              opacity: 0.9;
            }

            .disclaimer {
              font-size: 9px;
              opacity: 0.8;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.2);
            }

            /* Diagnostic Tests Grid */
            .tests-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
              margin-top: 10px;
            }

            .test-item {
              background: #e8f4f8;
              padding: 8px;
              border-radius: 4px;
              border-left: 3px solid #3498db;
              font-size: 10px;
              text-align: center;
            }

            /* Vital Signs Table */
            .vitals-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            .vitals-table th,
            .vitals-table td {
              border: 1px solid #dee2e6;
              padding: 6px 8px;
              text-align: left;
              font-size: 10px;
            }

            .vitals-table th {
              background: #f8f9fa;
              font-weight: bold;
            }

            /* Session Summary Specific Styles */
            .session-summary {
              max-height: 200px;
              overflow-y: auto;
            }

            .session-item {
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 1px solid #f0f0f0;
            }

            .session-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }

            .session-label {
              font-weight: bold;
              color: #34495e;
              font-size: 10px;
              margin-bottom: 2px;
            }

            .session-value {
              color: #2c3e50;
              font-size: 9px;
              line-height: 1.4;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: pre-wrap;
            }

            /* Utility Classes */
            .text-center { text-align: center; }
            .mb-10 { margin-bottom: 10px; }
            .mb-15 { margin-bottom: 15px; }
            .font-bold { font-weight: bold; }
            .text-small { font-size: 10px; }

            @media print {
              body { background: white; }
              .report-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Header -->
            <div class="header">
              <h1>COMPREHENSIVE MEDICAL REPORT</h1>
              <div class="header-subtitle">Digital Health Assessment & Clinical Documentation</div>
              <div class="header-meta">
                <div class="header-meta-item">
                  <span class="header-meta-label">Report Generated</span>
                  <span class="header-meta-value">${report.patient.dateOfReport}</span>
                </div>
                <div class="header-meta-item">
                  <span class="header-meta-label">Submitted By</span>
                  <span class="header-meta-value">${report.patient.submittedBy}</span>
                </div>
                <div class="header-meta-item">
                  <span class="header-meta-label">Patient ID</span>
                  <span class="header-meta-value">${report.patient.id}</span>
                </div>
              </div>
            </div>

            <!-- Patient Overview -->
            <div class="patient-overview">
              <h2>👤 PATIENT OVERVIEW</h2>
              <div class="two-column">
                <div class="left-column">
                  <div class="patient-card">
                    <h3>Personal Information</h3>
                    <div class="patient-card-value">${report.patient.name}</div>
                    <div class="patient-card-subtitle">${report.patient.age} years • ${report.patient.gender}</div>
                  </div>
                  <div class="patient-card">
                    <h3>Contact Details</h3>
                    <div class="patient-card-value">${report.patient.contactNumber}</div>
                    <div class="patient-card-subtitle">Emergency: ${report.patient.emergencyContact}</div>
                  </div>
                </div>
                <div class="right-column">
                  <div class="patient-card">
                    <h3>Chief Complaint</h3>
                    <div class="patient-card-value">${report.consultation.chiefComplaint}</div>
                  </div>
                  <div class="patient-card">
                    <h3>Report Summary</h3>
                    <div class="patient-card-value">Duration: ${report.consultation.duration}</div>
                    <div class="patient-card-subtitle">Severity: ${report.consultation.severity} • Urgency: ${report.assessment.urgency}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Content with Two Columns -->
            <div class="main-content">
              <!-- Left Column -->
              <div class="content-left">
                <!-- Consultation Details -->
                <div class="section">
                  <div class="section-header">🩺 CONSULTATION DETAILS</div>
                  <div class="section-content">
                    ${renderObject(report.consultation, ['symptoms', 'medicalHistory', 'systemicSymptoms', 'psychologicalImpact', 'chiefComplaint'])}
                    
                    <h4 style="color: #34495e; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold;">🔍 Reported Symptoms</h4>
                    <div class="symptom-grid">
                      ${report.consultation.symptoms.map(symptom => `<div class="list-item">${symptom}</div>`).join('')}
                    </div>

                    <h4 style="color: #34495e; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold;">📋 Medical History</h4>
                    <div class="symptom-grid">
                      ${report.consultation.medicalHistory.map(item => `<div class="list-item">${item}</div>`).join('')}
                    </div>

                    <h4 style="color: #34495e; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold;">🌡️ Systemic Symptoms</h4>
                    ${renderObject(report.consultation.systemicSymptoms)}

                    <h4 style="color: #34495e; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold;">🧠 Psychological Impact</h4>
                    ${renderObject(report.consultation.psychologicalImpact)}
                  </div>
                </div>

                <!-- Physical Findings -->
                <div class="section">
                  <div class="section-header">🔬 PHYSICAL EXAMINATION</div>
                  <div class="section-content">
                    ${renderObject(report.physicalFindings, ['affectedAreas'])}
                    
                    <h4 style="color: #34495e; margin: 15px 0 8px 0; font-size: 12px; font-weight: bold;">🎯 Affected Areas</h4>
                    ${renderAffectedAreas(report.physicalFindings.affectedAreas)}
                  </div>
                </div>

                <!-- Assessment -->
                <div class="section">
                  <div class="section-header">🎯 CLINICAL ASSESSMENT</div>
                  <div class="section-content">
                    ${renderObject(report.assessment, ['differentialDiagnoses', 'riskFactors', 'complications'])}
                    
                    <div class="two-column" style="margin-top: 15px;">
                      <div>
                        <h4 style="color: #34495e; margin-bottom: 8px; font-size: 12px; font-weight: bold;">🔍 Differential Diagnoses</h4>
                        ${report.assessment.differentialDiagnoses.map(item => `<div class="list-item">${item}</div>`).join('')}
                      </div>
                      <div>
                        <h4 style="color: #34495e; margin-bottom: 8px; font-size: 12px; font-weight: bold;">⚠️ Risk Factors</h4>
                        ${report.assessment.riskFactors.map(item => `<div class="list-item">${item}</div>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Treatment Plan -->
                <div class="section">
                  <div class="section-header">💊 TREATMENT PLAN</div>
                  <div class="section-content">
                    <div class="treatment-grid">
                      <div class="treatment-section">
                        <h4>⚡ Immediate Treatment</h4>
                        ${report.treatmentPlan.immediate.map(item => `<div class="list-item">${item}</div>`).join('')}
                      </div>
                      <div class="treatment-section">
                        <h4>📅 Long-term Management</h4>
                        ${report.treatmentPlan.longTerm.map(item => `<div class="list-item">${item}</div>`).join('')}
                      </div>
                    </div>
                    <div style="margin-top: 10px;">
                      <h4 style="color: #34495e; margin-bottom: 8px; font-size: 12px; font-weight: bold;">🌱 Lifestyle Modifications</h4>
                      <div class="symptom-grid">
                        ${report.treatmentPlan.lifestyle.map(item => `<div class="list-item">${item}</div>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="content-right">
                <!-- Key Information -->
                <div class="key-info">
                  <h3>⚕️ Key Medical Information</h3>
                  <div class="info-row">
                    <span class="info-label">Diagnosis:</span>
                    <span class="info-value">${report.assessment.likelyDiagnosis}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Confidence:</span>
                    <span class="info-value">${report.assessment.confidence}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Urgency:</span>
                    <span class="info-value">${report.assessment.urgency}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Referral:</span>
                    <span class="info-value">${report.assessment.referralNeeded ? 'Required' : 'Not Required'}</span>
                  </div>
                </div>

                <!-- Emergency Information -->
                <div class="emergency-info">
                  <h3>🚨 Emergency Contact</h3>
                  <div class="info-row">
                    <span class="info-label">Contact:</span>
                    <span class="info-value">${report.patient.emergencyContact}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Criteria:</span>
                    <span class="info-value">${report.followUp.emergencyCriteria}</span>
                  </div>
                </div>

                <!-- Recommendations -->
                <div class="summary-card">
                  <h3>💡 Clinical Recommendations</h3>
                  <div style="max-height: 300px; overflow-y: auto;">
                    ${report.recommendations.map(rec => `
                      <div class="recommendation priority-${rec.priority.toLowerCase()}" style="margin-bottom: 10px;">
                        <div class="rec-header">
                          <span class="rec-type">${getPriorityIcon(rec.priority)} ${rec.type.toUpperCase()}</span>
                          <span class="rec-priority priority-${rec.priority.toLowerCase()}">${rec.priority.toUpperCase()}</span>
                        </div>
                        <div class="rec-text" style="font-size: 11px; line-height: 1.4;">${rec.text}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Diagnostic Tests -->
                <div class="summary-card">
                  <h3>🧪 Recommended Tests</h3>
                  <div class="tests-grid">
                    ${report.diagnosticTests.recommended.map(test => `<div class="test-item">${test}</div>`).join('')}
                  </div>
                </div>

                <!-- Follow-up Schedule -->
                <div class="summary-card">
                  <h3>📅 Follow-up Schedule</h3>
                  ${renderObject(report.followUp, ['emergencyCriteria'])}
                </div>

                <!-- Session Summary -->
                <div class="summary-card">
                  <h3>📊 Session Summary</h3>
                  <div class="session-summary">
                    ${Object.entries(session_summary)
                      .filter(([key]) => key !== 'session_id')
                      .map(([key, value]) => {
                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');
                        let displayValue = value;
                        
                        // Handle categories_covered specially
                        if (key === 'categories_covered' && typeof value === 'string') {
                          displayValue = value.split(',').map(cat => 
                            cat.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
                          ).join(', ');
                        }
                        
                        return `
                          <div class="session-item">
                            <div class="session-label">${formattedKey}:</div>
                            <div class="session-value">${displayValue}</div>
                          </div>
                        `;
                      }).join('')}
                  </div>
                </div>

                <!-- Complications -->
                <div class="summary-card">
                  <h3>🚨 Potential Complications</h3>
                  ${report.assessment.complications.map(item => `<div class="list-item">${item}</div>`).join('')}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-grid">
                <div class="footer-section">
                  <h4>📞 Patient Contact</h4>
                  <p>${report.patient.contactNumber}</p>
                </div>
                <div class="footer-section">
                  <h4>🆔 Report Information</h4>
                  <p>Patient ID: ${report.patient.id}</p>
                  <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                <div class="footer-section">
                  <h4>⚕️ Medical Disclaimer</h4>
                  <p>This report is for medical professional use only.</p>
                </div>
              </div>
              <div class="disclaimer">
                🏥 Digital Health Platform • Comprehensive Medical Documentation System<br>
                Please consult with a qualified healthcare provider for proper diagnosis and treatment.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const logout = async () => {
    if (!reportData) {
      setResult({
        type: 'error',
        message: 'Report data not loaded yet'
      });
      return;
    }

    setIsUploading(true);
    setResult({ type: 'info', message: 'Generating report...' });

    try {
      const htmlContent = generatePdfHtml();
      const base64Content = btoa(unescape(encodeURIComponent(htmlContent)));
      
      const uploadData = {
        fileName: `Medical_Report_${reportData.report.patient.id}_${new Date().toISOString().split('T')[0]}.pdf`,
        fileContent: base64Content,
        mimeType: 'text/html',
        convertToPdf: true
      };

      const response = await fetch(`${serverUrl}/upload-to-drive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(uploadData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setResult({
          type: 'success',
          message: 'Medical report uploaded successfully to Google Drive!',
          data: {
            fileName: responseData.fileName,
            link: responseData.webViewLink,
            qrCode: generateQRCode(responseData.webViewLink)
          }
        });
      } else {
        setResult({
          type: 'error',
          message: responseData.error || 'Upload failed',
          data: responseData
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error.message || 'Failed to upload report'
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (authStatus.loading) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border">
        <div className="flex items-center justify-center space-x-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Checking authentication status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Medical Report Upload</h2>
      
      <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
        <span className="font-mono">Server: {serverUrl}</span>
      </div>
      
      <div className="space-y-4">
        <div className={`p-3 rounded-lg border-l-4 ${
          authStatus.authenticated ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
        }`}>
          <div className="flex items-center space-x-2">
            {authStatus.authenticated ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span className={`font-medium ${
              authStatus.authenticated ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {authStatus.authenticated 
                ? `✅ Authenticated as ${authStatus.user_name || authStatus.user_email}`
                : '⚠️ Not authenticated'
              }
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {!authStatus.authenticated ? (
            <button
              onClick={startGoogleAuth}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
            >
              <LogIn className="h-4 w-4" />
              <span>Login with Google</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>

        {authStatus.authenticated && reportData && (
          <button
            onClick={logout}
            disabled={isUploading}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
              isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isUploading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading Report...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Generate & Upload Full Report</span>
              </>
            )}
          </button>
        )}

        {result && (
          <div className={`p-4 rounded-lg border-l-4 ${
            result.type === 'success' ? 'border-green-500 bg-green-50' :
            result.type === 'error' ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {result.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : result.type === 'error' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Loader className="h-5 w-5 text-blue-600 animate-spin" />
              )}
              <span className={`font-semibold ${
                result.type === 'success' ? 'text-green-800' :
                result.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {result.message}
              </span>
            </div>
            
            {result.data && (
              <div className="mt-4">
                {result.data.link && (
                  <div className="mb-4">
                    <a 
                      href={result.data.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      📄 View uploaded report in Google Drive
                    </a>
                  </div>
                )}
                
                {result.data.qrCode && (
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      📱 Scan QR Code to Access Report
                    </h4>
                    <div className="flex justify-center mb-3">
                      <img 
                        src={result.data.qrCode} 
                        alt="QR Code for Medical Report"
                        className="border border-gray-300 rounded-lg shadow-sm"
                        style={{width: '200px', height: '200px'}}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Share this QR code with healthcare providers for instant access to the medical report
                    </p>
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      <strong>File:</strong> {result.data.fileName}
                    </div>
                  </div>
                )}
                
                <details className="text-sm mt-3">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    🔧 Technical details
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}

        {reportData && (
          <div className="text-xs text-gray-500">
            <p>Loaded report for: <strong>{reportData.report.patient.name}</strong> (ID: {reportData.report.patient.id})</p>
            <p>Chief complaint: {reportData.report.consultation.chiefComplaint}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveUploader;