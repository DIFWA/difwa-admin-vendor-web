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
    ChevronDown,
    MapPin as MapPinIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import fileService from "@/data/services/fileService"
import authService from "@/data/services/authService"
import useAuthStore from "@/data/store/useAuthStore"
import { toast } from "sonner"

const steps = [
    { id: "owner", title: "Owner Details", icon: CheckCircle2 },
    { id: "store", title: "Store Details", icon: Building2 },
    { id: "business", title: "Business Info", icon: FileText },
    { id: "legal", title: "Legal Details", icon: MapPin }
]

const statesAndCities: { [key: string]: string[] } = {
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Ghaziabad", "Prayagraj", "Noida", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "South West Delhi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Vijayapura", "Shivamogga"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Ambattur", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda"]
}

// Helpers
const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const restrictToDigits = (str: string) => str.replace(/\D/g, "");

const validateGST = (gst: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
};

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
        lat: null as number | null,
        lng: null as number | null,
        // Business Info
        yearsInBusiness: "",
        monthlyPurchaseVolume: "",
        // Legal Details
        gst: "",
        fssai: "",
        licenseUrl: "",
        gstCertificateUrl: "",
        agreed: false
    })

    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        const id = localStorage.getItem("userId")
        if (!id) {
            router.push("/register")
            return
        }
        setUserId(id)
    }, [router])

    const validateStep = () => {
        const newErrors: { [key: string]: string } = {}

        if (currentStep === 0) {
            if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required"
            if (!formData.whatsappNumber) newErrors.whatsappNumber = "WhatsApp number is required"
            else if (formData.whatsappNumber.length !== 10) newErrors.whatsappNumber = "Must be exactly 10 digits"
            if (formData.alternateContact && formData.alternateContact.length !== 10) newErrors.alternateContact = "Must be exactly 10 digits"
        }

        if (currentStep === 1) {
            if (!formData.businessName.trim()) newErrors.businessName = "Store name is required"
            if (!formData.address.trim()) newErrors.address = "Address is required"
            if (!formData.state) newErrors.state = "State is required"
            if (!formData.city) newErrors.city = "City is required"
            if (!formData.pincode) newErrors.pincode = "Pincode is required"
            else if (formData.pincode.length !== 6) newErrors.pincode = "Must be exactly 6 digits"
            if (!formData.lat || !formData.lng) newErrors.location = "Please capture your store location"
        }

        if (currentStep === 3) {
            if (formData.gst && !validateGST(formData.gst)) newErrors.gst = "Invalid GST format (Standard 15-digit GSTIN)"
            if (!formData.fssai) newErrors.fssai = "FSSAI number is required"
            else if (formData.fssai.length !== 14) newErrors.fssai = "Must be exactly 14 digits"
            if (!formData.licenseUrl) newErrors.licenseUrl = "Business license upload is required"
            if (formData.gst && !formData.gstCertificateUrl) newErrors.gstCertificateUrl = "GST certificate is required since GST is provided"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep()) {
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1)
            }
        } else {
            toast.error("Please fix the errors before proceeding")
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        let formattedValue = value

        // Specific Formatting
        if (["ownerName", "businessName", "storeDisplayName"].includes(field)) {
            formattedValue = toTitleCase(value)
        } else if (["alternateContact", "whatsappNumber", "pincode", "fssai"].includes(field)) {
            formattedValue = restrictToDigits(value)
            // Length restrictions
            if (["alternateContact", "whatsappNumber"].includes(field)) formattedValue = formattedValue.slice(0, 10)
            if (field === "pincode") formattedValue = formattedValue.slice(0, 6)
            if (field === "fssai") formattedValue = formattedValue.slice(0, 14)
        } else if (field === "gst") {
            formattedValue = value.toUpperCase().slice(0, 15)
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }))
        if (errors[field]) setErrors(prev => {
            const newErrs = { ...prev }
            delete newErrs[field]
            return newErrs
        })
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "licenseUrl" | "gstCertificateUrl") => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(prev => ({ ...prev, [field]: true }))

        try {
            const data = await fileService.upload(file)
            setFormData(prev => ({ ...prev, [field]: data.url }))
            toast.success("File uploaded successfully")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Upload failed. Please try again.")
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }))
        }
    }

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }
        
        toast.info("Fetching your location...")
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }))
                toast.success("Location captured successfully!")
                if (errors.location) {
                    setErrors(prev => {
                        const newErrs = { ...prev }
                        delete newErrs.location
                        return newErrs
                    })
                }
            },
            (error) => {
                console.error("Error getting location:", error)
                toast.error("Failed to get location. Please allow location access.")
            }
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep()) return
        setLoading(true)

        try {
            await authService.updateOnboarding({
                userId,
                alternateContact: formData.alternateContact,
                whatsappNumber: formData.whatsappNumber,
                businessDetails: {
                    businessName: formData.businessName,
                    storeDisplayName: formData.storeDisplayName || formData.businessName,
                    ownerName: formData.ownerName,
                    yearsInBusiness: formData.yearsInBusiness,
                    monthlyPurchaseVolume: formData.monthlyPurchaseVolume,
                    location: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        landmark: formData.landmark,
                        coordinates: formData.lat && formData.lng ? {
                            lat: formData.lat,
                            lng: formData.lng
                        } : undefined
                    },
                    legal: {
                        gst: formData.gst,
                        fssai: formData.fssai,
                        licenseUrl: formData.licenseUrl,
                        gstCertificateUrl: formData.gstCertificateUrl
                    }
                }
            })

            // Update local state and redirect
            const user = useAuthStore.getState().user;
            if (user) {
                useAuthStore.getState().setUser({
                    ...user,
                    status: "under_review",
                    businessDetails: {
                        ...user.businessDetails,
                        businessName: formData.businessName,
                        location: {
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            pincode: formData.pincode,
                            landmark: formData.landmark,
                            coordinates: formData.lat && formData.lng ? {
                                lat: formData.lat,
                                lng: formData.lng
                            } : undefined
                        }
                    }
                })
            }

            localStorage.setItem("status", "under_review")
            window.location.href = "/retailer/status"
        } catch (error: any) {
            toast.error(error.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar Branding */}
            <div className="hidden lg:flex w-1/3 bg-[#1E90FF] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AFCF]/30 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1E90FF] blur-[120px] rounded-full -ml-40 -mb-40" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <img src="/waterlogo.png" alt="Logo" className="w-10 h-10" />
                        <span className="text-2xl font-bold text-white">Difwa</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Complete your <br />
                        <span className="text-[#FAA67E]">business profile</span>
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Provide your business details to start selling fresh water on our platform.
                        This information helps us verify and set up your store.
                    </p>
                </div>

                <div className="relative z-10 space-y-8">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                idx <= currentStep ? "bg-white text-[#155DFC] shadow-lg shadow-[#155DFC]/20" : "bg-white/10 text-white/40"
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
                        <p className="text-[#00AFCF] font-bold text-sm uppercase tracking-widest mb-2">Step {currentStep + 1} of 4</p>
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
                                        onChange={e => handleInputChange("ownerName", e.target.value)}
                                        className={cn(
                                            "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                            errors.ownerName ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                        )}
                                        placeholder="Full legal name"
                                    />
                                    {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Alternate Contact Number</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                                            <input
                                                value={formData.alternateContact}
                                                onChange={e => handleInputChange("alternateContact", e.target.value)}
                                                className={cn(
                                                    "w-full pl-12 pr-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                    errors.alternateContact ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                                )}
                                                placeholder="Emergency contact"
                                            />
                                        </div>
                                        {errors.alternateContact && <p className="text-red-500 text-xs mt-1">{errors.alternateContact}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">WhatsApp Number *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                                            <input
                                                required
                                                value={formData.whatsappNumber}
                                                onChange={e => handleInputChange("whatsappNumber", e.target.value)}
                                                className={cn(
                                                    "w-full pl-12 pr-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                    errors.whatsappNumber ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                                )}
                                                placeholder="WhatsApp number"
                                            />
                                        </div>
                                        {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber}</p>}
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
                                            onChange={e => handleInputChange("businessName", e.target.value)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                errors.businessName ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                            )}
                                            placeholder="Gourmet Water"
                                        />
                                        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Store Display Name (optional)</label>
                                        <input
                                            value={formData.storeDisplayName}
                                            onChange={e => handleInputChange("storeDisplayName", e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all"
                                            placeholder="Public shop name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Store Address *</label>
                                    <input
                                        required
                                        value={formData.address}
                                        onChange={e => handleInputChange("address", e.target.value)}
                                        className={cn(
                                            "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                            errors.address ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                        )}
                                        placeholder="Full shop address"
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">Store Location (GPS) *</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-all border border-blue-200"
                                        >
                                            <MapPinIcon size={18} />
                                            {formData.lat && formData.lng ? "Location Captured ✓" : "Get Current Location"}
                                        </button>
                                        {formData.lat && formData.lng && (
                                            <span className="text-xs text-gray-500">
                                                {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">State *</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={formData.state}
                                                onChange={e => {
                                                    handleInputChange("state", e.target.value);
                                                    handleInputChange("city", ""); // Reset city
                                                }}
                                                className={cn(
                                                    "w-full pl-5 pr-10 py-4 rounded-xl border appearance-none focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                    errors.state ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF] bg-white"
                                                )}
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(statesAndCities).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#00AFCF] transition-colors" size={20} />
                                        </div>
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">City *</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                disabled={!formData.state}
                                                value={formData.city}
                                                onChange={e => handleInputChange("city", e.target.value)}
                                                className={cn(
                                                    "w-full pl-5 pr-10 py-4 rounded-xl border appearance-none focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all disabled:opacity-50 disabled:bg-gray-100",
                                                    errors.city ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF] bg-white"
                                                )}
                                            >
                                                <option value="">Select City</option>
                                                {formData.state && statesAndCities[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#00AFCF] transition-colors" size={20} />
                                        </div>
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Pincode *</label>
                                        <input
                                            required
                                            value={formData.pincode}
                                            onChange={e => handleInputChange("pincode", e.target.value)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                errors.pincode ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                            )}
                                        />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Landmark (optional)</label>
                                        <input
                                            value={formData.landmark}
                                            onChange={e => handleInputChange("landmark", e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all"
                                            placeholder="Near SBI Bank etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Years in Business (opt)</label>
                                        <input
                                            value={formData.yearsInBusiness}
                                            onChange={e => handleInputChange("yearsInBusiness", e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all"
                                            placeholder="e.g. 5+ years"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Estimated Monthly Purchase Volume (opt)</label>
                                        <input
                                            value={formData.monthlyPurchaseVolume}
                                            onChange={e => handleInputChange("monthlyPurchaseVolume", e.target.value)}
                                            className="w-full px-5 py-4 rounded-xl border border-[#E9ECEF] focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all"
                                            placeholder="e.g. 500LTR"
                                        />
                                    </div>
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
                                            onChange={e => handleInputChange("gst", e.target.value)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all uppercase",
                                                errors.gst ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                            )}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                        {errors.gst && <p className="text-red-500 text-xs mt-1">{errors.gst}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">FSSAI License Number *</label>
                                        <input
                                            required
                                            value={formData.fssai}
                                            onChange={e => handleInputChange("fssai", e.target.value)}
                                            className={cn(
                                                "w-full px-5 py-4 rounded-xl border focus:ring-2 focus:ring-[#00AFCF]/15 focus:border-[#00AFCF] outline-none transition-all",
                                                errors.fssai ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-[#E9ECEF]"
                                            )}
                                        />
                                        {errors.fssai && <p className="text-red-500 text-xs mt-1">{errors.fssai}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload Business License *</label>
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
                                                formData.licenseUrl ? "bg-blue-50 border-blue-200" :
                                                errors.licenseUrl ? "bg-red-50 border-red-300" : "border-[#DEE2E6] hover:bg-[#F8F9FA]"
                                            )}
                                        >
                                            {uploading["licenseUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00AFCF]"></div>
                                            ) : formData.licenseUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Uploaded</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FAA67E] transition-colors" size={20} />
                                                    <p className="text-xs text-[#868E96] mt-1 font-bold">PDF, Image</p>
                                                </>
                                            )}
                                        </div>
                                        {errors.licenseUrl && <p className="text-red-500 text-xs mt-1">{errors.licenseUrl}</p>}
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload GST Certificate {formData.gst ? "*" : "(opt)"}</label>
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
                                                formData.gstCertificateUrl ? "bg-blue-50 border-blue-200" :
                                                errors.gstCertificateUrl ? "bg-red-50 border-red-300" : "border-[#DEE2E6] hover:bg-[#F8F9FA]"
                                            )}
                                        >
                                            {uploading["gstCertificateUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00AFCF]"></div>
                                            ) : formData.gstCertificateUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-blue-500 mb-1" size={20} />
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase">Uploaded</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FAA67E] transition-colors" size={20} />
                                                    <p className="text-xs text-[#868E96] mt-1 font-bold">PDF, Image</p>
                                                </>
                                            )}
                                        </div>
                                        {errors.gstCertificateUrl && <p className="text-red-500 text-xs mt-1">{errors.gstCertificateUrl}</p>}
                                    </div>
                                </div>

                                <label className="flex items-start gap-4 p-6 rounded-2xl border border-[#DEE2E6] hover:border-[#00AFCF] cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreed}
                                        onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                                        className="w-6 h-6 rounded border-[#DEE2E6] accent-[#00AFCF] mt-0.5"
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
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#155DFC] text-white font-bold hover:bg-[#2B7FFF] hover:shadow-xl hover:shadow-[#155DFC]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Next Step
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!formData.agreed || loading}
                                    className={cn(
                                        "flex items-center gap-2 px-10 py-3.5 rounded-xl bg-[#FAA67E] text-slate-900 font-bold shadow-lg shadow-[#FAA67E]/30 hover:bg-[#ffbea3] hover:scale-[1.02] active:scale-[0.98] transition-all",
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
