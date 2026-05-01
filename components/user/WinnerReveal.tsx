"use client";

import { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, PartyPopper, Loader2 } from 'lucide-react';
import CloudinaryImage from '../ui/CloudinaryImage';
import Image from 'next/image';

interface Props {
    winnerNumber: number;
    duration?: number; // seconds
    imageId?: string;
    carTitle?: string;
    telegramUsername?: string;
}

export default function WinnerReveal({ winnerNumber, duration = 30, imageId, carTitle, telegramUsername }: Props) {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [isRevealing, setIsRevealing] = useState(true);
    const [progress, setProgress] = useState(0);
    const revealTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const update = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const total = duration * 1000;
            const currentProgress = Math.min(elapsed / total, 1);
            
            setProgress(currentProgress);

            if (now >= endTime) {
                setCurrentNumber(winnerNumber);
                setIsRevealing(false);
                return;
            }

            const delay = 50 + (Math.pow(currentProgress, 2) * 400); 
            setCurrentNumber(Math.floor(Math.random() * 1000));
            revealTimeout.current = setTimeout(update, delay);
        };

        update();

        return () => {
            if (revealTimeout.current) clearTimeout(revealTimeout.current);
        };
    }, [winnerNumber, duration]);

    return (
        <div className="relative w-full overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-400 p-0.5 sm:p-1 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] mb-6 sm:mb-8 animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative bg-white rounded-[2.4rem] sm:rounded-[2.8rem] overflow-hidden p-5 sm:p-12">
                {/* Advanced Background Decor */}
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-100/40 rounded-full blur-[60px] sm:blur-[100px] opacity-70" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-teal-100/40 rounded-full blur-[60px] sm:blur-[100px] opacity-70" />

                <div className="relative flex flex-col items-center text-center space-y-4 sm:space-y-6">
                    {/* Car Image at Top - Full visibility */}
                    <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 sm:border-4 border-white shadow-lg sm:shadow-xl animate-in slide-in-from-top-12 duration-1000">
                        <div className="relative w-full aspect-[16/10] sm:aspect-video">
                            {imageId ? (
                                <CloudinaryImage
                                    src={imageId}
                                    alt={carTitle || "Winner Car"}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <Image
                                    src="/sinotruk.jpg"
                                    alt="Winner Car"
                                    fill
                                    className="object-contain p-2 sm:p-4"
                                />
                            )}
                        </div>
                        {/* Subtle overlay only at the very bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-tight border border-emerald-100 shadow-sm mt-2">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                        {isRevealing ? "Official draw in progress" : "Draw completed successfully"}
                    </div>

                    <h2 className="text-2xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-2xl px-2">
                        {isRevealing ? "Picking our next lucky winner..." : "We have a winner!"}
                    </h2>

                    <div className="relative py-8 sm:py-12 px-10 sm:px-32 bg-slate-50/50 backdrop-blur-sm rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden min-w-[240px] sm:min-w-[300px]">
                        {/* Progress Bar Background */}
                        <div 
                            className="absolute bottom-0 left-0 h-1.5 sm:h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-300 ease-out" 
                            style={{ width: `${progress * 100}%` }} 
                        />
                        
                        <div className={`text-6xl sm:text-[10rem] font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-950 to-slate-700 transition-all duration-700 ${!isRevealing ? 'scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]' : ''}`}>
                            {currentNumber.toString().padStart(2, '0')}
                        </div>

                        {isRevealing && (
                            <div className="absolute top-3 right-4 sm:top-4 sm:right-6">
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 animate-spin" />
                            </div>
                        )}
                    </div>

                    {!isRevealing ? (
                        <div className="animate-in fade-in slide-in-from-top-8 duration-1000 flex flex-col items-center space-y-6 sm:space-y-10 w-full">
                            {carTitle && (
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-emerald-500 font-black uppercase text-[9px] sm:text-xs tracking-widest">Grand Prize</p>
                                    <h4 className="text-xl sm:text-4xl font-black text-slate-900">{carTitle}</h4>
                                </div>
                            )}

                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="h-14 w-14 sm:h-24 sm:w-24 bg-emerald-100 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-lg sm:shadow-2xl shadow-emerald-200/50 rotate-12 border-2 sm:border-4 border-white">
                                    <Trophy className="h-7 w-7 sm:h-12 sm:w-12 text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-slate-400 font-bold text-[9px] sm:text-xs tracking-widest mb-0.5 uppercase">Winning ticket</p>
                                    <h3 className="text-3xl sm:text-6xl font-black text-slate-900 leading-none">#{winnerNumber}</h3>
                                </div>
                                <div className="h-14 w-14 sm:h-24 sm:w-24 bg-teal-100 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-lg sm:shadow-2xl shadow-teal-200/50 -rotate-12 border-2 sm:border-4 border-white">
                                    <PartyPopper className="h-7 w-7 sm:h-12 sm:w-12 text-teal-600" />
                                </div>
                            </div>
                            
                            <div className="space-y-2 sm:space-y-3 px-4">
                                <p className="text-slate-600 text-sm sm:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                                    The lucky ticket has been drawn! If this is your number, please contact our support team immediately to claim your car.
                                </p>
                            </div>

                            <a 
                                href={telegramUsername ? `https://t.me/${telegramUsername}` : "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group relative bg-slate-950 text-white px-7 py-3.5 sm:px-10 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] font-bold text-[11px] sm:text-sm tracking-tight transition-all hover:scale-105 active:scale-95 shadow-xl sm:shadow-2xl shadow-slate-950/20 overflow-hidden text-center"
                            >
                                <span className="relative z-10">Contact Abdela</span>
                                <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            <p className="text-slate-400 font-bold text-[10px] sm:text-sm tracking-tight animate-pulse">
                                Analyzing {Math.floor(progress * 10000)} possible combinations...
                            </p>
                            <div className="flex gap-1.5 sm:gap-2 justify-center">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
