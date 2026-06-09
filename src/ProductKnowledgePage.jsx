import { useState, useEffect, useCallback } from "react";

const labelStyle = { display:"block", fontSize:12, fontWeight:600, color:"var(--text3)", marginBottom:6, marginTop:16 };
const inputStyle = { width:"100%", boxSizing:"border-box", padding:"10px 12px", fontSize:14, border:"1px solid var(--border2)", borderRadius:8, background:"transparent", color:"inherit", outline:"none" };
const primaryBtn = { marginTop:20, padding:"10px 18px", fontSize:14, fontWeight:600, color:"#fff", background:"var(--indigo)", border:"none", borderRadius:8, cursor:"pointer" };
const ghostBtn = { padding:"7px 14px", fontSize:13, fontWeight:600, color:"var(--indigo)", background:"transparent", border:"1px solid var(--border2)", borderRadius:8, cursor:"pointer" };

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
      <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--text3)",marginBottom:10}}>{title}</div>
      {children}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{display:"inline-block",fontSize:12,fontWeight:500,padding:"4px 10px",border:"1px solid var(--border2)",borderRadius:999,marginRight:6,marginBottom:6}}>{children}</span>
  );
}

export default function ProductKnowledgePage({ call, toast }) {
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [knowledge, setKnowledge] = useState({ profile: null, features: [] });
  const [productName, setProductName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await call("GET", "/api/company-knowledge");
      const k = data || { profile: null, features: [] };
      setKnowledge(k);
      if (k.profile) {
        setProductName(k.profile.product_name || "");
        setWebsiteUrl(k.profile.website_url || "");
      }
    } catch (err) {
      toast && toast(err.message || "Failed to load product knowledge");
    } finally {
      setLoading(false);
    }
  }, [call, toast]);

  useEffect(() => { load(); }, [load]);

  const runResearch = async () => {
    if (!productName.trim() || !websiteUrl.trim()) {
      toast && toast("Enter both a product name and a website URL");
      return;
    }
    setResearching(true);
    try {
      const data = await call("POST", "/api/company-knowledge/research", {
        productName: productName.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      setKnowledge(data || { profile: null, features: [] });
      toast && toast("Research complete");
    } catch (err) {
      toast && toast(err.message || "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const profile = knowledge.profile;
  const features = knowledge.features || [];
  const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); } catch { return ""; } };

  const header = (
    <div style={{marginBottom:28}}>
      <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>Product Knowledge</h1>
      <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>What Pulse knows about your own product and market</div>
    </div>
  );

  if (loading) {
    return <div style={{padding:"32px 36px"}}>{header}<Spinner label="Loading product knowledge…"/></div>;
  }

  if (researching) {
    return <div style={{padding:"32px 36px"}}>{header}<Spinner label="Searching the web and building your profile — this can take up to a minute."/></div>;
  }

  if (!profile) {
    return (
      <div style={{padding:"32px 36px"}}>
        {header}
        <div style={{maxWidth:560}}>
          <p style={{fontSize:14,color:"var(--text3)",marginBottom:8,lineHeight:1.55}}>
            Teach Pulse about your product so it can act as a strategic advisor — surfacing the right features and talk tracks when a customer's needs show up in emails and meetings.
          </p>
          <label style={labelStyle}>Product name</label>
          <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Acme Support Cloud" style={inputStyle}/>
          <label style={labelStyle}>Website URL</label>
          <input value={websiteUrl} onChange={e=>setWebsiteUrl(e.target.value)} placeholder="https://…" style={inputStyle}/>
          <div style={{marginTop:18,border:"1.5px dashed var(--border2)",borderRadius:10,padding:"20px",textAlign:"center",opacity:.55}}>
            <div style={{fontSize:13,fontWeight:600}}>Upload product docs & slides</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>Arrives next — feed decks and PDFs into the research.</div>
          </div>
          <button onClick={runResearch} style={primaryBtn}>Research my product</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"32px 36px",maxWidth:820}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-.04em",marginBottom:4}}>{profile.product_name || "Product Knowledge"}</h1>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text3)"}}>
            {profile.website_url}{profile.generated_at?` · researched ${fmtDate(profile.generated_at)}`:""}{profile.confirmed?" · confirmed":" · draft"}
          </div>
        </div>
        <button onClick={runResearch} style={ghostBtn}>Re-research</button>
      </div>

      <div style={{fontSize:12,color:"var(--text3)",marginBottom:24,padding:"10px 12px",border:"1px solid var(--border2)",borderRadius:8}}>
        Review, edit, lock, and confirm tools arrive in the next update. This is the read view.
      </div>

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
