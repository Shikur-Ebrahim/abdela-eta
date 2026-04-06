import { Car, Ticket, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Dashboard</h2>
                <p className="text-slate-400 text-sm mt-1">Real-time overview of your car lottery platform.</p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {/* Static Stat Cards for now */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-400">Total Cars</p>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Car className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">24</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-400">Active Lotteries</p>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <Ticket className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">3</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-400">Registered Users</p>
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">12,543</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-400">Total Revenue</p>
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-white">ETB 4.2M</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 min-h-[400px]">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="flex items-center justify-center h-full pt-20">
                    <p className="text-slate-500">Activity chart will be implemented here.</p>
                </div>
            </div>
        </div>
    );
}
