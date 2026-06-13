import { useState, useEffect } from "react";

export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    /* Surfaces — warm, Notion-inspired */
    --bg:#FAFAF9; --bg1:#FCFCFB; --bg2:#FFFFFF; --bg3:#F5F5F3; --bg4:#EFEFEC;
    --border:#E9E8E4; --border2:#DBD9D3;

    /* Primary — indigo */
    --indigo:#5469D4; --indigo-dim:rgba(84,105,212,0.08); --indigo-glow:rgba(84,105,212,0.16);

    /* Semantic */
    --emerald:#059669; --emerald-dim:rgba(5,150,105,0.08);  --emerald-border:rgba(5,150,105,0.25);
    --amber:#D97706;   --amber-dim:rgba(217,119,6,0.08);    --amber-border:rgba(217,119,6,0.25);
    --rose:#E11D48;    --rose-dim:rgba(225,29,72,0.08);     --rose-border:rgba(225,29,72,0.3);
    --sky:#0284C7;     --sky-dim:rgba(2,132,199,0.08);      --sky-border:rgba(2,132,199,0.25);
    --violet:#7C3AED;  --violet-dim:rgba(124,58,237,0.08);  --violet-border:rgba(124,58,237,0.25);
    --teal:#0D9488;    --teal-dim:rgba(13,148,136,0.08);    --teal-border:rgba(13,148,136,0.25);
    --red:var(--rose);

    /* Text — warm stone */
    --text:#1C1B18; --text2:#57534E; --text3:#9C968F;

    /* Sidebar — warm light (Notion-style) */
    --sidebar-bg:#F7F6F3;
    --sidebar-border:#E9E8E4;
    --sidebar-active:rgba(84,105,212,0.08);
    --sidebar-hover:rgba(0,0,0,0.04);
    --sidebar-text:#78716C;
    --sidebar-text-active:#1C1B18;
    --sidebar-icon:#B2ACA8;
    --sidebar-icon-active:#5469D4;
    --sidebar-section:#B2ACA8;

    /* Typography */
    --font-display:'Inter',sans-serif;
    --font-mono:'DM Mono',monospace;

    /* Structural */
    --scrim:rgba(22,20,14,0.45);
    --sidebar-w:232px;
    --detail-col-w:300px;

    /* Radius */
    --r-xs:4px; --r-sm:6px; --r:10px; --r-lg:14px; --r-xl:18px; --r-2xl:22px;

    /* Shadows — soft, warm */
    --shadow-xs:0 1px 2px rgba(0,0,0,0.04);
    --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);
    --shadow:0 4px 12px rgba(0,0,0,0.05),0 2px 4px rgba(0,0,0,0.03);
    --shadow-lg:0 16px 40px rgba(0,0,0,0.10),0 6px 12px rgba(0,0,0,0.04);
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-display); font-size:14px; line-height:1.5; font-variant-numeric:tabular-nums; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
  ::selection { background:var(--indigo-dim); }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:var(--text3); }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)}   to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0}                              to{opacity:1} }
  @keyframes slideRight{ from{opacity:0;transform:translateX(24px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.95)}       to{opacity:1;transform:scale(1)} }
  @keyframes toastIn   { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .card-hover { transition:box-shadow 0.2s,transform 0.2s,border-color 0.2s; }
  .card-hover:hover { box-shadow:0 6px 24px rgba(0,0,0,0.09),0 2px 8px rgba(0,0,0,0.04)!important; transform:translateY(-2px); border-color:var(--border2)!important; }
  .nav-item { transition:background 0.1s; border-radius:var(--r); }
  .nav-item:hover { background:var(--sidebar-hover)!important; }
  .pill-btn { transition:all 0.12s; }
  .pill-btn:hover { filter:brightness(0.96); }
  .icon-btn { transition:background 0.12s; cursor:pointer; }
  .icon-btn:hover { background:var(--bg3)!important; }
  .sidebar-icon-btn:hover { background:var(--sidebar-hover)!important; }
  input:focus, select:focus, textarea:focus { border-color:var(--indigo)!important; box-shadow:0 0 0 3px var(--indigo-dim)!important; outline:none; }
  button:disabled { opacity:0.42; cursor:not-allowed; }
`;

// ─── Scenario config ──────────────────────────────────────────────────────────
export const SCENARIO_CFG = {
  "Onboarding": { color:"var(--teal)",   bg:"var(--teal-dim)",   abbr:"OB" },
  "Churn Risk": { color:"var(--rose)",   bg:"var(--rose-dim)",   abbr:"CR" },
  "Renewal":    { color:"var(--indigo)", bg:"var(--indigo-dim)", abbr:"RE" },
  "Executive":  { color:"var(--violet)", bg:"var(--violet-dim)", abbr:"EX" },
};

// ─── PLAYBOOK LIBRARY ─────────────────────────────────────────────────────────
export const PLAYBOOK_LIBRARY = [
  // ── ONBOARDING ──
  {
    id:"pb-001",
    name:"New Account Activation",
    scenario:"Onboarding",
    priority:"Critical",
    trigger:"Account created or moved to active status",
    triggerCondition: a => !a.activityLog || a.activityLog.length <= 1,
    successMetric:"Customer achieves first meaningful value within 30 days",
    summary:"Poor onboarding is the #3 driver of churn. The first 30 days set the tone for the entire relationship. Speed and personalisation are non-negotiable.",
    steps:[
      { id:1, title:"Send personalised welcome email", owner:"CSM", timeline:"Day 1", action:"Reference their specific goal from the sales process — not a template opener. Make it personal.", commsTemplate:"Subject: Welcome to [Product] — let's make this count\n\nHi [Name],\n\nReally glad to have [Company] on board. I've been looking forward to working with you.\n\nBased on what [Sales Rep] shared, your primary goal is [goal]. That's exactly what we're going to focus on together.\n\nI'll send a calendar invite for our kickoff call shortly — aiming for this week while everything is fresh.\n\nLooking forward to it.\n\n[Your name]" },
      { id:2, title:"Schedule kickoff call within 48 hours", owner:"CSM", timeline:"Day 1–2", action:"Don't let the account go cold at the handoff moment. Book before you do anything else.", commsTemplate:"Subject: Kickoff call — [Company] x [Product]\n\nHi [Name],\n\nI've blocked [time/date] for our kickoff — just 45 minutes to align on your goals and set up for success.\n\n[Calendar link]\n\nIf this doesn't work, here are two alternatives: [time1] or [time2].\n\nSee you then." },
      { id:3, title:"Run kickoff call", owner:"CSM", timeline:"Day 3", action:"Agenda: understand their definition of success, agree on 30-day milestones, confirm all key contacts. Do not start with product demos.", commsTemplate:"Kickoff agenda:\n1. Their business context and goals (15 min — you listen)\n2. Agree on 3 milestones for the first 30 days (10 min)\n3. Map key contacts and stakeholders (10 min)\n4. Product walkthrough focused on their specific use case (10 min)" },
      { id:4, title:"Send kickoff summary email", owner:"CSM", timeline:"Day 5", action:"Document agreed milestones and responsibilities in writing. Shared ownership starts here.", commsTemplate:"Subject: Kickoff summary — [Company]\n\nHi [Name],\n\nGreat call today. Here's what we agreed:\n\n30-Day Milestones:\n1. [Milestone 1] — Owner: [Name] — By: [Date]\n2. [Milestone 2] — Owner: [Name] — By: [Date]\n3. [Milestone 3] — Owner: [Name] — By: [Date]\n\nNext check-in: [Date]\n\nAny corrections or additions, let me know." },
      { id:5, title:"First product usage check", owner:"CSM", timeline:"Day 7", action:"Check if they are logging in. If usage is zero — call immediately. Do not email. Every silent day in onboarding costs 30 days of adoption later.", commsTemplate:"If no usage detected — call script:\n\"Hi [Name], I was reviewing your account and noticed you haven't had a chance to log in yet. Totally normal in the first week — I just want to make sure we haven't left you without something you need. Do you have 10 minutes now?\"" },
      { id:6, title:"Mid-onboarding check-in", owner:"CSM", timeline:"Day 14", action:"Review milestone progress. If behind, diagnose the blocker — is it technical, time, or motivation? Each has a different fix.", commsTemplate:"Subject: Two weeks in — how are things going?\n\nHi [Name],\n\nWe're at the halfway point of your first 30 days. Quick check:\n\n✓ [Milestone 1] — on track?\n○ [Milestone 2] — any blockers?\n\nHappy to jump on a call if anything needs unblocking. What's your honest read on progress so far?" },
      { id:7, title:"Share industry case study", owner:"CSM", timeline:"Day 21", action:"A relevant case study from their industry showing a customer who achieved the same goal. Reinforces the path forward.", commsTemplate:"Subject: How [Similar Company] achieved [Goal]\n\nHi [Name],\n\nThought this might be timely — [Similar Company] had a very similar challenge to yours and got to [result] in [timeframe].\n\n[Case study link or attachment]\n\nA couple of things they did that I think would work well for your team too: [2–3 specific points].\n\nWorth a quick call to map this to your situation?" },
      { id:8, title:"First value review call", owner:"CSM", timeline:"Day 30", action:"Did they hit their first milestone? If yes — celebrate and set next 30-day goals. If no — activate Slow Onboarding Recovery playbook immediately.", commsTemplate:"30-day review agenda:\n1. Celebrate what was achieved (even partial wins)\n2. Honest review of what didn't happen and why\n3. Set next 30-day milestone\n4. Any changes to the team, goals, or priorities?\n\nClose with: 'What's the one thing that would make the next 30 days a clear success for you?'" },
    ],
  },
  {
    id:"pb-002",
    name:"Slow Onboarding Recovery",
    scenario:"Onboarding",
    priority:"High",
    trigger:"Day 21 with less than 40% product usage OR key milestones missed",
    triggerCondition: a => a.productUsage < 40 && a.activityLog && a.activityLog.length > 0,
    successMetric:"Customer resumes active usage within 14 days of intervention",
    summary:"Stalled onboarding predicts churn with 70%+ accuracy. The fix is almost always a phone call, not another email.",
    steps:[
      { id:1, title:"Call directly — do not email", owner:"CSM", timeline:"Immediately", action:"Onboarding friction is almost always diagnosed in 10 minutes on a call. Email gives them an easy way to avoid the conversation.", commsTemplate:"Call script:\n\"Hi [Name], I was reviewing your account and wanted to call rather than email. I can see progress has slowed and I want to understand what's getting in the way — no agenda other than that. Do you have 10 minutes?\"" },
      { id:2, title:"Diagnose the root blocker", owner:"CSM", timeline:"Day 1", action:"Four possible causes: Technical setup issue. Internal resource constraints. Lost executive support. Unclear value. Each needs a different response.", commsTemplate:"Diagnostic questions:\n• 'When you tried to [action], what happened?'\n• 'Is your team able to prioritise this right now or is something else taking over?'\n• 'Has anything changed in terms of priorities since we kicked off?'\n• 'On a scale of 1–10, how clear is the value you're expecting to get from us?'" },
      { id:3, title:"Fix technical blockers same day", owner:"CSM + Support", timeline:"Day 1–2", action:"If it's technical, involve implementation or support immediately. Speed signals seriousness. Slow responses to technical issues in onboarding are unforgivable.", commsTemplate:"Internal escalation:\n'Urgent: [Company] is blocked on [specific technical issue] and has been for [X days]. This is their day [N] of onboarding. Needs same-day resolution.'" },
      { id:4, title:"Offer to run user training directly", owner:"CSM", timeline:"Day 2–3", action:"If internal resource constraints, remove the dependency on your champion doing the training. Offer to run a 30-minute session with end users yourself.", commsTemplate:"Subject: Let me take this off your plate\n\nHi [Name],\n\nI know your team is stretched. Rather than waiting for time in your schedule, what if I ran a 30-minute session directly with [team/users] this week?\n\nI'll handle everything — just need 5 people and 30 minutes. You don't even need to be there.\n\nWould [day] at [time] work?" },
      { id:5, title:"Escalate for lost executive support", owner:"CSM + Manager", timeline:"Day 2–3", action:"Get your manager or senior leader to send a personal note to their sponsor. Peer-to-peer outreach at this stage carries more weight than anything the CSM can do.", commsTemplate:"Executive outreach:\n\"Hi [Sponsor Name],\n\nI wanted to reach out personally regarding [Company]'s onboarding. I understand the team has had some challenges getting started and I want to make sure we're doing everything on our end to support you.\n\nWould you have 15 minutes this week for a quick call?\"" },
      { id:6, title:"Reset the success plan", owner:"CSM", timeline:"Day 3", action:"Agree on a simplified 2-week sprint with ONE specific, achievable milestone. Small wins rebuild momentum. Don't try to catch up everything at once.", commsTemplate:"Subject: New plan — let's make this simpler\n\nHi [Name],\n\nAfter our call, I've been thinking about how to make the next two weeks a clear win.\n\nLet's focus on just one thing: [Milestone].\n\nBy [Date], you'll have [outcome]. That's it. Nothing else.\n\nI'll check in every [two days / week] to remove any blockers.\n\nDoes this work for you?" },
    ],
  },
  {
    id:"pb-003",
    name:"Executive Sponsor Introduction",
    scenario:"Onboarding",
    priority:"Medium",
    trigger:"Enterprise account with no C-level contact mapped after 30 days",
    triggerCondition: a => a.plan === "Enterprise" && a.stakeholders && !a.stakeholders.some(s => s.role === "Champion"),
    successMetric:"Executive contact established and engaged within 45 days",
    summary:"Single-threaded relationships are your biggest churn risk. Getting executive air cover early protects the entire relationship.",
    steps:[
      { id:1, title:"Ask your champion directly", owner:"CSM", timeline:"Week 4", action:"'Who in leadership has visibility into the outcomes we're delivering?' Do not guess — ask.", commsTemplate:"'[Name], I want to make sure the value we're delivering gets visibility at the right level internally. Who in leadership would care most about the outcomes we're working toward together?'" },
      { id:2, title:"Prepare an executive ROI summary", owner:"CSM", timeline:"Week 4–5", action:"One page, outcome-focused, no product features. Executives read outcomes, not capabilities. Include: before/after metrics, time to value, what's next.", commsTemplate:"Executive summary structure:\n• The goal: [What they were trying to achieve]\n• Where they were: [Baseline metric]\n• What we did: [3 bullet points max]\n• Where they are now: [Result metric]\n• What's next: [Next milestone or opportunity]" },
      { id:3, title:"Request a 20-minute executive briefing", owner:"CSM", timeline:"Week 5", action:"Frame it as sharing early wins, not as a check-in. Go through your champion for the introduction.", commsTemplate:"Template for champion to send:\n'[Executive Name], I wanted to share some early results from our work with [Product]. Our CSM [Name] has put together a concise summary — would you have 20 minutes this month for a quick briefing? I think you'll find it worthwhile.'" },
      { id:4, title:"Run the executive meeting", owner:"CSM + Manager", timeline:"Week 5–6", action:"Open with their business priority (reference recent news). Connect your impact to that priority. Close with one forward-looking question, not a product pitch.", commsTemplate:"Executive meeting structure:\n1. 'I saw [company news] — how is that affecting your priorities?' (2 min)\n2. 'Here's what we've delivered so far and why it matters for [priority]' (5 min)\n3. 'Looking at the next quarter, here's what we're focused on' (5 min)\n4. 'What would make this partnership most valuable for you personally?' (close)" },
      { id:5, title:"Send executive follow-up within 24 hours", owner:"CSM", timeline:"Day after meeting", action:"One page. Decisions made. Next steps named. Executives respect speed and precision above all else.", commsTemplate:"Subject: Follow-up — [Company] x [Product] executive briefing\n\nHi [Executive Name],\n\nThank you for your time today. Key points:\n\n• [Result 1]\n• [Result 2]\n• Next milestone: [Goal] by [Date]\n\nI'll keep you updated on progress quarterly. Please don't hesitate to reach out directly.\n\n[Your name and direct contact]" },
    ],
  },

  // ── CHURN RISK ──
  {
    id:"pb-004",
    name:"Early Warning Response",
    scenario:"Churn Risk",
    priority:"High",
    trigger:"Health score 40–55 OR CES declines 2 consecutive readings",
    triggerCondition: a => (a.healthScore >= 40 && a.healthScore < 55) || (a.cesHistory && a.cesHistory.length >= 3 && a.cesHistory.at(-1).value < a.cesHistory.at(-2).value && a.cesHistory.at(-2).value < a.cesHistory.at(-3).value),
    successMetric:"Health score recovers above 60 within 45 days",
    summary:"Accounts in the 40–55 range have a 35–50% churn probability. The window to intervene is open — don't wait for it to close.",
    steps:[
      { id:1, title:"Make personalised contact — reference the signal", owner:"CSM", timeline:"Day 1", action:"Do not send a generic 'just checking in' email. Reference the specific signal — it shows you're paying attention.", commsTemplate:"Subject: Checking in on something specific\n\nHi [Name],\n\nI noticed [product usage has dropped / your CES score has declined over the last two readings] and I wanted to reach out before our next scheduled call.\n\nI'd rather hear from you early than find out later there was something I could have helped with.\n\nDo you have 15 minutes this week?" },
      { id:2, title:"Book a dedicated health call", owner:"CSM", timeline:"Day 1–2", action:"Not a standard check-in — a specific call with a clear purpose. Make the customer feel you've noticed and you care.", commsTemplate:"'I'd like to set aside some time specifically to talk about [Company]'s experience with us. Not a standard check-in — I want to understand what's really going on. When works best for you this week?'" },
      { id:3, title:"Diagnose across 4 dimensions", owner:"CSM", timeline:"Day 2–3", action:"Product (features not working?). People (champion distracted?). Process (workflow not fitting?). Priority (business focus shifted?). One of these is the real cause.", commsTemplate:"Diagnostic questions:\n• Product: 'Are there specific features that aren't working the way you expected?'\n• People: 'Has anything changed in your team's bandwidth or focus recently?'\n• Process: 'Is the way we set up the workflow still matching how your team actually works?'\n• Priority: 'Has anything shifted in your business priorities since we last spoke?'" },
      { id:4, title:"Assign the right intervention", owner:"CSM", timeline:"Day 3", action:"Based on root cause: technical fix → support team same day. Re-engagement → reset success plan. Stakeholder → executive outreach. Priority shift → re-scope success plan.", commsTemplate:"Internal note template:\nRoot cause identified: [cause]\nIntervention: [action]\nOwner: [person]\nDeadline: [date]\nRisk level: [High/Critical]" },
      { id:5, title:"Create a written recovery plan with the customer", owner:"CSM", timeline:"Day 3–5", action:"Shared ownership is critical. They need skin in the game. Document what you're each doing and by when.", commsTemplate:"Subject: Recovery plan — [Company]\n\nHi [Name],\n\nFollowing our call, here's what we've agreed:\n\nOn our side:\n• [Action 1] by [Date] — Owner: [Name]\n• [Action 2] by [Date] — Owner: [Name]\n\nOn your side:\n• [Action 1] by [Date]\n\nNext check-in: [Date]\n\nDoes this capture it correctly?" },
      { id:6, title:"Bi-weekly check-ins with written updates", owner:"CSM", timeline:"Ongoing", action:"Don't reduce cadence until the health score has visibly improved. Consistency is what rebuilds confidence.", commsTemplate:"Subject: Progress update — [Company] recovery plan\n\nHi [Name],\n\nQuick update on where we are:\n\n✓ [Completed action]\n⟳ [In progress action] — on track for [date]\n○ [Upcoming action]\n\nHealth metrics this week: [metric]\nChange from last week: [change]\n\nNext check-in: [date]" },
      { id:7, title:"Escalate to Critical Recovery if no improvement", owner:"CSM", timeline:"Day 21", action:"If health score has not improved after 21 days of active intervention, escalate immediately. Do not extend the timeline hoping things improve.", commsTemplate:"Internal escalation:\n'[Company] has been on the Early Warning playbook for 21 days with no meaningful improvement. Health score: [X]. Churn risk: [X]%. Escalating to Critical Recovery. Need manager involvement by EOD.'" },
    ],
  },
  {
    id:"pb-005",
    name:"Critical Recovery",
    scenario:"Churn Risk",
    priority:"Critical",
    trigger:"Health score below 40 OR churn risk above 65% OR customer signals intent to leave",
    triggerCondition: a => a.healthScore < 40 || a.churnRisk > 65,
    successMetric:"Customer commits to staying and re-engages with the product",
    summary:"Every day counts. The approach here is radically different from standard CS — radical honesty, executive involvement, and proof over promises.",
    steps:[
      { id:1, title:"Escalate internally before contacting customer", owner:"CSM + Manager", timeline:"Day 1", action:"Align your manager on the situation, the risk, and the plan before anything goes to the customer. No surprises internally.", commsTemplate:"Internal brief:\nAccount: [Name]\nARR at risk: [Amount]\nRoot cause: [Summary]\nChurn probability: [X]%\nProposed approach: [Plan]\nWhat I need from you: [Specific ask]" },
      { id:2, title:"Make personal contact within 24 hours", owner:"CSM", timeline:"Day 1", action:"Not email — call. Your voice signals urgency and care that email cannot. Leave a voicemail if needed.", commsTemplate:"Call opener:\n'Hi [Name], I'm calling rather than emailing because I think this warrants a real conversation. I'm genuinely concerned about your experience with us and I want to understand where we've fallen short. Do you have 15 minutes right now?'\n\nVoicemail: 'Hi [Name], it's [Your name] from [Company]. I wanted to speak with you personally — not about renewals or anything commercial. I just want to understand your experience. Please call me back at [number] whenever is convenient.'" },
      { id:3, title:"Listen — do not defend or pitch", owner:"CSM", timeline:"Day 1–2", action:"Open with radical honesty. Listen for 80% of the conversation. Take notes. Resist every urge to explain or solve in the moment.", commsTemplate:"Opening:\n'Before I say anything else, I want to hear from you. Where have we let you down?'\n\nDuring the call: take notes, reflect back what you're hearing, do not interrupt.\n\nClose: 'Thank you for being honest with me. I'm going to take everything you've said seriously and come back to you within 48 hours with a concrete plan.'" },
      { id:4, title:"Bring in a senior leader", owner:"Manager / VP CS", timeline:"Day 2–3", action:"VP of CS or CEO depending on account size. This signals the relationship matters at the highest level. Peer-to-peer contact changes the dynamic.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI'm reaching out personally because I understand your experience with us has not been what we both hoped for. I take that seriously.\n\nI'd welcome the opportunity to speak with you directly — not to pitch or defend, but to listen and commit to making this right.\n\nWould 20 minutes this week work?'" },
      { id:5, title:"Send executive recovery brief within 48 hours", owner:"CSM", timeline:"Day 2–3", action:"What went wrong. What you're doing about it. What commitment you're making. Specific dates, specific owners. No vague promises.", commsTemplate:"Subject: Our commitment to [Company]\n\nHi [Name],\n\nFollowing our conversation, I want to put in writing what happened, what we're doing, and what you can expect from us.\n\nWhat went wrong:\n[Honest, specific summary]\n\nWhat we're doing:\n• [Action 1] — Owner: [Name] — By: [Date]\n• [Action 2] — Owner: [Name] — By: [Date]\n\nOur commitment:\n[Specific, measurable outcome] by [Date]. If we don't deliver, [what you'll do].\n\n[Senior leader name] is personally overseeing this." },
      { id:6, title:"Define one 'proof of life' milestone", owner:"CSM", timeline:"Day 3", action:"A single meaningful win you can deliver within 14 days. Give them a reason to believe before asking for anything.", commsTemplate:"'I don't want to ask you to commit to anything right now. What I'd like to do is earn back your confidence with one concrete delivery by [date]. If we achieve [milestone], would you be willing to have a fresh conversation about the path forward?'" },
      { id:7, title:"Daily check-ins until milestone delivered", owner:"CSM", timeline:"Daily", action:"Do not reduce cadence until you have delivered the proof milestone and the customer has acknowledged it. Consistency is what rebuilds trust.", commsTemplate:"Daily update (keep short):\n'Hi [Name] — quick update: [progress]. On track for [date]. Anything you need from me today?'" },
      { id:8, title:"Formal recovery review", owner:"CSM + Manager", timeline:"Day 14–21", action:"Acknowledge what happened openly. Present the new success plan. Ask for a renewed commitment.", commsTemplate:"Recovery review agenda:\n1. Acknowledge the past honestly (5 min)\n2. Present what was delivered and prove it (10 min)\n3. Introduce the new success plan (10 min)\n4. Ask: 'Based on what you've seen, are you willing to continue this relationship?'" },
    ],
  },
  {
    id:"pb-006",
    name:"Silent Account Re-engagement",
    scenario:"Churn Risk",
    priority:"High",
    trigger:"No contact logged in 30+ days",
    triggerCondition: a => {
      const days = Math.floor((new Date() - new Date(a.lastContact)) / 86400000);
      return days >= 30;
    },
    successMetric:"Customer responds and re-engages in a scheduled conversation",
    summary:"Disengagement is the #1 predictor of churn before it becomes visible. Research before you reach out — personalisation is the difference between a response and being ignored.",
    steps:[
      { id:1, title:"Research before reaching out", owner:"CSM", timeline:"Day 1", action:"Check their company news, LinkedIn activity, and product usage data. Personalise your outreach around something real — not 'I wanted to check in'.", commsTemplate:"Research checklist:\n□ Any company news in the last 30 days?\n□ Any LinkedIn posts from key contacts?\n□ Product usage trend — up, down, or flat?\n□ Any open tickets or unresolved issues?\n□ Renewal date — how far away?" },
      { id:2, title:"First outreach — personal, no agenda", owner:"CSM", timeline:"Day 1", action:"Short, personal, no product agenda. Give them a reason to respond that isn't 'because my CSM emailed me'.", commsTemplate:"Subject: Saw this and thought of you\n\nHi [Name],\n\nI came across [relevant industry article / company news] and immediately thought of the challenge you mentioned around [topic they raised].\n\n[One sentence observation or question about it]\n\nHow are things going on your end?\n\n[Your name]\n\nP.S. No agenda — genuinely curious." },
      { id:3, title:"Try a different channel if no response in 5 days", owner:"CSM", timeline:"Day 6", action:"If you've been emailing, call. If you've been calling, try LinkedIn. Channel fatigue is real.", commsTemplate:"LinkedIn message:\n'Hi [Name] — I've been trying to reach you and wanted to try a different channel. No pressure at all, just wanted to make sure [Company] has everything you need from our side. Happy to connect whenever works for you.'" },
      { id:4, title:"Send a value-focused email", owner:"CSM", timeline:"Day 10", action:"Give them a reason to reply. A relevant ROI insight, industry benchmark, or new feature tied to their stated goal.", commsTemplate:"Subject: [Industry] benchmark you might find useful\n\nHi [Name],\n\nWe've been seeing some interesting patterns across our [industry] customers. Companies that [action] are seeing [result].\n\nGiven your goal around [their goal], I thought this might be worth sharing.\n\n[One specific data point or insight]\n\nWould this be worth a 20-minute call to explore what it means for [Company]?" },
      { id:5, title:"Escalate through stakeholder map", owner:"CSM", timeline:"Day 14", action:"Is there another contact in the account? A colleague, their manager? Check the stakeholder map and reach out through a different person.", commsTemplate:"Outreach to secondary contact:\n'Hi [Name] — I've been trying to reach [Primary Contact] and haven't been able to connect. I wanted to make sure [Company] has everything they need from us. Are you the right person to speak with, or is there someone better placed?'" },
      { id:6, title:"Permission to close the loop email", owner:"CSM", timeline:"Day 21", action:"The most effective re-engagement email in CS. Gets the highest response rate of any sequence because it gives them control.", commsTemplate:"Subject: Checking in one last time\n\nHi [Name],\n\nI've reached out a few times over the past few weeks and I don't want to be a nuisance.\n\nI still believe there's real value we can deliver for [Company] around [their goal]. But I also understand priorities change.\n\nAre you still interested in working toward [goal]? If now isn't the right time, just let me know and I'll adjust my approach — no hard feelings at all.\n\nEither way, I just want to make sure I'm being useful to you.\n\n[Your name]" },
    ],
  },

  // ── RENEWAL ──
  {
    id:"pb-007",
    name:"Renewal Preparation",
    scenario:"Renewal",
    priority:"High",
    trigger:"Renewal date 90 days away AND health score above 60",
    triggerCondition: a => {
      const days = Math.ceil((new Date(a.renewalDate) - new Date()) / 86400000);
      return days > 0 && days <= 90 && a.healthScore >= 60;
    },
    successMetric:"Renewal committed verbally at the 60-day mark with zero last-minute negotiation",
    summary:"Renewals won 90 days out have 3x higher expansion rates. The goal is to make renewal a natural next step, not a negotiation.",
    steps:[
      { id:1, title:"Internal renewal readiness assessment", owner:"CSM", timeline:"90 days out", action:"Know your position before the customer does. Health score, open tickets, CES trend, stakeholder coverage, success plan progress.", commsTemplate:"Renewal readiness checklist:\n□ Health score: [X] — trend: [up/down/flat]\n□ CES trend: [improving/declining/flat]\n□ Open tickets: [X] — any unresolved critical issues?\n□ Stakeholder coverage: [Champion name] — are they still in role?\n□ Executive sponsor: [Name] — last contact: [Date]\n□ Success plan progress: [X]% complete\n□ Known risks: [List any]\n□ Expansion opportunity: [Yes/No/Maybe]" },
      { id:2, title:"Prepare ROI summary report", owner:"CSM", timeline:"Days 1–5", action:"Quantify value delivered. Time saved, revenue impacted, tickets reduced, adoption rate. Make it undeniable. Numbers that the customer can present to their own leadership.", commsTemplate:"ROI summary structure:\n• Goal at the start: [Original objective]\n• Key results delivered:\n  - [Metric 1]: [Before] → [After] = [% improvement]\n  - [Metric 2]: [Before] → [After] = [% improvement]\n• Usage growth: [X]% increase in active users\n• Support health: [X]% reduction in tickets\n• What's ahead: [Next milestone or expansion opportunity]" },
      { id:3, title:"Schedule dedicated renewal planning call", owner:"CSM", timeline:"Days 5–7", action:"Not a regular check-in — a strategic review. Frame it as planning for a strong next year.", commsTemplate:"Subject: Planning for a strong next year — [Company]\n\nHi [Name],\n\nWith your renewal coming up in about 90 days, I'd like to set aside time for a proper review of what we've achieved and what we're building toward together.\n\nThis isn't a renewal pitch — it's a strategic session to make sure we're fully aligned on your goals for the next year.\n\nDo you have an hour in the next two weeks? I'll also invite [their executive sponsor] if you think that adds value." },
      { id:4, title:"Run renewal planning call", owner:"CSM", timeline:"Days 7–14", action:"Open with their business goals for next year first. Connect what you've delivered to those goals. Then discuss renewal naturally — not as a transaction.", commsTemplate:"Renewal call structure:\n1. 'What are the top 2–3 priorities for your team in the next 12 months?' (listen first)\n2. 'Here's how what we've built together connects to those priorities' (present ROI)\n3. 'Here's what we're planning to deliver in year 2' (forward-looking)\n4. 'Given all of that, I'd love to get the renewal sorted early so we can stay focused on the work. Does that make sense to you?'" },
      { id:5, title:"Introduce expansion if appropriate", owner:"CSM", timeline:"Day 14", action:"Present expansion as part of the vision conversation — never as an add-on at the end of a renewal call.", commsTemplate:"'Given what you shared about [goal / new team / new geography], I think there's an opportunity to do more together next year. I've put together a quick summary of what that could look like — would it be worth 20 minutes to explore?'" },
      { id:6, title:"Get verbal commitment", owner:"CSM", timeline:"Days 14–21", action:"A verbal 'yes, let's move forward' 90 days out avoids procurement delays and last-minute surprises.", commsTemplate:"'Based on everything we've discussed, are you comfortable moving forward with the renewal? I can get the paperwork moving early so it's done and off your plate.'" },
      { id:7, title:"Send written renewal summary", owner:"CSM", timeline:"Within 48 hours of verbal", action:"Proposed terms, timeline, and next steps in writing. Speed closes deals.", commsTemplate:"Subject: Renewal summary — [Company]\n\nHi [Name],\n\nGreat conversation — here's what we discussed:\n\nRenewal terms: [Summary]\nEffective date: [Date]\nNext steps: [Who does what by when]\n\nI'll send the formal agreement to [contact] by [date]. Any questions, call me directly.\n\n[Your name]" },
    ],
  },
  {
    id:"pb-008",
    name:"At-Risk Renewal",
    scenario:"Renewal",
    priority:"Critical",
    trigger:"Renewal date 60 days away AND health score below 55 OR churn risk above 50%",
    triggerCondition: a => {
      const days = Math.ceil((new Date(a.renewalDate) - new Date()) / 86400000);
      return days > 0 && days <= 60 && (a.healthScore < 55 || a.churnRisk > 50);
    },
    successMetric:"Customer commits to renewing with a clear recovery plan in place",
    summary:"This is your last realistic window to save the renewal. The approach is fundamentally different — stop all standard renewal outreach immediately.",
    steps:[
      { id:1, title:"Stop standard renewal outreach immediately", owner:"CSM", timeline:"Day 1", action:"This account needs a completely different conversation. No renewal reminders, no proposal emails.", commsTemplate:"Internal note: 'Pausing all standard renewal comms for [Company]. Activating At-Risk Renewal playbook. Do not send renewal proposal until further notice.'" },
      { id:2, title:"Escalate internally and agree on terms flexibility", owner:"CSM + Manager", timeline:"Day 1", action:"Agree upfront what you're willing to offer — flexibility on terms, additional support, executive involvement. Know your position before the customer call.", commsTemplate:"Internal brief:\n• ARR at risk: [Amount]\n• Root cause of risk: [Summary]\n• Competitive threat: [Yes/No]\n• What we're willing to offer:\n  - [Option 1]\n  - [Option 2]\n• What we're not willing to offer: [Limits]\n• Who is getting involved: [Names]" },
      { id:3, title:"Call the champion directly — be honest", owner:"CSM", timeline:"Day 1–2", action:"Not email. Be honest: 'I know the experience hasn't been what we both expected. I want to make this right before the renewal conversation.'", commsTemplate:"Call script:\n'Hi [Name], I wanted to call you rather than email. I'm aware the renewal is coming up and I also know the experience hasn't been everything we both wanted it to be. I don't want to have a commercial conversation until we've addressed that. Can we talk honestly about where things stand?'" },
      { id:4, title:"Diagnose the specific renewal risk", owner:"CSM", timeline:"Day 2–3", action:"Product value gap? Internal priorities shifting? Budget pressure? Competitive threat? Each requires a fundamentally different response.", commsTemplate:"Risk diagnosis questions:\n• 'On a scale of 1–10, how likely are you to renew right now? What would make it a 10?'\n• 'Is there a specific competitor you're evaluating?'\n• 'Is this a budget conversation or a value conversation?'\n• 'Has anything changed internally that's affecting this decision?'" },
      { id:5, title:"Respond to competitive threat — do not discount first", owner:"CSM", timeline:"Day 3", action:"Restate your differentiated value before offering any pricing flexibility. Discounting as the first move signals you don't believe in your own product.", commsTemplate:"'I'd like to understand more about what [competitor] is offering before we talk about pricing. What are the specific things they're promising that you feel we're not delivering? That's what I want to address.'" },
      { id:6, title:"Respond to budget pressure — explore right-sizing", owner:"CSM", timeline:"Day 3", action:"Explore a right-sized renewal — fewer seats, shorter term, a pause option. Losing 20% ARR is better than losing 100% and the relationship.", commsTemplate:"'If budget is the primary challenge, I'd rather find a structure that works for you today than lose you entirely. Let's look at what a scaled-back version could look like — we can always grow back into it. What's the number that would make this work?'" },
      { id:7, title:"Bring in executive peer-to-peer", owner:"Manager / VP CS", timeline:"Days 3–5", action:"A peer-to-peer executive conversation at this stage carries more weight than anything a CSM can do.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI wanted to reach out personally ahead of your renewal. I understand there have been some challenges and I'd value the opportunity to speak with you directly about how we can make this work.\n\nWould 20 minutes this week be possible?'" },
      { id:8, title:"Propose a 30-day recovery sprint", owner:"CSM", timeline:"Day 5", action:"One clear, deliverable milestone before the renewal signs. Give them a reason to believe.", commsTemplate:"'I'd like to propose something. Before we finalise the renewal, let me deliver [specific outcome] in the next 30 days. If I do, I'm confident you'll want to continue. Does that feel fair?'" },
      { id:9, title:"Get a decision before day 30", owner:"CSM", timeline:"Day 30", action:"Yes, no, or a timeline for a decision. No ambiguity. A 'no' you can work with. Ambiguity you cannot.", commsTemplate:"'I want to be respectful of your time and process. By [date], I'd like to know if we're moving forward — even if it's a modified version of what we discussed. Can you commit to a decision by then?'" },
    ],
  },
  {
    id:"pb-009",
    name:"Expansion Signal",
    scenario:"Renewal",
    priority:"Medium",
    trigger:"Health score above 75 AND product usage above 80% AND no expansion discussion in 60 days",
    triggerCondition: a => a.healthScore > 75 && a.productUsage > 80,
    successMetric:"Expansion opportunity identified, qualified, and in commercial discussion",
    summary:"Healthy accounts that aren't expanded are a missed revenue opportunity. The key is making expansion feel like their idea, not a sales call.",
    steps:[
      { id:1, title:"Identify the specific expansion signal", owner:"CSM", timeline:"Day 1", action:"More users, new use cases, new department, new geography, or feature upgrade. Know exactly what you're proposing before you call.", commsTemplate:"Expansion signal checklist:\n□ User count growing beyond current licence?\n□ New department showing interest?\n□ Customer mentioned a new initiative that fits?\n□ Feature usage at capacity — ready for upgrade tier?\n□ New geography or office opening?" },
      { id:2, title:"Book a value review call — frame it as success", owner:"CSM", timeline:"Days 1–5", action:"Do not frame it as an expansion call. Frame it as celebrating their results and planning what's next.", commsTemplate:"Subject: Celebrating some strong results — [Company]\n\nHi [Name],\n\nI've been reviewing your results over the last quarter and I'm genuinely impressed with what your team has accomplished.\n\nI'd love to share what I'm seeing and talk about what the next phase could look like.\n\n30 minutes — when works for you?" },
      { id:3, title:"Open the call with their future priorities", owner:"CSM", timeline:"Days 5–7", action:"Ask about their next 6-month priorities before mentioning anything commercial. Listen for the expansion hooks.", commsTemplate:"Opening questions:\n• 'What are the biggest initiatives your team is working on in the next 6 months?'\n• 'Are there parts of your business that aren't yet using [Product] that you think could benefit?'\n• 'How has your team grown since we started working together?'" },
      { id:4, title:"Present expansion as the solution to their stated goal", owner:"CSM", timeline:"Day 7", action:"Connect the expansion directly to something they said. 'Given what you just told me about [goal], I think this could help' — not a product pitch.", commsTemplate:"'You mentioned [goal / new initiative] — I think there's a natural opportunity here. [Expansion option] would allow you to [specific outcome tied to their goal]. Would it be worth exploring what that looks like?'" },
      { id:5, title:"Involve sales or account management for commercial negotiation", owner:"CSM + Sales", timeline:"Days 7–14", action:"CSM stays as the trusted advisor. Sales or AM handles the commercial conversation. Don't blur those lines.", commsTemplate:"Internal handoff:\n'I've had an expansion conversation with [Company]. [Name] is open to [expansion type]. Here's what they told me about their priorities: [summary]. They're expecting to hear from someone about next steps this week.'" },
    ],
  },

  // ── EXECUTIVE ──
  {
    id:"pb-010",
    name:"QBR Preparation & Delivery",
    scenario:"Executive",
    priority:"High",
    trigger:"6 weeks before quarterly milestone for Enterprise or Growth accounts",
    triggerCondition: a => (a.plan === "Enterprise" || a.plan === "Growth"),
    successMetric:"Executive leaves with a clear picture of ROI, aligned on next quarter goals, and engaged in a forward-looking conversation",
    summary:"CS teams running consistent QBRs maintain NRR 15–20 points higher. The secret: build the review around their business, not your product.",
    steps:[
      { id:1, title:"Sync with champion — build their agenda", owner:"CSM", timeline:"6 weeks out", action:"'What do your execs care about right now? What would make you look great to your boss?' Build the QBR around their agenda, not yours.", commsTemplate:"Pre-QBR sync questions:\n• 'What are the top 2–3 priorities for your leadership team right now?'\n• 'Is there anything sensitive I should avoid in the room?'\n• 'What would make you personally look great if it came out of this meeting?'\n• 'Who else should be in the room?'\n• 'What do you want your exec to walk away thinking about us?'" },
      { id:2, title:"Pull and interpret all data", owner:"CSM", timeline:"4 weeks out", action:"Usage, adoption, ticket resolution, milestone progress, CES. Interpret it — don't just aggregate it. What does the data actually mean for their business?", commsTemplate:"QBR data pack:\n□ Product usage trend (month over month)\n□ Feature adoption — which features, which teams\n□ Support: tickets opened, time to resolve, satisfaction\n□ Success plan: milestones completed vs planned\n□ CES trend\n□ Key wins with business impact (quantified)\n□ What's underperforming and why" },
      { id:3, title:"Build narrative using Before-Action-After framework", owner:"CSM", timeline:"3 weeks out", action:"Before (the pain that triggered purchase) → Action (what was adopted) → After (the business outcome). The feature is the middle of the story. The outcome is the point.", commsTemplate:"QBR narrative structure:\n1. Executive summary (1 slide): the one number that matters\n2. Where you started: [Business challenge / baseline metric]\n3. What you built together: [Key actions taken]\n4. Where you are now: [Outcome metrics]\n5. What's next: [Goals for next quarter]\n6. One expansion or opportunity to explore (if applicable)" },
      { id:4, title:"Confirm the right attendees", owner:"CSM", timeline:"2 weeks out", action:"Economic buyer must be in the room. If the budget holder isn't there, you're presenting to influencers not decision-makers.", commsTemplate:"Required attendees:\nCustomer side: Economic buyer / budget owner, day-to-day champion, relevant technical lead\nYour side: CSM, executive sponsor (for strategic accounts), product specialist (if roadmap discussion needed)\n\nIf economic buyer won't attend: 'I'd really like [Executive Name] to be part of this — the ROI discussion will be most valuable with them in the room. Is there a way to make that happen?'" },
      { id:5, title:"Share deck with champion 1 week in advance", owner:"CSM", timeline:"1 week out", action:"Ask them to review and flag anything sensitive. No surprises in the room.", commsTemplate:"'I've put together the QBR deck — would you mind reviewing it before I send it more widely? I want to make sure I've captured everything correctly and nothing lands the wrong way in the room.'" },
      { id:6, title:"Open with their business priorities — not a product recap", owner:"CSM", timeline:"Meeting day", action:"First question: 'What's changed in your world since we last spoke?' This signals you're a strategic partner, not a vendor reporting.", commsTemplate:"QBR opening:\n'Before I take you through what we've prepared, I'd like to understand what's top of mind for you right now. What's changed in your business since we last met?'\n\n[Listen for 5 minutes before presenting anything]" },
      { id:7, title:"Spend 40% of the meeting on the future", owner:"CSM", timeline:"Meeting day", action:"QBRs that are purely retrospective miss the expansion and alignment opportunity. The future half is where relationships deepen.", commsTemplate:"Future-focused questions:\n• 'Given what we've built together, what's the next problem you want to solve?'\n• 'Where are you seeing the biggest opportunity in your market right now?'\n• 'If you could change one thing about how we work together, what would it be?'" },
      { id:8, title:"Close with aligned next steps — never just 'thanks for your time'", owner:"CSM", timeline:"Meeting day", action:"Every QBR should end with an agreed goal, an aligned action, or an expansion path to explore. Closing with 'thanks' stalls momentum.", commsTemplate:"QBR close:\n'Before we wrap up — let's agree on the one or two things that matter most for next quarter. [Write them down publicly]. And I want to set up our next touchpoint before we leave this room. When works for you?'" },
      { id:9, title:"Send written follow-up within 24 hours", owner:"CSM", timeline:"Day after meeting", action:"Decisions made. Next steps named. Owners assigned. Executives respect precision and follow-through above all else.", commsTemplate:"Subject: QBR follow-up — [Company] + [Product]\n\nHi [Name],\n\nThank you for a great session today. Here's a summary:\n\nKey results discussed:\n• [Result 1]\n• [Result 2]\n\nAgreed next steps:\n• [Action 1] — Owner: [Name] — By: [Date]\n• [Action 2] — Owner: [Name] — By: [Date]\n\nNext QBR: [Proposed date]\n\nAny additions or corrections, let me know." },
    ],
  },
  {
    id:"pb-011",
    name:"Executive Escalation",
    scenario:"Executive",
    priority:"Critical",
    trigger:"Account at risk AND standard CSM outreach has not moved the needle",
    triggerCondition: a => a.healthScore < 45 && a.churnRisk > 55,
    successMetric:"Executive-to-executive relationship established, account stabilised within 30 days",
    summary:"When CSM-level intervention isn't enough, executive involvement changes the dynamic entirely. Brief your leadership completely before any contact.",
    steps:[
      { id:1, title:"Brief leadership completely before any contact", owner:"CSM", timeline:"Day 1", action:"Your VP or CCO needs full context, not a surprise. Prepare a one-page brief covering the situation, history, risk, and proposed approach.", commsTemplate:"Leadership brief:\nAccount: [Name] | ARR: [Amount] | Renewal: [Date]\nSituation: [2–3 sentence summary]\nHistory: [Key events timeline]\nRoot cause: [Best diagnosis]\nWhat we've tried: [CSM actions taken]\nWhy escalation is needed: [Specific reason]\nProposed approach: [Plan]\nWhat I need: [Specific ask from leadership]" },
      { id:2, title:"Executive reaches out peer-to-peer", owner:"VP CS / CCO / CEO", timeline:"Day 1–2", action:"Not a CSM action. VP to VP, CEO to CEO depending on account size. Brief, personal, non-defensive.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI wanted to reach out personally. I understand your experience with us has been challenging and I take that seriously.\n\nI'd welcome the chance to speak with you directly — not to pitch or defend, but to listen and to understand what we need to do differently.\n\nWould 20 minutes this week work for you?'" },
      { id:3, title:"Executive-to-executive call: listen, validate, commit", owner:"VP CS / CCO", timeline:"Day 3–5", action:"Listen, validate, and commit to a specific action with a specific date. Executives respond to peers who demonstrate accountability.", commsTemplate:"Executive call structure:\n1. 'Tell me about your experience from your perspective' (listen for 10 minutes)\n2. 'You're right to be frustrated. That's not the experience we want for you.'\n3. 'Here is specifically what I'm committing to: [action] by [date]. You have my personal guarantee.'\n4. 'What else would rebuild your confidence in us?'" },
      { id:4, title:"CSM creates formal recovery brief within 48 hours", owner:"CSM", timeline:"Day 5–6", action:"What happened. What you're doing. What you're committing to. Specific dates, specific owners.", commsTemplate:"Recovery brief:\nDate: [Date]\nPrepared by: [CSM name] + [Executive name]\n\nWhat happened:\n[Factual, non-defensive summary]\n\nActions we're taking:\n• [Action 1] — Owner: [Name] — By: [Date]\n• [Action 2] — Owner: [Name] — By: [Date]\n\nOur commitment:\n[Specific, measurable outcome] by [Date]" },
      { id:5, title:"Establish joint working cadence", owner:"CSM + Executive", timeline:"Day 7 onward", action:"Both executive teams involved in a regular touchpoint until the account is stable. Signals sustained commitment.", commsTemplate:"Joint cadence proposal:\n'I'd like to propose a bi-weekly working session between our teams — [CSM name] and [Executive name] on our side, [their contacts] on yours — until we've delivered [milestone]. After that, we can return to a normal cadence. Does that work?'" },
    ],
  },
  {
    id:"pb-012",
    name:"Champion Succession",
    scenario:"Executive",
    priority:"Critical",
    trigger:"Champion contact has left, gone silent 30+ days, or role changed significantly",
    triggerCondition: a => {
      const silentChampion = a.stakeholders && a.stakeholders.some(s => s.role === "Champion" && Math.floor((new Date() - new Date(s.lastTouch)) / 86400000) > 30);
      return silentChampion;
    },
    successMetric:"New champion identified and activated within 30 days",
    summary:"Losing a champion without a successor is a top-3 churn risk. The window to establish a new champion closes within 2–3 weeks of their departure. Move immediately.",
    steps:[
      { id:1, title:"Move immediately — the window closes fast", owner:"CSM", timeline:"Day 1", action:"If champion has left: the 2–3 week window to establish a successor is your most critical timeline in account management.", commsTemplate:"Internal alert:\n'Champion [Name] at [Company] has [left / gone silent]. Activating Champion Succession playbook. Need to establish new contact within 14 days. ARR at risk: [Amount].'" },
      { id:2, title:"Map all remaining contacts in the account", owner:"CSM", timeline:"Day 1–2", action:"Who is next in seniority? Who was the champion working with most closely? Who attended the kickoff? Who is still active in the product?", commsTemplate:"Contact mapping:\n□ Who attended our kickoff call?\n□ Who is cc'd on our emails?\n□ Who is active in the product?\n□ Who reports to [departing champion]?\n□ Who is their most likely internal successor?" },
      { id:3, title:"Get a warm introduction from the departing champion", owner:"CSM", timeline:"Day 1–2", action:"If they're still reachable, a warm handoff is worth everything. Make it easy for them to do — draft the introduction for them.", commsTemplate:"Request to departing champion:\n'Before you go, would you be able to introduce me to [successor name]? I've drafted a quick intro email if it would help — just let me know and I'll send it for your review:\n\n[Draft: \"Hi [Successor], I wanted to introduce you to [CSM name], who has been our main contact at [Product]. They've been incredibly helpful with [achievement] and I'd recommend a 30-minute intro call to make sure nothing falls through in the transition.\"]'" },
      { id:4, title:"Contact the most likely successor directly", owner:"CSM", timeline:"Day 2–3", action:"Acknowledge the transition, offer continuity, ask to introduce yourself. Not a sales call — a relationship call.", commsTemplate:"Subject: [Name] mentioned you as the right person to connect with\n\nHi [Successor Name],\n\nI understand [former champion] has moved on — I wanted to reach out personally to introduce myself and make sure [Company] continues to get everything you need from us.\n\nI've been working with [Company] for [duration] on [goal summary]. I'd love to schedule 30 minutes to bring you up to speed and understand your priorities.\n\nWhen works for you this week?" },
      { id:5, title:"Run a fresh discovery call", owner:"CSM", timeline:"Day 3–5", action:"Do NOT assume the new contact shares the former champion's goals or sentiment. Start fresh. Ask the same questions you'd ask a new account.", commsTemplate:"Discovery questions for new champion:\n• 'What do you already know about what [Company] has been doing with [Product]?'\n• 'What matters most to you personally in terms of what we deliver?'\n• 'Is there anything about the existing setup you'd want to change?'\n• 'What does success look like from your perspective?'" },
      { id:6, title:"Rebuild the success plan from their perspective", owner:"CSM", timeline:"Days 5–10", action:"Their definition of value may be entirely different from the previous champion. Don't carry over assumptions.", commsTemplate:"'I've put together a summary of where we are with [Company] — I'd love your input on whether the goals and milestones still reflect what matters to you, or whether we should adjust.'" },
      { id:7, title:"Share a concise state of the account briefing", owner:"CSM", timeline:"Days 5–10", action:"What's been achieved, what's in progress, what's planned. Give them context without overwhelming them.", commsTemplate:"Subject: [Company] + [Product] — account summary\n\nHi [Name],\n\nAs promised, here's a quick summary of where things stand:\n\n✓ What we've achieved together:\n• [Achievement 1]\n• [Achievement 2]\n\n⟳ What's in progress:\n• [Initiative 1] — expected completion: [Date]\n\n○ What's planned:\n• [Upcoming milestone]\n\nHappy to walk through any of this on a call — just let me know." },
      { id:8, title:"Map a minimum of 2 contacts going forward", owner:"CSM", timeline:"Day 10 onward", action:"Never rely on a single champion again. Use this moment as the forcing function to build a wider stakeholder map.", commsTemplate:"'One thing I've learned from this transition — I'd like to make sure we have at least two people connected between our teams going forward, so we never lose continuity. Who else on your team would benefit from being looped in?'" },
    ],
  },
];

// ─── Trigger engine ───────────────────────────────────────────────────────────
export const getTriggeredPlaybooks = (account) => {
  return PLAYBOOK_LIBRARY.filter(pb => {
    try { return pb.triggerCondition(account); } catch { return false; }
  }).sort((a, b) => {
    const priority = { Critical:0, High:1, Medium:2 };
    return priority[a.priority] - priority[b.priority];
  });
};

export const getPriorityConfig = (priority) => ({
  Critical: { color:"var(--rose)",   bg:"var(--rose-dim)",   label:"Critical" },
  High:     { color:"var(--amber)",  bg:"var(--amber-dim)",  label:"High"     },
  Medium:   { color:"var(--sky)",    bg:"var(--sky-dim)",    label:"Medium"   },
}[priority] || { color:"var(--text3)", bg:"var(--bg4)", label:priority });

// ─── Stakeholder playbooks ────────────────────────────────────────────────────
export const STAKEHOLDER_GUIDE = {
  Champion:  { mark:"C", color:"var(--emerald)", bg:"var(--emerald-dim)", headline:"Protecting your Champion",
    tactics:["Schedule a monthly 1:1 outside business reviews — make it personal, not transactional.","Give early access to features or roadmap previews. They need to feel like insiders.","Help them look good internally — share ROI data they can present upward.","Identify a backup champion. Single-threaded relationships are your biggest churn risk.","Send a personal thank-you when they advocate for you. Never take it for granted."],
    warning:"Champion at risk if: no contact in 30+ days, title change, or company reorg detected." },
  Neutral:   { mark:"N", color:"var(--indigo)", bg:"var(--indigo-dim)", headline:"Activating a Neutral contact",
    tactics:["Find their personal win — what does success look like for them specifically?","Invite them to a webinar or exclusive event. Low commitment, high impression.","Ask for their opinion on the roadmap. People support what they help build.","Share a case study from their exact industry and role.","Get one small win on their behalf — resolve something fast and make sure they know."],
    warning:"Neutrals move quickly to detractors if ignored during contract renewal cycles." },
  Detractor: { mark:"D", color:"var(--amber)", bg:"var(--amber-dim)", headline:"Turning a Detractor around",
    tactics:["Book a call with one goal: listen. Don't pitch, don't defend. Just understand.","Acknowledge the problem explicitly — 'You're right, that experience was not acceptable.'","Create a written action plan with dates. Detractors trust proof, not promises.","Loop in a senior leader — it signals the company takes them seriously.","Follow up every 2 weeks with updates even when there's nothing new. Silence kills trust."],
    warning:"Detractors who feel ignored become champions for the competition. Act within 72 hours." },
  Blocker:   { mark:"B", color:"var(--rose)", bg:"var(--rose-dim)", headline:"Navigating around a Blocker",
    tactics:["Understand why they're blocking — budget, fear of change, or a past bad experience?","Never fight them directly. Build champions above or beside them instead.","Find their concern and solve it on its own terms. Blockers often flip when truly heard.","Involve them in a small, low-risk decision. Ownership reduces resistance dramatically.","Bring a business case that makes them look good if the project succeeds."],
    warning:"Never escalate over a blocker's head without exhausting all direct approaches first." },
};

// ─── Seed data ────────────────────────────────────────────────────────────────
export const SEED = [
  { id:1, name:"Noon E-Commerce", industry:"E-Commerce", plan:"Enterprise", arr:120000, renewalDate:"2026-09-15", nps:72, ces:4.2,
    cesHistory:[{date:"2024-09-01",value:3.8},{date:"2024-10-01",value:4.0},{date:"2024-11-01",value:4.1},{date:"2024-12-01",value:4.2}],
    lastContact:"2024-12-28", openTickets:2, productUsage:88, archived:false, nextAction:"Send renewal proposal draft to Sara by Jan 15",
    stakeholders:[{id:1,name:"Sara Al-Mansoori",title:"Head of Operations",role:"Champion",sentiment:"Positive",lastTouch:"2024-12-28"},{id:2,name:"Khalid Nasser",title:"IT Director",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-12-10"}],
    successPlan:{goal:"Reduce support ticket volume by 40%",milestones:[{id:1,text:"Audit all open ticket categories",done:true},{id:2,text:"Implement self-serve knowledge base",done:true},{id:3,text:"Train customer team on portal",done:false},{id:4,text:"Validate 40% reduction in Q3",done:false}]},
    activityLog:[{id:1,date:"2024-12-28",type:"Call",note:"Quarterly check-in. Sara confirmed renewal intent."},{id:2,date:"2024-12-10",type:"Email",note:"Sent product update summary to Khalid."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Strong relationship with Sara. Renewal conversation started." },
  { id:2, name:"Talabat", industry:"Food Delivery", plan:"Growth", arr:84000, renewalDate:"2026-03-01", nps:41, ces:2.9,
    cesHistory:[{date:"2024-09-01",value:4.1},{date:"2024-10-01",value:3.8},{date:"2024-11-01",value:3.3},{date:"2024-12-01",value:2.9}],
    lastContact:"2024-12-05", openTickets:7, productUsage:52, archived:false, nextAction:"Book urgent call with Ahmed — address CES decline + ticket backlog",
    stakeholders:[{id:1,name:"Ahmed Karimi",title:"VP Product",role:"Detractor",sentiment:"Negative",lastTouch:"2024-12-05"},{id:2,name:"Layla Hassan",title:"Ops Manager",role:"Blocker",sentiment:"Negative",lastTouch:"2024-11-20"}],
    successPlan:{goal:"Full API integration by Q1",milestones:[{id:1,text:"Complete API requirements doc",done:true},{id:2,text:"Dev environment setup",done:false},{id:3,text:"Staging integration test",done:false},{id:4,text:"Production go-live",done:false},{id:5,text:"Post-launch monitoring",done:false},{id:6,text:"Sign-off and handover",done:false}]},
    activityLog:[{id:1,date:"2024-12-05",type:"Call",note:"Ahmed frustrated with API delays. Escalated internally."},{id:2,date:"2024-11-20",type:"Email",note:"Layla raised concerns about timeline again."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"CES declining 3 months straight. Ticket backlog growing. Renewal in 60 days — urgent." },
  { id:3, name:"Careem", industry:"Mobility", plan:"Enterprise", arr:210000, renewalDate:"2026-11-30", nps:68, ces:3.8,
    cesHistory:[{date:"2024-09-01",value:3.5},{date:"2024-10-01",value:3.6},{date:"2024-11-01",value:3.8},{date:"2024-12-01",value:3.8}],
    lastContact:"2024-12-20", openTickets:1, productUsage:79, archived:false, nextAction:"Schedule QBR for Q1 — expansion discussion with Priya",
    stakeholders:[{id:1,name:"Priya Mehta",title:"Director of Partnerships",role:"Champion",sentiment:"Positive",lastTouch:"2024-12-20"},{id:2,name:"Omar Shaikh",title:"CTO",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-11-15"},{id:3,name:"Dana Al-Farsi",title:"Finance Lead",role:"Neutral",sentiment:"Positive",lastTouch:"2024-12-01"}],
    successPlan:{goal:"Expand to 3 new city operations",milestones:[{id:1,text:"City feasibility assessment",done:true},{id:2,text:"Onboard city ops team",done:true},{id:3,text:"Pilot launch in City 1",done:false},{id:4,text:"Evaluate pilot results",done:false},{id:5,text:"Scale to cities 2 & 3",done:false}]},
    activityLog:[{id:1,date:"2024-12-20",type:"Meeting",note:"QBR completed. Priya confirmed expansion budget approved."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Expansion potential. Budget cycle Q1." },
  { id:4, name:"Anghami", industry:"Music Streaming", plan:"Starter", arr:28000, renewalDate:"2026-02-14", nps:55, ces:3.5,
    cesHistory:[{date:"2024-09-01",value:3.5},{date:"2024-10-01",value:3.5},{date:"2024-11-01",value:3.5},{date:"2024-12-01",value:3.5}],
    lastContact:"2024-11-10", openTickets:0, productUsage:61, archived:false, nextAction:"Re-engage Fadi — send personalised check-in email today",
    stakeholders:[{id:1,name:"Fadi Bishara",title:"Product Manager",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-11-10"}],
    successPlan:{goal:"Launch branded playlist feature",milestones:[{id:1,text:"Define feature requirements",done:true},{id:2,text:"Design review with product team",done:false},{id:3,text:"Beta launch",done:false}]},
    activityLog:[{id:1,date:"2024-11-10",type:"Email",note:"Sent feature update. No response yet."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Gone quiet. Last contact 7 weeks ago. Renewal in ~45 days." },
];

// ─── Config ───────────────────────────────────────────────────────────────────
export const STAGE_CFG = {
  "Healthy":         { color:"var(--emerald)", bg:"var(--emerald-dim)", border:"var(--emerald-border)" },
  "Stable":          { color:"var(--sky)",     bg:"var(--sky-dim)",     border:"var(--sky-border)"     },
  "Needs Attention": { color:"var(--amber)",   bg:"var(--amber-dim)",   border:"var(--amber-border)"   },
  "At Risk":         { color:"var(--rose)",    bg:"var(--rose-dim)",    border:"var(--rose-border)"    },
};
export const ROLE_CFG = {
  Champion:  { color:"var(--emerald)", bg:"var(--emerald-dim)" },
  Neutral:   { color:"var(--indigo)",  bg:"var(--indigo-dim)"  },
  Detractor: { color:"var(--amber)",   bg:"var(--amber-dim)"   },
  Blocker:   { color:"var(--rose)",    bg:"var(--rose-dim)"    },
};
export const ACT_TYPES  = ["Call","Email","Meeting","Note"];
export const ACT_ICONS  = { Call:"Ph", Email:"Em", Meeting:"Mx", Note:"Nt" };
export const ACT_COLORS = { Call:"var(--emerald)", Email:"var(--indigo)", Meeting:"var(--violet)", Note:"var(--amber)" };

// ─── Health engine ────────────────────────────────────────────────────────────
export const calcHealth = (a) => {
  const nps  = Math.round((a.nps/100)*25);
  const ces  = Math.round((a.ces/5)*25);
  const use  = Math.round((a.productUsage/100)*25);
  const tix  = Math.round(Math.max(0,1-a.openTickets/10)*15);
  const base = 10;
  const total= Math.min(100,Math.max(0,nps+ces+use+tix+base));
  const stage= total>=70?"Healthy":total>=55?"Stable":total>=40?"Needs Attention":"At Risk";
  return { total, stage, parts:[
    { label:"NPS",           pts:nps,  max:25, note:a.nps>=50?"Healthy":"Below benchmark" },
    { label:"CES",           pts:ces,  max:25, note:a.ces>=3.5?"Low effort":"High friction" },
    { label:"Product Usage", pts:use,  max:25, note:`${a.productUsage}% adoption` },
    { label:"Open Tickets",  pts:tix,  max:15, note:a.openTickets===0?"No open issues":`${a.openTickets} unresolved` },
    { label:"Base",          pts:base, max:10, note:"Active account" },
  ]};
};

// ─── Health signal helpers ────────────────────────────────────────────────────
// Returns the top-2 worst signals driving an account's health score down.
// Used on portfolio cards and pipeline cards so CSMs see WHY not just WHAT.
export const getHealthWarnings = (account) => {
  const w = [];
  const cd = account.lastContact  ? Math.floor((Date.now()-new Date(account.lastContact))/86400000) : 999;
  const rd = account.renewalDate  ? Math.ceil((new Date(account.renewalDate)-Date.now())/86400000)  : 999;
  if ((account.nps??50) < 35)               w.push({t:`NPS ${account.nps??'—'}`,         s:2});
  else if ((account.nps??50) < 55)          w.push({t:"NPS low",                          s:1});
  if ((account.ces??3.5) < 2.5)            w.push({t:"High friction",                    s:2});
  if ((account.productUsage??60) < 25)      w.push({t:`Usage ${account.productUsage??'—'}%`, s:2});
  else if ((account.productUsage??60) < 45) w.push({t:"Low usage",                       s:1});
  if ((account.openTickets??0) >= 5)        w.push({t:`${account.openTickets} tickets`,   s:2});
  else if ((account.openTickets??0) >= 3)   w.push({t:`${account.openTickets} tickets`,   s:1});
  if (cd > 30)       w.push({t:`${cd}d no contact`,  s:2});
  else if (cd > 21)  w.push({t:`${cd}d no contact`,  s:1});
  if (rd >= 0 && rd <= 45 && (account.healthScore??100) < 65) w.push({t:`Renews ${rd}d`, s:2});
  return w.sort((a,b)=>b.s-a.s).slice(0,2);
};

// Renewal risk rating that weighs health against time-to-renewal.
// 90 days away but health=35 is MORE at risk than 20 days away but health=85.
export const renewalRisk = (account) => {
  const d = account.renewalDate ? Math.ceil((new Date(account.renewalDate)-Date.now())/86400000) : 999;
  const h = account.healthScore ?? 100;
  if (d < 0)                          return {label:"Overdue",       color:"var(--rose)",    bg:"var(--rose-dim)"  };
  if (d >= 0 && d <= 14)             return {label:"Renewing Soon", color:"var(--indigo)",  bg:"var(--indigo-dim)"};
  if (h < 40 || (h < 50 && d <= 30)) return {label:"Critical",      color:"var(--rose)",    bg:"var(--rose-dim)"  };
  if (h < 55 && d <= 90)             return {label:"At Risk",       color:"var(--amber)",   bg:"var(--amber-dim)" };
  if (h < 65 && d <= 120)            return {label:"Watch",         color:"var(--amber)",   bg:"var(--amber-dim)" };
  if (h >= 70)                       return {label:"Safe",          color:"var(--emerald)", bg:"rgba(5,150,105,.1)"};
  return                                     {label:"Monitor",       color:"var(--indigo)",  bg:"var(--indigo-dim)" };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const hColor   = s => s>=70?"var(--emerald)":s>=45?"var(--amber)":"var(--rose)";
export const fmtMoney = n => { const v=parseFloat(n)||0; return v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`; };
export const ago      = d => Math.floor((new Date()-new Date(d))/86400000);
export const until    = d => Math.ceil((new Date(d)-new Date())/86400000);
export const todayStr = () => new Date().toISOString().split("T")[0];
export const shapeTask = (t, accounts=[]) => ({
  id: t.id, type:"manual", auto:false, done:t.done,
  accountId: t.accountId||null,
  accountName: accounts.find(a=>a.id===t.accountId)?.name || "",
  title: t.title, description: t.description||"",
  priority: t.priority||"High", dueDate: t.dueDate||null,
});
export const sentIcon = s => s==="Positive"?"↑":s==="Negative"?"↓":"→";
export const initials = name => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
export const hue      = name => { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))%360; return h; };

