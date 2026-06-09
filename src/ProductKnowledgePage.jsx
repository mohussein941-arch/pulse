import { useState, useEffect, useCallback, useRef } from "react";

const labelStyle = { display:"block", fontSize:12, fontWeight:600, color:"var(--text3)", marginBottom:6, marginTop:16 };
const inputStyle = { width:"100%", boxSizing:"border-box", padding:"10px 12px", fontSize:14, border:"1px solid var(--border2)", borderRadius:8, background:"transparent", color:"inherit", outline:"none", fontFamily:"inherit" };
const textareaStyle = { ...inputStyle, minHeight:72, resize:"vertical", lineHeight:1.5 };
const primaryBtn = { marginTop:20, padding:"10px 18px", fontSize:14, fontWeight:600, color:"#fff", background:"var(--indigo)", border:"none", borderRadius:8, cursor:"pointer" };
const solidBtn = { padding:"7px 16px", fontSize:13, fontWeight:600, color:"#fff", background:"var(--indigo)", border:"none", borderRadius:8, cursor:"pointer" };
const ghostBtn = { padding:"7px 14px", fontSize:13, fontWeight:600, color:"var(--indigo)", background:"transparent", border:"1px solid var(--border2)", borderRadius:8, cursor:"pointer" };
const dangerLink = { background:"none", border:"none", color:"#d4504e", fontSize:12, fontWeight:600, cursor:"pointer", padding:0, flexShrink:0 };
const sectionLabel = { fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"var(--text3)" };
const page = { padding:"32px 36px", width:"100%", boxSizing:"border-box", textAlign:"left" };

const linesToArr = (s) => (s||"").split("\n").map(x=>x.trim()).filter(Boolean);
const arrToLines = (a) => (Array.isArray(a)?a:[]).join("\n");

function Spinner({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:320,flexDirection:"column",gap:16}}>
      <div style={{width:32,height:32,border:"3px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:28}}>
      <div style={sectionLabel}>{title}</div>
      <div style={{marginTop:10}}>{children}</div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{display:"inline-block",fontSize:12,fontWeight:500,padding:"4px 10px",border:"1px solid var(--border2)",borderRadius:999,marginRight:6,marginBottom:6}}>{children}</span>
  );
}

function Field({ label, value, onChange, textarea, placeholder, hint }) {
  return (
    <div style={{marginBottom:14}}>
      <label style={labelStyle}>{label}</label>
      {hint && <div style={{fontSize:11,color:"var(--text3)",marginTop:-2,marginBottom:6}}>{hint}</div>}
      {textarea
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={textareaStyle}/>
        : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/>}
    </div>
  );
}

