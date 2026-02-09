
# SentinelAI Cloud Dashboard

The multi-tenant SaaS dashboard for SentinelAI, designed to be deployed on Vercel.

## 🚀 Deployment

### Environment Variables
For the dashboard to function, you need to set the following environment variables on Vercel:

```
DATABASE_URL="postgres://..." # Your Postgres database URL (e.g., from Vercel Storage or Supabase)
NEXTAUTH_SECRET="your-secret" # (Optional for now)
```

### Setup Steps
1.  **Import Project**: Import the `proactive-security-web` repository into Vercel.
2.  **Install Command**: `npm install`
3.  **Build Command**: `npm run build` (This includes `prisma generate`)
4.  **Output Directory**: `.next`

## 🛠️ Local Development
1.  Run `npm install`.
2.  Set up a local SQLite or Postgres DB in `.env`.
3.  Run `npx prisma migrate dev`.
4.  Run `npm run dev`.

## 📦 API Overview
- `POST /api/agent/connect`: Register new agent.
- `POST /api/agent/pulse`: Heartbeat & metrics.
- `GET /api/dashboard/overview`: Dashboard data.