// ─── Data layer — API-first, localStorage fallback ───────────────────────────
// If VITE_API_URL is set, all reads/writes go to the backend.
// If not set (local dev without backend), falls back to localStorage silently.

export const load = () => {
  try {
    const s = localStorage.getItem("pulse_v4");
    return s ? JSON.parse(s) : SEED;
  } catch { return SEED; }
};
export const save = a => {
  try { localStorage.setItem("pulse_v4", JSON.stringify(a)); } catch {}
};

// ─── Primitives ───────────────────────────────────────────────────────────────

// SVG icon system — replaces all emoji in functional UI contexts
export const Ic = ({ n, size=16, color="currentColor", style={} }) => {
  const icons = {
    // Navigation
    portfolio:  <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    tasks:      <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    pipeline:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    playbooks:  <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    briefing:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    email:      <><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></>,
    overview:   <><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></>,
    integrations:<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    // Actions
    edit:       <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    close:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    plus:       <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:      <><polyline points="20 6 9 17 4 12"/></>,
    copy:       <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    arrow_right:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    chevron_down:<><polyline points="6 9 12 15 18 9"/></>,
    chevron_up: <><polyline points="18 15 12 9 6 15"/></>,
    upload:     <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>,
    // Status
    alert:      <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    bell:       <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    shield:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    trend_up:   <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    trend_down: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    activity:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    // Content
    target:     <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    note:       <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    user:       <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    users:      <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    calendar:   <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    health:     <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
    prep:       <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="11" y2="11"/></>,
    info:       <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    success:    <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    dismiss:    <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    eye:        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    survey:     <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/><circle cx="18" cy="4" r="3"/></>,
    automation:  <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></>,
    onboarding:  <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/><circle cx="12" cy="12" r="3" fill="none"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    perf:        <><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></>,
    escalate:    <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    expand:      <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>,
    archive:     <><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,...style}}>
      {icons[n]||icons.note}
    </svg>
  );
};

