"use client"

import { useState, useEffect, useRef, Suspense } from "react"
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
    RefreshCw,
    Download,
    X,
    Loader2,
    FileText,
    Share2,
    Printer
} from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { toast } from "sonner"
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
import { useSearchParams } from "next/navigation"
import useCustomerStore from "@/data/store/useCustomerStore"

function CustomersContent() {
    const searchParams = useSearchParams()
    const [mounted, setMounted] = useState(false)
    const { 
        customersData, 
        loading, 
        fetchCustomers, 
        selectedCustomer, 
        setSelectedCustomer,
        searchQuery,
        setSearchQuery
    } = useCustomerStore()
    
    // UI-only states remain local
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
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [invoiceData, setInvoiceData] = useState<any>(null)
    const [invoiceLoading, setInvoiceLoading] = useState(false)
    const moreMenuRef = useRef<HTMLDivElement>(null)
    const invoicePrintRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: invoicePrintRef,
        documentTitle: `due_balance_invoice_${selectedCustomer?.name || 'customer'}`,
    });

    useEffect(() => {
        setMounted(true)
        // No redundant loading if data exists
        fetchCustomers()
        
        const q = searchParams.get("q") || searchParams.get("query")
        if (q) {
            setSearchQuery(q)
        }
    }, [searchParams, fetchCustomers, setSearchQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

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

    if (!customersData || loading) {
        return <div className="space-y-6 animate-pulse p-4">
            <div className="h-12 bg-background-soft rounded-xl w-1/4" />
            <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
            </div>
            <div className="h-80 bg-background-soft rounded-2xl" />
        </div>
    }

    const stats = [
        { title: "My Total Customers", value: customersData.stats?.totalCustomers?.toLocaleString() || "0", change: "", trend: "up", icon: Users, color: "bg-primary-light text-primary" },
        { title: "New Customers", value: customersData.stats?.newCustomers?.toLocaleString() || "0", change: "", trend: "up", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
        { title: "Repeat Customers", value: customersData.stats?.repeatPercentage || "0%", change: "", trend: "up", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    ]

    const filteredCustomers = (customersData.customers || []).filter((c: any) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.orderIds || []).some((id: string) => id.toLowerCase().includes(searchQuery.toLowerCase()))
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
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-border-custom shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                                <button 
                                    onClick={() => {
                                        fetchCustomers();
                                        setShowMoreMenu(false);
                                        toast.success("Data refreshed");
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-background-soft transition-colors"
                                >
                                    <RefreshCw size={16} className="text-primary" />
                                    Refresh Data
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className={cn(
                    "bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden flex flex-col transition-all duration-300",
                    selectedCustomer ? "lg:col-span-3" : "lg:col-span-4"
                )}>

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
                                suppressHydrationWarning={true}
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

                {selectedCustomer && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 h-fit sticky top-6 relative animate-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-background-soft transition-colors text-text-muted hover:text-text"
                            title="Close Details"
                        >
                            <X size={18} />
                        </button>
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
                                <div className="flex flex-col gap-2">
                                    {parseFloat(selectedCustomer.balance) > 0 && (
                                        <button
                                            onClick={() => {
                                                setSettleAmount(selectedCustomer.balance)
                                                setShowSettleModal(true)
                                            }}
                                            className="w-full py-2 px-4 bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase shadow-sm hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            Settle Balance
                                        </button>
                                    )}
                                    {parseFloat(selectedCustomer.balance) > 0 && (
                                        <button
                                            onClick={async () => {
                                                setInvoiceLoading(true)
                                                setShowInvoiceModal(true)
                                                try {
                                                    const res = await retailerService.getDueOrdersForCustomer(selectedCustomer.id)
                                                    if (res.success) {
                                                        setInvoiceData(res.data)
                                                    }
                                                } catch (err) {
                                                    console.error("Failed to fetch invoice", err)
                                                    toast.error("Failed to generate invoice")
                                                } finally {
                                                    setInvoiceLoading(false)
                                                }
                                            }}
                                            className="w-full py-2 px-4 bg-white border border-border-custom text-text rounded-lg text-[10px] font-black uppercase hover:bg-background-soft transition-all flex items-center justify-center gap-2"
                                        >
                                            <FileText size={14} className="text-primary" />
                                            Generate Invoice
                                        </button>
                                    )}
                                </div>
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
                onSuccess={fetchCustomers}
            />

            <ManualOrderModal
                isOpen={showCreateOrderModal}
                onClose={() => {
                    setShowCreateOrderModal(false)
                    setCustomerForOrder(null)
                }}
                customer={customerForOrder}
                onSuccess={fetchCustomers}
            />

            <ManualSubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => {
                    setShowSubscriptionModal(false)
                    setCustomerForOrder(null)
                }}
                customer={customerForOrder}
                onSuccess={fetchCustomers}
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
                                            await fetchCustomers()
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

            {/* Invoice Modal */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between sticky top-0 bg-white z-10 no-print">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-primary" />
                                Due Balance Invoice
                            </h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handlePrint()}
                                    className="p-2.5 rounded-xl bg-white border border-border-custom hover:border-primary hover:text-primary transition-all text-text-muted flex items-center gap-2 text-xs font-bold shadow-sm"
                                    title="Print Invoice"
                                >
                                    <Printer size={16} />
                                    Print
                                </button>
                                <button onClick={() => setShowInvoiceModal(false)} className="p-2 rounded-lg hover:bg-background-soft transition-colors text-text-muted">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <style jsx global>{`
                            @media print {
                                @page {
                                    margin: 0; /* This removes browser headers and footers */
                                    size: portrait;
                                }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    background: white !important;
                                }
                                body * {
                                    visibility: hidden;
                                }
                                #invoice-document, #invoice-document * {
                                    visibility: visible;
                                }
                                #invoice-document {
                                    position: absolute;
                                    left: 50%;
                                    top: 10mm;
                                    transform: translateX(-50%);
                                    width: 190mm; /* Standard A4 width minus padding */
                                    margin: 0 auto;
                                    padding: 15mm !important;
                                    background: white !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                    height: auto;
                                }
                                .no-print {
                                    display: none !important;
                                }
                            }
                        `}</style>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                            {invoiceLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                                    <Loader2 className="animate-spin mb-4" size={40} />
                                    <p className="font-medium">Preparing your invoice...</p>
                                </div>
                            ) : invoiceData ? (
                                <div id="invoice-document" ref={invoicePrintRef} className="bg-white shadow-xl rounded-xl p-8 border border-border-custom max-w-2xl mx-auto print:shadow-none print:border-none print:p-0">
                                    {/* Invoice Header */}
                                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-dashed">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                                    <span className="text-white font-black text-xs">D</span>
                                                </div>
                                                <h2 className="text-xl font-black text-primary tracking-tighter uppercase">Difwa Invoice</h2>
                                            </div>
                                            <p className="text-2xl font-black text-text uppercase">{invoiceData.retailer.name}</p>
                                            <p className="text-xs text-text-muted">{invoiceData.retailer.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Date Generated</h4>
                                            <p className="font-bold">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            <p className="text-[10px] text-text-muted">{new Date().toLocaleTimeString()}</p>
                                        </div>
                                    </div>

                                    {/* Billing Details */}
                                    <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-dashed">
                                        <div>
                                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Billed To</h4>
                                            <p className="font-black text-lg">{invoiceData.customer.fullName}</p>
                                            <p className="text-sm text-text-muted">{invoiceData.customer.phoneNumber}</p>
                                            {invoiceData.customer.addresses?.[0] && (
                                                <p className="text-xs text-text-muted mt-1">{invoiceData.customer.addresses[0].fullAddress}</p>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Payment Status</h4>
                                            <div className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 font-black text-xs uppercase flex items-center gap-2 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                                                Outstanding Balance
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Table */}
                                    <table className="w-full mb-8">
                                        <thead className="bg-gray-50 border-y border-border-custom">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-text-muted">Order ID</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-text-muted">Date</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-text-muted">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {invoiceData.orders.map((order: any) => (
                                                <tr key={order._id}>
                                                    <td className="px-4 py-4 text-xs font-mono font-bold text-text-muted">#{order.orderId.split('-').slice(-1)}</td>
                                                    <td className="px-4 py-4 text-xs text-text-muted">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold">₹{order.totalAmount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t-2 border-text pt-4">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-4 text-sm font-black text-text uppercase tracking-widest">Total Outstanding Due</td>
                                                <td className="px-4 py-4 text-right text-2xl font-black text-primary">₹{invoiceData.totalDue.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    {/* Footer */}
                                    <div className="text-center bg-primary/5 rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Important Note</p>
                                        <p className="text-[10px] text-text-muted max-w-sm mx-auto">
                                            This is a computer-generated summary of unpaid deliveries. Please settle the balance with your delivery rider or visit {invoiceData.retailer.name} shop.
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="p-6 border-t border-border-custom bg-white flex flex-col md:flex-row gap-3 no-print">
                            <button
                                onClick={() => {
                                    const message = `*INVOICE FROM ${invoiceData.retailer.name.toUpperCase()}*%0A%0AHello *${invoiceData.customer.fullName}*,%0A%0AYour current outstanding balance is *₹${invoiceData.totalDue.toFixed(2)}*.%0A%0APlease find the summary of your orders below:%0A${invoiceData.orders.slice(0, 5).map((o: any) => `- ₹${o.totalAmount} (${new Date(o.createdAt).toLocaleDateString()})`).join('%0A')}${invoiceData.orders.length > 5 ? '%0A- ...and more' : ''}%0A%0A*Total Due: ₹${invoiceData.totalDue.toFixed(2)}*%0A%0APlease settle it at your earliest convenience. Thank you!`;
                                    window.open(`https://wa.me/${invoiceData.customer.phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
                                }}
                                disabled={!invoiceData}
                                className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-sm font-black shadow-lg shadow-[#25D366]/20 hover:bg-[#20bd5c] transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                            >
                                <Share2 size={18} />
                                Share on WhatsApp
                            </button>
                            <button
                                onClick={() => handlePrint()}
                                disabled={!invoiceData}
                                className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                            >
                                <Download size={18} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default function RetailerCustomersPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 bg-background-soft rounded-xl w-1/4" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-background-soft rounded-2xl" />)}
                </div>
                <div className="h-80 bg-background-soft rounded-2xl" />
            </div>
        }>
            <CustomersContent />
        </Suspense>
    )
}
