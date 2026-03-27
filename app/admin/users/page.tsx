"use client"

import { useState, useEffect } from "react"
import { Search, Clock, Eye, X, User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Address {
    label: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

interface AppUser {
    _id: string;
    fullName: string;
    email?: string;
    phoneNumber: string;
    addresses: Address[];
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<AppUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const limit = 10

    useEffect(() => {
        setCurrentPage(1)
        fetchUsers(1)
    }, [searchTerm])

    useEffect(() => {
        fetchUsers(currentPage)
    }, [currentPage])

    const fetchUsers = async (page: number) => {
        setLoading(true)
        try {
            const response = await adminService.getUsers(page, limit, searchTerm)
            setUsers(response.data)
            setTotalPages(response.pagination.totalPages)
            setTotalItems(response.pagination.totalUsers)
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-text-muted">View and manage registered app users.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 rounded-lg bg-background-soft border-transparent text-sm outline-none w-80"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex justify-center"><Clock className="animate-spin text-primary" /></div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 text-xs font-bold text-primary uppercase tracking-wider border-b border-border-custom">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {(user.fullName || "U").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{user.fullName || "Unnamed User"}</span>
                                                    <span className="text-xs text-text-muted">ID: {user._id.slice(-6)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {user.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    <Phone size={12} /> {user.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-text-muted">
                                                <Calendar size={14} />
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className={cn(
                                                    "px-4 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                                    "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"
                                                )}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={4} className="p-12 text-center text-text-muted">No users found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-6 border-t border-border-custom flex items-center justify-between">
                        <p className="text-sm text-text-muted font-medium">
                            Showing <span className="text-primary font-bold">{(currentPage - 1) * limit + 1}</span> to <span className="text-primary font-bold">{Math.min(currentPage * limit, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> users
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl text-sm font-bold border border-border-custom hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                                            currentPage === i + 1 ? "bg-[#1B2D1F] text-white shadow-lg shadow-black/10" : "hover:bg-background-soft text-text-muted"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-xl text-sm font-bold border border-border-custom hover:bg-background-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 sticky top-0 bg-white border-b flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-2xl font-bold">User Profile</h2>
                                <p className="text-sm text-gray-500">User ID: {selectedUser._id}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <section>
                                <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <User size={14} /> Personal Information
                                </h3>
                                <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">FULL NAME</p>
                                        <p className="font-bold text-lg">{selectedUser?.fullName || "Unnamed User"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">JOINED DATE</p>
                                        <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">EMAIL</p>
                                        <p className="font-medium text-blue-600">{selectedUser.email || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold">PHONE NUMBER</p>
                                        <p className="font-bold">{selectedUser.phoneNumber}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="font-bold text-[#FF6B00] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MapPin size={14} /> Saved Addresses
                                </h3>
                                <div className="space-y-4">
                                    {selectedUser.addresses.length > 0 ? (
                                        selectedUser.addresses.map((addr, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-2xl p-6 relative border border-transparent hover:border-primary/20 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                        {addr.label}
                                                    </span>
                                                    {addr.isDefault && (
                                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">{addr.fullAddress}</p>
                                                <p className="text-xs text-text-muted mt-1">
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center bg-gray-50 rounded-2xl text-text-muted italic text-sm">
                                            No addresses saved.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
