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

const TAG_STYLES = {
  "AI & Automation":   { dot: "bg-orange-400",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  "Content & Video":   { dot: "bg-pink-400",    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  "SEO & GEO":         { dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "Outbound & Sales":  { dot: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  "Strategy":          { dot: "bg-purple-400",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  "Tools":             { dot: "bg-yellow-400",  badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
};

const STATUS_STYLES = {
  Unread:   "bg-red-500/10 text-red-400 border-red-500/20",
  Read:     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Actioned: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function Spinner() {
  return <span className="inline-block w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin align-middle mr-1.5" />;
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
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState({ current: 0, total: 0 });
  const [patterns, setPatterns] = useState("");
  const [loadingPatterns, setLoadingPatterns] = useState(false);
  const [reply, setReply] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ url: "", sharedAt: "" });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const save = (data) => { setThreads([...data]); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };

  const analyzeThread = async (thread) => {
    const handle = thread.url.match(/x\.com\/([^/]+)/)?.[1] || "unknown";
    const text = await callClaude(`You are an AI advisor for a marketing head at Zeb, a B2B AI transformation services company. Their CEO shared this X thread on ${thread.sharedAt}.
URL: ${thread.url}
Author: @${handle}

Based on the author and Zeb's focus on AI, marketing, automation and B2B tech, infer what this thread is about.

Reply in EXACT format:
TITLE: (5-8 word title)
TAG: (one of: AI & Automation / Content & Video / SEO & GEO / Outbound & Sales / Strategy / Tools)
INSIGHT: (1-2 sentences core insight)
TAKEAWAY1: (specific action for Zeb marketing team)
TAKEAWAY2: (specific action)
TAKEAWAY3: (specific action)
USE: (1 sentence - apply this week)`);
    const g = (key) => text.match(new RegExp(`${key}:\\s*(.+)`))?.[1]?.trim() || "";
    return { ...thread, title: g("TITLE"), tag: g("TAG"), insight: g("INSIGHT"), takeaways: [g("TAKEAWAY1"), g("TAKEAWAY2"), g("TAKEAWAY3")].filter(Boolean), use: g("USE"), status: thread.status || "Unread" };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { setThreads(JSON.parse(raw)); return; }
    } catch {}
    const seeded = PRELOADED.map((p, i) => ({ id: i + 1, ...p, title: "", tag: "", insight: "", takeaways: [], use: "", status: "Unread" }));
    setThreads(seeded);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    startSummarizeAll(seeded);
  }, []);

  const startSummarizeAll = async (initial) => {
    const src = initial || threads;
    const todo = src.filter(t => !t.insight);
    if (!todo.length) return;
    setInitializing(true);
    setInitProgress({ current: 0, total: todo.length });
    let cur = [...src];
    for (let i = 0; i < todo.length; i++) {
      setInitProgress({ current: i + 1, total: todo.length });
      try {
        const updated = await analyzeThread(todo[i]);
        cur = cur.map(t => t.id === updated.id ? updated : t);
        setThreads([...cur]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
      } catch {}
    }
    setInitializing(false);
    showToast("✅ All threads analyzed!");
  };

  const handlePatterns = async () => {
    setLoadingPatterns(true); setPatterns("");
    const s = threads.filter(t => t.insight);
    const list = s.map(t => `[${t.sharedAt}] ${t.title} (${t.tag}) — ${t.insight}`).join("\n");
    const r = await callClaude(`You are a strategic advisor for Zeb's marketing head. Their CEO has shared these X threads over several months:\n\n${list}\n\nAnalyze and respond with:\n\n🎯 WHAT THE CEO WANTS\n(2-3 sentences)\n\n🔗 KEY THEMES\n- Theme 1: name + related threads + meaning\n- Theme 2:\n- Theme 3:\n- Theme 4:\n\n📈 PATTERN OVER TIME\n(how CEO focus evolved Jan–Apr 2026)\n\n⚡ TOP 3 PRIORITY ACTIONS FOR MARKETING HEAD NOW`);
    setPatterns(r); setLoadingPatterns(false);
  };

  const handleReply = async (t) => {
    setLoadingReply(true); setReply("");
    const r = await callClaude(`You are Zeb's marketing head replying to the CEO on Microsoft Teams.\nThread: ${t.title}\nShared: ${t.sharedAt}\nInsight: ${t.insight}\nAction: ${t.use}\n\nWrite a 3-4 sentence Teams reply: warm acknowledgment, reference the specific insight, state one concrete thing you will do this week. Sound natural, engaged, not corporate.`);
    setReply(r); setLoadingReply(false);
  };

  const updateStatus = (id, status) => {
    const updated = threads.map(t => t.id === id ? { ...t, status } : t);
    save(updated);
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const handleAdd = async () => {
    if (!form.url.trim()) return;
    const thread = { id: Date.now(), url: form.url, sharedAt: form.sharedAt || new Date().toLocaleDateString(), title: "", tag: "", insight: "", takeaways: [], use: "", status: "Unread" };
    const analyzed = await analyzeThread(thread);
    save([analyzed, ...threads]);
    setForm({ url: "", sharedAt: "" });
    setView("dashboard");
    showToast("Thread added!");
  };

  const grouped = threads.reduce((acc, t) => {
    const k = t.tag || "Uncategorized";
    if (!acc[k]) acc[k] = [];
    acc[k].push(t);
    return acc;
  }, {});

  const summarizedCount = threads.filter(t => t.insight).length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>

      {/* Header */}
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #222" }} className="px-5 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ color: "#f97316" }} className="font-bold text-lg">zeb</span>
              <span style={{ color: "#444", fontSize: 14 }}>|</span>
              <span className="text-sm font-semibold text-gray-300">CEO Thread Tracker</span>
            </div>
            <p style={{ color: "#555" }} className="text-xs mt-0.5">{summarizedCount}/{threads.length} analyzed · Capture → Insight → Act</p>
          </div>
          {initializing && (
            <div style={{ background: "#1a1a1a", border: "1px solid #333" }} className="flex items-center gap-2 px-3 py-1.5 rounded-full">
              <Spinner />
              <span style={{ color: "#f97316" }} className="text-xs font-semibold">Analyzing {initProgress.current}/{initProgress.total}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!initializing && summarizedCount < threads.length && (
            <button onClick={() => startSummarizeAll()} style={{ background: "#f97316" }} className="text-white text-xs px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition">✨ Analyze All</button>
          )}
          <button onClick={() => { setView("patterns"); setPatterns(""); }} style={{ background: "#1a1a1a", border: "1px solid #333" }} className="text-gray-300 text-xs px-3 py-2 rounded-lg font-semibold hover:border-orange-500 transition">🔗 CEO Patterns</button>
          <button onClick={() => setView("add")} style={{ background: "#1a1a1a", border: "1px solid #333" }} className="text-gray-300 text-xs px-3 py-2 rounded-lg font-semibold hover:border-orange-500 transition">+ Add</button>
        </div>
      </div>

      {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50" style={{ background: "#f97316" }}>{toast}</div>}

      {/* DASHBOARD */}
      {view === "dashboard" && (
        <div className="max-w-5xl mx-auto p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[["Unread", threads.filter(t => t.status === "Unread").length, "#ef4444"],
              ["Read", threads.filter(t => t.status === "Read").length, "#eab308"],
              ["Actioned", threads.filter(t => t.status === "Actioned").length, "#22c55e"]
            ].map(([label, count, color]) => (
              <div key={label} style={{ background: "#141414", border: "1px solid #222" }} className="rounded-xl p-4 text-center">
                <div className="text-3xl font-bold" style={{ color }}>{count}</div>
                <div className="text-xs mt-1" style={{ color: "#666" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Grouped tree */}
          {Object.entries(grouped).map(([tag, items]) => {
            const style = TAG_STYLES[tag] || { dot: "bg-gray-400", badge: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
            return (
              <div key={tag} style={{ background: "#141414", border: "1px solid #222" }} className="rounded-xl overflow-hidden">
                {/* Group header */}
                <div style={{ background: "#1a1a1a", borderBottom: "1px solid #222" }} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="font-semibold text-sm text-gray-200">{tag}</span>
                    <span style={{ color: "#555" }} className="text-xs">{items.length} threads</span>
                  </div>
                  <span style={{ color: "#555" }} className="text-xs">{items.filter(t => t.insight).length} analyzed</span>
                </div>

                {/* Threads */}
                <div className="divide-y" style={{ borderColor: "#1e1e1e" }}>
                  {items.map(t => (
                    <div key={t.id} style={{ borderColor: "#1e1e1e" }}>
                      {/* Row */}
                      <div className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-white/[0.02] transition" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                            <span style={{ color: "#555" }} className="text-xs">{t.sharedAt}</span>
                            {!t.insight && <span style={{ color: "#f97316", background: "#f97316/10" }} className="text-xs px-2 py-0.5 rounded-full border border-orange-500/20 bg-orange-500/5">pending</span>}
                          </div>
                          {t.title
                            ? <p className="text-sm font-semibold text-gray-200">📌 {t.title}</p>
                            : <p style={{ color: "#555" }} className="text-xs truncate">{t.url}</p>
                          }
                          {t.insight && <p style={{ color: "#888" }} className="text-xs mt-1 line-clamp-2">{t.insight}</p>}
                        </div>
                        <span style={{ color: "#444" }} className="text-xs mt-1 shrink-0">{expandedId === t.id ? "▲" : "▼"}</span>
                      </div>

                      {/* Expanded */}
                      {expandedId === t.id && (
                        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid #1e1e1e", paddingTop: 16 }}>
                          <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ color: "#f97316" }} className="text-xs hover:underline break-all block">{t.url}</a>

                          {t.takeaways?.length > 0 && (
                            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} className="rounded-lg p-3">
                              <p style={{ color: "#f97316" }} className="text-xs font-bold uppercase mb-2">🎯 Key Takeaways</p>
                              <ul className="space-y-1.5">
                                {t.takeaways.map((tk, i) => (
                                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                                    <span style={{ color: "#f97316" }} className="font-bold shrink-0">{i + 1}.</span>{tk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {t.use && (
                            <div style={{ background: "#0f1f0f", border: "1px solid #1a3a1a" }} className="rounded-lg p-3">
                              <p style={{ color: "#22c55e" }} className="text-xs font-bold uppercase mb-1">🚀 Use This Week</p>
                              <p className="text-sm text-gray-300">{t.use}</p>
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap items-center">
                            {["Unread", "Read", "Actioned"].map(s => (
                              <button key={s} onClick={() => updateStatus(t.id, s)}
                                style={t.status === s
                                  ? { background: "#f97316", border: "1px solid #f97316", color: "#fff" }
                                  : { background: "transparent", border: "1px solid #333", color: "#888" }}
                                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition hover:border-orange-500">
                                {s}
                              </button>
                            ))}
                            <button onClick={() => { setSelected(t); setView("reply"); setReply(""); handleReply(t); }}
                              style={{ background: "#1a1a1a", border: "1px solid #333", color: "#ccc" }}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold hover:border-orange-500 transition ml-auto">
                              💬 Draft Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPLY VIEW */}
      {view === "reply" && selected && (
        <div className="max-w-2xl mx-auto p-5 mt-4 space-y-4">
          <button onClick={() => setView("dashboard")} style={{ color: "#f97316" }} className="text-sm hover:underline">← Back</button>
          <div style={{ background: "#141414", border: "1px solid #222" }} className="rounded-xl p-5 space-y-4">
            <p className="font-bold text-gray-100">📌 {selected.title}</p>
            <p style={{ color: "#555" }} className="text-xs">{selected.sharedAt} · {selected.tag}</p>
            <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} className="rounded-lg p-3 text-sm text-gray-300">{selected.insight}</div>
            <div style={{ background: "#1a0f00", border: "1px solid #3a2000" }} className="rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <p style={{ color: "#f97316" }} className="text-xs font-bold uppercase">💬 Teams Reply Draft</p>
                {reply && (
                  <button onClick={() => { navigator.clipboard.writeText(reply); showToast("Copied!"); }}
                    style={{ color: "#f97316" }} className="text-xs font-semibold hover:underline">Copy</button>
                )}
              </div>
              {loadingReply
                ? <div className="flex items-center text-sm text-gray-400"><Spinner />Generating...</div>
                : <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{reply}</p>
              }
            </div>
            <div className="flex gap-2">
              {["Unread", "Read", "Actioned"].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  style={selected.status === s
                    ? { background: "#f97316", border: "1px solid #f97316", color: "#fff" }
                    : { background: "transparent", border: "1px solid #333", color: "#888" }}
                  className="flex-1 text-xs py-2 rounded-lg font-semibold transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PATTERNS VIEW */}
      {view === "patterns" && (
        <div className="max-w-2xl mx-auto p-5 mt-4 space-y-4">
          <button onClick={() => setView("dashboard")} style={{ color: "#f97316" }} className="text-sm hover:underline">← Back</button>
          <div style={{ background: "#141414", border: "1px solid #222" }} className="rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-gray-100 text-lg">🔗 What is your CEO telling you?</h2>
            <p style={{ color: "#666" }} className="text-sm">AI analysis of {summarizedCount} threads to find themes and priorities.</p>
            {!patterns && (
              <button onClick={handlePatterns} disabled={loadingPatterns || summarizedCount === 0}
                style={{ background: "#f97316" }} className="w-full text-white py-3 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition">
                {loadingPatterns ? <><Spinner />Analyzing...</> : "🔍 Analyze CEO Patterns"}
              </button>
            )}
            {patterns && (
              <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }} className="rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{patterns}</div>
            )}
          </div>
        </div>
      )}

      {/* ADD VIEW */}
      {view === "add" && (
        <div className="max-w-lg mx-auto p-5 mt-4">
          <button onClick={() => setView("dashboard")} style={{ color: "#f97316" }} className="text-sm hover:underline mb-4 block">← Back</button>
          <div style={{ background: "#141414", border: "1px solid #222" }} className="rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-gray-100">Add New Thread</h2>
            <div>
              <label style={{ color: "#666" }} className="text-xs font-semibold uppercase block mb-1">X Thread URL</label>
              <input style={{ background: "#1a1a1a", border: "1px solid #333", color: "#f5f5f5" }}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                placeholder="https://x.com/..."
                value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label style={{ color: "#666" }} className="text-xs font-semibold uppercase block mb-1">Date Shared</label>
              <input style={{ background: "#1a1a1a", border: "1px solid #333", color: "#f5f5f5" }}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                placeholder="e.g. 03 Apr 2026"
                value={form.sharedAt} onChange={e => setForm({ ...form, sharedAt: e.target.value })} />
            </div>
            <button onClick={handleAdd} disabled={!form.url.trim()}
              style={{ background: "#f97316" }} className="w-full text-white py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition">
              ✨ Add & Analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}