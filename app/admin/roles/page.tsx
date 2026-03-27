"use client"

import { useState, useEffect } from "react"
import { Shield, UserPlus, MoreVertical, Edit2, Trash2, Key, Users, X, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"

export default function AdminRolesPage() {
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [], securityLevel: 1 })
    const [inviteData, setInviteData] = useState({ name: "", email: "", roleId: "" })

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

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await adminService.createRole(newRole)
            if (res.success) {
                toast.success("Role created successfully")
                setIsCreateModalOpen(false)
                setNewRole({ name: "", description: "", permissions: [], securityLevel: 1 })
                fetchRoles()
            }
        } catch (error) {
            toast.error("Failed to create role")
        }
    }

    const handleInviteAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await adminService.inviteAdmin(inviteData.name, inviteData.email, inviteData.roleId)
            if (res.success) {
                toast.success("Invitation sent successfully")
                setIsInviteModalOpen(false)
                setInviteData({ name: "", email: "", roleId: "" })
                fetchRoles() // Refresh to see updated "Active Capacity" if user count is returned
            }
        } catch (error) {
            toast.error("Failed to send invitation")
        }
    }

    const handleDeleteRole = async (id: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return
        try {
            const res = await adminService.deleteRole(id)
            if (res.success) {
                toast.success("Role deleted successfully")
                fetchRoles()
            }
        } catch (error) {
            toast.error("Failed to delete role")
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Access Control...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
                    <p className="text-text-muted">Command center for platform permissions and administrative hierarchy.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all text-sm font-medium"
                    >
                        <Mail size={16} /> Invite Admin
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20"
                    >
                        <UserPlus size={16} /> Create New Role
                    </button>
                </div>
            </div>

            {/* Role Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Roles", value: roles.length.toString(), icon: Shield, color: "text-primary", bg: "bg-primary-light" },
                    { label: "Security Level", value: "Enterprise", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "System Health", value: "Optimal", icon: Key, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                        <div className={cn("p-4 rounded-xl", stat.bg, stat.color)}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-lg font-bold">Role Hierarchy</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-background-soft rounded-lg transition-colors">
                            <MoreVertical size={18} className="text-text-muted" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Role Profile</th>
                                <th className="px-6 py-4">Security Level</th>
                                <th className="px-6 py-4">Permissions</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted italic">No roles created yet.</td>
                                </tr>
                            ) : roles.map((role: any) => (
                                <tr key={role._id} className="hover:bg-background-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary-light group-hover:text-primary transition-all">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{role.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest truncate max-w-[150px]">{role.description || "No description"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex gap-0.5">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={cn("w-1.5 h-3 rounded-sm", i < role.securityLevel ? "bg-primary" : "bg-slate-200")}></div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-text-muted">Level {role.securityLevel}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions?.slice(0, 3).map((p: string) => (
                                                <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-bold">{p}</span>
                                            ))}
                                            {role.permissions?.length > 3 && (
                                                <span className="text-[10px] font-bold text-text-muted">+{role.permissions.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-primary-light hover:text-primary rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role._id)}
                                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Role Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between bg-primary/5">
                            <h3 className="text-lg font-bold">Create New Role</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Role Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="e.g. Sales Manager"
                                    value={newRole.name}
                                    onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium h-24"
                                    placeholder="Brief description of responsibilities..."
                                    value={newRole.description}
                                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Security Level (0-3)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="3"
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    value={newRole.securityLevel}
                                    onChange={e => setNewRole({ ...newRole, securityLevel: parseInt(e.target.value) })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 mt-2"
                            >
                                Create Role
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Admin Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between bg-blue-50">
                            <h3 className="text-lg font-bold text-blue-600">Invite New Administrator</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-blue-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInviteAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                    placeholder="e.g. John Doe"
                                    value={inviteData.name}
                                    onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                                    placeholder="john@example.com"
                                    value={inviteData.email}
                                    onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Assign Role</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-border-custom rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium appearance-none"
                                    value={inviteData.roleId}
                                    onChange={e => setInviteData({ ...inviteData, roleId: e.target.value })}
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map((role: any) => (
                                        <option key={role._id} value={role._id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 flex gap-2">
                                    <Mail size={14} className="shrink-0" />
                                    <span>User will receive an email with their temporary login credentials and instructions.</span>
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 mt-2"
                            >
                                Send Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
