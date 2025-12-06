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