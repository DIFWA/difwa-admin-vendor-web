"use client"

import { useState } from "react"
import { Shield, UserPlus, MoreVertical, Edit2, Trash2, Key, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const roles = [
    { id: 1, name: "Manager", users: 5, permissions: "Products, Orders, Customers", status: "Active", lastAssigned: "Feb 18, 2026" },
    { id: 2, name: "Support Staff", users: 12, permissions: "Orders, Reviews, Customers", status: "Active", lastAssigned: "Jan 15, 2026" },
    { id: 3, name: "Content Editor", users: 3, permissions: "Products, Categories", status: "Inactive", lastAssigned: "Dec 10, 2025" },
]

export default function AdminRolesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
                    <p className="text-text-muted">Command center for platform permissions and administrative hierarchy.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20">
                    <UserPlus size={16} /> Create New Role
                </button>
            </div>

            {/* Role Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Active Admins", value: "22", icon: Users, color: "text-primary", bg: "bg-primary-light" },
                    { label: "Security Level", value: "Enterprise", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
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
                                <th className="px-6 py-4">Active Capacity</th>
                                <th className="px-6 py-4">Last Modified</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-background-soft/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary-light group-hover:text-primary transition-all">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{role.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{role.permissions.split(",")[0]}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex gap-0.5">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={cn("w-1.5 h-3 rounded-sm", i < (role.name === "Manager" ? 2 : role.name === "Support Staff" ? 1 : 0) ? "bg-primary" : "bg-slate-200")}></div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-text-muted">{role.name === "Manager" ? "Level 2" : role.name === "Support Staff" ? "Level 1" : "Level 0"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {[...Array(Math.min(role.users, 3))].map((_, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${role.id}${i}`} alt="" />
                                                </div>
                                            ))}
                                            {role.users > 3 && (
                                                <div className="w-7 h-7 rounded-full border-2 border-white bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary">
                                                    +{role.users - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-muted">{role.lastAssigned}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded text-[10px] font-black uppercase border",
                                            role.status === "Active" ? "bg-primary-light text-primary border-primary/10" : "bg-red-50 text-red-500 border-red-100"
                                        )}>
                                            {role.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-primary-light hover:text-primary rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
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
        </div>
    )
}
