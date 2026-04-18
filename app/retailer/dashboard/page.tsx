"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import {
    ShoppingCart,
    Package,
    DollarSign,
    MoreVertical,
    Users,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    X,
    Clock,
    UserPlus,
    CheckCircle,
    Truck
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
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import useRetailerStore from "@/data/store/useRetailerStore"
import useAuthStore from "@/data/store/useAuthStore"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

export default function RetailerDashboard() {
    const [mounted, setMounted] = useState(false)
    const [portalRoot, setPortalRoot] = useState<Element | null>(null)
    const [deliveryIncome, setDeliveryIncome] = useState<number | null>(null)
    const { user } = useAuthStore()

    useEffect(() => {
        setPortalRoot(document.body)
    }, [])
    const { 
        stats: statsData, 
        loading, 
        isShopActive,
        fetchDashboardStats, 
        toggleShopStatus 
    } = useRetailerStore()
    
    const [actionLoading, setActionLoading] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchDashboardStats()
        // Fetch delivery income
        retailerService.getDeliveryIncome()
            .then(res => { if (res.success) setDeliveryIncome(res.data.totalDeliveryIncome) })
            .catch(() => {})
    }, [fetchDashboardStats])

    const handleToggle = async () => {
        // Only show confirmation when OPENING the shop
        if (!isShopActive) {
            setShowStatusModal(true)
            return
        }
        
        // Closing the shop
        executeToggle()
    }

    const executeToggle = async () => {
        setActionLoading(true)
        setShowStatusModal(false)
        try {
            const res = await toggleShopStatus()
            if (res.success) {
                toast.success(res.isShopActive ? "Shop is now ONLINE" : "Shop is now OFFLINE")
                if (res.isShopActive) {
                    setShowConfetti(true)
                    setTimeout(() => setShowConfetti(false), 4500)
                }
            }
        } catch (error) {
            console.error("Toggle failed", error)
            toast.error("Failed to update shop status")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading || (!statsData && mounted)) {
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
        { title: "My Total Sales", value: `₹${statsData?.stats?.totalRevenue?.toLocaleString() || 0}`, change: "", trend: "up", icon: DollarSign, color: "bg-primary-light text-primary", href: "/retailer/revenue" },
        { title: "My Orders", value: statsData?.stats?.totalOrders?.toLocaleString() || 0, change: "", trend: "up", icon: ShoppingCart, color: "bg-blue-50 text-blue-600", href: "/retailer/orders" },
        { title: "Active Products", value: statsData?.stats?.activeProducts?.toLocaleString() || 0, change: "", trend: "neutral", icon: Package, color: "bg-blue-50 text-blue-600", href: "/retailer/products" },
        { title: "My Customers", value: statsData?.stats?.totalCustomers?.toLocaleString() || 0, change: "", trend: "up", icon: Users, color: "bg-purple-50 text-purple-600", href: "/retailer/customers" },
        ...(deliveryIncome !== null
            ? [{ title: "Delivery Income", value: `₹${deliveryIncome.toLocaleString()}`, change: "", trend: "up", icon: Truck, color: "bg-orange-50 text-orange-600", href: "/retailer/settings" }]
            : [])
    ]

    // Time Formatter for Activity Feed
    const formatRelativeTime = (date: string | Date) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays}d ago`;
    };

    const getActivityIcon = (type: string, status: string) => {
        switch (type) {
            case 'order_new': return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'order_status':
                if (status === 'success') return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
                if (status === 'error') return { icon: X, color: 'text-red-600', bg: 'bg-red-50' };
                return { icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'low_stock': return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' };
            case 'customer_new': return { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' };
            default: return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
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
                                "group relative overflow-hidden flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.1em] transition-all border-2",
                                isShopActive
                                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
                                actionLoading && "opacity-70 pointer-events-none"
                            )}
                        >
                            {/* Pure Tailwind CSS Shine Effect */}
                            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/2 skew-x-12 transition-transform duration-[1200ms] ease-in-out z-10" />

                            {actionLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V4a10 10 0 00-10 10h2z"></path>
                                    </svg>
                                    UPDATING...
                                </>
                            ) : (
                                <>
                                    <div className={cn("w-2 h-2 rounded-[4px] relative z-20", isShopActive ? "bg-blue-500 animate-pulse" : "bg-red-500")} />
                                    <span className="relative z-20">{isShopActive ? "Shop is Open" : "Shop is Closed"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Shop Opening Confirmation Modal — rendered via portal to cover sidebar/topbar */}
            {showStatusModal && portalRoot && createPortal(
                <>
                    {/* True full-screen blur: rendered at body level */}
                    <div className="fixed inset-0 bg-black/50" style={{ zIndex: 99998, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} onClick={() => setShowStatusModal(false)} />
                    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 99999 }}>
                    <div className="pointer-events-auto bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[50px] -mr-10 -mt-10 rounded-full" />
                        
                        <div className="p-8 text-center relative z-10">
                            <div className="w-20 h-20 bg-blue-50 rounded-[28px] rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100/50">
                                <CheckCircle className="text-blue-600 -rotate-3" size={36} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black uppercase text-foreground tracking-tight mb-2">Ready to Open?</h3>
                            <p className="text-text-muted font-medium text-sm leading-relaxed px-4">
                                Once online, customers can see your products and place orders. Prepare for new orders to arrive.
                            </p>
                        </div>
                        
                        <div className="flex border-t border-border-custom px-6 py-6 gap-3">
                            <button 
                                onClick={() => setShowStatusModal(false)}
                                className="flex-1 px-6 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs border border-border-custom hover:bg-gray-50 transition-all"
                            >
                                Not Yet
                            </button>
                            <button 
                                onClick={executeToggle}
                                className="flex-1 px-6 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                                Yes, Go Online
                            </button>
                        </div>
                    </div>
                    </div>
                </>, portalRoot
            )}

            {/* Framer Motion Confetti */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                        {[...Array(24)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: `${Math.random() * 100}vw`, y: -100, opacity: 0, scale: 0.5 + Math.random(), rotate: Math.random() * 360 }}
                                animate={{ y: ["0vh", "120vh"], opacity: [0, 1, 0.8, 0], rotate: Math.random() * 720, x: `${(Math.random() * 100) + (Math.sin(i) * 10)}vw` }}
                                transition={{ duration: 2 + Math.random() * 2, ease: [0.4, 0, 0.2, 1], delay: Math.random() * 0.5 }}
                                className={cn(
                                    "absolute w-3 h-3 rounded-sm",
                                    i % 4 === 0 ? "bg-primary shadow-[0_0_12px_rgba(0,150,255,0.6)]" 
                                    : i % 4 === 1 ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]" 
                                    : i % 4 === 2 ? "bg-blue-300 rounded-full" 
                                    : "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                                )}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

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
                            <AreaChart data={statsData?.chartData || []}>
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

                <div className="bg-white p-8 rounded-[40px] border border-border-custom shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-primary">Shop Activity</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Live Feed</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {statsData?.recentActivities && statsData.recentActivities.length > 0 ? (
                            statsData.recentActivities.map((activity: any) => {
                                const { icon: Icon, color, bg } = getActivityIcon(activity.type, activity.status);
                                return (
                                    <div key={activity.id} className="flex gap-4 group cursor-default">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110", bg)}>
                                            <Icon size={20} className={color} />
                                        </div>
                                        <div className="flex-1 border-b border-gray-50 pb-4 group-last:border-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-bold text-text uppercase tracking-tight">{activity.title}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase">
                                                    <Clock size={10} />
                                                    {formatRelativeTime(activity.timestamp)}
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-medium text-text-muted italic leading-relaxed">
                                                {activity.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle size={40} className="text-gray-200 mb-4" />
                                <p className="text-sm font-bold text-text-muted uppercase">No recent activity</p>
                            </div>
                        )}
                    </div>

                    <Link 
                        href="/retailer/orders" 
                        className="mt-8 flex items-center justify-center gap-2 w-full py-4 rounded-[20px] bg-gray-50 hover:bg-primary-light hover:text-primary transition-all text-xs font-black uppercase tracking-widest text-text-muted"
                    >
                        View Full History <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
