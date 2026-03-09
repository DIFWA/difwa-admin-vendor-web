"use client"

import { useState, useEffect } from "react"
import {
    Search,
    MoreVertical,
    Eye,
    Download,
    CheckCircle,
    Package,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

const statusStyles: any = {
    "New": "bg-primary-light text-primary border-primary-100",
    "Pending": "bg-warning-50 text-warning border-warning-100",
    "Processing": "bg-blue-50 text-blue-600 border-blue-100",
    "Shipped": "bg-blue-50 text-blue-600 border-blue-100",
    "Delivered": "bg-green-50 text-green-600 border-green-100",
    "Completed": "bg-green-50 text-green-600 border-green-100",
    "Cancelled": "bg-red-50 text-red-600 border-red-100",
}

export default function RetailerOrdersPage() {
    const [mounted, setMounted] = useState(false)
    const [ordersData, setOrdersData] = useState<any>(null)
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [orderTypeFilter, setOrderTypeFilter] = useState<"All" | "Subscription" | "One-time">("All")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        setMounted(true)
        fetchOrders()
        fetchRiders()
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

    const filteredOrders = ordersData.orders.filter((order: any) => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = orderTypeFilter === "All" || order.orderType === orderTypeFilter
        return matchesSearch && matchesType
    })

    const subscriptionCount = ordersData.orders.filter((o: any) => o.orderType === "Subscription").length
    const oneTimeCount = ordersData.orders.filter((o: any) => o.orderType !== "Subscription").length

    const handleStatusUpdate = async (orderId: string, currentStatus: string) => {
        const statusMap: any = {
            "Pending": "Processing",
            "Processing": "Shipped",
            "Shipped": "Delivered",
            "Delivered": "Completed"
        }

        const nextStatus = statusMap[currentStatus]
        if (!nextStatus) return  // Already at terminal status

        // Confirmation dialog
        const confirmed = window.confirm(`Are you sure you want to mark this order as "${nextStatus}"?`)
        if (!confirmed) return

        try {
            const res = await retailerService.updateOrderStatus(orderId, nextStatus)
            if (res.success) {
                toast.success(`Order marked as ${nextStatus}`)
                fetchOrders()
            } else {
                toast.error(res.message || "Failed to update status")
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status")
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
        <>
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
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold">Recent Orders</h2>
                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 bg-background-soft rounded-lg p-1">
                                {(["All", "Subscription", "One-time"] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setOrderTypeFilter(tab)}
                                        className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-md transition-all",
                                            orderTypeFilter === tab
                                                ? "bg-white shadow-sm text-primary"
                                                : "text-text-muted hover:text-primary"
                                        )}
                                    >
                                        {tab}
                                        {tab === "Subscription" && (
                                            <span className="ml-1.5 bg-primary/10 text-primary text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                                {subscriptionCount}
                                            </span>
                                        )}
                                        {tab === "One-time" && (
                                            <span className="ml-1.5 bg-gray-100 text-gray-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                                {oneTimeCount}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                                    <th className="px-6 py-4">Type</th>
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
                                            <td className="px-6 py-4">
                                                {order.orderType === "Subscription" ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-green-50 text-green-700 border border-green-200 w-fit">
                                                        <RefreshCw size={10} />
                                                        Sub
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100 w-fit">
                                                        One-off
                                                    </span>
                                                )}
                                            </td>
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
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 hover:bg-primary-light text-text-muted hover:text-primary rounded-lg transition-colors"
                                                        title="View status history"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {(() => {
                                                        const statusMap: any = {
                                                            "Pending": "Accepted", "Accepted": "Preparing",
                                                            "Preparing": "Shipped", "Shipped": "Out for Delivery",
                                                            "Out for Delivery": "Delivered", "Delivered": "Completed"
                                                        }
                                                        const isTerminal = !statusMap[order.status]
                                                        return (
                                                            <button
                                                                onClick={() => !isTerminal && handleStatusUpdate(order.id, order.status)}
                                                                disabled={isTerminal}
                                                                className={cn(
                                                                    "p-2 rounded-lg transition-colors",
                                                                    isTerminal
                                                                        ? "text-gray-300 cursor-not-allowed"
                                                                        : "hover:bg-green-50 text-text-muted hover:text-green-600"
                                                                )}
                                                                title={isTerminal ? `Already ${order.status}` : `Mark as ${statusMap[order.status]}`}
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        )
                                                    })()}
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

            {/* Status History Side Panel */}
            {
                selectedOrder && (
                    <div className="fixed inset-0 z-50 flex">
                        <div className="flex-1 bg-black/30" onClick={() => setSelectedOrder(null)} />
                        <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between p-6 border-b">
                                <div>
                                    <h3 className="text-lg font-bold">Order #{selectedOrder.id}</h3>
                                    <p className="text-sm text-text-muted mt-1">{selectedOrder.product}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-background-soft text-text-muted">
                                    ✕
                                </button>
                            </div>

                            {/* Current Status */}
                            <div className="p-6 border-b">
                                <p className="text-xs text-text-muted uppercase font-bold mb-2">Current Status</p>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-black uppercase border",
                                    statusStyles[selectedOrder.status] || "bg-gray-50 text-gray-600"
                                )}>{selectedOrder.status}</span>
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <p className="text-xs text-text-muted uppercase font-bold mb-4">Status History</p>
                                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                                    <div className="space-y-0">
                                        {selectedOrder.statusHistory.map((entry: any, idx: number) => {
                                            const roleColors: any = {
                                                retailer: 'bg-green-100 text-green-700',
                                                rider: 'bg-orange-100 text-orange-700',
                                                system: 'bg-gray-100 text-gray-600',
                                                user: 'bg-blue-100 text-blue-700'
                                            }
                                            const isLast = idx === selectedOrder.statusHistory.length - 1
                                            return (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={cn(
                                                            "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                                                            isLast ? "bg-primary" : "bg-gray-200"
                                                        )} />
                                                        {!isLast && <div className="w-0.5 h-full bg-gray-100 mt-1" />}
                                                    </div>
                                                    <div className="pb-6">
                                                        <p className="font-bold text-sm">{entry.status}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", roleColors[entry.role] || roleColors.system)}>
                                                                {entry.role}
                                                            </span>
                                                            <span className="text-xs text-text-muted">
                                                                {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-text-muted text-sm">No status history recorded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </>
    )
}
