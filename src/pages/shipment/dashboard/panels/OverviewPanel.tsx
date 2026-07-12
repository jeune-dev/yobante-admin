import { useState } from 'react';

const PERIODES = [
  { id: 'jour', label: "Aujourd'hui" },
  { id: 'semaine', label: 'Cette semaine' },
  { id: 'mois', label: 'Ce mois' },
  { id: 'personnalise', label: 'Personnalisé' },
] as const;

type PeriodeId = (typeof PERIODES)[number]['id'];

const FAKE_DATA: Record<PeriodeId, { total: number; franceSenegal: number; senegalFrance: number; enAttente: number }> = {
  jour: { total: 3, franceSenegal: 2, senegalFrance: 1, enAttente: 1 },
  semaine: { total: 18, franceSenegal: 12, senegalFrance: 6, enAttente: 4 },
  mois: { total: 64, franceSenegal: 42, senegalFrance: 22, enAttente: 9 },
  personnalise: { total: 0, franceSenegal: 0, senegalFrance: 0, enAttente: 0 },
};

export default function OverviewPanel() {
  const [periode, setPeriode] = useState<PeriodeId>('mois');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const data = FAKE_DATA[periode];

  const kpis = [
    { label: 'Total colis envoyés', value: data.total, color: 'blue' },
    { label: 'France → Sénégal', value: data.franceSenegal, color: 'green' },
    { label: 'Sénégal → France', value: data.senegalFrance, color: 'gold' },
    { label: 'En attente de validation', value: data.enAttente, color: 'red' },
  ];

  return (
    <div>
      <div className="db-card" style={{ marginBottom: '1.3rem' }}>
        <div className="db-card-body" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', padding: '1rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#888', fontWeight: 600, marginRight: 4 }}>Période :</span>
          {PERIODES.map((p) => (
            <button key={p.id} className={`db-chip${periode === p.id ? ' active' : ''}`} onClick={() => setPeriode(p.id)}>
              {p.label}
            </button>
          ))}
          {periode === 'personnalise' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '0.5rem' }}>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="db-form-input" style={{ width: 160, padding: '0.4rem 0.7rem', fontSize: '0.85rem' }} />
              <span style={{ color: '#888', fontSize: '0.85rem' }}>→</span>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="db-form-input" style={{ width: 160, padding: '0.4rem 0.7rem', fontSize: '0.85rem' }} />
            </div>
          )}
        </div>
      </div>

      <div className="db-stats-grid">
        {kpis.map((kpi, i) => (
          <div className="db-stat-card" key={i}>
            <div className={`db-stat-icon ${kpi.color}`} />
            <div className="db-stat-value">{kpi.value}</div>
            <div className="db-stat-label">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
