/* ═══════════════════════════════════════════════════════════════
   DefenceAI — Frontend Application Logic v3.0
   Architecture:
   - News: reads from Supabase via /api/news (tabs: National / International)
   - Knowledge: reads from Supabase via /api/knowledge (searchable, filterable)
   - AI News: reads from Supabase via /api/ai-news
   - Search: local knowledge → Supabase cache → Gemini
   - Sports section: REMOVED
═══════════════════════════════════════════════════════════════ */

'use strict';

const API_BASE = '';

// ─── State ────────────────────────────────────────────────────
const state = {
  currentSection:   'home',
  newsLoaded:       false,
  knowledgeLoaded:  false,
  aiNewsLoaded:     false,
  activeNewsTab:    'national',
  activeKnowFilter: 'all',
  allKnowledge:     [],      // full knowledge list cached in memory
  knowledgeSearch:  '',
};

// ═══════════════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════════════
const getEl  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = getEl('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── DateTime ─────────────────────────────────────────────────
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'short', day:'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const el = getEl('topbarDateTime');
  if (el) el.textContent = `${dateStr} · ${timeStr}`;
  const sd = getEl('sidebarDate');
  if (sd) sd.textContent = dateStr;
  const sd2 = getEl('statDate');
  if (sd2) sd2.textContent = now.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// ─── Markdown → HTML ──────────────────────────────────────────
function md2html(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<strong style="color:var(--khaki-light)">$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function skeletons(n = 3) {
  return Array(n).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body short"></div>
    </div>`).join('');
}

function errorState(title, detail, retryFn) {
  return `
    <div class="error-state">
      <div class="error-state-icon">⚠️</div>
      <h3>${escHtml(title)}</h3>
      <p>${escHtml(detail)}</p>
      ${retryFn ? `<button class="retry-btn" onclick="${retryFn}()">Try Again</button>` : ''}
    </div>`;
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function navigateTo(sectionKey) {
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  const navItem = document.querySelector(`[data-section="${sectionKey}"]`);
  if (navItem) navItem.classList.add('active');

  $$('.section').forEach(s => s.classList.remove('active'));
  const section = getEl(`section-${sectionKey}`);
  if (section) {
    section.classList.add('active');
    getEl('mainContent')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const labels = {
    'home':      'Home',
    'news':      "Today's News",
    'knowledge': 'War & Defence Knowledge',
    'ai-news':   'AI News',
  };
  const bc = getEl('breadcrumb');
  if (bc) bc.textContent = labels[sectionKey] || 'Home';

  state.currentSection = sectionKey;

  // Lazy-load section
  if (sectionKey === 'news'      && !state.newsLoaded)      loadNews();
  if (sectionKey === 'knowledge' && !state.knowledgeLoaded) loadKnowledge();
  if (sectionKey === 'ai-news'   && !state.aiNewsLoaded)    loadAINews();

  closeMobileSidebar();
}

function openMobileSidebar() {
  getEl('sidebar')?.classList.add('open');
  getEl('sidebarOverlay')?.classList.add('visible');
}
function closeMobileSidebar() {
  getEl('sidebar')?.classList.remove('open');
  getEl('sidebarOverlay')?.classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════
// CHAT / SEARCH
// ═══════════════════════════════════════════════════════════════
async function sendChatMessage(message) {
  if (!message.trim()) return;

  const messagesContainer = getEl('chatMessages');
  const welcomePrompts    = getEl('welcomePrompts');
  const sendBtn           = getEl('sendBtn');
  const chatInput         = getEl('chatInput');

  if (welcomePrompts) {
    welcomePrompts.style.opacity = '0';
    welcomePrompts.style.pointerEvents = 'none';
    setTimeout(() => welcomePrompts.remove(), 300);
  }

  messagesContainer.appendChild(createBubble('user', message, false));

  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'chat-bubble ai';
  loadingBubble.innerHTML = `
    <div class="bubble-avatar">🛡️</div>
    <div class="bubble-content">
      <div class="ai-loading">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
    </div>`;
  messagesContainer.appendChild(loadingBubble);
  loadingBubble.scrollIntoView({ behavior:'smooth', block:'end' });

  sendBtn.disabled   = true;
  chatInput.disabled = true;
  chatInput.value    = '';
  autoResizeTextarea(chatInput);

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`Server error ${response.status}`);
    const text = await response.text();

    messagesContainer.removeChild(loadingBubble);

    // Detect if it came from local knowledge base or cache
    const isLocal = text.includes('DefenceAI Knowledge Base') || text.includes('DefenceAI Cache');
    if (isLocal) showToast('⚡ Answered instantly from knowledge base', 'success', 2500);

    messagesContainer.appendChild(createBubble('ai', text, true));
  } catch (err) {
    messagesContainer.removeChild(loadingBubble);
    messagesContainer.appendChild(createBubble('ai',
      `⚠️ **Error:** ${err.message}\n\nMake sure the DefenceAI server is running.`, true));
    showToast('Failed to reach server', 'error');
  } finally {
    sendBtn.disabled   = false;
    chatInput.disabled = false;
    chatInput.focus();
    messagesContainer.lastElementChild?.scrollIntoView({ behavior:'smooth', block:'end' });
  }
}

function createBubble(role, content, isMarkdown = false) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  const avatar = role === 'user' ? '👤' : '🛡️';
  const html   = isMarkdown ? md2html(content) : escHtml(content);
  bubble.innerHTML = `<div class="bubble-avatar">${avatar}</div><div class="bubble-content">${html}</div>`;
  return bubble;
}

// ═══════════════════════════════════════════════════════════════
// NEWS LOADER
// ═══════════════════════════════════════════════════════════════
async function loadNews(force = false) {
  if (state.newsLoaded && !force) return;

  const nationalCards = getEl('nationalCards');
  const intlCards     = getEl('intlCards');
  const countNat      = getEl('tab-count-national');
  const countIntl     = getEl('tab-count-international');

  if (nationalCards) nationalCards.innerHTML = skeletons(4);
  if (intlCards)     intlCards.innerHTML     = skeletons(4);

  try {
    const res  = await fetch(`${API_BASE}/api/news`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');

    const { national = [], international = [] } = json.data;

    if (nationalCards) {
      nationalCards.innerHTML = '';
      if (national.length === 0) {
        nationalCards.innerHTML = `<div class="empty-state">No national news available yet. Check back after 6 PM IST.</div>`;
      } else {
        national.forEach((item, idx) => nationalCards.appendChild(createNewsCard(item, idx, 'nat')));
      }
    }

    if (intlCards) {
      intlCards.innerHTML = '';
      if (international.length === 0) {
        intlCards.innerHTML = `<div class="empty-state">No international news available yet. Check back after 6 PM IST.</div>`;
      } else {
        international.forEach((item, idx) => intlCards.appendChild(createNewsCard(item, idx, 'intl')));
      }
    }

    if (countNat)  countNat.textContent  = `(${national.length})`;
    if (countIntl) countIntl.textContent = `(${international.length})`;

    // Update stat
    const statNews = getEl('statNewsCount');
    if (statNews) statNews.textContent = national.length + international.length;

    state.newsLoaded = true;
    if (json.message) showToast(json.message, 'info');
    else showToast(`${national.length + international.length} news stories loaded`, 'success', 2500);

  } catch (err) {
    if (nationalCards) nationalCards.innerHTML = `<div class="error-state"><div class="error-state-icon">⚠️</div><h3>News unavailable</h3><p>${escHtml(err.message)}</p><button class="retry-btn" onclick="loadNews(true)">Retry</button></div>`;
    if (intlCards)     intlCards.innerHTML     = `<div class="error-state"><div class="error-state-icon">⚠️</div><h3>News unavailable</h3><p>${escHtml(err.message)}</p></div>`;
    showToast('Failed to load news: ' + err.message, 'error');
  }
}

function createNewsCard(item, index, type) {
  const card = document.createElement('article');
  card.className = 'news-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const cardId = `nc-${type}-${item.id || index}`;
  const time   = item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';

  card.innerHTML = `
    <div class="news-card-content">
      <div class="news-card-meta">
        <span class="news-source-badge">${escHtml(item.source || 'DefenceAI')}</span>
        ${time ? `<span class="news-time">🕐 ${time}</span>` : ''}
        <span class="news-cat-chip news-cat-${item.category}">${item.category === 'national' ? '🇮🇳 National' : '🌍 International'}</span>
      </div>
      <h3 class="news-card-title">${escHtml(item.title || 'Untitled')}</h3>
      <p class="news-card-summary">${escHtml(item.summary || '')}</p>
    </div>`;
  return card;
}

// ─── News Tabs ────────────────────────────────────────────────
function switchNewsTab(tab) {
  state.activeNewsTab = tab;
  $$('.news-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  $$('.news-tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-content-${tab}`));
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE LOADER
// ═══════════════════════════════════════════════════════════════
async function loadKnowledge(force = false) {
  if (state.knowledgeLoaded && !force) return;

  const grid = getEl('knowledgeGrid');
  if (grid) grid.innerHTML = skeletons(6);

  try {
    const res  = await fetch(`${API_BASE}/api/knowledge`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');

    state.allKnowledge = json.flat || [];
    state.knowledgeLoaded = true;

    // Update stat
    const statK = getEl('statKnowledgeCount');
    if (statK) statK.textContent = state.allKnowledge.length;

    renderKnowledge();
    showToast(`${state.allKnowledge.length} knowledge entries loaded`, 'success', 2500);

  } catch (err) {
    if (grid) grid.innerHTML = `<div class="error-state"><div class="error-state-icon">⚠️</div><h3>Knowledge base unavailable</h3><p>${escHtml(err.message)}</p><button class="retry-btn" onclick="loadKnowledge(true)">Retry</button></div>`;
    showToast('Failed to load knowledge base: ' + err.message, 'error');
  }
}

function renderKnowledge() {
  const grid   = getEl('knowledgeGrid');
  if (!grid) return;

  const search = state.knowledgeSearch.toLowerCase();
  const filter = state.activeKnowFilter;

  let items = state.allKnowledge;

  // Category filter
  if (filter !== 'all') {
    items = items.filter(i => i.category === filter);
  }

  // Text search
  if (search) {
    items = items.filter(i =>
      i.title.toLowerCase().includes(search)      ||
      i.summary.toLowerCase().includes(search)    ||
      (i.outcome      || '').toLowerCase().includes(search) ||
      (i.significance || '').toLowerCase().includes(search) ||
      (i.sub_category || '').toLowerCase().includes(search)
    );
  }

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state">No results found for "${escHtml(state.knowledgeSearch)}". Try a different keyword.</div>`;
    return;
  }

  grid.innerHTML = '';
  items.forEach((item, idx) => grid.appendChild(createKnowledgeCard(item, idx)));
}

const CAT_LABELS = {
  wars:             '⚔️ Major War',
  conflicts:        '🔥 Conflict',
  operations:       '🎯 Military Operation',
  humanitarian:     '🤝 Humanitarian Op',
  un_missions:      '🌐 UN Mission',
  defence_programs: '🛡️ Defence Program',
};

function createKnowledgeCard(item, index) {
  const card = document.createElement('article');
  card.className = 'knowledge-card';
  card.style.animationDelay = `${index * 0.04}s`;

  const catLabel = CAT_LABELS[item.category] || item.category;
  const subLabel = item.sub_category ? item.sub_category.replace(/_/g, ' ') : '';

  card.innerHTML = `
    <div class="kcard-header">
      <div class="kcard-meta">
        <span class="kcat-badge kcat-${item.category}">${catLabel}</span>
        ${subLabel ? `<span class="ksubcat-badge">${escHtml(subLabel)}</span>` : ''}
      </div>
      <h3 class="kcard-title">${escHtml(item.title)}</h3>
      ${item.timeline ? `<div class="kcard-timeline">📅 ${escHtml(item.timeline)}</div>` : ''}
    </div>
    <p class="kcard-summary">${escHtml(item.summary)}</p>
    <button class="kcard-expand-btn" onclick="openKnowledgeModal('${escHtml(item.slug)}')">
      📖 View Full Details
      <svg viewBox="0 0 24 24" fill="none" width="14" height="14" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;
  return card;
}

function openKnowledgeModal(slug) {
  const item = state.allKnowledge.find(i => i.slug === slug);
  if (!item) return;

  const modal   = getEl('knowledgeModal');
  const body    = getEl('modalBody');
  if (!modal || !body) return;

  let proIndia = [], proOpponent = [];
  try { proIndia    = JSON.parse(item.countries_supporting_india    || '[]'); } catch (_) {}
  try { proOpponent = JSON.parse(item.countries_supporting_opponent || '[]'); } catch (_) {}

  const keyFacts = Array.isArray(item.key_facts) ? item.key_facts : [];

  body.innerHTML = `
    <div class="modal-cat-badge kcat-${item.category}">${CAT_LABELS[item.category] || item.category}</div>
    <h2 class="modal-title">${escHtml(item.title)}</h2>
    ${item.timeline ? `<div class="modal-timeline">📅 ${escHtml(item.timeline)}</div>` : ''}

    <div class="modal-section">
      <div class="modal-section-title">📋 Overview</div>
      <p>${escHtml(item.summary)}</p>
    </div>

    ${keyFacts.length ? `
    <div class="modal-section">
      <div class="modal-section-title">🔑 Key Facts</div>
      <ul class="modal-facts-list">
        ${keyFacts.map(f => `<li>${escHtml(f)}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${item.outcome ? `
    <div class="modal-section">
      <div class="modal-section-title">🏁 Outcome</div>
      <p>${escHtml(item.outcome)}</p>
    </div>` : ''}

    ${item.significance ? `
    <div class="modal-section">
      <div class="modal-section-title">💡 Strategic Significance</div>
      <p>${escHtml(item.significance)}</p>
    </div>` : ''}

    ${proIndia.length || proOpponent.length ? `
    <div class="modal-alliances">
      ${proIndia.length ? `
      <div class="alliance-block pro-india">
        <div class="alliance-block-title">🤝 Countries Supporting India</div>
        ${proIndia.map(c => `
          <div class="alliance-item">
            <span class="alliance-country">🏳️ ${escHtml(c.country)}</span>
            <span class="alliance-support">${escHtml(c.support)}</span>
          </div>`).join('')}
      </div>` : ''}

      ${proOpponent.length ? `
      <div class="alliance-block pro-opponent">
        <div class="alliance-block-title">⚔️ Countries Supporting Opponent</div>
        ${proOpponent.map(c => `
          <div class="alliance-item">
            <span class="alliance-country">🏳️ ${escHtml(c.country)}</span>
            <span class="alliance-support">${escHtml(c.support)}</span>
          </div>`).join('')}
      </div>` : ''}
    </div>` : ''}

    <div class="modal-footer-note">
      📚 Source: DefenceAI Knowledge Base — Instant result, no AI call made.
    </div>`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeKnowledgeModal() {
  getEl('knowledgeModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════════
// AI NEWS LOADER
// ═══════════════════════════════════════════════════════════════
async function loadAINews(force = false) {
  if (state.aiNewsLoaded && !force) return;

  const grid = getEl('aiNewsGrid');
  if (grid) grid.innerHTML = skeletons(4);

  try {
    const res  = await fetch(`${API_BASE}/api/ai-news`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');

    const items = json.data || [];

    if (grid) {
      grid.innerHTML = '';
      if (items.length === 0) {
        grid.innerHTML = `<div class="empty-state">No AI news available yet. The 48-hour cron job hasn't run yet.</div>`;
      } else {
        items.forEach((item, idx) => grid.appendChild(createAINewsCard(item, idx)));
      }
    }

    state.aiNewsLoaded = true;
    if (json.message) showToast(json.message, 'info');
    else showToast(`${items.length} AI news stories loaded`, 'success', 2500);

  } catch (err) {
    if (grid) grid.innerHTML = `<div class="error-state"><div class="error-state-icon">⚠️</div><h3>AI news unavailable</h3><p>${escHtml(err.message)}</p><button class="retry-btn" onclick="loadAINews(true)">Retry</button></div>`;
    showToast('Failed to load AI news: ' + err.message, 'error');
  }
}

