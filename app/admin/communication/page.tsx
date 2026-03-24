"use client"

import { useState } from "react"
import { BellRing, Mail, Send, Users, ShieldAlert, Sparkles, CheckCircle2, Layout, Smartphone, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

export default function CommunicationHubPage() {
    const [activeTab, setActiveTab] = useState<'fcm' | 'email'>('fcm')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

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

    const handleSendFcm = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            await adminService.sendBulkNotification(fcmData.title, fcmData.body, fcmData.targetType)
            setSuccess("Push notifications broadcasted successfully!")
            setFcmData({ title: "", body: "", targetType: "all" })
            setTimeout(() => setSuccess(null), 5000)
        } catch (error) {
            console.error("FCM broadcast failed:", error)
        } finally {
            setSending(false)
        }
    }

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            await adminService.sendBulkEmail(emailData.subject, emailData.content)
            setSuccess("Bulk emails initiated successfully!")
            setEmailData({ subject: "", content: "" })
            setTimeout(() => setSuccess(null), 5000)
        } catch (error) {
            console.error("Email broadcast failed:", error)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Communication Hub</h1>
                <p className="text-text-muted mt-1">Broadcast high-impact updates and notifications to your entire user base.</p>
            </div>

            {/* Selection Tabs */}
            <div className="flex p-1.5 bg-background-soft rounded-[24px] w-full max-w-md border border-border-custom shadow-inner">
                <button
                    onClick={() => setActiveTab('fcm')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'fcm' ? "bg-white text-primary shadow-lg" : "text-text-muted hover:text-primary"
                    )}
                >
                    <Smartphone size={18} /> Push (FCM)
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'email' ? "bg-white text-primary shadow-lg" : "text-text-muted hover:text-primary"
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
                            <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white py-3 px-8 flex items-center gap-3 animate-in slide-in-from-top duration-300 z-10">
                                <CheckCircle2 size={20} />
                                <p className="font-black text-xs uppercase tracking-widest">{success}</p>
                            </div>
                        )}

                        {activeTab === 'fcm' ? (
                            <form onSubmit={handleSendFcm} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <BellRing size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-primary uppercase tracking-tight">Push Broadcast</h2>
                                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Real-time smartphone alerts</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g., Fresh Morning Catch is Here!"
                                                value={fcmData.title}
                                                onChange={e => setFcmData({ ...fcmData, title: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Target Audience</label>
                                            <select
                                                value={fcmData.targetType}
                                                onChange={e => setFcmData({ ...fcmData, targetType: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjcsIDQ1LCAzMSwgMC41KSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-[length:20px] bg-[right_1.5rem_center] bg-no-repeat"
                                            >
                                                <option value="all">All App Users</option>
                                                <option value="retailer">Retailers Only</option>
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
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-medium resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={sending}
                                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {sending ? "Broadcasting..." : <><Send size={20} /> Dispatch Push Notification</>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSendEmail} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-primary uppercase tracking-tight">Email Campaign</h2>
                                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Professional HTML newsletters</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Subject Line</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., Weekly Shrimp Insight: The Best Subscription Savings"
                                            value={emailData.subject}
                                            onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Newsletter Content (HTML/Rich Text)</label>
                                            <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                                                <Sparkles size={12} /> Use Templates
                                            </button>
                                        </div>
                                        <textarea
                                            required
                                            rows={12}
                                            placeholder="<h1>Welcome to Difwa</h1><p>Your premium store updates go here...</p>"
                                            value={emailData.content}
                                            onChange={e => setEmailData({ ...emailData, content: e.target.value })}
                                            className="w-full px-6 py-4 rounded-3xl bg-background-soft border-2 border-transparent focus:border-primary/20 outline-none transition-all font-mono text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={sending}
                                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {sending ? "Processing Emails..." : <><Mail size={20} /> Launch Email Campaign</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-8">
                    {/* Live Preview (Mock) */}
                    <div className="bg-white rounded-[40px] border border-border-custom shadow-lg overflow-hidden flex flex-col items-center p-8">
                        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6">Device Preview</h3>
                        <div className="w-[280px] h-[580px] border-[8px] border-zinc-900 rounded-[48px] bg-background-soft relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10" />
                            <div className="p-4 mt-12">
                                {activeTab === 'fcm' && fcmData.title && (
                                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/20 animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center">
                                                <img src="/loginlogo.png" className="w-3 h-3 invert" />
                                            </div>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-tight">Shrimbite</span>
                                            <span className="text-[10px] text-text-muted ml-auto">Now</span>
                                        </div>
                                        <p className="text-xs font-bold text-primary truncate">{fcmData.title}</p>
                                        <p className="text-[10px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">{fcmData.body || "Notification content preview will appear here..."}</p>
                                    </div>
                                )}

                                {activeTab === 'email' && emailData.subject && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-in fade-in zoom-in duration-500 overflow-hidden">
                                        <div className="w-full h-20 bg-primary-light/30 rounded-lg flex items-center justify-center text-primary mb-3">
                                            <img src="/loginlogo.png" className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-tight truncate">{emailData.subject}</p>
                                        <div className="mt-2 h-2 w-full bg-gray-100 rounded-full" />
                                        <div className="mt-1 h-2 w-3/4 bg-gray-100 rounded-full" />
                                        <div className="mt-4 w-full h-24 bg-gray-50 rounded-xl flex items-center justify-center p-4">
                                            <p className="text-[8px] text-text-muted text-center leading-relaxed italic">The HTML body of your email campaign will render here for the recipient.</p>
                                        </div>
                                    </div>
                                )}

                                {!fcmData.title && !emailData.subject && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <Layout size={40} className="text-text-muted mb-4" />
                                        <p className="text-xs font-bold text-text-muted text-center uppercase tracking-widest">Awaiting Content...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-primary rounded-[40px] p-8 text-white shadow-xl shadow-primary/20">
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                            System Stats
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-sm font-bold">App Users</span>
                                </div>
                                <span className="font-black">1,492</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="text-sm font-bold">FCM Enabled</span>
                                </div>
                                <span className="font-black text-blue-300">84%</span>
                            </div>
                            <div className="bg-white/10 rounded-3xl p-4 flex items-start gap-3">
                                <ShieldAlert size={20} className="shrink-0 text-amber-300" />
                                <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-wider">
                                    Broadcasts are irreversible. Please verify all content and target audiences before dispatching.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
