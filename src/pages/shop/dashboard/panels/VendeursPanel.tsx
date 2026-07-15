import { useState } from 'react';
import { useVendeurs, useValiderVendeur, useToggleVendeur, useCreerVendeur } from '@/domains/shop/hooks/useAdminBoutique';
import Pagination from '@/shared/components/dashboard/Pagination';
import { StateRow } from './_state';

const PAGE_SIZE = 10;

interface Vendeur {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string | null;
  isActive?: boolean;
  statutValidation?: string;
  profilVendeur?: { nomBoutique?: string; isValidatedStep1?: boolean; isValidatedStep2?: boolean };
}

const nomBoutique = (v: Vendeur) => v.profilVendeur?.nomBoutique || '—';

const statutValidation = (v: Vendeur) => {
  const p = v.profilVendeur;
  if (!p || (!p.isValidatedStep1 && !p.isValidatedStep2)) return 'En attente';
  if (p.isValidatedStep1 && !p.isValidatedStep2) return 'Étape 1 ✓';
  if (p.isValidatedStep1 && p.isValidatedStep2) return 'Validé';
  return 'En attente';
};

const EMPTY = { prenom: '', nom: '', email: '', password: '', telephone: '', nomBoutique: '', description: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function VendeursPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useVendeurs({ page, limit: PAGE_SIZE });
  const valider = useValiderVendeur();
  const toggle  = useToggleVendeur();
  const creer   = useCreerVendeur();

  const [open, setOpen]     = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});

  const vendeurs: Vendeur[] = (data as any)?.vendeurs ?? [];
  const total: number       = (data as any)?.pagination?.total ?? vendeurs.length;

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.nom.trim())    e.nom    = 'Requis';
    if (!form.email.trim() || !EMAIL_RE.test(form.email)) e.email = 'Email invalide';
    if (!form.password || form.password.length < 6) e.password = 'Min. 6 caractères';
    if (!form.nomBoutique.trim()) e.nomBoutique = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    creer.mutate(form, {
      onSuccess: () => { setOpen(false); setForm(EMPTY); setErrors({}); },
    });
  };

  const close = () => { setOpen(false); setForm(EMPTY); setErrors({}); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>{total} vendeur(s)</div>
        <button
          className="db-btn-primary"
          onClick={() => setOpen(true)}
          style={{ background: '#b8860b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
        >
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
                    <td>{nomBoutique(v)}</td>
                    <td>{v.email || '—'}</td>
                    <td>
                      <span className="badge bgo">{statutValidation(v)}</span>
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
        <Pagination page={page} total={total} limit={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Modal création */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={close}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ajouter un vendeur</h2>
              <button onClick={close} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Prénom *" error={errors.prenom}>
                  <input value={form.prenom} onChange={set('prenom')} placeholder="Ex: Alassane" style={inputStyle(!!errors.prenom)} />
                </Field>
                <Field label="Nom *" error={errors.nom}>
                  <input value={form.nom} onChange={set('nom')} placeholder="Ex: Gueye" style={inputStyle(!!errors.nom)} />
                </Field>
              </div>
              <Field label="Email *" error={errors.email}>
                <input type="email" value={form.email} onChange={set('email')} placeholder="vendeur@example.com" style={inputStyle(!!errors.email)} />
              </Field>
              <Field label="Mot de passe *" error={errors.password}>
                <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 caractères" style={inputStyle(!!errors.password)} />
              </Field>
              <Field label="Téléphone" error={errors.telephone}>
                <input value={form.telephone} onChange={set('telephone')} placeholder="Ex: +221 77 000 00 00" style={inputStyle(false)} />
              </Field>
              <Field label="Nom de la boutique *" error={errors.nomBoutique}>
                <input value={form.nomBoutique} onChange={set('nomBoutique')} placeholder="Ex: Boutique Alassane" style={inputStyle(!!errors.nomBoutique)} />
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea value={form.description} onChange={set('description')} placeholder="Description de la boutique (optionnel)" rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} />
              </Field>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={close} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  Annuler
                </button>
                <button type="submit" disabled={creer.isPending} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#b8860b', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: creer.isPending ? 0.7 : 1 }}>
                  {creer.isPending ? 'Création…' : 'Créer le vendeur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#444' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  padding: '9px 12px',
  borderRadius: 8,
  border: `1px solid ${hasError ? '#dc2626' : '#e2e8f0'}`,
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
});
