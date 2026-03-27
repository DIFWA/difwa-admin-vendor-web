"use client"

import { useState, useEffect } from "react"
import { X, ShoppingBag, Plus, Minus, Search, Loader2, Package } from "lucide-react"
import retailerService from "@/data/services/retailerService"
import { cn } from "@/lib/utils"

interface ManualOrderModalProps {
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

export default function ManualOrderModal({ isOpen, onClose, customer, onSuccess }: ManualOrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [cart, setCart] = useState<{ productId: string, name: string, price: number, quantity: number }[]>([])
    const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Due">("Paid")
    const [paymentMethod, setPaymentMethod] = useState<string>("Cash")
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

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.productId === product._id)
        if (existing) {
            setCart(cart.map(item => 
                item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ))
        } else {
            setCart([...cart, { productId: product._id, name: product.name, price: product.price, quantity: 1 }])
        }
    }

    const removeFromCart = (productId: string) => {
        const existing = cart.find(item => item.productId === productId)
        if (existing && existing.quantity > 1) {
            setCart(cart.map(item => 
                item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
            ))
        } else {
            setCart(cart.filter(item => item.productId !== productId))
        }
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleSubmit = async () => {
        if (cart.length === 0) return
        setLoading(true)
        setError("")

        try {
            const res = await retailerService.createManualOrder({
                customerId: customer.id,
                items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
                deliveryAddress: isAddingNew ? deliveryAddress : (customer.addresses?.find(a => a._id === selectedAddressId)?.fullAddress || deliveryAddress || "Manual Entry"),
                paymentStatus,
                paymentMethod
            })

            if (res.success) {
                onSuccess()
                onClose()
                setCart([])
            } else {
                setError(res.message || "Failed to create order")
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="p-6 border-b border-border-custom flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-light text-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Create Order for {customer.name}</h3>
                            <p className="text-xs text-text-muted">Select products to add to this manual order</p>
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
                                filteredProducts.map((p) => {
                                    const cartItem = cart.find(item => item.productId === p._id)
                                    return (
                                        <div key={p._id} className="bg-white p-3 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden border bg-background-soft">
                                                <img src={p.images[0] || ""} alt={p.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-primary uppercase">{p.name}</h4>
                                                <p className="text-xs font-black text-text-muted">₹{p.price}</p>
                                            </div>
                                            {cartItem ? (
                                                <div className="flex items-center gap-1 bg-primary/5 rounded-xl p-1 border border-primary/10">
                                                    <button 
                                                        onClick={() => removeFromCart(p._id)}
                                                        className="p-1.5 rounded-lg hover:bg-white text-primary transition-all"
                                                    >
                                                        <Minus size={14} strokeWidth={3} />
                                                    </button>
                                                    <span className="w-8 text-center font-black text-sm text-primary">{cartItem.quantity}</span>
                                                    <button 
                                                        onClick={() => addToCart(p)}
                                                        className="p-1.5 rounded-lg hover:bg-white text-primary transition-all"
                                                    >
                                                        <Plus size={14} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => addToCart(p)}
                                                    className="px-4 py-2 rounded-xl bg-background-soft text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all border border-primary/10"
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Order Summary / Cart */}
                    <div className="w-full md:w-80 bg-white flex flex-col min-h-0">
                        <div className="p-4 border-b border-border-custom bg-background-soft/50">
                            <h4 className="font-bold text-xs uppercase tracking-widest text-text-muted">Order Summary</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 text-text-muted">
                                    <ShoppingBag size={40} className="mx-auto mb-4 opacity-10" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider italic">Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.productId} className="flex items-center justify-between text-sm py-2 border-b border-border-custom last:border-0 border-dashed">
                                        <div>
                                            <p className="font-bold text-primary uppercase">{item.name}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-tighter">
                                                {item.quantity} x ₹{item.price}
                                            </p>
                                        </div>
                                        <p className="font-black text-primary">₹{item.price * item.quantity}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-background-soft/30 space-y-4 border-t border-border-custom">
                            <div className="space-y-3 pb-2 border-b border-border-custom border-dashed">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Payment Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setPaymentStatus("Paid")}
                                        className={cn(
                                            "py-2 rounded-xl text-xs font-bold transition-all border",
                                            paymentStatus === "Paid" ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-text-muted border-border-custom hover:border-primary/50"
                                        )}
                                    >
                                        Paid
                                    </button>
                                    <button 
                                        onClick={() => setPaymentStatus("Due")}
                                        className={cn(
                                            "py-2 rounded-xl text-xs font-bold transition-all border",
                                            paymentStatus === "Due" ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-text-muted border-border-custom hover:border-orange-500/50"
                                        )}
                                    >
                                        Due (Credit)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-lg font-black text-primary uppercase tracking-tighter">
                                <span>Total Amount</span>
                                <span>₹{totalAmount}</span>
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
                                        className="w-full p-3 rounded-xl bg-white border border-border-custom text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[60px] resize-none animate-in fade-in slide-in-from-top-1 duration-200"
                                    />
                                )}
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || cart.length === 0}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Confirm Manual Order
                                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-text-muted font-bold uppercase tracking-widest opacity-50 italic">
                                Note: This order will be marked as "Accepted" & "Cash on Delivery"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
