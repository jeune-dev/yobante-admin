import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { blocsPromoApi } from '@/domains/shop/api/blocs-promo.api';

interface Props {
  section: string;
  /** Null en création. */
  bloc: any | null;
  onFermer: () => void;
  onEnregistre: () => void;
}

/** Création ou modification d'une sous-section : image, titre, sous-titre, ordre. */
export default function SousSectionModal({ section, bloc, onFermer, onEnregistre }: Props) {
  const edition = Boolean(bloc);
  const [titre, setTitre] = useState(bloc?.titre ?? '');
  const [sousTitre, setSousTitre] = useState(bloc?.sousTitre ?? '');
  const [ordre, setOrdre] = useState<string>(bloc?.ordre?.toString() ?? '');
  const [fichier, setFichier] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(bloc?.image ?? null);

  const enregistrer = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('section', section);
      fd.append('titre', titre);
      fd.append('sousTitre', sousTitre);
      if (ordre !== '') fd.append('ordre', ordre);
      if (fichier) fd.append('image', fichier);
      return edition ? blocsPromoApi.update(bloc.id, fd) : blocsPromoApi.create(fd);
    },
    onSuccess: () => {
      toast.success(edition ? 'Sous-section modifiée' : 'Sous-section créée');
      onEnregistre();
      onFermer();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? 'Enregistrement impossible'),
  });

  const choisirImage = (f: File | null) => {
    setFichier(f);
    // Aperçu local : l'image n'est envoyée qu'à l'enregistrement.
    setApercu(f ? URL.createObjectURL(f) : bloc?.image ?? null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          {edition ? 'Modifier la sous-section' : 'Nouvelle sous-section'}
        </h3>

        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <div className="mb-4">
          <div className="aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
            {apercu ? (
              <img src={apercu} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">Aucune image</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => choisirImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600"
          />
        </div>

        <Champ label="Titre" valeur={titre} onChange={setTitre} placeholder="Ex. Électroménager" />
        <Champ
          label="Sous-titre"
          valeur={sousTitre}
          onChange={setSousTitre}
          placeholder="Ex. Jusqu'à −40 %"
        />
        <Champ
          label="Ordre d'affichage"
          valeur={ordre}
          onChange={setOrdre}
          type="number"
          placeholder="Laisser vide pour placer à la fin"
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onFermer}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            onClick={() => enregistrer.mutate()}
            disabled={enregistrer.isPending}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
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
  placeholder,
  type = 'text',
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={valeur}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
    </div>
  );
}
