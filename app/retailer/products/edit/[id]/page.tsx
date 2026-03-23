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
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useRouter, useParams } from "next/navigation"
import retailerService from "@/data/services/retailerService"
import ImageCropper from "@/components/shared/ImageCropper"

interface Category {
    _id: string;
    name: string;
}

export default function EditProductPage() {
    const router = useRouter()
    const { id } = useParams()
    const [selectedColors, setSelectedColors] = useState<string[]>(["#AEDC81"])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)
    const [uploading, setUploading] = useState(false)

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
        const init = async () => {
            await fetchCategories()
            if (id) {
                await fetchProduct(id as string)
            }
        }
        init()
    }, [id])

    const fetchCategories = async () => {
        try {
            const response = await retailerService.getCategories()
            setCategories(response.data)
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchProduct = async (productId: string) => {
        setLoading(true)
        try {
            const response = await retailerService.getProduct(productId)
            const p = response.data
            setFormData({
                name: p.name || "",
                description: p.description || "",
                category: p.category?._id || p.category || "",
                price: p.price || 0,
                stock: p.stock || 0,
                stockStatus: p.stockStatus || "In Stock",
                status: p.status || "Published",
                images: p.images || []
            })
        } catch (error) {
            console.error("Error fetching product:", error)
            alert("Failed to load product data")
            router.push("/retailer/products")
        } finally {
            setLoading(false)
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

    const handleUpdate = async () => {
        if (!formData.name || !formData.category || !formData.price) {
            alert("Please fill in the required fields (Name, Category, Price)")
            return
        }

        setPublishing(true)
        try {
            await retailerService.updateProduct(id as string, formData)
            router.push("/retailer/products")
        } catch (error) {
            console.error("Failed to update catch:", error)
            alert("Failed to update product")
        } finally {
            setPublishing(false)
        }
    }

    const colors = [
        { name: "blue", value: "#0096FF" },
        { name: "Pink", value: "#F9D5D7" },
        { name: "Blue", value: "#D5E7F9" },
        { name: "Cream", value: "#F9F1D5" },
        { name: "Dark", value: "#111827" },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Loading Product Details...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-text-muted text-sm">Update your catch details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/retailer/products")}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium flex items-center gap-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={publishing || uploading}
                        className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {publishing ? <Loader2 size={16} className="animate-spin" /> : null}
                        {publishing ? "Updating..." : "Save Changes"}
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
                                    placeholder="e.g. Premium Tiger Shrimp (Head-on)"
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
                                <label className="text-sm font-semibold">Stock Quantity (kg)</label>
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
        </div>
    )
}
