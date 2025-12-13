// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkout, CheckoutRequest } from '../api/client';
import { PaymentMethod } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !loading && !checkoutComplete) {
      navigate('/cart');
    }
  }, [items, loading, checkoutComplete, navigate]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const request: CheckoutRequest = { paymentMethod };
      const order = await checkout(request);
      await clearCart();
      setCheckoutComplete(true);
      navigate(`/receipt/${order.id}`);
    } catch (error: any) {
      alert(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CASH', label: 'Cash on Delivery' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-4 h-4"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 !bg-white !text-black py-3 rounded border !border-black hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
            style={{ color: '#000', backgroundColor: '#fff' }}
          >
            <span className="text-black">{loading ? 'Processing...' : 'Complete Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
