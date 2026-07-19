import { useQuery } from '@tanstack/react-query';
import shopClient from '@/infrastructure/http/shop.client';

const api = {
  getKpi: () => shopClient.get('/admin/dashboard/kpi-complet'),
};

function KpiCard({ label, value, sub, color = 'bg-white' }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className={`${color} rounded-xl border border-gray-100 p-4 shadow-sm`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '…'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpi'],
    queryFn: api.getKpi,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Chargement du dashboard…
      </div>
    );
  }

  const kpi = data?.kpi || {};
  const revenus = data?.revenusParMois || [];
  const produitsPlusVendus = data?.produitsPlusVendus || [];
  const commandesParStatut = data?.commandesParStatut || [];
  const commandesRecentes = data?.commandesRecentes || [];
  const produitsRupture = data?.produitsRupture || [];
  const kpiStocks = data?.kpiStocks || {};

  const maxRevenu = Math.max(...revenus.map((r: any) => r.revenus), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Boutique</h1>

      {/* Row 1 — KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Clients" value={kpi.totalClients?.toLocaleString('fr-FR')} color="bg-blue-50" />
        <KpiCard label="Vendeurs" value={kpi.totalVendeurs?.toLocaleString('fr-FR')} color="bg-purple-50" />
        <KpiCard label="Produits actifs" value={kpi.totalProduits?.toLocaleString('fr-FR')} color="bg-green-50" />
        <KpiCard label="Commandes" value={kpi.totalCommandes?.toLocaleString('fr-FR')} color="bg-yellow-50" />
      </div>

      {/* Row 2 — CA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="CA du jour" value={kpi.caJour ? `${kpi.caJour.toLocaleString('fr-FR')} FCFA` : '0 FCFA'} color="bg-white" />
        <KpiCard label="CA du mois" value={kpi.caMois ? `${kpi.caMois.toLocaleString('fr-FR')} FCFA` : '0 FCFA'} color="bg-white" />
        <KpiCard label="En attente" value={kpi.commandesEnAttente} sub="commandes" color="bg-orange-50" />
        <KpiCard label="Promos actives" value={kpi.promotionsActives} color="bg-pink-50" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenus par mois */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Revenus par mois ({new Date().getFullYear()})
          </h2>
          <div className="flex items-end gap-1 h-40">
            {revenus.map((r: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-yellow-400 rounded-t"
                  style={{
                    height: `${Math.round((r.revenus / maxRevenu) * 100)}%`,
                    minHeight: r.revenus > 0 ? '4px' : '0',
                  }}
                  title={`${(r.revenus || 0).toLocaleString('fr-FR')} FCFA`}
                />
                <span className="text-xs text-gray-400">{MOIS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statuts commandes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Commandes par statut</h2>
          <div className="space-y-2">
            {commandesParStatut.map((s: any) => (
              <div key={s.statut} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{s.statut?.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
            {commandesParStatut.length === 0 && (
              <p className="text-sm text-gray-400">Aucune donnée</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Top 10 produits vendus</h2>
          <div className="space-y-2">
            {produitsPlusVendus.map((p: any, i: number) => (
              <div key={p.produitId} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                <span className="flex-1 text-sm truncate">{p.nom}</span>
                <span className="text-sm font-semibold text-gray-900">{p.totalVendu}</span>
              </div>
            ))}
            {produitsPlusVendus.length === 0 && (
              <p className="text-sm text-gray-400">Aucune vente</p>
            )}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Stocks</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-500">En rupture</p>
              <p className="font-bold text-red-700">{kpiStocks.produitsEnRupture ?? 0}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-orange-500">Stock faible</p>
              <p className="font-bold text-orange-700">{kpiStocks.stockFaible ?? 0}</p>
            </div>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {produitsRupture.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs py-1 border-b border-gray-50"
              >
                <span className="truncate text-gray-700">{p.nom}</span>
                <span className="text-red-500 font-semibold ml-2">0</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Commandes récentes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="pb-2 font-medium text-gray-500">Référence</th>
              <th className="pb-2 font-medium text-gray-500">Client</th>
              <th className="pb-2 font-medium text-gray-500">Montant</th>
              <th className="pb-2 font-medium text-gray-500">Statut</th>
              <th className="pb-2 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {commandesRecentes.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="py-2 font-mono text-xs">{c.reference}</td>
                <td className="py-2">
                  {c.user?.prenom} {c.user?.nom}
                </td>
                <td className="py-2">{c.montantTotal?.toLocaleString('fr-FR')} FCFA</td>
                <td className="py-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">{c.statut}</span>
                </td>
                <td className="py-2 text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Named export kept for backward compatibility
export { DashboardPage as ShopDashboard };
