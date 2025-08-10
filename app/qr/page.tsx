"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

type DiagnosisPayload = {
    patient_id?: string;
    name?: string;
    date?: string;
    condition?: string;
    severity?: string;
    treatment?: string;
    notes?: string;
};

export default function PhcQrGenerator({
    initialPayload,
}: {
    initialPayload?: DiagnosisPayload;
}) {
    const defaultPayload: DiagnosisPayload = initialPayload ?? {
        patient_id: "anon-12345",
        name: "Radha Devi",
        date: new Date().toISOString().slice(0, 10),
        condition: "Mild Psoriasis",
        severity: "mild",
        treatment: "Topical steroid cream (apply twice daily)",
        notes: "Avoid hot water; follow up in 2 weeks",
    };

    const [payload, setPayload] = useState<DiagnosisPayload>(defaultPayload);
    const [jsonText, setJsonText] = useState<string>(JSON.stringify(defaultPayload));
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
        setJsonText(JSON.stringify(payload));
    }, [payload]);

    useEffect(() => {
        let mounted = true;
        async function gen() {
            try {
                const url = await QRCode.toDataURL(jsonText, {
                    errorCorrectionLevel: "M",
                    margin: 1,
                    scale: 6,
                });
                if (mounted) setQrDataUrl(url);
            } catch (err) {
                console.error("QR generation error", err);
                setQrDataUrl(null);
            }
        }
        gen();
        return () => {
            mounted = false;
        };
    }, [jsonText]);

    const downloadQr = () => {
        if (!qrDataUrl) return;
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = "phc_qr.png";
        a.click();
    };

    const shareQr = async () => {
        if (!qrDataUrl) return;
        const res = await fetch(qrDataUrl);
        const blob = await res.blob();
        const file = new File([blob], "phc_qr.png", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: "PHC QR",
                text: "PHC (Personal Health Code) QR with recent diagnosis",
            });
        } else {
            window.open(qrDataUrl, "_blank");
        }
    };

    const copyJson = async () => {
        await navigator.clipboard.writeText(jsonText);
        alert("JSON copied to clipboard");
    };

    /** ✅ NEW: Print-friendly health card */
    const printHealthCard = () => {
        if (!qrDataUrl) return;
        const newWin = window.open("", "_blank");
        if (!newWin) return;

        newWin.document.write(`
      <html>
      <head>
        <title>Personal Health Card</title>
        <style>
          @page { size: A6; margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 10px;
          }
          h2 { font-size: 1.1rem; margin-bottom: 4px; }
          .qr { margin: 10px 0; }
          .field { font-size: 0.9rem; margin: 3px 0; }
          .notes {
            font-size: 0.8rem;
            margin-top: 8px;
            border-top: 1px dashed #ccc;
            padding-top: 6px;
          }
        </style>
      </head>
      <body>
        <h2>Personal Health Code</h2>
        <div class="field"><strong>Name:</strong> ${payload.name || "N/A"}</div>
        <div class="field"><strong>Condition:</strong> ${payload.condition || "N/A"}</div>
        <div class="field"><strong>Severity:</strong> ${payload.severity || "N/A"}</div>
        <div class="field"><strong>Date:</strong> ${payload.date || "N/A"}</div>
        <div class="qr">
          <img src="${qrDataUrl}" width="150" height="150"/>
        </div>
        <div class="notes"><strong>Treatment:</strong> ${payload.treatment || ""}</div>
      </body>
      </html>
    `);
        newWin.document.close();
        newWin.print();
    };

    const handleChange = (key: keyof DiagnosisPayload, value: string) => {
        setPayload((p) => ({ ...p, [key]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-semibold mb-3">PHC QR Generator (plain JSON)</h2>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="block text-sm">
                        Name
                        <input
                            value={payload.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </label>
                    <label className="block text-sm">
                        Condition
                        <input
                            value={payload.condition || ""}
                            onChange={(e) => handleChange("condition", e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </label>
                    <label className="block text-sm">
                        Severity
                        <input
                            value={payload.severity || ""}
                            onChange={(e) => handleChange("severity", e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </label>
                    <label className="block text-sm">
                        Treatment
                        <textarea
                            value={payload.treatment || ""}
                            onChange={(e) => handleChange("treatment", e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                            rows={3}
                        />
                    </label>
                    <label className="block text-sm">
                        Date
                        <input
                            type="date"
                            value={payload.date || ""}
                            onChange={(e) => handleChange("date", e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </label>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={downloadQr} className="px-3 py-2 bg-blue-600 text-white rounded">
                            Download QR
                        </button>
                        <button onClick={shareQr} className="px-3 py-2 bg-green-600 text-white rounded">
                            Share QR
                        </button>
                        <button onClick={copyJson} className="px-3 py-2 border rounded">
                            Copy JSON
                        </button>
                        <button onClick={printHealthCard} className="px-3 py-2 bg-purple-600 text-white rounded">
                            Print Card
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded shadow mb-3">
                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="PHC QR" className="w-60 h-60 object-contain" />
                        ) : (
                            <div className="w-60 h-60 flex items-center justify-center bg-gray-100">
                                Generating...
                            </div>
                        )}
                    </div>
                    <textarea
                        readOnly
                        value={jsonText}
                        rows={6}
                        className="w-full p-2 border rounded font-mono text-xs"
                    />
                </div>
            </div>
        </div>
    );
}
