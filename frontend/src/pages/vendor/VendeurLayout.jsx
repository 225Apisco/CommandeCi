import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LIENS = [
  ['/tableau-de-bord', '📊', 'Accueil'],
  ['/produits', '🛍️', 'Produits'],
  ['/commandes', '📦', 'Commandes'],
  ['/affilies', '🔗', 'Affiliés'],
  ['/clients', '👥', 'Clients'],
  ['/parametres', '⚙️', 'Boutique'],
];

export default function VendeurLayout() {
  const { user, deconnecter } = useAuth();

  if (!user?.boutique) return <Navigate to="/creer-boutique" replace />;

  return (
    <div className="min-vh-100 bg-sable pb-5">
      <header className="bg-white border-bottom px-3 py-3 d-flex align-items-center justify-content-between sticky-top">
        <div>
          <span className="font-display fw-bold text-indigo-cci">{user.boutique.nom}</span>
          {user.boutique.plan === 'premium' && <span className="badge-premium ms-2">★ Premium</span>}
        </div>
        <button className="btn btn-sm btn-outline-secondary" onClick={deconnecter}>Déconnexion</button>
      </header>

      <main className="container py-4">
        <Outlet />
      </main>

      <nav className="nav-mobile-vendeur">
        {LIENS.map(([chemin, icone, libelle]) => (
          <NavLink key={chemin} to={chemin} className={({ isActive }) => (isActive ? 'actif' : '')}>
            <span style={{ fontSize: '1.2rem' }}>{icone}</span>
            {libelle}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
