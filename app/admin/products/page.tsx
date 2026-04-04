"use client"

import { useState } from "react"
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Package,
    TrendingUp,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const products = [
    { id: 1, name: "20L Mineral Water Can", category: "Water Cans", price: "40.00", stock: 145, status: "In Stock", image: "https://images.unsplash.com/photo-1523362628242-f513a009a0e1?q=80&w=100&h=100&auto=format&fit=crop" },
    { id: 2, name: "500ml Bottled Water (Pack of 24)", category: "Bottled Water", price: "280.00", stock: 12, status: "Low Stock", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80" },
    { id: 3, name: "1L Drinking Water Bottle", category: "Bottled Water", price: "20.00", stock: 85, status: "In Stock", image: "https://images.unsplash.com/photo-1616118132296-38e196e7ef4e?q=80&w=100&h=100&auto=format&fit=crop" },
    { id: 4, name: "Distilled Water 5L", category: "Industrial", price: "120.00", stock: 0, status: "Out of Stock", image: "https://images.unsplash.com/photo-1551842866-9304a0e7136f?q=80&w=100&h=100&auto=format&fit=crop" },
    { id: 5, name: "Water Dispenser Pump", category: "Accessories", price: "450.00", stock: 45, status: "In Stock", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=100&h=100&auto=format&fit=crop" },
]

export default function ProductsPage() {
    const [activeTab, setActiveTab] = useState("All Products")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Product List</h1>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products/add" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Plus size={16} />
                        Add Product
                    </Link>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Products</p>
                        <h3 className="text-2xl font-bold">145</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Active Listings</p>
                        <h3 className="text-2xl font-bold">132</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Low Stock</p>
                        <h3 className="text-2xl font-bold">12</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg">
                        {["All Products", "Published", "Draft", "Archived"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    activeTab === tab ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search products"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 flex items-center gap-1">Stock <ArrowUpDown size={12} /></th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {products.map((p, i) => (
                                <tr key={p.id} className="hover:bg-background-soft/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <input type="checkbox" className="rounded accent-primary" />
                                        <span className="text-text-muted font-medium">{i + 1}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border">
                                                <img src={p.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-semibold">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted font-medium">{p.category}</td>
                                    <td className="px-6 py-4 font-bold">₹{p.price}</td>
                                    <td className="px-6 py-4 font-bold">{p.stock}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                            p.status === "In Stock" ? "bg-primary-light text-primary" :
                                                p.status === "Low Stock" ? "bg-warning-50 text-warning" : "bg-red-50 text-red-500"
                                        )}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-border-custom flex items-center justify-between">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-primary-light text-primary">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-text-muted hover:bg-background-soft">2</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-text-muted hover:bg-background-soft">3</button>
                    </div>
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
