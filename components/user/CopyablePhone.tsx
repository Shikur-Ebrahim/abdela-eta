"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

interface Props {
    phone: string;
}

export default function CopyablePhone({ phone }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await navigator.clipboard.writeText(phone);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div
            onClick={handleCopy}
            className="bg-white border border-orange-100 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-orange-50/50 sm:col-span-2 cursor-pointer group"
        >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${copied ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${copied ? 'text-emerald-600' : 'text-orange-600'}`}>
                    {copied ? 'Success' : 'Phone Call'}
                </div>
                <div className="text-xs font-bold text-slate-900">
                    {copied ? 'Number Copied!' : phone}
                </div>
            </div>

            {!copied && (
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-orange-400 transition-colors px-2">
                    Click to copy
                </div>
            )}
        </div>
    );
}
