require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

// ─── Correct Gemini model names (v1beta API) ──────────────────────────────────
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY CACHE  — fetched once per day, served to all users
// ═══════════════════════════════════════════════════════════════════════════════
const dailyCache = {
  news:       null,   // { national:[], international:[] }
  sports:     null,   // { sports:[] }
  aiWarfare:  null,   // { aiWarfare:[] }
  fetchedOn:  null,   // 'YYYY-MM-DD' string of last fetch date
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);   // e.g. "2026-06-13"
}

function cacheValid() {
  return dailyCache.fetchedOn === todayStr();
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helper: Call Gemini with model fallback ──────────────────────────────────
async function callGemini(prompt) {
  let lastError = null;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    
    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    };

    console.log(`\n=== GEMINI API CALL ===`);
    console.log(`Model: ${model}`);
    console.log(`Request Payload:`, JSON.stringify(requestPayload, null, 2));

    try {
      const response = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      console.log(`Response Status: ${response.status}`);
      console.log(`Response StatusText: ${response.statusText}`);

      if (response.status === 429 || response.status === 503) {
        const t = await response.text();
        console.log(`Full Response Body:`, t);
        console.warn(`[${model}] quota/unavailable (${response.status}) — trying next`);
        console.log(`=======================\n`);
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }
      if (!response.ok) {
        const t = await response.text();
        console.log(`Full Response Body:`, t);
        console.warn(`[${model}] error ${response.status} — trying next`);
        console.log(`=======================\n`);
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }

      const t = await response.text();
      console.log(`Full Response Body:`, t);
      const data = JSON.parse(t);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(`[${model}] ✅ success (${text.length} chars)`);
      console.log(`=======================\n`);
      return text;

    } catch (err) {
      console.error(`[${model}] network error: ${err.message}`);
      console.log(`=======================\n`);
      lastError = err.message;
    }
  }

  throw new Error(`All Gemini models failed. Last: ${lastError}`);
}

