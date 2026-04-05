"use client"

import { useState, useEffect } from "react"
import { Search, Clock, Plus, Edit2, Trash2, X, Layers, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import adminService from "@/data/services/adminService"
import useAuthStore from "@/data/store/useAuthStore"

interface Category {
    _id: string;
    name: string;
    image?: string;
    createdAt: string;
}

import useAdminStore from "@/data/store/useAdminStore"

export default function CategoriesPage() {
    const [mounted, setMounted] = useState(false)
    const { user } = useAuthStore()
    const { 
        categoriesData, 
        loadingCategories: loading, 
        fetchCategories 
    } = useAdminStore()

    const currentUserPermissions = user?.permissions && user.permissions.length > 0
        ? user.permissions
        : (user?.roleId?.permissions || []);

    const canView = currentUserPermissions.includes("CATEGORIES_VIEW")
    const canCreate = currentUserPermissions.includes("CATEGORIES_CREATE")
    const canEdit = currentUserPermissions.includes("CATEGORIES_EDIT")
    const canDelete = currentUserPermissions.includes("CATEGORIES_DELETE")

    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [categoryName, setCategoryName] = useState("")
    const [categoryImage, setCategoryImage] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 10

    useEffect(() => {
        setMounted(true)
        fetchCategories(currentPage, limit, searchTerm)
    }, [fetchCategories, currentPage, searchTerm])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const categories = categoriesData?.data || []
    const totalPages = categoriesData?.pagination?.totalPages || 1
    const totalItems = categoriesData?.pagination?.totalCategories || 0

    const handleOpenModal = (category: Category | null = null) => {
        setEditingCategory(category)
        setCategoryName(category ? category.name : "")
        setCategoryImage(category?.image || "")
        setIsModalOpen(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadLoading(true)
        try {
            const response = await adminService.uploadImage(file)
            setCategoryImage(response.url)
        } catch (error) {
            console.error("Upload failed:", error)
            alert("Image upload failed. Please try again.")
        } finally {
            setUploadLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!categoryName.trim()) return

        setActionLoading(true)
        try {
            if (editingCategory) {
                await adminService.updateCategory(editingCategory._id, categoryName, categoryImage)
            } else {
                await adminService.createCategory(categoryName, categoryImage)
            }
            setIsModalOpen(false)
            fetchCategories(currentPage, limit, searchTerm, true) // Force refresh
        } catch (error: unknown) {
            console.error(error)
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined
            alert(msg || "Action failed")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return

        try {
            await adminService.deleteCategory(id)
            fetchCategories(currentPage, limit, searchTerm, true) // Force refresh
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined
            alert(msg || "Delete failed")
        }
    }

    if (!canView) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-border-custom shadow-sm text-center my-12">
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-4">
                <Layers size={32} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-text-muted mt-2 max-w-xs">You do not have permission to view or manage the Category module.</p>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
                    <p className="text-text-muted">Create and manage product categories for the platform.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] transition-all shadow-lg shadow-black/5"
                    >
                        <Plus size={18} />
                        Add Category
                    </button>
                )}
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
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Category Name</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {categories.map((cat: Category) => (
                                    <tr key={cat._id} className="hover:bg-background-soft/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    No
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold">{cat.name}</td>
                                        <td className="px-6 py-4 text-text-muted">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-text-muted">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleOpenModal(cat)}
                                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(cat._id)}
                                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                {!canEdit && !canDelete && <span className="text-xs italic">View Only</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr><td colSpan={4} className="p-12 text-center text-text-muted">No categories found</td></tr>
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
                                    placeholder="Enter category name (e.g. 20L Water Can)"
                                    value={categoryName}
                                    onChange={e => setCategoryName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Category Image URL</label>
                                <input
                                    type="text"
                                    placeholder="Paste image URL here"
                                    value={categoryImage}
                                    onChange={e => setCategoryImage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                />
                                {categoryImage && (
                                    <div className="mt-2 p-2 border border-dashed rounded-xl flex items-center gap-4">
                                        <img src={categoryImage} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                        <span className="text-xs text-text-muted">Image Preview</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-text-muted">Or Upload Instead</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploadLoading ? (
                                                <Clock className="animate-spin text-primary" size={24} />
                                            ) : (
                                                <>
                                                    <Plus className="text-gray-400 group-hover:text-primary mb-2 transition-colors" size={24} />
                                                    <p className="text-sm text-gray-500 font-medium">Click to upload category image</p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadLoading}
                                        />
                                    </label>
                                </div>
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
