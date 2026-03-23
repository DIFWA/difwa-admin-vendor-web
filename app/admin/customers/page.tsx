"use client"

import { useState } from "react"
import {
    Users,
    UserPlus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Globe,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    MessageSquare,
    Trash2,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    ExternalLink
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { cn } from "@/lib/utils"

const stats = [
    { title: "Total Customers", value: "11,040", change: "+14.4%", trend: "up", icon: Users, color: "bg-primary-light text-primary" },
    { title: "New Customers", value: "2,370", change: "+20%", trend: "up", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
    { title: "Visitor", value: "250k", change: "+20%", trend: "up", icon: Globe, color: "bg-purple-50 text-purple-600" },
]

const chartData = [
    { name: "Sun", customers: 20 },
    { name: "Mon", customers: 35 },
    { name: "Tue", customers: 30 },
    { name: "Wed", customers: 45 },
    { name: "Thu", customers: 40 },
    { name: "Fri", customers: 55 },
    { name: "Sat", customers: 50 },
]

const customers = [
    { id: "#CUST001", name: "John Doe", email: "john.doe@example.com", phone: "+1234567890", orderCount: 25, spend: "3,450.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { id: "#CUST002", name: "Jane Smith", email: "jane.smith@example.com", phone: "+1234567890", orderCount: 5, spend: "250.00", status: "Inactive", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
    { id: "#CUST003", name: "Emily Davis", email: "emily.davis@example.com", phone: "+1234567890", orderCount: 30, spend: "4,600.00", status: "VIP", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" },
    { id: "#CUST004", name: "Michael Brown", email: "michael@example.com", phone: "+1234567890", orderCount: 15, spend: "1,200.00", status: "Active", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
]

export default function CustomersPage() {
    const [selectedCustomer, setSelectedCustomer] = useState(customers[0])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-background-soft p-1 rounded-lg text-xs font-bold">
                        <button className="px-4 py-1.5 bg-white shadow-sm rounded-md">This week</button>
                        <button className="px-4 py-1.5 text-text-muted hover:text-foreground">Last week</button>
                    </div>
                    <button className="p-2 rounded-lg border bg-white hover:bg-background-soft">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-muted mb-1">{stat.title}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <span className="text-xs font-bold text-primary flex items-center mb-1">
                                        <TrendingUp size={12} className="mr-1" />
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted mt-1">Last 7 days</p>
                            </div>
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Customer Overview</h3>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-primary rounded-full"></div>
                                <span>Active Customers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-1 bg-primary-light rounded-full"></div>
                                <span>New Customers</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#AEDC81" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#AEDC81" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#868889" }}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#868889" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                                <Area
                                    type="monotone"
                                    dataKey="customers"
                                    stroke="#0096FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCust)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-custom flex items-center justify-between">
                        <h3 className="text-lg font-bold">Customer Details</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search customer"
                                    className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-48"
                                />
                            </div>
                            <button className="p-2 rounded-lg border hover:bg-background-soft text-text-muted">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider">
                                    <th className="px-6 py-4">Customer Id</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Order Count</th>
                                    <th className="px-6 py-4">Total Spend</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {customers.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => setSelectedCustomer(c)}
                                        className={cn(
                                            "hover:bg-background-soft transition-colors cursor-pointer",
                                            selectedCustomer?.id === c.id && "bg-background-soft/50"
                                        )}
                                    >
                                        <td className="px-6 py-4 font-semibold">{c.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border">
                                                    <img src={c.image} alt="" />
                                                </div>
                                                <span className="font-bold">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted">{c.phone}</td>
                                        <td className="px-6 py-4 font-bold">{c.orderCount}</td>
                                        <td className="px-6 py-4 font-bold">{c.spend}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit",
                                                c.status === "Active" ? "bg-primary-light text-primary" :
                                                    c.status === "VIP" ? "bg-warning-50 text-warning" : "bg-red-50 text-red-500"
                                            )}>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    c.status === "Active" ? "bg-primary" :
                                                        c.status === "VIP" ? "bg-warning" : "bg-red-500"
                                                )}></div>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary">
                                                    <MessageSquare size={16} />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 border-t flex items-center justify-between">
                        <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-primary-light text-primary">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-text-muted hover:bg-background-soft">2</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-text-muted hover:bg-background-soft">3</button>
                        </div>
                        <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-background-soft transition-all flex items-center gap-2">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-8">
                    <div className="text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-primary-light bg-background-soft overflow-hidden mx-auto mb-4">
                            <img src={selectedCustomer?.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{selectedCustomer?.name}</h3>
                            <button className="text-primary hover:scale-110 transition-transform">
                                <ExternalLink size={16} />
                            </button>
                        </div>
                        <p className="text-sm font-medium text-text-muted">{selectedCustomer?.email}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Customer Info</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background-soft">
                                <Phone size={18} className="text-text-muted" />
                                <p className="text-sm font-bold">{selectedCustomer?.phone}</p>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-background-soft">
                                <MapPin size={18} className="text-text-muted" />
                                <p className="text-sm font-bold line-clamp-1">123 Main St, NY</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Social Media</p>
                        <div className="flex items-center justify-between">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                                <button key={i} className="w-10 h-10 rounded-full border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Activity</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Registration:</span>
                                <span className="font-bold">15.01.2025</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-muted">Last purchase:</span>
                                <span className="font-bold">10.01.2025</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Order overview</p>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-background-soft py-3 rounded-xl text-center">
                                <p className="text-lg font-bold">{selectedCustomer?.orderCount}</p>
                                <p className="text-[10px] text-text-muted font-bold">Total</p>
                            </div>
                            <div className="bg-background-soft py-3 rounded-xl text-center">
                                <p className="text-lg font-bold">140</p>
                                <p className="text-[10px] text-text-muted font-bold">Completed</p>
                            </div>
                            <div className="bg-background-soft py-3 rounded-xl text-center">
                                <p className="text-lg font-bold">10</p>
                                <p className="text-[10px] text-text-muted font-bold">Canceled</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
