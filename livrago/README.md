# LivraGo

LivraGo est une application mobile de livraison en monorepo: API Node.js/Express/MongoDB et application mobile Expo React Native.

## Prérequis

- Node.js 20+
- npm 10+
- MongoDB local, MongoDB Atlas ou Docker
- Expo Go pour tester sur mobile

## Installation

```bash
cd livrago
npm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

## Lancement

API:

```bash
npm run dev:api
```

Mobile:

```bash
npm run dev:mobile
```

Docker:

```bash
docker compose up --build
```

## Variables principales

- `MONGODB_URI`: URI MongoDB.
- `JWT_ACCESS_SECRET`: secret du token court.
- `JWT_REFRESH_SECRET`: secret du refresh token.
- `EXPO_PUBLIC_API_URL`: URL publique de l'API pour Expo.

## Endpoints disponibles

```http
GET /health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
GET /api/auth/me
GET /api/users/me
```

Exemple inscription:

```json
{
  "firstName": "Client",
  "lastName": "Demo",
  "email": "customer@livrago.local",
  "phone": "+24100000001",
  "password": "Password123!",
  "role": "CUSTOMER"
}
```

## Arborescence

```text
livrago/
├── apps/
│   ├── api/
│   └── mobile/
├── packages/
│   ├── shared-types/
│   ├── validation/
│   └── config/
├── docs/
├── docker-compose.yml
├── package.json
└── README.md
```

## Fonctionnalités implémentées

- Monorepo npm workspaces.
- TypeScript strict.
- API Express sécurisée avec Helmet, CORS et rate limiting.
- Connexion MongoDB avec Mongoose.
- Modèle `User`.
- Authentification register/login/OTP simulé.
- Middleware JWT et middleware d'autorisation par rôle.
- Application Expo configurée avec NativeWind.
- Écrans `LoginScreen` et `RegisterScreen`.

## Limites actuelles

- L'OTP est simulé avec `123456`.
- Le refresh token, le reset password, les livraisons, paiements, Socket.IO, seed et tests restent à implémenter dans les prochaines étapes.
- L'URI MongoDB fournie doit être remplacée par un secret sécurisé avant production.

## Prochaines étapes

1. Ajouter les modèles `Address`, `DriverProfile`, `Vehicle`, `Delivery`, `Payment`, `Wallet`, `Rating`.
2. Implémenter pricing Haversine et workflow de livraison.
3. Ajouter Socket.IO avec authentification JWT.
4. Brancher les formulaires mobiles sur l'API.
5. Ajouter tests Jest/Supertest et seed de démonstration.
