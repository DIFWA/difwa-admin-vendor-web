"use client"

import { useState, useEffect } from "react"
import { 
    Banknote, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    ShieldCheck, 
    Building2, 
    User, 
    CreditCard, 
    Navigation,
    Loader2,
    X,
    ChevronLeft,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import useRetailerStore from "@/data/store/useRetailerStore"
import Link from "next/link"

export default function BankDetailsPage() {
    const [mounted, setMounted] = useState(false)
    const { 
        bankAccounts, 
        loadingBanks, 
        fetchBanks, 
        addBank, 
        deleteBank, 
        setDefaultBank 
    } = useRetailerStore()

    const [showAddModal, setShowAddModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    
    const [formData, setFormData] = useState({
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        accountType: "Savings",
        isDefault: false
    })

    const [errors, setErrors] = useState<any>({})

    useEffect(() => {
        setMounted(true)
        fetchBanks()
    }, [fetchBanks])

    const validateForm = () => {
        const newErrors: any = {}
        
        // IFSC Code Validation (Standard Indian Format: 4 letters, 0, 6 characters)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
        if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
            newErrors.ifscCode = "Invalid IFSC format (e.g., SBIN0012345)"
        }

        // Account Number Validation (Standard 9-18 digits)
        const accRegex = /^\d{9,18}$/
        if (!accRegex.test(formData.accountNumber)) {
            newErrors.accountNumber = "Account number must be 9-18 digits"
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            newErrors.confirmAccountNumber = "Account numbers do not match"
        }

        if (!formData.bankName) newErrors.bankName = "Bank name is required"
        if (!formData.accountHolderName) newErrors.accountHolderName = "Holder name is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const res = await addBank({
                ...formData,
                ifscCode: formData.ifscCode.toUpperCase()
            })
            if (res.success) {
                toast.success("Bank account added successfully")
                setShowAddModal(false)
                setFormData({
                    bankName: "",
                    accountHolderName: "",
                    accountNumber: "",
                    confirmAccountNumber: "",
                    ifscCode: "",
                    accountType: "Savings",
                    isDefault: false
                })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add bank account")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteBank = async (id: string) => {
        if (!confirm("Are you sure you want to remove this bank account?")) return

        try {
            const res = await deleteBank(id)
            if (res.success) {
                toast.success("Account removed")
            }
        } catch (error) {
            toast.error("Failed to remove account")
        }
    }

    const maskAccountNumber = (acc: string) => {
        return `•••• •••• •••• ${acc.slice(-4)}`
    }

    if (!mounted) return null

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/retailer/revenue" className="p-2.5 rounded-xl bg-white border border-border-custom hover:border-primary/30 transition-all text-text-muted hover:text-primary shadow-sm">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Settlement Accounts</h1>
                        <p className="text-text-muted mt-1 font-medium">Manage where you receive your payouts.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Add New Bank
                </button>
            </div>

            {/* Account List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loadingBanks ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-background-soft rounded-[32px] animate-pulse border-2 border-dashed border-border-custom" />
                    ))
                ) : bankAccounts.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border border-border-custom flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-background-soft flex items-center justify-center text-text-muted mb-4 opacity-30">
                            <Building2 size={40} />
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase">No Bank Accounts Linked</h3>
                        <p className="text-text-muted font-medium mt-1 max-w-sm">Please add a settlement account to start requesting payouts of your earnings.</p>
                    </div>
                ) : (
                    bankAccounts.map((bank: any) => (
                        <div 
                            key={bank._id}
                            className={cn(
                                "group relative bg-white rounded-[32px] p-8 border-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden",
                                bank.isDefault ? "border-primary" : "border-border-custom hover:border-primary/30"
                            )}
                        >
                            {/* Card Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                            
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {bank.isDefault && (
                                        <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                            Default
                                        </span>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteBank(bank._id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Bank Name</p>
                                    <h4 className="text-lg font-black text-primary uppercase truncate">{bank.bankName}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">IFSC Code</p>
                                        <p className="font-mono font-bold text-primary">{bank.ifscCode}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Type</p>
                                        <p className="font-bold text-primary">{bank.accountType}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Account Number</p>
                                    <p className="text-xl font-black text-primary tracking-widest">{maskAccountNumber(bank.accountNumber)}</p>
                                </div>
                            </div>

                            {/* Set Default Action */}
                            {!bank.isDefault && (
                                <button 
                                    onClick={() => setDefaultBank(bank._id)}
                                    className="mt-8 w-full py-3 border-2 border-primary/20 rounded-2xl text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                                >
                                    Set as Default
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Security Note */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h5 className="font-black text-blue-900 uppercase text-xs tracking-wider">Secure Settlement System</h5>
                    <p className="text-blue-800/70 text-sm mt-1 leading-relaxed">
                        Your bank details are only used for processing payouts. We mask account numbers and use verified IFSC patterns to ensure your data stays correct and protected.
                    </p>
                </div>
            </div>

            {/* Add Bank Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <form 
                        onSubmit={handleAddBank}
                        className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Add Bank Account</h2>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Enter your correct settlement details</p>
                            </div>
                            <button type="button" onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors group">
                                <X size={24} className="text-text-muted group-hover:text-primary" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <Building2 size={12} /> Bank Name
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. HDFC Bank"
                                    value={formData.bankName}
                                    onChange={e => setFormData({...formData, bankName: e.target.value})}
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent outline-none transition-all font-bold text-primary",
                                        errors.bankName ? "border-red-500" : "focus:border-primary/20"
                                    )}
                                />
                                {errors.bankName && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.bankName}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <User size={12} /> Account Holder Name
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Name as per bank record"
                                    value={formData.accountHolderName}
                                    onChange={e => setFormData({...formData, accountHolderName: e.target.value})}
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent outline-none transition-all font-bold text-primary uppercase",
                                        errors.accountHolderName ? "border-red-500" : "focus:border-primary/20"
                                    )}
                                />
                                {errors.accountHolderName && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.accountHolderName}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <Navigation size={12} /> IFSC Code
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. HDFC0001234"
                                    value={formData.ifscCode}
                                    onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent outline-none transition-all font-bold text-primary uppercase",
                                        errors.ifscCode ? "border-red-500" : "focus:border-primary/20"
                                    )}
                                />
                                {errors.ifscCode && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.ifscCode}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <CreditCard size={12} /> Account Type
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-background-soft p-1 rounded-2xl border-2 border-transparent">
                                    {["Savings", "Current"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({...formData, accountType: type})}
                                            className={cn(
                                                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                formData.accountType === type ? "bg-white text-primary shadow-sm shadow-primary/5" : "text-text-muted hover:text-primary"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <Banknote size={12} /> Account Number
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Account Number (9-18 digits)"
                                    value={formData.accountNumber}
                                    onChange={e => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})}
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent outline-none transition-all font-bold text-primary",
                                        errors.accountNumber ? "border-red-500" : "focus:border-primary/20"
                                    )}
                                />
                                {errors.accountNumber && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.accountNumber}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <CheckCircle2 size={12} /> Confirm Account Number
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Re-enter Account Number"
                                    value={formData.confirmAccountNumber}
                                    onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '')})}
                                    className={cn(
                                        "w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent outline-none transition-all font-bold text-primary",
                                        errors.confirmAccountNumber ? "border-red-500" : "focus:border-primary/20"
                                    )}
                                />
                                {errors.confirmAccountNumber && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.confirmAccountNumber}</p>}
                            </div>

                            <div className="col-span-full">
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div 
                                        onClick={() => setFormData({...formData, isDefault: !formData.isDefault})}
                                        className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            formData.isDefault ? "bg-primary border-primary text-white" : "border-border-custom bg-white group-hover:border-primary/30"
                                        )}
                                    >
                                        {formData.isDefault && <CheckCircle2 size={16} />}
                                    </div>
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest group-hover:text-primary transition-colors">Set as Primary Settlement Account</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-8 pt-0">
                            <button
                                disabled={submitting}
                                className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Saving Account...
                                    </>
                                ) : "Verify & Add Account"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
