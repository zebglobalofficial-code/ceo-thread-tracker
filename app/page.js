"use client";
import { useState, useEffect } from "react";

const CATEGORIES = ["AI", "Marketing", "Automation", "Strategy", "Tools", "Other"];
const STATUS = ["Unread", "Read", "Actioned"];
const STATUS_COLOR = {
  Unread: "bg-red-100 text-red-700",
  Read: "bg-yellow-100 text-yellow-700",
  Actioned: "bg-green-100 text-green-700",
};
const STORAGE_KEY = "ceo-threads-v1";

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
  const [form, setForm] = useState({ url: "", category: "AI", notes: "" });
  const [loading, setLoading] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setThreads(JSON.parse(raw)); } catch {}
  }, []);

  const save = (data) => { setThreads(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleAdd = async () => {
    if (!form.url.trim()) return;
    setLoading(true);
    try {
      const summary = await callClaude(`You are a helpful assistant for a marketing executive. Given this X (Twitter) thread URL: ${form.url}\n\nGenerate an insightful summary for a thread about "${form.category}". Format:\n\nSUMMARY: (2-3 sentences)\nKEY TAKEAWAYS:\n- point 1\n- point 2\n- point 3\n\nMake it relevant and actionable for a marketing head.`);
      const thread = { id: Date.now(), url: form.url, category: form.category, notes: form.notes, summary, status: "Unread", addedAt: new Date().toLocaleDateString() };
      const updated = [thread, ...threads];
      save(updated);
      setForm({ url: "", category: "AI", notes: "" });
      setView("list");
      showToast("Thread saved & summarized!");
    } catch { showToast("Error summarizing. Please try again."); }
    setLoading(false);
  };

  const handleReply = async (thread) => {
    setLoadingReply(true); setReply("");
    const r = await callClaude(`You are a sharp marketing head replying to your CEO on Teams.\n\nThread category: ${thread.category}\nURL: ${thread.url}\nSummary: ${thread.summary}\n\nWrite a brief professional Teams reply (3-4 sentences) that acknowledges the share, mentions one specific insight, and states how you plan to apply it. Keep it natural.`);
    setReply(r); setLoadingReply(false);
  };

  const updateStatus = (id, status) => {
    const updated = threads.map((t) => (t.id === id ? { ...t, status } : t));
    save(updated); if (selected?.id === id) setSelected({ ...selected, status }); showToast(`Marked as ${status}`);
  };

  const deleteThread = (id) => { save(threads.filter((t) => t.id !== id)); setView("list"); setSelected(null); showToast("Thread removed."); };

  const filtered = threads.filter((t) => (filterCat === "All" || t.category === filterCat) && (filterStatus === "All" || t.status === filterStatus));
  const counts = STATUS.reduce((acc, s) => { acc[s] = threads.filter((t) => t.status === s).length; return acc; }, {});

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📌 CEO Thread Tracker</h1>
          <p className="text-xs text-gray-500">Capture → Summarize → Reply → Act</p>
        </div>
        <button onClick={() => { setView("add"); setReply(""); }} className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition">+ Add Thread</button>
      </div>

      {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{toast}</div>}

      {view === "add" && (
        <div className="max-w-lg mx-auto p-4 mt-4">
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h2 className="font-bold text-gray-700">Add New Thread</h2>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">X Thread URL</label>
              <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="https://x.com/..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
              <select className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Your Notes (optional)</label>
              <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" rows={2} placeholder="Why is this interesting?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={loading || !form.url.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? <><Spinner />Summarizing...</> : "✨ Save & Summarize"}
              </button>
              <button onClick={() => setView("list")} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selected && (
        <div className="max-w-lg mx-auto p-4 mt-4 space-y-4">
          <button onClick={() => { setView("list"); setReply(""); }} className="text-sm text-blue-600 hover:underline">← Back</button>
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[selected.status]}`}>{selected.status}</span>
                <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{selected.category}</span>
              </div>
              <span className="text-xs text-gray-400">{selected.addedAt}</span>
            </div>
            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 break-all hover:underline block">{selected.url}</a>
            {selected.notes && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700"><span className="font-semibold text-yellow-700">Your notes: </span>{selected.notes}</div>}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">AI Summary</p>
              {selected.summary}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Mark As</p>
              <div className="flex gap-2">
                {STATUS.map((s) => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition ${selected.status === s ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <button onClick={() => handleReply(selected)} disabled={loadingReply} className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition">
                {loadingReply ? <><Spinner />Generating reply...</> : "💬 Generate CEO Reply"}
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
            <button onClick={() => deleteThread(selected.id)} className="w-full text-red-500 text-sm py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">🗑 Delete Thread</button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="max-w-lg mx-auto p-4 mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {STATUS.map((s) => (
              <div key={s} className={`rounded-xl p-3 text-center ${STATUS_COLOR[s]}`}>
                <div className="text-2xl font-bold">{counts[s]}</div>
                <div className="text-xs font-semibold">{s}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setFilterCat(c)} className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${filterCat === c ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {["All", ...STATUS].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${filterStatus === s ? "bg-gray-800 text-white border-gray-800" : "hover:bg-gray-100"}`}>{s}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold">No threads yet</p>
              <p className="text-sm mt-1">Paste your CEO's next X link and hit Add Thread!</p>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} onClick={() => { setSelected(t); setView("detail"); setReply(""); }} className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{t.category}</span>
                  </div>
                  <span className="text-xs text-gray-400">{t.addedAt}</span>
                </div>
                <p className="text-xs text-blue-500 truncate">{t.url}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{t.summary?.split("\n")[0]?.replace("SUMMARY:", "").trim()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}