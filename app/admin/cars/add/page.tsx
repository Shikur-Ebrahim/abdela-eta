"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Clock, Save, RefreshCw, Plus, X, UploadCloud, CheckCircle } from "lucide-react";
import { addLotteryRound } from "../../../../lib/firebase/firestore";

export default function AddCarAndLotteryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Core details
    const [title, setTitle] = useState("");
    const [carPrice, setCarPrice] = useState("");
    const [gameNumber, setGameNumber] = useState("");
    const [imageId, setImageId] = useState("");
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

    // Ticket details
    const [totalTickets, setTotalTickets] = useState("");
    const [singlePrice, setSinglePrice] = useState("");
    const [numbersPerTicket, setNumbersPerTicket] = useState("2");
    const [bundles, setBundles] = useState<{ tickets: string; price: string }[]>([]);
    const [initialSoldPercent, setInitialSoldPercent] = useState("0");
    const [targetSalesPercent, setTargetSalesPercent] = useState("80");

    const [days, setDays] = useState("30");
    const [hours, setHours] = useState("0");

    // Formatter helpers
    const formatNumber = (val: string) => {
        if (!val) return "";
        const nums = val.replace(/[^0-9]/g, "");
        return Number(nums).toLocaleString();
    };

    const cleanNumber = (val: string) => {
        return val.replace(/,/g, "");
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "carwin-ethiopia");

        try {
            const resourceType = mediaType === 'video' ? 'video' : 'image';
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setImageId(data.public_id);
            }
        } catch (error) {
            console.error(`Error uploading ${mediaType}:`, error);
            alert(`Failed to upload ${mediaType}. Please try again.`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageId) {
            alert(`Please upload a car ${mediaType} first.`);
            return;
        }

        setLoading(true);

        try {
            // Convert bundles array to object format { "2": 500, "5": 1000 }
            const formattedBundles = bundles.reduce((acc: Record<string, number>, bundle: { tickets: string; price: string }) => {
                if (bundle.tickets && bundle.price) {
                    acc[bundle.tickets] = Number(bundle.price);
                }
                return acc;
            }, {});

            // Calculate Draw Date based on duration
            const now = new Date();
            const drawDate = new Date(now);
            drawDate.setDate(drawDate.getDate() + Number(days));
            drawDate.setHours(drawDate.getHours() + Number(hours));

            await addLotteryRound({
                carTitle: title,
                carValue: Number(cleanNumber(carPrice)),
                imageId: imageId,
                mediaType: mediaType,
                gameNumber: Number(gameNumber) || undefined,
                ticketPrice: Number(cleanNumber(singlePrice)),
                numbersPerTicket: Number(numbersPerTicket) || 2,
                bundlePrices: bundles.reduce((acc: Record<string, number>, b) => {
                    if (b.tickets && b.price) acc[b.tickets] = Number(cleanNumber(b.price));
                    return acc;
                }, {}),
                totalTickets: Number(cleanNumber(totalTickets)),
                timeLength: {
                    months: 0,
                    days: Number(days),
                    hours: Number(hours),
                    minutes: 0
                },
                drawDate: drawDate,
                initialSoldPercent: Number(initialSoldPercent),
                targetSalesPercent: Number(targetSalesPercent)
            });

            router.push("/admin/lotteries");
        } catch (error) {
            console.error("Failed to save to Firestore", error);
            alert("Error saving data. Check console for details.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Create New Lottery Round</h1>
                <p className="text-slate-400 mt-2">Add a new car and set up its lottery ticket parameters</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Car Details & Image */}
                <section className="bg-slate-900/50 border border-slate-800 sm:rounded-3xl p-4 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="bg-emerald-500/10 text-emerald-400 h-10 w-10 rounded-xl flex items-center justify-center border border-emerald-500/20">1</span>
                        Car Details
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Lottery/Car Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. 2024 Toyota Hilux"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Game Number (Displayed to User)</label>
                                <input
                                    type="number"
                                    value={gameNumber}
                                    onChange={(e) => setGameNumber(e.target.value)}
                                    placeholder="e.g. 2"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Actual Car Value (ETB)</label>
                                <input
                                    type="text"
                                    required
                                    value={carPrice}
                                    onChange={(e) => setCarPrice(formatNumber(e.target.value))}
                                    placeholder="e.g. 5,000,000"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>

                        {/* Cloudinary Upload Area */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-400">Media Upload</label>
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaType('image');
                                            setImageId("");
                                        }}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mediaType === 'image' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        IMAGE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaType('video');
                                            setImageId("");
                                        }}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mediaType === 'video' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        VIDEO
                                    </button>
                                </div>
                            </div>

                            <input
                                type="file"
                                accept={mediaType === 'video' ? "video/*" : "image/*"}
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageUpload}
                            />

                            <div
                                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                                className={`h-[140px] border-2 border-dashed rounded-xl bg-slate-950 flex flex-col items-center justify-center transition-all ${imageId ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-emerald-500/50 cursor-pointer group'
                                    }`}
                            >
                                {uploadingImage ? (
                                    <div className="text-center text-slate-400 flex flex-col items-center">
                                        <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin opacity-80" />
                                        <span className="text-sm font-medium animate-pulse">Uploading {mediaType}...</span>
                                    </div>
                                ) : imageId ? (
                                    <div className="text-center text-emerald-400 cursor-pointer">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-80" />
                                        <span className="text-sm font-medium">{mediaType === 'image' ? 'Image' : 'Video'} Uploaded Successfully!</span>
                                        <p className="text-xs text-emerald-500/70 mt-1">Click to change {mediaType}</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 group-hover:text-slate-400">
                                        <UploadCloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Click to browse {mediaType}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Ticket Configuration */}
                <section className="bg-slate-900/50 border border-slate-800 sm:rounded-3xl p-4 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="bg-emerald-500/10 text-emerald-400 h-10 w-10 rounded-xl flex items-center justify-center border border-emerald-500/20">2</span>
                        Ticket Settings & Pricing
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Total Tickets</label>
                            <input
                                type="text"
                                required
                                value={totalTickets}
                                onChange={(e) => setTotalTickets(formatNumber(e.target.value))}
                                placeholder="e.g. 50,000"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Single Ticket Price (ETB)</label>
                            <input
                                type="text"
                                required
                                value={singlePrice}
                                onChange={(e) => setSinglePrice(formatNumber(e.target.value))}
                                placeholder="e.g. 299"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Numbers per Ticket</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={numbersPerTicket}
                                onChange={(e) => setNumbersPerTicket(e.target.value)}
                                placeholder="Default is 2"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                            />
                            <p className="mt-1.5 text-[10px] text-slate-500 font-bold uppercase italic">If set to 2, 1 ticket = 2 picks for the user</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Initial Sold % (Start)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={initialSoldPercent}
                                onChange={(e) => setInitialSoldPercent(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Sales % (at Draw Date)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={targetSalesPercent}
                                onChange={(e) => setTargetSalesPercent(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:outline-none focus:border-emerald-500/50"
                            />
                            <p className="mt-1.5 text-[10px] text-orange-500 font-bold uppercase italic">Sales progress will automatically grow to reach this % by the draw date</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Bundle Pricing Options (Optional)</h3>
                            <button
                                type="button"
                                onClick={() => setBundles([...bundles, { tickets: "", price: "" }])}
                                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <Plus className="h-3 w-3" /> Add Bundle
                            </button>
                        </div>

                        <div className="space-y-3">
                            {bundles.length === 0 && (
                                <p className="text-xs text-slate-500">No bundles added yet. Click 'Add Bundle' to set custom ticket packages.</p>
                            )}
                            {bundles.map((bundle, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Number of Tickets</label>
                                        <input
                                            type="number"
                                            value={bundle.tickets}
                                            onChange={(e) => {
                                                const newBundles = [...bundles];
                                                newBundles[index].tickets = e.target.value;
                                                setBundles(newBundles);
                                            }}
                                            placeholder="e.g. 5"
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Bundle Price (ETB)</label>
                                        <input
                                            type="text"
                                            value={bundle.price}
                                            onChange={(e) => {
                                                const newBundles = [...bundles];
                                                newBundles[index].price = formatNumber(e.target.value);
                                                setBundles(newBundles);
                                            }}
                                            placeholder="e.g. 1,200"
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newBundles = bundles.filter((_, i) => i !== index);
                                            setBundles(newBundles);
                                        }}
                                        className="mb-1 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. Duration Setup */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 h-8 w-8 rounded-lg flex items-center justify-center">3</span>
                        Lottery Duration
                    </h2>

                    <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <Clock className="h-10 w-10 text-slate-600" />
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Days Active</label>
                                <input
                                    type="number"
                                    required
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Extra Hours</label>
                                <input
                                    type="number"
                                    max="23"
                                    required
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/cars")}
                        className="px-6 py-3 font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !imageId}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {loading ? "Creating..." : "Save & Create Lottery"}
                    </button>
                </div>
            </form>
        </div>
    );
}
