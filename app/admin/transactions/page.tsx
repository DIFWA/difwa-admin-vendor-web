"use client"

import { useState } from "react"
import { ArrowLeftRight, Search, Filter, Download, MoreVertical, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
    { id: "#TXN-9081", shop: "Coastal Harvest", date: "25 Feb 2026", amount: "$1,200.00", type: "Credit", status: "Settled" },
    { id: "#TXN-9082", shop: "Deep Sea Delights", date: "24 Feb 2026", amount: "$3,450.00", type: "Withdraw", status: "Pending" },
    { id: "#TXN-9083", shop: "Fresh Catch Co.", date: "24 Feb 2026", amount: "$850.50", type: "Credit", status: "Settled" },
    { id: "#TXN-9084", shop: "Blue Water Shrimps", date: "23 Feb 2026", amount: "$2,100.00", type: "Withdraw", status: "Settled" },
]

export default function AdminTransactionsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Financial Transactions</h1>
                    <p className="text-text-muted">Track all shop settlements and platform withdrawals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Volume</p>
                        <h3 className="text-2xl font-bold">$142,500</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Credited</p>
                        <h3 className="text-2xl font-bold">$120,400</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-50 text-red-600">
                        <ArrowDownRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Withdrawals</p>
                        <h3 className="text-2xl font-bold">$22,100</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-lg font-bold">Transaction History</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Shop or TXN ID"
                            className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-primary/5 text-xs font-bold text-primary uppercase">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Shop Name</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom text-sm">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-background-soft transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">{txn.id}</td>
                                    <td className="px-6 py-4 font-semibold">{txn.shop}</td>
                                    <td className="px-6 py-4 text-text-muted">{txn.date}</td>
                                    <td className="px-6 py-4 font-bold">{txn.amount}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                            txn.type === "Credit" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                        )}>
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                            txn.status === "Settled" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                        )}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className={cn(
                                            "px-4 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                            "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"
                                        )}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
