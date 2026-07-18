import { Outlet } from 'react-router-dom';
import ShipmentSidebar from './components/Sidebar';
import ShipmentHeader from './components/Header';

export default function ShipmentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ShipmentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ShipmentHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