// Scenario badge — colored abbr pill, replaces emoji scenario indicators
export const ScenarioBadge = ({ scenario, small }) => {
  const sc = SCENARIO_CFG[scenario]||SCENARIO_CFG["Onboarding"];
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",
      fontSize:small?9:10,fontFamily:"var(--font-mono)",fontWeight:700,letterSpacing:".04em",
      width:small?20:24,height:small?20:24,borderRadius:"var(--r-sm)",
      color:sc.color,background:sc.bg,flexShrink:0,
    }}>
      {sc.abbr}
    </span>
  );
};
export const Sparkline = ({ data, color, width=60, height=24 }) => {
  if (!data||data.length<2) return null;
  const vals=data.map(d=>d.value??d.product_usage);
  const min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;
  const w=width,h=height;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*w},${h-((v-min)/range)*(h-4)-2}`).join(" ");
  const last=pts.split(" ").pop().split(",");
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  );
};

export const Ring = ({ score, size=48 }) => {
  const s = score ?? 0;
  const r=(size-6)/2,circ=2*Math.PI*r,dash=(s/100)*circ,color=hColor(s);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeOpacity=".15" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .6s ease"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,
          fill:color,fontSize:"11px",fontFamily:"var(--font-mono)",fontWeight:500}}>
        {score ?? "—"}
      </text>
    </svg>
  );
};

export const Bar = ({ value, color="var(--indigo)", thin }) => (
  <div style={{height:thin?3:7,background:"var(--bg4)",borderRadius:99,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(100,value)}%`,background:color,borderRadius:99,transition:"width .7s ease"}}/>
  </div>
);

