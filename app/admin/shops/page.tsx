// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Search, Filter, Plus, MoreVertical, Store, CheckCircle, XCircle } from "lucide-react"
// import { cn } from "@/lib/utils"

// const shops = [
//     { id: "SHP001", name: "Coastal Harvest", owner: "Rajesh Kumar", status: "Active", products: 45, revenue: "$12,450" },
//     { id: "SHP002", name: "Deep Sea Delights", owner: "Anita Singh", status: "Pending", products: 12, revenue: "$0" },
//     { id: "SHP003", name: "Fresh Catch Co.", owner: "Samuel John", status: "Active", products: 32, revenue: "$8,200" },
//     { id: "SHP004", name: "Blue Water Shrimps", owner: "Priya Das", status: "Deactivated", products: 0, revenue: "$4,500" },
// ]

// export default function ShopsPage() {
//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-bold tracking-tight">Shop Management</h1>
//                     <p className="text-text-muted">Monitor and control all registered retail shops.</p>
//                 </div>
//                 <Link href="/admin/shops/add" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md">
//                     <Plus size={16} /> Add New Shop
//                 </Link>
//             </div>

//             <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
//                 <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
//                     <h2 className="text-lg font-bold">All Shops</h2>
//                     <div className="flex items-center gap-3">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
//                             <input
//                                 type="text"
//                                 placeholder="Search shops..."
//                                 className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-64"
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
//                                 <th className="px-6 py-4">Shop ID</th>
//                                 <th className="px-6 py-4">Shop Name</th>
//                                 <th className="px-6 py-4">Owner</th>
//                                 <th className="px-6 py-4">Products</th>
//                                 <th className="px-6 py-4">Revenue</th>
//                                 <th className="px-6 py-4">Status</th>
//                                 <th className="px-6 py-4 text-center">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-border-custom text-sm">
//                             {shops.map((shop) => (
//                                 <tr key={shop.id} className="hover:bg-background-soft/50 transition-colors">
//                                     <td className="px-6 py-4 font-semibold">{shop.id}</td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-8 h-8 rounded bg-primary-light flex items-center justify-center text-primary">
//                                                 <Store size={16} />
//                                             </div>
//                                             <span className="font-medium">{shop.name}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4 text-text-muted">{shop.owner}</td>
//                                     <td className="px-6 py-4 font-semibold">{shop.products}</td>
//                                     <td className="px-6 py-4 font-bold">{shop.revenue}</td>
//                                     <td className="px-6 py-4">
//                                         <span className={cn(
//                                             "px-3 py-1 rounded-full text-xs font-bold border",
//                                             shop.status === "Active" ? "bg-green-50 text-green-600 border-green-100" :
//                                                 shop.status === "Pending" ? "bg-warning-50 text-warning border-warning-100" :
//                                                     "bg-red-50 text-red-600 border-red-100"
//                                         )}>
//                                             {shop.status}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center justify-center gap-2">
//                                             <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg" title="Approve">
//                                                 <CheckCircle size={18} />
//                                             </button>
//                                             <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Deactivate">
//                                                 <XCircle size={18} />
//                                             </button>
//                                             <button className="p-2 hover:bg-background-soft text-text-muted rounded-lg">
//                                                 <MoreVertical size={18} />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     )
// }
