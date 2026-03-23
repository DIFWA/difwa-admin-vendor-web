"use client"

import { useState } from "react"
import {
    Plus,
    Search,
    X,
    Upload,
    Calendar,
    ChevronDown,
    Info,
    Edit2
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddProductPage() {
    const [selectedColors, setSelectedColors] = useState<string[]>(["#AEDC81"])

    const colors = [
        { name: "blue", value: "#0096FF" },
        { name: "Pink", value: "#F9D5D7" },
        { name: "Blue", value: "#D5E7F9" },
        { name: "Cream", value: "#F9F1D5" },
        { name: "Dark", value: "#111827" },
    ]

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
                    <p className="text-text-muted text-sm">Create a new product for your store.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium flex items-center gap-2">
                        Save to draft
                    </button>
                    <button className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2">
                        Publish Product
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
                                <label className="text-sm font-semibold">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="iPhone 15"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center justify-between">
                                    Product Description
                                    <div className="flex gap-2">
                                        <Edit2 size={14} className="text-text-muted cursor-pointer" />
                                    </div>
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Describe your product details here..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Product Price</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="999.89"
                                        className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-text-muted">
                                        USD <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Discounted Price (Optional)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</div>
                                    <input
                                        type="text"
                                        placeholder="99"
                                        className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary italic">Sale = ₹900.89</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Tax Included</p>
                                <div className="flex bg-background-soft p-1 rounded-lg w-fit">
                                    <button className="px-6 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md border border-primary/20">Yes</button>
                                    <button className="px-6 py-1.5 text-xs font-bold text-text-muted">No</button>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-semibold">Expiration</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Start Date"
                                        className="w-full pl-10 h-[42px] px-4 rounded-lg bg-background-soft border-transparent text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Inventory */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <h3 className="text-lg font-bold">Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Stock Quantity</label>
                                <input
                                    type="text"
                                    placeholder="Unlimited"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Stock Status</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none">
                                        <option>In Stock</option>
                                        <option>Out of Stock</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full transition-all"></div>
                            </div>
                            <span className="text-sm font-medium">Unlimited</span>
                        </div>
                    </section>
                </div>

                {/* Right Column - Media & Categories */}
                <div className="space-y-6">
                    {/* Media */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 ">
                        <h3 className="text-lg font-bold">Upload Product Image</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all">
                            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-primary" />
                            </div>
                            <p className="text-sm font-bold">Browse or Drop files</p>
                            <p className="text-xs text-text-muted mt-1">PNG, JPG, SVG up to 5MB</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="aspect-square rounded-xl bg-background-soft border relative group">
                                    <button className="absolute -top-2 -right-2 w-5 h-5 bg-white border rounded-full flex items-center justify-center text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-background-soft transition-all">
                                <Plus size={16} className="text-primary" />
                                <span className="text-[10px] font-bold">Add Image</span>
                            </div>
                        </div>
                    </section>

                    {/* Configuration */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Product Categories</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none">
                                        <option>Select your product</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Product Tag</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none">
                                        <option>Select your product</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Select your color</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color) => (
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
        </div>
    )
}
