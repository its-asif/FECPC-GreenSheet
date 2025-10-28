# Frontend (React + Vite)

## Setup
1. Copy `.env.example` to `.env` and fill Firebase client config and `VITE_API_URL`.
2. Install deps and run:

Windows (cmd):

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Pages
- Login – Google sign-in
- Profile – fill details; shows waiting message if not approved
- Sheets – approved users can update statuses (auto-saves)
- Leaderboard – public
- Admin – manage users, sheets, problems (UI gated; server also enforces)
