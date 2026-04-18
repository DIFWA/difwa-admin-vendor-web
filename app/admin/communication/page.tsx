"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { BellRing, Mail, Send, Users, ShieldAlert, CheckCircle2, Layout, Smartphone, Shield, Image as ImageIcon, Upload, Trash2, Edit2, X, Plus, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import apiClient from "@/data/api/apiClient"
import useAuthStore from "@/data/store/useAuthStore"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import Cropper from "react-easy-crop"
import "react-quill-new/dist/quill.snow.css"

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx?.drawImage(
        image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );
    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            if (file) resolve(file);
            else reject(new Error('Canvas is empty'));
        }, 'image/jpeg', 0.9);
    });
};

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

import useAdminStore from "@/data/store/useAdminStore"

export default function CommunicationHubPage() {
    const [mounted, setMounted] = useState(false)
    const { audienceCount, loadingAudience, fetchAudienceCount } = useAdminStore()
    const [activeTab, setActiveTab] = useState<'fcm' | 'email'>('fcm')
    const [sending, setSending] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const { user } = useAuthStore()
    const currentUserPermissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    const canSend = currentUserPermissions.includes("ALL") || currentUserPermissions.includes("COMMUNICATION_SEND")

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

    // Banners State
    const [showBannersModal, setShowBannersModal] = useState(false)
    const [banners, setBanners] = useState<any[]>([])
    const [loadingBanners, setLoadingBanners] = useState(false)
    const [editingBanner, setEditingBanner] = useState<any | null>(null)
    const [bannerForm, setBannerForm] = useState({
        title: "",
        image: "",
        actionType: "none",
        actionValue: "",
        isActive: true,
        priority: 1
    })
    const [uploadingImage, setUploadingImage] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [shops, setShops] = useState<any[]>([])
    const [loadingShops, setLoadingShops] = useState(false)

    const fetchShops = async () => {
        setLoadingShops(true)
        try {
            const res = await adminService.getShops()
            if (res.success) {
                // Ensure we access the correct data array (sometimes it's res.data, sometimes res.data.data)
                const retailersList = Array.isArray(res.data) ? res.data : res.data?.data || []
                const approvedShops = retailersList.filter((r: any) => r.status === "approved")
                setShops(approvedShops)
            }
        } catch (error) {
            console.error("Failed to fetch shops", error)
        } finally {
            setLoadingShops(false)
        }
    }

    const fetchBanners = async () => {
        setLoadingBanners(true)
        try {
            const res = await adminService.getBanners()
            if (res.success) setBanners(res.data)
            fetchShops() // Also fetch shops for the dropdown
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingBanners(false)
        }
    }

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null))
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const handleUploadCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setUploadingImage(true)
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            const formData = new FormData()
            formData.append("file", croppedBlob, "banner.jpg")

            const res = await apiClient.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setBannerForm(prev => ({ ...prev, image: res.data.url }))
            setImageSrc(null)
        } catch (error) {
            console.error("Upload failed", error)
        } finally {
            setUploadingImage(false)
        }
    }

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;
        const items = Array.from(banners);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({ ...item, priority: index + 1 }));
        setBanners(updatedItems);

        try {
            await adminService.reorderBanners(updatedItems.map(b => ({ _id: b._id, priority: b.priority })));
        } catch (error) {
            console.error("Failed to reorder", error);
            fetchBanners();
        }
    }

    const saveBanner = async () => {
        if (!bannerForm.title || !bannerForm.image) return;
        setSending(true)
        try {
            if (editingBanner) {
                await adminService.updateBanner(editingBanner._id, bannerForm)
            } else {
                await adminService.createBanner(bannerForm)
            }
            await fetchBanners()
            setEditingBanner(null)
            setBannerForm({ title: "", image: "", actionType: "none", actionValue: "", isActive: true, priority: banners.length + 1 })
        } catch (error) {
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    const deleteBanner = async (id: string) => {
        if (!confirm("Delete this banner?")) return;
        try {
            await adminService.deleteBanner(id)
            await fetchBanners()
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        setMounted(true)
        fetchAudienceCount()
    }, [fetchAudienceCount])

    if (!mounted) return null

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

    if (!canSend) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-border-custom shadow-sm text-center my-12">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
                <Shield size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-text-muted mt-2 max-w-xs">You do not have permission to access the Communication Hub or send broadcasts.</p>
        </div>
    )

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

            {/* Selection Tabs & Banner Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                <button
                    onClick={() => {
                        fetchBanners();
                        fetchShops(); // Ensure shops are loaded for the dropdown
                        setShowBannersModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all whitespace-nowrap group"
                >
                    <ImageIcon size={18} className="group-hover:scale-110 transition-transform" /> Manage Banners
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

            {/* BANNERS MODAL */}
            {showBannersModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
                    <div className="bg-white rounded-[40px] w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                                    <ImageIcon size={28} className="text-blue-500" /> Dynamic App Banners
                                </h2>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Control the main carousel shown to users</p>
                            </div>
                            <button onClick={() => setShowBannersModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} className="text-text-muted" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50">
                            {/* Banners List */}
                            <div className="flex-1 border-r border-gray-100 overflow-y-auto p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Active Banners</h3>
                                    <button
                                        onClick={() => {
                                            setEditingBanner(null);
                                            setBannerForm({ title: "", image: "", actionType: "none", actionValue: "", isActive: true, priority: banners.length + 1 });
                                        }}
                                        className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Add New
                                    </button>
                                </div>

                                {loadingBanners ? (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                                        <div className="relative w-12 h-12 flex items-center justify-center">
                                            {/* Water drop shape with bounce */}
                                            <div
                                                className="absolute w-8 h-8 bg-blue-500 shadow-lg shadow-blue-500/50"
                                                style={{
                                                    borderRadius: '50% 50% 50% 0',
                                                    transform: 'rotate(-45deg)',
                                                    animation: 'bounce 1s infinite'
                                                }}
                                            />
                                            {/* Ripple effect below */}
                                            <div className="absolute -bottom-4 w-12 h-3 bg-blue-200/80 rounded-[50%] animate-ping" />
                                        </div>
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest animate-pulse">Flowing In Banners...</p>
                                    </div>
                                ) : banners.length === 0 ? (
                                    <div className="text-center py-20 text-text-muted font-bold">No banners added yet.</div>
                                ) : (
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="banners-list">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                                    {banners.map((banner, index) => (
                                                        <Draggable key={banner._id} draggableId={banner._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn(
                                                                        "bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group transition-all hover:shadow-md",
                                                                        snapshot.isDragging ? "shadow-xl scale-[1.02] border-blue-200 z-50" : ""
                                                                    )}
                                                                >
                                                                    <div {...provided.dragHandleProps} className="text-gray-400 hover:text-primary cursor-grab">
                                                                        <GripVertical size={20} />
                                                                    </div>
                                                                    <div className="w-40 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                                                        {!banner.isActive && (
                                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                                <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Hidden</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-primary truncate">{banner.title}</h4>
                                                                        <div className="flex items-center gap-3 mt-1">
                                                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">Order: {index + 1}</span>
                                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Action: {banner.actionType}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 shrink-0">
                                                                        <button onClick={() => { 
                                                                            setEditingBanner(banner); 
                                                                            setBannerForm({
                                                                                title: banner.title,
                                                                                image: banner.image,
                                                                                actionType: banner.actionType || "none",
                                                                                actionValue: banner.actionValue || "",
                                                                                isActive: banner.isActive !== undefined ? banner.isActive : true,
                                                                                priority: index + 1
                                                                            }); 
                                                                        }} className="p-2 text-text-muted hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors">
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button onClick={() => deleteBanner(banner._id)} className="p-2 text-text-muted hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                )}
                            </div>

                            {/* Editor Form */}
                            <div className="w-full md:w-[450px] bg-white p-8 overflow-y-auto border-l border-gray-100 shrink-0">
                                <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-6">
                                    {editingBanner ? "Edit Banner" : "Create New Banner"}
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Banner Image (2:1 Ratio Recommended)</label>

                                        {imageSrc ? (
                                            <div className="space-y-4">
                                                <div className="relative h-64 bg-black rounded-[24px] overflow-hidden">
                                                    <Cropper
                                                        image={imageSrc}
                                                        crop={crop}
                                                        zoom={zoom}
                                                        aspect={2 / 1}
                                                        onCropChange={setCrop}
                                                        onCropComplete={onCropComplete}
                                                        onZoomChange={setZoom}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setImageSrc(null)} disabled={uploadingImage} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-xs uppercase tracking-widest">Cancel</button>
                                                    <button onClick={handleUploadCroppedImage} disabled={uploadingImage} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
                                                        {uploadingImage ? "Uploading..." : "Save & Upload"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-[24px] overflow-hidden bg-background-soft transition-colors h-48 flex items-center justify-center">
                                                {bannerForm.image ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={bannerForm.image} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="bg-black/50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Upload size={16} /> Change Image</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <Upload size={32} className="mx-auto text-blue-300 mb-2" />
                                                        <span className="text-xs font-bold text-text-muted">Click to select (1200x600px recommended)</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Banner Title (Internal)</label>
                                        <input
                                            type="text" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-background-soft border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-300 transition-colors"
                                            placeholder="e.g. Summer Mega Sale"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Action Type</label>
                                            <select
                                                value={bannerForm.actionType} onChange={e => setBannerForm({ ...bannerForm, actionType: e.target.value })}
                                                className="w-full h-[52px] px-4 bg-background-soft border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-300 transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="none">No Action</option>
                                                <option value="shop">Open Shop</option>
                                                <option value="product">Open Product</option>
                                                <option value="url">Open External URL</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Sort Priority</label>
                                            <div className="w-full h-[52px] px-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm text-gray-500 flex items-center justify-between">
                                                <span>Serial No</span>
                                                <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">{bannerForm.priority}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {bannerForm.actionType !== "none" && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                                {bannerForm.actionType === "url" ? "Target URL" : bannerForm.actionType === "shop" ? "Select Target Shop" : "Target Product ID"}
                                            </label>

                                            {bannerForm.actionType === "shop" ? (
                                                <select
                                                    value={bannerForm.actionValue}
                                                    onChange={e => setBannerForm({ ...bannerForm, actionValue: e.target.value })}
                                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-400 transition-colors text-blue-700 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select a Water Plant</option>
                                                    {shops.map((shop) => (
                                                        <option key={shop._id} value={shop._id}>
                                                            {shop.businessDetails?.businessName || shop.name} ({shop.businessDetails?.location?.city || "Unknown City"})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text" value={bannerForm.actionValue} onChange={e => setBannerForm({ ...bannerForm, actionValue: e.target.value })}
                                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-400 transition-colors text-blue-700"
                                                    placeholder={`Enter ${bannerForm.actionType} value...`}
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 cursor-pointer" onClick={() => setBannerForm({ ...bannerForm, isActive: !bannerForm.isActive })}>
                                        <div className={cn("w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out", bannerForm.isActive ? "bg-blue-500" : "bg-gray-300")}>
                                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out", bannerForm.isActive ? "translate-x-6" : "translate-x-0")} />
                                        </div>
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">Banner is Active</span>
                                    </div>

                                    <button
                                        onClick={saveBanner}
                                        disabled={sending || uploadingImage || !bannerForm.title || !bannerForm.image}
                                        className="w-full py-4 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 mt-4"
                                    >
                                        {sending ? "Saving..." : editingBanner ? "Update Banner" : "Publish Banner"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
