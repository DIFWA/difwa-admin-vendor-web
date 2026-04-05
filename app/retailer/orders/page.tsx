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
    Lock,
    Clock
} from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import useAuthStore from "@/data/store/useAuthStore"
import useOrderStore from "@/data/store/useOrderStore"
import useRetailerStore from "@/data/store/useRetailerStore"

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
    const { user } = useAuthStore()
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    
    // Stores
    const { 
        orders, 
        loading, 
        fetchOrders, 
        updateOrderStatus, 
        assignRider,
        initSocketListeners 
    } = useOrderStore()
    const { riders, fetchRiders } = useRetailerStore()

    const [searchQuery, setSearchQuery] = useState("")
    const [orderTypeFilter, setOrderTypeFilter] = useState<"All" | "Subscription" | "One-time">("All")
    const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Completed">("All")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [currentPage, setCurrentPage] = useState(1)
    
    // Tooltip State
    const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null)
    const [tooltipStep, setTooltipStep] = useState(1)
    const leaveTimer = useRef<NodeJS.Timeout | null>(null)
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const moreMenuRef = useRef<HTMLDivElement>(null)

    const ORDERS_PER_PAGE = 10

    useEffect(() => {
        const filter = searchParams.get("filter")
        if (filter === "Pending" || filter === "Completed") {
            setStatusFilter(filter)
        } else {
            setStatusFilter("All")
        }

        const idParam = searchParams.get("id")
        if (idParam) {
            setSearchQuery(idParam)
        }
    }, [searchParams])

    useEffect(() => {
        setMounted(true)
        fetchOrders()
        fetchRiders()
        if (user?._id) {
            initSocketListeners(user._id)
        }
    }, [user?._id, fetchOrders, fetchRiders, initSocketListeners])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (loading || (orders.length === 0 && mounted)) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-2xl" />
        </div>
    }

    // Since our orders logic might depend on stats from retailerService, 
    // we'll calculate local stats based on the orders in store for consistency.
    const orderStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => ['Pending', 'Accepted', 'Processing', 'Preparing', 'Shipped', 'Out for Delivery', 'Rider Assigned', 'Rider Accepted'].includes(o.status)).length,
        completedOrders: orders.filter((o: any) => ['Delivered', 'Completed'].includes(o.status)).length,
        avgOrderValue: orders.length > 0 ? `₹${Math.round(orders.reduce((acc: number, o: any) => acc + parseFloat(o.price || 0), 0) / orders.length)}` : "₹0"
    }

    const stats = [
        { title: "Total Shop Orders", value: orderStats.totalOrders.toLocaleString(), change: "", trend: "up", color: "bg-primary-light text-primary", filterValue: "All" },
        { title: "Pending Orders", value: orderStats.pendingOrders.toLocaleString(), change: "", trend: "down", color: "bg-warning-50 text-warning", filterValue: "Pending" },
        { title: "Completed", value: orderStats.completedOrders.toLocaleString(), change: "", trend: "up", color: "bg-blue-50 text-blue-600", filterValue: "Completed" },
        { title: "Avg. Order Value", value: orderStats.avgOrderValue, change: "", trend: "up", color: "bg-blue-50 text-blue-600", filterValue: null },
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

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE
    )

    const subscriptionCount = orders.filter((o: any) => o.orderType === "Subscription").length
    const oneTimeCount = orders.filter((o: any) => o.orderType !== "Subscription").length

    const handleStatusUpdate = async (orderId: string, nextStatus: string) => {
        // Confirmation dialog
        const confirmed = window.confirm(`Are you sure you want to mark this order as "${nextStatus}"?`)
        if (!confirmed) return

        try {
            const res = await updateOrderStatus(orderId, nextStatus)
            if (res.success) {
                toast.success(`Order marked as ${nextStatus}`)
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update status")
        }
    }

    const handleAssignRiderSelection = async (orderId: string, riderId: string) => {
        try {
            const res = await assignRider(orderId, riderId)
            if (res.success) {
                toast.success("Rider assigned successfully")
            }
        } catch (error) {
            console.error("Failed to assign rider", error)
        }
    }

    const handleBulkAccept = async () => {
        const pendingOrders = orders.filter((o: any) => o.status === "Pending")
        if (pendingOrders.length === 0) {
            toast.info("No pending orders to accept")
            return
        }

        if (!window.confirm(`Are you sure you want to accept all ${pendingOrders.length} pending orders?`)) return

        try {
            const promises = pendingOrders.map((o: any) => updateOrderStatus(o.id, "Accepted"))
            await Promise.all(promises)
            toast.success(`Successfully accepted ${pendingOrders.length} orders`)
            setShowMoreMenu(false)
        } catch (error) {
            toast.error("Failed to accept some orders")
        }
    }

    const handleExport = () => {
        try {
            if (!orders || orders.length === 0) {
                toast.error("No orders to export")
                return
            }

            // Format data for Excel
            const exportData = orders.map((o: any) => ({
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
                        <div className="relative" ref={moreMenuRef}>
                            <button 
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className={cn(
                                    "p-2 rounded-lg border transition-all",
                                    showMoreMenu ? "bg-primary/10 border-primary text-primary" : "bg-white hover:bg-background-soft border-border-custom text-text-muted"
                                )}
                            >
                                <MoreVertical size={18} />
                            </button>
                            
                            {showMoreMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-border-custom shadow-xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                                    <button 
                                        onClick={() => {
                                            fetchOrders(null, true);
                                            fetchRiders();
                                            setShowMoreMenu(false);
                                            toast.success("Data refreshed");
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background-soft transition-colors"
                                    >
                                        <RefreshCw size={16} className="text-primary" />
                                        Refresh Data
                                    </button>
                                    <button 
                                        onClick={handleBulkAccept}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background-soft transition-colors"
                                    >
                                        <CheckCircle size={16} className="text-emerald-500" />
                                        Accept All Pending
                                    </button>
                                    <button 
                                        onClick={() => {
                                            window.print();
                                            setShowMoreMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background-soft transition-colors"
                                    >
                                        <Download size={16} className="text-blue-500" />
                                        Print/Save View
                                    </button>
                                </div>
                            )}
                        </div>
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
                                                                onChange={(e) => handleAssignRiderSelection(order.id, e.target.value)}
                                                                disabled={isLocked}
                                                                className={cn(
                                                                    "text-xs bg-background-soft border-transparent rounded p-1 outline-none focus:ring-1 focus:ring-primary/30 transition-all w-full",
                                                                    isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30"
                                                                )}
                                                            >
                                                                <option value="">{isLocked ? "🔒 Locked" : "Assign Rider"}</option>
                                                                {riders.map((rider: any) => (
                                                                    <option key={rider._id || rider.user?._id} value={rider.user?._id}>
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

                            {/* Timeline Placeholder - In real app, this would be fetched history */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                <p className="text-xs text-text-muted uppercase font-bold mb-6">Status History</p>
                                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                    <div className="flex gap-4 relative">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm">
                                            <CheckCircle size={10} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{selectedOrder.status}</p>
                                            <p className="text-xs text-text-muted mt-1 italic">Order state updated to {selectedOrder.status}</p>
                                            <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 font-bold">
                                                <Clock size={10} /> Just now
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 z-10 border-4 border-white">
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-muted uppercase">Pending</p>
                                            <p className="text-xs text-text-muted mt-1 italic">Order received by the shop</p>
                                            <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1 font-bold">
                                                <Clock size={10} /> {selectedOrder.date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersContent />
        </Suspense>
    )
}
