"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-50 hover:bg-white text-slate-700 rounded-full transition-all active:scale-95 border border-slate-200 shadow-sm hover:shadow-md group"
        >
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
                {language === 'en' ? 'English' : 'አማርኛ'}
            </span>
        </button>
    );
}
