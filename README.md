# CommandeCI

Plateforme permettant aux commerçants ivoiriens (et africains) de créer une mini-boutique
en ligne et de recevoir des commandes provenant de WhatsApp, Facebook, Instagram ou d'un
lien direct — sans avoir à construire un site web.

**Modèle économique** : commission prélevée uniquement sur les ventes livrées — **1%** en
plan Standard, **2%** en plan **Premium** (boutique mise en avant sur la plateforme), partout
en Afrique.

**Nouveau** : vente de **produits numériques** (ebooks, packs de formation, templates...) avec
téléchargement automatique, et **programme d'affiliation** intégré pour laisser d'autres
personnes promouvoir vos produits contre une commission.

---

## 🧱 Stack technique

| Couche         | Techno                                              |
|----------------|------------------------------------------------------|
| Frontend       | React 18 + React Router + Bootstrap 5 + CSS custom   |
| Backend        | Laravel 12 (API REST)                                |
| Auth API       | Laravel Sanctum (tokens)                             |
| Base de données| MySQL 8                                               |
| Graphiques     | Recharts                                              |

---

## 📁 Structure du dépôt

```
commandeci/
├── backend/     # API Laravel
│   ├── app/Models/               # User, Boutique, Product, Order, Payment...
│   ├── app/Http/Controllers/Api/ # Contrôleurs vendeur + Admin/
│   ├── database/migrations/      # Schéma complet
│   ├── database/seeders/         # Données de démonstration
│   ├── routes/api.php            # Toutes les routes API
│   └── config/commandeci.php     # Taux de commission (1% / 2%)
└── frontend/    # Application React
    └── src/
        ├── pages/           # Vitrine publique, panier, checkout, suivi
        ├── pages/vendor/    # Espace vendeur (tableau de bord, produits, commandes)
        ├── pages/admin/     # Back-office plateforme
        ├── components/      # Composants réutilisables
        └── styles/design-system.css
```

---

## 🚀 Installation — Backend (Laravel)

> Prérequis : PHP 8.2+, Composer, MySQL 8, extension `intl`/`gd`.

Le dossier `backend/` est un projet Laravel complet et autonome (squelette inclus : `artisan`,
`public/index.php`, fichiers de config...) — pas besoin de lancer `laravel new`, il suffit de :

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configurer .env : DB_DATABASE, DB_USERNAME, DB_PASSWORD, FRONTEND_URL

php artisan migrate --seed
php artisan storage:link
php artisan serve   # http://localhost:8000
```

Comptes de démonstration créés par le seeder (mot de passe : `password`) :

| Rôle    | Téléphone         | Détail                          |
|---------|-------------------|----------------------------------|
| Admin   | +2250700000001    | Accès `/admin`                  |
| Vendeur | +2250700000002    | Boutique **Premium** (2%), avec un ebook et un affilié de démo |
| Vendeur | +2250700000003    | Boutique **Standard** (1%)      |

L'affilié de démo a pour code `FATOU30` et le téléphone `+2250700000099` — utilisable pour
tester `/affilies/FATOU30`.

### Taux de commission

Configurables dans `.env` :
```
COMMISSION_RATE_STANDARD=1
COMMISSION_RATE_PREMIUM=2
```
Le taux appliqué à une commande est **figé au moment de la commande** (colonne
`orders.taux_commission_applique`), donc un changement de configuration n'affecte
jamais les commandes déjà passées.

### Paiement (Wave, etc.)

Le schéma inclut une table `payments` et un `PaymentController` prêts à recevoir un
vrai fournisseur (Wave, Orange Money, MTN MoMo). Le MVP fonctionne par défaut en
**paiement à la livraison**. Pour activer Wave : ajouter `'wave'` au tableau
`PaymentController::FOURNISSEURS_ACTIFS`, implémenter le client HTTP Wave, et brancher
son webhook sur `POST /api/paiements/webhook/wave`.

---

## 🚀 Installation — Frontend (React)

> Prérequis : Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env
# Vérifier VITE_API_URL (http://localhost:8000/api en local)

npm run dev   # http://localhost:5173
```

Build de production :
```bash
npm run build   # génère le dossier dist/
```

---

## 📄 Produits numériques (ebooks, formations)

Un produit peut être **physique** (livré, avec stock) ou **numérique** (fichier téléchargeable).

- Le fichier (PDF, ZIP, EPUB, MP4 — 500 Mo max) est stocké sur le **disque privé `local`**,
  jamais exposé publiquement. Chaque commande génère un **jeton de téléchargement unique**
  (`acces_numeriques`), limité à 10 téléchargements par défaut.
