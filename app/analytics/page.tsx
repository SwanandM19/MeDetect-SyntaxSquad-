"use client";
import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Bar Chart for Vital Signs
    const barData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Heart Rate (bpm)",
                data: [72, 75, 78, 74, 76, 80, 77],
                backgroundColor: "rgba(59,130,246,0.7)",
                borderRadius: 6,
            },
            {
                label: "Blood Pressure (mmHg)",
                data: [120, 122, 118, 121, 119, 125, 123],
                backgroundColor: "rgba(147,197,253,0.5)",
                borderRadius: 6,
            },
        ],
    };

    // Pie Chart for Symptom Distribution
    const pieData = {
        labels: ["Rash", "Redness", "Itching", "Other"],
        datasets: [
            {
                data: [40, 25, 20, 15],
                backgroundColor: ["#3B82F6", "#60A5FA", "#A78BFA", "#FBBF24"],
            },
        ],
    };

    return (
        <div
            className="relative min-h-screen text-white p-6"
            style={{ fontFamily: "'Readex Pro', sans-serif" }}
        >
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400&display=swap"
                    rel="stylesheet"
                />
            </Head>

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

            {/* Top Bar */}
            <header className="w-full px-6 py-4 border-white/10 flex items-center justify-between mt-[-30px]">
                {/* Logo & Title */}
                <div className="flex items-center space-x-6">
                    <div className="relative w-10 h-10 cursor-pointer">
                        <Link href="/">
                            <Image
                                src="/onlylogo.png"
                                alt="Medetect Logo"
                                fill
                                className="object-contain"
                            />
                        </Link>
                    </div>
                    <h1 className="text-xl font-light">Patient Medical Report</h1>
                </div>

                {/* Center Icons */}
                <nav className="flex items-center space-x-40 opacity-70 ml-[-160px]">
                    <Image src="/icons/home.png" alt="Home" width={24} height={24} />
                    <Image src="/icons/agents.png" alt="Patients" width={24} height={24} />
                    <Image src="/icons/data-analytics.png" alt="Analytics" width={24} height={24} />
                    <Image src="/icons/exit.png" alt="Exit" width={24} height={24} />
                </nav>

                {/* Profile */}
                <div className="relative">
                    <Image
                        src="/icons/profile.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    />
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg w-40 opacity-90">
                            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-white/20">
                                Edit Info
                            </button>
                            <button className="block w-full px-4 py-2 text-left text-sm hover:bg-white/20">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-sm opacity-80">Patient Name</p>
                    <h2 className="text-2xl font-bold">John Doe</h2>
                    <p className="text-xs text-gray-300">Age: 34 | Male</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-sm opacity-80">Current Diagnosis</p>
                    <h2 className="text-2xl font-bold">Eczema</h2>
                    <p className="text-xs text-gray-300">Moderate severity</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-sm opacity-80">Last Test Date</p>
                    <h2 className="text-2xl font-bold">Aug 5, 2025</h2>
                    <p className="text-xs text-gray-300">Next: Aug 20, 2025</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <p className="text-sm opacity-80">Treatment Progress</p>
                    <h2 className="text-2xl font-bold">70%</h2>
                    <p className="text-xs text-gray-300">Improving steadily</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
                {/* Bar Chart */}
                <div className="col-span-2 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <h2 className="text-sm opacity-80 mb-2">Vitals Tracking</h2>
                    <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            plugins: { legend: { labels: { color: "#fff" } } },
                            scales: {
                                x: { ticks: { color: "#fff" } },
                                y: { ticks: { color: "#fff" } },
                            },
                        }}
                    />
                </div>

                {/* Pie Chart */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <h2 className="text-sm opacity-80 mb-2">Symptom Distribution</h2>
                    <Pie
                        data={pieData}
                        options={{
                            plugins: { legend: { labels: { color: "#fff" } } },
                        }}
                    />
                </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <h2 className="text-sm opacity-80 mb-2">Doctor's Notes</h2>
                <p className="text-sm text-gray-300">
                    Patient shows signs of improvement with reduced redness and itching.
                    Continue prescribed ointment twice daily. Maintain hydration and avoid
                    known allergens. Follow-up scheduled for August 20, 2025.
                </p>
            </div>
        </div>
    );
}
