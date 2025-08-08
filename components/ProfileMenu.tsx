"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProfileMenu() {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
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
    );
}
