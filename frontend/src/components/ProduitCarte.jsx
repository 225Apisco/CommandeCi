import { Link } from 'react-router-dom';
import formatPrix from './FormatPrix.jsx';

export default function ProduitCarte({ produit, slug, devise }) {
  const image = produit.images?.[0]?.chemin
    ? `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${produit.images[0].chemin}`
    : null;
  const enPromo = produit.prix_promo && Number(produit.prix_promo) < Number(produit.prix);

  return (
    <Link to={`/b/${slug}/produit/${produit.id}`} className="text-decoration-none text-reset">
      <div className="carte-cci h-100 overflow-hidden">
        <div style={{ aspectRatio: '1/1', background: '#F1E9D8', overflow: 'hidden' }}>
          {image ? (
            <img src={image} alt={produit.nom} className="w-100 h-100" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">Pas de photo</div>
          )}
        </div>
        <div className="p-3">
          {produit.type_produit === 'numerique' && (
            <span className="badge-premium mb-1 d-inline-block" style={{ background: 'var(--cci-feuille)' }}>📄 Numérique</span>
          )}
          <h3 className="fs-6 fw-semibold mb-1 text-truncate">{produit.nom}</h3>
          <div className="d-flex align-items-baseline gap-2">
            <span className="prix fw-bold text-papaye">{formatPrix(produit.prix_promo ?? produit.prix, devise)}</span>
            {enPromo && (
              <span className="prix text-muted text-decoration-line-through small">{formatPrix(produit.prix, devise)}</span>
            )}
          </div>
          {produit.type_produit !== 'numerique' && produit.suivi_stock && produit.stock === 0 && (
            <span className="badge-statut annulee mt-2 d-inline-block">Rupture de stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
