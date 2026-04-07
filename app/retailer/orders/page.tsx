"use client"

import { useState, useEffect, Suspense, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
    Search,
    MoreVertical,
    Eye,
    Download,
    CheckCircle,
    Package,
    RefreshCw,
    ChevronRight,
    Lock,
    Clock,
    Shield,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import retailerService from "@/data/services/retailerService"
import useOrderStore from "@/data/store/useOrderStore"
import OrderDetailsModal from "@/components/shared/OrderDetailsModal"

const statusStyles: any = {
    "New": "bg-primary-light text-primary border-primary-100",
    "Pending": "bg-warning-50 text-warning border-warning-100",
    "Accepted": "bg-blue-50 text-blue-600 border-blue-100",
    "Rider Assigned": "bg-blue-50 text-blue-600 border-blue-100",
    "Rider Accepted": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Processing": "bg-blue-50 text-blue-600 border-blue-100",
    "Preparing": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Shipped": "bg-blue-50 text-blue-600 border-blue-100",
    "Out for Delivery": "bg-orange-50 text-orange-600 border-orange-100",
    "Delivered": "bg-blue-50 text-blue-600 border-blue-100",
    "Completed": "bg-blue-50 text-blue-600 border-blue-100",
    "Cancelled": "bg-red-50 text-red-100 border-red-100",
}

function OrdersContent() {
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const [riders, setRiders] = useState<any[]>([])
    
    const { 
        orders, 
        loading, 
        fetchOrders, 
        currentPage, 
        totalPages, 
        stats: storeStats 
    } = useOrderStore();

    // Auto-process logic
    const [autoProcessEnabled, setAutoProcessEnabled] = useState(false)
    const autoProcessInterval = useRef<NodeJS.Timeout | null>(null)

    const [searchQuery, setSearchQuery] = useState("")
    const [orderTypeFilter, setOrderTypeFilter] = useState<"All" | "Subscription" | "One-time">("All")
    const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [viewingOrder, setViewingOrder] = useState<any>(null)

    const moreMenuRef = useRef<HTMLDivElement>(null)
    const [showMoreMenu, setShowMoreMenu] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchOrders(currentPage)
    }, [fetchOrders, currentPage])

    const fetchRiders = useCallback(async () => {
        try {
            const res = await retailerService.getRiders()
            if (res.success) {
                setRiders(res.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch riders", error)
        }
    }, [])

    const autoProcessOrders = async () => {
        try {
            const res = await retailerService.bulkProcessOrders();
            if (res.success && res.processed > 0) {
                console.log(`🤖 Auto-processed ${res.processed} orders`);
                fetchOrders(currentPage, null, true);
                fetchRiders();
                toast.info(`🤖 Auto-processed ${res.processed} orders`);
            }
        } catch (error) {
            console.error("Auto-process error:", error);
        }
    };

    useEffect(() => {
        fetchRiders()
    }, [fetchRiders])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (autoProcessEnabled) {
            autoProcessOrders();
            autoProcessInterval.current = setInterval(autoProcessOrders, 30000);
        } else {
            if (autoProcessInterval.current) {
                clearInterval(autoProcessInterval.current);
            }
        }
        return () => {
            if (autoProcessInterval.current) {
                clearInterval(autoProcessInterval.current);
            }
        };
    }, [autoProcessEnabled]);

    // Sync selected order when orders list updates (for real-time timeline)
    useEffect(() => {
        if (selectedOrder) {
            const updated = orders.find((o: any) => o.id === selectedOrder.id);
            if (updated) {
                setSelectedOrder(updated);
            }
        }
    }, [orders, selectedOrder?.id]);

    if (!mounted || (loading && orders.length === 0)) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-2xl" />
        </div>
    }

    const orderStats = storeStats || {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => ['Pending', 'Accepted', 'Processing', 'Preparing', 'Shipped', 'Out for Delivery', 'Rider Assigned', 'Rider Accepted'].includes(o.status)).length,
        completedOrders: orders.filter((o: any) => ['Delivered', 'Completed'].includes(o.status)).length,
        avgOrderValue: "0"
    }

    const statCards = [
        { title: "Total Shop Orders", value: (orderStats.totalOrders || 0).toLocaleString(), color: "bg-primary-light text-primary", filterValue: "All" },
        { title: "Pending Orders", value: (orderStats.pendingOrders || 0).toLocaleString(), color: "bg-warning-50 text-warning", filterValue: "Pending" },
        { title: "Completed", value: (orderStats.completedOrders || 0).toLocaleString(), color: "bg-blue-50 text-blue-600", filterValue: "Completed" },
        { title: "Avg. Order Value", value: `₹${orderStats.avgOrderValue || 0}`, color: "bg-blue-50 text-blue-600", filterValue: null },
    ]

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = orderTypeFilter === "All" || order.orderType === orderTypeFilter

        let matchesStatus = true
        if (statusFilter === "Pending") {
            matchesStatus = ['Pending', 'Accepted', 'Processing', 'Preparing', 'Shipped', 'Out for Delivery', 'Rider Assigned', 'Rider Accepted'].includes(order.status)
        } else if (statusFilter === "Completed") {
            matchesStatus = ['Delivered', 'Completed'].includes(order.status)
        }

        return matchesSearch && matchesType && matchesStatus
    })

    const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
        try {
            const res = await retailerService.updateOrderStatus(orderId, nextStatus)
            if (res.success) {
                toast.success(`Order marked as ${nextStatus}`)
                fetchOrders(currentPage, null, true)
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status")
        }
    }

    const handleAssignRiderSelection = async (orderId: string, riderId: string) => {
        try {
            const res = await retailerService.assignRider(orderId, riderId)
            if (res.success) {
                toast.success("Rider assigned successfully")
                fetchOrders(currentPage, null, true)
            }
        } catch (error) {
            console.error("Failed to assign rider", error)
        }
    }

    const handleExport = () => {
        const exportData = orders.map((o: any) => ({
            "Order ID": o.id,
            "Type": o.orderType,
            "Product": o.product,
            "Total": `₹${o.price}`,
            "Status": o.status
        }))
        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Orders")
        XLSX.writeFile(wb, "Shop_Orders.xlsx")
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shop Orders</h1>
                    <p className="text-text-muted">Manage and fulfill your customer orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoProcessEnabled(!autoProcessEnabled)}
                        className={cn(
                            "relative flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg",
                            autoProcessEnabled
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30"
                                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white/90 shadow-gray-500/20"
                        )}
                    >
                        <RefreshCw size={18} className={cn(autoProcessEnabled && "animate-spin")} />
                        <span>{autoProcessEnabled ? "⚡ AUTO-PROCESS ACTIVE" : "🔘 AUTO-PROCESS OFF"}</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => stat.filterValue && setStatusFilter(stat.filterValue as any)}
                        className={cn(
                            "bg-white p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md",
                            statusFilter === stat.filterValue ? "border-primary ring-1 ring-primary" : "border-border-custom"
                        )}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-text">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-background-soft rounded-lg p-1">
                        {(["All", "Subscription", "One-time"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setOrderTypeFilter(tab)}
                                className={cn(
                                    "text-xs font-bold px-3 py-1.5 rounded-md transition-all",
                                    orderTypeFilter === tab ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-primary"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64 focus:ring-1 focus:ring-primary/20 transition-all"
                        />
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
                                <tr><td colSpan={9} className="px-6 py-12 text-center text-text-muted">No orders found</td></tr>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-background-soft/50 transition-colors cursor-pointer group" onClick={() => setViewingOrder(order)}>
                                        <td className="px-6 py-4 font-bold text-primary group-hover:underline">{order.id}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                                order.orderType === "Subscription" ? "bg-blue-600 text-white" : "bg-blue-600/80 text-white"
                                            )}>
                                                {order.orderType === "Subscription" ? "Sub" : "One-off"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium truncate max-w-[180px]">{order.product}</td>
                                        <td className="px-6 py-4 text-text-muted">{order.date}</td>
                                        <td className="px-6 py-4 font-bold">₹{order.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", order.payment === "Paid" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>
                                                {order.payment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 italic uppercase font-black text-blue-600 text-[10px] tracking-tight">
                                            <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.rider?.id || ""}
                                                onChange={(e) => handleAssignRiderSelection(order.id, e.target.value)}
                                                className="text-[10px] bg-background-soft border-transparent rounded p-1.5 outline-none cursor-pointer hover:border-primary/20 w-32 font-bold uppercase transition-all"
                                            >
                                                <option value="">{order.rider?.name || "Assign R"}</option>
                                                {riders.map((rider: any) => (
                                                    <option key={rider.user?._id || (rider.user as any)} value={rider.user?._id || (rider.user as any)}>{rider.user?.name || "Rider"}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-primary-light text-text-muted hover:text-primary rounded-lg transition-all" title="View Detail">
                                                    <Eye size={18} />
                                                </button>
                                                {order.status === "Pending" ? (
                                                    <button onClick={() => handleStatusUpdate(order.id, "Accepted")} className="p-2 hover:bg-emerald-50 text-text-muted hover:text-emerald-600 rounded-lg transition-all" title="Accept">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                ) : !['Completed', 'Delivered', 'Cancelled'].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, "Completed")}
                                                        className="p-2 hover:bg-blue-50 text-text-muted hover:text-blue-600 rounded-lg transition-all"
                                                        title="Mark Completed"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-border-custom flex items-center justify-between bg-white">
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                            Page <span className="text-primary">{currentPage}</span> of <span className="text-primary">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchOrders(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="p-2 rounded-xl border border-border-custom hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchOrders(i + 1)}
                                    className={cn(
                                        "w-9 h-9 rounded-xl text-xs font-black transition-all",
                                        currentPage === i + 1
                                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                                            : "hover:bg-background-soft text-text-muted"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => fetchOrders(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="p-2 rounded-xl border border-border-custom hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Panel */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-border-custom bg-white">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black tracking-tight text-primary">Status History</h3>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">ID: {selectedOrder.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {!['Completed', 'Delivered', 'Cancelled'].includes(selectedOrder.status) && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "Completed")}
                                        className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle size={14} />
                                        Complete
                                    </button>
                                )}
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-background-soft rounded-full transition-colors text-text-muted">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="mb-8 p-6 rounded-[32px] bg-background-soft border border-border-custom/50 shadow-inner">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Package size={14} className="text-primary" /> Order Content
                                </p>
                                <p className="text-sm font-bold text-primary leading-relaxed">{selectedOrder.product}</p>
                            </div>

                            <div className="space-y-0 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/30 to-transparent" />

                                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                                    selectedOrder.statusHistory.slice().reverse().map((history: any, idx: number) => (
                                        <div key={idx} className="relative pl-9 animate-in fade-in slide-in-from-left-4 duration-500 pb-10 group last:pb-0">
                                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-md bg-primary z-10 group-hover:scale-125 transition-transform" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black text-primary uppercase tracking-tight">{history.status}</span>
                                                    <span className="text-[10px] font-bold text-text-muted bg-white px-2 py-0.5 rounded-lg border shadow-sm tabular-nums">
                                                        {new Date(history.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-muted mt-1 font-medium">{new Date(history.timestamp).toLocaleDateString([], { day: 'numeric', month: 'short' })}</p>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                        history.role === 'system' ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
                                                    )}>
                                                        {history.role === 'system' ? '🤖 AUTO' : '👤 MANUAL'}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-text-muted italic opacity-70">
                                                        {history.role === 'system' ? 'Platform Bot' : 'Store Vendor'}
                                                    </span>
                                                </div>

                                                {history.status === "Rider Assigned" && selectedOrder.rider?.name && (
                                                    <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-black text-blue-700 bg-blue-100/50 px-2.5 py-1.5 rounded-xl w-fit border border-blue-200/50 animate-in zoom-in-75 duration-500">
                                                        <Package size={12} strokeWidth={3} className="text-blue-600" />
                                                        <span className="uppercase tracking-wider">Rider: {selectedOrder.rider.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative pl-9">
                                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-md bg-primary z-10" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-primary uppercase">No History Found</span>
                                            <p className="text-xs text-text-muted mt-1 uppercase font-bold">Standard Lifecycle active</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 border-t border-border-custom bg-white">
                            <div className="flex items-center gap-4 text-primary bg-primary/5 p-4 rounded-3xl border border-primary/10">
                                <Shield size={20} className="shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed opacity-80 uppercase tracking-wide">Secure platform audit trail enabled. Every action is uniquely identified.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewingOrder && (
                <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
            )}
        </div>
    )
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center animate-pulse text-text-muted uppercase font-black">Loading orders relay...</div>}>
            <OrdersContent />
        </Suspense>
    )
}
