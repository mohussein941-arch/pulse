import { useState, useEffect, useCallback, useRef } from "react";
import {
  SCENARIO_CFG, PLAYBOOK_LIBRARY, getTriggeredPlaybooks, getPriorityConfig,
  STAKEHOLDER_GUIDE, STAGE_CFG, ROLE_CFG, calcHealth, getHealthWarnings,
  hColor, fmtMoney, ago, until, todayStr, shapeTask, sentIcon, initials, hue, load, save,
  Ic, ScenarioBadge, Sparkline, Ring, Bar, Badge, Avatar, Inp, Slct, Fld, Btn, Modal, Confirm,
  PlaybookStepView, TASK_TYPE_CFG, generateAutoTasks,
  Card, SectionLabel, StatStrip, SignalCard, Tabs,
} from "./ui";
import { API_URL, loadSession } from "./api";
import CloseoutModal from "./CloseoutModal";
import OnboardingTab from "./OnboardingTab";
import OpportunityCards from "./OpportunityCards";

const ACT_TYPES  = ["Call","Email","Meeting","Note"];
const ACT_ICONS  = { Call:"Ph", Email:"Em", Meeting:"Mx", Note:"Nt" };
const ACT_COLORS = { Call:"var(--emerald)", Email:"var(--indigo)", Meeting:"var(--violet)", Note:"var(--amber)" };

