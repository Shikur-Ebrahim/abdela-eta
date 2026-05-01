"use client";

import { Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

export default function UserHeader() {
    const { t } = useLanguage();
    const router = useRouter();
    const [clickCount, setClickCount] = useState(0);

    const handleLogoClick = (e: React.MouseEvent) => {
        // Increment the secret click count
        const newCount = clickCount + 1;
        setClickCount(newCount);
        
        if (newCount >= 5) {
            e.preventDefault();
            router.push("/admin/login");
            setClickCount(0);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-2 py-1 md:px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center active:scale-95 transition-all" onClick={handleLogoClick}>
                    <img 
                        src="/app-logo.png" 
                        alt="Abdela Car Lottery" 
                        className="h-14 md:h-16 w-14 md:w-16 object-cover rounded-full ring-2 ring-white shadow-xl hover:rotate-6 transition-all duration-300" 
                    />
                </Link>
                <Link
                    href="/check-lottery"
                    className="flex-1 min-w-0 mx-2 sm:mx-4 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] sm:text-[13px] font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group overflow-hidden"
                >
                    <Ticket className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                    <span className="truncate whitespace-nowrap font-bold tracking-tight">{t('check_lottery')}</span>
                </Link>

                <div className="flex-shrink-0">
                    <LanguageToggle />
                </div>
            </div>
        </header>
    );
}