export const CitedNarrative = ({ text, citations = [], fontSize = 14 }) => {
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
          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Sources</div>
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

export const Badge = ({ label, color, bg, small }) => (
  <span style={{fontSize:small?10:11,fontFamily:"var(--font-display)",fontWeight:600,
    padding:small?"2px 7px":"3px 10px",borderRadius:"var(--r-sm)",color,background:bg,
    display:"inline-block",whiteSpace:"nowrap",letterSpacing:".01em"}}>
    {label}
  </span>
);

export const Avatar = ({ name, size=36 }) => {
  const h=hue(name);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,display:"flex",
      alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.34,
      background:`hsl(${h},48%,88%)`,color:`hsl(${h},42%,30%)`,fontFamily:"var(--font-display)",
      letterSpacing:"-.01em"}}>
      {initials(name)}
    </div>
  );
};

export const Inp = (p) => (
  <input {...p} style={{width:"100%",background:"var(--bg2)",border:"1.5px solid var(--border)",
    borderRadius:"var(--r)",padding:"10px 12px",color:"var(--text)",fontFamily:"var(--font-display)",
    fontSize:13,outline:"none",transition:"border-color .15s,box-shadow .15s",...p.style}}/>
);
export const Slct = (p) => (
  <select {...p} style={{width:"100%",background:"var(--bg2)",border:"1.5px solid var(--border)",
    borderRadius:"var(--r)",padding:"10px 12px",color:"var(--text)",fontFamily:"var(--font-display)",
    fontSize:13,outline:"none",cursor:"pointer",...p.style}}/>
);
export const Fld = ({ label, children }) => (
  <div style={{marginBottom:14}}>
    <div style={{fontSize:12,fontWeight:500,color:"var(--text2)",marginBottom:6}}>{label}</div>
    {children}
  </div>
);
export const Btn = ({ children, variant="primary", onClick, style={}, ...rest }) => {
  const styles = {
    primary: { background:"var(--indigo)", color:"white", boxShadow:"var(--shadow-xs)", border:"none" },
    ghost:   { background:"var(--bg3)",    color:"var(--text2)", boxShadow:"none", border:"1.5px solid var(--border)" },
    danger:  { background:"var(--rose-dim)", color:"var(--rose)", boxShadow:"none", border:"none" },
  };
  return (
    <button onClick={onClick} {...rest}
      style={{borderRadius:"var(--r)",padding:"8px 16px",
        fontFamily:"var(--font-display)",fontWeight:600,fontSize:13,
        cursor:"pointer",transition:"filter .15s,transform .1s",letterSpacing:"-.01em",
        ...styles[variant],...style}}
      onMouseEnter={e=>{e.currentTarget.style.filter="brightness(0.91)";e.currentTarget.style.transform="translateY(-0.5px)";}}
      onMouseLeave={e=>{e.currentTarget.style.filter="none";e.currentTarget.style.transform="none";}}>
      {children}
    </button>
  );
};

