# Architecture LivraGo

LivraGo est organisé en monorepo npm workspaces.

- `apps/api`: API Express TypeScript, MongoDB, Mongoose, JWT.
- `apps/mobile`: application Expo React Native TypeScript.
- `packages/shared-types`: types partagés entre mobile et API.
- `packages/validation`: schémas Zod partagés.
- `packages/config`: configuration commune, palette et constantes.

La logique backend suit le découpage `routes -> controller -> service -> model`.
