import { useMemo, useState } from 'react';
import {
  usePromotionsParSection,
  useProduits,
  useCreerPromotion,
  useModifierPromotion,
  useSupprimerPromotion,
  useTogglePromotion,
  useBlocsPromo,
  useUpdateBlocPromo,
} from '@/domains/shop/hooks/useAdminBoutique';
import Icon from '@/shared/components/dashboard/Icon';
import { fcfa } from './_state';

// Les 3 blocs promo affichés dans l'app mobile (sections backend)
const BLOCS = [
  { id: 'nos_promos_du_moment', label: 'Nos promos du moment' },
  { id: 'a_ne_pas_rater', label: 'À ne pas rater' },
  { id: 'nos_promos_a_venir', label: 'Nos promos à venir' },
] as const;

type SectionId = (typeof BLOCS)[number]['id'];

interface Produit {
  id: string;
  nom?: string;
  prix?: number;
  image?: string;
  images?: string[];
}
interface Promotion {
  id: string;
  produitId: string;
  produit?: Produit;
  titre?: string;
  pourcentageReduction?: number | string;
  prixPromo?: number | string;
  dateDebut?: string;
  dateFin?: string;
  isActive?: boolean;
  section?: SectionId;
}

const imgOf = (p?: Produit): string | null =>
  (p?.image || p?.images?.[0]) ?? null;

const toDateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '');

interface EditorState {
  section: SectionId;
  promo: Promotion | null; // null = création
}

interface BlocMeta { id: string; section: SectionId; titre?: string; sousTitre?: string; image?: string; isActive?: boolean }

export default function PromotionsPanel() {
  const { data, isLoading, isError } = usePromotionsParSection();
  const { data: blocsData } = useBlocsPromo();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [blocEditor, setBlocEditor] = useState<SectionId | null>(null);
  const supprimer = useSupprimerPromotion();
  const toggle = useTogglePromotion();

  const sections: Record<string, Promotion[]> = data?.sections ?? {};
  const blocsMeta: Record<string, BlocMeta> = useMemo(() => {
    const map: Record<string, BlocMeta> = {};
    (blocsData?.blocs ?? []).forEach((b: BlocMeta) => { map[b.section] = b; });
    return map;
  }, [blocsData]);

  return (
    <div>
      <div style={{ marginBottom: '1rem', color: '#555', fontSize: '0.9rem' }}>
        Chaque bloc correspond à une section affichée dans l'application mobile. Ajoutez des produits,
        fixez une réduction par produit, une durée, puis publiez.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
        {BLOCS.map((bloc) => {
          const promos = sections[bloc.id] ?? [];
          const meta = blocsMeta[bloc.id];
          return (
            <div key={bloc.id} className="db-card" style={{ padding: '1rem' }}>
              {/* Bannière du bloc (image affichée dans l'app mobile) */}
              <div style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden', background: '#eef1f6', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {meta?.image ? (
                  <img src={meta.image} alt={bloc.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}><Icon name="image" size={28} /><div style={{ fontSize: '0.72rem', marginTop: 4 }}>Pas d'image</div></div>
                )}
                <button
                  className="db-btn primary"
                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setBlocEditor(bloc.id)}
                >
                  <Icon name="edit" size={13} /> Image / titre
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="db-td-bold" style={{ fontSize: '1rem' }}>{meta?.titre || bloc.label}</div>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{promos.length} produit(s)</span>
              </div>

              {isLoading ? (
                <div style={{ color: '#888', padding: '1rem 0' }}>Chargement…</div>
              ) : isError ? (
                <div style={{ color: '#991b1b', padding: '1rem 0' }}>Erreur de chargement</div>
              ) : promos.length === 0 ? (
                <div style={{ color: '#999', padding: '1rem 0', fontSize: '0.85rem' }}>Aucun produit dans ce bloc.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {promos.map((p) => (
                    <PromoRow
                      key={p.id}
                      promo={p}
                      onEdit={() => setEditor({ section: bloc.id, promo: p })}
                      onToggle={() => toggle.mutate(p.id)}
                      onRemove={() => supprimer.mutate(p.id)}
                      busy={toggle.isPending || supprimer.isPending}
                    />
                  ))}
                </div>
              )}

              <button
                className="db-btn secondary"
                style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                onClick={() => setEditor({ section: bloc.id, promo: null })}
              >
                <Icon name="plus" size={15} /> Ajouter un produit
              </button>
            </div>
          );
        })}
      </div>

      {editor && (
        <PromotionEditor
          section={editor.section}
          sectionLabel={BLOCS.find((b) => b.id === editor.section)!.label}
          promo={editor.promo}
          onClose={() => setEditor(null)}
        />
      )}

      {blocEditor && (
        <BlocEditor
          section={blocEditor}
          sectionLabel={BLOCS.find((b) => b.id === blocEditor)!.label}
          meta={blocsMeta[blocEditor]}
          onClose={() => setBlocEditor(null)}
        />
      )}
    </div>
  );
}

