"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Ticket, Users, PlusCircle, LogOut, CreditCard, Send, X, Hash } from "lucide-react";
import { auth, signOut } from "../../lib/firebase/auth";
import { useRouter } from "next/navigation";
import { listenForPendingOrdersCount } from "../../lib/firebase/firestore";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const unsubscribe = listenForPendingOrdersCount((count: number) => {
            setPendingCount(count);
        });
        return () => unsubscribe();
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Add Lottery Car", href: "/admin/cars/add", icon: PlusCircle },
        { name: "Lottery Rounds", href: "/admin/lotteries", icon: Ticket },
        { name: "Lottery Numbers", href: "/admin/lottery-numbers", icon: Hash },
        { name: "Sold Tickets", href: "/admin/sold-tickets", icon: CreditCard, badge: pendingCount },
        { name: "Payment Methods", href: "/admin/payments", icon: CreditCard },
        { name: "Telegram Settings", href: "/admin/settings/telegram", icon: Send },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-[280px] border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl z-[70] flex flex-col transition-all duration-300 ease-in-out transform ${isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"} md:translate-x-0 md:static md:z-auto md:w-64 md:pointer-events-auto shadow-2xl md:shadow-none`}>
                <div className="p-6 h-16 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-950 text-xs shadow-lg shadow-emerald-500/20">A</div>
                        <h2 className="text-lg font-black tracking-tight text-white leading-none hover:text-emerald-400 transition-colors cursor-pointer">
                            ABDELA <span className="text-emerald-400">ADMIN</span>
                        </h2>
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-white md:hidden hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden pt-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4">Main Navigation</div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 outline-none ${isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <item.icon className={`h-5 w-5 transition-transform ${isActive ? "text-emerald-400 scale-110" : "text-slate-500"}`} />
                                    <span className={isActive ? "translate-x-1 transition-transform" : ""}>{item.name}</span>
                                </div>
                                {item.badge && item.badge > 0 ? (
                                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-500/30 animate-in zoom-in-50 duration-300">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-2xl text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
                    >
                        <LogOut className="h-5 w-5 text-red-500/70" />
                        Sign Out
                    </button>
                    <div className="mt-4 px-4 text-[10px] text-slate-600 font-medium">
                        &copy; 2026 Abdela Car Lottery
                    </div>
                </div>
            </aside>
        </>
    );
}
