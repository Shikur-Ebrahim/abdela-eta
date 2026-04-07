"use client";

import { useEffect, useState } from "react";
import { 
    Hash, 
    ChevronDown, 
    Search, 
    RefreshCw, 
    ShieldCheck, 
    XOctagon, 
    Loader2, 
    Dices,
    Zap,
    Maximize2,
    Minimize2
} from "lucide-react";
import { 
    getAllLotteryRounds, 
    getSoldNumbers, 
    updateBlockedNumbers 
} from "../../../lib/firebase/firestore";
import { LotteryRound } from "../../../types";

export default function LotteryNumbersPage() {
    const [rounds, setRounds] = useState<LotteryRound[]>([]);
    const [selectedRoundId, setSelectedRoundId] = useState<string>("");
    const [selectedRound, setSelectedRound] = useState<LotteryRound | null>(null);
    const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
    const [blockedNumbers, setBlockedNumbers] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCompact, setIsCompact] = useState(false);

    const [isBulkUnblockMode, setIsBulkUnblockMode] = useState(false);
    const [unblockSelection, setUnblockSelection] = useState<number[]>([]);

    useEffect(() => {
        fetchRounds();
    }, []);

    useEffect(() => {
        if (selectedRoundId) {
            fetchRoundData(selectedRoundId);
        }
    }, [selectedRoundId]);

    const fetchRounds = async () => {
        setLoading(true);
        const data = await getAllLotteryRounds();
        const activeRounds = data.filter(r => r.status === 'active');
        setRounds(activeRounds);
        if (activeRounds.length > 0) {
            setSelectedRoundId(activeRounds[0].id);
        }
        setLoading(false);
    };

    const fetchRoundData = async (id: string) => {
        setLoading(true);
        const round = rounds.find(r => r.id === id) || null;
        setSelectedRound(round);
        
        // Fetch all numbers marked as sold in purchases
        const sold = await getSoldNumbers(id);
        setSoldNumbers(sold);
        
        // Load existing admin-blocked numbers from the round object
        setBlockedNumbers(round?.blockedNumbers || []);
        setLoading(false);
    };

    const handleToggleBlock = async (num: number) => {
        if (soldNumbers.includes(num) && !blockedNumbers.includes(num)) {
            return;
        }

        // If in bulk mode, toggle the selection instead of real-time update
        if (isBulkUnblockMode && blockedNumbers.includes(num)) {
            const newSelection = unblockSelection.includes(num)
                ? unblockSelection.filter(n => n !== num)
                : [...unblockSelection, num];
            setUnblockSelection(newSelection);
            return;
        }

        const newBlocked = blockedNumbers.includes(num)
            ? blockedNumbers.filter(n => n !== num)
            : [...blockedNumbers, num];
        
        setBlockedNumbers(newBlocked);
        setSearchTerm(newBlocked.join(', '));
        
        try {
            await updateBlockedNumbers(selectedRoundId, newBlocked);
        } catch (error) {
            alert("Failed to update status");
            setBlockedNumbers(blockedNumbers);
        }
    };

    const handleRandomBlock = async (count: number) => {
        if (!selectedRound) return;
        setProcessing(true);
        
        const available = [];
        for (let i = 1; i <= selectedRound.totalTickets; i++) {
            if (!soldNumbers.includes(i) && !blockedNumbers.includes(i)) {
                available.push(i);
            }
        }

        if (available.length < count) {
            alert("Not enough available numbers");
            setProcessing(false);
            return;
        }

        const toBlock = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            toBlock.push(available.splice(randomIndex, 1)[0]);
        }

        const finalBlocked = [...blockedNumbers, ...toBlock];
        setBlockedNumbers(finalBlocked);
        
        // Only show the newly blocked numbers in the search bar, not the whole list
        setSearchTerm(toBlock.join(', '));
        
        try {
            await updateBlockedNumbers(selectedRoundId, finalBlocked);
        } catch (error) {
            alert("Bulk update failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleClearBlocks = async () => {
        const count = blockedNumbers.length;
        if (count === 0) return;
        
        if (!confirm(`Are you sure you want to clear ${count} admin-blocked numbers?`)) return;
        
        setProcessing(true);
        setSearchTerm("");
        try {
            await updateBlockedNumbers(selectedRoundId, []);
            setBlockedNumbers([]);
        } finally {
            setProcessing(false);
        }
    };

    const handleBulkUnblockConfirm = async () => {
        if (unblockSelection.length === 0) return;
        
        setProcessing(true);
        const finalBlocked = blockedNumbers.filter(n => !unblockSelection.includes(n));
        
        try {
            await updateBlockedNumbers(selectedRoundId, finalBlocked);
            setBlockedNumbers(finalBlocked);
            setIsBulkUnblockMode(false);
            setUnblockSelection([]);
            setSearchTerm("");
        } catch (error) {
            alert("Failed to confirm unblock selection");
        } finally {
            setProcessing(false);
        }
    };

    if (loading && rounds.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const filteredTotal = selectedRound ? selectedRound.totalTickets : 0;
    const renderNumbers = () => {
        const numbers = [];
        const searchTerms = searchTerm.split(',').map(s => s.trim()).filter(s => s !== "");

        for (let i = 1; i <= filteredTotal; i++) {
            // In bulk unblock mode, we only show administrative blocked numbers
            const isBlocked = blockedNumbers.includes(i);
            if (isBulkUnblockMode && !isBlocked) continue;

            if (!isBulkUnblockMode && searchTerms.length > 0 && !searchTerms.some(s => i.toString().includes(s))) continue;
            
            const isSold = soldNumbers.includes(i) && !blockedNumbers.includes(i);
            const isSelectedForUnblock = unblockSelection.includes(i);
            
            numbers.push(
                <button
                    key={i}
                    onClick={() => handleToggleBlock(i)}
                    disabled={isSold || processing}
                    className={`
                        aspect-square flex items-center justify-center text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl border transition-all relative group
                        ${isSold 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 cursor-not-allowed opacity-50' 
                            : isSelectedForUnblock
                                ? 'bg-amber-500 border-white text-white shadow-lg shadow-amber-500/40 scale-95 ring-4 ring-amber-500/20'
                                : isBlocked 
                                    ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
                        }
                        ${isCompact ? 'p-1' : 'p-3'}
                    `}
                >
                    {i}
                    {isBlocked && !isSelectedForUnblock && <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in-50"><ShieldCheck className="h-2 w-2" /></div>}
                    {isSelectedForUnblock && <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-amber-600 rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in-50"><XOctagon className="h-2 w-2" /></div>}
                </button>
            );
        }
        return numbers;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                        <Hash className="h-8 w-8 text-emerald-500" /> Lottery Control
                    </h1>
                    <p className="text-slate-500 text-sm font-bold mt-1 tracking-wide">Manage and block specific ticket numbers from the collection.</p>
                </div>
                
                <div className="relative">
                    <select
                        className="w-full md:w-[320px] bg-slate-900 border-2 border-slate-800 text-white rounded-2xl px-5 py-4 font-black appearance-none focus:border-emerald-500 transition-all outline-none pr-12 shadow-2xl"
                        value={selectedRoundId}
                        onChange={(e) => setSelectedRoundId(e.target.value)}
                    >
                        {rounds.map(r => (
                            <option key={r.id} value={r.id}>{r.carTitle}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Stats & Tools Bar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-6 lg:p-8 space-y-8 shadow-2xl">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20"><Zap className="h-6 w-6 text-emerald-500" /></div>
                        <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Supply</div><div className="text-xl font-black text-white">{selectedRound?.totalTickets || 0}</div></div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
                        <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20"><Receipt className="h-6 w-6 text-red-500" /></div>
                        <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Sold by Users</div><div className="text-xl font-black text-white">{soldNumbers.length - blockedNumbers.length}</div></div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20"><ShieldCheck className="h-6 w-6 text-indigo-500" /></div>
                        <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Blocked Admin</div><div className="text-xl font-black text-white">{blockedNumbers.length}</div></div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50"><Maximize2 className="h-6 w-6 text-slate-400" /></div>
                        <div><div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Capacity Left</div><div className="text-xl font-black text-white">{(selectedRound?.totalTickets || 0) - soldNumbers.length}</div></div>
                    </div>
                </div>

                {/* Legend & View Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-6 border-y border-slate-800/50 py-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-slate-900 border border-slate-800 rounded"></div>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-red-500/50 border border-red-500/50 rounded"></div>
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Sold</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 bg-indigo-500 rounded shadow-lg shadow-indigo-500/30"></div>
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Blocked</span>
                        </div>
                        {isBulkUnblockMode && (
                            <div className="flex items-center gap-2 animate-pulse">
                                <div className="h-3 w-3 bg-amber-500 rounded shadow-lg shadow-amber-500/30"></div>
                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">To Unblock</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsCompact(!isCompact)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                        >
                            {isCompact ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                            {isCompact ? "Standard" : "Compact"}
                        </button>
                    </div>
                </div>

                {/* Search & Bulk Actions */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    {!isBulkUnblockMode ? (
                        <>
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Find specific number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-bold"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button 
                                    disabled={processing}
                                    onClick={() => handleRandomBlock(2)}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                                >
                                    <Dices className="h-4 w-4" /> 2 Random
                                </button>
                                <button 
                                    disabled={processing}
                                    onClick={() => handleRandomBlock(4)}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                                >
                                    <Zap className="h-4 w-4" /> 4 Random
                                </button>
                                <button 
                                    disabled={processing}
                                    onClick={() => setIsBulkUnblockMode(true)}
                                    className="bg-slate-800 hover:bg-indigo-900 border border-slate-700 text-slate-200 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95"
                                >
                                    <ShieldCheck className="h-4 w-4" /> Bulk Unblock
                                </button>
                                <button 
                                    disabled={processing}
                                    onClick={handleClearBlocks}
                                    className="bg-slate-800 hover:bg-red-900 border border-slate-700 text-slate-400 hover:text-white px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95"
                                >
                                    <XOctagon className="h-4 w-4" /> Clear All
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex flex-col md:flex-row items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl animate-in slide-in-from-top-4">
                            <div className="flex items-center gap-4 mb-4 md:mb-0 px-2">
                                <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm uppercase tracking-wide">Selective Unblocking</div>
                                    <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Select numbers below to release</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={processing || unblockSelection.length === 0}
                                    onClick={handleBulkUnblockConfirm}
                                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    Confirm Unblock ({unblockSelection.length})
                                </button>
                                <button 
                                    disabled={processing}
                                    onClick={() => {
                                        setIsBulkUnblockMode(false);
                                        setUnblockSelection([]);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* The Grid */}
                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                        <span className="text-slate-600 font-black text-xs uppercase tracking-widest animate-pulse">Syncing Number Database...</span>
                    </div>
                ) : (
                    <div className={`
                        grid gap-2 sm:gap-3 
                        ${isCompact 
                            ? 'grid-cols-8 sm:grid-cols-12 lg:grid-cols-20' 
                            : 'grid-cols-5 sm:grid-cols-8 lg:grid-cols-12'
                        }
                    `}>
                        {renderNumbers()}
                    </div>
                )}

                {/* Footer Note */}
                <div className="pt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] italic">
                        Click any available number to toggle administrative block
                    </p>
                </div>
            </div>
        </div>
    );
}

// Simple Receipt icon as Lucide might not have it in the expected list
function Receipt(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5V6.5" />
    </svg>
  );
}
