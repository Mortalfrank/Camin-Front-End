import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderStatusBadge from "../../components/OrderStatusBadge";

type ProductInfo = {
  id: number;
  name?: string;
  brand?: string;
  series?: string;
  model?: string;
};

type User = {
    id: number;
    email?: string;
    username?: string;

}
type OrderItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  product?: ProductInfo | null;
};

type OrderDetail = {
  id: number;
  user: User| null;
  orderNumber: string;
  state: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  arrivedAt?: string | null;
  items: OrderItem[];
};

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to load order detail:", err);
        setError(err.message ?? "Failed to load order detail.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  if (loading) {
    return <div className="text-lg font-medium">Loading order detail...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        Failed to load order detail: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Order not found.
      </div>
    );
  }

  const itemsTotal = order.items.reduce((sum, item) => {
    const sub =
      item.subtotal ??
      (item.unitPrice != null && item.quantity != null
        ? item.unitPrice * item.quantity
        : 0);
    return sum + Number(sub);
  }, 0);

  return (
    <div>
      {/* 顶部：返回按钮 + 标题 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/admin/orders/list")}
          className="bg-white rounded-md px-5 py-2 text-sm font-semibold text-sky-400 shadow-sm text-slate-700 transition hover:bg-slate-100"
        >
          ← Back to Orders
        </button>

        <span className="text-xs text-slate-500">
          Order ID: {order.id}
        </span>
      </div>

      <h1 className="mb-4 text-2xl font-semibold tracking-tight">
        Order {order.orderNumber}
      </h1>

      {/* 订单基本信息卡片 */}
      <div className="mb-6 grid gap-4 rounded-md border bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-lg">
                Status: <OrderStatusBadge state={order.state} />
            </p>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Payment: </span>
            <span>{order.paymentMethod}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Total Amount: </span>
            <span className="font-semibold text-emerald-700">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
            <div>
                <span className="font-semibold text-slate-700">Customer: </span>
                <span>
                    {order.user
                    ? (order.user.username || order.user.email || `User #${order.user.id}`)
                    : <span className="text-slate-400 italic">Guest / Unknown</span>
                    }
                </span>
            </div>

            <div>
                <span className="font-semibold text-slate-700">Email: </span>
                <span>
                    {order.user?.email || "-"}
                </span>
            </div>

          <div>
            <span className="font-semibold text-slate-700">Created At: </span>
            <span>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "-"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Arrived At: </span>
            <span>
              {order.arrivedAt
                ? new Date(order.arrivedAt).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 订单项列表 */}
      <h2 className="mb-3 text-lg font-semibold text-slate-800">
        Order Items
      </h2>

      {order.items.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No items found for this order.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item) => {
                const name =
                  item.product?.name ?? `Product #${item.product?.id ?? "-"}`;
                const brand = item.product?.brand ?? "-";
                const subtotal =
                    item.unitPrice != null && item.quantity != null
                    ? item.unitPrice * item.quantity
                    : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3">{brand}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      ${Number(subtotal).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 合计对比 */}
      <div className="mt-4 text-sm text-slate-700">
        <div>
          <span className="font-semibold">Items Total: </span>
          <span>${itemsTotal.toFixed(2)}</span>
        </div>
        <div>
          <span className="font-semibold">Order Total (from order): </span>
          <span>${Number(order.totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
