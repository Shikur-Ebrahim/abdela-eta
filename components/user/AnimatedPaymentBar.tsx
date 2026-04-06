"use client";

import { useEffect, useState } from "react";

interface Props {
    children: React.ReactNode;
}

export default function AnimatedPaymentBar({ children }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const trigger = () => {
            setIsVisible(false);
            setTimeout(() => setIsVisible(true), 100);
        };

        trigger();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                trigger();
            }
        };

        window.addEventListener('focus', trigger);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', trigger);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div
            className={`relative z-40 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${isVisible
                ? "translate-y-0 opacity-100 visible"
                : "-translate-y-full opacity-0 invisible"
                }`}
        >
            {children}
        </div>
    );
}
