'use client'
import React, { useState, FormEvent } from 'react';
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
      const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Email:', email, 'Password:', password);
    };

    return (
        <div className="relative min-h-screen w-full flex">
            {/* Full-screen Spline Design */}
            <div className="fixed inset-0 w-full h-full z-0">
                <iframe
                    src="https://my.spline.design/claritystream-l36vjaMYj126SXYKRrYog9tX/"
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Login Form with Glass Effect */}
            <div className="relative z-10 w-full h-screen flex items-center justify-end p-4 pr-32">
                <div className=" bg-white/4 p-10 rounded-xl shadow-2xl w-full max-w-md  ">

                    <img src="/logoo.png" alt="Logo" className="w- h-10 my-10 mx-[-8]" />
                    <h1 className="text-3xl text-center text-white mb-8 font-light" style={{ color: "#AC3AD0" }}>
                        Login
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-white/80 mb-2 font-light" style={{ color: "#AC3AD0" }}  >
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-white/80 mb-2 font-light" style={{ color: "#AC3AD0" }}  >
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="button" // prevent form submission if not needed
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg transition duration-200 border border-white/20 hover:border-white/30 font-light"
                            style={{ backgroundColor: "#971dcba9" }}
                        >
                            Login
                        </button>


                        <div className="mt-4 text-center">
                            <a href="/forgot-password" className="text-white/70 hover:text-white text-sm hover:underline font-light">
                                Forgot password?
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;