"use client"

import { useState, useEffect } from "react"
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Phone,
    MapPin,
    MessageSquare,
    TrendingUp,
    Plus,
    ShoppingCart,
    Calendar,
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
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import ManualCustomerModal from "@/components/retailer/ManualCustomerModal"
import ManualOrderModal from "@/components/retailer/ManualOrderModal"
import ManualSubscriptionModal from "@/components/retailer/ManualSubscriptionModal"

export default function RetailerCustomersPage() {
    const [mounted, setMounted] = useState(false)
    const [customersData, setCustomersData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [customerOrders, setCustomerOrders] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
    const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
    const [showSettleModal, setShowSettleModal] = useState(false)
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
    const [settleAmount, setSettleAmount] = useState("")
    const [settleLoading, setSettleLoading] = useState(false)
    const [customerForOrder, setCustomerForOrder] = useState<any>(null)

    useEffect(() => {
        setMounted(true)
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await retailerService.getCustomers()
            if (res.success) {
                setCustomersData(res.data)
                if (res.data.customers && res.data.customers.length > 0) {
                    setSelectedCustomer(res.data.customers[0])
                }
            }
        } catch (error) {
            console.error("Failed to fetch customers", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPurchaseHistory = async () => {
        if (!selectedCustomer) return
        setHistoryLoading(true)
        setShowHistoryModal(true)
        try {
            const res = await retailerService.getOrders(selectedCustomer.id)
            if (res.success) {
                setCustomerOrders(res.data.orders)
            }
        } catch (error) {
            console.error("Failed to fetch customer history", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    if (!mounted || loading || !customersData) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const stats = [
        { title: "My Total Customers", value: customersData.stats.totalCustomers.toLocaleString(), change: "", trend: "up", icon: Users, color: "bg-primary-light text-primary" },
        { title: "New Customers", value: customersData.stats.newCustomers.toLocaleString(), change: "", trend: "up", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
        { title: "Repeat Customers", value: customersData.stats.repeatPercentage, change: "", trend: "up", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    ]

    const filteredCustomers = customersData.customers.filter((c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.orderIds.some((id: string) => id.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Customers</h1>
                    <p className="text-text-muted">Manage your shop&apos;s customer base and loyalty.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddCustomerModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-bold shadow-md shadow-primary/20"
                    >
                        <Plus size={18} />
                        Add Customer
                    </button>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{stat.title}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    {stat.change && (
                                        <span className="text-xs font-bold text-primary flex items-center mb-1">
                                            {stat.change}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm overflow-hidden min-h-[300px]">
                    <h3 className="text-lg font-bold mb-6">Customer Growth (Last 7 Days)</h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                            <AreaChart data={customersData.chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0096FF" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0096FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area type="monotone" dataKey="customers" stroke="#0096FF" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border-custom flex items-center justify-between">
                        <h3 className="text-lg font-bold">Customer Directory</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, phone or ID"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1 h-[500px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Purchase History</th>
                                    <th className="px-6 py-4">Spent</th>
                                    <th className="px-6 py-4">Balance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                            No customers found matching &quot;{searchQuery}&quot;
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((c: any) => (
                                        <tr key={c.id} onClick={() => setSelectedCustomer(c)} className={cn("hover:bg-background-soft cursor-pointer transition-colors", selectedCustomer?.id === c.id && "bg-background-soft/50")}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                                        <img src={c.image} alt={c.name} />
                                                    </div>
                                                    <span className="font-bold">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-text-muted">{c.phone}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold">{c.orderCount} Orders</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {c.orderIds.slice(0, 3).map((id: string) => (
                                                            <span key={id} className="text-[9px] bg-background-soft px-1.5 py-0.5 rounded border border-border-custom font-mono text-text-muted">
                                                                #{id.split('-').slice(-1)}
                                                            </span>
                                                        ))}
                                                        {c.orderIds.length > 3 && (
                                                            <span className="text-[9px] text-primary font-bold">+{c.orderIds.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary">₹{c.spend}</td>
                                            <td className="px-6 py-4 font-bold text-orange-600">₹{c.balance}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                                    c.status === "VIP" ? "bg-purple-100 text-purple-700" :
                                                        c.status === "New" ? "bg-blue-100 text-blue-700" :
                                                            "bg-primary-light text-primary" // Active
                                                )}>
                                                    {c.status}
                                                </span>
                                                {c.isManual && (
                                                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[8px] font-black uppercase">
                                                        Manual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setCustomerForOrder(c)
                                                            setShowCreateOrderModal(true)
                                                        }}
                                                        className="p-2 hover:bg-primary-light hover:text-primary rounded-lg transition-colors"
                                                        title="Create Order"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setCustomerForOrder(c)
                                                            setShowSubscriptionModal(true)
                                                        }}
                                                        className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                        title="Schedule Subscription"
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                    <button className="p-2 hover:bg-primary-light hover:text-primary rounded-lg transition-colors">
                                                        <MessageSquare size={16} />
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

                {selectedCustomer ? (
                    <div className="bg-white rounded-2xl  shadow-sm p-6 space-y-6 h-fit sticky top-6">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-primary-light overflow-hidden mx-auto mb-3 border-2 border-primary/20">
                                <img src={selectedCustomer.image} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                            <p className="text-xs text-text-muted">{selectedCustomer.email}</p>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 rounded-lg bg-background-soft">
                                    <Phone size={14} className="text-text-muted" />
                                </div>
                                <span className="font-medium">{selectedCustomer.phone}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-background-soft p-3 rounded-xl border border-border-custom/50">
                                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Total Orders</p>
                                    <p className="font-bold text-lg">{selectedCustomer.orderCount}</p>
                                </div>
                                <div className="bg-background-soft p-3 rounded-xl border border-border-custom/50">
                                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Total Spent</p>
                                    <p className="font-bold text-lg text-primary">₹{selectedCustomer.spend}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "p-4 rounded-xl border flex items-center justify-between",
                                parseFloat(selectedCustomer.balance) > 0 ? "bg-orange-50 border-orange-100" : "bg-green-50 border-green-100"
                            )}>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-bold">Due Balance</p>
                                    <p className={cn("font-bold text-xl", parseFloat(selectedCustomer.balance) > 0 ? "text-orange-600" : "text-green-600 ")}>
                                        ₹{selectedCustomer.balance}
                                    </p>
                                </div>
                                {parseFloat(selectedCustomer.balance) > 0 && (
                                    <button
                                        onClick={() => {
                                            setSettleAmount(selectedCustomer.balance)
                                            setShowSettleModal(true)
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-orange-700 transition-all"
                                    >
                                        Settle
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={fetchPurchaseHistory}
                            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 group"
                        >
                            View Purchase History
                            <TrendingUp size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col items-center justify-center text-center h-[300px] text-text-muted sticky top-6">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p>Select a customer to view details</p>
                    </div>
                )}
            </div>

            {/* Purchase History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-light">
                                    <img src={selectedCustomer?.image} alt={selectedCustomer?.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedCustomer?.name}&apos;s Order History</h3>
                                    <p className="text-xs text-text-muted">Total orders placed at your shop</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2.5 rounded-full hover:bg-background-soft transition-colors text-text-muted hover:text-text"
                            >
                                <Users size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {historyLoading ? (
                                <div className="space-y-4 py-10">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-16 bg-background-soft rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : customerOrders.length === 0 ? (
                                <div className="text-center py-20 text-text-muted bg-background-soft rounded-3xl border-2 border-dashed border-border-custom">
                                    <TrendingUp size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-medium text-lg">No history found</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-border-custom rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-background-soft/50 text-xs font-bold text-text-muted uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Order ID</th>
                                                <th className="px-6 py-4">Items</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y text-sm">
                                            {customerOrders.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-background-soft/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs font-bold text-text-muted">#{order.id.split('-').slice(-2).join('-')}</td>
                                                    <td className="px-6 py-4 max-w-[200px]">
                                                        <p className="truncate font-medium">{order.product}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-muted text-xs">{order.date}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-primary">₹{order.price}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-center w-[100px]",
                                                                (order.status === "Delivered" || order.status === "Completed") ? "bg-blue-100 text-blue-700" :
                                                                    (order.status === "Pending" || order.status === "Accepted") ? "bg-warning-50 text-warning" :
                                                                        "bg-blue-100 text-blue-700"
                                                            )}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border-custom bg-background-soft/30 flex justify-between items-center text-xs text-text-muted">
                            <p>Showing {customerOrders.length} orders for this customer</p>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-6 py-2 bg-white border border-border-custom rounded-xl font-bold text-text hover:bg-background-soft transition-colors"
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ManualCustomerModal
                isOpen={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onSuccess={fetchData}
            />

            <ManualOrderModal
                isOpen={showCreateOrderModal}
                onClose={() => {
                    setShowCreateOrderModal(false)
                    setCustomerForOrder(null)
                }}
                customer={customerForOrder}
                onSuccess={fetchData}
            />

            <ManualSubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => {
                    setShowSubscriptionModal(false)
                    setCustomerForOrder(null)
                }}
                customer={customerForOrder}
                onSuccess={fetchData}
            />

            {/* Settlement Modal */}
            {showSettleModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between">
                            <h3 className="text-xl font-bold">Settle Balance</h3>
                            <button onClick={() => setShowSettleModal(false)} className="p-2 rounded-full hover:bg-background-soft transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center pb-2">
                                <p className="text-sm text-text-muted mb-1">Total Due for {selectedCustomer?.name}</p>
                                <p className="text-3xl font-black text-orange-600">₹{selectedCustomer?.balance}</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Settlement Amount</label>
                                <input
                                    type="number"
                                    value={settleAmount}
                                    onChange={(e) => setSettleAmount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    setSettleLoading(true)
                                    try {
                                        const res = await retailerService.settleCustomerDue(selectedCustomer.id, parseFloat(settleAmount))
                                        if (res.success) {
                                            await fetchData()
                                            setShowSettleModal(false)
                                        }
                                    } catch (err) {
                                        console.error("Settle failed", err)
                                    } finally {
                                        setSettleLoading(false)
                                    }
                                }}
                                disabled={settleLoading || !settleAmount || parseFloat(settleAmount) <= 0}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {settleLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Settlement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
