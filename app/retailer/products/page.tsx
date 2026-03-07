"use client"

import { useState, useEffect } from "react"
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
    AlertCircle,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    silverPrice: number;
    goldPrice: number;
    category: { _id: string; name: string };
    images: string[];
    stock: number;
    stockStatus: string;
    status: string;
}

export default function RetailerProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("All Products")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const response = await retailerService.getProducts()
            setProducts(response.data)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        try {
            await retailerService.deleteProduct(id)
            setProducts(products.filter(p => p._id !== id))
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === "All Products" || p.status === activeTab
        return matchesSearch && matchesTab
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Products</h1>
                    <p className="text-text-muted">Manage your shop's inventory and listings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/retailer/products/add" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Plus size={16} />
                        Add New Item
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">My Products</p>
                        <h3 className="text-2xl font-bold">{products.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Active Listings</p>
                        <h3 className="text-2xl font-bold">{products.filter(p => p.status === "Published").length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Low Stock</p>
                        <h3 className="text-2xl font-bold">{products.filter(p => p.stockStatus === "Low Stock").length}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-300 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg">
                        {["All Products", "Published", "Draft"].map((tab) => (
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
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search my inventory"
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64 uppercase tracking-tighter"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Loading Inventory...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                <Package size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-primary uppercase">No Products Found</h3>
                            <p className="text-sm text-text-muted mt-1 uppercase tracking-tighter">Start adding your catch to see them here.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 text-xs font-black text-primary uppercase tracking-widest border-b border-gray-300">
                                    <th className="px-6 py-4">No.</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300 text-sm">
                                {filteredProducts.map((p, i) => (
                                    <tr key={p._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-text-muted font-bold">{i + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border shadow-sm">
                                                    <img src={p.images[0] || "https://images.unsplash.com/photo-1559742811-822873691df8?q=80&w=100&h=100&auto=format&fit=crop"} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary uppercase">{p.name}</p>
                                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{p.category?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="font-black text-primary">{p.stock}kg</p>
                                            <p className={cn(
                                                "text-[9px] font-black uppercase",
                                                p.stockStatus === "In Stock" ? "text-green-500" : "text-red-500"
                                            )}>{p.stockStatus}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-primary">₹{p.price}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                                p.status === "Published" ? "bg-primary-light text-primary" : "bg-gray-100 text-gray-400"
                                            )}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/retailer/products/edit/${p._id}`}
                                                    className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-6 border-t border-gray-300 flex items-center justify-between">
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-primary-light text-primary">1</button>
                    </div>
                    <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
