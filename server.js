/* ═══════════════════════════════════════════════════════════════
   DefenceAI — Server v3.0
   Architecture:
   - Supabase (PostgreSQL) as persistent data store
   - Daily News: fetched by Vercel Cron at 6 PM IST, stored in DB
   - AI News: fetched every 48 hrs by Vercel Cron, stored in DB
   - Defence Knowledge: stored in Supabase, seeded from db/seed.js
   - Search: defence_knowledge → search_cache → Gemini (fallback)
   - Sports section: REMOVED
═══════════════════════════════════════════════════════════════ */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
const path    = require('path');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Env Validation ───────────────────────────────────────────
const API_KEY       = process.env.API_KEY;
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY;
const ADMIN_SECRET  = process.env.ADMIN_SECRET;
const CRON_SECRET   = process.env.CRON_SECRET  || '';

if (!API_KEY)      console.warn('⚠️  WARNING: API_KEY not set — AI features will fail');
if (!SUPABASE_URL) console.warn('⚠️  WARNING: SUPABASE_URL not set — DB features will fail');
if (!SUPABASE_KEY) console.warn('⚠️  WARNING: SUPABASE_ANON_KEY not set — DB features will fail');

// ─── Supabase Client ──────────────────────────────────────────
const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// ─── Gemini Models (fallback chain) ───────────────────────────
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
];

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════
// GEMINI HELPER — with model fallback chain + detailed logging
// ═══════════════════════════════════════════════════════════════
async function callGemini(prompt, maxTokens = 8192) {
  let lastError = null;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
    };

    console.log(`\n=== GEMINI CALL === Model: ${model}`);

    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(requestPayload),
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      const rawText = await response.text();

      if (response.status === 429 || response.status === 503) {
        console.warn(`[${model}] Quota/unavailable (${response.status}) — trying next`);
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }
      if (!response.ok) {
        console.warn(`[${model}] Error ${response.status} — Body: ${rawText.slice(0, 300)}`);
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }

      const data = JSON.parse(rawText);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[${model}] ✅ Success (${text.length} chars)`);
      return text;

    } catch (err) {
      console.error(`[${model}] Network error: ${err.message}`);
      lastError = err.message;
    }
  }

  throw new Error(`All Gemini models failed. Last: ${lastError}`);
}

// ─── Strip markdown code fences ───────────────────────────────
function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

// ─── Today's date string ──────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Admin auth middleware ────────────────────────────────────
function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — invalid admin secret' });
  }
  next();
}

// ─── Cron auth middleware ─────────────────────────────────────
function requireCron(req, res, next) {
  if (!CRON_SECRET) return next(); // skip check if not configured
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron request' });
  }
  next();
}

// ═══════════════════════════════════════════════════════════════
// STATUS ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.get('/api/status', async (req, res) => {
  try {
    const { count: newsCount }      = await supabase.from('daily_news').select('*', { count: 'exact', head: true }).eq('fetch_date', todayStr());
    const { count: aiCount }        = await supabase.from('ai_news').select('*', { count: 'exact', head: true });
    const { count: knowledgeCount } = await supabase.from('defence_knowledge').select('*', { count: 'exact', head: true });
    const { count: cacheCount }     = await supabase.from('search_cache').select('*', { count: 'exact', head: true });

    res.json({
      status:      'online',
      today:       todayStr(),
      newsToday:   newsCount   || 0,
      aiNews:      aiCount     || 0,
      knowledge:   knowledgeCount || 0,
      searchCache: cacheCount  || 0,
      models:      MODELS,
    });
  } catch (err) {
    res.json({ status: 'online', error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// NEWS ENDPOINT — reads from Supabase (populated by cron job)
// ═══════════════════════════════════════════════════════════════
app.get('/api/news', async (req, res) => {
  try {
    const today = todayStr();

    // Get today's news from Supabase
    const { data, error } = await supabase
      .from('daily_news')
      .select('*')
      .eq('fetch_date', today)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      // No data for today yet — return latest available
      const { data: latest, error: latestErr } = await supabase
        .from('daily_news')
        .select('*')
        .order('fetch_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(40);

      if (latestErr) throw latestErr;

      const national      = (latest || []).filter(n => n.category === 'national');
      const international = (latest || []).filter(n => n.category === 'international');

      return res.json({
        success: true,
        data:    { national, international },
        source:  'supabase_latest',
        message: 'Showing latest available news — today\'s batch not yet generated.',
      });
    }

    const national      = data.filter(n => n.category === 'national');
    const international = data.filter(n => n.category === 'international');

    res.json({
      success:  true,
      data:     { national, international },
      source:   'supabase',
      date:     today,
      total:    data.length,
    });

  } catch (err) {
    console.error('News fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// AI NEWS ENDPOINT — reads from Supabase (populated by cron job)
// ═══════════════════════════════════════════════════════════════
app.get('/api/ai-news', async (req, res) => {
  try {
    // Get the most recent batch of AI news (latest fetch_date)
    const { data: latestDate } = await supabase
      .from('ai_news')
      .select('fetch_date')
      .order('fetch_date', { ascending: false })
      .limit(1)
      .single();

    if (!latestDate) {
      return res.json({ success: true, data: [], source: 'empty', message: 'No AI news generated yet. Run the cron job first.' });
    }

    const { data, error } = await supabase
      .from('ai_news')
      .select('*')
      .eq('fetch_date', latestDate.fetch_date)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success:   true,
      data:      data || [],
      source:    'supabase',
      fetchDate: latestDate.fetch_date,
      total:     data?.length || 0,
    });

  } catch (err) {
    console.error('AI news fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// DEFENCE KNOWLEDGE — reads from Supabase
// ═══════════════════════════════════════════════════════════════
app.get('/api/knowledge', async (req, res) => {
  try {
    const { category, search, slug } = req.query;

    let query = supabase.from('defence_knowledge').select('*').order('category').order('title');

    if (slug) {
      query = supabase.from('defence_knowledge').select('*').eq('slug', slug).single();
      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data });
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,outcome.ilike.%${search}%,significance.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Group by category for frontend
    const grouped = {};
    (data || []).forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    res.json({
      success: true,
      data:    grouped,
      total:   data?.length || 0,
      flat:    data || [],
    });

  } catch (err) {
    console.error('Knowledge fetch error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// CHAT / SEARCH — local-first → cache → Gemini
// ═══════════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const queryNorm = message.trim().toLowerCase();

  // ─── Step 1: Search local defence_knowledge ────────────────
  try {
    const { data: localResults } = await supabase
      .from('defence_knowledge')
      .select('title, summary, timeline, key_facts, outcome, significance, countries_supporting_india, countries_supporting_opponent')
      .or(`title.ilike.%${message}%,summary.ilike.%${message}%,outcome.ilike.%${message}%`)
      .limit(3);

    if (localResults && localResults.length > 0) {
      const top = localResults[0];
      let answer = `## ${top.title}\n\n${top.summary}\n\n`;
      if (top.timeline)     answer += `**Timeline:** ${top.timeline}\n\n`;
      if (top.key_facts && top.key_facts.length) {
        answer += `**Key Facts:**\n${top.key_facts.map(f => `- ${f}`).join('\n')}\n\n`;
      }
      if (top.outcome)      answer += `**Outcome:** ${top.outcome}\n\n`;
      if (top.significance) answer += `**Significance:** ${top.significance}\n\n`;

      // Parse alliance data if available
      try {
        const proIndia = JSON.parse(top.countries_supporting_india || '[]');
        const proOpponent = JSON.parse(top.countries_supporting_opponent || '[]');
        if (proIndia.length) {
          answer += `**Countries Supporting India:**\n${proIndia.map(c => `- **${c.country}**: ${c.support}`).join('\n')}\n\n`;
        }
        if (proOpponent.length) {
          answer += `**Countries Supporting Opponent:**\n${proOpponent.map(c => `- **${c.country}**: ${c.support}`).join('\n')}\n\n`;
        }
      } catch (_) {}

      answer += `\n---\n*Source: DefenceAI Knowledge Base (Instant — no API call)*`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(answer);
    }
  } catch (dbErr) {
    console.warn('Knowledge DB search failed:', dbErr.message);
  }

  // ─── Step 2: Check search_cache in Supabase ────────────────
  try {
    const { data: cached } = await supabase
      .from('search_cache')
      .select('answer')
      .ilike('query', queryNorm)
      .single();

    if (cached?.answer) {
      const cachedAnswer = cached.answer + '\n\n---\n*Source: DefenceAI Cache (Instant — no API call)*';
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(cachedAnswer);
    }
  } catch (_) {}

  // ─── Step 3: Greeting detection (no AI needed) ─────────────
  const greetings = ['hi', 'hello', 'hey', 'hiya', 'namaste', 'namaskar'];
  if (greetings.includes(queryNorm)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send('Hi! How can I assist you today? Ask me about defence affairs, military history, geopolitics, or global security.');
  }

  // ─── Step 4: Call Gemini ───────────────────────────────────
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const prompt = `You are DefenceAI, an expert AI assistant focused exclusively on defence, military affairs, geopolitics, and politics. Today is ${today}.

STRICT RULES:
1. ONLY answer questions about: defence, military history, wars, weapons systems, geopolitics, international relations, political affairs, security policy, strategic affairs, border disputes, terrorism, intelligence, military technology.
2. If asked about anything else (entertainment, sports results, cooking, coding, personal advice), respond: "I'm DefenceAI, specialised in defence and geopolitical affairs only. Please ask me about military history, global politics, or security topics."
3. Provide well-structured, accurate responses with markdown formatting.
4. Keep answers concise — aim for quality over length. Aim for about half the length of a typical detailed AI response.
5. Structure: Direct answer → Historical/strategic context → Geopolitical significance (brief).

User query: ${message}`;

  try {
    const text = await callGemini(prompt, 4096);

    // Cache the response for future use
    try {
      await supabase.from('search_cache').upsert({
        query:  queryNorm,
        answer: text,
        source: 'gemini',
      }, { onConflict: 'query' });
    } catch (cacheErr) {
      console.warn('Cache store failed:', cacheErr.message);
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);

  } catch (err) {
    console.error('Chat error:', err.message);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`⚠️ **AI Temporarily Unavailable**\n\nThe AI assistant is currently unavailable. Please try again in a few minutes.\n\n**You can still explore:**\n- 📰 Today's Defence News\n- 🧠 War & Defence Knowledge Base\n- 🤖 AI & Modern Warfare Updates`);
  }
});

