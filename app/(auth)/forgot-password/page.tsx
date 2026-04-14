"use client"

import { useState } from "react"
import { Mail, ArrowRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await adminService.forgotPassword(email)
            if (res.success) {
                toast.success("OTP sent to your email")
                router.push(`/reset-password?email=${encodeURIComponent(email)}`)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP")
        } finally {
            setLoading(false)
        }
    }

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
                            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Forgot Password</h2>
                            <p className="text-sm text-white/90 mb-8 font-medium">Enter your registered email to receive a recovery OTP</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-black text-white ml-1 uppercase tracking-widest opacity-80">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 transition-colors group-focus-within:text-white">
                                        <Mail size={18} className="stroke-[2.5]" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@difwa.com"
                                        className="w-full pl-14 pr-5 py-[18px] rounded-2xl bg-white/10 border border-white/10 focus:bg-white/30 text-slate-100 transition-all outline-none text-sm font-bold placeholder:text-white/30 focus:border-white/50"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] shadow-[0_12px_24px_-8px_rgba(37,99,235,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Send OTP Code
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-black text-[#1E47C3] hover:text-[#2769CD] transition-colors">
                                <ChevronLeft size={16} strokeWidth={3} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
