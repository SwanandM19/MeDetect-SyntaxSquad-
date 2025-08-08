"use client";
import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";

interface Notebook {
    id: number;
    title: string;
    description: string;
}

export default function Landing() {
    const [notebooks, setNotebooks] = useState<Notebook[]>([
        { id: 1, title: "Cough and Fever", description: "MRI / EEG • Predictions" },
        { id: 2, title: "Stomach Ache due to sunstroke", description: "MRI / EEG • Predictions" },
    ]);

    const [showMenu, setShowMenu] = useState(false);

    const handleCreateNotebook = () => {
        const newNotebook: Notebook = {
            id: Date.now(),
            title: "AI for Neurological Disease Detection",
            description: "MRI / EEG • Predictions",
        };
        setNotebooks([...notebooks, newNotebook]);
    };

    return (
        <div
            className="relative min-h-screen font-light"
            style={{ fontFamily: "'Readex Pro', sans-serif" }}
        >
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Background - Spline */}
            <div className="absolute inset-0 -z-10">
                <iframe
                    src="https://my.spline.design/particlenebula-Lhnk9Kvv9ioPiRHGvmCTlGEa/"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    className="w-full h-full"
                ></iframe>
            </div>

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-20 bg-black/30 flex flex-col items-center py-6 space-y-6 z-10">
                {/* Logo */}
                <Link href="/" className="block">
                    <div className="relative w-[100px] h-[100px] ml-10 mb-10 mt-[-30px]">
                        <Image
                            src="/logoo.png"
                            alt="Medetect Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                </Link>

                {/* Nav Icons */}
                <nav className="flex flex-col items-center space-y-20 mt-8 opacity-50">
                    <Image src="/icons/home.png" alt="Home" width={24} height={24} />
                    <Image src="/icons/agents.png" alt="Agents" width={24} height={24} />
                    <Link href="/analytics" className="block">
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
            </aside>

            {/* User Profile */}
            <div className="absolute top-6 right-8 z-20">
                <ProfileMenu />
            </div>




            {/* Centered Content */}
            <main className="pl-20 pr-8 flex flex-col items-center justify-center min-h-screen text-white text-center">
                <div>
                    <h1 className="text-4xl md:text-5xl mb-2">Let’s Cure your Disease</h1>

                    {/* Better spacing */}
                    <p className="text-4xl md:text-5xl mb-2">
                        <span className="inline-block w-[300px]"></span>
                        Whats on your mind
                    </p>

                    {/* Cards */}
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        {/* Create Notebook Card */}
                        <div
                            onClick={handleCreateNotebook}
                            className="w-64 h-40 bg-white/10 backdrop-blur-md rounded-lg flex flex-col items-center justify-center border border-white/20 cursor-pointer hover:border-purple-400 transition opacity-90"
                        >
                            <Image src="/icons/plus.png" alt="Create" width={40} height={40} />
                            <p className="mt-4 text-sm">Start new diagnose</p>
                        </div>

                        {/* Render Notebooks */}
                        {notebooks.map((nb) => (
                            <Link href="/skin" className="block">
                                <div
                                    key={nb.id}
                                    className="w-64 h-40 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 cursor-pointer hover:border-purple-400 transition opacity-90"
                                >
                                    <div className="flex flex-col items-center">
                                        <Image
                                            src="/icons/brain.png"
                                            alt="AI"
                                            width={40}
                                            height={40}
                                        />
                                        <h3 className="text-lg font-medium mt-2 text-center">
                                            {nb.title}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            {/* Animation styles */}
            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
        </div>
    );
}

