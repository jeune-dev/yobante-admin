import { useState } from 'react';
import { useAdmins, useCreerAdmin, useSupprimerAdmin, useToggleAdmin } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { StateRow } from './_state';

interface Admin {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  isActive?: boolean;
  role?: string;
}

const EMPTY = { nom: '', prenom: '', email: '', telephone: '', password: '' };

export default function AdminsPanel() {
  const { data, isLoading, isError } = useAdmins();
  const creer = useCreerAdmin();
  const supprimer = useSupprimerAdmin();
  const toggle = useToggleAdmin();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);

  const admins: Admin[] = data?.admins ?? [];

  const handleCreer = () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) return;
    creer.mutate(form, { onSuccess: () => { setModal(false); setForm(EMPTY); } });
  };

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{admins.length} administrateur(s)</div>
        <button className="db-btn primary" style={{ marginLeft: 'auto' }} onClick={() => { setForm(EMPTY); setModal(true); }}>
          + Ajouter un admin
        </button>
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <StateRow colSpan={5} loading={isLoading} error={isError} empty={admins.length === 0} emptyLabel="Aucun administrateur" />
              {!isLoading && !isError &&
                admins.map((a) => (
                  <tr key={a.id}>
                    <td className="db-td-bold">{a.prenom} {a.nom}</td>
                    <td>{a.email}</td>
                    <td>{a.role || 'ADMIN'}</td>
                    <td>
                      <span style={{ background: a.isActive ? '#d1fae5' : '#fee2e2', color: a.isActive ? '#065f46' : '#991b1b', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {a.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(a.id)}>{a.isActive ? 'Désactiver' : 'Activer'}</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(a)}>Supprimer</button>
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
              <div className="db-modal-title">Ajouter un administrateur</div>
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

      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} className="db-pop-overlay">
          <div onClick={(e) => e.stopPropagation()} className="db-pop" style={{ maxWidth: 440 }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Confirmer la suppression</div>
              <button className="db-modal-close" onClick={() => setConfirmDelete(null)}><Icon name="x" size={14} /></button>
            </div>
            <div className="db-pop-body db-pop-text">
              Supprimer <strong>{confirmDelete.prenom} {confirmDelete.nom}</strong> ?
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={supprimer.isPending} onClick={() => { supprimer.mutate(confirmDelete.id); setConfirmDelete(null); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
