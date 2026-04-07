"use client"

import { X, Package, MapPin, User, Clock, CheckCircle2, ChevronRight, Truck, CreditCard, Receipt, Printer } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderDetailsModalProps {
    order: any;
    onClose: () => void;
}

const statusColorStyles: any = {
    "Pending": "text-warning bg-warning-50 border-warning-100",
    "Accepted": "text-blue-600 bg-blue-50 border-blue-100",
    "Processing": "text-indigo-600 bg-indigo-50 border-indigo-100",
    "Rider Assigned": "text-blue-600 bg-blue-50 border-blue-100",
    "Rider Accepted": "text-indigo-600 bg-indigo-50 border-indigo-100",
    "Out for Delivery": "text-orange-600 bg-orange-50 border-orange-100",
    "Delivered": "text-emerald-600 bg-emerald-50 border-emerald-100",
    "Completed": "text-emerald-600 bg-emerald-50 border-emerald-100",
    "Cancelled": "text-red-600 bg-red-50 border-red-100",
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const orderDate = order.createdAt || order.date;
    const formattedDate = orderDate ? new Date(orderDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }) : "N/A";

    const customerName = order.user?.fullName || order.user?.name || "Guest";
    const customerPhone = order.user?.phoneNumber || order.user?.phone || "N/A";
    const address = order.deliveryAddress?.address || "N/A";
    const city = order.deliveryAddress?.city || "";
    const pincode = order.deliveryAddress?.pincode || "";

    const userRider = order.rider;
    const payMethod = order.paymentMethod || "COD";
    const payStatus = order.paymentStatus || order.payment || "Pending";

    // Calculate total if missing
    const grandTotal = order.totalAmount || order.price || order.items?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 print:p-0 print:bg-white print:fixed print:inset-0 print:z-[9999]">
            <style jsx global>{`
                @media print {
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    #printable-invoice {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none !important;
                    }
                    #printable-invoice * {
                        visibility: visible;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            
            <div id="printable-invoice" className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none">
                {/* Header */}
                <div className="p-6 border-b border-border-custom flex items-center justify-between bg-primary/5 print:bg-transparent print:px-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary print:border print:border-primary">
                            <Receipt size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                Invoice {order.orderId || order.id}
                            </h2>
                            <p className="text-xs text-text-muted font-medium">{formattedDate}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-text-muted hover:text-red-500 hover:shadow-sm no-print">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar print:overflow-visible print:p-0 print:mt-6">
                    {/* Status Tracker (Simplified) */}
                    <div className="flex items-center justify-between p-4 bg-background-soft rounded-2xl border border-border-custom/50 print:bg-transparent">
                        <div className="flex items-center gap-4">
                            <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border", statusColorStyles[order.status] || "bg-gray-50 text-gray-500")}>
                                {order.status}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted tracking-wide">
                            <CreditCard size={14} /> {payMethod} • {payStatus}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Customer Details</h3>
                            <div className="p-5 rounded-2xl border border-border-custom bg-white shadow-sm space-y-3 print:shadow-none">
                                <div className="flex items-start gap-3">
                                    <User size={16} className="text-primary shrink-0 mt-1" />
                                    <div>
                                        <p className="font-bold text-sm">{customerName}</p>
                                        <p className="text-xs text-text-muted font-medium mt-0.5">{customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pt-3 border-t border-dashed border-border-custom">
                                    <MapPin size={16} className="text-primary shrink-0 mt-1" />
                                    <div>
                                        <p className="text-xs leading-relaxed font-medium">
                                            {address}{city && `, ${city}`}{pincode && ` - ${pincode}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rider Info (If Assigned) */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Delivery Info</h3>
                            <div className="p-5 rounded-2xl border border-border-custom bg-white shadow-sm h-full flex flex-col justify-center print:shadow-none">
                                {userRider ? (
                                    <div className="flex items-start gap-3">
                                        <Truck size={16} className="text-primary shrink-0 mt-1" />
                                        <div>
                                            <p className="font-bold text-sm">Partner Assigned</p>
                                            <p className="text-xs text-text-muted font-black mt-1 uppercase">{userRider.name || "Delivery Partner"}</p>
                                            <p className="text-xs text-primary font-bold mt-2 flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg w-fit print:border print:border-primary/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse print:animate-none" /> Live Status: {order.status}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-2">
                                        <Truck size={24} className="text-text-muted/30 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-text-muted">No Rider Assigned Yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Order Summary</h3>
                            <span className="text-[10px] font-bold text-text-muted bg-background-soft px-2 py-0.5 rounded-full no-print">{order.items?.length || 0} ITEMS</span>
                        </div>
                        <div className="rounded-2xl border border-border-custom overflow-hidden shadow-sm print:shadow-none print:rounded-none">
                            <table className="w-full text-sm">
                                <thead className="bg-background-soft text-text-muted text-[10px] uppercase font-black tracking-widest border-b border-border-custom print:bg-transparent">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Product</th>
                                        <th className="px-5 py-3 text-center">Qty</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-custom">
                                    {order.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="group hover:bg-background-soft/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-primary group-hover:bg-white transition-colors border border-border-custom print:bg-transparent">
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs">{item.product?.name || "Premium Water Jar"}</p>
                                                        <p className="text-[10px] text-text-muted font-medium mt-0.5">₹{item.price} / unit</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="px-2 py-0.5 rounded-lg bg-background-soft font-black text-[10px] print:bg-transparent print:border">x{item.quantity}</span>
                                            </td>
                                            <td className="px-5 py-4 text-right font-black text-xs text-primary">₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-primary/5 print:bg-transparent">
                                    <tr>
                                        <td colSpan={2} className="px-5 py-4 text-right font-bold text-text-muted text-xs uppercase tracking-widest">Grand Total</td>
                                        <td className="px-5 py-4 text-right font-black text-lg text-primary">₹{Number(grandTotal).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border-custom bg-background-soft/50 flex justify-end gap-3 no-print">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white border border-border-custom text-[10px] font-black uppercase tracking-wider hover:border-red-200 hover:text-red-500 transition-all shadow-sm">
                        Close
                    </button>
                    <button onClick={handlePrint} className="px-8 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
                        <Printer size={14} /> Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
