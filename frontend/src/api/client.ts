// src/api/client.ts
import { API_BASE_URL } from '../config/env';

// 获取当前用户ID（从 localStorage）
function getCurrentUserId(): number | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// 创建带用户ID的请求头
function getHeaders(includeUserId: boolean = true): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (includeUserId) {
    const userId = getCurrentUserId();
    if (userId) {
      headers['X-USER-ID'] = String(userId);
    }
  }
  return headers;
}
import type { Order, PaymentMethod } from '../types';

// Health Check: Returns plain text
export async function fetchHealth(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.text();
}

// To obtain the User list: First use any, and then you can add the user type later
export async function fetchUsers(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return res.json();
}

// Create the user request body
export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
}

// Creat User
export async function createUser(data: CreateUserRequest): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ========== Register API ==========

export interface EmailSignUpRequest {
  email: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
}

export interface PhoneSignUpRequest {
  phoneNumber: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
}

// The format returned at the back end
export interface SignUpResponse {
  userId?: number;
  error?: string;
  message?: string;
}

// Email Register
export async function signUpWithEmail(
  data: EmailSignUpRequest,
): Promise<SignUpResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Phone Register
export async function signUpWithPhone(
  data: PhoneSignUpRequest,
): Promise<SignUpResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup/phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ========== Login API ==========

// Login Response (shared by email and phone login)
export interface LoginResponse {
  id: number;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginErrorResponse {
  error: string;
}

// Email Login Request
export interface EmailLoginRequest {
  email: string;
  password: string;
}

// Phone Login Request
export interface PhoneLoginRequest {
  phoneNumber: string;
  password: string;
}

// Email Login
export async function loginWithEmail(
  data: EmailLoginRequest
): Promise<LoginResponse | LoginErrorResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || err?.error || 'Login failed' };
    }

    return await res.json();
  } catch (error) {
    console.error('[loginWithEmail] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// Phone Login
export async function loginWithPhone(
  data: PhoneLoginRequest
): Promise<LoginResponse | LoginErrorResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || err?.error || 'Login failed' };
    }

    return await res.json();
  } catch (error) {
    console.error('[loginWithPhone] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// ========== Admin Login API (optional, if you want to keep it separate) ==========

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function adminLogin(
  data: AdminLoginRequest
): Promise<AdminLoginResponse | { error: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || err?.error || 'Login failed' };
    }

    const json = (await res.json()) as AdminLoginResponse;
    return json;
  } catch (error) {
    console.error('[adminLogin] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// ========== Helper function to check if response is an error ==========

export function isLoginError(
  response: LoginResponse | LoginErrorResponse
): response is LoginErrorResponse {
  return 'error' in response;
}

// ========== Profile API ==========

export interface ProfileResponse {
  id: number;
  email: string;
  username: string;
  gender: string;
  phoneNumber: string;
  dob: string;
  role: 'USER' | 'ADMIN';
}

export interface UpdateProfileRequest {
  username?: string;
  gender?: string;
  dob?: string;
  phoneNumber?: string;
  phoneVerificationCode?: string;
  email?: string;
  emailVerificationCode?: string;
}

export interface SendProfileUpdateCodeRequest {
  method: 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
}

// 获取用户信息
export async function getProfile(userId: number): Promise<ProfileResponse | { error: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.error || 'Failed to fetch profile' };
    }
    return await res.json();
  } catch (error) {
    console.error('[getProfile] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// 发送更新验证码
export async function sendProfileUpdateCode(
  userId: number,
  data: SendProfileUpdateCodeRequest
): Promise<{ message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/${userId}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('[sendProfileUpdateCode] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// 更新用户信息
export async function updateProfile(
  userId: number, 
  data: UpdateProfileRequest
): Promise<ProfileResponse | { error: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.error || 'Failed to update profile' };
    }
    return await res.json();
  } catch (error) {
    console.error('[updateProfile] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// Helper function
export function isProfileError(
  response: ProfileResponse | { error: string }
): response is { error: string } {
  return 'error' in response;
}


// ========== Cart API ==========
export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export async function addToCart(data: AddToCartRequest): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function getCart(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/cart`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update quantity');
  return res.json();
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove item');
}

export async function clearCart(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear cart');
}

// ========== Order API ==========
export interface CheckoutRequest {
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  recipientName: string;
  recipientPhoneNumber: string;
  receiptEmail: string;
}

export async function checkout(data: CheckoutRequest): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Checkout failed');
  }
  return res.json();
}

export async function getUserOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function getOrder(orderId: number): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

// ========== PayPal API ==========
export interface CreatePaypalOrderResponse {
  approvalLink: string;
  paypalOrderId?: string;
}

export async function createPaypalOrder(orderId: number): Promise<CreatePaypalOrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/payments/paypal/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || error?.error || 'Failed to create PayPal order');
  }
  return res.json();
}

export interface CompletePaypalPaymentRequest {
  orderId: number;
  paypalOrderId?: string;
  status?: string;
  amount?: string;
}

export interface CompletePaypalPaymentResponse {
  message?: string;
  paymentReference?: string;
}

export async function completePaypalPayment(
  data: CompletePaypalPaymentRequest
): Promise<CompletePaypalPaymentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/payments/paypal/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || error?.error || 'Failed to complete PayPal payment');
  }
  return res.json();
}

// ========== Verification Code API ==========

export interface SendCodeRequest {
  method: 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
}

export interface SendCodeResponse {
  message?: string;
  expiresIn?: number;
  error?: string;
}

// 发送验证码（支持邮箱和手机）
export async function sendVerificationCode(
  data: SendCodeRequest
): Promise<SendCodeResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/verification/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('[sendVerificationCode] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// 更新 EmailSignUpRequest，添加 verificationCode 字段
export interface EmailSignUpRequest {
  email: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  verificationCode: string;  // 新增
}

// PhoneSignUpRequest 保持不变
export interface PhoneSignUpRequest {
  phoneNumber: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  verificationCode: string;
}

// ========== Password Reset API ==========

export interface ForgotPasswordRequest {
  method: 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
}

export interface ResetPasswordRequest {
  method: 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
  verificationCode: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message?: string;
  expiresIn?: number;
  error?: string;
}

// 发送密码重置验证码
export async function sendResetCode(
  data: ForgotPasswordRequest
): Promise<PasswordResetResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('[sendResetCode] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// 重置密码
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<PasswordResetResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error('[resetPassword] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

// ========== Stripe API ==========
export interface StripePaymentIntentResponse {
  orderId: number;
  clientSecret: string;
  publishableKey: string;
}

export async function createStripeIntent(orderId: number): Promise<StripePaymentIntentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/payments/stripe/create-intent`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to create Stripe payment intent');
  }
  return res.json();
}

export async function completeStripePayment(orderId: number, paymentIntentId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/payments/stripe/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orderId, paymentIntentId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || 'Failed to complete Stripe payment');
  }
}

// ========== Shipping Address API ==========
export interface ShippingAddress {
  id: number;
  recipientName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}

export async function getShippingAddresses(): Promise<ShippingAddress[]> {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch addresses');
  return res.json();
}

export async function addShippingAddress(data: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
  const res = await fetch(`${API_BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add address');
  return res.json();
}

export async function updateShippingAddress(id: number, data: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update address');
  return res.json();
}

export async function deleteShippingAddress(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/addresses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete address');
}
