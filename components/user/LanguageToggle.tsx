"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95 border border-slate-200 group"
        >
            <Languages className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-widest min-w-[20px]">
                {language === 'en' ? 'Amh' : 'Eng'}
            </span>
        </button>
    );
}
