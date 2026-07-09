// src/types.ts
export type Product = {
  id: number;
  name: string;
  series?: string;
  brand?: string;
  model?: string;
  description?: string;
  texture: string;
  price: number;
  stock: number;
  mainImageUrl?: string;
};

export type CartItem = {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
};

export type OrderItem = {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: number;
  orderNumber?: string;
  state: 'PENDING' | 'PAID' | 'CANCELLED' | 'TRANSPORTING' | 'ARRIVED' | 'ACCEPTED' | 'RETURNED';
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  arrivedAt?: string | null;
  deliveryAddress?: string;
  recipientName?: string;
  recipientPhoneNumber?: string;
  receiptEmail?: string;
  items: OrderItem[];
};

export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'CASH';
