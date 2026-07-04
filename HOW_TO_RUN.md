# How to Run ELEV8 Fitness

This repo has **two separate websites** — pick the one you want to run:

1. **The main site** — React + Node + Postgres (`client/` + `server/`) — this is the one under active development.
2. **The legacy static site** — plain PHP/MySQL (`Elev8/`) — kept only as a reference copy, runs under XAMPP.

All commands below are PowerShell, run from the project root
(`c:\Users\wilbu\OneDrive\Desktop\elev8-fitness-website`) unless a `cd` is shown.

---

## 1. Main site — Option A: Docker (one command, easiest)

**Prerequisite:** Docker Desktop must be running first (open it from the Start menu and wait
until it says "Engine running" — the whale icon in the system tray stops animating).

```powershell
Copy-Item .env.example .env
docker compose up -d --build
```

This starts Postgres, the API, and the client together, in the right order, and runs
database migrations automatically.

- Website: **http://localhost:8080**
- API directly: **http://localhost:5000**
- API docs: **http://localhost:5000/api-docs**

To stop it: `docker compose down` (add `-v` to also wipe the database volume).

---

## 2. Main site — Option B: Manual dev (two terminals, no Docker needed for the app itself)

You still need a Postgres database reachable. Easiest way — start just the database
container:

```powershell
docker compose up -d postgres
```

(Or point `DATABASE_URL` in `server/.env` at any Postgres instance you already have.)

**Terminal 1 — server:**

```powershell
cd server
Copy-Item .env.example .env
npm install
npm run prisma:migrate:deploy
npm run prisma:seed      # optional — adds a demo login + sample bookings/feedback
npm run dev
```

Server runs at **http://localhost:5000**.

**Terminal 2 — client:**

```powershell
cd client
npm install
npm run dev
```

Client runs at **http://localhost:5173** (proxies `/api` calls to the server automatically).

**Demo login** (only if you ran `npm run prisma:seed`):
`demo@elev8.fit` / `password123`

---

## 3. Legacy static site (`Elev8/` folder) — via XAMPP

This one isn't Node-based at all — it's plain PHP + MySQL served by Apache.

**One-time setup** — XAMPP only serves files from inside its own `htdocs` folder, so make
this project reachable there (creates a folder link, doesn't copy/move anything):

```powershell
New-Item -ItemType Junction -Path "C:\xampp\htdocs\elev8-fitness-website" -Target "C:\Users\wilbu\OneDrive\Desktop\elev8-fitness-website"
```

**Every time you want to run it:**

1. Open the **XAMPP Control Panel** and click **Start** next to both **Apache** and **MySQL**.
2. Go to **http://localhost/elev8-fitness-website/Elev8/**

The database (`elev8_db`) and all its tables are created automatically the first time a
PHP page runs a query — no manual SQL import needed.

---

## Which one should I use day to day?

- Making a change and want to see it in the browser → **Option B** (manual dev) — fastest
  reload, no rebuild step.
- Want to double-check the whole stack works end-to-end like production → **Option A** (Docker).
- Checking the old reference site still matches → **Option 3** (XAMPP).
