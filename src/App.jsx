import { useState, useEffect, useCallback, useRef, Component } from "react";
import ProductKnowledgePage from "./ProductKnowledgePage";
import OpportunityCards from "./OpportunityCards";
import CloseoutModal from "./CloseoutModal";
import OnboardingTab from "./OnboardingTab";
import Detail, { AccountForm } from "./Detail";
import {
  STYLES, SCENARIO_CFG, PLAYBOOK_LIBRARY, getTriggeredPlaybooks, getPriorityConfig,
  STAKEHOLDER_GUIDE, SEED, STAGE_CFG, ROLE_CFG,
  calcHealth, getHealthWarnings, renewalRisk,
  hColor, fmtMoney, ago, until, todayStr, shapeTask, sentIcon, initials, hue, load, save,
  Ic, ScenarioBadge, Sparkline, Ring, Bar, Badge, Avatar, Inp, Slct, Fld, Btn, ToastBar, Modal, Confirm,
  PlaybookStepView, TASK_TYPE_CFG, generateAutoTasks,
} from "./ui";
import { API_URL, loadSession, saveSession, clearSession } from "./api";

// ─── PLAYBOOK LIBRARY PAGE ────────────────────────────────────────────────────
const PlaybookDetailView = ({ playbook, onBack, activeSteps={}, onStepToggle, triggeredAccounts=[], onAccountClick }) => {
  const [expandedStep, setExpandedStep] = useState(null);
  const sc = SCENARIO_CFG[playbook.scenario]||SCENARIO_CFG["Onboarding"];
  const pc = getPriorityConfig(playbook.priority);
  const completedCount = playbook.steps.filter(s=>activeSteps[s.id]).length;
  const progress = Math.round((completedCount/playbook.steps.length)*100);
  const readOnly = !onStepToggle;

  return (
    <div style={{maxWidth:760,animation:"fadeUp .2s ease"}}>
      <button onClick={onBack}
        style={{background:"none",border:"none",color:"var(--indigo)",cursor:"pointer",
          fontSize:13,fontWeight:600,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
        ← Back to library
      </button>

      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${sc.bg} 0%,var(--bg2) 100%)`,
        border:`1.5px solid ${sc.color}33`,borderRadius:"var(--r-xl)",
        padding:"24px 28px",marginBottom:20,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:44,height:44,borderRadius:"var(--r-lg)",background:sc.color,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"white",fontSize:13,fontWeight:800,fontFamily:"var(--font-mono)"}}>{sc.abbr}</span>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:20,letterSpacing:"-.02em",marginBottom:4}}>{playbook.name}</div>
              <div style={{display:"flex",gap:8}}>
                <Badge label={playbook.scenario} color={sc.color} bg={sc.bg}/>
                <Badge label={pc.label} color={pc.color} bg={pc.bg}/>
                <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)",
                  background:"var(--bg4)",padding:"2px 8px",borderRadius:99}}>
                  {playbook.steps.length} steps
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.75,marginBottom:16}}>
          {playbook.summary}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:"var(--r)",padding:"10px 14px",backdropFilter:"blur(4px)"}}>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>When to use</div>
            <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{playbook.trigger}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:"var(--r)",padding:"10px 14px",backdropFilter:"blur(4px)"}}>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Success looks like</div>
            <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{playbook.successMetric}</div>
          </div>
        </div>
      </div>

      {/* Triggered accounts */}
      {triggeredAccounts.length > 0 && (
        <div style={{background:"var(--amber-dim)",border:"1.5px solid rgba(217,119,6,0.25)",
          borderRadius:"var(--r-lg)",padding:"14px 18px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--amber)",marginBottom:10}}>
            {triggeredAccounts.length} account{triggeredAccounts.length!==1?"s":""} triggering this playbook
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {triggeredAccounts.slice(0,5).map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                background:"white",borderRadius:"var(--r)",padding:"8px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Avatar name={a.name} size={24}/>
                  <span style={{fontSize:13,fontWeight:600}}>{a.name}</span>
                  <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>{a.plan}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:11,fontFamily:"var(--font-mono)",
                    color:a.healthScore>=70?"var(--emerald)":a.healthScore>=45?"var(--amber)":"var(--rose)",
                    fontWeight:600}}>Health {a.healthScore}</span>
                  {onAccountClick && (
                    <button onClick={()=>onAccountClick(a)}
                      style={{fontSize:11,fontWeight:600,color:"var(--indigo)",background:"var(--indigo-dim)",
                        border:"none",borderRadius:"var(--r-sm)",padding:"4px 10px",cursor:"pointer",
                        fontFamily:"var(--font-display)"}}>
                      Open →
                    </button>
                  )}
                </div>
              </div>
            ))}
            {triggeredAccounts.length > 5 && (
              <div style={{fontSize:11,color:"var(--amber)",textAlign:"center",paddingTop:4}}>
                +{triggeredAccounts.length-5} more accounts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Read-only notice */}
      {readOnly && (
        <div style={{display:"flex",alignItems:"center",gap:10,background:"var(--indigo-dim)",
          border:"1.5px solid rgba(59,94,222,0.2)",borderRadius:"var(--r)",
          padding:"10px 14px",marginBottom:16,fontSize:12,color:"var(--indigo)"}}>
          <Ic n="info" size={14} color="var(--indigo)"/>
          To track step progress, open an account and go to the <strong style={{margin:"0 3px"}}>Health & Playbook</strong> tab, then activate this playbook.
        </div>
      )}

      {/* Progress (only shown when active on an account) */}
      {completedCount > 0 && (
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
          padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600}}>Your progress</span>
            <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--indigo)",fontWeight:600}}>
              {completedCount}/{playbook.steps.length} steps · {progress}%
            </span>
          </div>
          <Bar value={progress} color={progress===100?"var(--emerald)":"var(--indigo)"}/>
        </div>
      )}

      <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
        textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
        {playbook.steps.length} steps — click any step to expand the action guide
      </div>

      {playbook.steps.map(step=>(
        <PlaybookStepView
          key={step.id}
          step={step}
          done={!!activeSteps[step.id]}
          onToggle={()=>onStepToggle&&onStepToggle(step.id)}
          expanded={expandedStep===step.id}
          onExpand={()=>setExpandedStep(expandedStep===step.id?null:step.id)}
        />
      ))}
    </div>
  );
};

const PlaybookLibraryPage = ({ accounts, onUpdate, onAccountClick }) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [filterScenario,   setFilterScenario]   = useState("All");
  const [filterPriority,   setFilterPriority]   = useState("All");
  const [search,           setSearch]           = useState("");
  const [showAllAttention, setShowAllAttention] = useState(false);

  const scenarios  = ["All","Onboarding","Churn Risk","Renewal","Executive"];
  const priorities = ["All","Critical","High","Medium"];

  const filtered = PLAYBOOK_LIBRARY.filter(pb => {
    if (filterScenario !== "All" && pb.scenario !== filterScenario) return false;
    if (filterPriority !== "All" && pb.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![pb.name,pb.scenario,pb.summary].some(t=>t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  // Per-playbook active account count
  const activeCountByPb = {};
  accounts.forEach(a => {
    if (a.activePlaybookId) activeCountByPb[a.activePlaybookId] = (activeCountByPb[a.activePlaybookId]||0)+1;
  });

  // Accounts needing attention — triggered but no active playbook
  const needsAttention = accounts.filter(a =>
    getTriggeredPlaybooks(a).length > 0 && !a.activePlaybookId
  );
  const activeNow = accounts.filter(a => a.activePlaybookId);
  const attentionVisible = showAllAttention ? needsAttention : needsAttention.slice(0, 4);

  if (selectedPlaybook) {
    const triggeredAccounts = accounts.filter(a =>
      getTriggeredPlaybooks(a).some(pb => pb.id === selectedPlaybook.id)
    );
    return (
      <PlaybookDetailView
        playbook={selectedPlaybook}
        onBack={()=>setSelectedPlaybook(null)}
        activeSteps={{}}
        onStepToggle={null}
        triggeredAccounts={triggeredAccounts}
        onAccountClick={onAccountClick}
      />
    );
  }

  return (
    <div style={{maxWidth:900,animation:"fadeUp .2s ease"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Playbooks</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            {PLAYBOOK_LIBRARY.length} plays sourced from Gainsight, ChurnZero & top CS leaders
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          { label:"Total plays",     value:PLAYBOOK_LIBRARY.length, color:"var(--indigo)",  border:"var(--border)" },
          { label:"Scenarios",       value:4,                       color:"var(--teal)",    border:"var(--border)" },
          { label:"Active now",      value:activeNow.length,        color:"var(--emerald)", border:activeNow.length?"rgba(5,150,105,0.25)":"var(--border)" },
          { label:"Need attention",  value:needsAttention.length,   color:"var(--amber)",   border:needsAttention.length?"rgba(217,119,6,0.3)":"var(--border)" },
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:`1.5px solid ${s.border}`,
            borderTop:`3px solid ${s.color}`,borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:28,color:s.color,marginBottom:4,letterSpacing:"-.02em"}}>
              {s.value}
            </div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Needs Attention panel */}
      {needsAttention.length > 0 && (
        <div style={{background:"var(--bg2)",border:"1.5px solid rgba(217,119,6,0.3)",
          borderRadius:"var(--r-lg)",padding:"18px 20px",marginBottom:28,boxShadow:"var(--shadow-sm)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--amber)"}}/>
              <span style={{fontWeight:700,fontSize:14}}>Accounts needing a playbook</span>
              <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--amber)",
                background:"var(--amber-dim)",padding:"1px 8px",borderRadius:99,fontWeight:600}}>
                {needsAttention.length}
              </span>
            </div>
            <span style={{fontSize:12,color:"var(--text3)"}}>Pulse detected signals — activate a playbook to act</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {attentionVisible.map(a => {
              const suggested = getTriggeredPlaybooks(a)[0];
              const sc = suggested ? SCENARIO_CFG[suggested.scenario]||SCENARIO_CFG["Onboarding"] : null;
              return (
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,
                  background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",
                  border:"1.5px solid var(--border)"}}>
                  <Avatar name={a.name} size={32}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{a.name}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"var(--text3)"}}>{a.plan}</span>
                      <span style={{fontSize:11,color:"var(--text3)"}}>·</span>
                      <span style={{fontSize:11,fontFamily:"var(--font-mono)",
                        color:a.healthScore>=70?"var(--emerald)":a.healthScore>=45?"var(--amber)":"var(--rose)",
                        fontWeight:600}}>Health {a.healthScore}</span>
                    </div>
                  </div>
                  {suggested && sc && (
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <div style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:"var(--r-sm)",
                        background:sc.bg,color:sc.color,border:`1px solid ${sc.color}33`,
                        maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {suggested.name}
                      </div>
                    </div>
                  )}
                  {onAccountClick && (
                    <button onClick={()=>onAccountClick(a)}
                      style={{flexShrink:0,background:"var(--indigo)",color:"white",border:"none",
                        borderRadius:"var(--r-sm)",padding:"7px 14px",fontSize:12,fontWeight:600,
                        cursor:"pointer",fontFamily:"var(--font-display)",whiteSpace:"nowrap"}}>
                      Open account
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {needsAttention.length > 4 && (
            <button onClick={()=>setShowAllAttention(v=>!v)}
              style={{marginTop:10,background:"none",border:"none",color:"var(--indigo)",
                fontSize:12,fontWeight:600,cursor:"pointer",padding:0}}>
              {showAllAttention ? "Show less ↑" : `Show ${needsAttention.length-4} more ↓`}
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {scenarios.map(s=>{
            const cfg=SCENARIO_CFG[s];
            const isActive=filterScenario===s;
            return (
              <button key={s} onClick={()=>setFilterScenario(s)} className="pill-btn"
                style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                  fontFamily:"var(--font-display)",fontWeight:isActive?600:400,
                  border:`1.5px solid ${isActive?(cfg?.color||"var(--indigo)"):"var(--border)"}`,
                  background:isActive?(cfg?.bg||"var(--indigo-dim)"):"var(--bg2)",
                  color:isActive?(cfg?.color||"var(--indigo)"):"var(--text2)"}}>
                {s}
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          {priorities.map(p=>{
            const pc=getPriorityConfig(p);
            const isActive=filterPriority===p;
            return (
              <button key={p} onClick={()=>setFilterPriority(p)} className="pill-btn"
                style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                  fontFamily:"var(--font-display)",fontWeight:isActive?600:400,
                  border:`1.5px solid ${isActive?pc.color:"var(--border)"}`,
                  background:isActive?pc.bg:"var(--bg2)",
                  color:isActive?pc.color:"var(--text2)"}}>
                {p}
              </button>
            );
          })}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search playbooks…"
          style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
            padding:"8px 14px",color:"var(--text)",fontFamily:"var(--font-display)",
            fontSize:13,outline:"none",width:200,marginLeft:"auto"}}/>
      </div>

      {/* Playbook cards by scenario */}
      {scenarios.filter(s=>s!=="All").filter(s=>filterScenario==="All"||filterScenario===s).map(scenario=>{
        const scenarioPbs = filtered.filter(pb=>pb.scenario===scenario);
        if (!scenarioPbs.length) return null;
        const sc = SCENARIO_CFG[scenario];
        return (
          <div key={scenario} style={{marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:"var(--r-sm)",background:sc.color,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:"white",fontSize:10,fontWeight:800,fontFamily:"var(--font-mono)"}}>{sc.abbr}</span>
              </div>
              <span style={{fontWeight:700,fontSize:15,color:sc.color}}>{scenario}</span>
              <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                {scenarioPbs.length} play{scenarioPbs.length!==1?"s":""}
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
              {scenarioPbs.map(pb=>{
                const pc = getPriorityConfig(pb.priority);
                const activeCount = activeCountByPb[pb.id]||0;
                const triggeredCount = accounts.filter(a=>
                  getTriggeredPlaybooks(a).some(t=>t.id===pb.id)
                ).length;
                return (
                  <div key={pb.id} onClick={()=>setSelectedPlaybook(pb)}
                    className="card-hover"
                    style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
                      borderRadius:"var(--r-lg)",padding:"18px 20px",cursor:"pointer",
                      boxShadow:"var(--shadow-sm)",position:"relative",overflow:"hidden",
                      display:"flex",flexDirection:"column",gap:0}}>
                    {/* Colour bar */}
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                      background:sc.color,opacity:0.6}}/>
                    {/* Priority + scenario */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <Badge label={pb.scenario} color={sc.color} bg={sc.bg} small/>
                      <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
                    </div>
                    {/* Name */}
                    <div style={{fontWeight:700,fontSize:14,marginBottom:6,lineHeight:1.3}}>{pb.name}</div>
                    {/* Trigger condition */}
                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:8,fontStyle:"italic",lineHeight:1.5}}>
                      Trigger: {pb.trigger}
                    </div>
                    {/* Summary */}
                    <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:14,flex:1}}>
                      {pb.summary.slice(0,90)}…
                    </div>
                    {/* Footer */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                      paddingTop:10,borderTop:"1px solid var(--border)"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
                          {pb.steps.length} steps
                        </span>
                        {triggeredCount > 0 && (
                          <span style={{fontSize:10,fontWeight:600,color:"var(--amber)",
                            background:"var(--amber-dim)",padding:"1px 7px",borderRadius:99}}>
                            {triggeredCount} triggered
                          </span>
                        )}
                        {activeCount > 0 && (
                          <span style={{fontSize:10,fontWeight:600,color:"var(--emerald)",
                            background:"var(--emerald-dim)",padding:"1px 7px",borderRadius:99}}>
                            {activeCount} active
                          </span>
                        )}
                      </div>
                      <span style={{fontSize:12,color:"var(--indigo)",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                        View <Ic n="arrow_right" size={12} color="var(--indigo)"/>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",background:"var(--bg2)",
          border:"1.5px dashed var(--border2)",borderRadius:"var(--r-lg)",color:"var(--text3)",fontSize:13}}>
          No playbooks match your filters
        </div>
      )}
    </div>
  );
};

// ─── Bulk upload ──────────────────────────────────────────────────────────────
const TEMPLATE_FIELDS = [
  { key:"name",         label:"Company Name",      required:true,  hint:"e.g. Noon E-Commerce"           },
  { key:"domain",       label:"Company Domain",    required:false, hint:"e.g. noon.com (for email match)" },
  { key:"industry",     label:"Industry",          required:false, hint:"e.g. E-Commerce"                 },
  { key:"plan",         label:"Plan",              required:false, hint:"Starter / Growth / Enterprise"   },
  { key:"arr",          label:"ARR ($)",           required:false, hint:"e.g. 84000"                      },
  { key:"renewalDate",  label:"Renewal Date",      required:false, hint:"YYYY-MM-DD"                      },
  { key:"lastContact",  label:"Last Contact",      required:false, hint:"YYYY-MM-DD"                      },
  { key:"nps",          label:"NPS (0-100)",       required:false, hint:"e.g. 65"                         },
  { key:"ces",          label:"CES (1-5)",         required:false, hint:"e.g. 3.8"                        },
  { key:"productUsage", label:"Product Usage (%)", required:false, hint:"e.g. 75"                         },
  { key:"openTickets",  label:"Open Tickets",      required:false, hint:"e.g. 2"                          },
  { key:"nextAction",   label:"Next Action",       required:false, hint:"e.g. Book QBR by Feb 1"          },
  { key:"notes",        label:"Notes",             required:false, hint:"Key context, risks…"             },
];

const downloadTemplate = () => {
  const header  = TEMPLATE_FIELDS.map(f=>f.label).join(",");
  const example = ["Noon E-Commerce","noon.com","E-Commerce","Enterprise","120000","2026-09-15","2026-04-10","72","4.2","88","2","Send renewal proposal to Sara","Strong relationship with Sara"].join(",");
  const hint    = TEMPLATE_FIELDS.map(f=>f.hint).join(",");
  const csv     = [header, example, `# Hints: ${hint}`].join("\n");
  const blob    = new Blob([csv],{type:"text/csv"});
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href=url; a.download="pulse_accounts_template.csv"; a.click();
  URL.revokeObjectURL(url);
};

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith("#"));
  if(lines.length<2) return {headers:[],rows:[]};
  const parseRow = line => {
    const cols=[]; let cur="",inQ=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c==='"'){inQ=!inQ;}
      else if(c===','&&!inQ){cols.push(cur.trim());cur="";}
      else{cur+=c;}
    }
    cols.push(cur.trim());
    return cols;
  };
  const headers = parseRow(lines[0]).map(h=>h.replace(/"/g,"").trim());
  const rows    = lines.slice(1).map((line,i)=>{
    const vals=parseRow(line); const obj={};
    headers.forEach((h,j)=>{obj[h]=(vals[j]||"").replace(/"/g,"").trim();});
    obj.__rowNum=i+2;
    return obj;
  });
  return {headers,rows};
};

const mapHeaders = (headers) => {
  const normalize = s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
  const fieldMap  = {};
  TEMPLATE_FIELDS.forEach(f=>{
    const fNorm=normalize(f.label), fKey=normalize(f.key);
    const match=headers.find(h=>{
      const hNorm=normalize(h);
      return hNorm===fNorm||hNorm===fKey||hNorm.includes(fKey)||fKey.includes(hNorm);
    });
    if(match) fieldMap[match]=f.key;
  });
  return fieldMap;
};

const validateRow = (raw, headerMap) => {
  const r={};
  Object.entries(headerMap).forEach(([h,key])=>{r[key]=raw[h]||"";});
  const errors=[],warnings=[];
  if(!r.name) errors.push("Company Name is required");
  const validPlans=["Starter","Growth","Enterprise"];
  if(r.plan&&!validPlans.includes(r.plan)) errors.push("Plan must be Starter, Growth, or Enterprise");
  if(!r.plan) r.plan="Starter";
  if(r.arr&&isNaN(Number(r.arr))) errors.push("ARR must be a number");
  if(r.nps&&(isNaN(Number(r.nps))||Number(r.nps)<0||Number(r.nps)>100)) errors.push("NPS must be 0–100");
  if(r.ces&&(isNaN(Number(r.ces))||Number(r.ces)<1||Number(r.ces)>5)) errors.push("CES must be 1–5");
  if(r.productUsage&&(isNaN(Number(r.productUsage))||Number(r.productUsage)<0||Number(r.productUsage)>100)) errors.push("Product Usage must be 0–100");
  if(r.openTickets&&isNaN(Number(r.openTickets))) errors.push("Open Tickets must be a number");
  if(r.renewalDate){
    const d=new Date(r.renewalDate);
    if(isNaN(d.getTime())) errors.push("Renewal Date must be YYYY-MM-DD");
    else if(d<new Date()) warnings.push("Renewal date is in the past");
  }
  const ces=parseFloat(r.ces)||3.5, nps=parseInt(r.nps)||50, usage=parseInt(r.productUsage)||60, tickets=parseInt(r.openTickets)||0;
  const {total,stage}=calcHealth({nps,ces,productUsage:usage,openTickets:tickets});
  if(r.lastContact){const d=new Date(r.lastContact);if(isNaN(d.getTime()))errors.push("Last Contact must be YYYY-MM-DD");}
  const account={
    id:Date.now()+Math.random(), name:r.name, domain:r.domain?.trim().toLowerCase()||"",
    industry:r.industry||"", plan:r.plan,
    arr:parseInt(r.arr)||0, renewalDate:r.renewalDate||"", nps, ces,
    cesHistory:[{date:todayStr(),value:ces}], productUsage:usage, openTickets:tickets,
    healthScore:total, churnRisk:100-total, stage,
    lastContact:r.lastContact||todayStr(), archived:false,
    nextAction:r.nextAction||"", notes:r.notes||"",
    stakeholders:[], activityLog:[], successPlan:{goal:"",milestones:[]},
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"",
  };
  return {account,errors,warnings,rowNum:raw.__rowNum};
};

const BulkUpload = ({ onClose, onImport, existingNames, toast }) => {
  const [step,setStep]           = useState(1);
  const [dragging,setDragging]   = useState(false);
  const [results,setResults]     = useState([]);
  const [importing,setImporting] = useState(false);
  const [doneCount,setDoneCount] = useState(0);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const processFile = file => {
    if(!file) return;
    if(!file.name.endsWith(".csv")){toast("Please upload a .csv file","error");return;}
    const reader=new FileReader();
    reader.onload=e=>{
      const {headers,rows}=parseCSV(e.target.result);
      if(!rows.length){toast("File appears empty or unreadable","error");return;}
      const headerMap=mapHeaders(headers);
      const parsed=rows.map(r=>{
        const res=validateRow(r,headerMap);
        const isDup=existingNames.includes(res.account.name.toLowerCase().trim());
        if(isDup) res.warnings.push("Account with this name already exists");
        return {...res,selected:res.errors.length===0};
      });
      setResults(parsed); setStep(2);
    };
    reader.readAsText(file);
  };

  const handleDrop=e=>{e.preventDefault();setDragging(false);processFile(e.dataTransfer.files[0]);};
  const toggleRow=id=>setResults(p=>p.map((r,i)=>i===id?{...r,selected:!r.selected}:r));
  const selectAll=val=>setResults(p=>p.map(r=>r.errors.length===0?{...r,selected:val}:r));

  const validRows=results.filter(r=>r.errors.length===0);
  const selectedRows=results.filter(r=>r.selected);
  const errorRows=results.filter(r=>r.errors.length>0);

  const doImport=()=>{
    setImporting(true);
    setTimeout(()=>{
      onImport(selectedRows.map(r=>r.account));
      setDoneCount(selectedRows.length);
      setStep(3);
      setImporting(false);
    },600);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:860,
        maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>
        <div style={{padding:"20px 28px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:17}}>Bulk Import Accounts</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:3,fontFamily:"var(--font-mono)"}}>
              {step===1?"Step 1 of 2 — Upload your CSV":step===2?`Step 2 of 2 — Review ${results.length} rows`:"Import complete"}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {[1,2].map(s=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"var(--font-mono)",
                    background:step>=s?"var(--indigo)":"var(--bg4)",color:step>=s?"white":"var(--text3)"}}>
                    {step>s?"✓":s}
                  </div>
                  {s<2&&<div style={{width:24,height:2,background:step>s?"var(--indigo)":"var(--border)",borderRadius:99}}/>}
                </div>
              ))}
            </div>
            <button onClick={onClose} className="icon-btn"
              style={{background:"var(--bg3)",border:"none",color:"var(--text2)",width:32,height:32,
                borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic n="close" size={14} color="var(--text2)"/></button>
          </div>
        </div>

        <div style={{overflow:"auto",flex:1,padding:28}}>
          {step===1&&(
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {[{num:1,icon:"↓",title:"Download template",desc:"Pre-formatted CSV with all required and optional fields."},
                  {num:2,icon:"✎",title:"Fill your data",desc:"One account per row. Example row included."},
                  {num:3,icon:"→",title:"Upload & review",desc:"Preview all rows, fix errors, then import."}].map(s=>(
                  <div key={s.num} style={{background:"var(--bg3)",borderRadius:"var(--r-lg)",padding:18,textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{s.title}</div>
                    <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.2)",
                borderRadius:"var(--r-lg)",padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"var(--indigo)",marginBottom:4}}>Start with the template</div>
                  <div style={{fontSize:12,color:"var(--text2)"}}>
                    Contains: Company Name (required) + {TEMPLATE_FIELDS.filter(f=>!f.required).length} optional fields
                  </div>
                </div>
                <button onClick={downloadTemplate}
                  style={{background:"var(--indigo)",color:"white",border:"none",borderRadius:"var(--r)",
                    padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",
                    whiteSpace:"nowrap",boxShadow:"0 4px 12px var(--indigo-glow)"}}>
                  ↓ Download Template
                </button>
              </div>
              <div onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
                style={{border:`2px dashed ${dragging?"var(--indigo)":"var(--border2)"}`,
                  borderRadius:"var(--r-lg)",padding:"48px 32px",textAlign:"center",
                  background:dragging?"var(--indigo-dim)":"var(--bg3)",transition:"all .2s",cursor:"pointer"}}
                onClick={()=>document.getElementById("csv-input").click()}>
                <div style={{fontSize:40,marginBottom:12}}>↑</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6,color:dragging?"var(--indigo)":"var(--text)"}}>
                  {dragging?"Drop it here":"Drag & drop your CSV file here"}
                </div>
                <div style={{fontSize:13,color:"var(--text3)",marginBottom:16}}>or click to browse</div>
                <input id="csv-input" type="file" accept=".csv" style={{display:"none"}}
                  onChange={e=>processFile(e.target.files[0])}/>
                <div style={{display:"inline-block",background:"var(--bg2)",border:"1.5px solid var(--border)",
                  borderRadius:"var(--r-sm)",padding:"8px 18px",fontSize:12,fontFamily:"var(--font-mono)",color:"var(--text2)"}}>
                  Choose .csv file
                </div>
              </div>
            </div>
          )}

          {step===2&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[{label:"Total Rows",value:results.length,color:"var(--indigo)"},
                  {label:"Ready",value:validRows.length,color:"var(--emerald)"},
                  {label:"Errors",value:errorRows.length,color:errorRows.length?"var(--rose)":"var(--text3)"},
                  {label:"Selected",value:selectedRows.length,color:"var(--indigo)"}].map(s=>(
                  <div key={s.label} style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"14px 16px",textAlign:"center"}}>
                    <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {errorRows.length>0&&validRows.length>0&&(
                <div style={{background:"var(--amber-dim)",border:"1.5px solid rgba(217,119,6,.2)",
                  borderRadius:"var(--r)",padding:"12px 16px",fontSize:13,color:"var(--text2)",display:"flex",gap:10}}>
                  <span>💡</span>
                  <span><strong>{errorRows.length} row{errorRows.length!==1?"s":""} have errors</strong> — deselected. You can import the {validRows.length} valid rows now.</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>selectAll(true)} style={{fontSize:12,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Select all valid ({validRows.length})</button>
                  <span style={{color:"var(--border2)"}}>·</span>
                  <button onClick={()=>selectAll(false)} style={{fontSize:12,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Deselect all</button>
                </div>
                <button onClick={()=>{setStep(1);setResults([]);}} style={{fontSize:12,color:"var(--text2)",background:"none",border:"none",cursor:"pointer"}}>← Upload different file</button>
              </div>
              <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"40px 28px 1.5fr 1fr 1fr 80px 70px 70px 80px",
                  padding:"10px 16px",background:"var(--bg3)",borderBottom:"1.5px solid var(--border)",
                  fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600}}>
                  <div>#</div><div/><div>Company</div><div>Plan</div><div>Industry</div><div>ARR</div><div>NPS</div><div>CES</div><div>Status</div>
                </div>
                <div style={{maxHeight:360,overflow:"auto"}}>
                  {results.map((r,i)=>{
                    const hasError=r.errors.length>0, hasWarn=r.warnings.length>0;
                    return (
                      <div key={i} style={{display:"grid",gridTemplateColumns:"40px 28px 1.5fr 1fr 1fr 80px 70px 70px 80px",
                        padding:"10px 16px",fontSize:13,borderBottom:"1px solid var(--border)",alignItems:"center",
                        background:hasError?"rgba(225,29,72,0.03)":r.selected?"rgba(59,94,222,0.02)":"var(--bg2)",
                        opacity:hasError?0.6:1}}>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text3)"}}>{r.rowNum}</div>
                        <input type="checkbox" checked={r.selected} disabled={hasError} onChange={()=>toggleRow(i)}
                          style={{width:14,height:14,cursor:hasError?"not-allowed":"pointer",accentColor:"var(--indigo)"}}/>
                        <div style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>
                          {r.account.name||<span style={{color:"var(--rose)",fontStyle:"italic"}}>Missing</span>}
                        </div>
                        <div><Badge label={r.account.plan} color="var(--sky)" bg="var(--sky-dim)" small/></div>
                        <div style={{fontSize:12,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.account.industry||"—"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12}}>{r.account.arr?fmtMoney(r.account.arr):"—"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:r.account.nps>=50?"var(--emerald)":"var(--amber)"}}>{r.account.nps||"—"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:r.account.ces>=3.5?"var(--emerald)":"var(--amber)"}}>{r.account.ces?.toFixed(1)||"—"}</div>
                        <div>
                          {hasError
                            ?<span title={r.errors.join("; ")} style={{cursor:"help"}}><Badge label={`✕ ${r.errors.length}`} color="var(--rose)" bg="var(--rose-dim)" small/></span>
                            :hasWarn
                              ?<span title={r.warnings.join("; ")} style={{cursor:"help"}}><Badge label="⚠ Warn" color="var(--amber)" bg="var(--amber-dim)" small/></span>
                              :<Badge label="✓ Ready" color="var(--emerald)" bg="var(--emerald-dim)" small/>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step===3&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{marginBottom:20,display:"flex",justifyContent:"center"}}><Ic n="success" size={52} color="var(--indigo)"/></div>
              <div style={{fontWeight:800,fontSize:22,marginBottom:10}}>{doneCount} account{doneCount!==1?"s":""} imported</div>
              <div style={{fontSize:14,color:"var(--text3)",marginBottom:32,lineHeight:1.6}}>
                Each account has been scored automatically. Open any account to add stakeholders and activate playbooks.
              </div>
              <Btn onClick={onClose} style={{padding:"12px 32px",fontSize:15}}>View Portfolio</Btn>
            </div>
          )}
        </div>

        {step===2&&(
          <div style={{padding:"16px 28px",borderTop:"1px solid var(--border)",
            display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"var(--bg2)"}}>
            <div style={{fontSize:13,color:"var(--text2)"}}>
              {selectedRows.length>0?<><strong>{selectedRows.length}</strong> selected for import</>:"No accounts selected"}
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
              <Btn onClick={doImport} style={{padding:"10px 28px",opacity:selectedRows.length===0?0.4:1}}
                disabled={selectedRows.length===0||importing}>
                {importing?"Importing…":`Import ${selectedRows.length}`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Account card ─────────────────────────────────────────────────────────────
const Card = ({ account, onClick, index }) => {
  const sc      = STAGE_CFG[account.stage]||STAGE_CFG["Stable"];
  const days    = ago(account.lastContact);
  const rdays   = until(account.renewalDate);
  const urgent  = rdays>0&&rdays<=60;
  const atRisk  = account.stage==="At Risk";
  const doneMs  = account.successPlan.milestones.filter(m=>m.done).length;
  const totalMs = account.successPlan.milestones.length;
  const planPct = totalMs>0?Math.round((doneMs/totalMs)*100):null;

  // Playbook trigger
  const triggered    = getTriggeredPlaybooks(account);
  const snoozed      = account.snoozedPlaybooks||[];
  const topPlaybook  = triggered.find(pb=>!snoozed.includes(pb.id));
  const hasActive    = !!account.activePlaybookId;
  const activePb     = hasActive ? PLAYBOOK_LIBRARY.find(p=>p.id===account.activePlaybookId) : null;
  const showPbBanner = topPlaybook && !hasActive;

  // Pre-compute playbook banner values to avoid IIFE in JSX
  const activeSc   = activePb ? SCENARIO_CFG[activePb.scenario]||SCENARIO_CFG["Onboarding"] : null;
  const activeSteps= activePb ? activePb.steps : [];
  const activeDone = activePb ? activeSteps.filter(s=>(account.activePlaybookSteps||{})[s.id]).length : 0;
  const suggestSc  = topPlaybook ? SCENARIO_CFG[topPlaybook.scenario]||SCENARIO_CFG["Onboarding"] : null;
  const suggestPc  = topPlaybook ? getPriorityConfig(topPlaybook.priority) : null;

  return (
    <div onClick={onClick} className="card-hover"
      style={{background:"var(--bg2)",
        border:`1.5px solid ${atRisk?"var(--rose-border)":urgent?"var(--amber-border)":"var(--border)"}`,
        borderRadius:"var(--r-lg)",padding:"20px 22px",cursor:"pointer",
        boxShadow:atRisk?"0 0 0 1px rgba(225,29,72,0.08),var(--shadow-sm)":"var(--shadow-sm)",
        animation:`fadeUp .3s ease ${index*0.05}s both`,position:"relative",overflow:"hidden"}}>

      <div style={{position:"absolute",top:0,left:0,right:0,height:4,
        background:`linear-gradient(90deg,${sc.color},${sc.color}44)`,
        borderRadius:"var(--r-lg) var(--r-lg) 0 0"}}/>

      {urgent&&(
        <div style={{position:"absolute",top:10,right:12,fontSize:10,fontFamily:"var(--font-mono)",
          color:rdays<=30?"var(--rose)":"var(--amber)",
          background:rdays<=30?"var(--rose-dim)":"var(--amber-dim)",
          padding:"2px 8px",borderRadius:"var(--r-xs)",fontWeight:600,letterSpacing:".03em"}}>
          {rdays}d to renew
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        marginBottom:14,marginTop:urgent?14:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={account.name} size={36}/>
          <div>
            <div style={{fontWeight:800,fontSize:15,letterSpacing:"-.02em",marginBottom:4}}>{account.name}</div>
            <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:10,color:"var(--text3)"}}>{account.industry}</span>
              <span style={{fontSize:10,color:"var(--text3)"}}>·</span>
              <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
              {account.escalationStatus==="open"&&(
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,
                  background:"var(--rose-dim)",color:"var(--rose)"}}>Escalated</span>
              )}
              {account.expansionPotential&&(
                <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,
                  background:"rgba(5,150,105,.1)",color:"var(--emerald)"}}>Expansion</span>
              )}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <Ring score={account.healthScore} size={46}/>
          {(account.healthHistory||[]).length>=2&&(
            <Sparkline
              data={(account.healthHistory||[]).map(h=>({value:h.score}))}
              color={hColor(account.healthScore)} width={46} height={16}/>
          )}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12,
        background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:"10px 8px"}}>
        {[
          {label:"ARR",  value:fmtMoney(account.arr)},
          {label:"NPS",  value:account.nps},
          {label:"CES",  value:(account.ces??3.5).toFixed(1)},
          {label:"Risk", value:`${account.churnRisk??50}%`,
            color:(account.churnRisk??50)>=60?"var(--rose)":(account.churnRisk??50)>=35?"var(--amber)":"var(--emerald)"},
        ].map(m=>(
          <div key={m.label} style={{textAlign:"center"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:13,color:m.color||"var(--text)"}}>{m.value}</div>
            <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",fontFamily:"var(--font-mono)",marginTop:2}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Health signal chips — explains WHY the score is what it is */}
      {(()=>{ const hw=getHealthWarnings(account); return hw.length>0&&(
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
          {hw.map((w,i)=>(
            <span key={i} style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
              background:w.s===2?"var(--rose-dim)":"var(--amber-dim)",
              color:w.s===2?"var(--rose)":"var(--amber)"}}>
              {w.t}
            </span>
          ))}
        </div>
      ); })()}

      {account.nextAction&&(
        <div style={{background:"var(--violet-dim)",borderRadius:"var(--r-sm)",padding:"6px 10px",marginBottom:8,
          display:"flex",gap:6,alignItems:"center"}}>
          <Ic n="target" size={11} color="var(--violet)"/>
          <span style={{fontSize:11,color:"var(--violet)",fontWeight:500,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{account.nextAction}</span>
        </div>
      )}

      {/* Active playbook indicator */}
      {activePb&&activeSc&&(
        <div style={{background:activeSc.bg,border:`1.5px solid ${activeSc.color}33`,borderRadius:"var(--r-sm)",
          padding:"6px 10px",marginBottom:8,display:"flex",gap:6,alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:6,alignItems:"center",minWidth:0}}>
            <span style={{fontSize:11,flexShrink:0}}><ScenarioBadge scenario={activePb.scenario} small/></span>
            <span style={{fontSize:11,color:activeSc.color,fontWeight:600,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activePb.name}</span>
          </div>
          <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:activeSc.color,flexShrink:0}}>
            {activeDone}/{activeSteps.length}
          </span>
        </div>
      )}

      {/* Suggested playbook banner */}
      {showPbBanner&&suggestSc&&suggestPc&&(
        <div style={{background:suggestPc.bg,border:`1.5px solid ${suggestPc.color}33`,borderRadius:"var(--r-sm)",
          padding:"6px 10px",marginBottom:8,display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:11,flexShrink:0}}>{suggestSc.icon}</span>
          <span style={{fontSize:11,color:suggestPc.color,fontWeight:600,flex:1,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            Suggested: {topPlaybook.name}
          </span>
          <Badge label={suggestPc.label} color={suggestPc.color} bg={suggestPc.bg} small/>
        </div>
      )}

      {planPct!==null&&(
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".06em"}}>Plan</span>
            <span style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{doneMs}/{totalMs}</span>
          </div>
          <Bar value={planPct} color={planPct>=70?"var(--emerald)":planPct>=40?"var(--indigo)":"var(--amber)"} thin/>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>CES</span>
          <Sparkline data={account.cesHistory} color={(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"}/>
        </div>
        <span style={{fontSize:10,fontFamily:"var(--font-mono)",
          color:days>30?"var(--rose)":days>14?"var(--amber)":"var(--text3)"}}>
          {days}d ago
        </span>
      </div>
    </div>
  );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────
const Stats = ({ accounts, isFiltered }) => {
  const totalArr =accounts.reduce((s,a)=>s+a.arr,0);
  const atRisk   =accounts.filter(a=>a.stage==="At Risk").length;
  const avgHealth=Math.round(accounts.reduce((s,a)=>s+a.healthScore,0)/(accounts.length||1));
  const avgCes   =(accounts.reduce((s,a)=>s+a.ces,0)/(accounts.length||1)).toFixed(1);
  return (
    <div style={{marginBottom:24}}>
      {isFiltered&&(
        <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--indigo)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"var(--indigo)",display:"inline-block"}}/>
          Showing {accounts.length} filtered account{accounts.length!==1?"s":""}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total ARR",  value:fmtMoney(totalArr), sub:`${accounts.length} accounts`,    color:"var(--indigo)"},
          {label:"Avg Health", value:avgHealth,           sub:"portfolio score",               color:hColor(avgHealth)},
          {label:"At Risk",    value:atRisk,              sub:"need urgent action",            color:atRisk>0?"var(--rose)":"var(--emerald)"},
          {label:"Avg CES",    value:avgCes,              sub:"effort score / 5",             color:parseFloat(avgCes)>=3.5?"var(--emerald)":"var(--amber)"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
            borderTop:`3px solid ${s.color}`,borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:24,color:s.color,marginBottom:4,letterSpacing:"-.02em"}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)",marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Empty = ({ isFiltered, onClear, onAdd, onLoadDemo }) => (
  <div style={{gridColumn:"1/-1",textAlign:"center",padding:"64px 32px",animation:"fadeUp .3s ease"}}>
    <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Ic n={isFiltered?"eye":"note"} size={44} color="var(--text3)"/></div>
    <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>{isFiltered?"No accounts match your filters":"No accounts yet"}</div>
    <div style={{fontSize:14,color:"var(--text3)",marginBottom:24,lineHeight:1.6}}>
      {isFiltered?"Try adjusting the filters or clear them.":"Add your first account or load demo data to explore the platform."}
    </div>
    {isFiltered
      ? <Btn variant="ghost" onClick={onClear}>Clear all filters</Btn>
      : <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <Btn onClick={onAdd}>+ Add your first account</Btn>
          {onLoadDemo&&<Btn variant="ghost" onClick={onLoadDemo}>Load demo data</Btn>}
        </div>
    }
  </div>
);

// ─── Tasks Page ───────────────────────────────────────────────────────────────
const TasksPage = ({ accounts, manualTasks, onAddManual, onToggleManual, onDeleteManual, onAccountClick }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask]         = useState({ title:"", description:"", accountId:"", priority:"High", dueDate:todayStr() });
  const [filterType, setFilterType]   = useState("All");
  const [filterDone, setFilterDone]   = useState(false);
  const [activeWidget, setActiveWidget] = useState(null); // null | "critical" | "overdue" | "today"

  const autoTasks = generateAutoTasks(accounts);

  // Merge auto + manual, deduplicate by id
  const allTasks = [
    ...autoTasks,
    ...manualTasks.filter(mt => !autoTasks.find(at => at.id === mt.id)),
  ];

  const filtered = allTasks
    .filter(t => filterType === "All" || t.type === filterType)
    .filter(t => filterDone ? true : !t.done);

  // Widget counts — reflect the type pill but NOT the active-widget filter, so the
  // numbers stay stable and you can switch between filters.
  const overdueCount  = filtered.filter(t => t.dueDate < todayStr() && !t.done).length;
  const todayCount    = filtered.filter(t => t.dueDate === todayStr() && !t.done).length;
  const criticalCount = filtered.filter(t => t.priority === "Critical" && !t.done).length;
  const totalOpen     = filtered.filter(t => !t.done).length;

  // Apply the active-widget filter, then bucket the result for the list sections.
  const widgetFiltered = filtered.filter(t => {
    if (activeWidget === "critical") return t.priority === "Critical" && !t.done;
    if (activeWidget === "overdue")  return t.dueDate < todayStr() && !t.done;
    if (activeWidget === "today")    return t.dueDate === todayStr() && !t.done;
    return true;
  });

  // Group by section
  const overdue  = widgetFiltered.filter(t => t.dueDate < todayStr() && !t.done);
  const today2   = widgetFiltered.filter(t => t.dueDate === todayStr() && !t.done);
  const upcoming = widgetFiltered.filter(t => t.dueDate > todayStr() && !t.done);
  const done2    = widgetFiltered.filter(t => t.done);

  const submitManual = () => {
    if (!newTask.title.trim()) return;
    const account = accounts.find(a=>a.id===parseInt(newTask.accountId));
    onAddManual({
      id: `manual-${Date.now()}`,
      type:"manual", priority:newTask.priority, auto:false, done:false,
      accountId: account?.id||null, accountName: account?.name||"General",
      title: newTask.title, description: newTask.description,
      dueDate: newTask.dueDate,
    });
    setNewTask({ title:"", description:"", accountId:"", priority:"High", dueDate:todayStr() });
    setShowAddForm(false);
  };

  const TaskRow = ({ task }) => {
    const tc  = TASK_TYPE_CFG[task.type]||TASK_TYPE_CFG.manual;
    const pc  = getPriorityConfig(task.priority);
    const isManual = !task.auto;
    return (
      <div style={{background:"var(--bg2)",border:`1.5px solid ${task.done?"var(--border)":task.priority==="Critical"?"rgba(225,29,72,0.2)":"var(--border)"}`,
        borderRadius:"var(--r)",padding:"14px 16px",display:"flex",gap:14,alignItems:"flex-start",
        opacity:task.done?0.55:1,transition:"all .15s",marginBottom:8}}>
        <input type="checkbox" checked={!!task.done}
          onChange={()=>isManual?onToggleManual(task.id):null}
          style={{width:16,height:16,marginTop:2,accentColor:"var(--emerald)",
            cursor:isManual?"pointer":"default",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:5}}>
            <span style={{fontSize:13,fontWeight:700,color:task.done?"var(--text3)":"var(--text)",
              textDecoration:task.done?"line-through":"none"}}>{task.title}</span>
          </div>
          {task.description&&(
            <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:8}}>{task.description}</div>
          )}
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:10,fontFamily:"var(--font-mono)",fontWeight:600,color:tc.color,
              background:tc.bg,padding:"2px 8px",borderRadius:"var(--r-xs)",letterSpacing:".03em"}}>{tc.abbr} · {tc.label}</span>
            <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
            {task.accountName&&(
              <button onClick={()=>{ const a=accounts.find(acc=>acc.id===task.accountId); if(a) onAccountClick(a); }}
                style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--indigo)",
                  background:"var(--indigo-dim)",padding:"1px 8px",borderRadius:99,
                  border:"none",cursor:task.accountId?"pointer":"default"}}>
                {task.accountName}
              </button>
            )}
            <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
              {task.dueDate===todayStr()?"Due today":task.dueDate<todayStr()?`Overdue ${Math.abs(Math.ceil((new Date(task.dueDate)-new Date())/86400000))}d`:`Due ${Math.ceil((new Date(task.dueDate)-new Date())/86400000)}d`}
            </span>
            {!task.auto&&(
              <button onClick={()=>onDeleteManual(task.id)}
                style={{display:"flex",alignItems:"center",color:"var(--text3)",background:"none",border:"none",cursor:"pointer",marginLeft:"auto",padding:"2px"}}><Ic n="close" size={13} color="var(--text3)"/></button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, tasks, color="var(--text2)" }) => {
    if (!tasks.length) return null;
    return (
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:14,color}}>{title}</span>
          <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)",
            background:"var(--bg4)",padding:"1px 8px",borderRadius:99}}>{tasks.length}</span>
        </div>
        {tasks.map(t=><TaskRow key={t.id} task={t}/>)}
      </div>
    );
  };

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Task List</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </div>
        </div>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:14,padding:"11px 22px"}}>+ Add Task</Btn>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Open Tasks",    value:totalOpen,     color:"var(--indigo)", wkey:null },
          {label:"Critical",      value:criticalCount, color:criticalCount>0?"var(--rose)":"var(--text3)", wkey:"critical" },
          {label:"Due Today",     value:todayCount,    color:todayCount>0?"var(--amber)":"var(--text3)", wkey:"today" },
          {label:"Overdue",       value:overdueCount,  color:overdueCount>0?"var(--rose)":"var(--text3)", wkey:"overdue" },
        ].map(s=>{
          const isActive = s.wkey!==null && activeWidget===s.wkey;
          return (
          <div key={s.label}
            onClick={()=>setActiveWidget(s.wkey===null ? null : (activeWidget===s.wkey ? null : s.wkey))}
            style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
              borderTop:`3px solid ${s.color}`,borderRadius:"var(--r-lg)",padding:"18px 20px",
              boxShadow:isActive?`0 0 0 2.5px ${s.color}`:"var(--shadow-sm)",cursor:"pointer",transition:"all .15s"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:26,color:s.color,marginBottom:4,letterSpacing:"-.02em"}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
          );
        })}
      </div>

      {/* Add task form */}
      {showAddForm&&(
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--indigo-glow)",borderRadius:"var(--r-lg)",
          padding:20,marginBottom:24,boxShadow:"var(--shadow-sm)",animation:"fadeUp .2s ease"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>New Task</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <div style={{gridColumn:"1/-1"}}>
              <Fld label="Title">
                <Inp value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))}
                  placeholder="e.g. Call Ahmed about API delays" onKeyDown={e=>e.key==="Enter"&&submitManual()}/>
              </Fld>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <Fld label="Description (optional)">
                <Inp value={newTask.description} onChange={e=>setNewTask(p=>({...p,description:e.target.value}))}
                  placeholder="Additional context…"/>
              </Fld>
            </div>
            <Fld label="Account (optional)">
              <Slct value={newTask.accountId} onChange={e=>setNewTask(p=>({...p,accountId:e.target.value}))}>
                <option value="">— No account —</option>
                {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </Slct>
            </Fld>
            <Fld label="Priority">
              <Slct value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))}>
                {["Critical","High","Medium"].map(p=><option key={p}>{p}</option>)}
              </Slct>
            </Fld>
            <Fld label="Due Date">
              <Inp type="date" value={newTask.dueDate} onChange={e=>setNewTask(p=>({...p,dueDate:e.target.value}))}/>
            </Fld>
          </div>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <Btn onClick={submitManual} style={{flex:1}}>Add Task</Btn>
            <Btn variant="ghost" onClick={()=>setShowAddForm(false)} style={{flex:1}}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
        <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em"}}>Type</span>
        {["All",...Object.keys(TASK_TYPE_CFG)].map(type=>{
          const tc=TASK_TYPE_CFG[type];
          const active=filterType===type;
          return (
            <button key={type} onClick={()=>setFilterType(type)} className="pill-btn"
              style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                fontFamily:"var(--font-mono)",fontWeight:active?600:400,
                border:`1.5px solid ${active?(tc?.color||"var(--indigo)"):"var(--border)"}`,
                background:active?(tc?.bg||"var(--indigo-dim)"):"var(--bg2)",
                color:active?(tc?.color||"var(--indigo)"):"var(--text2)"}}>
              {tc?`${tc.icon} ${tc.label}`:type}
            </button>
          );
        })}
        <button onClick={()=>setFilterDone(p=>!p)} className="pill-btn"
          style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
            fontFamily:"var(--font-mono)",marginLeft:"auto",
            border:`1.5px solid ${filterDone?"var(--indigo)":"var(--border)"}`,
            background:filterDone?"var(--indigo-dim)":"var(--bg2)",
            color:filterDone?"var(--indigo)":"var(--text2)"}}>
          {filterDone?"Hide completed":"Show completed"}
        </button>
      </div>

      {/* Task sections */}
      {overdue.length===0&&today2.length===0&&upcoming.length===0&&done2.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:13}}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Ic n="success" size={40} color="var(--emerald)"/></div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:8,color:"var(--text2)"}}>All clear</div>
          No open tasks right now. Your portfolio is in good shape.
        </div>
      )}
      <Section title="Overdue"   tasks={overdue}  color="var(--rose)"  />
      <Section title="Today"    tasks={today2}   color="var(--amber)" />
      <Section title="Upcoming" tasks={upcoming} color="var(--text2)" />
      {filterDone&&<Section title="Completed" tasks={done2} color="var(--text3)"/>}
    </div>
  );
};