// ─── Helper: Extract JSON from Gemini text ────────────────────────────────────
function extractJSON(raw) {
  const fenced = raw.match(/```json\s*([\s\S]*?)\s*```/) ||
                 raw.match(/```\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : raw;
  try { return JSON.parse(candidate.trim()); } catch {}
  const s = candidate.indexOf('{');
  const e = candidate.lastIndexOf('}');
  if (s !== -1 && e !== -1) {
    try { return JSON.parse(candidate.slice(s, e + 1)); } catch {}
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH FUNCTIONS — called once per day
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchNews() {
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const prompt = `Today is ${today}. You are a defence and geopolitics news expert.

Generate a JSON response with today's most important defence and geopolitics news. Return ONLY valid JSON:
{
  "national": [
    { "id":1, "title":"Concise headline (max 15 words)", "summary":"2-3 sentence factual summary", "breakdown":"6-8 sentences covering: what happened, who is involved, historical context, geopolitical implications, and significance", "category":"Defence|Politics|Economy|Science|Society", "importance":"High|Medium|Low" }
  ],
  "international": [
    { "id":1, "title":"Concise headline (max 15 words)", "summary":"2-3 sentence factual summary", "breakdown":"6-8 sentences covering: what happened, countries involved, geopolitical impact, global implications, India's connection if any", "category":"Geopolitics|Defence|Economy|Diplomacy|Science", "importance":"High|Medium|Low" }
  ]
}

Generate exactly 10 national news items (India defence & politics) and 10 international news items (global defence & geopolitics). Make them realistic and relevant to ${today}. Return ONLY the JSON object, no other text.`;

  const raw  = await callGemini(prompt);
  const data = extractJSON(raw);
  return data || getMockNews();
}

async function fetchSports() {
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const prompt = `Today is ${today}. Generate today's top 8 sports news items relevant to general awareness about defence and sports.

Return ONLY this JSON:
{
  "sports": [
    { "id":1, "title":"Sports headline (max 15 words)", "sport":"Cricket|Football|Olympics|Wrestling|Boxing|Chess|Badminton|Hockey|Athletics|Tennis|Shooting", "summary":"2-3 sentence factual update", "breakdown":"5-6 sentences covering: match/event details, performance, records, tournament context", "importance":"High|Medium|Low" }
  ]
}

Return ONLY the JSON object.`;

  const raw  = await callGemini(prompt);
  const data = extractJSON(raw);
  return data || getMockSports();
}

async function fetchAIWarfare() {
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const prompt = `Today is ${today}. Generate today's top 8 AI and modern warfare technology news items.

Return ONLY this JSON:
{
  "aiWarfare": [
    { "id":1, "title":"Technology/AI Defence headline (max 15 words)", "techCategory":"Artificial Intelligence|Drone Warfare|Cyber Security|Space Defence|Hypersonic|Naval Tech|Missile Systems|Electronic Warfare", "summary":"2-3 sentence factual technology update", "breakdown":"5-6 sentences covering: technology details, countries involved, strategic implications, global impact", "importance":"High|Medium|Low" }
  ]
}

Return ONLY the JSON object.`;

  const raw  = await callGemini(prompt);
  const data = extractJSON(raw);
  return data || getMockAIWarfare();
}

// ─── Refresh daily cache ──────────────────────────────────────────────────────
async function refreshDailyCache() {
  console.log(`\n📡 Fetching fresh daily content for ${todayStr()}...`);
  try {
    const [news, sports, aiWarfare] = await Promise.allSettled([
      fetchNews(),
      fetchSports(),
      fetchAIWarfare(),
    ]);

    dailyCache.news      = news.status      === 'fulfilled' ? news.value      : getMockNews();
    dailyCache.sports    = sports.status    === 'fulfilled' ? sports.value    : getMockSports();
    dailyCache.aiWarfare = aiWarfare.status === 'fulfilled' ? aiWarfare.value : getMockAIWarfare();
    dailyCache.fetchedOn = todayStr();

    const src = news.status === 'fulfilled' && news.value !== getMockNews() ? 'Gemini AI' : 'Curated';
    console.log(`✅ Daily cache refreshed (source: ${src}) — valid until midnight.\n`);
  } catch (err) {
    console.error('❌ Daily cache refresh failed:', err.message);
    dailyCache.news      = getMockNews();
    dailyCache.sports    = getMockSports();
    dailyCache.aiWarfare = getMockAIWarfare();
    dailyCache.fetchedOn = todayStr();
  }
}

// ─── Ensure cache is populated (refresh if stale/empty) ──────────────────────
async function ensureCache() {
  if (!cacheValid()) {
    await refreshDailyCache();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC WARS DATA — hardcoded, no API calls needed
// ═══════════════════════════════════════════════════════════════════════════════
const WARS_DATA = {
  wars: [
    {
      id:1, name:"First Kashmir War", year:"1947", duration:"Oct 1947 – Jan 1949",
      rootCause:"Following the partition of British India, the princely state of Jammu & Kashmir was invaded by Pakistani tribal militias (Lashkar) backed by Pakistan. Maharaja Hari Singh signed the Instrument of Accession to India on October 26, 1947, in exchange for military aid. India airlifted troops to Srinagar, halting the tribal advance. The conflict ended with a UN-mandated ceasefire.",
      combatants:{ india:"Indian Army — 1 Sikh, 4 Kumaon Regiments, paratroopers", opponent:"Pakistan Army + Pashtun tribal militias (Lashkar-e-Islam)" },
      alliances:{
        proIndia:[
          { country:"United Kingdom", support:"Diplomatic backing; British officers commanded transitional units on both sides" },
          { country:"USA", support:"Diplomatic pressure; referred matter to UN Security Council" }
        ],
        proOpponent:[
          { country:"Pakistan", support:"Direct supply of weapons, logistics, and officers to tribal militias" },
          { country:"Afghanistan", support:"Tribal linkages and passage for Pashtun fighters" }
        ]
      },
      outcome:"UN ceasefire Jan 1, 1949. India retained ~2/3 of Kashmir; Pakistan held Azad Kashmir (POK). Line of Control established.",
      keyBattles:["Battle of Zoji La","Defence of Srinagar Airport","Battle of Poonch","Liberation of Leh"],
      significance:"Established the Kashmir dispute that continues to define India-Pakistan relations. UNSC Resolution 47 (1948) demanded a plebiscite that was never held. The Instrument of Accession and ceasefire line are foundational to understanding the dispute.",
      casualties:"India: ~1,500 killed | Pakistan+militias: ~6,000+ killed/wounded"
    },
    {
      id:2, name:"Sino-Indian War", year:"1962", duration:"Oct 20 – Nov 21, 1962 (32 days)",
      rootCause:"Disputed borders along the McMahon Line (eastern sector) and Aksai Chin (western sector). China had built a strategic road through Aksai Chin connecting Xinjiang and Tibet. Nehru's Forward Policy of establishing posts in disputed areas triggered a massive, well-planned Chinese military offensive on two fronts simultaneously.",
      combatants:{ india:"Indian Army — inadequately equipped, unprepared for high-altitude winter warfare", opponent:"People's Liberation Army (PLA) — well-prepared, winter-equipped, 3:1 numerical advantage" },
      alliances:{
        proIndia:[
          { country:"USA", support:"Emergency airlift of arms; US Navy positioned in Bay of Bengal as a deterrent signal to China" },
          { country:"United Kingdom", support:"Diplomatic support and emergency military supplies" },
          { country:"Canada", support:"Emergency military supplies including winter clothing and weapons" }
        ],
        proOpponent:[
          { country:"Pakistan", support:"Diplomatic support for China; Ayub Khan offered joint action against India" },
          { country:"None", support:"China fought without formal military allies but had strong Sino-Soviet relations (pre-split)" }
        ]
      },
      outcome:"Decisive Chinese victory. China captured Aksai Chin and made deep advances in NEFA (Arunachal Pradesh) before declaring unilateral ceasefire. India lost strategic territory.",
      keyBattles:["Battle of Rezang La","Battle of Walong","Battle of Namka Chu","Defence of Chushul"],
      significance:"Watershed moment for Indian defence. Led to complete overhaul of the Indian military, creation of Mountain Divisions, and the 1963 India-USA arms cooperation. Shattered the Panchsheel illusion. 'Never Again' became India's military doctrine.",
      casualties:"India: 1,383 killed, 1,047 wounded, 3,968 captured | China: ~722 killed (official)"
    },
    {
      id:3, name:"Indo-Pakistani War", year:"1965", duration:"Aug 5 – Sep 23, 1965",
      rootCause:"Pakistan launched Operation Gibraltar, infiltrating thousands of armed guerrillas into Jammu & Kashmir to foment insurgency. When the plan failed, Pakistan launched Operation Grand Slam to capture the Akhnoor bridge and cut off Indian supply lines to Kashmir. India responded by crossing the international border near Lahore, escalating to full-scale war.",
      combatants:{ india:"Indian Army — 54th Infantry Division, 1st Armoured Division", opponent:"Pakistan Army — 1st Armoured Division with US-supplied Patton M48 tanks" },
      alliances:{
        proIndia:[
          { country:"Soviet Union", support:"Diplomatic support; hosted and mediated the Tashkent Agreement negotiations" },
          { country:"None", support:"India fought largely without active military allies" }
        ],
        proOpponent:[
          { country:"China", support:"Issued ultimatum threatening military action against India; provided diplomatic cover for Pakistan" },
          { country:"USA", support:"Had supplied Patton tanks to Pakistan earlier; cut off military aid to both sides during the war" }
        ]
      },
      outcome:"Military stalemate. Tashkent Agreement (Jan 10, 1966) brokered by Soviet PM Kosygin restored pre-war positions. PM Lal Bahadur Shastri died in Tashkent the morning after signing.",
      keyBattles:["Battle of Asal Uttar (Patton Graveyard)","Battle of Haji Pir Pass","Battle of Chawinda","Battle of Khem Karan"],
      significance:"India's armoured corps destroyed 97 Pakistani Patton tanks at Asal Uttar — dubbed 'Patton ka Qabristan.' First major tank battle in Asia. The Tashkent Agreement and Shastri's mysterious death remain topics of historical debate.",
      casualties:"India: ~3,000 killed | Pakistan: ~3,800 killed | 200+ tanks destroyed on each side"
    },
    {
      id:4, name:"Bangladesh Liberation War (Indo-Pakistani War)", year:"1971", duration:"Dec 3–16, 1971 (13 days full war, 9 months guerrilla conflict)",
      rootCause:"West Pakistan's brutal crackdown on East Pakistan (Operation Searchlight, March 25, 1971) killed hundreds of thousands and triggered 10 million refugees into India. India recognised and armed the Mukti Bahini Bengali resistance. Pakistan pre-emptively struck 11 Indian airbases on Dec 3, triggering full-scale war across both the eastern and western fronts.",
      combatants:{ india:"Indian Army + Air Force + Navy + Mukti Bahini (Bangladesh liberation forces) — Gen. Sam Manekshaw commanding", opponent:"Pakistan Army — primarily defending East Pakistan while engaging on western front" },
      alliances:{
        proIndia:[
          { country:"Soviet Union", support:"Signed Indo-Soviet Treaty (Aug 1971); vetoed 3 UNSC resolutions favouring Pakistan; deployed Pacific Fleet to deter US Navy" },
          { country:"Bangladesh (Mukti Bahini)", support:"Active military collaboration, intelligence sharing, guerrilla operations inside East Pakistan" }
        ],
        proOpponent:[
          { country:"USA", support:"Nixon sent USS Enterprise carrier group to Bay of Bengal to intimidate India; supplied arms to Pakistan; strongly sided with Pakistan diplomatically" },
          { country:"China", support:"Issued threats of military action against India; blocked UNSC censure of Pakistan; was deterred by Soviet intervention" },
          { country:"Saudi Arabia", support:"Financial and diplomatic support to Pakistan throughout the crisis" }
        ]
      },
      outcome:"India's most decisive military victory. Pakistan surrendered Dec 16, 1971 — 93,000 Pakistani POWs (largest mass surrender since WWII). Bangladesh created as independent nation. Simla Agreement (1972) established current Line of Control.",
      keyBattles:["Battle of Longewala","Naval Strike on Karachi (Op Trident & Python)","Fall of Dhaka","Battle of Hilli"],
      significance:"India's finest military hour. Completed in just 13 days on the eastern front. The sinking of INS Khukri (Dec 9) was India's worst naval loss. Simla Agreement converted ceasefire line into Line of Control. General Manekshaw's meticulous 9-month preparation is studied in military academies worldwide.",
      casualties:"India: 3,843 killed | Pakistan: ~9,000 killed | Bangladesh civilians: estimated 300,000–3 million"
    },
    {
      id:5, name:"Siachen Conflict (Operation Meghdoot)", year:"1984", duration:"April 13, 1984 – ongoing (world's highest battlefield at 6,000m+)",
      rootCause:"The Simla Agreement (1972) defined the Line of Control only up to grid reference NJ9842, leaving the northern glacier area undefined. Pakistan began issuing mountaineering permits to foreign teams in Indian-claimed territory. India preempted a planned Pakistani helicopter airlift to occupy the Saltoro Ridge by launching Operation Meghdoot on April 13, 1984, airlifting troops before Pakistan could act.",
      combatants:{ india:"Indian Army — Kumaon Regiment, Ladakh Scouts, High Altitude Warfare School personnel", opponent:"Pakistan Army — Northern Light Infantry, Special Services Group (SSG)" },
      alliances:{
        proIndia:[{ country:"None", support:"India acted unilaterally; pre-emptive occupation was a complete strategic surprise" }],
        proOpponent:[{ country:"None", support:"Pakistan found itself outmanoeuvred; no active military allies in the conflict" }]
      },
      outcome:"India controls the Siachen Glacier and the strategically critical Saltoro Ridge — commanding heights overlooking both Pakistan and China's Shaksgam Valley (gifted to China by Pakistan in 1963).",
      keyBattles:["Capture of Sia La and Bilafond La mountain passes","Battle of Gyari Sector (1987)","Avalanche tragedy at Gyari (2012) — 140 Pakistani soldiers buried"],
      significance:"World's highest battlefield. India spends ~₹7 crore per day maintaining the position but yields strategic command over the Karakoram region. The glacial positions also monitor Chinese movements in the Shaksgam Valley.",
      casualties:"India: 869+ killed (majority from frostbite, altitude sickness, avalanches) | Pakistan: 3,000+ killed"
    },
    {
      id:6, name:"Operation Pawan — IPKF Sri Lanka", year:"1987", duration:"July 1987 – March 1990",
      rootCause:"India brokered the Indo-Sri Lanka Accord (July 1987) between the Sri Lankan government and Tamil militant groups. The LTTE (Liberation Tigers of Tamil Eelam) rejected the accord. India deployed the Indian Peace Keeping Force (IPKF) to enforce the agreement and disarm the LTTE. The LTTE turned its weapons on Indian forces, triggering a full counter-insurgency campaign.",
      combatants:{ india:"Indian Peace Keeping Force (IPKF) — 100,000 troops at peak, including Para Commandos, Gurkha Rifles", opponent:"LTTE (Liberation Tigers of Tamil Eelam) — well-armed, tunnel networks, suicide bombers" },
      alliances:{
        proIndia:[{ country:"Sri Lanka (Government)", support:"Initially invited and supported IPKF deployment; later requested withdrawal under new PM Premadasa" }],
        proOpponent:[{ country:"None", support:"LTTE had covert support from sympathetic Tamil diaspora globally but no state backing" }]
      },
      outcome:"Partial military success — India captured the Jaffna Peninsula but could not decisively defeat LTTE. India withdrew March 1990 following Sri Lankan government request. The LTTE later assassinated PM Rajiv Gandhi in 1991.",
      keyBattles:["Battle of Jaffna","Siege of Jaffna University","Battle of Vadamarachi","LTTE ambushes in Vanni jungle"],
      significance:"India's longest and costliest post-independence military operation before Kargil. Exposed limitations of conventional armies in counter-insurgency. Led to India's military doctrine reforms for sub-conventional warfare. Rajiv Gandhi's assassination in 1991 was direct blowback.",
      casualties:"India: 1,155 killed, 2,984 wounded | LTTE: ~5,000 killed | Sri Lankan civilians: thousands"
    },
    {
      id:7, name:"Kargil War (Operation Vijay)", year:"1999", duration:"May 3 – July 26, 1999 (87 days)",
      rootCause:"During winter 1998–99, Pakistan Army regulars disguised as Kashmiri militants infiltrated Indian-held peaks in the Kargil-Drass sector, occupying over 130 sq km and threatening to cut off NH-1A (the only road connecting Leh to the rest of India). The plan was conceived by Gen. Pervez Musharraf without PM Nawaz Sharif's full knowledge. India launched Operation Vijay to recapture all occupied positions.",
      combatants:{ india:"Indian Army — 8 Mountain Division + 3 Infantry Division; IAF Operation Safed Sagar (Mirage 2000, MiG-21, MiG-27)", opponent:"Pakistan Army regulars disguised as Kashmiri militants + Northern Light Infantry" },
      alliances:{
        proIndia:[
          { country:"USA", support:"President Clinton pressured Nawaz Sharif to withdraw; shared intelligence proving regular Pakistan Army involvement; refused to mediate on Pakistani terms" },
          { country:"Russia", support:"Diplomatic support; refused emergency arms sales to Pakistan" },
          { country:"UK & France", support:"International diplomatic support; condemned Pakistani infiltration" }
        ],
        proOpponent:[
          { country:"China", support:"Advised Pakistan to show restraint; did not provide active military support; Pakistan found itself diplomatically isolated" },
          { country:"None", support:"All major world powers sided with India's position of restoring the LoC" }
        ]
      },
      outcome:"Complete Indian military victory. Pakistan withdrew to the LoC by July 26, 1999. India recaptured all occupied posts. Nawaz Sharif's government was destabilised — Musharraf staged a coup in October 1999.",
      keyBattles:["Battle of Tiger Hill","Capture of Tololing","Battle of Point 4875","Battle of Batalik Sector","Recapture of Drass"],
      significance:"India's most recent full-scale conventional conflict. First war where both sides possessed nuclear weapons. IAF used Mirage 2000 for the first time in combat for precision strikes. Kargil Review Committee led to creation of the Chief of Defence Staff (CDS) post. July 26 is celebrated as Kargil Vijay Diwas.",
      casualties:"India: 527 killed, 1,363 wounded | Pakistan: officially 357–453 killed (independent estimates: 1,000–4,000+)"
    },
    {
      id:8, name:"2016 Surgical Strikes (Post-Uri Attack)", year:"2016", duration:"Sep 18 (Uri attack) → Sep 28–29, 2016 (strikes)",
      rootCause:"Pakistan-based Jaish-e-Mohammed militants attacked the Indian Army Brigade HQ at Uri in J&K on September 18, 2016, killing 19 soldiers in the worst terrorist attack on Indian military in years. India's security establishment decided on punitive cross-LoC Special Forces strikes rather than conventional retaliation, marking a doctrine shift from strategic restraint to proactive deterrence.",
      combatants:{ india:"Indian Army Para Special Forces (9 Para SF) — multiple teams striking simultaneously", opponent:"JeM militant launch pads in Pakistan-Administered Kashmir" },
      alliances:{
        proIndia:[
          { country:"USA", support:"Tacit approval; called on Pakistan to dismantle terrorist infrastructure" },
          { country:"Russia & France", support:"Diplomatic support; continued defence cooperation with India" }
        ],
        proOpponent:[
          { country:"China", support:"Blocked India's attempt to designate Masood Azhar as global terrorist at UNSC" },
          { country:"Pakistan", support:"Officially denied any surgical strikes occurred; claimed Indian forces never crossed the LoC" }
        ]
      },
      outcome:"India destroyed 7 militant launch pads across the LoC, killing an estimated 38–50 militants. Pakistan denied the strikes took place. India publicly acknowledged the operation, representing a major communication and doctrine shift.",
      keyBattles:["Simultaneous LoC crossing at 7 locations by Para SF teams"],
      significance:"First publicly acknowledged Indian cross-LoC military operation. Marked the end of India's policy of 'strategic restraint' and established a new template of calibrated military response to terrorism. Created the doctrinal foundation for the 2019 Balakot airstrikes.",
      casualties:"India: 0 casualties during strikes | Opponent: 38–50 militants killed"
    },
    {
      id:9, name:"Balakot Airstrikes (Operation Bandar)", year:"2019", duration:"Feb 14 (Pulwama) → Feb 26, 2019 (airstrike)",
      rootCause:"A JeM suicide bomber killed 40 CRPF personnel in Pulwama, J&K on February 14, 2019 — the deadliest terrorist attack on Indian security forces in decades. India's IAF retaliated on February 26 with airstrikes on JeM's largest training camp at Balakot in Khyber Pakhtunkhwa, Pakistan — the first Indian airstrike on Pakistani territory since the 1971 war.",
      combatants:{ india:"Indian Air Force — Mirage 2000H jets armed with Israeli SPICE-2000 precision guided bombs", opponent:"JeM training camp at Balakot, Pakistan (Khyber Pakhtunkhwa — across international boundary, not PoK)" },
      alliances:{
        proIndia:[
          { country:"USA & France", support:"Backed India's right to self-defence; accelerated Masood Azhar UNSC designation" },
          { country:"Israel", support:"SPICE-2000 guided bombs used in the strike; close intelligence cooperation" }
        ],
        proOpponent:[
          { country:"China", support:"Initially blocked Masood Azhar's UNSC terrorist designation; relented in May 2019 under global pressure" },
          { country:"Turkey", support:"Condemned Indian strikes at the UN; expressed public solidarity with Pakistan" }
        ]
      },
      outcome:"India struck the camp. Next day (Feb 27), PAF attempted retaliation — a dogfight ensued. Wg. Cdr. Abhinandan Varthaman's MiG-21 Bison shot down an F-16 before being downed himself. He was captured and returned by Pakistan within 60 hours amid international pressure.",
      keyBattles:["Balakot precision airstrike","LoC aerial dogfight — MiG-21 Bison vs F-16 engagement"],
      significance:"India crossed the international boundary for the first time since 1971 to conduct airstrikes. Nuclear escalation fears were managed. Abhinandan Varthaman became a national hero. Masood Azhar was finally designated a global terrorist by the UN (May 2019). SPICE-2000 bomb capabilities entered public domain.",
      casualties:"India: 1 MiG-21 lost, pilot captured and returned | Pakistan: JeM casualties disputed; F-16 loss denied by Pakistan but confirmed by US officials"
    },
    {
      id:10, name:"Galwan Valley Clash", year:"2020", duration:"June 15–16, 2020 (night engagement)",
      rootCause:"China's PLA had been intruding into multiple areas along the LAC in eastern Ladakh since April 2020 — at Depsang, Galwan, Hot Springs, and Pangong Tso — exploiting the COVID lockdown distraction. On June 15, during a de-escalation meeting, PLA troops pre-positioned with improvised weapons ambushed an Indian patrol party in Galwan Valley in a deliberate, planned attack.",
      combatants:{ india:"16 Bihar Regiment — Col. Santosh Babu commanding (killed in action)", opponent:"People's Liberation Army — estimated 300–400 troops with iron rods, nail-studded clubs, stones" },
      alliances:{
        proIndia:[
          { country:"USA", support:"Shared intelligence; condemned Chinese aggression; fast-tracked weapons approvals for India including 6 additional AH-64E Apaches" },
          { country:"Russia", support:"Continued defence partnership; expedited supply of S-400 components" },
          { country:"Japan & Australia", support:"Strengthened quadrilateral defence cooperation; expressed solidarity" }
        ],
        proOpponent:[
          { country:"Pakistan", support:"Conducted simultaneous military exercises with China along western borders; attempted to exploit tension" },
          { country:"None", support:"China faced broad international condemnation; most nations expressed support for India" }
        ]
      },
      outcome:"India: 20 soldiers killed including the commanding officer. China admitted 4 killed (independent estimates: 35–45 PLA dead). 18-month disengagement process across multiple friction points. India imposed sweeping economic responses.",
      keyBattles:["Hand-to-hand combat at Galwan River confluence (no firearms — both sides honour 1996/2005 protocols banning guns near LAC)"],
      significance:"Worst casualties on the LAC since 1962. India's response was multi-domain: military (Rafale jets urgently inducted, Mountain Strike Corps reinforced), economic (267 Chinese apps banned, Chinese FDI restricted), diplomatic (Quad activated). Disengagement completed in phases at Gogra (Sep 2021), Hot Springs (Sep 2022), Depsang & Demchok (Oct 2024).",
      casualties:"India: 20 killed | China: officially 4, independent estimates 35–45 killed"
    },
    {
      id:11, name:"Depsang & Demchok Disengagement / Operation Longbow", year:"2022–2024", duration:"Oct 2022 – Oct 2024",
      rootCause:"Following the June 2020 Galwan clash, China continued to occupy strategic patrol points in the Depsang Bulge — an area of 900 sq km where India had traditional patrol rights to Patrol Points 10–13 — and near Demchok in southern Ladakh. Diplomatic negotiations through 21 rounds of Corps Commander-level talks eventually produced agreements for buffer zone patrolling arrangements.",
      combatants:{ india:"Indian Army — 14 Corps (Fire and Fury Corps) with Mountain Strike Corps reinforcement", opponent:"PLA — Western Theatre Command with new forward infrastructure" },
      alliances:{
        proIndia:[{ country:"Diplomatic community", support:"Broad international support for India's territorial integrity position" }],
        proOpponent:[{ country:"Pakistan", support:"Indirect support through distraction on western front" }]
      },
      outcome:"Disengagement agreements reached for Depsang and Demchok sectors in October 2024, restoring patrolling rights to April 2020 positions. Buffer zones established to prevent friction. Both armies maintain enhanced forward deployments.",
      keyBattles:["21 rounds of Corps Commander talks","Forward infrastructure race along LAC","Finger Area, Pangong Tso north bank disengagement (Feb 2021)"],
      significance:"Demonstrated that sustained diplomatic and military pressure, combined with economic decoupling, can achieve strategic outcomes without armed conflict. India's infrastructure development under BRO (Border Roads Organisation) — 100+ new tunnels, roads, and helipads — changed the strategic balance permanently.",
      casualties:"No direct combat casualties; ongoing deployment casualties from harsh terrain and weather"
    },
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════
function getMockNews() {
  return {
    national: [
      { id:1, title:"India Conducts Successful Test of Agni-V MIRV Ballistic Missile", summary:"DRDO and Strategic Forces Command jointly tested the Agni-V missile with Multiple Independently Targetable Re-entry Vehicle (MIRV) technology over the Bay of Bengal, marking a major leap in India's nuclear deterrence.", breakdown:"The Agni-V MIRV test — codenamed Project Divyastra — allows a single missile to deliver multiple warheads to different targets simultaneously, making interception exponentially harder. With a range exceeding 5,000 km, Agni-V can reach virtually any point in China and parts of Europe. MIRV technology was previously held only by the five permanent UNSC members. This test shifts the strategic balance in South Asia significantly. India's nuclear doctrine remains No First Use (NFU) with 'massive retaliation' as the response posture. The DRDO-SFC collaboration underlines the maturity of India's strategic deterrence programme.", category:"Defence", importance:"High" },
      { id:2, title:"Indian Navy Commissions INS Arighaat, Second Nuclear Submarine", summary:"India's second nuclear-powered ballistic missile submarine INS Arighaat was formally commissioned, completing a key component of India's nuclear triad — land, air, and sea-based delivery systems.", breakdown:"INS Arighaat is an Arihant-class SSBN (Ship Submersible Ballistic Nuclear) powered by an 83MW pressurised light-water reactor. It can carry K-15 Sagarika and K-4 submarine-launched ballistic missiles. The nuclear triad — where submarines provide the survivable second-strike leg — is essential to credible minimum deterrence. INS Arihant was the first of the class, Arighaat the second. India's undersea nuclear capability means even a first strike by an adversary cannot eliminate India's retaliatory capability, strengthening deterrence stability in South Asia.", category:"Defence", importance:"High" },
      { id:3, title:"DRDO Delivers Pralay Quasi-Ballistic Missiles to Indian Army for Forward Deployment", summary:"India's first indigenous surface-to-surface quasi-ballistic missile Pralay has been handed over to the Army in regiment-level quantities for deployment along the China and Pakistan borders.", breakdown:"Pralay (meaning 'destruction') is a 150–500 km range precision strike missile that manoeuvres mid-flight, defeating standard ballistic missile defence interceptors. Unlike conventional ballistic missiles that follow a predictable arc, Pralay's quasi-ballistic trajectory makes it significantly harder to track and neutralise. The missile is part of India's Aatmanirbhar Bharat defence indigenisation push. Pralay will serve as India's primary precision conventional strike weapon, giving commanders options between artillery and long-range ballistic missiles. Production has been entrusted to Bharat Dynamics Limited (BDL).", category:"Defence", importance:"High" },
      { id:4, title:"CDS Outlines Roadmap for Three Integrated Theatre Commands at Conference", summary:"Chief of Defence Staff presented the final roadmap for India's three proposed Integrated Theatre Commands — Northern, Western, and Maritime — at the Army Commanders' Conference in New Delhi.", breakdown:"India's Integrated Theatre Command (ITC) reforms aim to create joint Army-Navy-Air Force commands with unified operational authority for specific geographic theatres. The three commands proposed are: Northern Theatre Command (China border), Western Theatre Command (Pakistan border), and Maritime Theatre Command (Indian Ocean Region). Currently, India has 17 single-service commands which lack joint operational efficiency. The reform was recommended by the Shekatkar Committee and accelerated after the Kargil Review Committee recommendations led to the CDS post creation in 2020. Theaterisation represents the most significant structural reform of the Indian military since independence.", category:"Defence", importance:"High" },
      { id:5, title:"HAL Tejas MkII Prototype Completes First Successful Engine Run", summary:"Hindustan Aeronautics Limited completed the milestone ground engine run of the Tejas MkII advanced light fighter aircraft prototype, a significant step in India's most ambitious aviation programme.", breakdown:"Tejas Mk II is powered by the General Electric F-414 engine (98 kN thrust vs the Mk I's 80 kN F-404), giving it 30% more thrust and enabling a heavier weapons load. It will carry an indigenously developed UTTAM AESA (Active Electronically Scanned Array) radar and upgraded avionics. The Mk II bridges the capability gap between the current Tejas Mk IA (83 ordered from HAL) and the future 5th-generation AMCA (Advanced Medium Combat Aircraft). Naval variant development for INS Vikrant's short take-off but arrested recovery (STOBAR) deck is also underway. Tejas programme makes India only the 5th country to design, develop, and produce a supersonic combat aircraft.", category:"Science", importance:"Medium" },
      { id:6, title:"India Activates New Forward Posts in Depsang Plains Following Disengagement", summary:"The Indian Army activated new all-weather forward operational posts in the strategically sensitive Depsang Plains of eastern Ladakh following the October 2024 disengagement agreement with China.", breakdown:"The Depsang Bulge — an area of approximately 900 sq km — had been inaccessible to Indian patrols since April 2020 Chinese intrusions. The new infrastructure, built at 14,000–17,000 feet under Border Roads Organisation's Project Himank, includes roads, helicopter landing sites, bunkers, and automated weather stations. India has built 100+ new border infrastructure projects since the Galwan clash. The BRO completed 2,280 km of roads, 224 bridges, and key tunnels (Atal Tunnel, Sela Tunnel, Zojila) that provide all-weather connectivity. This infrastructure investment has fundamentally changed India's ability to reinforce forward positions rapidly.", category:"Defence", importance:"High" },
      { id:7, title:"India and Russia Sign ₹45,000 Crore Deal for S-400 Spare Parts and Life Extension", summary:"India concluded a major bilateral agreement with Russia to secure long-term maintenance, spare parts supply, and mid-life upgrades for the five S-400 Triumf air defence system units.", breakdown:"India's S-400 procurement for $5.4 billion (2018 deal) has faced pressure from US CAATSA (Countering America's Adversaries Through Sanctions Act) sanctions, which could penalise nations buying Russian defence equipment. India received a waiver but the maintenance contract reinforces India's strategic autonomy doctrine. The S-400 can simultaneously track and engage aircraft, cruise missiles, drones, and ballistic missiles up to 400 km away and at altitudes up to 30 km. Three of the five units are deployed along the northern border with China. Russia's current preoccupation with Ukraine has made India a priority partner for maintaining defence cooperation.", category:"Defence", importance:"High" },
      { id:8, title:"Union Budget 2026 Allocates Record ₹6.81 Lakh Crore for National Defence", summary:"The Union Budget announced a record defence allocation with 80% of capital procurement reserved for domestically manufactured equipment, the highest indigenisation mandate ever.", breakdown:"India's defence budget has grown from ₹2.95 lakh crore (2019-20) to ₹6.81 lakh crore (2026-27), a 130% increase in seven years. The revenue component covers salaries and maintenance, while the capital component covers new acquisitions. The 80% domestic procurement rule further strengthens India's Aatmanirbhar Bharat defence ecosystem, which now has 100+ private sector defence manufacturers. Key beneficiaries include HAL, BEL, BDL, GRSE, MDL, and the new private players like L&T, Mahindra Defence, and Tata Advanced Systems. India's defence exports also crossed ₹21,000 crore in 2023-24, on track to reach ₹50,000 crore by 2029.", category:"Economy", importance:"Medium" },
      { id:9, title:"Indian Coast Guard Intercepts Major Heroin Shipment in Arabian Sea Operation", summary:"In a coordinated multi-agency maritime operation, the Indian Coast Guard and NCB seized over 700 kg of high-purity heroin worth ₹3,500 crore from a vessel in the Arabian Sea.", breakdown:"The Arabian Sea corridor is a primary smuggling route for narcotics from the Golden Crescent (Afghanistan-Pakistan-Iran). This operation involved Indian Coast Guard vessels, P-8I Poseidon maritime patrol aircraft for surveillance, and National Investigation Agency (NIA) coordination. The vessel was intercepted using MMRS (Multi-Mission Maritime Reconnaissance System) intelligence. India's Narcotics Control Bureau works with maritime agencies under the NCORD (Narco Coordination Centre) framework established in 2016. Maritime drug interdiction has become a key security priority given Pakistan-sponsored narcotic trafficking funding terror operations.", category:"Society", importance:"Medium" },
      { id:10, title:"India's Border Roads Organisation Sets New Record Building 6,806 km in Single Year", summary:"The Border Roads Organisation achieved its highest-ever annual infrastructure target, completing 6,806 km of roads and 455 bridges in strategic border areas in a single financial year.", breakdown:"BRO operates in 19 states and union territories, primarily in mountainous border regions at extreme altitudes. Strategic projects completed this year include extensions of the Zojila Tunnel (world's longest road tunnel above 11,000 feet), multiple trans-himalayan road links, and helipads in previously inaccessible LAC positions. Fast-tracking border infrastructure was a key lesson from the 1962 war when India's military was hampered by lack of roads. The Rashtriya Rajmarg evam Aasandhi Vikas Nigam (NHIDCL) works in parallel with BRO in the northeast. These roads also have significant socio-economic impact — connecting remote Himalayan communities to markets and services for the first time.", category:"Defence", importance:"Medium" },
    ],
    international: [
      { id:1, title:"NATO Activates High Readiness Force in Eastern Europe Amid Escalating Tensions", summary:"NATO activated its 40,000-strong Very High Readiness Joint Task Force (VJTF) and positioned additional units in Poland, Estonia, and Romania as Russia-Ukraine hostilities intensified.", breakdown:"NATO's eastward posture shift represents the most significant European security realignment since the Cold War. The VJTF can deploy within 5–7 days. NATO has now deployed multinational battlegroups in all eight eastern member states. The Russia-Ukraine conflict (since Feb 2022) has fundamentally reshaped European security, with Finland and Sweden joining NATO in 2023-24. India has maintained a carefully calibrated position — abstaining on UN resolutions condemning Russia while continuing to purchase discounted Russian crude oil at $15-20 below market rate. India's strategic autonomy has been tested but largely maintained amid Western pressure.", category:"Geopolitics", importance:"High" },
      { id:2, title:"China's Aircraft Carrier CNS Fujian Completes First Blue-Water Pacific Trial", summary:"China's most advanced aircraft carrier CNS Fujian (Type 003), featuring electromagnetic catapult launch systems, completed its maiden open-ocean trial, signalling a major leap in PLAN capability.", breakdown:"CNS Fujian (CV-18) is China's third carrier and first with EMALS (Electromagnetic Aircraft Launch System), allowing it to launch heavier aircraft more efficiently than steam catapults. This gives China genuine blue-water power projection comparable to US supercarriers. For India, Chinese carrier operations in the Indian Ocean Region (IOR) represent a direct strategic concern. China's 'String of Pearls' strategy — ports in Pakistan (Gwadar), Sri Lanka (Hambantota), Bangladesh, Myanmar — creates a potential encirclement. India counters with its SAGAR (Security and Growth for All in the Region) doctrine and recently inducted INS Vikrant, India's first domestically built carrier.", category:"Defence", importance:"High" },
      { id:3, title:"India-US Finalise Advanced iCET Framework for Defence Technology Transfer", summary:"India and the United States expanded the iCET (Initiative on Critical and Emerging Technologies) framework to include direct defence technology transfers in jet engines, semiconductors, and AI systems.", breakdown:"The iCET, launched in 2023, represents a fundamental shift in US-India defence technology sharing. Key areas: GE-F414 engine technology transfer to HAL for Tejas Mk II (a landmark deal as the US rarely transfers fighter jet engine technology), APSTAR satellite collaboration, and AI-assisted military decision systems. The four foundational defence agreements — GSOMIA (2002), LEMOA (2016), COMCASA (2018), BECA (2020) — provide the legal framework. India now accesses real-time US geospatial intelligence for precision weapons guidance. This represents a strategic realignment while India maintains its arms relationship with Russia and independence on key geopolitical questions.", category:"Diplomacy", importance:"High" },
      { id:4, title:"Russia's Hypersonic Zircon Missile Deployed on Pacific Fleet Submarines", summary:"Russia announced the operational deployment of 3M22 Zircon hypersonic anti-ship cruise missiles on submarine platforms, extending their reach against Western carrier groups.", breakdown:"The Zircon (also called Tsirkon) travels at Mach 8-9 (9,000 km/h) at altitudes that defeat current US Navy Aegis missile defence systems. No existing interceptor can reliably engage a Mach 9 sea-skimming missile. Russia's hypersonic arsenal — Kinzhal (Mach 10, air-launched), Avangard (Mach 27, glide vehicle), and Zircon — represents a generational leap that has alarmed NATO planners. For India, the India-Russia BrahMos cruise missile partnership is developing the BrahMos-ER (800 km range) and BrahMos hypersonic variant. India has also tested its own Hypersonic Technology Demonstrator Vehicle (HSTDV) successfully in 2020, joining an exclusive club of hypersonic nations.", category:"Defence", importance:"High" },
      { id:5, title:"SCO Summit Reaffirms Counter-Terrorism Cooperation; India-Pakistan Tensions Persist", summary:"The Shanghai Cooperation Organisation summit in Astana addressed regional terrorism but India-Pakistan tensions dominated sidelines as PM Modi and Pakistan PM held no bilateral talks.", breakdown:"The SCO (Shanghai Cooperation Organisation) comprises China, Russia, India, Pakistan, Iran, Kazakhstan, Kyrgyzstan, Tajikistan, Uzbekistan, and Belarus (as observer). India joined in 2017. The organisation's Regional Anti-Terrorist Structure (RATS) is meant to coordinate counter-terrorism — but Pakistan's continued use of terrorism as a state instrument has hampered cooperation. India consistently uses SCO platforms to highlight Pakistan-sponsored terrorism. The SCO's expanding membership (now 9 full members) reflects a multipolar world order with Eurasian focus. China's role as the dominant power within SCO gives it outsized influence over the forum's direction.", category:"Diplomacy", importance:"Medium" },
      { id:6, title:"Iran's Ballistic Missile Salvo Targets Israeli Military Installations in Second Strike", summary:"Iran launched over 200 ballistic missiles targeting Israeli military and air force bases in a direct state-on-state attack, the second such operation in 2024-26, raising fears of full-scale Middle East war.", breakdown:"The Israel-Iran direct confrontation represents the crossing of a long-held strategic threshold — historically the two states fought through proxies (Hezbollah, Hamas, Houthi). Iran's missile salvo used Fattah-1 and Fattah-2 hypersonic ballistic missiles alongside conventional Shahab-3 and Emad variants. Israel's Arrow-3 and David's Sling interceptors engaged the incoming missiles with partial success. The conflict has disrupted Red Sea shipping (Houthi attacks) affecting India's trade routes — ~30% of India's container trade passes through the Suez Canal-Red Sea corridor. India has deployed naval escorts in the Gulf of Aden under Operation Sankalp and faces pressure to clearly position itself.", category:"Geopolitics", importance:"High" },
      { id:7, title:"Pakistan Receives 12 Wing Loong III Combat Drones from China for LoC Operations", summary:"Pakistan Air Force inducted 12 Chinese CASC Wing Loong III armed UAVs, providing standoff strike and ISR capability against Indian positions along the Line of Control.", breakdown:"Wing Loong III is a medium-altitude long-endurance (MALE) combat drone with a range of 1,000+ km and payload of 400 kg of precision-guided munitions. The Pakistan-China defence partnership has deepened significantly as Western arms supplies dried up. India's response has been to accelerate indigenous drone programmes — DRDO's Tapas BH-201, Rustom II, and the new AI-based swarm drones. India has also ordered MQ-9B SeaGuardian drones from the US (31 drones, ₹31,000 crore deal). The drone arms race on the subcontinent mirrors global trends where UAVs have become decisive in conflicts from Nagorno-Karabakh to Ukraine.", category:"Defence", importance:"High" },
      { id:8, title:"Quad Leaders Launch Indo-Pacific Maritime Domain Awareness Initiative at Tokyo Summit", summary:"Leaders of India, USA, Australia, and Japan launched the expanded IPMDA (Indo-Pacific Maritime Domain Awareness) initiative with satellite-linked coastal radar networks covering 25 partner nations.", breakdown:"The Quad's IPMDA initiative provides real-time tracking of all vessels in the Indo-Pacific using a combination of coastal radars, satellite AIS monitoring, and AI-based pattern recognition to identify dark ships (those that disable transponders). This directly counters China's maritime grey zone activities — coast guard vessels harassing fishing boats, illegal fishing, and dredging operations in the South China Sea. India contributes its Information Fusion Centre-Indian Ocean Region (IFC-IOR) based in Gurugram, which already tracks 3,500+ vessels daily. Quad remains a non-treaty grouping focused on rules-based order rather than a formal military alliance.", category:"Diplomacy", importance:"High" },
      { id:9, title:"North Korea Tests Hwasong-19 ICBM; Japan Activates Missile Defence Systems", summary:"Pyongyang test-fired its newest Hwasong-19 intercontinental ballistic missile over Japan's exclusive economic zone, triggering Japan's highest-level missile defence alert and emergency Diet session.", breakdown:"North Korea's ballistic missile programme has accelerated since 2022 with 100+ test launches. The Hwasong-19 solid-fuel ICBM can reportedly reach the continental US in under 30 minutes. Japan's activation of its PAC-3 and Aegis Ashore systems demonstrates the integrated missile defence architecture being built in the Indo-Pacific. Japan has also decided to acquire Tomahawk cruise missiles from the US — a historic departure from its post-WWII pacifist constitution interpretation. India tracks North Korean developments closely given Pyongyang's technology sharing with Pakistan (A.Q. Khan network connections) and the general nuclear proliferation risk in Asia.", category:"Geopolitics", importance:"High" },
      { id:10, title:"Sudan Civil War: UN Reports 25 Million Facing Famine as RSF Advances Continue", summary:"The United Nations warned that 25 million Sudanese face catastrophic famine conditions as the conflict between the Sudanese Armed Forces (SAF) and Rapid Support Forces (RSF) enters its third year with no ceasefire in sight.", breakdown:"The Sudan civil war (since April 2023) has created the world's largest displacement crisis with 10 million internally displaced and 2+ million refugees. The RSF is backed by UAE and Wagner Group remnants; SAF by Egypt. Sudan's geographic position — bordering Egypt, Libya, Chad, Central African Republic, South Sudan, Ethiopia, and Eritrea — makes it a critical hub for arms trafficking. India evacuated 3,000+ citizens in Operation Kaveri (April 2023). The African Union has struggled to broker peace. This conflict illustrates how resource competition (gold mining) and ethnic fault lines can trigger catastrophic instability in the Sahel-Horn of Africa region.", category:"Geopolitics", importance:"Medium" },
    ]
  };
}

function getMockSports() {
  return {
    sports: [
      { id:1, title:"India Beat Australia by 6 Wickets in ICC Champions Trophy 2026 Final", sport:"Cricket", summary:"India lifted the ICC Champions Trophy 2026 title defeating Australia in a close final at Dubai International Stadium. Rohit Sharma scored 85 and Bumrah took 4 wickets.", breakdown:"India's Champions Trophy victory is their third CT title. The tournament was held jointly in Pakistan and UAE. Rohit Sharma was named Man of the Tournament. Jasprit Bumrah's 4/22 in the final was the defining bowling performance. India's current ICC ranking: No.1 in Tests and ODIs. The BCCI under Jay Shah's leadership has pushed for India-hosted marquee events. Champions Trophy results are often asked in sports GK rounds alongside ICC World Cup history.", importance:"High" },
      { id:2, title:"Neeraj Chopra Sets New Asian Javelin Record at Paris Diamond League", sport:"Athletics", summary:"Neeraj Chopra threw 91.06m at the Paris Diamond League, setting a new Asian record and placing him second in the all-time world javelin rankings.", breakdown:"Neeraj Chopra won India's first Olympic gold in track and field at Tokyo 2020. He is also the World Champion (Budapest 2023). His 91.06m throw places him behind only Czech legend Jan Železný (98.48m world record). Diamond League is World Athletics' premier annual circuit comprising 14 events globally. India's growing athletics infrastructure through SAI's Target Olympic Podium Scheme (TOPS) is producing results across multiple disciplines including 4x400m relay, steeplechase, and long jump.", importance:"High" },
      { id:3, title:"Indian Men's Hockey Team Wins FIH Pro League, Ranked World No. 2", sport:"Hockey", summary:"India clinched the FIH Hockey Pro League 2025-26 season title after defeating the Netherlands 4-2, rising to the world No. 2 ranking for the first time in 40 years.", breakdown:"Indian hockey's revival has been dramatic: Bronze at Tokyo 2020 (first Olympic hockey medal since 1980 gold), Bronze again at Paris 2024, and now Pro League title. India won 8 consecutive Olympic gold medals in hockey from 1928-1956 and a total of 8 golds. The FIH Pro League replaced the World League as the premier annual competition. Harmanpreet Singh won the FIH Player of the Year award. The Astroturf revolution of the 1970s (replacing natural grass) ended India's dominance, which it is now rebuilding through scientific coaching and fitness regimes.", importance:"Medium" },
      { id:4, title:"D. Gukesh Successfully Defends FIDE World Chess Championship Title", sport:"Chess", summary:"Grandmaster D. Gukesh defended his World Chess Championship title in Singapore, defeating Ian Nepomniachtchi 7.5-6.5, becoming the first Asian player to retain the title.", breakdown:"Gukesh (born May 2006) became the youngest World Chess Champion in history when he defeated Ding Liren in 2024. His title defence confirms him as a generational talent. India's chess achievements: Viswanathan Anand was 5-time world champion (2000, 2007, 2008, 2010, 2012), the first Asian champion. India's chess ecosystem has produced 84+ Grandmasters, the highest outside Russia. FIDE (Fédération Internationale des Échecs) is headquartered in Lausanne, Switzerland. Chess became one of India's most successful Olympic sports at the Budapest 2024 Olympiad where India won gold in both open and women's categories.", importance:"High" },
      { id:5, title:"Vinesh Phogat Wins World Wrestling Championship Gold After Paris Disqualification Comeback", sport:"Wrestling", summary:"Vinesh Phogat won gold at the UWW World Wrestling Championships in 53kg freestyle, completing a remarkable comeback a year after her Paris 2024 Olympics disqualification.", breakdown:"Vinesh Phogat was infamously disqualified from the Paris 2024 Olympics final for being 100 grams overweight after an exhaustive 53kg weight-cutting process — one of sport's most controversial moments. Her CAS appeal for a shared silver medal was rejected. Her world championship gold represents a defining comeback. India's wrestling programme has produced Sushil Kumar (2008 bronze, 2012 gold), Bajrang Punia, and the Phogat family (Geeta, Babita, Vinesh). United World Wrestling (UWW) governs the three Olympic wrestling styles: Freestyle (men/women) and Greco-Roman (men only).", importance:"Medium" },
      { id:6, title:"Lakshya Sen Wins All England Badminton Championship Men's Singles Title", sport:"Badminton", summary:"India's Lakshya Sen won the prestigious All England Open Badminton Championship, India's first men's singles title at the world's oldest badminton tournament in 69 years.", breakdown:"The All England Open (held annually in Birmingham) is badminton's most historic tournament, first held in 1899. The last Indian to win men's singles was Prakash Nath in 1947. Lakshya Sen (22) is ranked World No.3. India's badminton successes: PV Sindhu (2 Olympic medals, 2019 World Champion, 2021 All England runner-up), Saina Nehwal (2012 Olympic bronze, World No.1), Kidambi Srikanth (2021 World Championship silver). Badminton World Federation (BWF) governs the sport; headquarters in Kuala Lumpur, Malaysia. Thomas Cup (men's) and Uber Cup (women's) are team-based BWF championships.", importance:"Medium" },
      { id:7, title:"India's Pistol Shooter Manu Bhaker Wins Gold at ISSF World Championship", sport:"Olympics", summary:"Manu Bhaker won the women's 10m Air Pistol gold at the ISSF World Championship, adding to her historic Paris 2024 double-bronze Olympic performance.", breakdown:"Manu Bhaker won two bronze medals at Paris 2024 — in 10m Air Pistol and 10m Air Pistol Mixed Team — becoming the first Indian athlete to win two medals in a single Olympic Games since independence. ISSF (International Shooting Sport Federation) is the global governing body for Olympic shooting. India has a strong shooting tradition: Abhinav Bindra (2008 Beijing gold — India's first individual Olympic gold), and multiple world and Commonwealth medals. India's National Rifle Association (NRAI) has developed a robust talent pipeline through district, state, and national trials.", importance:"High" },
      { id:8, title:"India to Host 2027 Men's Hockey World Cup — HI Confirms Venues", summary:"Hockey India confirmed that the 2027 Men's Hockey World Cup will be jointly hosted at Bhubaneswar's Kalinga Stadium and Rourkela's Birsa Munda International Hockey Stadium.", breakdown:"India previously hosted the Hockey World Cup in 2018 (Bhubaneswar) and 2023 (Bhubaneswar and Rourkela jointly). The Birsa Munda stadium, completed in 2023, is the world's largest hockey stadium with 20,000 capacity. Hosting the World Cup gives India's programme significant home advantage. The FIH Men's Hockey World Cup has been held every four years since 1971; Pakistan (4 titles) leads the all-time winners list, followed by Netherlands (3) and Australia (3). India won the inaugural 1975 World Cup. The tournament will feature 16 teams and is expected to generate massive interest in Indian hockey.", importance:"Low" },
    ]
  };
}

function getMockAIWarfare() {
  return {
    aiWarfare: [
      { id:1, title:"India's DRDO Successfully Demonstrates Drone Swarm 'Abhimanyu' — 75 Coordinated UAVs", techCategory:"Drone Warfare", summary:"DRDO's Abhimanyu system demonstrated 75 AI-coordinated drones performing simultaneous ISR, electronic warfare, and simulated strike missions at the Pokhran test range in Rajasthan.", breakdown:"Drone swarms represent next-generation warfare where mass replaces precision. Abhimanyu uses distributed AI — no single point of failure — allowing swarms to complete missions even if 30% of drones are destroyed. A human 'quarterback' sets mission parameters; AI handles tactical execution (maintaining formation, avoiding obstacles, target allocation). Swarms were decisive in Azerbaijan vs Armenia (Nagorno-Karabakh, 2020) and Ukraine vs Russia. India's swarm programme is specifically designed to overwhelm China's layered air defence systems (HQ-9, HQ-16) through saturation attacks. The swarm can also perform communications relay, electronic jamming, and decoy missions simultaneously.", importance:"High" },
      { id:2, title:"US Army's ATLAS AI Targeting System Deployed in Operational Theatres", techCategory:"Artificial Intelligence", summary:"The US Army's AI-powered ATLAS (Aided Threat Recognition from Dismounted Operations) system is now deployed, reducing targeting decision time from 20 minutes to under 30 seconds.", breakdown:"ATLAS combines computer vision, machine learning, and sensor fusion to identify targets from multiple sensor feeds (satellite, UAV, ground radar) and recommend engagement options to human operators. The 'human in the loop' principle — where a human must authorise lethal action — is maintained. The ethical debate around Lethal Autonomous Weapons Systems (LAWS) is being debated at the UN Convention on Certain Conventional Weapons (CCW). India's position: supports mandatory human control over lethal decisions. The speed advantage of AI targeting is transformative — in electronic warfare and hypersonic missile scenarios where decision time is measured in seconds, AI assistance becomes essential.", importance:"High" },
      { id:3, title:"China Tests AI-Guided DF-ZF Hypersonic Glide Vehicle with Precision Strike Capability", techCategory:"Hypersonic", summary:"China conducted a successful test of an AI-guided DF-ZF hypersonic glide vehicle that demonstrated terminal-phase manoeuvring to within 5 metres of a target, defeating US missile defence systems.", breakdown:"Hypersonic weapons (Mach 5+) that can manoeuvre in flight present a fundamental challenge to ballistic missile defence systems designed to intercept predictable trajectories. Adding AI guidance for terminal precision turns the DF-ZF into a precision conventional or nuclear strike weapon. China's hypersonic arsenal (DF-17, DF-ZF, Starry Sky-2) is the world's largest. India's response: HSTDV (Hypersonic Technology Demonstrator Vehicle) successfully tested at Mach 6 in 2020; BrahMos hypersonic variant under development with Russia; DRDO's HGV programme. The US is developing Conventional Prompt Global Strike to close the hypersonic gap.", importance:"High" },
      { id:4, title:"Israel-Ukraine AI Battlefield Management Cooperation Agreement Signed", techCategory:"Artificial Intelligence", summary:"Israel and Ukraine signed a bilateral AI battlefield management technology sharing agreement covering drone swarm tactics, urban warfare AI systems, and cyber defence capabilities.", breakdown:"Ukraine has emerged as the world's most advanced real-world laboratory for AI in warfare. Systems tested in Ukraine including AI-guided FPV drones, AI battlefield management (DELTA system), and electronic warfare have been rapidly iterated based on combat feedback. Israel's experience with Harpy loitering munitions, AI-assisted Iron Dome, and battle management systems is being shared in exchange for real-world performance data. This bi-directional knowledge transfer is reshaping global military doctrine. India monitors these developments through its DRDO, Army Technology Board, and defence attachés in Tel Aviv and Kyiv. Lessons are being applied to India's integrated air defence and border surveillance systems.", importance:"Medium" },
      { id:5, title:"Russia Deploys Krasukha-S4 Electronic Warfare Systems to Arctic Region", techCategory:"Electronic Warfare", summary:"Russia positioned Krasukha-S4 ground-based electronic warfare stations in the Arctic, capable of jamming US satellite constellations, GPS navigation, and airborne radar systems over a 300 km radius.", breakdown:"Electronic warfare (EW) — the ability to deny, degrade, and deceive enemy electromagnetic systems — has become as decisive as kinetic firepower in modern conflict. Russia's EW ecosystem (Krasukha-4, Murmansk-BN, Krasuha-2) demonstrated effectiveness in Ukraine by jamming Starlink terminals and GPS-guided munitions. GPS spoofing — sending false position data — has been used to misdirect drones. India's EW capabilities: Samyukta integrated EW system (DRDO), Himshakti tactical EW system, and naval EW suites on warships. The Arctic deployment has implications for transpolar aviation routes and early warning radar coverage of North American approaches.", importance:"High" },
      { id:6, title:"India Launches EMISAT-2 Signals Intelligence Satellite for Real-Time Border Surveillance", techCategory:"Space Defence", summary:"ISRO launched EMISAT-2 into a 750 km polar orbit to monitor electromagnetic emissions along the LAC and LoC, providing India's Defence Intelligence Agency with real-time radar and communications intelligence.", breakdown:"EMISAT (Electromagnetic Intelligence Satellite) maps enemy radar frequencies, missile guidance systems, and communication networks. This 'order of battle' intelligence allows India to identify gaps in adversary air defence coverage before conducting strike missions. India's space defence milestones: EMISAT-1 (2019), Mission Shakti ASAT test (2019 — created 'kinetic kill' capability), Defence Space Agency established (2019). India is developing a dedicated military satellite constellation (GSAT-7A for IAF, GSAT-7 for Navy). China's ASAT test in 2007 created 3,500+ pieces of tracked debris — demonstrating the escalatory risks of anti-satellite weapons.", importance:"High" },
      { id:7, title:"UK's GCAP Reveals AI-Autonomous Loyal Wingman Drone for Tempest Sixth-Generation Fighter", techCategory:"Artificial Intelligence", summary:"The Global Combat Air Programme unveiled the AI-controlled 'Mosquito' loyal wingman drone designed to operate in cooperative teams with the manned Tempest fighter, entering service by 2035.", breakdown:"'Loyal wingman' or Collaborative Combat Aircraft (CCA) concepts represent the future of manned-unmanned teaming. AI-controlled drones fly as wingmen — performing ISR, electronic attack, and weapons carriage — extending the manned pilot's situational awareness and reducing risk. The US Boeing MQ-28 Ghost Bat and XQ-58 Valkyrie serve similar roles. India's contribution: CATS (Combat Air Teaming System) Warrior drone being developed by ADE (Aeronautical Development Establishment) and HAL for pairing with Tejas and Rafale. The CATS programme also includes the Infinity air-launched cruise missile that CATS Warrior would deploy. This is the future of the Indian Air Force's combat architecture.", importance:"Medium" },
      { id:8, title:"India-US Jointly Deploy Undersea Hydrophone Network Across Indian Ocean Region", techCategory:"Naval Tech", summary:"India and the US completed Phase 1 deployment of an AI-powered undersea acoustic surveillance network with 200+ hydrophone nodes covering critical choke points in the Indian Ocean Region.", breakdown:"Undersea Domain Awareness (UDA) is India's most critical maritime security gap given the Indian Ocean's vast expanse (70+ million sq km) and the growing presence of Chinese nuclear submarines (PLAN operates 6 SSBNs and 12+ SSNs). The hydrophone network uses AI signal processing to distinguish submarine acoustic signatures, detect underwater drones, and monitor seabed cable vulnerabilities. NORINCO data suggests China currently has 10-12 submarines operating in the IOR annually. India is developing its own nuclear submarine force (3 more Arihant-class SSBNs planned), 6 Scorpene-class SSKs (P-75), and is negotiating lease of Russian Akula-class nuclear attack submarine. Undersea dominance is fundamental to India's Indian Ocean strategy.", importance:"High" },
    ]
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    cacheValid: cacheValid(),
    cacheDate: dailyCache.fetchedOn,
    today: todayStr(),
    models: MODELS,
  });
});

// ─── Trigger manual refresh (admin) ───────────────────────────────────────────
app.post('/api/refresh-cache', async (req, res) => {
  dailyCache.fetchedOn = null;   // invalidate
  await ensureCache();
  res.json({ success: true, refreshedAt: new Date().toISOString(), cacheDate: dailyCache.fetchedOn });
});

// ─── News (served from daily cache) ───────────────────────────────────────────
app.get('/api/news', async (req, res) => {
  await ensureCache();
  const isGemini = dailyCache.news !== getMockNews();
  res.json({ success:true, data:dailyCache.news, generatedAt:dailyCache.fetchedOn, source: isGemini ? 'gemini' : 'curated' });
});

// ─── Sports (served from daily cache) ─────────────────────────────────────────
app.get('/api/sports', async (req, res) => {
  await ensureCache();
  res.json({ success:true, data:dailyCache.sports, generatedAt:dailyCache.fetchedOn, source:'curated' });
});

// ─── AI Warfare (served from daily cache) ─────────────────────────────────────
app.get('/api/ai-warfare', async (req, res) => {
  await ensureCache();
  res.json({ success:true, data:dailyCache.aiWarfare, generatedAt:dailyCache.fetchedOn, source:'curated' });
});

// ─── Wars (STATIC — no API calls ever) ────────────────────────────────────────
app.get('/api/wars', (req, res) => {
  res.json({ success:true, data:WARS_DATA, source:'static' });
});

// ─── Chat (defence & politics ONLY) ───────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const prompt = `You are DefenceAI, an expert AI assistant focused exclusively on defence, military affairs, geopolitics, and politics. Today is ${today}.

STRICT RULES:
1. ONLY answer questions related to: defence, military history, wars, weapons systems, geopolitics, international relations, political affairs, security policy, strategic affairs, border disputes, terrorism, intelligence, military technology.
2. If the user asks about ANYTHING else (entertainment, cooking, math, coding, personal advice, etc.), respond with: "I'm DefenceAI, specialised in defence and geopolitical affairs only. Please ask me about defence, military history, global politics, or security topics."
3. Always provide well-structured, accurate, detailed responses with markdown formatting.
4. Keep your answers concise and relatively short. Do not write extremely long paragraphs. Aim for about half the length of a typical detailed AI response.
5. If the user says a simple greeting like "hi" or "hello", respond with a simple "Hi, how can I assist you today?" without any additional text.
6. For actual queries, include: Direct answer → Historical/strategic context → Geopolitical significance (but keep all these sections brief).

User query: ${message}`;

  try {
    const text = await callGemini(prompt);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`⚠️ **AI Temporarily Unavailable**\n\nThe AI assistant is temporarily unavailable due to quota limits. Please try again in a few minutes.\n\n**You can still explore:**\n- 📰 Today's Defence News (National & International)\n- ⚔️ Post-1947 Indian Wars Archive\n- 🏆 Sports News\n- 🤖 AI & Modern Warfare Updates`);
  }
});

