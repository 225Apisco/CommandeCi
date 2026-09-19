import { Link } from 'react-router-dom';
import WhatsAppShareButton from '../components/WhatsAppShareButton.jsx';

export default function Landing() {
  return (
    <div>
      {/* NAVBAR */}
      <nav className="d-flex align-items-center justify-content-between px-4 py-3">
        <span className="font-display fs-4 fw-bold text-indigo-cci">Commande<span className="text-papaye">CI</span></span>
        <div className="d-flex gap-2">
          <Link to="/connexion" className="btn-cci-outline btn-sm">Connexion</Link>
          <Link to="/inscription" className="btn-cci-primary btn-sm">Créer ma boutique</Link>
        </div>
      </nav>

      {/* HERO — fond indigo profond, signature "bulle → reçu" */}
      <section className="bg-encre text-white position-relative overflow-hidden">
        <div className="container py-5 py-md-6">
          <div className="row align-items-center gy-5 py-4">
            <div className="col-lg-6">
              <span className="badge-premium mb-3 d-inline-block">🇨🇮 Fait pour les vendeurs africains</span>
              <h1 className="font-display display-5 fw-bold mb-3">
                Vos messages WhatsApp deviennent des <span className="text-papaye">commandes</span> en un instant.
              </h1>
              <p className="fs-5 text-white-50 mb-4">
                CommandeCI transforme votre téléphone en boutique en ligne. Recevez des commandes
                depuis WhatsApp, Facebook, Instagram ou un simple lien — sans site web à construire.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/inscription" className="btn-cci-primary btn-lg">Démarrer gratuitement</Link>
                <a href="#fonctionnement" className="btn-cci-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>Voir comment ça marche</a>
              </div>
            </div>
            <div className="col-lg-6">
              {/* Illustration signature : bulle de discussion qui se déchire en reçu */}
              <div className="mx-auto" style={{ maxWidth: 380 }}>
                <div className="bg-white rounded-4 rounded-bottom-0 p-4 shadow-lg position-relative">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="rounded-circle bg-success" style={{ width: 10, height: 10 }} />
                    <span className="text-muted small">Client · WhatsApp</span>
                  </div>
                  <p className="mb-1 text-encre">« Bonsoir, je veux 2 robes Ankara taille L, livraison Cocody »</p>
                  <span className="text-muted small">21:42 ✓✓</span>
                </div>
                <div className="bord-dechire" style={{ height: 0 }} />
                <div className="bg-white rounded-4 rounded-top-0 p-4 shadow-lg mt-1 font-mono">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="fw-bold text-indigo-cci">CCI-2026-000482</span>
                    <span className="badge-statut nouvelle">Nouvelle</span>
                  </div>
                  <div className="d-flex justify-content-between small mb-1"><span>Robe Ankara ×2</span><span>39 800 XOF</span></div>
                  <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2"><span>Total</span><span className="text-papaye">39 800 XOF</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVEAU : produits numériques + affiliation */}
      <section className="container py-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="carte-cci p-4 h-100" style={{ background: 'linear-gradient(160deg, #FFF, #FBF6EE)' }}>
              <span className="badge-premium mb-3 d-inline-block" style={{ background: 'var(--cci-feuille)' }}>📄 Nouveau</span>
              <h3 className="font-display fs-4 fw-bold mb-2">Vendez aussi vos ebooks et formations</h3>
              <p className="text-muted mb-0">
                Packs de formation, ebooks, templates, vidéos... Ajoutez un produit numérique en quelques
                clics et le client reçoit son lien de téléchargement automatiquement après sa commande —
                immédiatement, ou après votre confirmation si vous préférez vérifier le paiement d'abord.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="carte-cci p-4 h-100" style={{ background: 'linear-gradient(160deg, #FFF, #EFEEFA)' }}>
              <span className="badge-premium mb-3 d-inline-block">🔗 Nouveau</span>
              <h3 className="font-display fs-4 fw-bold mb-2">Un programme d'affiliation intégré</h3>
              <p className="text-muted mb-0">
                Laissez d'autres personnes promouvoir vos produits en échange d'une commission que
                vous fixez vous-même. Chaque affilié reçoit un lien personnel et suit ses ventes en
                temps réel — sans compte à créer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section id="fonctionnement" className="container py-5">
        <h2 className="font-display text-center mb-5">Comment ça marche</h2>
        <div className="row g-4">
          {[
            ['1', 'Créez votre boutique', 'Nom, logo, numéro WhatsApp — votre boutique est en ligne en moins de 5 minutes, depuis votre téléphone.'],
            ['2', 'Ajoutez vos produits', 'Photos, prix, tailles, stock. Partagez le lien de chaque produit directement en un clic.'],
            ['3', 'Recevez les commandes', 'Le client commande sans créer de compte. Vous suivez tout depuis votre tableau de bord.'],
          ].map(([n, titre, texte]) => (
            <div className="col-md-4" key={n}>
              <div className="carte-cci p-4 h-100">
                <span className="font-display fs-1 fw-bold text-papaye">{n}</span>
                <h3 className="fs-5 fw-semibold mt-2">{titre}</h3>
                <p className="text-muted mb-0">{texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OFFRES / COMMISSION */}
      <section className="bg-indigo-cci text-white py-5">
        <div className="container">
          <h2 className="font-display text-center mb-2">Une commission simple, pas d'abonnement caché</h2>
          <p className="text-center text-white-50 mb-5">Nous ne gagnons que lorsque vous vendez — partout en Afrique.</p>
          <div className="row g-4 justify-content-center">
            <div className="col-md-5">
              <div className="carte-cci p-4 h-100 text-encre">
                <h3 className="fs-5 fw-semibold">Standard</h3>
                <p className="display-6 fw-bold font-mono text-indigo-cci my-3">1%<span className="fs-6 text-muted"> / vente livrée</span></p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">✓ Boutique en ligne illimitée</li>
                  <li className="mb-2">✓ Produits, stock, variantes</li>
                  <li className="mb-2">✓ Tableau de bord & statistiques</li>
                  <li className="mb-2">✓ Partage WhatsApp / Facebook / Instagram</li>
                </ul>
              </div>
            </div>
            <div className="col-md-5">
              <div className="carte-cci p-4 h-100 text-encre border border-3" style={{ borderColor: 'var(--cci-papaye)' }}>
                <span className="badge-premium mb-2 d-inline-block">Mise en avant</span>
                <h3 className="fs-5 fw-semibold">Premium</h3>
                <p className="display-6 fw-bold font-mono text-papaye my-3">2%<span className="fs-6 text-muted"> / vente livrée</span></p>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2">✓ Tout Standard, plus :</li>
                  <li className="mb-2">✓ Boutique mise en avant sur CommandeCI</li>
                  <li className="mb-2">✓ Badge « Premium » visible des clients</li>
                  <li className="mb-2">✓ Priorité dans les résultats de recherche</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container py-5 text-center">
        <h2 className="font-display mb-3">Prêt à vendre plus vite ?</h2>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/inscription" className="btn-cci-primary btn-lg">Créer ma boutique gratuitement</Link>
          <WhatsAppShareButton
            message="Je viens de découvrir CommandeCI, une plateforme pour créer sa boutique en ligne à partir de WhatsApp. Regarde : https://commandeci.africa"
            libelle="Partager avec un ami vendeur"
          />
        </div>
      </section>

      <footer className="bg-encre text-white-50 py-4 text-center small">
        © {new Date().getFullYear()} CommandeCI — Fait pour les commerçants d'Afrique.
      </footer>
    </div>
  );
}
