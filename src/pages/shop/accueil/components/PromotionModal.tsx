import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import shopClient from '@/infrastructure/http/shop.client';
import { promotionsApi } from '@/domains/shop/api/promotions.api';

interface Props {
  section: string;
  /** Null en création. */
  promotion: any | null;
  onFermer: () => void;
  onEnregistre: () => void;
}

/** Découpe la date ISO renvoyée par l'API pour un `input[type=date]`. */
const versInputDate = (iso?: string) => (iso ? iso.slice(0, 10) : '');

/**
 * Rattache un produit à une section promotionnelle, avec sa réduction et sa
 * période de validité.
 */
export default function PromotionModal({ section, promotion, onFermer, onEnregistre }: Props) {
  const edition = Boolean(promotion);

  const [recherche, setRecherche] = useState('');
  const [resultats, setResultats] = useState<any[]>([]);
  const [produit, setProduit] = useState<any>(promotion?.produit ?? null);
  const [prixPromo, setPrixPromo] = useState(promotion?.prixPromo?.toString() ?? '');
  const [reduction, setReduction] = useState(promotion?.pourcentageReduction?.toString() ?? '');
  const [dateDebut, setDateDebut] = useState(versInputDate(promotion?.dateDebut));
  const [dateFin, setDateFin] = useState(versInputDate(promotion?.dateFin));

  // Recherche différée : évite une requête à chaque frappe.
  useEffect(() => {
    if (edition || recherche.trim().length < 2) {
      setResultats([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r: any = await shopClient.get('/admin/produits', {
          params: { search: recherche, limit: 8 },
        });
        // Le client déballe l'enveloppe : `r` est déjà la charge utile.
        setResultats(r.produits ?? []);
      } catch {
        setResultats([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [recherche, edition]);

  /**
   * Le prix promotionnel et le pourcentage décrivent la même remise : saisir
   * l'un déduit l'autre, pour éviter des valeurs incohérentes.
   */
  const surPrix = (valeur: string) => {
    setPrixPromo(valeur);
    const base = Number(produit?.prix);
    const promo = Number(valeur);
    if (base > 0 && promo > 0 && promo < base) {
      setReduction(Math.round((1 - promo / base) * 100).toString());
    }
  };

  const surReduction = (valeur: string) => {
    setReduction(valeur);
    const base = Number(produit?.prix);
    const pct = Number(valeur);
    if (base > 0 && pct > 0 && pct < 100) {
      setPrixPromo(Math.round(base * (1 - pct / 100)).toString());
    }
  };

  const enregistrer = useMutation({
    mutationFn: () => {
      const corps: any = {
        section,
        ...(prixPromo ? { prixPromo: Number(prixPromo) } : {}),
        ...(reduction ? { pourcentageReduction: Number(reduction) } : {}),
        ...(dateDebut ? { dateDebut: new Date(dateDebut).toISOString() } : {}),
        ...(dateFin ? { dateFin: new Date(dateFin).toISOString() } : {}),
      };
      if (edition) return promotionsApi.update(promotion.id, corps);
      return promotionsApi.create({ ...corps, produitId: produit.id });
    },
    onSuccess: () => {
      toast.success(edition ? 'Promotion modifiée' : 'Produit ajouté à la section');
      onEnregistre();
      onFermer();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Enregistrement impossible'),
  });

  const valider = () => {
    if (!edition && !produit) {
      toast.error('Choisissez un produit');
      return;
    }
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      toast.error('La date de fin précède la date de début');
      return;
    }
    enregistrer.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          {edition ? 'Modifier la promotion' : 'Ajouter un produit en promotion'}
        </h3>

        {edition ? (
          <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
            {promotion.produit?.nom ?? 'Produit'}
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
            {produit ? (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-800">
                  {produit.nom} — {produit.prix} FCFA
                </span>
                <button
                  onClick={() => setProduit(null)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {resultats.length > 0 && (
                  <ul className="mt-1 border border-gray-100 rounded-lg max-h-44 overflow-auto">
                    {resultats.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => {
                            setProduit(p);
                            setRecherche('');
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          {p.nom} — {p.prix} FCFA
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Champ label="Prix promo (FCFA)" valeur={prixPromo} onChange={surPrix} type="number" />
          <Champ label="Réduction (%)" valeur={reduction} onChange={surReduction} type="number" />
          <Champ label="Début" valeur={dateDebut} onChange={setDateDebut} type="date" />
          <Champ label="Fin" valeur={dateFin} onChange={setDateFin} type="date" />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Sans dates, la promotion reste affichée en permanence.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onFermer}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            onClick={valider}
            disabled={enregistrer.isPending}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
          >
            {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Champ({
  label,
  valeur,
  onChange,
  type = 'text',
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}
