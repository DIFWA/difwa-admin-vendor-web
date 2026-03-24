"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Building2,
    MapPin,
    FileText,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import fileService from "@/data/services/fileService"
import authService from "@/data/services/authService"
import useAuthStore from "@/data/store/useAuthStore"

const steps = [
    { id: "owner", title: "Owner Details", icon: CheckCircle2 }, // Using CheckCircle2 icon place holder or User
    { id: "store", title: "Store Details", icon: Building2 },
    { id: "business", title: "Business Info", icon: FileText },
    { id: "legal", title: "Legal Details", icon: MapPin } // Swapped icons or just used better ones
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const licenseInputRef = useRef<HTMLInputElement>(null)
    const gstInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})

    const [formData, setFormData] = useState({
        // Owner Details
        ownerName: "",
        alternateContact: "",
        whatsappNumber: "",
        // Store Details
        businessName: "",
        storeDisplayName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        // Business Info
        businessType: "Seafood Retail Store",
        yearsInBusiness: "",
        coldStorage: "No",
        monthlyPurchaseVolume: "",
        // Legal Details
        gst: "",
        fssai: "",
        licenseUrl: "",
        gstCertificateUrl: "",
        agreed: false
    })

    useEffect(() => {
        const id = localStorage.getItem("userId")
        if (!id) {
            router.push("/register")
            return
        }
        setUserId(id)
    }, [])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "licenseUrl" | "gstCertificateUrl") => {
        const file = e.target.files?.[0]
        if (!file) return
        console.log("FILE:", file);

        setUploading(prev => ({ ...prev, [field]: true }))

        try {
            const data = await fileService.upload(file)
            setFormData(prev => ({ ...prev, [field]: data.url }))
            console.log("DATA:", data);
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload failed. Please try again.")
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await authService.updateOnboarding({
                userId,
                alternateContact: formData.alternateContact,
                whatsappNumber: formData.whatsappNumber,
                businessDetails: {
                    businessName: formData.businessName,
                    storeDisplayName: formData.storeDisplayName,
                    ownerName: formData.ownerName,
                    businessType: formData.businessType,
                    yearsInBusiness: formData.yearsInBusiness,
                    coldStorage: formData.coldStorage,
                    monthlyPurchaseVolume: formData.monthlyPurchaseVolume,
                    location: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        landmark: formData.landmark
                    },
                    legal: {
                        gst: formData.gst,
                        fssai: formData.fssai,
                        licenseUrl: formData.licenseUrl,
                        gstCertificateUrl: formData.gstCertificateUrl
                    }
                }
            })

            // Update store state immediately to avoid lag
            if (useAuthStore.getState().user) {
                useAuthStore.getState().setUser({
                    ...useAuthStore.getState().user,
                    status: "under_review",
                    businessDetails: {
                        ...useAuthStore.getState().user.businessDetails,
                        businessName: formData.businessName,
                        businessType: formData.businessType,
                        location: {
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            pincode: formData.pincode,
                            landmark: formData.landmark
                        }
                    }
                })
            }

            localStorage.setItem("status", "under_review")
            router.push("/retailer/status")
        } catch (error) {
            console.error(error)
            alert("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar Branding */}
            <div className="hidden lg:flex w-1/3 bg-[#1B2D1F] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#458BCC]/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <img src="/waterlogo.png" alt="Logo" className="w-10 h-10" />
                        <span className="text-2xl font-bold text-white">Difwa</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Complete your <br />
                        <span className="text-[#0096FF]">business profile</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Provide your business details to start selling fresh water on our platform.
                        This information helps us verify and set up your store.
                    </p>
                </div>

                <div className="relative z-10 space-y-8">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                idx <= currentStep ? "bg-[#458BCC] text-white" : "bg-white/10 text-white/40"
                            )}>
                                {idx < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                            </div>
                            <div>
                                <p className={cn(
                                    "font-bold text-sm",
                                    idx === currentStep ? "text-white" : "text-white/40"
                                )}>{step.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 flex flex-col p-8 lg:p-20 overflow-y-auto">
                <div className="max-w-2xl w-full mx-auto">
                    <div className="mb-12 lg:hidden">
                        <p className="text-[#458BCC] font-bold text-sm uppercase tracking-widest mb-2">Step {currentStep + 1} of 4</p>
                        <h2 className="text-3xl font-bold text-[#1A1A1A]">{steps[currentStep].title}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {currentStep === 0 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Owner Full Name *</label>
                                    <input
                                        required
                                        value={formData.ownerName}
                                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        placeholder="Full legal name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Alternate Contact Number</label>
                                        <input
                                            value={formData.alternateContact}
                                            onChange={e => setFormData({ ...formData, alternateContact: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="Emergency contact"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">WhatsApp Number (optional)</label>
                                        <input
                                            value={formData.whatsappNumber}
                                            onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="WhatsApp number"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Store Name *</label>
                                        <input
                                            required
                                            value={formData.businessName}
                                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="Gourmet Water"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Store Display Name (optional)</label>
                                        <input
                                            value={formData.storeDisplayName}
                                            onChange={e => setFormData({ ...formData, storeDisplayName: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="Public shop name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Store Address *</label>
                                    <input
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        placeholder="Full shop address"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">City *</label>
                                        <input
                                            required
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">State *</label>
                                        <input
                                            required
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Pincode *</label>
                                        <input
                                            required
                                            value={formData.pincode}
                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Landmark (optional)</label>
                                        <input
                                            value={formData.landmark}
                                            onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="Near SBI Bank etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Store Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Seafood Retail Store", "Frozen Products Store", "Supermarket", "Kirana Store", "Distributor"].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, businessType: type })}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl border font-bold text-sm transition-all text-left",
                                                    formData.businessType === type
                                                        ? "bg-[#1B2D1F] border-[#1B2D1F] text-white shadow-lg"
                                                        : "bg-white border-[#E9ECEF] text-[#495057] hover:border-[#458BCC]"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Years in Business</label>
                                        <input
                                            value={formData.yearsInBusiness}
                                            onChange={e => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                            placeholder="e.g. 5+ years"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Do you have cold storage? (Yes/No)</label>
                                        <div className="relative">
                                            <select
                                                value={formData.coldStorage}
                                                onChange={e => setFormData({ ...formData, coldStorage: e.target.value })}
                                                className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] appearance-none focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all bg-white font-bold"
                                            >
                                                <option>No</option>
                                                <option>Yes</option>
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#495057]" size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Estimated Monthly Purchase Volume (optional)</label>
                                    <input
                                        value={formData.monthlyPurchaseVolume}
                                        onChange={e => setFormData({ ...formData, monthlyPurchaseVolume: e.target.value })}
                                        className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        placeholder="e.g. 500LTR"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">GST Number</label>
                                        <input
                                            value={formData.gst}
                                            onChange={e => setFormData({ ...formData, gst: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all uppercase"
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">FSSAI License Number</label>
                                        <input
                                            value={formData.fssai}
                                            onChange={e => setFormData({ ...formData, fssai: e.target.value })}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload Business License</label>
                                        <input
                                            type="file"
                                            ref={licenseInputRef}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={(e) => handleFileChange(e, "licenseUrl")}
                                        />
                                        <div
                                            onClick={() => licenseInputRef.current?.click()}
                                            className={cn(
                                                "border border-dashed rounded-xl p-6 transition-all cursor-pointer group mt-2 flex flex-col items-center justify-center min-h-[120px]",
                                                formData.licenseUrl ? "bg-blue-50 border-blue-200" : "border-[#DEE2E6] hover:bg-[#F8F9FA]"
                                            )}
                                        >
                                            {uploading["licenseUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B00]"></div>
                                            ) : formData.licenseUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Uploaded</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FF6B00] transition-colors" size={20} />
                                                    <p className="text-xs text-[#868E96] mt-1 font-bold">PDF, Image</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload GST Certificate</label>
                                        <input
                                            type="file"
                                            ref={gstInputRef}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={(e) => handleFileChange(e, "gstCertificateUrl")}
                                        />
                                        <div
                                            onClick={() => gstInputRef.current?.click()}
                                            className={cn(
                                                "border border-dashed rounded-xl p-6 transition-all cursor-pointer group mt-2 flex flex-col items-center justify-center min-h-[120px]",
                                                formData.gstCertificateUrl ? "bg-blue-50 border-blue-200" : "border-[#DEE2E6] hover:bg-[#F8F9FA]"
                                            )}
                                        >
                                            {uploading["gstCertificateUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B00]"></div>
                                            ) : formData.gstCertificateUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Uploaded</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FF6B00] transition-colors" size={20} />
                                                    <p className="text-xs text-[#868E96] mt-1 font-bold">PDF, Image</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-start gap-4 p-6 rounded-2xl border border-[#DEE2E6] hover:border-[#FF6B00] cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreed}
                                        onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                                        className="w-6 h-6 rounded border-[#DEE2E6] accent-[#FF6B00] mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-[#1A1A1A]">I agree to Difwa Partner Terms & Supply Policies</p>
                                        <p className="text-sm text-[#868E96]">I certify that all information provided is accurate.</p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="pt-10 flex items-center justify-between border-t border-[#E9ECEF]">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                    currentStep === 0 ? "opacity-0 pointer-events-none" : "text-[#495057] hover:bg-[#F1F3F5]"
                                )}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] hover:shadow-xl transition-all"
                                >
                                    Next Step
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!formData.agreed || loading}
                                    className={cn(
                                        "flex items-center gap-2 px-10 py-3.5 rounded-xl bg-[#458BCC] text-white font-bold shadow-lg shadow-[#458BCC]/20 hover:scale-[1.02] active:scale-[0.98] transition-all",
                                        (!formData.agreed || loading) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? "Submitting..." : "Submit Application"}
                                    {!loading && <CheckCircle2 size={18} />}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
