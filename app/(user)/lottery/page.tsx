import { Ticket, Filter } from "lucide-react";

export default function LotteryListPage() {
    return (
        <div className="py-8 md:py-16 max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-white">Active Lotteries</h1>
                    <p className="text-slate-400 mt-2">Browse currently active draws and get your tickets.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-300 hover:text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    Sort & Filter
                </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Placeholder for Lottery Cards */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-4 flex flex-col h-full hover:border-emerald-500/50 transition-colors cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-slate-500">Image placeholder</p>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Hyundai Tucson N-Line</h3>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-400">
                            <span>Draw Date</span>
                            <span className="text-white">April 15, 2026</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>Progress</span>
                            <span className="text-emerald-400">65% Sold</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 flex gap-3">
                        <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 font-black text-white flex-1 text-center">
                            ETB 349
                        </div>
                        <button className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                            <Ticket className="h-4 w-4" />
                            Buy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
