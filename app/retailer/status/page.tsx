"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Clock,
    XCircle,
    CheckCircle2,
    Building2,
    MapPin,
    ArrowRight,
    RefreshCw,
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"

export default function StatusPage() {
    const router = useRouter()
    const { user, logout, checkAuth, loading: storeLoading } = useAuthStore()

    useEffect(() => {
        const updateStatus = async () => {
            if (!user) {
                await checkAuth()
                return
            }

            if (user.status === "approved") {
                router.push("/retailer/dashboard")
            }
        }

        updateStatus()
        // Poll for status updates
        const interval = setInterval(checkAuth, 30000)
        return () => clearInterval(interval)
    }, [user, router, checkAuth])

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const userData = user;
    const loading = storeLoading;

    const handleResubmit = () => {
        router.push("/onboarding")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="w-10 h-10 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin" />
            </div>
        )
    }

    const isRejected = userData?.status === "rejected"
    const isUnderReview = userData?.status === "under_review"

    return (
        <div className="min-h-screen bg-[#458BCC] p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/waterlogo.png" alt="Logo" className="w-10 h-10" />
                        <span className="text-2xl font-bold text-[#1B2D1F]">Difwa</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {/* Status Card */}
                <div className={cn(
                    "p-8 lg:p-12 rounded-[40px] border shadow-2xl relative overflow-hidden",
                    isUnderReview ? "bg-white border-[#E9ECEF]" : "bg-red-50 border-red-100"
                )}>
                    {isUnderReview && (
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                    )}

                    <div className="max-w-2xl relative z-10">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-8",
                            isUnderReview ? "bg-blue-50 text-blue-600" : "bg-red-100 text-red-600"
                        )}>
                            {isUnderReview ? <Clock size={32} className="animate-pulse" /> : <XCircle size={32} />}
                        </div>

                        <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
                            {isUnderReview ? "Your application is under review" : "Application not approved"}
                        </h2>

                        <p className="text-lg text-[#495057] mb-8 leading-relaxed">
                            {isUnderReview
                                ? "Our team is currently verifying your business details. We'll update your status within 24-48 hours. You'll get full access to the dashboard once approved."
                                : "We're sorry, but your application didn't meet our criteria at this time. Please see the reason below and update your details to resubmit."
                            }
                        </p>

                        {isRejected && (
                            <div className="p-6 rounded-2xl bg-white border border-red-200 mb-8">
                                <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Rejection Reason</p>
                                <p className="text-gray-800 font-medium">{userData.rejectionReason || "Please verify your legal documents and business address."}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                            {isRejected && (
                                <button
                                    onClick={handleResubmit}
                                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] hover:shadow-xl transition-all"
                                >
                                    <RefreshCw size={18} />
                                    Update & Resubmit
                                </button>
                            )}
                            <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-[#DEE2E6] text-[#495057] font-bold hover:bg-gray-50 transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submitted Details */}
                <div className="bg-white rounded-[40px] border border-[#E9ECEF] p-8 lg:p-12 shadow-sm">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8 flex items-center gap-3">
                        <Building2 className="text-[#FF6B00]" />
                        Submitted Business Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Business Name</p>
                                <p className="text-lg font-bold text-[#1A1A1A]">{userData?.businessDetails?.businessName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Business Type</p>
                                <p className="font-bold text-[#1A1A1A]">{userData?.businessDetails?.businessType}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Business Model</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {userData?.businessDetails?.businessModel?.map((m: string) => (
                                        <span key={m} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{m}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Address</p>
                                <p className="text-[#495057] flex items-start gap-2">
                                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                                    {userData?.businessDetails?.location?.address}, {userData?.businessDetails?.location?.city}, {userData?.businessDetails?.location?.state} - {userData?.businessDetails?.location?.pincode}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Legal Info</p>
                                <p className="text-sm font-medium text-[#495057]">GST: {userData?.businessDetails?.legal?.gst || "N/A"}</p>
                                <p className="text-sm font-medium text-[#495057]">FSSAI: {userData?.businessDetails?.legal?.fssai || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
