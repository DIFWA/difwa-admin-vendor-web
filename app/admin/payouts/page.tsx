"use client"

import { useState, useEffect } from "react"
import { Wallet, CheckCircle, XCircle, Clock, Search, Filter, Download, Eye, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Payout {
    _id: string;
    retailer: {
        _id: string;
        name: string;
        email: string;
        businessDetails?: {
            businessName: string;
        };
    };
    amount: number;
    bankDetails: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
    };
    status: 'Pending' | 'Approved' | 'Rejected';
    transactionId?: string;
    createdAt: string;
    processedAt?: string;
}

import useAdminStore from "@/data/store/useAdminStore"

export default function AdminPayoutsPage() {
    const [mounted, setMounted] = useState(false)
    const {
        payouts,
        loadingPayouts: loading,
        fetchPayouts,
        payoutSearchQuery: searchTerm,
        setPayoutSearchQuery: setSearchTerm
    } = useAdminStore()

    const [filterStatus, setFilterStatus] = useState("All")
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [transactionId, setTransactionId] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchPayouts(searchTerm)
    }, [fetchPayouts, searchTerm])

    const handleApprove = async () => {
        if (!selectedPayout || !transactionId) return
        setActionLoading(true)
        try {
            await adminService.approvePayout(selectedPayout._id, transactionId)
            await fetchPayouts(searchTerm, true)
            setShowModal(false)
            setSelectedPayout(null)
            setTransactionId("")
        } catch (error) {
            console.error("Approval failed:", error)
        } finally {
            setActionLoading(false)
        }
    }

    const filteredPayouts = payouts.filter((p: Payout) => {
        const matchesSearch = p.retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.retailer.businessDetails?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "All" || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    })

    const stats = {
        total: payouts.reduce((acc: number, p: Payout) => acc + p.amount, 0),
        pending: payouts.filter((p: Payout) => p.status === 'Pending').reduce((acc: number, p: Payout) => acc + p.amount, 0),
        approved: payouts.filter((p: Payout) => p.status === 'Approved').reduce((acc: number, p: Payout) => acc + p.amount, 0)
    }

    if (!mounted) return null

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Payout Settlements</h1>
                    <p className="text-text-muted mt-1">Review and approve retailer earnings disbursement.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border-custom rounded-xl font-bold text-sm hover:bg-gray-50 transition-all">
                        <Download size={18} /> Export List
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Total Payouts</p>
                        <h2 className="text-2xl font-black text-primary">₹{stats.total.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Pending Volume</p>
                        <h2 className="text-2xl font-black text-amber-600">₹{stats.pending.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Settled Volume</p>
                        <h2 className="text-2xl font-black text-blue-600">₹{stats.approved.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl border border-border-custom shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Retailer or Business Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-background-soft border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 bg-background-soft px-4 py-3 rounded-2xl">
                    <Filter size={18} className="text-text-muted" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent outline-none font-bold text-sm text-primary appearance-none cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending Only</option>
                        <option value="Approved">Approved Only</option>
                        <option value="Rejected">Rejected Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] border border-border-custom shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-soft/50 border-b border-border-custom">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Retailer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom/50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/30" />
                                    </tr>
                                ))
                            ) : filteredPayouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                <Wallet size={32} />
                                            </div>
                                            <p className="text-text-muted font-bold">No payout records found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayouts.map((payout: Payout) => (
                                    <tr key={payout._id} className="hover:bg-background-soft/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-black">
                                                    {payout.retailer.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary">{payout.retailer.businessDetails?.businessName || payout.retailer.name}</p>
                                                    <p className="text-xs text-text-muted">{payout.retailer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-lg font-black text-primary">₹{payout.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-gray-600">{new Date(payout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            <p className="text-[10px] text-text-muted uppercase font-bold">{new Date(payout.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                payout.status === 'Approved' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    payout.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayout(payout)
                                                        setShowModal(true)
                                                    }}
                                                    className="p-2.5 rounded-xl bg-background-soft text-primary hover:bg-primary hover:text-white transition-all border border-border-custom"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {payout.status === 'Pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPayout(payout)
                                                            setShowModal(true)
                                                        }}
                                                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm"
                                                        title="Approve Settlement"
                                                    >
                                                        <Check size={18} />
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
            </div>

            {/* Modal */}
            {showModal && selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Payout Details</h2>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                                <XCircle size={24} className="text-text-muted" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest opacity-50">Retailer Info</h3>
                                    <div className="bg-background-soft p-4 rounded-3xl">
                                        <p className="font-black text-primary">{selectedPayout.retailer.name}</p>
                                        <p className="text-sm text-text-muted">{selectedPayout.retailer.email}</p>
                                        <p className="text-sm text-text-muted mt-2 font-bold">{selectedPayout.retailer.businessDetails?.businessName}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest opacity-50">Bank Details</h3>
                                    <div className="bg-background-soft p-4 rounded-3xl">
                                        <p className="text-sm"><strong>Bank:</strong> {selectedPayout.bankDetails?.bankName || 'N/A'}</p>
                                        <p className="text-sm"><strong>Acc:</strong> {selectedPayout.bankDetails?.accountNumber || 'N/A'}</p>
                                        <p className="text-sm"><strong>IFSC:</strong> {selectedPayout.bankDetails?.ifscCode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Settlement Amount</p>
                                    <h2 className="text-4xl font-black text-primary">₹{selectedPayout.amount.toLocaleString()}</h2>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        selectedPayout.status === 'Approved' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                                    )}>
                                        {selectedPayout.status}
                                    </span>
                                </div>
                            </div>

                            {selectedPayout.status === 'Pending' && (
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest opacity-50">Settlement Verification</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Enter Bank Transaction ID / UTR Number..."
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold placeholder:font-medium"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            disabled={!transactionId || actionLoading}
                                            onClick={handleApprove}
                                            className="grow bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                        >
                                            {actionLoading ? "Processing..." : "Confirm & Approve Settlement"}
                                        </button>
                                        <button className="px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedPayout.status === 'Approved' && (
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Transaction Proof</p>
                                    <p className="text-lg font-black text-primary font-mono">{selectedPayout.transactionId}</p>
                                    <p className="text-xs text-text-muted mt-1 uppercase font-bold">Processed on {new Date(selectedPayout.processedAt!).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
