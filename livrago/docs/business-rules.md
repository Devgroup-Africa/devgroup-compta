# Règles Métier

Règles prévues pour le MVP:

- les rôles disponibles sont `CUSTOMER`, `BUSINESS`, `DRIVER`, `DELIVERY_COMPANY`, `ADMIN`;
- l'OTP est simulé avec le code `123456` en développement;
- un compte devient `ACTIVE` après vérification OTP;
- les accès protégés passent par JWT et middleware de rôles.
