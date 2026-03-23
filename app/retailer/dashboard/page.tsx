"use client"

import { useState, useEffect } from "react"
import {
    ShoppingCart,
    Package,
    DollarSign,
    MoreVertical,
    Users,
    ChevronRight,
    TrendingUp,
    TrendingDown,
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import Link from "next/link"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"

export default function RetailerDashboard() {
    const [mounted, setMounted] = useState(false)
    const [shopActive, setShopActive] = useState<boolean>(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [statsData, setStatsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setMounted(true)
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await retailerService.getDashboardStats()
            if (res.success) {
                setStatsData(res.data)
                if (res.data.stats.isShopActive !== undefined) {
                    setShopActive(res.data.stats.isShopActive)
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async () => {
        setActionLoading(true)
        try {
            await retailerService.toggleShopStatus()
            setShopActive(!shopActive)
        } catch (error) {
            console.error("Toggle failed", error)
        } finally {
            setActionLoading(false)
        }
    }

    if (!mounted || loading || !statsData) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-24 bg-background-soft rounded-[40px] w-full" />
            <div className="h-48 bg-background-soft rounded-[40px] w-full" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const staticCards = [
        { title: "My Total Sales", value: `₹${statsData.stats.totalRevenue.toLocaleString()}`, change: "", trend: "up", icon: DollarSign, color: "bg-primary-light text-primary", href: "/retailer/revenue" },
        { title: "My Orders", value: statsData.stats.totalOrders.toLocaleString(), change: "", trend: "up", icon: ShoppingCart, color: "bg-blue-50 text-blue-600", href: "/retailer/orders" },
        { title: "Active Products", value: statsData.stats.activeProducts.toLocaleString(), change: "", trend: "neutral", icon: Package, color: "bg-blue-50 text-blue-600", href: "/retailer/products" },
        { title: "My Customers", value: statsData.stats.totalCustomers.toLocaleString(), change: "", trend: "up", icon: Users, color: "bg-purple-50 text-purple-600", href: "/retailer/customers" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Shop Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-border-custom shadow-sm">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Shop Console</h1>
                    <p className="text-text-muted mt-1 font-medium">Manage your digital storefront and logistics hub.</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="h-12 w-[1px] bg-gray-100 hidden md:block" />
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Live Availability</p>
                        <button
                            onClick={handleToggle}
                            disabled={actionLoading}
                            className={cn(
                                "flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.1em] transition-all border-2",
                                shopActive
                                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full", shopActive ? "bg-blue-500 animate-pulse" : "bg-red-500")} />
                            {shopActive ? "Shop is Open" : "Shop is Closed"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Prep List Focus */}
            <Link
                href="/retailer/prep-list"
                className="block group relative overflow-hidden bg-primary rounded-[40px] p-8 text-white shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Package size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Package className="text-white" size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Operational Priority</span>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Today&apos;s Prep List</h2>
                        <p className="mt-2 text-white/70 font-medium max-w-md">View the required items that need to be prepared for upcoming deliveries today.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs group-hover:bg-primary-light transition-colors">
                        View Prep Details <ChevronRight size={18} />
                    </div>
                </div>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {staticCards.map((stat, index) => (
                    <Link key={index} href={stat.href} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <MoreVertical className="text-text-muted cursor-pointer group-hover:text-foreground" size={18} />
                        </div>
                        <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                            {stat.change && (
                                <span className={cn(
                                    "text-xs font-bold flex items-center mb-1",
                                    stat.trend === "up" ? "text-primary" : "text-text-muted"
                                )}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Sales Performance (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0096FF" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0096FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area type="monotone" dataKey="sales" stroke="#0096FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-6">Recent Shop Activity</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <ShoppingCart size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">New Orders: {statsData.stats.newOrders}</p>
                                    <p className="text-xs text-text-muted">In the last 24 hours</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                    <Package size={18} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Active Products: {statsData.stats.activeProducts}</p>
                                    <p className="text-xs text-text-muted">Currently live</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="/retailer/prep-list" className="block text-center mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm font-bold text-gray-700">
                        View Prep List
                    </Link>
                </div>
            </div>
        </div>
    )
}
