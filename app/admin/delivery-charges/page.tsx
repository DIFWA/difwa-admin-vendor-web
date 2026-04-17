"use client"

import { useState, useEffect } from "react"
import { Truck, Save, Plus, Trash2, Info, History, AlertCircle } from "lucide-react"
import adminService from "@/data/services/adminService"
import { toast } from "sonner"

type Slab = { minKm: number; maxKm: number; charge: number }
type Setting = {
    slabs: Slab[]
    maxDeliveryKm: number
    history: any[]
    updatedAt: string
}

export default function DeliveryChargesPage() {
    const [setting, setSetting] = useState<Setting | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [slabs, setSlabs] = useState<Slab[]>([])
    const [maxKm, setMaxKm] = useState(30)
    const [note, setNote] = useState("")

    useEffect(() => { fetchSettings() }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const res = await adminService.getDeliveryChargeSettings()
            if (res.success) {
                setSetting(res.data)
                setSlabs(res.data.slabs.map((s: Slab) => ({ ...s })))
                setMaxKm(res.data.maxDeliveryKm)
            }
        } catch (e: any) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSlabChange = (index: number, field: keyof Slab, value: string) => {
        setSlabs(prev => prev.map((s, i) => i === index ? { ...s, [field]: parseFloat(value) || 0 } : s))
    }

    const addSlab = () => {
        const last = slabs[slabs.length - 1]
        setSlabs(prev => [...prev, { minKm: last?.maxKm || 0, maxKm: (last?.maxKm || 0) + 5, charge: 0 }])
    }

    const removeSlab = (index: number) => {
        if (slabs.length <= 1) { toast.error("At least one slab is required"); return }
        setSlabs(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        // Validate
        for (let i = 0; i < slabs.length; i++) {
            const s = slabs[i]
            if (s.minKm >= s.maxKm) { toast.error(`Slab ${i + 1}: Min km must be less than Max km`); return }
            if (s.charge < 0) { toast.error(`Slab ${i + 1}: Charge cannot be negative`); return }
        }
        setSaving(true)
        try {
            const res = await adminService.updateDeliveryChargeSettings(slabs, maxKm, note)
            if (res.success) {
                toast.success("Delivery charge settings saved!")
                setSetting(res.data)
                setNote("")
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-primary uppercase">Delivery Charges</h1>
                <p className="text-text-muted mt-1">Set distance-based delivery slabs. Customers are charged based on how far they are from the vendor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-border-custom/50">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-primary uppercase tracking-tight text-lg">Distance Slabs</h3>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Min km ≤ distance &lt; Max km</p>
                            </div>
                        </div>

                        {/* Slabs */}
                        <div className="space-y-3">
                            {slabs.map((slab, index) => (
                                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center p-4 rounded-2xl bg-background-soft border border-border-custom/50">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">From (km)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={slab.minKm}
                                            onChange={e => handleSlabChange(index, "minKm", e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-border-custom outline-none text-sm font-bold focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">To (km)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={slab.maxKm}
                                            onChange={e => handleSlabChange(index, "maxKm", e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-border-custom outline-none text-sm font-bold focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Charge (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={slab.charge}
                                            onChange={e => handleSlabChange(index, "charge", e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-white border border-border-custom outline-none text-sm font-bold focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeSlab(index)}
                                        className="mt-5 p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addSlab}
                            className="w-full py-3 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-bold text-sm hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Add Slab
                        </button>

                        {/* Max Delivery Distance */}
                        <div className="space-y-2 pt-4 border-t border-border-custom/50">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Maximum Delivery Distance (km)</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={maxKm}
                                onChange={e => setMaxKm(parseInt(e.target.value) || 30)}
                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none font-black text-2xl text-primary transition-all"
                            />
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Orders beyond this distance will be rejected as "Not Deliverable".</p>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Reason for change (Internal Note)</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none font-bold text-primary min-h-[80px] transition-all"
                                placeholder="Why are you updating the slabs?"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save Delivery Rules"}
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50/50 rounded-[32px] p-6 border border-blue-100 flex gap-4">
                        <Info size={24} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="font-black text-blue-900 uppercase tracking-tight text-sm">How Delivery Charges Work</h4>
                            <ul className="text-xs font-bold text-blue-800/70 space-y-2 list-disc ml-4 leading-relaxed">
                                <li>The app calculates road distance using Google Maps before checkout.</li>
                                <li>The slab containing the order's distance is applied.</li>
                                <li>If distance exceeds Max Distance, the order is rejected.</li>
                                <li>Delivery income goes to Difwa (platform), not the vendor.</li>
                                <li>Wallet users are charged items + delivery together.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Preview + History */}
                <div className="space-y-6">
                    {/* Live Preview */}
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl p-6 space-y-4">
                        <h3 className="font-black text-primary uppercase tracking-tight">Slab Preview</h3>
                        <div className="space-y-2">
                            {slabs.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background-soft">
                                    <span className="text-xs font-bold text-text-muted">{s.minKm} – {s.maxKm} km</span>
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${s.charge === 0 ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                        {s.charge === 0 ? "FREE" : `₹${s.charge}`}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
                                <span className="text-xs font-bold text-red-500">&gt; {maxKm} km</span>
                                <span className="text-xs font-black px-2 py-1 rounded-lg bg-red-100 text-red-600">Not Deliverable</span>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <History size={18} className="text-primary" />
                            <h3 className="font-black text-primary uppercase tracking-tight">Change History</h3>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                            {setting?.history && setting.history.length > 0 ? (
                                [...setting.history].reverse().map((h: any, i: number) => (
                                    <div key={i} className="p-3 rounded-2xl bg-background-soft border border-border-custom/50 space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{h.slabs?.length} slabs</span>
                                            <span className="text-[10px] font-bold text-text-muted">{new Date(h.changedAt).toLocaleDateString()}</span>
                                        </div>
                                        {h.note && <p className="text-xs font-bold text-primary/80 italic">"{h.note}"</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs font-bold text-text-muted text-center py-6">No history yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
