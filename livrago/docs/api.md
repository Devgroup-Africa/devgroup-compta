# API LivraGo

Base locale: `http://localhost:4000/api`

## Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
GET /api/auth/me
```

Les routes `refresh-token`, `forgot-password` et `reset-password` sont réservées et retournent actuellement `501`.
