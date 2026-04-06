"use client";

import { useState, useEffect, useRef } from "react";
import { CreditCard, Save, RefreshCw, UploadCloud, CheckCircle, Smartphone } from "lucide-react";
import { savePaymentMethod, getPaymentMethods } from "../../../lib/firebase/firestore";
import { PaymentMethod } from "../../../types";

export default function PaymentMethodsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeProviderRef = useRef<string | null>(null);

    const [methods, setMethods] = useState<Record<string, PaymentMethod>>({
        cbe: {
            id: "cbe",
            provider: "Commercial Bank of Ethiopia",
            accountHolderName: "",
            accountNumber: "",
            logoId: "",
            isActive: true
        },
        telebirr: {
            id: "telebirr",
            provider: "telebirr",
            accountHolderName: "",
            accountNumber: "",
            logoId: "",
            isActive: true
        }
    });

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getPaymentMethods();
                if (data.length > 0) {
                    const loadedMethods = { ...methods };
                    data.forEach(m => {
                        loadedMethods[m.id] = m;
                    });
                    setMethods(loadedMethods);
                }
            } catch (error) {
                console.error("Error loading payment methods:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>, providerId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(providerId);
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
                setMethods(prev => ({
                    ...prev,
                    [providerId]: { ...prev[providerId], logoId: data.public_id }
                }));
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            alert("Failed to upload logo.");
        } finally {
            setUploadingLogo(null);
        }
    };

    const handleSave = async (providerId: string) => {
        setSaving(true);
        try {
            await savePaymentMethod(methods[providerId]);
            alert(`${methods[providerId].provider} settings saved successfully!`);
        } catch (error) {
            console.error("Error saving:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const triggerUpload = (providerId: string) => {
        activeProviderRef.current = providerId;
        fileInputRef.current?.click();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
                <RefreshCw className="h-10 w-10 animate-spin mb-4 opacity-20" />
                <p className="text-sm font-medium animate-pulse">Loading payment settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Payment Methods</h1>
                <p className="text-slate-400 mt-2">Manage checkout options for users to pay for tickets</p>
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => activeProviderRef.current && handleUploadLogo(e, activeProviderRef.current)}
            />

            <div className="grid md:grid-cols-2 gap-8">
                {/* CBE Section */}
                <PaymentCard
                    method={methods.cbe}
                    icon={<CreditCard className="h-6 w-6 text-blue-400" />}
                    isUploading={uploadingLogo === "cbe"}
                    isSaving={saving}
                    onUpdate={(updates: Partial<PaymentMethod>) => setMethods(prev => ({
                        ...prev,
                        cbe: { ...prev.cbe, ...updates }
                    }))}
                    onSave={() => handleSave("cbe")}
                    onUpload={() => triggerUpload("cbe")}
                />

                {/* telebirr Section */}
                <PaymentCard
                    method={methods.telebirr}
                    icon={<Smartphone className="h-6 w-6 text-emerald-400" />}
                    isUploading={uploadingLogo === "telebirr"}
                    isSaving={saving}
                    onUpdate={(updates: Partial<PaymentMethod>) => setMethods(prev => ({
                        ...prev,
                        telebirr: { ...prev.telebirr, ...updates }
                    }))}
                    onSave={() => handleSave("telebirr")}
                    onUpload={() => triggerUpload("telebirr")}
                />
            </div>
        </div>
    );
}

interface PaymentCardProps {
    method: PaymentMethod;
    icon: React.ReactNode;
    isUploading: boolean;
    isSaving: boolean;
    onUpdate: (updates: Partial<PaymentMethod>) => void;
    onSave: () => void;
    onUpload: () => void;
}

function PaymentCard({ method, icon, isUploading, isSaving, onUpdate, onSave, onUpload }: PaymentCardProps) {
    return (
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{method.provider}</h2>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${method.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {method.isActive ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdate({ isActive: !method.isActive })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${method.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'
                            }`}
                    >
                        {method.isActive ? 'ENABLED' : 'DISABLED'}
                    </button>
                </div>
            </div>

            <div className="space-y-5 flex-1">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 uppercase tracking-wider text-[11px]">Account Holder Name</label>
                    <input
                        type="text"
                        value={method.accountHolderName}
                        onChange={(e) => onUpdate({ accountHolderName: e.target.value })}
                        placeholder="e.g. Abdela Lottery PLC"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5 uppercase tracking-wider text-[11px]">
                        {method.id === 'telebirr' ? 'Phone Number' : 'Account Number'}
                    </label>
                    <input
                        type="text"
                        value={method.accountNumber}
                        onChange={(e) => onUpdate({ accountNumber: e.target.value })}
                        placeholder={method.id === 'telebirr' ? "e.g. 0911..." : "e.g. 1000..."}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider text-[11px]">Provider Logo</label>
                    <div
                        onClick={onUpload}
                        className={`h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${method.logoId ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                            }`}
                    >
                        {isUploading ? (
                            <RefreshCw className="h-6 w-6 text-slate-500 animate-spin" />
                        ) : method.logoId ? (
                            <div className="flex items-center gap-3 text-emerald-400 px-4">
                                <CheckCircle className="h-6 w-6 opacity-80" />
                                <div className="text-left">
                                    <span className="text-xs font-bold block leading-tight">Logo Uploaded</span>
                                    <span className="text-[10px] opacity-60">Click to change</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-600 group-hover:text-slate-400">
                                <UploadCloud className="h-6 w-6 mx-auto mb-1 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload {method.id === 'telebirr' ? 'telebirr' : 'CBE'} Logo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/50">
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                    {isSaving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    SAVE {method.id.toUpperCase()} SETTINGS
                </button>
            </div>
        </section>
    );
}
