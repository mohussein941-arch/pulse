import { useState, useEffect, useCallback } from "react";
import { Ic, Ring } from "./ui";

// ─── Onboarding helpers ───────────────────────────────────────────────────────
const OB_PHASES = [
  { key:"handover",       label:"Handover"       },
  { key:"kickoff",        label:"Kickoff"         },
  { key:"configuration",  label:"Configuration"   },
  { key:"training",       label:"Training"        },
  { key:"go_live",        label:"Go-Live"         },
  { key:"value_realized", label:"Value Realised"  },
];
const NEED_CATS    = ["technical","business","integration","training"];
const NEED_PRIS    = ["high","medium","low"];
const NEED_STATS   = ["identified","in_progress","resolved"];
const TASK_STATUSES = ["not_started","in_progress","done","blocked"];
const TASK_STATUS_CFG = {
  not_started:{ label:"To do",      color:"var(--text3)",  bg:"var(--bg4)"         },
  in_progress:{ label:"In progress",color:"var(--indigo)", bg:"var(--indigo-dim)"  },
  done:       { label:"Done",       color:"var(--emerald)",bg:"var(--emerald-dim)" },
  blocked:    { label:"Blocked",    color:"var(--rose)",   bg:"var(--rose-dim)"    },
};

function computeObHealth(plan, tasks) {
  if (!plan) return 0;
  const today  = new Date();
  const phases = plan.phases || {};

  const relevant = OB_PHASES.filter(p => {
    const ph = phases[p.key] || {};
    return !ph.skipped && ph.expected;
  });
  const behind = relevant.filter(p => {
    const ph = phases[p.key] || {};
    return !ph.actual && new Date(ph.expected) < today;
  });
  const timelineScore = relevant.length > 0
    ? ((relevant.length - behind.length) / relevant.length) * 100 : 100;

  const cust      = tasks.filter(t => t.owner === 'customer');
  const custScore = cust.length > 0 ? (cust.filter(t => t.status === 'done').length / cust.length) * 100 : 100;
  const csm       = tasks.filter(t => t.owner === 'csm');
  const csmScore  = csm.length > 0  ? (csm.filter(t => t.status === 'done').length / csm.length) * 100  : 100;

  return Math.round(custScore * 0.4 + csmScore * 0.2 + timelineScore * 0.4);
}

function nextPhaseKey(currentKey, phases) {
  const idx  = OB_PHASES.findIndex(p => p.key === currentKey);
  for (let i = idx + 1; i < OB_PHASES.length; i++) {
    if (!(phases[OB_PHASES[i].key] || {}).skipped) return OB_PHASES[i].key;
  }
  return null;
}


