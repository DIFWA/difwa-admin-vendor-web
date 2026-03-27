"use client"

import { useState, useEffect } from "react"
import { Shield, ShieldCheck, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"

const MODULES = [
    { id: "DASHBOARD", name: "Dashboard" },
    { id: "RETAILERS", name: "Retailers" },
    { id: "APP_USERS", name: "App Users" },
    { id: "ORDERS", name: "Order Management" },
    { id: "CATEGORIES", name: "Categories" },
    { id: "PAYOUTS", name: "Payout Settlements" },
    { id: "COMMUNICATION", name: "Communication Hub" },
    { id: "TRANSACTIONS", name: "Transactions" },
    { id: "ROLES", name: "Admin Roles" },
    { id: "AUTHORITY", name: "Control Authority" },
]

export default function AuthorityPage() {
    const [roles, setRoles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchRoles()
    }, [])

    const fetchRoles = async () => {
        try {
            const res = await adminService.getRoles()
            if (res.success) {
                setRoles(res.data)
            }
        } catch (error) {
            toast.error("Failed to fetch roles")
        } finally {
            setLoading(false)
        }
    }

    const togglePermission = async (role: any, permissionId: string) => {
        setUpdating(`${role._id}-${permissionId}`)
        try {
            const hasPermission = role.permissions.includes(permissionId)
            const newPermissions = hasPermission
                ? role.permissions.filter((p: string) => p !== permissionId)
                : [...role.permissions, permissionId]

            const res = await adminService.updateRole(role._id, {
                ...role,
                permissions: newPermissions
            })

            if (res.success) {
                setRoles(roles.map((r: any) => r._id === role._id ? res.data : r))
                toast.success(`Permission updated for ${role.name}`)
            }
        } catch (error) {
            toast.error("Failed to update permission")
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Authority Matrix...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Control Authority</h1>
                    <p className="text-text-muted">Manage system-level permissions and access controls per role.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                    <h2 className="text-lg font-bold">Role Permissions Matrix</h2>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-green-600 font-bold">
                            <div className="w-2 h-2 rounded-full bg-green-500" /> Authorized
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold">
                            <div className="w-2 h-2 rounded-full bg-red-500" /> Restricted
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-border-custom shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">Module Name</th>
                                {roles.map((role: any) => (
                                    <th key={role._id} className="px-6 py-4 text-center min-w-[120px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <Shield size={16} />
                                            <span>{role.name}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {MODULES.map((module) => (
                                <tr key={module.id} className="hover:bg-background-soft/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-foreground sticky left-0 bg-white group-hover:bg-background-soft/50 z-10 border-r border-border-custom shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                        {module.name}
                                    </td>
                                    {roles.map((role: any) => {
                                        const isAuthorized = role.permissions.includes(module.id)
                                        const isPending = updating === `${role._id}-${module.id}`

                                        return (
                                            <td key={role._id} className="px-6 py-4 text-center">
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => togglePermission(role, module.id)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto relative overflow-hidden group/btn",
                                                        isAuthorized
                                                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                            : "bg-red-50 text-red-400 hover:bg-red-100",
                                                        isPending && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isPending ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : isAuthorized ? (
                                                        <Check size={20} className="transition-transform group-hover/btn:scale-110" />
                                                    ) : (
                                                        <X size={20} className="transition-transform group-hover/btn:rotate-90" />
                                                    )}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-xs text-primary flex gap-2 font-medium">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>Changes take effect immediately for all administrators assigned to the modified roles. Users may need to refresh their session to see sidebar updates.</span>
                </p>
            </div>
        </div>
    )
}