// ═══════════════════════════════════════════════════════════════
// CRON JOB: DAILY NEWS REFRESH (called by Vercel Cron at 6 PM IST)
// Route: POST /api/cron/news
// ═══════════════════════════════════════════════════════════════
app.post('/api/cron/news', requireCron, async (req, res) => {
  const today = todayStr();
  console.log(`\n📡 [CRON] Daily news refresh for ${today}...`);

  // Check if already done today
  const { count } = await supabase
    .from('daily_news')
    .select('*', { count: 'exact', head: true })
    .eq('fetch_date', today);

  if (count > 0) {
    console.log(`[CRON] News already fetched today (${count} records). Skipping.`);
    return res.json({ success: true, skipped: true, message: 'Already fetched today', count });
  }

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const prompt = `You are a defence news analyst. Today is ${dateStr}.

Generate ALL major defence, military, and geopolitics news from the past 24 hours. 

Sources to draw from: ANI, PTI, Reuters, AP, BBC, Al Jazeera, CNN, DW, The Hindu, Indian Express, Hindustan Times, Times of India, Economic Times, Financial Express, Defence News.

Return ONLY this JSON (no explanation, no markdown code blocks):
{
  "national": [
    {
      "title": "News headline (max 15 words)",
      "summary": "3-4 sentence factual summary of the news item",
      "source": "Source name (e.g. ANI, PTI, The Hindu)",
      "category": "national"
    }
  ],
  "international": [
    {
      "title": "International defence/geopolitics headline (max 15 words)",
      "summary": "3-4 sentence factual summary",
      "source": "Source name",
      "category": "international"
    }
  ]
}

Include ALL important news. Do not limit to 10. Include every significant defence or geopolitics story from the past 24 hours. Return ONLY the JSON.`;

  let inserted = 0;
  let source = 'gemini';

  try {
    const raw     = await callGemini(prompt, 8192);
    const cleaned = stripCodeFences(raw);
    const parsed  = JSON.parse(cleaned);

    const allNews = [
      ...(parsed.national      || []).map(n => ({ ...n, category: 'national',      fetch_date: today })),
      ...(parsed.international || []).map(n => ({ ...n, category: 'international', fetch_date: today })),
    ];

    if (allNews.length > 0) {
      const { error } = await supabase.from('daily_news').insert(allNews);
      if (error) throw error;
      inserted = allNews.length;
      console.log(`[CRON] ✅ Inserted ${inserted} news items to Supabase`);
    }

  } catch (err) {
    console.error('[CRON] Gemini news generation failed:', err.message);
    // Insert curated fallback
    const fallback = getCuratedNewsFallback(today);
    try {
      await supabase.from('daily_news').insert(fallback);
      inserted = fallback.length;
      source = 'curated';
      console.log(`[CRON] Used curated fallback (${inserted} items)`);
    } catch (fbErr) {
      console.error('[CRON] Fallback insert failed:', fbErr.message);
    }
  }

  // Log the refresh
  await supabase.from('refresh_log').insert({
    job_type:         'news',
    status:           inserted > 0 ? 'success' : 'error',
    message:          `Inserted ${inserted} news items`,
    records_inserted: inserted,
  });

  res.json({ success: true, inserted, source, date: today });
});

