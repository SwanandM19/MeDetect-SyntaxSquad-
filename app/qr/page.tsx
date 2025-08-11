// "use client";

// import React, { useEffect, useState } from "react";
// import QRCode from "qrcode";

// type DiagnosisPayload = {
//     patient_id?: string;
//     name?: string;
//     date?: string;
//     condition?: string;
//     severity?: string;
//     treatment?: string;
//     notes?: string;
// };

// export default function PhcQrGenerator({
//     initialPayload,
// }: {
//     initialPayload?: DiagnosisPayload;
// }) {
//     const defaultPayload: DiagnosisPayload = initialPayload ?? {
//         patient_id: "anon-12345",
//         name: "Radha Devi",
//         date: new Date().toISOString().slice(0, 10),
//         condition: "Mild Psoriasis",
//         severity: "mild",
//         treatment: "Topical steroid cream (apply twice daily)",
//         notes: "Avoid hot water; follow up in 2 weeks",
//     };

//     const [payload, setPayload] = useState<DiagnosisPayload>(defaultPayload);
//     const [jsonText, setJsonText] = useState<string>(JSON.stringify(defaultPayload));
//     const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

//     useEffect(() => {
//         setJsonText(JSON.stringify(payload));
//     }, [payload]);

//     useEffect(() => {
//         let mounted = true;
//         async function gen() {
//             try {
//                 const url = await QRCode.toDataURL(jsonText, {
//                     errorCorrectionLevel: "M",
//                     margin: 1,
//                     scale: 6,
//                 });
//                 if (mounted) setQrDataUrl(url);
//             } catch (err) {
//                 console.error("QR generation error", err);
//                 setQrDataUrl(null);
//             }
//         }
//         gen();
//         return () => {
//             mounted = false;
//         };
//     }, [jsonText]);

//     const downloadQr = () => {
//         if (!qrDataUrl) return;
//         const a = document.createElement("a");
//         a.href = qrDataUrl;
//         a.download = "phc_qr.png";
//         a.click();
//     };

//     const shareQr = async () => {
//         if (!qrDataUrl) return;
//         const res = await fetch(qrDataUrl);
//         const blob = await res.blob();
//         const file = new File([blob], "phc_qr.png", { type: blob.type });

//         if (navigator.canShare && navigator.canShare({ files: [file] })) {
//             await navigator.share({
//                 files: [file],
//                 title: "PHC QR",
//                 text: "PHC (Personal Health Code) QR with recent diagnosis",
//             });
//         } else {
//             window.open(qrDataUrl, "_blank");
//         }
//     };

//     const copyJson = async () => {
//         await navigator.clipboard.writeText(jsonText);
//         alert("JSON copied to clipboard");
//     };

//     /** ✅ NEW: Print-friendly health card */
//     const printHealthCard = () => {
//         if (!qrDataUrl) return;
//         const newWin = window.open("", "_blank");
//         if (!newWin) return;

//         newWin.document.write(`
//       <html>
//       <head>
//         <title>Personal Health Card</title>
//         <style>
//           @page { size: A6; margin: 10mm; }
//           body {
//             font-family: Arial, sans-serif;
//             text-align: center;
//             padding: 10px;
//           }
//           h2 { font-size: 1.1rem; margin-bottom: 4px; }
//           .qr { margin: 10px 0; }
//           .field { font-size: 0.9rem; margin: 3px 0; }
//           .notes {
//             font-size: 0.8rem;
//             margin-top: 8px;
//             border-top: 1px dashed #ccc;
//             padding-top: 6px;
//           }
//         </style>
//       </head>
//       <body>
//         <h2>Personal Health Code</h2>
//         <div class="field"><strong>Name:</strong> ${payload.name || "N/A"}</div>
//         <div class="field"><strong>Condition:</strong> ${payload.condition || "N/A"}</div>
//         <div class="field"><strong>Severity:</strong> ${payload.severity || "N/A"}</div>
//         <div class="field"><strong>Date:</strong> ${payload.date || "N/A"}</div>
//         <div class="qr">
//           <img src="${qrDataUrl}" width="150" height="150"/>
//         </div>
//         <div class="notes"><strong>Treatment:</strong> ${payload.treatment || ""}</div>
//       </body>
//       </html>
//     `);
//         newWin.document.close();
//         newWin.print();
//     };

//     const handleChange = (key: keyof DiagnosisPayload, value: string) => {
//         setPayload((p) => ({ ...p, [key]: value }));
//     };

//     return (
//         <div className="max-w-2xl mx-auto p-4">
//             <h2 className="text-xl font-semibold mb-3">PHC QR Generator (plain JSON)</h2>

