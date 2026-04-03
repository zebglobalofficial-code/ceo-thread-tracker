"use client";
import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "ceo-threads-v4";

const THREADS = [
  { id:1, url:"https://x.com/superagent/status/2016186940534436278", sharedAt:"29 Jan 2026" },
  { id:2, url:"https://x.com/bnj/status/2016595100714095039", sharedAt:"29 Jan 2026" },
  { id:3, url:"https://x.com/pipelineabuser/status/2017316778351947814", sharedAt:"31 Jan 2026" },
  { id:4, url:"https://x.com/broadcastgems/status/2019004663333339263", sharedAt:"05 Feb 2026" },
  { id:5, url:"https://x.com/charles_seo/status/2020498857369436401", sharedAt:"09 Feb 2026" },
  { id:6, url:"https://x.com/kalashbuilds/status/2020426249274064908", sharedAt:"09 Feb 2026" },
  { id:7, url:"https://x.com/charles_seo/status/2020748498770034940", sharedAt:"11 Feb 2026" },
  { id:8, url:"https://x.com/alexgroberman/status/2021238881795047840", sharedAt:"11 Feb 2026" },
  { id:9, url:"https://x.com/freddiexpott/status/2021282530826113422", sharedAt:"11 Feb 2026" },
  { id:10, url:"https://x.com/samwoods/status/2022450468329509098", sharedAt:"15 Feb 2026" },
  { id:11, url:"https://x.com/damienghader/status/2024134156419018899", sharedAt:"19 Feb 2026" },
  { id:12, url:"https://x.com/codyschneiderxx/status/2024532437720760489", sharedAt:"20 Feb 2026" },
  { id:13, url:"https://x.com/freddiexpott/status/2024544022346289471", sharedAt:"20 Feb 2026" },
  { id:14, url:"https://x.com/draprints/status/2025775065078333535", sharedAt:"23 Feb 2026" },
  { id:15, url:"https://x.com/henrylschuck/status/2026443897443070246", sharedAt:"25 Feb 2026" },
  { id:16, url:"https://x.com/tibo_maker/status/2027010317960511600", sharedAt:"26 Feb 2026" },
  { id:17, url:"https://x.com/codyschneiderxx/status/2027458717126438998", sharedAt:"01 Mar 2026" },
  { id:18, url:"https://x.com/techwithashiqur/status/2029789620708491684", sharedAt:"07 Mar 2026" },
  { id:19, url:"https://x.com/askperplexity/status/2031103256236274180", sharedAt:"10 Mar 2026" },
  { id:20, url:"https://x.com/deryatr_/status/2033193127708615034", sharedAt:"16 Mar 2026" },
  { id:21, url:"https://x.com/tibo_maker/status/2033491167338246540", sharedAt:"17 Mar 2026" },
  { id:22, url:"https://x.com/curieuxexplorer/status/2034512319770943841", sharedAt:"19 Mar 2026" },
  { id:23, url:"https://x.com/ayzacoder/status/2034345485851632105", sharedAt:"19 Mar 2026" },
  { id:24, url:"https://x.com/milliemarconnni/status/2034571397901815829", sharedAt:"20 Mar 2026" },
  { id:25, url:"https://x.com/hridoyreh/status/2035619991190434284", sharedAt:"23 Mar 2026" },
  { id:26, url:"https://x.com/jacobrodri_/status/2035782239792009617", sharedAt:"23 Mar 2026" },
  { id:27, url:"https://x.com/oliviacoder1/status/2035622336834199664", sharedAt:"23 Mar 2026" },
  { id:28, url:"https://x.com/ehuanglu/status/2036949499898454344", sharedAt:"27 Mar 2026" },
  { id:29, url:"https://x.com/realfrankwilder/status/2037282834080252407", sharedAt:"28 Mar 2026" },
  { id:30, url:"https://x.com/paolo_scales/status/2038543063073608063", sharedAt:"30 Mar 2026" },
  { id:31, url:"https://x.com/charles_seo/status/2038969309645689147", sharedAt:"31 Mar 2026" },
  { id:32, url:"https://x.com/levikmunneke/status/2039494797623435745", sharedAt:"02 Apr 2026" },
  { id:33, url:"https://x.com/simonecanciello/status/2039449221850423451", sharedAt:"02 Apr 2026" },
];

