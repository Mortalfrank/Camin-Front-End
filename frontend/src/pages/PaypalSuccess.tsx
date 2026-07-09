import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { completePaypalPayment } from '../api/client';
import { useCart } from '../context/CartContext';

export default function PaypalSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = useCart();

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const token = searchParams.get('token'); // PayPal order id (aka token)

    const orderId = orderIdParam ? Number(orderIdParam) : NaN;
    if (!orderId || Number.isNaN(orderId)) {
      setError('Missing orderId');
      setLoading(false);
      return;
    }
    if (!token) {
      setError('Missing PayPal token');
      setLoading(false);
      return;
    }

    const completePayment = async () => {
      try {
        await completePaypalPayment({
          orderId,
          paypalOrderId: token,
          status: 'COMPLETED',
        });
        await refreshCart();
        sessionStorage.removeItem('paypalPendingOrderId');
        sessionStorage.removeItem('paypalPendingTotal');
        navigate(`/receipt/${orderId}`);
      } catch (err: any) {
        setError(err?.message || 'Failed to confirm PayPal payment');
      } finally {
        setLoading(false);
      }
    };

    void completePayment();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-semibold mb-2">Finalizing your payment...</h1>
        <p className="text-gray-700">Please wait while we confirm your PayPal payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment confirmation failed</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/cart')}
          className="px-4 py-2 rounded bg-black text-white font-semibold hover:bg-gray-900"
        >
          Back to cart
        </button>
      </div>
    );
  }

  return null;
}
