"use client";

import { useState, useEffect } from "react";

export default function DoctorScanPage() {
  const [QrScanner, setQrScanner] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Dynamically import qr-scanner only on client
  useEffect(() => {
    import("qr-scanner").then((mod) => setQrScanner(() => mod.default));
  }, []);

  const handleFile = async (file: File) => {
    if (!QrScanner) {
      setError("QR scanner not loaded yet.");
      return;
    }
    try {
      const result = await QrScanner.scanImage(file);
      setPatientData(JSON.parse(result));
      setError(null);
    } catch (err) {
      setError("Failed to read QR code.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Doctor QR Scanner</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="mb-4 border p-2 rounded"
      />

      {error && <p className="text-red-500">{error}</p>}

      {patientData && (
        <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
          {JSON.stringify(patientData, null, 2)}
        </pre>
      )}
    </div>
  );
}
