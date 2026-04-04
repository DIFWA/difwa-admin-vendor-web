"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { BellRing, Mail, Send, Users, ShieldAlert, CheckCircle2, Layout, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import "react-quill-new/dist/quill.snow.css"

// Lazy Load Quill for Next.js SSR Compatibility
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 bg-background-soft animate-pulse rounded-3xl border-2 border-dashed border-border-custom flex items-center justify-center text-text-muted font-bold">Initializing Rich Editor...</div>
})

const editorModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "clean"],
    ],
}

const editorFormats = [
    "header",
    "bold", "italic", "underline", "strike",
    "list",
    "color", "background",
    "link",
]

export default function CommunicationHubPage() {
    const [activeTab, setActiveTab] = useState<'fcm' | 'email'>('fcm')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [audienceCount, setAudienceCount] = useState<number>(0)

    // FCM State
    const [fcmData, setFcmData] = useState({
        title: "",
        body: "",
        targetType: "all"
    })

    // Email State
    const [emailData, setEmailData] = useState({
        subject: "",
        content: ""
    })

    const fetchAudienceStats = async () => {
        try {
            const res = await adminService.getRetailers("approved", 1, 1)
            setAudienceCount(res.pagination.totalRetailers)
        } catch (err) {
            console.error("Failed to fetch audience stats", err)
        }
    }

    useEffect(() => {
        fetchAudienceStats()
    }, [])

    const handleSendFcm = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        setError(null)
        try {
            await adminService.sendBulkNotification(fcmData.title, fcmData.body, fcmData.targetType)
            setSuccess("Push notifications broadcasted successfully!")
            setFcmData({ title: "", body: "", targetType: "all" })
            setTimeout(() => setSuccess(null), 5000)
        } catch (error: any) {
            console.error("FCM broadcast failed:", error)
            setError(error.response?.data?.message || "Failed to send push notifications")
            setTimeout(() => setError(null), 5000)
        } finally {
            setSending(false)
        }
    }

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        setError(null)
        try {
            const res = await adminService.sendBulkEmail(emailData.subject, emailData.content)
            setSuccess(res.message || "Email campaign launched successfully!")
            setEmailData({ subject: "", content: "" })
            setTimeout(() => setSuccess(null), 5000)
        } catch (error: any) {
            console.error("Email broadcast failed:", error)
            setError(error.response?.data?.message || "Failed to launch email campaign")
            setTimeout(() => setError(null), 5000)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Custom Quill Styles */}
            <style jsx global>{`
                .quill {
                    border-radius: 24px;
                    overflow: hidden;
                    background: #f8fafc;
                    border: 2px solid transparent !important;
                    transition: all 0.3s ease;
                }
                .quill:focus-within {
                    border-color: rgba(37, 99, 235, 0.1) !important;
                    background: white;
                }
                .ql-toolbar.ql-snow {
                    border: none !important;
                    background: rgba(241, 245, 249, 1);
                    padding: 12px 20px !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                }
                .ql-container.ql-snow {
                    border: none !important;
                    min-height: 350px;
                    font-size: 14px;
                }
                .ql-editor {
                    padding: 24px !important;
                    line-height: 1.6;
                }
                .ql-editor.ql-blank::before {
                    left: 24px !important;
                    opacity: 0.5;
                    font-style: normal;
                }
            `}</style>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-blue-600">Communication Hub</h1>
                <p className="text-text-muted mt-1">Broadcast high-impact updates and notifications to your entire user base.</p>
            </div>

            {/* Selection Tabs */}
            <div className="flex p-1.5 bg-background-soft rounded-[24px] w-full max-w-md border border-border-custom shadow-inner">
                <button
                    onClick={() => setActiveTab('fcm')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'fcm' ? "bg-white text-blue-600 shadow-lg" : "text-text-muted hover:text-blue-600"
                    )}
                >
                    <Smartphone size={18} /> Push (FCM)
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'email' ? "bg-white text-blue-600 shadow-lg" : "text-text-muted hover:text-blue-600"
                    )}
                >
                    <Mail size={18} /> Email Marketing
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-xl p-8 md:p-12 relative overflow-hidden">
                        {/* Status Message */}
                        {success && (
                            <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white py-3 px-8 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-10 transition-all">
                                <CheckCircle2 size={20} />
                                <p className="font-black text-xs uppercase tracking-widest">{success}</p>
                            </div>
                        )}

                        {error && (
                            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white py-3 px-8 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-10 transition-all">
                                <ShieldAlert size={20} />
                                <p className="font-black text-xs uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        {activeTab === 'fcm' ? (
                            <form onSubmit={handleSendFcm} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                                            <BellRing size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-blue-600 uppercase tracking-tight">Push Broadcast</h2>
                                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Real-time smartphone alerts</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g., Water Supply Update: Scheduled Maintenance"
                                                value={fcmData.title}
                                                onChange={e => setFcmData({ ...fcmData, title: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-blue-600/20 outline-none transition-all font-bold shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Audience</label>
                                            <select
                                                value={fcmData.targetType}
                                                onChange={e => setFcmData({ ...fcmData, targetType: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-blue-600/20 outline-none transition-all font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMzcsIDk5LCAyMzUsIDAuNSkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNiA5bDYgNiA2LTYiLz48L3N2Zz4=')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat shadow-sm"
                                            >
                                                <option value="all">All App Users</option>
                                                <option value="retailer">Water Retailers Only</option>
                                                <option value="rider">Delivery Riders Only</option>
                                                <option value="customer">Subscribed Customers Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Message Body</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Write your alert message here..."
                                            value={fcmData.body}
                                            onChange={e => setFcmData({ ...fcmData, body: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-blue-600/20 outline-none transition-all font-medium resize-none shadow-inner"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={sending}
                                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {sending ? "Broadcasting..." : <><Send size={20} /> Dispatch Push Notification</>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSendEmail} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-blue-600 uppercase tracking-tight">Email Campaign</h2>
                                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Professional WYSIWYG Editor</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Subject Line</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Weekly Operations: Improving Your Water Distribution"
                                            value={emailData.subject}
                                            onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-blue-600/20 outline-none transition-all font-bold shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="ml-1 text-[10px] font-black text-text-muted uppercase tracking-widest">Newsletter Content</label>
                                        <ReactQuill
                                            theme="snow"
                                            value={emailData.content}
                                            onChange={(val) => setEmailData({ ...emailData, content: val })}
                                            modules={editorModules}
                                            formats={editorFormats}
                                            placeholder="Craft your beautiful water distribution update here..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                        <ShieldAlert size={18} className="text-blue-600 shrink-0" />
                                        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest leading-relaxed">
                                            Emails will be sent as a marketing campaign (BCC) to all currently **Approved** Water Retailers.
                                        </p>
                                    </div>
                                    <button
                                        disabled={sending}
                                        className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {sending ? "Processing Dispatch..." : <><Mail size={20} /> Launch Email Campaign</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-8">
                    {/* Device Preview */}
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-lg overflow-hidden flex flex-col items-center p-8">
                        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6">Device Preview</h3>
                        <div className="w-[280px] h-[580px] border-[8px] border-zinc-900 rounded-[48px] bg-background-soft relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />
                            <div className="p-4 mt-12 overflow-y-auto max-h-[500px] scrollbar-hide">
                                {activeTab === 'fcm' && fcmData.title && (
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/20 animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center">
                                                <img src="/loginlogo.png" className="w-3 h-3 invert opacity-50" />
                                            </div>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight font-black uppercase tracking-tight">Difwa Water</span>
                                            <span className="text-[10px] text-text-muted ml-auto">Now</span>
                                        </div>
                                        <p className="text-xs font-bold text-blue-600 truncate">{fcmData.title}</p>
                                        <p className="text-[10px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">{fcmData.body || "Notification content preview will appear here..."}</p>
                                    </div>
                                )}

                                {activeTab === 'email' && emailData.subject && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500 overflow-hidden">
                                        <div className="p-2 border-b flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                        </div>
                                        <div className="p-3 border-b bg-gray-50 text-[10px] font-bold text-gray-500 truncate">
                                            Subject: {emailData.subject}
                                        </div>
                                        <div className="p-4 bg-white min-h-[300px]">
                                            <div 
                                                className="scale-[0.3] origin-top-left w-[800px]" 
                                                dangerouslySetInnerHTML={{ __html: emailData.content }} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {!fcmData.title && !emailData.subject && (
                                    <div className="h-full mt-20 flex flex-col items-center justify-center opacity-30">
                                        <Layout size={40} className="text-text-muted mb-4" />
                                        <p className="text-xs font-bold text-text-muted text-center uppercase tracking-widest">Awaiting Content...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-[#0B2447] rounded-[40px] p-8 text-white shadow-xl shadow-blue-900/20">
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2 text-blue-300">
                             Audience Overview
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-sm font-bold">Approved Retailers</span>
                                </div>
                                <span className="font-black text-xl">{audienceCount}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl text-blue-300">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <span className="text-sm font-bold">Active Segment</span>
                                </div>
                                <span className="font-black text-blue-300 text-xl">{audienceCount > 0 ? "100%" : "0%"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
