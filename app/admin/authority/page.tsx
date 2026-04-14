"use client"

import { useState, useEffect } from "react"
import { Shield, ShieldCheck, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import useAuthStore from "@/data/store/useAuthStore"

const PERMISSION_GROUPS = [
    {
        name: "Dashboard & Analytics",
        permissions: [
            { id: "DASHBOARD_VIEW", name: "View Dashboard", description: "Can view revenue charts, order counts and general statistics." },
        ]
    },
    {
        name: "Communication Control",
        permissions: [
            { id: "COMMUNICATION_SEND", name: "Broadcast Hub", description: "Can send mass push notifications and email marketing campaigns." },
        ]
    },
    {
        name: "Retailer Management",
        permissions: [
            { id: "RETAILERS_VIEW", name: "View Retailers", description: "Can browse and search the list of all registered retailers." },
            { id: "RETAILERS_EDIT", name: "Edit Retailers", description: "Can update retailer profile, business details and contact info." },
            { id: "RETAILERS_APPROVE", name: "Approve/Reject", description: "Can approve new applications or reject/deactivate existing ones." },
        ]
    },
    {
        name: "Order Operations",
        permissions: [
            { id: "ORDERS_VIEW", name: "View Orders", description: "Can see live orders, order history and payment status." },
            { id: "ORDERS_EDIT", name: "Manage Status", description: "Can change order status (Preparation, Out for Delivery, etc)." },
            { id: "ORDERS_CANCEL", name: "Cancel Orders", description: "Has authority to cancel customer orders and trigger refunds." },
        ]
    },
    {
        name: "Category Management",
        permissions: [
            { id: "CATEGORIES_VIEW", name: "View Categories", description: "Can view the list of product categories." },
            { id: "CATEGORIES_CREATE", name: "Add New", description: "Can create new product categories for the platform." },
            { id: "CATEGORIES_EDIT", name: "Edit Details", description: "Can rename categories and change images." },
            { id: "CATEGORIES_DELETE", name: "Delete", description: "Can permanently remove categories from the system." },
        ]
    },
    {
        name: "Finance & Settlements",
        permissions: [
            { id: "PAYOUTS_VIEW", name: "View Payouts", description: "Can see settlement history and pending requests." },
            { id: "PAYOUTS_PROCESS", name: "Process Payouts", description: "Can approve and mark payout requests as completed." },
            { id: "COMMISSION_EDIT", name: "Adjust Commission", description: "Can change system-wide commission percentages." },
        ]
    },
    {
        name: "User Management",
        permissions: [
            { id: "APP_USERS_VIEW", name: "View Customers", description: "Can see the list of registered app users/customers." },
            { id: "APP_USERS_EDIT", name: "Manage Users", description: "Can block/unblock customers and view their wallets." },
        ]
    },
    {
        name: "System Control",
        permissions: [
            { id: "ROLES_EDIT", name: "Manage Roles", description: "Can create/edit admin roles and their default settings." },
            { id: "AUTHORITY_EDIT", name: "Control Authority", description: "Can modify this matrix and set global permissions." },
        ]
    }
]

// Flat version for the loop
const MODULES = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => ({ ...p, group: g.name })));

import useAdminStore from "@/data/store/useAdminStore"

export default function AuthorityPage() {
    const [mounted, setMounted] = useState(false)
    const { user } = useAuthStore()
    const { 
        roles, 
        loadingRoles: loading, 
        fetchRoles 
    } = useAdminStore()

    const currentUserPermissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    const canView = currentUserPermissions.includes("ALL") || currentUserPermissions.includes("AUTHORITY_EDIT") || currentUserPermissions.includes("ROLES_EDIT")
    const canEditAuthority = currentUserPermissions.includes("ALL") || currentUserPermissions.includes("AUTHORITY_EDIT")

    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
        fetchRoles()
    }, [fetchRoles])

    if (!mounted) return null

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
                await fetchRoles(true) // Force refresh to update store
                toast.success(`Permission updated for ${role.name}`)
            }
        } catch (error) {
            toast.error("Failed to update permission")
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Authority Matrix...</div>

    if (!canView) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-border-custom shadow-sm text-center my-12">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
                <Shield size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-text-muted mt-2 max-w-xs">You do not have permission to view or manage the Authority Matrix.</p>
        </div>
    )

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
                            {MODULES.map((module, idx) => {
                                const showGroup = idx === 0 || MODULES[idx - 1].group !== module.group;
                                return (
                                    <tr key={module.id} className="hover:bg-background-soft/50 transition-colors group">
                                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-background-soft/50 z-10 border-r border-border-custom shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                            {showGroup && (
                                                <div className="text-[10px] text-primary font-black uppercase mb-1">{module.group}</div>
                                            )}
                                            <div className="font-bold text-foreground">{module.name}</div>
                                            <div className="text-[10px] text-text-muted mt-0.5 max-w-[200px] leading-relaxed font-medium">
                                                {module.description}
                                            </div>
                                        </td>
                                        {roles.map((role: any) => {
                                            const isAuthorized = role.permissions.includes(module.id)
                                            const isPending = updating === `${role._id}-${module.id}`

                                            return (
                                                <td key={role._id} className="px-6 py-4 text-center">
                                                    <button
                                                        disabled={isPending || !canEditAuthority}
                                                        onClick={() => togglePermission(role, module.id)}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl transition-all flex items-center justify-center mx-auto relative overflow-hidden group/btn",
                                                            isAuthorized
                                                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                                : "bg-red-50 text-red-400 hover:bg-red-100",
                                                            (isPending || !canEditAuthority) && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        title={!canEditAuthority ? "You don't have permission to modify authority matrix" : ""}
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
                                );
                            })}
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
