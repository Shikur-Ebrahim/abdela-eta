"use client";

import { useState } from "react";
import { Search, Loader2, Ticket, ChevronRight, Phone, Calendar, MapPin, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { getPurchasesByPhone } from "../../../lib/firebase/firestore";
import { PurchaseOrder } from "../../../types";
import Link from "next/link";
import { useLanguage } from "../../../lib/contexts/LanguageContext";
import LanguageToggle from "../../../components/user/LanguageToggle";

export default function CheckLotteryPage() {
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
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-xl font-black text-slate-900">{t('check_your_lottery')}</h1>
                    </div>
                    <LanguageToggle />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Search Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 mb-8 transition-all">
                    <div className="mb-8 text-center">
                        <div className="h-16 w-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                            <Search className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">{t('track_your_tickets')}</h2>
                        <p className="text-slate-500 text-sm font-medium">{t('enter_phone')}</p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={t('phone_placeholder')}
                                className="w-full pl-12 pr-4 py-4 sm:py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-lg"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 sm:py-5 rounded-[1.5rem] shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg tracking-wide"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <>
                                    <Search className="h-6 w-6" />
                                    {t('check_status_btn')}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {hasSearched && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-slate-400">
                                {purchases && purchases.length > 0 ? `${purchases.length} ${t('records_found')}` : t('no_records_found')}
                            </h3>
                        </div>

                        {purchases && purchases.length > 0 ? (
                            <div className="space-y-4">
                                {purchases.map((purchase) => (
                                    <div key={purchase.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                                    <Ticket className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-400 mb-0.5">{t('ticket_purchase')}</div>
                                                    <h4 className="text-lg font-black text-slate-900">{purchase.fullName}</h4>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold border ${getStatusStyle(purchase.status)} flex items-center gap-2`}>
                                                {getStatusIcon(purchase.status)}
                                                {getStatusText(purchase.status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                    <MapPin className="h-3 w-3" /> {t('location')}
                                                </div>
                                                <div className="text-sm font-bold text-slate-700 capitalize">{purchase.city}, {purchase.region}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                    <Calendar className="h-3 w-3" /> {t('date')}
                                                </div>
                                                <div className="text-sm font-bold text-slate-700">
                                                    {new Date(purchase.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[11px] font-bold text-slate-400">{t('selected_numbers')}</div>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {purchase.selectedNumbers.map((num, i) => (
                                                        <span key={i} className="h-8 w-8 flex items-center justify-center bg-slate-900 text-white border border-slate-800 rounded-lg text-xs font-black shadow-sm">
                                                            {num}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[11px] font-bold text-slate-400">{t('total_price')}</div>
                                                <div className="text-xl font-black text-slate-900 leading-none mt-1">
                                                    ETB {purchase.totalPrice.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="h-12 w-12 text-slate-200" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">{t('no_results_title')}</h3>
                                <p className="text-slate-500 text-sm font-medium">{t('no_results_desc')}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
