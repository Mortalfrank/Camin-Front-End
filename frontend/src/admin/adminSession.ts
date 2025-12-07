// src/admin/adminSession.ts

export type AdminSession = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('admin_session');
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as AdminSession;

    if (!data.role || data.role !== 'ADMIN') {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
}
