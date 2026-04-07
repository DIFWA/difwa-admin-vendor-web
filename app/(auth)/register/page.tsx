"use client"

import { useState } from "react"
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Phone,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"

export default function RegisterPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const { register, loading, error: storeError } = useAuthStore()
    const [localError, setLocalError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    })

    const error = storeError || localError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError("")

        try {
            await register(formData)
            router.push("/onboarding")
        } catch {
            // Error handled by store
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="relative h-screen overflow-hidden">
            <img
                src="https://i.ibb.co/8DP10d22/Image-Mar-17-2026-12-50-45-PM.png"
                alt="Fresh Water Delivery"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 " />

            {/* CONTENT LAYER */}
            <div className="min-h-screen flex bg-gradient-to-br from-[#1b2d1f] via-[#2f3e2f] to-[#1e2a1f] container mx-auto">
                {/* Left Side - Visual Branding */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-16">
                    <div className="absolute inset-0 bg-black/30"></div>

                    <div className="relative z-10 w-full h-full flex flex-col p-16">
                        {/* Logo Section */}
                        <div className="flex items-center gap-2 mb-16 select-none group cursor-pointer">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <img
                                    src="/waterlogo.png"
                                    alt="Difwa Logo"
                                    className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                                />
                                <div className="absolute top-1 right-0 w-2 h-2 rounded-full bg-[#FF6B00]"></div>
                            </div>
                            <span className="text-3xl font-extrabold text-white tracking-tighter">Difwa</span>
                        </div>

                        <div className="space-y-8 mt-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A2C1D]/80 backdrop-blur-md border border-white/5 select-none">
                                <span className="text-[#FFB800] text-xs">🤝</span>
                                <span className="text-[#FDFCFB]/90 text-[10px] font-black uppercase tracking-[0.2em]">Partner with us</span>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-[72px] font-extrabold text-[#FDFCFB] leading-[1.05] tracking-tight">
                                    Thrive Your <br />
                                    Business <span className="text-[#0096FF]"> with </span> <br />
                                    <span className="text-[#0096FF]">Difwa</span>
                                </h1>
                            </div>

                            <p className="text-[17px] text-[#FDFCFB]/80 font-medium max-w-[400px] leading-relaxed tracking-tight">
                                Join water distribution network. Access top-quality inventory and reach more customers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Card */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
                    <div className="w-full max-w-md bg-[#c8b8a6]/40 backdrop-blur-xl rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)] border border-white/10 p-10 relative">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] rounded-[40px] pointer-events-none" />

                        <div className="w-full max-w-sm space-y-10 relative z-10">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-[#1f2a1f] mb-2">Join Difwa</h2>
                                <p className="text-sm text-gray-800">Create your owner account to get started</p>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-black text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1A1A1A] ml-1">Full Name</label>
                                        <input
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full pl-6 pr-5 py-[16px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                        />
                                    </div>

                                    {/* Email Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1A1A1A] ml-1">Email address</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#FF6B00] transition-colors">
                                                <Mail size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="email@example.com"
                                                className="w-full pl-14 pr-5 py-[16px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1A1A1A] ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#FF6B00] transition-colors">
                                                <Phone size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                name="phone"
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 00000 00000"
                                                className="w-full pl-14 pr-5 py-[16px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[#1A1A1A] ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#FF6B00] transition-colors">
                                                <Lock size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full pl-14 pr-14 py-[16px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full mt-4 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-br from-[#007BFF] via-[#339CFF] to-[#0056D2] shadow-[0_12px_24px_-8px_rgba(255,107,0,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(255,107,0,0.6)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group",
                                        loading && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-[#868889] font-bold pt-4 tracking-tight">
                                Already have an account? <Link href="/login" className="text-[#0096FF] font-black hover:text-[#5BA819] transition-colors">Login here</Link>
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
