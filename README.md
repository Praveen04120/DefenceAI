# DefenceAI

**Defence & Geopolitics Intelligence Platform**
Founded by **Praveen Yadav**

DefenceAI is an advanced web platform providing curated daily defence news, geopolitical updates, and an extensive AI-powered knowledge base of wars, conflicts, and military operations. It uses a custom "local-first" search architecture that intelligently queries a curated knowledge base before falling back to live AI generation.

---

## Architecture Overview

* **Frontend:** Vanilla HTML/CSS/JS (Lightweight, fast, no build step required)
* **Backend:** Node.js + Express
* **Database:** Supabase (Cloud PostgreSQL)
* **AI:** Generative AI for real-time answers and news summarization
* **Automation:** Vercel Cron Jobs for news curation

---

## 1. Local Setup

### Prerequisites
* Node.js (v18+)
* A Supabase account
* An AI API key

### Installation
1. Clone the repository or open the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file by copying the template:
   ```bash
   cp .env.example .env
   ```

---

## 2. Supabase Setup & Database Schema

DefenceAI relies on a Supabase PostgreSQL database to store news, knowledge base entries, and cached searches.

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of `db/schema.sql` and run it. This will create the following tables:
   * `daily_news`: Stores the daily curated defence news.
   * `ai_news`: Stores the 48-hour AI & tech news updates.
   * `defence_knowledge`: The core knowledge base of wars, conflicts, and operations.
   * `search_cache`: Caches previously generated AI answers.
   * `refresh_log`: Logs automated cron job executions.
4. Get your Project URL and Anon Key from **Project Settings → API** and add them to your `.env` file.

---

## 3. Database Seeding

Once your database schema is created, you must populate the `defence_knowledge` table with the baseline data.

Run the seed script:
```bash
npm run seed
```
This script will populate the database with over 30 major wars, operations, conflicts, and defence programs.

---

## 4. AI API Setup

1. Obtain a valid AI API Key.
2. Add the key to your `.env` file as `API_KEY`.

---

## 5. Environment Variables

Your `.env` file should look like this:

```env
# AI API Key
API_KEY=your_api_key_here

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Security
ADMIN_SECRET=choose-a-strong-secret-for-admin-panel
CRON_SECRET=choose-a-secret-for-cron-jobs

# Server
PORT=3000
NODE_ENV=development
```

---

## 6. Running Locally

Start the development server:
```bash
npm run dev
```
The platform will be available at `http://localhost:3000`.

---

## 7. Vercel Deployment & Cron Jobs

This project is configured to be deployed effortlessly on Vercel.

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add all your environment variables (`API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_SECRET`, `CRON_SECRET`) in the Vercel dashboard.
4. Deploy the project.

### Cron Jobs
The `vercel.json` file configures two automated cron jobs:
* **Daily News:** Fetches the latest global defence news every day at 6:00 PM IST (`/api/cron/news`).
* **AI News:** Fetches AI and military technology news every 48 hours at 6:00 PM IST (`/api/cron/ai-news`).

Vercel will automatically trigger these endpoints. They are protected by the `CRON_SECRET` variable, which Vercel securely injects.

---

## 8. Admin Panel Usage

DefenceAI includes a hidden admin panel to manage content and trigger manual data refreshes.

1. Navigate to `/admin` in your browser (e.g., `https://yourdomain.com/admin`).
2. Enter your `ADMIN_SECRET` to log in.
3. **Features:**
   * **Overview:** View system stats and manually trigger Daily News and AI News generation.
   * **Knowledge:** Add, edit, or delete entries in the `defence_knowledge` database.
   * **Cache:** View and clear the `search_cache` of AI-generated answers.
   * **Logs:** View the execution logs of the automated cron jobs.

---

**Built by Praveen Yadav** | DefenceAI
