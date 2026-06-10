import { useState, useEffect } from "react";

function escapeToken(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildHighlightRegex(keywords) {
  if (!keywords || keywords.length === 0) return null;
  try {
    const pattern = keywords
      .map(kw => kw.split(/[\s\-]+/).map(escapeToken).join("[\\s\\-]+"))
      .join("|");
    return new RegExp(`(${pattern})`, "gi");
  } catch {
    return null;
  }
}

function HighlightedSnippet({ snippet, keywords }) {
  const regex = buildHighlightRegex(keywords);
  if (!regex || !snippet) return <span>{snippet}</span>;

  const parts = [];
  let last = 0;
  let m;
  regex.lastIndex = 0;
  while ((m = regex.exec(snippet)) !== null) {
    if (m.index > last) parts.push(snippet.slice(last, m.index));
    parts.push(
      <mark key={m.index} style={{
        background: "var(--indigo-dim)",
        color: "inherit",
        borderRadius: 3,
        padding: "0 1px"
      }}>
        {m[0]}
      </mark>
    );
    last = m.index + m[0].length;
  }
  if (last < snippet.length) parts.push(snippet.slice(last));
  return <span>{parts}</span>;
}

const SRC_MAP = { meeting: "Meeting", interaction: "Interaction", email: "Email", ticket: "Ticket" };
function srcLabel(s) { return SRC_MAP[s?.toLowerCase()] || s || "Note"; }

function fmtDate(str) {
  if (!str) return "";
  try {
    return new Date(str).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
  } catch { return ""; }
}

function groupEvidence(evidence) {
  const map = new Map();
  for (const ev of evidence || []) {
    const key = ev.sourceId ?? ev.sourceTitle ?? ev.source ?? Math.random();
    if (!map.has(key)) map.set(key, ev);
  }
  return [...map.values()];
}

export default function OpportunityCards({ account, call, toast }) {
  const [opps, setOpps] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setOpps(null);
    call("GET", `/api/opportunities/${account.id}`)
      .then(res => { if (!cancelled) setOpps(res.opportunities || []); })
      .catch(() => { if (!cancelled) setOpps([]); });
    return () => { cancelled = true; };
  }, [account.id]);

  if (!opps || opps.length === 0) return null;

  function dismiss(featureId) {
    const prev = opps;
    setOpps(prev.filter(o => o.featureId !== featureId));
    call("POST", `/api/opportunities/${account.id}/dismiss`, { featureId })
      .then(() => toast("Dismissed"))
      .catch(() => { setOpps(prev); toast("Failed to dismiss", "error"); });
  }

  return (
    <div style={{
      background: "var(--indigo-dim)",
      border: "1.5px solid var(--indigo-glow)",
      borderRadius: "var(--r)",
      padding: "12px 14px",
      marginTop: 14
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
          textTransform: "uppercase", color: "var(--indigo)"
        }}>
          Opportunity Signals
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          background: "var(--indigo)", color: "white",
          borderRadius: 20, padding: "1px 6px"
        }}>
          {opps.length}
        </span>
      </div>

      {opps.map((opp, i) => {
        const evidenceEntries = groupEvidence(opp.evidence);
        return (
          <div key={opp.featureId} style={{
            borderTop: i > 0 ? "1px solid var(--indigo-glow)" : "none",
            paddingTop: i > 0 ? 10 : 0,
            marginTop: i > 0 ? 10 : 0,
            position: "relative"
          }}>
            <button
              title="Dismiss for this account"
              onClick={() => dismiss(opp.featureId)}
              style={{
                position: "absolute", top: i > 0 ? 10 : 0, right: 0,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, color: "var(--text3)", lineHeight: 1, padding: "0 2px"
              }}
            >×</button>

            <div style={{ fontSize: 13, fontWeight: 700, paddingRight: 18 }}>
              {opp.featureName}
            </div>
            {opp.tier && (
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                {opp.tier}
              </div>
            )}

            {opp.matchedKeywords?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {opp.matchedKeywords.map(kw => (
                  <span key={kw} style={{
                    fontSize: 10, background: "rgba(59,94,222,0.12)",
                    color: "var(--indigo)", borderRadius: 20,
                    padding: "2px 7px", fontWeight: 500
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {evidenceEntries.length > 0 && (
              <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 6 }}>
                {evidenceEntries.map((ev, ei) => (
                  <div key={ei}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: "var(--text2)",
                        background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "1px 5px"
                      }}>
                        {ev.sourceTitle
                          ? `${srcLabel(ev.source)}: ${ev.sourceTitle}`
                          : srcLabel(ev.source)}
                      </span>
                      {ev.occurredAt && (
                        <span style={{ fontSize: 10, color: "var(--text3)" }}>
                          {fmtDate(ev.occurredAt)}
                        </span>
                      )}
                    </div>
                    {ev.snippet && (
                      <div style={{
                        fontSize: 12, color: "var(--text2)", lineHeight: 1.45,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 3, WebkitBoxOrient: "vertical"
                      }}>
                        <HighlightedSnippet snippet={ev.snippet} keywords={opp.matchedKeywords} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
