import { useRef, useState } from 'react';
import { useBannieres, useCreerBanniere, useToggleBanniere, useSupprimerBanniere } from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';

interface Banniere {
  id: string;
  titre?: string;
  image?: string;
  imageUrl?: string;
  isActive?: boolean;
  active?: boolean;
  lien?: string;
  ordre?: number;
}

const estActive = (b: Banniere) => b.isActive ?? b.active ?? false;

export default function BannieresPanel() {
  const { data, isLoading, isError } = useBannieres();
  const creer     = useCreerBanniere();
  const toggle    = useToggleBanniere();
  const supprimer = useSupprimerBanniere();

  const [modal, setModal]   = useState(false);
  const [titre, setTitre]   = useState('');
  const [lien, setLien]     = useState('');
  const [file, setFile]     = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const bannieres: Banniere[] = (data as any)?.bannieres ?? [];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleCreer = () => {
    if (!titre.trim() || !file) return;
    const fd = new FormData();
    fd.append('titre', titre.trim());
    if (lien.trim()) fd.append('lien', lien.trim());
    fd.append('image', file);
    creer.mutate(fd, {
      onSuccess: () => { setModal(false); setTitre(''); setLien(''); setFile(null); setPreview(null); },
    });
  };

  const closeModal = () => { setModal(false); setTitre(''); setLien(''); setFile(null); setPreview(null); };

  if (isLoading) return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Chargement…</div>;
  if (isError)   return <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b' }}>Erreur de chargement</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="db-btn primary" onClick={() => setModal(true)}>+ Ajouter une bannière</button>
      </div>

      {bannieres.length === 0 ? (
        <div className="db-card" style={{ padding: '2.5rem', textAlign: 'center', color: '#888' }}>
          <Icon name="image" size={40} style={{ opacity: 0.4 }} />
          <p style={{ marginTop: 12 }}>Aucune bannière</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {bannieres.map((b) => (
            <div key={b.id} className="db-card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ height: 130, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {b.image || b.imageUrl
                  ? <img src={b.image || b.imageUrl} alt={b.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Icon name="image" size={34} />}
              </div>
              <div style={{ padding: '0.9rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div className="db-td-bold">{b.titre || 'Bannière'}</div>
                  <span style={{ background: estActive(b) ? '#d1fae5' : '#fee2e2', color: estActive(b) ? '#065f46' : '#991b1b', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>
                    {estActive(b) ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {b.lien && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.lien}</div>}
                <div className="db-actions" style={{ marginTop: 10 }}>
                  <button className="db-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(b.id)}>{estActive(b) ? 'Désactiver' : 'Activer'}</button>
                  <button className="db-btn-danger" disabled={supprimer.isPending} onClick={() => supprimer.mutate(b.id)}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div className="db-modal-head">
              <div className="db-modal-title">Ajouter une bannière</div>
              <button className="db-modal-close" onClick={closeModal}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: '0 1.65rem' }}>
              <div className="db-form-group">
                <label className="db-form-label">Titre *</label>
                <input className="db-form-input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Promotion de la rentrée" />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Lien (optionnel)</label>
                <input className="db-form-input" value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://…" />
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Image *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed #e2e8f0', borderRadius: 10, padding: '1.2rem', textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'border-color 0.2s' }}
                >
                  {preview
                    ? <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8, maxWidth: '100%', objectFit: 'contain' }} />
                    : <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}><Icon name="image" size={28} /><br />Cliquer pour choisir une image</div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn secondary" onClick={closeModal}>Annuler</button>
              <button className="db-btn primary" disabled={!titre.trim() || !file || creer.isPending} onClick={handleCreer}>
                {creer.isPending ? 'Envoi…' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
