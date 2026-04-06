"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
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
    Eye,
    Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import useAuthStore from "@/data/store/useAuthStore"
import useSocketStore from "@/data/store/useSocketStore"

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
    const { user } = useAuthStore()
    const searchParams = useSearchParams()
    
    const [mounted, setMounted] = useState(false)
    const [ordersData, setOrdersData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [typeFilter, setTypeFilter] = useState("All")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    
    const ORDERS_PER_PAGE = 10

    const currentUserPermissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    const canView = currentUserPermissions.includes("ORDERS_VIEW") || user?.role === "superadmin";

    const fetchOrdersData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await adminService.getOrders({
                page: currentPage,
                search: searchQuery,
                status: statusFilter,
                type: typeFilter
            });
            if (res.success) {
                setOrdersData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin orders", error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter, typeFilter]);

    const { socket, connect: connectSocket } = useSocketStore();

    useEffect(() => {
        setMounted(true);
        fetchOrdersData();
        
        // Ensure connected and joined
        if (!socket) {
            connectSocket(user?._id || user?.id);
        }

        const handleUpdate = (data: any) => {
            console.log("⚡ Real-time Order Update (Admin):", data);
            toast.info(`Order Update: ${data.orderId || 'New Order'} is now ${data.status || 'Pending'}`);
            fetchOrdersData(true);
        };

        if (socket) {
            socket.emit("join", "admin");
            socket.on("orderUpdate", handleUpdate);
            socket.on("NEW_ORDER", handleUpdate);
        }

        return () => {
            if (socket) {
                socket.off("orderUpdate", handleUpdate);
                socket.off("NEW_ORDER", handleUpdate);
            }
        };
    }, [fetchOrdersData, socket, connectSocket, user?._id, user?.id]);

    if (!mounted || (loading && !ordersData)) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-96 bg-background-soft rounded-2xl" />
        </div>
    }

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-border-custom border-dashed">
                <Shield className="w-16 h-16 text-primary/20 mb-4" />
                <h3 className="text-xl font-bold">Access Denied</h3>
                <p className="text-text-muted mt-2">You don't have permission to view orders.</p>
            </div>
        )
    }

    const orders = ordersData?.orders || []
    const totalPages = Math.ceil((ordersData?.total || 0) / ORDERS_PER_PAGE)

    const handleExport = () => {
        try {
            const exportData = orders.map((o: any) => ({
                "Order ID": o.orderId,
                "User": o.user?.name || "Guest",
                "Retailer": o.retailer?.businessName || "Unknown",
                "Type": o.orderType,
                "Price": `₹${o.totalAmount}`,
                "Status": o.status,
                "Date": new Date(o.createdAt).toLocaleString()
            }))
            const worksheet = XLSX.utils.json_to_sheet(exportData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")
            XLSX.writeFile(workbook, `Admin_Orders_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Order list exported successfully")
        } catch (error) {
            toast.error("Export failed")
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Orders</h1>
                    <p className="text-text-muted text-sm">Oversee all platform transactions and fulfillment.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm shadow-lg shadow-primary/20">
                        <Download size={16} /> Export
                    </button>
                    <button onClick={() => fetchOrdersData()} className="p-2 bg-white border border-border-custom text-text-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, User, or Retailer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-background-soft border-transparent text-sm outline-none cursor-pointer">
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-background-soft border-transparent text-sm outline-none cursor-pointer">
                            <option value="All">All Types</option>
                            <option value="One-time">One-time</option>
                            <option value="Subscription">Subscription</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Retailer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {!orders || orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        <Package className="mx-auto mb-2 opacity-20" size={48} />
                                        <p>No orders record found.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">{order.orderId}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{order.user?.name || "Guest"}</p>
                                            <p className="text-[10px] text-text-muted">{order.user?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{order.retailer?.businessDetails?.businessName || order.retailer?.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border", statusStyles[order.status] || "bg-gray-50 text-gray-500")}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-primary-light text-text-muted hover:text-primary rounded-xl transition-all">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-border-custom flex items-center justify-between">
                        <p className="text-xs text-text-muted">Page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-border-custom rounded-xl text-xs font-bold disabled:opacity-50">Prev</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-border-custom rounded-xl text-xs font-bold disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-text-muted animate-pulse">Loading platform orders...</div>}>
            <AdminOrdersContent />
        </Suspense>
    )
}
