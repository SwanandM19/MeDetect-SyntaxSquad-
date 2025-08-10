"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login successful!");
            router.push("/dashboard");
        } catch (error: any) {
            console.log("Login failed", error.response?.data);
            const errorMessage = error.response?.data?.error === "Invalid credentials" 
                ? "Wrong credentials. Please check your email and password."
                : error.message;
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

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
                <div className="bg-white/4 p-10 rounded-xl shadow-2xl w-full max-w-md">
                    <img src="/logoo.png" alt="Logo" className="w-28 h-10 my-10 mx-[-8]" />
                    <h1 
                        className="text-3xl text-center mb-8 font-light"
                        style={{ color: "#AC3AD0" }}
                    >
                        {loading ? "Processing..." : "Login"}
                    </h1>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 text-red-100 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onLogin}>
                        {/* Email */}
                        <div className="mb-6">
                            <label 
                                className="block text-white/80 mb-2 font-light"
                                style={{ color: "#AC3AD0" }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                                value={user.email}
                                onChange={(e) => setUser({...user, email: e.target.value})}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label 
                                className="block text-white/80 mb-2 font-light"
                                style={{ color: "#AC3AD0" }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                                value={user.password}
                                onChange={(e) => setUser({...user, password: e.target.value})}
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={buttonDisabled || loading}
                            className={`w-full text-white py-3 px-4 rounded-lg transition duration-200 border font-light ${
                                buttonDisabled 
                                    ? "bg-gray-500/30 border-gray-500/20 cursor-not-allowed"
                                    : "hover:bg-white/30 border-white/20 hover:border-white/30"
                            }`}
                            style={{ backgroundColor: buttonDisabled ? "" : "#971dcba9" }}
                        >
                            {loading ? "Processing..." : "Login"}
                        </button>

                        {/* Links */}
                        <div className="mt-4 text-center space-y-2">
                            <Link
                                href="/forgot-password"
                                className="text-white/70 hover:text-white text-sm hover:underline font-light block"
                            >
                                Forgot password?
                            </Link>
                            <Link
                                href="/signin"
                                className="text-white/70 hover:text-white text-sm hover:underline font-light block"
                            >
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
