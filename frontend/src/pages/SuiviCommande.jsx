import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import formatPrix from '../components/FormatPrix.jsx';
import BadgeStatutCommande from '../components/BadgeStatutCommande.jsx';

const ETAPES = ['nouvelle', 'confirmee', 'preparation', 'expediee', 'livree'];
const LABELS_ETAPES = { nouvelle: 'Reçue', confirmee: 'Confirmée', preparation: 'Préparation', expediee: 'Expédiée', livree: 'Livrée' };

export default function SuiviCommande() {
  const { numero } = useParams();
  const location = useLocation();
  const [telephone, setTelephone] = useState(location.state?.telephone || '');
  const [commande, setCommande] = useState(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState('');

  const chercher = async (e) => {
    e?.preventDefault();
    setRecherche(true);
    setErreur('');
    try {
      const { data } = await api.get(`/commandes/${numero}/suivi`, { params: { telephone } });
      setCommande(data);
    } catch {
      setErreur("Commande introuvable. Vérifiez le numéro et le téléphone utilisés lors de la commande.");
    } finally {
      setRecherche(false);
    }
  };

  // Recherche automatique si le téléphone a été transmis depuis la page Commander
  useState(() => { if (location.state?.telephone) chercher(); }); // eslint-disable-line

  const indexEtape = commande ? ETAPES.indexOf(commande.statut) : -1;

  return (
    <div className="min-vh-100 bg-sable py-4">
      <div className="container" style={{ maxWidth: 480 }}>
        <Link to="/" className="text-decoration-none text-muted small d-block mb-3">← CommandeCI</Link>
        <h1 className="font-display fs-3 fw-bold mb-1">Suivi de commande</h1>
        <p className="text-muted mb-4 font-mono">{numero}</p>

        {!commande && (
          <form onSubmit={chercher} className="carte-cci p-4 mb-4">
            <label className="form-label small fw-semibold">Numéro de téléphone utilisé pour la commande</label>
            <input type="tel" className="form-control mb-3" required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
            <button className="btn-cci-primary w-100" disabled={recherche}>{recherche ? 'Recherche...' : 'Voir ma commande'}</button>
          </form>
        )}

        {commande && (
          <>
            <div className="carte-cci p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-semibold">{commande.boutique?.nom}</span>
                <BadgeStatutCommande statut={commande.statut} />
              </div>

              {commande.statut !== 'annulee' ? (
                <div className="d-flex justify-content-between position-relative mb-4">
                  <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 2, background: '#E4E1F0', zIndex: 0 }} />
                  {ETAPES.map((etape, i) => (
                    <div key={etape} className="text-center position-relative" style={{ zIndex: 1, flex: 1 }}>
                      <div className="rounded-circle mx-auto mb-1"
                        style={{ width: 20, height: 20, background: i <= indexEtape ? 'var(--cci-papaye)' : '#E4E1F0' }} />
                      <span className="small text-muted" style={{ fontSize: '0.65rem' }}>{LABELS_ETAPES[etape]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-danger py-2 mb-4">Cette commande a été annulée.</div>
              )}

              <div className="border-top pt-3">
                {commande.items.map((it) => (
                  <div key={it.id} className="py-1">
                    <div className="d-flex justify-content-between small">
                      <span>{it.nom_produit} × {it.quantite}</span>
                      <span className="font-mono">{formatPrix(it.total_ligne)}</span>
                    </div>
                    {it.accesNumerique && (
                      it.accesNumerique.debloque ? (
                        <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api')}/telechargements/${it.accesNumerique.token}`}
                          className="btn-cci-primary btn-sm mt-1 mb-1 d-inline-block">
                          ⬇ Télécharger le fichier
                        </a>
                      ) : (
                        <span className="badge-statut nouvelle d-inline-block mt-1 mb-1">
                          🔒 Disponible dès confirmation du vendeur
                        </span>
                      )
                    )}
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold pt-2 border-top mt-2">
                  <span>Total</span>
                  <span className="font-mono text-papaye">{formatPrix(commande.total)}</span>
                </div>
              </div>
            </div>

            {commande.items.some((it) => !it.accesNumerique) && (
              <div className="carte-cci p-4">
                <h2 className="fs-6 fw-semibold mb-2">Livraison</h2>
                <p className="text-muted mb-0 small">{commande.adresse_livraison}{commande.ville_livraison ? `, ${commande.ville_livraison}` : ''}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
