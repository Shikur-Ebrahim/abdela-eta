"use client";

import { useEffect, useState } from "react";
import { 
    Search, 
    Check, 
    X, 
    ExternalLink, 
    Eye, 
    Filter,
    ArrowUpRight,
    Loader2,
    Trash2
} from "lucide-react";
import { getAllPurchaseOrders, updatePurchaseStatus, deletePurchaseOrder } from "../../../lib/firebase/firestore";
import { PurchaseOrder } from "../../../types";

export default function SoldTicketsPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState<string | null>(null);

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
                order.phoneNumber.includes(searchTerm) ||
                order.city.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            // Prioritize pending status
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            
            // If both have the same status priority, sort by date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            case 'rejected': return "bg-red-500/10 text-red-400 border border-red-500/20";
            default: return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Ticket Purchases</h2>
                <p className="text-slate-400 text-sm mt-1">Manage and verify ticket purchase requests from users.</p>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or city..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <select 
                                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 outline-none focus:border-emerald-500/30 appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                            </select>
                        </div>
                        <button 
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Mobile View: Card-based layout */}
                <div className="block md:hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-3" />
                            <p className="text-slate-500 animate-pulse">Loading purchases...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No purchases found
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/50">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-white text-base">{order.fullName}</div>
                                            <div className="text-sm text-slate-400 tabular-nums">{order.phoneNumber}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${getStatusStyle(order.status)}`}>
                                            {order.status === 'approved' ? 'Accepted' : order.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Location</div>
                                            <div className="text-xs text-slate-200">{order.city}, {order.region}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-bold mb-1">Total Price</div>
                                            <div className="text-xs text-emerald-500 font-bold">ETB {order.totalPrice.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] text-slate-500 font-bold mb-2">Selected Numbers</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {order.selectedNumbers.map((num, i) => (
                                                <span key={i} className="bg-slate-800 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-slate-700">
                                                    #{num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <a href={order.idCardUrl} target="_blank" className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2">
                                            <Eye className="h-3.5 w-3.5" /> ID Card
                                        </a>
                                        <a href={order.paymentScreenshotUrl} target="_blank" className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2">
                                            <Eye className="h-3.5 w-3.5" /> Payment
                                        </a>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={() => handleAccept(order.id)}
                                                disabled={processingId === order.id}
                                                className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Accept</>}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleReject(order.id)}
                                            disabled={processingId === order.id}
                                            className="flex-1 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Reject</>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View: Tabular layout */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400 min-w-[1000px]">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Tickets / Price</th>
                                <th className="px-6 py-4">Proofs</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                                            <p className="text-slate-500 animate-pulse">Loading purchases...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                                        No purchases found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{order.fullName}</div>
                                            <div className="text-xs text-slate-500 tabular-nums">{order.phoneNumber}</div>
                                            <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-300 font-medium">{order.city}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black">{order.region}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {order.selectedNumbers.map((num, i) => (
                                                    <span key={i} className="bg-slate-800 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-700">
                                                        #{num}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-emerald-500 font-black text-xs">
                                                ETB {order.totalPrice.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <a 
                                                    href={order.idCardUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold"
                                                >
                                                    <Eye className="h-3 w-3" /> ID Card
                                                    <ArrowUpRight className="h-3 w-3 opacity-50" />
                                                </a>
                                                <a 
                                                    href={order.paymentScreenshotUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-xs font-bold"
                                                >
                                                    <Eye className="h-3 w-3" /> Payment
                                                    <ArrowUpRight className="h-3 w-3 opacity-50" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${getStatusStyle(order.status)}`}>
                                                {order.status === 'approved' ? 'Accepted' : order.status}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAccept(order.id)}
                                                        disabled={processingId === order.id}
                                                        className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                                        title="Approve Ticket"
                                                    >
                                                        {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleReject(order.id)}
                                                    disabled={processingId === order.id}
                                                    className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                                    title="Reject & Delete"
                                                >
                                                    {processingId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