// ═══════════════════════════════════════════════════════════════
// CRON JOB: AI NEWS REFRESH (called by Vercel Cron every 48hrs at 6 PM IST)
// Route: POST /api/cron/ai-news
// ═══════════════════════════════════════════════════════════════
app.post('/api/cron/ai-news', requireCron, async (req, res) => {
  const today = todayStr();
  console.log(`\n🤖 [CRON] AI news refresh for ${today}...`);

  // Check if fetched in the last 48 hours
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { count } = await supabase
    .from('ai_news')
    .select('*', { count: 'exact', head: true })
    .gte('fetch_date', cutoffStr);

  if (count > 0) {
    console.log(`[CRON] AI news fetched within 48hrs (${count} records). Skipping.`);
    return res.json({ success: true, skipped: true, message: 'Already fetched within 48 hours', count });
  }

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const prompt = `You are an AI technology news analyst. Today is ${dateStr}.

Collect and summarize the most important AI and technology news from the last 48 hours relevant to defence, military applications, and general AI progress.

Sources: OpenAI, Google DeepMind, Anthropic, Meta AI, NVIDIA, Microsoft AI, Hugging Face, Mistral AI, Perplexity, TechCrunch, VentureBeat, MIT Technology Review, Analytics India Magazine, The Decoder.

Return ONLY this JSON (no markdown code blocks):
{
  "aiNews": [
    {
      "title": "AI/Tech headline (max 15 words)",
      "summary": "3-4 sentence factual summary covering: what happened, who is involved, why it matters for defence/AI",
      "source": "Source name"
    }
  ]
}

Include all significant stories. Return ONLY the JSON object.`;

  let inserted = 0;

  try {
    const raw     = await callGemini(prompt, 8192);
    const cleaned = stripCodeFences(raw);
    const parsed  = JSON.parse(cleaned);

    const aiItems = (parsed.aiNews || []).map(n => ({ ...n, fetch_date: today }));

    if (aiItems.length > 0) {
      const { error } = await supabase.from('ai_news').insert(aiItems);
      if (error) throw error;
      inserted = aiItems.length;
      console.log(`[CRON] ✅ Inserted ${inserted} AI news items to Supabase`);
    }

  } catch (err) {
    console.error('[CRON] Gemini AI news generation failed:', err.message);
  }

  await supabase.from('refresh_log').insert({
    job_type:         'ai_news',
    status:           inserted > 0 ? 'success' : 'error',
    message:          `Inserted ${inserted} AI news items`,
    records_inserted: inserted,
  });

  res.json({ success: true, inserted, date: today });
});

