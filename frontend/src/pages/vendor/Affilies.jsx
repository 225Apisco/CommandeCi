import { useEffect, useState } from 'react';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import WhatsAppShareButton from '../../components/WhatsAppShareButton.jsx';
import { useAuth } from '../../context/AuthContext';

export default function Affilies() {
  const { user } = useAuth();
  const [affilies, setAffilies] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    api.get('/affilies').then(({ data }) => setAffilies(data)).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const basculer = async (id) => {
    await api.put(`/affilies/${id}/activation`);
    charger();
  };

  const lienInscription = `${window.location.origin}/b/${user.boutique.slug}/affiliation`;

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Mes affiliés</h1>

      <div className="carte-cci p-3 mb-4">
        <div className="text-muted small mb-1">Lien d'inscription à partager avec vos futurs affiliés</div>
        <div className="font-mono small mb-2" style={{ wordBreak: 'break-all' }}>{lienInscription}</div>
        <WhatsAppShareButton taille="sm"
          message={`Deviens affilié de ma boutique ${user.boutique.nom} et gagne une commission sur chaque vente : ${lienInscription}`}
          libelle="Recruter un affilié" />
      </div>

      <p className="text-muted small mb-3">
        Pour qu'un produit puisse être promu, activez l'affiliation et fixez un taux de commission
        depuis sa fiche produit.
      </p>

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : affilies.length === 0 ? (
        <div className="carte-cci p-5 text-center text-muted">Aucun affilié pour l'instant. Partagez votre lien ci-dessus.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {affilies.map((a) => (
            <div key={a.id} className="carte-cci p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="fw-semibold">{a.nom} <span className="font-mono text-muted small">({a.code})</span></div>
                <div className="text-muted small">{a.telephone}</div>
              </div>
              <div className="text-end">
                <div className="small">{a.nb_clics} clics · {a.nb_ventes} ventes</div>
                <div className="fw-bold font-mono text-papaye small">{formatPrix(a.montant_commission_total, user.boutique.devise)}</div>
              </div>
              <button className={`btn btn-sm ${a.est_actif ? 'btn-outline-danger' : 'btn-cci-outline'}`} onClick={() => basculer(a.id)}>
                {a.est_actif ? 'Suspendre' : 'Réactiver'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
