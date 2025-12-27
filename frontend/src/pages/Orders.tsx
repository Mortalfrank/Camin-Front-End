import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrders } from '../api/client';
import { Order, OrderItem } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadOrders() {
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user, navigate]);

  const statusStyles = useMemo(
    () => ({
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      TRANSPORTING: 'bg-blue-100 text-blue-800',
      ARRIVED: 'bg-emerald-100 text-emerald-800',
      ACCEPTED: 'bg-emerald-100 text-emerald-800',
      RETURNED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-200 text-gray-800',
    }),
    [],
  );

  const getStatusStyle = (state: Order['state']) =>
    statusStyles[state] || 'bg-gray-100 text-gray-700';

  const getItemSubtotal = (item: OrderItem) =>
    typeof item.subtotal === 'number'
      ? item.subtotal
      : (item.unitPrice || 0) * item.quantity;

  const formatPaymentMethod = (method?: string) =>
    method ? method.replace('_', ' ') : 'N/A';

  const formatCurrency = (value: number) => value.toFixed(2);

  if (loading) {
    return <div className="p-8 text-center">Loading your orders...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Member Center</p>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">All your purchases in one place.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
          <p className="text-gray-600 mt-2">You have not placed any orders.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-gray-800 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
          >
            Browse products
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order.id}{order.orderNumber ? ` · ${order.orderNumber}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Payment: {formatPaymentMethod(order.paymentMethod)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                    order.state,
                  )}`}
                >
                  {order.state}
                </span>
                <Link
                  to={`/receipt/${order.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View details
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × ${formatCurrency(item.unitPrice ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${formatCurrency(getItemSubtotal(item))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ${formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