// ─── Renewal Pipeline Page ────────────────────────────────────────────────────
const RenewalPipelinePage = ({ accounts, onAccountClick }) => {
  const today = new Date();

  const withRenewal = accounts
    .filter(a => a.renewalDate)
    .map(a => ({ ...a, rdays: Math.ceil((new Date(a.renewalDate) - today) / 86400000) }))
    .sort((a,b) => a.rdays - b.rdays);

  const BUCKETS = [
    { id:"overdue",    label:"Overdue",     color:"var(--rose)",   bg:"var(--rose-dim)",   filter: a => a.rdays < 0 },
    { id:"critical",   label:"≤ 30 days",   color:"var(--rose)",   bg:"var(--rose-dim)",   filter: a => a.rdays >= 0 && a.rdays <= 30 },
    { id:"urgent",     label:"31–60 days",  color:"var(--amber)",  bg:"var(--amber-dim)",  filter: a => a.rdays > 30 && a.rdays <= 60 },
    { id:"upcoming",   label:"61–90 days",  color:"var(--indigo)", bg:"var(--indigo-dim)", filter: a => a.rdays > 60 && a.rdays <= 90 },
    { id:"ontrack",    label:"90+ days",    color:"var(--emerald)",bg:"var(--emerald-dim)",filter: a => a.rdays > 90 },
  ];

  const bucketed = BUCKETS.map(b => ({
    ...b,
    accounts: withRenewal.filter(b.filter),
    arr: withRenewal.filter(b.filter).reduce((s,a) => s+a.arr, 0),
  }));

  const totalArr = withRenewal.reduce((s,a) => s+a.arr, 0);
  const urgentArr = withRenewal.filter(a => a.rdays <= 60).reduce((s,a) => s+a.arr, 0);

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{marginBottom:28}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Renewal Pipeline</h1>
        <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
          {withRenewal.length} accounts · {fmtMoney(totalArr)} total ARR
        </div>
      </div>

      {/* ARR at stake summary */}
      <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
        padding:"20px 24px",marginBottom:28,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>ARR at risk in next 60 days</div>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:28,
              color:urgentArr>0?"var(--rose)":"var(--emerald)"}}>
              {fmtMoney(urgentArr)}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Total pipeline ARR</div>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:28,color:"var(--indigo)"}}>
              {fmtMoney(totalArr)}
            </div>
          </div>
        </div>
        {/* Visual ARR bar */}
        <div style={{height:10,borderRadius:99,background:"var(--bg4)",overflow:"hidden",display:"flex",gap:2}}>
          {bucketed.filter(b=>b.arr>0).map(b=>(
            <div key={b.id} title={`${b.label}: ${fmtMoney(b.arr)}`}
              style={{height:"100%",width:`${(b.arr/totalArr)*100}%`,
                background:b.color,borderRadius:99,transition:"width .7s ease"}}/>
          ))}
        </div>
        <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
          {bucketed.filter(b=>b.accounts.length>0).map(b=>(
            <div key={b.id} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:b.color,flexShrink:0}}/>
              <span style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--font-mono)"}}>
                {b.label}: {fmtMoney(b.arr)} ({b.accounts.length})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden risk alert — accounts that look safe by timeline but are health-at-risk */}
      {(()=>{
        const hidden = withRenewal.filter(a => a.rdays > 60 && (a.healthScore??100) < 55);
        return hidden.length > 0 && (
          <div style={{background:"rgba(217,119,6,0.07)",border:"1.5px solid rgba(217,119,6,0.3)",
            borderRadius:"var(--r-lg)",padding:"16px 20px",marginBottom:24}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              <Ic n="alert" size={16} color="var(--amber)"/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"var(--amber)",marginBottom:2}}>
                  {hidden.length} account{hidden.length!==1?" are":" is"} health-at-risk despite distant renewal
                </div>
                <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5}}>
                  These accounts have 60+ days until renewal but health below 55 — the work to save them starts now, not in 60 days.
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {hidden.map(a=>(
                <div key={a.id} onClick={()=>onAccountClick(a)}
                  style={{display:"flex",alignItems:"center",gap:6,background:"white",borderRadius:"var(--r-sm)",
                    padding:"5px 10px",cursor:"pointer",border:"1px solid rgba(217,119,6,0.2)"}}>
                  <Avatar name={a.name} size={18}/>
                  <span style={{fontSize:12,fontWeight:600}}>{a.name}</span>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--rose)",fontWeight:600}}>
                    {a.healthScore}
                  </span>
                  <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                    {a.rdays}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Swimlanes */}
      {bucketed.map(bucket => {
        if (!bucket.accounts.length) return null;
        return (
          <div key={bucket.id} style={{marginBottom:32}}>
            {/* Bucket header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:bucket.color,flexShrink:0}}/>
              <span style={{fontWeight:700,fontSize:15,color:bucket.color}}>{bucket.label}</span>
              <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                {bucket.accounts.length} account{bucket.accounts.length!==1?"s":""} · {fmtMoney(bucket.arr)} ARR
              </span>
            </div>

            {/* Account cards */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {bucket.accounts.map(account => {
                const sc  = STAGE_CFG[account.stage]||STAGE_CFG["Stable"];
                const triggered = getTriggeredPlaybooks(account);
                return (
                  <div key={account.id} onClick={()=>onAccountClick(account)}
                    className="card-hover"
                    style={{background:"var(--bg2)",border:`1.5px solid ${account.rdays<=30?"rgba(225,29,72,0.2)":account.rdays<=60?"rgba(217,119,6,0.2)":"var(--border)"}`,
                      borderRadius:"var(--r-lg)",padding:"16px 20px",cursor:"pointer",
                      boxShadow:"var(--shadow-sm)",display:"flex",alignItems:"center",gap:16}}>

                    {/* Identity */}
                    <Avatar name={account.name} size={38}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{account.name}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"var(--text3)"}}>{account.industry}</span>
                        <span style={{fontSize:11,color:"var(--text3)"}}>·</span>
                        <span style={{fontSize:11,color:"var(--text3)"}}>{account.plan}</span>
                        <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
                        {(()=>{ const rr=renewalRisk(account); return (
                          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                            background:rr.bg,color:rr.color}}>{rr.label}</span>
                        ); })()}
                        {triggered.length>0&&!account.activePlaybookId&&(
                          <span style={{fontSize:10,color:"var(--amber)",fontFamily:"var(--font-mono)",
                            background:"var(--amber-dim)",padding:"1px 7px",borderRadius:99}}>
                            {triggered.length} play{triggered.length!==1?"s":""} suggested
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div style={{display:"flex",gap:20,alignItems:"center",flexShrink:0}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:15,
                          color:"var(--indigo)"}}>{fmtMoney(account.arr)}</div>
                        <div style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--font-mono)",
                          textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>ARR</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:15,
                          color:account.rdays<0?"var(--rose)":account.rdays<=30?"var(--rose)":account.rdays<=60?"var(--amber)":"var(--text2)"}}>
                          {account.rdays<0?`${Math.abs(account.rdays)}d overdue`:`${account.rdays}d`}
                        </div>
                        <div style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--font-mono)",
                          textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>Renewal</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:15,
                          color:(account.churnRisk??50)>=60?"var(--rose)":(account.churnRisk??50)>=35?"var(--amber)":"var(--emerald)"}}>
                          {account.churnRisk??'—'}%
                        </div>
                        <div style={{fontSize:9,color:"var(--text3)",fontFamily:"var(--font-mono)",
                          textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>Risk</div>
                      </div>
                      <Ring score={account.healthScore} size={44}/>
                    </div>

                    {/* Last contact */}
                    <div style={{flexShrink:0,textAlign:"right"}}>
                      <div style={{fontSize:11,fontFamily:"var(--font-mono)",
                        color:ago(account.lastContact)>30?"var(--rose)":ago(account.lastContact)>14?"var(--amber)":"var(--text3)"}}>
                        {ago(account.lastContact)}d ago
                      </div>
                      <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>last contact</div>
                    </div>

                    <span style={{fontSize:16,color:"var(--text3)",flexShrink:0}}>→</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {withRenewal.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:13}}>
          <div style={{fontSize:40,marginBottom:16}}>📅</div>
          No accounts have renewal dates set. Add renewal dates to your accounts to see the pipeline.
        </div>
      )}
    </div>
  );
};

// ─── CRM Integrations ────────────────────────────────────────────────────────

