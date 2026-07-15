import { useState } from 'react';
import { useShipmentAdmins, useCreateShipmentAdmin, useToggleShipmentAdmin, useDeleteShipmentAdmin } from '@/domains/shipment/hooks/useShipmentUsers';
import Icon from '@/shared/components/dashboard/Icon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Admin {
  _id?: string;
  id?: string | number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  role?: string;
  isActive?: boolean;
  actif?: boolean;
}

const aId = (a: Admin) => String(a._id ?? a.id ?? '');
const isActif = (a: Admin) => a.isActive ?? a.actif ?? true;

const EMPTY = { prenom: '', nom: '', email: '', password: '', telephone: '', role: 'Gestionnaire' };

export default function AdminsPanel() {
  const { data, isLoading, isError } = useShipmentAdmins();
  const creer    = useCreateShipmentAdmin();
  const toggle   = useToggleShipmentAdmin();
  const supprimer = useDeleteShipmentAdmin();

  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);

  const admins: Admin[] = (data as any)?.admins ?? (data as any)?.data ?? [];

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim())    e.nom    = 'Requis';
    if (!form.email.trim() || !EMAIL_RE.test(form.email)) e.email = 'Email invalide';
    if (!form.password || form.password.length < 6) e.password = 'Min. 6 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    creer.mutate(
      { prenom: form.prenom, nom: form.nom, email: form.email, password: form.password, telephone: form.telephone || undefined, role: form.role },
      { onSuccess: () => { setModal(false); setForm(EMPTY); setErrors({}); } }
    );
  };

  const close = () => { setModal(false); setForm(EMPTY); setErrors({}); };

  if (isLoading) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Chargement…</div>;
  if (isError)   return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>Erreur de chargement</div>;

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{admins.length} administrateur(s)</div>
        <button className="db-btn primary" style={{ marginLeft: 'auto' }} onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }}>+ Ajouter un admin</button>
      </div>

      <div className="db-card">
        <div className="db-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Aucun administrateur</td></tr>
              ) : admins.map((a) => {
                const actif = isActif(a);
                return (
                  <tr key={aId(a)}>
                    <td className="db-td-bold">{a.prenom} {a.nom}</td>
                    <td>{a.email || '—'}</td>
                    <td>{a.telephone || '—'}</td>
                    <td>{a.role || '—'}</td>
                    <td>
                      <span style={{ background: actif ? '#d1fae5' : '#fee2e2', color: actif ? '#065f46' : '#991b1b', padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        {actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="db-actions">
                        <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(aId(a))}>{actif ? 'Désactiver' : 'Activer'}</button>
                        <button className="db-btn-danger" onClick={() => setConfirmDelete(a)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création */}
      {modal && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Ajouter un administrateur</div>
              <button className="db-modal-close" onClick={close}><Icon name="x" size={14} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '0 1.65rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="db-form-group">
                  <label className="db-form-label">Prénom *</label>
                  <input className="db-form-input" value={form.prenom} onChange={set('prenom')} style={form.prenom === '' && errors.prenom ? { borderColor: '#dc2626' } : {}} />
                  {errors.prenom && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{errors.prenom}</span>}
                </div>
                <div className="db-form-group">
                  <label className="db-form-label">Nom *</label>
                  <input className="db-form-input" value={form.nom} onChange={set('nom')} style={errors.nom ? { borderColor: '#dc2626' } : {}} />
                  {errors.nom && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{errors.nom}</span>}
                </div>
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Email *</label>
                <input className="db-form-input" type="email" value={form.email} onChange={set('email')} style={errors.email ? { borderColor: '#dc2626' } : {}} />
                {errors.email && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{errors.email}</span>}
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Mot de passe *</label>
                <input className="db-form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 caractères" style={errors.password ? { borderColor: '#dc2626' } : {}} />
                {errors.password && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{errors.password}</span>}
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Téléphone</label>
                <input className="db-form-input" value={form.telephone} onChange={set('telephone')} />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Rôle</label>
                <select className="db-form-input db-form-select" value={form.role} onChange={set('role')}>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                </select>
              </div>
              <div className="db-modal-footer" style={{ padding: '1rem 0' }}>
                <button type="button" className="db-btn secondary" onClick={close}>Annuler</button>
                <button type="submit" className="db-btn primary" disabled={creer.isPending}>{creer.isPending ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Confirmer la suppression</div>
              <button className="db-modal-close" onClick={() => setConfirmDelete(null)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem 1.65rem', color: '#444' }}>
              Supprimer <strong>{confirmDelete.prenom} {confirmDelete.nom}</strong> ?
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="db-btn confirm" disabled={supprimer.isPending} onClick={() => { supprimer.mutate(aId(confirmDelete)); setConfirmDelete(null); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
