/* ═══════════════════════════════════════════════════════════════
   DefenceAI — Frontend Application Logic v1.2
   - All API calls go through /api/* backend proxy
   - Daily cache: data fetched once/day on server, served to all users
   - Defence & politics Q&A only
   - Scroll fixed: natural page scroll, fixed sidebar
═══════════════════════════════════════════════════════════════ */

'use strict';

const API_BASE = '';

// ─── Sport Emoji Map ──────────────────────────────────────────
const SPORT_ICONS = {
  'Cricket':    '🏏', 'Football':  '⚽', 'Olympics':  '🏅',
  'Wrestling':  '🤼', 'Boxing':    '🥊', 'Chess':     '♟️',
  'Badminton':  '🏸', 'Hockey':    '🏑', 'Athletics': '🏃',
  'Tennis':     '🎾', 'Shooting':  '🎯', 'default':   '🏆',
};

const AI_TECH_ICONS = {
  'Artificial Intelligence': '🤖', 'Drone Warfare':     '🚁',
  'Cyber Security':          '🛡️', 'Space Defence':     '🛸',
  'Hypersonic':              '🚀', 'Naval Tech':        '⚓',
  'Missile Systems':         '🎯', 'Electronic Warfare':'📡',
  'default':                 '⚙️',
};

// ─── State ────────────────────────────────────────────────────
const state = {
  currentSection: 'home',
  newsLoaded:   false,
  warsLoaded:   false,
  sportsLoaded: false,
  aiLoaded:     false,
};

