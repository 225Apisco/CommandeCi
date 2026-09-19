import { useEffect, useState } from 'react';
import api from '../../services/api';
import BadgePremium from '../../components/BadgePremium.jsx';

export default function AdminBoutiques() {
  const [boutiques, setBoutiques] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    api.get('/admin/boutiques', { params: { recherche } })
      .then(({ data }) => setBoutiques(data.data))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, [recherche]); // eslint-disable-line

  const definirPlan = async (id, plan) => {
    await api.put(`/admin/boutiques/${id}/plan`, { plan });
    charger();
  };

  const basculerActivation = async (b) => {
    await api.put(`/admin/boutiques/${b.id}/${b.est_active ? 'suspendre' : 'reactiver'}`);
    charger();
  };

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-3">Boutiques</h1>
      <input className="form-control mb-3" placeholder="Rechercher une boutique..."
        value={recherche} onChange={(e) => setRecherche(e.target.value)} />

      {chargement ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="table-responsive carte-cci">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th className="ps-3">Boutique</th>
                <th>Vendeur</th>
                <th>Pays</th>
                <th>Plan</th>
                <th>Commandes</th>
                <th>Statut</th>
                <th className="pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boutiques.map((b) => (
                <tr key={b.id}>
                  <td className="ps-3 fw-semibold">{b.nom} <BadgePremium actif={b.plan === 'premium'} /></td>
                  <td className="small text-muted">{b.user?.name}</td>
                  <td className="small">{b.pays}</td>
                  <td className="small text-capitalize">{b.plan}</td>
                  <td className="small font-mono">{b.orders_count}</td>
                  <td>
                    <span className={`badge-statut ${b.est_active ? 'livree' : 'annulee'}`}>
                      {b.est_active ? 'Active' : 'Suspendue'}
                    </span>
                  </td>
                  <td className="pe-3">
                    <div className="d-flex gap-1">
                      {b.plan === 'standard' ? (
                        <button className="btn btn-sm btn-cci-outline" onClick={() => definirPlan(b.id, 'premium')}>Passer Premium</button>
                      ) : (
                        <button className="btn btn-sm btn-cci-outline" onClick={() => definirPlan(b.id, 'standard')}>Repasser Standard</button>
                      )}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => basculerActivation(b)}>
                        {b.est_active ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
