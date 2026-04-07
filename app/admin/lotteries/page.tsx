"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Calendar, Ticket, Hash, Settings, Loader2, Save, X, Trash2, Clock } from "lucide-react";
import { getAllLotteryRounds, updateLotteryRound } from "../../../lib/firebase/firestore";
import { LotteryRound } from "../../../types";
import { getDisplaySoldTickets, getSalesProgress } from "../../../lib/utils/lotteryUtils";

export default function LotteryRoundsPage() {
    const [rounds, setRounds] = useState<LotteryRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRound, setEditingRound] = useState<LotteryRound | null>(null);
    const [isAddingRound, setIsAddingRound] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        setLoading(true);
        const data = await getAllLotteryRounds();
        setRounds(data);
        setLoading(false);
    };

    const handleCreateNew = () => {
        const newRound: any = {
            id: "", // Will be set by Firestore
            carTitle: "",
            carValue: 0,
            imageId: "",
            mediaType: "image",
            gameNumber: rounds.length + 1,
            ticketPrice: 0,
            bundlePrices: {},
            totalTickets: 1000,
            soldTickets: 0,
            initialSoldPercent: 0,
            timeLength: { months: 0, days: 30, hours: 0, minutes: 0 },
            drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: "active" as const
        };
        setEditingRound(newRound);
        setIsAddingRound(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this lottery round? This action cannot be undone.")) return;

        try {
            const { db } = await import("../../../lib/firebase/firestore");
            const { doc, deleteDoc } = await import("firebase/firestore");
            await deleteDoc(doc(db, "lottery_rounds", id));
            await fetchRounds();
        } catch (error) {
            alert("Failed to delete round");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRound) return;

        setIsSaving(true);
        try {
            if (isAddingRound) {
                const { addLotteryRound } = await import("../../../lib/firebase/firestore");
                await addLotteryRound(editingRound);
            } else {
                await updateLotteryRound(editingRound.id, editingRound);
            }
            await fetchRounds();
            setEditingRound(null);
            setIsAddingRound(false);
        } catch (error) {
            alert(isAddingRound ? "Failed to add round" : "Failed to update round");
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-red-500/10 text-red-400 border-red-500/20';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Lottery Rounds</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage and track all car lottery games.</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-3 sm:py-2 rounded-xl font-black transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                    <Plus className="h-4 w-4" />
                    New Round
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Fetching rounds...</p>
                </div>
            ) : rounds.length === 0 ? (
                <div className="py-20 text-center text-slate-500 bg-slate-900/20 border border-slate-800 rounded-2xl">
                    No lottery rounds found.
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {rounds.map((round) => (
                        <div key={round.id} className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 relative flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
                            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl border-b border-l text-[11px] font-bold capitalize ${getStatusStyle(round.status)}`}>
                                {round.status}
                            </div>

                            <div className="mb-6">
                                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter mb-1">Game #{round.gameNumber || 'N/A'}</div>
                                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{round.carTitle}</h3>
                                <div className="text-xs text-slate-500 font-medium">Valued at ETB {round.carValue.toLocaleString()}</div>
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                                        <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Ticket Price</div>
                                        <div className="text-sm text-white font-bold">ETB {round.ticketPrice.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                                        <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Progress</div>
                                        <div className="text-sm text-white font-bold">
                                            {getSalesProgress(round)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-black mb-2">
                                        <span>Sales Tracking</span>
                                        <span className="text-slate-400">{getDisplaySoldTickets(round).toLocaleString()} / {round.totalTickets.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${getSalesProgress(round)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="text-slate-400">Ends:</span>
                                        <span className="text-slate-200 font-bold">{new Date(round.drawDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                                        <span className="text-slate-400">Duration:</span>
                                        <span className="text-slate-200 font-bold">{round.timeLength.months}m {round.timeLength.days}d</span>
                                    </div>
                                </div>

                                {round.bundlePrices && Object.keys(round.bundlePrices).length > 0 && (
                                    <div className="pt-2">
                                        <div className="text-[10px] text-slate-500 uppercase font-black mb-2 px-1">Bundle Pricing</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(round.bundlePrices).map(([count, price]) => (
                                                <div key={count} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-300">
                                                    <span className="font-black text-emerald-400">{count}x</span> ETB {price.toLocaleString()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                                <button 
                                    onClick={() => setEditingRound(round)}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="h-3.5 w-3.5" /> Edit Round
                                </button>
                                <button 
                                    onClick={() => handleDelete(round.id)}
                                    className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Edit Modal Overlay */}
            {editingRound && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingRound(null)} />
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full sm:h-auto max-h-screen sm:max-h-[90vh]">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-bold text-white">{isAddingRound ? 'Add New Round' : 'Edit Lottery Round'}</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">{isAddingRound ? 'Configure new lottery' : `ID: ${editingRound.id}`}</p>
                            </div>
                            <button onClick={() => setEditingRound(null)} className="p-2 text-slate-400 hover:text-white rounded-xl">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-32 sm:pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Car Title</label>
                                        <input 
                                            type="text" 
                                            value={editingRound.carTitle}
                                            onChange={(e) => setEditingRound({...editingRound, carTitle: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Car Value (ETB)</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.carValue}
                                                onChange={(e) => setEditingRound({...editingRound, carValue: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Game #</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.gameNumber || ''}
                                                onChange={(e) => setEditingRound({...editingRound, gameNumber: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Round Status</label>
                                        <select 
                                            value={editingRound.status}
                                            onChange={(e) => setEditingRound({...editingRound, status: e.target.value as any})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50 appearance-none"
                                        >
                                            <option value="active">Active</option>
                                            <option value="draft">Draft</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Single Price</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.ticketPrice}
                                                onChange={(e) => setEditingRound({...editingRound, ticketPrice: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Total Pool Numbers</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.totalTickets}
                                                onChange={(e) => setEditingRound({...editingRound, totalTickets: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50 border-emerald-500/20">
                                            <label className="block text-[10px] text-emerald-400 uppercase font-black mb-1.5 ml-1">Max Tickets Per Selection</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.maxTicketsPerPurchase || 1}
                                                onChange={(e) => setEditingRound({...editingRound, maxTicketsPerPurchase: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                                min="1"
                                            />
                                            <p className="text-[9px] text-slate-500 mt-2 font-bold italic">* Each ticket allows selecting 2 numbers.</p>
                                        </div>
                                        <div className="bg-slate-950/30 p-4 rounded-2xl flex items-center justify-center border border-slate-800/50">
                                            <div className="text-center">
                                                <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Max Numbers Allow</div>
                                                <div className="text-2xl font-black text-white">{(editingRound.maxTicketsPerPurchase || 1) * 2}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1 text-emerald-400">
                                                Sold (Real: {editingRound.soldTickets}, Sim: {getDisplaySoldTickets(editingRound)})
                                            </label>
                                            <input 
                                                type="number" 
                                                value={editingRound.soldTickets}
                                                onChange={(e) => setEditingRound({...editingRound, soldTickets: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-emerald-500/20 rounded-xl text-white outline-none focus:border-emerald-500/50 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1 text-blue-400">Initial Sold %</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.initialSoldPercent || 0}
                                                onChange={(e) => setEditingRound({...editingRound, initialSoldPercent: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-blue-500/20 rounded-xl text-white outline-none focus:border-blue-500/50 font-bold"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1 text-orange-400">Target Sales %</label>
                                            <input 
                                                type="number" 
                                                value={editingRound.targetSalesPercent || 0}
                                                onChange={(e) => setEditingRound({...editingRound, targetSalesPercent: Number(e.target.value)})}
                                                className="w-full px-4 py-3 bg-slate-950 border border-orange-500/20 rounded-xl text-white outline-none focus:border-orange-500/50 font-bold"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                    <div className="px-1 text-[9px] text-orange-500 font-bold uppercase italic -mt-2">
                                        Note: Sales progress will linearly grow to reach {editingRound.targetSalesPercent || 0}% by {new Date(editingRound.drawDate).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5 ml-1">Draw Date</label>
                                        <input 
                                            type="date" 
                                            value={new Date(editingRound.drawDate).toISOString().split('T')[0]}
                                            onChange={(e) => setEditingRound({...editingRound, drawDate: new Date(e.target.value)})}
                                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-[10px] text-slate-500 uppercase font-black px-1">Bundle Pricing (Discounts)</div>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const newBundle = { ...editingRound.bundlePrices || {} };
                                            newBundle[0] = 0; // Temp entry
                                            setEditingRound({ ...editingRound, bundlePrices: newBundle });
                                        }}
                                        className="text-[10px] text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Add Bundle
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(editingRound.bundlePrices || {}).map(([count, price], index) => (
                                        <div key={index} className="flex gap-4 items-end bg-slate-950/30 p-3 rounded-2xl border border-slate-800/50">
                                            <div className="flex-1">
                                                <label className="block text-[9px] text-slate-600 uppercase font-bold mb-1 ml-1">Ticket Count</label>
                                                <input 
                                                    type="number" 
                                                    value={count}
                                                    onChange={(e) => {
                                                        const newBundle = { ...editingRound.bundlePrices };
                                                        delete newBundle[Number(count)];
                                                        newBundle[Number(e.target.value)] = Number(price);
                                                        setEditingRound({ ...editingRound, bundlePrices: newBundle });
                                                    }}
                                                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[9px] text-slate-600 uppercase font-bold mb-1 ml-1">Total Price (ETB)</label>
                                                <input 
                                                    type="number" 
                                                    value={price}
                                                    onChange={(e) => {
                                                        const newBundle = { ...editingRound.bundlePrices };
                                                        newBundle[Number(count)] = Number(e.target.value);
                                                        setEditingRound({ ...editingRound, bundlePrices: newBundle });
                                                    }}
                                                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newBundle = { ...editingRound.bundlePrices };
                                                    delete newBundle[Number(count)];
                                                    setEditingRound({ ...editingRound, bundlePrices: newBundle });
                                                }}
                                                className="p-2.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingRound.bundlePrices || Object.keys(editingRound.bundlePrices).length === 0) && (
                                        <div className="text-center py-4 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                            No bundles configured
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800/50">
                                <div className="text-[10px] text-slate-500 uppercase font-black mb-3">Duration Settings (timeLength)</div>
                                <div className="grid grid-cols-4 gap-3">
                                    {['months', 'days', 'hours', 'minutes'].map((unit) => (
                                        <div key={unit}>
                                            <label className="block text-[9px] text-slate-600 uppercase font-bold mb-1 ml-1">{unit}</label>
                                            <input 
                                                type="number" 
                                                value={(editingRound.timeLength as any)[unit]}
                                                onChange={(e) => setEditingRound({
                                                    ...editingRound, 
                                                    timeLength: { ...editingRound.timeLength, [unit]: Number(e.target.value) }
                                                })}
                                                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="text-[10px] text-slate-500 uppercase font-black mb-1 text-orange-400">Advanced Metadata</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] text-slate-600 uppercase font-bold mb-1 ml-1">Cloudinary ID</label>
                                        <input 
                                            type="text" 
                                            value={editingRound.imageId}
                                            onChange={(e) => setEditingRound({...editingRound, imageId: e.target.value})}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-slate-600 uppercase font-bold mb-1 ml-1">Media Type</label>
                                        <select 
                                            value={editingRound.mediaType || 'image'}
                                            onChange={(e) => setEditingRound({...editingRound, mediaType: e.target.value as any})}
                                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300"
                                        >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4">
                            <button 
                                onClick={() => setEditingRound(null)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                disabled={isSaving}
                                className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
