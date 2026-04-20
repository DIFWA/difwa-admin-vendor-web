"use client"

import { useState } from "react"
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const { login, loading, error: storeError } = useAuthStore()
    const [localError, setLocalError] = useState("")
    const router = useRouter()

    const error = storeError || localError;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError("")

        try {
            const data = await login(email, password)

            if (data.user.role === "admin") {
                if (data.user.isFirstLogin) {
                    router.push("/admin/change-password")
                } else {
                    router.push("/admin/dashboard")
                }
            } else {
                if (data.user.status === "approved") {
                    router.push("/retailer/dashboard")
                } else if (data.user.status === "under_review" || data.user.status === "rejected") {
                    router.push("/retailer/status")
                } else {
                    router.push("/onboarding")
                }
            }
        } catch {
            // Error is handled by the store and available via storeError
        }
    }

    return (
        <div className="relative h-screen overflow-hidden ">
            <img
                src="https://i.ibb.co/8DP10d22/Image-Mar-17-2026-12-50-45-PM.png"
                alt="Fresh Water Delivery"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* CONTENT LAYER */}
            <div className="min-h-screen flex w-full relative z-10">
                {/* Left Side - Visual Branding (Exact Reference Match) */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
                    {/* <img
                        src="https://raw.githubusercontent.com/anushk2026a/img-url/c6df7976948ff2cc5b9e5c2fe7d432b8540e7f3b/image.png"
                        alt="Fresh Water Delivery"
                        className="absolute inset-0 w-full h-full object-cover"
                    /> */}
                    <div className="absolute inset-0 bg-black/50"></div>

                    <div className="relative z-10 w-full h-full flex flex-col p-10">
                        {/* Logo Section */}
                        <div className="flex items-center gap-2 mb-16 select-none group cursor-pointer">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <img
                                    src="/waterlogo.png"
                                    alt="Difwa Logo"
                                    className="w-10 h-10 object-contain rounded-2xl"
                                />
                            </div>
                            <span className="text-3xl font-extrabold text-white tracking-tighter">Difwa</span>
                        </div>

                        <div className="space-y-8 mt-4">

                            {/* Heading */}
                            <div className="space-y-1">
                                <h1 className="text-[72px] font-extrabold text-[#FDFCFB] leading-[1.05] tracking-tight">
                                    Nourishing <br />
                                    People <span className="text-[#3B82F6]"> with </span> <br />
                                    <span className="text-[#3B82F6]">Clean Water</span>
                                </h1>
                            </div>

                            <p className="text-[17px] text-[#FDFCFB]/80 font-medium max-w-[400px] leading-relaxed tracking-tight">
                                Empowering communities with access to pure, hygienic, and reliable drinking water
                            </p>
                        </div>

                        {/* Action Pill (Olive-blue) */}
                        <div className="mt-16">
                            <Link href="/register" className="inline-flex items-center gap-4 pl-4 pr-8 py-3.5 rounded-full bg-[#3D422E]/60 backdrop-blur-xl border border-white/10 group cursor-pointer hover:bg-[#3D422E]/80 transition-all shadow-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3D422E] group-hover:scale-110 transition-transform shadow-md">
                                    <ChevronRight size={20} className="stroke-[3]" />
                                </div>
                                <div className="select-none py-1">
                                    <p className="text-[15px] font-black text-white leading-none mb-0.5">Join us</p>
                                    <p className="text-[9px] text-white/50 font-black tracking-widest uppercase">Platform Stats</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side - Precise Login Card (The Arc!) */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
                    {/* Sweeping Arc Container */}
                    <div
                        className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[40px] border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-7 relative"

                    >
                        {/* Top-Right Lighting Effect */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 blur-[60px] rounded-full pointer-events-none" />

                        {/* Stronger Inner Shadow Frame */}
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] rounded-[40px] pointer-events-none" />

                        <div className="w-full max-w-sm space-y-4 relative z-10">
                            {/* Mobile Logo Visibility */}
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                                <span className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Difwa</span>
                            </div>

                            <div className="text-center">
                                <div className="flex justify-center mb-5">
                                    <img
                                        src="/waterlogo.png"
                                        alt="Difwa Logo"
                                        className="w-12 h-12 object-contain rounded-[16px] "
                                    />
                                </div>
                                <h2 className="text-4xl font-bold text-[#0E134C] mb-2">Login Portal</h2>
                                <br />
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-black text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-3">
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-black text-[#0E134C] ml-1">Email address</label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#D5D6D8] transition-colors">
                                                <Mail size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={process.env.NEXT_PUBLIC_RETAILER_EMAIL || "retailer@test.com"}
                                                className="w-full pl-14 pr-5 py-[18px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                                suppressHydrationWarning={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-black text-[#0E134C] ml-1">Password</label>
                                            <Link href="/forgot-password" className="text-xs font-black text-[#1F416F] hover:text-[#1F419F] transition-colors">Forgot password?</Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#D5D6D8] transition-colors">
                                                <Lock size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="•••••"
                                                className="w-full pl-14 pr-14 py-[13px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                                suppressHydrationWarning={true}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors"
                                                suppressHydrationWarning={true}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-1 select-none">
                                    <input id="rem" type="checkbox" className="w-5 h-5 rounded border-[#D1D1D1] accent-[#6E7C88] cursor-pointer" suppressHydrationWarning={true} />
                                    <label htmlFor="rem" className="text-[15px] font-bold text-white/70 cursor-pointer">Stay logged in</label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group",
                                        loading && "opacity-70 cursor-not-allowed"
                                    )}
                                    suppressHydrationWarning={true}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-[#868889] font-bold pt-6 tracking-tight">
                                Looking to start business with us? <Link href="/register" className="text-[#1F416F] font-black hover:text-[#1F419F] transition-colors">Request access</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
