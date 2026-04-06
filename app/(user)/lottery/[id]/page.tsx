"use client";

import { Car, Ticket, Send, User, MessageCircle, ArrowLeft, Trophy, Calendar, CheckCircle2, Info, ShoppingCart, Phone, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getLotteryRound, getTelegramSettings } from "../../../../lib/firebase/firestore";
import CloudinaryImage from "../../../../components/ui/CloudinaryImage";
import CopyablePhone from "../../../../components/user/CopyablePhone";
import { notFound, useParams } from "next/navigation";
import PurchaseAction from "../../../../components/user/PurchaseAction";
import { useEffect, useState } from "react";
import { LotteryRound, TelegramSettings } from "../../../../types";
import { useLanguage } from "../../../../lib/contexts/LanguageContext";
import UserHeader from "../../../../components/user/UserHeader";

export default function LotteryDetailsPage() {
    const { id } = useParams() as { id: string };
    const { t } = useLanguage();
    const [lottery, setLottery] = useState<LotteryRound | null>(null);
    const [telegram, setTelegram] = useState<TelegramSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const lData = await getLotteryRound(id);
            const tData = await getTelegramSettings();
            setLottery(lData);
            setTelegram(tData);
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!lottery) {
        notFound();
    }

    const isClosed = new Date(lottery.drawDate).getTime() <= Date.now() || lottery.status === 'completed';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
            <UserHeader />

            <main className="mx-auto max-w-7xl px-4 pt-8 md:px-8 lg:px-12">
                <div className="mb-6">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold text-sm group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        {t('back_to_home')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Media Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-200">
                            {lottery.imageId ? (
                                lottery.mediaType === 'video' ? (
                                    <video
                                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/${lottery.imageId}.mp4`}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className={`w-full h-full object-cover ${isClosed ? 'grayscale brightness-50' : ''}`}
                                    />
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
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 italic text-slate-400">
                                    No preview available
                                </div>
                            )}

                            {isClosed && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
                                    <div className="bg-white text-slate-900 px-8 py-4 rounded-2xl shadow-2xl border border-slate-100">
                                        <span className="text-3xl font-black uppercase tracking-tight">{t('round_closed')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col">

                        {/* Unified Ticket Packages Card */}
                        <div className="mb-10">
                            <div className="mb-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Ticket className="h-4 w-4 text-blue-500" /> {t('choose_your_tickets')}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed pr-8">
                                    {t('buy_more')}
                                </p>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="divide-y divide-slate-100">
                                    {/* Standard Option (1 Ticket) */}
                                    <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-slate-900">{t('one_ticket')}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('entry_level')}</span>
                                        </div>
                                        <div className="text-xl font-black text-blue-600">
                                            ETB {Number(lottery.ticketPrice).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Bundle Options */}
                                    {lottery.bundlePrices && Object.entries(lottery.bundlePrices).map(([count, price]) => (
                                        <div key={count} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors bg-blue-50/20">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-slate-900">{count} {t('tickets')}</span>
                                                    <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">{t('best_value')}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('savings_included')}</span>
                                            </div>
                                            <div className="text-xl font-black text-blue-600">
                                                ETB {price.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Telegram & Contact Info */}
                        <div className="mt-auto space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-blue-500" /> {t('for_more_info')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {telegram?.channelLink && (
                                    <a
                                        href={telegram.channelLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white border border-blue-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-blue-50/50"
                                    >
                                        <div className="h-10 w-10 bg-[#0088cc] rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <Send className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('channel')}</div>
                                            <div className="text-xs font-bold text-slate-900">{t('join_community')}</div>
                                        </div>
                                    </a>
                                )}
                                {telegram?.supportUsername && (
                                    <a
                                        href={`https://t.me/${telegram.supportUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-emerald-50/50"
                                    >
                                        <div className="h-10 w-10 bg-[#24A1DE] rounded-xl flex items-center justify-center text-white shadow-lg">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t('support')}</div>
                                            <div className="text-xs font-bold text-slate-900">{t('chat_with_us')}</div>
                                        </div>
                                    </a>
                                )}
                                {telegram?.supportPhone && (
                                    <a
                                        href={`tel:${telegram.supportPhone}`}
                                        className="bg-white border border-blue-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-blue-50/50 group"
                                    >
                                        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-700 transition-colors">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Phone Call</div>
                                            <div className="text-xs font-bold text-slate-900">{telegram.supportPhone}</div>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Action CTA - Desktop Only */}
                        <div className="mt-10 hidden md:block">
                            <PurchaseAction
                                isClosed={isClosed}
                                buttonText={t('ready_to_win')}
                                lotteryId={lottery.id}
                                ticketPrice={lottery.ticketPrice}
                                bundlePrices={lottery.bundlePrices}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black py-6 rounded-3xl transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 group text-lg tracking-[0.1em]"
                                showIcon={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky CTA */}
                {!isClosed && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden bg-white/80 backdrop-blur-lg border-t border-slate-100">
                        <PurchaseAction
                            isClosed={isClosed}
                            buttonText={t('buy_ticket_btn')}
                            lotteryId={lottery.id}
                            ticketPrice={lottery.ticketPrice}
                            bundlePrices={lottery.bundlePrices}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
                            showIcon={true}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