function BlocEditor({ section, sectionLabel, meta, onClose }: {
  section: SectionId; sectionLabel: string; meta?: BlocMeta; onClose: () => void;
}) {
  const update = useUpdateBlocPromo();
  const [titre, setTitre] = useState(meta?.titre ?? sectionLabel);
  const [sousTitre, setSousTitre] = useState(meta?.sousTitre ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(meta?.image ?? null);

  const onPick = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : meta?.image ?? null);
  };

  const handleSave = () => {
    const fd = new FormData();
    fd.append('titre', titre);
    fd.append('sousTitre', sousTitre);
    if (file) fd.append('image', file);
    update.mutate({ section, data: fd }, { onSuccess: onClose });
  };

  return (
    <div onClick={onClose} className="db-pop-overlay">
      <div onClick={(e) => e.stopPropagation()} className="db-pop" style={{ maxWidth: 500 }}>
        <div className="db-modal-head">
          <div className="db-modal-title">Bloc « {sectionLabel} »</div>
          <button className="db-modal-close" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="db-pop-body">
          <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', background: '#eef1f6', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            {preview ? <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="image" size={30} />}
          </div>
          <div className="db-form-group">
            <label className="db-form-label">Image de la bannière</label>
            <input className="db-form-input" type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
          </div>
          <div className="db-form-group">
            <label className="db-form-label">Titre du bloc</label>
            <input className="db-form-input" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>
          <div className="db-form-group">
            <label className="db-form-label">Sous-titre (optionnel)</label>
            <input className="db-form-input" value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} />
          </div>
        </div>
        <div className="db-modal-footer">
          <button className="db-btn secondary" onClick={onClose}>Annuler</button>
          <button className="db-btn primary" disabled={update.isPending} onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function PromoRow({ promo, onEdit, onToggle, onRemove, busy }: {
  promo: Promotion; onEdit: () => void; onToggle: () => void; onRemove: () => void; busy: boolean;
}) {
  const img = imgOf(promo.produit);
  const pct = Number(promo.pourcentageReduction || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f7f9fc', border: '1px solid #eaecf0', borderRadius: 10, padding: 8 }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0f0ee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0 }}>
        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="shopping-bag" size={18} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="db-td-bold" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {promo.produit?.nom || promo.titre || 'Produit'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          {pct > 0 && <span style={{ color: '#065f46', fontWeight: 700 }}>-{pct}% </span>}
          {promo.prixPromo ? fcfa(promo.prixPromo) : ''}
        </div>
      </div>
      <span style={{ background: promo.isActive ? '#d1fae5' : '#fee2e2', color: promo.isActive ? '#065f46' : '#991b1b', padding: '2px 8px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700 }}>
        {promo.isActive ? 'Publié' : 'Masqué'}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="db-btn-ghost" style={{ padding: '4px 6px' }} title="Modifier" onClick={onEdit}><Icon name="edit" size={14} /></button>
        <button className="db-btn-ghost" style={{ padding: '4px 6px' }} title={promo.isActive ? 'Masquer' : 'Publier'} disabled={busy} onClick={onToggle}>
          <Icon name={promo.isActive ? 'eye-off' : 'eye'} size={14} />
        </button>
        <button className="db-btn-danger" style={{ padding: '4px 6px' }} title="Retirer" disabled={busy} onClick={onRemove}><Icon name="trash" size={14} /></button>
      </div>
    </div>
  );
}

function PromotionEditor({ section, sectionLabel, promo, onClose }: {
  section: SectionId; sectionLabel: string; promo: Promotion | null; onClose: () => void;
}) {
  const creer = useCreerPromotion();
  const modifier = useModifierPromotion();
  const { data: produitsData } = useProduits({ limit: 100 });
  const produits: Produit[] = produitsData?.produits ?? [];

  const [search, setSearch] = useState('');
  const [produitId, setProduitId] = useState(promo?.produitId ?? '');
  const [titre, setTitre] = useState(promo?.titre ?? '');
  const [reduction, setReduction] = useState(String(promo?.pourcentageReduction ?? ''));
  const [dateDebut, setDateDebut] = useState(toDateInput(promo?.dateDebut));
  const [dateFin, setDateFin] = useState(toDateInput(promo?.dateFin));
  const [publier, setPublier] = useState(promo?.isActive ?? true);

  const produitSelectionne = useMemo(
    () => produits.find((p) => p.id === produitId) || promo?.produit,
    [produits, produitId, promo]
  );
  const prix = Number(produitSelectionne?.prix || 0);
  const pct = Number(reduction || 0);
  const prixPromo = pct > 0 && prix > 0 ? Math.round(prix * (1 - pct / 100)) : undefined;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return produits.filter((p) => (p.nom || '').toLowerCase().includes(q));
  }, [produits, search]);

  const canSave = !!produitId && pct > 0 && pct <= 100;

  const handleSave = () => {
    if (!canSave) return;
    const payload: Record<string, any> = {
      produitId,
      section,
      titre: titre || undefined,
      pourcentageReduction: pct,
      prixPromo,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      isActive: publier,
    };
    if (promo) {
      modifier.mutate({ id: promo.id, data: payload }, { onSuccess: onClose });
    } else {
      creer.mutate(payload, { onSuccess: onClose });
    }
  };

  const busy = creer.isPending || modifier.isPending;

  return (
    <div onClick={onClose} className="db-pop-overlay">
      <div onClick={(e) => e.stopPropagation()} className="db-pop" style={{ maxWidth: 560 }}>
        <div className="db-modal-head">
          <div className="db-modal-title">
            {promo ? 'Modifier la promotion' : 'Ajouter un produit'} · {sectionLabel}
          </div>
          <button className="db-modal-close" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>

        <div className="db-pop-body">
          {/* Choix du produit */}
          {!promo && (
            <div className="db-form-group">
              <label className="db-form-label">Produit</label>
              <input className="db-form-input" placeholder="Rechercher un produit…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #eaecf0', borderRadius: 10, marginTop: 8 }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>
                    Aucun produit. Créez d'abord des produits dans l'onglet « Produits ».
                  </div>
                ) : (
                  filtered.map((p) => {
                    const img = imgOf(p);
                    const active = p.id === produitId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setProduitId(p.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', background: active ? '#eff4ff' : 'transparent', borderBottom: '1px solid #f2f4f7' }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f0ee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0 }}>
                          {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="shopping-bag" size={16} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.nom}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{fcfa(p.prix)}</div>
                        </div>
                        {active && <Icon name="check" size={16} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Aperçu produit sélectionné (image du bloc = image produit) */}
          {produitSelectionne && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f7f9fc', border: '1px solid #eaecf0', borderRadius: 10, padding: 10, marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: '#f0f0ee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {imgOf(produitSelectionne) ? <img src={imgOf(produitSelectionne)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="shopping-bag" size={22} />}
              </div>
              <div>
                <div className="db-td-bold">{produitSelectionne.nom}</div>
                <div style={{ fontSize: '0.82rem', color: '#666' }}>Prix : {fcfa(prix)}</div>
              </div>
            </div>
          )}

          <div className="db-form-group">
            <label className="db-form-label">Titre du bloc (optionnel)</label>
            <input className="db-form-input" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Super promo du weekend" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="db-form-group">
              <label className="db-form-label">Réduction (%)</label>
              <input className="db-form-input" type="number" min={1} max={100} value={reduction} onChange={(e) => setReduction(e.target.value)} placeholder="Ex: 20" />
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Prix promo (calculé)</label>
              <input className="db-form-input" value={prixPromo !== undefined ? fcfa(prixPromo) : '—'} disabled />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div className="db-form-group">
              <label className="db-form-label">Début</label>
              <input className="db-form-input" type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Fin</label>
              <input className="db-form-input" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: '4px 0 12px' }}>
            <input type="checkbox" checked={publier} onChange={(e) => setPublier(e.target.checked)} />
            <span style={{ fontSize: '0.88rem' }}>Publier dans l'app mobile</span>
          </label>
        </div>

        <div className="db-modal-footer">
          <button className="db-btn secondary" onClick={onClose}>Annuler</button>
          <button className="db-btn primary" disabled={!canSave || busy} onClick={handleSave}>
            {promo ? 'Enregistrer' : 'Ajouter au bloc'}
          </button>
        </div>
      </div>
    </div>
  );
}
