import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatOrderState } from "../../utils/formatState"
import OrderStatusBadge from "../../components/OrderStatusBadge";


type User = {
    id: number;
    username?: string;
    email?: string;
}

type OrderSummary = {
  id: number;
  user: User;
  orderNumber: string;
  state: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  arrivedAt?: string | null;
};

export default function AdminOrdersList() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE}/api/admin/orders`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setError("Unexpected data format from server.");
        }
      } catch (err: any) {
        console.error("Failed to load admin orders:", err);
        setError(err.message ?? "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

    // Search Function
    const filteredOrders = useMemo(() => {
        const q = query.trim().toLowerCase();
        if(!q) return orders;

        return orders.filter((o) => {
            const orderNo = String(o.orderNumber ?? "").toLowerCase();
            const username = String(o.user.username ?? "").toLowerCase();
            return orderNo.includes(q) || username.includes(q);
        });
    }, [orders, query]);

  if (loading) {
    return <div className="text-lg font-medium">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Failed to load orders: {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>
        {/* Search Bar */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:max-w-md">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username or order number..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            {query.trim() && (
                <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                Clear
                </button>
            )}
            </div>

            {/* Resultes Number */}
            <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{filteredOrders.length}</span>{" "}
            of <span className="font-medium text-slate-700">{orders.length}</span>
            </div>
        </div>
      {orders.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No orders found in database.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    {order.orderNumber ?? order.id}
                  </td>
                  <td className="px-4 py-3"> <OrderStatusBadge state={order.state} /></td>
                  <td className="px-4 py-3">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{order.user.username}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
