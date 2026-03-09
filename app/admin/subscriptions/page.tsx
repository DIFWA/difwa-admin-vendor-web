// "use client"

// import { useState, useEffect } from "react"
// import { Plus, Edit2, Trash2, Check, X, AlertCircle, Trash, Star } from "lucide-react"
// import { cn } from "@/lib/utils"
// import adminService from "@/data/services/adminService"

// interface Plan {
//     _id: string;
//     name: string;
//     description: string;
//     price: number;
//     billingCycle: string;
//     features: string[];
//     maxOrderQuantity: number;
//     discountPercentage: number;
//     bulkOrdersAllowed: boolean;
//     freeDeliveries: number;
//     priorityDelivery: boolean;
//     badge: string;
//     status: string;
// }

// export default function SubscriptionsPage() {
//     const [plans, setPlans] = useState<Plan[]>([])
//     const [loading, setLoading] = useState(true)
//     const [showModal, setShowModal] = useState(false)
//     const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
//     const [formData, setFormData] = useState<Partial<Plan>>({
//         name: "",
//         description: "",
//         price: 0,
//         billingCycle: "Monthly",
//         features: [""],
//         maxOrderQuantity: 0,
//         discountPercentage: 0,
//         bulkOrdersAllowed: false,
//         freeDeliveries: 0,
//         priorityDelivery: false,
//         badge: "",
//         status: "Active"
//     })
//     const [actionLoading, setActionLoading] = useState(false)
//     const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

//     useEffect(() => {
//         fetchPlans()
//     }, [])

//     const fetchPlans = async () => {
//         setLoading(true)
//         try {
//             const response = await adminService.getSubscriptionPlans()
//             setPlans(response.data)
//         } catch (error) {
//             console.error("Error fetching plans:", error)
//         } finally {
//             setLoading(false)
//         }
//     }

//     const showToastMsg = (message: string, type: "success" | "error" = "success") => {
//         setToast({ message, type })
//         setTimeout(() => setToast(null), 3000)
//     }

//     const handleEdit = (plan: Plan) => {
//         setEditingPlan(plan)
//         setFormData(plan)
//         setShowModal(true)
//     }

//     const handleFeatureChange = (index: number, value: string) => {
//         const newFeatures = [...(formData.features || [])]
//         newFeatures[index] = value
//         setFormData({ ...formData, features: newFeatures })
//     }

//     const addFeatureField = () => {
//         setFormData({ ...formData, features: [...(formData.features || []), ""] })
//     }

//     const removeFeatureField = (index: number) => {
//         const newFeatures = [...(formData.features || [])]
//         newFeatures.splice(index, 1)
//         setFormData({ ...formData, features: newFeatures })
//     }

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setActionLoading(true)
//         try {
//             // Filter out empty features
//             const finalData = {
//                 ...formData,
//                 features: formData.features?.filter(f => f.trim() !== "")
//             }

//             if (editingPlan) {
//                 await adminService.updateSubscriptionPlan(editingPlan._id, finalData)
//                 showToastMsg("Plan updated successfully")
//             } else {
//                 await adminService.createSubscriptionPlan(finalData)
//                 showToastMsg("Plan created successfully")
//             }
//             setShowModal(false)
//             fetchPlans()
//         } catch (error: unknown) {
//             const msg = error && typeof error === 'object' && 'response' in error
//                 ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
//                 : undefined
//             showToastMsg(msg || "Operation failed", "error")
//         } finally {
//             setActionLoading(false)
//         }
//     }

//     const handleDelete = async (id: string) => {
//         if (!confirm("Are you sure you want to delete this plan?")) return
//         try {
//             await adminService.deleteSubscriptionPlan(id)
//             showToastMsg("Plan deleted successfully")
//             fetchPlans()
//         } catch (error) {
//             showToastMsg("Failed to delete plan", "error")
//         }
//     }