// ─── Serve SPA ────────────────────────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ═══════════════════════════════════════════════════════════════════════════════
// STARTUP — initialise daily cache immediately, then schedule midnight refresh
// ═══════════════════════════════════════════════════════════════════════════════
function scheduleMidnightRefresh() {
  const now  = new Date();
  const next = new Date(now);
  next.setHours(6, 0, 0, 0);          // 6:00 AM IST daily refresh
  if (next <= now) next.setDate(next.getDate() + 1);
  const msUntil = next - now;
  console.log(`⏰ Next daily refresh scheduled at 6:00 AM (in ${Math.round(msUntil / 3600000)}h ${Math.round((msUntil % 3600000) / 60000)}m)`);
  setTimeout(async () => {
    dailyCache.fetchedOn = null;
    await refreshDailyCache();
    scheduleMidnightRefresh();        // Schedule next day
  }, msUntil);
}

app.listen(PORT, async () => {
  console.log(`\n🛡️  DefenceAI Server running on http://localhost:${PORT}`);
  console.log(`   API Key  : ${API_KEY ? '✅ ' + API_KEY.slice(0,12) + '...' : '❌ Missing'}`);
  console.log(`   Models   : ${MODELS.join(' → ')}`);
  console.log(`   Wars     : ✅ Static data (${WARS_DATA.wars.length} conflicts, no API calls)`);
  console.log(`   Cache    : ✅ Daily (fetched once, served to all users)\n`);

  await ensureCache();          // Fetch today's data on startup
  scheduleMidnightRefresh();    // Schedule daily 6 AM refresh
});
