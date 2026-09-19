import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import BadgeStatutCommande from '../../components/BadgeStatutCommande.jsx';
import WhatsAppShareButton from '../../components/WhatsAppShareButton.jsx';
import { useAuth } from '../../context/AuthContext';
import { Order_STATUTS, TRANSITIONS_AFFICHAGE } from './orderStatuts.js';

export default function CommandeDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [commande, setCommande] = useState(null);
  const [maj, setMaj] = useState(false);

  const charger = () => api.get(`/commandes/${orderId}`).then(({ data }) => setCommande(data));
  useEffect(() => { charger(); }, [orderId]); // eslint-disable-line

  const changerStatut = async (statut) => {
    setMaj(true);
    try {
      await api.put(`/commandes/${orderId}/statut`, { statut });
      await charger();
    } finally {
      setMaj(false);
    }
  };

  if (!commande) return <p className="text-muted">Chargement...</p>;

  const devise = user.boutique.devise;
  const prochainesTransitions = TRANSITIONS_AFFICHAGE[commande.statut] || [];
  const messageRecap = `Bonjour ${commande.customer?.nom}, votre commande ${commande.numero} (${formatPrix(commande.total, devise)}) est « ${commande.statut} ». Merci de votre confiance !`;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="fs-4 fw-semibold mb-1 font-mono">{commande.numero}</h1>
          <BadgeStatutCommande statut={commande.statut} />
          {commande.code_affilie_utilise && (
            <span className="badge-premium ms-2">🔗 via {commande.code_affilie_utilise}</span>
          )}
        </div>
        <a className="btn-cci-outline btn-sm" href={`/api/commandes/${orderId}/facture`} target="_blank" rel="noreferrer">Voir la facture</a>
      </div>

      <div className="carte-cci p-3 mb-3">
        <h2 className="fs-6 fw-semibold mb-2">Client</h2>
        <p className="mb-1">{commande.customer?.nom} — {commande.customer?.telephone}</p>
        <p className="text-muted mb-0">{commande.adresse_livraison}{commande.ville_livraison ? `, ${commande.ville_livraison}` : ''}</p>
        {commande.note_client && <p className="text-muted fst-italic mb-0 mt-2">« {commande.note_client} »</p>}
      </div>

      <div className="carte-cci p-3 mb-3">
        <h2 className="fs-6 fw-semibold mb-2">Articles</h2>
        {commande.items.map((it) => (
          <div key={it.id} className="d-flex justify-content-between border-bottom py-2 small">
            <span>{it.nom_produit} × {it.quantite}</span>
            <span className="font-mono">{formatPrix(it.total_ligne, devise)}</span>
          </div>
        ))}
        <div className="d-flex justify-content-between pt-2 small text-muted">
          <span>Sous-total</span><span className="font-mono">{formatPrix(commande.sous_total, devise)}</span>
        </div>
        <div className="d-flex justify-content-between small text-muted">
          <span>Livraison</span><span className="font-mono">{formatPrix(commande.frais_livraison, devise)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold pt-2 border-top mt-2">
          <span>Total</span><span className="font-mono text-papaye">{formatPrix(commande.total, devise)}</span>
        </div>
        <div className="d-flex justify-content-between small text-muted mt-1">
          <span>Commission CommandeCI ({commande.taux_commission_applique}%)</span>
          <span className="font-mono">{formatPrix(commande.montant_commission, devise)}</span>
        </div>
        {commande.code_affilie_utilise && (
          <div className="d-flex justify-content-between small text-muted">
            <span>Commission affilié ({commande.code_affilie_utilise})</span>
            <span className="font-mono">{formatPrix(commande.montant_commission_affilie, devise)}</span>
          </div>
        )}
      </div>

      {prochainesTransitions.length > 0 && (
        <div className="carte-cci p-3 mb-3">
          <h2 className="fs-6 fw-semibold mb-2">Faire avancer la commande</h2>
          <div className="d-flex flex-wrap gap-2">
            {prochainesTransitions.map(([valeur, libelle, classe]) => (
              <button key={valeur} disabled={maj} onClick={() => changerStatut(valeur)}
                className={`btn btn-sm ${classe}`}>
                {libelle}
              </button>
            ))}
          </div>
        </div>
      )}

      <WhatsAppShareButton numero={commande.customer?.telephone} message={messageRecap} libelle="Envoyer une mise à jour au client" />
    </div>
  );
}
