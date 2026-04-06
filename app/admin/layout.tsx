"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminAuthGuard from '../../components/admin/AdminAuthGuard'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Menu } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (pathname === '/admin/login') {
        return (
            <div className="min-h-screen bg-white font-sans selection:bg-emerald-500/30">
                <AdminAuthGuard>
                    {children}
                </AdminAuthGuard>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
            <AdminAuthGuard>
                <AdminSidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
                    <header className="sticky top-0 z-[40] h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg flex items-center px-4 md:px-6 lg:px-8 gap-4 shrink-0">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1 flex items-center justify-between min-w-0">
                            <h1 className="text-lg font-bold text-white truncate tracking-tight">Admin <span className="hidden sm:inline text-slate-500">Panel</span></h1>
                            <div className="flex items-center gap-3">
                                {/* Optional: Add admin profile/notification icons here in future */}
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-10">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </AdminAuthGuard>
        </div>
    )
}