const OnboardingTab = ({ account, call, toast }) => {
  const [plan,     setPlan]     = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [needs,    setNeeds]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showHO,   setShowHO]   = useState(false);
  const [hoDraft,  setHoDraft]  = useState({});
  const [hoFields,    setHoFields]    = useState([]);
  const [editHO,   setEditHO]   = useState(false);
  const [taskForm, setTaskForm] = useState({show:false, owner:"csm", title:"", due_date:""});
  const [needForm, setNeedForm] = useState({show:false, category:"business", description:"", priority:"medium"});
  const [sendHO,   setSendHO]   = useState(false);
  const [hoEmail,  setHoEmail]  = useState("");
  const [hoSending,setHoSending]= useState(false);
  const [hoLink,   setHoLink]   = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const d = await call("GET", `/api/onboarding/account/${account.id}`);
      setPlan(d.plan);
      setTasks(d.tasks || []);
      setNeeds(d.needs || []);
      if (d.plan) setHoDraft(d.plan.handover_data || {});
    } catch {} finally { setLoading(false); }
  }, [call, account.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activatePlan = async () => {
    try {
      await call("POST", "/api/onboarding/plan", { account_id: account.id });
      toast?.("Onboarding plan created", "success"); fetchAll();
    } catch { toast?.("Failed to create plan", "error"); }
  };

  const closePlan = async () => {
    if (!window.confirm("Close this onboarding plan? It will be archived but kept as a reference.")) return;
    try { await call("PATCH", `/api/onboarding/plan/${plan.id}`, { status: "closed" }); } catch {}
    toast?.("Plan closed", "info"); fetchAll();
  };

  const saveHandover = async () => {
    try { await call("PATCH", `/api/onboarding/plan/${plan.id}`, { handover_data: hoDraft, handover_fields: hoFields }); } catch {}
    setPlan(p => ({ ...p, handover_data: hoDraft, handover_fields: hoFields }));
    setEditHO(false); toast?.("Handover saved", "success");
  };

  const HO_DEFAULT_FIELDS = [
    {key:"what_sold",          label:"What was sold"},
    {key:"why_bought",         label:"Why they bought / pain points"},
    {key:"success_definition", label:"Their definition of success"},
    {key:"promises",           label:"Commitments made during sales"},
    {key:"red_flags",          label:"Red flags or concerns"},
    {key:"contacts",           label:"Contacts handed over"},
  ];
  const hoFieldDefs = (plan?.handover_fields?.length ? plan.handover_fields : HO_DEFAULT_FIELDS);
  const hoCompleteness = plan
    ? Math.round(hoFieldDefs.filter(f => plan.handover_data?.[f.key]?.trim()).length / (hoFieldDefs.length||1) * 100)
    : 0;

  const sendHandover = async () => {
    if (!hoEmail.trim() || !plan) return;
    setHoSending(true);
    try {
      const d = await call("POST", `/api/onboarding/plan/${plan.id}/send-handover`, { sales_email: hoEmail.trim() });
      setPlan(p => ({ ...p, handover_status: "sent", handover_sales_email: hoEmail.trim() }));
      setHoLink(d.link);
      toast?.("Handover link generated", "success");
    } catch { toast?.("Failed to generate link", "error"); }
    finally { setHoSending(false); }
  };

  const markPhaseDone = async phaseKey => {
    const today  = new Date().toISOString().split("T")[0];
    const phases = { ...plan.phases, [phaseKey]: { ...(plan.phases[phaseKey] || {}), actual: today, skipped: false } };
    const next   = nextPhaseKey(phaseKey, phases);
    const body   = { phases, ...(next ? { current_phase: next } : {}) };
    if (!next) body.go_live_actual = phaseKey === "go_live" ? today : plan.go_live_actual;
    try { const d = await call("PATCH", `/api/onboarding/plan/${plan.id}`, body); setPlan(d); } catch {}
  };

  const togglePhaseNA = async phaseKey => {
    const ph     = plan.phases[phaseKey] || {};
    const nowNA  = !ph.skipped;
    const phases = { ...plan.phases, [phaseKey]: { ...ph, skipped: nowNA, actual: nowNA ? null : ph.actual } };
    let current  = plan.current_phase;
    if (nowNA && current === phaseKey) {
      current = nextPhaseKey(phaseKey, phases) || plan.current_phase;
    }
    try { const d = await call("PATCH", `/api/onboarding/plan/${plan.id}`, { phases, current_phase: current }); setPlan(d); } catch {}
  };

  const cycleTaskStatus = async task => {
    const idx  = TASK_STATUSES.indexOf(task.status);
    const next = TASK_STATUSES[(idx + 1) % TASK_STATUSES.length];
    try {
      await call("PATCH", `/api/onboarding/tasks/${task.id}`, { status: next });
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: next } : t));
    } catch {}
  };

  const addTask = async () => {
    if (!taskForm.title.trim()) return;
    try {
      const d = await call("POST", "/api/onboarding/tasks", { plan_id: plan.id, account_id: account.id, title: taskForm.title, owner: taskForm.owner, due_date: taskForm.due_date || null });
      setTasks(ts => [...ts, d]); setTaskForm(f => ({...f, show:false, title:"", due_date:""})); toast?.("Task added","success");
    } catch { toast?.("Failed to add task","error"); }
  };

  const deleteTask = async id => {
    try { await call("DELETE", `/api/onboarding/tasks/${id}`); } catch {}
    setTasks(ts => ts.filter(t => t.id !== id));
  };

  const addNeed = async () => {
    if (!needForm.description.trim()) return;
    try {
      const d = await call("POST", "/api/onboarding/needs", { account_id: account.id, ...needForm });
      setNeeds(ns => [d, ...ns]); setNeedForm(f => ({...f, show:false, description:""})); toast?.("Need logged","success");
    } catch {}
  };

  const cycleNeedStatus = async need => {
    const idx  = NEED_STATS.indexOf(need.status);
    const next = NEED_STATS[(idx + 1) % NEED_STATS.length];
    try { await call("PATCH", `/api/onboarding/needs/${need.id}`, { status: next }); } catch {}
    setNeeds(ns => ns.map(n => n.id === need.id ? { ...n, status: next } : n));
  };

  const deleteNeed = async id => {
    try { await call("DELETE", `/api/onboarding/needs/${id}`); } catch {}
    setNeeds(ns => ns.filter(n => n.id !== id));
  };

  const inputSt = { width:"100%", padding:"7px 10px", border:"1.5px solid var(--border)",
    borderRadius:"var(--r-sm)", fontSize:12, fontFamily:"var(--font-display)",
    background:"var(--bg)", color:"var(--text)", outline:"none" };
  const secHead = (label, action) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span style={{fontSize:12,fontWeight:700,color:"var(--text2)",letterSpacing:"-.01em"}}>{label}</span>
      {action}
    </div>
  );

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--text3)",fontSize:13,padding:"20px 0"}}>
      <div style={{width:14,height:14,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      Loading…
    </div>
  );

  if (!plan) return (
    <div style={{textAlign:"center",padding:"40px 16px"}}>
      <Ic n="onboarding" size={36} color="var(--border2)" style={{marginBottom:12}}/>
      <div style={{fontSize:14,fontWeight:600,color:"var(--text2)",marginBottom:6}}>No onboarding plan yet</div>
      <div style={{fontSize:12,color:"var(--text3)",marginBottom:20,lineHeight:1.6}}>
        Activate to track the handover, plan tasks, and log account requirements.<br/>
        Optional — skip if not needed for this account.
      </div>
      <button onClick={activatePlan}
        style={{background:"var(--indigo)",color:"white",border:"none",borderRadius:"var(--r)",
          padding:"9px 20px",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"var(--font-display)",
          boxShadow:"0 2px 8px var(--indigo-glow)"}}>
        Start Onboarding Plan
      </button>
    </div>
  );

  const health    = computeObHealth(plan, tasks);
  const custTasks = tasks.filter(t => t.owner === "customer");
  const csmTasks  = tasks.filter(t => t.owner === "csm");
  const phases    = plan.phases || {};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Health + close */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Ring score={health} size={44}/>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)"}}>ONBOARDING HEALTH</div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>
              Customer {custTasks.filter(t=>t.status==="done").length}/{custTasks.length} · CSM {csmTasks.filter(t=>t.status==="done").length}/{csmTasks.length}
            </div>
          </div>
        </div>
        <button onClick={closePlan}
          style={{fontSize:11,color:"var(--text3)",background:"none",border:"1px solid var(--border)",
            borderRadius:"var(--r-sm)",padding:"4px 10px",cursor:"pointer",fontFamily:"var(--font-display)"}}>
          Close plan
        </button>
      </div>

      {/* TTV Progress Banner */}
      {(()=>{
        const EXPECTED_DAYS = 45;
        const planAge  = plan.created_at ? Math.floor((Date.now()-new Date(plan.created_at))/86400000) : 0;
        const phDone   = OB_PHASES.filter(p=>(plan.phases?.[p.key]||{}).actual).length;
        const taskDone = tasks.filter(t=>t.status==="done").length;
        const taskTot  = tasks.length;
        const timePct  = Math.min(100, Math.round(planAge/EXPECTED_DAYS*100));
        const phasePct = Math.round(phDone/OB_PHASES.length*100);
        const isComplete = !!plan.go_live_actual;
        const status = isComplete ? "complete"
          : phasePct >= timePct     ? "on_track"
          : phasePct < timePct-30   ? "at_risk"
          : "watch";
        const statusCfg = {
          complete: {label:"Onboarding Complete", color:"var(--emerald)", bg:"rgba(5,150,105,.08)", border:"rgba(5,150,105,.25)"},
          on_track: {label:"On Track",            color:"var(--emerald)", bg:"rgba(5,150,105,.08)", border:"rgba(5,150,105,.25)"},
          watch:    {label:"Slight Delay",         color:"var(--amber)",  bg:"var(--amber-dim)",    border:"rgba(217,119,6,.3)" },
          at_risk:  {label:"At Risk",              color:"var(--rose)",   bg:"var(--rose-dim)",     border:"rgba(225,29,72,.3)" },
        };
        const sc = statusCfg[status];
        return (
          <div style={{background:sc.bg,border:`1.5px solid ${sc.border}`,borderRadius:"var(--r)",padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:sc.color,textTransform:"uppercase",letterSpacing:".06em",marginBottom:2}}>
                  Time to Value
                </div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>
                  {isComplete ? `Completed in ${planAge} days` : `Day ${planAge} of ~${EXPECTED_DAYS}-day window`}
                </div>
              </div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,
                background:sc.border,color:sc.color}}>{sc.label}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:taskTot>0?"1fr 1fr":"1fr",gap:10}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginBottom:4}}>
                  <span>Phases</span><span style={{fontFamily:"var(--font-mono)",fontWeight:600}}>{phDone}/{OB_PHASES.length}</span>
                </div>
                <div style={{height:5,borderRadius:99,background:"var(--bg4)"}}>
                  <div style={{height:"100%",width:`${phasePct}%`,borderRadius:99,
                    background:phasePct>=timePct?"var(--emerald)":"var(--amber)",transition:"width .4s ease"}}/>
                </div>
              </div>
              {taskTot>0&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginBottom:4}}>
                  <span>Tasks</span><span style={{fontFamily:"var(--font-mono)",fontWeight:600}}>{taskDone}/{taskTot}</span>
                </div>
                <div style={{height:5,borderRadius:99,background:"var(--bg4)"}}>
                  <div style={{height:"100%",width:`${Math.round(taskDone/taskTot*100)}%`,borderRadius:99,
                    background:"var(--indigo)",transition:"width .4s ease"}}/>
                </div>
              </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Phase track */}
      <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:10,letterSpacing:".04em"}}>PHASES</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {OB_PHASES.map((p, i) => {
            const ph        = phases[p.key] || {};
            const isCurrent = plan.current_phase === p.key;
            const isDone    = !!ph.actual;
            const isNA      = !!ph.skipped;
            const isBehind  = !isDone && !isNA && ph.expected && new Date(ph.expected) < new Date();

            const dot = isDone ? "var(--emerald)" : isNA ? "var(--text3)" : isCurrent ? "var(--indigo)" : "var(--border2)";
            return (
              <div key={p.key} style={{display:"flex",alignItems:"center",gap:10,opacity:isNA?0.45:1}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:dot,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {isDone && <Ic n="check" size={10} color="white"/>}
                  {isCurrent && !isDone && <div style={{width:7,height:7,borderRadius:"50%",background:"white"}}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:12,fontWeight:isCurrent?600:400,
                    color:isNA?"var(--text3)":isDone?"var(--emerald)":isCurrent?"var(--indigo)":"var(--text2)",
                    textDecoration:isNA?"line-through":"none"}}>
                    {p.label}
                  </span>
                  {ph.expected && !isNA && (
                    <span style={{fontSize:10,color:isBehind?"var(--rose)":"var(--text3)",marginLeft:6}}>
                      {isBehind?"behind · ":""}{ph.actual||ph.expected}
                    </span>
                  )}
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  {isCurrent && !isDone && !isNA && (
                    <button onClick={()=>markPhaseDone(p.key)}
                      style={{fontSize:10,padding:"2px 8px",borderRadius:"var(--r-xs)",border:"none",
                        background:"var(--indigo)",color:"white",cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600}}>
                      Done
                    </button>
                  )}
                  <button onClick={()=>togglePhaseNA(p.key)} title={isNA?"Mark applicable":"Mark N/A"}
                    style={{fontSize:10,padding:"2px 8px",borderRadius:"var(--r-xs)",
                      border:"1px solid var(--border)",background:"var(--bg)",cursor:"pointer",
                      color:"var(--text3)",fontFamily:"var(--font-display)"}}>
                    {isNA?"↩":"N/A"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales handover card */}
      <div style={{border:"1.5px solid var(--border)",borderRadius:"var(--r)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",background:"var(--bg3)",borderBottom:showHO?"1px solid var(--border)":"none"}}>
          <button onClick={()=>setShowHO(h=>!h)}
            style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"10px 14px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"var(--font-display)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text2)"}}>Sales Handover</span>
              {plan && (
                <>
                  <span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:"var(--r-xs)",
                    background:hoCompleteness===100?"var(--emerald-dim)":hoCompleteness>50?"var(--amber-dim)":"var(--bg4)",
                    color:hoCompleteness===100?"var(--emerald)":hoCompleteness>50?"var(--amber)":"var(--text3)"}}>
                    {hoCompleteness}%
                  </span>
                  {plan.handover_status==="confirmed"&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:"var(--r-xs)",background:"var(--emerald-dim)",color:"var(--emerald)"}}>✓ Confirmed</span>}
                  {plan.handover_status==="sent"&&<span style={{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:"var(--r-xs)",background:"var(--amber-dim)",color:"var(--amber)"}}>Awaiting Sales</span>}
                </>
              )}
            </div>
            <Ic n={showHO?"chevron_up":"chevron_down"} size={13} color="var(--text3)"/>
          </button>
          {plan && !editHO && (
            <button onClick={e=>{e.stopPropagation();setSendHO(s=>!s);setHoLink(null);}}
              style={{padding:"5px 12px",margin:"0 10px",borderRadius:"var(--r-sm)",fontSize:11,fontWeight:600,
                border:"1.5px solid var(--indigo)",background:"var(--indigo-dim)",color:"var(--indigo)",
                cursor:"pointer",fontFamily:"var(--font-display)",whiteSpace:"nowrap"}}>
              {plan.handover_status==="confirmed"?"Resend":"Send to Sales"}
            </button>
          )}
        </div>
        {showHO && sendHO && (
          <div style={{padding:14,borderBottom:"1px solid var(--border)",background:"var(--indigo-dim)"}}>
            {hoLink ? (
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"var(--indigo)",marginBottom:6}}>Magic link ready — copy and send to sales</div>
                <div style={{display:"flex",gap:6}}>
                  <input readOnly value={hoLink}
                    style={{flex:1,padding:"7px 10px",border:"1.5px solid var(--indigo)",borderRadius:"var(--r-sm)",
                      fontSize:12,fontFamily:"var(--font-mono)",background:"white",color:"var(--text)",outline:"none"}}/>
                  <button onClick={()=>{navigator.clipboard.writeText(hoLink);toast?.("Link copied","success");}}
                    style={{padding:"6px 12px",background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Copy
                  </button>
                </div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>
                  Sales rep visits this link — no Pulse account needed. They can review the handover and confirm.
                </div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:12,fontWeight:600,color:"var(--indigo)",marginBottom:8}}>Generate a handover link for the sales rep</div>
                <div style={{display:"flex",gap:6}}>
                  <input value={hoEmail} onChange={e=>setHoEmail(e.target.value)}
                    placeholder="sales.rep@company.com" type="email"
                    style={{flex:1,padding:"7px 10px",border:"1.5px solid var(--indigo)",borderRadius:"var(--r-sm)",
                      fontSize:12,fontFamily:"var(--font-display)",background:"white",color:"var(--text)",outline:"none"}}/>
                  <button onClick={sendHandover} disabled={hoSending||!hoEmail.trim()}
                    style={{padding:"6px 14px",background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,cursor:"pointer",
                      opacity:hoSending?0.7:1,fontFamily:"var(--font-display)"}}>
                    {hoSending?"Generating…":"Generate link"}
                  </button>
                </div>
                {plan?.handover_sales_email && (
                  <div style={{fontSize:11,color:"var(--text3)",marginTop:5}}>
                    Previously sent to: {plan.handover_sales_email}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {showHO && (
          <div style={{padding:14}}>
            {plan?.handover_status==="confirmed"&&plan?.handover_sales_notes&&(
              <div style={{background:"var(--emerald-dim)",border:"1.5px solid rgba(16,185,129,.2)",borderRadius:"var(--r-sm)",padding:"10px 12px",marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:"var(--emerald)",letterSpacing:".04em",marginBottom:4}}>SALES REP NOTES</div>
                <div style={{fontSize:12,color:"var(--text)",lineHeight:1.5}}>{plan.handover_sales_notes}</div>
              </div>
            )}
            {editHO ? (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {hoFields.map((f, i) => (
                  <div key={f.key}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <input value={f.label} placeholder="Field label"
                        onChange={e=>setHoFields(fs=>fs.map((x,j)=>j===i?{...x,label:e.target.value}:x))}
                        style={{...inputSt,fontSize:11,fontWeight:600,padding:"4px 8px",flex:1}}/>
                      <button onClick={()=>setHoFields(fs=>fs.filter((_,j)=>j!==i))}
                        style={{background:"none",border:"none",color:"var(--rose)",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"var(--font-display)"}}>Remove</button>
                    </div>
                    <textarea rows={2} style={{...inputSt,resize:"vertical"}}
                      value={hoDraft[f.key]||""} placeholder={f.label}
                      onChange={e=>setHoDraft(d=>({...d,[f.key]:e.target.value}))}/>
                  </div>
                ))}
                <button onClick={()=>setHoFields(fs=>[...fs,{key:`custom_${Math.random().toString(36).slice(2,9)}`,label:"New field"}])}
                  style={{alignSelf:"flex-start",background:"none",border:"1.5px dashed var(--border)",borderRadius:"var(--r-sm)",color:"var(--text2)",fontSize:11,fontWeight:600,padding:"6px 12px",cursor:"pointer",fontFamily:"var(--font-display)"}}>
                  + Add field
                </button>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
                  <button onClick={()=>setEditHO(false)}
                    style={{padding:"6px 14px",border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",
                      background:"var(--bg3)",color:"var(--text2)",fontSize:12,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Cancel
                  </button>
                  <button onClick={saveHandover}
                    style={{padding:"6px 14px",background:"var(--indigo)",color:"white",border:"none",
                      borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {hoFieldDefs.map(({key,label})=>(
                  (plan.handover_data||{})[key] ? (
                    <div key={key} style={{marginBottom:8}}>
                      <div style={{fontSize:10,fontWeight:700,color:"var(--text3)",letterSpacing:".04em",marginBottom:2}}>{(label||key).toUpperCase()}</div>
                      <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{(plan.handover_data||{})[key]}</div>
                    </div>
                  ) : null
                ))}
                {!Object.values(plan.handover_data||{}).some(Boolean) && (
                  <div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",marginBottom:8}}>No handover notes yet.</div>
                )}
                <button onClick={()=>{setHoDraft(plan.handover_data||{});setHoFields(plan.handover_fields?.length?plan.handover_fields:HO_DEFAULT_FIELDS);setEditHO(true);}}
                  style={{fontSize:11,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>
                  {Object.values(plan.handover_data||{}).some(Boolean) ? "Edit" : "Fill in handover"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mutual action plan */}
      <div>
        {secHead("Mutual Action Plan",
          <button onClick={()=>setTaskForm(f=>({...f,show:true}))}
            style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--indigo)",
              background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>
            <Ic n="plus" size={11} color="var(--indigo)"/> Add task
          </button>
        )}

        {taskForm.show && (
          <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:12,marginBottom:10}}>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {["csm","customer"].map(o=>(
                <button key={o} onClick={()=>setTaskForm(f=>({...f,owner:o}))}
                  style={{padding:"4px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid",fontSize:11,fontWeight:600,
                    cursor:"pointer",fontFamily:"var(--font-display)",
                    borderColor:taskForm.owner===o?"var(--indigo)":"var(--border)",
                    background:taskForm.owner===o?"var(--indigo-dim)":"var(--bg)",
                    color:taskForm.owner===o?"var(--indigo)":"var(--text2)"}}>
                  {o === "csm" ? "CSM Task" : "Customer Task"}
                </button>
              ))}
            </div>
            <input style={{...inputSt,marginBottom:6}} placeholder="Task title" value={taskForm.title}
              onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&addTask()}/>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input type="date" style={{...inputSt,flex:1}} value={taskForm.due_date}
                onChange={e=>setTaskForm(f=>({...f,due_date:e.target.value}))}/>
              <button onClick={addTask}
                style={{padding:"6px 14px",background:"var(--indigo)",color:"white",border:"none",
                  borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Add
              </button>
              <button onClick={()=>setTaskForm(f=>({...f,show:false,title:"",due_date:""}))}
                style={{padding:"6px 10px",border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",
                  background:"var(--bg)",color:"var(--text3)",fontSize:12,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !taskForm.show && (
          <div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",padding:"8px 0"}}>No tasks yet — add the first one.</div>
        )}

        {[["csm","CSM Tasks","var(--indigo)"],["customer","Customer Tasks","var(--teal)"]].map(([owner,label,color])=>{
          const ownerTasks = tasks.filter(t=>t.owner===owner);
          if (!ownerTasks.length) return null;
          return (
            <div key={owner} style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color,marginBottom:6,letterSpacing:".04em"}}>{label.toUpperCase()}</div>
              {ownerTasks.map(task=>{
                const sc = TASK_STATUS_CFG[task.status] || TASK_STATUS_CFG.not_started;
                return (
                  <div key={task.id} style={{display:"flex",alignItems:"center",gap:8,
                    padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                    <button onClick={()=>cycleTaskStatus(task)}
                      style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:"2px solid",
                        borderColor:task.status==="done"?"var(--emerald)":"var(--border2)",
                        background:task.status==="done"?"var(--emerald)":"transparent",
                        cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {task.status==="done"&&<Ic n="check" size={8} color="white"/>}
                    </button>
                    <span style={{flex:1,fontSize:12,color:"var(--text)",
                      textDecoration:task.status==="done"?"line-through":"none",
                      opacity:task.status==="done"?0.5:1}}>
                      {task.title}
                    </span>
                    <span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:"var(--r-xs)",
                      color:sc.color,background:sc.bg,whiteSpace:"nowrap",cursor:"pointer"}}
                      onClick={()=>cycleTaskStatus(task)} title="Click to cycle status">
                      {sc.label}
                    </span>
                    {task.due_date && (
                      <span style={{fontSize:10,color:"var(--text3)",whiteSpace:"nowrap"}}>{task.due_date}</span>
                    )}
                    <button onClick={()=>deleteTask(task.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}}>
                      <Ic n="trash" size={11} color="var(--rose)"/>
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Account needs */}
      <div>
        {secHead("Account Needs",
          <button onClick={()=>setNeedForm(f=>({...f,show:true}))}
            style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--indigo)",
              background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>
            <Ic n="plus" size={11} color="var(--indigo)"/> Log need
          </button>
        )}
        {needForm.show && (
          <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:12,marginBottom:10}}>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <select style={{...inputSt,flex:1}} value={needForm.category}
                onChange={e=>setNeedForm(f=>({...f,category:e.target.value}))}>
                {NEED_CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <select style={{...inputSt,flex:1}} value={needForm.priority}
                onChange={e=>setNeedForm(f=>({...f,priority:e.target.value}))}>
                {NEED_PRIS.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <input style={{...inputSt,marginBottom:6}} placeholder="Describe the need"
              value={needForm.description} onChange={e=>setNeedForm(f=>({...f,description:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&addNeed()}/>
            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
              <button onClick={()=>setNeedForm(f=>({...f,show:false,description:""}))}
                style={{padding:"5px 12px",border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",
                  background:"var(--bg)",color:"var(--text2)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Cancel
              </button>
              <button onClick={addNeed}
                style={{padding:"5px 12px",background:"var(--indigo)",color:"white",border:"none",
                  borderRadius:"var(--r-sm)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-display)"}}>
                Save
              </button>
            </div>
          </div>
        )}
        {needs.length === 0 && !needForm.show && (
          <div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",padding:"8px 0"}}>No requirements logged yet.</div>
        )}
        {needs.map(n=>{
          const priColor = n.priority==="high"?"var(--rose)":n.priority==="medium"?"var(--amber)":"var(--text3)";
          const stColor  = n.status==="resolved"?"var(--emerald)":n.status==="in_progress"?"var(--indigo)":"var(--text3)";
          return (
            <div key={n.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:600,padding:"1px 6px",borderRadius:"var(--r-xs)",
                    background:"var(--bg4)",color:"var(--text2)"}}>{n.category}</span>
                  <span style={{fontSize:10,fontWeight:600,color:priColor}}>{n.priority}</span>
                </div>
                <div style={{fontSize:12,color:n.status==="resolved"?"var(--text3)":"var(--text)",
                  textDecoration:n.status==="resolved"?"line-through":"none",lineHeight:1.4}}>
                  {n.description}
                </div>
              </div>
              <button onClick={()=>cycleNeedStatus(n)} title="Cycle status"
                style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:"var(--r-xs)",
                  border:"none",cursor:"pointer",fontFamily:"var(--font-display)",
                  background:n.status==="resolved"?"var(--emerald-dim)":n.status==="in_progress"?"var(--indigo-dim)":"var(--bg4)",
                  color:stColor,flexShrink:0,whiteSpace:"nowrap"}}>
                {n.status.replace("_"," ")}
              </button>
              <button onClick={()=>deleteNeed(n.id)} style={{background:"none",border:"none",cursor:"pointer",padding:2,flexShrink:0}}>
                <Ic n="trash" size={11} color="var(--rose)"/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingTab;
