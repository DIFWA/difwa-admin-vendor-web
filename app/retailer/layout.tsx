"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    const { user, checkAuth, loading } = useAuthStore()

    useEffect(() => {
        setMounted(true)
        const verifyStatus = async () => {

            if (loading) return
            if (!user) {
                const userId = localStorage.getItem("userId")
                const token = localStorage.getItem("token")

                if (userId && token) {
                    await checkAuth()
                } else {
                    router.replace("/login")
                }
                return
            }

            if (user.role !== "retailer") {
                router.replace("/login")
                return
            }

            const path = window.location.pathname
            if (user.status !== "approved" && path !== "/retailer/status") {
                router.replace("/retailer/status")
            }
        }

        verifyStatus()
    }, [user, router, checkAuth, loading])

    const status = user?.status || null;
    const hasToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (mounted && (loading || (!user && hasToken))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="w-10 h-10 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin" />
            </div>
        )
    }


    return (
        <div className="flex h-screen bg-background">
            {(mounted && status === "approved") && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0">
                {(mounted && status === "approved") && <Topbar />}
                <main className={cn("flex-1 overflow-y-auto overflow-x-hidden", (mounted && status === "approved") ? "p-6" : "p-0")}>
                    {children}
                </main>
            </div>
        </div>
    )
}
