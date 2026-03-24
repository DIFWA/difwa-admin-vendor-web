"use client"

import { useState } from "react"
import {
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    Upload,
    ChevronDown,
    X,
    Plus,
    Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function AddShopPage() {
    const [logo, setLogo] = useState<string | null>(null)

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Register New Shop</h1>
                    <p className="text-text-muted text-sm">Onboard a new retailer to the Difwa platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/shops" className="px-4 py-2 rounded-lg border bg-white hover:bg-background-soft transition-all text-sm font-medium">
                        Cancel
                    </Link>
                    <button className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary transition-all text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2">
                        <Save size={16} />
                        Register Shop
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Shop & Owner Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shop Information */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary-light text-primary">
                                <Store size={20} />
                            </div>
                            <h3 className="text-lg font-bold">Shop Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Shop Name</label>
                                <input
                                    type="text"
                                    placeholder="Coastal Harvest"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Store ID (Auto-generated)</label>
                                <input
                                    type="text"
                                    value="SHP-2026-001"
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm text-text-muted font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Store Description</label>
                            <textarea
                                rows={4}
                                placeholder="Describe the shop's specialty and location..."
                                className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Business Category</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none">
                                        <option>Retail Shop</option>
                                        <option>Wholesale</option>
                                        <option>Distribution Center</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">GST Number</label>
                                <input
                                    type="text"
                                    placeholder="22AAAAA0000A1Z5"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm uppercase"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Owner Information */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <User size={20} />
                            </div>
                            <h3 className="text-lg font-bold">Owner Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Owner Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Identification Type</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent text-sm appearance-none outline-none">
                                        <option>Aadhar Card</option>
                                        <option>PAN Card</option>
                                        <option>Driving License</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Media & Address */}
                <div className="space-y-6">
                    {/* Shop Logo/Photo */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                        <h3 className="text-lg font-bold">Shop Brand</h3>
                        <div className="aspect-video border-2 border-dashed border-border-custom rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                            {logo ? (
                                <>
                                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                    <button onClick={() => setLogo(null)} className="absolute top-2 right-2 p-1.5 bg-white border rounded-full text-text-muted hover:text-red-500 shadow-sm">
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-background-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-text-muted" />
                                    </div>
                                    <p className="text-sm font-bold">Upload Shop Logo</p>
                                    <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">1200 x 600 px recommended</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Shop Address */}
                    <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-warning-50 text-warning">
                                <MapPin size={20} />
                            </div>
                            <h3 className="text-lg font-bold">Shop Address</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Full Address</label>
                                <textarea
                                    rows={3}
                                    placeholder="Street, Area, Landmark..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">City</label>
                                <input
                                    type="text"
                                    placeholder="Kochi"
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">State</label>
                                    <input
                                        type="text"
                                        placeholder="Kerala"
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Pincode</label>
                                    <input
                                        type="text"
                                        placeholder="682001"
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
