// src/pages/Receipt.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api/client';
import { Order } from '../types';

export default function Receipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(parseInt(orderId));
    }
  }, [orderId]);

  const fetchOrder = async (id: number) => {
    try {
      const data = await getOrder(id);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p>Order not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
        <p className="text-green-700">Thank you for your purchase. Your order has been received.</p>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Order Details</h2>
        <div className="space-y-2 mb-4">
          <p><span className="font-semibold">Order ID:</span> #{order.id}</p>
          <p><span className="font-semibold">Status:</span> {order.state}</p>
          <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</p>
          <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition-colors"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}

