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

    const [showTitleModal, setShowTitleModal] = useState(false);
    const [newNotebookTitle, setNewNotebookTitle] = useState("");

    const handleCreateClick = () => {
        setShowTitleModal(true);
    };

    const handleCreateNotebook = () => {
        if (!newNotebookTitle.trim()) return;

        const newNotebook: Notebook = {
            id: Date.now(),
            title: newNotebookTitle,
            description: "MRI / EEG • Predictions",
        };
        setNotebooks([...notebooks, newNotebook]);
        setNewNotebookTitle("");
        setShowTitleModal(false);
    };

    return (
        <div className="relative min-h-screen font-light" style={{ fontFamily: "'Readex Pro', sans-serif" }}>
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@200;300;400&display=swap" rel="stylesheet" />
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

            {/* Title Prompt Modal */}
            {showTitleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 w-96">
                        <h3 className="text-xl mb-4 text-white">Enter notebook title</h3>
                        <input
                            type="text"
                            value={newNotebookTitle}
                            onChange={(e) => setNewNotebookTitle(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-white/50"
                            placeholder="e.g. Headache diagnosis"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowTitleModal(false)}
                                className="px-4 py-2 text-sm border border-white/20 rounded-lg hover:bg-white/20 transition text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNotebook}
                                className="px-4 py-2 text-sm bg-purple-500 rounded-lg hover:bg-purple-600 transition text-white"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <Image
                        src="/icons/home.png"
                        alt="Home"
                        width={24}
                        height={24}
                        className="hover:opacity-100 transition cursor-pointer"
                    />
                    <Image
                        src="/icons/agents.png"
                        alt="Agents"
                        width={24}
                        height={24}
                        className="hover:opacity-100 transition cursor-pointer"
                    />
                    <Link href="/analytics" className="block">
                        <Image
                            src="/icons/data-analytics.png"
                            alt="Analytics"
                            width={24}
                            height={24}
                            className="hover:opacity-100 transition cursor-pointer"
                        />
                    </Link>
                    {/* <Image
                        src="/icons/exit.png"
                        alt="Exit"
                        width={24}
                        height={24}
                        className="hover:opacity-100 transition cursor-pointer"
                    /> */}
                </nav>
            </aside>

            {/* User Profile */}
            <div className="absolute top-6 right-8 z-20">
                <ProfileMenu />
            </div>

            {/* Centered Content */}
            <main className="pl-20 pr-8 flex flex-col items-center justify-center min-h-screen text-white text-center">
                <div>
                    <h1 className="text-4xl md:text-5xl mb-2">Let's Cure your Disease</h1>
                    <p className="text-4xl md:text-5xl mb-2">
                        <span className="inline-block w-[300px]"></span>
                        Whats on your mind
                    </p>

                    {/* Cards */}
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        {/* Create Notebook Card */}
                        <div
                            onClick={handleCreateClick}
                            className="w-64 h-40 bg-white/10 backdrop-blur-md rounded-lg flex flex-col items-center justify-center border border-white/20 cursor-pointer hover:border-purple-400 transition opacity-90"
                        >
                            <Image
                                src="/icons/plus.png"
                                alt="Create"
                                width={40}
                                height={40}
                                className="opacity-80 hover:opacity-100 transition"
                            />
                            <p className="mt-4 text-sm">Start new diagnose</p>
                        </div>

                        {/* Render Notebooks */}
                        {notebooks.map((nb) => (
                            <Link href="/skin" className="block" key={nb.id}>
                                <div className="w-64 h-40 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 cursor-pointer hover:border-purple-400 transition opacity-90">
                                    <div className="flex flex-col items-center">
                                        <Image
                                            src="/icons/brain.png"
                                            alt="AI"
                                            width={40}
                                            height={40}
                                            className="opacity-80 hover:opacity-100 transition"
                                        />
                                        <h3 className="text-lg font-medium mt-2 text-center">{nb.title}</h3>
                                        <p className="text-xs mt-1 text-white/70">{nb.description}</p>
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
