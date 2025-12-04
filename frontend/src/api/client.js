// frontend/src/api/client.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.text();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ========== 新增：注册 API ==========

// 邮箱注册
export async function signUpWithEmail(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// 手机号注册
export async function signUpWithPhone(data) {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}