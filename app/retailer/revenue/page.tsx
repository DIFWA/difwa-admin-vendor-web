"use client"

import { useState, useEffect } from "react"
import { Wallet, ArrowUpRight, Clock, CheckCircle2, DollarSign, Download, Filter, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"

interface Payout {
    _id: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
    transactionId?: string;
}

export default function RetailerRevenuePage() {
    const [payouts, setPayouts] = useState<Payout[]>([])
    const [loadingPayouts, setLoadingPayouts] = useState(true)
    const [loadingStats, setLoadingStats] = useState(true)
    const [revenueStats, setRevenueStats] = useState({
        availableBalance: 0,
        estimatedEarnings: 0,
        totalSettled: 0,
        totalEarnings: 0
    })

    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [payoutAmount, setPayoutAmount] = useState("")
    const [bankDetails, setBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        ifscCode: ""
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchPayoutHistory()
        fetchRevenueStats()
    }, [])

    const fetchRevenueStats = async () => {
        setLoadingStats(true)
        try {
            const res = await retailerService.getRevenueStats()
            if (res.success) {
                setRevenueStats(res.data)
            }
        } catch (error) {
            console.error("Error fetching revenue stats:", error)
        } finally {
            setLoadingStats(false)
        }
    }

    const fetchPayoutHistory = async () => {
        setLoadingPayouts(true)
        try {
            const data = await retailerService.getPayoutHistory()
            setPayouts(data)
        } catch (error) {
            console.error("Error fetching payouts:", error)
        } finally {
            setLoadingPayouts(false)
        }
    }

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await retailerService.requestPayout({
                amount: Number(payoutAmount),
                bankDetails
            })
            fetchPayoutHistory()
            fetchRevenueStats() // Refresh balances
            setShowPayoutModal(false)
            setPayoutAmount("")
        } catch (error) {
            console.error("Payout request failed:", error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Revenue & Settlements</h1>
                    <p className="text-text-muted mt-1">Track your earnings and manage your payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPayoutModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Request Payout
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary rounded-[32px] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={80} />
                    </div>
                    <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">Available for Payout</p>
                    {loadingStats ? (
                        <div className="h-10 bg-white/20 rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-4xl font-black">₹{revenueStats.availableBalance.toLocaleString()}</h2>
                    )}
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-300">
                        <ArrowUpRight size={14} /> Based on completed orders
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-border-custom shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Estimated Earnings</p>
                    {loadingStats ? (
                        <div className="h-9 bg-background-soft rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-3xl font-black text-primary">₹{revenueStats.estimatedEarnings.toLocaleString()}</h2>
                    )}
                    <p className="mt-2 text-xs font-bold text-text-muted uppercase">This Month</p>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-border-custom shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">Total Settled</p>
                    {loadingStats ? (
                        <div className="h-9 bg-background-soft rounded animate-pulse w-32" />
                    ) : (
                        <h2 className="text-3xl font-black text-blue-600">₹{revenueStats.totalSettled.toLocaleString()}</h2>
                    )}
                    <p className="mt-2 text-xs font-bold text-text-muted uppercase">Lifetime Earnings: ₹{revenueStats.totalEarnings.toLocaleString()}</p>
                </div>
            </div>

            {/* Settlements History */}
            <div className="bg-white rounded-[40px] border border-border-custom shadow-xl overflow-hidden">
                <div className="p-8 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight">Recent Settlements</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl bg-background-soft text-text-muted hover:text-primary transition-all border border-border-custom">
                            <Filter size={18} />
                        </button>
                        <button className="p-2.5 rounded-xl bg-background-soft text-text-muted hover:text-primary transition-all border border-border-custom">
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background-soft/50">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Payout ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">UTR / Proof</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom/50">
                            {loadingPayouts ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-16 bg-gray-50/30" />
                                    </tr>
                                ))
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <p className="text-text-muted font-bold">No payout history found.</p>
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((payout) => (
                                    <tr key={payout._id} className="hover:bg-background-soft/20 transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-primary truncate max-w-[150px]">
                                            #{payout._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-primary">₹{payout.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-text-muted">
                                            {new Date(payout.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                payout.status === 'Approved' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    payout.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-mono font-bold text-primary">{payout.transactionId || '---'}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form
                        onSubmit={handleRequestPayout}
                        className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Request Payout</h2>
                            <button type="button" onClick={() => setShowPayoutModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-text-muted" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Payout Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="500"
                                    max={revenueStats.availableBalance}
                                    placeholder="Enter amount to withdraw..."
                                    value={payoutAmount}
                                    onChange={e => setPayoutAmount(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-black text-2xl text-primary"
                                />
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Available: ₹{revenueStats.availableBalance.toLocaleString()}</p>
                            </div>

                            <div className="bg-gray-50 rounded-[32px] p-6 space-y-4">
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest opacity-50 mb-2">Settlement Bank Details</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Bank Name"
                                        value={bankDetails.bankName}
                                        onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none py-2 font-bold text-sm transition-all text-primary"
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Account Number"
                                        value={bankDetails.accountNumber}
                                        onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none py-2 font-bold text-sm transition-all text-primary"
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder="IFSC Code"
                                        value={bankDetails.ifscCode}
                                        onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none py-2 font-bold text-sm transition-all text-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-0">
                            <button
                                disabled={submitting}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? "Processing Request..." : "Submit Payout Request"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
