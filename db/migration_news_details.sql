-- Run this in the Supabase SQL Editor to upgrade the news tables

ALTER TABLE daily_news 
  ADD COLUMN IF NOT EXISTS full_content TEXT,
  ADD COLUMN IF NOT EXISTS strategic_significance TEXT,
  ADD COLUMN IF NOT EXISTS key_actors JSONB,
  ADD COLUMN IF NOT EXISTS related_countries JSONB,
  ADD COLUMN IF NOT EXISTS tags JSONB;

ALTER TABLE ai_news 
  ADD COLUMN IF NOT EXISTS full_content TEXT,
  ADD COLUMN IF NOT EXISTS strategic_significance TEXT,
  ADD COLUMN IF NOT EXISTS key_actors JSONB,
  ADD COLUMN IF NOT EXISTS related_countries JSONB,
  ADD COLUMN IF NOT EXISTS tags JSONB;
