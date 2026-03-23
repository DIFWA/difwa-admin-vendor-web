"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role")
        if (role === "retailer") {
            router.replace("/retailer/dashboard")
        } else if (role === "admin") {
            router.replace("/admin/dashboard")
        } else {
            router.replace("/login")
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    )
}
//test