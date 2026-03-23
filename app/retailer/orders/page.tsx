"use client"

import { useState, useEffect, Suspense } from "react"
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
    Lock
} from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import socket from "@/data/api/socket"

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
    const [ordersData, setOrdersData] = useState<any>(null)
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [orderTypeFilter, setOrderTypeFilter] = useState<"All" | "Subscription" | "One-time">("All")
    const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [currentPage, setCurrentPage] = useState(1)
    
    // Tooltip State
    const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null)
    const [tooltipStep, setTooltipStep] = useState(1)
    const leaveTimer = useRef<NodeJS.Timeout | null>(null)

    const ORDERS_PER_PAGE = 10

    useEffect(() => {
        const filter = searchParams.get("filter")
        if (filter === "Pending" || filter === "Completed") {
            setStatusFilter(filter)
        } else {
            setStatusFilter("All")
        }
    }, [searchParams])

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

                        const isExisting = prev.orders.find((o: any) => o.id === data.orderId);
                        let updatedOrders;

                        if (isExisting) {
                            // 1. Update existing order
                            updatedOrders = prev.orders.map((o: any) =>
                                o.id === data.orderId ? { ...o, status: newStatus } : o
                            );
                        } else {
                            // 2. Add as NEW order (likely from subscription cron or new app order)
                            // Construct a basic UI-friendly order object from the data
                            const newOrder = {
                                id: data.orderId,
                                product: data.data?.items?.map((i: any) => i.product?.name || "Product").join(", ") || (data.data?.product || "New Order"),
                                date: new Date(data.data?.createdAt || new Date()).toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                }).replace(/\//g, "-"),
                                price: data.data?.totalAmount || data.data?.price || "0.00",
                                payment: data.data?.paymentStatus || "Paid",
                                status: newStatus,
                                orderType: data.data?.orderType || (data.orderId.startsWith("SUB-") ? "Subscription" : "One-time"),
                                rider: data.data?.rider,
                                subscriptionDetails: data.data?.subscriptionDetails
                            };
                            updatedOrders = [newOrder, ...prev.orders];
                        }

                        // 3. Recalculate basic stats for instant feedback
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
        { title: "Total Shop Orders", value: ordersData.stats.totalOrders.toLocaleString(), change: "", trend: "up", color: "bg-primary-light text-primary", filterValue: "All" },
        { title: "Pending Orders", value: ordersData.stats.pendingOrders.toLocaleString(), change: "", trend: "down", color: "bg-warning-50 text-warning", filterValue: "Pending" },
        { title: "Completed", value: ordersData.stats.completedOrders.toLocaleString(), change: ordersData.stats.completedPercentage, trend: "up", color: "bg-blue-50 text-blue-600", filterValue: "Completed" },
        { title: "Avg. Order Value", value: ordersData.stats.avgOrderValue, change: "", trend: "up", color: "bg-blue-50 text-blue-600", filterValue: null },
    ]

    const filteredOrders = ordersData.orders.filter((order: any) => {
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

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    )

    const subscriptionCount = ordersData.orders.filter((o: any) => o.orderType === "Subscription").length
    const oneTimeCount = ordersData.orders.filter((o: any) => o.orderType !== "Subscription").length

    const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
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

    const handleExport = () => {
        try {
            if (!ordersData?.orders || ordersData.orders.length === 0) {
                toast.error("No orders to export")
                return
            }

            // Format data for Excel
            const exportData = ordersData.orders.map((o: any) => ({
                "Order ID": o.id,
                "Type": o.orderType,
                "Product Details": o.product,
                "Date": o.date,
                "Total Amount": `₹${o.price}`,
                "Payment": o.payment,
                "Status": o.status,
                "Rider": o.rider?.name || "Unassigned"
            }))

            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")

            // Adjust column widths
            const wscols = [
                { wch: 15 }, // Order ID
                { wch: 15 }, // Type
                { wch: 40 }, // Product
                { wch: 20 }, // Date
                { wch: 12 }, // Price
                { wch: 12 }, // Payment
                { wch: 15 }, // Status
                { wch: 20 }  // Rider
            ]
            worksheet["!cols"] = wscols

            XLSX.writeFile(workbook, `Shrimpbite_Orders_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Order list exported successfully")
        } catch (error) {
            console.error("Export failed", error)
            toast.error("Failed to export order list")
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
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20"
                        >
                            <Download size={16} />
                            Export List
                        </button>
                        <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                if (stat.filterValue) {
                                    setStatusFilter(stat.filterValue as any)
                                    setCurrentPage(1)
                                }
                            }}
                            className={cn(
                                "bg-white p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between group",
                                stat.filterValue ? "cursor-pointer hover:shadow-md hover:border-primary/50" : "cursor-default border-border-custom shadow-sm",
                                stat.filterValue && statusFilter === stat.filterValue ? "ring-2 ring-primary ring-offset-2 border-primary shadow-md" : "border-border-custom shadow-sm"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className={cn(
                                    "text-xs font-bold uppercase tracking-wider transition-colors",
                                    stat.filterValue && statusFilter === stat.filterValue ? "text-primary" : "text-text-muted"
                                )}>
                                    {stat.title}
                                </p>
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    stat.trend === "up" ? "bg-primary" : "bg-red-500",
                                    stat.filterValue && statusFilter === stat.filterValue && "animate-pulse"
                                )}></div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className={cn(
                                    "text-2xl font-bold transition-all",
                                    stat.filterValue && statusFilter === stat.filterValue ? "text-primary scale-105" : "text-text"
                                )}>
                                    {stat.value}
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
                                        onClick={() => {
                                            setOrderTypeFilter(tab)
                                            setCurrentPage(1)
                                        }}
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
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
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
                                {paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-text-muted">
                                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>No orders found matching "{searchQuery}"</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-background-soft/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                                            <td className="px-6 py-4">
                                                {order.orderType === "Subscription" ? (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                                                        <RefreshCw size={10} />
                                                        Sub
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100 w-fit">
                                                        One-off
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium max-w-[200px]" title={order.product}>
                                                <div className="flex flex-col gap-1">
                                                    <span className="truncate block">{order.product}</span>
                                                    {order.subscriptionDetails && (
                                                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded w-fit">
                                                            {order.subscriptionDetails.frequency === "Weekly"
                                                                ? `Weekly: ${order.subscriptionDetails.customDays?.join(", ") || "No days"}`
                                                                : order.subscriptionDetails.frequency}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-muted whitespace-nowrap text-xs">{order.date}</td>
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
                                            <td className="px-6 py-4 relative group/rider">
                                                {(() => {
                                                    const isLocked = ["New", "Pending", "Accepted"].includes(order.status);
                                                    
                                                    const handleMouseEnter = () => {
                                                        if (!isLocked) return;
                                                        if (leaveTimer.current) clearTimeout(leaveTimer.current);
                                                        setTooltipStep(1); // Always reset to step 1 on new hover
                                                        setHoveredOrderId(order.id);
                                                    };

                                                    const handleMouseLeave = () => {
                                                        leaveTimer.current = setTimeout(() => {
                                                            setHoveredOrderId(null);
                                                            setTooltipStep(1);
                                                        }, 500);
                                                    };

                                                    return (
                                                        <div 
                                                            className="relative"
                                                            onMouseEnter={handleMouseEnter}
                                                            onMouseLeave={handleMouseLeave}
                                                        >
                                                            <select
                                                                value={order.rider?._id || ""}
                                                                onChange={(e) => handleAssignRider(order.id, e.target.value)}
                                                                disabled={isLocked}
                                                                className={cn(
                                                                    "text-xs bg-background-soft border-transparent rounded p-1 outline-none focus:ring-1 focus:ring-primary/30 transition-all w-full",
                                                                    isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30"
                                                                )}
                                                            >
                                                                <option value="">{isLocked ? "🔒 Locked" : "Assign Rider"}</option>
                                                                {riders.map((rider: any) => (
                                                                    <option key={rider._id} value={rider.user?._id}>
                                                                        {rider.user?.name}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {/* Custom Interactive Tooltip */}
                                                            {hoveredOrderId === order.id && isLocked && (
                                                                <div 
                                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white border border-border-custom p-3 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-200"
                                                                    onMouseEnter={() => {
                                                                        if (leaveTimer.current) clearTimeout(leaveTimer.current);
                                                                    }}
                                                                >
                                                                    <div className="text-[11px] leading-relaxed text-text font-medium flex flex-col gap-2">
                                                                        {(() => {
                                                                            const targetStatus = order.status === "Pending" ? "Accepted" : "Processing";
                                                                            const actionGoal = order.status === "Pending" ? "Accept order" : "mark as processing";
                                                                            
                                                                            if (tooltipStep === 1) {
                                                                                return (
                                                                                    <div className="flex items-start gap-2">
                                                                                        <div className="mt-0.5 text-primary"><CheckCircle size={14} /></div>
                                                                                        <p>Mark order as <span className="font-bold text-primary">{targetStatus}</span> to assign a rider.</p>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                            
                                                                            return (
                                                                                <div className="flex items-start gap-2">
                                                                                    <div className="mt-0.5 text-primary"><CheckCircle size={14} /></div>
                                                                                    <p>Click on check icon to {actionGoal}, then assign rider.</p>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                        
                                                                        <div className="flex justify-end border-t pt-2 mt-1">
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setTooltipStep(tooltipStep === 1 ? 2 : 1);
                                                                                }}
                                                                                className="p-1 hover:bg-primary/10 rounded-full text-primary transition-colors border border-primary/20"
                                                                            >
                                                                                <ChevronRight size={14} className={cn("transition-transform", tooltipStep === 2 && "rotate-180")} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {/* Tooltip Arrow */}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
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
                                                        let nextStatus = ""
                                                        let isTerminal = false

                                                        if (order.status === "Pending") {
                                                            nextStatus = "Accepted"
                                                        } else if (order.status === "Accepted") {
                                                            nextStatus = "Processing"
                                                        } else {
                                                            isTerminal = true
                                                        }

                                                        return (
                                                            <button
                                                                onClick={() => !isTerminal && handleStatusUpdate(order.id, nextStatus)}
                                                                disabled={isTerminal}
                                                                className={cn(
                                                                    "p-2 rounded-lg transition-colors",
                                                                    isTerminal
                                                                        ? "text-gray-300 cursor-not-allowed"
                                                                        : "hover:bg-blue-50 text-text-muted hover:text-blue-600"
                                                                )}
                                                                title={isTerminal ? (order.status === "Delivered" ? "Order Delivered" : "No further retailer actions") : `Mark as ${nextStatus}`}
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

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border-custom flex items-center justify-between bg-background-soft/30">
                            <p className="text-xs text-text-muted font-medium">
                                Showing <span className="text-text font-bold">{(currentPage - 1) * ORDERS_PER_PAGE + 1}</span> to <span className="text-text font-bold">{Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)}</span> of <span className="text-text font-bold">{filteredOrders.length}</span> orders
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-soft transition-all"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Show only current, 1st, last, and neighbors if many pages
                                        if (totalPages > 7 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                                            if (Math.abs(pageNum - currentPage) === 2) return <span key={pageNum} className="px-1 text-text-muted">...</span>;
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "w-8 h-8 text-xs font-bold rounded-lg transition-all",
                                                    currentPage === pageNum
                                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                                        : "bg-white border hover:bg-background-soft"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-soft transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
                            <div className="p-6 border-b flex flex-col gap-4">
                                <div>
                                    <p className="text-xs text-text-muted uppercase font-bold mb-2">Current Status</p>
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-black uppercase border",
                                        statusStyles[selectedOrder.status] || "bg-gray-50 text-gray-600"
                                    )}>{selectedOrder.status}</span>
                                </div>
                                {selectedOrder.subscriptionDetails && (
                                    <div>
                                        <p className="text-xs text-text-muted uppercase font-bold mb-2">Subscription Schedule</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-primary">{selectedOrder.subscriptionDetails.frequency}</span>
                                            {selectedOrder.subscriptionDetails.customDays && selectedOrder.subscriptionDetails.customDays.length > 0 && (
                                                <p className="text-xs text-text-muted">Days: {selectedOrder.subscriptionDetails.customDays.join(", ")}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <p className="text-xs text-text-muted uppercase font-bold mb-4">Status History</p>
                                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                                    <div className="space-y-0">
                                        {selectedOrder.statusHistory.map((entry: any, idx: number) => {
                                            const roleColors: any = {
                                                retailer: 'bg-blue-100 text-blue-700',
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

export default function RetailerOrdersPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 bg-background-soft rounded-xl w-1/4" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
                </div>
                <div className="h-96 bg-background-soft rounded-2xl" />
            </div>
        }>
            <OrdersContent />
        </Suspense>
    )
}