const CitedNarrative = ({ text, citations = [], fontSize = 14 }) => {
  const [active, setActive] = useState(null);
  const cites = Array.isArray(citations) ? citations : [];
  const byMarker = new Map(cites.map(c => [c.marker, c]));
  const str = String(text || '');
  const nodes = str.split(/(\[\d+\])/g).map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (m && byMarker.has(Number(m[1]))) {
      const n = Number(m[1]);
      return (
        <sup key={i} onClick={() => setActive(active === n ? null : n)}
          style={{cursor:"pointer",color:"var(--indigo)",fontWeight:700,fontSize:"0.72em",padding:"0 1px",userSelect:"none"}}>[{n}]</sup>
      );
    }
    return part;
  });
  const footnotes = cites.filter(c => str.includes(`[${c.marker}]`)).sort((a, b) => a.marker - b.marker);
  const fmtSource = s => s ? String(s).replace(/_/g, " ").replace(/^\w/, ch => ch.toUpperCase()) : "Source";
  const fmtDate = d => { if (!d) return ""; const dt = new Date(d); return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString(undefined, { day:"numeric", month:"short", year:"numeric" }); };
  return (
    <div>
      <div style={{whiteSpace:"pre-wrap",lineHeight:1.6,fontSize,color:"var(--text)"}}>{nodes}</div>
      {footnotes.length>0&&(
        <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Sources</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {footnotes.map(c => (
              <div key={c.marker} onClick={() => setActive(active === c.marker ? null : c.marker)}
                style={{display:"flex",gap:8,fontSize:12,padding:"6px 8px",borderRadius:"var(--r-sm)",cursor:"pointer",
                  background:active===c.marker?"var(--indigo-dim)":"transparent",transition:"background .15s"}}>
                <span style={{color:"var(--indigo)",fontWeight:700,flexShrink:0}}>[{c.marker}]</span>
                <div style={{minWidth:0}}>
                  <div style={{color:"var(--text2)",fontWeight:600}}>{fmtSource(c.source)}{fmtDate(c.occurred_at)?` · ${fmtDate(c.occurred_at)}`:""}</div>
                  {c.snippet&&<div style={{color:"var(--text3)",marginTop:2,lineHeight:1.4}}>{c.snippet}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivePlaybookTab = ({ account, onUpdate }) => {
  const [expandedStep, setExpandedStep] = useState(null);
  const [showLibrary,  setShowLibrary]  = useState(false);

  const triggered    = getTriggeredPlaybooks(account);
  const activeId     = account.activePlaybookId;
  const activeSteps  = account.activePlaybookSteps||{};
  const activePb     = PLAYBOOK_LIBRARY.find(pb=>pb.id===activeId);

  const activatePlaybook = (pb) => {
    onUpdate(account.id, { activePlaybookId: pb.id, activePlaybookSteps:{} });
  };
  const dismissPlaybook = () => {
    const snoozed = [...(account.snoozedPlaybooks||[]), activeId];
    onUpdate(account.id, { activePlaybookId: null, activePlaybookSteps:{}, snoozedPlaybooks: snoozed });
  };
  const snoozesuggestion = (pbId) => {
    const snoozed = [...(account.snoozedPlaybooks||[]), pbId];
    onUpdate(account.id, { snoozedPlaybooks: snoozed });
  };
  const toggleStep = (stepId) => {
    const updated = { ...activeSteps, [stepId]: !activeSteps[stepId] };
    onUpdate(account.id, { activePlaybookSteps: updated });
  };

  if (showLibrary) {
    return (
      <div>
        <button onClick={()=>setShowLibrary(false)}
          style={{background:"none",border:"none",color:"var(--indigo)",cursor:"pointer",
            fontSize:13,fontWeight:600,padding:0,marginBottom:16,display:"flex",alignItems:"center",gap:6}}>
          ← Back to account
        </button>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {PLAYBOOK_LIBRARY.map(pb=>{
            const sc=SCENARIO_CFG[pb.scenario]||SCENARIO_CFG["Onboarding"];
            const pc=getPriorityConfig(pb.priority);
            return (
              <div key={pb.id} onClick={()=>{activatePlaybook(pb);setShowLibrary(false);}}
                style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                  padding:"12px 16px",cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--indigo)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>{sc.abbr||""}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{pb.name}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{pb.steps.length} steps</div>
                    </div>
                  </div>
                  <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active playbook view
  if (activePb) {
    const completedCount = activePb.steps.filter(s=>activeSteps[s.id]).length;
    const progress = Math.round((completedCount/activePb.steps.length)*100);
    const sc = SCENARIO_CFG[activePb.scenario]||SCENARIO_CFG["Onboarding"];
    const pc = getPriorityConfig(activePb.priority);
    return (
      <div>
        {/* Header */}
        <div style={{background:sc.bg,border:`1.5px solid ${sc.color}33`,borderRadius:"var(--r-lg)",
          padding:"14px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:20}}>{sc.abbr||""}</span>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:sc.color}}>{activePb.name}</div>
                <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>{activePb.trigger}</div>
              </div>
            </div>
            <button onClick={dismissPlaybook}
              style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:12,
                fontFamily:"var(--font-mono)"}}>Dismiss</button>
          </div>
          {progress>0&&(
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--font-mono)"}}>Progress</span>
                <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:sc.color,fontWeight:600}}>
                  {completedCount}/{activePb.steps.length} · {progress}%
                </span>
              </div>
              <Bar value={progress} color={sc.color}/>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
          textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>
          Steps — click to expand template
        </div>
        {activePb.steps.map(step=>(
          <PlaybookStepView
            key={step.id}
            step={step}
            done={!!activeSteps[step.id]}
            onToggle={()=>toggleStep(step.id)}
            expanded={expandedStep===step.id}
            onExpand={()=>setExpandedStep(expandedStep===step.id?null:step.id)}
          />
        ))}

        <button onClick={()=>setShowLibrary(true)}
          style={{width:"100%",marginTop:12,background:"transparent",color:"var(--indigo)",
            border:"1.5px dashed var(--border2)",borderRadius:"var(--r)",padding:"10px",
            fontFamily:"var(--font-mono)",fontSize:12,cursor:"pointer"}}>
          Switch to a different playbook
        </button>
      </div>
    );
  }

  // No active playbook — show suggestions
  const snoozed = account.snoozedPlaybooks||[];
  const unsnoozedTriggered = triggered.filter(pb=>!snoozed.includes(pb.id));
  return (
    <div>
      {unsnoozedTriggered.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>🎯 Suggested for this account</div>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:14,lineHeight:1.6}}>
            Based on this account's signals, these playbooks are recommended. Activate one to start tracking your progress.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {unsnoozedTriggered.slice(0,3).map(pb=>{
              const sc=SCENARIO_CFG[pb.scenario]||SCENARIO_CFG["Onboarding"];
              const pc=getPriorityConfig(pb.priority);
              return (
                <div key={pb.id} style={{background:sc.bg,border:`1.5px solid ${sc.color}33`,
                  borderRadius:"var(--r)",padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:16}}>{sc.abbr||""}</span>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:sc.color}}>{pb.name}</div>
                        <div style={{fontSize:11,color:"var(--text2)",marginTop:2}}>{pb.trigger}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
                      <button onClick={()=>snoozesuggestion(pb.id)}
                        title="Dismiss"
                        style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",
                          fontSize:14,padding:"0 2px",lineHeight:1}}>×</button>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"var(--text2)",marginBottom:10,lineHeight:1.5}}>
                    {pb.summary.slice(0,120)}…
                  </div>
                  <Btn onClick={()=>activatePlaybook(pb)} style={{width:"100%",padding:"8px",fontSize:12}}>
                    Activate — {pb.steps.length} steps
                  </Btn>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Healthy account — no triggers */}
      {unsnoozedTriggered.length===0&&(
        <div style={{background:"var(--emerald-dim)",border:"1.5px solid rgba(5,150,105,0.2)",
          borderRadius:"var(--r-lg)",padding:"20px 18px",marginBottom:16,textAlign:"center"}}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Ic n="success" size={36} color="var(--emerald)"/></div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--emerald)",marginBottom:6}}>
            This account looks healthy
          </div>
          <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
            No playbooks are currently triggered based on this account's signals. Keep up the great work — or browse the library to run a proactive play.
          </div>
        </div>
      )}

      <button onClick={()=>setShowLibrary(true)}
        style={{width:"100%",background:"transparent",color:"var(--indigo)",
          border:"1.5px dashed var(--border2)",borderRadius:"var(--r)",padding:"12px",
          fontFamily:"var(--font-mono)",fontSize:12,cursor:"pointer"}}>
        Browse all {PLAYBOOK_LIBRARY.length} playbooks →
      </button>
    </div>
  );
};

// ─── Stakeholder guide ────────────────────────────────────────────────────────
const SGuide = ({ role }) => {
  const g=STAKEHOLDER_GUIDE[role]; if(!g) return null;
  return (
    <div style={{background:g.bg,border:`1.5px solid ${g.color}33`,borderRadius:"var(--r-lg)",padding:18,marginTop:14,animation:"fadeUp .2s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{fontSize:20}}><span style={{width:28,height:28,borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,background:g.color,color:"white",flexShrink:0}}>{g.mark}</span></span>
        <span style={{fontWeight:700,fontSize:14,color:g.color}}>{g.headline}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {g.tactics.map((t,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:g.color,background:"white",
              width:20,height:20,borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0,fontWeight:700,boxShadow:"var(--shadow-sm)",marginTop:1}}>{i+1}</span>
            <span style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"flex-start",background:"rgba(255,255,255,.65)",borderRadius:"var(--r)",padding:"10px 12px"}}>
        <Ic n="alert" size={14} color="var(--amber)" style={{flexShrink:0}}/>
        <span style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{g.warning}</span>
      </div>
    </div>
  );
};

// ─── Stakeholder modal ────────────────────────────────────────────────────────
const StakeholderModal = ({ account, onClose, onUpdate, toast }) => {
  const [list,    setList]    = useState(account.stakeholders);
  const [sel,     setSel]     = useState(null);
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState(null); // id of stakeholder being edited
  const [form,    setForm]    = useState({name:"",title:"",email:"",role:"Neutral",sentiment:"Neutral",lastTouch:todayStr()});

  const commit = upd => { setList(upd); onUpdate(account.id,{stakeholders:upd}); };

  const add = () => {
    if(!form.name) return;
    commit([...list,{id:Date.now(),...form}]);
    toast("Stakeholder added","success");
    setAdding(false);
    setForm({name:"",title:"",email:"",role:"Neutral",sentiment:"Neutral",lastTouch:todayStr()});
  };

  const startEdit = (s) => {
    setEditing(s.id);
    setAdding(false);
    setSel(null);
    setForm({ name:s.name, title:s.title||"", email:s.email||"", role:s.role||"Neutral", sentiment:s.sentiment||"Neutral", lastTouch:s.lastTouch||todayStr() });
  };

  const saveEdit = () => {
    if (!form.name) return;
    commit(list.map(s => s.id===editing ? {...s,...form} : s));
    toast("Stakeholder updated","success");
    setEditing(null);
    setForm({name:"",title:"",email:"",role:"Neutral",sentiment:"Neutral",lastTouch:todayStr()});
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({name:"",title:"",email:"",role:"Neutral",sentiment:"Neutral",lastTouch:todayStr()});
  };

  const remove = id => { commit(list.filter(s=>s.id!==id)); if(sel===id)setSel(null); toast("Stakeholder removed","info"); };
  const silent = list.filter(s=>s.role==="Champion"&&ago(s.lastTouch)>30);
  const selStk = list.find(s=>s.id===sel);

  const StakeholderForm = ({ onSave, onCancel, saveLabel }) => (
    <div style={{background:"var(--bg3)",border:"1.5px solid var(--border2)",borderRadius:"var(--r-lg)",padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <Fld label="Full Name"><Inp value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Sara Al-Mansoori"/></Fld>
        <Fld label="Title"><Inp value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="VP Operations"/></Fld>
        <Fld label="Email"><Inp type="email" value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="sara@company.com"/></Fld>
        <Fld label="Role"><Slct value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{["Champion","Neutral","Detractor","Blocker"].map(r=><option key={r}>{r}</option>)}</Slct></Fld>
        <Fld label="Sentiment"><Slct value={form.sentiment} onChange={e=>setForm(f=>({...f,sentiment:e.target.value}))}>{["Positive","Neutral","Negative"].map(s=><option key={s}>{s}</option>)}</Slct></Fld>
      </div>
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <Btn onClick={onSave} style={{flex:1}}>{saveLabel}</Btn>
        <Btn variant="ghost" onClick={onCancel} style={{flex:1}}>Cancel</Btn>
      </div>
    </div>
  );

  return (
    <Modal title={`Stakeholder Map — ${account.name}`} onClose={onClose} wide>
      {silent.length>0&&(
        <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.2)",borderRadius:"var(--r)",
          padding:"12px 16px",marginBottom:20,display:"flex",gap:10}}>
          <Ic n="alert" size={16} color="var(--rose)"/>
          <div style={{fontSize:13,color:"var(--rose)"}}>
            <strong>Silent Champion alert:</strong> {silent.map(s=>s.name).join(", ")} — no contact in 30+ days.
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {list.length===0&&!adding&&(
              <div style={{textAlign:"center",padding:"32px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:12}}>No stakeholders yet</div>
            )}
            {list.map(s=>{
              const rc=ROLE_CFG[s.role]||ROLE_CFG.Neutral;
              const active=sel===s.id, isSilent=s.role==="Champion"&&ago(s.lastTouch)>30;

              // Show inline edit form for this stakeholder
              if (editing===s.id) {
                return (
                  <div key={s.id}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--indigo)",marginBottom:6}}>
                      Editing {s.name}
                    </div>
                    <StakeholderForm onSave={saveEdit} onCancel={cancelEdit} saveLabel="Save changes"/>
                  </div>
                );
              }

              return (
                <div key={s.id} onClick={()=>setSel(active?null:s.id)}
                  style={{background:active?rc.bg:"var(--bg3)",
                    border:`1.5px solid ${isSilent?"var(--rose)":active?rc.color+"44":"var(--border)"}`,
                    borderRadius:"var(--r)",padding:"14px 16px",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{s.name}</div>
                      <div style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>{s.title}</div>
                      {s.email&&(
                        <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,
                          fontFamily:"var(--font-mono)"}}>{s.email}</div>
                      )}
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <Badge label={s.role} color={rc.color} bg={rc.bg}/>
                        <Badge label={`${sentIcon(s.sentiment)} ${s.sentiment}`} color="var(--text2)" bg="var(--bg4)"/>
                        <Badge label={`${ago(s.lastTouch)}d ago`} color={ago(s.lastTouch)>30?"var(--rose)":"var(--text3)"} bg="var(--bg4)"/>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>startEdit(s)}
                        style={{background:"var(--indigo)",border:"none",cursor:"pointer",
                          padding:"4px 10px",borderRadius:"var(--r-xs)",fontSize:11,fontWeight:700,
                          color:"white",fontFamily:"var(--font-display)"}}>
                        Edit
                      </button>
                      <button onClick={()=>remove(s.id)}
                        style={{background:"var(--rose)",border:"none",cursor:"pointer",
                          padding:"4px 10px",borderRadius:"var(--r-xs)",fontSize:11,fontWeight:700,
                          color:"white",fontFamily:"var(--font-display)"}}>
                        Del
                      </button>
                    </div>
                  </div>
                  {active&&<SGuide role={s.role}/>}
                </div>
              );
            })}
          </div>

          {/* Add form */}
          {adding&&!editing?(
            <StakeholderForm onSave={add} onCancel={()=>setAdding(false)} saveLabel="Add Contact"/>
          ):(!editing&&(
            <button onClick={()=>{setAdding(true);setSel(null);}}
              style={{width:"100%",background:"transparent",color:"var(--indigo)",border:"1.5px dashed var(--border2)",
                borderRadius:"var(--r)",padding:"11px",fontFamily:"var(--font-mono)",fontSize:13,cursor:"pointer"}}>
              + Add Stakeholder
            </button>
          ))}
        </div>
        <div>
          {selStk?(
            <div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{selStk.name}</div>
              <div style={{fontSize:13,color:"var(--text2)",marginBottom:2}}>{selStk.title}</div>
              {selStk.email&&(
                <div style={{fontSize:12,color:"var(--text3)",marginBottom:8,fontFamily:"var(--font-mono)"}}>{selStk.email}</div>
              )}
              <SGuide role={selStk.role}/>
            </div>
          ):(
            <div style={{background:"var(--bg3)",borderRadius:"var(--r-lg)",padding:20}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Stakeholder Playbooks</div>
              <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:20}}>
                Click any contact to see tailored tactics.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {Object.entries(STAKEHOLDER_GUIDE).map(([role,g])=>(
                  <div key={role} style={{display:"flex",gap:12,alignItems:"center",background:"white",borderRadius:"var(--r)",padding:"12px 14px",boxShadow:"var(--shadow-sm)"}}>
                    <span style={{width:28,height:28,borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,background:g.color,color:"white",flexShrink:0}}>{g.mark}</span>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:g.color}}>{role}</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:1}}>{g.tactics.length} tactics</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ─── Account form ─────────────────────────────────────────────────────────────
const AccountForm = ({ onClose, onSave, existing, toast }) => {
  const init = existing
    ? { name:existing.name, industry:existing.industry, plan:existing.plan, arr:existing.arr,
        renewalDate:existing.renewalDate, nps:existing.nps, ces:existing.ces,
        productUsage:existing.productUsage, openTickets:existing.openTickets,
        notes:existing.notes, nextAction:existing.nextAction||"", domain:existing.domain||"" }
    : { name:"",industry:"",plan:"Starter",arr:"",renewalDate:"",nps:"",ces:"",productUsage:"",openTickets:"",notes:"",nextAction:"",domain:"" };
  const [f,setF] = useState(init);
  const s = k => e => setF(p=>({...p,[k]:e.target.value}));
  const preview = calcHealth({ nps:parseInt(f.nps)||50, ces:parseFloat(f.ces)||3.5, productUsage:parseInt(f.productUsage)||60, openTickets:parseInt(f.openTickets)||0 });
  const sc = STAGE_CFG[preview.stage]||STAGE_CFG["Stable"];

  const submit = () => {
    if(!f.name.trim()) { toast("Company name is required","error"); return; }
    const ces=parseFloat(f.ces)||3.5, nps=parseInt(f.nps)||50, usage=parseInt(f.productUsage)||60, tickets=parseInt(f.openTickets)||0;
    const { total, stage } = calcHealth({ nps, ces, productUsage:usage, openTickets:tickets });
    if(existing) {
      const hist = ces!==existing.ces ? [...existing.cesHistory,{date:todayStr(),value:ces}] : existing.cesHistory;
      onSave({...existing,...f,arr:parseInt(f.arr)||0,nps,ces,productUsage:usage,openTickets:tickets,cesHistory:hist,healthScore:total,churnRisk:100-total,stage});
      toast("Account updated","success");
    } else {
      onSave({id:Date.now(),...f,arr:parseInt(f.arr)||0,nps,ces,cesHistory:[{date:todayStr(),value:ces}],
        productUsage:usage,openTickets:tickets,healthScore:total,churnRisk:100-total,stage,
        lastContact:todayStr(),archived:false,stakeholders:[],activityLog:[],
        successPlan:{goal:"",milestones:[]},activePlaybookId:null,activePlaybookSteps:{},snoozedPlaybooks:[],prepNotes:""});
      toast("Account added","success");
    }
    onClose();
  };

  return (
    <Modal title={existing?`Edit — ${existing.name}`:"Add New Account"} onClose={onClose}>
      <div style={{background:"var(--bg3)",border:`1.5px solid ${sc.border}`,borderRadius:"var(--r)",
        padding:"12px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:"var(--text2)",fontWeight:500}}>Live health preview</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:20,color:hColor(preview.total)}}>{preview.total}</span>
          <Badge label={preview.stage} color={sc.color} bg={sc.bg}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <div style={{gridColumn:"1/-1"}}><Fld label="Company Name"><Inp value={f.name} onChange={s("name")} placeholder="e.g. Noon E-Commerce"/></Fld></div>
        <Fld label="Industry"><Inp value={f.industry} onChange={s("industry")} placeholder="E-Commerce"/></Fld>
        <Fld label="Plan"><Slct value={f.plan} onChange={s("plan")}>{["Starter","Growth","Enterprise"].map(p=><option key={p}>{p}</option>)}</Slct></Fld>
        <Fld label="ARR ($)"><Inp type="number" value={f.arr} onChange={s("arr")} placeholder="84000"/></Fld>
        <Fld label="Renewal Date"><Inp type="date" value={f.renewalDate} onChange={s("renewalDate")}/></Fld>
        <Fld label="NPS (0–100)"><Inp type="number" value={f.nps} onChange={s("nps")} placeholder="65"/></Fld>
        <Fld label="CES (1–5)"><Inp type="number" step=".1" value={f.ces} onChange={s("ces")} placeholder="3.8"/></Fld>
        <Fld label="Product Usage (%)"><Inp type="number" value={f.productUsage} onChange={s("productUsage")} placeholder="75"/></Fld>
        <Fld label="Open Tickets"><Inp type="number" value={f.openTickets} onChange={s("openTickets")} placeholder="2"/></Fld>
        <div style={{gridColumn:"1/-1"}}><Fld label="Company Domain (e.g. acme.com — used for Gmail thread matching)"><Inp value={f.domain} onChange={s("domain")} placeholder="acme.com"/></Fld></div>
        <div style={{gridColumn:"1/-1"}}><Fld label="Next Action"><Inp value={f.nextAction} onChange={s("nextAction")} placeholder="e.g. Send renewal proposal to Sara by Jan 15"/></Fld></div>
        <div style={{gridColumn:"1/-1"}}>
          <Fld label="Notes">
            <textarea value={f.notes} onChange={s("notes")} placeholder="Key context, risks, opportunities..."
              style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",fontSize:14,
                outline:"none",resize:"vertical",minHeight:80}}/>
          </Fld>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={submit} style={{flex:1}}>{existing?"Save Changes":"Add Account"}</Btn>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
      </div>
    </Modal>
  );
};

// ─── Log CES ──────────────────────────────────────────────────────────────────
const LogCES = ({ account, onClose, onUpdate, toast }) => {
  const [val,setVal] = useState("");
  const [dt,setDt]   = useState(todayStr());
  const submit = () => {
    const ces=parseFloat(val);
    if(!ces||ces<1||ces>5) { toast("CES must be between 1 and 5","error"); return; }
    const hist=[...account.cesHistory,{date:dt,value:ces}];
    const {total,stage}=calcHealth({...account,ces});
    onUpdate(account.id,{ces,cesHistory:hist,healthScore:total,churnRisk:100-total,stage});
    toast("CES reading logged","success");
    onClose();
  };
  return (
    <Modal title={`Log CES — ${account.name}`} onClose={onClose}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:16}}>
          Add a new Customer Effort Score reading. Updates the trend line and health score automatically.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Fld label="CES Score (1–5)"><Inp type="number" step=".1" min="1" max="5" value={val} onChange={e=>setVal(e.target.value)} placeholder="3.8"/></Fld>
          <Fld label="Date"><Inp type="date" value={dt} onChange={e=>setDt(e.target.value)}/></Fld>
        </div>
        <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",marginTop:4}}>
          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>CES Reference</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {[["1–2","High Friction","var(--rose)"],["2.5–3.4","Moderate","var(--amber)"],["3.5–5","Low Effort","var(--emerald)"]].map(([r,l,c])=>(
              <div key={r} style={{textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-mono)",fontWeight:700,color:c,fontSize:13}}>{r}</div>
                <div style={{color:"var(--text3)",fontSize:11,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={submit} style={{flex:1}}>Log CES</Btn>
        <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
      </div>
    </Modal>
  );
};


// ─── Call / Meeting Prep Sheet ────────────────────────────────────────────────
const CallPrepModal = ({ account, onClose, onSaveNotes, toast, call }) => {
  const [notes,     setNotes]     = useState(account.prepNotes||"");
  const [copied,    setCopied]    = useState(false);
  const [aiBrief,   setAiBrief]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const sc           = STAGE_CFG[account.stage]||STAGE_CFG["Stable"];
  const days         = ago(account.lastContact);
  const rdays        = until(account.renewalDate);
  const cesTrend     = account.cesHistory.length>1
    ? account.cesHistory.at(-1).value - account.cesHistory.at(-2).value : 0;
  const activePb     = account.activePlaybookId
    ? PLAYBOOK_LIBRARY.find(p=>p.id===account.activePlaybookId) : null;
  const activeSteps  = activePb ? activePb.steps : [];
  const nextStep     = activePb
    ? activeSteps.find(s=>!(account.activePlaybookSteps||{})[s.id]) : null;
  const pendingMs    = account.successPlan.milestones.filter(m=>!m.done);
  const lastActivity = account.activityLog?.[0] || null;
  const stakeholders = account.stakeholders||[];
  const contactLabel = days===0 ? "Today" : `${days}d ago`;

  const save = () => {
    onSaveNotes(account.id, notes);
    toast("Meeting notes saved","success");
    onClose();
  };

  const generateAiBrief = async () => {
    if (!call) return;
    setAiLoading(true);
    try {
      const data = await call("POST", `/api/ai/brief/${account.id}`);
      setAiBrief(data.brief);
    } catch (e) {
      toast(e.status === 402 ? "Add your AI key in Settings → AI to use this feature" : "Failed to generate brief", "error");
    } finally { setAiLoading(false); }
  };

  const copyBrief = () => {
    const lines = [
      `CALL PREP — ${account.name}`,
      `Date: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}`,
      ``,
      `ACCOUNT SNAPSHOT`,
      `Health: ${account.healthScore??'—'}/100  Stage: ${account.stage}  Churn Risk: ${account.churnRisk??'—'}%`,
      `ARR: ${fmtMoney(account.arr)}  Plan: ${account.plan}  CES: ${(account.ces??3.5).toFixed(1)}/5`,
      `Renewal: ${account.renewalDate ? `${rdays > 0 ? rdays+"d away" : "Overdue"} (${account.renewalDate})` : "—"}`,
      ``,
      `LAST TOUCHPOINT`,
      lastActivity
        ? `${lastActivity.type} on ${lastActivity.date}: ${lastActivity.note}`
        : "No activity logged yet",
      `Last contact: ${contactLabel}  Open tickets: ${account.openTickets}`,
      ``,
      `STAKEHOLDERS`,
      stakeholders.length > 0
        ? stakeholders.map(s=>`${s.name} (${s.title}) — ${s.role} — ${s.sentiment}`).join("\n")
        : "No stakeholders mapped",
      ``,
      `ACTIVE PLAYBOOK`,
      activePb
        ? `${activePb.name}\nNext step: ${nextStep ? `${nextStep.title} (${nextStep.timeline})` : "All steps complete"}`
        : "No active playbook",
      ``,
      `NEXT MILESTONE`,
      pendingMs.length > 0 ? pendingMs[0].text : "All milestones complete",
      ``,
      `MEETING NOTES`,
      notes || "(blank)",
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false), 2200);
    });
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:700,
        maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>

        {/* Header */}
        <div style={{padding:"20px 28px",borderBottom:"1px solid var(--border)",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Avatar name={account.name} size={40}/>
            <div>
              <div style={{fontWeight:800,fontSize:17,letterSpacing:"-.02em"}}>{account.name}</div>
              <div style={{fontSize:12,color:"var(--text3)",marginTop:3,display:"flex",alignItems:"center",gap:6}}>
                <Ic n="prep" size={12} color="var(--text3)"/>
                Pre-call brief · {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={copyBrief}
              style={{display:"flex",alignItems:"center",gap:7,
                background:copied?"var(--emerald)":"var(--indigo)",color:"white",border:"none",
                borderRadius:"var(--r)",padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer",
                fontFamily:"var(--font-display)",transition:"background .2s",
                boxShadow:copied?"0 2px 8px rgba(5,150,105,0.3)":"0 2px 8px var(--indigo-glow)"}}>
              <Ic n={copied?"check":"copy"} size={13} color="white"/>
              {copied?"Copied":"Copy brief"}
            </button>
            <button onClick={onClose} className="icon-btn"
              style={{background:"var(--bg3)",border:"none",width:34,height:34,
                borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",
                justifyContent:"center",cursor:"pointer"}}>
              <Ic n="close" size={14} color="var(--text2)"/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{overflow:"auto",flex:1,padding:"24px 28px",display:"flex",flexDirection:"column",gap:14}}>

          {/* Health snapshot strip */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {[
              {label:"Health",    value:account.healthScore??'—', unit:"/100", color:hColor(account.healthScore??50)},
              {label:"Churn Risk",value:`${account.churnRisk??50}%`, unit:"", color:(account.churnRisk??50)>=60?"var(--rose)":(account.churnRisk??50)>=35?"var(--amber)":"var(--emerald)"},
              {label:"CES",       value:(account.ces??3.5).toFixed(1), unit:"/5", color:(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"},
              {label:"Tickets",   value:account.openTickets, unit:" open", color:account.openTickets>4?"var(--rose)":"var(--text)"},
              {label:"Renewal",   value:rdays>0?`${rdays}d`:"Overdue", unit:"", color:rdays<=30&&rdays>0?"var(--rose)":rdays<=60&&rdays>0?"var(--amber)":"var(--text3)"},
            ].map(m=>(
              <div key={m.label} style={{background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:17,color:m.color,lineHeight:1}}>
                  {m.value}<span style={{fontSize:10,color:"var(--text3)",fontWeight:400}}>{m.unit}</span>
                </div>
                <div style={{fontSize:10,color:"var(--text3)",fontWeight:600,textTransform:"uppercase",
                  letterSpacing:".07em",marginTop:4}}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* 2-col grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

            {/* Last touchpoint */}
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Last Touchpoint</div>
              {lastActivity ? (
                <>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:600,
                      color:ACT_COLORS[lastActivity.type]||"var(--text2)",
                      background:"var(--bg4)",padding:"2px 8px",borderRadius:"var(--r-xs)"}}>
                      {lastActivity.type}
                    </span>
                    <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{lastActivity.date}</span>
                  </div>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{lastActivity.note}</div>
                </>
              ):(
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>No activity logged yet</div>
              )}
              <div style={{marginTop:10,fontSize:11,fontWeight:500,
                color:days>30?"var(--rose)":days>14?"var(--amber)":"var(--text3)"}}>
                Last contact: {contactLabel}
              </div>
            </div>

            {/* Stakeholders */}
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Stakeholders</div>
              {stakeholders.length===0 ? (
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>No stakeholders mapped yet</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {stakeholders.map(s=>{
                    const rc=ROLE_CFG[s.role]||ROLE_CFG.Neutral;
                    return (
                      <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:26,height:26,borderRadius:"var(--r-sm)",
                            background:`hsl(${hue(s.name)},55%,91%)`,display:"flex",
                            alignItems:"center",justifyContent:"center",
                            fontSize:10,fontWeight:700,color:`hsl(${hue(s.name)},45%,32%)`}}>
                            {initials(s.name)}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                            <div style={{fontSize:11,color:"var(--text3)"}}>{s.title}</div>
                          </div>
                        </div>
                        <Badge label={s.role} color={rc.color} bg={rc.bg} small/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active playbook step */}
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Active Playbook</div>
              {activePb ? (
                <>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--indigo)",marginBottom:8}}>{activePb.name}</div>
                  {nextStep ? (
                    <div style={{background:"var(--indigo-dim)",borderRadius:"var(--r)",padding:"10px 12px"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"var(--indigo)",
                        textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>
                        Next · {nextStep.timeline}
                      </div>
                      <div style={{fontSize:13,color:"var(--text)",fontWeight:600,marginBottom:4}}>{nextStep.title}</div>
                      <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{nextStep.action}</div>
                    </div>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:6,color:"var(--emerald)",fontSize:13,fontWeight:600}}>
                      <Ic n="check" size={14} color="var(--emerald)"/>All steps complete
                    </div>
                  )}
                </>
              ):(
                <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>No active playbook</div>
              )}
            </div>

            {/* Next milestone */}
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Success Plan</div>
              {account.successPlan.goal&&(
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:10,lineHeight:1.5,
                  background:"var(--bg4)",borderRadius:"var(--r-xs)",padding:"7px 10px"}}>
                  {account.successPlan.goal}
                </div>
              )}
              {pendingMs.length>0 ? (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {pendingMs.slice(0,3).map((m,i)=>(
                    <div key={m.id} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      {i===0&&<span style={{fontSize:10,fontWeight:600,color:"var(--indigo)",
                        background:"var(--indigo-dim)",padding:"1px 6px",
                        borderRadius:"var(--r-xs)",flexShrink:0,marginTop:2}}>Next</span>}
                      <span style={{fontSize:13,color:i===0?"var(--text)":"var(--text3)"}}>{m.text}</span>
                    </div>
                  ))}
                  {pendingMs.length>3&&(
                    <div style={{fontSize:11,color:"var(--text3)"}}>+{pendingMs.length-3} more pending</div>
                  )}
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:6,
                  color:account.successPlan.milestones.length>0?"var(--emerald)":"var(--text3)",
                  fontSize:13,fontWeight:account.successPlan.milestones.length>0?600:400}}>
                  {account.successPlan.milestones.length>0&&<Ic n="check" size={14} color="var(--emerald)"/>}
                  {account.successPlan.milestones.length>0?"All milestones complete":"No milestones added yet"}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{height:1,background:"var(--border)"}}/>

          {/* CES / NPS / ARR summary row */}
          <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>CES Trend</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Sparkline data={account.cesHistory}
                    color={(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"}/>
                  <span style={{fontSize:14,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,
                    color:(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"}}>
                    {(account.ces??3.5).toFixed(1)}
                  </span>
                  <span style={{fontSize:12,color:cesTrend>0?"var(--emerald)":cesTrend<0?"var(--rose)":"var(--text3)"}}>
                    {cesTrend>0?"↑ Improving":cesTrend<0?"↓ Declining":"→ Flat"}
                  </span>
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>NPS</div>
                <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:22,
                  color:account.nps>=50?"var(--emerald)":account.nps>=30?"var(--amber)":"var(--rose)"}}>
                  {account.nps}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>ARR</div>
                <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:22,color:"var(--indigo)"}}>
                  {fmtMoney(account.arr)}
                </div>
              </div>
            </div>
          </div>

          {/* AI Brief */}
          <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:aiBrief?14:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em"}}>AI Brief</div>
                <span style={{fontSize:10,background:"var(--indigo-dim)",color:"var(--indigo)",padding:"1px 7px",borderRadius:99,fontWeight:600}}>Beta</span>
              </div>
              <button onClick={generateAiBrief} disabled={aiLoading}
                style={{display:"flex",alignItems:"center",gap:6,background:"var(--indigo)",color:"white",
                  border:"none",borderRadius:"var(--r)",padding:"6px 14px",fontSize:12,fontWeight:600,
                  cursor:aiLoading?"not-allowed":"pointer",opacity:aiLoading?0.7:1,transition:"opacity .15s"}}>
                {aiLoading
                  ? <><div style={{width:11,height:11,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Generating…</>
                  : <>{aiBrief ? "Regenerate" : "Generate with AI"}</>}
              </button>
            </div>
            {aiBrief && (
              <div style={{fontSize:13,color:"var(--text)",lineHeight:1.75,whiteSpace:"pre-wrap",
                fontFamily:"var(--font-display)"}}>
                {aiBrief.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1
                    ? <strong key={i} style={{color:"var(--text)",display:"block",marginTop:i>1?12:0,marginBottom:4}}>{part}</strong>
                    : <span key={i}>{part}</span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
              textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
              Meeting Notes
            </div>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Key topics to cover. Questions to ask. Things to avoid. Context to remember..."
              style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"12px 14px",color:"var(--text)",
                fontFamily:"var(--font-display)",fontSize:13,outline:"none",
                resize:"vertical",minHeight:90,lineHeight:1.7,transition:"border-color .15s,box-shadow .15s"}}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"14px 28px",borderTop:"1px solid var(--border)",
          display:"flex",justifyContent:"flex-end",alignItems:"center",
          gap:10,flexShrink:0,background:"var(--bg2)"}}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn onClick={save} style={{padding:"10px 24px"}}>Save notes</Btn>
        </div>
      </div>
    </div>
  );
};

const AccountTasksTab = ({ account, accounts, manualTasks, onAddManual, onToggleManual, onDeleteManual }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask]   = useState({ title:"", description:"", priority:"High", dueDate:todayStr() });

  const autoTasks   = generateAutoTasks([account]);
  const manualForAc = manualTasks.filter(t=>t.accountId===account.id);
  const allTasks    = [...autoTasks, ...manualForAc.filter(mt=>!autoTasks.find(at=>at.id===mt.id))];

  const submit = () => {
    if (!newTask.title.trim()) return;
    onAddManual({ id:`manual-${Date.now()}`, type:"manual", priority:newTask.priority,
      auto:false, done:false, accountId:account.id, accountName:account.name,
      title:newTask.title, description:newTask.description, dueDate:newTask.dueDate });
    setNewTask({ title:"", description:"", priority:"High", dueDate:todayStr() });
    setShowForm(false);
  };

  if (!allTasks.length && !showForm) return (
    <div>
      <div style={{background:"var(--emerald-dim)",border:"1.5px solid rgba(5,150,105,0.2)",
        borderRadius:"var(--r)",padding:"18px",textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:24,marginBottom:8}}>✅</div>
        <div style={{fontWeight:700,fontSize:13,color:"var(--emerald)",marginBottom:4}}>No tasks for this account</div>
        <div style={{fontSize:12,color:"var(--text2)"}}>All signals are healthy. Add a manual task below if needed.</div>
      </div>
      <button onClick={()=>setShowForm(true)}
        style={{width:"100%",background:"transparent",color:"var(--indigo)",border:"1.5px dashed var(--border2)",
          borderRadius:"var(--r)",padding:"11px",fontFamily:"var(--font-mono)",fontSize:12,cursor:"pointer"}}>
        + Add manual task
      </button>
    </div>
  );

  return (
    <div>
      {allTasks.map(task=>{
        const tc=TASK_TYPE_CFG[task.type]||TASK_TYPE_CFG.manual;
        const pc=getPriorityConfig(task.priority);
        const isManual=!task.auto;
        return (
          <div key={task.id} style={{background:"var(--bg3)",border:`1.5px solid ${task.priority==="Critical"?"rgba(225,29,72,0.2)":"var(--border)"}`,
            borderRadius:"var(--r)",padding:"12px 14px",marginBottom:8,opacity:task.done?0.55:1}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              {isManual
                ? <input type="checkbox" checked={!!task.done} onChange={()=>onToggleManual(task.id)}
                    style={{width:15,height:15,marginTop:2,accentColor:"var(--emerald)",cursor:"pointer",flexShrink:0}}/>
                : <div style={{width:15,height:15,marginTop:2,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",
                      background:task.priority==="Critical"?"var(--rose)":task.priority==="High"?"var(--amber)":"var(--indigo)"}}/>
                  </div>
              }
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:4,
                  textDecoration:task.done?"line-through":"none",color:task.done?"var(--text3)":"var(--text)"}}>
                  {task.title}
                </div>
                {task.description&&(
                  <div style={{fontSize:12,color:"var(--text2)",marginBottom:6,lineHeight:1.5}}>{task.description}</div>
                )}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:tc.color,
                    background:tc.bg,padding:"1px 7px",borderRadius:99}}>{tc.icon} {tc.label}</span>
                  <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
                    {task.dueDate===todayStr()?"Today":task.dueDate<todayStr()?`Overdue`:`In ${Math.ceil((new Date(task.dueDate)-new Date())/86400000)}d`}
                  </span>
                </div>
              </div>
              {isManual&&(
                <button onClick={()=>onDeleteManual(task.id)}
                  style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:14,flexShrink:0}}>✕</button>
              )}
            </div>
          </div>
        );
      })}

      {showForm?(
        <div style={{background:"var(--bg3)",border:"1.5px solid var(--border2)",borderRadius:"var(--r-lg)",padding:16,marginTop:8}}>
          <Fld label="Title"><Inp value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))}
            placeholder="e.g. Send renewal proposal" onKeyDown={e=>e.key==="Enter"&&submit()}/></Fld>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
            <Fld label="Priority">
              <Slct value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))}>
                {["Critical","High","Medium"].map(p=><option key={p}>{p}</option>)}
              </Slct>
            </Fld>
            <Fld label="Due Date">
              <Inp type="date" value={newTask.dueDate} onChange={e=>setNewTask(p=>({...p,dueDate:e.target.value}))}/>
            </Fld>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={submit} style={{flex:1,padding:"8px"}}>Add</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)} style={{flex:1,padding:"8px"}}>Cancel</Btn>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowForm(true)}
          style={{width:"100%",marginTop:8,background:"transparent",color:"var(--indigo)",
            border:"1.5px dashed var(--border2)",borderRadius:"var(--r)",padding:"10px",
            fontFamily:"var(--font-mono)",fontSize:12,cursor:"pointer"}}>
          + Add manual task
        </button>
      )}
    </div>
  );
};

