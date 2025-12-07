const menuItems = [
  'Home',
  'Online Page',
  'Products',
  'People',
  'Analytics',
  'Discounts',
  'Finance',
  'Settings',
];

export default function AdminSidebar() {
  return (
    <aside className="flex w-60 flex-col bg-slate-200 text-black-950">
      {/* Reserve the top spacing to align the left side with the top header for a better look */}
      <div className="h-14" />

      <nav className="flex-1 space-y-1 px-2">
        {menuItems.map((item) => (
          <div
            key={item}
            className="cursor-pointer rounded-md px-3 py-2 text-sm text-black-950 transition hover:bg-slate-100"
          >
            {item}
          </div>
        ))}
      </nav>
    </aside>
  );
}