export const Card = ({ children, pad=20, style={} }) => (
  <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",
    boxShadow:"var(--shadow-xs)",padding:pad,...style}}>
    {children}
  </div>
);

export const SectionLabel = ({ children }) => (
  <div style={{fontSize:10.5,fontWeight:600,letterSpacing:".06em",color:"var(--text3)",
    textTransform:"uppercase"}}>
    {children}
  </div>
);

export const StatStrip = ({ stats }) => (
  <div style={{display:"flex",borderTop:"1px solid var(--border)",marginTop:12,paddingTop:10}}>
    {stats.map((s,i) => (
      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
        borderLeft:i>0?"1px solid var(--border)":"none",padding:"0 6px"}}>
        <div style={{fontSize:18,fontWeight:650,fontFamily:"var(--font-display)",
          fontVariantNumeric:"tabular-nums",color:s.color||"var(--text)",lineHeight:1.1}}>
          {s.value}
        </div>
        <div style={{fontSize:10.5,color:"var(--text3)",marginTop:3,textAlign:"center"}}>{s.label}</div>
      </div>
    ))}
  </div>
);

export const SignalCard = ({ tone="info", icon, title, children, actions }) => {
  const tones = {
    danger:  { color:"var(--rose)",    dim:"var(--rose-dim)"    },
    warn:    { color:"var(--amber)",   dim:"var(--amber-dim)"   },
    success: { color:"var(--emerald)", dim:"var(--emerald-dim)" },
    info:    { color:"var(--sky)",     dim:"var(--sky-dim)"     },
    accent:  { color:"var(--indigo)",  dim:"var(--indigo-dim)"  },
  };
  const t = tones[tone] || tones.info;
  return (
    <div style={{background:t.dim,borderLeft:`3px solid ${t.color}`,borderRadius:"var(--r)",
      padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:children?8:0}}>
        {icon&&<span style={{flexShrink:0}}>{icon}</span>}
        <span style={{fontSize:12.5,fontWeight:650,color:t.color,flex:1}}>{title}</span>
        {actions&&<div style={{display:"flex",gap:6}}>{actions}</div>}
      </div>
      {children&&<div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>{children}</div>}
    </div>
  );
};

