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
        
        if (newCount >= 15) {
            e.preventDefault();
            router.push("/admin/login");
            setClickCount(0);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="mx-auto max-w-7xl px-2 py-1 md:px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center active:scale-95 transition-all" onClick={handleLogoClick}>
                    <img src="/app-logo.jpg" alt="Logo" className="h-16 md:h-20 w-auto object-cover rounded-lg" />
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                    <LanguageToggle />
                    <Link
                        href="/check-lottery"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                        <Ticket className="h-4 w-4" />
                        <span className="hidden xs:inline">{t('check_lottery')}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
