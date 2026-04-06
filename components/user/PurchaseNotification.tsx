"use client";

import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/contexts/LanguageContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lotteryId: string;
    ticketPrice: number | string;
    bundlePrices?: Record<string, number>;
}

export default function PurchaseNotification({ isOpen, onClose, lotteryId, ticketPrice, bundlePrices }: Props) {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-sm transform animate-in zoom-in-95 duration-300 my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-b from-blue-400 to-blue-600 h-40 flex items-center justify-center p-6 text-center">
                    <h3 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-xl">
                        {t('good_luck')}
                    </h3>
                </div>

                <div className="p-8 text-center border-t-8 border-white -mt-4 relative z-10 rounded-t-[2.5rem] bg-white">

                    <div className="space-y-4 mb-8 text-center">
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">
                            {t('buy_more')}
                        </p>

                        {/* Pricing Details */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-black text-slate-900 uppercase">{t('one_ticket')}</span>
                                <span className="text-sm font-black text-blue-600">ETB {ticketPrice}</span>
                            </div>
                            {bundlePrices && Object.entries(bundlePrices).map(([count, price]) => (
                                <div key={count} className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                                    <span className="text-xs font-black text-slate-900 uppercase">{count} {t('tickets')}</span>
                                    <span className="text-sm font-black text-blue-600">ETB {price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-blue-600 font-black text-sm leading-relaxed italic">
                            {t('special_discount')}
                        </p>
                    </div>

                    <Link
                        href={`/lottery/${lotteryId}/buy`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-500/30 uppercase tracking-widest text-sm"
                        onClick={onClose}
                    >
                        {t('buy_now_btn')}
                    </Link>
                </div>
            </div>
        </div>,
        document.body
    );
}
