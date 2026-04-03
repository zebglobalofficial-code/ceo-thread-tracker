"use client";
import { useState, useEffect } from "react";

const CATEGORIES = ["AI", "Marketing", "Automation", "Strategy", "Tools", "Other"];
const STATUS = ["Unread", "Read", "Actioned"];
const STATUS_COLOR = { Unread: "bg-red-100 text-red-700", Read: "bg-yellow-100 text-yellow-700", Actioned: "bg-green-100 text-green-700" };
const STORAGE_KEY = "ceo-threads-v2";

const PRELOADED = [
  { url: "https://x.com/superagent/status/2016186940534436278?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "29 Jan 2026" },
  { url: "https://x.com/bnj/status/2016595100714095039?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "29 Jan 2026" },
  { url: "https://x.com/pipelineabuser/status/2017316778351947814?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "31 Jan 2026" },
  { url: "https://x.com/broadcastgems/status/2019004663333339263?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "05 Feb 2026" },
  { url: "https://x.com/charles_seo/status/2020498857369436401?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "09 Feb 2026" },
  { url: "https://x.com/kalashbuilds/status/2020426249274064908?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "09 Feb 2026" },
  { url: "https://x.com/charles_seo/status/2020748498770034940?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/alexgroberman/status/2021238881795047840?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/freddiexpott/status/2021282530826113422?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "11 Feb 2026" },
  { url: "https://x.com/samwoods/status/2022450468329509098?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "15 Feb 2026" },
  { url: "https://x.com/damienghader/status/2024134156419018899?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "19 Feb 2026" },
  { url: "https://x.com/codyschneiderxx/status/2024532437720760489?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "20 Feb 2026" },
  { url: "https://x.com/freddiexpott/status/2024544022346289471?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "20 Feb 2026" },
  { url: "https://x.com/draprints/status/2025775065078333535?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "23 Feb 2026" },
  { url: "https://x.com/henrylschuck/status/2026443897443070246?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "25 Feb 2026" },
  { url: "https://x.com/tibo_maker/status/2027010317960511600?s=20", sharedAt: "26 Feb 2026" },
  { url: "https://x.com/codyschneiderxx/status/2027458717126438998?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "01 Mar 2026" },
  { url: "https://x.com/techwithashiqur/status/2029789620708491684?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "07 Mar 2026" },
  { url: "https://x.com/askperplexity/status/2031103256236274180?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "10 Mar 2026" },
  { url: "https://x.com/deryatr_/status/2033193127708615034?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "16 Mar 2026" },
  { url: "https://x.com/tibo_maker/status/2033491167338246540?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "17 Mar 2026" },
  { url: "https://x.com/curieuxexplorer/status/2034512319770943841?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "19 Mar 2026" },
  { url: "https://x.com/ayzacoder/status/2034345485851632105?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "19 Mar 2026" },
  { url: "https://x.com/milliemarconnni/status/2034571397901815829?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "20 Mar 2026" },
  { url: "https://x.com/hridoyreh/status/2035619991190434284?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/jacobrodri_/status/2035782239792009617?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/oliviacoder1/status/2035622336834199664?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "23 Mar 2026" },
  { url: "https://x.com/ehuanglu/status/2036949499898454344?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "27 Mar 2026" },
  { url: "https://x.com/realfrankwilder/status/2037282834080252407?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "28 Mar 2026" },
  { url: "https://x.com/paolo_scales/status/2038543063073608063?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "30 Mar 2026" },
  { url: "https://x.com/charles_seo/status/2038969309645689147?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "31 Mar 2026" },
  { url: "https://x.com/levikmunneke/status/2039494797623435745?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "02 Apr 2026" },
  { url: "https://x.com/simonecanciello/status/2039449221850423451?s=46&t=4GKDU7ogVxijHPYIUskhSw", sharedAt: "02 Apr 2026" },
];

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin align-middle mr-2" />;
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
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summarizingAll, setSummarizingAll] = useState(false);
  const [summarizeProgress, setSummarizeProgress] = useState({ current: 0, total: 0 });
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [reply, setReply] = useState("");
  const [relations, setRelations] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ url: "", category: "AI", notes: "", sharedAt: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { setThreads(JSON.parse(raw)); return; }
      // First load — seed with preloaded links
      const seeded = PRELOADED.map((p, i) => ({ id: i + 1, url: p.url, sharedAt: p.sharedAt, category: "AI", notes: "", summary: "", takeaways: "", howToUse: "", status: "Unread" }));
      setThreads(seeded);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {}
  }, []);

  const save = (data) => { setThreads(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const summarizeThread = async (thread) => {
    const handle = thread.url.match(/x\.com\/([^/]+)/)?.[1] || "unknown";
    const text = await callClaude(`You are an AI assistant for a marketing head at a B2B tech company. Their CEO (V) shared this X thread on ${thread.sharedAt}.

URL: ${thread.url}
Author handle: @${handle}

Based on the handle and URL, infer what this thread is likely about in the context of AI, Marketing, Automation, or B2B strategy.

Respond in this EXACT format:

TOPIC: (one line - what this thread is about)
CATEGORY: (one of: AI / Marketing / Automation / Strategy / Tools)
SUMMARY: (2-3 sentences about the key insight)
TAKEAWAYS:
- takeaway 1
- takeaway 2
- takeaway 3
HOW TO USE: (2-3 sentences on how the marketing head should apply this practically)
`);
    const topic = text.match(/TOPIC:\s*(.+)/)?.[1]?.trim() || "";
    const category = text.match(/CATEGORY:\s*(.+)/)?.[1]?.trim() || "AI";
    const summary = text.match(/SUMMARY:\s*([\s\S]+?)(?=TAKEAWAYS:|$)/)?.[1]?.trim() || "";
    const takeaways = text.match(/TAKEAWAYS:\s*([\s\S]+?)(?=HOW TO USE:|$)/)?.[1]?.trim() || "";
    const howToUse = text.match(/HOW TO USE:\s*([\s\S]+?)$/)?.[1]?.trim() || "";
    return { ...thread, topic, category, summary, takeaways, howToUse };
  };

  const handleSummarizeOne = async (thread) => {
    setLoading(true);
    const updated = await summarizeThread(thread);
    const newThreads = threads.map(t => t.id === updated.id ? updated : t);
    save(newThreads);
    setSelected(updated);
    setLoading(false);
    showToast("Summarized!");
  };

  const handleSummarizeAll = async () => {
    const unsummarized = threads.filter(t => !t.summary);
    if (unsummarized.length === 0) { showToast("All threads already summarized!"); return; }
    setSummarizingAll(true);
    setSummarizeProgress({ current: 0, total: unsummarized.length });
    let current = [...threads];
    for (let i = 0; i < unsummarized.length; i++) {
      setSummarizeProgress({ current: i + 1, total: unsummarized.length });
      const updated = await summarizeThread(unsummarized[i]);
      current = current.map(t => t.id === updated.id ? updated : t);
      save(current);
    }
    setSummarizingAll(false);
    showToast(`✅ All ${unsummarized.length} threads summarized!`);
  };

  const handleReply = async (thread) => {
    setLoadingReply(true); setReply("");
    const r = await callClaude(`You are a sharp marketing head replying to your CEO on Teams.
Thread shared on: ${thread.sharedAt}
URL: ${thread.url}
Topic: ${thread.topic}
Summary: ${thread.summary}
How to use: ${thread.howToUse}

Write a brief professional Teams reply (3-4 sentences) that acknowledges the share enthusiastically, mentions one specific insight, and states how you plan to apply it. Keep it natural and specific.`);
    setReply(r); setLoadingReply(false);
  };

  const handleRelations = async () => {
    setLoadingRelations(true); setRelations("");
    const summarized = threads.filter(t => t.summary);
    const list = summarized.map(t => `- ${t.sharedAt}: ${t.topic || t.url}`).join("\n");
    const r = await callClaude(`You are a strategic marketing advisor. Here are X threads shared by a CEO with his marketing head over several months:

${list}

Analyze these and respond with:

THEMES: (identify 3-4 recurring themes the CEO cares about)
PATTERNS: (what is the CEO trying to tell the marketing team through these shares?)
CONNECTIONS: (which threads are related and why?)
PRIORITY ACTION: (what is the ONE most important thing the marketing head should do based on all these shares?)`);
    setRelations(r); setLoadingRelations(false);
  };

  const updateStatus = (id, status) => {
    const updated = threads.map(t => t.id === id ? { ...t, status } : t);
    save(updated); if (selected?.id === id) setSelected({ ...selected, status }); showToast(`Marked as ${status}`);
  };

  const deleteThread = (id) => { save(threads.filter(t => t.id !== id)); setView("list"); setSelected(null); showToast("Removed."); };

  const handleAdd = async () => {
    if (!form.url.trim()) return;
    setLoading(true);
    const thread = { id: Date.now(), url: form.url, sharedAt: form.sharedAt || new Date().toLocaleDateString(), category: form.category, notes: form.notes, summary: "", takeaways: "", howToUse: "", topic: "", status: "Unread" };
    const summarized = await summarizeThread(thread);
    save([summarized, ...threads]);
    setForm({ url: "", category: "AI", notes: "", sharedAt: "" });
    setView("list");
    setLoading(false);
    showToast("Added & summarized!");
  };

  const filtered = threads.filter(t => (filterCat === "All" || t.category === filterCat) && (filterStatus === "All" || t.status === filterStatus));
  const counts = STATUS.reduce((acc, s) => { acc[s] = threads.filter(t => t.status === s).length; return acc; }, {});
  const summarizedCount = threads.filter(t => t.summary).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📌 CEO Thread Tracker</h1>
          <p className="text-xs text-gray-500">Capture → Summarize → Understand → Act</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setView("relations"); setRelations(""); }} className="bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">🔗 Find Patterns</button>
          <button onClick={() => setView("add")} className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition">+ Add</button>
        </div>
      </div>

      {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}

      {/* Summarize All Banner */}
      {view === "list" && summarizedCount < threads.length && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">✨ {threads.length - summarizedCount} threads need summarizing</p>
              <p className="text-xs text-blue-600 mt-1">AI will analyze each thread and extract key takeaways</p>
            </div>
            <button onClick={handleSummarizeAll} disabled={summarizingAll} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap">
              {summarizingAll ? <><Spinner />{summarizeProgress.current}/{summarizeProgress.total}</> : "Summarize All"}
            </button>
          </div>
        </div>
      )}

      {/* Relations View */}
      {view === "relations" && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <button onClick={() => setView("list")} className="text-sm text-blue-600 hover:underline">← Back</button>
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-700 text-lg">🔗 CEO Pattern Analysis</h2>
            <p className="text-sm text-gray-500">AI will analyze all {summarizedCount} summarized threads and find themes, patterns and connections in what your CEO is sharing.</p>
            <button onClick={handleRelations} disabled={loadingRelations || summarizedCount === 0} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
              {loadingRelations ? <><Spinner />Analyzing patterns...</> : "🔍 Analyze CEO's Patterns"}
            </button>
            {relations && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{relations}</div>
            )}
          </div>
        </div>
      )}

      {/* Add View */}
      {view === "add" && (
        <div className="max-w-lg mx-auto p-4 mt-4">
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-700">Add New Thread</h2>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">X Thread URL</label>
              <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="https://x.com/..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Date Shared by CEO</label>
              <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. 02 Apr 2026" value={form.sharedAt} onChange={e => setForm({ ...form, sharedAt: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Notes (optional)</label>
              <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={loading || !form.url.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? <><Spinner />Analyzing...</> : "✨ Save & Analyze"}
              </button>
              <button onClick={() => setView("list")} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && selected && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <button onClick={() => { setView("list"); setReply(""); }} className="text-sm text-blue-600 hover:underline">← Back</button>
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[selected.status]}`}>{selected.status}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{selected.category}</span>
              </div>
              <span className="text-xs text-gray-400">Shared: {selected.sharedAt}</span>
            </div>

            {selected.topic && <p className="font-semibold text-gray-800 text-base">📌 {selected.topic}</p>}

            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 break-all hover:underline block">{selected.url}</a>

            {selected.notes && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700"><span className="font-semibold text-yellow-700">Notes: </span>{selected.notes}</div>}

            {!selected.summary ? (
              <button onClick={() => handleSummarizeOne(selected)} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? <><Spinner />Analyzing...</> : "✨ Summarize This Thread"}
              </button>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">📝 Summary</p>
                  {selected.summary}
                </div>
                {selected.takeaways && (
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">🎯 Key Takeaways</p>
                    <div className="whitespace-pre-wrap">{selected.takeaways}</div>
                  </div>
                )}
                {selected.howToUse && (
                  <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    <p className="text-xs font-bold text-green-600 uppercase mb-2">🚀 How To Use This</p>
                    {selected.howToUse}
                  </div>
                )}
              </>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Mark As</p>
              <div className="flex gap-2">
                {STATUS.map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition ${selected.status === s ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <button onClick={() => handleReply(selected)} disabled={loadingReply || !selected.summary} className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition">
                {loadingReply ? <><Spinner />Generating...</> : "💬 Generate Teams Reply"}
              </button>
              {reply && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-purple-700 uppercase">Teams Reply Draft</p>
                    <button onClick={() => { navigator.clipboard.writeText(reply); showToast("Copied!"); }} className="text-xs text-purple-600 hover:underline font-semibold">Copy</button>
                  </div>
                  {reply}
                </div>
              )}
            </div>
            <button onClick={() => deleteThread(selected.id)} className="w-full text-red-500 text-sm py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">🗑 Delete</button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {STATUS.map(s => (
              <div key={s} className={`rounded-xl p-3 text-center ${STATUS_COLOR[s]}`}>
                <div className="text-2xl font-bold">{counts[s]}</div>
                <div className="text-xs font-semibold">{s}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setFilterCat(c)} className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${filterCat === c ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {["All", ...STATUS].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${filterStatus === s ? "bg-gray-800 text-white border-gray-800" : "hover:bg-gray-100"}`}>{s}</button>
            ))}
          </div>
          {filtered.map(t => (
            <div key={t.id} onClick={() => { setSelected(t); setView("detail"); setReply(""); }} className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{t.category}</span>
                  {!t.summary && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-semibold">Needs summary</span>}
                </div>
                <span className="text-xs text-gray-400">{t.sharedAt}</span>
              </div>
              {t.topic && <p className="text-sm font-semibold text-gray-700">📌 {t.topic}</p>}
              <p className="text-xs text-blue-500 truncate">{t.url}</p>
              {t.summary && <p className="text-sm text-gray-600 line-clamp-2">{t.summary}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}