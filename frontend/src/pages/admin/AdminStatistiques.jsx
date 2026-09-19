import { useEffect, useState } from 'react';
import api from '../../services/api';
import formatPrix from '../../components/FormatPrix.jsx';

export default function AdminStatistiques() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/statistiques').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <p className="text-muted">Chargement...</p>;

  return (
    <div>
      <h1 className="fs-4 fw-semibold mb-4">Vue d'ensemble de la plateforme</h1>

      <div className="row g-3 mb-4">
        {[
          ['Vendeurs inscrits', stats.nombre_vendeurs],
          ['Boutiques', stats.nombre_boutiques],
          ['Boutiques Premium', stats.boutiques_premium],
          ['Commandes livrées', stats.commandes_livrees],
          ['Revenu commission total', formatPrix(stats.revenu_commission_total, 'XOF')],
          ['Total commandes', stats.nombre_commandes],
        ].map(([label, valeur]) => (
          <div className="col-6 col-md-4 col-lg-2" key={label}>
            <div className="carte-cci p-3 h-100">
              <div className="text-muted small mb-1">{label}</div>
              <div className="fs-5 fw-bold font-mono">{valeur}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="carte-cci p-3 h-100">
            <h2 className="fs-6 fw-semibold mb-3">Revenu de commission par pays</h2>
            {stats.revenu_commission_par_pays.length === 0 && <p className="text-muted small">Aucune donnée pour l'instant.</p>}
            {stats.revenu_commission_par_pays.map((r) => (
              <div key={r.pays} className="d-flex justify-content-between border-bottom py-2 small">
                <span>{r.pays}</span>
                <span className="font-mono">{formatPrix(r.total, 'XOF')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="carte-cci p-3 h-100">
            <h2 className="fs-6 fw-semibold mb-3">Top boutiques par chiffre d'affaires</h2>
            {stats.top_boutiques.map((b) => (
              <div key={b.id} className="d-flex justify-content-between border-bottom py-2 small">
                <span>{b.nom} {b.plan === 'premium' && '★'}</span>
                <span className="font-mono">{formatPrix(b.ca || 0, 'XOF')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
