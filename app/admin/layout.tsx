"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import useAuthStore from "@/data/store/useAuthStore"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [hydrated, setHydrated] = useState(false)
    const { user, checkAuth, loading } = useAuthStore()

    useEffect(() => {
        setHydrated(true)
    }, [])

    useEffect(() => {
        const verifyAdmin = async () => {
            if (!hydrated || loading) return

            if (!user) {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                const role = typeof window !== "undefined" ? localStorage.getItem("role") : null
                
                if (token && role === "admin") {
                    await checkAuth()
                } else {
                    router.replace("/login")
                }
                return
            }

            if (user.role !== "admin") {
                router.replace("/login")
            }
        }
        verifyAdmin()
    }, [user, router, loading, checkAuth, hydrated])

    if (!hydrated || loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}