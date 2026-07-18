import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import ShopSidebar from './components/Sidebar';
import ShopHeader from './components/Header';

const CLE_REPLI = 'yobante.sidebar.replie';

export default function ShopLayout() {
  // L'état du menu est conservé d'une visite à l'autre : le rouvrir à chaque
  // navigation serait pénible pour qui l'a volontairement replié.
  const [replie, setReplie] = useState(
    () => localStorage.getItem(CLE_REPLI) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(CLE_REPLI, String(replie));
  }, [replie]);

  return (
    // `h-screen` + `overflow-hidden` : seule la zone de droite défile, la
    // barre latérale et l'entête restent en place.
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ShopSidebar replie={replie} onBasculer={() => setReplie((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <ShopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
