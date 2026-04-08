"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Ticket, ChevronRight, Phone, Calendar, MapPin, CheckCircle, Clock, AlertCircle, ArrowLeft, Home, ShoppingCart } from "lucide-react";
import { getPurchasesByPhone } from "../../../lib/firebase/firestore";
import { PurchaseOrder } from "../../../types";
import Link from "next/link";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import LanguageToggle from "../../../components/user/LanguageToggle";

export default function CheckLotteryPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [purchases, setPurchases] = useState<PurchaseOrder[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 9) return;

        setLoading(true);
        try {
            const data = await getPurchasesByPhone(phoneNumber);
            setPurchases(data);
            setHasSearched(true);
        } catch (error) {
            console.error("Error searching purchases:", error);
            alert("An error occurred while searching. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'pending': return <Clock className="h-5 w-5 text-orange-500" />;
            default: return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return t('accepted');
            case 'pending': return t('pending_review');
            case 'rejected': return t('rejected');
            default: return status;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            default: return 'bg-red-500/10 text-red-600 border-red-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="h-10 w-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-600 active:scale-95 border border-slate-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('check_your_lottery')}</h1>
                    </div>
                    <LanguageToggle />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-6 pb-12">


                {/* Search Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 p-1 mb-10 overflow-hidden group">
                    <form onSubmit={handleSearch} className="p-5 sm:p-8 space-y-5">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={t('phone_placeholder')}
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.8rem] text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-xl shadow-inner"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-slate-950/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-xl tracking-wide group"
                        >
                            {loading ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : (
                                <>
                                    <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Search className="h-4 w-4" />
                                    </div>
                                    {t('check_status_btn')}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {hasSearched && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {purchases && purchases.length > 0 ? (
                            <>
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {purchases.length} {t('records_found')}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {purchases.map((purchase) => (
                                        <div key={purchase.id} className="bg-white rounded-[2.2rem] border border-slate-200 p-1 flex flex-col sm:flex-row hover:border-orange-200 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden min-h-[180px]">
                                            {/* Left: Info Section */}
                                            <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between relative z-10">
                                                {/* Top Section: Name & Date */}
                                                <div className="flex flex-col gap-1 mb-4 pr-16">
                                                    <h4 className="text-xl font-black text-slate-900 leading-tight capitalize">{purchase.fullName.toLowerCase()}</h4>
                                                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(purchase.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                {/* Middle Section: Numbers */}
                                                <div className="flex flex-col gap-2 mb-4">
                                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t('selected_numbers')}</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {purchase.selectedNumbers.map((num, i) => (
                                                            <span key={i} className="h-8 w-8 flex items-center justify-center bg-slate-950 text-white rounded-lg text-xs font-black shadow-md shadow-slate-950/20 border border-white/10 ring-1 ring-slate-100">
                                                                {num}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Status Badge (Overlay on left info for mobile, but better here) */}
                                                <div className="absolute top-5 right-5 sm:relative sm:top-0 sm:right-0 sm:mt-auto sm:mb-4">
                                                   <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(purchase.status)} items-center gap-1.5 shadow-sm`}>
                                                        {getStatusIcon(purchase.status)}
                                                        {getStatusText(purchase.status)}
                                                    </div>
                                                </div>

                                                {/* Bottom Section: Price */}
                                                <div className="mt-2 sm:mt-0">
                                                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('total_price')}</div>
                                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                                        <span className="text-xs font-bold text-slate-400 mr-1">ETB</span>
                                                        {purchase.totalPrice.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Sinotruk Image Section */}
                                            <div className="w-full sm:w-[220px] bg-slate-50 relative overflow-hidden border-t sm:border-t-0 sm:border-l border-slate-100 group-hover:bg-orange-50/30 transition-colors">
                                                <img 
                                                    src="/sinotruk.png" 
                                                    alt="Sinotruk" 
                                                    className="h-full w-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Attractive Not Found Card */
                            <div className="bg-white rounded-[3rem] border border-slate-200 p-8 sm:p-12 text-center shadow-2xl shadow-slate-200/60 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
                                
                                <div className="relative z-10">
                                    <div className="mb-8 transform hover:scale-105 transition-transform duration-700">
                                        <div className="relative inline-block">
                                            <img 
                                                src="/sinotruk.png" 
                                                alt="No Ticket" 
                                                className="h-48 sm:h-64 w-auto mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-6 border border-red-100">
                                        <AlertCircle className="h-4 w-4" />
                                        {t('no_records_found')}
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                        {t('no_ticket_message')}
                                    </h3>
                                    
                                    <p className="text-slate-500 text-sm sm:text-base font-medium mb-10 max-w-sm mx-auto">
                                        {t('no_results_desc')}
                                    </p>

                                    <button
                                        onClick={() => router.push("/")}
                                        className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-10 rounded-[1.8rem] shadow-xl shadow-orange-500/30 active:scale-95 transition-all text-xl group"
                                    >
                                        <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                        {t('ok_btn')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
