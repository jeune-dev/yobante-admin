import { Outlet } from 'react-router-dom';
import ShopSidebar from './components/Sidebar';
import ShopHeader from './components/Header';

export default function ShopLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ShopSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ShopHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
