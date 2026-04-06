"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, isUserAdmin, onAuthStateChanged } from "../../lib/firebase/auth";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
            const isAdmin = user ? await isUserAdmin(user) : false;

            if (pathname === "/admin/login") {
                // If on login page and already an admin, redirect to admin dashboard
                if (isAdmin) {
                    router.push("/admin");
                } else {
                    setLoading(false);
                }
                return;
            }

            // For all other /admin routes
            if (isAdmin) {
                setAuthorized(true);
            } else {
                setAuthorized(false);
                router.push("/admin/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!authorized && pathname !== "/admin/login") {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
