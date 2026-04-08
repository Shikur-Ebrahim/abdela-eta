"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle, Lock } from "lucide-react";
import { getBusinessLicense } from "../../lib/firebase/firestore";
import { useLanguage } from "../../lib/contexts/LanguageContext";

export default function BusinessLicenseModal() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [license, setLicense] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        const handleFocus = () => setIsBlurred(false);
        const handleBlur = () => setIsBlurred(true);
        const handleVisibilityChange = () => {
            if (document.hidden) setIsBlurred(true);
            else setIsBlurred(false);
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const checkLicense = async () => {
            try {
                const settings = await getBusinessLicense();
                if (settings && settings.active && settings.imageUrl) {
                    const localViews = Number(localStorage.getItem("license_view_count") || "0");
                    if (localViews < settings.maxViews) {
                        setLicense(settings);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Error checking license modal:", error);
            } finally {
                setLoading(false);
            }
        };

        checkLicense();

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleDismiss = () => {
        const currentViews = Number(localStorage.getItem("license_view_count") || "0");
        localStorage.setItem("license_view_count", (currentViews + 1).toString());
        setIsVisible(false);
    };

    if (!isVisible || !license) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto pt-10 pb-10"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Anti-screenshot/copy background pattern */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden z-0">
                <div className="flex flex-wrap gap-10 rotate-12 scale-150">
                    {Array.from({ length: 150 }).map((_, i) => (
                        <div key={i} className="text-white font-black text-xl whitespace-nowrap">ABDELA CAR LOTTERY • OFFICIAL LICENSE • DO NOT COPY</div>
                    ))}
                </div>
            </div>

            <div className={`relative w-full max-w-lg flex flex-col items-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 z-10 transition-all duration-300 ${isBlurred ? 'blur-3xl opacity-0 scale-90' : 'blur-0 opacity-100 scale-100'}`}>
                {/* Header Badge */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-4 animate-bounce duration-[3000ms]">
                        <ShieldCheck className="h-10 w-10 text-slate-950" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight leading-tight px-4 capitalize">
                        {t('business_license_msg') || "Welcome to Abdela Car Lottery"}
                    </h2>
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Official Business License</p>
                </div>

                {/* The License Image with Protection */}
                <div className="relative w-full aspect-[3/4.2] bg-white rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)] border-4 border-white/10 group">
                    {/* Security Overlay (Transparent layer to prevent dragging/long-pressing) */}
                    <div className="absolute inset-0 z-10 select-none pointer-events-auto cursor-default" />
                    
                    <img 
                        src={license.imageUrl} 
                        alt="Official Business License" 
                        className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-700 group-hover:scale-[1.02]"
                        loading="eager"
                        onDragStart={(e) => e.preventDefault()}
                    />
                    
                    {/* Dynamic Watermark Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none opacity-10 flex items-center justify-center">
                         <div className="text-[40px] font-black text-slate-950 -rotate-45 select-none uppercase tracking-[0.5em] whitespace-nowrap">
                            ABDELA CAR LOTTERY
                         </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-8 w-full px-4 flex flex-col items-center">
                    <p className="text-slate-400 text-center text-sm font-medium mb-8 max-w-xs leading-relaxed">
                        {t('business_license_sub') || "Thise is my genuine bussine licence for your trust and security."}
                    </p>
                    
                    <button
                        onClick={handleDismiss}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-[2rem] text-xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group mb-4"
                    >
                        {t('ok_btn') || "OK, I UNDERSTAND"}
                        <CheckCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <div className="mt-4 flex items-center gap-2 text-slate-500 pb-10">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Verified Merchant Account</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

