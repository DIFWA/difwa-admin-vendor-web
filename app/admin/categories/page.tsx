"use client"

import { useState, useEffect } from "react"
import { Search, Clock, Plus, Edit2, Trash2, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"

interface Category {
    _id: string;
    name: string;
    createdAt: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categoryName, setCategoryName] = useState("")
    const [actionLoading, setActionLoading] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const limit = 10

    useEffect(() => {
        setCurrentPage(1)
        fetchCategories(1)
    }, [searchTerm])

    useEffect(() => {
        fetchCategories(currentPage)
    }, [currentPage])

    const fetchCategories = async (page: number) => {
        setLoading(true)
        try {
            const response = await adminService.getCategories(page, limit, searchTerm)
            setCategories(response.data)
            setTotalPages(response.pagination.totalPages)
            setTotalItems(response.pagination.totalCategories)
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (category: Category | null = null) => {
        setEditingCategory(category)
        setCategoryName(category ? category.name : "")
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryName.trim()) return

        setActionLoading(true)
        try {
            if (editingCategory) {
                await adminService.updateCategory(editingCategory._id, categoryName)
            } else {
                await adminService.createCategory(categoryName)
            }
            setIsModalOpen(false)
            fetchCategories(currentPage)
        } catch (error: any) {
            console.error(error)
            alert(error.response?.data?.message || "Action failed")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return

        try {
            await adminService.deleteCategory(id)
            fetchCategories(currentPage)
        } catch (error: any) {
            alert(error.response?.data?.message || "Delete failed")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
                    <p className="text-text-muted">Create and manage product categories for the platform.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] transition-all shadow-lg shadow-black/5"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                <div className="p-6 border-b border-border-custom flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search categories..."
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
                                    <th className="px-6 py-4">Category Name</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4 font-bold">{cat.name}</td>
                                        <td className="px-6 py-4 text-text-muted">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan={3} className="p-12 text-center text-text-muted">No categories found</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-6 border-t border-border-custom flex items-center justify-between">
                        <p className="text-sm text-text-muted font-medium">
                            Showing <span className="text-primary font-bold">{(currentPage - 1) * limit + 1}</span> to <span className="text-primary font-bold">{Math.min(currentPage * limit, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> categories
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{editingCategory ? "Edit Category" : "New Category"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Category Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter category name (e.g. Tiger Shrimp)"
                                    value={categoryName}
                                    onChange={e => setCategoryName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={actionLoading || !categoryName.trim()}
                                    className="w-full py-4 rounded-2xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Clock className="animate-spin" size={20} /> : (editingCategory ? "Update Category" : "Create Category")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
