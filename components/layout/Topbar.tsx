"use client"

import {
    Search,
    Bell,
    // Sun,
    Moon,
    ChevronDown,
    LogOut
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"

export default function Topbar() {
    const { user } = useAuthStore()
    const [isDark, setIsDark] = useState(false)

    return (
        <header className="h-16 border-b border-border-custom bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 flex items-center max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search data, users, or reports"
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-background-soft border-transparent focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full hover:bg-background-soft text-text-muted transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
                </button>

                {/* <div className="flex items-center gap-1 bg-background-soft p-1 rounded-full">
                    <button
                        className="p-1.5 rounded-full bg-white shadow-sm text-primary"
                    >
                        <Sun size={18} />
                    </button>
                </div> */}

                <div className="flex items-center gap-2 pl-4 border-l group">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border border-border-custom">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold leading-tight">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                            localStorage.removeItem("role")
                            window.location.href = "/login"
                        }}
                        className="ml-2 p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-destructive transition-all"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}
