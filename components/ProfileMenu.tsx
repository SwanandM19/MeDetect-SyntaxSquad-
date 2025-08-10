
// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import axios from "axios";
// import { toast } from "react-hot-toast";

// export default function ProfileMenu() {
//     const [dropdownOpen, setDropdownOpen] = useState(false);
//     const [username, setUsername] = useState("nousername");
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const response = await axios.post("/api/users/me");
//                 if (response.data?.data?.username) {
//                     setUsername(response.data.data.username);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch user data:", error);
//                 toast.error("Failed to load user data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserData();
//     }, []);

//     return (
//         <div className="relative">
//             <Image
//                 src="/icons/profile.png"
//                 alt="Profile"
//                 width={32}
//                 height={32}
//                 className="cursor-pointer"
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//             />
//             {dropdownOpen && (
//                 <div className="absolute right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg w-48 opacity-90 overflow-hidden">
//                     {/* Username Section */}
//                     <div className="px-4 py-3 border-b border-white/20">
//                         <p className="text-sm font-medium text-white">
//                             {loading ? "Loading..." : username}
//                         </p>
//                     </div>
                    
//                     {/* Menu Items */}
//                     <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition">
//                         Edit Info
//                     </button>
//                     <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition">
//                         Logout
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [username, setUsername] = useState("nousername");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.post("/api/users/me");
                if (response.data?.data?.username) {
                    setUsername(response.data.data.username);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast.error("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.get("/api/users/logout"); // Changed to GET request
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error: any) {
            console.error("Logout failed:", error);
            toast.error(error.response?.data?.message || "Logout failed");
        } finally {
            setDropdownOpen(false);
        }
    };

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
                <div className="absolute right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg w-48 opacity-90 overflow-hidden">
                    {/* Username Section */}
                    <div className="px-4 py-3 border-b border-white/20">
                        <p className="text-sm font-medium text-white">
                            {loading ? "Loading..." : username}
                        </p>
                    </div>
                    
                    {/* Menu Items */}
                    <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition">
                        Edit Info
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
