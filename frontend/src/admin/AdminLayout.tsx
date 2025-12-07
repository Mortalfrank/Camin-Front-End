import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminSession, clearAdminSession } from './adminSession';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getAdminSession();

  if (!admin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* The entire Header at the top: across the entire screen */}
      <header className="flex h-14 items-center gap-4 bg-slate-900 px-6 text-slate-100">
        {/* Left：System Name*/}
        <div className="text-lg font-semibold tracking-tight">
          Camin Admin
        </div>

        {/* Middle：Search bar */}
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              Ctrl + K
            </span>
          </div>
        </div>

        {/* Right：Hi admin + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-100">
            {admin.name ? `Hi, ${admin.name}` : `Hi, ${admin.email}`}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slate-300 bg-white px-4 py-1 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Bottom：Sidebar + The main content is arranged horizontally */}
      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
