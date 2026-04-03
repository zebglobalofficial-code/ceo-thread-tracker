"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "ceo-threads-v3";

const PRELOADED = [
  { url: "https://x.com/superagent/status/2016186940534436278", sharedAt: "29 Jan 2026" },
  { url: "https://x.com/bnj/status/2016595100714095039", sharedAt: "29 Jan 2026" },
  { url: "https://x.com/pipelineabuser/status/2017316778351947814", sharedAt: "31 Jan 2026" },
  { url: "https://x.com/broadcastgems/status/2019004663333339263", sharedAt: "05 Feb 2026" },
  { url: "https://x.com/charles_seo/status/2020498857369436401", sharedAt: "09 Feb 2026" },
  { url: "https://x.com/kalashbuilds/status/2020426249274064908", sharedAt: "09 Feb 2026" },
  { url: "https://x.com/charles_seo/status/2020748498770034940", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/alexgroberman/status/2021238881795047840", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/freddiexpott/status/2021282530826113422", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/samwoods/status/2022450468329509098", sharedAt: "15 Feb 2026" },
  { url: "https://x.com/damienghader/status/2024134156419018899", sharedAt: "19 Feb 2026" },
  { url: "https://x.com/codyschneiderxx/status/2024532437720760489", sharedAt: "20 Feb 2026" },
  { url: "https://x.com/freddiexpott/status/2024544022346289471", sharedAt: "20 Feb 2026" },
  { url: "https://x.com/draprints/status/2025775065078333535", sharedAt: "23 Feb 2026" },
  { url: "https://x.com/henrylschuck/status/2026443897443070246", sharedAt: "25 Feb 2026" },
  { url: "https://x.com/tibo_maker/status/2027010317960511600", sharedAt: "26 Feb 2026" },
  { url: "https://x.com/codyschneiderxx/status/2027458717126438998", sharedAt: "01 Mar 2026" },
  { url: "https://x.com/techwithashiqur/status/2029789620708491684", sharedAt: "07 Mar 2026" },
  { url: "https://x.com/askperplexity/status/2031103256236274180", sharedAt: "10 Mar 2026" },
  { url: "https://x.com/deryatr_/status/2033193127708615034", sharedAt: "16 Mar 2026" },
  { url: "https://x.com/tibo_maker/status/2033491167338246540", sharedAt: "17 Mar 2026" },
  { url: "https://x.com/curieuxexplorer/status/2034512319770943841", sharedAt: "19 Mar 2026" },
  { url: "https://x.com/ayzacoder/status/2034345485851632105", sharedAt: "19 Mar 2026" },
  { url: "https://x.com/milliemarconnni/status/2034571397901815829", sharedAt: "20 Mar 2026" },
  { url: "https://x.com/hridoyreh/status/2035619991190434284", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/jacobrodri_/status/2035782239792009617", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/oliviacoder1/status/2035622336834199664", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/ehuanglu/status/2036949499898454344", sharedAt: "27 Mar 2026" },
  { url: "https://x.com/realfrankwilder/status/2037282834080252407", sharedAt: "28 Mar 2026" },
  { url: "https://x.com/paolo_scales/status/2038543063073608063", sharedAt: "30 Mar 2026" },
  { url: "https://x.com/charles_seo/status/2038969309645689147", sharedAt: "31 Mar 2026" },
  { url: "https://x.com/levikmunneke/status/2039494797623435745", sharedAt: "02 Apr 2026" },
  { url: "https://x.com/simonecanciello/status/2039449221850423451", sharedAt: "02 Apr 2026" },
];

const TAG_COLORS = {
  "AI & Automation": "bg-purple-100 text-purple-700 border-purple-200",
  "Content & Video": "bg-pink-100 text-pink-700 border-pink-200",
  "SEO & GEO": "bg-green-100 text-green-700 border-green-200",
  "Outbound & Sales": "bg-orange-100 text-orange-700 border-orange-200",
  "Strategy": "bg-blue-100 text-blue-700 border-blue-200",
  "Tools": "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function Spinner({ dark }) {
  return <span className={`inline-block w-4 h-4 border-2 ${dark ? "border-gray-600 border-t-transparent" : "border-white border-t-transparent"} rounded-full animate-spin align-middle mr-1`} />;
}

async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data.text || "";
}

export default function Home() {
  const [threads, setThreads] = useState([]);
  const [view, setView] = useState("dashboard"); // dashboard | detail | patterns | add
  const [selected, setSelected] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState({ current: 0, total: 0 });
  const [patterns, setPatterns] = useState("");
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  const [reply, setReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = (data) => { setThreads(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };

  const analyzeThread = async (thread) => {
    const handle = thread.url.match(/x\.com\/([^/]+)/)?.[1] || "unknown";
    const text = await callClaude(`You are an AI advisor for a marketing head at a B2B tech services company. Their CEO shared this X thread on ${thread.sharedAt}.
URL: ${thread.url}
Author: @${handle}

Based on the author handle and context of a B2B tech marketing team, infer what this thread is likely about.

Reply in EXACT format (no extra text):
TITLE: (5-8 word catchy title for what this thread is about)
TAG: (pick ONE: AI & Automation / Content & Video / SEO & GEO / Outbound & Sales / Strategy / Tools)
INSIGHT: (1-2 sentences - the core insight the CEO wants the team to know)
TAKEAWAY1: (concrete action the marketing team should take)
TAKEAWAY2: (another concrete action)
TAKEAWAY3: (another concrete action)
USE: (1 sentence - how to apply this THIS WEEK)`);
    const g = (key, multi) => {
      const rx = multi ? new RegExp(`${key}:\\s*([\\s\\S]+?)(?=\\n[A-Z]+:|$)`) : new RegExp(`${key}:\\s*(.+)`);
      return text.match(rx)?.[1]?.trim() || "";
    };
    return {
      ...thread,
      title: g("TITLE"),
      tag: g("TAG"),
      insight: g("INSIGHT"),
      takeaways: [g("TAKEAWAY1"), g("TAKEAWAY2"), g("TAKEAWAY3")].filter(Boolean),
      use: g("USE"),
      status: thread.status || "Unread",
    };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const parsed = JSON.parse(raw); setThreads(parsed); return; }
    } catch {}
    // First load - seed unsummarized
    const seeded = PRELOADED.map((p, i) => ({ id: i + 1, ...p, title: "", tag: "", insight: "", takeaways: [], use: "", status: "Unread" }));
    setThreads(seeded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    // Auto-start summarizing
    startSummarizeAll(seeded);
  }, []);

  const startSummarizeAll = async (initial) => {
    const toProcess = (initial || threads).filter(t => !t.insight);
    if (toProcess.length === 0) return;
    setInitializing(true);
    setInitProgress({ current: 0, total: toProcess.length });
    let current = [...(initial || threads)];
    for (let i = 0; i < toProcess.length; i++) {
      setInitProgress({ current: i + 1, total: toProcess.length });
      try {
        const updated = await analyzeThread(toProcess[i]);
        current = current.map(t => t.id === updated.id ? updated : t);
        setThreads([...current]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {}
    }
    setInitializing(false);
    showToast("✅ All threads analyzed!");
  };

  const handlePatterns = async () => {
    setLoadingPatterns(true); setPatterns("");
    const summarized = threads.filter(t => t.insight);
    const list = summarized.map(t => `[${t.sharedAt}] ${t.title} (${t.tag}) — ${t.insight}`).join("\n");
    const r = await callClaude(`You are a strategic advisor. A CEO has been sharing these X threads with his marketing team over several months:

${list}

Analyze and respond with:

🎯 WHAT THE CEO WANTS (2-3 sentences on the CEO's overall message to the marketing team)

🔗 KEY THEMES
- Theme 1: (name + which links relate + what it means)
- Theme 2:
- Theme 3:
- Theme 4:

📈 PATTERN OVER TIME (how the CEO's focus has evolved from Jan to Apr 2026)

⚡ TOP 3 PRIORITY ACTIONS FOR THE MARKETING HEAD RIGHT NOW`);
    setPatterns(r);
    setLoadingPatterns(false);
  };

  const handleReply = async (t) => {
    setLoadingReply(true); setReply("");
    const r = await callClaude(`You are a marketing head replying to your CEO on Microsoft Teams.
Thread: ${t.title}
Shared on: ${t.sharedAt}
Insight: ${t.insight}
How to use: ${t.use}

Write a 3-4 sentence Teams reply that: acknowledges the share warmly, references the specific insight, and states one concrete thing you will do this week based on it. Sound natural and engaged, not corporate.`);
    setReply(r); setLoadingReply(false);
  };

  const updateStatus = (id, status) => {
    const updated = threads.map(t => t.id === id ? { ...t, status } : t);
    save(updated);
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  // Group by tag for dashboard
  const grouped = threads.reduce((acc, t) => {
    const key = t.tag || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const summarizedCount = threads.filter(t => t.insight).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-gray-800">📌 CEO Thread Tracker</h1>
            <p className="text-xs text-gray-400">{summarizedCount}/{threads.length} analyzed</p>
          </div>
          {initializing && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              <Spinner dark />
              <span className="text-xs text-blue-700 font-semibold">Analyzing {initProgress.current}/{initProgress.total}...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!initializing && summarizedCount < threads.length && (
            <button onClick={() => startSummarizeAll()} className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition">✨ Analyze Remaining</button>
          )}
          <button onClick={() => { setView("patterns"); setPatterns(""); }} className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">🔗 CEO Patterns</button>
          <button onClick={() => setView(view === "dashboard" ? "list" : "dashboard")} className="border text-gray-600 text-xs px-3 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
            {view === "dashboard" ? "📋 List" : "🏠 Dashboard"}
          </button>
        </div>
      </div>

      {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}

      {/* DASHBOARD VIEW */}
      {view === "dashboard" && (
        <div className="max-w-5xl mx-auto p-4 mt-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[["🔴", "Unread", threads.filter(t => t.status === "Unread").length, "bg-red-50 border-red-200"],
              ["🟡", "Read", threads.filter(t => t.status === "Read").length, "bg-yellow-50 border-yellow-200"],
              ["🟢", "Actioned", threads.filter(t => t.status === "Actioned").length, "bg-green-50 border-green-200"]
            ].map(([icon, label, count, cls]) => (
              <div key={label} className={`rounded-xl p-3 text-center border ${cls}`}>
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-xs font-semibold text-gray-500">{icon} {label}</div>
              </div>
            ))}
          </div>

          {/* Tree view grouped by theme */}
          {Object.entries(grouped).map(([tag, items]) => (
            <div key={tag} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Theme header */}
              <div className={`px-4 py-3 flex items-center justify-between border-b ${TAG_COLORS[tag] || "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{tag}</span>
                  <span className="text-xs opacity-70">{items.length} threads</span>
                </div>
                <span className="text-xs opacity-60">{items.filter(t => t.insight).length} analyzed</span>
              </div>

              {/* Thread cards in this theme */}
              <div className="divide-y">
                {items.map(t => (
                  <div key={t.id} className="p-4">
                    {/* Thread header - always visible */}
                    <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === "Actioned" ? "bg-green-100 text-green-700" : t.status === "Read" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{t.status}</span>
                          <span className="text-xs text-gray-400">{t.sharedAt}</span>
                        </div>
                        {t.title ? (
                          <p className="font-semibold text-gray-800 text-sm mt-1">📌 {t.title}</p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1 truncate">{t.url}</p>
                        )}
                        {t.insight && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.insight}</p>}
                      </div>
                      <span className="text-gray-400 text-sm mt-1">{expandedId === t.id ? "▲" : "▼"}</span>
                    </div>

                    {/* Expanded detail */}
                    {expandedId === t.id && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all block">{t.url}</a>

                        {t.takeaways?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-700 uppercase mb-2">🎯 Key Takeaways</p>
                            <ul className="space-y-1">
                              {t.takeaways.map((tk, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-blue-400 font-bold">{i+1}.</span>{tk}</li>)}
                            </ul>
                          </div>
                        )}

                        {t.use && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs font-bold text-green-700 uppercase mb-1">🚀 Use This Week</p>
                            <p className="text-sm text-gray-700">{t.use}</p>
                          </div>
                        )}

                        {/* Status + Reply */}
                        <div className="flex gap-2 flex-wrap">
                          {["Unread", "Read", "Actioned"].map(s => (
                            <button key={s} onClick={() => updateStatus(t.id, s)} className={`text-xs px-3 py-1 rounded-lg border font-semibold transition ${t.status === s ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{s}</button>
                          ))}
                          <button onClick={() => { setSelected(t); setView("reply"); setReply(""); handleReply(t); }} className="text-xs px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition ml-auto">💬 Get Reply Draft</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-3">
          {threads.map(t => (
            <div key={t.id} onClick={() => { setSelected(t); setView("reply"); setReply(""); }} className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.status === "Actioned" ? "bg-green-100 text-green-700" : t.status === "Read" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{t.status}</span>
                <span className="text-xs text-gray-400">{t.sharedAt}</span>
              </div>
              {t.title && <p className="font-semibold text-sm text-gray-800">📌 {t.title}</p>}
              {t.tag && <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TAG_COLORS[t.tag] || "bg-gray-100 text-gray-600"}`}>{t.tag}</span>}
              {t.insight && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.insight}</p>}
            </div>
          ))}
        </div>
      )}

      {/* REPLY VIEW */}
      {view === "reply" && selected && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <button onClick={() => setView("dashboard")} className="text-sm text-blue-600 hover:underline">← Back to Dashboard</button>
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <p className="font-bold text-gray-800">📌 {selected.title}</p>
            <p className="text-xs text-gray-400">{selected.sharedAt} · {selected.tag}</p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{selected.insight}</div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-purple-700 uppercase">💬 Teams Reply Draft</p>
                {reply && <button onClick={() => { navigator.clipboard.writeText(reply); showToast("Copied!"); }} className="text-xs text-purple-600 font-semibold hover:underline">Copy</button>}
              </div>
              {loadingReply ? <div className="flex items-center text-sm text-purple-600"><Spinner dark />Generating...</div> : <p className="text-sm text-gray-800 whitespace-pre-wrap">{reply}</p>}
            </div>
            <div className="flex gap-2">
              {["Unread", "Read", "Actioned"].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition ${selected.status === s ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PATTERNS VIEW */}
      {view === "patterns" && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <button onClick={() => setView("dashboard")} className="text-sm text-blue-600 hover:underline">← Back</button>
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">🔗 What is your CEO trying to tell you?</h2>
            <p className="text-sm text-gray-500">AI analysis of all {summarizedCount} threads to find patterns, themes and what your CEO wants you to prioritize.</p>
            {!patterns && (
              <button onClick={handlePatterns} disabled={loadingPatterns || summarizedCount === 0} className="w-full bg-indigo-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
                {loadingPatterns ? <><Spinner />Analyzing all threads...</> : "🔍 Analyze CEO Patterns"}
              </button>
            )}
            {patterns && <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{patterns}</div>}
          </div>
        </div>
      )}
    </div>
  );
}