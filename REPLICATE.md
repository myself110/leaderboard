# Replicate This Project on Another Device

Step-by-step guide to copy, run, and deploy the Live Leaderboard on a new computer.

---

## What you need

| Requirement | Notes |
|-------------|-------|
| **Node.js 20+** | Includes `npm`. Download from [nodejs.org](https://nodejs.org) (LTS recommended) |
| **This project folder** | Copy via USB, cloud drive, Git, or ZIP |
| **Netlify account** | Free — only needed for deployment (not for local testing) |
| **Internet** | For `npm install` and Netlify deploy |

You do **not** need Supabase or any other database account.

---

## Step 1 — Copy the project

### Option A: Git (recommended)

On the **source** device (if the project is in Git):

```powershell
git clone <your-repo-url>
cd Leaderboard
```

### Option B: USB / cloud / ZIP

Copy the whole `Leaderboard` folder **except**:

| Do NOT copy | Why |
|-------------|-----|
| `node_modules/` | Reinstalled with `npm install` (~large) |
| `dist/` | Rebuilt with `npm run build` |
| `.local-data/` | Local-only dev data; optional |
| `.netlify/` | Local Netlify cache |

**Do copy** everything else: `src/`, `netlify/`, `shared/`, `package.json`, `netlify.toml`, etc.

---

## Step 2 — Install Node.js

### Windows

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download **LTS**
3. Run the installer (keep “Add to PATH” checked)
4. **Close and reopen** your terminal (or restart Cursor)
5. Verify:

```powershell
node --version
npm --version
```

If `npm` is not recognized:

```powershell
# Refresh PATH in current terminal
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm --version
```

Or use the full path:

```powershell
& "C:\Program Files\nodejs\npm.cmd" --version
```

Windows install via winget:

```powershell
winget install OpenJS.NodeJS.LTS
```

### macOS

```bash
# Homebrew
brew install node

node --version
npm --version
```

### Linux (Debian/Ubuntu)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

node --version
npm --version
```

---

## Step 3 — Install project dependencies

Open a terminal in the project folder:

```powershell
cd path\to\Leaderboard
npm install
```

This creates `node_modules/` and may take a few minutes.

---

## Step 4 — Set the admin password

```powershell
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env` and change the password:

```
ADMIN_PASSWORD=your-secret-password-here
```

This password is used to log in at `/admin`. Pick something only organizers know.

---

## Step 5 — Run locally

**Important:** Use Netlify Dev, not plain `npm run dev`. Functions and storage only work with Netlify Dev.

```powershell
npm run netlify:dev
```

Open in your browser:

| URL | Purpose |
|-----|---------|
| http://localhost:8888 | Scoreboard |
| http://localhost:8888/admin | Admin panel |
| http://localhost:8888/s/{token} | Submit page (from QR) |

Log in to admin with the password from `.env`.

### Quick test checklist

1. Admin → add a player → QR appears  
2. Scan QR (or open the submit URL) → submit a score  
3. Scoreboard → score shows within ~2 seconds  

---

## Step 6 — Deploy to Netlify (production)

Each device can deploy to the **same** Netlify site or a **new** one.

### First-time deploy

1. Push the project to **GitHub** (if not already)
2. Sign in at [https://app.netlify.com](https://app.netlify.com)
3. **Add new site** → **Import an existing project** → connect GitHub repo
4. Netlify reads `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions: `netlify/functions`
5. **Site configuration → Environment variables** → add:
   - Key: `ADMIN_PASSWORD`
   - Value: your secret password (same as `.env` or a new one)
6. Deploy

Your site will be at `https://something.netlify.app`.

### Deploy from CLI (alternative)

```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Set `ADMIN_PASSWORD` in the Netlify dashboard under **Environment variables**.

---

## Step 7 — Event setup on the new device

After deploy (or locally):

1. Open `https://your-site.netlify.app/admin`
2. Log in with `ADMIN_PASSWORD`
3. **Add players / groups** — each gets a permanent QR code
4. Set **max submissions per QR** (e.g. 3)
5. **Print QR sheet** (Admin → Print QR sheet)
6. Open `https://your-site.netlify.app/` on the projector
7. Participants scan and submit

---

## Moving data between devices

| Data | Where it lives | How to move |
|------|----------------|-------------|
| **Local dev data** | `.local-data/` folder | Copy folder to same path on new device (dev only) |
| **Production data** | Netlify Blobs (on Netlify servers) | No copy needed — same site = same data |
| **Players & scores** | Tied to Netlify site | Use the **same Netlify site** on any device |

If you deploy a **new** Netlify site, you start with empty data. Re-add players in admin (or export/import manually via admin CSV).

QR codes are **per player token**. If you recreate players on a new site, they get **new** QR codes.

---

## Project structure (reference)

```
Leaderboard/
├── src/                    # React frontend
│   ├── pages/              # Leaderboard, Submit, Admin
│   ├── components/
│   ├── hooks/
│   └── lib/api.ts          # API client
├── netlify/functions/      # Backend API
│   ├── leaderboard.ts
│   ├── submit-score.ts
│   ├── admin-*.ts
│   └── _shared/            # Blobs, auth, data helpers
├── shared/types.ts         # Shared TypeScript types
├── netlify.toml            # Netlify build & deploy config
├── package.json
├── .env                    # Local admin password (not committed)
└── .env.example            # Template for .env
```

---

## Troubleshooting

### `npm` is not recognized

- Node.js is not installed, or PATH is stale
- Install Node.js from [nodejs.org](https://nodejs.org)
- **Close all terminals** and open a new one (or restart Cursor)
- See [Step 2](#step-2--install-nodejs) for PATH refresh commands

### Scoreboard shows “Failed to load” locally

- You ran `npm run dev` instead of `npm run netlify:dev`
- Stop the server and run: `npm run netlify:dev`
- Use port **8888**, not 5173

### Admin login fails

- Check `.env` has `ADMIN_PASSWORD=...`
- Restart `npm run netlify:dev` after changing `.env`
- On Netlify: confirm `ADMIN_PASSWORD` is set in **Environment variables** and redeploy

### QR codes point to wrong URL

- QR URLs use the current site origin (e.g. `localhost:8888` locally, `your-site.netlify.app` in production)
- Print QRs **after** deploying to the final Netlify URL for the event

### Build fails on Netlify

- Ensure Node 20+ (set in `netlify.toml` as `NODE_VERSION = "20"`)
- Check build logs for missing dependencies
- Run `npm run build` locally first to catch errors

---

## Commands cheat sheet

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies (first time / after copy) |
| `npm run netlify:dev` | Run locally with API + storage |
| `npm run build` | Production build (test before deploy) |
| `npm run dev` | Frontend only — **no API** (avoid for full testing) |

---

## One-page checklist

```
[ ] Copy project folder (without node_modules)
[ ] Install Node.js LTS
[ ] npm install
[ ] copy .env.example .env → set ADMIN_PASSWORD
[ ] npm run netlify:dev → test at localhost:8888
[ ] Push to GitHub
[ ] Connect repo on Netlify
[ ] Set ADMIN_PASSWORD in Netlify env vars
[ ] Deploy
[ ] Admin: add players, print QRs, set limits
[ ] Open / on projector
```

---

## Support links

- Node.js: https://nodejs.org  
- Netlify docs: https://docs.netlify.com  
- Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs  
