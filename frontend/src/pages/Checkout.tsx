// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkout, CheckoutRequest, createPaypalOrder } from '../api/client';
import { Order, PaymentMethod } from '../types';
import StripeCardForm from '../components/StripeCardForm';
import { createStripeIntent, completeStripePayment } from '../api/client';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<{
    clientSecret: string;
    publishableKey: string;
    orderId: number;
  } | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);


  useEffect(() => {
    if (items.length === 0 && !loading && !checkoutComplete) {
      navigate('/cart');
    }
  }, [items, loading, checkoutComplete, navigate]);

  const handleCheckout = async () => {
    if (items.length === 0 && !pendingOrder) {
      alert('Cart is empty');
      return;
    }

    if (!deliveryAddress.trim() || !recipientName.trim() || !recipientPhoneNumber.trim() || !receiptEmail.trim()) {
      setError('Please fill out delivery address, recipient name, phone number, and receipt email.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 如果订单已创建就复用，不重新下单
      let order = pendingOrder;

      if (!order) {
        const request: CheckoutRequest = {
          paymentMethod,
          deliveryAddress: deliveryAddress.trim(),
          recipientName: recipientName.trim(),
          recipientPhoneNumber: recipientPhoneNumber.trim(),
          receiptEmail: receiptEmail.trim(),
        };
        order = await checkout(request);
        setConfirmedTotal(order.totalAmount);
        await clearCart();
        setCheckoutComplete(true);
        setPendingOrder(order);
      }

      if (paymentMethod === 'PAYPAL') {
        const paypalOrder = await createPaypalOrder(order.id);
        window.location.href = paypalOrder.approvalLink;
        return;
      }

      if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        const intent = await createStripeIntent(order.id);
        setStripeData({
          clientSecret: intent.clientSecret,
          publishableKey: intent.publishableKey,
          orderId: order.id,
        });
        setLoading(false);
        return;
      }

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
              <span>${(confirmedTotal ?? total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping & Contact</h2>
          <div className="space-y-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Delivery Address</label>
              <textarea
                className="border rounded px-3 py-2"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street, city, state, postal code"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Recipient's Name</label>
                <input
                  className="border rounded px-3 py-2"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Recipient's Phone Number</label>
                <input
                  className="border rounded px-3 py-2"
                  value={recipientPhoneNumber}
                  onChange={(e) => setRecipientPhoneNumber(e.target.value)}
                  placeholder="e.g. 0412 345 678"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Receipt Email</label>
              <input
                type="email"
                className="border rounded px-3 py-2"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => {
                    const method = e.target.value as PaymentMethod;
                    setPaymentMethod(method);
                    if (method !== 'CREDIT_CARD' && method !== 'DEBIT_CARD') {
                      setStripeData(null);
                    }
                  }}
                  className="w-4 h-4"
                />
                <span>{method.label}</span>
              </label>
            ))}
            {stripeData && (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Enter Card Details</h2>
                <StripeCardForm
                  clientSecret={stripeData.clientSecret}
                  publishableKey={stripeData.publishableKey}
                  loading={loading}
                  onSuccess={async (paymentIntentId) => {
                    setLoading(true);
                    try {
                      await completeStripePayment(stripeData.orderId, paymentIntentId);
                      navigate(`/receipt/${stripeData.orderId}`);
                    } catch (e: any) {
                      setError(e.message || 'Payment confirmation failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={(msg) => setError(msg)}
                />
              </div>
            )}

          </div>

          {!stripeData && (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 !bg-white !text-black py-3 rounded border !border-black hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              style={{ color: '#000', backgroundColor: '#fff' }}
            >
              <span className="text-black">{loading ? 'Processing...' : 'Complete Order'}</span>
            </button>
          )}
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
