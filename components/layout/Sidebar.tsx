"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    TicketPercent,
    Layers,
    ArrowLeftRight,
    Award,
    PlusCircle,
    Image as ImageIcon,
    List,
    Star,
    UserCog,
    ShieldCheck,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import useAuthStore from "@/data/store/useAuthStore"

const adminMenu = [
    {
        title: "Main menu",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
            { name: "Shops", icon: Star, href: "/admin/shops" },
            { name: "Retailers", icon: Users, href: "/admin/retailers" },
            { name: "Users", icon: Users, href: "/admin/users" },
            { name: "Order Management", icon: ShoppingCart, href: "/admin/orders" },
            { name: "Categories", icon: Layers, href: "/admin/categories" },
            { name: "Transaction", icon: ArrowLeftRight, href: "/admin/transactions" },
        ]
    },
    {
        title: "Admin Control",
        items: [
            { name: "Admin role", icon: UserCog, href: "/admin/roles" },
            { name: "Control Authority", icon: ShieldCheck, href: "/admin/authority" },
        ]
    }
]

const retailerMenu = [
    {
        title: "Store Management",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/retailer/dashboard" },
            { name: "My Products", icon: List, href: "/retailer/products" },
            { name: "Add Product", icon: PlusCircle, href: "/retailer/products/add" },
            { name: "Orders", icon: ShoppingCart, href: "/retailer/orders" },
            { name: "Reviews", icon: Star, href: "/retailer/reviews" },
        ]
    },
    {
        title: "Business",
        items: [
            { name: "Revenue", icon: ArrowLeftRight, href: "/retailer/revenue" },
            { name: "Customers", icon: Users, href: "/retailer/customers" },
        ]
    }
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { user } = useAuthStore()
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
        if (user) {
            setRole(user.role)
            localStorage.setItem("role", user.role)
        } else {
            setRole(localStorage.getItem("role") || "admin")
        }
    }, [user])

    const handleToggle = () => {
        setCollapsed(!collapsed)
    }

    if (!mounted) {
        return <aside className="w-64 border-r border-border-custom bg-white h-screen sticky top-0 animate-pulse" />
    }

    const menuGroups = role === "retailer" ? retailerMenu : adminMenu
    const userLabel = role === "retailer" ? "Shrimp Retailer" : "Shrimpbite Admin"
    const userIdentity = role === "retailer" ? "Shop Owner" : "mark@shrimpbite.in"

    return (
        <aside className={cn(
            "flex flex-col border-r border-border-custom bg-white transition-all duration-300 h-screen sticky top-0",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <Link href={role === "retailer" ? "/retailer/dashboard" : "/admin/dashboard"} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <img
                                src="/loginlogo.png"
                                alt="Shrimpbite Logo"
                                className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                            />
                        </div>
                        <span className="font-bold text-xl text-primary tracking-tight ">Shrimpbite</span>
                    </Link>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
                        <img
                            src="/loginlogo.png"
                            alt="Shrimpbite Logo"
                            className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                        />
                    </div>
                )}
            </div>

            <button
                onClick={handleToggle}
                className="absolute -right-3 top-20 bg-white border border-border-custom rounded-full p-1 hover:bg-primary-light transition-colors z-50 shadow-sm"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scrollbar-hide">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        {!collapsed && (
                            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={`${groupIndex}-${item.name}`}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-foreground hover:bg-primary-light hover:text-primary"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            "shrink-0",
                                            !isActive && "text-text-muted group-hover:text-primary"
                                        )} />
                                        {!collapsed && (
                                            <span className="font-medium whitespace-nowrap">{item.name}</span>
                                        )}
                                        {collapsed && (
                                            <div className="absolute left-full ml-6 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Session */}
            <div className="p-4 border-t border-border-custom mt-auto">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-all",
                    collapsed ? "justify-center" : "bg-background-soft"
                )}>
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{userLabel}</p>
                            <p className="text-xs text-text-muted truncate">{userIdentity}</p>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
                            localStorage.removeItem("role")
                            window.location.href = "/login"
                        }}
                        className={cn(
                            "text-text-muted hover:text-destructive transition-colors",
                            collapsed && "p-2 hover:bg-red-50 rounded-lg"
                        )}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
                {!collapsed && (
                    <Link
                        href="https://shrimpbite.in"
                        target="_blank"
                        className="flex items-center justify-between mt-4 px-3 py-2 rounded-lg border border-border-custom hover:border-primary transition-all text-xs font-medium"
                    >
                        <span>Shrimbite Website</span>
                        <ArrowLeftRight size={14} className="rotate-45" />
                    </Link>
                )}
            </div>
        </aside>
    )
}
