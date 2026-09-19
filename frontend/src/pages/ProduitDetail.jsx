import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getCartToken, setCartToken } from '../services/api';
import formatPrix from '../components/FormatPrix.jsx';
import WhatsAppShareButton from '../components/WhatsAppShareButton.jsx';

export default function ProduitDetail() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [produit, setProduit] = useState(null);
  const [varianteId, setVarianteId] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [imageActive, setImageActive] = useState(0);
  const [ajout, setAjout] = useState(false);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    api.get(`/boutiques/${slug}`).then(({ data }) => {
      setBoutique(data.boutique);
      const p = data.produits.data.find((item) => String(item.id) === productId);
      setProduit(p);
      if (p?.variants?.length) setVarianteId(p.variants[0].id);
    });
  }, [slug, productId]);

  if (!produit || !boutique) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Chargement...</div>;

  const variante = produit.variants?.find((v) => v.id === varianteId);
  const prixUnitaire = Number(produit.prix_promo ?? produit.prix) + Number(variante?.supplement_prix || 0);
  const urlProduit = `${window.location.origin}/b/${slug}/produit/${productId}`;

  const ajouterAuPanier = async () => {
    setAjout(true);
    try {
      const token = getCartToken(slug);
      const { data } = await api.post(`/boutiques/${slug}/panier`, {
        token, product_id: produit.id, product_variant_id: varianteId, quantite,
      });
      setCartToken(slug, data.token);
      setSucces(true);
      setTimeout(() => navigate(`/b/${slug}/panier`), 600);
    } finally {
      setAjout(false);
    }
  };

  return (
    <div className="min-vh-100 bg-sable">
      <div className="container py-3">
        <Link to={`/b/${slug}`} className="text-decoration-none text-muted small">← Retour à la boutique</Link>
      </div>

      <div className="container">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="carte-cci overflow-hidden mb-2" style={{ aspectRatio: '1/1' }}>
              {produit.images?.[imageActive] ? (
                <img
                  src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${produit.images[imageActive].chemin}`}
                  alt={produit.nom} className="w-100 h-100" style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">Pas de photo</div>
              )}
            </div>
            {produit.images?.length > 1 && (
              <div className="d-flex gap-2">
                {produit.images.map((img, i) => (
                  <button key={img.id} onClick={() => setImageActive(i)}
                    className="btn p-0 border-0" style={{ width: 60, height: 60, opacity: i === imageActive ? 1 : 0.5 }}>
                    <img src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${img.chemin}`}
                      className="w-100 h-100 rounded" style={{ objectFit: 'cover' }} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-6">
            {produit.type_produit === 'numerique' && (
              <span className="badge-premium mb-2 d-inline-block" style={{ background: 'var(--cci-feuille)' }}>📄 Produit numérique</span>
            )}
            <h1 className="font-display fs-3 fw-bold mb-2">{produit.nom}</h1>
            <div className="d-flex align-items-baseline gap-2 mb-3">
              <span className="prix fs-3 fw-bold text-papaye">{formatPrix(prixUnitaire, boutique.devise)}</span>
              {produit.prix_promo && <span className="prix text-muted text-decoration-line-through">{formatPrix(produit.prix, boutique.devise)}</span>}
            </div>
            {produit.description && <p className="text-muted mb-4">{produit.description}</p>}

            {produit.type_produit === 'numerique' && (
              <div className="carte-cci p-3 mb-4 small text-muted" style={{ background: '#FBF6EE' }}>
                ⚡ Livraison instantanée par téléchargement — aucune adresse ni livraison physique nécessaire.
              </div>
            )}

            {produit.variants?.length > 0 && (
              <div className="mb-4">
                <label className="form-label small fw-semibold">{produit.variants[0].nom}</label>
                <div className="d-flex flex-wrap gap-2">
                  {produit.variants.map((v) => (
                    <button key={v.id} onClick={() => setVarianteId(v.id)}
                      className={`btn btn-sm ${varianteId === v.id ? 'btn-cci-primary' : 'btn-cci-outline'}`}
                      disabled={v.stock === 0}>
                      {v.valeur}{v.stock === 0 ? ' (épuisé)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 d-flex align-items-center gap-3">
              <label className="form-label small fw-semibold mb-0">Quantité</label>
              <div className="d-flex align-items-center border rounded-pill overflow-hidden">
                <button className="btn btn-sm px-3" onClick={() => setQuantite((q) => Math.max(1, q - 1))}>−</button>
                <span className="px-3 font-mono">{quantite}</span>
                <button className="btn btn-sm px-3" onClick={() => setQuantite((q) => q + 1)}>+</button>
              </div>
            </div>

            {succes ? (
              <div className="alert alert-success">Ajouté au panier ✓</div>
            ) : (
              <button className="btn-cci-primary w-100 mb-2" onClick={ajouterAuPanier} disabled={ajout || !produit.enStock !== false}>
                {ajout ? 'Ajout...' : 'Ajouter au panier'}
              </button>
            )}

            <WhatsAppShareButton
              numero={boutique.whatsapp_numero}
              message={`Bonjour, je suis intéressé(e) par « ${produit.nom} » (${formatPrix(prixUnitaire, boutique.devise)}) : ${urlProduit}`}
              libelle="Demander sur WhatsApp"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
