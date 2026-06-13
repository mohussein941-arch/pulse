import { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "./ui";

// m3d.1c — Detail Escape handler defers to CloseoutModal (see TECH_DEBT for broader Modal Escape conflict)
const CloseoutModal = ({ meeting, onClose, call, toast }) => {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [fromCache,     setFromCache]     = useState(null);
  const [slowHint,      setSlowHint]      = useState(false);
  const [healthLogged,  setHealthLogged]  = useState(false);
  const [healthLogging, setHealthLogging] = useState(false);
  const [crmContent,    setCrmContent]    = useState("");
  const [crmAccepted,   setCrmAccepted]   = useState(false);
  const [crmAccepting,  setCrmAccepting]  = useState(false);
  const [emailSubject,  setEmailSubject]  = useState("");
  const [emailBody,     setEmailBody]     = useState("");
  const [emailSent,     setEmailSent]     = useState(false);
  const [emailSending,  setEmailSending]  = useState(false);
  const [tasks,           setTasks]           = useState([]);
  const [tasksAccepted,   setTasksAccepted]   = useState(false);
  const [tasksAccepting,  setTasksAccepting]  = useState(false);
  const slowTimer                 = useRef(null);

  const fetchCloseout = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    slowTimer.current = setTimeout(() => setSlowHint(true), 2000);
    try {
      const body = force ? { force: true } : {};
      const result = await call("POST", `/api/meetings/${meeting.id}/closeout`, body);
      setData(result.content);
      setFromCache(result.fromCache);
      const at = result.actions_taken || {};
      setHealthLogged(at.health_logged ?? false);
      setCrmAccepted(at.crm_accepted ?? false);
      setEmailSent(at.email_sent ?? false);
      setTasksAccepted(at.tasks_accepted ?? false);
    } catch (err) {
      setError(err);
    } finally {
      clearTimeout(slowTimer.current);
      setSlowHint(false);
      setLoading(false);
    }
  }, [call, meeting.id]);

  const logHealthSignal = async () => {
    if (!data?.health_signal || healthLogging || healthLogged) return;
    setHealthLogging(true);
    try {
      await call("POST", `/api/meetings/${meeting.id}/log-health-signal`, {
        direction: data.health_signal.direction,
        magnitude: data.health_signal.magnitude,
        rationale: data.health_signal.rationale,
      });
      setHealthLogged(true);
      toast("Health signal logged to account", "success");
    } catch (err) {
      toast(err.status === 402 ? "AI usage limit reached." : "Couldn't log health signal — try again.", "error");
    } finally {
      setHealthLogging(false);
    }
  };

  const acceptCrmUpdate = async () => {
    const trimmed = crmContent.trim();
    if (!trimmed || crmAccepting || crmAccepted) return;
    setCrmAccepting(true);
    try {
      await call("POST", `/api/meetings/${meeting.id}/accept-crm-update`, { content: trimmed });
      setCrmAccepted(true);
      toast("CRM update logged", "success");
    } catch (err) {
      toast(err.status === 402 ? "AI usage limit reached." : "Couldn't log CRM update — try again.", "error");
    } finally {
      setCrmAccepting(false);
    }
  };

  const sendFollowup = async () => {
    const subj = emailSubject.trim();
    const body = emailBody.trim();
    if (!subj || !body || emailSending || emailSent || !meeting.organizer_email) return;
    setEmailSending(true);
    try {
      await call("POST", `/api/meetings/${meeting.id}/send-followup`, {
        to: meeting.organizer_email,
        subject: subj,
        body,
      });
      setEmailSent(true);
      toast("Follow-up email sent", "success");
    } catch (err) {
      toast(
        err.status === 402
          ? "AI usage limit reached."
          : err.message || "Couldn't send follow-up email — try again.",
        "error"
      );
    } finally {
      setEmailSending(false);
    }
  };

  const updateTask = (idx, field, value) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };
  const removeTask = (idx) => {
    setTasks(prev => prev.filter((_, i) => i !== idx));
  };
  const acceptTasks = async () => {
    if (tasks.length === 0 || tasksAccepting || tasksAccepted) return;
    setTasksAccepting(true);
    try {
      await call("POST", `/api/meetings/${meeting.id}/accept-tasks`, { tasks });
      setTasksAccepted(true);
      toast(`${tasks.length} task${tasks.length === 1 ? '' : 's'} created`, "success");
    } catch (err) {
      toast(
        err.status === 402 ? "AI usage limit reached." : err.message || "Couldn't create tasks — try again.",
        "error"
      );
    } finally {
      setTasksAccepting(false);
    }
  };

  useEffect(() => {
    if (data?.crm_update_text) setCrmContent(data.crm_update_text);
  }, [data]);

  useEffect(() => {
    if (data?.follow_up_email) {
      setEmailSubject(data.follow_up_email.subject || "");
      setEmailBody(data.follow_up_email.body || "");
    }
  }, [data]);

  useEffect(() => {
    setTasks(data?.suggested_tasks ? data.suggested_tasks.map(t => ({ ...t })) : []);
  }, [data]);

  useEffect(() => {
    if (meeting.has_closeout) fetchCloseout(false);
  }, [meeting.has_closeout, fetchCloseout]);

  const sLabel = {fontSize:11,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:8};
  const sentMap = {
    positive: {bg:"var(--emerald-dim)",color:"var(--emerald)",label:"Positive"},
    neutral:  {bg:"var(--bg3)",        color:"var(--text3)",  label:"Neutral"},
    at_risk:  {bg:"var(--rose-dim)",   color:"var(--rose)",   label:"At risk"},
  };
  const dirMap = {
    positive: {color:"var(--emerald)",label:"Positive"},
    neutral:  {color:"var(--text3)",  label:"Neutral"},
    negative: {color:"var(--rose)",   label:"Negative"},
  };
  const magMap = {minor:"Minor",moderate:"Moderate",significant:"Significant"};
  const ownMap = {
    customer: {bg:"var(--sky-dim)",   color:"var(--sky)",   label:"Customer"},
    us:       {bg:"var(--indigo-dim)",color:"var(--indigo)",label:"Us"},
  };

  const errMsg = !error ? null
    : error.status===402 ? "AI usage limit reached. Add credits in Settings → AI."
    : error.status===400 ? "No transcript available for this meeting."
    : (error.message || "Couldn't load closeout");

  return (
    <Modal title={meeting.title} onClose={onClose} wide>
      {/* Metadata row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)",paddingTop:4}}>
          {(meeting.meeting_date||"").slice(0,10)}
        </span>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          {!data&&!loading&&(
            <>
              <button onClick={()=>fetchCloseout(false)} disabled={!meeting.has_transcript}
                style={{background:meeting.has_transcript?"var(--indigo)":"var(--bg3)",
                  color:meeting.has_transcript?"white":"var(--text3)",
                  border:"none",borderRadius:"var(--r-sm)",padding:"6px 14px",
                  fontSize:13,fontWeight:600,cursor:meeting.has_transcript?"pointer":"not-allowed"}}>
                Generate closeout
              </button>
              {!meeting.has_transcript&&(
                <span style={{fontSize:11,color:"var(--text3)"}}>No transcript available — closeout can't be generated.</span>
              )}
            </>
          )}
          {data&&!loading&&(
            <button type="button" onClick={()=>fetchCloseout(true)}
              style={{background:"var(--bg3)",color:"var(--text2)",border:"1px solid var(--border)",
                borderRadius:"var(--r-sm)",padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              Regenerate
            </button>
          )}
        </div>
      </div>
      {fromCache===true&&data&&!loading&&(
        <div style={{fontSize:12,color:"var(--text3)",marginBottom:12}}>
          Showing cached closeout · Click Regenerate for a fresh version.
        </div>
      )}
      {/* Loading */}
      {loading&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:12}}>
          <div style={{width:20,height:20,border:"2.5px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          <div style={{fontSize:13,color:"var(--text3)"}}>
            {slowHint?"Generating fresh closeout — this usually takes 10–15 seconds.":"Loading closeout…"}
          </div>
        </div>
      )}
      {/* Error */}
      {error&&!loading&&(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <div style={{fontSize:13,color:"var(--text3)",marginBottom:12}}>{errMsg}</div>
          <button onClick={()=>fetchCloseout(false)}
            style={{background:"var(--bg3)",color:"var(--text2)",border:"1px solid var(--border)",
              borderRadius:"var(--r-sm)",padding:"6px 14px",fontSize:13,cursor:"pointer"}}>
            Try Again
          </button>
        </div>
      )}
      {/* Content */}
      {data&&!loading&&!error&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Summary */}
          <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
            <div style={sLabel}>Summary</div>
            <div style={{fontSize:14,color:"var(--text)",lineHeight:1.6}}>{data.summary}</div>
          </div>
          {/* Sentiment */}
          <div>
            <div style={sLabel}>Sentiment</div>
            {(()=>{const s=sentMap[data.sentiment]||sentMap.neutral;return(
              <span style={{display:"inline-block",background:s.bg,color:s.color,borderRadius:99,padding:"3px 12px",fontSize:12,fontWeight:600}}>{s.label}</span>
            )})()}
          </div>
          {/* Health Signal */}
          <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
            <div style={sLabel}>Health Signal</div>
            {data.health_signal&&(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {(()=>{const d=dirMap[data.health_signal.direction]||dirMap.neutral;return(
                    <span style={{fontSize:12,fontWeight:700,color:d.color}}>{d.label}</span>
                  )})()}
                  <span style={{fontSize:12,color:"var(--text3)",fontStyle:"italic"}}>
                    {magMap[data.health_signal.magnitude]||data.health_signal.magnitude}
                  </span>
                </div>
                <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{data.health_signal.rationale}</div>
                {!healthLogged ? (
                  <button type="button" onClick={logHealthSignal} disabled={healthLogging}
                    style={{ alignSelf:"flex-start", marginTop:8, background:"var(--bg3)", color:"var(--text2)",
                      border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 12px",
                      fontSize:12, fontWeight:600, cursor:healthLogging?"wait":"pointer" }}>
                    {healthLogging ? "Logging…" : "Log to account"}
                  </button>
                ) : (
                  <div style={{ marginTop:8, fontSize:12, color:"var(--emerald)", fontWeight:600 }}>
                    ✓ Logged to account
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Action Items */}
          <div>
            <div style={sLabel}>Action Items</div>
            {data.action_items&&data.action_items.length>0?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {data.action_items.map((item,i)=>{
                  const ok=(item.owner||"").toLowerCase();
                  const ow=ownMap[ok]||{bg:"var(--bg3)",color:"var(--text3)",label:item.owner};
                  return(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,
                      background:"var(--bg3)",border:"1px solid var(--border)",
                      borderRadius:"var(--r-sm)",padding:"10px 12px"}}>
                      <div style={{flex:1,fontSize:13,color:"var(--text)",lineHeight:1.5}}>{item.description}</div>
                      <span style={{flexShrink:0,fontSize:10,fontWeight:700,background:ow.bg,color:ow.color,borderRadius:99,padding:"2px 8px"}}>{ow.label}</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <div style={{fontSize:13,color:"var(--text3)"}}>No action items captured.</div>
            )}
          </div>
          {/* CRM Update */}
          <div>
            <div style={sLabel}>CRM Update</div>
            <textarea
              value={crmContent}
              onChange={e => setCrmContent(e.target.value)}
              disabled={crmAccepted || crmAccepting}
              rows={5}
              style={{width:"100%",boxSizing:"border-box",background:"var(--bg2)",color:"var(--text2)",
                border:"1px solid var(--border)",borderRadius:"var(--r-sm)",padding:"10px 12px",
                fontSize:13,fontFamily:"inherit",lineHeight:1.5,resize:"vertical",
                opacity:(crmAccepted||crmAccepting)?0.6:1}}
            />
            {!crmAccepted ? (
              <button type="button" onClick={acceptCrmUpdate} disabled={crmAccepting || !crmContent.trim()}
                style={{ alignSelf:"flex-start", marginTop:8, background:"var(--bg3)", color:"var(--text2)",
                  border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 12px",
                  fontSize:12, fontWeight:600, cursor:(crmAccepting || !crmContent.trim())?"not-allowed":"pointer" }}>
                {crmAccepting ? "Accepting…" : "Accept"}
              </button>
            ) : (
              <div style={{ marginTop:8, fontSize:12, color:"var(--emerald)", fontWeight:600 }}>
                ✓ Logged to CRM
              </div>
            )}
          </div>
          {/* Follow-up Email */}
          <div>
            <div style={sLabel}>Follow-up Email</div>
            {meeting.organizer_email ? (
              <div style={{ fontSize:12, color:"var(--text3)", marginBottom:8 }}>
                To: {meeting.organizer_email}
              </div>
            ) : (
              <div style={{ fontSize:12, color:"var(--text3)", marginBottom:8, fontStyle:"italic" }}>
                No recipient on file — Send disabled.
              </div>
            )}
            <input
              type="text"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              disabled={emailSent || emailSending}
              placeholder="Subject"
              style={{ width:"100%", boxSizing:"border-box", background:"var(--bg2)", color:"var(--text2)",
                border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"8px 12px",
                fontSize:13, fontFamily:"inherit", marginBottom:8,
                opacity:(emailSent||emailSending)?0.6:1 }}
            />
            <textarea
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              disabled={emailSent || emailSending}
              rows={8}
              style={{ width:"100%", boxSizing:"border-box", background:"var(--bg2)", color:"var(--text2)",
                border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"10px 12px",
                fontSize:13, fontFamily:"inherit", lineHeight:1.5, resize:"vertical",
                opacity:(emailSent||emailSending)?0.6:1 }}
            />
            {!emailSent ? (
              <button type="button" onClick={sendFollowup}
                disabled={emailSending || !emailSubject.trim() || !emailBody.trim() || !meeting.organizer_email}
                style={{ alignSelf:"flex-start", marginTop:8, background:"var(--bg3)", color:"var(--text2)",
                  border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 12px",
                  fontSize:12, fontWeight:600, cursor:(emailSending || !emailSubject.trim() || !emailBody.trim() || !meeting.organizer_email)?"not-allowed":"pointer" }}>
                {emailSending ? "Sending…" : "Send"}
              </button>
            ) : (
              <div style={{ marginTop:8, fontSize:12, color:"var(--emerald)", fontWeight:600 }}>
                ✓ Sent
              </div>
            )}
          </div>
          {/* Tasks */}
          <div>
            <div style={sLabel}>Tasks</div>
            {tasksAccepted ? (
              <div style={{ marginTop:8, fontSize:12, color:"var(--emerald)", fontWeight:600 }}>
                ✓ {tasks.length} task{tasks.length === 1 ? '' : 's'} created
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ fontSize:12, color:"var(--text3)", fontStyle:"italic" }}>No tasks suggested</div>
            ) : (
              <>
                {tasks.map((task, idx) => (
                  <div key={idx} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"10px 12px", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <input
                        type="text"
                        value={task.title}
                        onChange={e => updateTask(idx, "title", e.target.value)}
                        disabled={tasksAccepting || tasksAccepted}
                        style={{ flex:1, background:"var(--bg1)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 10px", fontSize:13, fontFamily:"inherit", opacity:(tasksAccepting||tasksAccepted)?0.6:1 }}
                      />
                      <button type="button" onClick={() => removeTask(idx)} disabled={tasksAccepting || tasksAccepted}
                        style={{ background:"none", border:"none", color:"var(--text3)", fontSize:13, cursor:(tasksAccepting||tasksAccepted)?"not-allowed":"pointer", padding:"4px 6px", flexShrink:0 }}>
                        ×
                      </button>
                    </div>
                    <select
                      value={task.priority}
                      onChange={e => updateTask(idx, "priority", e.target.value)}
                      disabled={tasksAccepting || tasksAccepted}
                      style={{ background:"var(--bg1)", color:"var(--text2)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"4px 8px", fontSize:12, marginBottom:6, opacity:(tasksAccepting||tasksAccepted)?0.6:1 }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <textarea
                      value={task.description}
                      onChange={e => updateTask(idx, "description", e.target.value)}
                      disabled={tasksAccepting || tasksAccepted}
                      rows={2}
                      style={{ width:"100%", boxSizing:"border-box", background:"var(--bg1)", color:"var(--text2)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 10px", fontSize:12, fontFamily:"inherit", lineHeight:1.4, resize:"vertical", opacity:(tasksAccepting||tasksAccepted)?0.6:1, marginBottom:task.due_in_days != null ? 6 : 0 }}
                    />
                    {task.due_in_days != null && (
                      <div style={{ fontSize:11, color:"var(--text3)" }}>Due in {task.due_in_days} day{task.due_in_days === 1 ? '' : 's'}</div>
                    )}
                  </div>
                ))}
                <button type="button" onClick={acceptTasks}
                  disabled={tasksAccepting || tasks.length === 0 || tasks.some(t => !t.title?.trim())}
                  style={{ alignSelf:"flex-start", marginTop:4, background:"var(--bg3)", color:"var(--text2)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"6px 12px", fontSize:12, fontWeight:600, cursor:(tasksAccepting || tasks.length === 0 || tasks.some(t => !t.title?.trim()))?"not-allowed":"pointer" }}>
                  {tasksAccepting ? "Creating…" : `Accept ${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CloseoutModal;
