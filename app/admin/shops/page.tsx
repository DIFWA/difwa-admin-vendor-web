"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Store, CheckCircle, XCircle, MoreVertical } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Shop {
    _id: string;
    name: string;
    owner: { name: string };
    status: string;
    productsCount?: number;
    revenue?: number;
}

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchShops()
    }, [])

    const fetchShops = async () => {
        setLoading(true)
        try {
            const response = await adminService.getShops()
            setShops(response.data || [])
        } catch (error) {
            console.error("Error fetching shops:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Management</h1>
                    <p className="text-text-muted">Monitor and control all registered retail shops.</p>
                </div>
                <Link href="/admin/shops/add" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md">
                    <Plus size={16} /> Add New Shop
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">All Shops</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search shops..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                    <th className="px-6 py-4">Shop Name</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {filteredShops.map((shop) => (
                                    <tr key={shop._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary-light flex items-center justify-center text-primary">
                                                    <Store size={16} />
                                                </div>
                                                <span className="font-medium">{shop.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted">{shop.owner?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-bold border",
                                                shop.status === "approved" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    shop.status === "under_review" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {shop.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Approve">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Deactivate">
                                                    <XCircle size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-background-soft text-text-muted rounded-lg">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredShops.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-text-muted">No shops found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
