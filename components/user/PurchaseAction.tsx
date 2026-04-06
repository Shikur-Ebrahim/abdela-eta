"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import PurchaseNotification from "./PurchaseNotification";

interface Props {
    isClosed: boolean;
    buttonText?: string;
    className?: string;
    showIcon?: boolean;
    lotteryId: string;
    ticketPrice: number | string;
    bundlePrices?: Record<string, number>;
}

export default function PurchaseAction({ isClosed, buttonText = "Buy Ticket", className, showIcon = true, lotteryId, ticketPrice, bundlePrices }: Props) {
    const [isNotiOpen, setIsNotiOpen] = useState(false);

    return (
        <>
            <button
                disabled={isClosed}
                onClick={() => setIsNotiOpen(true)}
                className={className}
            >
                {showIcon && <ShoppingCart className="h-5 w-5" />}
                {buttonText}
            </button>

            <PurchaseNotification
                isOpen={isNotiOpen}
                onClose={() => setIsNotiOpen(false)}
                lotteryId={lotteryId}
                ticketPrice={ticketPrice}
                bundlePrices={bundlePrices}
            />
        </>
    );
}