function createAINewsCard(item, index) {
  const card = document.createElement('article');
  card.className = 'ai-news-card';
  card.style.animationDelay = `${index * 0.06}s`;

  const time = item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';

  card.innerHTML = `
    <div class="ai-news-icon">🤖</div>
    <div class="ai-news-body">
      <div class="ai-news-meta">
        <span class="ai-news-source">${escHtml(item.source || 'AI News')}</span>
        ${time ? `<span class="news-time">🕐 ${time}</span>` : ''}
      </div>
      <h3 class="ai-news-title">${escHtml(item.title || 'Untitled')}</h3>
      <p class="ai-news-summary">${escHtml(item.summary || '')}</p>
    </div>`;
  return card;
}

// ═══════════════════════════════════════════════════════════════
// STATS LOADER (for home page)
// ═══════════════════════════════════════════════════════════════
async function loadStats() {
  try {
    const res  = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) return;
    const json = await res.json();

    const statNews = getEl('statNewsCount');
    const statK    = getEl('statKnowledgeCount');
    if (statNews && json.newsToday) statNews.textContent = json.newsToday;
    if (statK    && json.knowledge) statK.textContent    = json.knowledge;
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL REFRESH
// ═══════════════════════════════════════════════════════════════
function globalRefresh() {
  const s = state.currentSection;
  if (s === 'news')      { state.newsLoaded      = false; loadNews(); }
  if (s === 'knowledge') { state.knowledgeLoaded = false; loadKnowledge(); }
  if (s === 'ai-news')   { state.aiNewsLoaded    = false; loadAINews(); }
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════
function initEventListeners() {
  // Navigation
  $$('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  // Mobile sidebar
  getEl('menuBtn')?.addEventListener('click', openMobileSidebar);
  getEl('sidebarToggle')?.addEventListener('click', closeMobileSidebar);
  getEl('sidebarOverlay')?.addEventListener('click', closeMobileSidebar);

  // Chat
  const chatInput = getEl('chatInput');
  const sendBtn   = getEl('sendBtn');

  chatInput?.addEventListener('input', () => autoResizeTextarea(chatInput));
  chatInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (msg) sendChatMessage(msg);
    }
  });
  sendBtn?.addEventListener('click', () => {
    const msg = chatInput?.value.trim();
    if (msg) sendChatMessage(msg);
  });

  // Prompt chips
  $$('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (chatInput) chatInput.value = prompt;
      sendChatMessage(prompt);
    });
  });

  // News tabs
  $$('.news-tab').forEach(tab => {
    tab.addEventListener('click', () => switchNewsTab(tab.dataset.tab));
  });

  // Refresh buttons
  getEl('refreshNews')?.addEventListener('click',  () => { state.newsLoaded    = false; loadNews(); });
  getEl('refreshAI')?.addEventListener('click',    () => { state.aiNewsLoaded  = false; loadAINews(); });
  getEl('globalRefresh')?.addEventListener('click', globalRefresh);

  // Knowledge search (debounced)
  let searchTimeout = null;
  getEl('knowledgeSearch')?.addEventListener('input', e => {
    state.knowledgeSearch = e.target.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (state.knowledgeLoaded) renderKnowledge();
    }, 250);
  });

  // Knowledge category filters
  $$('.kfilter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.kfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeKnowFilter = btn.dataset.cat;
      if (state.knowledgeLoaded) renderKnowledge();
    });
  });

  // Knowledge modal close
  getEl('modalClose')?.addEventListener('click', closeKnowledgeModal);
  getEl('knowledgeModal')?.addEventListener('click', e => {
    if (e.target.id === 'knowledgeModal') closeKnowledgeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeKnowledgeModal();
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init() {
  updateDateTime();
  setInterval(updateDateTime, 30000);
  initEventListeners();

  // Load stats for home page
  loadStats();

  // Pre-load news in background after short delay
  setTimeout(() => loadNews(), 1500);

  showToast('🛡️ DefenceAI ready. Known topics load instantly!', 'info', 4000);
}

document.addEventListener('DOMContentLoaded', init);

// ─── Global function exposures (for inline onclick) ───────────
window.loadNews        = loadNews;
window.loadKnowledge   = loadKnowledge;
window.loadAINews      = loadAINews;
window.openKnowledgeModal = openKnowledgeModal;
window.closeKnowledgeModal = closeKnowledgeModal;
