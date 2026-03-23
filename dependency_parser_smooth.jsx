import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const UD_TAGS = {
  nsubj:"ega", obj:"to'ldiruvchi", obl:"vositali to'ld.", advmod:"hol",
  amod:"sifatlovchi", "nmod:poss":"qaratqich", compound:"birikma",
  conj:"uyushiq", cc:"bog'lovchi", mark:"ergash bog'lovchi",
  cop:"to'liqsiz fe'l", aux:"yordamchi fe'l", punct:"tinish",
  root:"kesim (root)", acl:"sifatdosh", xcomp:"harakat nomi",
  discourse:"kirizma", advcl:"ergash gap", "advmod:emph":"yuklama",
  vocative:"undalma", nummod:"son aniqlovchi", det:"aniqlovchi",
  attr:"aniqlovchi", appos:"izoh"
};

const DEP_DARK  = { nsubj:"#60A5FA",obj:"#93C5FD",obl:"#38BDF8",advmod:"#818CF8",amod:"#A78BFA","nmod:poss":"#34D399",compound:"#6EE7B7",conj:"#FCD34D",cc:"#FBBF24",mark:"#FB923C",cop:"#F87171",aux:"#F472B6",punct:"#64748B",root:"#60A5FA",acl:"#34D399",xcomp:"#818CF8",discourse:"#A78BFA",advcl:"#38BDF8","advmod:emph":"#FCD34D",vocative:"#FB923C",nummod:"#93C5FD",det:"#6EE7B7",attr:"#A78BFA",appos:"#F87171" };
const DEP_LIGHT = { nsubj:"#2563EB",obj:"#1D4ED8",obl:"#0284C7",advmod:"#4F46E5",amod:"#7C3AED","nmod:poss":"#059669",compound:"#047857",conj:"#B45309",cc:"#D97706",mark:"#EA580C",cop:"#DC2626",aux:"#DB2777",punct:"#94A3B8",root:"#2563EB",acl:"#059669",xcomp:"#4F46E5",discourse:"#7C3AED",advcl:"#0284C7","advmod:emph":"#B45309",vocative:"#EA580C",nummod:"#1D4ED8",det:"#047857",attr:"#7C3AED",appos:"#DC2626" };

function c(dep, dark) { return (dark ? DEP_DARK : DEP_LIGHT)[dep] || (dark ? "#60A5FA" : "#2563EB"); }

