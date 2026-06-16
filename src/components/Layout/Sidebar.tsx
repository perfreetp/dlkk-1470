
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Settings, Building2 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', name: '工作台', icon: LayoutDashboard },
  { path: '/applications', name: '申报列表', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold">医证通</h1>
            <p className="text-xs text-slate-400">执业登记申报系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span>系统设置</span>
        </button>
      </div>
    </aside>
  );
}
