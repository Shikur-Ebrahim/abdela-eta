"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CloudinaryImage from "../ui/CloudinaryImage";
import { Info, PartyPopper, ShieldCheck, Hash, ChevronRight, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { LotteryRound } from "../../types";
import { getSalesProgress } from "../../lib/utils/lotteryUtils";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { getTelegramSettings, getSoldNumbers } from "@/lib/firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
    lottery: LotteryRound;
}

export default function CarLotteryCard({ lottery }: Props) {
    const { t } = useLanguage();
    const router = useRouter();
    const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [gridFilter, setGridFilter] = useState<'all' | 'available' | 'sold'>('all');
    const [loading, setLoading] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);
    const [telegramSettings, setTelegramSettings] = useState<{ channelLink?: string, supportUsername?: string } | null>(null);
    const [showTelegramOptions, setShowTelegramOptions] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            const [sold, settings] = await Promise.all([
                getSoldNumbers(lottery.id),
                getTelegramSettings()
            ]);
            setSoldNumbers(sold);
            if (settings) {
                setTelegramSettings({
                    channelLink: settings.channelLink,
                    supportUsername: settings.supportUsername
                });
            }
            setLoading(false);
        };
        fetchInitialData();
    }, [lottery.id]);

    const isClosed = new Date(lottery.drawDate).getTime() <= new Date().getTime() || lottery.status === 'completed';

    const handleProceed = () => {
        if (selectedNumbers.length === 0) return;
        setShowSuccess(true);
    };

    const confirmProceed = () => {
        router.push(`/lottery/${lottery.id}/buy?numbers=${selectedNumbers.join(',')}`);
    };

    const handleToggleNumber = (num: number) => {
        const maxAllowed = (lottery.maxTicketsPerPurchase || 10) * 2;
        
        if (selectedNumbers.includes(num)) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== num));
        } else {
            if (selectedNumbers.length < maxAllowed) {
                setSelectedNumbers([...selectedNumbers, num]);
            }
        }
    };

    const renderGrid = () => {
        const numbers = [];
        const total = lottery.totalTickets;
        
        for (let i = 1; i <= total; i++) {
            const isSold = soldNumbers.includes(i) || (lottery.blockedNumbers && lottery.blockedNumbers.includes(i));
            const isSelected = selectedNumbers.includes(i);
            
            // Filter Logic
            if (gridFilter === 'available' && isSold) continue;
            if (gridFilter === 'sold' && !isSold) continue;

            numbers.push(
                <button
                    key={i}
                    onClick={() => {
                        if (gridFilter === 'sold') setGridFilter('all');
                        if (!isSold) handleToggleNumber(i);
                    }}
                    disabled={(!isSold && isClosed) || (isSold && gridFilter !== 'sold')}
                    className={`
                        aspect-square flex items-center justify-center text-[11px] font-black rounded-xl border-2 transition-all duration-300 relative overflow-visible
                        ${isSold 
                            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed grayscale' 
                            : isSelected
                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_5px_15px_rgba(37,99,235,0.4)] scale-105 z-10'
                                : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-700 shadow-sm'
                        }
                    `}
                >
                    {i}
                    {isSold && (
                        <div className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white rounded-full p-0.5 shadow-sm">
                            <ShieldCheck className="h-2 w-2" />
                        </div>
                    )}
                    {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-400 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in">
                            <PartyPopper className="h-2 w-2" />
                        </div>
                    )}
                </button>
            );
        }
        return numbers;
    };

    return (
        <div className="bg-white rounded-b-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col" style={{ height: 'calc(100svh - 160px)', minHeight: '520px' }}>
            {/* Image Section */}
            <div className="relative h-36 sm:h-48 md:h-56 w-full overflow-hidden bg-slate-100 shrink-0">
                {lottery.imageId ? (
                    lottery.mediaType === 'video' ? (
                        <div className="relative w-full h-full">
                            <video
                                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/${lottery.imageId}.mp4`}
                                autoPlay
                                muted
                                loop
                                playsInline
                                onTimeUpdate={(e) => {
                                    const video = e.currentTarget;
                                    setVideoProgress((video.currentTime / video.duration) * 100);
                                }}
                                className={`w-full h-full object-cover ${isClosed ? 'grayscale brightness-50' : ''}`}
                            />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900/10 z-10">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-300 ease-linear"
                                    style={{ width: `${videoProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <CloudinaryImage
                            src={lottery.imageId}
                            alt={lottery.carTitle}
                            fill
                            className={`object-cover ${isClosed ? 'grayscale brightness-50' : ''}`}
                            priority
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 italic text-slate-400">No media</div>
                )}

                {isClosed && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none overflow-hidden">
                        <div className="bg-slate-900/90 text-white py-2 w-[150%] transform -rotate-25 border-y-2 border-slate-700 flex items-center justify-center">
                            <span className="text-2xl font-black tracking-widest uppercase">{t('closed')}</span>
                        </div>
                    </div>
                )}

                <div className="absolute top-0 right-0 z-30">
                    <div className="bg-slate-950 text-white p-3 shadow-2xl flex flex-col items-center justify-center min-w-[100px] border-b border-l border-slate-800">
                        <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 leading-none mb-1">{t('ticket_price_label')}</span>
                        <span className="text-lg font-black leading-none text-emerald-400">ETB {Number(lottery.ticketPrice).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 relative">
                <div className="px-4 py-3 flex flex-col gap-3 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-blue-600" />
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('select_number')}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {selectedNumbers.length > 0 && (
                                <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{t('selected_numbers')}:</span>
                                    <span className="bg-blue-600 text-white h-5 px-2 flex items-center justify-center rounded text-[11px] font-black">
                                        {selectedNumbers.length} / {(lottery.maxTicketsPerPurchase || 10) * 2}
                                    </span>
                                </div>
                            )}

                            {/* Conditional "Cards" button appears to the left of "Sold" */}
                            {gridFilter === 'sold' && (
                                <button
                                    onClick={() => setGridFilter('all')}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 bg-white text-slate-900 shadow-sm animate-in slide-in-from-right-2"
                                >
                                    {t('cards')}
                                </button>
                            )}

                            {/* Unified Sold Toggle - Right Aligned */}
                            <button
                                onClick={() => setGridFilter(gridFilter === 'sold' ? 'all' : 'sold')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${gridFilter === 'sold' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'}`}
                            >
                                {t('sold')}
                            </button>
                        </div>
                    </div>

                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('loading_grid')}</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pb-40">
                            {renderGrid()}
                        </div>
                    </div>
                )}

                {/* Footer Proceed Action */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20">
                    <button
                        onClick={handleProceed}
                        disabled={isClosed || selectedNumbers.length < 2 || selectedNumbers.length % 2 !== 0}
                        className={`
                            w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 active:scale-95
                            ${(selectedNumbers.length < 2 || selectedNumbers.length % 2 !== 0) 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700'
                            }
                        `}
                    >
                        {selectedNumbers.length >= 2 && selectedNumbers.length % 2 === 0 ? (
                            <>
                                {t('proceed_checkout')} ({selectedNumbers.length}) <ChevronRight className="h-5 w-5" />
                            </>
                        ) : selectedNumbers.length > 0 && selectedNumbers.length % 2 !== 0 ? (
                            "Select Even Numbers (2, 4, 6...)"
                        ) : selectedNumbers.length >= (lottery.maxTicketsPerPurchase || 10) * 2 ? (
                            "Maximum Reached"
                        ) : (
                            t('buy_ticket_btn')
                        )}
                    </button>

                    {/* Footer Utility Row */}
                    <div className="mt-4 flex items-center justify-between gap-3 relative">
                        {/* Info Button - Left Aligned */}
                        <Link
                            href={`/lottery/${lottery.id}`}
                            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
                        >
                            <Info className="h-3.5 w-3.5" />
                            {t('info_btn')}
                        </Link>

                        {/* Sales Progress Bar - Center (time-interpolated) */}
                        {(() => {
                            const now = Date.now();
                            const start = new Date(lottery.startDate).getTime();
                            const end = new Date(lottery.drawDate).getTime();
                            const elapsed = Math.max(0, now - start);
                            const duration = Math.max(1, end - start);
                            const timeRatio = Math.min(1, elapsed / duration);
                            const initial = lottery.initialSoldPercent ?? 0;
                            const target = lottery.targetSalesPercent ?? 100;
                            const pct = Math.min(100, Math.round(initial + (target - initial) * timeRatio));
                            return (
                                <div className="flex-1 flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('sales_progress')}</span>
                                        <span className="text-[9px] font-black text-blue-600">{pct}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Telegram Button - Right Aligned */}
                        {telegramSettings && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowTelegramOptions(!showTelegramOptions)}
                                    className="hover:scale-110 transition-transform active:scale-95 flex items-center justify-center"
                                >
                                    <Image src="/telegram logo.png" alt="Telegram" width={32} height={32} className="drop-shadow-md" />
                                </button>

                                {showTelegramOptions && (
                                    <div className="absolute right-0 bottom-full mb-3 w-48 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-[60]">
                                        <a
                                            href={telegramSettings.channelLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setShowTelegramOptions(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                                        >
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('join_community')}</span>
                                        </a>
                                        <a
                                            href={`https://t.me/${telegramSettings.supportUsername}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setShowTelegramOptions(false)}
                                            className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('contact_abdela')}</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Success/Good Luck Modal Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 relative">
                                <PartyPopper className="h-10 w-10 text-blue-600" />
                                <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-emerald-500 animate-pulse" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2">
                                {t('good_luck')}
                            </h3>
                            
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">
                                {t('pick_to_buy')}
                            </p>

                            <div className="flex flex-wrap justify-center gap-3 mb-10">
                                {selectedNumbers.map((num) => (
                                    <div 
                                        key={num} 
                                        className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg shadow-blue-500/30 animate-in bounce-in"
                                    >
                                        {num}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={confirmProceed}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                {t('ok_btn')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
