"use client"

import { useState, useEffect } from "react"

import {
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    Package,
    MoreVertical,
    Plus,
    Filter,
} from "lucide-react"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"
import Link from "next/link"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

// Custom Icons for stats that aren't in lucide-react or need specific naming
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}

import useAdminStore from "@/data/store/useAdminStore"

export default function Dashboard() {
    const [mounted, setMounted] = useState(false)
    const { 
        stats: statsData, 
        loadingStats: loading, 
        fetchDashboardStats 
    } = useAdminStore()

    useEffect(() => {
        setMounted(true)
        fetchDashboardStats()
    }, [fetchDashboardStats])

    if (!mounted || (loading && !statsData) || !statsData) {
        return <div className="space-y-6 animate-pulse text-foreground">
            <div className="h-20 bg-background-soft rounded-2xl w-1/3" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const staticCards = [
        {
            title: "Total Orders",
            value: statsData.stats.totalOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: ShoppingCart,
            color: "bg-primary-light text-primary",
            href: "/admin/orders"
        },
        {
            title: "New Orders (24h)",
            value: statsData.stats.newOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: Package,
            color: "bg-blue-50 text-blue-600",
            href: "/admin/orders"
        },
        {
            title: "Completed Orders",
            value: statsData.stats.completedOrders.toLocaleString(),
            change: "",
            trend: "up",
            icon: ShieldCheckIcon,
            color: "bg-blue-50 text-blue-600",
            href: "/admin/orders"
        },
        {
            title: "Canceled Orders",
            value: statsData.stats.canceledOrders.toLocaleString(),
            change: "",
            trend: "down",
            icon: TrashIcon,
            color: "bg-red-50 text-red-600",
            href: "/admin/orders"
        }
    ]

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
                    <p className="text-text-muted">Welcome back, Admin. Here&apos;s a summary of all shop activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium">
                        <Filter size={16} />
                        Filter
                    </button>
                    {/* <Link href="/admin/shops" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Plus size={16} />
                        Add Shop
                    </Link> */}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {staticCards.map((stat, index) => (
                    <Link key={index} href={stat.href} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-xl transition-colors", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <MoreVertical size={18} className="text-text-muted group-hover:text-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted mb-1">{stat.title}</p>
                            <div className="flex items-end gap-2">
                                <h3 className="text-2xl font-bold">{stat.value}</h3>
                                {stat.change && (
                                    <span className={cn(
                                        "text-xs font-bold flex items-center mb-1",
                                        stat.trend === "up" ? "text-primary" : "text-red-500"
                                    )}>
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-text-muted mt-2">Global activity</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold">Platform Orders</h3>
                            <p className="text-sm text-text-muted">Overall performance tracking (Last 7 Days)</p>
                        </div>
                        <div className="flex items-center gap-2 bg-background-soft p-1 rounded-lg">
                            <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md">Last 7 Days</button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-h-0 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0096FF" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0096FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#868889" }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#868889" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#0096FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Recent Shop Activities</h3>
                    <div className="space-y-6 flex-1">
                        {statsData.recentShops.length === 0 ? (
                            <p className="text-sm text-text-muted">No recent activities.</p>
                        ) : (
                            statsData.recentShops.map((shop: any, i: number) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                                        <ShoppingCart size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">New Shop Signed: {shop.businessDetails?.businessName || shop.name}</p>
                                        <p className="text-xs text-text-muted">{new Date(shop.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <Link href="/admin/shops" className="block text-center w-full mt-6 py-2 rounded-lg border text-sm font-medium hover:bg-background-soft transition-all text-text-muted hover:text-foreground">
                        View All Platform Activities
                    </Link>
                </div>
            </div>
        </div>
    )
}
