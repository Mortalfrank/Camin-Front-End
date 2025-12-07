// src/admin/AdminDashboard.tsx

export default function AdminDashboard() {
  return (
    <div className="space-y-6 text-center">
    <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-500">
        Basic overview of your platform performance.
        </p>
    </div>

    {/* KPI Card row */}
    <div className="grid gap-4 md:grid-cols-3">
    <div className="rounded-xl bg-amber-100 px-4 py-5 text-center shadow-sm">
        <div className="text-sm font-medium text-amber-800">Users</div>
        <div className="mt-2 text-2xl font-semibold text-amber-900">
        * new users
        </div>
    </div>

    <div className="rounded-xl bg-sky-100 px-4 py-5 text-center shadow-sm">
        <div className="text-sm font-medium text-sky-800">Clicks</div>
        <div className="mt-2 text-2xl font-semibold text-sky-900">
        * page views
        </div>
    </div>

    <div className="rounded-xl bg-emerald-100 px-4 py-5 text-center shadow-sm">
        <div className="text-sm font-medium text-emerald-800">Sales</div>
        <div className="mt-2 text-2xl font-semibold text-emerald-900">
        * new orders
        </div>
    </div>
    </div>

    {/* Chart placeholder */}
    <div className="grid gap-4 md:grid-cols-3">
        <div className="flex h-40 items-center justify-center rounded-xl bg-white text-sm text-slate-400 shadow-sm">
            Line Chart
        </div>
        <div className="flex h-40 items-center justify-center rounded-xl bg-white text-sm text-slate-400 shadow-sm">
            Pie Chart
        </div>
        <div className="flex h-40 items-center justify-center rounded-xl bg-white text-sm text-slate-400 shadow-sm">
            Bar Chart
        </div>
        </div>
    </div>
  );
}
