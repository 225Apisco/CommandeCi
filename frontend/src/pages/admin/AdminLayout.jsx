import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LIENS = [
  ['/admin', '📈', 'Statistiques', true],
  ['/admin/boutiques', '🏬', 'Boutiques', false],
  ['/admin/commandes', '📦', 'Commandes', false],
  ['/admin/signalements', '🚩', 'Signalements', false],
];

export default function AdminLayout() {
  const { user, deconnecter } = useAuth();

  return (
    <div className="min-vh-100 bg-sable">
      <header className="bg-encre text-white px-3 py-3 d-flex align-items-center justify-content-between">
        <span className="font-display fw-bold">CommandeCI <span className="text-papaye">Admin</span></span>
        <div className="d-flex align-items-center gap-3">
          <span className="small text-white-50 d-none d-md-inline">{user?.name}</span>
          <button className="btn btn-sm btn-outline-light" onClick={deconnecter}>Déconnexion</button>
        </div>
      </header>

      <div className="d-flex">
        <nav className="d-none d-md-flex flex-column bg-white border-end p-3" style={{ width: 220, minHeight: 'calc(100vh - 57px)' }}>
          {LIENS.map(([chemin, icone, libelle, exact]) => (
            <NavLink key={chemin} to={chemin} end={exact}
              className={({ isActive }) => `d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3 mb-1 ${isActive ? 'bg-encre text-white' : 'text-reset'}`}>
              <span>{icone}</span> {libelle}
            </NavLink>
          ))}
        </nav>

        {/* Nav mobile simplifiée */}
        <nav className="d-flex d-md-none overflow-auto bg-white border-bottom px-2 py-2 gap-2 w-100 position-fixed" style={{ top: 57, zIndex: 900 }}>
          {LIENS.map(([chemin, icone, libelle, exact]) => (
            <NavLink key={chemin} to={chemin} end={exact}
              className={({ isActive }) => `btn btn-sm text-nowrap ${isActive ? 'btn-cci-primary' : 'btn-cci-outline'}`}>
              {icone} {libelle}
            </NavLink>
          ))}
        </nav>

        <main className="flex-grow-1 p-3 p-md-4" style={{ marginTop: 0 }}>
          <div className="d-md-none" style={{ height: 48 }} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
