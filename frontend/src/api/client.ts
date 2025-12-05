// frontend/src/api/client.ts

// Vite 环境变量（如果之后 TS 报错，再加 vite-env.d.ts，下面会说）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// 健康检查：返回纯文本
export async function fetchHealth(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.text();
}

// 获取用户列表：暂时用 any，后面可以再加 User 类型
export async function fetchUsers(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return res.json();
}

// 创建用户
export interface CreateUserRequest {
  email: string;
  password: string;
  username: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
}

export async function createUser(data: CreateUserRequest): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ========== 新增：注册 API ==========

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

// 后端实际返回结构大概类似：{ userId: 1, error?: string, message?: string }
export interface SignUpResponse {
  userId?: number;
  error?: string;
  message?: string;
}

// 邮箱注册
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

// 手机号注册
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
