"use client";

import { LotteryRound } from "../../types";
import CloudinaryImage from "../ui/CloudinaryImage";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface Props {
    lotteries: LotteryRound[];
}

export default function ClosedLotteryMarquee({ lotteries }: Props) {
    const { t } = useLanguage();
    if (!lotteries || lotteries.length === 0) return null;

    // Duplicate list to ensure seamless infinite scroll
    const scrollingLotteries = [...lotteries, ...lotteries, ...lotteries];

    return (
        <div className="w-full bg-slate-900 py-12 overflow-hidden border-t border-slate-800">
            <div className="mx-auto max-w-7xl px-4 mb-8">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                    {t('recently_closed')}
                </h3>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="py-2 animate-marquee whitespace-nowrap flex gap-4 sm:gap-6">
                    {scrollingLotteries.map((lottery, idx) => (
                        <div
                            key={`${lottery.id}-${idx}`}
                            className="relative h-48 w-72 sm:h-64 sm:w-96 flex-shrink-0 group overflow-hidden border border-slate-800 bg-slate-800/50 transition-all hover:border-orange-500/50"
                        >
                            {lottery.imageId ? (
                                <>
                                    <CloudinaryImage
                                        src={lottery.imageId}
                                        alt={lottery.carTitle}
                                        fill
                                        className="object-cover grayscale brightness-50 transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:brightness-75"
                                    />
                                    {/* Closed Banner */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                        <div className="bg-slate-900/80 text-white py-2 px-8 transform -rotate-12 border-y border-slate-700 shadow-xl">
                                            <span className="text-xl sm:text-2xl font-black tracking-[0.1em]">{t('closed')}</span>
                                        </div>
                                    </div>
                                    {/* Text Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{t('round_results')}</p>
                                        <h4 className="text-white font-bold text-sm sm:text-base leading-tight truncate">{lottery.carTitle}</h4>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center italic text-slate-700">No Image</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
