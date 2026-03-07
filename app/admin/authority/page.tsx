"use client"

import { Shield, Lock, ShieldCheck, UserPlus, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

const permissions = [
    { role: "Manager", modules: "Products, Orders", users: 5, status: "Active" },
    { role: "Support", modules: "Orders, Customers", users: 8, status: "Active" },
]

export default function AuthorityPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Control Authority</h1>
                    <p className="text-text-muted">Manage system-level permissions and access controls.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium">
                    <ShieldCheck size={16} /> Update Permissions
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom">
                    <h2 className="text-lg font-bold">Role Permissions Matrix</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5 text-xs font-bold text-primary uppercase">
                            <tr>
                                <th className="px-6 py-4">System Role</th>
                                <th className="px-6 py-4">Accessible Modules</th>
                                <th className="px-6 py-4">Active Users</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {permissions.map((p, i) => (
                                <tr key={i} className="hover:bg-background-soft">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-primary" />
                                            <span className="font-bold">{p.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium px-2 py-1 bg-background-soft rounded border">
                                            {p.modules}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold">{p.users}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary-light text-primary">
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className={cn(
                                            "px-4 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                            "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white whitespace-nowrap"
                                        )}>
                                            Take Action
                                        </button>
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
