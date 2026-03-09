"use client"

import { useState, useEffect } from "react"
import { Fish, Package, ChevronRight, CheckCircle2, AlertCircle, Clock, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"

interface PrepItem {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    unit: string;
    orderCount: number;
    subscriptionCount: number;
    oneTimeCount: number;
    status: 'Pending' | 'Ready' | 'Shortage';
}

export default function DailyPrepListPage() {
    const [prepItems, setPrepItems] = useState<PrepItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPrepList()
    }, [])

    const fetchPrepList = async () => {
        setIsLoading(true)
        try {
            const response = await retailerService.getPrepList()
            setPrepItems(response.data)
        } catch (error) {
            console.error("Error fetching prep list:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleStatus = (id: string) => {
        setPrepItems(items => items.map(item => {
            if (item.id === id) {
                const statuses: PrepItem['status'][] = ['Pending', 'Ready', 'Shortage']
                const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % 3]
                return { ...item, status: nextStatus }
            }
            return item
        }))
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Daily Prep List</h1>
                    <p className="text-text-muted mt-1">Inventory requirements for today&apos;s subscription &amp; pre-orders.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-border-custom rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm">
                    <Printer size={18} /> Print Prep Guide
                </button>
            </div>

            {/* Date Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                    {new Date().getDate()}
                </div>
                <div>
                    <p className="font-black text-primary uppercase tracking-tight">Orders for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Cut-off completed at 11:00 PM last night</p>
                </div>
            </div>

            {/* Prep Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Total Items</p>
                    <h3 className="text-2xl font-black text-primary">{prepItems.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Total Weight</p>
                    <h3 className="text-2xl font-black text-primary">41.2 kg</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Total Orders</p>
                    <h3 className="text-2xl font-black text-primary">74</h3>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-border-custom shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Est. Revenue</p>
                    <h3 className="text-2xl font-black text-green-600">₹32,450</h3>
                </div>
            </div>

            {/* Prep Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prepItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => toggleStatus(item.id)}
                        className={cn(
                            "group bg-white rounded-[32px] border-2 p-6 transition-all duration-300 cursor-pointer relative overflow-hidden",
                            item.status === 'Ready' ? "border-green-100 shadow-md" :
                                item.status === 'Shortage' ? "border-red-100 shadow-md" : "border-gray-50 hover:border-primary/20"
                        )}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                    item.status === 'Ready' ? "bg-green-100 text-green-600" :
                                        item.status === 'Shortage' ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                                )}>
                                    <Fish size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.category}</p>
                                    <h4 className="text-lg font-black text-primary uppercase tracking-tight">{item.productName}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                            <Package size={12} /> {item.quantity}{item.unit}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                            <Clock size={12} /> {item.orderCount} Orders
                                        </div>
                                        {(item.subscriptionCount ?? 0) > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                ↻ {item.subscriptionCount} Sub
                                            </div>
                                        )}
                                        {(item.oneTimeCount ?? 0) > 0 && (
                                            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                1x {item.oneTimeCount} One-off
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    item.status === 'Ready' ? "bg-green-50 text-green-600 border-green-200" :
                                        item.status === 'Shortage' ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-text-muted border-gray-100"
                                )}>
                                    {item.status}
                                </span>
                                {item.status === 'Ready' && <CheckCircle2 size={24} className="text-green-500 transition-all scale-110" />}
                                {item.status === 'Shortage' && <AlertCircle size={24} className="text-red-500 transition-all scale-110" />}
                            </div>
                        </div>

                        {/* Status Change Hint */}
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-primary transition-colors">
                            <span>Tap to change status</span>
                            <ChevronRight size={14} />
                        </div>

                        {/* Progress bar for 'Ready' items */}
                        {item.status === 'Ready' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Insight */}
            <div className="bg-amber-50 rounded-[32px] p-8 border border-amber-100 flex items-start gap-4">
                <AlertCircle size={24} className="text-amber-600 shrink-0" />
                <div>
                    <h5 className="font-black text-amber-900 uppercase tracking-tight">Logistics Notice</h5>
                    <p className="text-sm text-amber-800 leading-relaxed mt-1">
                        Please ensure all &quot;Ready&quot; items are packed with correct weight variation tags by 05:00 AM.
                        Shortage items will automatically notify customers of late delivery or partial refund at 06:00 AM.
                    </p>
                </div>
            </div>
        </div>
    )
}
