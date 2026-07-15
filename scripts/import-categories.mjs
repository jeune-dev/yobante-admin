/**
 * Import des rayons Yobante comme catégories via l'API admin.
 * Usage : node scripts/import-categories.mjs <email> <password>
 */

const API = 'https://yobante-boutique-back-14ff.onrender.com/api/v1';

const RAYONS = [
  { nom: 'Promotions',                    description: 'Récapitule les promos de tous les rayons avec un compte à rebours' },
  { nom: 'Produits Locaux',               description: 'Boisson, Gourmandises du pays' },
  { nom: 'Cafés',                          description: 'Dosettes et capsules, cafés en grains, cafés moulus, cafés concentrés, cafés solubles, filtre et détartrant' },
  { nom: 'Mode et Textile de Chez Nous',  description: 'Chaussure, maroquinerie, habillement, bijoux' },
  { nom: 'Traiteur',                       description: 'Entrée, plat, dessert' },
  { nom: 'Mobilier et Décoration',        description: 'Linge de maison, literie, cuisson et ustensiles de cuisine, vaisselle et art de la table, mobilier et décoration' },
  { nom: 'Fruits et Légumes',             description: 'Fruits, légumes, prêt à consommer, fruits et légumes secs, graines' },
  { nom: 'Viande et Poissons',            description: 'Boucherie, volaille et rôtisserie, poissonnerie, traiteur de la mer' },
  { nom: 'Crémerie et Produits Laitiers', description: 'Yaourts, desserts et compotes, œufs' },
  { nom: 'Charcuterie et Traiteur',       description: 'Charcuterie, entrées et salades, pizza, plats cuisinés' },
  { nom: 'Surgelés',                       description: 'Glaces, fruits et légumes, poisson, viande, pizza, glaçons' },
  { nom: 'Bébé',                           description: 'Change et soins, bain et toilette, vêtements, promenade, chambre, éveil' },
  { nom: 'Épicerie Sucrée',               description: 'Cafés, petit déjeuner, thés, infusions et boissons chaudes, confiserie et chocolat, biscuits, gâteaux, compotes, sucre, farines' },
  { nom: 'Épicerie Salée',                description: 'Huiles, vinaigres, pâtes, sauces, conserves, riz, purée et féculents, cornichons, sels, épices et bouillons, soupes' },
  { nom: 'Boissons',                       description: 'Colas, sirop et soda, eaux, jus de fruits' },
  { nom: 'Pains et Pâtisserie',           description: 'Gâteaux à partager, pâtisseries individuelles, tartes, macarons et mignardises, beignets, muffins' },
  { nom: 'Entretien et Nettoyage',        description: 'Anti-moustique et insecticides, lessives, adoucissants, produits nettoyants, essuie-tout, papier toilette et mouchoirs, désodorisant, accessoires de ménage' },
  { nom: 'Hygiène et Beauté',             description: 'Produits solaires, soins du visage, soins du corps, soins des cheveux, hygiène dentaire, hygiène intime, maquillage, enfants premiers soins, cotons' },
  { nom: 'Animalerie',                     description: 'Chien, chat, basse-cour, poisson' },
  { nom: 'Jeux Vidéo',                    description: 'Consoles, jeux, accessoires' },
  { nom: 'Smartphone et Objets Connectés', description: 'Téléphone, montres et bracelets connectés, carte mémoire, batteries externes, objets connectés' },
  { nom: 'Informatique et Bureau',        description: 'Ordinateurs portables, ordinateurs de bureau, écran PC, tablette et iPad, imprimantes et scanners, casques, micros et enceintes, stockage, souris, clavier' },
  { nom: 'Image et Son',                  description: 'Téléviseurs, barre de son, home cinéma, casques et écouteurs, enceintes Bluetooth et radio' },
  { nom: 'Sport',                          description: 'Chaussures, tenue de sport' },
  { nom: 'Mode et Textile',               description: 'Chaussures, habillement, montres, bijoux' },
];

async function main() {
  const [,, email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node scripts/import-categories.mjs <email> <password>');
    process.exit(1);
  }

  // 1. Login
  console.log('🔐 Connexion...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant: email, password }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.data?.token;
  if (!token) {
    console.error('❌ Échec de connexion :', loginData?.message ?? loginData);
    process.exit(1);
  }
  console.log('✅ Connecté\n');

  // 2. Import des catégories
  let ok = 0, skip = 0, fail = 0;
  for (const rayon of RAYONS) {
    const form = new FormData();
    form.append('nom', rayon.nom);
    form.append('description', rayon.description);

    const res = await fetch(`${API}/admin/categories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();

    if (res.ok && data.success) {
      console.log(`  ✅ ${rayon.nom}`);
      ok++;
    } else if (res.status === 409 || data?.message?.toLowerCase().includes('existe')) {
      console.log(`  ⏭  ${rayon.nom} (déjà existant)`);
      skip++;
    } else {
      console.log(`  ❌ ${rayon.nom} — ${data?.message ?? res.status}`);
      fail++;
    }
  }

  console.log(`\n📊 Résultat : ${ok} créées, ${skip} ignorées (déjà existantes), ${fail} erreurs`);
}

main().catch(console.error);