//             <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-3">
//                     <label className="block text-sm">
//                         Name
//                         <input
//                             value={payload.name || ""}
//                             onChange={(e) => handleChange("name", e.target.value)}
//                             className="w-full mt-1 p-2 border rounded"
//                         />
//                     </label>
//                     <label className="block text-sm">
//                         Condition
//                         <input
//                             value={payload.condition || ""}
//                             onChange={(e) => handleChange("condition", e.target.value)}
//                             className="w-full mt-1 p-2 border rounded"
//                         />
//                     </label>
//                     <label className="block text-sm">
//                         Severity
//                         <input
//                             value={payload.severity || ""}
//                             onChange={(e) => handleChange("severity", e.target.value)}
//                             className="w-full mt-1 p-2 border rounded"
//                         />
//                     </label>
//                     <label className="block text-sm">
//                         Treatment
//                         <textarea
//                             value={payload.treatment || ""}
//                             onChange={(e) => handleChange("treatment", e.target.value)}
//                             className="w-full mt-1 p-2 border rounded"
//                             rows={3}
//                         />
//                     </label>
//                     <label className="block text-sm">
//                         Date
//                         <input
//                             type="date"
//                             value={payload.date || ""}
//                             onChange={(e) => handleChange("date", e.target.value)}
//                             className="w-full mt-1 p-2 border rounded"
//                         />
//                     </label>

//                     <div className="flex flex-wrap gap-2 mt-3">
//                         <button onClick={downloadQr} className="px-3 py-2 bg-blue-600 text-white rounded">
//                             Download QR
//                         </button>
//                         <button onClick={shareQr} className="px-3 py-2 bg-green-600 text-white rounded">
//                             Share QR
//                         </button>
//                         <button onClick={copyJson} className="px-3 py-2 border rounded">
//                             Copy JSON
//                         </button>
//                         <button onClick={printHealthCard} className="px-3 py-2 bg-purple-600 text-white rounded">
//                             Print Card
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex flex-col items-center">
//                     <div className="bg-white p-3 rounded shadow mb-3">
//                         {qrDataUrl ? (
//                             <img src={qrDataUrl} alt="PHC QR" className="w-60 h-60 object-contain" />
//                         ) : (
//                             <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
//                                 Generating...
//                             </div>
//                         )}
//                     </div>
//                     <textarea
//                         readOnly
//                         value={jsonText}
//                         rows={6}
//                         className="w-full p-2 border rounded font-mono text-xs"
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }
"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

type MedicalReport = {
    success: boolean;
    report: {
        patient: {
            id: string;
            name: string;
            age: string;
            gender: string;
            dateOfReport: string;
        };
        assessment: {
            likelyDiagnosis: string;
            confidence: string;
            urgency: string;
        };
        recommendations: {
            type: string;
            text: string;
            priority: string;
        }[];
        treatmentPlan: {
            immediate: string[];
        };
        followUp: {
            nextVisit: string;
        };
    };
};

type QrPayload = {
    patientId: string;
    patientName: string;
    diagnosis: string;
    urgency: string;
    treatment: string;
    followUp: string;
    date: string;
    fullReportUrl?: string;
};

