"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const onSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            toast.success("Signup successful!");
            router.push("/login");
        } catch (error: any) {
            console.log("Signup failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
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

            {/* Signup Form with Glass Effect */}
            <div className="relative z-10 w-full h-screen flex items-center justify-end p-4 pr-32">
                <div className="bg-white/10 p-10 rounded-xl shadow-2xl w-full max-w-md">
                    <img src="/logoo.png" alt="Logo" className="w-28 h-10 my-10" />

                    <h1
                        className="text-3xl text-center mb-8 font-light"
                        style={{ color: "#AC3AD0" }}
                    >
                        {loading ? "Processing..." : "Sign Up"}
                    </h1>

                    <form onSubmit={onSignup}>
                        {/* Username */}
                        <div className="mb-6">
                            <label
                                className="block mb-2 font-light"
                                style={{ color: "#AC3AD0" }}
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                                value={user.username}
                                onChange={(e) => setUser({...user, username: e.target.value})}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label
                                className="block mb-2 font-light"
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
                                className="block mb-2 font-light"
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

                        {/* Signup Button */}
                        <button
                            type="submit"
                            disabled={buttonDisabled}
                            className={`w-full text-white py-3 px-4 rounded-lg transition duration-200 border font-light ${
                                buttonDisabled 
                                    ? "bg-gray-500/30 border-gray-500/20 cursor-not-allowed"
                                    : "hover:bg-white/30 border-white/20 hover:border-white/30"
                            }`}
                            style={{ backgroundColor: buttonDisabled ? "" : "#AC3AD0" }}
                        >
                            {loading ? "Processing..." : "Sign Up"}
                        </button>

                        {/* Login Link */}
                        <div className="mt-4 text-center">
                            <Link
                                href="/login"
                                className="text-white/70 hover:text-white text-sm hover:underline font-light"
                            >
                                Already have an account? Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}