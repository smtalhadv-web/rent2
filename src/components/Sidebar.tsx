import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  MessageCircle,
  Receipt,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, settings } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tenants', href: '/tenants', icon: Users },
    { name: 'Lease Management', href: '/leases', icon: FileText },
    { name: 'Rent Sheet', href: '/rent-sheet', icon: Calendar },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Ledger', href: '/ledger', icon: BarChart3 },
    { name: 'Invoice', href: '/invoice', icon: Receipt },
    { name: 'Import Data', href: '/import', icon: Upload },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const filteredNav = navigation.filter((item) => {
    if (user?.role === 'owner') {
      return ['Dashboard', 'Reports', 'Ledger'].includes(item.name);
    }
    if (user?.role === 'accountant') {
      return ['Dashboard', 'Payments', 'Rent Sheet', 'Ledger', 'Invoice'].includes(item.name);
    }
    return true;
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-indigo-600 text-white rounded-lg md:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-indigo-950">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-indigo-300" />
            <span className="text-white font-bold text-lg truncate">
              {settings.plazaName || 'Plaza Manager'}
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700 bg-indigo-900">
          <div className="flex items-center gap-3 text-indigo-200 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-700 flex items-center justify-center">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
