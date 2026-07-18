import { NavLink } from 'react-router-dom';
import Icon from '@/shared/components/dashboard/Icon';

const NAV = [
  { label: 'Dashboard', icon: 'layout-dashboard', path: '/colis/dashboard' },
];

export default function ShipmentSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="font-bold text-lg text-gray-900">
          Yobante <span className="text-blue-600">Colis</span>
        </span>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
