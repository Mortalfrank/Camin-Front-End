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
  state: 'PENDING' | 'PAID' | 'CANCELLED' | 'TRANSPORTING' | 'ARRIVED' | 'ACCEPTED' | 'RETURNED';
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
};

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH';

