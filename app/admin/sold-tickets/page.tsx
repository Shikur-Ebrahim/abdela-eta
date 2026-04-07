"use client";

import { useEffect, useState } from "react";
import { 
    Search, 
    Check, 
    Eye, 
    Filter,
    Loader2,
    Trash2,
    User,
    Phone,
    Calendar,
    Receipt,
    Hash,
    X,
    ExternalLink
} from "lucide-react";
import { getAllPurchaseOrders, updatePurchaseStatus, deletePurchaseOrder } from "../../../lib/firebase/firestore";
import { PurchaseOrder } from "../../../types";

// --- Detail Modal Component ---
interface ModalProps {
    order: PurchaseOrder;
    onClose: () => void;
}

function PurchaseDetailModal({ order, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <User className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase tracking-tighter text-lg">{order.fullName}</h3>
                            <p className="text-slate-500 text-xs font-bold font-mono tracking-tight">{order.phoneNumber}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="h-10 w-10 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-slate-700/50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Timestamp Section */}
                    <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 shadow-inner">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-tighter">Purchase Date</span>
                        </div>
                        <div className="text-slate-200 font-black text-sm uppercase">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    {/* Numbers Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Hash className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-tighter">Selected Lucky Numbers</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {order.selectedNumbers.map((num, i) => (
                                <div key={i} className="aspect-square bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50 text-emerald-400 font-black text-sm shadow-lg shadow-emerald-500/5">
                                    #{num}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Proofs Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-tighter">Documents & Identity</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {order.idCardUrl && (
                                <a 
                                    href={order.idCardUrl} 
                                    target="_blank" 
                                    className="p-4 bg-slate-950 hover:bg-slate-800 group/link border border-slate-800 rounded-2xl flex items-center justify-between transition-all"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">User Proof</span>
                                        <span className="text-blue-400 font-black text-xs uppercase tracking-tight group-hover/link:text-blue-300">Identity Card</span>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-slate-600 group-hover/link:text-blue-400" />
                                </a>
                            )}
                            <a 
                                href={order.paymentScreenshotUrl} 
                                target="_blank" 
                                className="p-4 bg-slate-950 hover:bg-slate-800 group/link border border-slate-800 rounded-2xl flex items-center justify-between transition-all"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Financial Proof</span>
                                    <span className="text-orange-400 font-black text-xs uppercase tracking-tight group-hover/link:text-orange-300">Bank Receipt</span>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-600 group-hover/link:text-orange-400" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 bg-slate-950/50 border-t border-slate-800">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase rounded-2xl transition-all active:scale-[0.98] tracking-widest"
                    >
                        Close Detail View
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---
export default function SoldTicketsPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllPurchaseOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (orderId: string) => {
        if (!confirm("Are you sure you want to Accept this ticket purchase?")) return;
        
        setProcessingId(orderId);
        try {
            await updatePurchaseStatus(orderId, 'approved');
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
        } catch (error) {
            alert("Failed to approve order");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (orderId: string) => {
        if (!confirm("WARNING: Rejecting will PERMANENTLY DELETE this record. Are you sure?")) return;
        
        setProcessingId(orderId);
        try {
            await deletePurchaseOrder(orderId);
            setOrders(orders.filter(o => o.id !== orderId));
        } catch (error) {
            alert("Failed to delete order");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredOrders = orders
        .filter(order => {
            const matchesSearch = 
                order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.phoneNumber.includes(searchTerm);
            
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // First: Sort by status (Pending first)
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            
            // Second: Within the same group, sort by Date (Newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            default: return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
        }
    };

    return (
        <>
            <div className="space-y-8 p-4 sm:p-0">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Ticket Purchases</h2>
                        <p className="text-slate-500 text-sm font-bold mt-1 tracking-wide">
                            {loading ? "Syncing data..." : `${filteredOrders.length} records found`}
                        </p>
                    </div>
                    
                    <button 
                        onClick={fetchOrders}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase rounded-xl transition-all border border-slate-700 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Database
                    </button>
                </div>

                {/* Filter Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            className="w-full pl-11 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                        <select 
                            className="w-full sm:w-64 pl-11 pr-10 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl text-sm text-slate-300 outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Display All Orders</option>
                            <option value="pending">Show Pending Only</option>
                            <option value="approved">Show Accepted Only</option>
                        </select>
                    </div>
                </div>

                {/* Main Content Grid */}
                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-800 font-black">
                        <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
                        <p className="text-slate-500 animate-pulse text-sm">Accessing purchase records...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-800 text-center p-8">
                        <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                            <Search className="h-8 w-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">No Purchases Found</h3>
                        <p className="text-slate-500 text-sm max-w-xs">No records matched your search or selection filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.map((order, index) => {
                        // Check if we need to show a section header
                        const showPendingHeader = index === 0 && order.status === 'pending';
                        const showApprovedHeader = 
                            (index === 0 && order.status === 'approved') || 
                            (index > 0 && order.status === 'approved' && filteredOrders[index - 1].status === 'pending');

                        return (
                            <div key={order.id} className="contents">
                                {showPendingHeader && (
                                    <div className="col-span-full mt-4 mb-2 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-amber-500/20"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                                            Action Required (Pending)
                                        </span>
                                        <div className="h-px flex-1 bg-amber-500/20"></div>
                                    </div>
                                )}
                                {showApprovedHeader && (
                                    <div className="col-span-full mt-8 mb-2 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-emerald-500/20"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                            Verified Records (Completed)
                                        </span>
                                        <div className="h-px flex-1 bg-emerald-500/20"></div>
                                    </div>
                                )}
                                <div 
                                    className={`group relative bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border transition-all hover:shadow-2xl hover:bg-slate-900/60 overflow-hidden flex flex-col h-full ${
                                        order.status === 'approved' ? 'border-emerald-500/10' : 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                                    }`}
                                >
                                    {/* Header: User Info */}
                                <div className="p-6 pb-2 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50 group-hover:scale-110 transition-transform">
                                            <User className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-black text-base leading-none mb-1 group-hover:text-emerald-400 transition-all uppercase tracking-tighter">{order.fullName}</h4>
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <Phone className="h-3 w-3" />
                                                <span className="text-[10px] font-bold font-mono tracking-tight">{order.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                                        {order.status === 'approved' ? 'Active' : order.status}
                                    </span>
                                </div>

                                {/* Main Body: Receipt Photo & Price */}
                                <div className="p-6 pt-2 space-y-4 flex-1 flex flex-col">
                                    {/* Receipt Visual */}
                                    <div 
                                        className="relative aspect-video w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden group/receipt cursor-pointer"
                                        onClick={() => window.open(order.paymentScreenshotUrl, '_blank')}
                                    >
                                        <img 
                                            src={order.paymentScreenshotUrl} 
                                            alt="Receipt" 
                                            className="w-full h-full object-cover transition-all duration-500 group-hover/receipt:scale-110 group-hover/receipt:blur-[2px]" 
                                        />
                                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/receipt:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                            <Eye className="h-6 w-6 text-orange-400 drop-shadow-xl" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest shadow-xl">View Original</span>
                                        </div>
                                        {/* Floating Price Tag on Image */}
                                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-black rounded-lg shadow-xl uppercase tracking-tighter">
                                            ETB {order.totalPrice.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Quick Link to Details */}
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-full py-4 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all rounded-2xl flex items-center justify-center gap-2 group/detail"
                                    >
                                        <Hash className="h-4 w-4 group-hover/detail:text-emerald-500" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">View Purchase Details</span>
                                    </button>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-6 pt-0 flex gap-2">
                                    {order.status === 'pending' && (
                                        <button 
                                            onClick={() => handleAccept(order.id)}
                                            disabled={processingId === order.id}
                                            className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest"
                                        >
                                            {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <><Check className="h-4 w-4" /> Accept</>}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleReject(order.id)}
                                        disabled={processingId === order.id}
                                        className={`${order.status === 'approved' ? 'w-full' : 'flex-1'} py-4 bg-slate-800/50 hover:bg-red-600/20 text-slate-500 hover:text-red-400 text-xs font-black uppercase rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 tracking-widest border border-slate-800 hover:border-red-500/50`}
                                    >
                                        {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        {order.status === 'approved' && "Delete Record"}
                                    </button>
                                </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Render Detail Modal */}
            {selectedOrder && (
                <PurchaseDetailModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </>
    );
}
