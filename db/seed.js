// ============================================================
// DefenceAI — Defence Knowledge Seed Data
// Run with: node db/seed.js
// Populates the defence_knowledge table in Supabase
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const KNOWLEDGE_DATA = [

  // ═══════════════════════════════════════
  // A. MAJOR WARS
  // ═══════════════════════════════════════
  {
    slug: 'first-indo-pak-war-1947',
    category: 'wars',
    sub_category: 'major_war',
    title: 'First Indo-Pak War (1947–48)',
    summary: 'The first armed conflict between India and Pakistan over the princely state of Jammu & Kashmir, triggered by Pakistani-backed tribal militias invading the state immediately after Partition.',
    timeline: 'October 1947 – January 1949',
    key_facts: [
      'Maharaja Hari Singh signed the Instrument of Accession to India on 26 October 1947',
      'Indian troops were airlifted to Srinagar on 27 October 1947 — first major military airlift in Asia',
      'Pakistan deployed "tribals" and paramilitary forces (Lashkar) before its regular army joined',
      'UN ceasefire came into effect on 1 January 1949',
      'Approximately one-third of Kashmir came under Pakistani control (Azad Kashmir)',
      'India retained Srinagar, Jammu, Ladakh, and the Kashmir Valley'
    ],
    outcome: 'UN-brokered ceasefire. India retained majority of Kashmir including the Valley. Pakistan held Azad Kashmir. The Line of Control (LoC) was established, becoming one of the world\'s most militarised borders.',
    significance: 'Set the template for the unresolved Kashmir dispute. Established Indian precedent of seeking UN intervention. Created the permanent fault line in India-Pakistan relations that has shaped South Asian geopolitics for 75+ years.',
    countries_supporting_india: JSON.stringify([
      { country: 'United Kingdom', support: 'Diplomatic support, senior British officers still commanding Indian Army' },
      { country: 'United States', support: 'Backed UN ceasefire resolution' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan (tribal militias)', support: 'Armed, funded, and organized Pathan tribal warriors from NWFP' },
      { country: 'Pakistan Regular Army', support: 'Deployed regular forces from May 1948 onwards under British commanders' }
    ])
  },
  {
    slug: 'sino-indian-war-1962',
    category: 'wars',
    sub_category: 'major_war',
    title: 'Sino-Indian War (1962)',
    summary: 'A border war fought between India and China along the disputed Himalayan frontier. China launched coordinated offensives in both the NEFA (Arunachal Pradesh) and Aksai Chin sectors, resulting in a humiliating defeat for India.',
    timeline: '20 October – 21 November 1962',
    key_facts: [
      'China launched surprise attacks simultaneously on two fronts: Ladakh and NEFA',
      'Indian forces were under-equipped for high-altitude warfare — soldiers had WWII-era rifles',
      'Nehru\'s "Forward Policy" of placing outposts deep into disputed territory provoked China',
      'China declared a unilateral ceasefire on 21 November 1962',
      'India lost 38,000 sq km of territory in Aksai Chin permanently',
      'Led to the formation of the Indo-Tibetan Border Police (ITBP) in 1962',
      'India suffered ~3,000 killed and ~4,000 captured'
    ],
    outcome: 'Decisive Chinese military victory. China retained Aksai Chin and withdrew from NEFA. India lost no territory in NEFA but suffered massive military and diplomatic humiliation. Nehru\'s health and political standing never recovered.',
    significance: 'Shattered India\'s Panchsheel-era trust in China ("Hindi-Chini bhai-bhai"). Forced India to massively modernize its military. Led to closer India-US and India-USSR defence ties. The LAC dispute remains unresolved and is the source of ongoing confrontations including Galwan 2020.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Emergency military supplies: C-130 transport aircraft, communications equipment, small arms' },
      { country: 'United Kingdom', support: 'Military equipment and diplomatic solidarity' },
      { country: 'Soviet Union', support: 'Initially neutral; refused to cancel MiG-21 deal with India despite Chinese pressure' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan', support: 'Offered military cooperation to China; Ayub Khan held back from opening a second front but tacit approval given to China' },
      { country: 'China (PLA)', support: 'Self-reliant — used own troops, logistics, and high-altitude warfare expertise developed in Tibet' }
    ])
  },
  {
    slug: 'indo-pak-war-1965',
    category: 'wars',
    sub_category: 'major_war',
    title: 'Indo-Pak War (1965)',
    summary: 'A full-scale conventional war between India and Pakistan, triggered by Pakistan\'s Operation Gibraltar — an infiltration campaign into Kashmir — and Operation Grand Slam aimed at cutting off Indian supply lines. India retaliated by crossing the international border into Pakistan near Lahore.',
    timeline: 'August – September 1965',
    key_facts: [
      'Pakistan launched Operation Gibraltar in August 1965 — 5,000 infiltrators into Kashmir',
      'Operation Grand Slam aimed to cut the Akhnoor-Jammu road and isolate Kashmir',
      'India crossed the international border near Lahore on 6 September 1965',
      'Battle of Asal Uttar: India destroyed 97 Pakistani tanks — largest tank battle in Asia since WWII',
      'IAF flew 3,900+ sorties; Pakistan lost more aircraft than India',
      'UN ceasefire on 22 September 1965; Tashkent Declaration signed January 1966',
      'India captured Haji Pir Pass — returned to Pakistan under Tashkent Agreement'
    ],
    outcome: 'Military stalemate; diplomatically inconclusive. India returned captured Pakistani territory; Pakistan returned some Indian territory. Status quo ante restored. India widely seen as having performed better militarily but gained little diplomatically.',
    significance: 'Demonstrated India\'s conventional military strength. Exposed Pakistan\'s overconfidence post-1962. The Tashkent Declaration (mediated by USSR) marked Soviet emergence as a key South Asian mediator. Led to the 1971 India-USSR Treaty of Peace and Friendship.',
    countries_supporting_india: JSON.stringify([
      { country: 'Soviet Union', support: 'Mediated the Tashkent Agreement; provided political support and diplomatic cover' },
      { country: 'United Kingdom', support: 'Arms embargo on both sides but historically closer to India diplomatically' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'United States', support: 'Arms embargo but prior military equipment (M47/48 Patton tanks, F-86/F-104 jets) still in Pakistani use' },
      { country: 'China', support: 'Issued ultimatum threatening to open a second front; supplied Pakistan with small arms and diplomatic support' },
      { country: 'Turkey', support: 'Political and moral support to Pakistan as fellow Muslim nation' }
    ])
  },
  {
    slug: 'indo-pak-war-1971',
    category: 'wars',
    sub_category: 'major_war',
    title: 'Indo-Pak War (1971) & Creation of Bangladesh',
    summary: 'The most decisive war in South Asian history. India intervened militarily after Pakistan\'s brutal crackdown in East Pakistan (Operation Searchlight) and the resulting refugee crisis. The war lasted only 13 days and resulted in Pakistan\'s largest military surrender since WWII and the creation of Bangladesh.',
    timeline: '3–16 December 1971',
    key_facts: [
      'Pakistan\'s Operation Searchlight (March 1971) killed 300,000–3 million Bengalis',
      '10 million refugees flooded into India, straining Indian economy and resources',
      'India signed Treaty of Peace with USSR in August 1971 to deter US/China intervention',
      'India opened simultaneous fronts in both East and West Pakistan on 3 December',
      'INS Vikrant blockaded East Pakistan coast, cutting off sea escape route',
      '93,000 Pakistani soldiers surrendered — largest military surrender since WWII in 1945',
      'Dhaka liberated on 16 December 1971; Bangladesh created',
      'Shimla Agreement signed July 1972 — bilateral resolution of disputes'
    ],
    outcome: 'Complete Indian victory. Pakistan split into two nations. 93,000 POWs held by India. Bangladesh created as independent nation. India emerged as the dominant regional power in South Asia. Pakistan never recovered its previous parity with India.',
    significance: 'India\'s greatest military triumph and Indira Gandhi\'s finest hour. Redrew the map of South Asia. Established India as a regional superpower. Pakistan turned decisively toward nuclear weapons after 1971. Bangladesh-India friendship established. Demonstrated combined arms warfare and civil-military coordination.',
    countries_supporting_india: JSON.stringify([
      { country: 'Soviet Union', support: 'Treaty of Peace and Friendship; UNSC vetoes blocked anti-India resolutions; Soviet naval squadron countered US Task Force 74' },
      { country: 'Bangladesh Freedom Fighters (Mukti Bahini)', support: 'Fought alongside Indian Army inside East Pakistan; provided intelligence and local support' },
      { country: 'France', support: 'Abstained in UNSC, effectively neutral-positive' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'United States', support: 'Sent USS Enterprise carrier group to Bay of Bengal; Nixon-Kissinger "tilt toward Pakistan" policy; diplomatic cover for Pakistan at UN' },
      { country: 'China', support: 'Pakistan\'s closest ally; massed troops on Indian border to deter India; supplied weapons; diplomatic support at UN' },
      { country: 'Jordan & Saudi Arabia', support: 'Secretly transferred US-made F-104 jets to Pakistan in violation of US arms embargos' }
    ])
  },
  {
    slug: 'kargil-war-1999',
    category: 'wars',
    sub_category: 'major_war',
    title: 'Kargil War (1999)',
    summary: 'Pakistan\'s military secretly infiltrated Indian-held peaks in the Kargil sector of Ladakh while the two countries were under the Lahore process peace initiative. India launched Operation Vijay to reclaim all positions. The war was fought at extreme altitudes (15,000–18,000 ft) and ended with India recapturing all positions within 60 days.',
    timeline: 'May – July 1999',
    key_facts: [
      'Pakistani soldiers and militants occupied 130+ Indian pickets along 160 km of LoC',
      'Infiltration began in late 1998–early 1999 under General Pervez Musharraf without PM Nawaz Sharif\'s full knowledge',
      'India launched Operation Vijay (Army) and Operation Safed Sagar (Air Force)',
      'IAF used Mirage 2000 jets with laser-guided bombs for first time in combat',
      'Tiger Hill, Tololing, Point 4875 were key battles',
      '527 Indian soldiers killed in action; 1,363 wounded',
      'Nuclear-armed nations fought a limited conventional war — first of its kind',
      'US pressured Pakistan to withdraw; PM Clinton called it "nuclear brinkmanship"',
      'Pakistan withdrew all forces by 26 July 1999 — Kargil Vijay Diwas'
    ],
    outcome: 'Complete Indian victory. All occupied positions recaptured. Pakistan was diplomatically isolated globally, including by its ally United States and China. Musharraf\'s coup followed in October 1999. India demonstrated it could fight at extreme altitudes.',
    significance: 'First war between two nuclear-armed nations. Exposed Pakistan\'s rogue military acting outside civilian control. Led to US engagement with South Asia as a nuclear flashpoint. India\'s defence modernization accelerated. Kargil Review Committee report led to transformation of Indian intelligence and military coordination.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Pressured Pakistan strongly to withdraw; Clinton personally warned Nawaz Sharif; denied Pakistan refuelling support' },
      { country: 'United Kingdom', support: 'Diplomatic support; backed India\'s position on LoC sanctity' },
      { country: 'Russia', support: 'Arms supplies continued; political solidarity with India' },
      { country: 'France', support: 'Diplomatic support; Mirage 2000 aircraft (Indian-operated) proved decisive' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'China', support: 'Silent during crisis; refused to publicly back Pakistan; mild pressure on Pakistan to de-escalate' },
      { country: 'Saudi Arabia', support: 'Quiet diplomacy to support Pakistan but urged de-escalation' }
    ])
  },

  // ═══════════════════════════════════════
  // B. MAJOR CONFLICTS
  // ═══════════════════════════════════════
  {
    slug: 'siachen-conflict',
    category: 'conflicts',
    sub_category: 'ongoing_conflict',
    title: 'Siachen Conflict (1984–Present)',
    summary: 'India\'s military occupation of the Siachen Glacier — the world\'s highest battlefield — under Operation Meghdoot in April 1984. India pre-empted a Pakistani attempt to occupy the glacier by deploying troops first. The conflict involves both nations maintaining troops at extreme altitudes (up to 22,000 ft) at enormous cost.',
    timeline: '13 April 1984 – Present (ongoing)',
    key_facts: [
      'Operation Meghdoot launched on 13 April 1984 — India deployed paratroopers to Siachen first',
      'Siachen Glacier sits at 17,700–22,000 feet — world\'s highest battlefield',
      'India controls the Siachen Glacier and the key Sia La and Bilafond La passes',
      'Both sides spend ₹5–7 crore per day to maintain troops on the glacier',
      'More soldiers have died from weather than from combat — hypothermia, avalanches, frostbite',
      'NJ9842 — the last surveyed point on the LoC — left ambiguous in 1972 Shimla Agreement, causing the dispute',
      '~2,000+ Indian soldiers have died on Siachen due to extreme weather conditions'
    ],
    outcome: 'India controls the Siachen Glacier and all strategic passes. Pakistan has failed in multiple attempts to dislodge Indian forces. Multiple rounds of talks have failed to produce a demilitarization agreement.',
    significance: 'Strategic chokepoint connecting Pakistan-occupied Kashmir with China-held Aksai Chin. Controls the Karakoram Highway. If lost, would create a strategic land connection between India\'s two adversaries. India\'s sacrifice on Siachen ensures the China-Pakistan Economic Corridor cannot expand westward through the glacier.',
    countries_supporting_india: JSON.stringify([
      { country: 'None (self-reliant)', support: 'India acted unilaterally and decisively — pre-empting Pakistani move based on intelligence' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan', support: 'Regular cross-border shelling and military pressure; diplomatic pressure to demilitarize' },
      { country: 'China', support: 'Tacit support for Pakistan\'s position; uses the strategic corridor argument' }
    ])
  },
  {
    slug: 'galwan-valley-clash-2020',
    category: 'conflicts',
    sub_category: 'border_clash',
    title: 'Galwan Valley Clash (2020)',
    summary: 'A deadly hand-to-hand combat clash between Indian and Chinese soldiers in the Galwan Valley of Eastern Ladakh on 15–16 June 2020 — the deadliest India-China military confrontation since 1967. Both sides used primitive weapons (clubs, barbed wire) as firearms are banned under LAC protocols.',
    timeline: '15–16 June 2020',
    key_facts: [
      '20 Indian soldiers killed including Colonel Santosh Babu, Commanding Officer of 16 Bihar Regiment',
      'China officially admitted 4 deaths (Western intelligence estimates: 35–45 Chinese casualties)',
      'Combat was hand-to-hand with clubs, stones, and barbed wire — no guns used per LAC protocols',
      'India subsequently fast-tracked massive infrastructure development on the LAC',
      'India banned 200+ Chinese apps including TikTok and WeChat as economic retaliation',
      'India blocked Chinese investments requiring government approval — FDI policy changes',
      'Triggered India\'s military modernization: Rafales fast-tracked, 33 new LoC bridges built',
      'LAC disengagement completed at Pangong Tso in February 2021 and PP-15 in 2022'
    ],
    outcome: 'Limited tactical clash. China gained some temporary positions before disengaging. India lost 20 soldiers but inflicted heavier casualties. Both sides gradually disengaged from most friction points by 2022. China-India relations at their lowest point since 1962.',
    significance: 'Reset India\'s China policy permanently — "business as usual" ended. Accelerated India\'s LAC infrastructure building. Pushed India closer to Quad alliance. Led to ₹38,000 crore emergency military procurement. Demonstrated China\'s aggressive posture along the entire LAC.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Strong public statements of support for India; offered intelligence sharing; expedited military sales' },
      { country: 'Russia', support: 'Quietly continued arms supplies; S-400 deal progressed despite US pressure' },
      { country: 'France', support: 'Accelerated delivery of Rafale jets; strong diplomatic support' },
      { country: 'Australia', support: 'Mutual Logistics Support Agreement signed 2020; Quad solidarity' },
      { country: 'Japan', support: 'Strong diplomatic support; accelerated infrastructure grants in India\'s Northeast' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan', support: 'Publicly praised China; CPEC cooperation deepened' },
      { country: 'China (PLA)', support: 'Deployed 50,000+ troops along LAC; refused to acknowledge casualties for months' }
    ])
  },
  {
    slug: 'doklam-standoff-2017',
    category: 'conflicts',
    sub_category: 'border_standoff',
    title: 'Doklam Standoff (2017)',
    summary: 'A 73-day military standoff between Indian and Chinese troops at the Doklam Plateau — a trijunction of India, China, and Bhutan — after China began constructing a road through territory claimed by Bhutan. India intervened at Bhutan\'s request to block the road construction.',
    timeline: '16 June – 28 August 2017 (73 days)',
    key_facts: [
      'China began road construction through the Doklam Plateau on 16 June 2017',
      'India deployed troops under a 2007 treaty with Bhutan — India acts as Bhutan\'s security guarantor',
      'Doklam controls the Siliguri Corridor (Chicken\'s Neck) — India\'s strategic lifeline to Northeast',
      'If China gains Doklam, it can dominate the Siliguri Corridor and potentially cut off Northeast India',
      'Longest military standoff since Sumdorong Chu (1987) — 73 days of eyeball-to-eyeball confrontation',
      'Resolved diplomatically on 28 August 2017 — India asserted disengagement; China quietly stopped road construction',
      'China subsequently built permanent infrastructure and villages near Doklam post-standoff'
    ],
    outcome: 'Diplomatic de-escalation. Both sides stepped back. China temporarily halted road construction but has since built roads and villages nearby. India demonstrated resolve to defend Bhutanese interests. Strategic ambiguity maintained.',
    significance: 'Demonstrated India\'s willingness to stand up to China beyond its own territory. Highlighted the vulnerability of the Siliguri Corridor. Strengthened India-Bhutan security partnership. Showed China that India would use military force to defend strategic interests of smaller neighbours.',
    countries_supporting_india: JSON.stringify([
      { country: 'Bhutan', support: 'Formally requested Indian intervention; provided diplomatic justification' },
      { country: 'United States', support: 'Diplomatic support for India\'s right to defend Bhutan\'s territory' },
      { country: 'Japan', support: 'Strong backing for India\'s position; deepened security dialogue' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan', support: 'Vocal support for China\'s position; offered to "back China fully"' },
      { country: 'China (MFA)', support: 'Issued multiple ultimatums demanding Indian withdrawal; conducted military exercises' }
    ])
  },
  {
    slug: 'kashmir-insurgency',
    category: 'conflicts',
    sub_category: 'insurgency',
    title: 'Jammu & Kashmir Insurgency (1989–Present)',
    summary: 'An ongoing armed insurgency in the Kashmir Valley, fuelled by Pakistan-backed militant groups. The insurgency began in 1989 after disputed state elections and has resulted in tens of thousands of deaths, mass displacement of Kashmiri Pandits, and continuous counter-insurgency operations by Indian security forces.',
    timeline: '1989 – Present (ongoing)',
    key_facts: [
      'Estimated 40,000–70,000 deaths since 1989 (including militants, civilians, and security forces)',
      '100,000+ Kashmiri Pandits driven out in ethnic cleansing of January–February 1990',
      'Pakistan\'s ISI trained and funded multiple militant groups: Hizbul Mujahideen, Lashkar-e-Taiba, Jaish-e-Mohammed',
      'IC-814 hijacking (1999) linked to Pakistan-backed militants — 3 terrorists released by India',
      '2001 Indian Parliament attack by Jaish-e-Mohammed',
      'Article 370 abrogated on 5 August 2019 — J&K divided into two Union Territories',
      'Operation All Out (2017 onwards) significantly reduced active militants in the Valley',
      '2016 Surgical Strikes across LoC against terrorist launchpads'
    ],
    outcome: 'Ongoing. Militant violence significantly reduced post-2016 surgical strikes and Operation All Out. Article 370 abrogation changed J&K\'s constitutional status. Pakistan continues cross-border terrorism. Statehood restoration to J&K promised by Indian government.',
    significance: 'Central front of India-Pakistan proxy conflict. Shapes India\'s entire foreign and defence policy. Has led to three wars and multiple crises. India\'s longest and most expensive counter-insurgency operation. The issue remains a UN Charter flashpoint with global attention.',
    countries_supporting_india: JSON.stringify([
      { country: 'Russia', support: 'Consistent support for India\'s position on Kashmir as bilateral issue' },
      { country: 'United States (post-9/11)', support: 'Designated LeT and JeM as terrorist organizations after 9/11; shared intelligence' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan (ISI)', support: 'Training camps, weapons, funding, and diplomatic support for militant groups' },
      { country: 'China', support: 'Blocks UN designation of Pakistani militant leaders; votes against India on Kashmir resolutions' },
      { country: 'Turkey', support: 'Erdogan raises Kashmir at UN General Assembly; political support for Pakistan' }
    ])
  },
  {
    slug: 'punjab-insurgency',
    category: 'conflicts',
    sub_category: 'insurgency',
    title: 'Punjab Insurgency (1984–1993)',
    summary: 'A Sikh separatist insurgency in Punjab demanding an independent Khalistan. The insurgency reached its peak after Operation Blue Star (1984) and the assassination of Prime Minister Indira Gandhi. India successfully suppressed the militancy through sustained counter-insurgency operations by 1993.',
    timeline: '1984 – 1993',
    key_facts: [
      'Operation Blue Star (June 1984): Indian Army stormed the Golden Temple to flush out militants led by Jarnail Singh Bhindranwale',
      '83 soldiers and 492 civilians/militants killed in Operation Blue Star; damage to Akal Takht was massive',
      'Indira Gandhi assassinated on 31 October 1984 by her Sikh bodyguards in retaliation',
      '3,000+ Sikhs killed in anti-Sikh riots following Gandhi\'s assassination',
      'KPS Gill as DGP Punjab (1988–1990, 1991–1995) led decisive counter-insurgency operations',
      'Operation Black Thunder I (1986) and II (1988) cleared militants from Golden Temple again',
      'Pakistan\'s ISI supported Khalistani militants with training, arms, and sanctuary',
      '~21,000 people killed during the entire insurgency period (1981–1993)'
    ],
    outcome: 'India successfully suppressed the insurgency by 1993. No Khalistan state created. Punjab returned to normalcy. However, the Khalistan movement continues among diaspora in Canada, UK, and Australia, causing ongoing diplomatic tensions.',
    significance: 'India\'s largest internal security crisis before the Kashmir insurgency. Demonstrated the Indian state\'s capacity to defeat a Pakistan-backed insurgency. Led to profound changes in security doctrine, police reforms, and the role of intelligence agencies. The Khalistan movement\'s revival in the 2020s creates new diplomatic friction with Canada.',
    countries_supporting_india: JSON.stringify([
      { country: 'Majority of Sikh community', support: 'Mainstream Sikh leadership and SGPC did not support Khalistani militancy' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan (ISI)', support: 'Training camps in FATA and PoK; weapons, funding, fake currency, and sanctuary to Khalistani militants' },
      { country: 'Khalistani diaspora (UK, Canada, USA)', support: 'Funding, political lobbying, and recruitment support' }
    ])
  },
  {
    slug: 'naxalite-maoist-conflict',
    category: 'conflicts',
    sub_category: 'insurgency',
    title: 'Naxalite–Maoist Conflict (1967–Present)',
    summary: 'India\'s longest-running internal armed conflict, fought between Indian security forces and Maoist/Naxalite guerrillas (Communist Party of India - Maoist). The conflict is centered in the "Red Corridor" spanning tribal areas of Chhattisgarh, Jharkhand, Odisha, and Andhra Pradesh.',
    timeline: '1967 – Present (ongoing)',
    key_facts: [
      'Started as the Naxalbari uprising in West Bengal in May 1967',
      'PM Manmohan Singh called it "the greatest internal security threat" to India in 2006',
      'CPI (Maoist) formed in 2004 by merger of PWG and MCC — declared a terrorist organization',
      'Red Corridor at peak (2004–2010): spanned 180+ districts across 10 states',
      'Dantewada attack (2010): 76 CRPF personnel killed in single ambush — worst Naxal attack',
      'Operation Green Hunt launched 2009: coordinated security forces operation',
      'Naxal violence significantly reduced post-2018 through combination of security and development',
      '~17,000 deaths in the conflict since 1967 (including civilians, security forces, and Naxals)'
    ],
    outcome: 'Ongoing but significantly declining. The Red Corridor shrunk from 180 districts to under 45 by 2023. Many top Naxal leaders killed or surrendered. Chhattisgarh remains the most active zone. Government\'s dual approach of security operations + development has been partially effective.',
    significance: 'Highlights deep socio-economic inequalities among India\'s tribal populations. Has consumed massive security resources for decades. Exposed governance failures in interior India. Now shows that comprehensive approaches combining security and development can defeat insurgencies.',
    countries_supporting_india: JSON.stringify([]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'CPI (Maoist) — no external state actor', support: 'Self-funded through extortion, taxation of contractors, and forest produce; ideological support from certain Maoist international organizations' }
    ])
  },
  {
    slug: 'eastern-ladakh-crisis-2020',
    category: 'conflicts',
    sub_category: 'border_standoff',
    title: 'Eastern Ladakh Standoff (2020–2024)',
    summary: 'The most serious India-China military standoff since 1962. China deployed 50,000+ PLA troops across multiple friction points in Eastern Ladakh in April-May 2020, changing the status quo at several locations including Pangong Tso lake and the Galwan Valley. The standoff involved the deadly Galwan clash and lasted 4 years before full disengagement.',
    timeline: 'April 2020 – October 2024',
    key_facts: [
      'China occupied Indian patrol points (PPs) at multiple locations simultaneously',
      'Galwan Valley clash: 20 Indian and estimated 35-45 Chinese soldiers killed (June 2020)',
      'India deployed additional 50,000 troops and T-90/T-72 tanks to counter PLA',
      'India fast-tracked 33 border roads, 4 operational airstrips, and advanced landing grounds',
      'India\'s LAC infrastructure spending increased from ₹3,720 crore (2019) to ₹14,000+ crore (2023)',
      'Phased disengagement: Pangong Tso (Feb 2021), Gogra-Hot Springs (Sept 2022)',
      'Final disengagement at Depsang and Demchok agreed in October 2024 after 4 years',
      'First Modi-Xi meeting after Galwan held at Kazan (BRICS 2024) post-disengagement'
    ],
    outcome: 'Gradual disengagement achieved through 21 rounds of Corps Commander-level talks. Final disengagement at all friction points completed October 2024. China retained some territorial gains in specific locations. India-China relations normalized somewhat post-disengagement but trust deficit remains.',
    significance: 'Largest military mobilization by India since 1971. Permanently changed India\'s China policy — ended the era of "boundary peace." Accelerated India\'s defence modernization, infrastructure building, and strategic partnerships. Pushed India deeper into Quad and AUKUS alignment structures.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Intelligence sharing, diplomatic pressure on China, expedited arms sales; P-8I patrol aircraft, Apache helicopters' },
      { country: 'France', support: 'Fast-tracked Rafale delivery; extended maritime patrol zones with India' },
      { country: 'Australia', support: 'Mutual Logistics Support Agreement; joint patrols in Indian Ocean' },
      { country: 'Japan', support: '₹3.2 trillion in infrastructure loans to India\'s Northeast; diplomatic solidarity' },
      { country: 'Russia', support: 'Continued arms supplies including S-400; AK-203 rifles manufactured in India' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan', support: 'Pakistan-China coordination deepened; CPEC Phase 2 signed; joint military exercises intensified' }
    ])
  },

  // ═══════════════════════════════════════
  // C. MILITARY OPERATIONS — Indian Army
  // ═══════════════════════════════════════
  {
    slug: 'operation-vijay',
    category: 'operations',
    sub_category: 'army',
    title: 'Operation Vijay (1961)',
    summary: 'India\'s military operation to liberate Goa, Daman, and Diu from Portuguese colonial rule on 18–19 December 1961. The operation involved all three wings of the Indian Armed Forces and ended 450 years of Portuguese colonialism in India.',
    timeline: '17–19 December 1961',
    key_facts: [
      'India had been demanding Portuguese withdrawal through diplomacy since 1947 — refused by Portugal',
      'Portuguese Governor General Vassalo e Silva surrendered on 19 December 1961',
      '3,300 Portuguese troops faced 45,000 Indian troops + naval and air power',
      'Indian Navy blockaded the Goan coast; no Portuguese naval support could arrive',
      'Casualties: India — 22 dead, 54 wounded; Portugal — 30 dead, 57 wounded; 4,500 POW',
      'Operation lasted under 36 hours of actual combat',
      'USA and UK condemned India\'s action at the UN — they supported Portugal (a NATO member)',
      'The operation is also referred to as "Operation Vijay" — the same name as the Kargil war operation'
    ],
    outcome: 'Complete success. Goa liberated on 19 December 1961. Portugal surrendered. Goa became the 25th State of India in 1987. Operation ended colonialism in India.',
    significance: 'Demonstrated India\'s willingness to use military force when diplomacy fails. Created an important precedent for decolonization movements globally. Completed India\'s territorial integration begun in 1947. Exposed Western double standards — condemning India while supporting colonial Portugal.',
    countries_supporting_india: JSON.stringify([
      { country: 'Soviet Union', support: 'UNSC veto blocked Western resolution condemning India; strong diplomatic backing' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'United States', support: 'Condemned India\'s action; sought UNSC resolution against India' },
      { country: 'United Kingdom', support: 'Supported Portugal at UN; criticized India\'s military action' },
      { country: 'Portugal', support: 'The colonial power — refused all diplomatic solutions for 14 years' }
    ])
  },
  {
    slug: 'operation-meghdoot',
    category: 'operations',
    sub_category: 'army',
    title: 'Operation Meghdoot (1984)',
    summary: 'India\'s pre-emptive military operation to occupy the Siachen Glacier on 13 April 1984, before Pakistan could do so. India\'s intelligence showed Pakistan was planning to occupy the strategically vital glacier. India acted first, airlifting troops to the highest battleground in the world.',
    timeline: '13 April 1984 – Present (ongoing occupation)',
    key_facts: [
      'Intelligence inputs revealed Pakistan had ordered special high-altitude gear for a Siachen operation',
      'India airlifted troops to Siachen just days before Pakistan\'s planned occupation',
      'Indian troops occupied Sia La and Bilafond La passes — the highest military outposts in the world',
      'Pakistan subsequently attempted multiple operations (1987 Operation Ababeel) to dislodge Indian forces — all failed',
      'The glacier is maintained at enormous cost: ₹5–7 crore/day',
      'More soldiers die from extreme weather than combat — frostbite, avalanches, pulmonary edema',
      'India controls approximately 76% of the Siachen Glacier'
    ],
    outcome: 'Ongoing strategic success. India occupies the Siachen Glacier and has repelled all Pakistani attempts to dislodge its forces. Multiple peace talks have failed to produce a demilitarization agreement.',
    significance: 'India controls the high ground between Pakistan-occupied Kashmir and China-held Aksai Chin — preventing a strategic land corridor between India\'s two adversaries. One of the most successful pre-emptive military operations in military history.',
    countries_supporting_india: JSON.stringify([]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-pawan',
    category: 'operations',
    sub_category: 'army',
    title: 'Operation Pawan (1987–1990)',
    summary: 'India\'s military intervention in Sri Lanka under the Indo-Sri Lanka Accord (1987) to disarm the Liberation Tigers of Tamil Eelam (LTTE). The Indian Peace Keeping Force (IPKF) was deployed at the request of both the Sri Lankan and Indian governments but became embroiled in a brutal counter-insurgency against the LTTE.',
    timeline: 'July 1987 – March 1990',
    key_facts: [
      'IPKF deployed following Indo-Sri Lanka Accord signed by Rajiv Gandhi and President Jayewardene',
      'LTTE initially refused disarmament — conflict broke out in October 1987',
      'Battle of Jaffna University (October 1987): bloodiest engagement — 29 Indian officers and soldiers killed in 3 days',
      'At peak, 100,000 IPKF troops were deployed in Sri Lanka',
      'IPKF suffered 1,155 killed and 2,984 wounded over 3 years',
      'Sri Lanka\'s new President Premadasa demanded IPKF withdrawal in 1989',
      'Rajiv Gandhi\'s assassination (1991) by LTTE was revenge for Operation Pawan',
      'IPKF conducted over 2,000 operations against LTTE'
    ],
    outcome: 'IPKF withdrew without achieving its primary objective of disarming the LTTE. LTTE remained intact and continued its conflict against Sri Lankan government until 2009. India\'s strategic and diplomatic embarrassment. Cost: ₹1,000+ crore and 1,155 lives.',
    significance: 'India\'s most costly peace-keeping failure. Demonstrated the limits of military force in ethnic conflicts. Led to the assassination of PM Rajiv Gandhi. Created lasting policy lesson: India avoids direct military intervention in internal conflicts of neighbouring countries.',
    countries_supporting_india: JSON.stringify([
      { country: 'Sri Lanka (Jayewardene government)', support: 'Invited IPKF under the Accord; initially cooperative' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Sri Lanka (Premadasa government)', support: 'Later demanded IPKF withdrawal; reportedly supplied LTTE with weapons to pressure India to leave' }
    ])
  },
  {
    slug: 'operation-parakram',
    category: 'operations',
    sub_category: 'army',
    title: 'Operation Parakram (2001–2002)',
    summary: 'India\'s largest military mobilization since 1971, launched after the terrorist attack on the Indian Parliament on 13 December 2001 by Pakistan-backed Jaish-e-Mohammed. India mobilized 500,000 troops along the international border and the LoC in a massive military coercive diplomacy exercise.',
    timeline: 'December 2001 – October 2002',
    key_facts: [
      'Triggered by the 13 December 2001 Parliament attack — 9 security personnel and 5 attackers killed',
      'India mobilized 500,000+ troops, 1,200+ tanks, and entire strategic reserves',
      '800,000 landmines laid along the border (later had to be cleared at huge cost — 10+ years)',
      'Pakistan also mobilized its forces — nuclear-armed nations on brink of war',
      'US Secretary of State Colin Powell intervened diplomatically to de-escalate',
      'Operation lasted 10 months without actual war — cost India ₹8,000 crore',
      'India suffered 798 soldiers killed and 1,600+ wounded during the mobilization — mostly landmine accidents',
      'Led directly to the development of India\'s "Cold Start" doctrine'
    ],
    outcome: 'India ultimately demobilized without going to war. Pakistan gave "assurances" to stop cross-border terrorism but did not follow through. The operation failed to achieve its political objectives but resulted in significant diplomatic pressure on Pakistan. The concept of "Cold Start" doctrine emerged from lessons of Parakram.',
    significance: 'Shaped India\'s future military doctrine profoundly — "Cold Start" doctrine developed as a rapid mobilization alternative to the 10-month Parakram model. Exposed the limitations of massive mobilization as coercive strategy. Showed the nuclear threshold creates constraints for conventional Indian military action against Pakistan.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Pressured Pakistan to act against terrorists after 9/11 context; General Musharraf forced to make public anti-terrorism speech' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'China', support: 'Resupplied Pakistan with ammunition and military equipment during the standoff' }
    ])
  },
  {
    slug: 'surgical-strikes-2016',
    category: 'operations',
    sub_category: 'army',
    title: 'Surgical Strikes (2016)',
    summary: 'India conducted cross-LoC surgical strikes against terrorist launchpads in Pakistan-occupied Kashmir on 29 September 2016, in retaliation for the Uri attack (18 September 2016) in which 19 Indian soldiers were killed. Indian Special Forces crossed the LoC and destroyed 7 terrorist launchpads.',
    timeline: '29 September 2016 (night operation, approximately 12:30 AM – 4:30 AM)',
    key_facts: [
      'Uri attack (18 Sep 2016): 4 Pakistani terrorists killed 19 Indian soldiers — worst attack in 2 decades',
      'Special Forces (Para SF) crossed the LoC at multiple points simultaneously',
      'Operation lasted approximately 4 hours across the entire sector',
      '7 terrorist launchpads destroyed; estimated 35–50 terrorists and their handlers killed',
      'India officially acknowledged the strikes — first time India publicly admitted cross-LoC action',
      'Pakistan denied the strikes happened initially, then admitted "Indian troops crossed border"',
      'Operation was approved by PM Modi personally; NSA Ajit Doval coordinated it',
      'India also withdrew from SAARC summit and initiated trade/diplomatic pressure against Pakistan'
    ],
    outcome: 'Military success — launchpads destroyed and casualties inflicted. Politically significant as India publicly crossed the threshold of cross-LoC action for the first time. Pakistan\'s international isolation increased. Led to Balakot air strikes precedent in 2019.',
    significance: 'Changed India\'s strategic calculus permanently. Established a new redline: cross-border terrorist attacks will be met with cross-border military response. Created the "new normal" in India-Pakistan military dynamics. Led Pakistan to recalibrate its proxy war strategy.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Expressed understanding of India\'s right to self-defence; no criticism of the strikes' },
      { country: 'Israel', support: 'Intelligence cooperation; strong tacit support' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'Pakistan Army', support: 'Denied the strikes; attempted face-saving narrative for domestic audience' },
      { country: 'China', support: 'Called for restraint — implicitly criticizing India\'s action' }
    ])
  },
  {
    slug: 'balakot-airstrike-2019',
    category: 'operations',
    sub_category: 'airforce',
    title: 'Balakot Air Strike (2019)',
    summary: 'India\'s IAF conducted air strikes deep inside Pakistani territory (Balakot, Khyber Pakhtunkhwa) on 26 February 2019, targeting a Jaish-e-Mohammed training facility. This was the first Indian air strike inside Pakistan since the 1971 war. Triggered by the Pulwama attack (14 February 2019) in which 40 CRPF personnel were killed.',
    timeline: '26 February 2019 (pre-dawn, approximately 3:30 AM)',
    key_facts: [
      'Pulwama attack (14 Feb 2019): JeM suicide bomber killed 40 CRPF personnel in Kashmir',
      '12 Mirage 2000 jets flew 80 km inside Pakistani airspace and struck Balakot',
      'Laser-guided bombs dropped on the JeM facility in Jaba Top hills, Balakot',
      'Pakistan shot down IAF Wing Commander Abhinandan Varthaman\'s MiG-21 in aerial battle (27 Feb)',
      'Abhinandan captured by Pakistan and returned under international pressure after 60 hours',
      'IAF\'s BVR (Beyond Visual Range) engagement resulted in downing of a Pakistani F-16 (disputed)',
      'India was the first nation to use Mirage 2000 in actual combat bombing mission in South Asia',
      'Escalation managed through diplomatic back-channels; UAE mediated Pakistan\'s de-escalation'
    ],
    outcome: 'India struck deep inside Pakistan — a qualitative escalation from 2016 LoC strikes. Pakistan\'s aerial counter-attack the next day was repelled. Wing Commander Abhinandan released. Both sides stepped back from further escalation. India established new precedent for escalation dominance.',
    significance: 'First Indian air strike on Pakistani soil since 1971. Crossed a significant escalation threshold. Established that India can and will respond to terrorist attacks with non-nuclear military force inside Pakistan. Changed the India-Pakistan nuclear threshold calculation. PM Modi\'s political capital increased significantly domestically.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Called for de-escalation but understanding of India\'s self-defence right; pressured Pakistan to release Abhinandan' },
      { country: 'France', support: 'Full diplomatic support; offered intelligence' },
      { country: 'UAE', support: 'Mediated Pakistan\'s de-escalation and Abhinandan\'s release' },
      { country: 'Saudi Arabia', support: 'PM bin Salman in Delhi on day of Balakot strike — stayed and backed India diplomatically' }
    ]),
    countries_supporting_opponent: JSON.stringify([
      { country: 'China', support: 'Condemned Indian airstrike; blocked UN designation of JeM chief Masood Azhar (until May 2019)' },
      { country: 'Turkey', support: 'Sided with Pakistan; condemned India at OIC' }
    ])
  },

  // ═══════════════════════════════════════
  // D. NAVAL OPERATIONS
  // ═══════════════════════════════════════
  {
    slug: 'operation-trident',
    category: 'operations',
    sub_category: 'navy',
    title: 'Operation Trident (1971)',
    summary: 'India\'s daring missile boat attack on Karachi harbour on the night of 4–5 December 1971 — the first use of anti-ship missiles in combat in Asia. Three Indian missile boats attacked and destroyed Pakistani vessels and the Keamari oil storage facility in Karachi, setting it ablaze for over a week.',
    timeline: '4–5 December 1971',
    key_facts: [
      'Three INS Nipat, INS Nirghat, and INS Veer (Vidyut-class missile boats) launched the operation',
      'P-15 Termit (Styx) anti-ship missiles used — first combat use of anti-ship missiles in Asia',
      'PNS Khyber (destroyer) and PNS Muhafiz (minesweeper) sunk; PNS Shah Jahan damaged',
      'Keamari oil tanks hit — fuel burned for over a week; 10,000+ tonnes of oil destroyed',
      'India suffered zero casualties in the operation',
      'Karachi harbour was closed for days; Pakistan\'s naval confidence shattered',
      '4–5 December is celebrated as Navy Day in India annually',
      'Operation Python followed on 8–9 December 1971 to reinforce the attack'
    ],
    outcome: 'Complete tactical success. Pakistan\'s Karachi port severely damaged. Oil supplies disrupted. Pakistani Navy demoralized. Led Pakistan to keep its major surface ships in harbour for the rest of the war.',
    significance: 'Demonstrated the devastating effectiveness of missile boats against conventional surface ships. Changed naval warfare thinking globally. Established the Indian Navy as a capable offensive force. Led to India\'s expanded investment in missile boat fleets.',
    countries_supporting_india: JSON.stringify([]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-talwar',
    category: 'operations',
    sub_category: 'navy',
    title: 'Operation Talwar (1999)',
    summary: 'Indian Navy\'s covert naval deployment during the Kargil War (1999). The Navy positioned its Eastern and Western fleets in the Arabian Sea to intercept Pakistani naval movements and, critically, to threaten Pakistan\'s oil supply lines and economic shipping — creating powerful deterrence against Pakistani escalation.',
    timeline: 'May – July 1999',
    key_facts: [
      'Indian Navy\'s Eastern Fleet moved to Arabian Sea — unusual and unprecedented move',
      'Combined fleet deployed in the Arabian Sea constituted a maritime blockade threat on Pakistan',
      'Pakistani fuel imports and commercial shipping threatened — Pakistan imports 70%+ of oil by sea',
      'Operation was conducted under strict secrecy; not publicly acknowledged until years later',
      'Naval pressure was one factor that convinced Pakistan to de-escalate and withdraw from Kargil',
      'India positioned submarines to shadow Pakistani naval vessels',
      'The deployment was coordinated with ongoing Operation Vijay (Army) and Operation Safed Sagar (IAF)'
    ],
    outcome: 'Deterrence success. Pakistan\'s naval activity curtailed. The threat to Pakistan\'s economic lifeline (oil imports via sea) added significant pressure to the Kargil withdrawal decision. India suffered zero naval casualties.',
    significance: 'Demonstrated the strategic use of naval power as an instrument of coercive diplomacy. First time the Indian Navy\'s combined fleet deployed as a strategic deterrent in a limited conflict. Shaped India\'s concept of maritime escalation dominance.',
    countries_supporting_india: JSON.stringify([]),
    countries_supporting_opponent: JSON.stringify([])
  },

  // ═══════════════════════════════════════
  // E. HUMANITARIAN & EVACUATION OPS
  // ═══════════════════════════════════════
  {
    slug: 'operation-ganga-2022',
    category: 'humanitarian',
    sub_category: 'evacuation',
    title: 'Operation Ganga (2022)',
    summary: 'India\'s evacuation operation to rescue Indian nationals (mainly medical students) stranded in Ukraine after Russia\'s invasion on 24 February 2022. India flew 90+ flights and evacuated 22,500+ Indian nationals from Ukraine and neighbouring countries within 10 days.',
    timeline: '26 February – 11 March 2022',
    key_facts: [
      '22,500+ Indian nationals evacuated — 18,000 of whom were medical students in Ukraine',
      '90+ special evacuation flights operated by Air India, IndiGo, and other carriers',
      'Four Union Ministers deployed to Poland, Hungary, Slovakia, and Romania to coordinate evacuation',
      'Indian students initially stranded at Pisochyn with no transport to the border during shelling',
      'Train routes and buses organized after ground-level diplomatic coordination',
      'PM Modi personally called Presidents Putin and Zelensky requesting safe corridors for Indians',
      'Some Indian students walked 20-40 km in freezing temperatures to reach the border',
      'Indian nationals from other countries (Pakistan, Nepal, Sri Lanka) also helped due to Indian coordination'
    ],
    outcome: 'Successful evacuation of 22,500+ Indians within 10 days of the invasion. India\'s diplomatic balance — talking to both Russia and Ukraine simultaneously — enabled evacuation logistics.',
    significance: 'Demonstrated India\'s growing capacity for large-scale overseas evacuation. Highlighted the presence of 18,000+ Indian students in Ukraine due to affordable MBBS programmes. Led to stricter regulation of overseas medical education by India. Showcased India\'s "whole-of-government" approach to citizen safety abroad.',
    countries_supporting_india: JSON.stringify([
      { country: 'Ukraine', support: 'Safe corridors granted after PM Modi\'s personal intervention with President Zelensky' },
      { country: 'Poland, Hungary, Slovakia, Romania', support: 'Opened borders and provided shelter to Indian evacuees' },
      { country: 'Russia', support: 'Putin responded to Modi\'s request by calling for humanitarian corridors' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-kaveri-2023',
    category: 'humanitarian',
    sub_category: 'evacuation',
    title: 'Operation Kaveri (2023)',
    summary: 'India\'s evacuation operation to rescue Indian nationals from Sudan after the outbreak of fighting between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF) on 15 April 2023. Indian Naval ships and IAF aircraft evacuated 3,000+ Indians from Port Sudan.',
    timeline: 'April – May 2023',
    key_facts: [
      '3,862 Indian nationals evacuated from Sudan',
      'Indian Navy deployed INS Sumedha, INS Tarkash, and INS Shakti to Port Sudan',
      'IAF C-130J aircraft operated from Jeddah (Saudi Arabia) to ferry Indians out',
      'India coordinated with Saudi Arabia, which allowed Indian Navy ships to refuel at Jeddah',
      'Operation conducted under active conflict — naval evacuation under fire threat',
      'Nationals from 18 countries also evacuated by Indian ships as humanitarian gesture',
      'Operation completed in 3 weeks covering multiple sea and air routes'
    ],
    outcome: 'Successful evacuation of 3,862 Indians. India earned global recognition for evacuating nationals from multiple countries. Sudan conflict continued but Indian presence reduced to diplomatic mission only.',
    significance: 'Part of India\'s growing "Neighbourhood First" and humanitarian power projection. Demonstrated Indian Navy\'s ability to conduct non-combatant evacuation operations (NEO) in active conflict zones at distance.',
    countries_supporting_india: JSON.stringify([
      { country: 'Saudi Arabia', support: 'Port and refuelling access at Jeddah; diplomatic coordination' },
      { country: 'Saudi Arabia, Egypt, UAE', support: 'Transit and shelter for Indian evacuees' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-devi-shakti-2021',
    category: 'humanitarian',
    sub_category: 'evacuation',
    title: 'Operation Devi Shakti (2021)',
    summary: 'India\'s evacuation operation to rescue Indian nationals and Afghan Sikhs and Hindus from Afghanistan after the Taliban takeover of Kabul on 15 August 2021. India operated multiple IAF C-17 flights from Kabul\'s Hamid Karzai International Airport under extremely dangerous and chaotic conditions.',
    timeline: '15–28 August 2021',
    key_facts: [
      '800+ Indian nationals evacuated from Kabul',
      '168 Afghan Hindus and Sikhs also evacuated to India',
      'IAF C-17 Globemaster III transported evacuees from Kabul to Hindon (Ghaziabad)',
      'Indian Embassy shut down operations and Ambassador evacuated on 17 August 2021',
      'Taliban gave India safe conduct assurances for evacuation flights',
      'Multiple flight attempts were halted due to chaos at Kabul airport — mob on runways',
      'Indian government coordinated closely with the US military controlling the airport perimeter'
    ],
    outcome: 'Partial success — India evacuated its key diplomatic staff and some nationals. Many Indian-origin people and Afghan nationals wanting to come to India could not be evacuated due to airport chaos.',
    significance: 'Forced India to recalibrate its Afghanistan policy. India subsequently engaged the Taliban diplomatically to protect its strategic interests. The evacuation of Afghan Sikhs and Hindus was a humanitarian and soft power success.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'Controlled airport perimeter; coordinated with Indian forces for safe passage' },
      { country: 'Taliban', support: 'Issued safe conduct assurances for Indian evacuation flights' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-ajay-2023',
    category: 'humanitarian',
    sub_category: 'evacuation',
    title: 'Operation Ajay (2023)',
    summary: 'India\'s evacuation operation to bring back Indian nationals from Israel after the Hamas terror attack on 7 October 2023 and the subsequent Israeli military operation in Gaza. Special flights were operated to evacuate Indian nationals who wished to return.',
    timeline: 'October 2023',
    key_facts: [
      'Hamas launched massive surprise attack on Israel on 7 October 2023 — 1,200 Israelis killed, 250 taken hostage',
      'India operated special Air India and IndiGo flights from Tel Aviv to Indian cities',
      '~1,500 Indian nationals evacuated in the first phase',
      '18,000+ Indians live and work in Israel including 12,000 caregivers',
      'India strongly condemned the Hamas terrorist attack — rare unambiguous statement',
      'India maintained balanced position — condemning Hamas while calling for civilian protection in Gaza',
      'PM Modi was one of the first world leaders to call PM Netanyahu after the attack'
    ],
    outcome: 'Successful evacuation of willing returnees. Many Indians (particularly caregivers) chose to stay in Israel. Indian diplomatic position — firmly against terrorism while supporting humanitarian ceasefire — strengthened its credibility globally.',
    significance: 'Showcased India\'s rapid response evacuation capability. India\'s firm condemnation of Hamas terrorism strengthened its anti-terrorism credentials. The balanced diplomatic position demonstrated India\'s "strategic autonomy" in action.',
    countries_supporting_india: JSON.stringify([
      { country: 'Israel', support: 'Ben Gurion airport operational for evacuation flights; Israeli coordination with Indian Embassy' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'operation-rahat-2015',
    category: 'humanitarian',
    sub_category: 'evacuation',
    title: 'Operation Rahat (2015)',
    summary: 'India\'s largest-ever overseas evacuation, rescuing 5,600+ Indian nationals from war-torn Yemen after the Saudi-led coalition began airstrikes on 25 March 2015. Indian Navy ships and IAF aircraft conducted the operation from Djibouti and Aden in extremely dangerous conditions.',
    timeline: 'March–April 2015',
    key_facts: [
      '5,600+ Indians evacuated from Yemen — including nationals of 48 other countries',
      'INS Mumbai, INS Sumitra, INS Tarasa deployed for naval evacuation from Aden',
      'IAF IL-76 and C-17 aircraft used for airlift from Djibouti',
      'Indian ships operated in an active war zone — Houthi missiles and Saudi airstrikes ongoing',
      'Nationals from 48 other countries (including Pakistan, Germany, France, Ireland) evacuated by India',
      'Saudi Arabia gave India specific information about ceasefire windows to conduct the evacuation',
      'Largest Indian overseas evacuation at the time — surpassed later by Operation Ganga (2022)'
    ],
    outcome: 'Complete success — 5,600+ Indians brought back safely. India\'s ability to evacuate its citizens from a live war zone under fire was demonstrated. International community praised India\'s humanitarian role.',
    significance: 'Established India as a "first responder" and a nation capable of large-scale overseas humanitarian operations. The evacuation of 48 nationalities demonstrated India\'s soft power. Led to upgrades in India\'s overseas evacuation planning and asset prepositioning.',
    countries_supporting_india: JSON.stringify([
      { country: 'Saudi Arabia', support: 'Provided ceasefire windows and airspace clearance for Indian evacuation' },
      { country: 'Djibouti', support: 'Provided basing access for Indian IAF aircraft' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },

  // ═══════════════════════════════════════
  // F. DEFENCE PROGRAMS & WEAPONS
  // ═══════════════════════════════════════
  {
    slug: 'brahmos-missile',
    category: 'defence_programs',
    sub_category: 'missile',
    title: 'BrahMos Supersonic Cruise Missile',
    summary: 'BrahMos is the world\'s fastest operational supersonic cruise missile, jointly developed by India (DRDO) and Russia (NPO Mashinostroyeniya) under a joint venture BrahMos Aerospace. It travels at Mach 2.8–3.0, has a range of 290–500 km, and can be launched from land, sea, submarine, and air platforms.',
    timeline: 'Joint venture established 1998; first test June 2001; inducted into service 2006',
    key_facts: [
      'BrahMos = Brahmaputra (India) + Moskva (Russia) — joint venture symbol',
      'Speed: Mach 2.8–3.0 (nearly 3x the speed of sound)',
      'Range: 290 km (original); extended to 400 km+ for export and 500 km for deep strike variants',
      'Can be launched from: ships, submarines, ground mobile launchers, and Sukhoi Su-30MKI jets',
      'Air-launched BrahMos from Su-30MKI (2019) — India\'s most lethal air-launched weapon',
      'BrahMos-NG (Next Generation): Mach 3.5, lighter, for submarines and smaller ships',
      'Export breakthrough: Philippines became first foreign buyer in 2022 (₹2,671 crore deal)',
      'Potential buyers: Indonesia, Vietnam, UAE, Saudi Arabia, Egypt, Argentina'
    ],
    outcome: 'Fully operational across Indian Army (land), Navy (sea), and Air Force (air-launched). Provides India with the most lethal conventional precision-strike capability in Asia. Export programme launched — becoming India\'s flagship defence export product.',
    significance: 'BrahMos represents India\'s most significant indigenous-joint weapons success. Its speed makes it nearly impossible to intercept with current air defence systems. A potent deterrent against both Pakistan and China. The export programme positions India as a major arms exporter and deepens strategic partnerships.',
    countries_supporting_india: JSON.stringify([
      { country: 'Russia', support: 'Co-developer and manufacturer (50-50 joint venture); provides ramjet technology and guidance systems' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'tejas-lca',
    category: 'defence_programs',
    sub_category: 'aircraft',
    title: 'Tejas Light Combat Aircraft (LCA)',
    summary: 'Tejas is India\'s indigenously developed single-engine, multirole, supersonic light combat aircraft developed by HAL (Hindustan Aeronautics Limited) and DRDO\'s ADA (Aeronautical Development Agency). It is India\'s first home-built fighter jet to achieve full operational clearance and is now being exported.',
    timeline: 'Development started 1983; first flight 2001; inducted into IAF as Mk1 (2016)',
    key_facts: [
      'Tejas Mk1: Single engine, delta wing, fly-by-wire, Mach 1.8 top speed, 3,000 km range',
      'Powered by GE F404-IN20 engine (US-made) — Kaveri engine development ongoing',
      'IAF ordered 83 Tejas Mk1A (advanced variant) in February 2021 — ₹48,000 crore deal',
      'Tejas Mk2 (Medium Weight Fighter): heavier, GE F414 engine, longer range, in development',
      'Tejas inducted into No. 45 Squadron "Flying Daggers" and No. 18 Squadron "Flying Bullets" IAF',
      'AESA radar, BVR missiles (Derby, Python, Astra) integration underway for Mk1A',
      'Export deal with Malaysia in progress; Argentina expressed strong interest (2023)',
      'LCA Navy variant under development for INS Vikrant aircraft carrier'
    ],
    outcome: 'Operationally inducted into IAF. Production ramping up at HAL Nashik. Mk1A deliveries beginning 2024. Export breakthrough imminent. Mk2 to significantly enhance India\'s air power from 2028+.',
    significance: 'India\'s biggest step toward defence self-reliance in aviation. Reduces dependence on Russian aircraft. Creates a domestic aerospace industrial base. The Tejas programme, despite decades of delays, has established India as a nation capable of designing, developing, and manufacturing fighter aircraft — a capability held by only 5 nations in the world.',
    countries_supporting_india: JSON.stringify([
      { country: 'United States', support: 'GE F404 and F414 engines; avionics technology; radar systems' },
      { country: 'Israel', support: 'EL/M-2032 radar for Mk1; DASH helmet-mounted display; Derby and Python missiles' },
      { country: 'France', support: 'Martin-Baker ejection seats; avionics subsystems' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'agni-missile-series',
    category: 'defence_programs',
    sub_category: 'missile',
    title: 'Agni Ballistic Missile Series',
    summary: 'The Agni series is India\'s family of long-range ballistic missiles developed by DRDO, forming the core of India\'s strategic nuclear deterrent. The series ranges from Agni-I (700 km range) to Agni-V (5,000+ km, ICBM-class), ensuring India can hold any target in China or Pakistan at risk.',
    timeline: 'Agni-I first tested 1989; Agni-V (ICBM class) first tested 2012',
    key_facts: [
      'Agni-I: Range 700–1,200 km; solid fuel; can reach all of Pakistan',
      'Agni-II: Range 2,000–3,500 km; solid fuel; can reach central China',
      'Agni-III: Range 3,500–5,000 km; can reach Beijing and all Chinese cities',
      'Agni-IV: Range 4,000+ km; lighter, faster deployment',
      'Agni-V: Range 5,000–8,000 km; ICBM-class; MIRV capability being tested; can reach Europe',
      'Agni-VI: In development — range 8,000–12,000 km; MIRV (Multiple Independently targetable Reentry Vehicles)',
      'Agni-P (Prime): New-generation 1,000–2,000 km range; advanced propulsion and guidance',
      'India\'s nuclear doctrine: No First Use (NFU) + Credible Minimum Deterrence'
    ],
    outcome: 'India maintains a credible nuclear triad (land, sea, air). Agni missiles are operationally deployed with Strategic Forces Command. India can credibly deter both Pakistan and China simultaneously with Agni series.',
    significance: 'The Agni series makes India a genuine multi-target nuclear power. Agni-V\'s range means no location in China is safe from Indian retaliation — deterring Chinese nuclear coercion. Combined with INS Arihant (submarine), India has a survivable second-strike capability. MIRV development will further strengthen deterrence.',
    countries_supporting_india: JSON.stringify([
      { country: 'India (DRDO)', support: 'Entirely indigenous development — major achievement of self-reliance' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'akash-missile',
    category: 'defence_programs',
    sub_category: 'missile',
    title: 'Akash Surface-to-Air Missile (SAM)',
    summary: 'Akash is India\'s indigenously developed medium-range surface-to-air missile system, developed by DRDO under the Integrated Guided Missile Development Programme (IGMDP). It provides India with a homegrown alternative to imported air defence systems and has achieved multiple export sales.',
    timeline: 'Development started 1990; production from 2007; inducted 2009 (Army), 2014 (IAF)',
    key_facts: [
      'Range: 25–30 km; altitude: up to 18 km; speed: Mach 2.5',
      'Can engage multiple targets simultaneously — radar and guidance system handles 12 targets',
      'Akash-NG (Next Generation): longer range (70+ km), improved guidance, AESA radar',
      'Akash-1S: enhanced seeker for precision targeting',
      'Indigenisation level: 96% — one of India\'s most self-reliant systems',
      'Export deal with Armenia (2022) — ₹2,000+ crore; first Akash export',
      'Brazil, Egypt, Vietnam, UAE are potential buyers',
      'Cost: ~₹25 crore per missile vs ₹700 crore for comparable Western systems'
    ],
    outcome: 'Fully operational with Indian Army and IAF. Multiple batteries deployed on northern and western borders. Armenia deal completed India\'s first major SAM export.',
    significance: 'Akash demonstrates India\'s capacity to manufacture world-class air defence systems domestically. Its export success validates Indian defence manufacturing. Dramatically reduces India\'s dependence on imported air defence (reducing vulnerability to US sanctions or arms embargos). The Akash ecosystem supports Make in India in defence.',
    countries_supporting_india: JSON.stringify([
      { country: 'India (DRDO + Bharat Dynamics + HAL)', support: 'Entirely indigenous development and production' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'ins-vikrant',
    category: 'defence_programs',
    sub_category: 'naval',
    title: 'INS Vikrant (IAC-1) — India\'s Indigenous Aircraft Carrier',
    summary: 'INS Vikrant is India\'s first indigenously built aircraft carrier, commissioned on 2 September 2022 by PM Modi at Cochin Shipyard. It is the largest warship ever built in India and places India in the elite club of nations capable of designing and building aircraft carriers.',
    timeline: 'Construction began 2009; launched 2013; commissioned 2 September 2022',
    key_facts: [
      'Displacement: 45,000 tonnes; Length: 262 metres; Width: 62 metres',
      'Powered by 4 GE LM2500+ gas turbines; speed: 28 knots',
      'Can carry 30 aircraft: MiG-29K fighters, Kamov Ka-31 helicopters, MH-60R Seahawk helicopters',
      'Short Take-Off But Arrested Recovery (STOBAR) system — ski-jump launch, arrestor wire landing',
      'LCA (Navy) Tejas variant planned to replace MiG-29K by 2030',
      'Took 13 years to build; cost ₹20,000 crore',
      'Named after the original INS Vikrant (1961–1997) which blockaded East Pakistan in 1971',
      '76% indigenous content — hull, propulsion, combat management system all made in India'
    ],
    outcome: 'Commissioned and undergoing sea trials and aircraft integration. Full operational capacity expected by 2025–26. India now has two aircraft carriers (INS Vikramaditya + INS Vikrant) — among very few nations with such capability.',
    significance: 'India joins USA, UK, Russia, France, and China as nations capable of building aircraft carriers. INS Vikrant extends India\'s power projection into the Indian Ocean, Arabian Sea, and Bay of Bengal. Establishes India as a genuine blue-water navy. Complicates Chinese naval planning in the Indian Ocean. A massive symbol of Make in India success.',
    countries_supporting_india: JSON.stringify([
      { country: 'Russia', support: 'MiG-29K aircraft for the carrier; advisory support on carrier operations' },
      { country: 'United States', support: 'GE LM2500 gas turbines; MH-60R Seahawk helicopters for carrier air wing' },
      { country: 'Israel', support: 'Barak-8 / MF-STAR naval air defence radar system' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'ins-arihant',
    category: 'defence_programs',
    sub_category: 'naval',
    title: 'INS Arihant — India\'s Nuclear Submarine',
    summary: 'INS Arihant is India\'s first indigenously built nuclear-powered ballistic missile submarine (SSBN), completing India\'s nuclear triad. It can carry K-15 Sagarika or K-4 submarine-launched ballistic missiles (SLBMs). A second submarine, INS Arighat, was commissioned in 2024. India is the sixth nation to operate an SSBN.',
    timeline: 'Construction started 1998; launched July 2009; commissioned August 2016',
    key_facts: [
      'Displacement: 6,000 tonnes; length: 112 metres',
      'Nuclear reactor: 83 MW pressurized water reactor (PWR)',
      'Missiles: K-15 Sagarika (750 km range) or K-4 SLBM (3,500 km range)',
      'Can carry 12 K-15 missiles or 4 K-4 missiles',
      'India is the 6th nation to build an indigenous SSBN (after USA, USSR/Russia, UK, France, China)',
      'INS Arighat (S3) commissioned in 2024 — larger, can carry K-4 missiles',
      'Two more SSBNs (S4 and S4*) under construction — larger, 8,000+ tonne class',
      'PM Modi declared in 2018: "India\'s nuclear triad is now complete"'
    ],
    outcome: 'India\'s nuclear triad is complete — land (Agni missiles), air (Mirage 2000, Rafale), sea (Arihant-class SSBNs). A survivable second-strike capability that deters any nuclear first strike against India.',
    significance: 'The most significant strategic achievement in India\'s defence history after the nuclear tests. A submarine-based deterrent is survivable — the enemy cannot disarm India in a first strike. India can now credibly threaten assured nuclear retaliation against both Pakistan and China from an underwater platform that is virtually undetectable. Completes India\'s strategic deterrence architecture.',
    countries_supporting_india: JSON.stringify([
      { country: 'Russia', support: 'Technical assistance for the nuclear reactor; crew training; classified cooperation under 1998 agreement' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 's400-triumf',
    category: 'defence_programs',
    sub_category: 'air_defence',
    title: 'S-400 Triumf Air Defence System',
    summary: 'India signed a ₹40,000 crore (USD 5.43 billion) deal with Russia in October 2018 to procure 5 S-400 Triumf air defence missile squadrons. The S-400 is the world\'s most advanced air defence system, capable of engaging stealth aircraft, ballistic missiles, and cruise missiles simultaneously.',
    timeline: 'Deal signed October 2018; first delivery December 2021; induction January 2022',
    key_facts: [
      'Range: 400 km (long-range); 250 km (medium-range); 120 km (short-range); 40 km (cruise missiles)',
      'Can track 100 targets and engage 36 simultaneously',
      'Effective against stealth aircraft, UAVs, ballistic missiles, and cruise missiles',
      'India became only the 2nd country after China to buy S-400 despite US CAATSA sanctions threat',
      'US waived CAATSA sanctions on India — recognizing strategic importance of India-US partnership',
      'Deliveries: 1st squadron operational in Punjab sector (facing Pakistan); 2nd in Eastern sector (facing China)',
      '5 squadrons to be delivered by 2025 — covers all of India\'s most threatened sectors',
      'China bought S-400 earlier in 2014 — India\'s purchase neutralizes Chinese air dominance'
    ],
    outcome: 'Two squadrons operational; remaining three being delivered. India\'s airspace defence dramatically improved. S-400 can engage Chinese stealth fighter J-20 and Pakistani F-16s before they can fire their own missiles.',
    significance: 'S-400 transforms India\'s air defence architecture. Covers vast areas from single launch positions. A strong deterrent to both Pakistani and Chinese air forces. India\'s decision to buy S-400 despite US CAATSA sanctions threat demonstrated strategic autonomy and the strength of India-Russia partnership in defence.',
    countries_supporting_india: JSON.stringify([
      { country: 'Russia', support: 'Manufacturer, seller, and trainer — complete systems with full technology transfer for maintenance' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'pinaka-rocket-system',
    category: 'defence_programs',
    sub_category: 'artillery',
    title: 'Pinaka Multi-Barrel Rocket Launcher (MBRL)',
    summary: 'Pinaka is India\'s indigenously developed multi-barrel rocket launcher system (MBRL) developed by DRDO. It can fire 12 rockets in 44 seconds, saturating a target area of 3.9 km². Pinaka was successfully used during the Kargil War and is being exported internationally.',
    timeline: 'Development started 1986; first operational use Kargil War (1999); Mk-II inducted 2014',
    key_facts: [
      'Pinaka Mk-I: Range 38–40 km; 12 rockets fired in 44 seconds',
      'Pinaka Mk-II (Enhanced): Range 60–90 km; GPS-guided for precision',
      'Pinaka Mk-II ER (Extended Range): Range 75–120 km',
      'Area saturation: one battery (6 launchers) covers 3.9 km² in 44 seconds',
      'Successfully used in Kargil War (1999) against Pakistani positions on Tiger Hill and Tololing',
      'India\'s largest artillery modernization: 6 regiments operational; 22 more being ordered',
      'Export deal: Armenia ordered Pinaka systems (2022–23) — ₹2,000+ crore deal',
      'Guided Pinaka uses navigation system similar to Pralay quasi-ballistic missile'
    ],
    outcome: 'Fully operational with Indian Army. Being exported. Mk-II production ramping up. The system provides India with rapid area saturation artillery capability rivalling Russian Smerch and Chinese WS-35.',
    significance: 'Pinaka is India\'s most successful artillery success story. Its combat proven status (Kargil 1999) and increasing export orders validate Indian defence manufacturing quality. Provides India with standoff rocket artillery to destroy Pakistan and Chinese troop concentrations and logistics hubs.',
    countries_supporting_india: JSON.stringify([
      { country: 'India (DRDO + Tata Advanced Systems + L&T)', support: 'Entirely indigenously developed and manufactured' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },
  {
    slug: 'arjun-main-battle-tank',
    category: 'defence_programs',
    sub_category: 'armour',
    title: 'Arjun Main Battle Tank (MBT)',
    summary: 'Arjun is India\'s indigenously developed main battle tank, developed by DRDO\'s CVRDE (Combat Vehicles Research and Development Establishment). Despite decades of development challenges, the Arjun has proven its capabilities in trials and is operational with two regiments of the Indian Army.',
    timeline: 'Development started 1974; first prototype 1984; inducted 2004 (Mk1), 2021 (Mk1A)',
    key_facts: [
      'Weight: 68.5 tonnes (one of the heaviest MBTs in the world)',
      'Main gun: 120mm rifled gun; fires fin-stabilised armour-piercing, HESH, and anti-tank guided missiles',
      'Engine: MTU 838 Ka-501 diesel (German) — 1,400 HP',
      'Armour: Kanchan composite armour (India\'s own composite ceramic-metal armour)',
      'Arjun Mk1A: 72 improvements including LAHAT missile-firing capability, explosive reactive armour (ERA)',
      'Indian Army operates 2 Arjun regiments (124 Mk1 + 118 Mk1A on order)',
      'Arjun outperformed T-72 and T-90 in comparative trials (2010, 2012)',
      'Issues: weight too heavy for many bridges; unsuitable for high-altitude deployment'
    ],
    outcome: 'Two regiments operational in Rajasthan (desert warfare terrain). Mk1A production ongoing. Future Arjun Mk2 in development with reduced weight target and indigenous engine.',
    significance: 'Arjun represents India\'s most challenging but ultimately partially successful armour development. Kanchan armour is India\'s own classified composite armour. Despite delays and Army preference for Russian T-90, Arjun establishes India\'s armour design capability. Future variants with indigenous engine and lighter weight could finally satisfy Army requirements.',
    countries_supporting_india: JSON.stringify([
      { country: 'Germany', support: 'MTU diesel engine (licensed production in India by L&T/BEML)' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  },

  // ═══════════════════════════════════════
  // G. UN MISSIONS
  // ═══════════════════════════════════════
  {
    slug: 'india-un-peacekeeping',
    category: 'un_missions',
    sub_category: 'general',
    title: 'India\'s United Nations Peacekeeping Missions',
    summary: 'India is one of the largest contributors to United Nations peacekeeping operations in history, having deployed over 260,000 troops to 50+ missions since 1950. India has lost more soldiers in UN peacekeeping than any other nation. Current deployments include Congo (MONUSCO), South Sudan (UNMISS), Lebanon (UNIFIL), and Somalia (EUTM).',
    timeline: '1950 – Present (ongoing)',
    key_facts: [
      'India has contributed 260,000+ troops to 50+ UN missions — most of any nation in history',
      'India has lost 170+ soldiers in UN peacekeeping — highest absolute number',
      'First deployment: Korea (1950) — as medical corps non-combatant',
      'Congo (1960–64): India deployed the largest national contingent (6,000 troops) in the first major UN mission',
      'Major General DSS Bakshi (Indian Army) killed in action in Congo — one of India\'s most decorated peacekeepers',
      'India has contributed female peacekeepers since 2007 (Liberia) — largest all-female formed police unit',
      'Current missions: MONUSCO (Congo — 1,700+ troops), UNMISS (South Sudan — 2,400+ troops), UNIFIL (Lebanon — 900 troops)',
      'India advocates for greater representation of troop-contributing countries in UN decision-making'
    ],
    outcome: 'Ongoing. India is consistently one of the top 5 troop contributors to UN peacekeeping globally. India\'s reputation as a reliable, professional peacekeeping force has strengthened its diplomatic standing globally.',
    significance: 'India\'s peacekeeping record builds enormous international goodwill, diplomatic leverage, and soft power. It demonstrates India\'s commitment to multilateralism. The experience has given Indian Army officers unparalleled operational exposure. It supports India\'s campaign for a permanent UNSC seat by demonstrating global responsibility.',
    countries_supporting_india: JSON.stringify([
      { country: 'United Nations', support: 'Mission mandates, funding reimbursement, and command structures provided by UN' }
    ]),
    countries_supporting_opponent: JSON.stringify([])
  }
];

async function seedDatabase() {
  console.log(`\n🌱 Starting DefenceAI Knowledge Base Seeding...\n`);
  console.log(`📦 Total records to insert: ${KNOWLEDGE_DATA.length}`);
  console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of KNOWLEDGE_DATA) {
    try {
      const { error } = await supabase
        .from('defence_knowledge')
        .upsert({
          slug: item.slug,
          category: item.category,
          sub_category: item.sub_category,
          title: item.title,
          summary: item.summary,
          timeline: item.timeline,
          key_facts: item.key_facts,
          outcome: item.outcome,
          significance: item.significance,
          countries_supporting_india: item.countries_supporting_india,
          countries_supporting_opponent: item.countries_supporting_opponent,
        }, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Failed: ${item.title} — ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Seeded: ${item.title}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Error: ${item.title} — ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n════════════════════════════════════`);
  console.log(`✅ Success: ${successCount} records`);
  console.log(`❌ Errors:  ${errorCount} records`);
  console.log(`════════════════════════════════════\n`);

  if (errorCount > 0) {
    console.log(`⚠️  Some records failed. Check Supabase logs.`);
    process.exit(1);
  } else {
    console.log(`🎉 Database seeded successfully!`);
    process.exit(0);
  }
}

seedDatabase();