// ─── SVG Tree ────────────────────────────────────────────────────────────────
function TreeSVG({ tokens, dark }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { setPhase(0); const t = setTimeout(() => setPhase(1), 60); return () => clearTimeout(t); }, [tokens]);

  const W = 108, PAD = 56, AH = 172, SH = AH + 86;
  const svgW = tokens.length * W + PAD * 2;

  const arcs = tokens.flatMap((tok, i) => {
    if (!tok.head || tok.dep === "root") return [];
    const hi = tok.head - 1;
    if (hi < 0 || hi >= tokens.length) return [];
    const fx = PAD + i * W + W / 2, tx = PAD + hi * W + W / 2;
    const h = Math.min(28 + Math.abs(i - hi) * 36, AH - 20);
    const mx = (fx + tx) / 2;
    const pLen = Math.round(Math.PI * Math.hypot(fx - tx, h) / 2);
    return [{ fx, tx, mx, cy: AH - h, baseY: AH, dep: tok.dep, dc: c(tok.dep, dark), i, pLen }];
  });

  return (
    <div style={{ overflowX: "auto", padding: "4px 0" }}>
      <svg width={Math.max(svgW, 360)} height={SH} style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
        <defs>
          {tokens.map((tok, i) => (
            <marker key={i} id={`a${i}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={c(tok.dep, dark)} />
            </marker>
          ))}
        </defs>
        {arcs.map((a, idx) => (
          <g key={idx}>
            <path d={`M${a.fx},${a.baseY} Q${a.mx},${a.cy} ${a.tx},${a.baseY}`}
              fill="none" stroke={a.dc} strokeWidth="1.8"
              strokeDasharray={a.pLen} strokeDashoffset={phase ? 0 : a.pLen}
              markerEnd={`url(#a${a.i})`} opacity={phase ? 0.88 : 0}
              style={{ transition: `stroke-dashoffset .55s cubic-bezier(.4,0,.2,1) ${idx*.07}s, opacity .35s ease ${idx*.07}s` }} />
            <text x={a.mx} y={a.cy - 7} textAnchor="middle" fontSize="10.5"
              fill={a.dc} fontFamily="'JetBrains Mono',monospace" fontWeight="700"
              style={{ transition: `opacity .4s ease ${idx*.07+.2}s`, opacity: phase ? 1 : 0 }}>
              {a.dep}
            </text>
          </g>
        ))}
        {tokens.map((tok, i) => {
          const cx = PAD + i * W + W / 2;
          const isRoot = tok.dep === "root" || tok.head === 0;
          const dc = c(tok.dep, dark);
          return (
            <g key={i} style={{ transition: `opacity .4s ease ${i*.05}s, transform .4s ease ${i*.05}s`, opacity: phase ? 1 : 0, transform: phase ? "none" : "translateY(-8px)" }}>
              <line x1={cx} y1={AH} x2={cx} y2={AH+11} stroke="var(--border)" strokeWidth="1.5" />
              <rect x={cx-29} y={AH+13} width={58} height={21} rx={5}
                fill={isRoot ? dc+"22" : "var(--surface)"} stroke={isRoot ? dc : "var(--border)"} strokeWidth={isRoot ? 1.5 : 1} />
              <text x={cx} y={AH+28} textAnchor="middle" fontSize="10"
                fill={isRoot ? dc : "var(--muted)"} fontFamily="'JetBrains Mono',monospace" fontWeight="700">
                {tok.pos || "?"}
              </text>
              <text x={cx} y={AH+53} textAnchor="middle" fontSize="15"
                fill="var(--text)" fontFamily="'Inter',sans-serif" fontWeight="700">
                {tok.form}
              </text>
              <text x={cx} y={AH+71} textAnchor="middle" fontSize="9"
                fill="var(--faint)" fontFamily="'JetBrains Mono',monospace">
                {i+1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} aria-label="Toggle theme"
      style={{ width:56, height:30, borderRadius:15, border:"none", cursor:"pointer", position:"relative",
        background: dark ? "#1e40af" : "#e2e8f0", padding:0,
        boxShadow: dark ? "0 0 12px #3b82f630" : "inset 0 1px 3px #00000020",
        transition: "background .35s ease, box-shadow .35s ease", flexShrink:0 }}>
      <span style={{ position:"absolute", left:7, top:"50%", transform:"translateY(-50%)", fontSize:11, opacity: dark?.5:0, transition:"opacity .3s", pointerEvents:"none" }}>🌙</span>
      <span style={{ position:"absolute", right:7, top:"50%", transform:"translateY(-50%)", fontSize:11, opacity: dark?0:.7, transition:"opacity .3s", pointerEvents:"none" }}>☀️</span>
      <div style={{
        position:"absolute", top:3, left: dark ? 29 : 3, width:24, height:24, borderRadius:"50%",
        background: dark ? "#fff" : "#2563eb",
        boxShadow: dark ? "0 2px 8px #00000050" : "0 2px 6px #2563eb50",
        transition:"left .35s cubic-bezier(.34,1.56,.64,1), background .3s, box-shadow .3s",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:12
      }}>
        {dark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]           = useState(true);
  const [text, setText]           = useState("Men qiziqarli kitob o'qidim.");
  const [tokens, setTokens]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [tableVis, setTableVis]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [xlDone, setXlDone]       = useState(false);
  const [mounted, setMounted]     = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 30); }, []);

  async function analyze() {
    if (!text.trim() || loading) return;
    setLoading(true); setError(""); setTokens(null); setTableVis(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:`O'zbek tili UD dependency parser. FAQAT JSON:
{"tokens":[{"id":1,"form":"so'z","lemma":"lug'at","pos":"N|VB|JJ|RR|P|MD|PUNCT|DET|CONJ|NUM","feats":"yoki null","head":0,"dep":"nsubj|obj|obl|advmod|amod|nmod:poss|compound|conj|cc|mark|cop|aux|punct|root|acl|xcomp|discourse|advcl|advmod:emph|vocative|nummod|det"}]}
Root: head=0, dep="root". Boshqa hech narsa yozma.`,
          messages:[{role:"user", content:`Gap: ${text}`}]
        })
      });
      const data = await res.json();
      const raw = data.content?.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
      setTokens(JSON.parse(raw).tokens);
      setTimeout(() => setTableVis(true), 350);
    } catch { setError("Tahlil qilishda xatolik. Qayta urinib ko'ring."); }
    setLoading(false);
  }

  function downloadExcel() {
    if (!tokens) return;
    const rows = [["#","Token","Lemma","POS","Feats","Head","Dependency","Izoh"]];
    tokens.forEach(t => rows.push([t.id,t.form,t.lemma||"",t.pos||"",t.feats||"",t.head,t.dep,UD_TAGS[t.dep]||t.dep]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [4,14,14,8,16,6,16,20].map(w=>({wch:w}));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dependency Tahlil");
    const ws2 = XLSX.utils.aoa_to_sheet([["Gap",text],["Sana",new Date().toLocaleDateString("uz-UZ")],["Standart","Universal Dependencies"],["Til","O'zbek tili"]]);
    ws2["!cols"] = [{wch:12},{wch:50}];
    XLSX.utils.book_append_sheet(wb, ws2, "Ma'lumot");
    XLSX.writeFile(wb, `dependency_${Date.now()}.xlsx`);
    setXlDone(true); setTimeout(()=>setXlDone(false), 2500);
  }

  const themeClass = dark ? "dp-dark" : "dp-light";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Single transition rule: applied to every element via the root class ── */
        .dp-dark, .dp-light,
        .dp-dark *, .dp-light * {
          transition:
            background-color .35s ease,
            border-color .35s ease,
            color .35s ease,
            box-shadow .35s ease;
        }
        /* But never transition transforms or opacity (they're used for other animations) */
        .dp-dark *[style*="transform"], .dp-light *[style*="transform"] { transition: background-color .35s ease, border-color .35s ease, color .35s ease; }

        /* ── CSS variables by theme ── */
        .dp-dark  { --bg:#030712; --surface:#0a0f1e; --surface2:#060c18; --border:#1e293b; --border2:#0f172a; --text:#f1f5f9; --muted:#475569; --faint:#1e293b; --accent:#3b82f6; --tag:#0f172a; --grid:#1e293b18; --success:#34d399; --success-bg:#0a2a1a; --success-border:#34d39940; --danger:#f87171; --danger-bg:#1a0505; --hover-row:#0d1f3c; }
        .dp-light { --bg:#f0f4ff; --surface:#ffffff; --surface2:#f8faff; --border:#dbeafe; --border2:#eff6ff; --text:#0f172a; --muted:#64748b; --faint:#cbd5e1; --accent:#2563eb; --tag:#eff6ff; --grid:#2563eb0d; --success:#059669; --success-bg:#d1fae5; --success-border:#05996940; --danger:#dc2626; --danger-bg:#fee2e2; --hover-row:#eff6ff; }

        /* ── Base styles ── */
        .dp-wrap { min-height:100vh; background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; }
        .dp-grid-bg { position:fixed; inset:0; background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; z-index:0; }
        .dp-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px; }
        .dp-inner { background:var(--surface2); border:1px solid var(--border2); border-radius:12px; padding:16px 8px; }
        .dp-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:12px; font-family:'JetBrains Mono',monospace; }
        .dp-textarea { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:13px 16px; color:var(--text); font-size:16px; font-family:'Inter',sans-serif; resize:vertical; line-height:1.7; }
        .dp-textarea:focus { border-color:var(--accent); box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent); outline:none; }
        .dp-btn-primary { background:linear-gradient(135deg,#1d4ed8,#3b82f6); border:none; border-radius:10px; color:#fff; cursor:pointer; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:13px; padding:10px 22px; box-shadow:0 4px 18px #3b82f640; display:flex; align-items:center; gap:8px; }
        .dp-btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
        .dp-btn-primary:active { transform:translateY(0); }
        .dp-btn-primary:disabled { background:var(--tag); color:var(--muted); cursor:not-allowed; box-shadow:none; filter:none; transform:none; }
        .dp-btn-sm { background:var(--tag); border:1px solid var(--border); border-radius:8px; color:var(--muted); cursor:pointer; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:12px; padding:7px 14px; }
        .dp-btn-sm:hover { border-color:var(--accent); color:var(--accent); }
        .dp-btn-sm.copied { background:var(--success-bg); border-color:var(--success-border); color:var(--success); }
        .dp-btn-xl { background:var(--success-bg); border:1px solid var(--success-border); border-radius:8px; color:var(--success); cursor:pointer; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:12px; padding:7px 16px; display:flex; align-items:center; gap:6px; }
        .dp-btn-xl:hover { filter:brightness(1.05); }
        .dp-tr:hover { background:var(--hover-row) !important; }
        .dp-tag { border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; padding:3px 9px; }
        .dp-legend-item { display:flex; align-items:center; gap:6px; background:var(--surface2); border-radius:8px; padding:5px 11px; cursor:default; }
        .dp-legend-item:hover { background:var(--hover-row); }
        .dp-header { position:sticky; top:0; z-index:50; background:color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); padding:14px 28px; display:flex; align-items:center; gap:14px; }

        /* ── Entry animations (no conflict with theme transition) ── */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{box-shadow:0 0 0 0 #3b82f640} 50%{box-shadow:0 0 0 7px #3b82f600} }
        .anim-fade-up  { animation: fadeUp .5s ease both; }
        .anim-fade-in  { animation: fadeIn .5s ease both; }

        ::-webkit-scrollbar{height:4px;width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
        ::-webkit-scrollbar-track{background:transparent;}
      `}</style>

      <div className={`dp-wrap ${themeClass}`} style={{ opacity: mounted ? 1 : 0, transition: "opacity .3s ease" }}>
        <div className="dp-grid-bg" />

        {/* Orbs */}
        <div style={{ position:"fixed", top:"15%", left:"5%", width:320, height:320, borderRadius:"50%", background: dark?"#1d4ed808":"#bfdbfe30", filter:"blur(80px)", pointerEvents:"none", zIndex:0 }} />
        <div style={{ position:"fixed", bottom:"20%", right:"8%", width:260, height:260, borderRadius:"50%", background: dark?"#31288108":"#ddd6fe25", filter:"blur(70px)", pointerEvents:"none", zIndex:0 }} />

        {/* Header */}
        <header className="dp-header anim-fade-in">
          <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, boxShadow:"0 4px 18px #3b82f640", flexShrink:0 }}>🔗</div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.3px" }}>O'zbek Dependency Parser</div>
            <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace", marginTop:1 }}>Universal Dependencies · AI tahlil</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:"pulse 2.2s infinite" }} />
              <span style={{ fontSize:11, color:"var(--muted)", fontFamily:"'JetBrains Mono',monospace" }}>Claude API</span>
            </div>
            <Toggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </header>

        <main style={{ maxWidth:980, margin:"0 auto", padding:"28px 20px 60px", position:"relative", zIndex:5 }}>

          {/* Input */}
          <div className="dp-card anim-fade-up" style={{ animationDelay:".05s" }}>
            <div className="dp-label">📝 Asl matn</div>
            <textarea className="dp-textarea" value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) analyze(); }}
              placeholder="O'zbek tilida gap kiriting..." rows={3} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, flexWrap:"wrap", gap:10 }}>
              <span style={{ fontSize:11, color:"var(--faint)", fontFamily:"'JetBrains Mono',monospace" }}>Ctrl+Enter — tahlil qilish</span>
              <button className="dp-btn-primary" onClick={analyze} disabled={loading||!text.trim()}>
                {loading
                  ? <><span style={{ width:13, height:13, border:"2px solid var(--muted)", borderTopColor:"var(--accent)", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>Tahlil qilinmoqda</>
                  : "▶  Tahlil qilish"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"var(--danger-bg)", border:"1px solid color-mix(in srgb,var(--danger) 30%,transparent)", borderRadius:12, padding:"12px 16px", color:"var(--danger)", marginTop:16, fontSize:13 }} className="anim-fade-up">
              ⚠  {error}
            </div>
          )}

          {/* Results */}
          {tokens && (
            <div className="dp-card anim-fade-up" style={{ marginTop:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div className="dp-label" style={{ margin:0 }}>🌐 Matn tahlili</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className={`dp-btn-sm${copied?" copied":""}`} onClick={()=>{
                    const lines=["#\tToken\tLemma\tPOS\tFeats\tHead\tDep"];
                    tokens.forEach(t=>lines.push(`${t.id}\t${t.form}\t${t.lemma||""}\t${t.pos||""}\t${t.feats||""}\t${t.head}\t${t.dep}`));
                    navigator.clipboard.writeText(lines.join("\n"));
                    setCopied(true); setTimeout(()=>setCopied(false),2000);
                  }}>{copied?"✓ Nusxalandi":"📋 TSV nusxa"}</button>
                  <button className="dp-btn-xl" onClick={downloadExcel} style={xlDone?{boxShadow:"0 0 12px var(--success-border)"}:{}}>
                    <span style={{fontSize:14}}>{xlDone?"✓":"↓"}</span>
                    {xlDone?"Yuklandi!":"Excel yuklash"}
                  </button>
                </div>
              </div>

              <div className="dp-inner">
                <TreeSVG tokens={tokens} dark={dark} />
              </div>

              {/* Table */}
              <div style={{ overflowX:"auto", marginTop:20, borderRadius:12, border:"1px solid var(--border)", transition:"opacity .5s ease .25s, transform .5s ease .25s", opacity:tableVis?1:0, transform:tableVis?"none":"translateY(10px)" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"var(--surface2)" }}>
                      {["#","Token","Lemma","POS","Feats","Head","Dep","Izoh"].map(h=>(
                        <th key={h} style={{ padding:"9px 13px", fontSize:11, fontWeight:700, textAlign:"left", fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:"uppercase", borderBottom:"1px solid var(--border)", color:"var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((tok,i)=>{
                      const dc = c(tok.dep, dark);
                      return (
                        <tr key={i} className="dp-tr" style={{ borderBottom:"1px solid var(--border2)", animation:`fadeUp .35s ease ${i*.04}s both` }}>
                          <td style={{ padding:"8px 13px", fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"var(--faint)" }}>{i+1}</td>
                          <td style={{ padding:"8px 13px", fontSize:13, fontWeight:700, color:"var(--text)" }}>{tok.form}</td>
                          <td style={{ padding:"8px 13px", fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"var(--muted)" }}>{tok.lemma||"—"}</td>
                          <td style={{ padding:"8px 13px" }}>
                            <span className="dp-tag" style={{ background:dc+"18", color:dc }}>{tok.pos||"—"}</span>
                          </td>
                          <td style={{ padding:"8px 13px", fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:"var(--muted)" }}>{tok.feats||"—"}</td>
                          <td style={{ padding:"8px 13px", fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"var(--muted)" }}>{tok.head??0}</td>
                          <td style={{ padding:"8px 13px" }}>
                            <span className="dp-tag" style={{ background:dc+"18", color:dc, border:`1px solid ${dc}35` }}>{tok.dep}</span>
                          </td>
                          <td style={{ padding:"8px 13px", fontSize:11, color:"var(--muted)" }}>{UD_TAGS[tok.dep]||tok.dep}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="dp-card anim-fade-up" style={{ marginTop:20, animationDelay:".15s" }}>
            <div className="dp-label">UD Teglar · O'zbek tili</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {Object.entries(UD_TAGS).slice(0,20).map(([dep,uz])=>{
                const dc = c(dep, dark);
                return (
                  <div key={dep} className="dp-legend-item" style={{ border:`1px solid ${dc}25` }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:dc, flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:dc, fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{dep}</span>
                    <span style={{ fontSize:11, color:"var(--faint)" }}>·</span>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>{uz}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
