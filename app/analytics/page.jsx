"use client"
import React, { useState, useEffect } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function MedicalAnalytics() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Using the medical reports data directly (in real app, this would come from your MongoDB)
    const reports = [
        {
            patient: {
                id: "PAT-958884",
                name: "Patient Name",
                age: "Adult",
                gender: "Male",
                dateOfReport: "Saturday, August 09, 2025 at 09:05 PM IST"
            },
            consultation: {
                chiefComplaint: "Cough",
                duration: "<less than 2 weeks>",
                onset: "Gradual",
                progression: "Stable",
                severity: "Mild",
                symptoms: ["Cough", "Fever"],
                medicalHistory: ["Asthma"]
            },
            physicalFindings: {
                vitalSigns: {
                    temperature: "98.6°F",
                    pulse: "72/min",
                    bloodPressure: "120/80 mmHg",
                    respiratoryRate: "16/min"
                }
            },
            assessment: {
                likelyDiagnosis: "Acute bronchitis",
                confidence: "High",
                urgency: "Non-urgent"
            }
        },
        {
            patient: {
                id: "PAT-159563",
                name: "Patient Name",
                age: "Adult",
                gender: "Unknown",
                dateOfReport: "Saturday, August 09, 2025 at 03:40 AM IST"
            },
            consultation: {
                chiefComplaint: "Knee pain",
                duration: "4 days",
                progression: "Increasing",
                severity: "Mild",
                symptoms: ["Knee pain", "Fever", "Fatigue"],
                medicalHistory: ["History of diabetes"]
            },
            physicalFindings: {
                vitalSigns: {
                    temperature: "99.2°F",
                    pulse: "75/min",
                    bloodPressure: "120/80 mmHg",
                    respiratoryRate: "16/min"
                }
            },
            assessment: {
                likelyDiagnosis: "Knee joint inflammation (possible osteoarthritis exacerbation)",
                confidence: "Medium",
                urgency: "Non-urgent"
            }
        },
        {
            patient: {
                id: "PAT-653642",
                name: "Not specified",
                age: 35,
                gender: "Unknown",
                dateOfReport: "Saturday, August 09, 2025 at 09:01 PM IST"
            },
            consultation: {
                chiefComplaint: "Cough",
                duration: "More than 2 weeks",
                onset: "Gradual",
                progression: "Persistent",
                severity: "Mild",
                symptoms: ["Cough", "Phlegm/mucus"],
                medicalHistory: ["Existing medical conditions"]
            },
            physicalFindings: {
                vitalSigns: {
                    temperature: "98.6°F",
                    pulse: "72/min",
                    bloodPressure: "120/80 mmHg",
                    respiratoryRate: "16/min"
                }
            },
            assessment: {
                likelyDiagnosis: "Chronic cough syndrome",
                confidence: "Medium",
                urgency: "Non-urgent"
            }
        }
    ];

    // Analytics calculations
    const getHealthTrends = () => {
        const trends = {
            symptoms: {},
            diagnoses: {},
            severityLevels: { Mild: 0, Moderate: 0, Severe: 0 },
            urgencyLevels: { 'Non-urgent': 0, 'Urgent': 0, 'Emergency': 0 },
            confidenceLevels: { High: 0, Medium: 0, Low: 0 },
            totalPatients: reports.length
        };

        reports.forEach(report => {
            // Count symptoms
            report.consultation.symptoms.forEach(symptom => {
                trends.symptoms[symptom] = (trends.symptoms[symptom] || 0) + 1;
            });

            // Count diagnoses
            const diagnosis = report.assessment.likelyDiagnosis;
            trends.diagnoses[diagnosis] = (trends.diagnoses[diagnosis] || 0) + 1;

            // Count severity levels
            const severity = report.consultation.severity;
            if (severity && trends.severityLevels[severity] !== undefined) {
                trends.severityLevels[severity]++;
            }

            // Count urgency levels
            const urgency = report.assessment.urgency || 'Non-urgent';
            trends.urgencyLevels[urgency] = (trends.urgencyLevels[urgency] || 0) + 1;

            // Count confidence levels
            const confidence = report.assessment.confidence || 'Medium';
            trends.confidenceLevels[confidence] = (trends.confidenceLevels[confidence] || 0) + 1;
        });

        return trends;
    };

    const getVitalSignsTrend = () => {
        return reports.map((report, index) => ({
            report: `Report ${index + 1}`,
            temperature: parseFloat(report.physicalFindings.vitalSigns.temperature) || 98.6,
            pulse: parseInt(report.physicalFindings.vitalSigns.pulse) || 72,
            systolic: parseInt(report.physicalFindings.vitalSigns.bloodPressure?.split('/')[0]) || 120,
            diastolic: parseInt(report.physicalFindings.vitalSigns.bloodPressure?.split('/')[1]) || 80,
            respiratory: parseInt(report.physicalFindings.vitalSigns.respiratoryRate) || 16,
            date: new Date(report.patient.dateOfReport).toLocaleDateString(),
            diagnosis: report.assessment.likelyDiagnosis.substring(0, 20) + '...'
        }));
    };

    const trends = getHealthTrends();
    const vitalsTrend = getVitalSignsTrend();

    // Chart configurations
    const symptomsChartData = {
        labels: Object.keys(trends.symptoms),
        datasets: [{
            label: 'Frequency',
            data: Object.values(trends.symptoms),
            backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'],
            borderRadius: 8,
        }]
    };

    const confidenceChartData = {
        labels: Object.keys(trends.confidenceLevels),
        datasets: [{
            data: Object.values(trends.confidenceLevels),
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderWidth: 3,
            borderColor: '#fff'
        }]
    };

    const vitalsLineData = {
        labels: vitalsTrend.map(v => v.date),
        datasets: [
            {
                label: 'Temperature (°F)',
                data: vitalsTrend.map(v => v.temperature),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#EF4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            },
            {
                label: 'Pulse (bpm)',
                data: vitalsTrend.map(v => v.pulse),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    };

    const bloodPressureData = {
        labels: vitalsTrend.map(v => v.date),
        datasets: [
            {
                label: 'Systolic',
                data: vitalsTrend.map(v => v.systolic),
                backgroundColor: 'rgba(147, 197, 253, 0.8)',
                borderColor: '#93C5FD',
                borderWidth: 2,
                borderRadius: 8,
            },
            {
                label: 'Diastolic',
                data: vitalsTrend.map(v => v.diastolic),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3B82F6',
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                labels: { color: "#fff", font: { size: 12 } },
                position: 'top'
            },
            title: { color: "#fff" }
        },
        scales: {
            x: { 
                ticks: { color: "#fff", font: { size: 10 } }, 
                grid: { color: "rgba(255,255,255,0.1)" } 
            },
            y: { 
                ticks: { color: "#fff", font: { size: 10 } }, 
                grid: { color: "rgba(255,255,255,0.1)" } 
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                labels: { color: "#fff", font: { size: 11 } },
                position: 'bottom'
            }
        }
    };

    // Calculate health score based on various factors
    const calculateHealthScore = () => {
        let score = 100;
        const urgentCases = trends.urgencyLevels['Urgent'] + trends.urgencyLevels['Emergency'];
        const chronicConditions = reports.filter(r => r.consultation.duration.includes('weeks') || r.consultation.progression === 'Persistent').length;
        const feverCases = reports.filter(r => r.consultation.symptoms.includes('Fever')).length;
        
        score -= (urgentCases * 20);
        score -= (chronicConditions * 15);
        score -= (feverCases * 10);
        
        return Math.max(score, 0);
    };

    const healthScore = calculateHealthScore();
    const averageConfidence = reports.reduce((sum, r) => sum + (r.assessment.confidence === 'High' ? 0.9 : r.assessment.confidence === 'Medium' ? 0.7 : 0.5), 0) / reports.length;

    return (
        <div
            className="relative min-h-screen text-white p-6"
            style={{ fontFamily: "'Readex Pro', sans-serif" }}
        >
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <iframe
                    src="https://my.spline.design/particlenebula-Lhnk9Kvv9ioPiRHGvmCTlGEa/"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    className="w-full h-full"
                ></iframe>
            </div>

            {/* Header */}
            <header className="w-full px-6 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl font-bold">📊</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-light">Medical Analytics Dashboard</h1>
                        <p className="text-sm opacity-70">Comprehensive health insights and trends</p>
                    </div>
                </div>

                <div className="relative">
                    <div 
                        className="w-10 h-10 bg-white/20 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/30 transition-all"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span className="text-lg">👤</span>
                    </div>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg w-40 z-10">
                            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-white/20 rounded-t-lg">
                                Export Data
                            </button>
                            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-white/20 rounded-b-lg">
                                Settings
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-sm opacity-80 mb-1">Total Reports</div>
                    <div className="text-3xl font-bold text-blue-300">{reports.length}</div>
                    <div className="text-xs text-green-300 mt-1 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Active monitoring
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-sm opacity-80 mb-1">Health Score</div>
                    <div className="text-3xl font-bold text-green-300">{healthScore}</div>
                    <div className="text-xs text-blue-300 mt-1">
                        {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs attention'}
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-sm opacity-80 mb-1">Avg. Confidence</div>
                    <div className="text-3xl font-bold text-purple-300">{(averageConfidence * 100).toFixed(0)}%</div>
                    <div className="text-xs text-yellow-300 mt-1">Diagnostic accuracy</div>
                </div>
                
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-sm opacity-80 mb-1">Chronic Cases</div>
                    <div className="text-3xl font-bold text-orange-300">
                        {reports.filter(r => r.consultation.duration.includes('weeks')).length}
                    </div>
                    <div className="text-xs text-red-300 mt-1">Requires monitoring</div>
                </div>

                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all">
                    <div className="text-sm opacity-80 mb-1">Avg Temperature</div>
                    <div className="text-3xl font-bold text-red-300">
                        {(vitalsTrend.reduce((sum, v) => sum + v.temperature, 0) / vitalsTrend.length).toFixed(1)}°F
                    </div>
                    <div className="text-xs text-green-300 mt-1">Within normal range</div>
                </div>
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Vital Signs Trend */}
                <div className="col-span-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-4 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
                        Vital Signs Progression
                    </h3>
                    <div className="h-80">
                        <Line data={vitalsLineData} options={chartOptions} />
                    </div>
                </div>

                {/* Diagnostic Confidence */}
                <div className="col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-4 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                        Diagnostic Confidence
                    </h3>
                    <div className="h-80">
                        <Doughnut 
                            data={confidenceChartData} 
                            options={{
                                ...pieOptions,
                                cutout: '70%',
                                plugins: {
                                    ...pieOptions.plugins,
                                    legend: { 
                                        labels: { color: "#fff", font: { size: 11 } },
                                        position: 'bottom'
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>

                {/* Blood Pressure Analysis */}
                <div className="col-span-7 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-4 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-purple-400 rounded-full mr-3"></span>
                        Blood Pressure Tracking
                    </h3>
                    <div className="h-72">
                        <Bar data={bloodPressureData} options={chartOptions} />
                    </div>
                </div>

                {/* Symptom Distribution */}
                <div className="col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-4 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
                        Symptom Analysis
                    </h3>
                    <div className="h-72">
                        <Bar 
                            data={symptomsChartData} 
                            options={{
                                ...chartOptions,
                                indexAxis: 'y',
                            }} 
                        />
                    </div>
                </div>

                {/* Medical Timeline */}
                <div className="col-span-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-6 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-indigo-400 rounded-full mr-3"></span>
                        Medical History Timeline
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {reports.map((report, index) => (
                            <div key={index} className="relative flex items-start space-x-4 p-4 bg-white/5 rounded-lg border-l-4 border-blue-400 hover:bg-white/10 transition-all">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-lg text-blue-200">{report.assessment.likelyDiagnosis}</h4>
                                            <p className="text-sm opacity-80">
                                                <span className="text-yellow-300">Chief Complaint:</span> {report.consultation.chiefComplaint} • 
                                                <span className="text-green-300"> Duration:</span> {report.consultation.duration} • 
                                                <span className="text-orange-300"> Severity:</span> {report.consultation.severity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium opacity-90">
                                                {new Date(report.patient.dateOfReport).toLocaleDateString()}
                                            </div>
                                            <div className={`text-xs px-3 py-1 rounded-full mt-1 ${
                                                report.assessment.confidence === 'High' ? 'bg-green-500/30 text-green-200 border border-green-400/30' :
                                                report.assessment.confidence === 'Medium' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/30' :
                                                'bg-red-500/30 text-red-200 border border-red-400/30'
                                            }`}>
                                                {report.assessment.confidence} Confidence
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs opacity-60 bg-white/5 rounded p-2">
                                        <strong>Symptoms:</strong> {report.consultation.symptoms.join(', ')} | 
                                        <strong> Medical History:</strong> {report.consultation.medicalHistory.join(', ')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Health Insights Panel */}
                <div className="col-span-4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold mb-6 opacity-90 flex items-center">
                        <span className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></span>
                        Health Insights
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-400/30">
                            <h4 className="font-medium mb-2 text-blue-300 flex items-center">
                                🔍 Pattern Analysis
                            </h4>
                            <p className="text-sm opacity-90">
                                {Object.entries(trends.symptoms).sort((a, b) => b[1] - a[1])[0]?.[0]} appears most frequently ({Object.entries(trends.symptoms).sort((a, b) => b[1] - a[1])[0]?.[1]} cases)
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-400/30">
                            <h4 className="font-medium mb-2 text-green-300 flex items-center">
                                ✅ Health Status
                            </h4>
                            <p className="text-sm opacity-90">
                                {trends.urgencyLevels['Non-urgent'] === reports.length ? 
                                    'All conditions are stable and non-urgent' :
                                    `${trends.urgencyLevels['Non-urgent']}/${reports.length} conditions are stable`
                                }
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
                            <h4 className="font-medium mb-2 text-yellow-300 flex items-center">
                                ⚠️ Monitoring Points
                            </h4>
                            <ul className="text-sm space-y-1 opacity-90">
                                <li>• {reports.filter(r => r.consultation.symptoms.includes('Cough')).length} respiratory-related cases</li>
                                <li>• {reports.filter(r => r.consultation.symptoms.includes('Fever')).length} cases with elevated temperature</li>
                                <li>• Average pulse: {Math.round(vitalsTrend.reduce((sum, v) => sum + v.pulse, 0) / vitalsTrend.length)} bpm</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30">
                            <h4 className="font-medium mb-2 text-purple-300 flex items-center">
                                🎯 Recommendations
                            </h4>
                            <ul className="text-sm space-y-1 opacity-90">
                                <li>• Continue regular health monitoring</li>
                                <li>• Focus on respiratory health management</li>
                                <li>• Maintain current medication adherence</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-lg p-4 border border-indigo-400/30">
                            <h4 className="font-medium mb-2 text-indigo-300 flex items-center">
                                📈 Trend Summary
                            </h4>
                            <div className="text-sm space-y-1 opacity-90">
                                <div className="flex justify-between">
                                    <span>Most common:</span>
                                    <span className="text-blue-200">{Object.entries(trends.diagnoses).sort((a, b) => b[1] - a[1])[0]?.[0]?.substring(0, 15)}...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Severity trend:</span>
                                    <span className="text-green-200">Mostly mild cases</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <h4 className="text-lg font-semibold mb-3 opacity-90">Quick Actions</h4>
                    <div className="space-y-3">
                        <button className="w-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-400/30 rounded-lg p-3 text-sm font-medium transition-all">
                            📋 Generate Full Report
                        </button>
                        <button className="w-full bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 rounded-lg p-3 text-sm font-medium transition-all">
                            📊 Export Analytics
                        </button>
                        <button className="w-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 rounded-lg p-3 text-sm font-medium transition-all">
                            🔔 Set Alerts
                        </button>
                        <button className="w-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-400/30 rounded-lg p-3 text-sm font-medium transition-all">
                            📅 Schedule Follow-up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}