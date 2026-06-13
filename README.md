# 🛡️ DefenceAI

> **Your Command Centre for Defence, Geopolitics, and Strategic Intelligence.**

**DefenceAI** is a comprehensive, AI-powered platform designed to provide real-time intelligence, current affairs, and historical data regarding defence, global geopolitics, military technology, and sports. 

Built with a highly optimized architecture, DefenceAI seamlessly blends static historical databases with dynamic, daily-updated AI analysis to deliver military-grade insights through a distraction-free, tactical dark-green interface.

*Founded by Praveen Yadav.*

---

## 🌟 Key Features

### 🤖 Intelligent Chat & Search
At the heart of the platform is an advanced AI engine trained strictly for defence and political affairs. Users can ask complex questions about global security, military doctrines, or border disputes, and receive accurate, concise, and structured responses containing direct answers, historical context, and geopolitical significance.

### 📰 Daily Intelligence Feed
The platform features a daily-updated, curated news feed separated into **National** and **International** defence news. Each news card provides a summary alongside a detailed, deeply analytical breakdown of the geopolitical implications.

### ⚔️ Post-1947 War Archive
A complete, chronological database of Indian military conflicts since independence (1947–Present). This includes:
- Root causes and historical background
- Key battles and operations
- International alliances (Pro-India vs. Pro-Opponent)
- Casualties and long-term strategic significance

### 🤖 AI & Modern Warfare Updates
A dedicated section tracking the rapidly evolving landscape of military technology, including drone warfare, hypersonic missiles, electronic warfare, and space defence.

### 🏆 Sports News
A daily digest of top sports news and achievements, ensuring users stay updated on major athletic milestones globally.

---

## 🛠️ Technical Architecture

DefenceAI is built as a highly performant Single Page Application (SPA) with a robust Express.js backend.

### Frontend
- **Pure Vanilla JS, HTML, and CSS**: No bloated frameworks. 
- **Tactical UI/UX**: Custom-designed "Army Combat Dress" theme utilizing deep forest greens, olive drab accents, and tactical khaki text for maximum readability.
- **Optimized Loading**: Sections are lazy-loaded only when navigated to, utilizing skeleton loaders for a smooth user experience.
- **Responsive Layout**: Features a fixed, collapsible sidebar and an independently scrollable main content area that works flawlessly on mobile and desktop.

### Backend & Optimization
- **Express.js Server**: Acts as a secure proxy and data provider.
- **Daily In-Memory Caching**: To ensure lightning-fast load times and minimal external requests, the backend fetches and generates daily intelligence (News, Sports, Tech) exactly **once per day** (at 6:00 AM) and serves this cached data from memory to all users for the rest of the day.
- **Zero-Latency Archives**: The entire War Archive is served via a static JSON structure directly from the server, requiring zero external processing.

---

## 🚀 Running the Project Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Praveen04120/DefenceAI.git
   cd DefenceAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your AI Engine API key:
   ```env
   API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   # Or using node: node server.js
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

---

## 👨‍💻 Founder

**Praveen Yadav**  
Founder & Lead Developer, DefenceAI

---

## 📄 License

This project is proprietary. All rights reserved.