- Le vendeur choisit, produit par produit, **quand le lien est débloqué** :
  - `immediat` : dès la commande passée (paiement en ligne simulé pour l'instant, à brancher
    sur Wave/Orange Money/MTN MoMo — voir section Paiement) ;
  - `apres_confirmation` : uniquement lorsque le vendeur confirme manuellement la commande
    depuis son tableau de bord (utile s'il valide le paiement lui-même, ex. par Wave direct).
- Le client télécharge son fichier depuis sa page de suivi de commande (`/suivi/{numero}`),
  sans jamais avoir besoin de créer de compte.
- Le panier s'adapte automatiquement : **aucune adresse de livraison n'est demandée** si la
  commande ne contient que des produits numériques.

## 🔗 Programme d'affiliation

Chaque boutique peut activer l'affiliation, produit par produit, avec un taux de commission
librement fixé par le vendeur.

- **Devenir affilié** est ouvert à tous, sans compte CommandeCI, via un simple formulaire
  public (`/b/{slug}/affiliation`) : nom + téléphone suffisent. Si l'affilié est aussi un
  vendeur CommandeCI connecté, son compte est automatiquement rattaché.
- Chaque affilié reçoit un **lien personnel** (`?ref=CODE`) et un **code**. Le clic est suivi,
  et le code est mémorisé côté client (30 jours) même si l'achat a lieu plus tard.
- À la commande, la commission d'affiliation est calculée **produit par produit** (chaque
  produit a son propre taux) et **figée** sur la commande, comme la commission plateforme.
- L'affilié suit ses statistiques (clics, ventes, commissions) sur une page publique
  (`/affilies/{code}`), sécurisée par son numéro de téléphone — toujours sans compte.
- Le vendeur gère ses affiliés (activation/suspension, performance) depuis
  `/affilies` dans son tableau de bord.

---

## 🔐 Sécurité mise en place

- **Sanctum** pour l'auth API vendeur/admin (tokens, pas de session cookie côté API mobile).
- **Rate limiting** sur inscription, connexion, ajout au panier et passage de commande
  (`throttle` sur les routes sensibles dans `routes/api.php`).
- **Validation stricte** (`FormRequest`/`$request->validate()`) sur toutes les entrées,
  y compris upload d'images (`mimes:jpg,jpeg,png,webp`, taille max).
- **Contrôle d'accès** : chaque contrôleur vendeur vérifie que la ressource appartient
  bien à l'utilisateur connecté (`abort_unless($produit->boutique->user_id === ...)`).
- **CSRF** géré nativement par Sanctum pour le flux SPA stateful ; **XSS** limité par
  l'échappement React côté frontend et l'absence de `dangerouslySetInnerHTML`.
- **Injection SQL** : Eloquent + requêtes paramétrées partout, aucune requête brute concaténée.
- Middleware `admin` dédié pour isoler complètement les routes `/api/admin/*`.

---

## 🗺️ Endpoints API principaux

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/boutiques/{slug}                      (vitrine publique)
POST   /api/boutiques/{slug}/panier                (ajouter au panier, sans compte)
POST   /api/boutiques/{slug}/commandes             (passer commande, sans compte)
GET    /api/commandes/{numero}/suivi               (suivi public, avec liens de téléchargement)
POST   /api/boutiques/{slug}/affiliation           (devenir affilié, sans compte)
GET    /api/boutiques/{slug}/affiliation/clic/{code} (suivi d'un clic affilié)
GET    /api/affilies/{code}/tableau-de-bord        (stats affilié, sans compte)
GET    /api/telechargements/{token}                (téléchargement sécurisé par jeton)

# Vendeur (Sanctum)
GET    /api/ma-boutique | PUT /api/ma-boutique
GET/POST/PUT/DELETE /api/produits
GET    /api/commandes | PUT /api/commandes/{id}/statut
GET    /api/commandes/{id}/facture
GET    /api/tableau-de-bord
GET    /api/clients
GET    /api/affilies | PUT /api/affilies/{id}/activation

# Admin (Sanctum + rôle admin)
GET    /api/admin/boutiques | PUT /api/admin/boutiques/{id}/plan
GET    /api/admin/commandes
GET    /api/admin/signalements
GET    /api/admin/statistiques
```

---

## 🎨 Design

Système de design propre à CommandeCI (`frontend/src/styles/design-system.css`) :
- **Palette** : encre `#14162B`, indigo `#2C2A6B`, papaye `#FF7A1A`, feuille `#1F8A4C`, sable `#FBF6EE`.
- **Typographie** : Fraunces (titres), Inter (texte), IBM Plex Mono (prix, numéros de commande, reçus).
- **Signature** : motif « bulle de discussion → reçu déchiré », qui matérialise l'idée centrale
  du produit : un message WhatsApp qui devient une commande structurée.
- Mobile-first, navigation basse façon application pour l'espace vendeur.

---

## 📌 Ce qui n'est volontairement pas dans ce livrable

- Intégration réelle Wave/Orange Money/MTN MoMo (couche prête, clé API à brancher).
- Envoi de notifications push/SMS (actuellement stockées en base, prêtes à être poussées).
- Génération de PDF serveur pour la facture (le frontend peut imprimer la vue facture ;
  brancher `barryvdh/laravel-dompdf` si un vrai PDF téléchargeable est nécessaire).
- Redimensionnement/optimisation des images produits (ajouter `intervention/image` si besoin
  de générer des vignettes — non inclus par défaut pour garder les dépendances minimales).
- Tests automatisés (à ajouter avec Pest/PHPUnit côté API, Vitest côté frontend).
#   C o m m a n d e C i  
 