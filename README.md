# PharmaSense 💊

A professional pharmacy inventory and point-of-sale management system built for Nigerian healthcare providers.

## Features

- **FEFO Inventory** — First-Expired-First-Out batch allocation at every sale
- **POS Terminal** — Fast dispensing with barcode scanning and PDF receipts
- **NAFDAC Compliance** — Mandatory regulatory number validation
- **Expiry Alerts** — Proactive notifications before stock expires
- **Role-Based Access** — Separate Admin and Staff portals
- **Audit Trail** — Every action logged with timestamp and user ID
- **Real-Time Sync** — Firebase Firestore for live multi-device updates
- **Offline Fallback** — Local storage demo mode when Firebase is not configured

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: jsPDF + AutoTable
- **Hosting**: Vercel

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pharmasense.git
cd pharmasense
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your values from the [Firebase Console](https://console.firebase.google.com).

### 4. Run locally

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's project settings (same keys as `.env`)
4. Deploy — Vercel will auto-detect Vite and build correctly

> **Important**: Never commit your `.env` file. The `.gitignore` already excludes it. Add your Firebase keys as Environment Variables in Vercel.

## Default Accounts (Demo Mode)

When Firebase is not configured, the app runs in local demo mode with seed data.

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@pharmasense.ng | Admin@123 |
| Staff | staff@pharmasense.ng | Staff@123 |

## License

Private — All rights reserved.
