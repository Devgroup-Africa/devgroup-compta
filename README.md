# DevGroup Accounting - Système Comptable Professionnel

Un système comptable complet développé avec React, TypeScript, Node.js et MongoDB, suivant les principes de comptabilité en partie double et les normes SYSCOHADA.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- Authentification JWT avec refresh tokens
- Gestion des rôles (Admin, Comptable, Manager, Viewer)
- Contrôle d'accès basé sur les permissions
- Audit trail pour toutes les actions financières

### 📊 Comptabilité Professionnelle
- **Plan comptable SYSCOHADA** complet
- **Journal des écritures** avec validation débit/crédit
- **Grand livre** par compte
- **Balance générale** avec vérification d'équilibre
- **Bilan et compte de résultat**

### 💰 Facturation & Ventes
- Gestion des clients
- Création de factures avec TVA
- Suivi des paiements (partiels/complets)
- Génération automatique d'écritures comptables

### 🏪 Gestion des Achats
- Gestion des fournisseurs
- Enregistrement des dépenses
- Catégorisation des charges
- Paiements fournisseurs

### 🏦 Trésorerie
- Comptes bancaires multiples
- Suivi des flux de trésorerie
- Rapprochement bancaire
- Gestion de la caisse

### 📈 Reporting & Analytics
- Dashboard avec KPIs temps réel
- Graphiques et analyses
- Alertes (trésorerie faible, factures impayées)
- Exports et rapports

## 🛠 Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build
- **TailwindCSS** pour le styling
- **Shadcn/ui** pour les composants
- **React Router** pour la navigation
- **React Query** pour la gestion d'état

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **Express Validator** pour la validation

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB 6+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone <repository-url>
cd devgroup-accounting
```

### 2. Installation Frontend
```bash
npm install
```

### 3. Installation Backend
```bash
cd server
npm install
```

### 4. Configuration

#### Backend (.env)
```bash
cd server
cp .env.example .env
```

Le fichier `.env` est déjà configuré avec votre base MongoDB Atlas :
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://devgroupentreprise_db_user:LWC5S7GRgfB2KN84@cluster-dga-1.xylzvke.mongodb.net/devgroup_compta
JWT_SECRET=devgroup_super_secret_jwt_key_2024_accounting_system
JWT_REFRESH_SECRET=devgroup_refresh_secret_2024_secure_token
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
```

#### Frontend (.env)
```bash
cd ..
cp .env.example .env
```

Modifier le fichier `.env` :
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Initialisation de la base de données
```bash
cd server
node src/scripts/initChartOfAccounts.js
```

Cette commande va :
- Se connecter à votre MongoDB Atlas
- Créer le plan comptable SYSCOHADA complet (87 comptes)
- Créer un utilisateur admin par défaut

## 🚀 Démarrage

### 1. Démarrer le backend
```bash
cd server
npm run dev
```

### 2. Démarrer le frontend
```bash
npm run dev
```

L'application sera disponible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:5000/api
- Base de données : MongoDB Atlas (devgroup_compta)

## 👤 Connexion par défaut

```
Email: admin@devgroup.cm
Mot de passe: admin123
```

## 🏗 Architecture

### Structure du projet
```
devgroup-accounting/
├── src/                    # Frontend React
│   ├── components/         # Composants réutilisables
│   ├── pages/             # Pages de l'application
│   ├── contexts/          # Contextes React
│   ├── services/          # Services API
│   └── data/              # Types et utilitaires
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── models/        # Modèles MongoDB
│   │   ├── controllers/   # Contrôleurs API
│   │   ├── routes/        # Routes Express
│   │   ├── middleware/    # Middlewares
│   │   └── scripts/       # Scripts d'initialisation
└── README.md
```

### Base de données MongoDB

#### Collections principales :
- `users` - Utilisateurs et authentification
- `accounts` - Plan comptable
- `journalentries` - Écritures comptables
- `clients` - Gestion des clients
- `suppliers` - Gestion des fournisseurs
- `invoices` - Factures
- `payments` - Paiements
- `transactions` - Transactions de trésorerie
- `bankaccounts` - Comptes bancaires

## 🔧 Développement

### Scripts disponibles

#### Frontend
```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Linting du code
```

#### Backend
```bash
npm run dev          # Démarrage avec nodemon
npm start            # Démarrage en production
npm test             # Tests unitaires
```

### Ajout de nouvelles fonctionnalités

1. **Nouveau modèle** : Créer dans `server/src/models/`
2. **Nouveau contrôleur** : Créer dans `server/src/controllers/`
3. **Nouvelles routes** : Créer dans `server/src/routes/`
4. **Nouveau composant** : Créer dans `src/components/`
5. **Nouvelle page** : Créer dans `src/pages/`

## 📝 Principes Comptables

### Comptabilité en partie double
Chaque écriture respecte le principe : **Total Débit = Total Crédit**

### Types de comptes SYSCOHADA
- **Classe 1** : Comptes de capitaux
- **Classe 2** : Comptes d'immobilisations
- **Classe 3** : Comptes de stocks
- **Classe 4** : Comptes de tiers
- **Classe 5** : Comptes financiers
- **Classe 6** : Comptes de charges
- **Classe 7** : Comptes de produits

### Génération automatique d'écritures
- **Facture client** → Débit Client (411) / Crédit Ventes (701) + TVA (445)
- **Paiement client** → Débit Banque (512) / Crédit Client (411)
- **Dépense** → Débit Charge (6xx) / Crédit Banque/Caisse (512/531)

## 🔒 Sécurité

- Hachage des mots de passe avec bcrypt
- Tokens JWT avec expiration
- Validation des données côté serveur
- Protection CORS
- Rate limiting
- Helmet pour les headers de sécurité

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : support@devgroup.cm
- Documentation : [Wiki du projet]
- Issues : [GitHub Issues]

---

**DevGroup Africa** - Système comptable professionnel pour l'Afrique 🌍# devgroup-compta
# devgroup-compta
