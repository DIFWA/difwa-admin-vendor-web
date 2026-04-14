"use client"

import { useState, useEffect } from "react"
import { Percent, Save, History, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"

import useAdminStore from "@/data/store/useAdminStore"

export default function CommissionPage() {
    const [mounted, setMounted] = useState(false)
    const { 
        commissionData: setting, 
        loadingCommission: loading, 
        fetchCommissionData 
    } = useAdminStore()
    const [updating, setUpdating] = useState(false)
    const [newRate, setNewRate] = useState("")
    const [description, setDescription] = useState("")
    const [note, setNote] = useState("")

    useEffect(() => {
        setMounted(true)
        fetchCommissionData()
    }, [fetchCommissionData])

    useEffect(() => {
        if (setting) {
            setNewRate(setting.rate.toString())
            setDescription(setting.description || "")
        }
    }, [setting])

    if (!mounted) return null

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        try {
            const res = await adminService.updateCommissionRate(
                Number(newRate),
                description,
                note
            )
            if (res.success) {
                toast.success("Commission rate updated successfully")
                await fetchCommissionData(true) // Force refresh
                setNote("")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update rate")
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Commission System</h1>
                <p className="text-text-muted mt-1">Manage the platform commission percentage applied to all retailer orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Settings Card */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleUpdate} className="bg-white rounded-[40px] border border-border-custom shadow-xl overflow-hidden p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-custom/50">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Percent size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-primary uppercase tracking-tight text-lg">Current Rate</h3>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Active configuration</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Commission Percentage (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={newRate}
                                        onChange={(e) => setNewRate(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-black text-2xl text-primary pl-12"
                                        placeholder="0.00"
                                    />
                                    <Percent className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                                </div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                                    Determines the amount deducted from retailer's revenue for each order.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold text-primary"
                                    placeholder="e.g. Standard platform fee"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Reason for change (Internal Note)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-auto px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold text-primary min-h-[100px]"
                                    placeholder="Why is the commission rate being updated?"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {updating ? "Updating Settings..." : "Save Commission Rules"}
                        </button>
                    </form>

                    {/* Info Card */}
                    <div className="bg-blue-50/50 rounded-[32px] p-6 border border-blue-100 flex gap-4">
                        <div className="text-blue-500 shrink-0">
                            <Info size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-blue-900 uppercase tracking-tight text-sm">How it works</h4>
                            <ul className="text-xs font-bold text-blue-800/70 space-y-2 list-disc ml-4 leading-relaxed">
                                <li>Commission is calculated as a percentage of the total order value.</li>
                                <li>The rate is snapshotted when an order is placed, so future rate changes won't affect past orders.</li>
                                <li>Retailers see their net revenue (Gross - Commission) on their dashboard.</li>
                                <li>Admin can track all adjustments in the history log.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Stats & History */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl overflow-hidden p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <History size={18} className="text-primary" />
                            <h3 className="font-black text-primary uppercase tracking-tight">Change History</h3>
                        </div>
                        
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                            {setting?.history?.length > 0 ? (
                                setting.history.slice().reverse().map((h: any, i: number) => (
                                    <div key={i} className="p-4 rounded-2xl bg-background-soft border border-border-custom/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                                                {h.rate}%
                                            </span>
                                            <span className="text-[10px] font-bold text-text-muted">
                                                {new Date(h.changedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-primary/80 leading-relaxed italic">"{h.note}"</p>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            By: <span className="text-primary">{h.changedBy?.name || "Admin"}</span>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <History size={32} className="mx-auto text-text-muted/20 mb-2" />
                                    <p className="text-xs font-bold text-text-muted">No history logs yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-primary rounded-[32px] p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-1">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Current Multiplier</p>
                            <h2 className="text-3xl font-black">{(setting?.rate / 100).toFixed(2)}x</h2>
                            <p className="text-[10px] mt-2 font-bold text-white/70">Applied to order subtotal</p>
                        </div>
                        <Percent size={60} className="absolute right-[-10px] bottom-[-10px] text-white/10 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    )
}
