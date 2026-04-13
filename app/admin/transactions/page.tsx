"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ArrowUpRight, ArrowDownRight, DollarSign, Clock, CreditCard, Activity, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Transaction {
    _id: string;
    user: {
        _id: string;
        fullName?: string;
        phoneNumber?: string;
        email?: string;
    };
    amount: number;
    type: "Credit" | "Debit";
    status: string;
    description: string;
    referenceId?: string;
    source: string;
    createdAt: string;
}

export default function AdminTransactionsPage() {
    const [mounted, setMounted] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [stats, setStats] = useState({ totalInflow: 0, todayInflow: 0, transactionCount: 0 })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const fetchGlobalTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const res = await adminService.getAllTransactions({ 
                search: debouncedSearch,
                page: currentPage,
                limit: 15
            })
            if (res.success) {
                setTransactions(res.data)
                setStats(res.stats)
                setTotalPages(res.pagination.pages)
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, currentPage])

    useEffect(() => {
        setMounted(true)
        fetchGlobalTransactions()
    }, [fetchGlobalTransactions])

    if (!mounted) return null

    // Reset to page 1 when searching
    const handleSearchChange = (val: string) => {
        setSearchTerm(val)
        setCurrentPage(1)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) pages.push(i);
            
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Global Ledger</h1>
                    <p className="text-text-muted">Track all platform payments, Razorpay settlements, and wallet activities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary-light text-primary">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Inflow (Success)</p>
                        <h3 className="text-2xl font-bold">₹{stats.totalInflow.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Today's Inflow</p>
                        <h3 className="text-2xl font-bold">₹{stats.todayInflow.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted">Total Transactions</p>
                        <h3 className="text-2xl font-bold">{stats.transactionCount.toLocaleString()}</h3>
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
                            placeholder="Search by User, Ref ID or Desc..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9 pr-10 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-72 focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => handleSearchChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-full text-text-muted hover:text-red-500 transition-all"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 flex justify-center"><Clock className="animate-spin text-primary" /></div>
                    ) : (
                        <>
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase border-b border-border-custom">
                                <tr>
                                    <th className="px-6 py-4">Reference/ID</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Type/Source</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {transactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 text-xs">
                                            <div className={cn(
                                                "font-mono font-bold",
                                                txn.referenceId ? "text-primary" : "text-text-muted italic"
                                            )}>
                                                {txn.referenceId || `REF:${txn.source.toUpperCase()}`}
                                            </div>
                                            <div className="text-[10px] text-text-muted mt-0.5">ID: {txn._id.slice(-8).toUpperCase()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{txn.user?.fullName || "System/Unknown"}</div>
                                            <div className="text-xs text-text-muted">{txn.user?.phoneNumber || txn.user?.email || ""}</div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted max-w-[200px] truncate" title={txn.description}>{txn.description}</td>
                                        <td className="px-6 py-4 font-bold text-md cursor-pointer group">
                                            <div className="flex items-center gap-1">
                                                {txn.type === "Credit" ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                                                <span className={txn.type === "Credit" ? "text-emerald-600" : "text-red-600"}>
                                                    ₹{txn.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                                                    txn.type === "Credit" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {txn.type}
                                                </span>
                                                <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
                                                    <CreditCard size={10} /> {txn.source}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs">{formatDate(txn.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                                txn.status === "Success" 
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
                                        <td colSpan={7} className="px-6 py-20 text-center text-text-muted font-medium">
                                            No transactions found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {(totalPages > 0 || stats.transactionCount > 0) && (
                            <div className="p-6 border-t border-border-custom flex items-center justify-between">
                                <p className="text-xs text-text-muted">
                                    Page <span className="font-bold text-primary">{currentPage}</span> of <span className="font-bold text-primary">{totalPages || 1}</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1} 
                                        className="flex items-center gap-1 px-3 py-2 bg-white border border-border-custom rounded-xl text-[10px] font-black uppercase disabled:opacity-50 hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1 px-2">
                                        {getPageNumbers().map((page, idx) => (
                                            <button
                                                key={idx}
                                                disabled={page === "..."}
                                                onClick={() => typeof page === "number" && setCurrentPage(page)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                    page === currentPage 
                                                        ? "bg-primary text-white shadow-md scale-110" 
                                                        : page === "..." 
                                                            ? "cursor-default text-text-muted" 
                                                            : "bg-white border border-border-custom text-text-muted hover:border-primary hover:text-primary"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages || totalPages === 0} 
                                        className="flex items-center gap-1 px-3 py-2 bg-white border border-border-custom rounded-xl text-[10px] font-black uppercase disabled:opacity-50 hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