export const Tabs = ({ tabs, active, onSelect, alerts={} }) => (
  <div style={{display:"flex",overflowX:"auto",borderBottom:"1.5px solid var(--border)",marginBottom:20}}>
    {tabs.map(({key,label}) => (
      <button key={key} onClick={()=>onSelect(key)}
        style={{position:"relative",padding:"8px 16px",border:"none",background:"transparent",
          cursor:"pointer",fontFamily:"var(--font-display)",fontSize:13,fontWeight:550,
          whiteSpace:"nowrap",color:active===key?"var(--text)":"var(--text3)",
          borderBottom:active===key?"2px solid var(--indigo)":"2px solid transparent",
          transition:"color .15s,border-color .15s",marginBottom:"-1.5px"}}>
        {label}
        {alerts[key]&&active!==key&&(
          <span style={{position:"absolute",top:4,right:4,width:6,height:6,
            borderRadius:"50%",background:"var(--rose)",display:"block"}}/>
        )}
      </button>
    ))}
  </div>
);

export const ToastBar = ({ toasts }) => (
  <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
    display:"flex",flexDirection:"column",gap:8,zIndex:9999,alignItems:"center",pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,
        background:t.type==="error"?"var(--rose)":t.type==="success"?"var(--emerald)":"var(--indigo)",
        color:"white",padding:"11px 20px",borderRadius:"var(--r-lg)",
        boxShadow:"0 8px 32px rgba(10,18,36,0.3)",fontSize:13,fontWeight:600,
        animation:"toastIn .18s ease",maxWidth:400,letterSpacing:"-.015em",
        border:"1px solid rgba(255,255,255,0.12)"}}>
        <Ic n={t.type==="error"?"dismiss":t.type==="success"?"check":"info"} size={15} color="rgba(255,255,255,0.85)"/>
        {t.message}
      </div>
    ))}
  </div>
);

