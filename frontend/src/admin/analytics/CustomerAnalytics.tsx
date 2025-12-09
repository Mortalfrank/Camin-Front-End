export default function CustomerAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customer Analytics</h2>
        <p className="text-sm text-slate-500">
          Placeholder view. Customer analytics data not connected yet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            New Customers & Returning Customers
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Repeat Purchase Rate
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">
            Customer Lifetime Value
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
        <div className="rounded-xl bg-white px-4 py-5 shadow-sm">
          <div className="text-sm font-medium text-slate-600">VIP Count</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">--</div>
          <div className="mt-1 text-xs text-slate-500">Waiting for data</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              New vs. Returning Customer Trend Chart
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Customer distribution by spending amount (H/M/L Values)
            </h3>
            <span className="text-xs text-slate-500">No data</span>
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
            Waiting for data
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Recency, Frequency, Monetar
            </h3>
            <p className="text-xs text-slate-500">
              Segment customers by how recent, how often, and how much they spend.
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