//     return (
//         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight text-primary">Subscription Plans</h1>
//                     <p className="text-text-muted mt-1">Manage and edit all subscription plans for your customers.</p>
//                 </div>
//                 <button
//                     onClick={() => {
//                         setEditingPlan(null)
//                         setFormData({
//                             name: "",
//                             description: "",
//                             price: 0,
//                             billingCycle: "Monthly",
//                             features: [""],
//                             maxOrderQuantity: 0,
//                             discountPercentage: 0,
//                             bulkOrdersAllowed: false,
//                             freeDeliveries: 0,
//                             priorityDelivery: false,
//                             badge: "",
//                             status: "Active"
//                         })
//                         setShowModal(true)
//                     }}
//                     className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
//                 >
//                     <Plus size={20} /> Create New Plan
//                 </button>
//             </div>

//             {/* Plans Grid */}
//             {loading ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     {[1, 2, 3].map(i => (
//                         <div key={i} className="h-96 rounded-[32px] bg-gray-100 animate-pulse border border-border-custom" />
//                     ))}
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     {plans.map((plan) => (
//                         <div
//                             key={plan._id}
//                             className={cn(
//                                 "group relative bg-white rounded-[40px] border-2 transition-all duration-500 p-8 flex flex-col h-full overflow-hidden",
//                                 plan.status === "Active" ? "border-transparent shadow-xl hover:shadow-2xl hover:-translate-y-2" : "border-gray-100 opacity-60 grayscale-[0.5]"
//                             )}
//                         >
//                             {/* Status Indicator */}
//                             <div className={cn(
//                                 "absolute top-6 right-8 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
//                                 plan.status === "Active" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
//                             )}>
//                                 {plan.status}
//                             </div>

//                             {/* Plan Content */}
//                             <div className="mb-6">
//                                 {plan.badge && (
//                                     <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
//                                         {plan.badge}
//                                     </span>
//                                 )}
//                                 <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{plan.name}</h3>
//                                 <div className="mt-2 flex items-baseline gap-1">
//                                     <span className="text-4xl font-black text-primary">₹{plan.price}</span>
//                                     <span className="text-text-muted font-medium">/ {plan.billingCycle.toLowerCase()}</span>
//                                 </div>
//                                 <p className="mt-4 text-text-muted text-sm leading-relaxed">{plan.description}</p>
//                             </div>

//                             {/* Features List */}
//                             <div className="flex-1 space-y-4 mb-8">
//                                 {plan.features.map((feature, idx) => (
//                                     <div key={idx} className="flex items-start gap-3">
//                                         <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
//                                             <Check size={12} className="text-green-600" />
//                                         </div>
//                                         <span className="text-sm text-gray-700 font-medium">{feature}</span>
//                                     </div>
//                                 ))}
//                                 {/* Meta stats */}
//                                 <div className="pt-4 border-t border-dashed border-gray-100 space-y-2">
//                                     <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-tighter">
//                                         <span>Max Order</span>
//                                         <span className="text-primary">{plan.maxOrderQuantity}kg</span>
//                                     </div>
//                                     <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-tighter">
//                                         <span>Discount</span>
//                                         <span className="text-primary">{plan.discountPercentage}%</span>
//                                     </div>
//                                     <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-tighter">
//                                         <span>Bulk Orders</span>
//                                         <span className={plan.bulkOrdersAllowed ? "text-green-600" : "text-red-400"}>{plan.bulkOrdersAllowed ? "YES" : "NO"}</span>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex items-center gap-3">
//                                 <button
//                                     onClick={() => handleEdit(plan)}
//                                     className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 text-primary font-bold hover:bg-primary hover:text-white transition-all border border-gray-100"
//                                 >
//                                     <Edit2 size={16} /> Edit
//                                 </button>
//                                 <button
//                                     onClick={() => handleDelete(plan._id)}
//                                     className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100"
//                                 >
//                                     <Trash2 size={18} />
//                                 </button>
//                             </div>
//                         </div>
//                     ))}

//                     {/* Empty Stat - Add Plan Placeholder */}
//                     <button
//                         onClick={() => {
//                             setEditingPlan(null)
//                             setFormData({
//                                 name: "",
//                                 description: "",
//                                 price: 0,
//                                 billingCycle: "Monthly",
//                                 features: [""],
//                                 maxOrderQuantity: 0,
//                                 discountPercentage: 0,
//                                 bulkOrdersAllowed: false,
//                                 freeDeliveries: 0,
//                                 priorityDelivery: false,
//                                 badge: "",
//                                 status: "Active"
//                             })
//                             setShowModal(true)
//                         }}
//                         className="group flex flex-col items-center justify-center gap-4 bg-background-soft border-2 border-dashed border-border-custom rounded-[40px] p-8 min-h-[400px] hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
//                     >
//                         <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
//                             <Plus size={32} />
//                         </div>
//                         <div className="text-center">
//                             <p className="font-black text-xl text-primary uppercase">Add New Plan</p>
//                             <p className="text-sm text-text-muted mt-1">Create a new subscription plan</p>
//                         </div>
//                     </button>
//                 </div>
//             )}

//             {/* Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
//                     <form
//                         onSubmit={handleSubmit}
//                         className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-hide"
//                     >
//                         <div className="p-8 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between z-10">
//                             <div>
//                                 <h2 className="text-2xl font-black text-primary uppercase tracking-tight">{editingPlan ? "Edit Subscription Plan" : "Create New Plan"}</h2>
//                                 <p className="text-sm text-text-muted">Fill in the details to configure your membership tier.</p>
//                             </div>
//                             <button
//                                 type="button"
//                                 onClick={() => setShowModal(false)}
//                                 className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>

//                         <div className="p-8 grid md:grid-cols-2 gap-8">
//                             {/* Left Side: General Info */}
//                             <div className="space-y-6">
//                                 <section>
//                                     <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                                         <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Core Details
//                                     </h3>
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">PLAN NAME</label>
//                                             <input
//                                                 type="text"
//                                                 required
//                                                 value={formData.name}
//                                                 onChange={e => setFormData({ ...formData, name: e.target.value })}
//                                                 placeholder="e.g. Silver Plan"
//                                                 className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">DESCRIPTION</label>
//                                             <textarea
//                                                 required
//                                                 value={formData.description}
//                                                 onChange={e => setFormData({ ...formData, description: e.target.value })}
//                                                 placeholder="Brief overview of the plan"
//                                                 className="w-full h-24 px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium resize-none"
//                                             />
//                                         </div>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">PRICE (₹)</label>
//                                                 <input
//                                                     type="number"
//                                                     required
//                                                     value={formData.price}
//                                                     onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
//                                                     className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-lg"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">BILLING CYCLE</label>
//                                                 <select
//                                                     value={formData.billingCycle}
//                                                     onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
//                                                     className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjcsIDQ1LCAzMSwgMC41KSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
//                                                 >
//                                                     <option value="Monthly">Monthly</option>
//                                                     <option value="Yearly">Yearly</option>
//                                                     <option value="Lifetime">Lifetime</option>
//                                                 </select>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </section>

//                                 <section>
//                                     <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                                         <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Visuals & Status
//                                     </h3>
//                                     <div className="space-y-4">
//                                         <div>
//                                             <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">BADGE text (optional)</label>
//                                             <input
//                                                 type="text"
//                                                 value={formData.badge}
//                                                 onChange={e => setFormData({ ...formData, badge: e.target.value })}
//                                                 placeholder="e.g. Most Popular"
//                                                 className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
//                                             />
//                                         </div>
//                                         <div className="flex items-center gap-4">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Disabled" : "Active" })}
//                                                 className={cn(
//                                                     "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all border",
//                                                     formData.status === "Active" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
//                                                 )}
//                                             >
//                                                 {formData.status === "Active" ? <><Check size={16} /> Status: Active</> : <><X size={16} /> Status: Disabled</>}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </section>
//                             </div>

//                             {/* Right Side: Features & Restrictions */}
//                             <div className="space-y-6">
//                                 <section>
//                                     <div className="flex items-center justify-between mb-4">
//                                         <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
//                                             <div className="w-1.5 h-1.5 rounded-full bg-primary" /> App Features
//                                         </h3>
//                                         <button
//                                             type="button"
//                                             onClick={addFeatureField}
//                                             className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
//                                         >
//                                             + Add Feature
//                                         </button>
//                                     </div>
//                                     <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
//                                         {formData.features?.map((feature, idx) => (
//                                             <div key={idx} className="flex gap-2">
//                                                 <input
//                                                     type="text"
//                                                     value={feature}
//                                                     onChange={e => handleFeatureChange(idx, e.target.value)}
//                                                     placeholder="Feature description"
//                                                     className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
//                                                 />
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => removeFeatureField(idx)}
//                                                     className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
//                                                 >
//                                                     <Trash size={16} />
//                                                 </button>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </section>

//                                 <section>
//                                     <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
//                                         <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Membership Rules
//                                     </h3>
//                                     <div className="bg-gray-50 rounded-[32px] p-6 space-y-6">
//                                         <div className="grid grid-cols-2 gap-6">
//                                             <div>
//                                                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">MAX ORDER (KG)</label>
//                                                 <input
//                                                     type="number"
//                                                     value={formData.maxOrderQuantity}
//                                                     onChange={e => setFormData({ ...formData, maxOrderQuantity: Number(e.target.value) })}
//                                                     className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none py-1 font-bold text-lg transition-all"
//                                                 />
//                                             </div>
//                                             <div>
//                                                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">DISCOUNT %</label>
//                                                 <input
//                                                     type="number"
//                                                     value={formData.discountPercentage}
//                                                     onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
//                                                     className="w-full bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none py-1 font-bold text-lg transition-all"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="flex flex-col gap-4 pt-2">
//                                             <label className="flex items-center justify-between cursor-pointer group">
//                                                 <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">ALLOW BULK ORDERS?</span>
//                                                 <div
//                                                     onClick={() => setFormData({ ...formData, bulkOrdersAllowed: !formData.bulkOrdersAllowed })}
//                                                     className={cn(
//                                                         "w-12 h-6 rounded-full transition-all duration-300 relative",
//                                                         formData.bulkOrdersAllowed ? "bg-primary" : "bg-gray-200"
//                                                     )}
//                                                 >
//                                                     <div className={cn(
//                                                         "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
//                                                         formData.bulkOrdersAllowed ? "left-7" : "left-1"
//                                                     )} />
//                                                 </div>
//                                             </label>
//                                             <label className="flex items-center justify-between cursor-pointer group">
//                                                 <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">PRIORITY DELIVERY?</span>
//                                                 <div
//                                                     onClick={() => setFormData({ ...formData, priorityDelivery: !formData.priorityDelivery })}
//                                                     className={cn(
//                                                         "w-12 h-6 rounded-full transition-all duration-300 relative",
//                                                         formData.priorityDelivery ? "bg-primary" : "bg-gray-200"
//                                                     )}
//                                                 >
//                                                     <div className={cn(
//                                                         "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
//                                                         formData.priorityDelivery ? "left-7" : "left-1"
//                                                     )} />
//                                                 </div>
//                                             </label>
//                                         </div>
//                                     </div>
//                                 </section>
//                             </div>
//                         </div>

//                         <div className="p-8 border-t border-gray-100 flex items-center justify-end gap-3">
//                             <button
//                                 type="button"
//                                 onClick={() => setShowModal(false)}
//                                 className="px-8 py-4 rounded-2xl font-bold text-text-muted hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={actionLoading}
//                                 className="px-10 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest text-xs min-w-[180px]"
//                             >
//                                 {actionLoading ? "Processing..." : editingPlan ? "Save Changes" : "Create Plan"}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             {/* Toast */}
//             {toast && (
//                 <div className={cn(
//                     "fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[24px] shadow-2xl z-[1000] flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-300 border-2 whitespace-nowrap",
//                     toast.type === "success" ? "bg-white border-green-500 text-green-600" : "bg-white border-red-500 text-red-600"
//                 )}>
//                     {toast.type === "success" ? <Star className="fill-green-600" size={20} /> : <AlertCircle size={20} />}
//                     <span className="font-black uppercase tracking-tighter">{toast.message}</span>
//                 </div>
//             )}
//         </div>
//     )
// }
