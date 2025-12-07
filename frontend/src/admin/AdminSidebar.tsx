import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const [openProducts, setOpenProducts] = useState(
    location.pathname.startsWith("/admin/products")
  );

  return (
    <aside className="flex w-60 flex-col bg-slate-200 text-black-950">
      <div className="h-14" />

      <nav className="flex-1 space-y-1 px-2">

        {/* Home */}
        <Link
          to="/admin"
          className={`block cursor-pointer rounded-md px-3 py-2 text-sm no-underline transition hover:bg-slate-100 ${
            location.pathname === "/admin" ? "font-semibold" : ""
          }`}
        >
          Home
        </Link>

        {/* Online Page */}
        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          Online Page
        </div>

        <button
            type="button"
            onClick={() => setOpenProducts(!openProducts)}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm !font-normal
            transition hover:bg-slate-100 !bg-slate-200"
        >
          <span>Products</span>
          <span className="text-xs">{openProducts ? "▾" : "▸"}</span>
        </button>

        {/* Submenu Pull the drawing down */}
        <div
          className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
            openProducts ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <Link
            to="/admin/products/list"
            className={`block rounded-md px-3 py-2 text-sm no-underline transition hover:bg-slate-100 ${
              location.pathname.includes("/admin/products/list")
                ? "bg-slate-100 font-semibold"
                : ""
            }`}
          >
            List
          </Link>
        </div>

        {/* Others */}
        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          People
        </div>

        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          Analytics
        </div>

        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          Discounts
        </div>

        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          Finance
        </div>

        <div className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-slate-100">
          Settings
        </div>
      </nav>
    </aside>
  );
}
