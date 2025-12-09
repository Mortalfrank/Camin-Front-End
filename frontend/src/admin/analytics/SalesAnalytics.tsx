export default function SalesAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Sales Analytics</h2>
        <p className="text-sm text-slate-500">
          Analytics UI placeholder. Data integration not connected yet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Total Revenue
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Total Orders</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Refund Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Conversion Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Sales Trend</h3>
            <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Month</option>
              <option>Week</option>
              <option>Day</option>
            </select>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Trend line chart placeholder
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Product Analytics
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Visualization placeholder
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Method Analysis
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Visualization placeholder
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Regional Sales
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Visualization placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
