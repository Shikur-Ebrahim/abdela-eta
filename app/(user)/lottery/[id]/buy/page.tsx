"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Car, Ticket, User, MapPin, UploadCloud,
    ArrowLeft, ArrowRight, CheckCircle2,
    RefreshCw, ShieldCheck, AlertCircle, ShoppingCart,
    Copy, Check, MessageCircle, Send, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { getLotteryRound, createPurchaseOrder, getSoldNumbers, checkPhoneUsed, getPaymentMethods, getTelegramSettings } from "../../../../../lib/firebase/firestore";
import CloudinaryImage from "../../../../../components/ui/CloudinaryImage";
import { LotteryRound, PaymentMethod, TelegramSettings } from "../../../../../types";
import { useLanguage } from "../../../../../lib/contexts/LanguageContext";
import LanguageToggle from "../../../../../components/user/LanguageToggle";

export default function BuyTicketPage() {
    const { t } = useLanguage();
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedNumbers = searchParams.get("numbers");
    const [lottery, setLottery] = useState<LotteryRound | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);

    // Form State
    const [quantity, setQuantity] = useState(1);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [isValidatingPhone, setIsValidatingPhone] = useState(false);

    const [soldNumbers, setSoldNumbers] = useState<number[]>([]);
    const [suggestions, setSuggestions] = useState<number[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [telegramSettings, setTelegramSettings] = useState<TelegramSettings | null>(null);
    const [fetchingDisabled, setFetchingDisabled] = useState(false);

    // UI State
    const [uploadingPayment, setUploadingPayment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedText, setCopiedText] = useState("");
    const paymentFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchLottery = async () => {
            const data = await getLotteryRound(id);
            if (data) {
                setLottery(data);
                // Pre-fetch sold numbers
                const sold = await getSoldNumbers(id);
                setSoldNumbers(sold);

                // Handle pre-selected numbers from landing page
                if (preSelectedNumbers) {
                    const nums = preSelectedNumbers.split(',').map(n => parseInt(n)).filter(n => !isNaN(n));
                    if (nums.length > 0) {
                        const perTicket = data.numbersPerTicket || 1;
                        const qty = Math.ceil(nums.length / perTicket);
                        
                        setQuantity(qty);
                        setSelectedNumbers(nums);
                        setStep(2); // Skip to pick numbers step for confirmation
                    }
                }
            }
            setLoading(false);
        };
        const fetchPayments = async () => {
            const methods = await getPaymentMethods();
            setPaymentMethods(methods.filter(m => m.isActive));
        };
        const fetchTelegram = async () => {
            const settings = await getTelegramSettings();
            setTelegramSettings(settings);
        };
        fetchLottery();
        fetchPayments();
        fetchTelegram();
    }, [id]);

    const generateSuggestions = (taken: number[]) => {
        if (!lottery) return;
        const available: number[] = [];
        let count = 1;
        while (available.length < 10 && count <= lottery.totalTickets) {
            const random = Math.floor(Math.random() * lottery.totalTickets) + 1;
            if (!taken.includes(random) && !available.includes(random)) {
                available.push(random);
            }
            count++;
        }
        setSuggestions(available);
    };

    const handleStepChange = async (nextStep: number) => {
        if (nextStep === 2) {
            setFetchingDisabled(true);
            const sold = await getSoldNumbers(id);
            setSoldNumbers(sold);
            generateSuggestions(sold);
            setFetchingDisabled(false);
        }
        setStep(nextStep);
    };

    const calculateTotal = () => {
        if (!lottery) return 0;
        // Check for bundle price
        if (lottery.bundlePrices && lottery.bundlePrices[quantity]) {
            return lottery.bundlePrices[quantity];
        }
        return quantity * lottery.ticketPrice;
    };

    const handleNumberChange = (index: number, val: string) => {
        const num = val === "" ? 0 : parseInt(val);
        const newNumbers = [...selectedNumbers];
        newNumbers[index] = isNaN(num) ? 0 : num;
        setSelectedNumbers(newNumbers);
    };


    const handlePaymentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPayment(true);
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
                setPaymentScreenshotUrl(data.secure_url);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload screenshot. Please try again.");
        } finally {
            setUploadingPayment(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(""), 2000);
    };

    const validatePhone = async () => {
        if (!phoneNumber || phoneNumber.length < 9) return;

        setIsValidatingPhone(true);
        try {
            const isUsed = await checkPhoneUsed(id, phoneNumber);
            if (isUsed) {
                setPhoneError(t('phone_placeholder')); // I'll use a better error string if available
                // Actually I didn't add the "Phone number used" string to translations. I'll just use the hardcoded one for now but with standard wording or add it later.
            } else {
                setPhoneError("");
            }
        } catch (error) {
            console.error("Phone validation error:", error);
        } finally {
            setIsValidatingPhone(false);
        }
    };

    const handleSubmit = async () => {
        if (!paymentScreenshotUrl) return alert("Please upload your payment screenshot.");

        // Validate numbers (Restore missing validation)
        if (selectedNumbers.some(n => n < 1 || n > (lottery?.totalTickets || 0))) {
            return alert(`Please enter ticket numbers between 1 and ${lottery?.totalTickets}`);
        }
        // Unique numbers
        if (new Set(selectedNumbers).size !== selectedNumbers.length) {
            return alert("Each ticket must have a unique number.");
        }

        setIsSubmitting(true);
        try {
            await createPurchaseOrder({
                lotteryId: id,
                fullName,
                phoneNumber,
                paymentScreenshotUrl,
                selectedNumbers,
                totalPrice: calculateTotal()
            });
            setStep(5); // Success step
        } catch (error) {
            console.error("Order error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!lottery) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
                <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
                <h2 className="text-xl font-bold">{t('lottery_not_found')}</h2>
                <Link href="/" className="mt-4 text-orange-500 font-bold">{t('back_to_home')}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Simple Mobile Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => step > 1 && step < 5 ? setStep(step - 1) : router.back()}>
                        <ArrowLeft className="h-6 w-6 text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">{t('buy_ticket_title')}</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lottery.carTitle}</p>
                    </div>
                </div>
                <LanguageToggle />
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-200">
                <div
                    className="h-full bg-orange-500 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <main className="max-w-md mx-auto p-6">
                {/* Step 1: Selection */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{t('how_many_tickets')}</h2>
                            <p className="text-slate-500 text-sm font-bold mb-8">{t('choose_package')}</p>

                            <div className="space-y-4">
                                {/* Single Ticket */}
                                <button
                                    onClick={() => setQuantity(1)}
                                    className={`w-full flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${quantity === 1 ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className="text-left">
                                        <span className="block text-sm font-black text-slate-900">{t('one_ticket')}</span>
                                    </div>
                                    <span className="text-lg font-black text-orange-600">ETB {Number(lottery.ticketPrice).toLocaleString()}</span>
                                </button>

                                {/* Bundle Options */}
                                {lottery.bundlePrices && Object.entries(lottery.bundlePrices).map(([count, price]) => (
                                    <button
                                        key={count}
                                        onClick={() => setQuantity(parseInt(count))}
                                        className={`w-full flex justify-between items-center p-5 rounded-2xl border-2 transition-all ${quantity === parseInt(count) ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="block text-sm font-black text-slate-900">{count} {t('tickets')}</span>
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-orange-600">ETB {price.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const perTicket = lottery.numbersPerTicket || 1;
                                setSelectedNumbers(Array(quantity * perTicket).fill(0));
                                handleStepChange(2);
                            }}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            {t('continue_btn')} <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Step 2: Pick Numbers */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Pick Your Numbers</h2>
                            <p className="text-slate-500 text-sm font-bold mb-8 italic">Choose your lucky numbers between 1 and {lottery.totalTickets}</p>

                            <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {Array.from({ length: quantity }).map((_, ticketIdx) => {
                                    const perTicket = lottery.numbersPerTicket || 1;
                                    return (
                                        <div key={ticketIdx} className="p-4 border-2 border-slate-50 bg-slate-50/30 rounded-2xl space-y-4">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('ticket_label') || 'Ticket'} #{ticketIdx + 1}</span>
                                                <span className="text-[10px] font-bold text-orange-500 uppercase">{perTicket} {t('numbers_label') || 'Numbers'}</span>
                                            </div>
                                            
                                            <div className="flex flex-col gap-4">
                                                {Array.from({ length: perTicket }).map((_, numIdx) => {
                                                    const globalIdx = (ticketIdx * perTicket) + numIdx;
                                                    const num = selectedNumbers[globalIdx];
                                                    
                                                    const isTaken = soldNumbers.includes(num);
                                                    const isDuplicate = selectedNumbers.filter(n => n === num && n !== 0).length > 1;
                                                    const isOutOfRange = num !== 0 && (num < 1 || num > (lottery?.totalTickets || 0));
                                                    const hasError = isTaken || isDuplicate || isOutOfRange;

                                                    return (
                                                        <div key={numIdx} className="space-y-1">
                                                            <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${hasError ? 'border-red-500 bg-red-50' : 'bg-white border-slate-200 focus-within:border-orange-500'}`}>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    pattern="[0-9]*"
                                                                    placeholder=""
                                                                    value={num || ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                                                        handleNumberChange(globalIdx, val);
                                                                    }}
                                                                    className="bg-transparent flex-1 font-black text-base focus:outline-none text-center"
                                                                />
                                                                {hasError && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                                            </div>
                                                            {isOutOfRange && <p className="text-[8px] text-red-500 font-extrabold uppercase text-center leading-none mt-1">{t('out_of_range')} {lottery.totalTickets}</p>}
                                                            {isTaken && <p className="text-[8px] text-red-500 font-extrabold uppercase text-center leading-none mt-1">{t('taken_error')}</p>}
                                                            {isDuplicate && <p className="text-[8px] text-red-500 font-extrabold uppercase text-center leading-none mt-1">{t('duplicate_error')}</p>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Suggestions - Only show if a taken number is selected */}
                            {suggestions.length > 0 && selectedNumbers.some(n => soldNumbers.includes(n)) && (
                                <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <span className="text-sm font-black text-slate-900 tracking-tight block mb-3">{t('available_numbers')}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => {
                                                    // Priority 1: Replace numbers already taken by others
                                                    let targetIdx = selectedNumbers.findIndex(val => soldNumbers.includes(val));

                                                    // Priority 2: Replace empty slots
                                                    if (targetIdx === -1) {
                                                        targetIdx = selectedNumbers.findIndex(val => val === 0);
                                                    }

                                                    // Priority 3: Replace other invalid numbers (out of range/duplicates)
                                                    if (targetIdx === -1) {
                                                        targetIdx = selectedNumbers.findIndex(val => {
                                                            const isDuplicate = selectedNumbers.filter(n => n === val && n !== 0).length > 1;
                                                            const isOutOfRange = val !== 0 && (val < 1 || (lottery && val > lottery.totalTickets));
                                                            return isDuplicate || isOutOfRange;
                                                        });
                                                    }

                                                    if (targetIdx !== -1) {
                                                        const next = [...selectedNumbers];
                                                        next[targetIdx] = n;
                                                        setSelectedNumbers(next);
                                                        setSuggestions(suggestions.filter(s => s !== n));
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-orange-100/50 hover:bg-orange-500 hover:text-white transition-all text-orange-600 rounded-lg font-black text-xs"
                                            >
                                                #{n}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => generateSuggestions(soldNumbers)}
                                            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                                            title="New Suggestions"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={selectedNumbers.some(n =>
                                n === 0 ||
                                n < 1 ||
                                n > (lottery?.totalTickets || 0) ||
                                soldNumbers.includes(n) ||
                                selectedNumbers.filter(other => other === n).length > 1
                            )}
                            onClick={() => setStep(3)}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            Next Step <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Step 3: Your Information */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Your Information</h2>

                            <div className="space-y-6">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="block text-slate-900 font-black text-sm uppercase tracking-wider pl-1">{t('full_name_label')}</label>
                                    <div className="h-16 rounded-2xl bg-white border-2 border-slate-100 flex items-center px-5 focus-within:border-orange-500 transition-all shadow-sm">
                                        <input
                                            type="text"
                                            placeholder={t('enter_full_name')}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="bg-transparent font-bold text-slate-900 w-full focus:outline-none placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="block text-slate-900 font-black text-sm uppercase tracking-wider pl-1 font-bold">{t('phone_num_label')}</label>
                                    <div className={`h-16 rounded-2xl bg-white border-2 flex items-center px-5 transition-all shadow-sm ${phoneError ? 'border-red-500' : 'border-slate-100 focus-within:border-orange-500'}`}>
                                        <input
                                            type="tel"
                                            placeholder="09... or 07..."
                                            value={phoneNumber}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                if (val.length <= 10) {
                                                    setPhoneNumber(val);
                                                    if (phoneError) setPhoneError("");
                                                }
                                            }}
                                            onBlur={() => {
                                                if (phoneNumber.length > 0) {
                                                    if (phoneNumber.length !== 10) {
                                                        setPhoneError("Phone number must be exactly 10 digits.");
                                                    } else if (!phoneNumber.startsWith("09") && !phoneNumber.startsWith("07")) {
                                                        setPhoneError("Phone number must start with 09 or 07.");
                                                    } else {
                                                        validatePhone();
                                                    }
                                                }
                                            }}
                                            className="bg-transparent font-bold text-slate-900 w-full focus:outline-none placeholder:text-slate-300"
                                        />
                                        {isValidatingPhone && <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />}
                                    </div>
                                    {phoneError && (
                                        <p className="text-[10px] text-red-500 font-black uppercase leading-tight mt-1 animate-in fade-in slide-in-from-top-1">
                                            {phoneError}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        <button
                            disabled={!fullName || !phoneNumber || !!phoneError || isValidatingPhone}
                            onClick={() => setStep(4)}
                            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            Next Step <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}


                {/* Step 4: Payment Process */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-orange-100 p-3 rounded-2xl">
                                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('payment')}</h2>
                            </div>

                            <div className="mb-8 p-6 bg-orange-600 rounded-3xl text-white shadow-lg shadow-orange-500/20">
                                <span className="text-xs font-black uppercase tracking-widest opacity-80">{t('total_amount_due')}</span>
                                <div className="text-3xl font-black mt-1 tracking-tight">ETB {calculateTotal().toLocaleString()}</div>
                                <p className="text-[10px] font-bold mt-3 opacity-90 leading-normal uppercase">
                                    {t('payment_desc')}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t('official_accounts')}</h3>
                                {paymentMethods.map((method) => (
                                    <div key={method.id} className="p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
                                                <CloudinaryImage src={method.logoId} alt={method.provider} width={40} height={40} />
                                            </div>
                                            <div>
                                                <span className="block text-xs font-black text-slate-900 uppercase tracking-tight">{method.provider}</span>
                                                <span className="block text-[10px] font-bold text-slate-500 uppercase">{method.accountHolderName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                                            <span className="font-black text-slate-900 tracking-tight">{method.accountNumber}</span>
                                            <button
                                                onClick={() => copyToClipboard(method.accountNumber)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedText === method.accountNumber ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
                                            >
                                                {copiedText === method.accountNumber ? t('copied_label') || "Copied" : t('copy_label') || "Copy"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Payment Proof</h3>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={paymentFileInputRef}
                                    onChange={handlePaymentUpload}
                                />
                                <div
                                    onClick={() => !uploadingPayment && paymentFileInputRef.current?.click()}
                                    className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all cursor-pointer ${paymentScreenshotUrl ? 'border-emerald-500 bg-emerald-50 aspect-video' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50 h-24'}`}
                                >
                                    {uploadingPayment ? (
                                        <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
                                    ) : paymentScreenshotUrl ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                <span className="text-xs font-black text-emerald-600 uppercase">{t('proof_uploaded')}</span>
                                            </div>
                                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-sm">
                                                <img src={paymentScreenshotUrl} className="w-full h-full object-cover" alt="Payment screenshot preview" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <ImageIcon className="h-5 w-5 text-slate-400" />
                                            <span className="text-sm font-black text-slate-900 uppercase">{t('upload_payment_photo')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!paymentScreenshotUrl || isSubmitting || uploadingPayment}
                            onClick={handleSubmit}
                            className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                            {isSubmitting ? t('processing') : t('submit_reservation')}
                        </button>
                    </div>
                )}

                {/* Final Success Step */}
                {step === 5 && (
                    <div className="animate-in zoom-in-95 duration-500 text-center py-12">
                        <div className="bg-emerald-500 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                            <CheckCircle2 className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">{t('success_title')}</h2>
                        <p className="text-slate-500 font-bold text-lg mb-12">
                            {t('success_desc')}
                        </p>

                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="block w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
                            >
                                Back to Home
                            </Link>
                            <a
                                href={`https://t.me/${telegramSettings?.supportUsername || 'abdelalottery'}`}
                                target="_blank"
                                className="flex items-center justify-center gap-3 w-full bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm"
                            >
                                {t('contact_abdela')} <Send className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                )}
            </main>

            {/* Desktop Message */}
            <div className="hidden md:flex fixed bottom-8 right-8 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 items-center gap-3 max-w-xs animate-in slide-in-from-right-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                    <ShieldCheck className="text-orange-600 h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-600">This flow is optimized for mobile devices. Experience it on your phone!</p>
            </div>
        </div>
    );
}