const CRM_CATALOG = [
  {
    id: "fireflies",
    name: "Fireflies.ai",
    category: "Notetaking",
    color: "#ff4f00",
    bg: "rgba(255,79,0,0.08)",
    description: "Auto-sync meeting transcripts and AI summaries from Fireflies.ai. Meetings appear in the Activity tab for matched accounts, and last-contact dates are kept up to date.",
    fields: [],
    credentials: [
      { key:"apiKey", label:"API Key", placeholder:"Your Fireflies API key", type:"password" },
    ],
    docsUrl: "https://docs.fireflies.ai/",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    color: "#ff7a59",
    bg: "rgba(255,122,89,0.08)",
    description: "Sync deals, companies, and contact activity from HubSpot CRM.",
    fields: [
      { crmKey:"name",                crmLabel:"Company name",         pulseField:"name"        },
      { crmKey:"industry",            crmLabel:"Industry",             pulseField:"industry"    },
      { crmKey:"amount",              crmLabel:"Deal amount",          pulseField:"arr"         },
      { crmKey:"closedate",           crmLabel:"Close / renewal date", pulseField:"renewalDate" },
      { crmKey:"hs_ticket_count",     crmLabel:"Open ticket count",    pulseField:"openTickets" },
      { crmKey:"notes_last_updated",  crmLabel:"Last activity date",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"apiKey",   label:"Private App Token", placeholder:"pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type:"password" },
      { key:"portalId", label:"Portal ID",         placeholder:"12345678",                                      type:"text"     },
    ],
    docsUrl: "https://developers.hubspot.com/docs/api/private-apps",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    color: "#00a1e0",
    bg: "rgba(0,161,224,0.08)",
    description: "Pull Opportunity and Account data from your Salesforce org.",
    fields: [
      { crmKey:"Name",                    crmLabel:"Account name",        pulseField:"name"        },
      { crmKey:"Industry",                crmLabel:"Industry",            pulseField:"industry"    },
      { crmKey:"Amount",                  crmLabel:"Opportunity amount",  pulseField:"arr"         },
      { crmKey:"CloseDate",               crmLabel:"Close date",          pulseField:"renewalDate" },
      { crmKey:"NumberOfOpenActivities",  crmLabel:"Open activities",     pulseField:"openTickets" },
      { crmKey:"LastActivityDate",        crmLabel:"Last activity date",  pulseField:"lastContact" },
    ],
    credentials: [
      { key:"instanceUrl",  label:"Instance URL",   placeholder:"https://yourorg.my.salesforce.com", type:"text"     },
      { key:"accessToken",  label:"Access Token",   placeholder:"00Dxx0000001gY1!ARoAQ...",          type:"password" },
    ],
    docsUrl: "https://developer.salesforce.com/docs/apis",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    category: "CRM + Zoho Desk",
    color: "#e42527",
    bg: "rgba(228,37,39,0.07)",
    description: "Import accounts from Zoho CRM and ticket counts from Zoho Desk.",
    fields: [
      { crmKey:"Account_Name",          crmLabel:"Account name",        pulseField:"name"        },
      { crmKey:"Industry",              crmLabel:"Industry",            pulseField:"industry"    },
      { crmKey:"Annual_Revenue",        crmLabel:"Annual revenue",      pulseField:"arr"         },
      { crmKey:"Contract_Renewal_Date", crmLabel:"Contract renewal",    pulseField:"renewalDate" },
      { crmKey:"Open_Tickets",          crmLabel:"Open tickets (Desk)", pulseField:"openTickets" },
      { crmKey:"Last_Activity_Time",    crmLabel:"Last activity time",  pulseField:"lastContact" },
    ],
    credentials: [
      { key:"clientId",     label:"Client ID",                        placeholder:"1000.XXXXXXXXXX",        type:"text"     },
      { key:"clientSecret", label:"Client Secret",                    placeholder:"xxxxxxxxxxxxxxxxxx",      type:"password" },
      { key:"refreshToken", label:"Refresh Token",                    placeholder:"1000.xxxxxxxxxx...",      type:"password" },
      { key:"dc",           label:"Data Center",                      placeholder:"com  (or eu, in)",        type:"text"     },
      { key:"deskOrgId",    label:"Zoho Desk Org ID (optional)",      placeholder:"20099xxxxx",              type:"text"     },
    ],
    docsUrl: "https://www.zoho.com/crm/developer/docs/api/",
  },
  {
    id: "zoho_desk",
    name: "Zoho Desk",
    category: "Ticketing",
    color: "#e42527",
    bg: "rgba(228,37,39,0.07)",
    description: "Pull open ticket counts per customer account from Zoho Desk. Use the same OAuth credentials as Zoho CRM — just add your Desk Org ID.",
    fields: [
      { crmKey:"accountName",  crmLabel:"Account name",       pulseField:"name"        },
      { crmKey:"openTickets",  crmLabel:"Open ticket count",   pulseField:"openTickets" },
      { crmKey:"modifiedTime", crmLabel:"Last ticket update",  pulseField:"lastContact" },
    ],
    credentials: [
      { key:"clientId",     label:"Client ID",     placeholder:"1000.XXXXXXXXXX",        type:"text"     },
      { key:"clientSecret", label:"Client Secret", placeholder:"xxxxxxxxxxxxxxxxxx",      type:"password" },
      { key:"refreshToken", label:"Refresh Token", placeholder:"1000.xxxxxxxxxx...",      type:"password" },
      { key:"dc",           label:"Data Center",   placeholder:"com  (or eu, in)",        type:"text"     },
      { key:"orgId",        label:"Org ID",        placeholder:"20099xxxxx",              type:"text"     },
    ],
    docsUrl: "https://desk.zoho.com/DeskAPIDocument",
  },
  {
    id: "freshdesk",
    name: "Freshdesk",
    category: "Ticketing",
    color: "#1ab394",
    bg: "rgba(26,179,148,0.08)",
    description: "Pull open ticket counts per company directly from Freshdesk Support.",
    fields: [
      { crmKey:"name",        crmLabel:"Company name",      pulseField:"name"        },
      { crmKey:"openTickets", crmLabel:"Open ticket count", pulseField:"openTickets" },
      { crmKey:"updated_at",  crmLabel:"Last ticket update",pulseField:"lastContact" },
    ],
    credentials: [
      { key:"domain", label:"Freshdesk Domain", placeholder:"yourcompany  (yourcompany.freshdesk.com)", type:"text"     },
      { key:"apiKey", label:"API Key",           placeholder:"Your Freshdesk API key",                  type:"password" },
    ],
    docsUrl: "https://developers.freshdesk.com/api/",
  },
  {
    id: "odoo",
    name: "Odoo",
    category: "CRM + Helpdesk",
    color: "#714b67",
    bg: "rgba(113,75,103,0.08)",
    description: "Connect to your Odoo instance to pull CRM leads and helpdesk tickets.",
    fields: [
      { crmKey:"name",                    crmLabel:"Lead / opportunity",  pulseField:"name"        },
      { crmKey:"categ_id",                crmLabel:"Category / industry", pulseField:"industry"    },
      { crmKey:"expected_revenue",        crmLabel:"Expected revenue",    pulseField:"arr"         },
      { crmKey:"date_deadline",           crmLabel:"Deadline / renewal",  pulseField:"renewalDate" },
      { crmKey:"ticket_count",            crmLabel:"Helpdesk tickets",    pulseField:"openTickets" },
      { crmKey:"date_last_stage_update",  crmLabel:"Last stage update",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"instanceUrl", label:"Instance URL",   placeholder:"https://yourcompany.odoo.com", type:"text"     },
      { key:"database",    label:"Database name",  placeholder:"yourcompany",                  type:"text"     },
      { key:"apiKey",      label:"API Key",         placeholder:"Your Odoo API key",            type:"password" },
    ],
    docsUrl: "https://www.odoo.com/documentation/17.0/developer/reference/external_api.html",
  },
  {
    id: "freshsales",
    name: "FreshSales",
    category: "CRM",
    color: "#1a73e8",
    bg: "rgba(26,115,232,0.07)",
    description: "Sync deals and accounts from FreshSales CRM. Pair with the Freshdesk integration separately to track ticket counts.",
    fields: [
      { crmKey:"name",              crmLabel:"Deal / account name",   pulseField:"name"        },
      { crmKey:"industry",          crmLabel:"Industry",              pulseField:"industry"    },
      { crmKey:"deal_value",        crmLabel:"Deal value",            pulseField:"arr"         },
      { crmKey:"renewal_date",      crmLabel:"Renewal date",          pulseField:"renewalDate" },
      { crmKey:"freshdesk_tickets", crmLabel:"FreshDesk open tickets",pulseField:"openTickets" },
      { crmKey:"last_contacted",    crmLabel:"Last contacted",        pulseField:"lastContact" },
    ],
    credentials: [
      { key:"domain", label:"FreshSales Domain",  placeholder:"yourcompany (yourcompany.freshsales.io)", type:"text"     },
      { key:"apiKey", label:"API Key",             placeholder:"Your FreshSales API key",                type:"password" },
    ],
    docsUrl: "https://developer.freshsales.io/api/",
  },
  {
    id: "intercom",
    name: "Intercom",
    category: "CRM + Messaging",
    color: "#286efa",
    bg: "rgba(40,110,250,0.07)",
    description: "Import company data and conversation counts from Intercom.",
    fields: [
      { crmKey:"name",                    crmLabel:"Company name",          pulseField:"name"        },
      { crmKey:"industry",                crmLabel:"Industry",              pulseField:"industry"    },
      { crmKey:"monthly_spend",           crmLabel:"Monthly spend",         pulseField:"arr"         },
      { crmKey:"renewal_date",            crmLabel:"Renewal date",          pulseField:"renewalDate" },
      { crmKey:"open_conversations",      crmLabel:"Open conversations",    pulseField:"openTickets" },
      { crmKey:"last_seen_at",            crmLabel:"Last seen date",        pulseField:"lastContact" },
    ],
    credentials: [
      { key:"accessToken", label:"Access Token", placeholder:"dG9rOm...base64token", type:"password" },
    ],
    docsUrl: "https://developers.intercom.com/docs/references/rest-api/",
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    category: "CRM",
    color: "#1a1a2e",
    bg: "rgba(26,26,46,0.06)",
    description: "Sync deals and organisations from Pipedrive into your Pulse portfolio.",
    fields: [
      { crmKey:"org_name",            crmLabel:"Organisation name",    pulseField:"name"        },
      { crmKey:"org_industry",        crmLabel:"Industry",             pulseField:"industry"    },
      { crmKey:"value",               crmLabel:"Deal value",           pulseField:"arr"         },
      { crmKey:"close_time",          crmLabel:"Expected close date",  pulseField:"renewalDate" },
      { crmKey:"activities_count",    crmLabel:"Activity count",       pulseField:"openTickets" },
      { crmKey:"last_activity_date",  crmLabel:"Last activity date",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"apiToken",   label:"API Token",    placeholder:"Your Pipedrive API token",           type:"password" },
      { key:"companyDomain", label:"Company Domain", placeholder:"yourcompany (yourcompany.pipedrive.com)", type:"text" },
    ],
    docsUrl: "https://developers.pipedrive.com/docs/api/v1",
  },
  {
    id: "dynamics365",
    name: "Microsoft Dynamics 365",
    category: "CRM",
    color: "#0078d4",
    bg: "rgba(0,120,212,0.07)",
    description: "Pull accounts and opportunities from your Dynamics 365 environment.",
    fields: [
      { crmKey:"name",                  crmLabel:"Account name",         pulseField:"name"        },
      { crmKey:"industrycode",          crmLabel:"Industry",             pulseField:"industry"    },
      { crmKey:"estimatedvalue",        crmLabel:"Estimated value",      pulseField:"arr"         },
      { crmKey:"estimatedclosedate",    crmLabel:"Estimated close date", pulseField:"renewalDate" },
      { crmKey:"numberofemployees",     crmLabel:"Open cases",           pulseField:"openTickets" },
      { crmKey:"lastusedincampaign",    crmLabel:"Last campaign date",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"tenantId",      label:"Tenant ID",         placeholder:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type:"text"     },
      { key:"clientId",      label:"Client ID",         placeholder:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type:"text"     },
      { key:"clientSecret",  label:"Client Secret",     placeholder:"Your app client secret",               type:"password" },
      { key:"instanceUrl",   label:"Dynamics Instance", placeholder:"https://yourorg.crm.dynamics.com",     type:"text"     },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview",
  },
  // ── Ticketing systems ──
  {
    id: "zendesk",
    name: "Zendesk",
    category: "Ticketing",
    color: "#03363d",
    bg: "rgba(3,54,61,0.06)",
    description: "Pull open ticket counts and last-replied dates directly from Zendesk Support.",
    fields: [
      { crmKey:"organization_name",     crmLabel:"Organisation name",    pulseField:"name"        },
      { crmKey:"notes",                 crmLabel:"Organisation notes",   pulseField:"notes"       },
      { crmKey:"open_tickets_count",    crmLabel:"Open ticket count",    pulseField:"openTickets" },
      { crmKey:"updated_at",            crmLabel:"Last ticket update",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"subdomain",  label:"Subdomain",       placeholder:"yourcompany (yourcompany.zendesk.com)", type:"text"     },
      { key:"email",      label:"Admin email",      placeholder:"admin@yourcompany.com",                type:"text"     },
      { key:"apiToken",   label:"API Token",        placeholder:"Your Zendesk API token",               type:"password" },
    ],
    docsUrl: "https://developer.zendesk.com/api-reference/",
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    category: "Ticketing",
    color: "#62d84e",
    bg: "rgba(98,216,78,0.07)",
    description: "Connect to ServiceNow ITSM to track open incidents and change requests per account.",
    fields: [
      { crmKey:"company",               crmLabel:"Company / account",    pulseField:"name"        },
      { crmKey:"active_incidents",      crmLabel:"Active incidents",     pulseField:"openTickets" },
      { crmKey:"sys_updated_on",        crmLabel:"Last updated date",    pulseField:"lastContact" },
    ],
    credentials: [
      { key:"instanceUrl",  label:"Instance URL",   placeholder:"https://yourinstance.service-now.com", type:"text"     },
      { key:"username",     label:"Username",        placeholder:"Your ServiceNow username",              type:"text"     },
      { key:"password",     label:"Password",        placeholder:"Your ServiceNow password",              type:"password" },
    ],
    docsUrl: "https://developer.servicenow.com/dev.do#!/reference/api/latest/rest/",
  },
  {
    id: "hubspot_service",
    name: "HubSpot Service Hub",
    category: "Ticketing",
    color: "#ff7a59",
    bg: "rgba(255,122,89,0.08)",
    description: "Pull open ticket pipeline data from HubSpot Service Hub. Uses the same API token as HubSpot CRM.",
    fields: [
      { crmKey:"hs_pipeline_stage",   crmLabel:"Ticket pipeline stage",  pulseField:"notes"       },
      { crmKey:"open_ticket_count",   crmLabel:"Open ticket count",      pulseField:"openTickets" },
      { crmKey:"hs_lastmodifieddate", crmLabel:"Last ticket activity",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"apiKey",   label:"Private App Token", placeholder:"pat-na1-xxxxxxxx (same as HubSpot CRM)", type:"password" },
      { key:"portalId", label:"Portal ID",         placeholder:"12345678",                               type:"text"     },
    ],
    docsUrl: "https://developers.hubspot.com/docs/api/crm/tickets",
  },
  {
    id: "helpscout",
    name: "Help Scout",
    category: "Ticketing",
    color: "#1292ee",
    bg: "rgba(18,146,238,0.07)",
    description: "Sync open conversation counts and last-reply dates from Help Scout mailboxes.",
    fields: [
      { crmKey:"company_name",      crmLabel:"Company name",          pulseField:"name"        },
      { crmKey:"open_conversations",crmLabel:"Open conversation count",pulseField:"openTickets" },
      { crmKey:"userUpdatedAt",     crmLabel:"Last customer reply",   pulseField:"lastContact" },
    ],
    credentials: [
      { key:"appId",     label:"App ID",     placeholder:"Your Help Scout App ID",     type:"text"     },
      { key:"appSecret", label:"App Secret", placeholder:"Your Help Scout App Secret", type:"password" },
    ],
    docsUrl: "https://developer.helpscout.com/docs-api/",
  },
  {
    id: "kayako",
    name: "Kayako",
    category: "Ticketing",
    color: "#f05c38",
    bg: "rgba(240,92,56,0.07)",
    description: "Connect to Kayako to track case volumes and customer effort per account.",
    fields: [
      { crmKey:"organization_name",  crmLabel:"Organisation name",    pulseField:"name"        },
      { crmKey:"open_cases",         crmLabel:"Open case count",      pulseField:"openTickets" },
      { crmKey:"last_updated",       crmLabel:"Last case update",     pulseField:"lastContact" },
    ],
    credentials: [
      { key:"subdomain",   label:"Subdomain",    placeholder:"yourcompany (yourcompany.kayako.com)", type:"text"     },
      { key:"email",       label:"Agent email",  placeholder:"agent@yourcompany.com",               type:"text"     },
      { key:"password",    label:"Password",     placeholder:"Your Kayako password",                type:"password" },
    ],
    docsUrl: "https://developer.kayako.com/api/v1/",
  },
  {
    id: "front",
    name: "Front",
    category: "Ticketing",
    color: "#fa5c00",
    bg: "rgba(250,92,0,0.07)",
    description: "Pull open conversation counts and response times from Front shared inboxes.",
    fields: [
      { crmKey:"name",             crmLabel:"Contact / company name", pulseField:"name"        },
      { crmKey:"num_open_convos",  crmLabel:"Open conversations",     pulseField:"openTickets" },
      { crmKey:"last_message_at",  crmLabel:"Last message date",      pulseField:"lastContact" },
    ],
    credentials: [
      { key:"apiToken", label:"API Token", placeholder:"Your Front API token", type:"password" },
    ],
    docsUrl: "https://dev.frontapp.com/docs/getting-started-with-the-api",
  },
];

const PULSE_FIELD_OPTIONS = [
  { value:"name",        label:"Company Name"       },
  { value:"industry",    label:"Industry"            },
  { value:"arr",         label:"ARR ($)"             },
  { value:"renewalDate", label:"Renewal Date"        },
  { value:"openTickets", label:"Open Tickets"        },
  { value:"lastContact", label:"Last Contact Date"   },
  { value:"nps",         label:"NPS Score"           },
  { value:"notes",       label:"Notes"               },
  { value:"__skip",      label:"— Skip this field —" },
];

const loadIntegrations = () => {
  // Build defaults for all connectors in catalog
  const defaults = {};
  CRM_CATALOG.forEach(c => {
    defaults[c.id] = {
      connected: false,
      credentials: {},
      fieldMap: Object.fromEntries(c.fields.map(f=>[f.crmKey, f.pulseField])),
      lastSync: null,
      syncCount: 0,
      status: "idle",
    };
  });
  // Merge with any saved data — new connectors get defaults, existing ones keep their config
  try {
    const s = localStorage.getItem("pulse_integrations_v1");
    if (s) {
      const saved = JSON.parse(s);
      return { ...defaults, ...saved };
    }
  } catch {}
  return defaults;
};

const saveIntegrations = d => {
  try { localStorage.setItem("pulse_integrations_v1", JSON.stringify(d)); } catch {}
};

// ── Connect / Edit credentials modal ──
const CRMConnectModal = ({ crm, config, onSave, onClose, call }) => {
  const [creds, setCreds] = useState({...config.credentials});
  const [testing, setTesting]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [testResult, setTestResult] = useState(null); // null | "ok" | "fail"
  const [testError, setTestError]   = useState(null);
  const [saveError, setSaveError]   = useState(null);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const testConnection = async () => {
    const allFilled = crm.credentials.every(f => creds[f.key]?.trim());
    if (!allFilled) { setTestResult("fail"); setTestError("Please fill in all fields."); return; }
    setTesting(true); setTestResult(null); setTestError(null);
    try {
      await call("POST", "/api/sync/test", { connectorId: crm.id, credentials: creds });
      setTestResult("ok");
    } catch (err) {
      setTestResult("fail");
      setTestError(err?.message || "Connection failed — check your credentials and try again.");
    } finally { setTesting(false); }
  };

  const save = async () => {
    const allFilled = crm.credentials.every(f => creds[f.key]?.trim());
    // Never save when test explicitly failed; new connections must pass the test first
    if (!allFilled || testResult === "fail") return;
    if (!config.connected && testResult !== "ok") return;
    // Editing an already-connected integration without re-testing preserves connected=true
    const isConnected = testResult === "ok" || (testResult === null && config.connected === true);
    setSaving(true);
    setSaveError(null);
    try {
      await call("POST", "/api/sync/configure", {
        connectorId: crm.id,
        credentials: creds,
        fieldMap: config.fieldMap || {},
        connected: isConnected,
      });
      onSave({ connected: isConnected, credentials: {} });
      onClose();
    } catch (err) {
      setSaveError(err?.message || "Failed to save — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:520,
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:"var(--r)",background:crm.bg,
              display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${crm.color}33`}}>
              <span style={{fontSize:11,fontWeight:800,color:crm.color,fontFamily:"var(--font-mono)"}}>
                {crm.name.slice(0,2).toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>{config.connected?"Edit":"Connect"} {crm.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{crm.category}</div>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn"
            style={{background:"var(--bg3)",border:"none",width:32,height:32,borderRadius:"var(--r-sm)",
              display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ic n="close" size={14} color="var(--text2)"/>
          </button>
        </div>

        <div style={{padding:24}}>
          {/* Description */}
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:20,
            padding:"12px 14px",background:"var(--bg3)",borderRadius:"var(--r)"}}>
            {crm.description}
          </div>

          {/* Credential fields */}
          {crm.credentials.map(field=>(
            <Fld key={field.key} label={field.label}>
              <Inp
                type={field.type}
                value={creds[field.key]||""}
                onChange={e=>setCreds(p=>({...p,[field.key]:e.target.value}))}
                placeholder={field.placeholder}
                autoComplete="off"
              />
            </Fld>
          ))}

          {/* Test connection result */}
          {testResult&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 14px",
              borderRadius:"var(--r)",
              background:testResult==="ok"?"var(--emerald-dim)":"var(--rose-dim)",
              border:`1.5px solid ${testResult==="ok"?"rgba(5,150,105,0.2)":"rgba(225,29,72,0.2)"}`}}>
              <Ic n={testResult==="ok"?"check":"dismiss"} size={14} color={testResult==="ok"?"var(--emerald)":"var(--rose)"}/>
              <span style={{fontSize:13,fontWeight:600,color:testResult==="ok"?"var(--emerald)":"var(--rose)"}}>
                {testResult==="ok"
                  ? "Connection successful — credentials verified"
                  : (testError || "Connection failed — check your credentials and try again")}
              </span>
            </div>
          )}

          {/* Docs link */}
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:20}}>
            Need help finding your credentials?{" "}
            <a href={crm.docsUrl} target="_blank" rel="noreferrer"
              style={{color:"var(--indigo)",textDecoration:"none",fontWeight:600}}>
              {crm.name} API docs →
            </a>
          </div>

          {/* Save error */}
          {saveError&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"10px 14px",
              borderRadius:"var(--r)",background:"var(--rose-dim)",
              border:"1.5px solid rgba(225,29,72,0.2)"}}>
              <Ic n="alert" size={14} color="var(--rose)"/>
              <span style={{fontSize:13,fontWeight:600,color:"var(--rose)"}}>{saveError}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={testConnection} disabled={testing||saving}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"10px",fontWeight:600,fontSize:13,cursor:"pointer",
                fontFamily:"var(--font-display)"}}>
              {testing
                ? <><span style={{width:13,height:13,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Testing…</>
                : <><Ic n="activity" size={14} color="var(--text2)"/>Test connection</>}
            </button>
            <Btn onClick={save} style={{flex:1}} disabled={
              saving
              || !crm.credentials.every(f=>creds[f.key]?.trim())
              || testResult === "fail"
              || (!config.connected && testResult !== "ok")
            }>
              {saving
                ? <><span style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Saving…</>
                : (config.connected?"Save changes":"Connect")}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Field mapping modal ──
const CRMFieldMapModal = ({ crm, config, onSave, onClose }) => {
  const [map, setMap] = useState({...config.fieldMap});

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:600,
        maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>

        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>{crm.name} — Field Mapping</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>
              Map {crm.name} fields to Pulse fields
            </div>
          </div>
          <button onClick={onClose} className="icon-btn"
            style={{background:"var(--bg3)",border:"none",width:32,height:32,borderRadius:"var(--r-sm)",
              display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ic n="close" size={14} color="var(--text2)"/>
          </button>
        </div>

        <div style={{overflow:"auto",flex:1,padding:24}}>
          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 28px 1fr",gap:8,
            marginBottom:12,padding:"8px 12px",background:"var(--bg3)",borderRadius:"var(--r)"}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>
              {crm.name} field
            </div>
            <div/>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>
              Pulse field
            </div>
          </div>

          {crm.fields.map(f=>(
            <div key={f.crmKey} style={{display:"grid",gridTemplateColumns:"1fr 28px 1fr",
              gap:8,alignItems:"center",marginBottom:10}}>
              {/* CRM field — read only */}
              <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"9px 12px",fontSize:13}}>
                <div style={{fontWeight:600,fontSize:13}}>{f.crmLabel}</div>
                <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",marginTop:2}}>
                  {f.crmKey}
                </div>
              </div>
              {/* Arrow */}
              <div style={{display:"flex",justifyContent:"center"}}>
                <Ic n="arrow_right" size={14} color="var(--text3)"/>
              </div>
              {/* Pulse field — dropdown */}
              <Slct value={map[f.crmKey]||"__skip"}
                onChange={e=>setMap(p=>({...p,[f.crmKey]:e.target.value}))}>
                {PULSE_FIELD_OPTIONS.map(o=>(
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Slct>
            </div>
          ))}

          <div style={{marginTop:16,padding:"12px 14px",background:"var(--indigo-dim)",
            borderRadius:"var(--r)",fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
            <strong>How field mapping works:</strong> When you sync, Pulse reads the {crm.name} field 
            on the left and writes its value into the Pulse field on the right. 
            Set a field to "Skip" to ignore it during sync.
          </div>
        </div>

        <div style={{padding:"16px 24px",borderTop:"1px solid var(--border)",
          display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0,background:"var(--bg2)"}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={()=>{onSave({fieldMap:map});onClose();}}>Save mapping</Btn>
        </div>
      </div>
    </div>
  );
};

// ── Sync modal ──
const CRMSyncModal = ({ crm, config, onSync, onClose, call }) => {
  const [phase, setPhase]     = useState("confirm"); // confirm | running | done | error
  const [progress, setProgress] = useState(0);
  const [log, setLog]         = useState([]);
  const [results, setResults] = useState(null);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&phase!=="running"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose,phase]);

  const runSync = async () => {
    if (!call) {
      setLog(["No backend configured — sync unavailable in local mode."]);
      setPhase("error");
      return;
    }
    setPhase("running");
    setProgress(20);
    setLog([`Connecting to ${crm.name}…`]);
    try {
      let created, updated, skipped;
      if (crm.id === "fireflies") {
        setLog(p=>[...p, "Fetching Fireflies transcripts…"]);
        setProgress(55);
        const data = await call("POST", "/api/meetings/sync");
        const synced  = data.synced  || 0;
        const matched = data.matched || 0;
        created = synced;
        updated = matched;
        skipped = Math.max(0, synced - matched);
        setLog(p=>[...p, `Synced ${synced} transcript${synced!==1?"s":""}, ${matched} matched to accounts.`]);
      } else {
        setLog(p=>[...p, "Fetching account records…"]);
        setProgress(40);
        const data = await call("POST", "/api/sync/run", { connectorId: crm.id });
        setLog(p=>[...p, "Applying field mapping…"]);
        setProgress(75);
        created = data.created || 0;
        updated = data.updated || 0;
        skipped = data.skipped || 0;
        setLog(p=>[...p, `Processed ${created+updated+skipped} records.`]);
      }
      setProgress(100);
      setLog(p=>[...p, "Sync complete."]);
      const total = created + updated + skipped;
      setResults({ created, updated, skipped, total });
      setPhase("done");
      onSync({ created, updated, skipped });
    } catch (e) {
      setLog(p=>[...p, `Error: ${e.message || "Sync failed"}`]);
      setPhase("error");
    }
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&phase!=="running"&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:480,
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease",overflow:"hidden"}}>

        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:16}}>Sync from {crm.name}</div>
          {phase!=="running"&&(
            <button onClick={onClose} className="icon-btn"
              style={{background:"var(--bg3)",border:"none",width:32,height:32,borderRadius:"var(--r-sm)",
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Ic n="close" size={14} color="var(--text2)"/>
            </button>
          )}
        </div>

        <div style={{padding:24}}>

          {/* CONFIRM */}
          {phase==="confirm"&&(
            <>
              <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:20}}>
                This will pull account data from <strong>{crm.name}</strong> and:
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
                {[
                  "Create new Pulse accounts for records not yet imported",
                  "Update existing accounts where CRM data is newer",
                  "Skip accounts where no changes are detected",
                  "Apply your current field mapping configuration",
                ].map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <Ic n="check" size={14} color="var(--emerald)" style={{marginTop:2,flexShrink:0}}/>
                    <span style={{fontSize:13,color:"var(--text2)"}}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{padding:"12px 14px",background:"var(--amber-dim)",borderRadius:"var(--r)",
                fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:20,
                border:"1.5px solid rgba(217,119,6,0.15)"}}>
                <strong>Note:</strong> This sync is one-directional — from {crm.name} into Pulse. 
                Changes you make in Pulse are not pushed back to {crm.name} in this phase.
              </div>
              <div style={{display:"flex",gap:10}}>
                <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
                <Btn onClick={runSync} style={{flex:1}}>
                  <span style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}>
                    <Ic n="activity" size={14} color="white"/>
                    Start sync
                  </span>
                </Btn>
              </div>
            </>
          )}

          {/* RUNNING */}
          {phase==="running"&&(
            <>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600}}>Syncing…</span>
                  <span style={{fontSize:13,fontFamily:"var(--font-mono)",color:"var(--indigo)"}}>{progress}%</span>
                </div>
                <div style={{height:6,background:"var(--bg4)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${progress}%`,background:"var(--indigo)",
                    borderRadius:99,transition:"width .35s ease"}}/>
                </div>
              </div>
              <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",
                minHeight:120,display:"flex",flexDirection:"column",gap:6}}>
                {log.map((l,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--text2)"}}>
                    {i===log.length-1
                      ? <span style={{width:12,height:12,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",
                          borderRadius:"50%",display:"inline-block",flexShrink:0,
                          animation:"spin .7s linear infinite"}}/>
                      : <Ic n="check" size={12} color="var(--emerald)" style={{flexShrink:0}}/>
                    }
                    {l}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* DONE */}
          {phase==="done"&&results&&(
            <>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <Ic n="success" size={40} color="var(--emerald)"/>
                </div>
                <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>Sync complete</div>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
                  {results.total} record{results.total!==1?"s":""} processed from {crm.name}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
                {[
                  {label:"Created",  value:results.created,  color:"var(--emerald)"},
                  {label:"Updated",  value:results.updated,  color:"var(--indigo)" },
                  {label:"Skipped",  value:results.skipped,  color:"var(--text3)"  },
                ].map(s=>(
                  <div key={s.label} style={{background:"var(--bg3)",borderRadius:"var(--r)",
                    padding:"14px 10px",textAlign:"center",border:"1.5px solid var(--border)"}}>
                    <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,color:s.color}}>
                      {s.value}
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                      textTransform:"uppercase",letterSpacing:".07em",marginTop:4}}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <Btn onClick={onClose} style={{width:"100%"}}>View portfolio</Btn>
            </>
          )}

          {/* ERROR */}
          {phase==="error"&&(
            <>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <Ic n="alert" size={40} color="var(--red)"/>
                </div>
                <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>Sync failed</div>
              </div>
              <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",
                marginBottom:20,display:"flex",flexDirection:"column",gap:6}}>
                {log.map((l,i)=>(
                  <div key={i} style={{fontSize:12,color:"var(--text2)"}}>{l}</div>
                ))}
              </div>
              <Btn variant="ghost" onClick={onClose} style={{width:"100%"}}>Close</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main integrations page ──
const IntegrationsPage = ({ onImport, toast, call }) => {
  const [configs, setConfigs]           = useState(loadIntegrations);
  const [showConnect, setShowConnect]   = useState(null);
  const [showFieldMap, setShowFieldMap] = useState(null);
  const [showSync, setShowSync]         = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Load real connection status from backend on mount
  useEffect(() => {
    if (!call) return;
    call("GET", "/api/sync/status").then(data => {
      const byId = {};
      for (const row of (data.integrations || [])) {
        byId[row.connector_id] = row;
      }
      setConfigs(prev => {
        const next = { ...prev };
        for (const [id, row] of Object.entries(byId)) {
          if (next[id]) {
            const ts = row.last_sync
              ? new Date(row.last_sync).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})
              : null;
            next[id] = { ...next[id], connected: row.connected, lastSync: ts, syncCount: row.sync_count || 0 };
          }
        }
        return next;
      });
    }).catch(() => {});
  }, [call]);

  useEffect(()=>{ saveIntegrations(configs); },[configs]);

  const updateConfig = (id, patch, persist = false) => {
    setConfigs(p=>({...p,[id]:{...p[id],...patch}}));
    if (persist && patch.fieldMap && call) {
      call("PATCH", "/api/sync/field-map", { connectorId: id, fieldMap: patch.fieldMap })
        .catch(()=>{});
    }
  };

  const crm_by_id = id => CRM_CATALOG.find(c=>c.id===id);

  const connectedCount = Object.values(configs).filter(c=>c.connected).length;

  const categories = ["All", "CRM", "Ticketing"];
  const visibleCatalog = categoryFilter === "All"
    ? CRM_CATALOG
    : CRM_CATALOG.filter(c =>
        categoryFilter === "Ticketing"
          ? c.category === "Ticketing"
          : c.category !== "Ticketing"
      );

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Integrations</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            Connect your CRM and ticketing tools to keep account health accurate
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--bg2)",
          border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"12px 18px",
          boxShadow:"var(--shadow-xs)"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:connectedCount>0?"var(--emerald)":"var(--text3)"}}/>
          <span style={{fontSize:13,fontWeight:600,color:connectedCount>0?"var(--emerald)":"var(--text3)"}}>
            {connectedCount} of {CRM_CATALOG.length} connected
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.15)",
        borderRadius:"var(--r-lg)",padding:"14px 18px",marginBottom:24,
        display:"flex",gap:12,alignItems:"flex-start"}}>
        <Ic n="info" size={16} color="var(--indigo)" style={{flexShrink:0,marginTop:1}}/>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>
          <strong>Phase A — Configuration & manual sync.</strong> Connect your tools, configure field mapping,
          then trigger a manual sync to pull data into Pulse. Automatic background sync arrives in Phase 3.
        </div>
      </div>

      {/* Category filter */}
      <div style={{display:"flex",gap:8,marginBottom:24,alignItems:"center"}}>
        {categories.map(cat=>{
          const active = categoryFilter===cat;
          const count  = cat==="All" ? CRM_CATALOG.length
            : cat==="Ticketing" ? CRM_CATALOG.filter(c=>c.category==="Ticketing").length
            : CRM_CATALOG.filter(c=>c.category!=="Ticketing").length;
          return (
            <button key={cat} onClick={()=>setCategoryFilter(cat)} className="pill-btn"
              style={{padding:"6px 14px",borderRadius:"var(--r-xs)",fontSize:12,cursor:"pointer",
                fontWeight:active?600:400,fontFamily:"var(--font-display)",
                border:`1.5px solid ${active?"var(--indigo)":"var(--border)"}`,
                background:active?"var(--indigo-dim)":"var(--bg2)",
                color:active?"var(--indigo)":"var(--text2)"}}>
              {cat} <span style={{fontSize:11,opacity:0.6}}>({count})</span>
            </button>
          );
        })}
        <div style={{marginLeft:"auto",fontSize:12,color:"var(--text3)"}}>
          {CRM_CATALOG.filter(c=>configs[c.id]?.connected).length > 0
            ? `${CRM_CATALOG.filter(c=>configs[c.id]?.connected).length} active connection${CRM_CATALOG.filter(c=>configs[c.id]?.connected).length!==1?"s":""}`
            : "No active connections yet"}
        </div>
      </div>

      {/* CRM cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
        {visibleCatalog.map(crm=>{
          const cfg    = configs[crm.id];
          const linked = cfg.connected;
          return (
            <div key={crm.id} style={{background:"var(--bg2)",border:`1.5px solid ${linked?crm.color+"33":"var(--border)"}`,
              borderRadius:"var(--r-lg)",overflow:"hidden",boxShadow:"var(--shadow-xs)",
              transition:"border-color .15s,box-shadow .15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="var(--shadow)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="var(--shadow-xs)"}>

              {/* Card header */}
              <div style={{padding:"18px 20px",borderBottom:"1px solid var(--border)",
                display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {/* CRM logo placeholder — colored abbr */}
                  <div style={{width:42,height:42,borderRadius:"var(--r)",background:crm.bg,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    border:`1.5px solid ${crm.color}33`,flexShrink:0}}>
                    <span style={{fontSize:12,fontWeight:800,color:crm.color,fontFamily:"var(--font-mono)",
                      letterSpacing:"-.02em"}}>
                      {crm.name.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15}}>{crm.name}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                      <span style={{fontSize:10,fontWeight:600,color:crm.category==="Ticketing"?"var(--amber)":"var(--indigo)",
                        background:crm.category==="Ticketing"?"var(--amber-dim)":"var(--indigo-dim)",
                        padding:"1px 7px",borderRadius:"var(--r-xs)"}}>
                        {crm.category==="Ticketing"?"Ticketing":"CRM"}
                      </span>
                      <span style={{fontSize:11,color:"var(--text3)"}}>{crm.category}</span>
                    </div>
                  </div>
                </div>
                {/* Status pill */}
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",
                  borderRadius:"var(--r-xs)",
                  background:linked?"var(--emerald-dim)":"var(--bg4)",
                  border:`1.5px solid ${linked?"rgba(5,150,105,0.2)":"var(--border)"}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",
                    background:linked?"var(--emerald)":"var(--text3)"}}/>
                  <span style={{fontSize:11,fontWeight:600,
                    color:linked?"var(--emerald)":"var(--text3)"}}>
                    {linked?"Connected":"Not connected"}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div style={{padding:"16px 20px"}}>
                <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:16}}>
                  {crm.description}
                </div>

                {/* Stats row if connected */}
                {linked&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                    <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 12px"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                        textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Last sync</div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>
                        {cfg.lastSync||"Never"}
                      </div>
                    </div>
                    <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 12px"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                        textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>Records synced</div>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>
                        {cfg.syncCount||0} total
                      </div>
                    </div>
                  </div>
                )}

                {/* Field mapping preview */}
                {linked&&(
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                      textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
                      Field mapping
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {crm.fields.slice(0,3).map(f=>{
                        const mapped = cfg.fieldMap[f.crmKey];
                        const pf     = PULSE_FIELD_OPTIONS.find(o=>o.value===mapped);
                        return (
                          <div key={f.crmKey} style={{display:"flex",alignItems:"center",
                            gap:8,fontSize:11}}>
                            <span style={{color:"var(--text3)",fontFamily:"var(--font-mono)",
                              minWidth:120,overflow:"hidden",textOverflow:"ellipsis",
                              whiteSpace:"nowrap"}}>{f.crmKey}</span>
                            <Ic n="arrow_right" size={11} color="var(--text3)"/>
                            <span style={{fontWeight:600,color:mapped==="__skip"?"var(--text3)":"var(--text2)"}}>
                              {pf?.label||"—"}
                            </span>
                          </div>
                        );
                      })}
                      {crm.fields.length>3&&(
                        <div style={{fontSize:11,color:"var(--text3)"}}>
                          +{crm.fields.length-3} more fields mapped
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{display:"flex",gap:8}}>
                  {!linked ? (
                    <Btn onClick={()=>setShowConnect(crm.id)} style={{flex:1,fontSize:12,padding:"9px"}}>
                      <span style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                        <Ic n="integrations" size={13} color="white"/>
                        Connect
                      </span>
                    </Btn>
                  ) : (
                    <>
                      <button onClick={()=>setShowSync(crm.id)}
                        style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",
                          gap:6,background:"var(--indigo)",color:"white",border:"none",
                          borderRadius:"var(--r)",padding:"9px",fontWeight:600,fontSize:12,
                          cursor:"pointer",fontFamily:"var(--font-display)",
                          boxShadow:"0 2px 8px var(--indigo-glow)"}}>
                        <Ic n="activity" size={13} color="white"/>
                        Sync now
                      </button>
                      <button onClick={()=>setShowFieldMap(crm.id)}
                        style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                          gap:6,background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                          borderRadius:"var(--r)",padding:"9px",fontWeight:600,fontSize:12,
                          cursor:"pointer",fontFamily:"var(--font-display)"}}>
                        <Ic n="edit" size={13} color="var(--text2)"/>
                        Fields
                      </button>
                      <button onClick={()=>setShowConnect(crm.id)}
                        style={{width:36,display:"flex",alignItems:"center",justifyContent:"center",
                          background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                          borderRadius:"var(--r)",padding:"9px",cursor:"pointer"}}>
                        <Ic n="shield" size={13} color="var(--text2)"/>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showConnect&&(()=>{
        const crm = crm_by_id(showConnect);
        return (
          <CRMConnectModal
            crm={crm}
            config={configs[showConnect]}
            onSave={patch=>{ updateConfig(showConnect,patch); toast(patch.connected?`${crm.name} connected`:`${crm.name} credentials saved`,"success"); }}
            onClose={()=>setShowConnect(null)}
            call={call}
          />
        );
      })()}

      {showFieldMap&&(()=>{
        const crm = crm_by_id(showFieldMap);
        return (
          <CRMFieldMapModal
            crm={crm}
            config={configs[showFieldMap]}
            onSave={patch=>{ updateConfig(showFieldMap,patch,true); toast("Field mapping saved","success"); }}
            onClose={()=>setShowFieldMap(null)}
          />
        );
      })()}

      {showSync&&(()=>{
        const crm = crm_by_id(showSync);
        return (
          <CRMSyncModal
            crm={crm}
            config={configs[showSync]}
            call={call}
            onSync={results=>{
              const ts = new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
              updateConfig(showSync,{lastSync:ts,syncCount:(configs[showSync].syncCount||0)+results.created+results.updated});
            }}
            onClose={()=>setShowSync(null)}
          />
        );
      })()}
    </div>
  );
};

// ─── Surveys ──────────────────────────────────────────────────────────────────

const SURVEY_CFG = {
  NPS:  { color:"var(--indigo)", bg:"var(--indigo-dim)", label:"NPS",  full:"Net Promoter Score",    scale:"0 – 10", min:0, max:10 },
  CES:  { color:"var(--teal)",   bg:"var(--teal-dim)",   label:"CES",  full:"Customer Effort Score",  scale:"1 – 5",  min:1, max:5  },
  CSAT: { color:"var(--amber)",  bg:"var(--amber-dim)",  label:"CSAT", full:"Customer Satisfaction",  scale:"1 – 5",  min:1, max:5  },
};

const npsColor = s => s >= 9 ? "var(--emerald)" : s >= 7 ? "var(--amber)" : "var(--rose)";
const npsLabel = s => s >= 9 ? "Promoter" : s >= 7 ? "Passive" : "Detractor";

// ── Survey creation modal ─────────────────────────────────────────────────────
const SurveyCreateModal = ({ accounts, onClose, onCreate, toast }) => {
  const [accountId,       setAccountId]       = useState("");
  const [type,            setType]            = useState("NPS");
  const [customQuestion,  setCustomQuestion]  = useState("");
  const [deadline,        setDeadline]        = useState("");
  const [loading,         setLoading]         = useState(false);
  const [scope,           setScope]           = useState("account"); // "all" | "account" | "segment"
  const [segPlan,         setSegPlan]         = useState("");
  const [segStage,        setSegStage]        = useState("");
  const [segArrMin,       setSegArrMin]       = useState("");

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const selectedAccount = accounts.find(a=>a.id===accountId);

  const submit = async () => {
    if (scope === "account" && !accountId) { toast("Please select an account","error"); return; }
    setLoading(true);
    try {
      const payload = {
        type,
        customQuestion: customQuestion.trim() || null,
        deadline: deadline || null,
      };
      if (scope === "account") {
        payload.accountId   = accountId;
        payload.accountName = selectedAccount?.name || "";
      } else if (scope === "segment") {
        const seg = {};
        if (segPlan.trim()) seg.plan    = segPlan.trim();
        if (segStage)       seg.stage   = segStage;
        if (segArrMin)      seg.arr_min = Number(segArrMin);
        payload.segment_config = seg;
      }
      // scope === "all" → no account, no segment_config (backend treats empty as all)
      await onCreate(payload);
      onClose();
    } catch { toast("Failed to create survey","error"); }
    finally { setLoading(false); }
  };

  const sc = SURVEY_CFG[type];

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:520,
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease",overflow:"hidden"}}>

        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:700,fontSize:16}}>New Survey</div>
          <button onClick={onClose} className="icon-btn"
            style={{background:"var(--bg3)",border:"none",width:32,height:32,
              borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",
              justifyContent:"center",cursor:"pointer"}}>
            <Ic n="close" size={14} color="var(--text2)"/>
          </button>
        </div>

        <div style={{padding:24}}>
          <Fld label="Apply to">
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {["all","account","segment"].map(s=>(
                <button key={s} onClick={()=>setScope(s)}
                  style={{padding:"6px 14px",borderRadius:"var(--r)",border:"1.5px solid",fontSize:12,fontWeight:600,
                    cursor:"pointer",fontFamily:"var(--font-display)",
                    borderColor:scope===s?"var(--indigo)":"var(--border)",
                    background:scope===s?"var(--indigo-dim)":"var(--bg3)",
                    color:scope===s?"var(--indigo)":"var(--text2)"}}>
                  {s==="all"?"All accounts":s==="account"?"Specific account":"Segment"}
                </button>
              ))}
            </div>
            {scope==="account"&&(
              <Slct value={accountId} onChange={e=>setAccountId(e.target.value)}>
                <option value="">— Select an account —</option>
                {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </Slct>
            )}
            {scope==="segment"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <Inp placeholder="Plan (e.g. Enterprise) — blank for any" value={segPlan} onChange={e=>setSegPlan(e.target.value)}/>
                <Slct value={segStage} onChange={e=>setSegStage(e.target.value)}>
                  <option value="">Stage — any</option>
                  {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
                </Slct>
                <Inp type="number" min="0" placeholder="Min ARR (USD) — blank for any" value={segArrMin} onChange={e=>setSegArrMin(e.target.value)}/>
              </div>
            )}
            {scope==="all"&&(
              <div style={{fontSize:12,color:"var(--text3)"}}>A survey will be created for every active account.</div>
            )}
          </Fld>

          <Fld label="Survey type">
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {Object.entries(SURVEY_CFG).map(([key,cfg])=>(
                <button key={key} onClick={()=>setType(key)}
                  style={{padding:"12px 8px",borderRadius:"var(--r)",cursor:"pointer",
                    border:`2px solid ${type===key?cfg.color:"var(--border)"}`,
                    background:type===key?cfg.bg:"var(--bg3)",
                    transition:"all .15s",fontFamily:"var(--font-display)"}}>
                  <div style={{fontWeight:700,fontSize:13,color:type===key?cfg.color:"var(--text2)"}}>
                    {cfg.label}
                  </div>
                  <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{cfg.scale}</div>
                </button>
              ))}
            </div>
          </Fld>

          <div style={{padding:"10px 14px",background:"var(--bg3)",borderRadius:"var(--r)",
            marginBottom:14,fontSize:13,color:"var(--text2)",lineHeight:1.6}}>
            <strong>{sc.full}</strong> — {
              type==="NPS"  ? "How likely are you to recommend us to a colleague? (0=Not at all, 10=Extremely likely)" :
              type==="CES"  ? "How easy was it to work with us? (1=Very difficult, 5=Very easy)" :
                              "How satisfied are you with our service? (1=Very dissatisfied, 5=Very satisfied)"
            }
          </div>

          <Fld label="Custom follow-up question (optional)">
            <Inp value={customQuestion} onChange={e=>setCustomQuestion(e.target.value)}
              placeholder="e.g. What can we do to improve your experience?"/>
          </Fld>

          <Fld label="Response deadline (optional)">
            <Inp type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
              style={{fontSize:13}}/>
          </Fld>

          <div style={{display:"flex",gap:10,marginTop:4}}>
            <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={submit} disabled={loading} style={{flex:1}}>
              {loading
                ? <span style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}>
                    <span style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",
                      borderTopColor:"white",borderRadius:"50%",display:"inline-block",
                      animation:"spin .7s linear infinite"}}/>Creating…
                  </span>
                : "Create survey"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── REPLACEMENT: OAuth-powered SurveySendModal ────────────────────────────────
// Find the existing SurveySendModal in App.jsx and replace the ENTIRE component
// with this version. It starts at:
//   const SurveySendModal = ({ survey, accounts, onClose, toast }) => {
// and ends before:
//   // ── Surveys page ──

const SurveySendModal = ({ survey, accounts, onClose, toast, session, onGoToSettings }) => {
  const [emailAccounts,  setEmailAccounts]  = useState([]);
  const [selectedAccId,  setSelectedAccId]  = useState(null);
  const [recipients,     setRecipients]     = useState("");
  const [subject,        setSubject]        = useState(`You're invited: ${survey?.accountName || "Survey"}`);
  const [sending,        setSending]        = useState(false);
  const [results,        setResults]        = useState(null);
  const [loadingAccs,    setLoadingAccs]    = useState(true);
  const [copied,         setCopied]         = useState(false);

  useEffect(() => {
    const h = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Load connected email accounts
  useEffect(() => {
    if (!API_URL) { setLoadingAccs(false); return; }
    fetch(`${API_URL}/api/email/accounts`, {
      headers: {
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
    })
      .then(r => r.json())
      .then(data => {
        const accs = data.accounts || [];
        setEmailAccounts(accs);
        const primary = accs.find(a => a.is_primary) || accs[0];
        if (primary) setSelectedAccId(primary.id);
      })
      .catch(() => toast("Could not load email accounts", "error"))
      .finally(() => setLoadingAccs(false));
  }, []);

  const parsedRecipients = recipients
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.includes("@"));

  const copyLink = () => {
    navigator.clipboard.writeText(survey.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const surveyUrl = survey.link || `${window.location.origin}/survey/${survey.id}`;

  const waLink = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm ready to share my feedback. ${survey.token}`)}`
    : null;

  const buildHtmlBody = () => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden">
        <tr><td style="background:#111827;padding:28px 36px">
          <div style="color:white;font-size:20px;font-weight:700">Pulse</div>
          <div style="color:#9CA3AF;font-size:13px;margin-top:4px">Customer Survey</div>
        </td></tr>
        <tr><td style="padding:36px">
          <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">${survey.type} Survey — ${survey.accountName}</h1>
          <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 24px">
            Your feedback helps us serve you better. This survey takes less than 60 seconds.
          </p>
          <a href="${surveyUrl}" style="display:inline-block;background:#111827;color:white;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">
            Take the Survey →
          </a>
          ${waLink ? `
          <div style="margin-top:16px">
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:white;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">
              💬 Reply via WhatsApp
            </a>
          </div>` : ''}
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid #F3F4F6">
          <p style="font-size:12px;color:#9CA3AF;margin:0">
            You received this because your team uses Pulse for customer feedback.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const handleSend = async () => {
    if (!selectedAccId) { toast("Select a sending account", "error"); return; }
    if (parsedRecipients.length === 0) { toast("Add at least one recipient", "error"); return; }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          accountId: selectedAccId,
          to: parsedRecipients,
          subject,
          htmlBody: buildHtmlBody(),
          surveyId: survey.id,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
      const sent = (data.results || []).filter(r => r.status === "sent").length;
      toast(`${sent} email${sent !== 1 ? "s" : ""} sent`, "success");
    } catch {
      toast("Send failed — try again", "error");
    } finally {
      setSending(false);
    }
  };

  const PROVIDER_COLORS = { gmail: "#EA4335", outlook: "#0078D4" };
  const PROVIDER_LABELS = { gmail: "Gmail", outlook: "Outlook" };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:520,
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>Send Survey</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>
              {survey.accountName} · {survey.type}
            </div>
          </div>
          <button onClick={onClose}
            style={{background:"var(--bg3)",border:"none",width:32,height:32,
              borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",
              justifyContent:"center",cursor:"pointer"}}>
            <Ic n="close" size={14} color="var(--text2)"/>
          </button>
        </div>

        <div style={{padding:24}}>

          {/* Results view */}
          {results ? (
            <div>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:32,marginBottom:8}}>
                  {results.every(r => r.status === "sent") ? "🎉" : "⚠️"}
                </div>
                <div style={{fontWeight:700,fontSize:16}}>
                  {results.filter(r => r.status === "sent").length} sent
                  {results.filter(r => r.status === "failed").length > 0 &&
                    ` · ${results.filter(r => r.status === "failed").length} failed`}
                </div>
              </div>
              <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                overflow:"hidden",marginBottom:20}}>
                {results.map((r, i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",padding:"10px 14px",
                    borderBottom:i<results.length-1?"1px solid var(--border)":"none",
                    background:"var(--bg2)"}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>{r.email}</span>
                    <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:4,
                      color:r.status==="sent"?"var(--emerald)":"var(--rose)",
                      background:r.status==="sent"?"var(--emerald-dim)":"var(--rose-dim)"}}>
                      {r.status === "sent" ? "✓ Sent" : "✕ Failed"}
                    </span>
                  </div>
                ))}
              </div>
              <Btn onClick={onClose} style={{width:"100%"}}>Done</Btn>
            </div>
          ) : (
            <>
              {/* Copy link */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Survey link</div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1,background:"var(--bg3)",border:"1.5px solid var(--border)",
                    borderRadius:"var(--r)",padding:"9px 12px",fontSize:12,
                    color:"var(--text3)",fontFamily:"var(--font-mono)",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {surveyUrl}
                  </div>
                  <button onClick={copyLink}
                    style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,
                      background:copied?"var(--emerald)":"var(--bg3)",
                      color:copied?"white":"var(--text2)",
                      border:`1.5px solid ${copied?"var(--emerald)":"var(--border)"}`,
                      borderRadius:"var(--r)",padding:"9px 14px",fontWeight:600,
                      fontSize:12,cursor:"pointer",fontFamily:"var(--font-display)",
                      transition:"all .2s"}}>
                    <Ic n={copied?"check":"copy"} size={13} color={copied?"white":"var(--text2)"}/>
                    {copied?"Copied":"Copy"}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
                <span style={{fontSize:11,color:"var(--text3)"}}>or send via email</span>
                <div style={{flex:1,height:1,background:"var(--border)"}}/>
              </div>

              {/* Email account selector */}
              <Fld label="Send from">
                {loadingAccs ? (
                  <div style={{fontSize:13,color:"var(--text3)",padding:"9px 0"}}>Loading accounts…</div>
                ) : emailAccounts.length === 0 ? (
                  <div style={{padding:"12px 14px",background:"var(--amber-dim)",
                    border:"1px solid rgba(217,119,6,0.2)",borderRadius:"var(--r)",
                    fontSize:13,color:"var(--amber)"}}>
                    ⚠️ No email accounts connected.{" "}
                    <button onClick={()=>{ onClose(); onGoToSettings?.(); }}
                      style={{background:"none",border:"none",color:"var(--indigo)",
                        fontWeight:600,cursor:"pointer",fontSize:13}}>
                      Go to Email Settings
                    </button>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {emailAccounts.map(acc => (
                      <button key={acc.id} onClick={() => setSelectedAccId(acc.id)}
                        style={{display:"flex",alignItems:"center",gap:10,
                          padding:"9px 12px",borderRadius:"var(--r)",
                          border:`1.5px solid ${selectedAccId===acc.id?"var(--indigo)":"var(--border)"}`,
                          background:selectedAccId===acc.id?"var(--indigo-dim)":"var(--bg3)",
                          cursor:"pointer",textAlign:"left"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
                          background:PROVIDER_COLORS[acc.provider]||"var(--indigo)"}}/>
                        <span style={{fontSize:13,fontWeight:500,color:"var(--text)",flex:1}}>
                          {acc.email}
                        </span>
                        <span style={{fontSize:11,color:"var(--text3)"}}>
                          {PROVIDER_LABELS[acc.provider]||acc.provider}
                        </span>
                        {acc.is_primary && (
                          <span style={{fontSize:10,background:"var(--indigo-dim)",
                            color:"var(--indigo)",padding:"1px 6px",borderRadius:4,fontWeight:600}}>
                            Primary
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </Fld>

              {/* Subject */}
              <Fld label="Subject">
                <Inp value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Email subject"/>
              </Fld>

              {/* Recipients */}
              <Fld label={`Recipients${parsedRecipients.length > 0 ? ` (${parsedRecipients.length})` : ""}`}>
                <textarea value={recipients} onChange={e => setRecipients(e.target.value)}
                  placeholder={"customer@company.com\nanother@example.com"}
                  style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
                    borderRadius:"var(--r)",padding:"9px 12px",color:"var(--text)",
                    fontFamily:"var(--font-display)",fontSize:13,outline:"none",
                    resize:"vertical",minHeight:80,lineHeight:1.6,boxSizing:"border-box"}}/>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Separate with commas, semicolons, or new lines
                </div>
              </Fld>

              <div style={{display:"flex",gap:10,marginTop:4}}>
                <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
                <Btn onClick={handleSend}
                  disabled={sending || emailAccounts.length === 0}
                  style={{flex:2,opacity:sending||emailAccounts.length===0?0.6:1}}>
                  {sending
                    ? "Sending…"
                    : `Send to ${parsedRecipients.length || "…"} recipient${parsedRecipients.length !== 1 ? "s" : ""}`}
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Outreach Queue page ───────────────────────────────────────────────────────
const TRIGGER_META = {
  health_drop:         { label:"Health Drop",       color:"var(--rose)",    bg:"var(--rose-dim)"    },
  no_contact:          { label:"No Contact",         color:"var(--amber)",   bg:"var(--amber-dim)"   },
  renewal_approaching: { label:"Renewal Due",        color:"var(--indigo)",  bg:"var(--indigo-dim)"  },
  nps_drop:            { label:"NPS Drop",           color:"var(--rose)",    bg:"var(--rose-dim)"    },
  usage_drop:          { label:"Usage Drop",         color:"var(--amber)",   bg:"var(--amber-dim)"   },
  playbook_suggested:  { label:"Playbook Signal",    color:"var(--teal)",    bg:"rgba(20,184,166,.1)"},
  digest:              { label:"Health Digest",      color:"var(--emerald)", bg:"rgba(5,150,105,.1)" },
};

const OutreachQueuePage = ({ call, accounts, toast }) => {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("pending");
  const [expanded,   setExpanded]   = useState(null);
  const [editing,    setEditing]    = useState(null); // { id, subject, body }
  const [sendModal,  setSendModal]  = useState(null); // item
  const [sendEmail,  setSendEmail]  = useState("");
  const [sending,    setSending]    = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await call("GET", "/api/outreach");
      setItems(d?.items || []);
    } catch { toast?.("Could not load outreach queue","error"); }
    finally { setLoading(false); }
  }, [call, toast]);

  useEffect(()=>{ load(); }, [load]);

  const patch = async (id, body) => {
    await call("PATCH", `/api/outreach/${id}`, body);
    setItems(its => its.map(i => i.id===id ? {...i,...body} : i));
  };

  const remove = async (id) => {
    await call("DELETE", `/api/outreach/${id}`);
    setItems(its => its.filter(i => i.id!==id));
  };

  const send = async () => {
    if (!sendModal) return;
    const to = sendEmail || sendModal.recipient_email;
    if (!to) { toast?.("Enter a recipient email","error"); return; }
    setSending(true);
    try {
      await call("POST", `/api/outreach/${sendModal.id}/send`, { recipientEmail: to });
      toast?.("Outreach sent","success");
      setItems(its => its.map(i => i.id===sendModal.id ? {...i, status:"sent", recipient_email:to} : i));
      setSendModal(null); setSendEmail("");
    } catch (e) {
      toast?.(e?.message || "Send failed","error");
    } finally { setSending(false); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    await patch(editing.id, { subject: editing.subject, body_draft: editing.body });
    toast?.("Draft saved","success");
    setEditing(null);
  };

  const shown = items.filter(i => tab==="all" ? true : i.status===tab);
  const pending = items.filter(i=>i.status==="pending").length;
  const approved = items.filter(i=>i.status==="approved").length;
  const sentCount = items.filter(i=>i.status==="sent").length;

  return (
    <div style={{maxWidth:820,animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Outreach Queue</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            Pulse drafts outreach when it detects signals — review, edit, and send with one click
          </div>
        </div>
        {pending > 0 && (
          <div style={{background:"var(--amber-dim)",border:"1.5px solid rgba(217,119,6,0.3)",
            borderRadius:"var(--r)",padding:"10px 18px",fontSize:13,fontWeight:600,color:"var(--amber)"}}>
            {pending} draft{pending!==1?"s":""} waiting
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {[
          {label:"Pending review", value:pending,    color:pending>0?"var(--amber)":"var(--text3)"},
          {label:"Approved",       value:approved,   color:approved>0?"var(--emerald)":"var(--text3)"},
          {label:"Sent",           value:sentCount,  color:"var(--indigo)"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
            borderTop:`3px solid ${s.color}`,borderRadius:"var(--r-lg)",padding:"16px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:26,color:s.color,marginBottom:3,letterSpacing:"-.02em"}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1.5px solid var(--border)",marginBottom:20}}>
        {["pending","approved","sent","all"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"9px 18px",fontSize:13,
              fontFamily:"var(--font-display)",fontWeight:600,border:"none",cursor:"pointer",
              background:"transparent",
              color:tab===t?"var(--indigo)":"var(--text2)",
              borderBottom:tab===t?"2px solid var(--indigo)":"2px solid transparent",
              marginBottom:"-1.5px",transition:"color .15s,border-color .15s"}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t!=="all"&&<span style={{marginLeft:6,fontSize:11,fontFamily:"var(--font-mono)",
              opacity:.7}}>
              {t==="pending"?pending:t==="approved"?approved:sentCount}
            </span>}
          </button>
        ))}
      </div>

      {/* AI readiness note */}
      <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--indigo-dim)",
        border:"1.5px solid rgba(59,94,222,0.2)",borderRadius:"var(--r)",
        padding:"10px 14px",marginBottom:20,fontSize:12,color:"var(--indigo)"}}>
        <Ic n="info" size={14} color="var(--indigo)"/>
        Drafts are currently template-based. Once the AI layer is enabled, each draft will be personalised to the account's history and context.
      </div>

      {loading && <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",padding:"40px 0"}}>Loading…</div>}

      {!loading && shown.length===0 && (
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{marginBottom:12,display:"flex",justifyContent:"center"}}><Ic n="email" size={40} color="var(--text3)"/></div>
          <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>
            {tab==="pending" ? "No drafts waiting" : `No ${tab} outreach`}
          </div>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            {tab==="pending"
              ? "Pulse will queue drafts when it detects signals like health drops, no contact, or upcoming renewals."
              : "Items you send or approve will appear here."}
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {shown.map(item => {
          const meta   = TRIGGER_META[item.trigger_type] || TRIGGER_META["no_contact"];
          const isOpen = expanded===item.id;
          const isEdit = editing?.id===item.id;
          return (
            <div key={item.id} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
              borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)",
              transition:"border-color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--indigo)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>

              {/* Item header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <Avatar name={item.account_name} size={28}/>
                  <span style={{fontWeight:700,fontSize:14}}>{item.account_name}</span>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,
                    background:meta.bg,color:meta.color}}>{meta.label}</span>
                  {item.ai_generated&&(
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                      background:"var(--indigo-dim)",color:"var(--indigo)"}}>AI</span>
                  )}
                  {item.status==="sent"&&(
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                      background:"rgba(5,150,105,.1)",color:"var(--emerald)"}}>Sent</span>
                  )}
                  {item.status==="approved"&&(
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                      background:"rgba(5,150,105,.1)",color:"var(--emerald)"}}>Approved</span>
                  )}
                  {item.status==="dismissed"&&(
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                      background:"var(--bg4)",color:"var(--text3)"}}>Dismissed</span>
                  )}
                </div>
                <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",flexShrink:0,marginLeft:8}}>
                  {new Date(item.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                </span>
              </div>

              {/* Subject */}
              {isEdit ? (
                <input value={editing.subject} onChange={e=>setEditing(ed=>({...ed,subject:e.target.value}))}
                  style={{width:"100%",fontWeight:600,fontSize:14,padding:"7px 10px",
                    background:"var(--bg3)",border:"1.5px solid var(--indigo)",borderRadius:"var(--r-sm)",
                    color:"var(--text)",fontFamily:"var(--font-display)",marginBottom:8,boxSizing:"border-box"}}/>
              ) : (
                <div style={{fontWeight:600,fontSize:14,marginBottom:6,color:"var(--text)"}}>{item.subject}</div>
              )}

              {/* Body preview / edit */}
              {isEdit ? (
                <textarea value={editing.body} onChange={e=>setEditing(ed=>({...ed,body:e.target.value}))}
                  rows={8}
                  style={{width:"100%",fontSize:13,padding:"9px 12px",
                    background:"var(--bg3)",border:"1.5px solid var(--indigo)",borderRadius:"var(--r-sm)",
                    color:"var(--text2)",fontFamily:"var(--font-display)",lineHeight:1.6,
                    resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
              ) : (
                <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,
                  maxHeight:isOpen?undefined:"3.8em",overflow:isOpen?undefined:"hidden",
                  display:isOpen?undefined:"-webkit-box",WebkitLineClamp:isOpen?undefined:3,
                  WebkitBoxOrient:isOpen?undefined:"vertical",
                  whiteSpace:"pre-wrap",marginBottom:8}}>
                  {item.body_draft}
                </div>
              )}

              {!isEdit && item.body_draft.split('\n').length > 3 && (
                <button onClick={()=>setExpanded(isOpen?null:item.id)}
                  style={{background:"none",border:"none",color:"var(--indigo)",fontSize:12,
                    fontWeight:600,cursor:"pointer",padding:0,marginBottom:8}}>
                  {isOpen?"Show less ↑":"Show full draft ↓"}
                </button>
              )}

              {item.recipient_email && item.status!=="sent" && (
                <div style={{fontSize:11,color:"var(--text3)",marginBottom:10}}>
                  To: {item.recipient_name||item.recipient_email} &lt;{item.recipient_email}&gt;
                </div>
              )}

              {item.metadata?.last_activity_note && (
                <div style={{background:"rgba(99,102,241,.07)",border:"1.5px solid rgba(99,102,241,.15)",
                  borderRadius:"var(--r-sm)",padding:"8px 12px",marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--indigo)",textTransform:"uppercase",
                    letterSpacing:".06em",marginBottom:4}}>CSM Context — not in email</div>
                  <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>
                    {item.metadata.last_activity_date && (
                      <span style={{color:"var(--text3)",marginRight:6}}>
                        {new Date(item.metadata.last_activity_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                        {item.metadata.last_activity_type ? ` · ${item.metadata.last_activity_type}` : ""}:
                      </span>
                    )}
                    {item.metadata.last_activity_note}
                  </div>
                </div>
              )}

              {/* Actions */}
              {item.status==="pending" && !isEdit && (
                <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingTop:4,borderTop:"1px solid var(--border)"}}>
                  <button onClick={()=>setSendModal(item)}
                    style={{flex:1,minWidth:100,background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",padding:"8px 16px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Send Now
                  </button>
                  <button onClick={()=>{ patch(item.id,{status:"approved"}); toast?.("Marked as approved","success"); }}
                    style={{flex:1,minWidth:80,background:"rgba(5,150,105,.1)",color:"var(--emerald)",
                      border:"1.5px solid rgba(5,150,105,.2)",borderRadius:"var(--r-sm)",
                      padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Approve
                  </button>
                  <button onClick={()=>setEditing({id:item.id,subject:item.subject,body:item.body_draft})}
                    style={{background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                      borderRadius:"var(--r-sm)",padding:"8px 14px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Edit
                  </button>
                  <button onClick={()=>{ patch(item.id,{status:"dismissed"}); toast?.("Dismissed","info"); }}
                    style={{background:"none",color:"var(--text3)",border:"none",
                      padding:"8px 10px",fontSize:12,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Dismiss
                  </button>
                </div>
              )}
              {item.status==="approved" && !isEdit && (
                <div style={{display:"flex",gap:8,paddingTop:4,borderTop:"1px solid var(--border)"}}>
                  <button onClick={()=>setSendModal(item)}
                    style={{background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",padding:"8px 18px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Send
                  </button>
                  <button onClick={()=>setEditing({id:item.id,subject:item.subject,body:item.body_draft})}
                    style={{background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                      borderRadius:"var(--r-sm)",padding:"8px 14px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Edit
                  </button>
                </div>
              )}
              {isEdit && (
                <div style={{display:"flex",gap:8,paddingTop:4,borderTop:"1px solid var(--border)"}}>
                  <button onClick={saveEdit}
                    style={{background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",padding:"8px 18px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Save
                  </button>
                  <button onClick={()=>setEditing(null)}
                    style={{background:"none",color:"var(--text3)",border:"none",fontSize:12,cursor:"pointer"}}>
                    Cancel
                  </button>
                </div>
              )}
              {item.status==="dismissed" && (
                <div style={{display:"flex",gap:8,paddingTop:4,borderTop:"1px solid var(--border)"}}>
                  <button onClick={()=>{ patch(item.id,{status:"pending"}); toast?.("Restored to queue","success"); }}
                    style={{background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                      borderRadius:"var(--r-sm)",padding:"8px 14px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Restore
                  </button>
                  <button onClick={()=>{ remove(item.id); toast?.("Draft deleted","info"); }}
                    style={{background:"none",color:"var(--rose)",border:"1.5px solid rgba(225,29,72,.2)",
                      borderRadius:"var(--r-sm)",padding:"8px 14px",fontSize:12,fontWeight:600,
                      cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Send modal */}
      {sendModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",
          alignItems:"center",justifyContent:"center",zIndex:1000}}
          onClick={e=>{if(e.target===e.currentTarget){setSendModal(null);setSendEmail("")}}}>
          <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:"28px 32px",
            width:"100%",maxWidth:440,boxShadow:"var(--shadow-lg)"}}>
            <h3 style={{fontWeight:700,fontSize:17,marginBottom:4}}>Send outreach</h3>
            <div style={{fontSize:13,color:"var(--text3)",marginBottom:20}}>
              {sendModal.account_name} — {sendModal.subject}
            </div>
            <label style={{fontSize:12,fontWeight:600,color:"var(--text2)",display:"block",marginBottom:6}}>
              Recipient email
            </label>
            <input
              value={sendEmail||sendModal.recipient_email||""}
              onChange={e=>setSendEmail(e.target.value)}
              placeholder="customer@company.com"
              style={{width:"100%",padding:"10px 14px",background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",color:"var(--text)",fontFamily:"var(--font-display)",
                fontSize:13,marginBottom:16,boxSizing:"border-box",outline:"none"}}
            />
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:20,lineHeight:1.5}}>
              The email will be sent from your connected Gmail or Outlook account.
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn onClick={send} disabled={sending} style={{flex:1}}>
                {sending ? "Sending…" : "Send"}
              </Btn>
              <button onClick={()=>{setSendModal(null);setSendEmail("")}}
                style={{flex:1,background:"var(--bg3)",border:"1.5px solid var(--border)",
                  borderRadius:"var(--r)",padding:"10px",fontSize:13,fontWeight:600,
                  cursor:"pointer",fontFamily:"var(--font-display)",color:"var(--text2)"}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Survey Schedules section ───────────────────────────────────────────────────
const SurveySchedulesSection = ({ session, toast }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({
    name:"", survey_type:"NPS", trigger_type:"recurring",
    trigger_config:{ recurrence_days:90 }, custom_question:"",
  });

  const callApi = useCallback((m,p,b) => api(m,p,b,session?.token), [session]);

  const load = useCallback(async () => {
    try {
      const d = await callApi("GET", "/api/schedules/surveys");
      setSchedules(d?.schedules || []);
    } catch {} finally { setLoading(false); }
  }, [callApi]);

  useEffect(()=>{ if (API_URL && session?.token) load(); else setLoading(false); },[load]);

  const create = async () => {
    if (!form.name || !form.trigger_type) { toast?.("Name and trigger are required","error"); return; }
    try {
      await callApi("POST", "/api/schedules/surveys", form);
      toast?.("Schedule created","success");
      setShowForm(false);
      setForm({name:"",survey_type:"NPS",trigger_type:"recurring",trigger_config:{recurrence_days:90},custom_question:""});
      load();
    } catch { toast?.("Could not create schedule","error"); }
  };

  const toggle = async (id, enabled) => {
    await callApi("PATCH", `/api/schedules/surveys/${id}`, { enabled: !enabled });
    setSchedules(ss => ss.map(s => s.id===id ? {...s, enabled:!enabled} : s));
  };

  const del = async (id) => {
    await callApi("DELETE", `/api/schedules/surveys/${id}`);
    setSchedules(ss => ss.filter(s => s.id!==id));
    toast?.("Schedule deleted","success");
  };

  const triggerDesc = (s) => {
    const cfg = s.trigger_config || {};
    switch (s.trigger_type) {
      case "onboarding_complete": return `${cfg.days||30} days after account creation`;
      case "recurring":           return `Every ${cfg.recurrence_days||90} days`;
      case "renewal_approaching": return `${cfg.days_before||30} days before renewal`;
      case "health_recovery":     return `When health reaches ${cfg.min_health||70}+`;
      default: return s.trigger_type;
    }
  };

  return (
    <div style={{marginTop:32,paddingTop:24,borderTop:"1.5px solid var(--border)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontWeight:700,fontSize:16,marginBottom:3}}>Auto-Survey Schedules</div>
          <div style={{fontSize:12,color:"var(--text3)"}}>
            Automatically send surveys when conditions are met — no manual work needed
          </div>
        </div>
        <Btn onClick={()=>setShowForm(v=>!v)} style={{fontSize:12,padding:"8px 16px"}}>
          {showForm ? "Cancel" : "+ New Schedule"}
        </Btn>
      </div>

      {showForm && (()=>{
        const cfg = form.trigger_config || {};
        const seg = form.segment_config || {};

        // Live preview sentence — shows exactly what will happen in plain English
        const surveyLabels = { NPS:"Net Promoter Score (NPS)", CES:"Customer Effort Score (CES)", CSAT:"Customer Satisfaction (CSAT)" };
        const segDesc = seg.plan ? ` on ${seg.plan} accounts` : " on all accounts";
        let whenDesc = "";
        switch (form.trigger_type) {
          case "onboarding_complete":
            whenDesc = `${cfg.days||30} days after an account is created`; break;
          case "recurring":
            whenDesc = `every ${cfg.recurrence_days||90} days`; break;
          case "renewal_approaching":
            whenDesc = `${cfg.days_before||30} days before the renewal date`; break;
          case "health_recovery":
            whenDesc = `when health score reaches ${cfg.min_health||70} or above`; break;
        }

        const inputStyle = {
          width:"100%", padding:"9px 12px", background:"var(--bg2)",
          border:"1.5px solid var(--border)", borderRadius:"var(--r)",
          color:"var(--text)", fontFamily:"var(--font-display)",
          fontSize:13, boxSizing:"border-box",
        };
        const labelStyle = { fontSize:11, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 };
        const hintStyle  = { fontSize:11, color:"var(--text3)", marginTop:4 };

        return (
          <div style={{background:"var(--bg3)",border:"1.5px solid var(--indigo)",borderRadius:"var(--r-lg)",
            padding:"24px",marginBottom:20}}>

            {/* Row 1 — Name + Survey type */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
              <div>
                <label style={labelStyle}>Schedule name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  placeholder="e.g. 90-Day NPS Check-In"
                  style={inputStyle}/>
                <div style={hintStyle}>Give it a name you'll recognise</div>
              </div>
              <div>
                <label style={labelStyle}>Survey type</label>
                <select value={form.survey_type} onChange={e=>setForm(f=>({...f,survey_type:e.target.value}))}
                  style={inputStyle}>
                  <option value="NPS">NPS — How likely to recommend?</option>
                  <option value="CES">CES — How easy was it to use?</option>
                  <option value="CSAT">CSAT — How satisfied are you?</option>
                </select>
              </div>
            </div>

            {/* Row 2 — Trigger type */}
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>When to send</label>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                {[
                  { key:"onboarding_complete", icon:"🚀", label:"After onboarding",    desc:"X days after account is created"  },
                  { key:"recurring",           icon:"🔁", label:"On a repeat schedule", desc:"Every X days automatically"       },
                  { key:"renewal_approaching", icon:"📅", label:"Before renewal",       desc:"X days before the renewal date"   },
                  { key:"health_recovery",     icon:"💚", label:"After health improves", desc:"When health score reaches X+"    },
                ].map(opt=>{
                  const active = form.trigger_type === opt.key;
                  return (
                    <div key={opt.key} onClick={()=>setForm(f=>({...f, trigger_type:opt.key,
                      trigger_config:
                        opt.key==="recurring"?{recurrence_days:90}:
                        opt.key==="onboarding_complete"?{days:30}:
                        opt.key==="renewal_approaching"?{days_before:30}:
                        {min_health:70}}))}
                      style={{padding:"12px 14px",borderRadius:"var(--r)",cursor:"pointer",
                        border:`1.5px solid ${active?"var(--indigo)":"var(--border)"}`,
                        background:active?"var(--indigo-dim)":"var(--bg2)",
                        transition:"all .12s"}}>
                      <div style={{fontSize:16,marginBottom:4}}>{opt.icon}</div>
                      <div style={{fontSize:13,fontWeight:600,color:active?"var(--indigo)":"var(--text)",marginBottom:2}}>{opt.label}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{opt.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3 — Dynamic config fields */}
            <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
              padding:"16px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",
                letterSpacing:".07em",marginBottom:12}}>Configure trigger</div>

              {form.trigger_type==="onboarding_complete"&&(
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:13,color:"var(--text2)"}}>Send survey</span>
                  <input type="number" min={1} max={365}
                    value={cfg.days||30}
                    onChange={e=>setForm(f=>({...f,trigger_config:{...cfg,days:Math.max(1,Number(e.target.value))}}))}
                    style={{...inputStyle,width:80,textAlign:"center"}}/>
                  <span style={{fontSize:13,color:"var(--text2)"}}>days after the account is created</span>
                </div>
              )}

              {form.trigger_type==="recurring"&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>Send every</span>
                    <input type="number" min={7} max={365}
                      value={cfg.recurrence_days||90}
                      onChange={e=>setForm(f=>({...f,trigger_config:{...cfg,recurrence_days:Math.max(7,Number(e.target.value))}}))}
                      style={{...inputStyle,width:80,textAlign:"center"}}/>
                    <span style={{fontSize:13,color:"var(--text2)"}}>days</span>
                  </div>
                  <div style={hintStyle}>Minimum 7 days. A 90-day cadence works well for NPS.</div>
                </div>
              )}

              {form.trigger_type==="renewal_approaching"&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>Send</span>
                    <input type="number" min={7} max={180}
                      value={cfg.days_before||30}
                      onChange={e=>setForm(f=>({...f,trigger_config:{...cfg,days_before:Math.max(7,Number(e.target.value))}}))}
                      style={{...inputStyle,width:80,textAlign:"center"}}/>
                    <span style={{fontSize:13,color:"var(--text2)"}}>days before the renewal date</span>
                  </div>
                  <div style={hintStyle}>30–60 days is the ideal window to capture sentiment before renewal conversations.</div>
                </div>
              )}

              {form.trigger_type==="health_recovery"&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <span style={{fontSize:13,color:"var(--text2)"}}>Send when health score reaches</span>
                    <input type="number" min={50} max={100}
                      value={cfg.min_health||70}
                      onChange={e=>setForm(f=>({...f,trigger_config:{...cfg,min_health:Math.min(100,Math.max(50,Number(e.target.value)))}}))}
                      style={{...inputStyle,width:80,textAlign:"center"}}/>
                    <span style={{fontSize:13,color:"var(--text2)"}}>or above</span>
                  </div>
                  <div style={hintStyle}>Use this to capture sentiment after an account recovers from a low-health period. 70+ recommended.</div>
                </div>
              )}
            </div>

            {/* Row 4 — Optional segment filter */}
            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Apply to (optional — leave blank for all accounts)</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:4}}>Plan</div>
                  <select value={seg.plan||""}
                    onChange={e=>setForm(f=>({...f,segment_config:{...seg,plan:e.target.value||undefined}}))}
                    style={inputStyle}>
                    <option value="">All plans</option>
                    <option value="Starter">Starter only</option>
                    <option value="Growth">Growth only</option>
                    <option value="Enterprise">Enterprise only</option>
                  </select>
                </div>
                <div>
                  <div style={{fontSize:11,color:"var(--text3)",marginBottom:4}}>Stage</div>
                  <select value={seg.stage||""}
                    onChange={e=>setForm(f=>({...f,segment_config:{...seg,stage:e.target.value||undefined}}))}
                    style={inputStyle}>
                    <option value="">All stages</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Stable">Stable</option>
                    <option value="Needs Attention">Needs Attention</option>
                    <option value="At Risk">At Risk</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 5 — Custom question */}
            <div style={{marginBottom:20}}>
              <label style={labelStyle}>Custom follow-up question (optional)</label>
              <input value={form.custom_question}
                onChange={e=>setForm(f=>({...f,custom_question:e.target.value}))}
                placeholder="e.g. What could we do to improve your experience?"
                style={inputStyle}/>
              <div style={hintStyle}>Added as an open-text field below the score question</div>
            </div>

            {/* Live preview */}
            <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.2)",
              borderRadius:"var(--r)",padding:"12px 16px",marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--indigo)",textTransform:"uppercase",
                letterSpacing:".08em",marginBottom:4}}>What this schedule will do</div>
              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6}}>
                Automatically send a <strong>{surveyLabels[form.survey_type]}</strong> survey{segDesc} — <strong>{whenDesc}</strong>. The primary stakeholder on each qualifying account will receive the survey by email.
              </div>
            </div>

            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Btn onClick={create} style={{fontSize:13,padding:"10px 24px"}}>Create Schedule</Btn>
              <button onClick={()=>setShowForm(false)}
                style={{background:"none",border:"none",color:"var(--text3)",fontSize:13,
                  cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      {loading && <div style={{fontSize:13,color:"var(--text3)",padding:"12px 0"}}>Loading schedules…</div>}

      {!loading && schedules.length===0 && !showForm && (
        <div style={{textAlign:"center",padding:"28px 0",color:"var(--text3)",fontSize:13}}>
          No schedules yet — create one to start automating surveys
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {schedules.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,
            background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{s.name}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:700,
                  color:"var(--indigo)",background:"var(--indigo-dim)",
                  padding:"2px 8px",borderRadius:99}}>{s.survey_type}</span>
                <span style={{fontSize:11,color:"var(--text3)"}}>{triggerDesc(s)}</span>
                {(s.segment_config?.plan||s.segment_config?.stage)&&(
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,
                    background:"var(--bg4)",color:"var(--text2)"}}>
                    {[s.segment_config.plan, s.segment_config.stage].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </div>
            {/* Toggle */}
            <div onClick={()=>toggle(s.id, s.enabled)}
              style={{width:36,height:20,borderRadius:99,cursor:"pointer",flexShrink:0,
                background:s.enabled?"var(--indigo)":"var(--bg4)",position:"relative",transition:"background .15s"}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:"white",
                position:"absolute",top:2,left:s.enabled?18:2,transition:"left .15s"}}/>
            </div>
            <button onClick={()=>del(s.id)}
              style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",
                fontSize:18,padding:"0 4px",lineHeight:1}}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Surveys page ──────────────────────────────────────────────────────────────
const SurveysPage = ({ accounts, session, toast, onGoToSettings }) => {
  const [surveys,     setSurveys]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [showSend,    setShowSend]    = useState(null); // survey object
  const [expanded,    setExpanded]    = useState(null); // survey id

  const callSurvey = useCallback(async (method, path, body) => {
    return api(method, path, body, session?.token);
  }, [session]);

  const loadSurveys = useCallback(async () => {
    try {
      const data = await callSurvey("GET", "/api/surveys");
      if (data?.surveys) setSurveys(data.surveys);
    } catch { toast("Could not load surveys","error"); }
    finally { setLoading(false); }
  }, [callSurvey, toast]);

  useEffect(()=>{ if (API_URL && session?.token) loadSurveys(); else setLoading(false); },[loadSurveys]);

  const createSurvey = async (payload) => {
    const data = await callSurvey("POST", "/api/surveys", payload);
    const n = data?.created ?? 1, sk = data?.skipped ?? 0;
    toast(
      n === 0
        ? "No surveys created — matching accounts already have an active survey of this type"
        : `${n} survey${n !== 1 ? "s" : ""} created — ready to send${sk ? ` (${sk} skipped, already active)` : ""}`,
      n === 0 ? "info" : "success"
    );
    await loadSurveys();
    return data;
  };

  const sendSurvey = async (id, payload) => {
    await callSurvey("POST", `/api/surveys/${id}/send`, payload);
  };

  const closeSurvey = async (id) => {
    await callSurvey("PATCH", `/api/surveys/${id}`, { status: "closed" });
    toast("Survey closed","success");
    loadSurveys();
  };

  const deleteSurvey = async (id) => {
    await callSurvey("DELETE", `/api/surveys/${id}`);
    toast("Survey deleted","success");
    loadSurveys();
  };

  const active  = surveys.filter(s=>s.status==="active");
  const closed  = surveys.filter(s=>s.status==="closed");
  const totalResponses = surveys.reduce((n,s)=>n+s.responseCount,0);
  const avgResponseRate = surveys.length > 0
    ? Math.round((surveys.filter(s=>s.responseCount>0).length / surveys.length) * 100)
    : 0;

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Surveys</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            Send NPS, CES, and CSAT surveys to your customers directly from Pulse
          </div>
        </div>
        <Btn onClick={()=>setShowCreate(true)} style={{fontSize:13,padding:"10px 20px"}}>
          <span style={{display:"flex",alignItems:"center",gap:7}}>
            <Ic n="plus" size={14} color="white"/>New Survey
          </span>
        </Btn>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Total sent",      value:surveys.length,   color:"var(--indigo)" },
          {label:"Active",          value:active.length,    color:active.length>0?"var(--emerald)":"var(--text3)" },
          {label:"Total responses", value:totalResponses,   color:totalResponses>0?"var(--emerald)":"var(--text3)" },
          {label:"Response rate",   value:`${avgResponseRate}%`, color:avgResponseRate>=50?"var(--emerald)":avgResponseRate>0?"var(--amber)":"var(--text3)" },
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
            borderTop:`3px solid ${s.color}`,borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:24,
              color:s.color,marginBottom:4,letterSpacing:"-.02em"}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading&&(
        <div style={{display:"flex",justifyContent:"center",padding:48}}>
          <div style={{width:28,height:28,border:"3px solid var(--border2)",
            borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
        </div>
      )}

      {/* Empty state */}
      {!loading&&surveys.length===0&&(
        <div style={{textAlign:"center",padding:"64px 32px",background:"var(--bg2)",
          borderRadius:"var(--r-lg)",border:"1.5px solid var(--border)"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <Ic n="activity" size={44} color="var(--text3)"/>
          </div>
          <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>No surveys yet</div>
          <div style={{fontSize:13,color:"var(--text3)",marginBottom:24,lineHeight:1.6,maxWidth:360,margin:"0 auto 24px"}}>
            Create your first survey and share the link with your customer via email or WhatsApp.
          </div>
          <Btn onClick={()=>setShowCreate(true)}>Create your first survey</Btn>
        </div>
      )}

      {/* Survey list */}
      {!loading&&[
        {title:"Active", items:active, color:"var(--emerald)"},
        {title:"Closed",  items:closed,  color:"var(--text3)"},
      ].map(group=>group.items.length===0?null:(
        <div key={group.title} style={{marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:group.color}}/>
            <span style={{fontWeight:700,fontSize:14,color:group.color}}>{group.title}</span>
            <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)",
              background:"var(--bg4)",padding:"1px 8px",borderRadius:"var(--r-xs)"}}>
              {group.items.length}
            </span>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {group.items.map(survey=>{
              const sc  = SURVEY_CFG[survey.type];
              const exp = expanded===survey.id;
              return (
                <div key={survey.id} style={{background:"var(--bg2)",
                  border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
                  overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>

                  {/* Survey row */}
                  <div style={{padding:"16px 20px",display:"flex",
                    alignItems:"center",gap:14,cursor:"pointer"}}
                    onClick={()=>setExpanded(exp?null:survey.id)}>

                    {/* Type badge */}
                    <div style={{width:44,height:44,borderRadius:"var(--r)",
                      background:sc.bg,display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0,
                      border:`1.5px solid ${sc.color}33`}}>
                      <span style={{fontSize:11,fontWeight:800,color:sc.color,
                        fontFamily:"var(--font-mono)"}}>{sc.label}</span>
                    </div>

                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>
                        {survey.accountName}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:"var(--text3)"}}>
                          {new Date(survey.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </span>
                        {survey.deadline&&(
                          <>
                            <span style={{fontSize:11,color:"var(--text3)"}}>·</span>
                            <span style={{fontSize:11,color:new Date(survey.deadline)<new Date()?"var(--rose)":"var(--text3)"}}>
                              Due {new Date(survey.deadline).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                            </span>
                          </>
                        )}
                        {survey.customQuestion&&(
                          <>
                            <span style={{fontSize:11,color:"var(--text3)"}}>·</span>
                            <span style={{fontSize:11,color:"var(--text3)"}}>+1 follow-up</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:16,
                          color:"var(--indigo)"}}>{survey.responseCount}</div>
                        <div style={{fontSize:9,fontWeight:600,color:"var(--text3)",
                          textTransform:"uppercase",letterSpacing:".07em"}}>Responses</div>
                      </div>
                      {survey.avgScore!==null&&(
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:16,
                            color:survey.type==="NPS"?npsColor(survey.avgScore):"var(--emerald)"}}>
                            {survey.avgScore}
                          </div>
                          <div style={{fontSize:9,fontWeight:600,color:"var(--text3)",
                            textTransform:"uppercase",letterSpacing:".07em"}}>Avg</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{display:"flex",gap:6,flexShrink:0}}
                      onClick={e=>e.stopPropagation()}>
                      {survey.status==="active"&&(
                        <button onClick={()=>setShowSend(survey)}
                          style={{display:"flex",alignItems:"center",gap:5,
                            background:"var(--indigo)",color:"white",border:"none",
                            borderRadius:"var(--r)",padding:"7px 12px",fontWeight:600,
                            fontSize:11,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                          <Ic n="note" size={12} color="white"/>Send
                        </button>
                      )}
                      {survey.status==="active"&&(
                        <button onClick={()=>closeSurvey(survey.id)}
                          style={{background:"var(--bg3)",color:"var(--text2)",
                            border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                            padding:"7px 10px",fontSize:11,fontWeight:600,
                            cursor:"pointer",fontFamily:"var(--font-display)"}}>
                          Close
                        </button>
                      )}
                      <button onClick={()=>deleteSurvey(survey.id)}
                        style={{background:"var(--rose-dim)",color:"var(--rose)",
                          border:"none",borderRadius:"var(--r)",
                          padding:"7px 10px",cursor:"pointer",display:"flex",
                          alignItems:"center"}}>
                        <Ic n="trash" size={13} color="var(--rose)"/>
                      </button>
                    </div>

                    <Ic n={exp?"chevron_up":"chevron_down"} size={16} color="var(--text3)"/>
                  </div>

                  {/* Responses expanded */}
                  {exp&&(
                    <div style={{borderTop:"1px solid var(--border)",padding:"16px 20px",
                      background:"var(--bg3)"}}>
                      {survey.responses.length===0 ? (
                        <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",padding:"12px 0"}}>
                          No responses yet — share the survey link to start collecting feedback.
                        </div>
                      ) : (
                        <>
                          <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                            textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>
                            {survey.responseCount} response{survey.responseCount!==1?"s":""}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {survey.responses.map(r=>(
                              <div key={r.id} style={{background:"var(--bg2)",borderRadius:"var(--r)",
                                padding:"12px 16px",border:"1.5px solid var(--border)",
                                display:"flex",gap:12,alignItems:"flex-start"}}>
                                {/* Score badge */}
                                <div style={{width:40,height:40,borderRadius:"var(--r)",
                                  flexShrink:0,display:"flex",alignItems:"center",
                                  justifyContent:"center",fontFamily:"var(--font-mono)",
                                  fontWeight:800,fontSize:16,
                                  background:survey.type==="NPS"
                                    ? r.score>=9?"var(--emerald-dim)":r.score>=7?"var(--amber-dim)":"var(--rose-dim)"
                                    : r.score>=4?"var(--emerald-dim)":r.score>=3?"var(--amber-dim)":"var(--rose-dim)",
                                  color:survey.type==="NPS"
                                    ? r.score>=9?"var(--emerald)":r.score>=7?"var(--amber)":"var(--rose)"
                                    : r.score>=4?"var(--emerald)":r.score>=3?"var(--amber)":"var(--rose)"}}>
                                  {r.score}
                                </div>
                                <div style={{flex:1}}>
                                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:r.customAnswer?6:0}}>
                                    {r.respondentName&&(
                                      <span style={{fontSize:13,fontWeight:600}}>{r.respondentName}</span>
                                    )}
                                    {survey.type==="NPS"&&(
                                      <span style={{fontSize:11,fontWeight:600,
                                        color:r.score>=9?"var(--emerald)":r.score>=7?"var(--amber)":"var(--rose)",
                                        background:r.score>=9?"var(--emerald-dim)":r.score>=7?"var(--amber-dim)":"var(--rose-dim)",
                                        padding:"1px 8px",borderRadius:"var(--r-xs)"}}>
                                        {npsLabel(r.score)}
                                      </span>
                                    )}
                                    <span style={{fontSize:11,color:"var(--text3)",marginLeft:"auto",
                                      fontFamily:"var(--font-mono)"}}>
                                      {new Date(r.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                                    </span>
                                  </div>
                                  {r.customAnswer&&(
                                    <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,
                                      fontStyle:"italic"}}>
                                      "{r.customAnswer}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {showCreate&&<SurveyCreateModal accounts={accounts} onClose={()=>setShowCreate(false)}
        onCreate={createSurvey} toast={toast}/>}
      {showSend&&<SurveySendModal survey={showSend} accounts={accounts} onClose={()=>setShowSend(null)} toast={toast} session={session} onGoToSettings={onGoToSettings}/>}

      {/* Auto-Survey Schedules */}
      <SurveySchedulesSection session={session} toast={toast}/>
    </div>
  );
};

// ── Public survey response page ───────────────────────────────────────────────
const SurveyResponsePage = ({ token }) => {
  const [survey,    setSurvey]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [score,     setScore]     = useState(null);
  const [answer,    setAnswer]    = useState("");
  const [respName,  setRespName]  = useState("");
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);

  useEffect(()=>{
    fetch(`${API_URL}/survey/${token}`)
      .then(r=>r.json())
      .then(d=>{
        if (d.error) setError(d.error);
        else setSurvey(d);
      })
      .catch(()=>setError("Could not load survey — please check the link and try again"))
      .finally(()=>setLoading(false));
  },[token]);

  const submit = async () => {
    if (score===null) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/survey/${token}`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          score,
          customAnswer: answer.trim()||null,
          respondentName: respName.trim()||null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err.message || "Submission failed — please try again");
    } finally { setSubmitting(false); }
  };

  const sc = survey ? SURVEY_CFG[survey.type] : null;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",
        alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{width:"100%",maxWidth:520,animation:"fadeUp .25s ease"}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:32}}>
            <div style={{width:32,height:32,borderRadius:"var(--r)",background:"var(--indigo)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 2px 8px var(--indigo-glow)"}}>
              <span style={{color:"white",fontSize:14,fontWeight:800}}>P</span>
            </div>
            <span style={{fontWeight:800,fontSize:17,letterSpacing:"-.03em"}}>Pulse</span>
          </div>

          {loading&&(
            <div style={{textAlign:"center",padding:48}}>
              <div style={{width:28,height:28,border:"3px solid var(--border2)",
                borderTopColor:"var(--indigo)",borderRadius:"50%",margin:"0 auto",
                animation:"spin .7s linear infinite"}}/>
            </div>
          )}

          {!loading&&error&&(
            <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:32,
              textAlign:"center",boxShadow:"var(--shadow-lg)",border:"1.5px solid var(--border)"}}>
              <Ic n="dismiss" size={40} color="var(--rose)" style={{margin:"0 auto 16px"}}/>
              <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>Survey unavailable</div>
              <div style={{fontSize:14,color:"var(--text3)",lineHeight:1.6}}>{error}</div>
            </div>
          )}

          {!loading&&!error&&!done&&survey&&(
            <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:32,
              boxShadow:"var(--shadow-lg)",border:"1.5px solid var(--border)"}}>

              {/* Header */}
              <div style={{marginBottom:28}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,
                  background:sc.bg,border:`1.5px solid ${sc.color}33`,
                  borderRadius:"var(--r-xs)",padding:"3px 10px",marginBottom:12}}>
                  <span style={{fontSize:11,fontWeight:700,color:sc.color,
                    fontFamily:"var(--font-mono)"}}>{sc.label}</span>
                  <span style={{fontSize:11,color:sc.color}}>{sc.full}</span>
                </div>
                <h1 style={{fontWeight:800,fontSize:22,letterSpacing:"-.02em",marginBottom:6}}>
                  {survey.type==="NPS"
                    ? "How likely are you to recommend us?"
                    : survey.type==="CES"
                    ? "How easy was it to work with us?"
                    : "How satisfied are you with our service?"}
                </h1>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
                  From <strong>{survey.accountName}</strong>
                </div>
              </div>

              {/* Score selector */}
              {survey.type==="NPS"&&(
                <div style={{marginBottom:24}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(11,1fr)",gap:4,marginBottom:8}}>
                    {Array.from({length:11},(_,i)=>(
                      <button key={i} onClick={()=>setScore(i)}
                        style={{aspectRatio:"1",borderRadius:"var(--r-sm)",border:"2px solid",
                          fontFamily:"var(--font-mono)",fontWeight:700,fontSize:13,cursor:"pointer",
                          transition:"all .12s",
                          borderColor:score===i?(i>=9?"var(--emerald)":i>=7?"var(--amber)":"var(--rose)"):"var(--border)",
                          background:score===i?(i>=9?"var(--emerald-dim)":i>=7?"var(--amber-dim)":"var(--rose-dim)"):"var(--bg3)",
                          color:score===i?(i>=9?"var(--emerald)":i>=7?"var(--amber)":"var(--rose)"):"var(--text2)"}}>
                        {i}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)"}}>
                    <span>Not at all likely</span>
                    <span>Extremely likely</span>
                  </div>
                  {score!==null&&(
                    <div style={{textAlign:"center",marginTop:10,fontSize:13,fontWeight:600,
                      color:npsColor(score),animation:"fadeUp .15s ease"}}>
                      {npsLabel(score)} — score {score}/10
                    </div>
                  )}
                </div>
              )}

              {(survey.type==="CES"||survey.type==="CSAT")&&(
                <div style={{marginBottom:24}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                    {[
                      {v:1,label:survey.type==="CES"?"Very difficult":"Very dissatisfied"},
                      {v:2,label:survey.type==="CES"?"Difficult":"Dissatisfied"},
                      {v:3,label:"Neutral"},
                      {v:4,label:survey.type==="CES"?"Easy":"Satisfied"},
                      {v:5,label:survey.type==="CES"?"Very easy":"Very satisfied"},
                    ].map(({v,label})=>(
                      <button key={v} onClick={()=>setScore(v)}
                        style={{padding:"14px 8px",borderRadius:"var(--r)",border:"2px solid",
                          cursor:"pointer",transition:"all .12s",
                          borderColor:score===v?(v>=4?"var(--emerald)":v===3?"var(--amber)":"var(--rose)"):"var(--border)",
                          background:score===v?(v>=4?"var(--emerald-dim)":v===3?"var(--amber-dim)":"var(--rose-dim)"):"var(--bg3)",
                          fontFamily:"var(--font-display)"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:20,
                          color:score===v?(v>=4?"var(--emerald)":v===3?"var(--amber)":"var(--rose)"):"var(--text2)",
                          marginBottom:4}}>{v}</div>
                        <div style={{fontSize:9,fontWeight:600,color:"var(--text3)",
                          textTransform:"uppercase",letterSpacing:".05em",lineHeight:1.3}}>{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom question */}
              {survey.customQuestion&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:8,color:"var(--text)"}}>
                    {survey.customQuestion}
                  </div>
                  <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
                    placeholder="Your answer…"
                    style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
                      borderRadius:"var(--r)",padding:"10px 12px",color:"var(--text)",
                      fontFamily:"var(--font-display)",fontSize:13,outline:"none",
                      resize:"vertical",minHeight:80,lineHeight:1.6}}/>
                </div>
              )}

              {/* Name */}
              <div style={{marginBottom:24}}>
                <Inp value={respName} onChange={e=>setRespName(e.target.value)}
                  placeholder="Your name (optional)"
                  style={{fontSize:13}}/>
              </div>

              <Btn onClick={submit}
                disabled={score===null||submitting}
                style={{width:"100%",padding:"13px",fontSize:14,opacity:score===null?0.5:1}}>
                {submitting
                  ? <span style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
                      <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",
                        borderTopColor:"white",borderRadius:"50%",display:"inline-block",
                        animation:"spin .7s linear infinite"}}/>Submitting…
                    </span>
                  : "Submit feedback"}
              </Btn>

              {score===null&&(
                <div style={{textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:8}}>
                  Select a score above to continue
                </div>
              )}
            </div>
          )}

          {done&&(
            <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:"40px 32px",
              textAlign:"center",boxShadow:"var(--shadow-lg)",border:"1.5px solid var(--border)",
              animation:"scaleIn .2s ease"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
                <Ic n="success" size={48} color="var(--emerald)"/>
              </div>
              <div style={{fontWeight:800,fontSize:22,marginBottom:8}}>Thank you!</div>
              <div style={{fontSize:14,color:"var(--text3)",lineHeight:1.7}}>
                Your feedback has been received. We appreciate you taking the time to share your thoughts.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── API client ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER  = import.meta.env.VITE_WHATSAPP_NUMBER  || "";

const api = async (method, path, body, token) => {
  if (!API_URL) return null; // no backend configured — fall back to localStorage
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type":   "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const error = new Error(err.error || "API error");
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
};

// ─── Auth screen ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onAuth }) => {
  const [mode,     setMode]     = useState("login");   // login | signup
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [company,  setCompany]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async () => {
    if (!email.trim() || !password.trim()) { setError("Email and password are required"); return; }
    if (mode === "signup" && !name.trim()) { setError("Full name is required"); return; }
    if (mode === "signup" && password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body     = mode === "login"
        ? { email, password }
        : { email, password, fullName: name, company };

      const data = await api("POST", endpoint, body);

      if (mode === "signup") {
        // After signup, auto-login
        const loginData = await api("POST", "/auth/login", { email, password });
        saveSession(loginData);
        onAuth(loginData);
      } else {
        saveSession(data);
        onAuth(data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  };

  // If no backend configured, skip auth entirely
  if (!API_URL) {
    onAuth(null);
    return null;
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",
        alignItems:"center",justifyContent:"center",padding:24}}>

        <div style={{width:"100%",maxWidth:420,animation:"fadeUp .25s ease"}}>

          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:12,justifyContent:"center",marginBottom:36}}>
            <div style={{width:40,height:40,borderRadius:"var(--r-lg)",background:"var(--indigo)",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 16px var(--indigo-glow)"}}>
              <svg width="22" height="12" viewBox="0 0 18 10" fill="none">
                <path d="M0 5H4L6 1L8 9L10 2L12 7L14 5H18" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{fontWeight:800,fontSize:22,letterSpacing:"-.04em"}}>Pulse</span>
          </div>

          {/* Card */}
          <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:"32px",
            boxShadow:"var(--shadow-lg)",border:"1.5px solid var(--border)"}}>

            <h1 style={{fontWeight:800,fontSize:20,letterSpacing:"-.02em",marginBottom:4}}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p style={{fontSize:13,color:"var(--text3)",marginBottom:28}}>
              {mode === "login"
                ? "Sign in to your Pulse workspace"
                : "Set up your CS command centre"}
            </p>

            {mode === "signup" && (
              <>
                <Fld label="Full name">
                  <Inp value={name} onChange={e=>setName(e.target.value)}
                    placeholder="Ahmed Al-Mansouri"
                    onKeyDown={e=>e.key==="Enter"&&submit()}/>
                </Fld>
                <Fld label="Company">
                  <Inp value={company} onChange={e=>setCompany(e.target.value)}
                    placeholder="Microsoft, Noon, Talabat…"
                    onKeyDown={e=>e.key==="Enter"&&submit()}/>
                </Fld>
              </>
            )}

            <Fld label="Work email">
              <Inp type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@company.com"
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </Fld>

            <Fld label="Password">
              <Inp type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </Fld>

            {error && (
              <div style={{display:"flex",gap:8,alignItems:"center",padding:"10px 12px",
                background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.2)",
                borderRadius:"var(--r)",marginBottom:16}}>
                <Ic n="dismiss" size={14} color="var(--rose)"/>
                <span style={{fontSize:13,color:"var(--rose)",fontWeight:500}}>{error}</span>
              </div>
            )}

            <Btn onClick={submit} disabled={loading}
              style={{width:"100%",padding:"12px",fontSize:14,
                display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading
                ? <><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white",borderRadius:"50%",display:"inline-block",
                    animation:"spin .7s linear infinite"}}/> {mode==="login"?"Signing in…":"Creating account…"}</>
                : mode === "login" ? "Sign in" : "Create account"
              }
            </Btn>

            <div style={{textAlign:"center",marginTop:20,fontSize:13,fontWeight:500,color:"var(--text3)"}}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}}
                style={{background:"none",border:"none",color:"var(--indigo)",
                  fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"var(--font-display)"}}>
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </div>
          </div>

          <p style={{textAlign:"center",fontSize:11,color:"var(--text3)",marginTop:20,lineHeight:1.6}}>
            Your data is isolated and never shared with other users.
          </p>
        </div>
      </div>
    </>
  );
};

const EmailSettingsPage = ({ session }) => {
  const [emailAccounts,    setEmailAccounts]    = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [connecting,       setConnecting]       = useState(null);
  const [actionLoading,    setActionLoading]    = useState(null);
  const [pageToast,        setPageToast]        = useState(null);
  const [calendarAccounts, setCalendarAccounts] = useState([]);
  const [calLoading,       setCalLoading]       = useState(true);
  const [connectingCal,    setConnectingCal]    = useState(false);
  const [calActionLoading, setCalActionLoading] = useState(null);

  const showPageToast = (msg, type = "success") => {
    setPageToast({ msg, type });
    setTimeout(() => setPageToast(null), 3000);
  };

  const fetchAccounts = useCallback(async () => {
    if (!API_URL) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/email/accounts`, {
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      const data = await res.json();
      setEmailAccounts(data.accounts || []);
    } catch {
      showPageToast("Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAccounts();
    // Re-fetch when OAuth popup closes
    const handleMessage = e => {
      if (e.data?.type === "OAUTH_SUCCESS") fetchAccounts();
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchAccounts]);

  // Re-fetch if URL has ?connected= (popup redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      fetchAccounts();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchAccounts]);

  const connectGmail = async () => {
    if (!API_URL) { showPageToast("Backend not configured", "error"); return; }
    setConnecting("gmail");
    try {
    const popup = window.open("", "connect_gmail",
  "width=520,height=640,scrollbars=yes,resizable=yes");
const res = await fetch(`${API_URL}/api/email/gmail/auth`, {
  headers: {
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
  },
});
const { url } = await res.json();
popup.location.href = url;
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setConnecting(null);
          fetchAccounts();
        }
      }, 500);
    } catch {
      showPageToast("Failed to start Gmail connection", "error");
      setConnecting(null);
    }
  };

  const setPrimary = async (id) => {
    setActionLoading(id + "_primary");
    try {
      await fetch(`${API_URL}/api/email/accounts/${id}/set-primary`, {
        method: "PATCH",
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      await fetchAccounts();
      showPageToast("Primary account updated");
    } catch {
      showPageToast("Failed to update", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const disconnect = async (id, email) => {
    if (!confirm(`Disconnect ${email}?`)) return;
    setActionLoading(id + "_disconnect");
    try {
      await fetch(`${API_URL}/api/email/accounts/${id}`, {
        method: "DELETE",
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      await fetchAccounts();
      showPageToast("Account disconnected");
    } catch {
      showPageToast("Failed to disconnect", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const [syncing, setSyncing] = useState(false);

  const syncEmails = async () => {
    if (!API_URL) return;
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/email/sync`, {
        method: "POST",
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      showPageToast(`Synced — ${data.matched} threads matched across ${data.accounts} accounts`);
    } catch (e) {
      showPageToast(e.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const fetchCalendarAccounts = useCallback(async () => {
    if (!API_URL) { setCalLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/calendar/accounts`, {
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      const data = await res.json();
      setCalendarAccounts(data.accounts || []);
    } catch {
      showPageToast("Failed to load calendar accounts", "error");
    } finally {
      setCalLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchCalendarAccounts();
    const handleCalMsg = e => {
      if (e.data?.type === "OAUTH_SUCCESS_CALENDAR") fetchCalendarAccounts();
    };
    window.addEventListener("message", handleCalMsg);
    return () => window.removeEventListener("message", handleCalMsg);
  }, [fetchCalendarAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "google_calendar") {
      fetchCalendarAccounts();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchCalendarAccounts]);

  const connectCalendar = async () => {
    if (!API_URL) { showPageToast("Backend not configured", "error"); return; }
    setConnectingCal(true);
    try {
      const popup = window.open("", "connect_calendar",
        "width=520,height=640,scrollbars=yes,resizable=yes");
      const res = await fetch(`${API_URL}/api/calendar/auth`, {
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      const { url } = await res.json();
      popup.location.href = url;
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setConnectingCal(false);
          fetchCalendarAccounts();
        }
      }, 500);
    } catch {
      showPageToast("Failed to start Calendar connection", "error");
      setConnectingCal(false);
    }
  };

  const disconnectCalendar = async (id, email) => {
    if (!confirm(`Disconnect ${email}?`)) return;
    setCalActionLoading(id + "_disconnect");
    try {
      await fetch(`${API_URL}/api/calendar/accounts/${id}`, {
        method: "DELETE",
        headers: {
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
      });
      await fetchCalendarAccounts();
      showPageToast("Calendar disconnected");
    } catch {
      showPageToast("Failed to disconnect", "error");
    } finally {
      setCalActionLoading(null);
    }
  };

  const hasGmail    = emailAccounts.some(a => a.provider === "gmail");
  const hasCalendar = calendarAccounts.length > 0;

  return (
    <div style={{animation:"fadeUp .2s ease",maxWidth:640}}>
      <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Email Settings</h1>
      <p style={{fontSize:13,color:"var(--text3)",marginBottom:28,lineHeight:1.6}}>
        Connect your Gmail account to send surveys directly from your own address.
        Recipients will see your name and email — not a generic noreply.
      </p>

      {/* Connect Gmail card */}
      <div style={{background:hasGmail?"rgba(234,67,53,0.04)":"var(--bg2)",border:`1.5px solid ${hasGmail?"rgba(234,67,53,0.25)":"var(--border)"}`,
        borderRadius:"var(--r-lg)",padding:"18px 20px",marginBottom:12,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:"var(--r)",
            border:"1.5px solid",borderColor:hasGmail?"rgba(234,67,53,0.3)":"var(--border)",
            display:"flex",alignItems:"center",justifyContent:"center",background:"white"}}>
            <svg viewBox="0 0 48 48" width="22" height="22">
              <path fill="#EA4335" d="M6 9a3 3 0 013-3h30a3 3 0 013 3v3L24 23 6 12V9z"/>
              <path fill="#34A853" d="M42 12L24 23 6 12v27a3 3 0 003 3h30a3 3 0 003-3V12z"/>
            </svg>
          </div>
          <div>
            <div style={{fontWeight:600,fontSize:14}}>Gmail</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>
              {hasGmail
                ? `${emailAccounts.filter(a=>a.provider==="gmail").length} account connected`
                : "Send surveys from your Gmail inbox"}
            </div>
          </div>
        </div>
        <button onClick={connectGmail} disabled={!!connecting}
          style={{padding:"8px 16px",borderRadius:"var(--r-sm)",fontSize:13,fontWeight:600,
            border:`1.5px solid ${hasGmail?"rgba(234,67,53,0.3)":"#EA4335"}`,
            background:hasGmail?"white":"#EA4335",
            color:hasGmail?"#EA4335":"white",cursor:"pointer",
            opacity:connecting?"gmail"===connecting?0.7:1:1,
            transition:"all .15s",whiteSpace:"nowrap",fontFamily:"var(--font-display)"}}>
          {connecting==="gmail" ? "Opening…" : hasGmail ? "+ Add another" : "Connect Gmail"}
        </button>
      </div>

      {/* Connected accounts */}
      {emailAccounts.length > 0 && (
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
            Connected accounts
          </div>
          <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
            {loading ? (
              <div style={{padding:"20px",textAlign:"center",color:"var(--text3)",fontSize:13}}>
                Loading…
              </div>
            ) : emailAccounts.map((acc, i) => (
              <div key={acc.id} style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",padding:"12px 16px",
                borderBottom:i<emailAccounts.length-1?"1px solid var(--border)":"none",
                background:"var(--bg2)",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                  <div style={{width:32,height:32,borderRadius:"var(--r-sm)",
                    background:"rgba(234,67,53,0.08)",
                    border:"1.5px solid rgba(234,67,53,0.2)",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg viewBox="0 0 48 48" width="16" height="16">
                      <path fill="#EA4335" d="M6 9a3 3 0 013-3h30a3 3 0 013 3v3L24 23 6 12V9z"/>
                      <path fill="#34A853" d="M42 12L24 23 6 12v27a3 3 0 003 3h30a3 3 0 003-3V12z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>
                      {acc.email}
                    </div>
                    <div style={{fontSize:11,color:"var(--text3)",display:"flex",
                      alignItems:"center",gap:6,marginTop:1}}>
                      Gmail
                      {acc.is_primary && (
                        <span style={{background:"var(--indigo-dim)",color:"var(--indigo)",
                          border:"1px solid rgba(59,94,222,0.2)",borderRadius:4,
                          fontSize:9,fontWeight:700,padding:"1px 6px"}}>
                          PRIMARY
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  {!acc.is_primary && (
                    <button onClick={() => setPrimary(acc.id)}
                      disabled={actionLoading===acc.id+"_primary"}
                      style={{padding:"5px 12px",borderRadius:"var(--r-sm)",
                        border:"1px solid var(--border)",background:"var(--bg3)",
                        color:"var(--text2)",fontSize:12,fontWeight:500,cursor:"pointer",
                        fontFamily:"var(--font-display)"}}>
                      {actionLoading===acc.id+"_primary" ? "Setting…" : "Set primary"}
                    </button>
                  )}
                  <button onClick={() => disconnect(acc.id, acc.email)}
                    disabled={actionLoading===acc.id+"_disconnect"}
                    style={{padding:"5px 12px",borderRadius:"var(--r-sm)",
                      border:"1px solid rgba(225,29,72,0.2)",background:"var(--rose-dim)",
                      color:"var(--rose)",fontSize:12,fontWeight:500,cursor:"pointer",
                      fontFamily:"var(--font-display)"}}>
                    {actionLoading===acc.id+"_disconnect" ? "…" : "Disconnect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync now */}
      {hasGmail && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
          padding:"14px 16px",marginBottom:16,gap:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>Sync email threads</div>
            <div style={{fontSize:12,color:"var(--text3)"}}>Match Gmail threads to your accounts. Also runs automatically every 6 hours.</div>
          </div>
          <button onClick={syncEmails} disabled={syncing}
            style={{padding:"8px 16px",borderRadius:"var(--r-sm)",fontSize:13,fontWeight:600,
              border:"1.5px solid var(--indigo)",background:"var(--indigo)",color:"white",
              cursor:syncing?"not-allowed":"pointer",opacity:syncing?0.7:1,
              transition:"all .15s",whiteSpace:"nowrap",fontFamily:"var(--font-display)"}}>
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && emailAccounts.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 20px",
          borderRadius:"var(--r-lg)",border:"1.5px dashed var(--border)",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:10}}>✉️</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:6}}>
            No email accounts connected
          </div>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            Connect Gmail above to start sending surveys from your own address.
          </div>
        </div>
      )}

      {/* ── Calendar Settings ─────────────────────────────── */}
      <div style={{borderTop:"1.5px solid var(--border)",margin:"28px 0 24px"}}/>
      <h2 style={{fontWeight:800,fontSize:20,letterSpacing:"-.03em",marginBottom:4}}>Calendar Settings</h2>
      <p style={{fontSize:13,color:"var(--text3)",marginBottom:20,lineHeight:1.6}}>
        Connect your Google Calendar so Pulse can detect upcoming customer meetings and generate pre-meeting briefs.
      </p>

      {/* Connect Calendar card */}
      <div style={{background:hasCalendar?"rgba(26,115,232,0.04)":"var(--bg2)",
        border:`1.5px solid ${hasCalendar?"rgba(26,115,232,0.25)":"var(--border)"}`,
        borderRadius:"var(--r-lg)",padding:"18px 20px",marginBottom:12,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,borderRadius:"var(--r)",
            border:"1.5px solid",borderColor:hasCalendar?"rgba(26,115,232,0.3)":"var(--border)",
            display:"flex",alignItems:"center",justifyContent:"center",background:"white"}}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" fill="white" stroke="#1a73e8" strokeWidth="1.5"/>
              <rect x="3" y="4" width="18" height="6" rx="2" fill="#1a73e8"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#1a73e8" strokeWidth="1.5"/>
              <circle cx="12" cy="16" r="2" fill="#1a73e8"/>
            </svg>
          </div>
          <div>
            <div style={{fontWeight:600,fontSize:14}}>Google Calendar</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>
              {hasCalendar
                ? `${calendarAccounts.length} calendar connected`
                : "Detect upcoming meetings for pre-meeting briefs"}
            </div>
          </div>
        </div>
        <button onClick={connectCalendar} disabled={connectingCal}
          style={{padding:"8px 16px",borderRadius:"var(--r-sm)",fontSize:13,fontWeight:600,
            border:`1.5px solid ${hasCalendar?"rgba(26,115,232,0.3)":"#1a73e8"}`,
            background:hasCalendar?"white":"#1a73e8",
            color:hasCalendar?"#1a73e8":"white",cursor:"pointer",
            opacity:connectingCal?0.7:1,
            transition:"all .15s",whiteSpace:"nowrap",fontFamily:"var(--font-display)"}}>
          {connectingCal ? "Opening…" : hasCalendar ? "+ Add another" : "+ Connect Calendar"}
        </button>
      </div>

      {/* Connected calendars list */}
      {calendarAccounts.length > 0 && (
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>
            Connected calendars
          </div>
          <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
            {calLoading ? (
              <div style={{padding:"20px",textAlign:"center",color:"var(--text3)",fontSize:13}}>Loading…</div>
            ) : calendarAccounts.map((acc, i) => (
              <div key={acc.id} style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",padding:"12px 16px",
                borderBottom:i<calendarAccounts.length-1?"1px solid var(--border)":"none",
                background:"var(--bg2)",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                  <div style={{width:32,height:32,borderRadius:"var(--r-sm)",
                    background:"rgba(26,115,232,0.08)",
                    border:"1.5px solid rgba(26,115,232,0.2)",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect x="3" y="4" width="18" height="17" rx="2" stroke="#1a73e8" strokeWidth="1.5"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="#1a73e8" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{acc.email}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>Google Calendar</div>
                  </div>
                </div>
                <button onClick={() => disconnectCalendar(acc.id, acc.email)}
                  disabled={calActionLoading===acc.id+"_disconnect"}
                  style={{padding:"5px 12px",borderRadius:"var(--r-sm)",
                    border:"1px solid rgba(225,29,72,0.2)",background:"var(--rose-dim)",
                    color:"var(--rose)",fontSize:12,fontWeight:500,cursor:"pointer",
                    fontFamily:"var(--font-display)"}}>
                  {calActionLoading===acc.id+"_disconnect" ? "…" : "Disconnect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar empty state */}
      {!calLoading && calendarAccounts.length === 0 && (
        <div style={{textAlign:"center",padding:"32px 20px",
          borderRadius:"var(--r-lg)",border:"1.5px dashed var(--border)",marginBottom:24}}>
          <div style={{fontSize:28,marginBottom:8}}>📅</div>
          <div style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:6}}>
            No calendars connected
          </div>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            Connect Google Calendar above to enable pre-meeting briefs.
          </div>
        </div>
      )}

      {/* Info box */}
      <div style={{display:"flex",gap:12,padding:"14px 16px",borderRadius:"var(--r-lg)",
        background:"var(--bg3)",border:"1.5px solid var(--border)"}}>
        <div style={{fontSize:18,flexShrink:0}}>🔒</div>
        <div>
          <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>How it works</div>
          <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.7}}>
            Pulse uses OAuth 2.0 — we never store your password. Access is limited to sending
            emails only. Revoke access at any time from your Google account settings.
          </div>
        </div>
      </div>

      {/* Toast */}
      {pageToast && (
        <div style={{position:"fixed",bottom:24,right:24,
          padding:"10px 18px",borderRadius:"var(--r)",fontSize:13,fontWeight:500,
          boxShadow:"var(--shadow-lg)",zIndex:9999,
          background:pageToast.type==="error"?"#FEE2E2":"#DCFCE7",
          color:pageToast.type==="error"?"#991B1B":"#166534"}}>
          {pageToast.type==="error" ? "⚠️" : "✓"} {pageToast.msg}
        </div>
      )}
    </div>
  );
};
// ─── Customer Portal ─────────────────────────────────────────────────────────
// ─── HandoverPage — sales-facing, rendered at /handover/:token (no auth) ──────
const HandoverPage = ({ token }) => {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [notes,     setNotes]     = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirming,setConfirming]= useState(false);

  useEffect(() => {
    fetch(`${API_URL}/handover/${token}`)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.error)))
      .then(d => { setData(d); setNotes(d.salesNotes || ""); setLoading(false);
                   if (d.status === "confirmed") setConfirmed(true); })
      .catch(e => { setError(e || "Link not found or expired"); setLoading(false); });
  }, [token]);

  const confirm = async () => {
    setConfirming(true);
    try {
      const r = await fetch(`${API_URL}/handover/${token}/confirm`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (r.ok) setConfirmed(true);
      else setError("Failed to confirm handover — please try again");
    } catch { setError("Network error — please check your connection and try again"); }
    setConfirming(false);
  };

  const s = { bg:"#FAFAF8", card:"white", border:"#E5E4E0", text:"#1C1B18", text2:"#57534E", text3:"#A8A29E", indigo:"#3B5EDE", emerald:"#059669" };

  if (loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:s.bg,fontFamily:"system-ui,sans-serif"}}>
      <div style={{color:s.text3}}>Loading handover…</div>
    </div>
  );
  if (error) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:s.bg,fontFamily:"system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔗</div>
        <div style={{fontSize:16,fontWeight:700,color:s.text,marginBottom:8}}>Link not found</div>
        <div style={{fontSize:13,color:s.text3}}>This handover link may have expired or is invalid.</div>
      </div>
    </div>
  );

  const acct = data.account;
  return (
    <div style={{minHeight:"100vh",background:s.bg,fontFamily:"system-ui,sans-serif",padding:"40px 16px"}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,color:s.indigo,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Sales Handover</div>
          <h1 style={{fontSize:26,fontWeight:800,color:s.text,letterSpacing:"-.03em",marginBottom:4}}>
            {acct?.name || "Account Handover"}
          </h1>
          {acct && (
            <div style={{fontSize:13,color:s.text3}}>
              {[acct.industry, acct.plan, acct.arr ? `$${acct.arr.toLocaleString()} ARR` : null].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>

        {/* Completeness bar */}
        <div style={{background:s.card,border:`1.5px solid ${s.border}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:12,fontWeight:600,color:s.text2}}>Handover completeness</span>
            <span style={{fontSize:13,fontWeight:800,color:data.completeness===100?s.emerald:s.indigo}}>{data.completeness}%</span>
          </div>
          <div style={{height:6,background:"#e2e8f0",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,transition:"width .3s",
              background:data.completeness===100?s.emerald:s.indigo,
              width:`${data.completeness}%`}}/>
          </div>
        </div>

        {/* Fields */}
        <div style={{background:s.card,border:`1.5px solid ${s.border}`,borderRadius:10,padding:"16px",marginBottom:16}}>
          {data.fields.map(({key,label,value}) => (
            <div key={key} style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:s.text3,letterSpacing:".06em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
              <div style={{fontSize:13,color:value?s.text:s.text3,lineHeight:1.6,fontStyle:value?"normal":"italic"}}>
                {value || "Not provided"}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm section */}
        {confirmed ? (
          <div style={{background:"#d1fae5",border:"1.5px solid #6ee7b7",borderRadius:10,padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:8}}>✅</div>
            <div style={{fontSize:15,fontWeight:700,color:"#065f46",marginBottom:4}}>Handover confirmed!</div>
            <div style={{fontSize:12,color:"#047857"}}>The CS team has been notified. You can close this tab.</div>
          </div>
        ) : (
          <div style={{background:s.card,border:`1.5px solid ${s.border}`,borderRadius:10,padding:"16px"}}>
            <div style={{fontSize:13,fontWeight:600,color:s.text,marginBottom:8}}>Your notes (optional)</div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Anything the CS team should know? Additional context, special requests, concerns…"
              rows={4}
              style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${s.border}`,borderRadius:8,
                fontSize:13,fontFamily:"system-ui,sans-serif",color:s.text,background:s.bg,
                outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            <button onClick={confirm} disabled={confirming}
              style={{marginTop:12,width:"100%",padding:"12px",background:s.indigo,color:"white",
                border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:confirming?"not-allowed":"pointer",
                opacity:confirming?0.7:1,transition:"opacity .15s"}}>
              {confirming ? "Confirming…" : "Confirm & sign off handover"}
            </button>
          </div>
        )}

        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:s.text3}}>
          Powered by Pulse · This link was shared by your CS team
        </div>
      </div>
    </div>
  );
};

// PortalPage — customer-facing, rendered at /portal/:token (no auth)
const PortalPage = ({ token }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tasks,   setTasks]   = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/portal/${token}`)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e.error)))
      .then(d => { setData(d); setTasks(d.tasks || []); setLoading(false); })
      .catch(e => { setError(e || 'Something went wrong'); setLoading(false); });
  }, [token]);

  const toggleTask = async (task) => {
    const next = task.status === 'done' ? 'not_started' : 'done';
    setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: next } : t));
    await fetch(`${API_URL}/portal/${token}/tasks/${task.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    }).catch(() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: task.status } : t)));
  };

  const s = { bg: '#FAFAF8', card: 'white', border: '#E5E4E0', text: '#1C1B18', text2: '#57534E', text3: '#A8A29E', indigo: '#3B5EDE', emerald: '#059669', amber: '#D97706', rose: '#E11D48' };

  if (loading) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,border:`2px solid ${s.border}`,borderTopColor:s.indigo,borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
    </div>
  );

  if (error || !data) return (
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
      <div style={{fontSize:16,fontWeight:600,color:s.text}}>Portal not found</div>
      <div style={{fontSize:13,color:s.text3}}>This link may have been removed or doesn't exist.</div>
    </div>
  );

  const { config: cfg, account, csm, onboarding, activeSurvey, surveyHistory, successGoal } = data;
  const doneTasks  = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const renewal    = account.renewal_date ? Math.floor((new Date(account.renewal_date) - Date.now()) / 86400000) : null;
  const stability  = account.churn_risk != null ? 100 - account.churn_risk : null;

  const Card = ({ children, style }) => (
    <div style={{ background: s.card, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: s.text3, textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
  );

  // Health ring (reuse visual pattern)
  const hColor = v => v >= 70 ? s.emerald : v >= 45 ? s.amber : s.rose;
  const HealthRing = ({ score, size = 56 }) => {
    const r = (size - 6) / 2, circ = 2 * Math.PI * r, fill = (score / 100) * circ;
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={s.border} strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={hColor(score)} strokeWidth={5}
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"/>
      </svg>
    );
  };

  const OB_PHASE_LABELS = { handover:'Handover', kickoff:'Kickoff', configuration:'Configuration', training:'Training', go_live:'Go Live', value_realized:'Value Realized' };
  const OB_PHASE_KEYS   = ['handover','kickoff','configuration','training','go_live','value_realized'];

  return (
    <div style={{ minHeight: '100vh', background: s.bg, fontFamily: 'Inter, system-ui, sans-serif', color: s.text }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: `1px solid ${s.border}`, padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: s.text }}>{csm.company || 'Your CSM'}</div>
        <div style={{ fontSize: 11, color: s.text3 }}>
          {csm.full_name && <span style={{ marginRight: 6 }}>Your CSM: <strong style={{ color: s.text2 }}>{csm.full_name}</strong></span>}
          · Powered by <span style={{ color: s.indigo, fontWeight: 600 }}>Pulse</span>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Account hero */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 4 }}>{account.name}</div>
            <div style={{ fontSize: 13, color: s.text3 }}>Your success dashboard</div>
          </div>
          {cfg.show_health && account.health_score != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HealthRing score={account.health_score}/>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: hColor(account.health_score), lineHeight: 1 }}>{account.health_score}</div>
                <div style={{ fontSize: 11, color: s.text3, marginTop: 2 }}>Health score</div>
              </div>
            </div>
          )}
        </div>

        {/* Health breakdown */}
        {cfg.show_health && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Account Health</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Satisfaction (NPS)', value: account.nps != null ? `${account.nps}/100` : '—', color: account.nps >= 50 ? s.emerald : s.amber },
                { label: 'Ease of use (CES)',  value: account.ces != null ? `${account.ces?.toFixed(1)}/5` : '—', color: account.ces >= 3.5 ? s.emerald : s.amber },
                { label: 'Platform adoption',  value: account.product_usage != null ? `${account.product_usage}%` : '—', color: account.product_usage >= 60 ? s.emerald : s.amber },
                { label: 'Open support issues', value: account.open_tickets != null ? account.open_tickets : '—', color: account.open_tickets > 4 ? s.rose : s.emerald },
              ].map(m => (
                <div key={m.label} style={{ background: s.bg, borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: s.text3 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Account stability (churn risk reframed) */}
        {cfg.show_churn_risk && stability != null && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Account Stability</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: stability >= 70 ? s.emerald : stability >= 40 ? s.amber : s.rose }}>{stability}%</div>
                <div style={{ fontSize: 12, color: s.text2, marginTop: 4 }}>
                  {stability >= 70 ? 'Strong — your account is in great shape' : stability >= 40 ? 'Moderate — there are a few things to address together' : 'Needs attention — let\'s work on this together'}
                </div>
              </div>
              <div style={{ width: 64, height: 6, background: s.border, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stability}%`, background: stability >= 70 ? s.emerald : stability >= 40 ? s.amber : s.rose, borderRadius: 3 }}/>
              </div>
            </div>
          </Card>
        )}

        {/* Value goals */}
        {cfg.show_value_goals && successGoal && (
          <Card style={{ marginBottom: 16, background: '#f0f4ff', border: `1.5px solid #c7d2fe` }}>
            <SectionLabel>Your Success Goal</SectionLabel>
            <div style={{ fontSize: 14, color: s.text, lineHeight: 1.65 }}>{successGoal}</div>
          </Card>
        )}

        {/* Onboarding progress */}
        {cfg.show_onboarding && onboarding && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Onboarding Progress</SectionLabel>
            <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
              {OB_PHASE_KEYS.map((key, i) => {
                const ph    = (onboarding.phases || {})[key] || {};
                const done  = !!ph.actual;
                const skip  = ph.skipped;
                const curr  = onboarding.current_phase === key;
                const color = done ? s.emerald : curr ? s.indigo : s.border;
                return (
                  <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, background: done ? s.emerald : s.border }}/>}
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: skip ? s.border : color, border: `2px solid ${skip ? s.border : color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done && !skip && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                        {curr && !done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }}/>}
                      </div>
                      {i < OB_PHASE_KEYS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? s.emerald : s.border }}/>}
                    </div>
                    <div style={{ fontSize: 9, color: curr ? s.indigo : done ? s.emerald : s.text3, fontWeight: curr || done ? 700 : 400, textAlign: 'center', letterSpacing: '.01em' }}>
                      {skip ? '—' : OB_PHASE_LABELS[key]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: s.text2, textAlign: 'center', background: s.bg, borderRadius: 6, padding: '6px 12px' }}>
              Current phase: <strong style={{ color: s.indigo }}>{OB_PHASE_LABELS[onboarding.current_phase] || onboarding.current_phase}</strong>
            </div>
          </Card>
        )}

        {/* Customer tasks */}
        {cfg.show_tasks && tasks.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <SectionLabel>Your Tasks</SectionLabel>
              <span style={{ fontSize: 11, fontWeight: 600, color: doneTasks === totalTasks ? s.emerald : s.text3 }}>
                {doneTasks}/{totalTasks} done
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(task => (
                <div key={task.id}
                  onClick={() => toggleTask(task)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
                    background: task.status === 'done' ? '#f0fdf4' : s.bg, border: `1px solid ${task.status === 'done' ? '#bbf7d0' : s.border}`,
                    cursor: 'pointer', transition: 'all .15s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${task.status === 'done' ? s.emerald : s.border}`,
                    background: task.status === 'done' ? s.emerald : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.status === 'done' && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: task.status === 'done' ? s.text3 : s.text, textDecoration: task.status === 'done' ? 'line-through' : 'none', flex: 1 }}>{task.title}</span>
                  {task.due_date && <span style={{ fontSize: 11, color: s.text3 }}>{task.due_date}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Renewal */}
        {cfg.show_renewal && account.renewal_date && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Renewal</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: renewal != null && renewal <= 60 ? s.amber : s.text }}>{account.renewal_date}</div>
                <div style={{ fontSize: 12, color: s.text3, marginTop: 2 }}>
                  {renewal != null ? (renewal > 0 ? `${renewal} days away` : 'Renewal date passed') : ''}
                </div>
              </div>
              {renewal != null && renewal > 0 && renewal <= 90 && (
                <div style={{ marginLeft: 'auto', background: renewal <= 30 ? '#fff1f2' : '#fffbeb', border: `1px solid ${renewal <= 30 ? '#fecdd3' : '#fef3c7'}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, color: renewal <= 30 ? s.rose : s.amber, fontWeight: 600 }}>
                  {renewal <= 30 ? 'Coming up soon' : 'Coming up'}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Survey prompt */}
        {cfg.show_survey && activeSurvey && (
          <Card style={{ marginBottom: 16, background: '#f0f4ff', border: '1.5px solid #c7d2fe' }}>
            <SectionLabel>Share Your Feedback</SectionLabel>
            <div style={{ fontSize: 14, color: s.text, marginBottom: 14, lineHeight: 1.5 }}>
              We'd love to hear how things are going. Takes less than a minute.
            </div>
            <a href={`${window.location.origin}/survey/${activeSurvey.token}`}
              style={{ display: 'inline-block', background: s.indigo, color: 'white', padding: '9px 20px',
                borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              {activeSurvey.type === 'NPS' ? 'Rate your experience →' : activeSurvey.type === 'CES' ? 'Rate your effort →' : 'Share feedback →'}
            </a>
          </Card>
        )}

        {/* Feedback loop */}
        {cfg.show_feedback_loop && surveyHistory.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Your Feedback History</SectionLabel>
            <div style={{ fontSize: 12, color: s.text2, marginBottom: 12 }}>We track every response and use it to improve your experience.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {surveyHistory.slice(0, 5).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: s.bg, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: '#e0e7ff', color: s.indigo, borderRadius: 4 }}>{r.type}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: s.text }}>{r.score}</span>
                  </div>
                  <span style={{ fontSize: 11, color: s.text3 }}>{new Date(r.submitted_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};

// ─── OnboardingPage (hub) ─────────────────────────────────────────────────────
const OnboardingPage = ({ call, toast, accounts = [], onAccountClick }) => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    call("GET", "/api/onboarding/all")
      .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [call]);

  const PHASE_COLOR = {
    handover:"var(--text3)", kickoff:"var(--sky)", configuration:"var(--indigo)",
    training:"var(--violet)", go_live:"var(--amber)", value_realized:"var(--emerald)",
  };

  return (
    <div style={{maxWidth:860,margin:"0 auto",animation:"fadeUp .2s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em",color:"var(--text)",marginBottom:4}}>Onboarding</h1>
          <p style={{fontSize:13,color:"var(--text2)",margin:0}}>
            {plans.length} active onboarding plan{plans.length!==1?"s":""} — open any account's Onboarding tab to manage it.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--text3)",fontSize:13,height:200,justifyContent:"center"}}>
          <div style={{width:18,height:18,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          Loading…
        </div>
      ) : plans.length === 0 ? (
        <div style={{textAlign:"center",padding:"56px 24px",background:"var(--bg2)",
          border:"1.5px dashed var(--border2)",borderRadius:"var(--r-lg)",color:"var(--text3)"}}>
          <Ic n="onboarding" size={32} color="var(--border2)" style={{marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:600,marginBottom:6,color:"var(--text2)"}}>No active onboarding plans</div>
          <div style={{fontSize:13}}>Open any account and go to the Onboarding tab to start a plan.</div>
        </div>
      ) : (
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 80px",
            padding:"9px 16px",borderBottom:"1px solid var(--border)",
            fontSize:10,fontWeight:700,color:"var(--text3)",letterSpacing:".04em"}}>
            <span>ACCOUNT</span><span>PHASE</span><span>CUSTOMER TASKS</span><span>CSM TASKS</span><span>HEALTH</span>
          </div>
          {plans.map(p => {
            const acc    = accounts.find(a => a.id === p.account_id);
            const tasks  = [...Array(p.customer_total)].map((_,i)=>({ done: i < p.customer_done }));
            const pct    = p.customer_total > 0 ? Math.round((p.customer_done / p.customer_total) * 100) : null;
            const health = computeObHealth(p, [
              ...Array(p.csm_done).fill({owner:"csm",status:"done"}),
              ...Array(p.csm_total - p.csm_done).fill({owner:"csm",status:"not_started"}),
              ...Array(p.customer_done).fill({owner:"customer",status:"done"}),
              ...Array(p.customer_total - p.customer_done).fill({owner:"customer",status:"not_started"}),
            ]);
            return (
              <div key={p.id} onClick={()=>acc&&onAccountClick(acc)}
                className="card-hover"
                style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 80px",
                  padding:"12px 16px",borderBottom:"1px solid var(--border)",
                  cursor:acc?"pointer":"default",alignItems:"center"}}>
                <div style={{fontWeight:600,fontSize:13,color:"var(--text)"}}>
                  {acc?.name || p.account_id}
                </div>
                <div>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:"var(--r-xs)",
                    background:"var(--bg4)",color:PHASE_COLOR[p.current_phase]||"var(--text3)"}}>
                    {OB_PHASES.find(x=>x.key===p.current_phase)?.label||p.current_phase}
                  </span>
                </div>
                <div style={{fontSize:12,color:"var(--text2)"}}>
                  {p.customer_done}/{p.customer_total}
                  {pct!=null&&<span style={{marginLeft:6,fontSize:10,color:"var(--text3)"}}>{pct}%</span>}
                </div>
                <div style={{fontSize:12,color:"var(--text2)"}}>{p.csm_done}/{p.csm_total}</div>
                <div><Ring score={health} size={36}/></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── AutomationPage ───────────────────────────────────────────────────────────
const TRIGGER_OPTS = [
  { value:"health_below",      label:"Health score drops below",  unit:"(0–100)",    field:"threshold", def:40    },
  { value:"no_contact_days",   label:"No contact for more than",  unit:"days",       field:"days",      def:14    },
  { value:"renewal_days",      label:"Renewal approaching within",unit:"days",       field:"days",      def:30    },
  { value:"renewal_overdue",   label:"Renewal date has passed",   unit:"",           field:null,        def:null  },
  { value:"nps_below",         label:"NPS drops below",           unit:"(0–100)",    field:"threshold", def:50    },
  { value:"ces_below",         label:"CES drops below",           unit:"(1–5)",      field:"threshold", def:3     },
  { value:"usage_below",       label:"Usage drops below",         unit:"%",          field:"threshold", def:40    },
  { value:"open_tickets_above",label:"Open tickets above",        unit:"tickets",    field:"threshold", def:5     },
  { value:"churn_risk_above",  label:"Churn risk above",          unit:"%",          field:"threshold", def:60    },
  { value:"arr_above",         label:"Account ARR above",         unit:"(USD)",      field:"amount",    def:10000 },
  { value:"account_age_days",  label:"Account reaches",           unit:"days old",   field:"days",      def:30    },
  { value:"survey_low_score",  label:"Survey response below",     unit:"(raw score)",field:"threshold", def:6     },
];
const STAGES = ["Healthy","Stable","Needs Attention","At Risk"];
const PLAYBOOK_OPTS = [
  { id:"pb-001", name:"New Account Activation"     },
  { id:"pb-002", name:"Slow Onboarding Recovery"   },
  { id:"pb-003", name:"Executive Sponsor Introduction"},
  { id:"pb-004", name:"Early Warning Response"     },
  { id:"pb-005", name:"Critical Recovery"          },
  { id:"pb-006", name:"Silent Account Re-engagement"},
  { id:"pb-007", name:"Renewal Preparation"        },
  { id:"pb-008", name:"At-Risk Renewal"            },
  { id:"pb-009", name:"Expansion Signal"           },
  { id:"pb-010", name:"QBR Preparation & Delivery" },
  { id:"pb-011", name:"Executive Escalation"       },
  { id:"pb-012", name:"Champion Succession"        },
];
const ACTION_OPTS = [
  { value:"log_activity",    label:"Log a note on the account",    type:"text",     configField:"note",       def:"Attention needed — please review this account." },
  { value:"create_task",     label:"Create a task on the account", type:"text",     configField:"title",      def:"Follow up with account" },
  { value:"activate_playbook",label:"Activate a playbook",         type:"playbook", configField:"playbook_id",def:"" },
  { value:"update_stage",    label:"Update account stage to",      type:"stage",    configField:"stage",      def:"At Risk" },
  { value:"email_alert",     label:"Send me an email alert",       type:"email",    configField:"body",       def:"Rule triggered for {account} — health is {health}, NPS is {nps}." },
];

function triggerLabel(rule) {
  const opt = TRIGGER_OPTS.find(o => o.value === rule.trigger_type);
  if (!opt) return rule.trigger_type;
  if (!opt.field) return opt.label;
  const val = rule.trigger_config?.[opt.field] ?? opt.def;
  return `${opt.label} ${val} ${opt.unit}`;
}
function actionLabel(rule) {
  const opt = ACTION_OPTS.find(o => o.value === rule.action_type);
  if (!opt) return rule.action_type;
  const cfg = rule.action_config || {};
  if (opt.type === "playbook") return `${opt.label}: ${cfg.playbook_name || cfg.playbook_id || ""}`;
  if (opt.type === "stage")    return `${opt.label} "${cfg.stage || ""}"`;
  if (opt.type === "email")    return `${opt.label}: "${cfg.subject || ""}"`;
  const val = cfg[opt.configField] || "";
  return `${opt.label}${val ? ` — "${val}"` : ""}`;
}
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const AutomationPage = ({ call, toast, accounts = [] }) => {
  const [rules,    setRules]    = useState([]);
  const [log,      setLog]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);

  const blankForm = () => ({
    name: "", trigger_type: "health_below", trigger_value: 40,
    action_type: "log_activity",
    action_text: "Attention needed — please review this account.",
    action_subject: "Pulse Alert: {account}",
    action_playbook_id: "pb-001", action_playbook_name: "New Account Activation",
    action_stage: "At Risk",
    scope: "all",
    scope_account_id: "", scope_account_name: "",
    scope_plan: "", scope_stage: "", scope_arr_min: "",
  });
  const [form, setForm] = useState(blankForm());

  const fetchAll = useCallback(async () => {
    try {
      const [rules, log] = await Promise.all([
        call("GET", "/api/automation/rules"),
        call("GET", "/api/automation/log"),
      ]);
      setRules(rules || []);
      setLog(log || []);
    } catch {} finally { setLoading(false); }
  }, [call]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const triggerOpt  = TRIGGER_OPTS.find(o => o.value === form.trigger_type) || TRIGGER_OPTS[0];
  const actionOpt   = ACTION_OPTS.find(o => o.value === form.action_type)   || ACTION_OPTS[0];

  const openNew = () => { setEditing(null); setForm(blankForm()); setShowForm(true); };
  const openEdit = rule => {
    const tOpt = TRIGGER_OPTS.find(o => o.value === rule.trigger_type) || TRIGGER_OPTS[0];
    const cfg  = rule.action_config || {};
    const seg  = rule.segment_config || {};
    let scope = "all", scope_account_id = "", scope_account_name = "",
        scope_plan = "", scope_stage = "", scope_arr_min = "";
    if (rule.account_id) {
      scope = "account";
      scope_account_id   = rule.account_id;
      scope_account_name = accounts.find(a => a.id === rule.account_id)?.name || "";
    } else if (seg.plan || seg.stage || seg.arr_min) {
      scope = "segment";
      scope_plan    = seg.plan    || "";
      scope_stage   = seg.stage   || "";
      scope_arr_min = seg.arr_min || "";
    }
    setEditing(rule);
    setForm({
      name: rule.name,
      trigger_type:  rule.trigger_type,
      trigger_value: tOpt.field ? (rule.trigger_config?.[tOpt.field] ?? tOpt.def) : null,
      action_type:         rule.action_type,
      action_text:         cfg.note || cfg.title || cfg.body || "",
      action_subject:      cfg.subject || "Pulse Alert: {account}",
      action_playbook_id:  cfg.playbook_id   || "pb-001",
      action_playbook_name:cfg.playbook_name || "New Account Activation",
      action_stage:        cfg.stage         || "At Risk",
      scope, scope_account_id, scope_account_name,
      scope_plan, scope_stage, scope_arr_min,
    });
    setShowForm(true);
  };

  const saveRule = async () => {
    if (!form.name.trim()) { toast?.("Name is required", "error"); return; }
    const tOpt = TRIGGER_OPTS.find(o => o.value === form.trigger_type);
    const aOpt = ACTION_OPTS.find(o => o.value === form.action_type);

    const trigger_config = tOpt.field
      ? { [tOpt.field]: Number(form.trigger_value) }
      : {};

    let action_config = {};
    if (aOpt.type === "text")     action_config = { [aOpt.configField]: form.action_text };
    if (aOpt.type === "playbook") action_config = { playbook_id: form.action_playbook_id, playbook_name: form.action_playbook_name };
    if (aOpt.type === "stage")    action_config = { stage: form.action_stage };
    if (aOpt.type === "email")    action_config = { subject: form.action_subject, body: form.action_text };

    let account_id     = null;
    let segment_config = {};
    if (form.scope === "account") {
      account_id = form.scope_account_id || null;
    } else if (form.scope === "segment") {
      if (form.scope_plan)    segment_config.plan    = form.scope_plan;
      if (form.scope_stage)   segment_config.stage   = form.scope_stage;
      if (form.scope_arr_min) segment_config.arr_min = Number(form.scope_arr_min);
    }

    const body = { name: form.name.trim(), trigger_type: form.trigger_type, trigger_config, action_type: form.action_type, action_config, account_id, segment_config };
    const path   = editing ? `/api/automation/rules/${editing.id}` : `/api/automation/rules`;
    const method = editing ? "PATCH" : "POST";
    try {
      await call(method, path, body);
      toast?.(editing ? "Rule updated" : "Rule created", "success");
      setShowForm(false);
      fetchAll();
    } catch { toast?.("Failed to save rule", "error"); }
  };

  const deleteRule = async id => {
    if (!window.confirm("Delete this rule?")) return;
    try { await call("DELETE", `/api/automation/rules/${id}`); } catch {}
    fetchAll();
  };

  const toggleRule = async rule => {
    try { await call("PATCH", `/api/automation/rules/${rule.id}`, { enabled: !rule.enabled }); } catch {}
    fetchAll();
  };

  const inputStyle = { width:"100%",padding:"9px 12px",border:"1.5px solid var(--border)",
    borderRadius:"var(--r-sm)",fontSize:13,fontFamily:"var(--font-display)",
    background:"var(--bg)",color:"var(--text)",outline:"none" };
  const labelStyle = { fontSize:12,fontWeight:600,color:"var(--text2)",marginBottom:4,display:"block" };

  return (
    <div style={{maxWidth:820,margin:"0 auto",animation:"fadeUp .2s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,letterSpacing:"-.03em",color:"var(--text)",marginBottom:4}}>
            Automation
          </h1>
          <p style={{fontSize:13,color:"var(--text2)",margin:0}}>
            Rules that run hourly — Pulse acts on your accounts automatically.
          </p>
        </div>
        <button onClick={openNew}
          style={{display:"flex",alignItems:"center",gap:7,background:"var(--indigo)",color:"white",
            border:"none",borderRadius:"var(--r)",padding:"10px 18px",fontWeight:600,fontSize:13,
            cursor:"pointer",fontFamily:"var(--font-display)",boxShadow:"0 2px 8px var(--indigo-glow)"}}>
          <Ic n="plus" size={13} color="white"/> New Rule
        </button>
      </div>

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,gap:12,color:"var(--text3)",fontSize:13}}>
          <div style={{width:18,height:18,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          Loading…
        </div>
      ) : (
        <>
          {/* Rules list */}
          {rules.length === 0 && !showForm && (
            <div style={{textAlign:"center",padding:"48px 24px",background:"var(--bg2)",
              border:"1.5px dashed var(--border2)",borderRadius:"var(--r-lg)",color:"var(--text3)"}}>
              <Ic n="automation" size={32} color="var(--border2)" style={{marginBottom:12}}/>
              <div style={{fontSize:14,fontWeight:600,marginBottom:6,color:"var(--text2)"}}>No rules yet</div>
              <div style={{fontSize:13}}>Create your first rule to start automating account actions.</div>
            </div>
          )}

          {rules.map(rule => (
            <div key={rule.id} className="card-hover"
              style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
                padding:"16px 20px",marginBottom:10,display:"flex",alignItems:"center",gap:16}}>
              {/* Toggle */}
              <div onClick={() => toggleRule(rule)} title={rule.enabled ? "Disable" : "Enable"}
                style={{width:34,height:20,borderRadius:99,flexShrink:0,cursor:"pointer",
                  background:rule.enabled?"var(--indigo)":"var(--bg4)",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:3,left:rule.enabled?16:3,width:14,height:14,
                  borderRadius:"50%",background:"white",transition:"left .2s",boxShadow:"var(--shadow-xs)"}}/>
              </div>

              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:rule.enabled?"var(--text)":"var(--text3)",marginBottom:3}}>
                  {rule.name}
                </div>
                <div style={{fontSize:12,color:"var(--text3)",display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{background:"var(--amber-dim)",color:"var(--amber)",padding:"2px 8px",borderRadius:"var(--r-xs)",fontWeight:500}}>
                    When: {triggerLabel(rule)}
                  </span>
                  <span style={{background:"var(--indigo-dim)",color:"var(--indigo)",padding:"2px 8px",borderRadius:"var(--r-xs)",fontWeight:500}}>
                    Then: {actionLabel(rule)}
                  </span>
                  {rule.account_id && (
                    <span style={{background:"var(--violet-dim)",color:"var(--violet)",padding:"2px 8px",borderRadius:"var(--r-xs)",fontWeight:500}}>
                      {accounts.find(a => a.id === rule.account_id)?.name || "Specific account"} only
                    </span>
                  )}
                  {!rule.account_id && rule.segment_config && Object.values(rule.segment_config).some(Boolean) && (
                    <span style={{background:"var(--teal-dim)",color:"var(--teal)",padding:"2px 8px",borderRadius:"var(--r-xs)",fontWeight:500}}>
                      {[rule.segment_config.plan, rule.segment_config.stage, rule.segment_config.arr_min ? `ARR ≥ $${rule.segment_config.arr_min.toLocaleString()}` : null].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={() => openEdit(rule)} className="icon-btn"
                  style={{background:"var(--bg3)",border:"none",cursor:"pointer",padding:"6px 8px",borderRadius:"var(--r-sm)"}}>
                  <Ic n="edit" size={13} color="var(--text2)"/>
                </button>
                <button onClick={() => deleteRule(rule.id)} className="icon-btn"
                  style={{background:"var(--bg3)",border:"none",cursor:"pointer",padding:"6px 8px",borderRadius:"var(--r-sm)"}}>
                  <Ic n="trash" size={13} color="var(--rose)"/>
                </button>
              </div>
            </div>
          ))}

          {/* Recent log */}
          {log.length > 0 && (
            <div style={{marginTop:32}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text2)",marginBottom:12,letterSpacing:"-.01em"}}>
                Recent activity
              </div>
              {log.map(entry => (
                <div key={entry.id}
                  style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",
                    borderBottom:"1px solid var(--border)"}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"var(--indigo)",
                    flexShrink:0,marginTop:5}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontWeight:600,fontSize:13,color:"var(--text)"}}>{entry.account_name}</span>
                    <span style={{fontSize:13,color:"var(--text2)"}}> — {entry.detail || entry.action_type}</span>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                      via <em>{entry.rule_name}</em> · {timeAgo(entry.fired_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Rule form modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",zIndex:800,
          display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={e => e.target===e.currentTarget && setShowForm(false)}>
          <div style={{background:"var(--bg2)",borderRadius:"var(--r-xl)",padding:28,
            width:"100%",maxWidth:480,boxShadow:"var(--shadow-lg)",animation:"scaleIn .15s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <h2 style={{fontSize:16,fontWeight:700,color:"var(--text)",margin:0}}>
                {editing ? "Edit rule" : "New automation rule"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
                <Ic n="close" size={16} color="var(--text3)"/>
              </button>
            </div>

            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Rule name</label>
              <input style={inputStyle} placeholder="e.g. Alert on low health"
                value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
            </div>

            <div style={{marginBottom:16}}>
              <label style={labelStyle}>Trigger — When this condition is met…</label>
              <select style={{...inputStyle,marginBottom:8}} value={form.trigger_type}
                onChange={e => {
                  const opt = TRIGGER_OPTS.find(o => o.value === e.target.value);
                  setForm(f => ({...f, trigger_type: e.target.value, trigger_value: opt?.def ?? 0}));
                }}>
                {TRIGGER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}{o.unit ? ` … ${o.unit}` : ""}</option>)}
              </select>
              {triggerOpt.field && (
                <input style={inputStyle} type="number" min="0" max="999999"
                  placeholder={`Value ${triggerOpt.unit}`}
                  value={form.trigger_value ?? ""}
                  onChange={e => setForm(f => ({...f, trigger_value: e.target.value}))}/>
              )}
            </div>

            <div style={{marginBottom:24}}>
              <label style={labelStyle}>Action — …do this automatically</label>
              <select style={{...inputStyle,marginBottom:8}} value={form.action_type}
                onChange={e => {
                  const opt = ACTION_OPTS.find(o => o.value === e.target.value);
                  setForm(f => ({...f, action_type: e.target.value, action_text: opt?.def ?? ""}));
                }}>
                {ACTION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {actionOpt.type === "text" && (
                <input style={inputStyle} placeholder={actionOpt.configField === "note" ? "Note text" : "Task title"}
                  value={form.action_text}
                  onChange={e => setForm(f => ({...f, action_text: e.target.value}))}/>
              )}
              {actionOpt.type === "playbook" && (
                <select style={inputStyle} value={form.action_playbook_id}
                  onChange={e => {
                    const pb = PLAYBOOK_OPTS.find(p => p.id === e.target.value);
                    setForm(f => ({...f, action_playbook_id: e.target.value, action_playbook_name: pb?.name || ""}));
                  }}>
                  {PLAYBOOK_OPTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              {actionOpt.type === "stage" && (
                <select style={inputStyle} value={form.action_stage}
                  onChange={e => setForm(f => ({...f, action_stage: e.target.value}))}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {actionOpt.type === "email" && (<>
                <input style={{...inputStyle,marginBottom:8}} placeholder="Email subject"
                  value={form.action_subject}
                  onChange={e => setForm(f => ({...f, action_subject: e.target.value}))}/>
                <input style={inputStyle} placeholder="Email body"
                  value={form.action_text}
                  onChange={e => setForm(f => ({...f, action_text: e.target.value}))}/>
              </>)}

              {actionOpt.type !== "playbook" && actionOpt.type !== "stage" && (
                <div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>
                  Use <code style={{background:"var(--bg4)",padding:"0 4px",borderRadius:3}}>&#123;account&#125;</code> <code style={{background:"var(--bg4)",padding:"0 4px",borderRadius:3}}>&#123;health&#125;</code> <code style={{background:"var(--bg4)",padding:"0 4px",borderRadius:3}}>&#123;nps&#125;</code> <code style={{background:"var(--bg4)",padding:"0 4px",borderRadius:3}}>&#123;tickets&#125;</code> as placeholders.
                </div>
              )}
            </div>

            <div style={{marginBottom:24}}>
              <label style={labelStyle}>Apply to</label>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {["all","account","segment"].map(s => (
                  <button key={s} onClick={() => setForm(f => ({...f, scope: s}))}
                    style={{padding:"6px 14px",borderRadius:"var(--r)",border:"1.5px solid",fontSize:12,fontWeight:500,
                      cursor:"pointer",fontFamily:"var(--font-display)",
                      borderColor: form.scope===s ? "var(--indigo)" : "var(--border)",
                      background:  form.scope===s ? "var(--indigo-dim)" : "var(--bg3)",
                      color:       form.scope===s ? "var(--indigo)" : "var(--text2)"}}>
                    {s === "all" ? "All accounts" : s === "account" ? "Specific account" : "Segment"}
                  </button>
                ))}
              </div>
              {form.scope === "account" && (
                <select style={inputStyle} value={form.scope_account_id}
                  onChange={e => {
                    const acc = accounts.find(a => a.id === e.target.value);
                    setForm(f => ({...f, scope_account_id: e.target.value, scope_account_name: acc?.name || ""}));
                  }}>
                  <option value="">— Select account —</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
              {form.scope === "segment" && (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <input style={inputStyle} placeholder="Plan (e.g. Enterprise) — leave blank for any"
                    value={form.scope_plan}
                    onChange={e => setForm(f => ({...f, scope_plan: e.target.value}))}/>
                  <select style={inputStyle} value={form.scope_stage}
                    onChange={e => setForm(f => ({...f, scope_stage: e.target.value}))}>
                    <option value="">Stage — any</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input style={inputStyle} type="number" min="0" placeholder="Min ARR in USD — leave blank for any"
                    value={form.scope_arr_min}
                    onChange={e => setForm(f => ({...f, scope_arr_min: e.target.value}))}/>
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={() => setShowForm(false)}
                style={{padding:"9px 18px",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                  background:"var(--bg3)",color:"var(--text2)",fontSize:13,fontWeight:500,
                  cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Cancel
              </button>
              <button onClick={saveRule}
                style={{padding:"9px 20px",background:"var(--indigo)",color:"white",border:"none",
                  borderRadius:"var(--r)",fontSize:13,fontWeight:600,cursor:"pointer",
                  fontFamily:"var(--font-display)",boxShadow:"0 2px 8px var(--indigo-glow)"}}>
                {editing ? "Save changes" : "Create rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Briefing Settings ────────────────────────────────────────────────────────
const DAYS_OF_WEEK = [{d:0,label:"Sun"},{d:1,label:"Mon"},{d:2,label:"Tue"},
  {d:3,label:"Wed"},{d:4,label:"Thu"},{d:5,label:"Fri"},{d:6,label:"Sat"}];

const HOURS = Array.from({length:13},(_,i)=>i+6).map(h=>({
  value:h, label:`${h<=12?h:h-12}:00 ${h<12?"AM":"PM"}`
}));

const TIMEZONES = [
  {value:"Asia/Dubai",    label:"Dubai (UTC+4)"},
  {value:"Asia/Riyadh",  label:"Riyadh (UTC+3)"},
  {value:"Africa/Cairo", label:"Cairo (UTC+2)"},
  {value:"Europe/London",label:"London (UTC+0/+1)"},
  {value:"UTC",          label:"UTC"},
];

const WebhookSettings = ({ call, toast }) => {
  const [token,        setToken]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied,       setCopied]       = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    call("GET", "/api/webhook/token")
      .then(d => setToken(d.token))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [call]);

  const webhookUrl = token ? `${apiBase}/webhook/${token}` : "";

  const copy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = async () => {
    if (!confirm("This will invalidate your current webhook URL. Any existing integrations using it will stop working. Continue?")) return;
    setRegenerating(true);
    try {
      const d = await call("POST", "/api/webhook/token/regenerate");
      setToken(d.token);
      toast("Webhook URL regenerated", "success");
    } catch { toast("Failed to regenerate", "error"); }
    finally { setRegenerating(false); }
  };

  const rowStyle = { background:"var(--bg2)", border:"1.5px solid var(--border)", borderRadius:"var(--r-lg)", padding:"16px 20px" };
  const monoStyle = { fontFamily:"var(--font-mono)", fontSize:12, color:"var(--text2)", wordBreak:"break-all", lineHeight:1.7 };

  const examplePayload = `POST ${webhookUrl || "<your-webhook-url>"}
Content-Type: application/json

// Recommended — send raw metrics, Pulse calculates the score
[
  {
    "account": "acme.com",          // domain, name, or CRM external ID
    "active_users": 45,             // users active in last 30 days
    "licensed_seats": 60,           // total purchased seats
    "dau": 12,                      // daily active users (avg)
    "mau": 45,                      // monthly active users
    "features_used_count": 8,       // distinct features used
    "total_features": 15            // total features in your product
  }
]

// Minimal — if you only have one metric, that's fine too
{ "account": "acme.com", "active_users": 45, "licensed_seats": 60 }

// Fallback — pre-calculated 0-100 score (less accurate)
{ "account": "acme.com", "product_usage": 78 }`;

  return (
    <div style={rowStyle}>
      <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Product Usage Webhook</div>
      <div style={{fontSize:12,color:"var(--text3)",marginBottom:16,lineHeight:1.7}}>
        Give this URL to your engineering team. They POST usage data to it and Pulse automatically updates health scores — no login required.
      </div>

      {loading ? (
        <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading…</div>
      ) : (
        <>
          <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{...monoStyle,flex:1}}>{webhookUrl}</div>
            <button onClick={copy}
              style={{flexShrink:0,background:copied?"var(--emerald-dim)":"var(--bg2)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r-sm)",padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",
                color:copied?"var(--emerald)":"var(--text2)",fontFamily:"var(--font-display)",whiteSpace:"nowrap"}}>
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>How to send data</div>
            <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px"}}>
              <pre style={{...monoStyle,margin:0,whiteSpace:"pre-wrap"}}>{examplePayload}</pre>
            </div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:8,lineHeight:1.7}}>
              <strong>account</strong> matches by domain, company name, or CRM external ID. Pulse calculates the usage score from your raw metrics using a weighted formula: seat adoption (40%), DAU/MAU ratio (40%), feature breadth (20%). The score drives the health score. Every call is stored in history so the CSM can see the trend over time.
            </div>
          </div>

          <button onClick={regenerate} disabled={regenerating}
            style={{background:"transparent",border:"none",padding:0,fontSize:12,color:"var(--text3)",
              cursor:"pointer",textDecoration:"underline",fontFamily:"var(--font-display)"}}>
            {regenerating ? "Regenerating…" : "Regenerate URL"}
          </button>
        </>
      )}
    </div>
  );
};

const ACTION_LABELS = {
  "ai.config_updated":    "AI config updated",
  "ai.config_removed":    "AI config removed",
  "ai.brief_generated":   "AI brief generated",
  "ai.chat":              "AI chat query",
  "email.connected":      "Email account connected",
  "email.disconnected":   "Email account disconnected",
  "email.set_primary":    "Email set as primary",
  "task.created":         "Task created",
  "task.updated":         "Task updated",
  "task.deleted":         "Task deleted",
  "briefing.config_saved":"Briefing config saved",
  "briefing.sent":        "Briefing sent",
};

const AuditLogSection = ({ call }) => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    call("GET", "/api/audit")
      .then(d => setEvents(d.events || []))
      .catch(() => setError("Could not load audit log"))
      .finally(() => setLoading(false));
  }, [call]);

  const rowStyle = { background:"var(--bg2)", border:"1.5px solid var(--border)", borderRadius:"var(--r-lg)", padding:16 };

  if (loading) return (
    <div style={rowStyle}>
      <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading…</div>
    </div>
  );

  if (error) return (
    <div style={rowStyle}>
      <div style={{fontSize:13,color:"var(--rose)"}}>{error}</div>
    </div>
  );

  return (
    <div style={rowStyle}>
      <div style={{fontSize:12,color:"var(--text3)",marginBottom:events.length?12:0,lineHeight:1.6}}>
        A tamper-proof record of security-relevant actions in your workspace. Last 200 events.
      </div>

      {events.length === 0 ? (
        <div style={{fontSize:13,color:"var(--text3)",fontStyle:"italic"}}>No events recorded yet.</div>
      ) : (
        <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r)",overflow:"hidden"}}>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 100px 140px",
            padding:"8px 14px",background:"var(--bg3)",borderBottom:"1px solid var(--border)",
            fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em"}}>
            <span>Action</span>
            <span>IP address</span>
            <span>Time</span>
          </div>
          <div style={{maxHeight:360,overflowY:"auto"}}>
            {events.map((e, i) => {
              const label = ACTION_LABELS[e.action] || e.action;
              const isDelete = e.action.includes("removed") || e.action.includes("deleted") || e.action.includes("disconnected");
              const isCreate = e.action.includes("connected") || e.action.includes("created") || e.action.includes("generated");
              const dotColor = isDelete ? "var(--rose)" : isCreate ? "var(--emerald)" : "var(--indigo)";
              return (
                <div key={e.id}
                  style={{display:"grid",gridTemplateColumns:"1fr 100px 140px",
                    padding:"10px 14px",borderBottom:i<events.length-1?"1px solid var(--border)":"none",
                    alignItems:"center",background:"var(--bg2)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:dotColor,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {label}
                    </span>
                    {e.resource_type && (
                      <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)",
                        background:"var(--bg4)",padding:"1px 6px",borderRadius:"var(--r-xs)",flexShrink:0}}>
                        {e.resource_type}
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
                    {e.ip_address || "—"}
                  </div>
                  <div style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
                    {new Date(e.created_at).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileSettings = ({ call, toast }) => {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    call("GET", "/api/csm-profile").then(setProfile).catch(()=>{});
  }, [call]);

  if (!profile) return <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading…</div>;

  const update = async patch => {
    const next = { ...profile, ...patch };
    setProfile(next);
    setSaving(true);
    try { await call("PATCH", "/api/csm-profile", patch); }
    catch { toast("Failed to save settings", "error"); }
    finally { setSaving(false); }
  };

  const updateWS = (key, value) => {
    const nextWS = { ...(profile.working_style || {}) };
    if (value === '') delete nextWS[key];
    else nextWS[key] = value;
    update({ working_style: nextWS });
  };

  return (
    <div>
      <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px",marginBottom:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Fld label="Career Stage">
            <Slct value={profile.career_stage} onChange={e=>update({career_stage:e.target.value})}>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </Slct>
          </Fld>
          <Fld label="Specialty">
            <Slct value={profile.specialty} onChange={e=>update({specialty:e.target.value})}>
              <option value="general_csm">General</option>
              <option value="technical_csm">Technical</option>
              <option value="enterprise_csm">Enterprise</option>
              <option value="growth_csm">Growth</option>
            </Slct>
          </Fld>
        </div>
      </div>
      <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Fld label="Communication">
            <Slct value={profile.working_style?.communication_preference || ""}
                  onChange={e=>updateWS('communication_preference', e.target.value)}>
              <option value="">—</option>
              <option value="async">Async-first</option>
              <option value="sync">Sync-first</option>
              <option value="mixed">Mixed</option>
            </Slct>
          </Fld>
          <Fld label="Meeting Length">
            <Slct value={profile.working_style?.meeting_length || ""}
                  onChange={e=>updateWS('meeting_length', e.target.value)}>
              <option value="">—</option>
              <option value="15min">15 min</option>
              <option value="30min">30 min</option>
              <option value="60min">60 min</option>
            </Slct>
          </Fld>
          <Fld label="Risk Tolerance">
            <Slct value={profile.working_style?.risk_tolerance || ""}
                  onChange={e=>updateWS('risk_tolerance', e.target.value)}>
              <option value="">—</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Slct>
          </Fld>
        </div>
      </div>
      {saving && <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",marginTop:12}}>Saving…</div>}
    </div>
  );
};

const BriefingSettings = ({ call, toast, hasGmail }) => {
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    call("GET", "/api/briefing/settings").then(setCfg).catch(()=>{});
  }, [call]);

  const update = async patch => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    setSaving(true);
    try { await call("PATCH", "/api/briefing/settings", patch); }
    catch { toast("Failed to save settings","error"); }
    finally { setSaving(false); }
  };

  const toggleDay = d => {
    const days = cfg.days.includes(d) ? cfg.days.filter(x=>x!==d) : [...cfg.days, d];
    update({ days });
  };

  if (!cfg) return <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading…</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,maxWidth:480}}>
      {/* Master toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>Daily Briefing</div>
          <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>Get a personalised summary of your portfolio every morning</div>
        </div>
        <button onClick={()=>update({enabled:!cfg.enabled})}
          style={{width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",
            background:cfg.enabled?"var(--indigo)":"var(--border2)",
            position:"relative",transition:"background .2s",flexShrink:0}}>
          <span style={{position:"absolute",top:3,left:cfg.enabled?22:3,width:18,height:18,
            borderRadius:"50%",background:"white",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
        </button>
      </div>

      {cfg.enabled && (<>
        {/* Days */}
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Workdays</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {DAYS_OF_WEEK.map(({d,label})=>{
              const on = cfg.days.includes(d);
              return (
                <button key={d} onClick={()=>toggleDay(d)}
                  style={{padding:"7px 14px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid",
                    borderColor:on?"var(--indigo)":"var(--border)",
                    background:on?"var(--indigo-dim)":"var(--bg3)",
                    color:on?"var(--indigo)":"var(--text2)",transition:"all .15s"}}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time + Timezone */}
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Delivery Time</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Fld label="Time">
              <Slct value={cfg.hour} onChange={e=>update({hour:parseInt(e.target.value)})}>
                {HOURS.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
              </Slct>
            </Fld>
            <Fld label="Timezone">
              <Slct value={cfg.timezone} onChange={e=>update({timezone:e.target.value})}>
                {TIMEZONES.map(tz=><option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </Slct>
            </Fld>
          </div>
        </div>

        {/* Email delivery */}
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"16px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13}}>Also send by email</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>
                {hasGmail ? "Deliver to your connected Gmail inbox" : "Connect Gmail in Integrations to enable"}
              </div>
            </div>
            <button onClick={()=>hasGmail&&update({email_enabled:!cfg.email_enabled})}
              style={{width:44,height:24,borderRadius:12,border:"none",
                cursor:hasGmail?"pointer":"not-allowed",
                background:cfg.email_enabled&&hasGmail?"var(--indigo)":"var(--border2)",
                position:"relative",transition:"background .2s",flexShrink:0,opacity:hasGmail?1:0.5}}>
              <span style={{position:"absolute",top:3,left:cfg.email_enabled&&hasGmail?22:3,width:18,height:18,
                borderRadius:"50%",background:"white",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
            </button>
          </div>
        </div>
      </>)}

      {saving && <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>Saving…</div>}
    </div>
  );
};

// ─── Briefing Page ────────────────────────────────────────────────────────────
const SIGNAL_LABELS = {
  renewal_critical:      "Renewal Critical",
  renewal_warning:       "Renewal Warning",
  churn_risk_critical:   "Churn Risk",
  health_critical:       "Health Critical",
  health_warning:        "Health Warning",
  no_contact_critical:   "No Contact",
  no_contact_warning:    "No Contact",
  low_nps:               "Low NPS",
  task_overdue:          "Task Overdue",
  task_due_today:        "Due Today",
  activity_logged:       "Activity",
  survey_positive:       "Survey Win",
  milestone_completed:   "Milestone",
  onboarding_phase_completed: "Onboarding",
};

const BriefingPage = ({ call, toast, onAccountClick, accounts = [], outreachPending = 0 }) => {
  const [items,        setItems]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [aiSummary,    setAiSummary]    = useState(null);
  const [aiSumLoading, setAiSumLoading] = useState(false);
  const [showDone,     setShowDone]     = useState(false);

  const loadAiSummary = useCallback(async (briefingItems) => {
    const actionable = briefingItems.filter(i => i.status==="pending" && i.category!=="win");
    if (!actionable.length) return;
    setAiSumLoading(true);
    try {
      const data = await call("POST", "/api/ai/briefing-summary", { items: briefingItems });
      if (data?.summary) setAiSummary(data.summary);
    } catch { }
    finally { setAiSumLoading(false); }
  }, [call]);

  const load = useCallback(() => {
    setLoading(true);
    call("GET", "/api/briefing/today")
      .then(data => {
        const it = Array.isArray(data) ? data : [];
        setItems(it); setLoading(false); loadAiSummary(it);
      })
      .catch(() => setLoading(false));
  }, [call, loadAiSummary]);

  useEffect(() => { load(); }, [load]);

  const updateItem = async (id, status, snoozeDays) => {
    setItems(p => p.map(i => i.id===id ? {...i, status} : i));
    try { await call("PATCH", `/api/briefing/items/${id}`, { status, snoozeDays }); }
    catch { toast("Failed to update item","error"); load(); }
  };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,flexDirection:"column",gap:14}}>
      <div style={{width:28,height:28,border:"3px solid var(--border2)",borderTopColor:"var(--indigo)",
        borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading your briefing…</div>
    </div>
  );

  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  const actionItems   = (items||[]).filter(i=>i.category==="action"&&i.status==="pending")
    .sort((a,b)=>b.currentScore-a.currentScore);
  const overdueItems  = (items||[]).filter(i=>i.category==="task"&&i.signalType==="task_overdue"&&i.status==="pending");
  const dueTodayItems = (items||[]).filter(i=>i.category==="task"&&i.signalType==="task_due_today"&&i.status==="pending");
  const wins          = (items||[]).filter(i=>i.category==="win");
  const doneItems     = (items||[]).filter(i=>i.status==="done");

  // Top 5 accounts — one signal per account
  const seenAccts = new Set();
  const topItems  = [];
  for (const item of actionItems) {
    if (topItems.length >= 5) break;
    if (!item.accountId || !seenAccts.has(item.accountId)) {
      if (item.accountId) seenAccts.add(item.accountId);
      topItems.push(item);
    }
  }

  const tasksDue = overdueItems.length + dueTodayItems.length;
  const allClear = topItems.length===0 && tasksDue===0;

  // Renewals this week from accounts prop
  const renewalsThisWeek = accounts.filter(a => {
    if (!a.renewalDate) return false;
    const d = Math.ceil((new Date(a.renewalDate)-now)/86400000);
    return d>=0 && d<=7;
  });
  const renewalArr = renewalsThisWeek.reduce((s,a)=>s+(a.arr||0),0);

  const urgColor = s => s>=12?"var(--rose)":s>=8?"var(--amber)":"var(--indigo)";

  // ── Sub-components ────────────────────────────────────────────────────────────
  const StatPill = ({value, label, color}) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",
      background:"var(--bg2)",border:"1.5px solid var(--border)",
      borderTop:`3px solid ${color}`,
      borderRadius:"var(--r-lg)",padding:"16px 20px",flex:1,
      boxShadow:"var(--shadow-sm)"}}>
      <div style={{fontFamily:"var(--font-mono)",fontWeight:800,fontSize:26,color,
        lineHeight:1,marginBottom:5,letterSpacing:"-.02em"}}>
        {value}
      </div>
      <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.3,fontWeight:500}}>{label}</div>
    </div>
  );

  const ActionCard = ({item}) => {
    const uc   = urgColor(item.currentScore);
    const acct = accounts.find(a=>a.id===item.accountId);
    const hw   = acct ? getHealthWarnings(acct) : [];
    return (
      <div onClick={()=>onAccountClick&&onAccountClick(item.accountId)}
        style={{background:"var(--bg2)",borderTop:`1.5px solid var(--border)`,
          borderRight:`1.5px solid var(--border)`,borderBottom:`1.5px solid var(--border)`,
          borderLeft:`3px solid ${uc}`,borderRadius:"var(--r)",padding:"14px 16px",marginBottom:6,
          cursor:"pointer",transition:"background .1s"}}
        onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
        onMouseLeave={e=>e.currentTarget.style.background="var(--bg2)"}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{item.accountName||"—"}</span>
              {item.carryDays>1&&(
                <span style={{fontSize:10,background:"var(--amber-dim)",color:"var(--amber)",
                  padding:"2px 7px",borderRadius:99,fontWeight:600}}>{item.carryDays}d open</span>
              )}
              {hw.map((w,i)=>(
                <span key={i} style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,
                  background:w.s===2?"var(--rose-dim)":"var(--amber-dim)",
                  color:w.s===2?"var(--rose)":"var(--amber)"}}>
                  {w.t}
                </span>
              ))}
            </div>
            <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.5}}>{item.signalDetail}</div>
              {item.suggestedAction&&(
                <div style={{fontSize:12,color:"var(--indigo)",fontWeight:600,marginTop:5,display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{flexShrink:0}}>→</span><span>{item.suggestedAction}</span>
                </div>
              )}
          </div>
          <div onClick={e=>e.stopPropagation()}>
            <ItemActions item={item} onUpdate={updateItem}/>
          </div>
        </div>
      </div>
    );
  };

  const TaskRow = ({item, isOverdue}) => (
    <div style={{background:"var(--bg2)",
      borderTop:`1.5px solid var(--border)`,borderRight:`1.5px solid var(--border)`,
      borderBottom:`1.5px solid var(--border)`,
      borderLeft:`3px solid ${isOverdue?"var(--rose)":"var(--indigo)"}`,
      borderRadius:"var(--r)",padding:"10px 14px",marginBottom:6,
      display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontSize:13,color:"var(--text2)"}}>{item.signalDetail}</span>
        {isOverdue&&(
          <span style={{fontSize:10,color:"var(--rose)",fontWeight:700,marginLeft:8,
            background:"var(--rose-dim)",padding:"2px 7px",borderRadius:99}}>OVERDUE</span>
        )}
      </div>
      <ItemActions item={item} onUpdate={updateItem}/>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{maxWidth:720,animation:"fadeUp .2s ease"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:28,letterSpacing:"-.04em",marginBottom:5,color:"var(--text)"}}>{greeting}</h1>
          <div style={{fontSize:13,color:"var(--text3)",fontWeight:500}}>{dateStr}</div>
        </div>
        <button onClick={load} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
          borderRadius:"var(--r)",padding:"8px 16px",fontSize:12,fontWeight:600,
          color:"var(--text2)",cursor:"pointer",marginTop:4}}>
          Refresh
        </button>
      </div>

      {/* Stat row */}
      {(()=>{
        const escalatedAccts = accounts.filter(a=>a.escalationStatus==="open");
        return (
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:28}}>
            <StatPill value={topItems.length}          label="need attention"     color={topItems.length>0?"var(--rose)":"var(--emerald)"}/>
            <StatPill value={outreachPending}           label="outreach drafts"   color={outreachPending>0?"var(--amber)":"var(--text3)"}/>
            <StatPill value={tasksDue}                  label="tasks due"         color={tasksDue>0?"var(--amber)":"var(--text3)"}/>
            <StatPill value={renewalsThisWeek.length}   label="renewing this week" color={renewalsThisWeek.length>0?"var(--indigo)":"var(--text3)"}/>
            <StatPill value={escalatedAccts.length}     label="escalations open"  color={escalatedAccts.length>0?"var(--rose)":"var(--text3)"}/>
          </div>
        );
      })()}

      {/* Escalated accounts banner */}
      {(()=>{
        const escalatedAccts = accounts.filter(a=>a.escalationStatus==="open");
        if (!escalatedAccts.length) return null;
        return (
          <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.3)",
            borderRadius:"var(--r-lg)",padding:"14px 18px",marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
              <Ic n="escalate" size={14} color="var(--rose)"/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--rose)",textTransform:"uppercase",letterSpacing:".06em"}}>
                Active Escalations ({escalatedAccts.length})
              </span>
            </div>
            {escalatedAccts.map(a=>(
              <div key={a.id} onClick={()=>onAccountClick&&onAccountClick(a.id)}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"8px 0",borderTop:"1px solid rgba(225,29,72,.15)",cursor:"pointer"}}>
                <div>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{a.name}</span>
                  {a.escalationReason&&(
                    <span style={{fontSize:12,color:"var(--text3)",marginLeft:8}}>{a.escalationReason}</span>
                  )}
                </div>
                {a.escalationSince&&(
                  <span style={{fontSize:11,color:"var(--rose)",fontFamily:"var(--font-mono)"}}>since {a.escalationSince}</span>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* AI Summary */}
      {(aiSummary||aiSumLoading)&&(
        <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.2)",
          borderRadius:"var(--r-lg)",padding:"16px 20px",marginBottom:24,display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{width:28,height:28,borderRadius:"var(--r-sm)",background:"var(--indigo)",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            <span style={{fontSize:14,color:"white"}}>✦</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--indigo)",textTransform:"uppercase",
              letterSpacing:".07em",marginBottom:4}}>AI Summary</div>
            {aiSumLoading
              ? <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Analysing your portfolio…</div>
              : <div style={{fontSize:13,color:"var(--text)",lineHeight:1.7}}>{aiSummary}</div>
            }
          </div>
        </div>
      )}

      {/* All-clear — not a dead end, shows what's coming */}
      {allClear&&(
        <div style={{background:"rgba(5,150,105,.06)",border:"1.5px solid rgba(5,150,105,.2)",
          borderRadius:"var(--r-lg)",padding:"18px 22px",marginBottom:24,
          display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(5,150,105,.15)",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ic n="check" size={16} color="var(--emerald)"/>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,color:"var(--emerald)",marginBottom:2}}>
              Portfolio is healthy
            </div>
            <div style={{fontSize:13,color:"var(--text2)"}}>
              No urgent signals today.{renewalsThisWeek.length>0
                ? ` ${renewalsThisWeek.length} renewal${renewalsThisWeek.length>1?"s":""} coming up this week.`
                : outreachPending>0 ? ` ${outreachPending} outreach draft${outreachPending>1?"s":""} waiting for review.`
                : " Check wins below."}
            </div>
          </div>
        </div>
      )}

      {/* Today's Focus */}
      {topItems.length>0&&(
        <Section title={`Today's focus · ${topItems.length} account${topItems.length>1?"s need":"needs"} attention`}>
          {topItems.map(i=><ActionCard key={i.id} item={i}/>)}
        </Section>
      )}

      {/* Tasks */}
      {tasksDue>0&&(
        <Section title={`Tasks · ${tasksDue} due`}>
          {overdueItems.map(i=><TaskRow key={i.id} item={i} isOverdue={true}/>)}
          {dueTodayItems.map(i=><TaskRow key={i.id} item={i} isOverdue={false}/>)}
        </Section>
      )}

      {/* Wins */}
      {wins.length>0&&(
        <Section title={`Wins · ${wins.length}`}>
          {wins.map(i=>(
            <div key={i.id} style={{display:"flex",alignItems:"center",gap:10,
              padding:"9px 14px",borderRadius:"var(--r)",marginBottom:4,
              background:"rgba(5,150,105,.05)",border:"1.5px solid rgba(5,150,105,.12)"}}>
              <Ic n="check" size={13} color="var(--emerald)"/>
              <span style={{fontSize:13,color:"var(--text2)"}}>{i.signalDetail}</span>
            </div>
          ))}
        </Section>
      )}

      {/* This week */}
      {(renewalsThisWeek.length>0||outreachPending>0)&&(
        <Section title="This week">
          {renewalsThisWeek.length>0&&(
            <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
              borderRadius:"var(--r)",padding:"12px 16px",marginBottom:6,
              display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>
                  {renewalsThisWeek.length} renewal{renewalsThisWeek.length>1?"s":""} due in the next 7 days
                </div>
                <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.4}}>
                  {renewalsThisWeek.map(a=>a.name).join(" · ")}
                </div>
              </div>
              {renewalArr>0&&(
                <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:15,
                  color:"var(--indigo)",flexShrink:0}}>
                  {fmtMoney(renewalArr)}
                </div>
              )}
            </div>
          )}
          {outreachPending>0&&(
            <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
              borderRadius:"var(--r)",padding:"12px 16px",marginBottom:6,
              display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div style={{fontSize:13,color:"var(--text2)"}}>
                <span style={{fontWeight:600,color:"var(--text)"}}>{outreachPending} outreach draft{outreachPending>1?"s":""}</span> waiting for your review in Outreach Queue
              </div>
              <Ic n="email" size={14} color="var(--text3)"/>
            </div>
          )}
        </Section>
      )}

      {/* Completed — collapsed by default */}
      {doneItems.length>0&&(
        <div style={{marginBottom:24}}>
          <button onClick={()=>setShowDone(v=>!v)}
            style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",
              color:"var(--text3)",background:"none",border:"none",cursor:"pointer",padding:"0 0 8px",
              borderBottom:"1.5px solid var(--border)",width:"100%",textAlign:"left",
              display:"flex",justifyContent:"space-between",alignItems:"center",
              marginBottom:showDone?12:0}}>
            <span>Completed today · {doneItems.length}</span>
            <Ic n={showDone?"chevron_up":"chevron_down"} size={13} color="var(--text3)"/>
          </button>
          {showDone&&doneItems.map(i=>(
            <div key={i.id} style={{display:"flex",alignItems:"center",gap:8,
              fontSize:13,color:"var(--text3)",padding:"6px 0",textDecoration:"line-through",
              borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:10,fontFamily:"var(--font-mono)",background:"var(--bg3)",
                padding:"1px 6px",borderRadius:4,textDecoration:"none",color:"var(--text3)",flexShrink:0}}>
                {SIGNAL_LABELS[i.signalType]||i.signalType}
              </span>
              {i.signalDetail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Section = ({title, children}) => (
  <div style={{marginBottom:24}}>
    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".09em",
      color:"var(--text3)",borderBottom:"1.5px solid var(--border)",paddingBottom:8,marginBottom:12}}>
      {title}
    </div>
    {children}
  </div>
);

const ItemActions = ({item, onUpdate}) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center",position:"relative"}}>
      <button onClick={()=>onUpdate(item.id,"done")}
        style={{background:"var(--emerald-dim)",border:"none",color:"var(--emerald)",
          cursor:"pointer",padding:"5px 10px",borderRadius:"var(--r-sm)",fontSize:11,fontWeight:600}}>
        Done
      </button>
      <button onClick={()=>setOpen(p=>!p)}
        style={{background:"var(--bg3)",border:"none",color:"var(--text2)",
          cursor:"pointer",padding:"5px 10px",borderRadius:"var(--r-sm)",fontSize:11,fontWeight:600}}>
        ···
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"var(--bg2)",
          border:"1.5px solid var(--border)",borderRadius:"var(--r)",boxShadow:"var(--shadow)",
          zIndex:50,minWidth:140}}>
          {[{label:"Snooze 3 days",days:3},{label:"Snooze 7 days",days:7}].map(({label,days})=>(
            <button key={days} onClick={()=>{onUpdate(item.id,"snoozed",days);setOpen(false);}}
              style={{display:"block",width:"100%",background:"none",border:"none",
                padding:"9px 14px",fontSize:12,color:"var(--text2)",cursor:"pointer",textAlign:"left",
                fontFamily:"var(--font-display)"}}>
              {label}
            </button>
          ))}
          <button onClick={()=>{onUpdate(item.id,"dismissed");setOpen(false);}}
            style={{display:"block",width:"100%",background:"none",border:"none",
              padding:"9px 14px",fontSize:12,color:"var(--rose)",cursor:"pointer",textAlign:"left",
              fontFamily:"var(--font-display)"}}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

// ─── My Performance ──────────────────────────────────────────────────────────
const MyPerformancePage = ({ accounts, call }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [churnEvents, setChurnEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      call ? call("GET", "/api/performance").catch(() => null) : Promise.resolve(null),
      call ? call("GET", "/api/accounts/churn").catch(() => ({ events:[] })) : Promise.resolve({ events:[] }),
    ]).then(([perf, churn]) => {
      setData(perf);
      setChurnEvents(churn?.events || []);
      setLoading(false);
    });
  }, [call]);

  const active = (accounts || []).filter(a => !a.archived);

  // Compute local portfolio stats as fallback
  const scores    = active.filter(a => a.healthScore != null).map(a => a.healthScore);
  const avgHealth = scores.length ? Math.round(scores.reduce((s,v)=>s+v,0)/scores.length) : null;
  const atRisk    = active.filter(a => a.stage==="At Risk"||a.stage==="Needs Attention").length;
  const escalated = active.filter(a => a.escalationStatus==="open").length;
  const expansion = active.filter(a => a.expansionPotential).length;
  const totalARR  = active.reduce((s,a)=>s+(a.arr||0),0);

  const perf   = data;
  const week   = perf?.week   || {};
  const month  = perf?.month  || {};
  const portf  = perf?.portfolio || {};

  const StatBox = ({ value, label, sub, color="var(--text)" }) => (
    <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
      borderTop:`3px solid ${color}`,borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
      <div style={{fontFamily:"var(--font-mono)",fontWeight:800,fontSize:28,color,lineHeight:1,marginBottom:5,letterSpacing:"-.02em"}}>
        {value ?? "—"}
      </div>
      <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:"var(--text3)"}}>{sub}</div>}
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",
      letterSpacing:".08em",paddingTop:8,paddingBottom:2}}>{title}</div>
  );

  return (
    <div style={{maxWidth:860,animation:"fadeUp .2s ease"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontWeight:800,fontSize:22,letterSpacing:"-.02em",marginBottom:4}}>My Performance</h2>
        <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
          {loading ? "Loading…" : `Week of ${week.start || "—"} · ${month.start ? `Month from ${month.start}` : ""}`}
        </div>
      </div>

      {/* This week */}
      <SectionHeader title="This week"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24,marginTop:10}}>
        <StatBox value={week.activitiesTotal}
          label="Activities logged"
          sub={Object.entries(week.activitiesByType||{}).map(([t,n])=>`${n} ${t}`).join(" · ")||"No activity yet"}
          color={week.activitiesTotal>0?"var(--indigo)":"var(--text3)"}/>
        <StatBox value={week.surveysSent}
          label="Surveys sent"
          color={week.surveysSent>0?"var(--violet)":"var(--text3)"}/>
        <StatBox value={week.outreachSent}
          label="Outreach sent"
          sub={week.outreachPending>0?`${week.outreachPending} drafts pending`:""}
          color={week.outreachSent>0?"var(--indigo)":"var(--text3)"}/>
        <StatBox value={week.outreachPending}
          label="Drafts pending"
          sub="Need your review"
          color={week.outreachPending>0?"var(--amber)":"var(--text3)"}/>
      </div>

      {/* This month */}
      <SectionHeader title="This month"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24,marginTop:10}}>
        <StatBox value={month.activitiesTotal}
          label="Activities total"
          sub={Object.entries(month.activitiesByType||{}).slice(0,3).map(([t,n])=>`${n} ${t}`).join(" · ")||""}
          color="var(--text)"/>
        <StatBox value={portf.total ?? active.length}
          label="Accounts managed"
          sub={`${fmtMoney(portf.totalARR ?? totalARR)} total ARR`}
          color="var(--text)"/>
        <StatBox value={portf.avgHealth ?? avgHealth}
          label="Avg portfolio health"
          sub="/100"
          color={hColor((portf.avgHealth??avgHealth)??50)}/>
        <StatBox value={portf.atRisk ?? atRisk}
          label="At risk / needs attention"
          color={(portf.atRisk??atRisk)>0?"var(--rose)":"var(--emerald)"}/>
      </div>

      {/* Portfolio health */}
      <SectionHeader title="Portfolio snapshot"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28,marginTop:10}}>
        <StatBox value={portf.escalated ?? escalated}
          label="Active escalations"
          sub="Accounts flagged as escalated"
          color={(portf.escalated??escalated)>0?"var(--rose)":"var(--text3)"}/>
        <StatBox value={portf.expansion ?? expansion}
          label="Expansion opportunities"
          sub="Flagged for upsell"
          color={(portf.expansion??expansion)>0?"var(--emerald)":"var(--text3)"}/>
        <StatBox value={active.filter(a=>renewalRisk(a).label==="Critical"||renewalRisk(a).label==="At Risk").length}
          label="Renewal risks"
          sub="Critical or at risk"
          color="var(--amber)"/>
      </div>

      {/* Churn log */}
      <SectionHeader title="Churn log"/>
      <div style={{marginTop:10}}>
        {churnEvents.length===0?(
          <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
            padding:"24px 20px",textAlign:"center",color:"var(--text3)",fontSize:13}}>
            No churned accounts logged yet.
          </div>
        ):(
          <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",gap:0,
              background:"var(--bg3)",padding:"8px 16px",
              fontSize:10,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>
              <span>Account</span><span>ARR</span><span>Date</span><span>Reason</span>
            </div>
            {churnEvents.map((ev,i)=>(
              <div key={ev.id||i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 2fr",gap:0,
                padding:"12px 16px",borderTop:"1px solid var(--border)",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{ev.account_name}</span>
                <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--rose)"}}>{fmtMoney(ev.arr||0)}</span>
                <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{(ev.churned_at||"").slice(0,10)}</span>
                <span style={{fontSize:12,color:"var(--text2)"}}>{ev.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CoverageHealthCard = ({ accounts }) => {
  const active = accounts.filter(a=>!a.archived);
  if (!active.length) return null;
  const coveragePct = Math.round(active.filter(a=>ago(a.lastContact)<=14).length/active.length*100);
  const playbookPct = Math.round(active.filter(a=>a.activePlaybookId).length/active.length*100);
  const healthPct   = Math.round(active.filter(a=>a.healthScore>=55).length/active.length*100);
  const metrics = [
    {label:"Active contact coverage", pct:coveragePct, sub:"accounts contacted ≤14 days",
      color:coveragePct>=80?"var(--emerald)":coveragePct>=60?"var(--amber)":"var(--rose)"},
    {label:"Playbook adoption",        pct:playbookPct, sub:"accounts with active playbook",
      color:playbookPct>=60?"var(--emerald)":playbookPct>=40?"var(--amber)":"var(--rose)"},
    {label:"Health above threshold",   pct:healthPct,   sub:"accounts with health ≥55",
      color:"var(--indigo)"},
  ];
  return (
    <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
      padding:"20px 24px",marginBottom:24,boxShadow:"var(--shadow-sm)"}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Coverage Health</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {metrics.map(m=>(
          <div key={m.label}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:"var(--text2)",fontWeight:500}}>{m.label}</span>
              <span style={{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:700,color:m.color}}>{m.pct}%</span>
            </div>
            <div style={{height:7,borderRadius:99,background:"var(--bg4)"}}>
              <div style={{height:"100%",width:`${m.pct}%`,borderRadius:99,background:m.color,transition:"width .6s ease"}}/>
            </div>
            <div style={{fontSize:10,color:"var(--text3)",marginTop:4}}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Manager Overview ─────────────────────────────────────────────────────────
const ManagerOverviewPage = ({ accounts, onAccountClick }) => {
  const [showAllAttention, setShowAllAttention] = useState(false);
  const active = accounts.filter(a => !a.archived);

  const today = new Date();

  // Escalated accounts — manual crisis flags
  const escalated = active.filter(a=>a.escalationStatus==="open");

  // Urgency score: combined health risk + time pressure
  const urgencyScore = a => {
    const rd = a.renewalDate ? Math.ceil((new Date(a.renewalDate)-today)/86400000) : 999;
    const timePressure = rd<=30?40:rd<=60?20:rd<=90?10:0;
    return (100-a.healthScore) + timePressure + (ago(a.lastContact)>21?15:0);
  };
  const attention = [...active]
    .filter(a=>a.healthScore<65||ago(a.lastContact)>21)
    .sort((a,b)=>urgencyScore(b)-urgencyScore(a));
  const attentionVisible = showAllAttention ? attention : attention.slice(0,8);


  return (
    <div style={{maxWidth:900,animation:"fadeUp .2s ease"}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Need Attention</h1>
        <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
          {active.length} accounts · as of today
        </div>
      </div>

      {/* Escalated accounts — manual crisis flags, shown first */}
      {escalated.length>0&&(
        <div style={{background:"var(--bg2)",border:"1.5px solid rgba(225,29,72,0.3)",borderRadius:"var(--r-lg)",
          padding:"20px 24px",marginBottom:24,boxShadow:"var(--shadow-sm)"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
            <Ic n="escalate" size={14} color="var(--rose)"/>
            <span style={{fontSize:14,fontWeight:700,color:"var(--rose)"}}>Escalated ({escalated.length})</span>
          </div>
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>
            Accounts you've manually flagged as active escalations
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {escalated.map(a=>(
              <div key={a.id} onClick={()=>onAccountClick(a)}
                style={{display:"flex",alignItems:"center",gap:14,
                  background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 16px",
                  cursor:"pointer",border:"1.5px solid transparent",transition:"border-color .12s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--rose)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                <Avatar name={a.name} size={32}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.name}</div>
                  {a.escalationReason&&(
                    <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.4,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.escalationReason}</div>
                  )}
                </div>
                {a.escalationSince&&(
                  <span style={{fontSize:11,color:"var(--rose)",fontFamily:"var(--font-mono)",flexShrink:0}}>since {a.escalationSince}</span>
                )}
                <span style={{color:"var(--text3)",fontSize:16,flexShrink:0}}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts needing attention */}
      {attention.length>0&&(
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
          padding:"20px 24px",boxShadow:"var(--shadow-sm)"}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Needs Attention</div>
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:16}}>
            Sorted by urgency — health risk combined with renewal timeline and contact recency
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {attentionVisible.map(a=>{
              const sc  = STAGE_CFG[a.stage]||STAGE_CFG["Stable"];
              const rd  = a.renewalDate ? Math.ceil((new Date(a.renewalDate)-today)/86400000) : null;
              const hw  = getHealthWarnings(a);
              return (
                <div key={a.id} onClick={()=>onAccountClick(a)}
                  style={{display:"flex",alignItems:"center",gap:14,
                    background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 16px",
                    cursor:"pointer",border:"1.5px solid transparent",transition:"border-color .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="var(--indigo)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                  <Avatar name={a.name} size={32}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{a.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                      <Badge label={a.stage} color={sc.color} bg={sc.bg} small/>
                      {hw.map((w,i)=>(
                        <span key={i} style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,
                          background:w.s===2?"var(--rose-dim)":"var(--amber-dim)",
                          color:w.s===2?"var(--rose)":"var(--amber)"}}>
                          {w.t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:20,alignItems:"center",flexShrink:0}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14,
                        color:hColor(a.healthScore)}}>{a.healthScore}</div>
                      <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginTop:1}}>Health</div>
                    </div>
                    {rd!==null&&(
                      <div style={{textAlign:"center"}}>
                        <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14,
                          color:rd<=30?"var(--rose)":rd<=60?"var(--amber)":"var(--text2)"}}>
                          {rd<0?`${Math.abs(rd)}d OD`:rd+"d"}
                        </div>
                        <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginTop:1}}>Renewal</div>
                      </div>
                    )}
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14,
                        color:fmtMoney(a.arr)==="$0"?"var(--text3)":"var(--text2)"}}>{fmtMoney(a.arr)}</div>
                      <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",marginTop:1}}>ARR</div>
                    </div>
                  </div>
                  <span style={{color:"var(--text3)",fontSize:16,flexShrink:0}}>→</span>
                </div>
              );
            })}
          </div>
          {attention.length>8&&(
            <button onClick={()=>setShowAllAttention(v=>!v)}
              style={{marginTop:12,width:"100%",padding:"8px 0",background:"none",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",fontSize:12,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>
              {showAllAttention?`Show less ↑`:`Show all ${attention.length} accounts ↓`}
            </button>
          )}
        </div>
      )}

      {active.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)",fontSize:13}}>
          No accounts yet. Add accounts to see portfolio metrics.
        </div>
      )}
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught:", error, info?.componentStack);
  }
  reset = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{padding:"40px 24px",maxWidth:520,margin:"0 auto"}}>
        <div style={{fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:8}}>Something went wrong</div>
        <div style={{fontSize:13,color:"var(--text3)",lineHeight:1.6,marginBottom:16}}>
          The app hit an unexpected error. Your data is safe.
        </div>
        <div style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--text3)",background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"12px 14px",marginBottom:16,wordBreak:"break-word"}}>
          {String(this.state.error?.message || this.state.error)}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={this.reset} style={{fontSize:13,fontWeight:600,padding:"8px 16px",background:"var(--indigo)",color:"#fff",border:"none",borderRadius:"var(--r-lg)",cursor:"pointer"}}>Try again</button>
          <button onClick={()=>window.location.reload()} style={{fontSize:13,fontWeight:600,padding:"8px 16px",background:"var(--bg2)",color:"var(--text)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",cursor:"pointer"}}>Reload page</button>
        </div>
      </div>
    );
  }
}

export default function App() {
  const [session,      setSession]      = useState(loadSession);
  const [accounts,     setAccounts]     = useState([]);
  const [apiReady,     setApiReady]     = useState(false);
  const [migrating,    setMigrating]    = useState(false);
  const [migrateDone,  setMigrateDone]  = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [showBulk,     setShowBulk]     = useState(false);
  const [view,         setView]         = useState("briefing");
  const [detailTab,    setDetailTab]    = useState("activity");
  const [closeoutMeeting, setCloseoutMeeting] = useState(null);
  const [filter,       setFilter]       = useState("All");
  const [planFilter,   setPlanFilter]   = useState("All");
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("churnRisk");
  const [toasts,       setToasts]       = useState([]);
  const [manualTasks,  setManualTasks]  = useState([]);

  // ── API call helper with auto token refresh ───────────────────────────────────
  const call = useCallback(async (method, path, body) => {
    let s = session;
    // Proactively refresh if the token expires within the next 60 seconds
    if (s?.expiresAt && s?.refreshToken && s.expiresAt * 1000 - Date.now() < 60_000) {
      try {
        const refreshed = await api("POST", "/auth/refresh", { refreshToken: s.refreshToken });
        s = { ...s, ...refreshed };
        saveSession(s); setSession(s);
      } catch {
        clearSession(); setSession(null);
        throw new Error("Session expired — please log in again");
      }
    }
    try {
      return await api(method, path, body, s?.token);
    } catch (err) {
      // On 401, try a single refresh and retry — catches tokens that expired mid-session
      if (err.status === 401 && s?.refreshToken) {
        try {
          const refreshed = await api("POST", "/auth/refresh", { refreshToken: s.refreshToken });
          const ns = { ...s, ...refreshed };
          saveSession(ns); setSession(ns);
          return await api(method, path, body, ns.token);
        } catch {
          clearSession(); setSession(null);
          throw new Error("Session expired — please log in again");
        }
      }
      throw err;
    }
  }, [session]);

  const uploadDoc = useCallback(async (path, formData) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}) },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      const e = new Error(err.error || "Upload error"); e.status = res.status; throw e;
    }
    return res.json();
  }, [session]);

  // ── Load accounts on mount / session change ──────────────────────────────────
  useEffect(() => {
    if (!API_URL) {
      // No backend — use localStorage
      setAccounts(load());
      setApiReady(true);
      return;
    }
    if (!session?.token) return;

    call("GET", "/api/accounts")
      .then(data => {
        if (data?.accounts) {
          setAccounts(data.accounts);
          // Mirror to localStorage as offline cache
          save(data.accounts);
        }
        setApiReady(true);
      })
      .catch(() => {
        // Backend unreachable — fall back to localStorage cache
        setAccounts(load());
        setApiReady(true);
      });
  }, [session, call]);

  // ── Persist to localStorage whenever accounts change (offline cache) ─────────
  useEffect(() => { if (apiReady) save(accounts); }, [accounts, apiReady]);

  // ── Load tasks from API ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!API_URL || !session?.token) return;
    call("GET", "/api/tasks").then(data => {
      if (Array.isArray(data)) setManualTasks(data.map(t => shapeTask(t, accounts)));
    }).catch(() => {});
  }, [session, call]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reusable refetchers so edits + navigation reflect server truth ────────────
  const loadAccounts = useCallback(async () => {
    if (!API_URL || !session?.token) return;
    try {
      const data = await call("GET", "/api/accounts");
      if (data?.accounts) {
        setAccounts(data.accounts);
        save(data.accounts);
        setSelected(prev => prev ? (data.accounts.find(a => a.id === prev.id) || prev) : prev);
      }
    } catch {}
  }, [call, session]);

  const loadTasks = useCallback(async () => {
    if (!API_URL || !session?.token) return;
    try {
      const data = await call("GET", "/api/tasks");
      if (Array.isArray(data)) setManualTasks(data.map(t => shapeTask(t, accounts)));
    } catch {}
  }, [call, session, accounts]);

  // Silently refresh central data on tab change (skip first mount — the login-load
  // effects already cover it).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    loadAccounts();
    loadTasks();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = e => { if (e.key==="Escape"&&selected&&!showAdd&&!showBulk&&!closeoutMeeting) setSelected(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, showAdd, showBulk, closeoutMeeting]);

  const addManualTask = async task => {
    if (!API_URL) { setManualTasks(p=>[...p,task]); return; }
    try {
      const created = await call("POST", "/api/tasks", {
        title: task.title, description: task.description,
        priority: task.priority, dueDate: task.dueDate, accountId: task.accountId,
      });
      setManualTasks(p=>[...p, shapeTask(created, accounts)]);
    } catch { toast("Failed to save task","error"); }
  };

  const toggleManualTask = async id => {
    const task = manualTasks.find(t=>t.id===id);
    if (!task) return;
    setManualTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t)); // optimistic
    if (API_URL) {
      try { await call("PATCH", `/api/tasks/${id}`, { done: !task.done }); }
      catch { setManualTasks(p=>p.map(t=>t.id===id?{...t,done:task.done}:t)); } // revert
    }
  };

  const deleteManualTask = async id => {
    setManualTasks(p=>p.filter(t=>t.id!==id)); // optimistic
    if (API_URL) {
      try { await call("DELETE", `/api/tasks/${id}`); }
      catch { toast("Failed to delete task","error"); }
    }
  };

  const toast = useCallback((message, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 2800);
  }, []);

  // ── CRUD — optimistic UI + backend sync ──────────────────────────────────────
  const update = useCallback(async (id, patch) => {
    // Optimistic update — UI responds instantly
    setAccounts(p=>p.map(a=>a.id===id?{...a,...patch}:a));
    setSelected(p=>p?.id===id?{...p,...patch}:p);
    // Sync to backend if available
    if (API_URL && session?.token) {
      try { await call("PATCH", `/api/accounts/${id}`, patch); await loadAccounts(); }
      catch { toast("Sync failed — changes saved locally","info"); }
    }
  }, [call, session, toast, loadAccounts]);

  const del = useCallback(async id => {
    setAccounts(p=>p.filter(a=>a.id!==id));
    setSelected(null);
    if (API_URL && session?.token) {
      try { await call("DELETE", `/api/accounts/${id}`); }
      catch { toast("Sync failed — deletion saved locally","info"); }
    }
  }, [call, session, toast]);

  const add = useCallback(async account => {
    if (API_URL && session?.token) {
      try {
        const data = await call("POST", "/api/accounts", account);
        // Use the server-assigned UUID as the account ID
        const saved = { ...account, id: data?.account?.id || account.id };
        setAccounts(p=>[saved,...p]);
        toast("Account added","success");
        return;
      } catch {
        toast("Sync failed — account saved locally","info");
      }
    }
    // localStorage fallback
    setAccounts(p=>[account,...p]);
    toast("Account added","success");
  }, [call, session, toast]);

  const bulkImport = useCallback(async newAccounts => {
    if (API_URL && session?.token) {
      try {
        await call("POST", "/api/accounts/bulk", { accounts: newAccounts });
        // Reload fresh from backend to get server IDs
        const data = await call("GET", "/api/accounts");
        if (data?.accounts) setAccounts(data.accounts);
        toast(`${newAccounts.length} account${newAccounts.length!==1?"s":""} imported`, "success");
        return;
      } catch {
        toast("Sync failed — accounts saved locally","info");
      }
    }
    setAccounts(p=>[...p,...newAccounts]);
    toast(`${newAccounts.length} account${newAccounts.length!==1?"s":""} imported`, "success");
  }, [call, session, toast]);

  // ── Load demo/seed data into the database ─────────────────────────────────
  const loadDemoData = useCallback(async () => {
    const demoAccounts = SEED.map(a => ({
      name:         a.name,
      industry:     a.industry,
      plan:         a.plan,
      arr:          a.arr,
      renewalDate:  a.renewalDate,
      nps:          a.nps,
      ces:          a.ces,
      productUsage: a.productUsage,
      openTickets:  a.openTickets,
      lastContact:  a.lastContact,
      nextAction:   a.nextAction || "",
      notes:        a.notes || "",
      source:       "manual",
    }));

    if (API_URL && session?.token) {
      try {
        await call("POST", "/api/accounts/bulk", { accounts: demoAccounts });
        const data = await call("GET", "/api/accounts");
        if (data?.accounts) setAccounts(data.accounts);
        toast(`${demoAccounts.length} demo accounts loaded`, "success");
        return;
      } catch {
        toast("Could not reach backend — loading locally","info");
      }
    }
    setAccounts(SEED);
    toast(`${demoAccounts.length} demo accounts loaded`, "success");
  }, [call, session, toast]);
  const migrateLocalData = useCallback(async () => {
    setMigrating(true);
    try {
      const raw = localStorage.getItem("pulse_v4");
      if (!raw) { toast("No local data found","info"); setMigrating(false); return; }

      const localAccounts = JSON.parse(raw);
      if (!Array.isArray(localAccounts) || localAccounts.length === 0) {
        toast("No accounts found in local data","info");
        setMigrating(false);
        return;
      }

      // Strip frontend-only fields and reshape for the API
      const cleaned = localAccounts.map(a => ({
        name:          a.name,
        industry:      a.industry || "",
        plan:          a.plan || "Starter",
        arr:           a.arr || 0,
        renewalDate:   a.renewalDate || null,
        nps:           a.nps || 50,
        ces:           a.ces || 3.5,
        productUsage:  a.productUsage || 60,
        openTickets:   a.openTickets || 0,
        lastContact:   a.lastContact || null,
        nextAction:    a.nextAction || "",
        notes:         a.notes || "",
        prepNotes:     a.prepNotes || "",
        source:        "manual",
      }));

      await call("POST", "/api/accounts/bulk", { accounts: cleaned });

      // Reload from backend
      const data = await call("GET", "/api/accounts");
      if (data?.accounts) setAccounts(data.accounts);

      // Clear old localStorage data so banner doesn't reappear
      localStorage.removeItem("pulse_v4");
      setMigrateDone(true);
      toast(`${cleaned.length} account${cleaned.length!==1?"s":""} migrated to your database`, "success");
    } catch (err) {
      toast("Migration failed — please try again","error");
      console.error("Migration error:", err);
    } finally {
      setMigrating(false);
    }
  }, [call, toast]);

  const active = accounts.filter(a=>!a.archived);

  // Counts for filter pills
  const stageCounts = Object.fromEntries(["All","Healthy","Stable","Needs Attention","At Risk"].map(s=>[s,s==="All"?active.length:active.filter(a=>a.stage===s).length]));
  const planCounts  = Object.fromEntries(["All","Starter","Growth","Enterprise"].map(p=>[p,p==="All"?active.length:active.filter(a=>a.plan===p).length]));

  // Badge counts
  const playbookAlerts  = active.filter(a=>getTriggeredPlaybooks(a).length>0&&!a.activePlaybookId).length;
  const allAutoTasks    = generateAutoTasks(active);
  const taskAlerts      = [...allAutoTasks,...manualTasks].filter(t=>!t.done&&t.dueDate<=todayStr()).length;
  const briefingAlerts  = 0; // populated after BriefingPage loads its own data
  const [outreachPending, setOutreachPending] = useState(0);
  useEffect(()=>{
    if (!session?.token || !API_URL) return;
    call("GET","/api/outreach?status=pending&limit=50")
      .then(d=>setOutreachPending(d?.items?.length ?? 0))
      .catch(()=>{});
  },[session, call]);

  const filtered = active
    .filter(a=>filter==="All"||a.stage===filter)
    .filter(a=>planFilter==="All"||a.plan===planFilter)
    .filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.industry.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>
      sortBy==="churnRisk"?b.churnRisk-a.churnRisk:
      sortBy==="arr"      ?b.arr-a.arr:
      sortBy==="ces"      ?a.ces-b.ces:
      sortBy==="health"   ?a.healthScore-b.healthScore:
      sortBy==="renewal"  ?new Date(a.renewalDate)-new Date(b.renewalDate):0
    );

  const isFiltered=filter!=="All"||planFilter!=="All"||search.trim()!=="";
  const clearFilters=()=>{ setFilter("All"); setPlanFilter("All"); setSearch(""); };

  // Public routes — must be checked before the auth gate
  const surveyToken = window.location.pathname.match(/^\/survey\/([a-f0-9]+)$/)?.[1];
  if (surveyToken) return <SurveyResponsePage token={surveyToken}/>;

  const portalToken = window.location.pathname.match(/^\/portal\/([a-f0-9]+)$/)?.[1];
  if (portalToken) return <PortalPage token={portalToken}/>;

  const handoverToken = window.location.pathname.match(/^\/handover\/([a-f0-9]+)$/)?.[1];
  if (handoverToken) return <HandoverPage token={handoverToken}/>;

  // Auth gate — if backend is configured and no session, show login screen
  if (API_URL && !session) {
    return <AuthScreen onAuth={s => { if(s) setSession(s); }}/>;
  }

  const logout = () => {
    clearSession();
    setSession(null);
    setAccounts([]); // clear data from memory on logout
  };

  const NAV = [
    // ── Daily work ──────────────────────────────────────────────────────────────
    { id:"briefing",    icon:"briefing",     label:"Daily Briefing",   active:true  },
    { id:"portfolio",   icon:"portfolio",    label:"Portfolio",         active:true  },
    { id:"outreach",    icon:"email",        label:"Outreach Queue",    active:true, badge:outreachPending>0?outreachPending:null },
    { id:"tasks",       icon:"tasks",        label:"Tasks",             active:true, badge:taskAlerts>0?taskAlerts:null },
    // ── Manage ──────────────────────────────────────────────────────────────────
    { divider:"Manage" },
    { id:"overview",    icon:"overview",     label:"Need Attention",    active:true  },
    { id:"pipeline",    icon:"pipeline",     label:"Renewal Pipeline",  active:true  },
    { id:"playbooks",   icon:"playbooks",    label:"Playbooks",         active:true, badge:playbookAlerts>0?playbookAlerts:null },
    { id:"onboarding",  icon:"onboarding",   label:"Onboarding",        active:true },
    { id:"performance", icon:"perf",         label:"My Performance",    active:true  },
    // ── Configure ───────────────────────────────────────────────────────────────
    { divider:"Configure" },
    { id:"surveys",     icon:"survey",       label:"Surveys",           active:true  },
    { id:"automation",  icon:"automation",   label:"Automation",        active:true },
    { id:"integrations",icon:"integrations", label:"Integrations",      active:true  },
    { id:"product",     icon:"playbooks",    label:"Product Knowledge", active:true },
    { id:"settings",    icon:"settings",     label:"Settings",          active:true },
  ];

  return (
    <ErrorBoundary>
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",display:"flex",background:"var(--bg)"}}>

        {/* Sidebar */}
        <div style={{width:"var(--sidebar-w)",background:"var(--sidebar-bg)",borderRight:"1px solid var(--sidebar-border)",
          display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"22px 16px 18px",borderBottom:"1px solid var(--sidebar-border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"var(--r)",
                background:"var(--indigo)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                boxShadow:"0 2px 10px var(--indigo-glow)"}}>
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
                  <path d="M0 5H4L6 1L8 9L10 2L12 7L14 5H18" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{fontWeight:800,fontSize:16,letterSpacing:"-.04em",color:"var(--text)"}}>Pulse</span>
            </div>
          </div>

          <div style={{padding:"12px 8px",flex:1,overflowY:"auto"}}>
            {NAV.map((n,i)=>
              n.divider ? (
                <div key={`div-${i}`} style={{fontSize:10,fontWeight:600,color:"var(--sidebar-section)",
                  textTransform:"uppercase",letterSpacing:".1em",
                  padding:"18px 12px 6px",userSelect:"none"}}>
                  {n.divider}
                </div>
              ) : (
              <div key={n.id}
                title={n.tip||""}
                onClick={n.active?()=>{setView(n.id);setSelected(null);}:undefined}
                className={n.active?"nav-item":""}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"8px 12px",borderRadius:"var(--r)",marginBottom:1,
                  background:view===n.id?"var(--sidebar-active)":"transparent",
                  borderLeft:view===n.id?"2.5px solid var(--sidebar-icon-active)":"2.5px solid transparent",
                  cursor:n.active?"pointer":"not-allowed",opacity:n.active?1:0.35}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <Ic n={n.icon||n.id} size={14} color={view===n.id?"var(--sidebar-icon-active)":"var(--sidebar-icon)"}/>
                  <span style={{fontSize:13,color:view===n.id?"var(--sidebar-text-active)":"var(--sidebar-text)",fontWeight:view===n.id?600:400}}>{n.label}</span>
                </div>
                {n.badge&&(
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"white",
                    background:"var(--rose)",padding:"1px 7px",borderRadius:99,fontWeight:700,
                    minWidth:18,textAlign:"center"}}>
                    {n.badge}
                  </span>
                )}
                {n.tip&&!n.badge&&(
                  <span style={{fontSize:9,fontFamily:"var(--font-mono)",color:"var(--sidebar-text)",
                    background:"rgba(255,255,255,0.08)",padding:"2px 6px",borderRadius:"var(--r-xs)",letterSpacing:".04em"}}>
                    {n.tip}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{padding:"14px 12px",borderTop:"1px solid var(--sidebar-border)"}}>
            {session?.user && (
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
                padding:"8px 10px",background:"rgba(0,0,0,0.04)",borderRadius:"var(--r)"}}>
                <Avatar name={session.user.fullName||session.user.email} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--text)"}}>
                    {session.user.fullName||session.user.email}
                  </div>
                  {session.user.company&&(
                    <div style={{fontSize:10,color:"var(--sidebar-text)",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {session.user.company}
                    </div>
                  )}
                </div>
                <button onClick={logout} className="sidebar-icon-btn icon-btn"
                  title="Sign out"
                  style={{background:"none",border:"none",cursor:"pointer",
                    padding:4,borderRadius:"var(--r-xs)",flexShrink:0}}>
                  <Ic n="arrow_right" size={13} color="var(--sidebar-icon)"/>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,overflow:"auto",padding:"32px 40px"}}>

          {/* ── OUTREACH QUEUE VIEW ── */}
          {view==="outreach"&&(
            <OutreachQueuePage call={call} accounts={active} toast={toast}/>
          )}

          {/* ── SURVEYS VIEW ── */}
          {view==="surveys"&&(
            <SurveysPage accounts={active} session={session} toast={toast} onGoToSettings={()=>setView("settings")}/>
          )}

          {/* ── INTEGRATIONS VIEW ── */}
          {view==="settings"&&(
            <div style={{maxWidth:600}}>
              <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:28}}>Settings</h1>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Profile</div>
              <ProfileSettings call={call} toast={toast}/>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",margin:"32px 0 14px"}}>Email</div>
              <EmailSettingsPage session={session}/>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",margin:"32px 0 14px"}}>Product Usage</div>
              <WebhookSettings call={call} toast={toast}/>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",margin:"32px 0 14px"}}>Daily Briefing</div>
              <BriefingSettings call={call} toast={toast} hasGmail={!!session}/>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",margin:"32px 0 14px"}}>Audit Log</div>
              <AuditLogSection call={call}/>
            </div>
          )}
          {view==="integrations"&&(
            <IntegrationsPage onImport={bulkImport} toast={toast} call={call}/>
          )}

          {/* ── TASKS VIEW ── */}
          {view==="tasks"&&(
            <TasksPage
              accounts={active}
              manualTasks={manualTasks}
              onAddManual={addManualTask}
              onToggleManual={toggleManualTask}
              onDeleteManual={deleteManualTask}
              onAccountClick={a=>{setSelected(a);setView("portfolio");}}
            />
          )}

          {/* ── OVERVIEW VIEW ── */}
          {view==="overview"&&(
            <ManagerOverviewPage
              accounts={active}
              onAccountClick={a=>{setSelected(a);setView("portfolio");}}
            />
          )}

          {/* ── PIPELINE VIEW ── */}
          {view==="pipeline"&&(
            <RenewalPipelinePage
              accounts={active}
              onAccountClick={a=>{setSelected(a);setView("portfolio");}}
            />
          )}

          {/* ── PLAYBOOKS VIEW ── */}
          {view==="playbooks"&&(
            <PlaybookLibraryPage accounts={active} onUpdate={update} onAccountClick={a=>{setSelected(a);setDetailTab("health");setView("portfolio");}}/>
          )}

          {/* ── AUTOMATION VIEW ── */}
          {view==="automation"&&(
            <AutomationPage call={call} toast={toast} accounts={active}/>
          )}

          {/* ── ONBOARDING VIEW ── */}
          {view==="onboarding"&&(
            <OnboardingPage call={call} toast={toast} accounts={active}
              onAccountClick={a=>{setSelected(a);setDetailTab("onboarding");}}/>
          )}

          {/* ── PRODUCT KNOWLEDGE VIEW ── */}
          {view==="product"&&(
            <ProductKnowledgePage call={call} upload={uploadDoc} toast={toast}/>
          )}

          {/* ── PERFORMANCE VIEW ── */}
          {view==="performance"&&(
            <MyPerformancePage accounts={active} call={call}/>
          )}

          {/* ── BRIEFING VIEW ── */}
          {view==="briefing"&&(
            <BriefingPage call={call} toast={toast} accounts={active}
              outreachPending={outreachPending}
              onAccountClick={id=>{const a=active.find(x=>x.id===id);if(a){setSelected(a);setView("portfolio");}}}/>
          )}

          {/* ── PORTFOLIO VIEW ── */}
          {view==="portfolio"&&(
            selected ? (
              <Detail key={selected.id} account={selected} call={call}
                initialTab={detailTab}
                onClose={()=>{setSelected(null);setDetailTab("activity");}}
                onUpdate={update} onDelete={del} toast={toast}
                closeoutMeeting={closeoutMeeting} setCloseoutMeeting={setCloseoutMeeting}
                manualTasks={manualTasks} onAddManual={addManualTask} onToggleManual={toggleManualTask} onDeleteManual={deleteManualTask}/>
            ) : (<>
            {!apiReady&&API_URL&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",
                height:320,flexDirection:"column",gap:16}}>
                <div style={{width:32,height:32,border:"3px solid var(--border2)",
                  borderTopColor:"var(--indigo)",borderRadius:"50%",
                  animation:"spin .7s linear infinite"}}/>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>Loading your portfolio…</div>
              </div>
            )}

            {/* Migration banner — shown when local data exists but DB is empty */}
            {apiReady&&API_URL&&accounts.length===0&&!migrateDone&&
              localStorage.getItem("pulse_v4")&&JSON.parse(localStorage.getItem("pulse_v4")||"[]").length>0&&(
              <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.2)",
                borderRadius:"var(--r-lg)",padding:"18px 22px",marginBottom:24,
                display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,
                animation:"fadeUp .2s ease"}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Ic n="info" size={18} color="var(--indigo)" style={{flexShrink:0,marginTop:1}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--indigo)",marginBottom:3}}>
                      You have local data that hasn't been migrated yet
                    </div>
                    <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>
                      We found {JSON.parse(localStorage.getItem("pulse_v4")||"[]").length} account
                      {JSON.parse(localStorage.getItem("pulse_v4")||"[]").length!==1?"s":""} saved 
                      in your browser from before the database was connected. 
                      Click to move them to your account permanently.
                    </div>
                  </div>
                </div>
                <button onClick={migrateLocalData} disabled={migrating}
                  style={{display:"flex",alignItems:"center",gap:7,flexShrink:0,
                    background:"var(--indigo)",color:"white",border:"none",
                    borderRadius:"var(--r)",padding:"10px 20px",fontWeight:600,
                    fontSize:13,cursor:"pointer",fontFamily:"var(--font-display)",
                    boxShadow:"0 2px 8px var(--indigo-glow)",whiteSpace:"nowrap"}}>
                  {migrating
                    ? <><span style={{width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",
                        borderTopColor:"white",borderRadius:"50%",display:"inline-block",
                        animation:"spin .7s linear infinite"}}/>Migrating…</>
                    : <><Ic n="upload" size={13} color="white"/>Migrate to database</>
                  }
                </button>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
              <div>
                <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Account Portfolio</h1>
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setShowBulk(true)}
                  style={{background:"var(--bg2)",color:"var(--indigo)",border:"1.5px solid var(--indigo-dim)",
                    borderRadius:"var(--r)",padding:"10px 18px",fontWeight:700,fontSize:14,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:7,fontFamily:"var(--font-display)",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--indigo-dim)"}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--bg2)"}>
                  <Ic n="upload" size={14} color="var(--indigo)"/> Import CSV
                </button>
                <Btn onClick={()=>setShowAdd(true)} style={{fontSize:14,padding:"11px 22px"}}>+ Add Account</Btn>
              </div>
            </div>

            <Stats accounts={filtered} isFiltered={isFiltered}/>

            <CoverageHealthCard accounts={accounts}/>

            {/* Filters */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginRight:4}}>Stage</span>
                  {["All","At Risk","Needs Attention","Stable","Healthy"].map(f=>{
                    const cfg=STAGE_CFG[f],active2=filter===f,count=stageCounts[f]??0;
                    return (
                      <button key={f} onClick={()=>setFilter(f)} className="pill-btn"
                        style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                          fontFamily:"var(--font-mono)",fontWeight:active2?600:400,
                          display:"flex",alignItems:"center",gap:5,
                          border:`1.5px solid ${active2?(cfg?.color||"var(--indigo)"):"var(--border)"}`,
                          background:active2?(cfg?.bg||"var(--indigo-dim)"):"var(--bg2)",
                          color:active2?(cfg?.color||"var(--indigo)"):"var(--text2)"}}>
                        {f}<span style={{fontSize:10,opacity:0.7}}>({count})</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:10}}>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                      <Ic n="eye" size={14} color="var(--text3)"/>
                    </span>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accounts…"
                      style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                        padding:"8px 14px 8px 32px",color:"var(--text)",fontFamily:"var(--font-display)",
                        fontSize:13,outline:"none",width:200}}/>
                  </div>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                    style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                      padding:"8px 12px",color:"var(--text2)",fontFamily:"var(--font-mono)",fontSize:12,outline:"none",cursor:"pointer"}}>
                    <option value="churnRisk">Churn Risk ↑</option>
                    <option value="renewal">Renewal Soon</option>
                    <option value="health">Health ↑</option>
                    <option value="arr">ARR ↓</option>
                    <option value="ces">CES ↑</option>
                  </select>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginRight:4}}>Plan</span>
                {[
                  {label:"All",color:"var(--indigo)",bg:"var(--indigo-dim)"},
                  {label:"Starter",color:"var(--sky)",bg:"var(--sky-dim)"},
                  {label:"Growth",color:"var(--amber)",bg:"var(--amber-dim)"},
                  {label:"Enterprise",color:"var(--emerald)",bg:"var(--emerald-dim)"},
                ].map(({label,color,bg})=>{
                  const active2=planFilter===label, count=planCounts[label]??0;
                  return (
                    <button key={label} onClick={()=>setPlanFilter(label)} className="pill-btn"
                      style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                        fontFamily:"var(--font-mono)",fontWeight:active2?600:400,
                        display:"flex",alignItems:"center",gap:5,
                        border:`1.5px solid ${active2?color:"var(--border)"}`,
                        background:active2?bg:"var(--bg2)",color:active2?color:"var(--text2)"}}>
                      {label}<span style={{fontSize:10,opacity:0.7}}>({count})</span>
                    </button>
                  );
                })}
                {isFiltered&&(
                  <button onClick={clearFilters} className="pill-btn"
                    style={{padding:"6px 14px",borderRadius:99,fontSize:12,cursor:"pointer",
                      fontFamily:"var(--font-mono)",border:"1.5px solid var(--border)",
                      background:"var(--bg2)",color:"var(--text3)"}}>
                    Clear all ×
                  </button>
                )}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14}}>
              {filtered.map((a,i)=>(
                <Card key={a.id} account={a} index={i} onClick={()=>setSelected(a)}/>
              ))}
              {filtered.length===0&&(
                <Empty isFiltered={isFiltered} onClear={clearFilters} onAdd={()=>setShowAdd(true)} onLoadDemo={loadDemoData}/>
              )}
            </div>
          </>))}
        </div>

        {showAdd &&<AccountForm onClose={()=>setShowAdd(false)} onSave={add} toast={toast}/>}
        {showBulk&&<BulkUpload onClose={()=>setShowBulk(false)} onImport={bulkImport}
          existingNames={active.map(a=>a.name.toLowerCase().trim())} toast={toast}/>}
      </div>

      <ToastBar toasts={toasts}/>
    </>
    </ErrorBoundary>
  );
}
