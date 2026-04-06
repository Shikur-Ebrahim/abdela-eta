"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CloudinaryImage from "../ui/CloudinaryImage";
import { Info, PartyPopper } from "lucide-react";
import { LotteryRound } from "../../types";
import { getSalesProgress } from "../../lib/utils/lotteryUtils";
import PurchaseAction from "./PurchaseAction";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { getTelegramSettings } from "@/lib/firebase/firestore";
import Image from "next/image";

interface Props {
    lottery: LotteryRound;
}

export default function CarLotteryCard({ lottery }: Props) {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft ] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [videoProgress, setVideoProgress] = useState(0);
    const [telegramSettings, setTelegramSettings] = useState<{ channelLink?: string, supportUsername?: string } | null>(null);
    const [showTelegramOptions, setShowTelegramOptions] = useState(false);

    useEffect(() => {
        const fetchTelegram = async () => {
            const settings = await getTelegramSettings();
            if (settings) {
                setTelegramSettings({
                    channelLink: settings.channelLink,
                    supportUsername: settings.supportUsername
                });
            }
        };
        fetchTelegram();
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(lottery.drawDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [lottery.drawDate]);

    const progress = getSalesProgress(lottery);
    const isClosed = new Date(lottery.drawDate).getTime() <= new Date().getTime() || lottery.status === 'completed';

    return (
        <div className="bg-white rounded-none overflow-hidden shadow-lg border border-slate-200 flex flex-col group transition-all hover:shadow-2xl">
            {/* Image Section */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
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
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isClosed ? 'grayscale brightness-50' : ''}`}
                            />
                            {/* Video Tracking Bar - Bottom Horizontal */}
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-900/30 z-10">
                                <div
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-linear"
                                    style={{ width: `${videoProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <CloudinaryImage
                            src={lottery.imageId}
                            alt={lottery.carTitle}
                            fill
                            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isClosed ? 'grayscale brightness-50' : ''}`}
                            priority
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 italic text-slate-400">
                        No media available
                    </div>
                )}

                {/* Diagonal CLOSED Banner */}
                {isClosed && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none overflow-hidden">
                        <div className="bg-slate-900/90 text-white py-4 w-[150%] transform -rotate-25 shadow-2xl border-y-2 border-slate-700 flex items-center justify-center">
                            <span className="text-4xl sm:text-6xl font-black tracking-[0.2em] drop-shadow-2xl">
                                {t('closed')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Ticket Price Ribbon - Sharp box style */}
                <div className="absolute top-0 right-0 z-30">
                    <div className="bg-emerald-600 text-white p-4 shadow-2xl flex flex-col items-center justify-center min-w-[130px] border-b-2 border-l-2 border-emerald-800">
                        <span className="text-[10px] font-black tracking-widest leading-none mb-1 text-emerald-100/80">{t('ticket_price_label')}</span>
                        <span className="text-2xl font-black leading-none drop-shadow-sm">ETB {Number(lottery.ticketPrice).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1 text-center items-center relative">
                {/* Telegram Floating Logo & Options */}
                {telegramSettings && (
                    <div className="absolute right-4 sm:right-6 top-[35px] sm:top-[45px] z-50">
                        <button 
                            onClick={() => setShowTelegramOptions(!showTelegramOptions)}
                            className="hover:scale-110 transition-transform active:scale-95 focus:outline-none"
                        >
                            <Image 
                                src="/telegram logo.png" 
                                alt="Telegram" 
                                width={45} 
                                height={45}
                                className="drop-shadow-lg sm:w-[50px] sm:h-[50px]"
                            />
                        </button>

                        {/* Dropdown Options */}
                        {showTelegramOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                <a 
                                    href={telegramSettings.channelLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setShowTelegramOptions(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('join_community')}</span>
                                </a>
                                <a 
                                    href={`https://t.me/${telegramSettings.supportUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setShowTelegramOptions(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                                >
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('contact_abdela')}</span>
                                </a>
                            </div>
                        )}
                        
                        {/* Invisible Backdrop to close on click outside */}
                        {showTelegramOptions && (
                            <div 
                                className="fixed inset-0 z-[-1]" 
                                onClick={() => setShowTelegramOptions(false)}
                            />
                        )}
                    </div>
                )}
                <div className="mb-4">
                    <div className="text-blue-600 font-black text-3xl sm:text-4xl mb-1">
                        ETB {lottery.carValue.toLocaleString()}
                    </div>
                    <h3 className="text-slate-900 font-black text-xl sm:text-2xl leading-tight tracking-tight">
                        {lottery.carTitle}
                    </h3>
                    <p className="text-slate-500 text-xs font-bold mt-2 tracking-widest bg-slate-100 px-4 py-1.5 inline-block border border-slate-200">
                        {t('total_tickets')}: {lottery.totalTickets.toLocaleString()}
                    </p>
                    {lottery.gameNumber && (
                        <div className="mt-2 flex flex-col items-center">
                            <span className="text-blue-500 text-xs font-black tracking-tighter">{t('game_label')}: {lottery.gameNumber}</span>
                            <div className="w-8 h-1 bg-red-500 mt-0.5 shadow-sm"></div>
                        </div>
                    )}
                </div>

                {/* Countdown Timer - Sharp layout */}
                <div className="grid grid-cols-4 gap-4 sm:gap-8 py-6 border-y border-slate-100 w-full mt-2">
                    {[
                        { label: t('days'), value: timeLeft.days },
                        { label: t('hrs'), value: timeLeft.hours },
                        { label: t('min'), value: timeLeft.minutes },
                        { label: t('sec'), value: timeLeft.seconds },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-2xl sm:text-4xl font-black text-slate-900 tabular-nums leading-none">
                                {item.value.toString().padStart(2, '0')}
                            </span>
                            <span className="text-[11px] font-black text-slate-400 tracking-tighter mt-1">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Progress Bar - Sharp */}
                <div className="w-full py-6">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[12px] font-black text-slate-900 tracking-wider">{t('sales_progress')}</span>
                        <span className="text-[12px] font-black text-white bg-blue-600 px-2 py-0.5">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-200 shadow-inner">
                        <div
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Actions - Sharp buttons */}
                <div className="grid grid-cols-5 gap-0 w-full mt-auto border-t border-slate-200">
                    <Link
                        href={`/lottery/${lottery.id}`}
                        className="col-span-2 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-200 text-slate-900 font-black py-6 transition-colors text-xs tracking-widest border-r border-slate-200"
                    >
                        <Info className="h-5 w-5" /> {t('info_btn')}
                    </Link>
                    <PurchaseAction
                        isClosed={isClosed}
                        buttonText={t('buy_ticket_btn')}
                        lotteryId={lottery.id}
                        ticketPrice={lottery.ticketPrice}
                        bundlePrices={lottery.bundlePrices}
                        className="col-span-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-6 transition-all active:scale-[0.98] text-xs tracking-[0.15em]"
                    />
                </div>
            </div>
        </div>
    );
}
