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
