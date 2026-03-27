"use client"

import { useState, useEffect } from "react"
import { X, Calendar, Plus, Minus, Search, Loader2, Package, Check } from "lucide-react"
import retailerService from "@/data/services/retailerService"
import { cn } from "@/lib/utils"

interface ManualSubscriptionModalProps {
    isOpen: boolean
    onClose: () => void
    customer: { 
        id: string; 
        name: string; 
        addresses?: Array<{ _id: string; fullAddress: string; label?: string; isDefault?: boolean }>;
    } | null
    onSuccess: () => void
}

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
}

const FREQUENCIES = ["Daily", "Alternate Days", "Weekly"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function ManualSubscriptionModal({ isOpen, onClose, customer, onSuccess }: ManualSubscriptionModalProps) {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [frequency, setFrequency] = useState<string>("Daily")
    const [customDays, setCustomDays] = useState<string[]>([])
    const [quantity, setQuantity] = useState(1)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState("")
    const [deliveryAddress, setDeliveryAddress] = useState("")
    const [selectedAddressId, setSelectedAddressId] = useState<string>("")
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (isOpen && customer) {
            fetchProducts()
            if (customer.addresses && customer.addresses.length > 0) {
                const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0]
                setSelectedAddressId(defaultAddr._id)
                setDeliveryAddress(defaultAddr.fullAddress)
                setIsAddingNew(false)
            } else {
                setIsAddingNew(true)
                setSelectedAddressId("new")
            }
        }
    }, [isOpen, customer])

    const fetchProducts = async () => {
        setProductsLoading(true)
        try {
            const res = await retailerService.getProducts()
            setProducts(res.data.filter((p: any) => p.status === "Published"))
        } catch (err) {
            console.error("Failed to fetch products", err)
        } finally {
            setProductsLoading(false)
        }
    }

    if (!isOpen || !customer) return null

    const toggleDay = (day: string) => {
        if (customDays.includes(day)) {
            setCustomDays(customDays.filter(d => d !== day))
        } else {
            setCustomDays([...customDays, day])
        }
    }

    const handleSubmit = async () => {
        if (!selectedProduct) return
        if (frequency === "Weekly" && customDays.length === 0) {
            setError("Please select at least one day for weekly subscription")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await retailerService.createManualSubscription({
                customerId: customer.id,
                productId: selectedProduct._id,
                frequency,
                customDays: frequency === "Weekly" ? customDays : [],
                quantity,
                startDate,
                endDate: endDate || undefined,
                deliveryAddress: isAddingNew ? deliveryAddress : (customer.addresses?.find(a => a._id === selectedAddressId)?.fullAddress || deliveryAddress || "Manual Entry")
            })

            if (res.success) {
                onSuccess()
                onClose()
                resetForm()
            } else {
                setError(res.message || "Failed to create subscription")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSelectedProduct(null)
        setFrequency("Daily")
        setCustomDays([])
        setQuantity(1)
        setError("")
    }

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="p-6 border-b border-border-custom flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Create Subscription for {customer.name}</h3>
                            <p className="text-xs text-text-muted">Set up recurring deliveries for this customer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background-soft transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-x divide-border-custom">
                    {/* Product Selection List */}
                    <div className="flex-1 flex flex-col min-h-0 bg-background-soft/30">
                        <div className="p-4 bg-white border-b border-border-custom">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {productsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-20 text-text-muted">
                                    <Package size={48} className="mx-auto mb-4 opacity-10" />
                                    <p className="font-bold">No products found</p>
                                </div>
                            ) : (
                                filteredProducts.map((p) => (
                                    <div 
                                        key={p._id} 
                                        onClick={() => setSelectedProduct(p)}
                                        className={cn(
                                            "bg-white p-3 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer hover:shadow-md",
                                            selectedProduct?._id === p._id ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "border-border-custom shadow-sm"
                                        )}
                                    >
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border bg-background-soft">
                                            <img src={p.images[0] || ""} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-primary uppercase">{p.name}</h4>
                                            <p className="text-xs font-black text-text-muted">₹{p.price}</p>
                                        </div>
                                        {selectedProduct?._id === p._id && (
                                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Subscription Settings */}
                    <div className="w-full md:w-96 bg-white flex flex-col min-h-0">
                        <div className="p-4 border-b border-border-custom bg-background-soft/50">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted">Subscription Setup</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Frequency */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Frequency</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {FREQUENCIES.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setFrequency(f)}
                                            className={cn(
                                                "py-3 rounded-xl text-sm font-bold border transition-all text-left px-4 flex items-center justify-between",
                                                frequency === f ? "bg-primary text-white border-primary" : "bg-white text-text border-border-custom hover:border-primary/50"
                                            )}
                                        >
                                            {f}
                                            {frequency === f && <Check size={16} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Weekly Days Selection */}
                            {frequency === "Weekly" && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Repeat On</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                    customDays.includes(day) ? "bg-primary text-white border-primary" : "bg-background-soft text-text-muted border-transparent hover:border-primary/50"
                                                )}
                                            >
                                                {day.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="space-y-3 text-center">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Daily Quantity</label>
                                <div className="flex items-center justify-center gap-6">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-full border border-border-custom flex items-center justify-center hover:bg-background-soft text-primary transition-all"
                                    >
                                        <Minus size={18} strokeWidth={3} />
                                    </button>
                                    <span className="text-3xl font-black text-primary w-12">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-full border border-border-custom flex items-center justify-center hover:bg-background-soft text-primary transition-all"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Delivery Address</label>
                                    
                                    {customer.addresses && customer.addresses.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {customer.addresses.map((addr) => (
                                                    <button
                                                        key={addr._id}
                                                        onClick={() => {
                                                            setSelectedAddressId(addr._id)
                                                            setDeliveryAddress(addr.fullAddress)
                                                            setIsAddingNew(false)
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 rounded-xl text-[10px] font-bold border transition-all text-left flex-1 min-w-[120px]",
                                                            selectedAddressId === addr._id && !isAddingNew ? "bg-primary/10 border-primary text-primary" : "bg-white border-border-custom text-text-muted hover:border-primary/50"
                                                        )}
                                                    >
                                                        <p className="line-clamp-1">{addr.label || "Address"}</p>
                                                        <p className="opacity-60 font-medium line-clamp-1">{addr.fullAddress}</p>
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setIsAddingNew(true)
                                                        setSelectedAddressId("new")
                                                        setDeliveryAddress("")
                                                    }}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-[10px] font-bold border border-dashed transition-all flex items-center justify-center gap-1 flex-1 min-w-[120px]",
                                                        isAddingNew ? "bg-primary/10 border-primary text-primary" : "bg-white border-border-custom text-text-muted hover:border-primary/50"
                                                    )}
                                                >
                                                    <Plus size={12} />
                                                    Add New
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isAddingNew && (
                                        <textarea 
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter full delivery address..."
                                            className="w-full p-3 rounded-xl bg-background-soft border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px] text-xs font-bold resize-none animate-in fade-in slide-in-from-top-1 duration-200"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-background-soft/30 space-y-4 border-t border-border-custom">
                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !selectedProduct}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Create Monthly Subscription
                                        <Calendar size={18} />
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-text-muted font-bold uppercase tracking-widest opacity-50 italic">
                                Note: Orders will be generated automatically based on frequency
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