// ═══════════════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════════════
function getEl(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const container = getEl('toastContainer');
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

// ─── Category tag class ───────────────────────────────────────
function getCategoryClass(category = '') {
  const map = {
    'Defence':'tag-defence','Politics':'tag-politics','Economy':'tag-economy',
    'Science':'tag-science','Society':'tag-society','Geopolitics':'tag-geopolitics',
    'Diplomacy':'tag-diplomacy',
  };
  return map[category] || 'tag-default';
}

// ─── Lightweight markdown → HTML ──────────────────────────────
function md2html(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<strong style="color:var(--khaki-light)">$1</strong>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function createSkeletons(count = 3) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body"></div>
      <div class="sk-line sk-body short"></div>
    </div>`).join('');
}

function createErrorState(title, detail, retryId) {
  return `
    <div class="error-state">
      <div class="error-state-icon">⚠️</div>
      <h3>${title}</h3>
      <p>${detail}</p>
      <button class="retry-btn" onclick="document.getElementById('${retryId}').click()">Try Again</button>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function navigateTo(sectionKey) {
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  const navItem = document.querySelector(`[data-section="${sectionKey}"]#nav-${sectionKey}`);
  if (navItem) navItem.classList.add('active');

  $$('.section').forEach(s => s.classList.remove('active'));
  const section = getEl(`section-${sectionKey}`);
  if (section) {
    section.classList.add('active');
    // Scroll to top of main content when switching sections
    const main = getEl('mainContent');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const labels = {
    'home':'Home', 'news':"Today's News",
    'wars':'War Archive', 'sports':'Sports News', 'ai-warfare':'AI & Warfare',
  };
  const bc = getEl('breadcrumb');
  if (bc) bc.textContent = labels[sectionKey] || 'Home';

  state.currentSection = sectionKey;

  // Lazy-load section data
  if (sectionKey === 'news'       && !state.newsLoaded)    loadNews();
  if (sectionKey === 'wars'       && !state.warsLoaded)    loadWars();
  if (sectionKey === 'sports'     && !state.sportsLoaded)  loadSports();
  if (sectionKey === 'ai-warfare' && !state.aiLoaded)      loadAIWarfare();

  closeMobileSidebar();
}

function openMobileSidebar() {
  getEl('sidebar').classList.add('open');
  getEl('sidebarOverlay').classList.add('visible');
}

function closeMobileSidebar() {
  getEl('sidebar').classList.remove('open');
  getEl('sidebarOverlay').classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════
// CHAT — defence & politics only
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

  messagesContainer.appendChild(createChatBubble('user', message, false));

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
    messagesContainer.appendChild(createChatBubble('ai', text, true));
  } catch (err) {
    messagesContainer.removeChild(loadingBubble);
    messagesContainer.appendChild(createChatBubble('ai',
      `⚠️ **Connection Error:** ${err.message}\n\nMake sure the DefenceAI server is running on port 3000.`, true));
    showToast('Failed to reach AI server', 'error');
  } finally {
    sendBtn.disabled   = false;
    chatInput.disabled = false;
    chatInput.focus();
    // Scroll to latest message
    messagesContainer.lastElementChild?.scrollIntoView({ behavior:'smooth', block:'end' });
  }
}

function createChatBubble(role, content, isMarkdown = false) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  const avatar  = role === 'user' ? '👤' : '🛡️';
  const html    = isMarkdown ? md2html(content) : escapeHtml(content);
  bubble.innerHTML = `<div class="bubble-avatar">${avatar}</div><div class="bubble-content">${html}</div>`;
  return bubble;
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}

// ═══════════════════════════════════════════════════════════════
// NEWS LOADER
// ═══════════════════════════════════════════════════════════════
async function loadNews(force = false) {
  if (state.newsLoaded && !force) return;
  const nationalCards  = getEl('nationalCards');
  const intlCards      = getEl('intlCards');
  const nationalCount  = getEl('nationalCount');
  const intlCount      = getEl('intlCount');

  nationalCards.innerHTML = createSkeletons(5);
  intlCards.innerHTML     = createSkeletons(5);
  showToast('Loading today\'s news…', 'info', 3000);

  try {
    const res  = await fetch(`${API_BASE}/api/news`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');

    const { national = [], international = [] } = json.data;
    const src = json.source === 'gemini' ? '🤖 AI Generated' : '📚 Curated';

    nationalCards.innerHTML = '';
    intlCards.innerHTML     = '';
    national.forEach((item, idx)      => nationalCards.appendChild(createNewsCard(item, idx, 'national')));
    international.forEach((item, idx) => intlCards.appendChild(createNewsCard(item, idx, 'intl')));

    if (nationalCount) nationalCount.textContent = `${national.length} stories · ${src}`;
    if (intlCount)     intlCount.textContent     = `${international.length} stories · ${src}`;

    state.newsLoaded = true;
    showToast(`Loaded ${national.length + international.length} news stories`, json.source === 'gemini' ? 'success' : 'info');
  } catch (err) {
    nationalCards.innerHTML = createErrorState('National news unavailable', err.message, 'refreshNews');
    intlCards.innerHTML     = createErrorState('International news unavailable', err.message, 'refreshNews');
    showToast('Failed to load news: ' + err.message, 'error');
  }
}

function createNewsCard(item, index, type) {
  const card = document.createElement('div');
  card.className = 'news-card';
  card.style.animationDelay = `${index * 0.05}s`;
  const catClass = getCategoryClass(item.category);
  const cardId   = `news-${type}-${item.id || index}`;
  card.innerHTML = `
    <div class="news-card-header">
      <div class="news-card-meta">
        <span class="news-category-tag ${catClass}">${escapeHtml(item.category || 'General')}</span>
        <span class="importance-dot imp-${item.importance || 'Low'}"></span>
        ${item.importance === 'High' ? '<span style="font-size:10px;color:var(--danger);font-weight:700;">HIGH</span>' : ''}
      </div>
      <div class="news-card-title">${escapeHtml(item.title || 'Untitled')}</div>
      <div class="news-card-summary">${escapeHtml(item.summary || '')}</div>
    </div>
    <button class="news-breakdown-toggle" id="btn-${cardId}" onclick="toggleBreakdown('${cardId}')">
      <span>📖 Read Detailed Breakdown</span>
      <svg class="breakdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <div class="news-breakdown-body" id="body-${cardId}">
      <div class="breakdown-content">${md2html(item.breakdown || 'No breakdown available.')}</div>
    </div>`;
  return card;
}

function toggleBreakdown(cardId) {
  const btn  = getEl(`btn-${cardId}`);
  const body = getEl(`body-${cardId}`);
  if (!btn || !body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.querySelector('span').textContent = isOpen ? '📖 Read Detailed Breakdown' : '📕 Hide Breakdown';
}

// ═══════════════════════════════════════════════════════════════
// WAR ARCHIVE LOADER — served from static data, instant
// ═══════════════════════════════════════════════════════════════
async function loadWars(force = false) {
  if (state.warsLoaded && !force) return;
  const timeline = getEl('warsTimeline');
  timeline.innerHTML = createSkeletons(4);

  try {
    const res  = await fetch(`${API_BASE}/api/wars`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');

    const { wars = [] } = json.data;
    timeline.innerHTML = '';
    wars.forEach((war, idx) => timeline.appendChild(createWarCard(war, idx)));
    state.warsLoaded = true;
    showToast(`${wars.length} conflicts loaded`, 'success');
  } catch (err) {
    timeline.innerHTML = createErrorState('War archive unavailable', err.message, 'refreshWars');
    showToast('Failed to load war archive: ' + err.message, 'error');
  }
}

function createWarCard(war, index) {
  const card = document.createElement('div');
  card.className = 'war-card';
  card.style.animationDelay = `${index * 0.06}s`;
  card.id = `war-card-${war.id || index}`;

  const proIndia = (war.alliances?.proIndia || []).map(a => `
    <div class="alliance-item">
      <span class="alliance-country">🏳️ ${escapeHtml(a.country)}</span>
      <span class="alliance-support">${escapeHtml(a.support)}</span>
    </div>`).join('') || '<div class="alliance-item"><span class="alliance-support">Fought primarily independently</span></div>';

  const proOpponent = (war.alliances?.proOpponent || []).map(a => `
    <div class="alliance-item">
      <span class="alliance-country">🏳️ ${escapeHtml(a.country)}</span>
      <span class="alliance-support">${escapeHtml(a.support)}</span>
    </div>`).join('') || '<div class="alliance-item"><span class="alliance-support">No major external allies</span></div>';

  const keyBattles = (war.keyBattles || []).map(b => `<span class="battle-chip">⚔️ ${escapeHtml(b)}</span>`).join('');

  card.innerHTML = `
    <div class="war-card-header" onclick="toggleWarCard('war-card-${war.id || index}')">
      <div class="war-year-badge">
        <div class="war-year">${escapeHtml(String(war.year || ''))}</div>
        <div class="war-duration">${escapeHtml(war.duration || '')}</div>
      </div>
      <div class="war-card-info">
        <div class="war-name">${escapeHtml(war.name || 'Unknown Conflict')}</div>
        <div class="war-combatants">
          <span class="combatant-tag tag-india">🇮🇳 India</span>
          <span class="vs-text">VS</span>
          <span class="combatant-tag tag-opponent">⚔️ ${escapeHtml(war.combatants?.opponent || 'Opponent')}</span>
        </div>
        <div class="war-outcome">🏁 <strong>Outcome:</strong> ${escapeHtml(war.outcome || 'See details')}</div>
      </div>
      <svg class="war-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <div class="war-card-body">
      <div class="war-details">
        <div class="war-detail-block">
          <div class="detail-label">🔍 Root Cause</div>
          <div class="detail-content">${md2html(war.rootCause || 'Information unavailable.')}</div>
        </div>
        <div class="war-detail-block">
          <div class="detail-label">💀 Casualties</div>
          <div class="detail-content">${escapeHtml(war.casualties || 'Not available')}</div>
          <div class="detail-label" style="margin-top:12px;">📚 Significance</div>
          <div class="detail-content">${md2html(war.significance || '')}</div>
        </div>
        <div class="alliances-section">
          <div class="alliance-block pro-india">
            <div class="alliance-block-title">🤝 Who Supported India & How</div>
            <div class="alliance-list">${proIndia}</div>
          </div>
          <div class="alliance-block pro-opponent">
            <div class="alliance-block-title">⚔️ Who Supported the Opponent & How</div>
            <div class="alliance-list">${proOpponent}</div>
          </div>
        </div>
        ${keyBattles ? `<div class="war-detail-block" style="grid-column:1/-1;">
          <div class="detail-label">⚔️ Key Battles & Operations</div>
          <div class="key-battles">${keyBattles}</div>
        </div>` : ''}
      </div>
    </div>`;
  return card;
}

function toggleWarCard(cardId) {
  const card = getEl(cardId);
  if (card) card.classList.toggle('expanded');
}

// ═══════════════════════════════════════════════════════════════
// SPORTS LOADER
// ═══════════════════════════════════════════════════════════════
async function loadSports(force = false) {
  if (state.sportsLoaded && !force) return;
  const grid = getEl('sportsGrid');
  grid.innerHTML = createSkeletons(4);
  showToast('Loading sports news…', 'info', 2000);

  try {
    const res  = await fetch(`${API_BASE}/api/sports`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');
    const { sports = [] } = json.data;
    grid.innerHTML = '';
    sports.forEach((item, idx) => grid.appendChild(createSportCard(item, idx)));
    state.sportsLoaded = true;
    showToast(`${sports.length} sports stories loaded`, 'info');
  } catch (err) {
    grid.innerHTML = createErrorState('Sports news unavailable', err.message, 'refreshSports');
    showToast('Failed to load sports: ' + err.message, 'error');
  }
}

function createSportCard(item, index) {
  const card = document.createElement('div');
  card.className = 'sport-card';
  card.style.animationDelay = `${index * 0.07}s`;
  const icon   = SPORT_ICONS[item.sport] || SPORT_ICONS['default'];
  const cardId = `sport-${item.id || index}`;
  card.innerHTML = `
    <div class="sport-card-top">
      <div class="sport-icon-block">${icon}</div>
      <div class="sport-info">
        <div class="sport-type-badge">${escapeHtml(item.sport || 'Sports')}</div>
        <div class="sport-card-title">${escapeHtml(item.title || 'Update')}</div>
        <div class="sport-summary">${escapeHtml(item.summary || '')}</div>
      </div>
    </div>
    <button class="sport-breakdown-btn" onclick="toggleSportBreakdown('${cardId}')">
      <span>📖 Read Detailed Breakdown</span>
      <svg class="breakdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <div class="sport-breakdown-body" id="body-${cardId}">
      <div class="sport-breakdown-content">${md2html(item.breakdown || 'No breakdown available.')}</div>
    </div>`;
  return card;
}

function toggleSportBreakdown(cardId) {
  const body = getEl(`body-${cardId}`);
  if (body) body.classList.toggle('open');
}

// ═══════════════════════════════════════════════════════════════
// AI WARFARE LOADER
// ═══════════════════════════════════════════════════════════════
async function loadAIWarfare(force = false) {
  if (state.aiLoaded && !force) return;
  const grid = getEl('aiWarfareGrid');
  grid.innerHTML = createSkeletons(4);
  showToast('Loading AI & warfare news…', 'info', 2000);

  try {
    const res  = await fetch(`${API_BASE}/api/ai-warfare`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Unknown error');
    const { aiWarfare = [] } = json.data;
    grid.innerHTML = '';
    aiWarfare.forEach((item, idx) => grid.appendChild(createAIWarfareCard(item, idx)));
    state.aiLoaded = true;
    showToast(`${aiWarfare.length} AI warfare stories loaded`, 'info');
  } catch (err) {
    grid.innerHTML = createErrorState('AI warfare news unavailable', err.message, 'refreshAI');
    showToast('Failed to load AI warfare news: ' + err.message, 'error');
  }
}

function createAIWarfareCard(item, index) {
  const card = document.createElement('div');
  card.className = 'ai-card';
  card.style.animationDelay = `${index * 0.07}s`;
  const icon   = AI_TECH_ICONS[item.techCategory] || AI_TECH_ICONS['default'];
  const cardId = `ai-${item.id || index}`;
  card.innerHTML = `
    <div class="ai-card-top">
      <div class="ai-tech-icon">${icon}</div>
      <div class="ai-card-info">
        <div class="ai-tech-category">${escapeHtml(item.techCategory || 'Technology')}</div>
        <div class="ai-card-title">${escapeHtml(item.title || 'Tech Update')}</div>
        <div class="ai-summary">${escapeHtml(item.summary || '')}</div>
      </div>
    </div>
    <button class="ai-breakdown-btn" onclick="toggleAIBreakdown('${cardId}')">
      <span>🔍 Read Detailed Analysis</span>
      <svg class="breakdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </button>
    <div class="ai-breakdown-body" id="body-${cardId}">
      <div class="ai-breakdown-content">${md2html(item.breakdown || 'No analysis available.')}</div>
    </div>`;
  return card;
}

function toggleAIBreakdown(cardId) {
  const body = getEl(`body-${cardId}`);
  if (body) body.classList.toggle('open');
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL REFRESH
// ═══════════════════════════════════════════════════════════════
function globalRefresh() {
  const s = state.currentSection;
  if (s === 'news')       { state.newsLoaded    = false; loadNews(); }
  else if (s === 'wars')  { state.warsLoaded    = false; loadWars(); }
  else if (s === 'sports'){ state.sportsLoaded  = false; loadSports(); }
  else if (s === 'ai-warfare') { state.aiLoaded = false; loadAIWarfare(); }
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════
function initEventListeners() {
  // Nav items
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

  // Refresh buttons
  getEl('refreshNews')?.addEventListener('click',    () => { state.newsLoaded    = false; loadNews(); });
  getEl('refreshSports')?.addEventListener('click',  () => { state.sportsLoaded  = false; loadSports(); });
  getEl('refreshAI')?.addEventListener('click',      () => { state.aiLoaded      = false; loadAIWarfare(); });
  getEl('globalRefresh')?.addEventListener('click',  globalRefresh);

  // Wars filter buttons (visual only)
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function init() {
  updateDateTime();
  setInterval(updateDateTime, 30000);
  initEventListeners();

  // Pre-load news in background after 1.5s
  setTimeout(() => loadNews(), 1500);

  showToast('🛡️ DefenceAI ready. Ask anything about defence or geopolitics!', 'info', 4000);
}

document.addEventListener('DOMContentLoaded', init);

// Expose globals for inline onclick handlers
window.toggleBreakdown      = toggleBreakdown;
window.toggleWarCard        = toggleWarCard;
window.toggleSportBreakdown = toggleSportBreakdown;
window.toggleAIBreakdown    = toggleAIBreakdown;
