import { useAuthStore } from '@/auth/store/auth.store';
import Icon from '@/shared/components/dashboard/Icon';

export default function ShipmentHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.prenom} {user?.nom}
        </span>
        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-500 transition-colors"
          title="Déconnexion"
        >
          <Icon name="log-out" size={18} />
        </button>
      </div>
    </header>
  );
}