// ─── Churn modal ─────────────────────────────────────────────────────────────
const CHURN_REASONS = [
  "Contract ended — not renewed",
  "Budget cut / downsizing",
  "Chose a competitor",
  "Product not the right fit",
  "Merger / acquisition",
  "Company shut down",
  "Low adoption / no value realised",
  "Other",
];

const ChurnModal = ({ account, call, toast, onClose, onChurned }) => {
  const [reason,     setReason]     = useState("");
  const [notes,      setNotes]      = useState("");
  const [churnedAt,  setChurnedAt]  = useState(new Date().toISOString().split("T")[0]);
  const [saving,     setSaving]     = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSaving(true);
    // Try to log churn event — best effort, don't block archive if it fails
    if (call) {
      try {
        await call("POST", `/api/accounts/${account.id}/churn`, { reason, notes, churnedAt });
      } catch {
        // Log failed — account still archived via onChurned
      }
    }
    toast(`${account.name} archived`, "success");
    onChurned();
    setSaving(false);
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:480,
        padding:28,boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:38,height:38,borderRadius:"var(--r)",background:"var(--rose-dim)",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Ic n="archive" size={18} color="var(--rose)"/>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>Archive Account</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{account.name} · {fmtMoney(account.arr)} ARR</div>
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Churn reason *</div>
          <select value={reason} onChange={e=>setReason(e.target.value)}
            style={{width:"100%",padding:"9px 12px",borderRadius:"var(--r)",border:`1.5px solid ${reason?"var(--border)":"rgba(225,29,72,0.4)"}`,
              background:"var(--bg3)",color:reason?"var(--text)":"var(--text3)",fontSize:13,fontFamily:"var(--font-display)"}}>
            <option value="">Select a reason…</option>
            {CHURN_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Churn date</div>
          <input type="date" value={churnedAt} onChange={e=>setChurnedAt(e.target.value)}
            style={{width:"100%",padding:"9px 12px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
              background:"var(--bg3)",color:"var(--text)",fontSize:13,fontFamily:"var(--font-mono)"}}/>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Notes (optional)</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder="What happened? Lessons learned for future accounts…"
            style={{width:"100%",padding:"9px 12px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
              background:"var(--bg3)",color:"var(--text)",fontSize:13,resize:"vertical",minHeight:70,
              fontFamily:"var(--font-display)"}}/>
        </div>

        <div style={{display:"flex",gap:10}}>
          <button onClick={submit} disabled={!reason||saving}
            style={{flex:1,padding:"10px 0",borderRadius:"var(--r)",border:"none",
              background:reason?"var(--rose)":"var(--bg4)",color:reason?"white":"var(--text3)",
              fontSize:13,fontWeight:700,cursor:reason?"pointer":"not-allowed",
              opacity:saving?0.7:1}}>
            {saving?"Saving…":"Archive & Log Churn"}
          </button>
          <button onClick={onClose}
            style={{padding:"10px 18px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
              background:"none",color:"var(--text2)",fontSize:13,cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// PortalModal — CSM generates, configures, and shares the portal link
const PORTAL_TOGGLES = [
  { key: 'show_health',        label: 'Health score',        desc: 'NPS, CES, usage, tickets' },
  { key: 'show_churn_risk',    label: 'Account stability',   desc: 'Reframed churn risk — sensitive' },
  { key: 'show_onboarding',    label: 'Onboarding progress', desc: 'Phase track' },
  { key: 'show_tasks',         label: 'Customer tasks',      desc: 'Interactive — they can mark done' },
  { key: 'show_renewal',       label: 'Renewal date',        desc: 'Date + days remaining' },
  { key: 'show_survey',        label: 'Survey prompt',       desc: 'Shows if active survey exists' },
  { key: 'show_value_goals',   label: 'Value goals',         desc: 'Success definition from handover' },
  { key: 'show_feedback_loop', label: 'Feedback history',    desc: 'Past survey scores' },
];

const PortalModal = ({ account, call, toast, onClose }) => {
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const [link,    setLink]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    call('GET', `/api/portal/${account.id}`)
      .then(d => { setLink(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [account.id, call]);

  const generate = async () => {
    setSaving(true);
    try {
      const d = await call('POST', '/api/portal', { account_id: account.id });
      setLink(d); toast?.('Portal created', 'success');
    } catch { toast?.('Failed to create portal', 'error'); }
    setSaving(false);
  };

  const updateConfig = async (key, value) => {
    const newConfig = { ...link.config, [key]: value };
    setLink(l => ({ ...l, config: newConfig }));
    try { await call('PATCH', `/api/portal/${account.id}`, { config: newConfig }); }
    catch { toast?.('Failed to save', 'error'); }
  };

  const revoke = async () => {
    if (!window.confirm('Revoke portal? The customer link will stop working immediately.')) return;
    try {
      await call('DELETE', `/api/portal/${account.id}`);
      setLink(null); toast?.('Portal revoked', 'info');
    } catch { toast?.('Failed to revoke', 'error'); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${FRONTEND_URL}/portal/${link.token}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const DEFAULT_CONFIG = { show_health: true, show_churn_risk: false, show_onboarding: true, show_tasks: true, show_renewal: true, show_survey: true, show_value_goals: false, show_feedback_loop: false };
  const cfg = link ? { ...DEFAULT_CONFIG, ...link.config } : DEFAULT_CONFIG;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Customer Portal</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{account.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)', fontSize: 13 }}>Loading…</div>
          ) : !link ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Ic n="onboarding" size={32} color="var(--border2)" style={{ marginBottom: 12 }}/>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No portal yet</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>
                Generate a magic link to share a live dashboard with this customer.
              </div>
              <button onClick={generate} disabled={saving}
                style={{ background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: 'var(--r)', padding: '9px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                {saving ? 'Creating…' : 'Generate Portal Link'}
              </button>
            </div>
          ) : (
            <>
              {/* Link row */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Share Link</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {FRONTEND_URL}/portal/{link.token}
                  </div>
                  <button onClick={copyLink}
                    style={{ background: copied ? 'var(--emerald)' : 'var(--indigo)', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Visible Sections</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PORTAL_TOGGLES.map(t => (
                    <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{t.desc}</div>
                      </div>
                      <button onClick={() => updateConfig(t.key, !cfg[t.key])}
                        style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', transition: 'background .15s', background: cfg[t.key] ? 'var(--indigo)' : 'var(--border2)', position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: cfg[t.key] ? 21 : 3, transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revoke */}
              <button onClick={revoke}
                style={{ width: '100%', background: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 16px', color: 'var(--rose)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                Revoke Portal Access
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Detail panel ─────────────────────────────────────────────────────────────
const Detail = ({ account, onClose, onUpdate, onDelete, toast, call, closeoutMeeting, setCloseoutMeeting, initialTab="overview", manualTasks=[], onAddManual, onToggleManual, onDeleteManual }) => {
  const [showStk,      setShowStk]      = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDel,      setShowDel]      = useState(false);
  const [showChurn,    setShowChurn]    = useState(false);
  const [showCES,      setShowCES]      = useState(false);
  const [showPrep,     setShowPrep]     = useState(false);
  const [showPortal,   setShowPortal]   = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escReasonDraft, setEscReasonDraft] = useState("");
  const [escNotesDraft,  setEscNotesDraft]  = useState("");
  const [showExpand,   setShowExpand]   = useState(false);
  const [expDraft, setExpDraft] = useState({
    arr:   account.expansionArr   || 0,
    stage: account.expansionStage || "",
    notes: account.expansionNotes || "",
  });
  const [tab,setTab]             = useState(initialTab);
  const [logF,setLogF]           = useState({type:"Call",note:"",date:todayStr(),title:"",attendees:"",actionItems:""});
  const [digestEnabled,  setDigestEnabled]  = useState(false);
  const [digestId,       setDigestId]       = useState(null);
  const [digestFreq,     setDigestFreq]     = useState("monthly");
  const [digestToggling, setDigestToggling] = useState(false);

  useEffect(()=>{
    if (!call || !account.id) return;
    call("GET","/api/schedules/digests")
      .then(d=>{
        const found=(d?.schedules||[]).find(s=>s.account_id===account.id);
        if (found){ setDigestEnabled(found.enabled); setDigestId(found.id); setDigestFreq(found.frequency||"monthly"); }
      }).catch(()=>{});
  },[call, account.id]);
  const [newMs,setNewMs]         = useState("");
  const [editGoal,setEditGoal]   = useState(false);
  const [goalDraft,setGoalDraft] = useState(account.successPlan.goal);
  const [editAct,setEditAct]     = useState(false);
  const [actDraft,setActDraft]   = useState(account.nextAction||"");
  const [editCap,setEditCap]       = useState(false);
  const [seatsDraft,setSeatsDraft] = useState(account.licensedSeats ?? "");
  const [featDraft,setFeatDraft]   = useState(account.licensedFeatures ?? "");

  const sc=STAGE_CFG[account.stage]||STAGE_CFG["Stable"];
  const days=ago(account.lastContact);
  const rdays=until(account.renewalDate);
  const cesVals=account.cesHistory.map(d=>d.value);
  const cesTrend=cesVals.length>1?cesVals.at(-1)-cesVals.at(-2):0;
  const doneMs=account.successPlan.milestones.filter(m=>m.done).length;
  const totalMs=account.successPlan.milestones.length;
  const planPct=totalMs>0?Math.round((doneMs/totalMs)*100):0;
  const triggeredPbs=getTriggeredPlaybooks(account);

  const logActivity = async () => {
    if (logF.type === "Meeting") {
      if (!logF.title.trim() && !logF.note.trim()) return;
      try {
        const d = await call("POST", "/api/meetings/manual", {
          accountId:   account.id,
          title:       logF.title.trim() || "Meeting",
          meetingDate: logF.date,
          attendees:   logF.attendees,
          summary:     logF.note.trim() || null,
          actionItems: logF.actionItems.trim() || null,
        });
        setMeetingNotes(prev => [d.meeting, ...prev]);
        onUpdate(account.id, { lastContact: logF.date });
        toast("Meeting logged", "success");
        setLogF({ type:"Meeting", note:"", date:todayStr(), title:"", attendees:"", actionItems:"" });
      } catch { toast("Failed to save meeting","error"); }
    } else {
      if (!logF.note.trim()) return;
      onUpdate(account.id, { activityLog:[{id:Date.now(),...logF},...account.activityLog], lastContact:logF.date });
      toast("Activity logged","success");
      setLogF({ type:"Call", note:"", date:todayStr(), title:"", attendees:"", actionItems:"" });
    }
  };
  const toggleMs=id=>{
    const upd=account.successPlan.milestones.map(m=>m.id===id?{...m,done:!m.done}:m);
    onUpdate(account.id,{successPlan:{...account.successPlan,milestones:upd}});
    toast(upd.find(m=>m.id===id).done?"Milestone completed ✓":"Milestone re-opened","success");
  };
  const addMs=()=>{
    if(!newMs.trim()) return;
    onUpdate(account.id,{successPlan:{...account.successPlan,milestones:[...account.successPlan.milestones,{id:Date.now(),text:newMs.trim(),done:false}]}});
    toast("Milestone added","success"); setNewMs("");
  };
  const delMs=id=>onUpdate(account.id,{successPlan:{...account.successPlan,milestones:account.successPlan.milestones.filter(m=>m.id!==id)}});
  const saveGoal=()=>{ onUpdate(account.id,{successPlan:{...account.successPlan,goal:goalDraft}}); setEditGoal(false); toast("Goal saved","success"); };
  const saveAct=()=>{ onUpdate(account.id,{nextAction:actDraft}); setEditAct(false); toast("Next action saved","success"); };
  const saveCap=()=>{
    const toNum=v=>{const n=parseInt(v,10);return Number.isFinite(n)?n:null;};
    onUpdate(account.id,{licensedSeats:toNum(seatsDraft),licensedFeatures:toNum(featDraft)});
    setEditCap(false); toast("Capacity saved","success");
  };

  const toggleDigest = async () => {
    if (!call || digestToggling) return;
    setDigestToggling(true);
    try {
      if (digestId) {
        if (digestEnabled) {
          await call("DELETE", `/api/schedules/digests/${digestId}`);
          setDigestEnabled(false); setDigestId(null);
          toast("Health digest disabled","info");
        } else {
          await call("PATCH", `/api/schedules/digests/${digestId}`, { enabled: true });
          setDigestEnabled(true);
          toast("Health digest enabled","success");
        }
      } else {
        const d = await call("POST", "/api/schedules/digests", { account_id: account.id, frequency: digestFreq });
        setDigestId(d.schedule.id); setDigestEnabled(true);
        toast(`${digestFreq.charAt(0).toUpperCase()+digestFreq.slice(1)} health digest activated`,"success");
      }
    } catch { toast("Could not update digest settings","error"); }
    finally { setDigestToggling(false); }
  };

  const TABS = [
    {key:"activity",   label:"Activity"},
    {key:"onboarding", label:"Onboarding"},
    {key:"health",     label:"Health"},
    {key:"ai",         label:"Ask AI"},
    {key:"brief",      label:"Brief"},
    {key:"handoff",    label:"Catch-up"},
    {key:"tickets",    label:"Tickets"},
  ];
  const taskAlertCount = [...generateAutoTasks([account]),...(manualTasks||[]).filter(t=>t.accountId===account.id)].filter(t=>!t.done).length;
  const tabHasAlert = {
    activity:   taskAlertCount > 0 || days > 14,
    onboarding: false,
    health:     account.healthScore < 55 || (triggeredPbs.length > 0 && !account.activePlaybookId),
    ai:         false,
    brief:      false,
  };

  const [emailThreads,    setEmailThreads]    = useState([]);
  const [meetingNotes,    setMeetingNotes]    = useState([]);
  const [threadsLoading,  setThreadsLoading]  = useState(false);

  useEffect(() => {
    const h = e => {
      if (e.key !== "Escape") return;
      if (closeoutMeeting !== null) return; // m3d.1c: defer to CloseoutModal's own Escape handler
      onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, closeoutMeeting]);

  const [usageHistory,    setUsageHistory]    = useState([]);
  const [usageLatest,     setUsageLatest]     = useState(null);

  useEffect(() => {
    call("GET", `/api/accounts/${account.id}/usage-history`)
      .then(d => { setUsageHistory(d.history || []); setUsageLatest(d.latest || null); })
      .catch(() => {});
  }, [account.id]);

  useEffect(() => {
    if (tab !== "activity") return;
    let cancelled = false;
    setThreadsLoading(true);
    Promise.all([
      call("GET", `/api/email/threads/${account.id}`).catch(() => ({ threads: [] })),
      call("GET", `/api/meetings/${account.id}`).catch(() => ({ meetings: [] })),
    ]).then(([emailData, meetingData]) => {
      if (!cancelled) {
        setEmailThreads(emailData.threads || []);
        setMeetingNotes(meetingData.meetings || []);
      }
    }).finally(() => { if (!cancelled) setThreadsLoading(false); });
    return () => { cancelled = true; };
  }, [tab, account.id]);

  const [aiMessages, setAiMessages] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const [briefData,      setBriefData]      = useState(null);
  const [briefLoading,   setBriefLoading]   = useState(false);
  const [briefError,     setBriefError]     = useState(null);
  const [briefCache,     setBriefCache]     = useState(null);
  const [briefSlowHint,  setBriefSlowHint]  = useState(false);
  const briefSlowTimer   = useRef(null);
  const briefFetchedRef  = useRef(false);
  const briefInflightRef = useRef(false);

  const [catchUpData,     setCatchUpData]     = useState(null);
  const [catchUpLoading,  setCatchUpLoading]  = useState(false);
  const [catchUpError,    setCatchUpError]    = useState(false);
  const [catchUpSlowHint, setCatchUpSlowHint] = useState(false);
  const [catchUpNonce,    setCatchUpNonce]    = useState(0);
  const catchUpSlowTimer  = useRef(null);
  const catchUpFetchedRef = useRef(false);
  const catchUpInflightRef= useRef(false);
    const [handoffData,     setHandoffData]     = useState(null);
    const [handoffLoading,  setHandoffLoading]  = useState(false);
    const [handoffError,    setHandoffError]    = useState(false);
    const [handoffSlowHint, setHandoffSlowHint] = useState(false);
    const [handoffNonce,    setHandoffNonce]    = useState(0);
    const handoffSlowTimer  = useRef(null);
    const handoffFetchedRef = useRef(false);
    const handoffInflightRef= useRef(false);
    const [caseSummary,  setCaseSummary]  = useState(null);
    const [caseLoading,  setCaseLoading]  = useState(false);
    const [caseError,    setCaseError]    = useState(false);
    const [caseSlowHint, setCaseSlowHint] = useState(false);
    const caseSlowTimer  = useRef(null);
    const caseFetchedRef = useRef(false);
    const [ticketsData,     setTicketsData]     = useState(null);
    const [ticketsLoading,  setTicketsLoading]  = useState(false);
    const [ticketsError,    setTicketsError]    = useState(false);
    const [ticketsSlowHint, setTicketsSlowHint] = useState(false);
    const [ticketsNonce,    setTicketsNonce]    = useState(0);
    const ticketsSlowTimer  = useRef(null);
    const ticketsFetchedRef = useRef(false);
    const ticketsInflightRef= useRef(false);
    const [showCaseEmail,    setShowCaseEmail]    = useState(false);
    const [caseEmailTo,      setCaseEmailTo]      = useState("");
    const [caseEmailSubject, setCaseEmailSubject] = useState("");
    const [caseEmailBody,    setCaseEmailBody]    = useState("");
    const [caseEmailSending, setCaseEmailSending] = useState(false);
    const [caseMailboxes,    setCaseMailboxes]    = useState([]);
    const [caseMailboxId,    setCaseMailboxId]    = useState(null);
    const [hnData,     setHnData]     = useState(null);
    const [hnLoading,  setHnLoading]  = useState(false);
    const [hnError,    setHnError]    = useState(false);
    const [hnSlowHint, setHnSlowHint] = useState(false);
    const [hnNonce,    setHnNonce]    = useState(0);
    const hnSlowTimer  = useRef(null);
    const hnFetchedRef = useRef(false);
    const hnInflightRef= useRef(false);

  const askAI = async () => {
    const q = aiQuestion.trim();
    if (!q || aiChatLoading) return;
    setAiQuestion("");
    const history = aiMessages.map(m => ({ role: m.role, content: m.content }));
    setAiMessages(p => [...p, { role:"user", content:q }]);
    setAiChatLoading(true);
    try {
      const data = await call("POST", `/api/ai/chat/${account.id}`, { question: q, history });
      setAiMessages(p => [...p, { role:"assistant", content: data.answer }]);
    } catch (e) {
      const msg = e.status === 402
        ? "Add your AI key in Settings → AI to use this feature."
        : "Failed to get answer. Try again.";
      setAiMessages(p => [...p, { role:"assistant", content: msg }]);
    } finally { setAiChatLoading(false); }
  };

  useEffect(() => {
    setBriefData(null);
    setBriefError(null);
    briefFetchedRef.current = false;
    briefInflightRef.current = false;
    setBriefLoading(false);
    setBriefCache(null);
    setBriefSlowHint(false);
  }, [account.id]);

  useEffect(() => {
    if (tab !== "brief" || briefFetchedRef.current) return;
    let cancelled = false;
    setBriefLoading(true);
    briefFetchedRef.current = true;
    briefInflightRef.current = true;
    briefSlowTimer.current = setTimeout(() => { if (!cancelled) setBriefSlowHint(true); }, 2000);
    const s = loadSession();
    fetch(`${API_URL}/api/accounts/${account.id}/brief`, {
      method: "GET",
      headers: {
        "Content-Type":   "application/json",
        ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}),
      },
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        const error = new Error(err.error || "API error");
        error.status = res.status;
        throw error;
      }
      const data = res.status === 204 ? null : await res.json();
      const cacheStatus = res.headers.get("X-Brief-Cache");
      return { data, cacheStatus };
    }).then(({ data, cacheStatus }) => {
      if (cancelled) return;
      setBriefData(data);
      setBriefCache(cacheStatus);
      setBriefError(null);
    }).catch(e => {
      if (!cancelled) setBriefError(e.status || 500);
    }).finally(() => {
      briefInflightRef.current = false;
      if (!cancelled) {
        clearTimeout(briefSlowTimer.current);
        setBriefSlowHint(false);
        setBriefLoading(false);
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(briefSlowTimer.current);
      setBriefSlowHint(false);
      if (briefInflightRef.current) {
        briefFetchedRef.current = false;
        briefInflightRef.current = false;
        setBriefLoading(false);
      }
    };
  }, [tab, account.id]);

  // Catch-up: clear held recap when the account changes
  useEffect(() => {
    setCatchUpData(null);
    setCatchUpError(false);
    setCatchUpSlowHint(false);
    setCatchUpLoading(false);
    catchUpFetchedRef.current = false;
    catchUpInflightRef.current = false;
  }, [account.id]);

  // Catch-up: on-demand, fetch-once-hold; re-runs on explicit Refresh (catchUpNonce)
  useEffect(() => {
    if (tab !== "catchup" || catchUpFetchedRef.current) return;
    let cancelled = false;
    setCatchUpLoading(true);
    catchUpFetchedRef.current = true;
    catchUpInflightRef.current = true;
    catchUpSlowTimer.current = setTimeout(() => { if (!cancelled) setCatchUpSlowHint(true); }, 2000);
    call("GET", `/api/accounts/${account.id}/catch-up`)
      .then(d => { if (!cancelled) { setCatchUpData(d); setCatchUpError(false); } })
      .catch(() => { if (!cancelled) setCatchUpError(true); })
      .finally(() => {
        catchUpInflightRef.current = false;
        if (!cancelled) {
          clearTimeout(catchUpSlowTimer.current);
          setCatchUpSlowHint(false);
          setCatchUpLoading(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(catchUpSlowTimer.current);
      setCatchUpSlowHint(false);
      if (catchUpInflightRef.current) {
        catchUpFetchedRef.current = false;
        catchUpInflightRef.current = false;
        setCatchUpLoading(false);
      }
    };
  }, [tab, account.id, catchUpNonce]);

    // Handoff: clear held packet when the account changes
    useEffect(() => {
      setHandoffData(null);
      setHandoffError(false);
      setHandoffSlowHint(false);
      setHandoffLoading(false);
      handoffFetchedRef.current = false;
      handoffInflightRef.current = false;
    }, [account.id]);

    // Handoff: on-demand, fetch-once-hold; re-runs on explicit Refresh (handoffNonce)
    useEffect(() => {
      if (tab !== "handoff" || handoffFetchedRef.current) return;
      let cancelled = false;
      setHandoffLoading(true);
      handoffFetchedRef.current = true;
      handoffInflightRef.current = true;
      handoffSlowTimer.current = setTimeout(() => { if (!cancelled) setHandoffSlowHint(true); }, 2000);
      call("GET", `/api/accounts/${account.id}/handoff`)
        .then(d => { if (!cancelled) { setHandoffData(d); setHandoffError(false); } })
        .catch(() => { if (!cancelled) setHandoffError(true); })
        .finally(() => {
          handoffInflightRef.current = false;
          if (!cancelled) {
            clearTimeout(handoffSlowTimer.current);
            setHandoffSlowHint(false);
            setHandoffLoading(false);
          }
        });
      return () => {
        cancelled = true;
        clearTimeout(handoffSlowTimer.current);
        setHandoffSlowHint(false);
        if (handoffInflightRef.current) {
          handoffFetchedRef.current = false;
          handoffInflightRef.current = false;
          setHandoffLoading(false);
        }
      };
    }, [tab, account.id, handoffNonce]);

    // Case summary: reset on account change
    useEffect(() => {
      setCaseSummary(null);
      setCaseError(false);
      setCaseSlowHint(false);
      setCaseLoading(false);
      caseFetchedRef.current = false;
    }, [account.id]);

    // Case summary: quietly load any stored summary when the account is escalated
    useEffect(() => {
      if (account.escalationStatus !== "open" || caseFetchedRef.current) return;
      caseFetchedRef.current = true;
      let cancelled = false;
      call("GET", `/api/accounts/${account.id}/escalation-summary`)
        .then(d => { if (!cancelled && d) setCaseSummary(d); })
        .catch(() => {});
      return () => { cancelled = true; };
    }, [account.id, account.escalationStatus]);

    // Tickets tab: reset on account change
    useEffect(() => {
      setTicketsData(null);
      setTicketsError(false);
      setTicketsSlowHint(false);
      setTicketsLoading(false);
      ticketsFetchedRef.current = false;
      ticketsInflightRef.current = false;
    }, [account.id]);

    // Tickets tab: on-demand, fetch-once-hold; re-runs on explicit Refresh (ticketsNonce)
    useEffect(() => {
      if (tab !== "tickets" || ticketsFetchedRef.current) return;
      let cancelled = false;
      setTicketsLoading(true);
      ticketsFetchedRef.current = true;
      ticketsInflightRef.current = true;
      ticketsSlowTimer.current = setTimeout(() => { if (!cancelled) setTicketsSlowHint(true); }, 2000);
      call("GET", `/api/accounts/${account.id}/tickets`)
        .then(d => { if (!cancelled) { setTicketsData(d); setTicketsError(false); } })
        .catch(() => { if (!cancelled) setTicketsError(true); })
        .finally(() => {
          ticketsInflightRef.current = false;
          if (!cancelled) {
            clearTimeout(ticketsSlowTimer.current);
            setTicketsSlowHint(false);
            setTicketsLoading(false);
          }
        });
      return () => {
        cancelled = true;
        clearTimeout(ticketsSlowTimer.current);
        setTicketsSlowHint(false);
        if (ticketsInflightRef.current) {
          ticketsFetchedRef.current = false;
          ticketsInflightRef.current = false;
          setTicketsLoading(false);
        }
      };
    }, [tab, account.id, ticketsNonce]);

    const sendCaseEmail = async () => {
      const recipients = caseEmailTo.split(/[,;\s]+/).map(x => x.trim()).filter(Boolean);
      const subj = caseEmailSubject.trim();
      const body = caseEmailBody.trim();
      if (!recipients.length) { toast("Add at least one recipient", "error"); return; }
      if (!subj || !body) { toast("Subject and message are required", "error"); return; }
      if (!caseMailboxId) { toast("Connect a mailbox in Integrations first", "error"); return; }
      setCaseEmailSending(true);
      const esc = body.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
      const htmlBody = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111;">${esc}</div>`;
      try {
        const res = await call("POST", "/api/email/send", { accountId: caseMailboxId, to: recipients, subject: subj, htmlBody });
        const failed = (res?.results || []).filter(r => r.status === "failed");
        if (failed.length) { toast(`Sent, but ${failed.length} address(es) failed.`, "info"); }
        else { toast("Case email sent", "success"); }
        setShowCaseEmail(false);
      } catch (err) {
        toast(err.message || "Couldn't send the case email — try again.", "error");
      } finally {
        setCaseEmailSending(false);
      }
    };

    // Health narrative: clear held explanation when the account changes
    useEffect(() => {
      setHnData(null);
      setHnError(false);
      setHnSlowHint(false);
      setHnLoading(false);
      hnFetchedRef.current = false;
      hnInflightRef.current = false;
    }, [account.id]);

    // Health narrative: on-demand when the Health tab opens; fetch-once-hold; Refresh re-runs (hnNonce)
    useEffect(() => {
      if (tab !== "health" || hnFetchedRef.current) return;
      let cancelled = false;
      setHnLoading(true);
      hnFetchedRef.current = true;
      hnInflightRef.current = true;
      hnSlowTimer.current = setTimeout(() => { if (!cancelled) setHnSlowHint(true); }, 2000);
      call("GET", `/api/accounts/${account.id}/health-narrative`)
        .then(d => { if (!cancelled) { setHnData(d); setHnError(false); } })
        .catch(() => { if (!cancelled) setHnError(true); })
        .finally(() => {
          hnInflightRef.current = false;
          if (!cancelled) {
            clearTimeout(hnSlowTimer.current);
            setHnSlowHint(false);
            setHnLoading(false);
          }
        });
      return () => {
        cancelled = true;
        clearTimeout(hnSlowTimer.current);
        setHnSlowHint(false);
        if (hnInflightRef.current) {
          hnFetchedRef.current = false;
          hnInflightRef.current = false;
          setHnLoading(false);
        }
      };
    }, [tab, account.id, hnNonce]);

  return (
    <>
      <div style={{display:"flex",gap:28,alignItems:"flex-start"}}>

        {/* ── LEFT COLUMN ─────────────────────────────────────────────────────── */}
        <div style={{width:"var(--detail-col-w)",flexShrink:0,position:"sticky",top:0,alignSelf:"flex-start",display:"flex",flexDirection:"column",gap:12}}>

          {/* Back + action buttons */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={onClose}
              style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",
                color:"var(--text2)",cursor:"pointer",fontWeight:600,fontSize:13,
                padding:"6px 0",fontFamily:"var(--font-display)"}}>
              ← Back
            </button>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowPortal(true)}
                style={{background:"var(--indigo-dim)",border:"none",color:"var(--indigo)",
                  cursor:"pointer",padding:"6px 12px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600}}>Portal</button>
              <button onClick={()=>{setEscReasonDraft(account.escalationReason||"");setEscNotesDraft(account.escalationNotes||"");setShowEscalate(true);}}
                style={{background:account.escalationStatus==="open"?"var(--rose-dim)":"var(--bg3)",
                  border:"none",color:account.escalationStatus==="open"?"var(--rose)":"var(--text2)",
                  cursor:"pointer",padding:"6px 10px",borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",gap:5,
                  fontSize:12,fontWeight:600}}>
                <Ic n="escalate" size={13} color={account.escalationStatus==="open"?"var(--rose)":"var(--text2)"}/>
                {account.escalationStatus==="open"?"Escalated":"Escalate"}
              </button>
              <button onClick={()=>setShowEdit(true)}
                style={{background:"var(--bg3)",border:"none",color:"var(--text2)",
                  cursor:"pointer",padding:"6px 12px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600}}>Edit</button>
              <button onClick={()=>setShowChurn(true)}
                style={{background:"var(--rose-dim)",border:"none",color:"var(--rose)",
                  cursor:"pointer",padding:"6px 10px",borderRadius:"var(--r-sm)",display:"flex",alignItems:"center"}}>
                <Ic n="archive" size={14} color="var(--rose)"/></button>
            </div>
          </div>

          {/* Header card */}
          <Card pad={20}>

            {/* Top row: avatar + name block + ring */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:0}}>
              <Avatar name={account.name} size={44}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:650,fontSize:18,lineHeight:1.2,color:"var(--text)"}}>{account.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",marginTop:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:"var(--text3)"}}>{account.industry} · {account.plan}</span>
                  <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
                </div>
              </div>
              <Ring score={account.healthScore} size={44}/>
            </div>

            {/* StatStrip: Churn · ARR · NPS · CES · Usage · Tickets */}
            <StatStrip stats={[
              {label:"Churn %", value:`${account.churnRisk??'—'}%`,      color:(account.churnRisk??50)>=60?"var(--rose)":(account.churnRisk??50)>=35?"var(--amber)":"var(--emerald)"},
              {label:"ARR",     value:fmtMoney(account.arr),               color:"var(--indigo)"},
              {label:"NPS",     value:account.nps??'—',                    color:account.nps>=50?"var(--emerald)":account.nps>=30?"var(--amber)":"var(--rose)"},
              {label:"CES",     value:(account.ces??3.5).toFixed(1),       color:(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"},
              {label:"Usage %", value:`${account.productUsage}%`,          color:account.productUsage>=70?"var(--emerald)":account.productUsage>=45?"var(--amber)":"var(--rose)"},
              {label:"Tickets", value:account.openTickets??0,              color:account.openTickets>4?"var(--rose)":undefined},
            ]}/>

            {/* Renewal + last contact — quiet meta line */}
            <div style={{fontSize:11,color:"var(--text3)",marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{color:rdays<=0?"var(--rose)":rdays<=60?"var(--rose)":undefined}}>
                {rdays>0?`Renews in ${rdays}d`:"Renewal overdue"}
              </span>
              <span>·</span>
              <span style={{color:days>30?"var(--rose)":undefined}}>Last contact {days}d ago</span>
            </div>

            {/* Next Action */}
            <div style={{background:account.nextAction?"var(--violet-dim)":"var(--bg3)",
              border:`1.5px solid ${account.nextAction?"rgba(124,58,237,0.2)":"var(--border)"}`,
              borderRadius:"var(--r)",padding:"10px 14px",marginBottom:14}}>
              {editAct?(
                <div style={{display:"flex",gap:8}}>
                  <Inp value={actDraft} onChange={e=>setActDraft(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter")saveAct();if(e.key==="Escape")setEditAct(false);}}
                    placeholder="What's the next action?" style={{fontSize:13,padding:"7px 10px"}}/>
                  <Btn onClick={saveAct} style={{padding:"7px 14px",fontSize:12}}>Save</Btn>
                </div>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <Ic n="target" size={14} color="var(--violet)" style={{flexShrink:0}}/>
                    <span style={{fontSize:13,color:account.nextAction?"var(--violet)":"var(--text3)",
                      fontWeight:account.nextAction?600:400,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {account.nextAction||"No next action — click to add"}
                    </span>
                  </div>
                  <button onClick={()=>{setActDraft(account.nextAction||"");setEditAct(true);}}
                    style={{background:"none",border:"none",color:"var(--indigo)",fontSize:11,
                      cursor:"pointer",fontWeight:600,flexShrink:0}}>Edit</button>
                </div>
              )}
            </div>

            {/* Pre-Call Brief */}
            <button onClick={()=>setShowPrep(true)}
              style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                background:"var(--bg3)",color:"var(--text2)",border:"1px solid var(--border)",
                borderRadius:"var(--r)",padding:"8px 16px",fontWeight:600,fontSize:12,cursor:"pointer",
                fontFamily:"var(--font-display)",transition:"background .12s,border-color .12s",
                marginTop:12,marginBottom:16}}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--bg4)";e.currentTarget.style.borderColor="var(--border2)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.borderColor="var(--border)";}}>
              <Ic n="prep" size={13} color="var(--text2)"/>
              Pre-Call Brief
            </button>

            {/* Stakeholders */}
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <SectionLabel>Stakeholders</SectionLabel>
                <button onClick={()=>setShowStk(true)} style={{fontSize:12,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Manage →</button>
              </div>
              {account.stakeholders.length===0
                ?<div style={{fontSize:12,color:"var(--text3)"}}>None mapped yet</div>
                :account.stakeholders.map(s=>{
                  const rc=ROLE_CFG[s.role]||ROLE_CFG.Neutral;
                  return (
                    <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:26,height:26,borderRadius:"var(--r-sm)",background:`hsl(${hue(s.name)},60%,92%)`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,
                          fontWeight:700,color:`hsl(${hue(s.name)},50%,35%)`}}>{initials(s.name)}</div>
                        <div>
                          <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                          <div style={{fontSize:10,color:"var(--text3)"}}>{s.title}</div>
                        </div>
                      </div>
                      <Badge label={`${sentIcon(s.sentiment)} ${s.role}`} color={rc.color} bg={rc.bg}/>
                    </div>
                  );
                })}
            </div>

            {/* Notes */}
            {account.notes&&(
              <div style={{background:"var(--amber-dim)",border:"1.5px solid rgba(217,119,6,0.2)",borderRadius:"var(--r)",padding:"12px 14px",marginTop:14}}>
                <div style={{fontSize:10,color:"var(--amber)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Notes</div>
                <div style={{fontSize:12,color:"var(--text)",lineHeight:1.6}}>{account.notes}</div>
              </div>
            )}

            {/* Escalation banner */}
            {account.escalationStatus==="open"&&(
              <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.3)",
                borderRadius:"var(--r)",padding:"12px 14px",marginTop:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <Ic n="escalate" size={13} color="var(--rose)"/>
                    <span style={{fontSize:11,fontWeight:700,color:"var(--rose)",textTransform:"uppercase",letterSpacing:".06em"}}>Escalated</span>
                    {account.escalationSince&&(
                      <span style={{fontSize:10,color:"var(--rose)",opacity:.7}}>since {account.escalationSince}</span>
                    )}
                  </div>
                  <button onClick={()=>onUpdate(account.id,{escalationStatus:"resolved"})}
                    style={{fontSize:11,fontWeight:600,color:"var(--rose)",background:"none",border:"1px solid rgba(225,29,72,0.4)",
                      borderRadius:"var(--r-sm)",padding:"3px 10px",cursor:"pointer"}}>
                    Resolve
                  </button>
                </div>
                {account.escalationReason&&(
                  <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{account.escalationReason}</div>
                )}
              </div>
            )}

          </Card>

          {/* Escalation case summary */}
          {account.escalationStatus==="open"&&(
            <SignalCard tone="danger" title="Case Summary"
              icon={<Ic n="escalate" size={13} color="var(--rose)"/>}
              actions={!caseLoading&&(
                <button onClick={()=>{
                  setCaseLoading(true);setCaseError(false);
                  caseSlowTimer.current=setTimeout(()=>setCaseSlowHint(true),2000);
                  call("POST",`/api/accounts/${account.id}/escalation-summary`)
                    .then(d=>{setCaseSummary(d);setCaseError(false);})
                    .catch(()=>setCaseError(true))
                    .finally(()=>{clearTimeout(caseSlowTimer.current);setCaseSlowHint(false);setCaseLoading(false);});
                }}
                  style={{padding:"4px 10px",borderRadius:"var(--r-sm)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,border:"1px solid rgba(225,29,72,0.3)",background:"transparent",color:"var(--rose)"}}>
                  {caseSummary?"Refresh":"Generate"}
                </button>
              )}>
              <div>
                {caseLoading&&(
                  <div style={{fontSize:13,color:"var(--text2)"}}>
                    Generating case summary…
                    {caseSlowHint&&(<div style={{marginTop:4,fontSize:12,color:"var(--text3)"}}>Synthesizing from metrics and recent meetings — a few seconds.</div>)}
                  </div>
                )}
                {!caseLoading&&caseError&&(
                  <div style={{fontSize:13,color:"var(--rose)"}}>Couldn't generate the summary. Try again.</div>
                )}
                {!caseLoading&&!caseError&&!caseSummary&&(
                  <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5}}>
                    Generate a shareable case summary — metrics, escalation context, and recommended cross-functional actions — to rally PM, Tech Support, and CS leads.
                  </div>
                )}
                {!caseLoading&&caseSummary&&(()=>{
                  const s=caseSummary;
                  return (
                    <div>
                      {s.ai?.situation&&(
                        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:12}}>{s.ai.situation}</div>
                      )}
                      <div style={{display:"flex",flexWrap:"wrap",gap:18,marginBottom:12}}>
                        {[
                          ["ARR",fmtMoney(s.account.arr)],
                          ["Health",s.account.health_score??"—"],
                          ["NPS",s.account.nps??"—"],
                          ["CES",s.account.ces??"—"],
                          ["Tickets",s.account.open_tickets??0],
                          ["Renewal",s.account.renewal_date||"—"],
                        ].map(([k,v])=>(
                          <div key={k}>
                            <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{k}</div>
                            <div style={{fontSize:13,fontWeight:700,fontFamily:"var(--font-mono)",color:"var(--text)"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {s.tickets?.critical?.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>Critical tickets ({s.tickets.counts?.critical??s.tickets.critical.length})</div>
                          <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:4}}>
                            {s.tickets.critical.map((t,i)=>(
                              <div key={t.externalId||i} style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>
                                <span style={{fontWeight:700,fontSize:10,letterSpacing:".04em",textTransform:"uppercase",color:t.priority==="urgent"?"var(--rose)":"#d97706"}}>{t.priority}</span>{" "}
                                {t.url?(<a href={t.url} target="_blank" rel="noreferrer" style={{color:"var(--text2)"}}>{t.subject}</a>):t.subject}
                                {t.ageDays!=null?(<span style={{color:"var(--text3)"}}> · open {t.ageDays}d</span>):null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.ai?.challenges?.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>Key challenges</div>
                          <ul style={{margin:"4px 0 0",paddingLeft:18}}>
                            {s.ai.challenges.map((c,i)=>(<li key={i} style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{c}</li>))}
                          </ul>
                        </div>
                      )}
                      {s.ai?.recommended_actions?.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>Recommended actions</div>
                          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
                            {s.ai.recommended_actions.map((a,i)=>(
                              <div key={i} style={{fontSize:12,color:"var(--text2)",lineHeight:1.5}}>
                                <span style={{fontWeight:700,color:"var(--text)"}}>{a.team}:</span> {a.action}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.recent_meetings?.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em"}}>Recent meetings</div>
                          {s.recent_meetings.map((m,i)=>(
                            <div key={i} style={{marginTop:6}}>
                              <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{m.title||"Untitled"}{m.date&&(<span style={{color:"var(--text3)",fontWeight:400}}> · {m.date}</span>)}</div>
                              {m.summary&&(<div style={{fontSize:12,color:"var(--text2)",lineHeight:1.5,marginTop:2}}>{m.summary}</div>)}
                            </div>
                          ))}
                        </div>
                      )}
                      {!s.ai&&(
                        <div style={{fontSize:11,color:"var(--text3)",fontStyle:"italic",marginBottom:8}}>AI framing unavailable — showing account data only.</div>
                      )}
                      {s.generated_at&&(
                        <div style={{fontSize:10,color:"var(--text3)",marginTop:4}}>Generated {new Date(s.generated_at).toLocaleString()}</div>
                      )}
                      <div style={{marginTop:14}}>
                        {!showCaseEmail&&(
                          <button onClick={()=>{
                            const lines=[];
                            lines.push(`Account: ${account.name}${account.stage?` (${account.stage})`:""}`);
                            if(s.escalation?.since) lines.push(`Escalated: ${s.escalation.since}${s.escalation.reason?` — ${s.escalation.reason}`:""}`);
                            lines.push("");
                            if(s.ai?.situation){lines.push(s.ai.situation);lines.push("");}
                            lines.push(`Metrics: ARR ${s.account.arr!=null?fmtMoney(s.account.arr):"—"} · Health ${s.account.health_score??"—"} · NPS ${s.account.nps??"—"} · CES ${s.account.ces??"—"} · Open tickets ${s.account.open_tickets??0} · Renewal ${s.account.renewal_date||"—"}`);
                            if(s.tickets?.critical?.length){lines.push("",`Critical tickets (${s.tickets.counts?.critical??s.tickets.critical.length}):`);s.tickets.critical.forEach(t=>lines.push(`- [${t.priority}] ${t.subject}${t.ageDays!=null?` (open ${t.ageDays}d)`:""}`));}
                            if(s.ai?.challenges?.length){lines.push("","Key challenges:");s.ai.challenges.forEach(c=>lines.push(`- ${c}`));}
                            if(s.ai?.recommended_actions?.length){lines.push("","Recommended actions:");s.ai.recommended_actions.forEach(a=>lines.push(`- ${a.team}: ${a.action}`));}
                            if(s.recent_meetings?.length){lines.push("","Recent meetings:");s.recent_meetings.forEach(m=>lines.push(`- ${m.title||"Untitled"}${m.date?` (${m.date})`:""}${m.summary?`: ${m.summary}`:""}`));}
                            setCaseEmailSubject(`Escalation — ${account.name}: case briefing`);
                            setCaseEmailBody(lines.join("\n"));
                            setCaseEmailTo("");
                            setShowCaseEmail(true);
                            call("GET","/api/email/accounts").then(d=>{const accs=(d&&d.accounts)||[];setCaseMailboxes(accs);const p=accs.find(a=>a.is_primary)||accs[0];if(p)setCaseMailboxId(p.id);}).catch(()=>{});
                          }}
                            style={{padding:"7px 16px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:700,cursor:"pointer",border:"none",background:"var(--rose-dim)",color:"var(--rose)",fontFamily:"var(--font-display)"}}>
                            Share via email
                          </button>
                        )}
                      </div>
                      {showCaseEmail&&(
                        <div style={{marginTop:12,borderTop:"1px solid var(--border)",paddingTop:12,display:"flex",flexDirection:"column",gap:10}}>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Recipients</div>
                            <input value={caseEmailTo} onChange={e=>setCaseEmailTo(e.target.value)}
                              placeholder="pm.lead@company.com, cs.lead@company.com, support@company.com"
                              style={{width:"100%",padding:"8px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",background:"var(--bg3)",color:"var(--text)",fontSize:13,fontFamily:"var(--font-display)",boxSizing:"border-box"}}/>
                            <div style={{fontSize:10,color:"var(--text3)",marginTop:3}}>Separate multiple addresses with commas.</div>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Subject</div>
                            <input value={caseEmailSubject} onChange={e=>setCaseEmailSubject(e.target.value)}
                              style={{width:"100%",padding:"8px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",background:"var(--bg3)",color:"var(--text)",fontSize:13,fontFamily:"var(--font-display)",boxSizing:"border-box"}}/>
                          </div>
                          <div>
                            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Message</div>
                            <textarea value={caseEmailBody} onChange={e=>setCaseEmailBody(e.target.value)} rows={12}
                              style={{width:"100%",padding:"8px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",background:"var(--bg3)",color:"var(--text)",fontSize:13,lineHeight:1.5,resize:"vertical",fontFamily:"var(--font-display)",boxSizing:"border-box"}}/>
                          </div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                            <div style={{fontSize:11,color:"var(--text3)"}}>
                              {caseMailboxId
                                ? `Sending from ${caseMailboxes.find(m=>m.id===caseMailboxId)?.email||"your mailbox"}`
                                : "No mailbox connected — add one in Integrations."}
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <button onClick={()=>setShowCaseEmail(false)} disabled={caseEmailSending}
                                style={{padding:"7px 14px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600,cursor:"pointer",border:"1.5px solid var(--border)",background:"transparent",color:"var(--text2)",fontFamily:"var(--font-display)"}}>Cancel</button>
                              <button onClick={sendCaseEmail} disabled={caseEmailSending||!caseMailboxId}
                                style={{padding:"7px 16px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:700,cursor:caseEmailSending||!caseMailboxId?"not-allowed":"pointer",border:"none",background:"var(--rose)",color:"white",opacity:caseEmailSending||!caseMailboxId?.6:1,fontFamily:"var(--font-display)"}}>
                                {caseEmailSending?"Sending…":"Send case email"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </SignalCard>
          )}

          {/* Opportunity Signals */}
          <SignalCard tone="accent" title="Opportunity Signals"
            icon={<Ic n="trend_up" size={13} color="var(--indigo)"/>}>
            <OpportunityCards account={account} call={call} toast={toast}/>
          </SignalCard>

          {/* Expansion opportunity */}
          {(account.expansionPotential||showExpand)&&(
            <SignalCard tone="success" title="Expansion Opportunity"
              icon={<Ic n="expand" size={13} color="var(--emerald)"/>}
              actions={!showExpand&&(
                <button onClick={()=>{setExpDraft({arr:account.expansionArr||0,stage:account.expansionStage||"",notes:account.expansionNotes||""});setShowExpand(true);}}
                  style={{fontSize:11,color:"var(--emerald)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Edit</button>
              )}>
              <div>
                {showExpand?(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:3}}>Potential ARR ($)</div>
                        <input type="number" value={expDraft.arr} onChange={e=>setExpDraft(d=>({...d,arr:e.target.value}))}
                          style={{width:"100%",padding:"6px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",
                            background:"var(--bg2)",color:"var(--text)",fontSize:13,fontFamily:"var(--font-display)"}}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:3}}>Stage</div>
                        <select value={expDraft.stage} onChange={e=>setExpDraft(d=>({...d,stage:e.target.value}))}
                          style={{width:"100%",padding:"6px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",
                            background:"var(--bg2)",color:"var(--text)",fontSize:13}}>
                          <option value="">Select…</option>
                          {["Identified","Qualifying","Proposing","Negotiating","Closed Won"].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:"var(--text3)",marginBottom:3}}>Notes</div>
                      <textarea value={expDraft.notes} onChange={e=>setExpDraft(d=>({...d,notes:e.target.value}))}
                        placeholder="Which products, expansion trigger…"
                        style={{width:"100%",padding:"6px 10px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",
                          background:"var(--bg2)",color:"var(--text)",fontSize:12,resize:"vertical",minHeight:52,
                          fontFamily:"var(--font-display)"}}/>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{
                        onUpdate(account.id,{expansionPotential:true,expansionArr:parseFloat(expDraft.arr)||0,expansionStage:expDraft.stage,expansionNotes:expDraft.notes});
                        setShowExpand(false);toast("Expansion opportunity saved","success");
                      }} style={{flex:1,padding:"7px 0",borderRadius:"var(--r-sm)",border:"none",
                        background:"var(--emerald)",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save</button>
                      <button onClick={()=>setShowExpand(false)}
                        style={{padding:"7px 14px",borderRadius:"var(--r-sm)",border:"1.5px solid var(--border)",
                          background:"none",color:"var(--text2)",fontSize:12,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                    {account.expansionArr>0&&(
                      <div>
                        <div style={{fontSize:10,color:"var(--text3)"}}>Potential ARR</div>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--emerald)",fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums"}}>{fmtMoney(account.expansionArr)}</div>
                      </div>
                    )}
                    {account.expansionStage&&(
                      <div>
                        <div style={{fontSize:10,color:"var(--text3)"}}>Stage</div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--emerald)"}}>{account.expansionStage}</div>
                      </div>
                    )}
                    {account.expansionNotes&&(
                      <div style={{width:"100%",fontSize:12,color:"var(--text2)",lineHeight:1.5}}>{account.expansionNotes}</div>
                    )}
                  </div>
                )}
              </div>
            </SignalCard>
          )}
          {!account.expansionPotential&&!showExpand&&(
            <button onClick={()=>{setExpDraft({arr:0,stage:"",notes:""});setShowExpand(true);}}
              style={{width:"100%",padding:"6px 0",border:"1px dashed rgba(5,150,105,.3)",
                borderRadius:"var(--r-sm)",background:"none",color:"var(--emerald)",fontSize:11,fontWeight:600,
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Ic n="expand" size={12} color="var(--emerald)"/>
              Mark as expansion opportunity
            </button>
          )}

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────────── */}
        <div style={{flex:1,minWidth:0}}>

          {/* Tab bar */}
          <Tabs tabs={TABS} active={tab} onSelect={setTab} alerts={tabHasAlert}/>

          {/* ACTIVITY TAB */}
          {tab==="activity"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {rdays>0&&rdays<=60&&(
                <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.25)",
                  borderRadius:"var(--r)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}}>
                  <Ic n="bell" size={20} color="var(--rose)"/>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"var(--rose)"}}>Renewal in {rdays} days</div>
                    <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>Start the conversation now — don't wait.</div>
                  </div>
                </div>
              )}
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Log Activity</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                  <Fld label="Type"><Slct value={logF.type} onChange={e=>setLogF(f=>({...f,type:e.target.value}))}>{ACT_TYPES.map(t=><option key={t}>{t}</option>)}</Slct></Fld>
                  <Fld label="Date"><Inp type="date" value={logF.date} onChange={e=>setLogF(f=>({...f,date:e.target.value}))}/></Fld>
                </div>
                {logF.type==="Meeting"&&(
                  <>
                    <Fld label="Meeting Title">
                      <Inp value={logF.title} onChange={e=>setLogF(f=>({...f,title:e.target.value}))} placeholder="e.g. QBR Q2, Onboarding call, Check-in"/>
                    </Fld>
                    <Fld label="Attendees (comma-separated)">
                      <Inp value={logF.attendees} onChange={e=>setLogF(f=>({...f,attendees:e.target.value}))} placeholder="sara@acme.com, john@acme.com"/>
                    </Fld>
                  </>
                )}
                <Fld label={logF.type==="Meeting"?"Summary":"Note"}>
                  <textarea value={logF.note} onChange={e=>setLogF(f=>({...f,note:e.target.value}))}
                    placeholder={logF.type==="Meeting"?"What was discussed? Key outcomes…":"What happened? Key outcomes, follow-ups…"}
                    style={{width:"100%",background:"white",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                      padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",fontSize:14,
                      outline:"none",resize:"vertical",minHeight:70}}/>
                </Fld>
                {logF.type==="Meeting"&&(
                  <Fld label="Action Items">
                    <textarea value={logF.actionItems} onChange={e=>setLogF(f=>({...f,actionItems:e.target.value}))}
                      placeholder="Follow-ups, next steps, owner…"
                      style={{width:"100%",background:"white",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                        padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",fontSize:14,
                        outline:"none",resize:"vertical",minHeight:55}}/>
                  </Fld>
                )}
                <Btn onClick={logActivity} style={{width:"100%"}}>Log {logF.type}</Btn>
              </div>
              <AccountTasksTab
                account={account}
                accounts={[account]}
                manualTasks={manualTasks||[]}
                onAddManual={onAddManual}
                onToggleManual={onToggleManual}
                onDeleteManual={onDeleteManual}
              />
              {(() => {
                const logItems     = account.activityLog.map(a => ({ _type:"log",     _sort:a.date, ...a }));
                const threadItems  = emailThreads.map(t => ({
                  _type:"email", _sort:(t.last_message_at||"").slice(0,10),
                  id:t.id, subject:t.subject, snippet:t.snippet,
                  lastMessageAt:t.last_message_at, lastMessageFrom:t.last_message_from,
                  messageCount:t.message_count, isUnreadReply:t.is_unread_reply,
                }));
                const meetingItems = meetingNotes.map(m => ({
                  _type:"meeting", _sort:(m.meeting_date||"").slice(0,10),
                  id:m.id, title:m.title, summary:m.summary, action_items:m.action_items,
                  participants:m.participants, meetingDate:m.meeting_date,
                  isManual: m.fireflies_id?.startsWith("manual-"),
                }));
                const merged = [...logItems,...threadItems,...meetingItems].sort((a,b)=>b._sort.localeCompare(a._sort));
                return (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {threadsLoading&&<div style={{fontSize:12,color:"var(--text3)",textAlign:"center",padding:"8px 0"}}>Loading activity…</div>}
                    {merged.length===0&&!threadsLoading&&(
                      <div style={{textAlign:"center",padding:"24px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:12}}>No activity logged yet</div>
                    )}
                    {merged.map((item,i) => item._type==="email" ? (
                      <div key={`email-${item.id}`} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:700,
                              color:"var(--indigo)",background:"var(--indigo-dim)",
                              padding:"2px 8px",borderRadius:"var(--r-sm)"}}>Email</span>
                            {item.isUnreadReply&&<span style={{fontSize:10,background:"var(--rose-dim)",color:"var(--rose)",padding:"1px 7px",borderRadius:"var(--r-sm)",fontWeight:700}}>Awaiting reply</span>}
                          </div>
                          <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{(item.lastMessageAt||"").slice(0,10)}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.subject||"(no subject)"}</div>
                        {item.snippet&&<div style={{fontSize:12,color:"var(--text3)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.snippet}</div>}
                        <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>From: {item.lastMessageFrom} · {item.messageCount} message{item.messageCount!==1?"s":""}</div>
                      </div>
                    ) : item._type==="meeting" ? (
                      <div key={`meeting-${item.id}`}
                        onClick={()=>{const raw=meetingNotes.find(mn=>mn.id===item.id);if(raw)setCloseoutMeeting(raw);}}
                        style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:700,
                              color:"#ff4f00",background:"rgba(255,79,0,0.1)",
                              padding:"2px 8px",borderRadius:"var(--r-sm)"}}>Meeting</span>
                            <span style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                              {item.isManual ? "Manual" : "Fireflies"}
                            </span>
                          </div>
                          <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{(item.meetingDate||"").slice(0,10)}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>{item.title}</div>
                        {item.summary&&<div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:item.action_items?8:0,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{item.summary}</div>}
                        {item.action_items&&(
                          <div style={{fontSize:11,color:"var(--text3)",background:"var(--bg3)",borderRadius:"var(--r-sm)",padding:"7px 10px",marginTop:6,lineHeight:1.6}}>
                            <span style={{fontWeight:700,color:"var(--text2)"}}>Action items: </span>{item.action_items}
                          </div>
                        )}
                        {item.participants?.length>0&&<div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>{item.participants.slice(0,4).join(" · ")}{item.participants.length>4?` +${item.participants.length-4} more`:""}</div>}
                      </div>
                    ) : (
                      <div key={item.id} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:700,
                              color:ACT_COLORS[item.type]||"var(--text2)",background:"var(--bg3)",
                              padding:"2px 8px",borderRadius:"var(--r-sm)"}}>{item.type}</span>
                            {item.source==="gmail_auto"&&(
                              <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,
                                background:"rgba(234,67,53,.1)",color:"#ea4335"}}>Gmail</span>
                            )}
                            {item.source==="fireflies_auto"&&(
                              <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,
                                background:"rgba(255,79,0,.1)",color:"#ff4f00"}}>Fireflies</span>
                            )}
                            {item.source==="automation"&&(
                              <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,
                                background:"var(--indigo-dim)",color:"var(--indigo)"}}>Auto</span>
                            )}
                          </div>
                          <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{item.date}</span>
                        </div>
                        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{item.note}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ONBOARDING TAB */}
          {tab==="onboarding"&&(
            <OnboardingTab account={account} call={call} toast={toast}/>
          )}

          {/* ASK AI TAB */}
          {tab==="ai"&&(
            <div style={{display:"flex",flexDirection:"column",height:"100%",minHeight:400}}>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:16,lineHeight:1.6}}>
                Ask anything about this account. Claude answers from the full account history.
              </div>
              <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,marginBottom:16,minHeight:200}}>
                {aiMessages.length===0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {["What's the biggest churn risk right now?","When did we last connect and what was discussed?","What are the open action items?","Is this account on track for renewal?"].map(q=>(
                      <button key={q} onClick={()=>{setAiQuestion(q);}}
                        style={{textAlign:"left",background:"var(--bg3)",border:"1.5px solid var(--border)",
                          borderRadius:"var(--r)",padding:"10px 14px",fontSize:13,color:"var(--text2)",
                          cursor:"pointer",fontFamily:"var(--font-display)",transition:"border-color .12s"}}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="var(--indigo)"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {aiMessages.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"85%",background:m.role==="user"?"var(--indigo)":"var(--bg3)",
                      color:m.role==="user"?"white":"var(--text)",
                      border:m.role==="user"?"none":"1.5px solid var(--border)",
                      borderRadius:"var(--r-lg)",padding:"10px 14px",fontSize:13,lineHeight:1.65}}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {aiChatLoading&&(
                  <div style={{display:"flex",gap:6,alignItems:"center",padding:"8px 0"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"var(--indigo)",animation:"pulse 1s ease infinite"}}/>
                    <div style={{fontSize:12,color:"var(--text3)"}}>Thinking…</div>
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&askAI()}
                  placeholder="Ask anything about this account…"
                  style={{flex:1,background:"var(--bg3)",border:"1.5px solid var(--border)",
                    borderRadius:"var(--r)",padding:"10px 14px",fontSize:13,color:"var(--text)",
                    fontFamily:"var(--font-display)",outline:"none"}}/>
                <button onClick={askAI} disabled={aiChatLoading||!aiQuestion.trim()}
                  style={{background:"var(--indigo)",color:"white",border:"none",
                    borderRadius:"var(--r)",padding:"10px 18px",fontSize:13,fontWeight:600,
                    cursor:aiChatLoading||!aiQuestion.trim()?"not-allowed":"pointer",
                    opacity:aiChatLoading||!aiQuestion.trim()?0.6:1,transition:"opacity .15s"}}>
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* HEALTH & PLAYBOOK TAB */}
          {tab==="health"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Overall Health</div>
                    <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:32,color:hColor(account.healthScore)}}>
                      {account.healthScore}<span style={{fontSize:16,color:"var(--text3)",fontWeight:400}}>/100</span>
                    </div>
                    {(account.healthHistory||[]).length>=2&&(
                      <div style={{marginTop:10}}>
                        <div style={{fontSize:10,color:"var(--text3)",marginBottom:5}}>Trend ({(account.healthHistory||[]).length} snapshots)</div>
                        <Sparkline
                          data={(account.healthHistory||[]).map(h=>({value:h.score}))}
                          color={hColor(account.healthScore)} width={180} height={36}/>
                      </div>
                    )}
                  </div>
                  <Ring score={account.healthScore} size={64}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {calcHealth(account).parts.map(p=>(
                    <div key={p.label}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:600}}>{p.label}</span>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"var(--text3)"}}>{p.note}</span>
                          <span style={{fontSize:12,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:600,
                            color:p.pts===p.max?"var(--emerald)":p.pts<p.max*0.5?"var(--rose)":"var(--amber)"}}>
                            {p.pts}/{p.max}
                          </span>
                        </div>
                      </div>
                      <Bar value={(p.pts/p.max)*100} color={p.pts===p.max?"var(--emerald)":p.pts<p.max*0.5?"var(--rose)":"var(--amber)"}/>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em"}}>Why this health</div>
                  {!hnLoading&&(
                    <button onClick={()=>{hnFetchedRef.current=false;setHnData(null);setHnError(false);setHnLoading(true);setHnNonce(n=>n+1);}}
                      style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--indigo)",background:"var(--indigo-dim)",border:"none",borderRadius:"var(--r-sm)",padding:"4px 10px",cursor:"pointer",fontWeight:600}}>Refresh</button>
                  )}
                </div>
                {hnLoading&&(
                  <div style={{fontSize:13,color:"var(--text2)"}}>
                    Reading the account…
                    {hnSlowHint&&(<div style={{marginTop:6,fontSize:12,color:"var(--text3)"}}>Synthesizing from the timeline — this can take a few seconds.</div>)}
                  </div>
                )}
                {!hnLoading&&hnError&&(<div style={{fontSize:13,color:"var(--rose)"}}>Couldn't load the explanation. Try Refresh.</div>)}
                {!hnLoading&&!hnError&&hnData&&hnData.trace_id===null&&(<div style={{fontSize:13,color:"var(--text3)"}}>Not enough account history yet to explain the health.</div>)}
                {!hnLoading&&!hnError&&hnData&&hnData.trace_id!==null&&(<CitedNarrative text={hnData.narrative} citations={hnData.citations} fontSize={13} />)}
              </div>
              <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,.15)",borderRadius:"var(--r)",padding:"14px 16px"}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--indigo)",marginBottom:6}}>Improvement opportunities</div>
                {calcHealth(account).parts.filter(p=>p.pts<p.max).map(p=>(
                  <div key={p.label} style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>
                    → <strong>{p.label}</strong>: {p.note} — +{p.max-p.pts} pts available
                  </div>
                ))}
              </div>

              {/* Product Usage deep-dive card */}
              {(()=>{
                const updatedAt   = account.productUsageUpdatedAt;
                const daysSince   = updatedAt ? Math.floor((Date.now()-new Date(updatedAt))/86400000) : null;
                const isStale     = daysSince === null || daysSince > 30;
                const isWarning   = daysSince !== null && daysSince > 7 && daysSince <= 30;
                const usageColor  = account.productUsage>=75?"var(--emerald)":account.productUsage>=50?"var(--amber)":"var(--rose)";
                const seatPct     = usageLatest?.active_users && usageLatest?.licensed_seats
                  ? Math.round((usageLatest.active_users/usageLatest.licensed_seats)*100) : null;
                const dauMauPct   = usageLatest?.dau && usageLatest?.mau
                  ? Math.round((usageLatest.dau/usageLatest.mau)*100) : null;
                const featurePct  = usageLatest?.features_used_count && usageLatest?.total_features
                  ? Math.round((usageLatest.features_used_count/usageLatest.total_features)*100) : null;
                return (
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                      <div>
                        <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Product Usage</div>
                        <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:700,fontSize:28,color:usageColor}}>
                          {account.productUsage}<span style={{fontSize:14,color:"var(--text3)",fontWeight:400}}>/100</span>
                        </div>
                        <div style={{fontSize:11,marginTop:4,
                          color: isStale?"var(--rose)":isWarning?"var(--amber)":"var(--text3)"}}>
                          {daysSince===null
                            ? "No data received yet — set up the webhook in Settings"
                            : daysSince===0 ? "Updated today"
                            : `Last updated ${daysSince} day${daysSince!==1?"s":""} ago${isStale?" — data may be stale":isWarning?" — consider refreshing":""}`}
                        </div>
                      </div>
                      {usageHistory.length>=2&&(
                        <Sparkline
                          data={usageHistory.map(h=>({value:parseFloat(h.product_usage)}))}
                          color={usageColor} width={100} height={36}/>
                      )}
                    </div>

                    {/* Sub-metrics breakdown */}
                    {(seatPct!==null||dauMauPct!==null||featurePct!==null)&&(
                      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
                        {seatPct!==null&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:12,fontWeight:600}}>Seat adoption</span>
                              <span style={{fontSize:11,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:600,
                                color:seatPct>=75?"var(--emerald)":seatPct>=50?"var(--amber)":"var(--rose)"}}>
                                {usageLatest.active_users} / {usageLatest.licensed_seats} seats ({seatPct}%)
                              </span>
                            </div>
                            <Bar value={seatPct} color={seatPct>=75?"var(--emerald)":seatPct>=50?"var(--amber)":"var(--rose)"}/>
                          </div>
                        )}
                        {dauMauPct!==null&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:12,fontWeight:600}}>Daily / Monthly ratio</span>
                              <span style={{fontSize:11,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:600,
                                color:dauMauPct>=30?"var(--emerald)":dauMauPct>=15?"var(--amber)":"var(--rose)"}}>
                                {usageLatest.dau} DAU / {usageLatest.mau} MAU ({dauMauPct}%)
                              </span>
                            </div>
                            <Bar value={dauMauPct} color={dauMauPct>=30?"var(--emerald)":dauMauPct>=15?"var(--amber)":"var(--rose)"}/>
                          </div>
                        )}
                        {featurePct!==null&&(
                          <div>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:12,fontWeight:600}}>Feature breadth</span>
                              <span style={{fontSize:11,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:600,
                                color:featurePct>=60?"var(--emerald)":featurePct>=35?"var(--amber)":"var(--rose)"}}>
                                {usageLatest.features_used_count} / {usageLatest.total_features} features ({featurePct}%)
                              </span>
                            </div>
                            <Bar value={featurePct} color={featurePct>=60?"var(--emerald)":featurePct>=35?"var(--amber)":"var(--rose)"}/>
                          </div>
                        )}
                      </div>
                    )}

                    {usageLatest&&(usageLatest.wau!=null||usageLatest.last_active_at||usageLatest.events_count!=null||usageLatest.key_events)&&(()=>{
                      const la  = usageLatest.last_active_at ? new Date(usageLatest.last_active_at) : null;
                      const dsa = la ? Math.floor((Date.now()-la)/86400000) : null;
                      const topEvents = usageLatest.key_events
                        ? Object.entries(usageLatest.key_events).sort((a,b)=>b[1]-a[1]).slice(0,5) : [];
                      return (
                        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Engagement</div>
                          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:topEvents.length?10:0}}>
                            {usageLatest.wau!=null&&(
                              <div>
                                <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums"}}>{usageLatest.wau}</div>
                                <div style={{fontSize:10,color:"var(--text3)"}}>weekly active</div>
                              </div>
                            )}
                            {usageLatest.events_count!=null&&(
                              <div>
                                <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums"}}>{usageLatest.events_count}</div>
                                <div style={{fontSize:10,color:"var(--text3)"}}>events / 30d</div>
                              </div>
                            )}
                            {dsa!=null&&(
                              <div>
                                <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",color:dsa<=7?"var(--emerald)":dsa<=30?"var(--amber)":"var(--rose)"}}>{dsa===0?"today":dsa+"d"}</div>
                                <div style={{fontSize:10,color:"var(--text3)"}}>last active</div>
                              </div>
                            )}
                          </div>
                          {topEvents.length>0&&(
                            <div>
                              <div style={{fontSize:10,color:"var(--text3)",marginBottom:4}}>Top features</div>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                {topEvents.map(([name,count])=>(
                                  <span key={name} style={{fontSize:11,fontFamily:"var(--font-mono)",background:"var(--bg3)",borderRadius:"var(--r)",padding:"3px 8px"}}>
                                    {name} <span style={{color:"var(--text3)"}}>{count}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--border)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:editCap?8:0}}>
                        <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em"}}>Capacity</span>
                        {!editCap&&(
                          <button onClick={()=>{setSeatsDraft(account.licensedSeats??"");setFeatDraft(account.licensedFeatures??"");setEditCap(true);}}
                            style={{background:"none",border:"none",color:"var(--indigo)",fontSize:11,cursor:"pointer",fontWeight:600}}>Edit</button>
                        )}
                      </div>
                      {editCap?(
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <Inp type="number" value={seatsDraft} onChange={e=>setSeatsDraft(e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")saveCap();if(e.key==="Escape")setEditCap(false);}}
                            placeholder="Licensed seats" style={{fontSize:13,padding:"7px 10px",width:130}}/>
                          <Inp type="number" value={featDraft} onChange={e=>setFeatDraft(e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter")saveCap();if(e.key==="Escape")setEditCap(false);}}
                            placeholder="Entitled features" style={{fontSize:13,padding:"7px 10px",width:140}}/>
                          <Btn onClick={saveCap} style={{padding:"7px 14px",fontSize:12}}>Save</Btn>
                          <button onClick={()=>setEditCap(false)} style={{background:"none",border:"none",color:"var(--text3)",fontSize:11,cursor:"pointer"}}>Cancel</button>
                        </div>
                      ):(
                        <div style={{fontSize:12,color:"var(--text3)"}}>
                          {account.licensedSeats!=null||account.licensedFeatures!=null
                            ? `${account.licensedSeats??"—"} seats · ${account.licensedFeatures??"—"} features`
                            : "Not set — add seats & features to unlock seat adoption and breadth"}
                        </div>
                      )}
                    </div>

                    {usageHistory.length===0&&(
                      <div style={{fontSize:12,color:"var(--text3)",background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 14px"}}>
                        No webhook data received yet. Go to <strong>Settings → Product Usage</strong> to get your webhook URL and share it with your engineering team.
                      </div>
                    )}
                  </div>
                );
              })()}
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Customer Effort Score</div>
                    <div style={{fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",fontWeight:600,fontSize:28,
                      color:(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"}}>
                      {(account.ces??3.5).toFixed(1)}<span style={{fontSize:14,color:"var(--text3)",fontWeight:400}}> / 5</span>
                    </div>
                    <div style={{fontSize:12,fontFamily:"var(--font-mono)",marginTop:4,
                      color:cesTrend>0?"var(--emerald)":cesTrend<0?"var(--rose)":"var(--text3)"}}>
                      {cesTrend>0?"↑ Improving":cesTrend<0?"↓ Declining — investigate":"→ Flat"}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
                    <Sparkline data={account.cesHistory} color={(account.ces??3.5)>=3.5?"var(--emerald)":(account.ces??3.5)>=2.5?"var(--amber)":"var(--rose)"}/>
                    <button onClick={()=>setShowCES(true)}
                      style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--indigo)",
                        background:"var(--indigo-dim)",border:"none",borderRadius:"var(--r-sm)",
                        padding:"4px 10px",cursor:"pointer",fontWeight:600}}>+ Log CES</button>
                  </div>
                </div>
              </div>
              <ActivePlaybookTab account={account} onUpdate={onUpdate}/>
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Customer Goal</div>
                {editGoal?(
                  <div>
                    <textarea value={goalDraft} onChange={e=>setGoalDraft(e.target.value)}
                      style={{width:"100%",background:"white",border:"1.5px solid var(--indigo)",borderRadius:"var(--r)",
                        padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",fontSize:14,
                        outline:"none",resize:"vertical",minHeight:70}}/>
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <Btn onClick={saveGoal} style={{flex:1,padding:"8px"}}>Save Goal</Btn>
                      <Btn variant="ghost" onClick={()=>setEditGoal(false)} style={{flex:1,padding:"8px"}}>Cancel</Btn>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                    <div style={{fontSize:13,color:account.successPlan.goal?"var(--text)":"var(--text3)",lineHeight:1.6,fontWeight:500}}>
                      {account.successPlan.goal||"No goal defined yet — click Edit to add one"}
                    </div>
                    <button onClick={()=>{setGoalDraft(account.successPlan.goal);setEditGoal(true);}}
                      style={{fontSize:11,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>Edit</button>
                  </div>
                )}
              </div>
              {totalMs>0&&(
                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,color:"var(--text2)",fontWeight:600}}>Success Plan Progress</span>
                    <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--indigo)",fontWeight:600}}>{doneMs}/{totalMs} · {planPct}%</span>
                  </div>
                  <Bar value={planPct} color={planPct>=70?"var(--emerald)":planPct>=40?"var(--indigo)":"var(--amber)"}/>
                </div>
              )}
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Milestones</div>
                {account.successPlan.milestones.length===0&&<div style={{fontSize:13,color:"var(--text3)",marginBottom:14}}>No milestones yet.</div>}
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                  {account.successPlan.milestones.map(m=>(
                    <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--bg3)",borderRadius:"var(--r)",
                      padding:"10px 12px",transition:"opacity .15s",opacity:m.done?0.65:1}}>
                      <input type="checkbox" checked={m.done} onChange={()=>toggleMs(m.id)}
                        style={{width:16,height:16,cursor:"pointer",accentColor:"var(--indigo)",flexShrink:0}}/>
                      <span style={{fontSize:13,flex:1,color:m.done?"var(--text3)":"var(--text)",textDecoration:m.done?"line-through":"none"}}>{m.text}</span>
                      <button onClick={()=>delMs(m.id)}
                        style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",display:"flex",alignItems:"center",padding:"3px",borderRadius:"var(--r-xs)"}}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Inp value={newMs} onChange={e=>setNewMs(e.target.value)} placeholder="Add a milestone…"
                    onKeyDown={e=>e.key==="Enter"&&addMs()} style={{flex:1,fontSize:13,padding:"8px 12px"}}/>
                  <Btn onClick={addMs} style={{padding:"8px 16px",fontSize:13}}>+</Btn>
                </div>
              </div>

              {/* Health Digest toggle */}
              <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>Stakeholder Health Digest</div>
                    <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>
                      {digestEnabled
                        ? `A ${digestFreq} health summary is queued for CSM review before sending`
                        : "Auto-prepare a health summary for this account's stakeholders"}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <select value={digestFreq}
                      onChange={async e=>{ const f=e.target.value; setDigestFreq(f);
                        if (digestId) await call("PATCH",`/api/schedules/digests/${digestId}`,{frequency:f}); }}
                      style={{fontSize:11,padding:"4px 8px",background:"var(--bg3)",
                        border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",
                        color:"var(--text)",fontFamily:"var(--font-display)",
                        opacity:digestEnabled?1:0.45}}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    <div onClick={toggleDigest}
                      style={{width:36,height:20,borderRadius:99,
                        cursor:digestToggling?"not-allowed":"pointer",flexShrink:0,
                        background:digestEnabled?"var(--indigo)":"var(--bg4)",
                        opacity:digestToggling?0.6:1,
                        position:"relative",transition:"background .15s, opacity .15s"}}>
                      <div style={{width:16,height:16,borderRadius:"50%",background:"white",
                        position:"absolute",top:2,left:digestEnabled?18:2,transition:"left .15s"}}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT BRIEF TAB */}
          {tab==="brief"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",fontFamily:"var(--font-display)",textTransform:"uppercase",letterSpacing:".06em"}}>Account Brief</div>
                {briefCache&&(
                  <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                    {briefCache==="hit"?"cached":"generated just now"}
                  </span>
                )}
              </div>

              {briefLoading&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:12}}>
                  <div style={{width:20,height:20,border:"2.5px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                  <div style={{fontSize:13,color:"var(--text3)"}}>
                    {briefSlowHint
                      ? "Generating fresh brief — this usually takes 10–15 seconds."
                      : "Loading brief…"}
                  </div>
                </div>
              )}

              {briefError!==null&&!briefLoading&&(
                <div style={{fontSize:13,color:"var(--text3)",textAlign:"center",padding:"48px 0"}}>
                  {briefError===503
                    ? "Brief generation is temporarily unavailable."
                    : "Couldn't generate brief. Reopen the account to retry."}
                </div>
              )}

              {briefData&&!briefLoading&&(
                <>
                  {/* Summary */}
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Summary</div>
                    <div style={{fontSize:14,color:"var(--text)",lineHeight:1.6}}>{briefData.summary}</div>
                  </div>

                  {/* Themes */}
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Themes</div>
                    {briefData.themes.map((theme,i)=>(
                      <div key={i} style={{paddingBottom:i<briefData.themes.length-1?12:0,marginBottom:i<briefData.themes.length-1?12:0,borderBottom:i<briefData.themes.length-1?"1px solid var(--border)":"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
                            background:theme.sentiment==="positive"?"var(--emerald)":theme.sentiment==="negative"?"var(--rose)":"var(--text3)"}}/>
                          <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{theme.topic}</span>
                        </div>
                        <div style={{fontSize:12,color:"var(--text3)",marginTop:4,marginLeft:16}}>{theme.evidence}</div>
                      </div>
                    ))}
                  </div>

                  {/* Talking Points */}
                  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Talking Points</div>
                    {briefData.talking_points.map((tp,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginTop:i>0?12:0}}>
                        <div style={{width:4,height:4,borderRadius:1,background:"var(--indigo)",marginTop:6,flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{tp.point}</div>
                          <div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",marginTop:4}}>{tp.rationale}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risks — omit section if no risks have a description */}
                  {briefData.risks.filter(r=>r.description!=null).length>0&&(
                    <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                      <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Risks</div>
                      {briefData.risks.filter(r=>r.description!=null).map((risk,i)=>{
                        const sevColor=risk.severity==="high"?"var(--rose)":risk.severity==="medium"?"var(--amber)":"var(--text3)";
                        const sevBg   =risk.severity==="high"?"var(--rose-dim)":risk.severity==="medium"?"var(--amber-dim)":"var(--bg3)";
                        return (
                          <div key={i} style={{marginTop:i>0?10:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:10,fontWeight:700,color:sevColor,background:sevBg,padding:"2px 8px",borderRadius:99,flexShrink:0}}>{risk.severity.toUpperCase()}</span>
                              <span style={{fontSize:13,color:"var(--text)"}}>{risk.description}</span>
                            </div>
                            {risk.owner&&<div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>Owner: {risk.owner}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommended Playbooks — omit section if empty */}
                  {briefData.playbooks.length>0&&(
                    <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",boxShadow:"var(--shadow-xs)",padding:16}}>
                      <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Recommended Playbooks</div>
                      {briefData.playbooks.map((pb,i)=>(
                        <div key={i} style={{marginTop:i>0?10:0}}>
                          <span style={{fontSize:12,fontWeight:600,color:"var(--indigo)",background:"var(--indigo-dim)",padding:"2px 10px",borderRadius:99}}>{pb.name}</span>
                          <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{pb.trigger_reason}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Action — distinct indigo-dim background to make it the primary CTA */}
                  <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(59,94,222,0.15)",borderRadius:"var(--r-lg)",padding:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--indigo)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Next Action</div>
                    <div style={{fontSize:14,fontWeight:600,color:"var(--text)",lineHeight:1.5}}>{briefData.next_action}</div>
                  </div>
                </>
              )}

            </div>
          )}


    {tab==="handoff"&&(
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,fontFamily:"var(--font-display)",fontWeight:700,color:"var(--text)"}}>Catch Up & Handoff</h3>
          {!handoffLoading&&(
            <button onClick={()=>{handoffFetchedRef.current=false;setHandoffData(null);setHandoffError(false);setHandoffLoading(true);setHandoffNonce(n=>n+1);}}
              style={{padding:"6px 14px",borderRadius:"var(--r-sm)",fontSize:13,cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,border:"1.5px solid var(--border)",background:"transparent",color:"var(--text2)"}}>
              Refresh
            </button>
          )}
        </div>
        {handoffLoading&&(
          <div style={{color:"var(--text2)",fontSize:14}}>
            Assembling the handoff…
            {handoffSlowHint&&(<div style={{marginTop:6,fontSize:13,color:"var(--text2)",opacity:.7}}>Synthesizing from the account timeline — this can take a few seconds.</div>)}
          </div>
        )}
        {!handoffLoading&&handoffError&&(
          <div style={{color:"var(--rose)",fontSize:14}}>Couldn't assemble the handoff. Try Refresh.</div>
        )}
        {!handoffLoading&&!handoffError&&handoffData&&(()=>{
          const h = handoffData;
          const a = h.account || {};
          const ST = {margin:"24px 0 8px",fontSize:12,letterSpacing:.4,textTransform:"uppercase",fontFamily:"var(--font-display)",fontWeight:700,color:"var(--text2)"};
          const ROW = {display:"flex",justifyContent:"space-between",gap:16,padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:14};
          const L = {color:"var(--text2)"};
          const V = {color:"var(--text)",fontWeight:600,textAlign:"right"};
          const EM = {color:"var(--text2)",fontSize:14,fontStyle:"italic"};
          const NO_CTX = "No relevant context found for this request.";
          return (
            <div>
              <div style={ST}>Recap</div>
              {h.recap&&h.recap.narrative&&h.recap.narrative!==NO_CTX?(
                <CitedNarrative text={h.recap.narrative} citations={h.recap.citations} />
              ):(<div style={EM}>No activity to summarize yet.</div>)}
              <div style={ST}>Snapshot</div>
              <div style={ROW}><span style={L}>Stage</span><span style={V}>{a.stage||"—"}</span></div>
              <div style={ROW}><span style={L}>ARR</span><span style={V}>{a.arr!=null?`$${a.arr}`:"—"}</span></div>
              <div style={ROW}><span style={L}>Plan</span><span style={V}>{a.plan||"—"}</span></div>
              <div style={ROW}><span style={L}>Renewal</span><span style={V}>{a.renewal_date||"—"}</span></div>
              <div style={ROW}><span style={L}>Health</span><span style={V}>{a.health_score!=null?a.health_score:"—"}{a.trend?` · ${a.trend}`:""}{a.momentum?.label?` · ${a.momentum.label}`:""}</span></div>
              <div style={ROW}><span style={L}>Churn risk</span><span style={V}>{a.churn_risk!=null?`${a.churn_risk}%`:"—"}</span></div>
              <div style={ROW}><span style={L}>NPS</span><span style={V}>{a.nps!=null?a.nps:"—"}</span></div>
              <div style={ROW}><span style={L}>Last contact</span><span style={V}>{a.last_contact||"—"}</span></div>

              <div style={ST}>Recommended next play</div>
              {h.recommended_playbook?(
                <div style={{fontSize:14,color:"var(--text)"}}>
                  <div style={{fontWeight:700,marginBottom:4}}>{h.recommended_playbook.name||"—"}</div>
                  {h.recommended_playbook.reason&&<div style={{color:"var(--text2)",lineHeight:1.5}}>{h.recommended_playbook.reason}</div>}
                </div>
              ):(<div style={EM}>No recommended play right now.</div>)}

              <div style={ST}>Active playbook</div>
              {h.active_playbook?(
                h.active_playbook.name?(
                  <div style={{fontSize:14,color:"var(--text)"}}>
                    <div style={{fontWeight:700,marginBottom:4}}>{h.active_playbook.name}</div>
                    {h.active_playbook.scenario&&<div style={{color:"var(--text2)",lineHeight:1.5}}>{h.active_playbook.scenario}</div>}
                  </div>
                ):(<div style={EM}>An active playbook is set, but its details are unavailable.</div>)
              ):(<div style={EM}>No active playbook.</div>)}

              <div style={ST}>Stakeholders</div>
              {h.stakeholders&&h.stakeholders.length>0?(
                h.stakeholders.map((s,i)=>(
                  <div key={i} style={ROW}>
                    <span style={L}>{s.name||"—"}{s.title?` · ${s.title}`:""}{s.role?` (${s.role})`:""}</span>
                    <span style={V}>{s.sentiment||""}</span>
                  </div>
                ))
              ):(<div style={EM}>No stakeholders mapped.</div>)}

              <div style={ST}>Open tasks</div>
              {h.open_tasks&&h.open_tasks.length>0?(
                h.open_tasks.map((t,i)=>(
                  <div key={i} style={ROW}>
                    <span style={L}>{t.title||"—"}{t.priority?` · ${t.priority}`:""}</span>
                    <span style={V}>{t.due_date||""}</span>
                  </div>
                ))
              ):(<div style={EM}>No open tasks.</div>)}


              {h.generated_at&&(<div style={{marginTop:24,fontSize:12,color:"var(--text2)",opacity:.7}}>Generated {new Date(h.generated_at).toLocaleString()}</div>)}
            </div>
          );
        })()}
      </div>
    )}

    {tab==="tickets"&&(
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,fontFamily:"var(--font-display)",fontWeight:700,color:"var(--text)"}}>Support Tickets</h3>
          {!ticketsLoading&&(
            <button onClick={()=>{ticketsFetchedRef.current=false;setTicketsData(null);setTicketsError(false);setTicketsLoading(true);setTicketsNonce(n=>n+1);}}
              style={{padding:"6px 14px",borderRadius:"var(--r-sm)",fontSize:13,cursor:"pointer",fontFamily:"var(--font-display)",fontWeight:600,border:"1.5px solid var(--border)",background:"transparent",color:"var(--text2)"}}>
              Refresh
            </button>
          )}
        </div>
        {ticketsLoading&&(
          <div style={{fontSize:13,color:"var(--text2)"}}>Loading tickets…{ticketsSlowHint&&(<div style={{marginTop:4,fontSize:12,color:"var(--text3)"}}>Reading synced support tickets — a moment.</div>)}</div>
        )}
        {!ticketsLoading&&ticketsError&&(
          <div style={{fontSize:13,color:"var(--rose)"}}>Couldn't load tickets. Try Refresh.</div>
        )}
        {!ticketsLoading&&!ticketsError&&ticketsData&&(()=>{
          const td=ticketsData;
          const c=td.counts||{open:0,critical:0,ageing:0};
          const pColor=p=>p==="urgent"?"var(--rose)":p==="high"?"#d97706":p==="normal"?"var(--text2)":"var(--text3)";
          const ageLabel=n=>n==null?"—":n===0?"today":`${n}d`;
          if(!td.open||!td.open.length){
            return (
              <div style={{fontSize:13,color:"var(--text3)",lineHeight:1.6,background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px"}}>
                No open tickets synced for this account.{(td.account_open_tickets||0)>0?` The connector reports ${td.account_open_tickets} open ticket(s) but does not sync individual ticket detail.`:""}
              </div>
            );
          }
          return (
            <div>
              <div style={{display:"flex",flexWrap:"wrap",gap:18,marginBottom:14}}>
                {[["Open",c.open],["Critical",c.critical],["Ageing >7d",c.ageing]].map(([k,v])=>(
                  <div key={k}>
                    <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--font-display)",fontVariantNumeric:"tabular-nums",color:k==="Critical"&&v>0?"var(--rose)":"var(--text)"}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {td.open.map((t,i)=>(
                  <div key={t.externalId||i} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"10px 14px"}}>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {t.url?(<a href={t.url} target="_blank" rel="noreferrer" style={{color:"var(--text)",textDecoration:"none"}}>{t.subject}</a>):t.subject}
                      </div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                        <span style={{color:pColor(t.priority),fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>{t.priority}</span>
                        {t.status?` · ${t.status}`:""}{` · open ${ageLabel(t.ageDays)}`}{t.isAgeing?" · ageing":""}
                      </div>
                    </div>
                    {t.url&&(<a href={t.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"var(--indigo)",whiteSpace:"nowrap",textDecoration:"none"}}>Open ↗</a>)}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {!ticketsLoading&&!ticketsError&&!ticketsData&&(
          <div style={{fontSize:12,color:"var(--text3)"}}>No ticket data loaded.</div>
        )}
      </div>
    )}

        </div>
      </div>

      {showStk &&<StakeholderModal account={account} onClose={()=>setShowStk(false)} onUpdate={onUpdate} toast={toast}/>}
      {showEdit&&<AccountForm existing={account} onClose={()=>setShowEdit(false)} onSave={upd=>{onUpdate(account.id,upd);}} toast={toast}/>}
      {showCES &&<LogCES account={account} onClose={()=>setShowCES(false)} onUpdate={onUpdate} toast={toast}/>}
      {showPortal&&<PortalModal account={account} call={call} toast={toast} onClose={()=>setShowPortal(false)}/>}
      {showPrep&&<CallPrepModal account={account} onClose={()=>setShowPrep(false)}
        onSaveNotes={(id,notes)=>onUpdate(id,{prepNotes:notes})} toast={toast} call={call}/>}
      {showDel &&<Confirm msg={`Permanently delete "${account.name}"? This cannot be undone.`}
        onConfirm={()=>{onDelete(account.id);setShowDel(false);toast("Account deleted","info");}}
        onCancel={()=>setShowDel(false)}/>}
      {showChurn&&<ChurnModal account={account} call={call} toast={toast}
        onClose={()=>setShowChurn(false)}
        onChurned={()=>{onUpdate(account.id,{archived:true});setShowChurn(false);onClose();}}/>}
      {closeoutMeeting&&(
        <CloseoutModal
          meeting={closeoutMeeting}
          onClose={()=>setCloseoutMeeting(null)}
          call={call}
          toast={toast}
        />
      )}
      {showEscalate&&(
        <div onClick={e=>e.target===e.currentTarget&&setShowEscalate(false)}
          style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",backdropFilter:"blur(6px)",
            display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
          <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:460,
            padding:28,boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:6}}>
              {account.escalationStatus==="open"?"Manage Escalation":"Escalate Account"}
            </div>
            <div style={{fontSize:13,color:"var(--text3)",marginBottom:20}}>
              {account.escalationStatus==="open"
                ?"Update the escalation or mark it resolved."
                :`Flag ${account.name} as an active escalation visible in your Daily Briefing.`}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:6}}>Reason / Description</div>
              <textarea value={escReasonDraft} onChange={e=>setEscReasonDraft(e.target.value)}
                placeholder="What's the issue? e.g. Executive sponsor churned, SLA breach, critical bug…"
                style={{width:"100%",padding:"9px 12px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
                  background:"var(--bg3)",color:"var(--text)",fontSize:13,resize:"vertical",minHeight:80,
                  fontFamily:"var(--font-display)"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:6}}>Internal notes (optional)</div>
              <textarea value={escNotesDraft} onChange={e=>setEscNotesDraft(e.target.value)}
                placeholder="Stakeholders involved, action plan…"
                style={{width:"100%",padding:"9px 12px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
                  background:"var(--bg3)",color:"var(--text)",fontSize:13,resize:"vertical",minHeight:60,
                  fontFamily:"var(--font-display)"}}/>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {account.escalationStatus==="open"&&(
                <button onClick={()=>{
                  onUpdate(account.id,{escalationStatus:"resolved",escalationReason:escReasonDraft,escalationNotes:escNotesDraft});
                  setShowEscalate(false);toast("Escalation resolved","success");
                }} style={{padding:"9px 18px",borderRadius:"var(--r)",border:"1.5px solid rgba(5,150,105,.4)",
                  background:"rgba(5,150,105,.08)",color:"var(--emerald)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  Mark Resolved
                </button>
              )}
              <button onClick={()=>{
                if (!escReasonDraft.trim()) return;
                onUpdate(account.id,{
                  escalationStatus:"open",
                  escalationReason:escReasonDraft,
                  escalationNotes:escNotesDraft,
                  escalationSince:account.escalationSince||new Date().toISOString().split("T")[0],
                });
                setShowEscalate(false);toast("Account escalated","success");
              }} style={{flex:1,padding:"9px 18px",borderRadius:"var(--r)",border:"none",
                background:"var(--rose)",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {account.escalationStatus==="open"?"Update Escalation":"Escalate Account"}
              </button>
              <button onClick={()=>setShowEscalate(false)}
                style={{padding:"9px 18px",borderRadius:"var(--r)",border:"1.5px solid var(--border)",
                  background:"none",color:"var(--text2)",fontSize:13,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { AccountForm };
export default Detail;
