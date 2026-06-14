-- ============================================================
-- DefenceAI — Supabase Schema (Full)
-- Run this entire file in your Supabase SQL Editor
-- Supabase: https://supabase.com → Project → SQL Editor
-- ============================================================

-- Daily Defence News (refreshed once per day at 6 PM IST)
CREATE TABLE IF NOT EXISTS daily_news (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  source      TEXT DEFAULT 'DefenceAI',
  category    TEXT CHECK (category IN ('national', 'international')) NOT NULL,
  fetch_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_news_fetch_date ON daily_news (fetch_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_news_category   ON daily_news (category);

-- AI & Tech News (refreshed once every 48 hours at 6 PM IST)
CREATE TABLE IF NOT EXISTS ai_news (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  source      TEXT DEFAULT 'DefenceAI',
  fetch_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_news_fetch_date ON ai_news (fetch_date DESC);

-- Search Cache (Gemini responses cached indefinitely)
CREATE TABLE IF NOT EXISTS search_cache (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query      TEXT UNIQUE NOT NULL,
  answer     TEXT NOT NULL,
  source     TEXT DEFAULT 'gemini',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_cache_query ON search_cache (query);

-- Defence Knowledge (seeded from db/seed.js)
CREATE TABLE IF NOT EXISTS defence_knowledge (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                          TEXT UNIQUE NOT NULL,
  category                      TEXT NOT NULL,
  sub_category                  TEXT,
  title                         TEXT NOT NULL,
  summary                       TEXT NOT NULL,
  timeline                      TEXT,
  key_facts                     JSONB DEFAULT '[]',
  outcome                       TEXT,
  significance                  TEXT,
  countries_supporting_india    TEXT,
  countries_supporting_opponent TEXT,
  created_at                    TIMESTAMPTZ DEFAULT now(),
  updated_at                    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_defence_knowledge_category ON defence_knowledge (category);
CREATE INDEX IF NOT EXISTS idx_defence_knowledge_slug     ON defence_knowledge (slug);
CREATE INDEX IF NOT EXISTS idx_defence_knowledge_fts ON defence_knowledge
  USING GIN (to_tsvector('english',
    title || ' ' || summary || ' ' ||
    COALESCE(outcome, '') || ' ' || COALESCE(significance, '')
  ));

-- Admin refresh log
CREATE TABLE IF NOT EXISTS refresh_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type         TEXT NOT NULL,
  status           TEXT NOT NULL,
  message          TEXT,
  records_inserted INT DEFAULT 0,
  ran_at           TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ────────────────────────────────────────
ALTER TABLE daily_news        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_news           ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache      ENABLE ROW LEVEL SECURITY;
ALTER TABLE defence_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_log       ENABLE ROW LEVEL SECURITY;

-- Public read (anon key)
CREATE POLICY "Public read daily_news"        ON daily_news        FOR SELECT USING (true);
CREATE POLICY "Public read ai_news"           ON ai_news           FOR SELECT USING (true);
CREATE POLICY "Public read search_cache"      ON search_cache      FOR SELECT USING (true);
CREATE POLICY "Public read defence_knowledge" ON defence_knowledge FOR SELECT USING (true);
CREATE POLICY "Public read refresh_log"       ON refresh_log       FOR SELECT USING (true);

-- Server write (anon key — tighten with service_role in production)
CREATE POLICY "Server insert daily_news"       ON daily_news        FOR INSERT WITH CHECK (true);
CREATE POLICY "Server delete daily_news"       ON daily_news        FOR DELETE USING (true);
CREATE POLICY "Server insert ai_news"          ON ai_news           FOR INSERT WITH CHECK (true);
CREATE POLICY "Server delete ai_news"          ON ai_news           FOR DELETE USING (true);
CREATE POLICY "Server insert search_cache"     ON search_cache      FOR INSERT WITH CHECK (true);
CREATE POLICY "Server update search_cache"     ON search_cache      FOR UPDATE USING (true);
CREATE POLICY "Server all defence_knowledge"   ON defence_knowledge FOR ALL   USING (true);
CREATE POLICY "Server insert refresh_log"      ON refresh_log       FOR INSERT WITH CHECK (true);
