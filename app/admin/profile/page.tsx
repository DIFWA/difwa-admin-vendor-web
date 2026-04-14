"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Mail, Lock, CheckCircle2, AlertCircle, Save } from "lucide-react"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import useAuthStore from "@/data/store/useAuthStore"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function RootProfilePage() {
    const { user, setUser } = useAuthStore()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (user?.email) {
            setEmail(user.email)
        }
    }, [user])

    if (!mounted) return null

    // Strictly enforce ROOT only
    const permissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    if (!permissions.includes("ALL")) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-red-200 shadow-sm text-center my-12 mx-auto max-w-lg">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Critical Sandbox Protection</h2>
                <p className="text-text-muted mt-2">Only the Absolute Administrator can access this section.</p>
            </div>
        )
    }

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return toast.error("Email cannot be empty");
        if (email === user?.email) return toast.info("Email is already up to date.");

        setIsUpdatingEmail(true)
        try {
            const res = await adminService.updateAdminProfile(email)
            if (res.success) {
                toast.success("Root email updated successfully")
                if (setUser && res.data) setUser({ ...user, email: res.data.email })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update email")
        } finally {
            setIsUpdatingEmail(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentPassword) return toast.error("Current password is required")
        if (!newPassword) return toast.error("New password is required")
        if (newPassword !== confirmPassword) return toast.error("New passwords do not match")

        setIsUpdatingPassword(true)
        try {
            const res = await adminService.changePassword(currentPassword, newPassword)
            if (res.success) {
                toast.success("Master password updated securely")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update password")
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ShieldAlert size={200} />
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-red-500/30 backdrop-blur-sm">
                        <ShieldAlert size={14} /> System Root Interface
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Platform Owner Profile</h1>
                    <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                        You are accessing the supreme administration pane. Changes made here affect the master login credentials for the entire system infrastructure. Proceed with caution.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email Update Card */}
                <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border-custom bg-slate-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                            <Mail size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Mail Identity</h2>
                            <p className="text-xs font-medium text-text-muted">Master contact address</p>
                        </div>
                    </div>
                    <form onSubmit={handleUpdateEmail} className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Registered Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="root@difwa.com"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isUpdatingEmail || email === user?.email}
                            className={cn(
                                "mt-8 w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all",
                                email !== user?.email
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isUpdatingEmail ? (
                                <span className="animate-pulse">Updating Network...</span>
                            ) : email === user?.email ? (
                                <>
                                    <CheckCircle2 size={18} /> Identity Synced
                                </>
                            ) : (
                                <>
                                    <Save size={18} /> Update Email
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Password Update Card */}
                <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden flex flex-col relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] pointer-events-none transition-all group-hover:bg-red-500/10" />
                    
                    <div className="p-6 border-b border-border-custom bg-slate-50 flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                            <Lock size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Security Vault</h2>
                            <p className="text-xs font-medium text-text-muted">Master password protocol</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleUpdatePassword} className="p-8 flex flex-col space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium font-mono"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-dashed border-slate-200">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Access Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium font-mono"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Verify Access Key</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-medium font-mono"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className={cn(
                                "w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all mt-4",
                                currentPassword && newPassword && confirmPassword
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-black"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isUpdatingPassword ? (
                                <span className="animate-pulse">Encrypting...</span>
                            ) : (
                                <>
                                    <ShieldAlert size={18} /> Enforce New Key
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
