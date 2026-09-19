import { useEffect, useState } from 'react';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';
import { useAuth } from '../../context/AuthContext';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    api.get('/clients', { params: { recherche } })
      .then(({ data }) => setClients(data.data))
      .finally(() => setChargement(false));
  }, [recherche]);

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Mes clients</h1>
      <input className="form-control mb-3" placeholder="Rechercher par nom ou téléphone..."
        value={recherche} onChange={(e) => setRecherche(e.target.value)} />

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : clients.length === 0 ? (
        <div className="carte-cci p-5 text-center text-muted">Aucun client pour l'instant.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {clients.map((c) => (
            <div key={c.id} className="carte-cci p-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{c.nom}</div>
                <div className="text-muted small font-mono">{c.telephone}</div>
              </div>
              <div className="text-end small text-muted">
                {c.orders_count} commande{c.orders_count > 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
