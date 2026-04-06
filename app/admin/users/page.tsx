import { Search } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Registered Users</h2>
                <p className="text-slate-400 text-sm mt-1">View and manage all user accounts on the platform.</p>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 px-3 py-2 outline-none focus:border-emerald-500/30">
                            <option>All Users</option>
                            <option>Active</option>
                            <option>Banned</option>
                        </select>
                    </div>
                </div>

                {/* Mobile View: Cards */}
                <div className="block md:hidden divide-y divide-slate-800/50">
                    <div className="p-4 hover:bg-slate-800/20 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-white text-base">Abebe Kebede</div>
                                <div className="text-sm text-slate-500">+251 91 123 4567</div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-400">
                                Active
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            <div>
                                 <div className="text-[10px] text-slate-500 font-bold mb-1">Tickets</div>
                                <div className="text-xs text-slate-200">12</div>
                            </div>
                            <div>
                                 <div className="text-[10px] text-slate-500 font-bold mb-1">Total Spent</div>
                                <div className="text-xs text-emerald-500 font-bold">ETB 3,588</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-xl transition-all border border-slate-700">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400 min-w-full">
                        <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Tickets Purchased</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <tr className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">Abebe Kebede</div>
                                    <div className="text-xs text-slate-500">+251 91 123 4567</div>
                                </td>
                                <td className="px-6 py-4">12</td>
                                <td className="px-6 py-4">ETB 3,588</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-400 hover:underline font-bold">View</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
