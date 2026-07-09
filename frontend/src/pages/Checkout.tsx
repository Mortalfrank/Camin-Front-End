// src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkout, CheckoutRequest, createPaypalOrder, getShippingAddresses, ShippingAddress } from '../api/client';
import { Order, PaymentMethod } from '../types';
import StripeCardForm from '../components/StripeCardForm';
import { createStripeIntent, completeStripePayment } from '../api/client';
import { addShippingAddress } from '../api/client';


export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeData, setStripeData] = useState<{
    clientSecret: string;
    publishableKey: string;
    orderId: number;
  } | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);



  useEffect(() => {
    let cancelled = false;
    getShippingAddresses().then((addrs) => {
      if (cancelled) return;
      setSavedAddresses(addrs);
      const def = addrs.find((a) => a.isDefault);
      if (def) {
        setSelectedAddressId(def.id);
        setRecipientName(def.recipientName);
        setRecipientPhoneNumber(def.phoneNumber);
        setDeliveryAddress(def.address);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const savedOrderId = sessionStorage.getItem('paypalPendingOrderId');
    const savedTotal = sessionStorage.getItem('paypalPendingTotal');
    if (savedOrderId && savedTotal) {
      setPendingOrder({ id: Number(savedOrderId) } as Order);
      setConfirmedTotal(Number(savedTotal));
    }
  }, []);


  const handleCheckout = async () => {
    if (items.length === 0 && !pendingOrder) {
      alert('Cart is empty');
      return;
    }
    if (!deliveryAddress.trim() || !recipientName.trim() || !recipientPhoneNumber.trim() || !receiptEmail.trim()) {
      setError('Please fill out delivery address, recipient name, phone number, and receipt email.');
      return;
    }

    // 手动输入了新地址，询问是否保存
    if (selectedAddressId === null) {
      setPendingOrder(null);
      sessionStorage.removeItem('paypalPendingOrderId');
      sessionStorage.removeItem('paypalPendingTotal');
      setShowSaveModal(true);
      return;
    }

    await doCheckout();
  };

  const handleModalDecision = async (save: boolean) => {
    setShowSaveModal(false);
    if (save) {
      try {
        await addShippingAddress({
          recipientName: recipientName.trim(),
          phoneNumber: recipientPhoneNumber.trim(),
          address: deliveryAddress.trim(),
          isDefault: saveAsDefault,
        });
        const addrs = await getShippingAddresses();
        setSavedAddresses(addrs);
      } catch {}
    }
    await doCheckout();
  };

  const doCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
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
          setPendingOrder(order);
      }

      if (paymentMethod === 'PAYPAL') {
        const paypalOrder = await createPaypalOrder(order.id);
        sessionStorage.setItem('paypalPendingOrderId', String(order.id));
        sessionStorage.setItem('paypalPendingTotal', String(order.totalAmount));
        window.location.href = paypalOrder.approvalLink;
        return;
      }

      if (paymentMethod === 'CREDIT_CARD') {
        const intent = await createStripeIntent(order.id);
        setStripeData({
          clientSecret: intent.clientSecret,
          publishableKey: intent.publishableKey,
          orderId: order.id,
        });
        setLoading(false);
        return;
      }

      await clearCart();
      navigate(`/receipt/${order.id}`);
    } catch (error: any) {
      if (pendingOrder) {
        setPendingOrder(null);
        setConfirmedTotal(null);
        sessionStorage.removeItem('paypalPendingOrderId');
        sessionStorage.removeItem('paypalPendingTotal');
      }
      alert(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CREDIT_CARD', label: 'Credit / Debit Card' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'CASH', label: 'Cash on Delivery' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {showSaveModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-2">Save this address?</h3>
          <p className="text-sm text-gray-600 mb-4">
            {recipientName} · {recipientPhoneNumber}<br />
            {deliveryAddress}
          </p>
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
            />
            Set as default address
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleModalDecision(true)}
              className="flex-1 py-2 bg-black text-white rounded font-semibold hover:bg-gray-800"
            >
              Save
            </button>
            <button
              onClick={() => handleModalDecision(false)}
              className="flex-1 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )}
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
          {savedAddresses.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Saved Addresses</p>
              {savedAddresses.map((addr) => (
                <label key={addr.id} className="flex items-start gap-2 border rounded p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setRecipientName(addr.recipientName);
                      setRecipientPhoneNumber(addr.phoneNumber);
                      setDeliveryAddress(addr.address);
                    }}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <span className="font-medium">{addr.recipientName}</span>
                    <span className="text-gray-500 ml-2">{addr.phoneNumber}</span>
                    {addr.isDefault && <span className="ml-2 text-xs bg-black text-white px-1.5 py-0.5 rounded">Default</span>}
                    <p className="text-gray-600">{addr.address}</p>
                  </div>
                </label>
              ))}
              <label className="flex items-center gap-2 border rounded p-3 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="savedAddress"
                  checked={selectedAddressId === null}
                  onChange={() => {
                    setSelectedAddressId(null);
                    setRecipientName('');
                    setRecipientPhoneNumber('');
                    setDeliveryAddress('');
                  }}
                />
                <span className="text-sm">Enter a new address</span>
              </label>
            </div>
          )}
          <h2 className="text-xl font-semibold mb-4">Shipping & Contact</h2>
          <div className="space-y-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Delivery Address</label>
              <textarea
                className="border rounded px-3 py-2"
                value={deliveryAddress}
                onChange={(e) => {
                  if (selectedAddressId !== null) setSelectedAddressId(null);
                  setDeliveryAddress(e.target.value);
                }}
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
                  onChange={(e) => {
                  if (selectedAddressId !== null) setSelectedAddressId(null);
                  setRecipientName(e.target.value);
                }}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Recipient's Phone Number</label>
                <input
                  className="border rounded px-3 py-2"
                  value={recipientPhoneNumber}
                  onChange={(e) => {
                  if (selectedAddressId !== null) setSelectedAddressId(null);
                  setRecipientPhoneNumber(e.target.value);
                }}
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
                    if (method !== 'CREDIT_CARD') {
                      setStripeData(null);
                    }
                  }}
                  className="w-4 h-4"
                />
                <span>{method.label}</span>
              </label>
            ))}
            {stripeData && (paymentMethod === 'CREDIT_CARD') && (
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
                      await clearCart();
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
