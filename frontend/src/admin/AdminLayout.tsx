// src/admin/AdminLayout.tsx
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminSession, clearAdminSession } from './adminSession';
import './AdminDashboard.css';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getAdminSession();

  // 未登录 / session 无效 → 跳回登录页
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
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        {/* 顶部 Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <h2 className="admin-header-title">Admin Dashboard</h2>
          </div>

          <div className="admin-header-right">
            <span className="admin-header-user">
              {admin.name ? `Hi, ${admin.name}` : admin.email}
            </span>
            <button
              type="button"
              className="admin-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* 主内容区域 */}
        <div className="admin-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
