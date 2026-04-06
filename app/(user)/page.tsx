import { Car, Ticket, Trophy } from "lucide-react";
import { getActiveLotteries, getPaymentMethods } from "../../lib/firebase/firestore";
import CarLotteryCard from "../../components/user/CarLotteryCard";
import CloudinaryImage from "../../components/ui/CloudinaryImage";
import CopyableText from "../../components/user/CopyableText";
import AnimatedPaymentBar from "../../components/user/AnimatedPaymentBar";

import UserHeader from "../../components/user/UserHeader";
import UserHome from "../../components/user/UserHome";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
    const allLotteries = await getActiveLotteries(40); // Fetch more to have enough for marquee
    const paymentMethods = await getPaymentMethods();

    // Sort lotteries: Active ones first, Closed ones last
    const sortedLotteries = [...allLotteries].sort((a, b) => {
        const aIsClosed = new Date(a.drawDate).getTime() <= Date.now() || a.status === 'completed';
        const bIsClosed = new Date(b.drawDate).getTime() <= Date.now() || b.status === 'completed';

        if (aIsClosed && !bIsClosed) return 1;
        if (!aIsClosed && bIsClosed) return -1;
        return 0;
    });

    const displayLotteries = sortedLotteries.slice(0, 15);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500/30 selection:text-orange-950 font-sans pb-24 md:pb-12">
            <UserHeader />
            <UserHome lotteries={displayLotteries} paymentMethods={paymentMethods} />
        </div>
    );
}