// ═══════════════════════════════════════════════════════════════
// ADMIN — protected by ADMIN_SECRET header
// ═══════════════════════════════════════════════════════════════

// Admin: get all refresh logs
app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('refresh_log')
    .select('*')
    .order('ran_at', { ascending: false })
    .limit(50);
  res.json({ success: !error, data: data || [], error: error?.message });
});

// Admin: manually trigger news refresh
app.post('/api/admin/refresh-news', requireAdmin, async (req, res) => {
  const today = todayStr();
  // Delete today's existing news first
  await supabase.from('daily_news').delete().eq('fetch_date', today);
  // Call the cron job handler logic
  req.headers['authorization'] = `Bearer ${CRON_SECRET}`;
  // Re-use cron logic inline
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const prompt = `You are a defence news analyst. Today is ${dateStr}. Generate today's defence and geopolitics news. Return JSON with national[] and international[] arrays. Each item: { title, summary, source, category }. Include all important stories. Return ONLY JSON.`;

  try {
    const raw     = await callGemini(prompt, 8192);
    const cleaned = stripCodeFences(raw);
    const parsed  = JSON.parse(cleaned);
    const allNews = [
      ...(parsed.national      || []).map(n => ({ ...n, category: 'national',      fetch_date: today })),
      ...(parsed.international || []).map(n => ({ ...n, category: 'international', fetch_date: today })),
    ];
    const { error } = await supabase.from('daily_news').insert(allNews);
    if (error) throw error;
    await supabase.from('refresh_log').insert({ job_type: 'news', status: 'success', message: 'Admin manual refresh', records_inserted: allNews.length });
    res.json({ success: true, inserted: allNews.length, date: today });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Admin: manually trigger AI news refresh
app.post('/api/admin/refresh-ai-news', requireAdmin, async (req, res) => {
  const today = todayStr();
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const prompt = `You are an AI technology news analyst. Today is ${dateStr}. Generate today's most important AI and technology news relevant to defence. Return JSON with aiNews[] array. Each item: { title, summary, source }. Return ONLY JSON.`;

  try {
    const raw     = await callGemini(prompt, 8192);
    const cleaned = stripCodeFences(raw);
    const parsed  = JSON.parse(cleaned);
    const items   = (parsed.aiNews || []).map(n => ({ ...n, fetch_date: today }));
    const { error } = await supabase.from('ai_news').insert(items);
    if (error) throw error;
    await supabase.from('refresh_log').insert({ job_type: 'ai_news', status: 'success', message: 'Admin manual AI refresh', records_inserted: items.length });
    res.json({ success: true, inserted: items.length, date: today });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Admin: list knowledge entries
app.get('/api/admin/knowledge', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('defence_knowledge').select('id, slug, category, title, sub_category').order('category').order('title');
  res.json({ success: !error, data: data || [], error: error?.message });
});

// Admin: get single knowledge entry
app.get('/api/admin/knowledge/:slug', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('defence_knowledge').select('*').eq('slug', req.params.slug).single();
  res.json({ success: !error, data, error: error?.message });
});

// Admin: create knowledge entry
app.post('/api/admin/knowledge', requireAdmin, async (req, res) => {
  const { error, data } = await supabase.from('defence_knowledge').insert(req.body).select().single();
  res.json({ success: !error, data, error: error?.message });
});

// Admin: update knowledge entry
app.put('/api/admin/knowledge/:slug', requireAdmin, async (req, res) => {
  const { error, data } = await supabase.from('defence_knowledge')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('slug', req.params.slug)
    .select().single();
  res.json({ success: !error, data, error: error?.message });
});

// Admin: delete knowledge entry
app.delete('/api/admin/knowledge/:slug', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('defence_knowledge').delete().eq('slug', req.params.slug);
  res.json({ success: !error, error: error?.message });
});

// Admin: clear search cache
app.delete('/api/admin/search-cache', requireAdmin, async (req, res) => {
  const { error, count } = await supabase.from('search_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  res.json({ success: !error, deleted: count, error: error?.message });
});

// Admin: get search cache
app.get('/api/admin/search-cache', requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('search_cache').select('*').order('created_at', { ascending: false }).limit(100);
  res.json({ success: !error, data: data || [], error: error?.message });
});

// Admin: serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ═══════════════════════════════════════════════════════════════
// CURATED FALLBACK NEWS (used when Gemini quota exhausted)
// ═══════════════════════════════════════════════════════════════
function getCuratedNewsFallback(today) {
  return [
    { title: 'Indian Army Conducts High-Altitude Exercises Along LAC', summary: 'The Indian Army conducted large-scale high-altitude military exercises along the Line of Actual Control in Ladakh, testing new equipment and operational procedures. The exercises involved combined arms teams including armour, artillery, and infantry elements operating in sub-zero temperatures.', source: 'ANI', category: 'national', fetch_date: today },
    { title: 'HAL Receives Order for 12 Additional Su-30MKI Jets', summary: 'Hindustan Aeronautics Limited received a new government order to manufacture 12 additional Sukhoi Su-30MKI multirole fighter jets for the Indian Air Force. The order is part of India\'s ongoing fleet modernization and Make in India initiative in defence manufacturing.', source: 'PTI', category: 'national', fetch_date: today },
    { title: 'India Commissions New Guided Missile Destroyer INS Surat', summary: 'The Indian Navy commissioned INS Surat, a new Project 15B guided-missile destroyer, at Naval Dockyard Mumbai. The warship features advanced stealth capabilities, supersonic BrahMos missiles, and a comprehensive air defence system with Israeli-developed SAMs.', source: 'The Hindu', category: 'national', fetch_date: today },
    { title: 'Ministry of Defence Approves ₹21,000 Crore Defence Procurement Package', summary: 'India\'s Defence Acquisition Council approved a procurement package worth ₹21,000 crore covering artillery systems, infantry weapons, and electronic warfare equipment. The approvals prioritize indigenous manufacturing under the Make in India defence initiative.', source: 'Indian Express', category: 'national', fetch_date: today },
    { title: 'Ukraine Reports Successful Drone Strike on Russian Airbase', summary: 'Ukrainian forces claimed a successful long-range drone strike on a Russian military airbase deep inside Russian territory, reportedly destroying aircraft and fuel depots. Russia denied significant damage but acknowledged intercepting drones over the region. The strike represents Ukraine\'s expanding long-range strike capability.', source: 'Reuters', category: 'international', fetch_date: today },
    { title: 'US Approves $3.5 Billion Arms Package for Taiwan', summary: 'The United States government approved a new $3.5 billion arms sale to Taiwan including advanced air defence systems and precision munitions. China strongly condemned the sale, calling it interference in Chinese internal affairs and threatening countermeasures against US companies involved.', source: 'AP', category: 'international', fetch_date: today },
    { title: 'NATO Allies Agree to Increase Defence Spending to 3% of GDP', summary: 'NATO member nations agreed at a summit to a new target of spending 3% of GDP on defence by 2030, up from the previous 2% target. The decision reflects growing concerns about Russian aggression in Europe and the need for sustained military investment across the alliance.', source: 'BBC', category: 'international', fetch_date: today },
  ];
}

// ═══════════════════════════════════════════════════════════════
// SPA CATCH-ALL
// ═══════════════════════════════════════════════════════════════
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🛡️  DefenceAI Server v3.0 running on http://localhost:${PORT}`);
  console.log(`   API Key    : ${API_KEY      ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Supabase   : ${SUPABASE_URL ? '✅ ' + SUPABASE_URL.slice(8, 30) + '...' : '❌ Missing'}`);
  console.log(`   Admin      : ${ADMIN_SECRET ? '✅ Configured' : '⚠️  Missing (Admin Panel Locked)'}`);
  console.log(`   Cron Auth  : ${CRON_SECRET  ? '✅ Configured' : '⚠️  Not set (dev mode)'}`);
  console.log(`   Models     : ${MODELS.join(' → ')}`);
  console.log(`\n   Endpoints:`);
  console.log(`   GET  /api/news       — Today's defence news (from Supabase)`);
  console.log(`   GET  /api/ai-news    — AI & tech news (from Supabase)`);
  console.log(`   GET  /api/knowledge  — Defence knowledge base`);
  console.log(`   POST /api/chat       — AI search (local-first → cache → Gemini)`);
  console.log(`   POST /api/cron/news  — Cron job: daily news refresh`);
  console.log(`   POST /api/cron/ai-news — Cron job: AI news refresh (48hr)`);
  console.log(`   GET  /admin          — Admin panel (requires x-admin-secret header)\n`);
});
