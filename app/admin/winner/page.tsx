import { useState, useEffect, useRef } from "react";
import { Trophy, Save, Loader2, CheckCircle2, AlertCircle, UploadCloud, RefreshCw, CheckCircle } from "lucide-react";
import { getWinnerSettings, saveWinnerSettings } from "../../../lib/firebase/firestore";
import { WinnerSettings } from "../../../types";

export default function WinnerSettingsPage() {
    const [settings, setSettings] = useState<Omit<WinnerSettings, 'updatedAt'>>({
        winnerNumber: 0,
        isActive: false,
        showAnimation: true,
        revealDuration: 30,
        imageId: "",
        carTitle: "",
        telegramUsername: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getWinnerSettings();
                if (data) {
                    const { updatedAt, ...rest } = data;
                    setSettings({
                        ...rest,
                        imageId: rest.imageId || "",
                        carTitle: rest.carTitle || "",
                        telegramUsername: rest.telegramUsername || ""
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "carwin-ethiopia");

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setSettings({ ...settings, imageId: data.public_id });
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await saveWinnerSettings(settings);
            setMessage({ type: 'success', text: 'Winner settings saved successfully!' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    Winner Settings
                </h2>
                <p className="text-slate-400 text-sm mt-1">Configure the car lottery winner reveal on the landing page.</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 space-y-6">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div>
                            <p className="font-bold text-white">Active Status</p>
                            <p className="text-xs text-slate-400">Toggle the winner announcement on the landing page.</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, isActive: !settings.isActive })}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.isActive ? 'bg-emerald-500' : 'bg-slate-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isActive ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Car Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Winner Car Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <div
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                            className={`h-[200px] border-2 border-dashed rounded-2xl bg-slate-950 flex flex-col items-center justify-center transition-all ${settings.imageId ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-emerald-500/50 cursor-pointer group'
                                }`}
                        >
                            {uploadingImage ? (
                                <div className="text-center text-slate-400">
                                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin opacity-80" />
                                    <span className="text-sm font-medium animate-pulse">Uploading Image...</span>
                                </div>
                            ) : settings.imageId ? (
                                <div className="text-center text-emerald-400">
                                    <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-80" />
                                    <span className="text-sm font-bold">Image Uploaded Successfully!</span>
                                    <p className="text-xs text-emerald-500/70 mt-1">Click to change image</p>
                                    <p className="text-[10px] text-slate-500 mt-2 font-mono">{settings.imageId}</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 group-hover:text-slate-400">
                                    <UploadCloud className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm font-bold">Click to browse car image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Car Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Car Title / Description</label>
                        <input
                            type="text"
                            value={settings.carTitle}
                            onChange={(e) => setSettings({ ...settings, carTitle: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="e.g. 2024 Toyota Hilux"
                        />
                    </div>

                    {/* Telegram Username */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Telegram Support Username</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                            <input
                                type="text"
                                value={settings.telegramUsername}
                                onChange={(e) => setSettings({ ...settings, telegramUsername: e.target.value.replace('@', '') })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-5 py-4 text-white font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                                placeholder="abdela_support"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 ml-1">The button on the reveal page will redirect here.</p>
                    </div>

                    {/* Winner Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Winner Number</label>
                        <input
                            type="number"
                            value={settings.winnerNumber}
                            onChange={(e) => setSettings({ ...settings, winnerNumber: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-2xl tracking-widest text-center"
                            placeholder="Enter winner number (e.g. 53)"
                        />
                    </div>

                    {/* Reveal Duration */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Reveal Duration (Seconds)</label>
                        <input
                            type="number"
                            value={settings.revealDuration}
                            onChange={(e) => setSettings({ ...settings, revealDuration: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                            placeholder="30"
                        />
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <p className="text-sm font-bold">{message.text}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={saving || uploadingImage}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}
