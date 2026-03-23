"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
    Search,
    Filter,
    ArrowUpDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Download,
    Package,
    RefreshCw,
    Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
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
    "Cancelled": "bg-red-50 text-red-600 border-red-100",
}

function AdminOrdersContent() {
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const [ordersData, setOrdersData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [typeFilter, setTypeFilter] = useState("All")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const ORDERS_PER_PAGE = 10

    useEffect(() => {
        setMounted(true)
        
        // Initial fetch
        fetchOrders(1, searchQuery, statusFilter, typeFilter)

        // Socket connection logic for Admin
        socket.connect()

        socket.on("connect", () => {
            console.log("🟢 Admin Connected to Socket Relay")
            socket.emit("join", "admin")
        })

        socket.on("orderUpdate", (data) => {
            console.log("⚡ Real-time Order Update (Admin):", data)
            toast.info(`Order Update: ${data.orderId} is now ${data.status}`)
            fetchOrders(currentPage, searchQuery, statusFilter, typeFilter) // Refresh with current filters
        })

        return () => {
            socket.off("orderUpdate")
            socket.disconnect()
        }
    }, [])

    // Trigger fetch on filter/page change with debounce for search
    useEffect(() => {
        if (!mounted) return;
        
        const timeoutId = setTimeout(() => {
            fetchOrders(currentPage, searchQuery, statusFilter, typeFilter)
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [currentPage, searchQuery, statusFilter, typeFilter])

    const fetchOrders = async (page: number, search: string, status: string, type: string) => {
        setLoading(true)
        try {
            const params: any = {
                page,
                limit: ORDERS_PER_PAGE,
                search
            };

            if (status !== "All") params.status = status;
            if (type !== "All") params.type = type;

            const res = await adminService.getOrders(params)
            if (res.success) {
                setOrdersData(res.data)
                setTotalPages(res.pagination.totalPages)
                setTotalItems(res.pagination.totalOrders)
            }
        } catch (error) {
            console.error("Failed to fetch admin orders", error)
            toast.error("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    if (!mounted || !ordersData) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-2xl" />
        </div>
    }

    const stats = [
        { title: "Total Orders", value: ordersData.stats.totalOrders.toLocaleString(), color: "bg-primary-light text-primary", filterValue: "All" },
        { title: "Pending Orders", value: ordersData.stats.pendingOrders.toLocaleString(), color: "bg-warning-50 text-warning", filterValue: "Pending" },
        { title: "Completed", value: ordersData.stats.completedOrders.toLocaleString(), color: "bg-blue-50 text-blue-600", filterValue: "Completed" },
        { title: "Cancelled", value: ordersData.stats.canceledOrders.toLocaleString(), color: "bg-red-50 text-red-600", filterValue: "Cancelled" },
    ]

    const handleExport = () => {
        try {
            // Note: Exporting only current view for now, usually admin expects ALL data
            // To export ALL data, we might need a separate endpoint or fetch all without limit
            const exportData = ordersData.orders.map((o: any) => ({
                "Order ID": o.orderId,
                "Type": o.orderType,
                "Shop": o.items?.[0]?.retailer?.businessDetails?.businessName || "N/A",
                "Product": o.items?.map((i: any) => i.product?.name).join(", "),
                "Date": new Date(o.createdAt).toLocaleString(),
                "Amount": `₹${o.totalAmount}`,
                "Payment": o.paymentStatus,
                "Status": o.status
            }))

            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Orders Current Page")
            XLSX.writeFile(workbook, `Shrimbite_Admin_Orders_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Orders exported successfully")
        } catch (error) {
            toast.error("Export failed")
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
                    <p className="text-text-muted">Monitor and track every order across all shops.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20"
                    >
                        <Download size={16} />
                        Export All
                    </button>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setStatusFilter(stat.filterValue)
                            setCurrentPage(1)
                        }}
                        className={cn(
                            "bg-white p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md",
                            statusFilter === stat.filterValue ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-border-custom shadow-sm"
                        )}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-text">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold">Comprehensive Order List</h2>
                        <div className="flex items-center gap-1 bg-background-soft rounded-lg p-1">
                            {(["All", "Subscription", "One-time"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setTypeFilter(tab)
                                        setCurrentPage(1)
                                    }}
                                    className={cn(
                                        "text-xs font-bold px-3 py-1.5 rounded-md transition-all",
                                        typeFilter === tab ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-primary"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search by ID, product, or shop..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-72 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Order Id</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Shop Name</th>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-1 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {(loading || ordersData.orders.length === 0) ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-text-muted">
                                        {loading ? (
                                            <div className="flex justify-center"><RefreshCw className="animate-spin text-primary" /></div>
                                        ) : (
                                            <>
                                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                                <p>No orders found matching your criteria.</p>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                ordersData.orders.map((order: any, i: number) => (
                                    <tr key={order._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 text-text-muted font-medium">
                                            {(currentPage - 1) * ORDERS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-primary">{order.orderId}</td>
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
                                        <td className="px-6 py-4 font-semibold text-text">
                                            {order.items?.[0]?.retailer?.businessDetails?.businessName || "Unknown Shop"}
                                        </td>
                                        <td className="px-6 py-4 font-medium max-w-[200px]">
                                            <span className="truncate block" title={order.items?.map((i: any) => i.product?.name).join(", ")}>
                                                {order.items?.map((i: any) => i.product?.name).join(", ") || "No Products"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted whitespace-nowrap text-xs">
                                            {new Date(order.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "flex items-center gap-1.5 font-semibold",
                                                (order.paymentStatus === "Paid" || order.paymentStatus === "Success") ? "text-primary" : "text-warning"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", (order.paymentStatus === "Paid" || order.paymentStatus === "Success") ? "bg-primary" : "bg-warning")}></div>
                                                {order.paymentStatus || "Pending"}
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
                                        <td className="px-1 py-4">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-1 hover:bg-primary-light text-text-muted hover:text-primary rounded-md transition-all"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border-custom flex items-center justify-between bg-background-soft/30">
                        <p className="text-xs text-text-muted">
                            Showing <span className="text-text font-bold">{(currentPage - 1) * ORDERS_PER_PAGE + 1}</span> to <span className="text-text font-bold">{Math.min(currentPage * ORDERS_PER_PAGE, totalItems)}</span> of <span className="text-text font-bold">{totalItems}</span> orders
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-soft transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-md text-[10px] font-bold transition-all",
                                            currentPage === i + 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-background-soft text-text-muted border border-border-custom"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-soft transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Simple Detail Overlay (if needed) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-lg font-bold">Order Details</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-text text-xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-text-muted">Order ID</p>
                                    <p className="font-bold">{selectedOrder.orderId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-text-muted">Status</p>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
                                        statusStyles[selectedOrder.status]
                                    )}>{selectedOrder.status}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-text-muted">Shop Name</p>
                                    <p className="font-semibold">{selectedOrder.items?.[0]?.retailer?.businessDetails?.businessName || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-text-muted">Customer</p>
                                    <p className="font-semibold">{selectedOrder.user?.fullName || "Guest"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] uppercase font-bold text-text-muted">Delivery Address</p>
                                    <p className="text-xs text-text-muted">{selectedOrder.deliveryAddress?.address || "N/A"}</p>
                                </div>
                            </div>
                            <div className="border rounded-xl overflow-hidden text-xs">
                                <div className="bg-background-soft p-3 font-bold border-b">Products</div>
                                <div className="p-3 space-y-2">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.quantity}x {item.product?.name}</span>
                                            <span className="font-bold">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 flex justify-between font-bold text-sm text-primary">
                                        <span>Total</span>
                                        <span>₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 bg-background-soft rounded-xl w-1/4" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
                </div>
            </div>
        }>
            <AdminOrdersContent />
        </Suspense>
    )
}
