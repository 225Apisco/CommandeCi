import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Landing from './pages/Landing.jsx';
import Connexion from './pages/Connexion.jsx';
import Inscription from './pages/Inscription.jsx';
import CreerBoutique from './pages/vendor/CreerBoutique.jsx';
import TableauDeBord from './pages/vendor/TableauDeBord.jsx';
import ProduitsListe from './pages/vendor/ProduitsListe.jsx';
import ProduitFormulaire from './pages/vendor/ProduitFormulaire.jsx';
import CommandesListe from './pages/vendor/CommandesListe.jsx';
import CommandeDetail from './pages/vendor/CommandeDetail.jsx';
import Clients from './pages/vendor/Clients.jsx';
import ParametresBoutique from './pages/vendor/ParametresBoutique.jsx';
import Affilies from './pages/vendor/Affilies.jsx';

import Vitrine from './pages/Vitrine.jsx';
import ProduitDetail from './pages/ProduitDetail.jsx';
import Panier from './pages/Panier.jsx';
import Commander from './pages/Commander.jsx';
import SuiviCommande from './pages/SuiviCommande.jsx';
import AffiliationInscription from './pages/AffiliationInscription.jsx';
import AffiliateDashboard from './pages/AffiliateDashboard.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminBoutiques from './pages/admin/AdminBoutiques.jsx';
import AdminCommandes from './pages/admin/AdminCommandes.jsx';
import AdminSignalements from './pages/admin/AdminSignalements.jsx';
import AdminStatistiques from './pages/admin/AdminStatistiques.jsx';

import VendeurLayout from './pages/vendor/VendeurLayout.jsx';

function RoutePrivee({ children, adminSeulement = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/connexion" replace />;
  if (adminSeulement && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing & auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />

          {/* Vitrine publique — pas de compte requis pour le client */}
          <Route path="/b/:slug" element={<Vitrine />} />
          <Route path="/b/:slug/produit/:productId" element={<ProduitDetail />} />
          <Route path="/b/:slug/panier" element={<Panier />} />
          <Route path="/b/:slug/commander" element={<Commander />} />
          <Route path="/suivi/:numero" element={<SuiviCommande />} />
          <Route path="/b/:slug/affiliation" element={<AffiliationInscription />} />
          <Route path="/affilies/:code" element={<AffiliateDashboard />} />

          {/* Espace vendeur */}
          <Route path="/creer-boutique" element={<RoutePrivee><CreerBoutique /></RoutePrivee>} />
          <Route element={<RoutePrivee><VendeurLayout /></RoutePrivee>}>
            <Route path="/tableau-de-bord" element={<TableauDeBord />} />
            <Route path="/produits" element={<ProduitsListe />} />
            <Route path="/produits/nouveau" element={<ProduitFormulaire />} />
            <Route path="/produits/:productId" element={<ProduitFormulaire />} />
            <Route path="/commandes" element={<CommandesListe />} />
            <Route path="/commandes/:orderId" element={<CommandeDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/affilies" element={<Affilies />} />
            <Route path="/parametres" element={<ParametresBoutique />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<RoutePrivee adminSeulement><AdminLayout /></RoutePrivee>}>
            <Route index element={<AdminStatistiques />} />
            <Route path="boutiques" element={<AdminBoutiques />} />
            <Route path="commandes" element={<AdminCommandes />} />
            <Route path="signalements" element={<AdminSignalements />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