export default function ProductKnowledgePage({ call, upload, toast }) {
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [knowledge, setKnowledge] = useState({ profile: null, features: [] });
  const [documents, setDocuments] = useState([]);
  const [productName, setProductName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const fileInputRef = useRef(null);

  const refresh = useCallback(async () => {
    const data = await call("GET", "/api/company-knowledge");
    return data || { profile: null, features: [] };
  }, [call]);

  const loadDocs = useCallback(async () => {
    try {
      const d = await call("GET", "/api/company-knowledge/documents");
      setDocuments((d && d.documents) || []);
    } catch (e) { /* non-fatal */ }
  }, [call]);

  const load = useCallback(async () => {
    try {
      const k = await refresh();
      setKnowledge(k);
      if (k.profile) {
        setProductName(k.profile.product_name || "");
        setWebsiteUrl(k.profile.website_url || "");
      }
      await loadDocs();
    } catch (err) {
      toast && toast(err.message || "Failed to load product knowledge");
    } finally {
      setLoading(false);
    }
  }, [refresh, loadDocs, toast]);

  useEffect(() => { load(); }, [load]);

  const onUpload = async (e) => {
    const files = Array.from((e.target && e.target.files) || []);
    if (!files.length) return;
    if (!upload) { toast && toast("Upload unavailable"); return; }
    const fd = new FormData();
    files.forEach(f => fd.append("files", f));
    setUploading(true);
    try {
      const res = await upload("/api/company-knowledge/documents", fd);
      setDocuments((res && res.documents) || documents);
      const ins = (res && res.inserted) || [];
      const fail = (res && res.failed) || [];
      if (ins.length && !fail.length) toast && toast(`Added ${ins.length} document${ins.length>1?"s":""}`);
      else if (ins.length && fail.length) toast && toast(`Added ${ins.length}; ${fail.length} couldn't be read`);
      else if (fail.length) toast && toast(`Couldn't read ${fail.length} file${fail.length>1?"s":""}`);
    } catch (err) {
      toast && toast(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteDoc = async (id) => {
    try {
      await call("DELETE", `/api/company-knowledge/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast && toast("Removed");
    } catch (err) { toast && toast(err.message || "Remove failed"); }
  };

  const runResearch = async () => {
    if (!productName.trim() || !websiteUrl.trim()) { toast && toast("Enter both a product name and a website URL"); return; }
    setResearching(true);
    try {
      const data = await call("POST", "/api/company-knowledge/research", { productName: productName.trim(), websiteUrl: websiteUrl.trim() });
      const k = data || { profile: null, features: [] };
      setKnowledge(k);
      loadDocs();
      toast && toast(k.profile && k.profile.has_draft ? "Refresh ready to review" : "Research complete");
    } catch (err) {
      toast && toast(err.message || "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const startEdit = () => {
    const p = knowledge.profile || {};
    setForm({
      product_name: p.product_name || "",
      website_url: p.website_url || "",
      overview: p.overview || "",
      value_props: arrToLines(p.value_props),
      icp: p.icp || "",
      pricing_summary: p.pricing_summary || "",
      positioning: p.positioning || "",
      competitors: arrToLines(p.competitors),
      target_verticals: (p.target_verticals || []).map(v => ({
        vertical: v.vertical || "",
        common_needs: arrToLines(v.common_needs),
        stakeholders: arrToLines(v.stakeholders),
        language: v.language || "",
        objections: arrToLines(v.objections),
      })),
      features: (knowledge.features || []).map(f => ({
        name: f.name || "",
        problem_solved: f.problem_solved || "",
        use_cases: arrToLines(f.use_cases),
        personas: arrToLines(f.personas),
        tier: f.tier || "",
        trigger_keywords: arrToLines(f.trigger_keywords),
        source: f.source || "manual",
        locked: !!f.locked,
      })),
    });
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setForm(null); };
  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setVertical = (i, key, val) => setForm(prev => { const target_verticals = [...prev.target_verticals]; target_verticals[i] = { ...target_verticals[i], [key]: val }; return { ...prev, target_verticals }; });
  const addVertical = () => setForm(prev => ({ ...prev, target_verticals: [...prev.target_verticals, { vertical:"", common_needs:"", stakeholders:"", language:"", objections:"" }] }));
  const removeVertical = (i) => setForm(prev => ({ ...prev, target_verticals: prev.target_verticals.filter((_, idx) => idx !== i) }));
  const setFeature = (i, key, val) => setForm(prev => { const features = [...prev.features]; features[i] = { ...features[i], [key]: val }; return { ...prev, features }; });
  const addFeature = () => setForm(prev => ({ ...prev, features: [...prev.features, { name:"", problem_solved:"", use_cases:"", personas:"", tier:"", trigger_keywords:"", source:"manual", locked:true }] }));
  const removeFeature = (i) => setForm(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));

  const saveEdit = async () => {
    setSaving(true);
    try {
      const profilePayload = {
        product_name: form.product_name.trim(),
        website_url: form.website_url.trim(),
        overview: form.overview.trim(),
        value_props: linesToArr(form.value_props),
        icp: form.icp.trim(),
        pricing_summary: form.pricing_summary.trim(),
        positioning: form.positioning.trim(),
        competitors: linesToArr(form.competitors),
        target_verticals: form.target_verticals.map(v => ({
          vertical: v.vertical.trim(),
          common_needs: linesToArr(v.common_needs),
          stakeholders: linesToArr(v.stakeholders),
          language: v.language.trim(),
          objections: linesToArr(v.objections),
        })).filter(v => v.vertical),
      };
      const featuresPayload = form.features.map(f => ({
        name: f.name.trim(),
        problem_solved: f.problem_solved.trim(),
        use_cases: linesToArr(f.use_cases),
        personas: linesToArr(f.personas),
        tier: f.tier.trim() || null,
        trigger_keywords: linesToArr(f.trigger_keywords),
        source: f.source || "manual",
        locked: !!f.locked,
      })).filter(f => f.name);

      await call("PATCH", "/api/company-knowledge", profilePayload);
      await call("PUT", "/api/company-knowledge/features", { features: featuresPayload });
      const k = await refresh();
      setKnowledge(k);
      setEditing(false); setForm(null);
      toast && toast("Saved");
    } catch (err) {
      toast && toast(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmProfile = async () => {
    try {
      await call("PATCH", "/api/company-knowledge", { confirmed: true });
      const k = await refresh(); setKnowledge(k);
      toast && toast("Confirmed");
    } catch (err) { toast && toast(err.message || "Confirm failed"); }
  };

  const applyDraft = async () => {
    try {
      const data = await call("POST", "/api/company-knowledge/apply-draft");
      setKnowledge(data || await refresh());
      toast && toast("Updates applied");
    } catch (err) { toast && toast(err.message || "Apply failed"); }
  };

  const discardDraft = async () => {
    try {
      const data = await call("POST", "/api/company-knowledge/discard-draft");
      setKnowledge(data || await refresh());
      toast && toast("Draft discarded");
    } catch (err) { toast && toast(err.message || "Discard failed"); }
  };

  const profile = knowledge.profile;
  const features = knowledge.features || [];
  const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); } catch { return ""; } };

  const uploadControl = (
    <div>
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.pptx,.xlsx" onChange={onUpload} style={{display:"none"}}/>
      <div onClick={()=>{ if(!uploading && fileInputRef.current) fileInputRef.current.click(); }}
        style={{border:"1.5px dashed var(--border2)",borderRadius:10,padding:"20px",textAlign:"center",cursor:uploading?"default":"pointer"}}>
        <div style={{fontSize:13,fontWeight:600}}>{uploading?"Reading documents…":"Upload product docs & slides"}</div>
        <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>PDF, Word, or PowerPoint — they feed the research.</div>
      </div>
    </div>
  );

  const docsList = documents.length > 0 ? (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {documents.map(d => (
        <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,border:"1px solid var(--border2)",borderRadius:8,padding:"8px 12px"}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.title}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{d.kind==="document"?"Document":"Web research"}{d.created_at?` · ${fmtDate(d.created_at)}`:""}</div>
          </div>
          <button onClick={()=>deleteDoc(d.id)} style={dangerLink}>Remove</button>
        </div>
      ))}
    </div>
  ) : null;

  const header = (
    <div style={{marginBottom:28}}>
      <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Product Knowledge</h1>
      <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>What Pulse knows about your own product and market</div>
    </div>
  );

  if (loading) return <div style={page}>{header}<Spinner label="Loading product knowledge…"/></div>;
  if (researching) return <div style={page}>{header}<Spinner label="Searching the web and building your profile — this can take up to a minute."/></div>;

  if (!profile) {
    return (
      <div style={page}>
        {header}
        <div style={{maxWidth:560}}>
          <p style={{fontSize:14,color:"var(--text3)",marginBottom:8,lineHeight:1.55}}>
            Teach Pulse about your product so it can act as a strategic advisor — surfacing the right features and talk tracks when a customer's needs show up in emails and meetings.
          </p>
          <label style={labelStyle}>Product name</label>
          <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Acme Support Cloud" style={inputStyle}/>
          <label style={labelStyle}>Website URL</label>
          <input value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} placeholder="https://…" style={inputStyle}/>
          <div style={{marginTop:18}}>{uploadControl}</div>
          {docsList && <div style={{marginTop:12}}>{docsList}</div>}
          <button onClick={runResearch} style={primaryBtn}>Research my product</button>
        </div>
      </div>
    );
  }

  if (editing && form) {
    return (
      <div style={{...page, maxWidth:820}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.04em"}}>Editing product knowledge</h1>
          <div style={{display:"flex",gap:8}}>
            <button onClick={cancelEdit} style={ghostBtn} disabled={saving}>Cancel</button>
            <button onClick={saveEdit} style={solidBtn} disabled={saving}>{saving?"Saving…":"Save"}</button>
          </div>
        </div>

        <Field label="Product name" value={form.product_name} onChange={v=>setF("product_name",v)} />
        <Field label="Website URL" value={form.website_url} onChange={v=>setF("website_url",v)} />
        <Field label="Overview" textarea value={form.overview} onChange={v=>setF("overview",v)} />
        <Field label="Value props" textarea hint="One per line." value={form.value_props} onChange={v=>setF("value_props",v)} />
        <Field label="Ideal customer" textarea value={form.icp} onChange={v=>setF("icp",v)} />
        <Field label="Pricing" textarea value={form.pricing_summary} onChange={v=>setF("pricing_summary",v)} />
        <Field label="Positioning" textarea value={form.positioning} onChange={v=>setF("positioning",v)} />
        <Field label="Competitors" textarea hint="One per line." value={form.competitors} onChange={v=>setF("competitors",v)} />

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,marginBottom:10}}>
          <div style={sectionLabel}>Target verticals</div>
          <button onClick={addVertical} style={ghostBtn}>+ Add vertical</button>
        </div>
        {form.target_verticals.map((v,i)=>(
          <div key={i} style={{border:"1px solid var(--border2)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:4}}>
              <input value={v.vertical} onChange={e=>setVertical(i,"vertical",e.target.value)} placeholder="Vertical name" style={{...inputStyle,fontWeight:700}}/>
              <button onClick={()=>removeVertical(i)} style={dangerLink}>Remove</button>
            </div>
            <Field label="Needs" textarea hint="One per line." value={v.common_needs} onChange={val=>setVertical(i,"common_needs",val)} />
            <Field label="Stakeholders" textarea hint="One per line." value={v.stakeholders} onChange={val=>setVertical(i,"stakeholders",val)} />
            <Field label="Language" textarea value={v.language} onChange={val=>setVertical(i,"language",val)} />
            <Field label="Objections" textarea hint="One per line." value={v.objections} onChange={val=>setVertical(i,"objections",val)} />
          </div>
        ))}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,marginBottom:10}}>
          <div style={sectionLabel}>Features</div>
          <button onClick={addFeature} style={ghostBtn}>+ Add feature</button>
        </div>
        {form.features.map((f,i)=>(
          <div key={i} style={{border:"1px solid var(--border2)",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:4}}>
              <input value={f.name} onChange={e=>setFeature(i,"name",e.target.value)} placeholder="Feature name" style={{...inputStyle,fontWeight:700}}/>
              <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
                <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text3)",cursor:"pointer",whiteSpace:"nowrap"}}>
                  <input type="checkbox" checked={f.locked} onChange={e=>setFeature(i,"locked",e.target.checked)}/> Lock
                </label>
                <button onClick={()=>removeFeature(i)} style={dangerLink}>Remove</button>
              </div>
            </div>
            <Field label="Problem solved" textarea value={f.problem_solved} onChange={val=>setFeature(i,"problem_solved",val)} />
            <Field label="Tier" value={f.tier} onChange={val=>setFeature(i,"tier",val)} />
            <Field label="Use cases" textarea hint="One per line." value={f.use_cases} onChange={val=>setFeature(i,"use_cases",val)} />
            <Field label="Personas" textarea hint="One per line." value={f.personas} onChange={val=>setFeature(i,"personas",val)} />
            <Field label="Trigger keywords" textarea hint="One per line." value={f.trigger_keywords} onChange={val=>setFeature(i,"trigger_keywords",val)} />
          </div>
        ))}

        <div style={{display:"flex",gap:8,marginTop:24}}>
          <button onClick={saveEdit} style={solidBtn} disabled={saving}>{saving?"Saving…":"Save"}</button>
          <button onClick={cancelEdit} style={ghostBtn} disabled={saving}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{...page, maxWidth:820}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:16}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>{profile.product_name || "Product Knowledge"}</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            {profile.website_url}{profile.generated_at?` · researched ${fmtDate(profile.generated_at)}`:""}{profile.confirmed?" · confirmed":" · draft"}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          <button onClick={startEdit} style={ghostBtn}>Edit</button>
          {!profile.confirmed && <button onClick={confirmProfile} style={solidBtn}>Confirm</button>}
          <button onClick={runResearch} style={ghostBtn}>Re-research</button>
        </div>
      </div>

      {profile.has_draft && (
        <div style={{border:"1px solid var(--indigo)",borderRadius:10,padding:"14px 16px",marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>New findings from a refresh are ready</div>
          <div style={{fontSize:13,color:"var(--text3)",marginBottom:12,lineHeight:1.5}}>A re-research found updated information. Your confirmed profile stays as-is until you apply these.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={applyDraft} style={solidBtn}>Apply updates</button>
            <button onClick={discardDraft} style={ghostBtn}>Discard</button>
          </div>
        </div>
      )}

      {profile.overview && (<Section title="Overview"><p style={{fontSize:14,lineHeight:1.6,margin:0}}>{profile.overview}</p></Section>)}

      {Array.isArray(profile.value_props) && profile.value_props.length>0 && (
        <Section title="Value props">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {profile.value_props.map((v,i)=>(
              <div key={i} style={{fontSize:14,lineHeight:1.5,paddingLeft:14,position:"relative"}}>
                <span style={{position:"absolute",left:0,color:"var(--indigo)"}}>•</span>{v}
              </div>
            ))}
          </div>
        </Section>
      )}

      {profile.icp && (<Section title="Ideal customer"><p style={{fontSize:14,lineHeight:1.6,margin:0}}>{profile.icp}</p></Section>)}
      {profile.pricing_summary && (<Section title="Pricing"><p style={{fontSize:14,lineHeight:1.6,margin:0}}>{profile.pricing_summary}</p></Section>)}
      {profile.positioning && (<Section title="Positioning"><p style={{fontSize:14,lineHeight:1.6,margin:0}}>{profile.positioning}</p></Section>)}

      {Array.isArray(profile.competitors) && profile.competitors.length>0 && (
        <Section title="Competitors"><div>{profile.competitors.map((c,i)=><Chip key={i}>{c}</Chip>)}</div></Section>
      )}

      {Array.isArray(profile.target_verticals) && profile.target_verticals.length>0 && (
        <Section title="Target verticals">
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {profile.target_verticals.map((v,i)=>(
              <div key={i} style={{border:"1px solid var(--border2)",borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{v.vertical}</div>
                {Array.isArray(v.common_needs)&&v.common_needs.length>0 && (<div style={{fontSize:13,marginBottom:6}}><span style={{color:"var(--text3)"}}>Needs: </span>{v.common_needs.join(", ")}</div>)}
                {Array.isArray(v.stakeholders)&&v.stakeholders.length>0 && (<div style={{fontSize:13,marginBottom:6}}><span style={{color:"var(--text3)"}}>Stakeholders: </span>{v.stakeholders.join(", ")}</div>)}
                {v.language && (<div style={{fontSize:13,marginBottom:6}}><span style={{color:"var(--text3)"}}>Language: </span>{v.language}</div>)}
                {Array.isArray(v.objections)&&v.objections.length>0 && (<div style={{fontSize:13}}><span style={{color:"var(--text3)"}}>Objections: </span>{v.objections.join(", ")}</div>)}
              </div>
            ))}
          </div>
        </Section>
      )}

      {features.length>0 && (
        <Section title={`Features (${features.length})`}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {features.map((f)=>(
              <div key={f.id||f.name} style={{border:"1px solid var(--border2)",borderRadius:10,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:700}}>{f.name}</span>
                  {f.locked && <span style={{fontSize:11,color:"var(--text3)"}}>🔒</span>}
                  {f.tier && <Chip>{f.tier}</Chip>}
                </div>
                {f.problem_solved && <div style={{fontSize:13,lineHeight:1.5,marginBottom:8}}>{f.problem_solved}</div>}
                {Array.isArray(f.trigger_keywords)&&f.trigger_keywords.length>0 && (<div>{f.trigger_keywords.map((k,i)=><Chip key={i}>{k}</Chip>)}</div>)}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Knowledge inputs">
        {uploadControl}
        {docsList && <div style={{marginTop:12}}>{docsList}</div>}
      </Section>

      {Array.isArray(profile.sources) && profile.sources.length>0 && (
        <Section title="Sources">
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {profile.sources.map((s,i)=>(<a key={i} href={s} target="_blank" rel="noreferrer" style={{fontSize:12,color:"var(--indigo)",wordBreak:"break-all"}}>{s}</a>))}
          </div>
        </Section>
      )}
    </div>
  );
}
