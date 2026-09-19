import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import BadgeStatutCommande from '../../components/BadgeStatutCommande.jsx';
import { useAuth } from '../../context/AuthContext';

const STATUTS = ['', 'nouvelle', 'confirmee', 'preparation', 'expediee', 'livree', 'annulee'];
const LABELS = { '': 'Toutes', nouvelle: 'Nouvelles', confirmee: 'Confirmées', preparation: 'En préparation', expediee: 'Expédiées', livree: 'Livrées', annulee: 'Annulées' };

export default function CommandesListe() {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);
  const [statut, setStatut] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    api.get('/commandes', { params: { statut: statut || undefined } })
      .then(({ data }) => setCommandes(data.data))
      .finally(() => setChargement(false));
  }, [statut]);

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Commandes</h1>

      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {STATUTS.map((s) => (
          <button key={s} onClick={() => setStatut(s)}
            className={`btn btn-sm text-nowrap ${statut === s ? 'btn-cci-primary' : 'btn-cci-outline'}`}>
            {LABELS[s]}
          </button>
        ))}
      </div>

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : commandes.length === 0 ? (
        <div className="carte-cci p-5 text-center text-muted">Aucune commande dans cette catégorie.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {commandes.map((c) => (
            <Link to={`/commandes/${c.id}`} key={c.id} className="carte-cci p-3 d-flex justify-content-between align-items-center text-reset text-decoration-none">
              <div>
                <div className="font-mono fw-semibold">{c.numero}</div>
                <div className="text-muted small">{c.customer?.nom} · {new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold prix">{formatPrix(c.total, user.boutique.devise)}</div>
                <BadgeStatutCommande statut={c.statut} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
