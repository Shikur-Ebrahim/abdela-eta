"use client";

import { Ticket } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import CarLotteryCard from "../../components/user/CarLotteryCard";
import CloudinaryImage from "../../components/ui/CloudinaryImage";
import CopyableText from "../../components/user/CopyableText";
import AnimatedPaymentBar from "../../components/user/AnimatedPaymentBar";
import { LotteryRound, PaymentMethod } from "../../types";

interface Props {
    lotteries: LotteryRound[];
    paymentMethods: PaymentMethod[];
}

export default function UserHome({ lotteries, paymentMethods }: Props) {
    const { t } = useLanguage();

    const cbe = paymentMethods.find(m => m.id === 'cbe' && m.isActive);
    const telebirr = paymentMethods.find(m => m.id === 'telebirr' && m.isActive);

    return (
        <main className="mx-auto max-w-7xl px-1 sm:px-4 pt-0 pb-8 md:px-8 lg:px-12">
            {/* Animated Payment Info Bar */}
            <AnimatedPaymentBar>
                <section className="mb-2 bg-white border-y sm:border border-slate-200 shadow-sm overflow-hidden mx-[-0.25rem] sm:mx-0">
                    <div className="grid grid-cols-2 divide-x divide-slate-100">
                        {/* CBE (Left) */}
                        {cbe && (
                            <div className="p-4 sm:p-8 flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-3 sm:gap-6">
                                    <div className="h-12 w-12 sm:h-20 sm:w-20 relative flex-shrink-0 bg-slate-50 border border-slate-100 p-1">
                                        {cbe.logoId ? (
                                            <CloudinaryImage
                                                src={cbe.logoId}
                                                alt="CBE Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300">Cbe</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight mb-1">{cbe.accountHolderName}</p>
                                        <CopyableText text={cbe.accountNumber} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* telebirr (Right) */}
                        {telebirr && (
                            <div className="p-4 sm:p-8 flex flex-col gap-3 h-full">
                                <div className="flex items-center gap-3 sm:gap-6">
                                    <div className="h-12 w-12 sm:h-20 sm:w-20 relative flex-shrink-0 bg-slate-50 border border-slate-100 p-1">
                                        {telebirr.logoId ? (
                                            <CloudinaryImage
                                                src={telebirr.logoId}
                                                alt="telebirr Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 leading-none text-center">telebirr</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight mb-1">{telebirr.accountHolderName}</p>
                                        <CopyableText text={telebirr.accountNumber} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </AnimatedPaymentBar>

            {/* Lottery Grid */}
            <section className="mb-20">
                {lotteries.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {lotteries.map((lottery) => (
                            <CarLotteryCard key={lottery.id} lottery={lottery} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">{t('no_active_lotteries')}</h3>
                        <p className="text-slate-300">{t('check_back_later')}</p>
                    </div>
                )}
            </section>
        </main>
    );
}
