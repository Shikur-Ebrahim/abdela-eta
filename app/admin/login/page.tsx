"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, signInWithEmailAndPassword, isUserAdmin } from "../../../lib/firebase/auth";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const isAdmin = await isUserAdmin(userCredential.user);
            if (isAdmin) {
                router.push("/admin");
            } else {
                // Not an admin, sign them out immediately
                await auth.signOut();
                setError("Access denied. You do not have admin privileges.");
            }
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40">
                <div className="text-center mb-8">
                    <img 
                        src="/app-logo.png" 
                        alt="Abdela Car Lottery" 
                        className="mx-auto h-24 w-24 object-cover rounded-full ring-8 ring-emerald-50/50 shadow-xl mb-6 hover:scale-105 transition-transform duration-300" 
                    />
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">login</h1>
                    <p className="text-slate-500 text-sm mt-2">Sign in to Abdela Car Lottery</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                                placeholder=""
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
                        >
                            {loading ? "Signing in..." : "Sign In to Dashboard"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
