import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  BarChart3,
  Shield,
  CreditCard,
  ClipboardList,
  MapPinned,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Election Results', path: '/results', icon: Vote },
  { label: 'Voting Pattern', path: '/voting-pattern', icon: BarChart3 },
  { label: 'Security & Logistics', path: '/security', icon: Shield },
  { label: 'PVC Analysis', path: '/pvc', icon: CreditCard },
  { label: 'Collation', path: '/collation', icon: ClipboardList },
  { label: 'Polling Units', path: '/polling-units', icon: MapPinned },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-gray-200">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-sm text-white">
          CBM
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">Ekiti Situation Room</p>
          <p className="text-[10px] text-primary-600">Real-time Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4">
        <p className="text-[11px] text-gray-400">
          © 2026 CBM Data Analytics
        </p>
      </div>
    </aside>
  );
}
