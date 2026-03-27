"use client"

import { useState } from "react"
import { X, User, Phone, Loader2 } from "lucide-react"
import retailerService from "@/data/services/retailerService"
import { cn } from "@/lib/utils"

interface ManualCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ManualCustomerModal({ isOpen, onClose, onSuccess }: ManualCustomerModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: ""
    })
    const [error, setError] = useState("")

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await retailerService.addManualCustomer(formData)
            if (res.success) {
                onSuccess()
                onClose()
                setFormData({ fullName: "", phoneNumber: "" })
            } else {
                setError(res.message || "Failed to add customer")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-xl font-bold">Add New Customer</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-soft transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-text-muted ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Enter customer name"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-text-muted ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Add Customer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
