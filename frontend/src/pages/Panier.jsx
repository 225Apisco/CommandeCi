import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { getCartToken } from '../services/api';
import formatPrix from '../components/FormatPrix.jsx';

export default function Panier() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [boutique, setBoutique] = useState(null);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    const token = getCartToken(slug);
    Promise.all([
      api.get(`/boutiques/${slug}`),
      api.get(`/boutiques/${slug}/panier`, { params: { token } }),
    ]).then(([bRes, pRes]) => {
      setBoutique(bRes.data.boutique);
      setItems(pRes.data.items);
      setTotal(pRes.data.total);
    }).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [slug]); // eslint-disable-line

  const modifierQuantite = async (itemId, quantite) => {
    const token = getCartToken(slug);
    await api.put(`/boutiques/${slug}/panier/${itemId}`, { quantite }, { params: { token } });
    charger();
  };

  if (chargement) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Chargement du panier...</div>;

  return (
    <div className="min-vh-100 bg-sable pb-5">
      <div className="container py-4">
        <Link to={`/b/${slug}`} className="text-decoration-none text-muted small d-block mb-3">← Continuer mes achats</Link>
        <h1 className="font-display fs-3 fw-bold mb-4">Votre panier</h1>

        {items.length === 0 ? (
          <div className="carte-cci p-5 text-center text-muted">
            Votre panier est vide. <Link to={`/b/${slug}`}>Découvrir les produits</Link>
          </div>
        ) : (
          <>
            <div className="d-flex flex-column gap-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="carte-cci p-3 d-flex gap-3 align-items-center">
                  <div style={{ width: 64, height: 64, background: '#F1E9D8', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                    {item.product?.images?.[0] && (
                      <img src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${item.product.images[0].chemin}`}
                        className="w-100 h-100" style={{ objectFit: 'cover' }} alt="" />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {item.product?.nom}{item.variant ? ` — ${item.variant.valeur}` : ''}
                      {item.product?.type_produit === 'numerique' && <span className="ms-2 small text-feuille">📄 Numérique</span>}
                    </div>
                    <div className="prix text-papaye fw-bold small">{formatPrix(item.product?.prix_promo ?? item.product?.prix, boutique.devise)}</div>
                  </div>
                  <div className="d-flex align-items-center border rounded-pill overflow-hidden">
                    <button className="btn btn-sm px-2" onClick={() => modifierQuantite(item.id, item.quantite - 1)}>−</button>
                    <span className="px-2 font-mono small">{item.quantite}</span>
                    <button className="btn btn-sm px-2" onClick={() => modifierQuantite(item.id, item.quantite + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="carte-cci p-4 mb-4">
              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>Total</span>
                <span className="font-mono text-papaye">{formatPrix(total, boutique.devise)}</span>
              </div>
              <small className="text-muted">
                {items.every((i) => i.product?.type_produit === 'numerique')
                  ? 'Produits numériques — livraison instantanée par téléchargement, aucun frais de livraison.'
                  : 'Les frais de livraison seront confirmés par le vendeur.'}
              </small>
            </div>

            <button className="btn-cci-primary w-100" onClick={() => navigate(`/b/${slug}/commander`)}>
              Passer la commande
            </button>
          </>
        )}
      </div>
    </div>
  );
}