export const Modal = ({ title, onClose, children, wide }) => {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"var(--scrim)",backdropFilter:"blur(8px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:wide?800:560,
        maxHeight:"90vh",overflow:"auto",boxShadow:"var(--shadow-lg)",animation:"scaleIn .18s ease",border:"1px solid var(--border)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"20px 24px",borderBottom:"1px solid var(--border)",
          position:"sticky",top:0,background:"var(--bg2)",zIndex:1}}>
          <span style={{fontWeight:700,fontSize:16}}>{title}</span>
          <button onClick={onClose} className="icon-btn"
            style={{background:"var(--bg3)",border:"none",color:"var(--text2)",
              width:32,height:32,borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Ic n="close" size={14} color="var(--text2)"/></button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
};

export const Confirm = ({ msg, onConfirm, onCancel }) => {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onCancel();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onCancel]);
  return (
    <div style={{position:"fixed",inset:0,background:"var(--scrim)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-lg)",padding:28,maxWidth:360,
        width:"100%",boxShadow:"var(--shadow-lg)",animation:"scaleIn .15s ease"}}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>Are you sure?</div>
        <div style={{fontSize:13,color:"var(--text2)",marginBottom:24,lineHeight:1.6}}>{msg}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="danger" onClick={onConfirm} style={{flex:1,background:"var(--rose)",color:"white"}}>Delete</Btn>
          <Btn variant="ghost" onClick={onCancel} style={{flex:1}}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
};

