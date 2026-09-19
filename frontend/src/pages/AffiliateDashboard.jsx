import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import formatPrix from '../components/FormatPrix.jsx';
import BadgeStatutCommande from '../components/BadgeStatutCommande.jsx';
import WhatsAppShareButton from '../components/WhatsAppShareButton.jsx';

export default function AffiliateDashboard() {
  const { code } = useParams();
  const [telephone, setTelephone] = useState('');
  const [donnees, setDonnees] = useState(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState('');

  const chercher = async (e) => {
    e.preventDefault();
    setRecherche(true);
    setErreur('');
    try {
      const { data } = await api.get(`/affilies/${code}/tableau-de-bord`, { params: { telephone } });
      setDonnees(data);
    } catch {
      setErreur('Aucun affilié trouvé avec ce code et ce téléphone.');
    } finally {
      setRecherche(false);
    }
  };

  return (
    <div className="min-vh-100 bg-sable py-4">
      <div className="container" style={{ maxWidth: 520 }}>
        <Link to="/" className="text-decoration-none text-muted small d-block mb-3">← CommandeCI</Link>
        <h1 className="font-display fs-3 fw-bold mb-1">Mon espace affilié</h1>
        <p className="text-muted mb-4 font-mono">Code : {code}</p>

        {!donnees ? (
          <form onSubmit={chercher} className="carte-cci p-4">
            <label className="form-label small fw-semibold">Votre numéro de téléphone</label>
            <input type="tel" className="form-control mb-3" required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            {erreur && <div className="alert alert-danger py-2">{erreur}</div>}
            <button className="btn-cci-primary w-100" disabled={recherche}>{recherche ? 'Recherche...' : 'Voir mes statistiques'}</button>
          </form>
        ) : (
          <>
            <div className="carte-cci p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-semibold">{donnees.affilie.boutique?.nom}</span>
                <span className={`badge-statut ${donnees.affilie.est_actif ? 'livree' : 'annulee'}`}>
                  {donnees.affilie.est_actif ? 'Actif' : 'Suspendu'}
                </span>
              </div>
              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="fs-5 fw-bold font-mono">{donnees.affilie.nb_clics}</div>
                  <div className="text-muted small">Clics</div>
                </div>
                <div className="col-4">
                  <div className="fs-5 fw-bold font-mono">{donnees.affilie.nb_ventes}</div>
                  <div className="text-muted small">Ventes</div>
                </div>
                <div className="col-4">
                  <div className="fs-5 fw-bold font-mono text-papaye">{formatPrix(donnees.affilie.montant_commission_total)}</div>
                  <div className="text-muted small">Commission</div>
                </div>
              </div>
            </div>

            <div className="carte-cci p-3 mb-4">
              <div className="text-muted small mb-1">Votre lien à partager</div>
              <div className="font-mono small mb-2" style={{ wordBreak: 'break-all' }}>{donnees.lien_affiliation}</div>
              <WhatsAppShareButton taille="sm" message={`Découvrez cette boutique : ${donnees.lien_affiliation}`} libelle="Repartager" />
            </div>

            <h2 className="fs-6 fw-semibold mb-2">Commandes générées</h2>
            {donnees.commandes_generees.length === 0 ? (
              <p className="text-muted small">Aucune vente pour l'instant — partagez votre lien !</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {donnees.commandes_generees.map((c) => (
                  <div key={c.id} className="carte-cci p-3 d-flex justify-content-between align-items-center">
                    <div className="font-mono small">{c.numero}</div>
                    <div className="text-end">
                      <BadgeStatutCommande statut={c.statut} />
                      <div className="small text-muted mt-1">+{formatPrix(c.montant_commission_affilie)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
