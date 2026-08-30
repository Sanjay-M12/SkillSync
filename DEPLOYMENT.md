# 🚀 100% Free Complete Hosting Guide for SkillSync

This guide walks you through deploying the complete **SkillSync** application (Frontend + Backend + PostgreSQL Database + AI) completely **FREE** forever with **$0 cost** and **no credit card required**.

---

## 🏗️ Architecture Overview

| Component | Free Platform | Free Tier Highlights |
| :--- | :--- | :--- |
| **Database** | [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com) | Serverless PostgreSQL, 0.5 GB storage, permanent free tier |
| **Backend API** | [Render.com](https://render.com) (or [Koyeb.com](https://koyeb.com)) | 750 free compute hours/month, automated Git deployments, free SSL |
| **Frontend Web App** | [Vercel](https://vercel.com) (or [Netlify](https://netlify.com)) | Fast global edge CDN, unlimited automated builds, free SSL |
| **AI (LLM & Embeddings)** | [Google AI Studio](https://aistudio.google.com) | Free API Key for Gemini 1.5 Flash & text-embedding-004 |
| **24/7 Keep-Alive** | [UptimeRobot](https://uptimerobot.com) | 50 free monitors to keep free backend awake |

---

## Step 1: Deploy Free PostgreSQL Database (Neon.tech)

1. Go to **[Neon.tech](https://neon.tech)** and sign up with GitHub or Google (No credit card required).
2. Click **Create Project** -> Name it `skillsync-db`.
3. Choose the region closest to you (e.g. `us-east-2` or `eu-central-1`).
4. Once created, copy the **Connection String (Pooled)**. It looks like:
   ```text
   postgresql://skillsync_owner:xxxxxx@ep-cool-cloud-123456-pooler.us-east-2.aws.neon.tech/skillsync?sslmode=require
   ```
5. Keep this `DATABASE_URL` handy.

---

## Step 2: Deploy Free Backend API (Render.com)

1. Push your repository to **GitHub** or **GitLab**.
2. Sign up / Log in to **[Render.com](https://render.com)**.
3. Click **New +** -> **Web Service**.
4. Connect your SkillSync GitHub repository.
5. Configure the service settings:
   - **Name**: `skillsync-api` (or any custom name)
   - **Region**: Same region as your Neon database (e.g., Ohio / Frankfurt)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma migrate deploy && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: **Free** ($0 / month)

6. Scroll down to **Environment Variables** and add:
   | Key | Value / Description |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `DATABASE_URL` | *Paste your Neon Connection String from Step 1* |
   | `JWT_SECRET` | *Any long random secret string (min 32 characters)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `http://localhost:5173` *(Update this after Step 3 with your Vercel URL)* |
   | `GEMINI_API_KEY` | *Your Google AI Studio API Key (from https://aistudio.google.com)* |
   | `GEMINI_LLM_MODEL` | `gemini-1.5-flash` |
   | `GEMINI_EMBEDDING_MODEL` | `text-embedding-004` |
   | `GOOGLE_CLIENT_ID` | *(Optional) Your Google OAuth Client ID* |

7. Click **Create Web Service**.
8. Render will build and deploy your API. Once deployed, copy your API URL:
   `https://skillsync-api-xxxx.onrender.com`

---

## Step 3: Deploy Free Frontend Web App (Vercel)

1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your SkillSync repository.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://skillsync-api-xxxx.onrender.com/api` *(Your Render backend URL with `/api`)* |
   | `VITE_GOOGLE_CLIENT_ID` | *(Optional) Your Google OAuth Client ID* |

6. Click **Deploy**.
7. Vercel will build and assign you a fast HTTPS URL, e.g.:
   `https://skillsync-app.vercel.app`

---

## Step 4: Link Frontend & Backend URLs

Now connect the two services:

1. Go back to your **Render Web Service** -> **Environment Variables**.
2. Update `CLIENT_URL` with your Vercel URL:
   ```text
   CLIENT_URL=https://skillsync-app.vercel.app
   ```
3. Click **Save Changes** (Render will automatically re-deploy with updated CORS).
4. *(If using Google OAuth)*: Add both your Vercel URL and Render URL to the **Authorized JavaScript Origins** and **Authorized Redirect URIs** in your [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

---

## Step 5: (Bonus) Keep the Free Backend Awake 24/7

Render free tier instances sleep after 15 minutes of inactivity (causing a 30-50 second cold start delay on the next visit). You can keep it alive for free 24/7:

1. Sign up for free at **[UptimeRobot](https://uptimerobot.com)** (or **[Cron-Job.org](https://cron-job.org)**).
2. Click **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `SkillSync Backend Keep-Alive`
   - **URL**: `https://skillsync-api-xxxx.onrender.com/api/health`
   - **Monitoring Interval**: `Every 10 minutes`
3. Click **Create Monitor**. Your backend will stay warm and respond instantly!

---

## ✅ Free Hosting Checklist

- [x] **Prisma Auto-Migration**: Build script applies database schema on Neon during deployment.
- [x] **SPA Routing**: `client/vercel.json` and `client/public/_redirects` prevent 404s on page refresh.
- [x] **CORS Configuration**: Server handles production Vercel / Netlify domains and trailing slashes.
- [x] **Database SSL**: Neon connection string works with Prisma's SSL requirements.
- [x] **Zero Monthly Invoices**: All components are on permanent free tiers.
