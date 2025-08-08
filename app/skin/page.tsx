"use client";
import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";

export default function Skin() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [files, setFiles] = useState<File[]>([]); // store uploaded files
    const [showQR, setShowQR] = useState(false); // toggle QR image

    // Handle file selection
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const uploadedFiles = Array.from(event.target.files);
            setFiles(uploadedFiles);
            console.log("Files uploaded:", uploadedFiles);
        }
    };

    return (
        <div
            className="relative min-h-screen text-white"
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
            <header className="w-full px-6 py-4 border-white/10 flex items-center justify-between">
                {/* Logo & Title */}
                <div className="flex items-center space-x-6">
                    <Link href="/" className="relative w-10 h-10 block">
                        <Image
                            src="/onlylogo.png"
                            alt="Medetect Logo"
                            fill
                            className="object-contain"
                        />
                    </Link>
                    <h1 className="text-xl font-light">Disease detection of skin</h1>
                </div>

                {/* Center Icons */}
                <nav className="flex items-center space-x-40 opacity-70 ml-[-160px]">
                    <Image src="/icons/home.png" alt="Home" width={24} height={24} />
                    <Image src="/icons/agents.png" alt="Agents" width={24} height={24} />
                    <Link href="/analytics">
                        <Image
                            src="/icons/data-analytics.png"
                            alt="Analytics"
                            width={24}
                            height={24}
                            className="cursor-pointer"
                        />
                    </Link>
                    <Image src="/icons/exit.png" alt="Exit" width={24} height={24} />
                </nav>

                {/* Profile */}
                <ProfileMenu />
            </header>

            {/* Main Content */}
            <main className="p-6 grid grid-cols-[auto_1fr_300px] gap-4 h-[calc(100vh-72px)] transition-all duration-300">

                {/* Sources Panel - Collapsible */}
                <div
                    className={`bg-white/10 backdrop-blur-md border border-white/30 rounded-lg p-2 flex flex-col items-center transition-all duration-300 ${collapsed ? "w-[50px]" : "w-64"
                        }`}
                >
                    {/* Collapse Icon */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded hover:bg-white/20 transition"
                    >
                        {collapsed ? "»" : "«"}
                    </button>

                    {!collapsed ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-gray-300">
                            <p className="text-sm mb-2">Saved sources will appear here.</p>

                            {/* Upload Button */}
                            <label className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition cursor-pointer">
                                Upload a source
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            <p className="text-xs mt-2">upload any type of file</p>

                            {/* Show uploaded file names */}
                            {files.length > 0 && (
                                <ul className="mt-4 text-xs text-gray-300 text-center space-y-1">
                                    {files.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4 mt-4">
                            <Image src="/icons/add.png" alt="Add" width={20} height={20} />
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col items-center justify-center">
                    <p className="text-gray-300 mb-4">Start Advance Diagnose</p>
                    <button className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition">
                        Start
                    </button>
                </div>

                {/* Studio Panel */}
                <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/40 p-4 flex flex-col">
                    <h2 className="text-sm font-medium mb-4">Result</h2>

                    {/* Show QR Code if generated */}
                    {showQR && (
                        <div className="mt-40 flex justify-center">
                            <img
                                src="/icons/qr.png" // Replace with your QR image
                                alt="Generated QR Code"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                    )}

                    <div className="mt-auto text-center">
                        <div className="flex justify-center gap-3">
                            <button className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition">
                                Get Hospital Help
                            </button>
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="border border-white/80 border-[1px] px-4 py-2 rounded hover:bg-white/10 transition"
                            >
                                QR Generate
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
