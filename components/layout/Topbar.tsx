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
    Truck,
    Package,
    ArrowRight
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import useAuthStore from "@/data/store/useAuthStore"
import socketService from "@/data/socket"
import useNotificationStore from "@/data/store/useNotificationStore"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

export default function Topbar() {
    const { user } = useAuthStore()
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead
    } = useNotificationStore()

    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)

    useEffect(() => {
        if (!user?._id) return

        fetchNotifications()

        // Click outside to close dropdowns
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [user?._id, fetchNotifications])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleSearch()
            } else {
                setSearchResults(null)
                setShowSearchResults(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleSearch = async () => {
        setSearchLoading(true)
        setShowSearchResults(true)
        try {
            const res = await retailerService.searchAnything(searchQuery)
            if (res.success) {
                setSearchResults(res.data)
            }
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
        toast.success("All notifications marked as read")
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
                <div className="relative w-full" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                        placeholder="Search data, users, or reports"
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-background-soft border-transparent focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    />

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl border border-border-custom shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                            <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
                                {searchLoading ? (
                                    <div className="p-8 text-center bg-gray-50/50">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Searching across your shop...</p>
                                    </div>
                                ) : !searchResults || (searchResults.orders.length === 0 && searchResults.customers.length === 0 && searchResults.products.length === 0) ? (
                                    <div className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
                                        <Search size={32} className="opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No results found for &quot;{searchQuery}&quot;</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-custom">
                                        {/* Orders */}
                                        {searchResults.orders.length > 0 && (
                                            <div className="p-4">
                                                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-3 px-1">Orders</h4>
                                                <div className="space-y-1">
                                                    {searchResults.orders.map((o: any) => (
                                                        <button
                                                            key={o.id}
                                                            onClick={() => {
                                                                router.push(`/retailer/orders?id=${o.id}`)
                                                                setShowSearchResults(false)
                                                                setSearchQuery("")
                                                            }}
                                                            className="w-full flex items-center justify-between p-2 hover:bg-primary/5 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                                                                    <ShoppingCart size={16} />
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-xs font-bold font-mono">#{o.orderId}</p>
                                                                    <p className="text-[10px] text-text-muted font-medium italic">{o.customer}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs font-black">₹{o.total}</span>
                                                                <span className={cn(
                                                                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                                    o.status === "Pending" ? "bg-amber-100 text-amber-600" :
                                                                    o.status === "Delivered" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                                                                )}>{o.status}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Customers */}
                                        {searchResults.customers.length > 0 && (
                                            <div className="p-4 bg-gray-50/30">
                                                <h4 className="text-[10px] font-black uppercase text-purple-600 tracking-[0.2em] mb-3 px-1">Customers</h4>
                                                <div className="space-y-1">
                                                    {searchResults.customers.map((c: any) => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => {
                                                                router.push(`/retailer/customers?q=${c.name}`)
                                                                setShowSearchResults(false)
                                                                setSearchQuery("")
                                                            }}
                                                            className="w-full flex items-center justify-between p-2 hover:bg-purple-50 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-border-custom bg-white">
                                                                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-xs font-bold text-foreground group-hover:text-purple-600 transition-colors">{c.name}</p>
                                                                    <p className="text-[10px] text-text-muted font-medium">{c.phone}</p>
                                                                </div>
                                                            </div>
                                                            <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products */}
                                        {searchResults.products.length > 0 && (
                                            <div className="p-4">
                                                <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-3 px-1">Products</h4>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {searchResults.products.map((p: any) => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => {
                                                                router.push(`/retailer/products?q=${p.name}`)
                                                                setShowSearchResults(false)
                                                                setSearchQuery("")
                                                            }}
                                                            className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-xl transition-all group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-custom bg-white flex-shrink-0">
                                                                    {p.image ? (
                                                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                                             <Package size={16} className="text-gray-300" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-xs font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</p>
                                                                    <span className="text-[10px] font-black text-blue-600">₹{p.price}</span>
                                                                </div>
                                                            </div>
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                                                p.stockStatus === "In Stock" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                                            )}>{p.stockStatus === "In Stock" ? "In Stock" : "Out of Stock"}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-3 border-t border-border-custom bg-gray-50/50 flex items-center justify-between">
                                <p className="text-[10px] font-medium text-text-muted italic">Press Enter to see all results</p>
                                <div className="flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-border-custom text-[8px] font-black text-text-muted shadow-sm">ESC</span>
                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">to close</span>
                                </div>
                            </div>
                        </div>
                    )}
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
                                        {notifications.map((n: any) => (
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
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.roleId?.name || (user?.role === "admin" ? "Admin" : user?.role) || 'User'}</p>
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
