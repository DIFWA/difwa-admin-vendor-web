"use client"

import { useState, useEffect } from "react"
import { Store, MapPin, Upload, Save, Loader2, X, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import retailerService from "@/data/services/retailerService"
import useAuthStore from "@/data/store/useAuthStore"
import { toast } from "sonner"

export default function StoreSettingsPage() {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        businessName: "",
        storeDisplayName: "",
        businessType: "",
        ownerName: "",
        email: "",
        whatsappNumber: "",
        storeImage: "",
        location: {
            address: "",
            city: "",
            state: "",
            pincode: "",
            landmark: ""
        }
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await retailerService.getProfile(user._id)
                const data = response.data || response; // Handle both direct data and {data: ...} structures

                setFormData({
                    businessName: data.businessDetails?.businessName || "",
                    storeDisplayName: data.businessDetails?.storeDisplayName || "",
                    businessType: data.businessDetails?.businessType || "",
                    ownerName: data.businessDetails?.ownerName || data.name || "",
                    email: data.email || "",
                    whatsappNumber: data.whatsappNumber || "",
                    storeImage: data.businessDetails?.storeImage || "",
                    location: {
                        address: data.businessDetails?.location?.address || "",
                        city: data.businessDetails?.location?.city || "",
                        state: data.businessDetails?.location?.state || "",
                        pincode: data.businessDetails?.location?.pincode || "",
                        landmark: data.businessDetails?.location?.landmark || ""
                    }
                })
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        if (user?._id) fetchProfile()
    }, [user])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const response = await retailerService.uploadImage(file)
            setFormData({ ...formData, storeImage: response.url })
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await retailerService.updateProfile({
                businessDetails: {
                    businessName: formData.businessName,
                    storeDisplayName: formData.storeDisplayName,
                    businessType: formData.businessType,
                    storeImage: formData.storeImage,
                    location: formData.location
                },
                whatsappNumber: formData.whatsappNumber
            })
            toast.success("Settings saved successfully!")
        } catch (error) {
            console.error("Save failed:", error)
            toast.error("Failed to save settings.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-text-muted text-sm">Manage your shop's profile and customer-facing information.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-70"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-2xl   space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary-light text-primary">
                                <Store size={20} />
                            </div>
                            <h3 className="text-lg font-bold">Shop Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <label className="text-sm font-semibold">Store Display Name</label>
                                 <input
                                     type="text"
                                     value={formData.storeDisplayName}
                                     onChange={e => setFormData({ ...formData, storeDisplayName: e.target.value })}
                                     placeholder="e.g. Difwa Water Solutions"
                                     className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary transition-all outline-none text-sm"
                                 />
                             </div>
                             <div className="space-y-2">
                                 <label className="text-sm font-semibold">Legal Business Name</label>
                                 <input
                                     type="text"
                                     value={formData.businessName}
                                     readOnly
                                     className="w-full px-4 py-2.5 rounded-lg bg-gray-100 border-transparent text-sm text-text-muted font-medium outline-none"
                                 />
                             </div>
                         </div>
 
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <label className="text-sm font-semibold">WhatsApp Number</label>
                                 <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                     <input
                                         type="tel"
                                         value={formData.whatsappNumber}
                                         onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                         placeholder="+91 8989898989"
                                         className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm"
                                     />
                                 </div>
                             </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 border-transparent text-sm text-text-muted outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Address */}
                    <section className="bg-white p-6 rounded-2xl   space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <MapPin size={20} />
                            </div>
                            <h3 className="text-lg font-bold">Store Location</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Full Address</label>
                                <textarea
                                    rows={3}
                                    value={formData.location.address}
                                    onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                                    placeholder="Street, Area..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent focus:bg-white focus:border-primary outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">City</label>
                                    <input
                                        type="text"
                                        value={formData.location.city}
                                        onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Pincode</label>
                                    <input
                                        type="text"
                                        value={formData.location.pincode}
                                        onChange={e => setFormData({ ...formData, location: { ...formData.location, pincode: e.target.value } })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-soft border-transparent outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Media */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl   space-y-4">
                        <h3 className="text-lg font-bold">Shop Banner</h3>
                        <p className="text-xs text-text-muted">This image will be shown to customers when they browse shops.</p>

                        <label className="aspect-video border-2 border-dashed border-border-custom rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary transition-all overflow-hidden relative bg-background-soft">
                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                            {formData.storeImage ? (
                                <img src={formData.storeImage} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center p-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        {uploading ? <Loader2 size={24} className="text-primary animate-spin" /> : <Upload size={24} className="text-text-muted" />}
                                    </div>
                                    <p className="text-sm font-bold">{uploading ? "Uploading..." : "Upload Cover"}</p>
                                </div>
                            )}
                        </label>

                        {formData.storeImage && (
                            <button
                                onClick={() => setFormData({ ...formData, storeImage: "" })}
                                className="w-full py-2 rounded-lg border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-2 mt-2"
                            >
                                <X size={14} /> Remove Image
                            </button>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
