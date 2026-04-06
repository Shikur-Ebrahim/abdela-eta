import { Trophy } from "lucide-react";

export default function WinnersPage() {
    return (
        <div className="py-12 md:py-24 max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                <h1 className="text-4xl text-white font-black tracking-tight">Our Recent Winners</h1>
                <p className="text-slate-400 max-w-xl mx-auto">Meet the lucky individuals who drove away in their dream vehicles from Abdela Car Lottery.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Placeholder for winner cards */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                        <p className="text-slate-500 font-medium">Winner photo</p>
                        <div className="absolute bottom-4 left-4 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full border border-yellow-500/30 backdrop-blur-md">
                            Round 40
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white">Toyota Hilux 2024</h3>
                        <p className="text-emerald-400 font-medium mt-1">Won by: Abebe K. (Addis Ababa)</p>
                        <p className="text-slate-500 text-sm mt-4">Ticket Number: ZC-89421</p>
                    </div>
                </div>
                {/* More cards can be populated here */}
            </div>
        </div>
    );
}
