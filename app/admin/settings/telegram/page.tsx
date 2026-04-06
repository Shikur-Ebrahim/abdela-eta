"use client";

import { useState, useEffect } from "react";
import { Send, User, Save, BellRing, Phone } from "lucide-react";
import { getTelegramSettings, saveTelegramSettings } from "../../../../lib/firebase/firestore";

export default function TelegramSettingsPage() {
    const [channelLink, setChannelLink] = useState("");
    const [supportUsername, setSupportUsername] = useState("");
    const [supportPhone, setSupportPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        async function loadSettings() {
            const settings = await getTelegramSettings();
            if (settings) {
                setChannelLink(settings.channelLink || "");
                setSupportUsername(settings.supportUsername || "");
                setSupportPhone(settings.supportPhone || "");
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await saveTelegramSettings({
                channelLink,
                supportUsername,
                supportPhone
            });
            setMessage({ type: 'success', text: "Telegram settings updated successfully!" });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update settings. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white tracking-tight">Telegram Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Configure your official Telegram channel and support contact points.</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Channel Link */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Send className="h-3 w-3" /> Official Channel Link
                            </label>
                            <input
                                type="url"
                                value={channelLink}
                                onChange={(e) => setChannelLink(e.target.value)}
                                placeholder="https://t.me/yourchannel"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                required
                            />
                            <p className="text-[10px] text-slate-500 italic">Full URL of your Telegram channel.</p>
                        </div>

                        {/* Support Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3" /> Support Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                                <input
                                    type="text"
                                    value={supportUsername}
                                    onChange={(e) => setSupportUsername(e.target.value.replace('@', ''))}
                                    placeholder="username"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 italic">Example: abdela_support (without @)</p>
                        </div>

                        {/* Support Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Support Phone
                            </label>
                            <input
                                type="tel"
                                value={supportPhone}
                                onChange={(e) => setSupportPhone(e.target.value)}
                                placeholder="+251 9... or 09..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                            <p className="text-[10px] text-slate-500 italic">Call support number for users.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-900 font-black px-8 py-4 sm:py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            {saving ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview Card */}
            <div className="mt-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 border-dashed">
                <h3 className="text-emerald-400 font-bold text-sm mb-4 flex items-center gap-2">
                    <BellRing className="h-4 w-4" /> Why this matters
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    These links will be displayed on the user homepage and lottery rounds to help participants join the official community and get support.
                </p>
            </div>
        </div>
    );
}
