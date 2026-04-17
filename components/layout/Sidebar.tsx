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
    PlusCircle,
    List,
    Star,
    UserCog,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Wallet,
    BellRing,
    CalendarCheck,
    Percent,
    Droplets,
    Truck,
    BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import useAuthStore from "@/data/store/useAuthStore"

const adminMenu = [
    {
        title: "Main menu",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", id: "DASHBOARD_VIEW" },
            { name: "Retailers", icon: Users, href: "/admin/retailers", id: "RETAILERS_VIEW" },
            { name: "App Users", icon: Users, href: "/admin/users", id: "APP_USERS_VIEW" },
            { name: "Order Management", icon: ShoppingCart, href: "/admin/orders", id: "ORDERS_VIEW" },
            { name: "Categories", icon: Layers, href: "/admin/categories", id: "CATEGORIES_VIEW" },
            { name: "Payout Settlements", icon: Wallet, href: "/admin/payouts", id: "PAYOUTS_VIEW" },
            { name: "Commission System", icon: Percent, href: "/admin/commission", id: "COMMISSION_EDIT" },
            { name: "Delivery Charges", icon: Truck, href: "/admin/delivery-charges", id: "COMMISSION_EDIT" },
            { name: "Platform Income", icon: BarChart3, href: "/admin/platform-income", id: "COMMISSION_EDIT" },
            { name: "Communication Hub", icon: BellRing, href: "/admin/communication", id: "COMMUNICATION_SEND" }, // Use specific permission
            { name: "Transaction", icon: ArrowLeftRight, href: "/admin/transactions", id: "PAYOUTS_VIEW" }, // Use Payouts view as base
        ]
    },
    {
        title: "Admin Control",
        items: [
            { name: "Admin role", icon: UserCog, href: "/admin/roles", id: "ROLES_EDIT" },
            { name: "Control Authority", icon: ShieldCheck, href: "/admin/authority", id: "AUTHORITY_EDIT" },
            { name: "Root Profile", icon: UserCog, href: "/admin/profile", id: "ALL" },
        ]
    }
]

const retailerMenu = [
    {
        title: "Store Management",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/retailer/dashboard" },
            { name: "My Products", icon: List, href: "/retailer/products" },
            { name: "Orders", icon: ShoppingCart, href: "/retailer/orders" },
            { name: "Riders", icon: Users, href: "/retailer/riders" },
            { name: "Daily Prep List", icon: CalendarCheck, href: "/retailer/prep-list" },
            { name: "Smart Tank", icon: Droplets, href: "/retailer/smart-tank" },
            { name: "Reviews", icon: Star, href: "/retailer/reviews" },
            { name: "Store Settings", icon: UserCog, href: "/retailer/settings" },
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

    const filterMenuItems = (menu: any[]) => {
        if (role !== "admin") return menu;

        // PRIORITIZE: User's custom overrides if they exist, otherwise fallback to role permissions
        const permissions = user?.permissions && user.permissions.length > 0
            ? user.permissions
            : (user?.roleId?.permissions || []);

        // Items that are ALWAYS visible to ANY admin (so they don't get locked out)
        const alwaysVisible = ["DASHBOARD_VIEW", "COMMISSION_EDIT"];

        return menu.map(group => ({
            ...group,
            items: group.items.filter((item: any) => {
                if (!item.id) return true;
                if (alwaysVisible.includes(item.id)) return true;
                if (permissions.includes("ALL")) return true;
                if (permissions.includes(item.id)) return true;

                // Overlapping logic
                if (item.id === "ROLES_EDIT" && permissions.includes("AUTHORITY_EDIT")) return true;

                return false;
            })
        })).filter(group => group.items.length > 0);
    };

    const menuGroups = role === "retailer" ? retailerMenu : filterMenuItems(adminMenu)

    return (
        <aside className={cn(
            "flex flex-col border-r border-border-custom bg-white transition-all duration-300 h-screen sticky top-0",
            collapsed ? "w-20" : "w-64"
        )}>
            {/* Logo */}
            <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <Link href={role === "retailer" ? "/retailer/dashboard" : "/admin/dashboard"} className="flex items-center gap-3 shrink-0">
                    <img
                        src="/waterlogo.png"
                        alt="Difwa Logo"
                        className="w-10 h-10 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)] shrink-0"
                    />
                    <span className={cn(
                        "font-bold text-xl text-blue-500 tracking-tight transition-all duration-300 overflow-hidden",
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        Difwa
                    </span>
                </Link>
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
                        <h3 className={cn(
                            "text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-2 transition-all duration-300 overflow-hidden",
                            collapsed ? "opacity-0 h-0 mb-0" : "opacity-100 h-auto mb-4"
                        )}>
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item: any) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={`${groupIndex}-${item.name}`}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                                : "text-foreground hover:bg-blue-50 hover:text-blue-500"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(
                                            "shrink-0",
                                            !isActive && "text-text-muted group-hover:text-blue-500"
                                        )} />
                                        <span className={cn(
                                            "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                                            collapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
                                        )}>
                                            {item.name}
                                        </span>
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

            {/* Bottom Footer Links */}
            <div className="p-4 border-t border-border-custom mt-auto">
                <Link
                    href="https://difwa.com"
                    target="_blank"
                    className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border border-border-custom hover:border-primary transition-all text-xs font-medium overflow-hidden whitespace-nowrap",
                        collapsed ? "w-0 opacity-0 border-transparent p-0 mt-0" : "w-full opacity-100"
                    )}
                >
                    <span>Difwa Website</span>
                    <ArrowLeftRight size={14} className="rotate-45" />
                </Link>
            </div>
        </aside>
    )
}
