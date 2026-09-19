import { useEffect, useState } from 'react';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import BadgeStatutCommande from '../../components/BadgeStatutCommande.jsx';

export default function AdminCommandes() {
  const [commandes, setCommandes] = useState([]);
  const [statut, setStatut] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    api.get('/admin/commandes', { params: { statut: statut || undefined } })
      .then(({ data }) => setCommandes(data.data))
      .finally(() => setChargement(false));
  }, [statut]);

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Toutes les commandes</h1>

      <select className="form-select form-select-sm w-auto mb-3" value={statut} onChange={(e) => setStatut(e.target.value)}>
        <option value="">Tous les statuts</option>
        {['nouvelle', 'confirmee', 'preparation', 'expediee', 'livree', 'annulee'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {commandes.map((c) => (
            <div key={c.id} className="carte-cci p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="font-mono fw-semibold">{c.numero}</div>
                <div className="text-muted small">{c.boutique?.nom} · {c.customer?.nom}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold prix">{formatPrix(c.total)}</div>
                <BadgeStatutCommande statut={c.statut} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
