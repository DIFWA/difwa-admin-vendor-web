"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Bike, Power, MapPin, MoreVertical, Trash2, Eye, X, Phone, Mail, CreditCard } from "lucide-react"
import retailerService from "@/data/services/retailerService"
import { toast } from "sonner"

export default function RidersPage() {
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedRider, setSelectedRider] = useState<any>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        vehicleType: "Bike",
        plateNumber: ""
    })
    const [editFormData, setEditFormData] = useState({
        name: "",
        phone: "",
        vehicleType: "",
        plateNumber: ""
    })

    useEffect(() => {
        fetchRiders()
    }, [])

    const fetchRiders = async () => {
        try {
            setLoading(true)
            const response = await retailerService.getRiders()
            if (response.success) {
                setRiders(response.data)
            }
        } catch (error) {
            toast.error("Failed to fetch riders")
        } finally {
            setLoading(false)
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await retailerService.addRider(formData)
            if (response.success) {
                toast.success("Rider added successfully")
                setShowAddModal(false)
                fetchRiders()
                setFormData({ name: "", email: "", password: "", phone: "", vehicleType: "Bike", plateNumber: "" })
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add rider")
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await retailerService.updateRider(selectedRider._id, editFormData)
            if (response.success) {
                toast.success("Rider updated successfully")
                setIsEditMode(false)
                setSelectedRider(response.data)
                setRiders(riders.map((r: any) => r._id === selectedRider._id ? response.data : r))
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update rider")
        }
    }

    const openDetails = (rider: any) => {
        setSelectedRider(rider)
        setEditFormData({
            name: rider.user?.name || "",
            phone: rider.user?.phone || "",
            vehicleType: rider.vehicleDetails?.vehicleType || "Bike",
            plateNumber: rider.vehicleDetails?.plateNumber || ""
        })
        setShowDetailsModal(true)
        setIsEditMode(false)
    }

    const toggleStatus = async (riderId: string, currentStatus: string) => {
        const newStatus = currentStatus === "Offline" ? "Available" : "Offline"
        try {
            const response = await retailerService.updateRiderStatus(riderId, newStatus)
            if (response.success) {
                const updatedRiders = riders.map((r: any) => r._id === riderId ? { ...r, status: newStatus } : r)
                setRiders(updatedRiders)
                if (selectedRider && selectedRider._id === riderId) {
                    setSelectedRider({ ...selectedRider, status: newStatus })
                }
                toast.success(`Rider is now ${newStatus}`)
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleDeleteRider = async (riderId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete rider ${name}?`)) return

        try {
            const response = await retailerService.deleteRider(riderId)
            if (response.success) {
                setRiders(riders.filter((r: any) => r._id !== riderId))
                if (showDetailsModal && selectedRider?._id === riderId) {
                    setShowDetailsModal(false)
                }
                toast.success("Rider deleted successfully")
            }
        } catch (error) {
            toast.error("Failed to delete rider")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Riders Management</h1>
                    <p className="text-text-muted">Manage your delivery personnel and their status.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add New Rider
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white border border-border-custom rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : riders.length === 0 ? (
                <div className="bg-white border border-border-custom rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-1">No riders added yet</h3>
                    <p className="text-text-muted mb-6">Create your first rider to start delivering orders.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-primary font-semibold hover:underline"
                    >
                        + Add a rider
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {riders.map((rider: any) => (
                        <div key={rider._id} className="bg-white border border-border-custom rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div onClick={() => openDetails(rider)} className="flex items-center gap-3 cursor-pointer group-hover:text-primary transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Users className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{rider.user?.name}</h3>
                                        <p className="text-xs text-text-muted">{rider.user?.email}</p>
                                    </div>
                                </div>
                                {/* <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rider.status === 'Available' ? 'bg-green-100 text-green-700' :
                                    rider.status === 'On Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {rider.status}
                                </div> */}
                            </div>

                            <div className="space-y-2.5 mb-6" onClick={() => openDetails(rider)}>
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <Bike size={16} />
                                    <span>{rider.vehicleDetails?.vehicleType} • {rider.vehicleDetails?.plateNumber}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-text-muted">
                                    <MapPin size={16} />
                                    <span>Last synced: {new Date(rider.updatedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-border-custom">
                                {/* <button
                                    onClick={() => toggleStatus(rider._id, rider.status)}
                                    className="flex-1 bg-background-soft hover:bg-primary-light hover:text-primary py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Power size={16} />
                                    {rider.status === 'Offline' ? 'Go Online' : 'Go Offline'}
                                </button> */}
                                <button
                                    onClick={() => openDetails(rider)}
                                    className="p-2 border border-border-custom rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="View Details"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteRider(rider._id, rider.user?.name)}
                                    className="p-2 border border-border-custom rounded-lg hover:bg-red-50 hover:text-destructive transition-colors"
                                    title="Delete Rider"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Rider Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 border-b border-border-custom flex items-center justify-between">
                            <h2 className="text-xl font-bold">Add Delivery Rider</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-background-soft transition-colors text-text-muted hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInput}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Enter rider name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInput}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Vehicle Type</label>
                                    <select
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    >
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Cycle">Cycle</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        required
                                        value={formData.plateNumber}
                                        onChange={handleInput}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-custom focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="KA 01 XX 0000"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-border-custom font-bold hover:bg-background-soft transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Create Rider
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rider Details Modal */}
            {showDetailsModal && selectedRider && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="relative h-32 bg-gradient-to-r from-primary/10 to-orange-100">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white transition-all text-text-muted hover:text-foreground shadow-sm"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl">
                                    <div className="w-full h-full rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                                        <Users size={40} />
                                    </div>
                                </div>
                            </div>
                            {/* <div className="absolute bottom-4 right-8">
                                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border ${selectedRider.status === 'Available' ? 'bg-green-500 text-white border-green-600' :
                                    selectedRider.status === 'On Delivery' ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-500 text-white border-gray-600'
                                    }`}>
                                    {selectedRider.status}
                                </div>
                            </div> */}
                        </div>

                        <div className="px-8 pt-14 pb-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-foreground">{selectedRider.user?.name}</h2>
                                    <p className="text-text-muted font-medium">Delivery Personnel Profile</p>
                                </div>
                                {!isEditMode ? (
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditMode(false)}
                                            className="px-6 py-2.5 border border-border-custom rounded-xl font-bold hover:bg-background-soft transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditMode ? (
                                <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1">Full Name</label>
                                            <div className="relative">
                                                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editFormData.name}
                                                    onChange={handleEditInput}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border-custom focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                    placeholder="Rider Name"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editFormData.phone}
                                                    onChange={handleEditInput}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border-custom focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                    placeholder="+91 XXXX"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1">Vehicle Type</label>
                                            <div className="relative">
                                                <Bike size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                                <select
                                                    name="vehicleType"
                                                    value={editFormData.vehicleType}
                                                    onChange={handleEditInput}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border-custom focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold appearance-none bg-white"
                                                >
                                                    <option value="Bike">Bike</option>
                                                    <option value="Scooter">Scooter</option>
                                                    <option value="Cycle">Cycle</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-text-muted ml-1">Plate Number</label>
                                            <div className="relative">
                                                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                                <input
                                                    type="text"
                                                    name="plateNumber"
                                                    value={editFormData.plateNumber}
                                                    onChange={handleEditInput}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border-custom focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold"
                                                    placeholder="Plate Number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-300">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">Contact Information</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold uppercase tracking-tighter">Email Address</p>
                                                        <p className="text-sm font-black text-foreground">{selectedRider.user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold uppercase tracking-tighter">Phone Number</p>
                                                        <p className="text-sm font-black text-foreground">{selectedRider.user?.phone || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">Vehicle & Deployment</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <Bike size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold uppercase tracking-tighter">Vehicle Details</p>
                                                        <p className="text-sm font-black text-foreground">{selectedRider.vehicleDetails?.vehicleType} • {selectedRider.vehicleDetails?.plateNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted font-bold uppercase tracking-tighter">Last Active Location</p>
                                                        <p className="text-sm font-black text-foreground">
                                                            {selectedRider.currentLocation ? `${selectedRider.currentLocation.lat.toFixed(4)}, ${selectedRider.currentLocation.lng.toFixed(4)}` : 'No location data'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 pt-8 border-t border-border-custom flex items-center justify-between">
                                <p className="text-xs text-text-muted font-medium italic">Registered on {new Date(selectedRider.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                {/* <button
                                    onClick={() => toggleStatus(selectedRider._id, selectedRider.status)}
                                    className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-md ${selectedRider.status === 'Offline' ? 'bg-primary text-white hover:bg-primary font-bold shadow-primary/20' : 'bg-background-soft text-foreground hover:bg-red-50 hover:text-red-600 shadow-none'
                                        }`}
                                >
                                    {selectedRider.status === 'Offline' ? 'Activate Rider' : 'Set to Offline'}
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
