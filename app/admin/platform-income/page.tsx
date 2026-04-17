"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart3, TrendingUp, Truck, Percent, Download, Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"

type Order = {
    _id: string
    orderId: string
    totalAmount: number
    deliveryFee: number
    distance: number
    commissionAmount: number
    commissionRate: number
    createdAt: string
    status: string
    paymentMethod: string
    user?: { fullName: string; phoneNumber: string }
    items?: { retailer?: { name?: string; businessDetails?: { businessName?: string } } }[]
}

type Summary = {
    totalDeliveryIncome: number
    totalCommissionIncome: number
    totalOrderValue: number
    totalOrders: number
    totalPlatformIncome: number
}

export default function PlatformIncomePage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const limit = 20

    const fetchReport = useCallback(async () => {
        try {
            setLoading(true)
            const params: any = { page, limit }
            if (from) params.from = from
            if (to) params.to = to

            const res = await adminService.getDeliveryIncomeReport(params)
            if (res.success) {
                setOrders(res.data.orders)
                setSummary(res.data.summary)
                setTotalPages(res.data.pagination.totalPages)
            }
        } catch (e: any) {
            toast.error("Failed to load income report")
        } finally {
            setLoading(false)
        }
    }, [page, from, to])

    useEffect(() => { fetchReport() }, [fetchReport])

    const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const getRetailerName = (order: Order) => {
        const retailer = order.items?.[0]?.retailer
        return retailer?.businessDetails?.businessName || retailer?.name || "—"
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Platform Income</h1>
                    <p className="text-text-muted mt-1">Combined delivery charges + commission earned by Difwa per order.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<BarChart3 size={22} />}
                    label="Total Platform Income"
                    value={fmt(summary?.totalPlatformIncome || 0)}
                    color="bg-primary text-white"
                    sub="Delivery + Commission"
                />
                <StatCard
                    icon={<Truck size={22} />}
                    label="Delivery Income"
                    value={fmt(summary?.totalDeliveryIncome || 0)}
                    color="bg-blue-50 text-blue-700"
                    sub="From distance charges"
                />
                <StatCard
                    icon={<Percent size={22} />}
                    label="Commission Income"
                    value={fmt(summary?.totalCommissionIncome || 0)}
                    color="bg-orange-50 text-orange-700"
                    sub="From order % cuts"
                />
                <StatCard
                    icon={<TrendingUp size={22} />}
                    label="Gross Order Volume"
                    value={fmt(summary?.totalOrderValue || 0)}
                    color="bg-green-50 text-green-700"
                    sub={`${summary?.totalOrders || 0} orders`}
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-border-custom p-4 flex flex-wrap items-center gap-4">
                <Calendar size={16} className="text-text-muted shrink-0" />
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={e => { setFrom(e.target.value); setPage(1) }}
                        className="px-3 py-2 rounded-lg bg-background-soft text-sm font-medium outline-none border border-transparent focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={e => { setTo(e.target.value); setPage(1) }}
                        className="px-3 py-2 rounded-lg bg-background-soft text-sm font-medium outline-none border border-transparent focus:border-primary transition-colors"
                    />
                </div>
                {(from || to) && (
                    <button
                        onClick={() => { setFrom(""); setTo(""); setPage(1) }}
                        className="text-xs font-bold text-red-500 hover:underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-border-custom shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-background-soft border-b border-border-custom">
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Order ID</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Customer</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Vendor</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Order Value</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Distance</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Delivery Fee</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Commission</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Platform Total</th>
                                <th className="px-5 py-4 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-border-custom/50">
                                        {Array.from({ length: 9 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-border-custom/40 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-5 py-16 text-center text-text-muted font-bold">
                                        <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                                        No delivered orders found for the selected period.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => {
                                    const platformTotal = (order.deliveryFee || 0) + (order.commissionAmount || 0)
                                    return (
                                        <tr key={order._id} className="border-b border-border-custom/40 hover:bg-background-soft/50 transition-colors">
                                            <td className="px-5 py-4 font-black text-primary text-xs">{order.orderId}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-bold text-xs">{order.user?.fullName || "—"}</p>
                                                <p className="text-[10px] text-text-muted">{order.user?.phoneNumber || ""}</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-text-muted">{getRetailerName(order)}</td>
                                            <td className="px-5 py-4 text-xs font-bold">{fmt(order.totalAmount)}</td>
                                            <td className="px-5 py-4 text-xs font-bold text-text-muted">
                                                {order.distance > 0 ? `${order.distance.toFixed(1)} km` : "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                                                    order.deliveryFee === 0 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                    {order.deliveryFee === 0 ? "FREE" : fmt(order.deliveryFee)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-black px-2 py-1 rounded-lg bg-orange-100 text-orange-700">
                                                    {fmt(order.commissionAmount)} ({order.commissionRate}%)
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-primary text-white">
                                                    {fmt(platformTotal)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-text-muted font-bold">
                                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                        {/* Footer totals row */}
                        {!loading && orders.length > 0 && (
                            <tfoot>
                                <tr className="bg-primary/5 border-t-2 border-primary/20">
                                    <td colSpan={3} className="px-5 py-4 text-xs font-black text-primary uppercase tracking-widest">
                                        Page {page} Totals
                                    </td>
                                    <td className="px-5 py-4 text-xs font-black text-primary">
                                        {fmt(orders.reduce((a, o) => a + (o.totalAmount || 0), 0))}
                                    </td>
                                    <td className="px-5 py-4" />
                                    <td className="px-5 py-4 text-xs font-black text-blue-700">
                                        {fmt(orders.reduce((a, o) => a + (o.deliveryFee || 0), 0))}
                                    </td>
                                    <td className="px-5 py-4 text-xs font-black text-orange-700">
                                        {fmt(orders.reduce((a, o) => a + (o.commissionAmount || 0), 0))}
                                    </td>
                                    <td className="px-5 py-4 text-xs font-black text-primary bg-primary/10 rounded-xl">
                                        {fmt(orders.reduce((a, o) => a + (o.deliveryFee || 0) + (o.commissionAmount || 0), 0))}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border-custom">
                        <p className="text-xs font-bold text-text-muted">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl hover:bg-primary/10 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl hover:bg-primary/10 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode, label: string, value: string, color: string, sub: string }) {
    return (
        <div className={`rounded-[28px] p-5 space-y-2 ${color} shadow-lg`}>
            <div className="opacity-80">{icon}</div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-2xl font-black leading-none">{value}</p>
            <p className="text-[10px] font-bold opacity-60">{sub}</p>
        </div>
    )
}
