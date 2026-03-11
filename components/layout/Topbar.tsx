"use client"

import {
    Search,
    Bell,
    Moon,
    ChevronDown,
    LogOut,
    CheckCircle2,
    Clock,
    ShoppingCart,
    ShieldAlert,
    Truck
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"
import socket from "@/data/api/socket"
import notificationService from "@/data/services/notificationService"
import { toast } from "sonner"

export default function Topbar() {
    const { user } = useAuthStore()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (!user?._id) return

        fetchNotifications()

        // Socket logic for notifications
        socket.connect()
        const room = `retailer_notifications_${user._id}`
        socket.emit("join", room)

        socket.on("notification", (newNotif: any) => {
            setNotifications(prev => [newNotif, ...prev])
            setUnreadCount(prev => prev + 1)
            toast.info(newNotif.title, {
                description: newNotif.message
                // radius: "lg"
            })
        })

        // Click outside to close dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            socket.off("notification")
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [user?._id])

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications()
            if (res.success) {
                setNotifications(res.notifications)
                setUnreadCount(res.notifications.filter((n: any) => !n.isRead).length)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success("All notifications marked as read")
        } catch (error) {
            console.error("Failed to mark all as read", error)
        }
    }

    const handleNotificationClick = async (n: any) => {
        if (!n.isRead) {
            await handleMarkAsRead(n._id)
        }

        const title = n.title.toLowerCase()
        const message = n.message.toLowerCase()

        if (title.includes("new order") || message.includes("new order")) {
            router.push("/retailer/orders?filter=Pending")
        } else if (title.includes("delivered") || title.includes("completed") || message.includes("delivered") || message.includes("completed")) {
            router.push("/retailer/orders?filter=Completed")
        } else if (n.type === "Inventory" || title.includes("inventory")) {
            router.push("/retailer/products")
        } else {
            // Default: just stay on current page or go to dashboard
            if (window.location.pathname !== "/retailer/dashboard" && !window.location.pathname.includes("/retailer/orders")) {
                router.push("/retailer/dashboard")
            }
        }

        setShowDropdown(false)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "Order": return <ShoppingCart size={16} className="text-primary" />
            case "Rider": return <Truck size={16} className="text-blue-500" />
            case "Inventory": return <ShieldAlert size={16} className="text-warning" />
            default: return <Bell size={16} className="text-text-muted" />
        }
    }

    return (
        <header className="h-16 border-b border-border-custom bg-white flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 flex items-center max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search data, users, or reports"
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-background-soft border-transparent focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={cn(
                            "p-2 rounded-full transition-all relative",
                            showDropdown ? "bg-primary/10 text-primary" : "hover:bg-background-soft text-text-muted"
                        )}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                {unreadCount >= 10 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-border-custom shadow-2xl animate-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
                            <div className="p-4 border-b border-border-custom flex items-center justify-between bg-primary/5">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[10px] font-black uppercase text-primary hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center gap-4 text-text-muted">
                                        <Bell size={32} className="opacity-20" />
                                        <p className="text-xs font-medium uppercase tracking-tight">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-custom">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={cn(
                                                    "p-4 hover:bg-background-soft/50 transition-colors cursor-pointer group relative",
                                                    !n.isRead && "bg-primary/5"
                                                )}
                                                onClick={() => handleNotificationClick(n)}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)] z-10" />
                                                )}
                                                <div className="flex gap-3 pl-2">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-border-custom flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <p className={cn("text-xs font-bold truncate", n.isRead ? "text-text" : "text-primary")}>
                                                                {n.title}
                                                            </p>
                                                            <span className="text-[10px] text-text-muted whitespace-nowrap flex items-center gap-1 font-medium">
                                                                <Clock size={10} />
                                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-border-custom text-center bg-background-soft/20">
                                <button className="text-[10px] font-black underline uppercase text-text-muted hover:text-primary transition-colors">
                                    View All Activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pl-4 border-l group">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border border-border-custom">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold leading-tight">{user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.role || 'User'}</p>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                            localStorage.removeItem("role")
                            window.location.href = "/login"
                        }}
                        className="ml-2 p-1.5 rounded-lg hover:bg-red-50 text-text-muted hover:text-destructive transition-all"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}
