"use client"

import { useState } from "react"
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    ChevronRight,
    LayoutDashboard, UtensilsCrossed, ShieldCheck, LogIn, UserPlus, Fingerprint, Sparkles, Building2
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
                router.push("/admin/dashboard")
            } else {
                if (data.user.status === "approved") {
                    router.push("/retailer/dashboard")
                } else if (data.user.status === "under_review" || data.user.status === "rejected") {
                    router.push("/retailer/status")
                } else {
                    router.push("/onboarding")
                }
            }
        } catch (err: any) {
            // Error is handled by the store and available via storeError
            // If there's a specific local error not from the store, set it here
            // For now, we rely on storeError
        }
    }

    return (
        <div className="relative h-screen overflow-hidden ">
            <img
                src="https://raw.githubusercontent.com/anushk2026a/img-url/c6df7976948ff2cc5b9e5c2fe7d432b8540e7f3b/image.png"
                alt="Fresh Shrimp Dish"
                className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 " />

            {/* CONTENT LAYER */}
            <div className="min-h-screen flex bg-gradient-to-br from-[#1b2d1f] via-[#2f3e2f] to-[#1e2a1f] container mx-auto">
                {/* Left Side - Visual Branding (Exact Reference Match) */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-10">
                    {/* <img
                        src="https://raw.githubusercontent.com/anushk2026a/img-url/c6df7976948ff2cc5b9e5c2fe7d432b8540e7f3b/image.png"
                        alt="Fresh Shrimp Dish"
                        className="absolute inset-0 w-full h-full object-cover"
                    /> */}
                    <div className="absolute inset-0 bg-black/30"></div>

                    <div className="relative z-10 w-full h-full flex flex-col p-10">
                        {/* Logo Section */}
                        <div className="flex items-center gap-2 mb-16 select-none group cursor-pointer">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <img
                                    src="/loginlogo.png"
                                    alt="Shrimpbite Logo"
                                    className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                                />
                                <div className="absolute top-1 right-0 w-2 h-2 rounded-full bg-[#FF6B00]"></div>
                            </div>
                            <span className="text-3xl font-extrabold text-white tracking-tighter">Shrimpbite</span>
                        </div>

                        <div className="space-y-8 mt-4">
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A2C1D]/80 backdrop-blur-md border border-white/5 select-none">
                                <span className="text-[#FFB800] text-xs">🔥</span>
                                <span className="text-[#FDFCFB]/90 text-[10px] font-black uppercase tracking-[0.2em]">Seafood Done Right</span>
                            </div>

                            {/* Heading */}
                            <div className="space-y-1">
                                <h1 className="text-[72px] font-extrabold text-[#FDFCFB] leading-[1.05] tracking-tight">
                                    Nourishing <br />
                                    India <span className="text-[#FFB800]"> with </span> <br />
                                    <span className="text-[#FFB800]">Fresh Shrimp</span>
                                </h1>
                            </div>

                            <p className="text-[17px] text-[#FDFCFB]/80 font-medium max-w-[400px] leading-relaxed tracking-tight">
                                Premium distribution brand empowering farmers and delivering quality seafood across the country.
                            </p>
                        </div>

                        {/* Action Pill (Olive-Green) */}
                        <div className="mt-16">
                            <div className="inline-flex items-center gap-4 pl-4 pr-8 py-3.5 rounded-full bg-[#3D422E]/60 backdrop-blur-xl border border-white/10 group cursor-pointer hover:bg-[#3D422E]/80 transition-all shadow-xl">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3D422E] group-hover:scale-110 transition-transform shadow-md">
                                    <ChevronRight size={20} className="stroke-[3]" />
                                </div>
                                <div className="select-none py-1">
                                    <p className="text-[15px] font-black text-white leading-none mb-0.5">Join us</p>
                                    <p className="text-[9px] text-white/50 font-black tracking-widest uppercase">Platform Stats</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Precise Login Card (The Arc!) */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
                    {/* Sweeping Arc Container */}
                    <div
                        className="w-full 
  max-w-md 
  bg-[#c8b8a6]/40
  backdrop-blur-xl
  rounded-[40px] 
  shadow-[0_30px_60px_-15px_rgba(0,0,0,0.45)] 
  border border-white/10
  p-10
  relative"

                    >
                        {/* Top-Right Lighting Effect */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 blur-[60px] rounded-full pointer-events-none" />

                        {/* Stronger Inner Shadow Frame */}
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] rounded-[40px] pointer-events-none" />

                        <div className="w-full max-w-sm space-y-12 relative z-10">
                            {/* Mobile Logo Visibility */}
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                                <span className="text-4xl font-black text-[#6CC51D]">S</span>
                                <span className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Shrimpbite</span>
                            </div>

                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-[#1f2a1f] mb-2">Login</h2>
                                <p className="text-sm text-gray-800 mb-8">Enter your credentials to access your account</p>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-black text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-black text-[#1A1A1A] ml-1">Email address</label>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#FF6B00] transition-colors">
                                                <Mail size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={process.env.NEXT_PUBLIC_RETAILER_EMAIL || "retailer@test.com"}
                                                className="w-full pl-14 pr-5 py-[18px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-black text-[#1A1A1A]">Password</label>
                                            <Link href="#" className="text-xs font-black text-[#9BE15D] hover:text-[#7ED957] transition-colors">Forgot password?</Link>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#FF6B00] transition-colors">
                                                <Lock size={18} className="stroke-[2.5]" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="•••••"
                                                className="w-full pl-14 pr-14 py-[18px] rounded-2xl bg-[#F0F2F4] border-transparent focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/10 transition-all outline-none text-sm font-bold text-[#1A1A1A]"
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

                                <div className="flex items-center gap-3 ml-1 select-none">
                                    <input id="rem" type="checkbox" className="w-5 h-5 rounded border-[#D1D1D1] accent-[#FF6B00] cursor-pointer" />
                                    <label htmlFor="rem" className="text-[15px] font-bold text-[#868889] cursor-pointer">Stay logged in</label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-br from-[#FF8A00] via-[#FF6B00] to-[#FF4D00] shadow-[0_12px_24px_-8px_rgba(255,107,0,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(255,107,0,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group",
                                        loading && "opacity-70 cursor-not-allowed"
                                    )}
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
                                Looking to start business with us? <Link href="/register" className="text-[#9BE15D] font-black hover:text-[#7ED957] transition-colors">Request access</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
