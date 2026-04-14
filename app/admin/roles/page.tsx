"use client"

import { useState, useEffect } from "react"
import { Shield, UserPlus, MoreVertical, Edit2, Trash2, Key, Users, X, Mail, ShieldCheck, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import useAuthStore from "@/data/store/useAuthStore"

import useAdminStore from "@/data/store/useAdminStore"

export default function AdminRolesPage() {
    const [mounted, setMounted] = useState(false)
    const { user } = useAuthStore()
    const { 
        roles, 
        adminsData: admins, 
        loadingRoles: loadingRoleState, 
        loadingAdmins: loadingAdminState,
        fetchRoles, 
        fetchAdmins 
    } = useAdminStore()

    const loading = (loadingRoleState && roles.length === 0) || (loadingAdminState && admins.length === 0)

    const currentUserPermissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    const canView = currentUserPermissions.includes("ALL") || currentUserPermissions.includes("ROLES_EDIT") || currentUserPermissions.includes("AUTHORITY_EDIT")
    const canEditRoles = currentUserPermissions.includes("ALL") || currentUserPermissions.includes("ROLES_EDIT")

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [], securityLevel: 1 })
    const [inviteData, setInviteData] = useState({ name: "", email: "", roleId: "" })
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    const [editedPermissions, setEditedPermissions] = useState<string[]>([])
    
    // Delete Confirmation
    const [roleToDelete, setRoleToDelete] = useState<any>(null)
    const [adminToDelete, setAdminToDelete] = useState<any>(null)
    
    // Permission Matrix
    const [allPossiblePermissions] = useState<any[]>([
        { id: "DASHBOARD_VIEW", name: "View Dashboard", group: "Dashboard", description: "Revenue charts and platform stats" },
        { id: "COMMUNICATION_SEND", name: "Broadcast Hub", group: "Communication", description: "Mass push & email campaigns" },
        { id: "RETAILERS_VIEW", name: "View Retailers", group: "Retailers", description: "Browse registered retailers" },
        { id: "RETAILERS_EDIT", name: "Edit Retailers", group: "Retailers", description: "Modify retailer profiles" },
        { id: "RETAILERS_APPROVE", name: "Approve/Reject", group: "Retailers", description: "Verify new retailer apps" },
        { id: "ORDERS_VIEW", name: "View Orders", group: "Orders", description: "Live tracking & order history" },
        { id: "ORDERS_EDIT", name: "Manage Status", group: "Orders", description: "Change preparation/delivery status" },
        { id: "ORDERS_CANCEL", name: "Cancel Orders", group: "Orders", description: "Refund & cancellation authority" },
        { id: "CATEGORIES_VIEW", name: "View Categories", group: "Categories", description: "View category list" },
        { id: "CATEGORIES_CREATE", name: "Add New", group: "Categories", description: "Create new categories" },
        { id: "CATEGORIES_EDIT", name: "Edit Details", group: "Categories", description: "Rename/Change images" },
        { id: "CATEGORIES_DELETE", name: "Delete", group: "Categories", description: "Permanently remove categories" },
        { id: "PAYOUTS_VIEW", name: "View Payouts", group: "Finance", description: "See settlement history" },
        { id: "PAYOUTS_PROCESS", name: "Process Payouts", group: "Finance", description: "Fulfill payout requests" },
        { id: "COMMISSION_EDIT", name: "Adjust Commission", group: "Finance", description: "Set system commission rates" },
        { id: "APP_USERS_VIEW", name: "View Customers", group: "Users", description: "See app user profiles" },
        { id: "APP_USERS_EDIT", name: "Manage Users", group: "Users", description: "Block/unblock & wallet access" },
        { id: "ROLES_EDIT", name: "Manage Roles", group: "System", description: "Create/edit role templates" },
        { id: "AUTHORITY_EDIT", name: "Control Authority", group: "System", description: "Modify permissions matrix" },
    ])

    useEffect(() => {
        setMounted(true)
        fetchRoles()
        fetchAdmins()
    }, [fetchRoles, fetchAdmins])

    const fetchAdminsList = async (force = false) => {
        await fetchAdmins(force)
    }

    const fetchRolesList = async (force = false) => {
        await fetchRoles(force)
    }

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await adminService.createRole(newRole)
            if (res.success) {
                toast.success("Role created successfully")
                setIsCreateModalOpen(false)
                setNewRole({ name: "", description: "", permissions: [], securityLevel: 1 })
                fetchRoles(true)
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
                fetchRoles(true)
                fetchAdmins(true)
            }
        } catch (error) {
            toast.error("Failed to send invitation")
        }
    }

    const handleDeleteRole = async () => {
        if (!roleToDelete) return
        try {
            const res = await adminService.deleteRole(roleToDelete._id)
            if (res.success) {
                toast.success("Role deleted successfully")
                fetchRoles(true)
                setRoleToDelete(null)
            }
        } catch (error) {
            toast.error("Failed to delete role")
        }
    }

    const handleDeleteAdmin = async () => {
        if (!adminToDelete) return
        try {
            const res = await adminService.deleteAdmin(adminToDelete._id)
            if (res.success) {
                toast.success("Administrator removed successfully")
                fetchAdmins(true)
                setAdminToDelete(null)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to remove administrator")
        }
    }

    const handleChangeAdminRole = async (adminId: string, roleId: string) => {
        try {
            const res = await adminService.updateAdminUser(adminId, { roleId })
            if (res.success) {
                toast.success("Administrator role updated")
                fetchAdmins(true)
            }
        } catch (error) {
            toast.error("Failed to update role")
        }
    }

    const openPermissionModal = (admin: any) => {
        const adminPerms = admin.permissions && admin.permissions.length > 0
            ? admin.permissions
            : (admin.roleId?.permissions || [])
        setSelectedAdmin(admin)
        setEditedPermissions([...adminPerms])
        setIsPermissionModalOpen(true)
    }

    const savePermissions = async () => {
        try {
            const res = await adminService.updateAdminUser(selectedAdmin._id, { permissions: editedPermissions })
            if (res.success) {
                toast.success("Granular permissions updated successfully")
                setIsPermissionModalOpen(false)
                fetchAdmins(true)
            }
        } catch (error) {
            toast.error("Failed to update permissions")
        }
    }

    const togglePermission = (perm: string) => {
        setEditedPermissions(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        )
    }

    if (!mounted) return null

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Staff Management...</div>

    if (!canView) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-border-custom shadow-sm text-center my-12 mx-auto max-w-lg">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
                <Shield size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-text-muted mt-2">You do not have permission to manage administration roles or staff members.</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
                    <p className="text-text-muted">Command center for platform permissions and administrative hierarchy.</p>
                </div>
                {canEditRoles && (
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
                )}
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
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest truncate max-w-[150px]">
                                                    {role.description || "No description"}
                                                    {role.updatedBy?.name && <span className="lowercase italic font-normal ml-2 opacity-60">· by {role.updatedBy.name}</span>}
                                                </p>
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
                                        <div className="flex items-center justify-end gap-2">
                                            {canEditRoles ? (
                                                role.isSystem ? (
                                                    <span className="text-[10px] text-primary/60 italic font-bold">System Role</span>
                                                ) : (
                                                    <button
                                                        onClick={() => setRoleToDelete(role)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors group/trash" title="Delete Role"
                                                    >
                                                       <Trash2 size={18} className="transition-transform group-hover/trash:scale-110" />
                                                    </button>
                                                )
                                            ) : (
                                                <span className="text-[10px] text-text-muted italic">ReadOnly</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active Administrators Section */}
            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-border-custom flex items-center justify-between bg-blue-50/30">
                    <div className="flex items-center gap-3">
                        <Users className="text-blue-600" size={20} />
                        <h3 className="text-lg font-bold">Active Administrators</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-blue-50/50 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Administrator</th>
                                <th className="px-6 py-4">Assigned Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted italic">No administrators found.</td>
                                </tr>
                            ) : admins.map((admin: any) => (
                                <tr key={admin._id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {admin.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{admin.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                                    {admin.email}
                                                    {admin.updatedBy?.name && <span className="lowercase italic font-normal ml-2 opacity-60">· updated by {admin.updatedBy.name}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {admin.roleId?.isSystem ? (
                                            <span className="font-bold text-primary opacity-80 cursor-default">{admin.roleId?.name || "Administrator"}</span>
                                        ) : (
                                            <select
                                                className="bg-transparent border-none outline-none font-bold text-primary cursor-pointer hover:underline"
                                                value={admin.roleId?._id || ""}
                                                onChange={(e) => handleChangeAdminRole(admin._id, e.target.value)}
                                                disabled={!canEditRoles}
                                            >
                                                {roles.map((role: any) => (
                                                    <option key={role._id} value={role._id} className="text-foreground">{role.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-[10px] uppercase font-black tracking-wider">Active</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {!admin.roleId?.isSystem && (
                                                <button
                                                    onClick={() => openPermissionModal(admin)}
                                                    className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-text-muted"
                                                    title="Edit Detailed Permissions"
                                                >
                                                    <Key size={16} />
                                                </button>
                                            )}
                                            {canEditRoles && !admin.roleId?.isSystem && (
                                                <button
                                                    onClick={() => setAdminToDelete(admin)}
                                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-text-muted"
                                                    title="Delete Administrator"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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
            {/* Granular Permission Modal */}
            {isPermissionModalOpen && selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between bg-primary/5">
                            <div>
                                <h3 className="text-lg font-bold">Permissions Override</h3>
                                <p className="text-xs text-text-muted">Setting specific permissions for {selectedAdmin.name}</p>
                            </div>
                            <button onClick={() => setIsPermissionModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
                                <p className="text-xs text-yellow-600 font-medium">
                                    Saving these overrides will ignore the user's role-based defaults and use this specific list instead.
                                </p>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {allPossiblePermissions.map((perm, idx) => {
                                    const showGroup = idx === 0 || allPossiblePermissions[idx - 1].group !== perm.group;
                                    return (
                                        <div key={perm.id}>
                                            {showGroup && (
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 mt-4 px-1">{perm.group}</h4>
                                            )}
                                            <label className={cn(
                                                "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                                                editedPermissions.includes(perm.id)
                                                    ? "bg-primary/5 border-primary/20 ring-4 ring-primary/5"
                                                    : "bg-white border-border-custom hover:border-text-muted/30"
                                            )}>
                                                <div className={cn(
                                                    "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                                    editedPermissions.includes(perm.id) ? "bg-primary border-primary" : "border-border-custom"
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={editedPermissions.includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                    />
                                                    {editedPermissions.includes(perm.id) && <Check size={14} className="text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                                                        {perm.name}
                                                    </div>
                                                    <div className="text-[10px] text-text-muted font-medium mt-0.5 leading-relaxed">
                                                        {perm.description}
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsPermissionModalOpen(false)}
                                    className="flex-1 py-3 border border-border-custom text-text-muted rounded-xl font-bold hover:bg-background-soft transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePermissions}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                                >
                                    Save Overrides
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modals */}
            {(roleToDelete || adminToDelete) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-red-100">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Wait a moment!</h3>
                            <p className="text-sm text-text-muted leading-relaxed">
                                {roleToDelete 
                                    ? `Deleting "${roleToDelete.name}" is a critical action. Any administrators assigned to this role will lose platform access immediately.`
                                    : `Are you sure you want to remove "${adminToDelete.name}"? This will revoke their access across the entire management console.`
                                }
                            </p>
                        </div>
                        <div className="flex border-t border-slate-100 bg-slate-50/50 p-4 gap-3">
                            <button
                                onClick={() => { setRoleToDelete(null); setAdminToDelete(null); }}
                                className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-white transition-all border border-transparent hover:border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={roleToDelete ? handleDeleteRole : handleDeleteAdmin}
                                className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

