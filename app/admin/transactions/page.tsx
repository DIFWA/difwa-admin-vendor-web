"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpRight, ArrowDownRight, DollarSign, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Transaction {
    _id: string;
    transactionId?: string;
    retailer: {
        _id: string;
        name: string;
        businessDetails: {
            businessName: string;
        }
    };
    amount: number;
    status: string;
    createdAt: string;
}

import useAdminStore from "@/data/store/useAdminStore"

export default function AdminTransactionsPage() {
    const [mounted, setMounted] = useState(false)
    const { 
        payouts: transactions, 
        loadingPayouts: loading, 
        fetchPayouts 
    } = useAdminStore()
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        setMounted(true)
        fetchPayouts(searchTerm)
    }, [fetchPayouts, searchTerm])

    if (!mounted) return null

    const fetchTransactions = async () => {
        await fetchPayouts(searchTerm, true)
    }

    // Calculated Stats
    const totalVolume = transactions.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0)
    const settledAmount = transactions.filter((t: Transaction) => t.status === "Approved" || t.status === "Paid").reduce((acc: number, curr: Transaction) => acc + curr.amount, 0)
    const pendingAmount = transactions.filter((t: Transaction) => t.status === "Pending").reduce((acc: number, curr: Transaction) => acc + curr.amount, 0)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Financial Transactions</h1>
                    <p className="text-text-muted">Track all shop settlements and platform withdrawals.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Requested Volume</p>
                        <h3 className="text-2xl font-bold">₹{totalVolume.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Settled Amount</p>
                        <h3 className="text-2xl font-bold">₹{settledAmount.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <ArrowDownRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Pending Payouts</p>
                        <h3 className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-lg font-bold">Transaction History</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Shop or Transaction ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 flex justify-center"><Clock className="animate-spin text-primary" /></div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase border-b border-border-custom">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Shop Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {transactions.map((txn: Transaction) => (
                                    <tr key={txn._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{txn.transactionId || txn._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-6 py-4 font-bold">{txn.retailer?.businessDetails?.businessName || "No Shop Name"}</td>
                                        <td className="px-6 py-4 text-text-muted">{formatDate(txn.createdAt)}</td>
                                        <td className="px-6 py-4 font-bold text-md">₹{txn.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest bg-purple-50 text-purple-600 border-purple-100">
                                                Withdraw
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                                txn.status === "Approved" || txn.status === "Settled" || txn.status === "Paid" 
                                                    ? "bg-blue-50 text-blue-600 border-blue-100" 
                                                    : txn.status === "Pending" 
                                                        ? "bg-yellow-50 text-yellow-600 border-yellow-100" 
                                                        : "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-text-muted font-medium">
                                            No transactions found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