export default function PhcQrGenerator() {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [medicalReport, setMedicalReport] = useState<MedicalReport | null>(null);

    useEffect(() => {
        const fetchMedicalReport = async () => {
            try {
                // In a real app, you would fetch this from your backend or public folder
                // For this example, we'll simulate loading from the public folder
                const response = await fetch('/report.json');
                if (!response.ok) {
                    throw new Error('Failed to load medical report');
                }
                const data = await response.json();
                setMedicalReport(data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading medical report:", err);
                setError("Failed to load medical report");
                setLoading(false);
            }
        };

        fetchMedicalReport();
    }, []);

    useEffect(() => {
        if (!medicalReport) return;

        let mounted = true;

        const generateQrCode = async () => {
            try {
                // Extract the most relevant information for the QR code
                const payload: QrPayload = {
                    patientId: medicalReport.report.patient.id,
                    patientName: medicalReport.report.patient.name,
                    diagnosis: medicalReport.report.assessment.likelyDiagnosis,
                    urgency: medicalReport.report.assessment.urgency,
                    treatment: medicalReport.report.treatmentPlan.immediate.join(", "),
                    followUp: medicalReport.report.followUp.nextVisit,
                    date: medicalReport.report.patient.dateOfReport,
                    // In a real app, this would point to your API endpoint
                    fullReportUrl: `https://medetect.example.com/reports/${medicalReport.report.patient.id}`
                };

                const qrContent = JSON.stringify(payload, null, 2);
                const url = await QRCode.toDataURL(qrContent, {
                    errorCorrectionLevel: "H", // Higher error correction for medical data
                    margin: 1,
                    scale: 6,
                });

                if (mounted) setQrDataUrl(url);
            } catch (err) {
                console.error("QR generation error", err);
                if (mounted) setQrDataUrl(null);
            }
        };

        generateQrCode();

        return () => {
            mounted = false;
        };
    }, [medicalReport]);

    const downloadQr = () => {
        if (!qrDataUrl) return;
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = `medical_qr_${medicalReport?.report.patient.id || ''}.png`;
        a.click();
    };

    const shareQr = async () => {
        if (!qrDataUrl) return;
        const res = await fetch(qrDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `medical_qr_${medicalReport?.report.patient.id || ''}.png`, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: "Medical QR Code",
                text: `Medical information for ${medicalReport?.report.patient.name || 'patient'}`,
            });
        } else {
            window.open(qrDataUrl, "_blank");
        }
    };

    const printHealthCard = () => {
        if (!qrDataUrl || !medicalReport) return;
        const newWin = window.open("", "_blank");
        if (!newWin) return;

        newWin.document.write(`
      <html>
      <head>
        <title>Medical Health Card</title>
        <style>
          @page { size: A6; margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 10px;
          }
          h2 { font-size: 1.1rem; margin-bottom: 4px; }
          .qr { margin: 10px 0; }
          .field { font-size: 0.9rem; margin: 3px 0; text-align: left; }
          .notes {
            font-size: 0.8rem;
            margin-top: 8px;
            border-top: 1px dashed #ccc;
            padding-top: 6px;
            text-align: left;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            background-color: #f0f7ff;
            padding: 5px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>Medical Health Card</h2>
          </div>
          <div class="field"><strong>Patient ID:</strong> ${medicalReport.report.patient.id}</div>
          <div class="field"><strong>Name:</strong> ${medicalReport.report.patient.name}</div>
          <div class="field"><strong>Diagnosis:</strong> ${medicalReport.report.assessment.likelyDiagnosis}</div>
          <div class="field"><strong>Urgency:</strong> ${medicalReport.report.assessment.urgency}</div>
          <div class="qr">
            <img src="${qrDataUrl}" width="150" height="150"/>
          </div>
          <div class="notes">
            <strong>Treatment:</strong> ${medicalReport.report.treatmentPlan.immediate.join(", ")}<br/>
            <strong>Follow-up:</strong> ${medicalReport.report.followUp.nextVisit}<br/>
            <strong>Date:</strong> ${medicalReport.report.patient.dateOfReport}
          </div>
        </div>
      </body>
      </html>
    `);
        newWin.document.close();
        newWin.print();
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center">
                <p>Loading medical report...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    if (!medicalReport) {
        return (
            <div className="max-w-2xl mx-auto p-4 text-center">
                <p>No medical report found</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-3">Medical QR Generator</h2>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium mb-2">Patient Information</h3>
                        <p><strong>Name:</strong> {medicalReport.report.patient.name}</p>
                        <p><strong>ID:</strong> {medicalReport.report.patient.id}</p>
                        <p><strong>Age/Gender:</strong> {medicalReport.report.patient.age}, {medicalReport.report.patient.gender}</p>
                        <p><strong>Report Date:</strong> {medicalReport.report.patient.dateOfReport}</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium mb-2">Diagnosis</h3>
                        <p><strong>Condition:</strong> {medicalReport.report.assessment.likelyDiagnosis}</p>
                        <p><strong>Urgency:</strong> {medicalReport.report.assessment.urgency}</p>
                    </div>

                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium mb-2">Treatment</h3>
                        <ul className="list-disc pl-5">
                            {medicalReport.report.treatmentPlan.immediate.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p className="mt-2"><strong>Follow-up:</strong> {medicalReport.report.followUp.nextVisit}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={downloadQr}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Download QR
                        </button>
                        <button
                            onClick={shareQr}
                            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Share QR
                        </button>
                        <button
                            onClick={printHealthCard}
                            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            Print Card
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded shadow mb-3">
                        {qrDataUrl ? (
                            <img
                                src={qrDataUrl}
                                alt="Medical QR Code"
                                className="w-60 h-60 object-contain"
                            />
                        ) : (
                            <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
                                Generating QR Code...
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 rounded shadow w-full">
                        <h3 className="font-medium mb-2">QR Code Contains:</h3>
                        <div className="bg-gray-50 p-3 rounded font-mono text-xs overflow-auto max-h-60">
                            {medicalReport && (
                                <pre>
                                    {JSON.stringify({
                                        patientId: medicalReport.report.patient.id,
                                        patientName: medicalReport.report.patient.name,
                                        diagnosis: medicalReport.report.assessment.likelyDiagnosis,
                                        urgency: medicalReport.report.assessment.urgency,
                                        treatment: medicalReport.report.treatmentPlan.immediate.join(", "),
                                        followUp: medicalReport.report.followUp.nextVisit,
                                        date: medicalReport.report.patient.dateOfReport
                                    }, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
