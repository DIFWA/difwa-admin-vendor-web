"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Clock, HelpCircle, X, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface SupportRequest {
    _id: string;
    user?: {
        fullName?: string;
        email?: string;
        phoneNumber?: string;
    };
    type: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function SupportRequestsPage() {
    const [requests, setRequests] = useState<SupportRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    // Settings state
    const [emails, setEmails] = useState<string[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [savingEmails, setSavingEmails] = useState(false)
    const [showSettings, setShowSettings] = useState(false)

    useEffect(() => {
        fetchData()
        fetchEmails()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/requests`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setRequests(data.data)
            }
        } catch (error) {
            toast.error("Failed to fetch support requests")
        } finally {
            setLoading(false)
        }
    }

    const fetchEmails = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/emails`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setEmails(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch support emails")
        }
    }

    const saveEmails = async (updatedEmails: string[]) => {
        try {
            setSavingEmails(true)
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/emails`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ emails: updatedEmails })
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Support emails updated successfully")
                setEmails(data.data)
                setNewEmail("")
            } else {
                toast.error(data.message || "Failed to update emails")
            }
        } catch (error) {
            toast.error("Failed to save emails")
        } finally {
            setSavingEmails(false)
        }
    }

    const handleAddEmail = () => {
        if (!newEmail.trim() || !newEmail.includes("@")) {
            toast.error("Please enter a valid email address")
            return
        }
        if (emails.includes(newEmail.trim())) {
            toast.error("Email already exists")
            return
        }
        const updated = [...emails, newEmail.trim()]
        saveEmails(updated)
    }

    const handleRemoveEmail = (emailToRemove: string) => {
        if (emails.length <= 1) {
            toast.error("You must have at least one support email")
            return
        }
        const updated = emails.filter(e => e !== emailToRemove)
        saveEmails(updated)
    }

    const filteredRequests = requests.filter(req =>
        req.subject.toLowerCase().includes(search.toLowerCase()) ||
        req.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        req.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        req.user?.phoneNumber?.includes(search)
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Help Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and view user support tickets</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
                        title="Add support mails"
                    >
                        <Mail size={18} />
                        <span>Support Mails</span>
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Email Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800">Support Notification Emails</h3>
                                    <p className="text-xs text-gray-500">Emails listed here will receive a notification when a new help request is submitted.</p>
                                </div>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                    {emails.map((email, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">{email}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                disabled={savingEmails}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex-1">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Email</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                placeholder="admin@example.com"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                                            />
                                            <button
                                                onClick={handleAddEmail}
                                                disabled={savingEmails}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Requests List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 h-48 animate-pulse border border-gray-100">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpCircle className="text-blue-500" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">No requests found</h3>
                    <p className="text-gray-500 mt-1">There are no help requests matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredRequests.map((req) => (
                        <div key={req._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

                            <div className="flex justify-between items-start mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {req.type}
                                </span>
                                <div className="flex items-center text-xs text-gray-400 font-medium">
                                    <Clock size={12} className="mr-1" />
                                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1" title={req.subject}>
                                {req.subject}
                            </h3>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16">
                                {req.message}
                            </p>

                            <div className="pt-4 border-t border-gray-100 mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">
                                        {req.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-gray-800 truncate">{req.user?.fullName || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{req.user?.email || req.user?.phoneNumber || 'No contact info'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
