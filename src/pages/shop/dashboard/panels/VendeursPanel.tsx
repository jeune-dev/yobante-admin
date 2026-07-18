import { useState } from 'react';
import { useVendeurs, useValiderVendeur, useToggleVendeur, useCreerVendeur } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { StateRow } from './_state';

interface Vendeur {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  isActive?: boolean;
  statutValidation?: string;
  boutique?: { nom?: string } | string;
}

const nomBoutique = (b: Vendeur['boutique']) =>
  typeof b === 'string' ? b : b?.nom || '—';

const EMPTY = { nom: '', prenom: '', email: '', telephone: '', password: '', nomBoutique: '', adresseBoutique: '' };

export default function VendeursPanel() {
  const { data, isLoading, isError } = useVendeurs();
  const valider = useValiderVendeur();
  const toggle = useToggleVendeur();
  const creer = useCreerVendeur();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const vendeurs: Vendeur[] = data?.vendeurs ?? [];

  const handleCreer = () => {
    if (!form.nom || !form.prenom || !form.email || !form.password || !form.nomBoutique) return;
    creer.mutate(form, { onSuccess: () => { setModal(false); setForm(EMPTY); } });
  };

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{vendeurs.length} vendeur(s)</div>
        <button className="db-btn primary" style={{ marginLeft: 'auto' }} onClick={() => { setForm(EMPTY); setModal(true); }}>
          + Ajouter un vendeur
        </button>
      </div>
      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Boutique</th>
                <th>Email</th>
                <th>Validation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={6} loading={isLoading} error={isError} empty={vendeurs.length === 0} emptyLabel="Aucun vendeur" />
              {!isLoading && !isError &&
                vendeurs.map((v) => (
                  <tr key={v.id}>
                    <td className="db-td-bold">{v.prenom} {v.nom}</td>
                    <td>{nomBoutique(v.boutique)}</td>
                    <td>{v.email || '—'}</td>
                    <td>
                      <span className="badge bgo">{v.statutValidation || 'En attente'}</span>
                    </td>
                    <td>
                      <span style={{ background: v.isActive ? '#d1fae5' : '#fee2e2', color: v.isActive ? '#065f46' : '#991b1b', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {v.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" style={{ color: '#065f46', borderColor: '#065f46' }} disabled={valider.isPending} onClick={() => valider.mutate({ id: v.id, step: 1 })}>Valider</button>
                        <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(v.id)}>{v.isActive ? 'Désactiver' : 'Activer'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div onClick={() => setModal(false)} className="db-pop-overlay">
          <div onClick={(e) => e.stopPropagation()} className="db-pop" style={{ maxWidth: 480 }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Ajouter un vendeur</div>
              <button className="db-modal-close" onClick={() => setModal(false)}><Icon name="x" size={14} /></button>
            </div>
            <div className="db-pop-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="db-form-group">
                  <label className="db-form-label">Prénom</label>
                  <input className="db-form-input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Nom</label>
                  <input className="db-form-input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Email</label>
                <input className="db-form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Téléphone</label>
                <input className="db-form-input" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Nom de la boutique</label>
                <input className="db-form-input" value={form.nomBoutique} onChange={(e) => setForm({ ...form, nomBoutique: e.target.value })} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Adresse de la boutique</label>
                <input className="db-form-input" value={form.adresseBoutique} onChange={(e) => setForm({ ...form, adresseBoutique: e.target.value })} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Mot de passe</label>
                <input className="db-form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 car., 1 majuscule, 1 chiffre" />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setModal(false)}>Annuler</button>
              <button className="db-btn primary" disabled={creer.isPending} onClick={handleCreer}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
