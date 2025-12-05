// src/api/client.ts
import { API_BASE_URL } from '../config/env';

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

// ----------------------
// 🔹 Admin Login API
// ----------------------

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

    // Backend Error（400/401/403/500）
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.message || err?.error || 'Login failed' };
    }

    // The format returned by the back end is
    // {id, email, name, role}
    const json = (await res.json()) as AdminLoginResponse;
    return json;
  } catch (error) {
    console.error('[adminLogin] Network error:', error);
    return { error: 'Network error, please try again' };
  }
}

