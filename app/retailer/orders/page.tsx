"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Calendar,
    Download,
    Plus,
    CheckCircle,
    Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

const statusStyles: any = {
    "New": "bg-primary-light text-primary border-primary-100",
    "Pending": "bg-warning-50 text-warning border-warning-100",
    "Accepted": "bg-blue-50 text-blue-600 border-blue-100",
    "Rider Assigned": "bg-blue-50 text-blue-600 border-blue-100",
    "Processing": "bg-blue-50 text-blue-600 border-blue-100",
    "Preparing": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Shipped": "bg-blue-50 text-blue-600 border-blue-100",
    "Out for Delivery": "bg-orange-50 text-orange-600 border-orange-100",
    "Delivered": "bg-green-50 text-green-600 border-green-100",
    "Completed": "bg-green-50 text-green-600 border-green-100",
    "Cancelled": "bg-red-50 text-red-100 border-red-100",
}

import socket from "@/data/api/socket"

export default function RetailerOrdersPage() {
    const [mounted, setMounted] = useState(false)
    const [ordersData, setOrdersData] = useState<any>(null)
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setMounted(true)
        fetchOrders()
        fetchRiders()

        // Socket connection logic
        const userId = localStorage.getItem("userId")
        if (userId) {
            socket.connect()

            socket.on("connect", () => {
                console.log("🟢 Connected to Socket Relay")
                socket.emit("join", `retailer_${userId}`)
            })

            socket.on("orderUpdate", (data) => {
                console.log("⚡ Real-time Order Update:", data)

                // Helper to normalize status casing (e.g., DELIVERED -> Delivered)
                const normalizeStatus = (s: string) => {
                    if (!s) return s;
                    return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                };

                const newStatus = normalizeStatus(data.status);
                toast.info(`Order Update: ${newStatus}`)

                // Instant Local Update for Row and Stats
                if (data.orderId && data.status) {
                    setOrdersData((prev: any) => {
                        if (!prev) return prev;

                        // 1. Update the order in the list
                        const updatedOrders = prev.orders.map((o: any) =>
                            o.id === data.orderId ? { ...o, status: newStatus } : o
                        );

                        // 2. Recalculate basic stats for instant feedback
                        const total = updatedOrders.length;
                        const pending = updatedOrders.filter((o: any) => ['Pending', 'Accepted', 'Processing', 'Preparing', 'Shipped', 'Out for Delivery', 'Rider Assigned'].includes(o.status)).length;
                        const completed = updatedOrders.filter((o: any) => ['Delivered', 'Completed'].includes(o.status)).length;

                        return {
                            ...prev,
                            stats: {
                                ...prev.stats,
                                pendingOrders: pending,
                                completedOrders: completed,
                                completedPercentage: `${Math.round((completed / total) * 100)}%`
                            },
                            orders: updatedOrders
                        };
                    });
                }

                // Still fetch to get correct official data from server
                fetchOrders()
            })

            socket.on("disconnect", () => {
                console.log("🔴 Socket Disconnected")
            })
        }

        return () => {
            socket.off("orderUpdate")
            socket.disconnect()
        }
    }, [])

    const fetchRiders = async () => {
        try {
            const res = await retailerService.getRiders()
            if (res.success) {
                setRiders(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch riders", error)
        }
    }

    const fetchOrders = async () => {
        try {
            const res = await retailerService.getOrders()
            if (res.success) {
                setOrdersData(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch shop orders", error)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted || loading || !ordersData) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-2xl" />
        </div>
    }

    const stats = [
        { title: "Total Shop Orders", value: ordersData.stats.totalOrders.toLocaleString(), change: "", trend: "up", color: "bg-primary-light text-primary" },
        { title: "Pending Orders", value: ordersData.stats.pendingOrders.toLocaleString(), change: "", trend: "down", color: "bg-warning-50 text-warning" },
        { title: "Completed", value: ordersData.stats.completedOrders.toLocaleString(), change: ordersData.stats.completedPercentage, trend: "up", color: "bg-green-50 text-green-600" },
        { title: "Avg. Order Value", value: ordersData.stats.avgOrderValue, change: "", trend: "up", color: "bg-blue-50 text-blue-600" },
    ]

    const filteredOrders = ordersData.orders.filter((order: any) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
        const statusMap: any = {
            "Pending": "Accepted",
            "Accepted": "Preparing",
            "Preparing": "Shipped",
            "Shipped": "Out for Delivery",
            "Out for Delivery": "Delivered",
            "Delivered": "Completed"
        }

        const nextStatus = statusMap[currentStatus]
        if (!nextStatus) return

        try {
            const res = await retailerService.updateOrderStatus(orderId, nextStatus)
            if (res.success) {
                fetchOrders()
            }
        } catch (error) {
            console.error("Failed to update status", orderId, error)
        }
    }

    const handleAssignRider = async (orderId: string, riderId: string) => {
        try {
            const res = await retailerService.assignRider(orderId, riderId)
            if (res.success) {
                toast.success("Rider assigned successfully")
                fetchOrders()
            }
        } catch (error) {
            console.error("Failed to assign rider", error)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Orders</h1>
                    <p className="text-text-muted">Manage and fulfill your customer orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20">
                        <Download size={16} />
                        Export List
                    </button>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.title}</p>
                            <div className={cn("w-2 h-2 rounded-full", stat.trend === "up" ? "bg-primary" : "bg-red-500")}></div>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold">
                                {stat.title === "Avg. Order Value" ? stat.value : stat.value}
                            </h3>
                            {stat.change && (
                                <span className={cn("text-xs font-bold", stat.trend === "up" ? "text-primary" : "text-red-500")}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-lg font-bold">Recent Orders</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Rider</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No orders found matching "{searchQuery}"</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                                        <td className="px-6 py-4 font-medium max-w-[200px] truncate" title={order.product}>{order.product}</td>
                                        <td className="px-6 py-4 text-text-muted whitespace-nowrap">{order.date}</td>
                                        <td className="px-6 py-4 font-bold">₹{order.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "flex items-center gap-1.5 font-semibold",
                                                (order.payment === "Paid" || order.payment === "Success") ? "text-primary" : "text-warning"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", (order.payment === "Paid" || order.payment === "Success") ? "bg-primary" : "bg-warning")}></div>
                                                {order.payment || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[11px] font-black uppercase border whitespace-nowrap",
                                                statusStyles[order.status] || "bg-gray-50 text-gray-600 border-gray-100"
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.rider?._id || ""}
                                                onChange={(e) => handleAssignRider(order.id, e.target.value)}
                                                className="text-xs bg-background-soft border-transparent rounded p-1 outline-none focus:ring-1 focus:ring-primary/30"
                                            >
                                                <option value="">Assign Rider</option>
                                                {riders.map((rider: any) => (
                                                    <option key={rider._id} value={rider.user?._id}>
                                                        {rider.user?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 hover:bg-primary-light text-text-muted hover:text-primary rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, order.status)}
                                                    className="p-2 hover:bg-green-50 text-text-muted hover:text-green-600 rounded-lg transition-colors"
                                                    title="Mark next status"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
