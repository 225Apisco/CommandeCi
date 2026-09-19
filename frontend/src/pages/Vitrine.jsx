import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api, { memoriserCodeAffilie } from '../services/api';
import ProduitCarte from '../components/ProduitCarte.jsx';
import WhatsAppShareButton from '../components/WhatsAppShareButton.jsx';
import BadgePremium from '../components/BadgePremium.jsx';

export default function Vitrine() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [categorieActive, setCategorieActive] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    api.get(`/boutiques/${slug}`)
      .then(({ data }) => {
        setBoutique(data.boutique);
        setProduits(data.produits.data);
      })
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [slug]);

  // Capture le lien d'affiliation (?ref=CODE) : mémorisé 30 jours, attribué à la vente au checkout.
  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      memoriserCodeAffilie(slug, code);
      api.get(`/boutiques/${slug}/affiliation/clic/${code}`).catch(() => {});
    }
  }, [slug, searchParams]);

  if (chargement) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Chargement de la boutique...</div>;
  if (erreur || !boutique) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Boutique introuvable.</div>;

  const produitsFiltres = categorieActive
    ? produits.filter((p) => p.category_id === categorieActive)
    : produits;

  return (
    <div className="min-vh-100 bg-sable pb-5">
      {/* Bannière boutique */}
      <div className="bg-indigo-cci text-white text-center py-5 px-3">
        {boutique.logo_path && (
          <img
            src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${boutique.logo_path}`}
            alt={boutique.nom}
            className="rounded-circle mb-3 border border-3 border-white"
            style={{ width: 80, height: 80, objectFit: 'cover' }}
          />
        )}
        <h1 className="font-display fw-bold fs-3 mb-1">
          {boutique.nom} <BadgePremium actif={boutique.plan === 'premium'} />
        </h1>
        {boutique.description && <p className="text-white-50 mb-2" style={{ maxWidth: 480, margin: '0 auto' }}>{boutique.description}</p>}
        {boutique.ville && <p className="text-white-50 small mb-3">📍 {boutique.ville}</p>}
        <WhatsAppShareButton numero={boutique.whatsapp_numero} message={`Bonjour, je suis intéressé(e) par vos produits sur ${boutique.nom} !`} libelle="Discuter sur WhatsApp" />
      </div>

      {/* Catégories */}
      {boutique.categories?.length > 0 && (
        <div className="container d-flex gap-2 overflow-auto py-3">
          <button onClick={() => setCategorieActive(null)} className={`btn btn-sm text-nowrap ${!categorieActive ? 'btn-cci-primary' : 'btn-cci-outline'}`}>Tout</button>
          {boutique.categories.map((c) => (
            <button key={c.id} onClick={() => setCategorieActive(c.id)} className={`btn btn-sm text-nowrap ${categorieActive === c.id ? 'btn-cci-primary' : 'btn-cci-outline'}`}>
              {c.nom}
            </button>
          ))}
        </div>
      )}

      {/* Grille produits */}
      <div className="container">
        {produitsFiltres.length === 0 ? (
          <p className="text-muted text-center py-5">Aucun produit disponible pour l'instant.</p>
        ) : (
          <div className="row g-3">
            {produitsFiltres.map((p) => (
              <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                <ProduitCarte produit={p} slug={slug} devise={boutique.devise} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton panier flottant */}
      <Link to={`/b/${slug}/panier`}
        className="btn-cci-primary position-fixed bottom-0 end-0 m-3 shadow-lg"
        style={{ zIndex: 1000 }}>
        🛒 Voir mon panier
      </Link>

      <div className="text-center text-muted small mt-5 pb-3">
        Boutique propulsée par <Link to="/" className="text-indigo-cci fw-semibold">CommandeCI</Link>
        {' · '}
        <Link to={`/b/${slug}/affiliation`} className="text-papaye fw-semibold">Gagner une commission en la partageant 🔗</Link>
      </div>
    </div>
  );
}
