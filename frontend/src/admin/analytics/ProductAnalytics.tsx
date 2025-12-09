export default function ProductAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Product Analytics</h2>
        <p className="text-sm text-slate-500">
          UI placeholder only. No analytics data wired yet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Top Sellers</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>

        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Low Performers
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>

        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Low Inventory Items
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>

        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Product Conversion Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Top 10 Products
            </h3>
            <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>This month</option>
              <option>This week</option>
            </select>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              List of slow-moving products
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Inventory level analysis
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Inventory level analysis
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Product Views vs. Sales Analysis
            </h3>
            <p className="text-xs text-slate-500">
              High Views & Low Sales → Product Content Issues | Low Views & Low Sales → Need for Marketing Traffic
            </p>
          </div>
          <span className="text-xs text-slate-500">No data</span>
        </div>
        <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
          Waiting for data
        </div>
      </div>
    </div>
  );
}
