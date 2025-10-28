# Backend (Express + Firebase Auth verify via JWKS + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and fill values:
   - `ADMIN_EMAILS`: comma-separated admin emails
   - Mongo: `MONGODB_URI` (e.g., mongodb://localhost:27017/fecpc_practice)
   - Firebase Auth verification (Google Sign-In only): set `FIREBASE_PROJECT_ID` (no service account needed)
2. Install deps and run:

Windows (cmd):

```
cd backend
npm install
npm run dev
```

The server runs on `http://localhost:5000`.
ID tokens are verified against Google JWKS for `securetoken@system.gserviceaccount.com`.

Optional: ping MongoDB using the official driver

```
npm run mongo:ping
```

## API Overview
- `GET /api/health` – health check
- `POST /api/auth/profile` – save profile (requires Firebase ID token)
- `GET /api/auth/me` – get my profile
- `GET /api/sheets` – list sheets + problems (approved users only)
- `GET /api/progress/:sheetId` – my statuses for a sheet
- `PUT /api/progress/:sheetId/:problemId` – update my status
- `GET /api/leaderboard` – public leaderboard

Admin (token + email must be in `ADMIN_EMAILS`):
- `GET /api/admin/users` – list users
- `POST /api/admin/users/approve` – body `{ uid, approved }`
- `POST /api/admin/sheets` – body `{ name }`
- `POST /api/admin/sheets/:sheetId/problems` – body `{ title, platform, link }`
- `POST /api/admin/seed/greensheet` – seed example problems
