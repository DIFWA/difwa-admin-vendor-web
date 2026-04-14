"use client"

import { useState, Suspense } from "react"
import { Lock, ArrowRight, ShieldCheck, Key, Eye, EyeOff } from "lucide-react"
import { useSearchParams } from "next/navigation"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match")
        }
        setLoading(true)

        try {
            const res = await adminService.resetPassword(email, otp, newPassword)
            if (res.success) {
                toast.success("Password reset successful. Please login.")
                router.push("/login")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-black text-white ml-1 uppercase tracking-widest opacity-80">OTP Code</label>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-white">
                        <Key size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-14 pr-5 py-[18px] rounded-2xl bg-white/10 border border-white/10 focus:bg-white/30 text-slate-100 transition-all outline-none text-sm font-bold tracking-[0.2em] focus:border-white/50"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-white ml-1 uppercase tracking-widest opacity-80">New Password</label>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-white">
                        <Lock size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-[18px] rounded-2xl bg-white/10 border border-white/10 focus:bg-white/30 text-slate-100 transition-all outline-none text-sm font-bold focus:border-white/50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black text-white ml-1 uppercase tracking-widest opacity-80">Confirm Password</label>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-white">
                        <Lock size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-14 pr-14 py-[18px] rounded-2xl bg-white/10 border border-white/10 focus:bg-white/30 text-slate-100 transition-all outline-none text-sm font-bold focus:border-white/50"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 rounded-2xl font-bold text-white text-lg bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.6)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <ShieldCheck size={20} className="stroke-[2.5]" />
                        Securely Reset
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                    </>
                )}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="relative h-screen overflow-hidden">
            <img
                src="https://i.ibb.co/8DP10d22/Image-Mar-17-2026-12-50-45-PM.png"
                alt="Fresh Water Delivery"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="min-h-screen flex w-full relative z-10">
                <div className="flex w-full items-center justify-center p-6">
                    <div className="w-full max-w-md bg-[#3B91E2]/40 backdrop-blur-3xl rounded-[40px] border border-white/30 shadow-[0_30px_60px_-15px_rgba(59,145,226,0.3)] p-10 relative">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Set New Password</h2>
                            <p className="text-sm text-white/90 mb-8 font-medium">Enter the OTP sent to your email to reset password</p>
                        </div>

                        <Suspense fallback={<div className="text-white text-center">Loading security protocols...</div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    )
}
