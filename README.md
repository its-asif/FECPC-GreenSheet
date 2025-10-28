# FECPC Practice Tracker

A full-stack web app for Faridpur Engineering College Programming Club students to track problem-solving progress, with Google Sign-In (Firebase Auth), admin approval, practice sheets, per-user statuses, and a public leaderboard.

## Tech Stack
- Frontend: React + React Router + Axios + Firebase Auth SDK (Google Sign-In only)
- Backend: Node.js + Express, verifying Firebase ID tokens via Google JWKS (using `jose`) — no service account needed
- Database: MongoDB (via Mongoose)

## Folders
- `backend/` Express API server
- `frontend/` React app

See per-folder README notes and `.env.example` files to configure.
