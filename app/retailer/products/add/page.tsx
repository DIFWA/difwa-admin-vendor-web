"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    X,
    Upload,
    Calendar,
    ChevronDown,
    Info,
    Edit2,
    Loader2,
    Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useRouter } from "next/navigation"
import retailerService from "@/data/services/retailerService"
import ImageCropper from "@/components/shared/ImageCropper"
import useAuthStore from "@/data/store/useAuthStore"

interface Category {
    _id: string;
    name: string;
}

export default function AddProductPage() {
    const router = useRouter()
    const [selectedColors, setSelectedColors] = useState<string[]>(["#AEDC81"])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Time Slot Modal State
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
    const [deliverySlots, setDeliverySlots] = useState<string[]>([])
    const [customSlot, setCustomSlot] = useState("")
    const defaultSlots = ["8-9 AM", "9-10 AM", "10-11 AM", "11 AM-12 PM", "4-5 PM", "5-6 PM", "6-7 PM"]
    const [savingSlots, setSavingSlots] = useState(false)

    // Cropping State
    const [showCropper, setShowCropper] = useState(false)
    const [tempImage, setTempImage] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        price: "" as string | number,
        stock: 0,
        stockStatus: "In Stock" as "In Stock" | "Out of Stock" | "Low Stock",
        status: "Published" as "Published" | "Draft",
        images: [] as string[]
    })

    useEffect(() => {
        fetchCategories()
        if (user?._id) fetchProfile()
    }, [user])

    const fetchCategories = async () => {
        try {
            const response = await retailerService.getCategories()
            setCategories(response.data)
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchProfile = async () => {
        try {
            const response = await retailerService.getProfile(user._id)
            const data = response.data || response;
            if (data.businessDetails?.deliverySlots) {
                setDeliverySlots(data.businessDetails.deliverySlots)
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            setTempImage(reader.result as string)
            setShowCropper(true)
        }
        reader.readAsDataURL(file)
    }

    const onCropComplete = async (croppedBlob: Blob) => {
        setShowCropper(false)
        setUploading(true)
        try {
            // Convert blob to file for standard upload
            const file = new File([croppedBlob], "product-image.jpg", { type: "image/jpeg" })
            const response = await retailerService.uploadImage(file)
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, response.url]
            }))
        } catch (error) {
            console.error("Upload failed:", error)
            alert("Image upload failed")
        } finally {
            setUploading(false)
            setTempImage(null)
        }
    }

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handlePublish = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            alert("Please fill in the required fields (Name, Category, Price)")
            return
        }

        if (deliverySlots.length === 0) {
            setShowTimeSlotModal(true)
            return
        }

        setPublishing(true)
        try {
            await retailerService.createProduct(formData)
            router.push("/retailer/products")
        } catch (error) {
            console.error("Failed to publish product:", error)
            alert("Failed to publish product")
        } finally {
            setPublishing(false)
        }
    }

    const handleSaveSlotsAndPublish = async () => {
        if (deliverySlots.length === 0) {
            alert("Please select at least one delivery slot.")
            return
        }
        setSavingSlots(true)
        try {
            const response = await retailerService.getProfile(user._id)
            const data = response.data || response;
            await retailerService.updateProfile({
                businessDetails: {
                    ...data.businessDetails,
                    deliverySlots
                }
            })
            setShowTimeSlotModal(false)
            handlePublish() // Proceed to publish now that slots are saved
        } catch (error) {
            console.error("Failed to save slots:", error)
            alert("Failed to save time slots.")
        } finally {
            setSavingSlots(false)
        }
    }

    const colors = [
        { name: "blue", value: "#0096FF" },
        { name: "Pink", value: "#F9D5D7" },
        { name: "Blue", value: "#D5E7F9" },
        { name: "Cream", value: "#F9F1D5" },
        { name: "Dark", value: "#111827" },
    ]

    return (
        <div className="space-y-8 pb-20 text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
                    <p className="text-text-muted text-sm">List a new product to your Water shop.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/retailer/products")}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium flex items-center gap-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={publishing || uploading}
                        className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {publishing ? <Loader2 size={16} className="animate-spin" /> : null}
                        {publishing ? "Publishing..." : "Publish Product"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Product Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Details */}
                    <section className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <h3 className="text-lg font-bold">Basic Details</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. 20L Water Can"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center justify-between">
                                    Product Description *
                                    <div className="flex gap-2">
                                        <Edit2 size={14} className="text-text-muted cursor-pointer" />
                                    </div>
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your product details here..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <h3 className="text-lg font-bold">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Base Price (₹) *</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</div>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Inventory */}
                    <section className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold">Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Stock Quantity (lt.)</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    placeholder="Enter quantity"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Stock Status</label>
                                <div className="relative">
                                    <select
                                        value={formData.stockStatus}
                                        onChange={e => setFormData({ ...formData, stockStatus: e.target.value as any })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none"
                                    >
                                        <option value="In Stock">In Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Media & Categories */}
                <div className="space-y-6">
                    {/* Media */}
                    <section className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                        <h3 className="text-lg font-bold">Upload Product Image</h3>
                        <label className="border-2 border-dashed border-border-custom rounded-2xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all">
                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                {uploading ? <Loader2 size={24} className="text-primary animate-spin" /> : <Upload size={24} className="text-primary" />}
                            </div>
                            <p className="text-sm font-bold">{uploading ? "Uploading..." : "Click to Upload"}</p>
                            <p className="text-xs text-text-muted mt-1">PNG, JPG recommended</p>
                        </label>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl bg-background-soft border relative group overflow-hidden">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 border rounded-full flex items-center justify-center text-red-500 shadow-sm hover:scale-110 transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Configuration */}
                    <section className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Product Category *</label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none focus:bg-white focus:border-primary transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Listing Status</label>
                            <div className="flex bg-background-soft p-1 rounded-lg w-full">
                                <button
                                    onClick={() => setFormData({ ...formData, status: "Published" })}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                                        formData.status === "Published" ? "bg-white shadow-sm border border-primary/20 text-primary" : "text-text-muted"
                                    )}
                                >
                                    Published
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, status: "Draft" })}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                                        formData.status === "Draft" ? "bg-white shadow-sm border border-primary/20 text-primary" : "text-text-muted"
                                    )}
                                >
                                    Draft
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Select your color</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color: any) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            if (selectedColors.includes(color.value)) {
                                                setSelectedColors(selectedColors.filter(c => c !== color.value))
                                            } else {
                                                setSelectedColors([...selectedColors, color.value])
                                            }
                                        }}
                                        className={cn(
                                            "w-10 h-10 rounded-lg border-2 transition-all",
                                            selectedColors.includes(color.value) ? "border-primary scale-110 shadow-sm" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {showCropper && tempImage && (
                <ImageCropper
                    image={tempImage}
                    onCropComplete={onCropComplete}
                    onCancel={() => {
                        setShowCropper(false)
                        setTempImage(null)
                    }}
                />
            )}

            {/* Time Slot Required Modal */}
            {showTimeSlotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between">
                            <div className="flex items-center gap-3 text-orange-600">
                                <Clock size={24} />
                                <div>
                                    <h2 className="text-xl font-bold text-text">Set Delivery Slots</h2>
                                    <p className="text-xs text-text-muted mt-1">Required before adding products</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTimeSlotModal(false)} className="p-2 text-text-muted hover:bg-background-soft rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <p className="text-sm text-text-muted">
                                Since this is your first product, please define your delivery time windows. Customers will choose one during checkout.
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                                {deliverySlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium group">
                                        {slot}
                                        <button 
                                            onClick={() => setDeliverySlots(deliverySlots.filter((_, i) => i !== index))}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border-custom">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Quick Add Defaults</label>
                                    <div className="flex flex-wrap gap-2">
                                        {defaultSlots.filter(s => !deliverySlots.includes(s)).map((slot) => (
                                            <button
                                                key={slot}
                                                onClick={() => setDeliverySlots([...deliverySlots, slot])}
                                                className="px-3 py-1.5 rounded-lg border border-border-custom hover:border-primary hover:text-primary transition-all text-xs font-medium bg-background-soft"
                                            >
                                                + {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Custom Slot</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customSlot}
                                            onChange={(e) => setCustomSlot(e.target.value)}
                                            placeholder="e.g. 7:30 - 8:30 AM"
                                            className="flex-1 px-4 py-2 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                        />
                                        <button
                                            onClick={() => {
                                                if (customSlot && !deliverySlots.includes(customSlot)) {
                                                    setDeliverySlots([...deliverySlots, customSlot])
                                                    setCustomSlot("")
                                                }
                                            }}
                                            className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border-custom bg-background-soft/50 flex justify-end gap-3">
                            <button onClick={() => setShowTimeSlotModal(false)} className="px-6 py-2.5 rounded-xl bg-white border border-border-custom text-[10px] font-black uppercase tracking-wider hover:bg-background-soft transition-all shadow-sm text-text-muted">
                                Cancel
                            </button>
                            <button onClick={handleSaveSlotsAndPublish} disabled={savingSlots} className="px-8 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
                                {savingSlots ? "Saving..." : "Save Slots & Publish Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
