"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
    text: string;
    label?: string;
}

export default function CopyableText({ text, label }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <div
            onClick={handleCopy}
            className="group flex flex-col items-start cursor-pointer transition-all active:scale-[0.98]"
        >
            {label && <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</span>}
            <div className="flex items-center gap-2">
                <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tighter leading-none">
                    {text}
                </span>
                <div className={`p-1 rounded-md transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </div>
            </div>
        </div>
    );
}
