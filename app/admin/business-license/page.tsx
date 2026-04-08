"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, UploadCloud, RefreshCw, CheckCircle, Save, AlertCircle, Eye } from "lucide-react";
import { getBusinessLicense, saveBusinessLicense } from "../../../lib/firebase/firestore";

export default function BusinessLicenseAdminPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [active, setActive] = useState(false);
    const [maxViews, setMaxViews] = useState(2);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getBusinessLicense();
            if (data) {
                setActive(data.active || false);
                setMaxViews(data.maxViews || 2);
                setImageUrl(data.imageUrl || "");
            }
        } catch (error) {
            console.error("Error fetching license settings:", error);
        } finally {
            setFetching(false);
        }
    };

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
                setImageUrl(data.secure_url);
            } else {
                alert("Upload failed. Check Cloudinary settings.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!imageUrl) {
            alert("Please upload a license image first.");
            return;
        }

        setLoading(true);
        try {
            await saveBusinessLicense({
                imageUrl,
                active,
                maxViews: Number(maxViews)
            });
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    Business License Management
                </h1>
                <p className="text-slate-400 mt-2">Upload your official business license and control how it's displayed to users.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Settings */}
                <div className="space-y-6">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Notification Active</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Toggle the license display for users</p>
                                </div>
                                <button
                                    onClick={() => setActive(!active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1.5">Max Views Per User</label>
                                <div className="relative">
                                    <Eye className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={maxViews}
                                        onChange={(e) => setMaxViews(Number(e.target.value))}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-slate-500 font-bold uppercase italic tracking-wider">Example: Set to 2 to show the license twice to every new user.</p>
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                SAVE SETTINGS
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right: Upload & Preview */}
                <div className="space-y-6">
                    <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Document Upload</h3>
                            {imageUrl && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-black border border-emerald-500/20 uppercase tracking-tighter">Current File Active</span>}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                        />

                        <div
                            onClick={() => !uploadingImage && fileInputRef.current?.click()}
                            className={`aspect-[3/4] border-2 border-dashed rounded-2xl bg-slate-950 flex flex-col items-center justify-center transition-all overflow-hidden ${imageUrl ? 'border-emerald-500/30' : 'border-slate-800 hover:border-emerald-500/50 cursor-pointer group'}`}
                        >
                            {uploadingImage ? (
                                <div className="text-center text-slate-400 flex flex-col items-center">
                                    <RefreshCw className="h-10 w-10 mx-auto mb-3 animate-spin opacity-80" />
                                    <span className="text-sm font-black animate-pulse uppercase tracking-widest">Uploading Document...</span>
                                </div>
                            ) : imageUrl ? (
                                <div className="relative group w-full h-full">
                                    <img src={imageUrl} alt="Business License" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud className="h-8 w-8 text-white" />
                                            <span className="text-xs font-black text-white uppercase">Change Document</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-600 group-hover:text-slate-400 transition-colors">
                                    <div className="h-16 w-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-4 mx-auto border border-slate-800 group-hover:border-emerald-500/30">
                                        <UploadCloud className="h-8 w-8" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Click to browse file</span>
                                    <p className="mt-2 text-[10px] text-slate-700 italic px-8">Upload a clear photo of your business license document.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-500/80 font-bold leading-relaxed uppercase tracking-tight">
                                Anti-Screenshot protection will be applied to this image in the user view to prevent unauthorized use.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