async function ai(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const d = await res.json();
  return d.text || "";
}

function pick(text, key) {
  return text.match(new RegExp(`${key}:\\s*(.+)`))?.[1]?.trim() || "";
}

export default function App() {
  const [data, setData] = useState({});       // id -> analyzed thread
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("all");    // all | patterns | reply
  const [replyThread, setReplyThread] = useState(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [patterns, setPatterns] = useState("");
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [toast, setToast] = useState("");
  const runningRef = useRef(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  // Load from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (Object.keys(data).length > 0)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const analyzeOne = async (t) => {
    const handle = t.url.match(/x\.com\/([^/]+)/)?.[1] || "user";
    const text = await ai(`You are an AI advisor for Zeb, a B2B AI transformation company. The CEO shared this X thread on ${t.sharedAt}.
URL: ${t.url}
Author: @${handle}

Based on the author handle, infer the likely topic in context of AI, marketing, automation, B2B tech.

Respond in EXACT format only:
TITLE: (6-8 word title of what this thread is about)
TAG: (ONE of: AI & Automation / Content & Video / SEO & GEO / Outbound & Sales / Strategy / Tools)
INSIGHT: (2 sentences - core insight the CEO wants team to know)
T1: (specific action for Zeb marketing team)
T2: (specific action)
T3: (specific action)
USE: (1 sentence - what to do THIS WEEK)`);
    return {
      id: t.id, url: t.url, sharedAt: t.sharedAt,
      title: pick(text, "TITLE"),
      tag: pick(text, "TAG"),
      insight: pick(text, "INSIGHT"),
      t1: pick(text, "T1"),
      t2: pick(text, "T2"),
      t3: pick(text, "T3"),
      use: pick(text, "USE"),
      status: "Unread",
    };
  };

  const runAnalysis = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setAnalyzing(true);
    const todo = THREADS.filter(t => !data[t.id]?.title);
    for (let i = 0; i < todo.length; i++) {
      setProgress(i + 1);
      try {
        const result = await analyzeOne(todo[i]);
        setData(prev => {
          const next = { ...prev, [result.id]: result };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      } catch {}
    }
    setAnalyzing(false);
    runningRef.current = false;
    showToast("✅ All threads analyzed!");
  };

  const updateStatus = (id, status) => {
    setData(prev => {
      const next = { ...prev, [id]: { ...prev[id], status } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const doReply = async (t) => {
    setReplyThread(t);
    setView("reply");
    setReply("");
    setReplyLoading(true);
    const r = await ai(`You are Zeb's marketing head replying to the CEO on Teams.
Thread: ${t.title}
Shared: ${t.sharedAt}
Insight: ${t.insight}
Action this week: ${t.use}
Write a 3-4 sentence Teams reply: warm acknowledgment, reference the specific insight, state one concrete thing you will do this week. Natural tone, not corporate.`);
    setReply(r);
    setReplyLoading(false);
  };

  const doPatterns = async () => {
    setView("patterns");
    if (patterns) return;
    setPatternsLoading(true);
    const analyzed = THREADS.filter(t => data[t.id]?.title).map(t => `[${t.sharedAt}] ${data[t.id].title} (${data[t.id].tag}) — ${data[t.id].insight}`).join("\n");
    const r = await ai(`You are a strategic advisor for Zeb. The CEO shared these X threads with his marketing team:

${analyzed}

Respond with:
🎯 WHAT THE CEO WANTS
(2-3 sentences on the CEO overall message)

🔗 KEY THEMES (list 4 themes with which threads relate)

📈 HOW CEO FOCUS EVOLVED (Jan to Apr 2026)

⚡ TOP 3 PRIORITY ACTIONS FOR MARKETING HEAD NOW`);
    setPatterns(r);
    setPatternsLoading(false);
  };

  const threads = THREADS.map(t => ({ ...t, ...data[t.id] }));
  const analyzed = threads.filter(t => t.title);
  const byTag = analyzed.reduce((a, t) => { (a[t.tag||"Other"] = a[t.tag||"Other"]||[]).push(t); return a; }, {});

  const tagColors = {
    "AI & Automation": "#f97316",
    "Content & Video": "#ec4899",
    "SEO & GEO": "#22c55e",
    "Outbound & Sales": "#3b82f6",
    "Strategy": "#a855f7",
    "Tools": "#eab308",
  };

  const S = (obj) => Object.fromEntries(Object.entries(obj));

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#f0f0f0", fontFamily:"Inter,sans-serif" }}>

      {/* NAV */}
      <div style={{ background:"#0f0f0f", borderBottom:"1px solid #222", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:"#f97316", fontWeight:800, fontSize:18 }}>zeb</span>
          <span style={{ color:"#333" }}>|</span>
          <span style={{ color:"#aaa", fontSize:13, fontWeight:600 }}>CEO Thread Tracker</span>
          {analyzing && (
            <span style={{ background:"#1a1a1a", border:"1px solid #333", borderRadius:20, padding:"3px 10px", fontSize:12, color:"#f97316" }}>
              ⏳ Analyzing {progress}/{THREADS.filter(t=>!data[t.id]?.title).length + progress - 1}...
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ color:"#555", fontSize:12, alignSelf:"center" }}>{analyzed.length}/{THREADS.length} analyzed</span>
          {!analyzing && analyzed.length < THREADS.length && (
            <button onClick={runAnalysis} style={{ background:"#f97316", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              ✨ Analyze All ({THREADS.length - analyzed.length} left)
            </button>
          )}
          <button onClick={doPatterns} style={{ background:"#1a1a1a", color:"#ccc", border:"1px solid #333", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            🔗 CEO Patterns
          </button>
          <button onClick={() => setView("all")} style={{ background: view==="all" ? "#222":"#1a1a1a", color:"#ccc", border:"1px solid #333", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
            Dashboard
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ position:"fixed", top:60, left:"50%", transform:"translateX(-50%)", background:"#f97316", color:"#fff", padding:"8px 20px", borderRadius:20, fontSize:13, fontWeight:600, zIndex:99 }}>
          {toast}
        </div>
      )}

      {/* ALL THREADS VIEW */}
      {view === "all" && (
        <div style={{ maxWidth:960, margin:"0 auto", padding:"20px 16px" }}>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {[
              ["Total", THREADS.length, "#f97316"],
              ["Analyzed", analyzed.length, "#22c55e"],
              ["Unread", threads.filter(t=>t.status==="Unread").length, "#ef4444"],
              ["Actioned", threads.filter(t=>t.status==="Actioned").length, "#22c55e"],
            ].map(([label,val,col]) => (
              <div key={label} style={{ background:"#141414", border:"1px solid #222", borderRadius:12, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:800, color:col }}>{val}</div>
                <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Not yet analyzed */}
          {analyzed.length < THREADS.length && (
            <div style={{ background:"#1a0f00", border:"1px solid #3a2000", borderRadius:12, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ color:"#f97316", fontWeight:700, fontSize:14 }}>✨ {THREADS.length - analyzed.length} threads waiting to be analyzed</p>
                <p style={{ color:"#888", fontSize:12, marginTop:2 }}>Click Analyze All to extract insights and takeaways from every thread</p>
              </div>
              {!analyzing && (
                <button onClick={runAnalysis} style={{ background:"#f97316", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  ✨ Analyze All
                </button>
              )}
            </div>
          )}

          {/* Grouped by tag */}
          {Object.entries(byTag).map(([tag, items]) => (
            <div key={tag} style={{ background:"#141414", border:"1px solid #222", borderRadius:14, marginBottom:16, overflow:"hidden" }}>
              {/* Tag header */}
              <div style={{ background:"#1a1a1a", borderBottom:"1px solid #222", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background: tagColors[tag]||"#888", display:"inline-block" }} />
                <span style={{ fontWeight:700, color:"#e0e0e0", fontSize:14 }}>{tag}</span>
                <span style={{ color:"#555", fontSize:12 }}>{items.length} threads</span>
              </div>

              {/* Thread rows */}
              {items.map(t => (
                <div key={t.id} style={{ borderBottom:"1px solid #1e1e1e" }}>
                  {/* Collapsed row */}
                  <div onClick={() => setExpanded(expanded===t.id ? null : t.id)}
                    style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"flex-start", gap:12 }}
                    onMouseEnter={e => e.currentTarget.style.background="#ffffff08"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                        <span style={{
                          fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:600,
                          background: t.status==="Actioned" ? "#052e16" : t.status==="Read" ? "#1c1a00" : "#1f0000",
                          color: t.status==="Actioned" ? "#22c55e" : t.status==="Read" ? "#eab308" : "#ef4444",
                          border: `1px solid ${t.status==="Actioned" ? "#166534" : t.status==="Read" ? "#422006" : "#7f1d1d"}`
                        }}>{t.status||"Unread"}</span>
                        <span style={{ color:"#555", fontSize:11 }}>{t.sharedAt}</span>
                      </div>
                      <p style={{ fontWeight:600, fontSize:14, color:"#e5e5e5", margin:"0 0 4px" }}>📌 {t.title || <span style={{color:"#444"}}>Analyzing...</span>}</p>
                      <p style={{ fontSize:12, color:"#777", margin:0, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{t.insight}</p>
                    </div>
                    <span style={{ color:"#444", fontSize:12, flexShrink:0, marginTop:2 }}>{expanded===t.id ? "▲" : "▼"}</span>
                  </div>

                  {/* Expanded panel */}
                  {expanded === t.id && t.title && (
                    <div style={{ padding:"0 16px 16px", borderTop:"1px solid #1e1e1e" }}>
                      <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ color:"#f97316", fontSize:11, display:"block", margin:"12px 0 14px", wordBreak:"break-all" }}>{t.url}</a>

                      {/* Insight */}
                      <div style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                        <p style={{ color:"#f97316", fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>💡 Core Insight</p>
                        <p style={{ color:"#ccc", fontSize:13, lineHeight:1.6, margin:0 }}>{t.insight}</p>
                      </div>

                      {/* Takeaways */}
                      <div style={{ background:"#0d1a0d", border:"1px solid #1a3a1a", borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
                        <p style={{ color:"#22c55e", fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>🎯 Key Takeaways for Zeb Marketing</p>
                        {[t.t1, t.t2, t.t3].filter(Boolean).map((tk, i) => (
                          <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                            <span style={{ color:"#f97316", fontWeight:700, fontSize:13, flexShrink:0 }}>{i+1}.</span>
                            <p style={{ color:"#bbb", fontSize:13, margin:0, lineHeight:1.5 }}>{tk}</p>
                          </div>
                        ))}
                      </div>

                      {/* Use this week */}
                      <div style={{ background:"#0a0f1a", border:"1px solid #1a2a3a", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
                        <p style={{ color:"#3b82f6", fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>🚀 Use This Week</p>
                        <p style={{ color:"#ccc", fontSize:13, margin:0, lineHeight:1.5 }}>{t.use}</p>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {["Unread","Read","Actioned"].map(s => (
                          <button key={s} onClick={() => updateStatus(t.id, s)} style={{
                            padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
                            background: (t.status||"Unread")===s ? "#f97316" : "transparent",
                            color: (t.status||"Unread")===s ? "#fff" : "#888",
                            border: `1px solid ${(t.status||"Unread")===s ? "#f97316" : "#333"}`
                          }}>{s}</button>
                        ))}
                        <button onClick={() => doReply(t)} style={{ marginLeft:"auto", padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:"#1a1a1a", color:"#ccc", border:"1px solid #333" }}>
                          💬 Draft Teams Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Unanalyzed threads */}
          {THREADS.filter(t => !data[t.id]?.title).length > 0 && (
            <div style={{ background:"#141414", border:"1px solid #222", borderRadius:14, overflow:"hidden" }}>
              <div style={{ background:"#1a1a1a", borderBottom:"1px solid #222", padding:"12px 16px" }}>
                <span style={{ color:"#555", fontWeight:700, fontSize:13 }}>⏳ Pending Analysis ({THREADS.filter(t=>!data[t.id]?.title).length} threads)</span>
              </div>
              {THREADS.filter(t => !data[t.id]?.title).map(t => (
                <div key={t.id} style={{ padding:"12px 16px", borderBottom:"1px solid #1e1e1e", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ color:"#444", fontSize:12, margin:0 }}>{t.sharedAt}</p>
                    <p style={{ color:"#555", fontSize:12, margin:"2px 0 0", wordBreak:"break-all" }}>{t.url}</p>
                  </div>
                  <span style={{ color:"#333", fontSize:11 }}>Not analyzed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REPLY VIEW */}
      {view === "reply" && replyThread && (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>
          <button onClick={() => setView("all")} style={{ color:"#f97316", background:"none", border:"none", cursor:"pointer", fontSize:13, marginBottom:16 }}>← Back to Dashboard</button>
          <div style={{ background:"#141414", border:"1px solid #222", borderRadius:14, padding:20 }}>
            <p style={{ fontWeight:700, color:"#e0e0e0", fontSize:15, marginBottom:4 }}>📌 {replyThread.title}</p>
            <p style={{ color:"#555", fontSize:12, marginBottom:14 }}>{replyThread.sharedAt} · {replyThread.tag}</p>
            <div style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
              <p style={{ color:"#888", fontSize:13, margin:0 }}>{replyThread.insight}</p>
            </div>
            <div style={{ background:"#1a0f00", border:"1px solid #3a2000", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <p style={{ color:"#f97316", fontSize:11, fontWeight:700, textTransform:"uppercase", margin:0 }}>💬 Teams Reply Draft</p>
                {reply && <button onClick={() => { navigator.clipboard.writeText(reply); showToast("Copied!"); }} style={{ color:"#f97316", background:"none", border:"none", cursor:"pointer", fontSize:12, fontWeight:600 }}>Copy</button>}
              </div>
              {replyLoading
                ? <p style={{ color:"#888", fontSize:13 }}>⏳ Generating...</p>
                : <p style={{ color:"#e0e0e0", fontSize:13, lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{reply}</p>
              }
            </div>
          </div>
        </div>
      )}

      {/* PATTERNS VIEW */}
      {view === "patterns" && (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px" }}>
          <button onClick={() => setView("all")} style={{ color:"#f97316", background:"none", border:"none", cursor:"pointer", fontSize:13, marginBottom:16 }}>← Back to Dashboard</button>
          <div style={{ background:"#141414", border:"1px solid #222", borderRadius:14, padding:20 }}>
            <h2 style={{ color:"#e0e0e0", fontWeight:700, fontSize:17, marginBottom:6 }}>🔗 What is your CEO telling you?</h2>
            <p style={{ color:"#666", fontSize:13, marginBottom:16 }}>AI analysis of {analyzed.length} threads — themes, patterns and your priority actions.</p>
            {patternsLoading
              ? <p style={{ color:"#888" }}>⏳ Analyzing all threads...</p>
              : patterns
                ? <div style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, padding:"14px 16px", color:"#ccc", fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{patterns}</div>
                : <button onClick={doPatterns} style={{ background:"#f97316", color:"#fff", border:"none", borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%" }}>🔍 Analyze CEO Patterns</button>
            }
          </div>
        </div>
      )}
    </div>
  );
}