export const PlaybookStepView = ({ step, done, onToggle, expanded, onExpand }) => {
  return (
    <div style={{background:"white",borderRadius:"var(--r)",border:`1.5px solid ${done?"var(--emerald-dim)":"var(--border)"}`,
      marginBottom:8,overflow:"hidden",transition:"all .15s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer"}}
        onClick={onExpand}>
        <input type="checkbox" checked={done} onChange={e=>{e.stopPropagation();onToggle();}}
          style={{width:16,height:16,cursor:"pointer",accentColor:"var(--emerald)",flexShrink:0}}
          onClick={e=>e.stopPropagation()}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:13,fontWeight:600,color:done?"var(--text3)":"var(--text)",
              textDecoration:done?"line-through":"none"}}>{step.title}</span>
            <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)",
              background:"var(--bg3)",padding:"1px 7px",borderRadius:99}}>{step.timeline}</span>
            {step.owner && (
              <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--sky)",
                background:"var(--sky-dim)",padding:"1px 7px",borderRadius:99}}>{step.owner}</span>
            )}
          </div>
        </div>
        <span style={{fontSize:11,color:"var(--text3)",flexShrink:0}}>{expanded?"▲":"▼"}</span>
      </div>
      {expanded && (
        <div style={{padding:"0 16px 14px 44px",borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginTop:12,marginBottom:12}}>
            {step.action}
          </div>
          {step.commsTemplate && (
            <div>
              <div style={{fontSize:10,fontFamily:"var(--font-mono)",color:"var(--text3)",
                textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>
                Communication template
              </div>
              <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",
                fontSize:12,color:"var(--text2)",lineHeight:1.8,
                fontFamily:"var(--font-mono)",whiteSpace:"pre-wrap"}}>
                {step.commsTemplate}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Task engine ─────────────────────────────────────────────────────────────
export const TASK_TYPE_CFG = {
  renewal:  { color:"var(--indigo)", bg:"var(--indigo-dim)", abbr:"RE", label:"Renewal"  },
  health:   { color:"var(--rose)",   bg:"var(--rose-dim)",   abbr:"HL", label:"Health"   },
  silent:   { color:"var(--amber)",  bg:"var(--amber-dim)",  abbr:"SI", label:"Silent"   },
  ces:      { color:"var(--amber)",  bg:"var(--amber-dim)",  abbr:"CE", label:"CES"      },
  playbook: { color:"var(--teal)",   bg:"var(--teal-dim)",   abbr:"PB", label:"Playbook" },
  manual:   { color:"var(--sky)",    bg:"var(--sky-dim)",    abbr:"MN", label:"Manual"   },
};

export const generateAutoTasks = (accounts) => {
  const tasks = [];
  const today = new Date();

  accounts.forEach(account => {
    const rdays  = Math.ceil((new Date(account.renewalDate) - today) / 86400000);
    const silent = Math.floor((today - new Date(account.lastContact)) / 86400000);
    const cesVals = account.cesHistory.map(d=>d.value);
    const cesDeclining = cesVals.length >= 3
      && cesVals.at(-1) < cesVals.at(-2)
      && cesVals.at(-2) < cesVals.at(-3);

    // ── Renewal tasks ──
    if (account.renewalDate) {
      if (rdays < 0) {
        tasks.push({ id:`renewal-overdue-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Renewal overdue — ${account.name}`,
          description:`Renewal was due ${Math.abs(rdays)} days ago. Immediate action required.`,
          dueDate: account.renewalDate });
      } else if (rdays <= 30 && account.healthScore < 60) {
        tasks.push({ id:`renewal-critical-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`At-risk renewal in ${rdays}d — ${account.name}`,
          description:`Renewal approaching with health score ${account.healthScore}. Activate at-risk renewal playbook now.`,
          dueDate: todayStr() });
      } else if (rdays <= 30) {
        tasks.push({ id:`renewal-30-${account.id}`, type:"renewal", priority:"High",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Renewal in ${rdays}d — finalise contract`,
          description:`Get verbal commit and send renewal paperwork for ${account.name}.`,
          dueDate: todayStr() });
      } else if (rdays <= 60 && account.healthScore < 55) {
        tasks.push({ id:`renewal-60risk-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`At-risk renewal in ${rdays}d — ${account.name}`,
          description:`Health score ${account.healthScore} with renewal in ${rdays} days. Start recovery conversation immediately.`,
          dueDate: todayStr() });
      } else if (rdays <= 90) {
        tasks.push({ id:`renewal-90-${account.id}`, type:"renewal", priority:"High",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Start renewal prep — ${account.name}`,
          description:`Renewal in ${rdays} days. Prepare ROI summary and schedule planning call.`,
          dueDate: new Date(today.getTime() + 7*86400000).toISOString().split("T")[0] });
      }
    }

    // ── Health tasks ──
    if (account.healthScore < 40) {
      tasks.push({ id:`health-critical-${account.id}`, type:"health", priority:"Critical",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`Critical health — activate recovery for ${account.name}`,
        description:`Health score ${account.healthScore}/100 — churn risk ${account.churnRisk}%. Escalate today.`,
        dueDate: todayStr() });
    } else if (account.healthScore < 55) {
      tasks.push({ id:`health-warn-${account.id}`, type:"health", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`Health declining — intervene on ${account.name}`,
        description:`Health score ${account.healthScore}/100. Diagnose root cause before it drops further.`,
        dueDate: todayStr() });
    }

    // ── Silent account tasks ──
    if (silent >= 30) {
      tasks.push({ id:`silent-${account.id}`, type:"silent", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`No contact in ${silent}d — re-engage ${account.name}`,
        description:`Last contact was ${silent} days ago. Risk of disengagement is high.`,
        dueDate: todayStr() });
    }

    // ── CES tasks ──
    if (cesDeclining) {
      tasks.push({ id:`ces-${account.id}`, type:"ces", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`CES declining 3 months — investigate ${account.name}`,
        description:`CES dropped from ${cesVals.at(-3).toFixed(1)} → ${cesVals.at(-2).toFixed(1)} → ${cesVals.at(-1).toFixed(1)}. Find the friction source.`,
        dueDate: todayStr() });
    }

    // ── Active playbook next step ──
    if (account.activePlaybookId) {
      const pb = PLAYBOOK_LIBRARY.find(p=>p.id===account.activePlaybookId);
      if (pb) {
        const nextStep = pb.steps.find(s=>!(account.activePlaybookSteps||{})[s.id]);
        if (nextStep) {
          tasks.push({ id:`playbook-${account.id}-${nextStep.id}`, type:"playbook", priority:"Medium",
            accountId:account.id, accountName:account.name, auto:true, done:false,
            title:`${pb.name} — next step for ${account.name}`,
            description:`Step: "${nextStep.title}" (${nextStep.timeline})`,
            dueDate: todayStr() });
        }
      }
    }
  });

  // Sort: Critical first, then High, then Medium; within same priority by due date
  const pOrder = { Critical:0, High:1, Medium:2 };
  return tasks.sort((a,b) => pOrder[a.priority]-pOrder[b.priority] || a.dueDate.localeCompare(b.dueDate));
};
