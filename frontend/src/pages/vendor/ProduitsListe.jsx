import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import { useAuth } from '../../context/AuthContext';

export default function ProduitsListe() {
  const { user } = useAuth();
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');

  const charger = () => {
    setChargement(true);
    api.get('/produits', { params: { recherche } })
      .then(({ data }) => setProduits(data.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [recherche]); // eslint-disable-line

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await api.delete(`/produits/${id}`);
    charger();
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="fs-4 fw-semibold mb-0">Mes produits</h1>
        <Link to="/produits/nouveau" className="btn-cci-primary">+ Ajouter un produit</Link>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Rechercher un produit..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : produits.length === 0 ? (
        <div className="carte-cci p-5 text-center text-muted">
          Aucun produit pour l'instant. <Link to="/produits/nouveau">Ajoutez votre premier produit</Link>.
        </div>
      ) : (
        <div className="row g-3">
          {produits.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <div className="carte-cci p-3 h-100 d-flex flex-column">
                <div style={{ aspectRatio: '1/1', background: '#F1E9D8', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                  {p.images?.[0] && (
                    <img src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${p.images[0].chemin}`}
                      alt={p.nom} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  )}
                </div>
                {p.type_produit === 'numerique' && (
                  <span className="badge-premium mb-1 align-self-start" style={{ background: 'var(--cci-feuille)' }}>📄 Numérique</span>
                )}
                <h3 className="fs-6 fw-semibold text-truncate mb-1">{p.nom}</h3>
                <span className="prix fw-bold text-papaye mb-2">{formatPrix(p.prix_promo ?? p.prix, user.boutique.devise)}</span>
                <div className="d-flex justify-content-between align-items-center small text-muted mb-2">
                  <span>Stock: {p.suivi_stock ? p.stock : '∞'}</span>
                  {!p.est_publie && <span className="badge-statut annulee">Masqué</span>}
                </div>
                <div className="d-flex gap-2 mt-auto">
                  <Link to={`/produits/${p.id}`} className="btn-cci-outline btn-sm flex-grow-1 text-center">Modifier</Link>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(p.id)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
