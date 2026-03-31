import { useState, useEffect, useCallback } from "react";

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    /* Surfaces */
    --bg:#f7f8fc; --bg2:#ffffff; --bg3:#f1f3f9; --bg4:#e8ecf5;
    --border:#e2e6ef; --border2:#c9d0e8;

    /* Semantic colours */
    --indigo:#4361ee; --indigo-dim:rgba(67,97,238,0.07); --indigo-glow:rgba(67,97,238,0.20);
    --emerald:#059669; --emerald-dim:rgba(5,150,105,0.07);
    --amber:#d97706;  --amber-dim:rgba(217,119,6,0.08);
    --rose:#e11d48;   --rose-dim:rgba(225,29,72,0.07);
    --sky:#0284c7;    --sky-dim:rgba(2,132,199,0.07);
    --violet:#7c3aed; --violet-dim:rgba(124,58,237,0.07);
    --teal:#0d9488;   --teal-dim:rgba(13,148,136,0.07);

    /* Text */
    --text:#0f172a; --text2:#475569; --text3:#94a3b8;

    /* Typography */
    --font-display:'Plus Jakarta Sans',sans-serif;
    --font-mono:'DM Mono',monospace;

    /* Radius tokens */
    --r-xs:4px; --r-sm:6px; --r:10px; --r-lg:14px; --r-xl:18px; --r-2xl:22px;

    /* Shadows */
    --shadow-xs:0 1px 2px rgba(15,23,42,0.05);
    --shadow-sm:0 1px 4px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04);
    --shadow:0 4px 12px rgba(15,23,42,0.07),0 2px 4px rgba(15,23,42,0.04);
    --shadow-lg:0 16px 40px rgba(15,23,42,0.12),0 6px 14px rgba(15,23,42,0.05);
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-display); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:99px; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideRight{ from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.96)}      to{opacity:1;transform:scale(1)} }
  @keyframes toastIn   { from{opacity:0;transform:translateY(12px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .card-hover { transition:box-shadow 0.18s,transform 0.18s,border-color 0.18s; }
  .card-hover:hover { box-shadow:var(--shadow); transform:translateY(-1px); border-color:var(--border2)!important; }
  .nav-item { transition:background 0.12s,color 0.12s; border-radius:var(--r); }
  .nav-item:hover { background:var(--bg3)!important; }
  .pill-btn { transition:all 0.12s; }
  .pill-btn:hover { filter:brightness(0.96); }
  .icon-btn { transition:background 0.12s; cursor:pointer; }
  .icon-btn:hover { background:var(--bg3)!important; }
  input:focus, select:focus, textarea:focus { border-color:var(--indigo)!important; box-shadow:0 0 0 3px var(--indigo-dim)!important; outline:none; }
  button:disabled { opacity:0.45; cursor:not-allowed; }
`;

// â”€â”€â”€ Scenario config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SCENARIO_CFG = {
  "Onboarding": { color:"var(--teal)",   bg:"var(--teal-dim)",   abbr:"OB" },
  "Churn Risk": { color:"var(--rose)",   bg:"var(--rose-dim)",   abbr:"CR" },
  "Renewal":    { color:"var(--indigo)", bg:"var(--indigo-dim)", abbr:"RE" },
  "Executive":  { color:"var(--violet)", bg:"var(--violet-dim)", abbr:"EX" },
};

// â”€â”€â”€ PLAYBOOK LIBRARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PLAYBOOK_LIBRARY = [
  // â”€â”€ ONBOARDING â”€â”€
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
      { id:1, title:"Send personalised welcome email", owner:"CSM", timeline:"Day 1", action:"Reference their specific goal from the sales process â€” not a template opener. Make it personal.", commsTemplate:"Subject: Welcome to [Product] â€” let's make this count\n\nHi [Name],\n\nReally glad to have [Company] on board. I've been looking forward to working with you.\n\nBased on what [Sales Rep] shared, your primary goal is [goal]. That's exactly what we're going to focus on together.\n\nI'll send a calendar invite for our kickoff call shortly â€” aiming for this week while everything is fresh.\n\nLooking forward to it.\n\n[Your name]" },
      { id:2, title:"Schedule kickoff call within 48 hours", owner:"CSM", timeline:"Day 1â€“2", action:"Don't let the account go cold at the handoff moment. Book before you do anything else.", commsTemplate:"Subject: Kickoff call â€” [Company] x [Product]\n\nHi [Name],\n\nI've blocked [time/date] for our kickoff â€” just 45 minutes to align on your goals and set up for success.\n\n[Calendar link]\n\nIf this doesn't work, here are two alternatives: [time1] or [time2].\n\nSee you then." },
      { id:3, title:"Run kickoff call", owner:"CSM", timeline:"Day 3", action:"Agenda: understand their definition of success, agree on 30-day milestones, confirm all key contacts. Do not start with product demos.", commsTemplate:"Kickoff agenda:\n1. Their business context and goals (15 min â€” you listen)\n2. Agree on 3 milestones for the first 30 days (10 min)\n3. Map key contacts and stakeholders (10 min)\n4. Product walkthrough focused on their specific use case (10 min)" },
      { id:4, title:"Send kickoff summary email", owner:"CSM", timeline:"Day 5", action:"Document agreed milestones and responsibilities in writing. Shared ownership starts here.", commsTemplate:"Subject: Kickoff summary â€” [Company]\n\nHi [Name],\n\nGreat call today. Here's what we agreed:\n\n30-Day Milestones:\n1. [Milestone 1] â€” Owner: [Name] â€” By: [Date]\n2. [Milestone 2] â€” Owner: [Name] â€” By: [Date]\n3. [Milestone 3] â€” Owner: [Name] â€” By: [Date]\n\nNext check-in: [Date]\n\nAny corrections or additions, let me know." },
      { id:5, title:"First product usage check", owner:"CSM", timeline:"Day 7", action:"Check if they are logging in. If usage is zero â€” call immediately. Do not email. Every silent day in onboarding costs 30 days of adoption later.", commsTemplate:"If no usage detected â€” call script:\n\"Hi [Name], I was reviewing your account and noticed you haven't had a chance to log in yet. Totally normal in the first week â€” I just want to make sure we haven't left you without something you need. Do you have 10 minutes now?\"" },
      { id:6, title:"Mid-onboarding check-in", owner:"CSM", timeline:"Day 14", action:"Review milestone progress. If behind, diagnose the blocker â€” is it technical, time, or motivation? Each has a different fix.", commsTemplate:"Subject: Two weeks in â€” how are things going?\n\nHi [Name],\n\nWe're at the halfway point of your first 30 days. Quick check:\n\nâœ“ [Milestone 1] â€” on track?\nâ—‹ [Milestone 2] â€” any blockers?\n\nHappy to jump on a call if anything needs unblocking. What's your honest read on progress so far?" },
      { id:7, title:"Share industry case study", owner:"CSM", timeline:"Day 21", action:"A relevant case study from their industry showing a customer who achieved the same goal. Reinforces the path forward.", commsTemplate:"Subject: How [Similar Company] achieved [Goal]\n\nHi [Name],\n\nThought this might be timely â€” [Similar Company] had a very similar challenge to yours and got to [result] in [timeframe].\n\n[Case study link or attachment]\n\nA couple of things they did that I think would work well for your team too: [2â€“3 specific points].\n\nWorth a quick call to map this to your situation?" },
      { id:8, title:"First value review call", owner:"CSM", timeline:"Day 30", action:"Did they hit their first milestone? If yes â€” celebrate and set next 30-day goals. If no â€” activate Slow Onboarding Recovery playbook immediately.", commsTemplate:"30-day review agenda:\n1. Celebrate what was achieved (even partial wins)\n2. Honest review of what didn't happen and why\n3. Set next 30-day milestone\n4. Any changes to the team, goals, or priorities?\n\nClose with: 'What's the one thing that would make the next 30 days a clear success for you?'" },
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
      { id:1, title:"Call directly â€” do not email", owner:"CSM", timeline:"Immediately", action:"Onboarding friction is almost always diagnosed in 10 minutes on a call. Email gives them an easy way to avoid the conversation.", commsTemplate:"Call script:\n\"Hi [Name], I was reviewing your account and wanted to call rather than email. I can see progress has slowed and I want to understand what's getting in the way â€” no agenda other than that. Do you have 10 minutes?\"" },
      { id:2, title:"Diagnose the root blocker", owner:"CSM", timeline:"Day 1", action:"Four possible causes: Technical setup issue. Internal resource constraints. Lost executive support. Unclear value. Each needs a different response.", commsTemplate:"Diagnostic questions:\nâ€¢ 'When you tried to [action], what happened?'\nâ€¢ 'Is your team able to prioritise this right now or is something else taking over?'\nâ€¢ 'Has anything changed in terms of priorities since we kicked off?'\nâ€¢ 'On a scale of 1â€“10, how clear is the value you're expecting to get from us?'" },
      { id:3, title:"Fix technical blockers same day", owner:"CSM + Support", timeline:"Day 1â€“2", action:"If it's technical, involve implementation or support immediately. Speed signals seriousness. Slow responses to technical issues in onboarding are unforgivable.", commsTemplate:"Internal escalation:\n'Urgent: [Company] is blocked on [specific technical issue] and has been for [X days]. This is their day [N] of onboarding. Needs same-day resolution.'" },
      { id:4, title:"Offer to run user training directly", owner:"CSM", timeline:"Day 2â€“3", action:"If internal resource constraints, remove the dependency on your champion doing the training. Offer to run a 30-minute session with end users yourself.", commsTemplate:"Subject: Let me take this off your plate\n\nHi [Name],\n\nI know your team is stretched. Rather than waiting for time in your schedule, what if I ran a 30-minute session directly with [team/users] this week?\n\nI'll handle everything â€” just need 5 people and 30 minutes. You don't even need to be there.\n\nWould [day] at [time] work?" },
      { id:5, title:"Escalate for lost executive support", owner:"CSM + Manager", timeline:"Day 2â€“3", action:"Get your manager or senior leader to send a personal note to their sponsor. Peer-to-peer outreach at this stage carries more weight than anything the CSM can do.", commsTemplate:"Executive outreach:\n\"Hi [Sponsor Name],\n\nI wanted to reach out personally regarding [Company]'s onboarding. I understand the team has had some challenges getting started and I want to make sure we're doing everything on our end to support you.\n\nWould you have 15 minutes this week for a quick call?\"" },
      { id:6, title:"Reset the success plan", owner:"CSM", timeline:"Day 3", action:"Agree on a simplified 2-week sprint with ONE specific, achievable milestone. Small wins rebuild momentum. Don't try to catch up everything at once.", commsTemplate:"Subject: New plan â€” let's make this simpler\n\nHi [Name],\n\nAfter our call, I've been thinking about how to make the next two weeks a clear win.\n\nLet's focus on just one thing: [Milestone].\n\nBy [Date], you'll have [outcome]. That's it. Nothing else.\n\nI'll check in every [two days / week] to remove any blockers.\n\nDoes this work for you?" },
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
      { id:1, title:"Ask your champion directly", owner:"CSM", timeline:"Week 4", action:"'Who in leadership has visibility into the outcomes we're delivering?' Do not guess â€” ask.", commsTemplate:"'[Name], I want to make sure the value we're delivering gets visibility at the right level internally. Who in leadership would care most about the outcomes we're working toward together?'" },
      { id:2, title:"Prepare an executive ROI summary", owner:"CSM", timeline:"Week 4â€“5", action:"One page, outcome-focused, no product features. Executives read outcomes, not capabilities. Include: before/after metrics, time to value, what's next.", commsTemplate:"Executive summary structure:\nâ€¢ The goal: [What they were trying to achieve]\nâ€¢ Where they were: [Baseline metric]\nâ€¢ What we did: [3 bullet points max]\nâ€¢ Where they are now: [Result metric]\nâ€¢ What's next: [Next milestone or opportunity]" },
      { id:3, title:"Request a 20-minute executive briefing", owner:"CSM", timeline:"Week 5", action:"Frame it as sharing early wins, not as a check-in. Go through your champion for the introduction.", commsTemplate:"Template for champion to send:\n'[Executive Name], I wanted to share some early results from our work with [Product]. Our CSM [Name] has put together a concise summary â€” would you have 20 minutes this month for a quick briefing? I think you'll find it worthwhile.'" },
      { id:4, title:"Run the executive meeting", owner:"CSM + Manager", timeline:"Week 5â€“6", action:"Open with their business priority (reference recent news). Connect your impact to that priority. Close with one forward-looking question, not a product pitch.", commsTemplate:"Executive meeting structure:\n1. 'I saw [company news] â€” how is that affecting your priorities?' (2 min)\n2. 'Here's what we've delivered so far and why it matters for [priority]' (5 min)\n3. 'Looking at the next quarter, here's what we're focused on' (5 min)\n4. 'What would make this partnership most valuable for you personally?' (close)" },
      { id:5, title:"Send executive follow-up within 24 hours", owner:"CSM", timeline:"Day after meeting", action:"One page. Decisions made. Next steps named. Executives respect speed and precision above all else.", commsTemplate:"Subject: Follow-up â€” [Company] x [Product] executive briefing\n\nHi [Executive Name],\n\nThank you for your time today. Key points:\n\nâ€¢ [Result 1]\nâ€¢ [Result 2]\nâ€¢ Next milestone: [Goal] by [Date]\n\nI'll keep you updated on progress quarterly. Please don't hesitate to reach out directly.\n\n[Your name and direct contact]" },
    ],
  },

  // â”€â”€ CHURN RISK â”€â”€
  {
    id:"pb-004",
    name:"Early Warning Response",
    scenario:"Churn Risk",
    priority:"High",
    trigger:"Health score 40â€“55 OR CES declines 2 consecutive readings",
    triggerCondition: a => (a.healthScore >= 40 && a.healthScore < 55) || (a.cesHistory && a.cesHistory.length >= 3 && a.cesHistory.at(-1).value < a.cesHistory.at(-2).value && a.cesHistory.at(-2).value < a.cesHistory.at(-3).value),
    successMetric:"Health score recovers above 60 within 45 days",
    summary:"Accounts in the 40â€“55 range have a 35â€“50% churn probability. The window to intervene is open â€” don't wait for it to close.",
    steps:[
      { id:1, title:"Make personalised contact â€” reference the signal", owner:"CSM", timeline:"Day 1", action:"Do not send a generic 'just checking in' email. Reference the specific signal â€” it shows you're paying attention.", commsTemplate:"Subject: Checking in on something specific\n\nHi [Name],\n\nI noticed [product usage has dropped / your CES score has declined over the last two readings] and I wanted to reach out before our next scheduled call.\n\nI'd rather hear from you early than find out later there was something I could have helped with.\n\nDo you have 15 minutes this week?" },
      { id:2, title:"Book a dedicated health call", owner:"CSM", timeline:"Day 1â€“2", action:"Not a standard check-in â€” a specific call with a clear purpose. Make the customer feel you've noticed and you care.", commsTemplate:"'I'd like to set aside some time specifically to talk about [Company]'s experience with us. Not a standard check-in â€” I want to understand what's really going on. When works best for you this week?'" },
      { id:3, title:"Diagnose across 4 dimensions", owner:"CSM", timeline:"Day 2â€“3", action:"Product (features not working?). People (champion distracted?). Process (workflow not fitting?). Priority (business focus shifted?). One of these is the real cause.", commsTemplate:"Diagnostic questions:\nâ€¢ Product: 'Are there specific features that aren't working the way you expected?'\nâ€¢ People: 'Has anything changed in your team's bandwidth or focus recently?'\nâ€¢ Process: 'Is the way we set up the workflow still matching how your team actually works?'\nâ€¢ Priority: 'Has anything shifted in your business priorities since we last spoke?'" },
      { id:4, title:"Assign the right intervention", owner:"CSM", timeline:"Day 3", action:"Based on root cause: technical fix â†’ support team same day. Re-engagement â†’ reset success plan. Stakeholder â†’ executive outreach. Priority shift â†’ re-scope success plan.", commsTemplate:"Internal note template:\nRoot cause identified: [cause]\nIntervention: [action]\nOwner: [person]\nDeadline: [date]\nRisk level: [High/Critical]" },
      { id:5, title:"Create a written recovery plan with the customer", owner:"CSM", timeline:"Day 3â€“5", action:"Shared ownership is critical. They need skin in the game. Document what you're each doing and by when.", commsTemplate:"Subject: Recovery plan â€” [Company]\n\nHi [Name],\n\nFollowing our call, here's what we've agreed:\n\nOn our side:\nâ€¢ [Action 1] by [Date] â€” Owner: [Name]\nâ€¢ [Action 2] by [Date] â€” Owner: [Name]\n\nOn your side:\nâ€¢ [Action 1] by [Date]\n\nNext check-in: [Date]\n\nDoes this capture it correctly?" },
      { id:6, title:"Bi-weekly check-ins with written updates", owner:"CSM", timeline:"Ongoing", action:"Don't reduce cadence until the health score has visibly improved. Consistency is what rebuilds confidence.", commsTemplate:"Subject: Progress update â€” [Company] recovery plan\n\nHi [Name],\n\nQuick update on where we are:\n\nâœ“ [Completed action]\nâŸ³ [In progress action] â€” on track for [date]\nâ—‹ [Upcoming action]\n\nHealth metrics this week: [metric]\nChange from last week: [change]\n\nNext check-in: [date]" },
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
    summary:"Every day counts. The approach here is radically different from standard CS â€” radical honesty, executive involvement, and proof over promises.",
    steps:[
      { id:1, title:"Escalate internally before contacting customer", owner:"CSM + Manager", timeline:"Day 1", action:"Align your manager on the situation, the risk, and the plan before anything goes to the customer. No surprises internally.", commsTemplate:"Internal brief:\nAccount: [Name]\nARR at risk: [Amount]\nRoot cause: [Summary]\nChurn probability: [X]%\nProposed approach: [Plan]\nWhat I need from you: [Specific ask]" },
      { id:2, title:"Make personal contact within 24 hours", owner:"CSM", timeline:"Day 1", action:"Not email â€” call. Your voice signals urgency and care that email cannot. Leave a voicemail if needed.", commsTemplate:"Call opener:\n'Hi [Name], I'm calling rather than emailing because I think this warrants a real conversation. I'm genuinely concerned about your experience with us and I want to understand where we've fallen short. Do you have 15 minutes right now?'\n\nVoicemail: 'Hi [Name], it's [Your name] from [Company]. I wanted to speak with you personally â€” not about renewals or anything commercial. I just want to understand your experience. Please call me back at [number] whenever is convenient.'" },
      { id:3, title:"Listen â€” do not defend or pitch", owner:"CSM", timeline:"Day 1â€“2", action:"Open with radical honesty. Listen for 80% of the conversation. Take notes. Resist every urge to explain or solve in the moment.", commsTemplate:"Opening:\n'Before I say anything else, I want to hear from you. Where have we let you down?'\n\nDuring the call: take notes, reflect back what you're hearing, do not interrupt.\n\nClose: 'Thank you for being honest with me. I'm going to take everything you've said seriously and come back to you within 48 hours with a concrete plan.'" },
      { id:4, title:"Bring in a senior leader", owner:"Manager / VP CS", timeline:"Day 2â€“3", action:"VP of CS or CEO depending on account size. This signals the relationship matters at the highest level. Peer-to-peer contact changes the dynamic.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI'm reaching out personally because I understand your experience with us has not been what we both hoped for. I take that seriously.\n\nI'd welcome the opportunity to speak with you directly â€” not to pitch or defend, but to listen and commit to making this right.\n\nWould 20 minutes this week work?'" },
      { id:5, title:"Send executive recovery brief within 48 hours", owner:"CSM", timeline:"Day 2â€“3", action:"What went wrong. What you're doing about it. What commitment you're making. Specific dates, specific owners. No vague promises.", commsTemplate:"Subject: Our commitment to [Company]\n\nHi [Name],\n\nFollowing our conversation, I want to put in writing what happened, what we're doing, and what you can expect from us.\n\nWhat went wrong:\n[Honest, specific summary]\n\nWhat we're doing:\nâ€¢ [Action 1] â€” Owner: [Name] â€” By: [Date]\nâ€¢ [Action 2] â€” Owner: [Name] â€” By: [Date]\n\nOur commitment:\n[Specific, measurable outcome] by [Date]. If we don't deliver, [what you'll do].\n\n[Senior leader name] is personally overseeing this." },
      { id:6, title:"Define one 'proof of life' milestone", owner:"CSM", timeline:"Day 3", action:"A single meaningful win you can deliver within 14 days. Give them a reason to believe before asking for anything.", commsTemplate:"'I don't want to ask you to commit to anything right now. What I'd like to do is earn back your confidence with one concrete delivery by [date]. If we achieve [milestone], would you be willing to have a fresh conversation about the path forward?'" },
      { id:7, title:"Daily check-ins until milestone delivered", owner:"CSM", timeline:"Daily", action:"Do not reduce cadence until you have delivered the proof milestone and the customer has acknowledged it. Consistency is what rebuilds trust.", commsTemplate:"Daily update (keep short):\n'Hi [Name] â€” quick update: [progress]. On track for [date]. Anything you need from me today?'" },
      { id:8, title:"Formal recovery review", owner:"CSM + Manager", timeline:"Day 14â€“21", action:"Acknowledge what happened openly. Present the new success plan. Ask for a renewed commitment.", commsTemplate:"Recovery review agenda:\n1. Acknowledge the past honestly (5 min)\n2. Present what was delivered and prove it (10 min)\n3. Introduce the new success plan (10 min)\n4. Ask: 'Based on what you've seen, are you willing to continue this relationship?'" },
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
    summary:"Disengagement is the #1 predictor of churn before it becomes visible. Research before you reach out â€” personalisation is the difference between a response and being ignored.",
    steps:[
      { id:1, title:"Research before reaching out", owner:"CSM", timeline:"Day 1", action:"Check their company news, LinkedIn activity, and product usage data. Personalise your outreach around something real â€” not 'I wanted to check in'.", commsTemplate:"Research checklist:\nâ–¡ Any company news in the last 30 days?\nâ–¡ Any LinkedIn posts from key contacts?\nâ–¡ Product usage trend â€” up, down, or flat?\nâ–¡ Any open tickets or unresolved issues?\nâ–¡ Renewal date â€” how far away?" },
      { id:2, title:"First outreach â€” personal, no agenda", owner:"CSM", timeline:"Day 1", action:"Short, personal, no product agenda. Give them a reason to respond that isn't 'because my CSM emailed me'.", commsTemplate:"Subject: Saw this and thought of you\n\nHi [Name],\n\nI came across [relevant industry article / company news] and immediately thought of the challenge you mentioned around [topic they raised].\n\n[One sentence observation or question about it]\n\nHow are things going on your end?\n\n[Your name]\n\nP.S. No agenda â€” genuinely curious." },
      { id:3, title:"Try a different channel if no response in 5 days", owner:"CSM", timeline:"Day 6", action:"If you've been emailing, call. If you've been calling, try LinkedIn. Channel fatigue is real.", commsTemplate:"LinkedIn message:\n'Hi [Name] â€” I've been trying to reach you and wanted to try a different channel. No pressure at all, just wanted to make sure [Company] has everything you need from our side. Happy to connect whenever works for you.'" },
      { id:4, title:"Send a value-focused email", owner:"CSM", timeline:"Day 10", action:"Give them a reason to reply. A relevant ROI insight, industry benchmark, or new feature tied to their stated goal.", commsTemplate:"Subject: [Industry] benchmark you might find useful\n\nHi [Name],\n\nWe've been seeing some interesting patterns across our [industry] customers. Companies that [action] are seeing [result].\n\nGiven your goal around [their goal], I thought this might be worth sharing.\n\n[One specific data point or insight]\n\nWould this be worth a 20-minute call to explore what it means for [Company]?" },
      { id:5, title:"Escalate through stakeholder map", owner:"CSM", timeline:"Day 14", action:"Is there another contact in the account? A colleague, their manager? Check the stakeholder map and reach out through a different person.", commsTemplate:"Outreach to secondary contact:\n'Hi [Name] â€” I've been trying to reach [Primary Contact] and haven't been able to connect. I wanted to make sure [Company] has everything they need from us. Are you the right person to speak with, or is there someone better placed?'" },
      { id:6, title:"Permission to close the loop email", owner:"CSM", timeline:"Day 21", action:"The most effective re-engagement email in CS. Gets the highest response rate of any sequence because it gives them control.", commsTemplate:"Subject: Checking in one last time\n\nHi [Name],\n\nI've reached out a few times over the past few weeks and I don't want to be a nuisance.\n\nI still believe there's real value we can deliver for [Company] around [their goal]. But I also understand priorities change.\n\nAre you still interested in working toward [goal]? If now isn't the right time, just let me know and I'll adjust my approach â€” no hard feelings at all.\n\nEither way, I just want to make sure I'm being useful to you.\n\n[Your name]" },
    ],
  },

  // â”€â”€ RENEWAL â”€â”€
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
      { id:1, title:"Internal renewal readiness assessment", owner:"CSM", timeline:"90 days out", action:"Know your position before the customer does. Health score, open tickets, CES trend, stakeholder coverage, success plan progress.", commsTemplate:"Renewal readiness checklist:\nâ–¡ Health score: [X] â€” trend: [up/down/flat]\nâ–¡ CES trend: [improving/declining/flat]\nâ–¡ Open tickets: [X] â€” any unresolved critical issues?\nâ–¡ Stakeholder coverage: [Champion name] â€” are they still in role?\nâ–¡ Executive sponsor: [Name] â€” last contact: [Date]\nâ–¡ Success plan progress: [X]% complete\nâ–¡ Known risks: [List any]\nâ–¡ Expansion opportunity: [Yes/No/Maybe]" },
      { id:2, title:"Prepare ROI summary report", owner:"CSM", timeline:"Days 1â€“5", action:"Quantify value delivered. Time saved, revenue impacted, tickets reduced, adoption rate. Make it undeniable. Numbers that the customer can present to their own leadership.", commsTemplate:"ROI summary structure:\nâ€¢ Goal at the start: [Original objective]\nâ€¢ Key results delivered:\n  - [Metric 1]: [Before] â†’ [After] = [% improvement]\n  - [Metric 2]: [Before] â†’ [After] = [% improvement]\nâ€¢ Usage growth: [X]% increase in active users\nâ€¢ Support health: [X]% reduction in tickets\nâ€¢ What's ahead: [Next milestone or expansion opportunity]" },
      { id:3, title:"Schedule dedicated renewal planning call", owner:"CSM", timeline:"Days 5â€“7", action:"Not a regular check-in â€” a strategic review. Frame it as planning for a strong next year.", commsTemplate:"Subject: Planning for a strong next year â€” [Company]\n\nHi [Name],\n\nWith your renewal coming up in about 90 days, I'd like to set aside time for a proper review of what we've achieved and what we're building toward together.\n\nThis isn't a renewal pitch â€” it's a strategic session to make sure we're fully aligned on your goals for the next year.\n\nDo you have an hour in the next two weeks? I'll also invite [their executive sponsor] if you think that adds value." },
      { id:4, title:"Run renewal planning call", owner:"CSM", timeline:"Days 7â€“14", action:"Open with their business goals for next year first. Connect what you've delivered to those goals. Then discuss renewal naturally â€” not as a transaction.", commsTemplate:"Renewal call structure:\n1. 'What are the top 2â€“3 priorities for your team in the next 12 months?' (listen first)\n2. 'Here's how what we've built together connects to those priorities' (present ROI)\n3. 'Here's what we're planning to deliver in year 2' (forward-looking)\n4. 'Given all of that, I'd love to get the renewal sorted early so we can stay focused on the work. Does that make sense to you?'" },
      { id:5, title:"Introduce expansion if appropriate", owner:"CSM", timeline:"Day 14", action:"Present expansion as part of the vision conversation â€” never as an add-on at the end of a renewal call.", commsTemplate:"'Given what you shared about [goal / new team / new geography], I think there's an opportunity to do more together next year. I've put together a quick summary of what that could look like â€” would it be worth 20 minutes to explore?'" },
      { id:6, title:"Get verbal commitment", owner:"CSM", timeline:"Days 14â€“21", action:"A verbal 'yes, let's move forward' 90 days out avoids procurement delays and last-minute surprises.", commsTemplate:"'Based on everything we've discussed, are you comfortable moving forward with the renewal? I can get the paperwork moving early so it's done and off your plate.'" },
      { id:7, title:"Send written renewal summary", owner:"CSM", timeline:"Within 48 hours of verbal", action:"Proposed terms, timeline, and next steps in writing. Speed closes deals.", commsTemplate:"Subject: Renewal summary â€” [Company]\n\nHi [Name],\n\nGreat conversation â€” here's what we discussed:\n\nRenewal terms: [Summary]\nEffective date: [Date]\nNext steps: [Who does what by when]\n\nI'll send the formal agreement to [contact] by [date]. Any questions, call me directly.\n\n[Your name]" },
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
    summary:"This is your last realistic window to save the renewal. The approach is fundamentally different â€” stop all standard renewal outreach immediately.",
    steps:[
      { id:1, title:"Stop standard renewal outreach immediately", owner:"CSM", timeline:"Day 1", action:"This account needs a completely different conversation. No renewal reminders, no proposal emails.", commsTemplate:"Internal note: 'Pausing all standard renewal comms for [Company]. Activating At-Risk Renewal playbook. Do not send renewal proposal until further notice.'" },
      { id:2, title:"Escalate internally and agree on terms flexibility", owner:"CSM + Manager", timeline:"Day 1", action:"Agree upfront what you're willing to offer â€” flexibility on terms, additional support, executive involvement. Know your position before the customer call.", commsTemplate:"Internal brief:\nâ€¢ ARR at risk: [Amount]\nâ€¢ Root cause of risk: [Summary]\nâ€¢ Competitive threat: [Yes/No]\nâ€¢ What we're willing to offer:\n  - [Option 1]\n  - [Option 2]\nâ€¢ What we're not willing to offer: [Limits]\nâ€¢ Who is getting involved: [Names]" },
      { id:3, title:"Call the champion directly â€” be honest", owner:"CSM", timeline:"Day 1â€“2", action:"Not email. Be honest: 'I know the experience hasn't been what we both expected. I want to make this right before the renewal conversation.'", commsTemplate:"Call script:\n'Hi [Name], I wanted to call you rather than email. I'm aware the renewal is coming up and I also know the experience hasn't been everything we both wanted it to be. I don't want to have a commercial conversation until we've addressed that. Can we talk honestly about where things stand?'" },
      { id:4, title:"Diagnose the specific renewal risk", owner:"CSM", timeline:"Day 2â€“3", action:"Product value gap? Internal priorities shifting? Budget pressure? Competitive threat? Each requires a fundamentally different response.", commsTemplate:"Risk diagnosis questions:\nâ€¢ 'On a scale of 1â€“10, how likely are you to renew right now? What would make it a 10?'\nâ€¢ 'Is there a specific competitor you're evaluating?'\nâ€¢ 'Is this a budget conversation or a value conversation?'\nâ€¢ 'Has anything changed internally that's affecting this decision?'" },
      { id:5, title:"Respond to competitive threat â€” do not discount first", owner:"CSM", timeline:"Day 3", action:"Restate your differentiated value before offering any pricing flexibility. Discounting as the first move signals you don't believe in your own product.", commsTemplate:"'I'd like to understand more about what [competitor] is offering before we talk about pricing. What are the specific things they're promising that you feel we're not delivering? That's what I want to address.'" },
      { id:6, title:"Respond to budget pressure â€” explore right-sizing", owner:"CSM", timeline:"Day 3", action:"Explore a right-sized renewal â€” fewer seats, shorter term, a pause option. Losing 20% ARR is better than losing 100% and the relationship.", commsTemplate:"'If budget is the primary challenge, I'd rather find a structure that works for you today than lose you entirely. Let's look at what a scaled-back version could look like â€” we can always grow back into it. What's the number that would make this work?'" },
      { id:7, title:"Bring in executive peer-to-peer", owner:"Manager / VP CS", timeline:"Days 3â€“5", action:"A peer-to-peer executive conversation at this stage carries more weight than anything a CSM can do.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI wanted to reach out personally ahead of your renewal. I understand there have been some challenges and I'd value the opportunity to speak with you directly about how we can make this work.\n\nWould 20 minutes this week be possible?'" },
      { id:8, title:"Propose a 30-day recovery sprint", owner:"CSM", timeline:"Day 5", action:"One clear, deliverable milestone before the renewal signs. Give them a reason to believe.", commsTemplate:"'I'd like to propose something. Before we finalise the renewal, let me deliver [specific outcome] in the next 30 days. If I do, I'm confident you'll want to continue. Does that feel fair?'" },
      { id:9, title:"Get a decision before day 30", owner:"CSM", timeline:"Day 30", action:"Yes, no, or a timeline for a decision. No ambiguity. A 'no' you can work with. Ambiguity you cannot.", commsTemplate:"'I want to be respectful of your time and process. By [date], I'd like to know if we're moving forward â€” even if it's a modified version of what we discussed. Can you commit to a decision by then?'" },
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
      { id:1, title:"Identify the specific expansion signal", owner:"CSM", timeline:"Day 1", action:"More users, new use cases, new department, new geography, or feature upgrade. Know exactly what you're proposing before you call.", commsTemplate:"Expansion signal checklist:\nâ–¡ User count growing beyond current licence?\nâ–¡ New department showing interest?\nâ–¡ Customer mentioned a new initiative that fits?\nâ–¡ Feature usage at capacity â€” ready for upgrade tier?\nâ–¡ New geography or office opening?" },
      { id:2, title:"Book a value review call â€” frame it as success", owner:"CSM", timeline:"Days 1â€“5", action:"Do not frame it as an expansion call. Frame it as celebrating their results and planning what's next.", commsTemplate:"Subject: Celebrating some strong results â€” [Company]\n\nHi [Name],\n\nI've been reviewing your results over the last quarter and I'm genuinely impressed with what your team has accomplished.\n\nI'd love to share what I'm seeing and talk about what the next phase could look like.\n\n30 minutes â€” when works for you?" },
      { id:3, title:"Open the call with their future priorities", owner:"CSM", timeline:"Days 5â€“7", action:"Ask about their next 6-month priorities before mentioning anything commercial. Listen for the expansion hooks.", commsTemplate:"Opening questions:\nâ€¢ 'What are the biggest initiatives your team is working on in the next 6 months?'\nâ€¢ 'Are there parts of your business that aren't yet using [Product] that you think could benefit?'\nâ€¢ 'How has your team grown since we started working together?'" },
      { id:4, title:"Present expansion as the solution to their stated goal", owner:"CSM", timeline:"Day 7", action:"Connect the expansion directly to something they said. 'Given what you just told me about [goal], I think this could help' â€” not a product pitch.", commsTemplate:"'You mentioned [goal / new initiative] â€” I think there's a natural opportunity here. [Expansion option] would allow you to [specific outcome tied to their goal]. Would it be worth exploring what that looks like?'" },
      { id:5, title:"Involve sales or account management for commercial negotiation", owner:"CSM + Sales", timeline:"Days 7â€“14", action:"CSM stays as the trusted advisor. Sales or AM handles the commercial conversation. Don't blur those lines.", commsTemplate:"Internal handoff:\n'I've had an expansion conversation with [Company]. [Name] is open to [expansion type]. Here's what they told me about their priorities: [summary]. They're expecting to hear from someone about next steps this week.'" },
    ],
  },

  // â”€â”€ EXECUTIVE â”€â”€
  {
    id:"pb-010",
    name:"QBR Preparation & Delivery",
    scenario:"Executive",
    priority:"High",
    trigger:"6 weeks before quarterly milestone for Enterprise or Growth accounts",
    triggerCondition: a => (a.plan === "Enterprise" || a.plan === "Growth"),
    successMetric:"Executive leaves with a clear picture of ROI, aligned on next quarter goals, and engaged in a forward-looking conversation",
    summary:"CS teams running consistent QBRs maintain NRR 15â€“20 points higher. The secret: build the review around their business, not your product.",
    steps:[
      { id:1, title:"Sync with champion â€” build their agenda", owner:"CSM", timeline:"6 weeks out", action:"'What do your execs care about right now? What would make you look great to your boss?' Build the QBR around their agenda, not yours.", commsTemplate:"Pre-QBR sync questions:\nâ€¢ 'What are the top 2â€“3 priorities for your leadership team right now?'\nâ€¢ 'Is there anything sensitive I should avoid in the room?'\nâ€¢ 'What would make you personally look great if it came out of this meeting?'\nâ€¢ 'Who else should be in the room?'\nâ€¢ 'What do you want your exec to walk away thinking about us?'" },
      { id:2, title:"Pull and interpret all data", owner:"CSM", timeline:"4 weeks out", action:"Usage, adoption, ticket resolution, milestone progress, CES. Interpret it â€” don't just aggregate it. What does the data actually mean for their business?", commsTemplate:"QBR data pack:\nâ–¡ Product usage trend (month over month)\nâ–¡ Feature adoption â€” which features, which teams\nâ–¡ Support: tickets opened, time to resolve, satisfaction\nâ–¡ Success plan: milestones completed vs planned\nâ–¡ CES trend\nâ–¡ Key wins with business impact (quantified)\nâ–¡ What's underperforming and why" },
      { id:3, title:"Build narrative using Before-Action-After framework", owner:"CSM", timeline:"3 weeks out", action:"Before (the pain that triggered purchase) â†’ Action (what was adopted) â†’ After (the business outcome). The feature is the middle of the story. The outcome is the point.", commsTemplate:"QBR narrative structure:\n1. Executive summary (1 slide): the one number that matters\n2. Where you started: [Business challenge / baseline metric]\n3. What you built together: [Key actions taken]\n4. Where you are now: [Outcome metrics]\n5. What's next: [Goals for next quarter]\n6. One expansion or opportunity to explore (if applicable)" },
      { id:4, title:"Confirm the right attendees", owner:"CSM", timeline:"2 weeks out", action:"Economic buyer must be in the room. If the budget holder isn't there, you're presenting to influencers not decision-makers.", commsTemplate:"Required attendees:\nCustomer side: Economic buyer / budget owner, day-to-day champion, relevant technical lead\nYour side: CSM, executive sponsor (for strategic accounts), product specialist (if roadmap discussion needed)\n\nIf economic buyer won't attend: 'I'd really like [Executive Name] to be part of this â€” the ROI discussion will be most valuable with them in the room. Is there a way to make that happen?'" },
      { id:5, title:"Share deck with champion 1 week in advance", owner:"CSM", timeline:"1 week out", action:"Ask them to review and flag anything sensitive. No surprises in the room.", commsTemplate:"'I've put together the QBR deck â€” would you mind reviewing it before I send it more widely? I want to make sure I've captured everything correctly and nothing lands the wrong way in the room.'" },
      { id:6, title:"Open with their business priorities â€” not a product recap", owner:"CSM", timeline:"Meeting day", action:"First question: 'What's changed in your world since we last spoke?' This signals you're a strategic partner, not a vendor reporting.", commsTemplate:"QBR opening:\n'Before I take you through what we've prepared, I'd like to understand what's top of mind for you right now. What's changed in your business since we last met?'\n\n[Listen for 5 minutes before presenting anything]" },
      { id:7, title:"Spend 40% of the meeting on the future", owner:"CSM", timeline:"Meeting day", action:"QBRs that are purely retrospective miss the expansion and alignment opportunity. The future half is where relationships deepen.", commsTemplate:"Future-focused questions:\nâ€¢ 'Given what we've built together, what's the next problem you want to solve?'\nâ€¢ 'Where are you seeing the biggest opportunity in your market right now?'\nâ€¢ 'If you could change one thing about how we work together, what would it be?'" },
      { id:8, title:"Close with aligned next steps â€” never just 'thanks for your time'", owner:"CSM", timeline:"Meeting day", action:"Every QBR should end with an agreed goal, an aligned action, or an expansion path to explore. Closing with 'thanks' stalls momentum.", commsTemplate:"QBR close:\n'Before we wrap up â€” let's agree on the one or two things that matter most for next quarter. [Write them down publicly]. And I want to set up our next touchpoint before we leave this room. When works for you?'" },
      { id:9, title:"Send written follow-up within 24 hours", owner:"CSM", timeline:"Day after meeting", action:"Decisions made. Next steps named. Owners assigned. Executives respect precision and follow-through above all else.", commsTemplate:"Subject: QBR follow-up â€” [Company] + [Product]\n\nHi [Name],\n\nThank you for a great session today. Here's a summary:\n\nKey results discussed:\nâ€¢ [Result 1]\nâ€¢ [Result 2]\n\nAgreed next steps:\nâ€¢ [Action 1] â€” Owner: [Name] â€” By: [Date]\nâ€¢ [Action 2] â€” Owner: [Name] â€” By: [Date]\n\nNext QBR: [Proposed date]\n\nAny additions or corrections, let me know." },
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
      { id:1, title:"Brief leadership completely before any contact", owner:"CSM", timeline:"Day 1", action:"Your VP or CCO needs full context, not a surprise. Prepare a one-page brief covering the situation, history, risk, and proposed approach.", commsTemplate:"Leadership brief:\nAccount: [Name] | ARR: [Amount] | Renewal: [Date]\nSituation: [2â€“3 sentence summary]\nHistory: [Key events timeline]\nRoot cause: [Best diagnosis]\nWhat we've tried: [CSM actions taken]\nWhy escalation is needed: [Specific reason]\nProposed approach: [Plan]\nWhat I need: [Specific ask from leadership]" },
      { id:2, title:"Executive reaches out peer-to-peer", owner:"VP CS / CCO / CEO", timeline:"Day 1â€“2", action:"Not a CSM action. VP to VP, CEO to CEO depending on account size. Brief, personal, non-defensive.", commsTemplate:"Executive outreach:\n'Hi [Customer Executive],\n\nI wanted to reach out personally. I understand your experience with us has been challenging and I take that seriously.\n\nI'd welcome the chance to speak with you directly â€” not to pitch or defend, but to listen and to understand what we need to do differently.\n\nWould 20 minutes this week work for you?'" },
      { id:3, title:"Executive-to-executive call: listen, validate, commit", owner:"VP CS / CCO", timeline:"Day 3â€“5", action:"Listen, validate, and commit to a specific action with a specific date. Executives respond to peers who demonstrate accountability.", commsTemplate:"Executive call structure:\n1. 'Tell me about your experience from your perspective' (listen for 10 minutes)\n2. 'You're right to be frustrated. That's not the experience we want for you.'\n3. 'Here is specifically what I'm committing to: [action] by [date]. You have my personal guarantee.'\n4. 'What else would rebuild your confidence in us?'" },
      { id:4, title:"CSM creates formal recovery brief within 48 hours", owner:"CSM", timeline:"Day 5â€“6", action:"What happened. What you're doing. What you're committing to. Specific dates, specific owners.", commsTemplate:"Recovery brief:\nDate: [Date]\nPrepared by: [CSM name] + [Executive name]\n\nWhat happened:\n[Factual, non-defensive summary]\n\nActions we're taking:\nâ€¢ [Action 1] â€” Owner: [Name] â€” By: [Date]\nâ€¢ [Action 2] â€” Owner: [Name] â€” By: [Date]\n\nOur commitment:\n[Specific, measurable outcome] by [Date]" },
      { id:5, title:"Establish joint working cadence", owner:"CSM + Executive", timeline:"Day 7 onward", action:"Both executive teams involved in a regular touchpoint until the account is stable. Signals sustained commitment.", commsTemplate:"Joint cadence proposal:\n'I'd like to propose a bi-weekly working session between our teams â€” [CSM name] and [Executive name] on our side, [their contacts] on yours â€” until we've delivered [milestone]. After that, we can return to a normal cadence. Does that work?'" },
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
    summary:"Losing a champion without a successor is a top-3 churn risk. The window to establish a new champion closes within 2â€“3 weeks of their departure. Move immediately.",
    steps:[
      { id:1, title:"Move immediately â€” the window closes fast", owner:"CSM", timeline:"Day 1", action:"If champion has left: the 2â€“3 week window to establish a successor is your most critical timeline in account management.", commsTemplate:"Internal alert:\n'Champion [Name] at [Company] has [left / gone silent]. Activating Champion Succession playbook. Need to establish new contact within 14 days. ARR at risk: [Amount].'" },
      { id:2, title:"Map all remaining contacts in the account", owner:"CSM", timeline:"Day 1â€“2", action:"Who is next in seniority? Who was the champion working with most closely? Who attended the kickoff? Who is still active in the product?", commsTemplate:"Contact mapping:\nâ–¡ Who attended our kickoff call?\nâ–¡ Who is cc'd on our emails?\nâ–¡ Who is active in the product?\nâ–¡ Who reports to [departing champion]?\nâ–¡ Who is their most likely internal successor?" },
      { id:3, title:"Get a warm introduction from the departing champion", owner:"CSM", timeline:"Day 1â€“2", action:"If they're still reachable, a warm handoff is worth everything. Make it easy for them to do â€” draft the introduction for them.", commsTemplate:"Request to departing champion:\n'Before you go, would you be able to introduce me to [successor name]? I've drafted a quick intro email if it would help â€” just let me know and I'll send it for your review:\n\n[Draft: \"Hi [Successor], I wanted to introduce you to [CSM name], who has been our main contact at [Product]. They've been incredibly helpful with [achievement] and I'd recommend a 30-minute intro call to make sure nothing falls through in the transition.\"]'" },
      { id:4, title:"Contact the most likely successor directly", owner:"CSM", timeline:"Day 2â€“3", action:"Acknowledge the transition, offer continuity, ask to introduce yourself. Not a sales call â€” a relationship call.", commsTemplate:"Subject: [Name] mentioned you as the right person to connect with\n\nHi [Successor Name],\n\nI understand [former champion] has moved on â€” I wanted to reach out personally to introduce myself and make sure [Company] continues to get everything you need from us.\n\nI've been working with [Company] for [duration] on [goal summary]. I'd love to schedule 30 minutes to bring you up to speed and understand your priorities.\n\nWhen works for you this week?" },
      { id:5, title:"Run a fresh discovery call", owner:"CSM", timeline:"Day 3â€“5", action:"Do NOT assume the new contact shares the former champion's goals or sentiment. Start fresh. Ask the same questions you'd ask a new account.", commsTemplate:"Discovery questions for new champion:\nâ€¢ 'What do you already know about what [Company] has been doing with [Product]?'\nâ€¢ 'What matters most to you personally in terms of what we deliver?'\nâ€¢ 'Is there anything about the existing setup you'd want to change?'\nâ€¢ 'What does success look like from your perspective?'" },
      { id:6, title:"Rebuild the success plan from their perspective", owner:"CSM", timeline:"Days 5â€“10", action:"Their definition of value may be entirely different from the previous champion. Don't carry over assumptions.", commsTemplate:"'I've put together a summary of where we are with [Company] â€” I'd love your input on whether the goals and milestones still reflect what matters to you, or whether we should adjust.'" },
      { id:7, title:"Share a concise state of the account briefing", owner:"CSM", timeline:"Days 5â€“10", action:"What's been achieved, what's in progress, what's planned. Give them context without overwhelming them.", commsTemplate:"Subject: [Company] + [Product] â€” account summary\n\nHi [Name],\n\nAs promised, here's a quick summary of where things stand:\n\nâœ“ What we've achieved together:\nâ€¢ [Achievement 1]\nâ€¢ [Achievement 2]\n\nâŸ³ What's in progress:\nâ€¢ [Initiative 1] â€” expected completion: [Date]\n\nâ—‹ What's planned:\nâ€¢ [Upcoming milestone]\n\nHappy to walk through any of this on a call â€” just let me know." },
      { id:8, title:"Map a minimum of 2 contacts going forward", owner:"CSM", timeline:"Day 10 onward", action:"Never rely on a single champion again. Use this moment as the forcing function to build a wider stakeholder map.", commsTemplate:"'One thing I've learned from this transition â€” I'd like to make sure we have at least two people connected between our teams going forward, so we never lose continuity. Who else on your team would benefit from being looped in?'" },
    ],
  },
];

// â”€â”€â”€ Trigger engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getTriggeredPlaybooks = (account) => {
  return PLAYBOOK_LIBRARY.filter(pb => {
    try { return pb.triggerCondition(account); } catch { return false; }
  }).sort((a, b) => {
    const priority = { Critical:0, High:1, Medium:2 };
    return priority[a.priority] - priority[b.priority];
  });
};

const getPriorityConfig = (priority) => ({
  Critical: { color:"var(--rose)",   bg:"var(--rose-dim)",   label:"Critical" },
  High:     { color:"var(--amber)",  bg:"var(--amber-dim)",  label:"High"     },
  Medium:   { color:"var(--sky)",    bg:"var(--sky-dim)",    label:"Medium"   },
}[priority] || { color:"var(--text3)", bg:"var(--bg4)", label:priority });

// â”€â”€â”€ Stakeholder playbooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STAKEHOLDER_GUIDE = {
  Champion:  { mark:"C", color:"var(--emerald)", bg:"var(--emerald-dim)", headline:"Protecting your Champion",
    tactics:["Schedule a monthly 1:1 outside business reviews â€” make it personal, not transactional.","Give early access to features or roadmap previews. They need to feel like insiders.","Help them look good internally â€” share ROI data they can present upward.","Identify a backup champion. Single-threaded relationships are your biggest churn risk.","Send a personal thank-you when they advocate for you. Never take it for granted."],
    warning:"Champion at risk if: no contact in 30+ days, title change, or company reorg detected." },
  Neutral:   { mark:"N", color:"var(--indigo)", bg:"var(--indigo-dim)", headline:"Activating a Neutral contact",
    tactics:["Find their personal win â€” what does success look like for them specifically?","Invite them to a webinar or exclusive event. Low commitment, high impression.","Ask for their opinion on the roadmap. People support what they help build.","Share a case study from their exact industry and role.","Get one small win on their behalf â€” resolve something fast and make sure they know."],
    warning:"Neutrals move quickly to detractors if ignored during contract renewal cycles." },
  Detractor: { mark:"D", color:"var(--amber)", bg:"var(--amber-dim)", headline:"Turning a Detractor around",
    tactics:["Book a call with one goal: listen. Don't pitch, don't defend. Just understand.","Acknowledge the problem explicitly â€” 'You're right, that experience was not acceptable.'","Create a written action plan with dates. Detractors trust proof, not promises.","Loop in a senior leader â€” it signals the company takes them seriously.","Follow up every 2 weeks with updates even when there's nothing new. Silence kills trust."],
    warning:"Detractors who feel ignored become champions for the competition. Act within 72 hours." },
  Blocker:   { mark:"B", color:"var(--rose)", bg:"var(--rose-dim)", headline:"Navigating around a Blocker",
    tactics:["Understand why they're blocking â€” budget, fear of change, or a past bad experience?","Never fight them directly. Build champions above or beside them instead.","Find their concern and solve it on its own terms. Blockers often flip when truly heard.","Involve them in a small, low-risk decision. Ownership reduces resistance dramatically.","Bring a business case that makes them look good if the project succeeds."],
    warning:"Never escalate over a blocker's head without exhausting all direct approaches first." },
};

// â”€â”€â”€ Seed data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEED = [
  { id:1, name:"Noon E-Commerce", industry:"E-Commerce", plan:"Enterprise", arr:120000, renewalDate:"2026-09-15", nps:72, ces:4.2,
    cesHistory:[{date:"2024-09-01",value:3.8},{date:"2024-10-01",value:4.0},{date:"2024-11-01",value:4.1},{date:"2024-12-01",value:4.2}],
    lastContact:"2024-12-28", openTickets:2, productUsage:88, archived:false, nextAction:"Send renewal proposal draft to Sara by Jan 15",
    stakeholders:[{id:1,name:"Sara Al-Mansoori",title:"Head of Operations",role:"Champion",sentiment:"Positive",lastTouch:"2024-12-28"},{id:2,name:"Khalid Nasser",title:"IT Director",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-12-10"}],
    successPlan:{goal:"Reduce support ticket volume by 40%",milestones:[{id:1,text:"Audit all open ticket categories",done:true},{id:2,text:"Implement self-serve knowledge base",done:true},{id:3,text:"Train customer team on portal",done:false},{id:4,text:"Validate 40% reduction in Q3",done:false}]},
    activityLog:[{id:1,date:"2024-12-28",type:"Call",note:"Quarterly check-in. Sara confirmed renewal intent."},{id:2,date:"2024-12-10",type:"Email",note:"Sent product update summary to Khalid."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Strong relationship with Sara. Renewal conversation started." },
  { id:2, name:"Talabat", industry:"Food Delivery", plan:"Growth", arr:84000, renewalDate:"2026-03-01", nps:41, ces:2.9,
    cesHistory:[{date:"2024-09-01",value:4.1},{date:"2024-10-01",value:3.8},{date:"2024-11-01",value:3.3},{date:"2024-12-01",value:2.9}],
    lastContact:"2024-12-05", openTickets:7, productUsage:52, archived:false, nextAction:"Book urgent call with Ahmed â€” address CES decline + ticket backlog",
    stakeholders:[{id:1,name:"Ahmed Karimi",title:"VP Product",role:"Detractor",sentiment:"Negative",lastTouch:"2024-12-05"},{id:2,name:"Layla Hassan",title:"Ops Manager",role:"Blocker",sentiment:"Negative",lastTouch:"2024-11-20"}],
    successPlan:{goal:"Full API integration by Q1",milestones:[{id:1,text:"Complete API requirements doc",done:true},{id:2,text:"Dev environment setup",done:false},{id:3,text:"Staging integration test",done:false},{id:4,text:"Production go-live",done:false},{id:5,text:"Post-launch monitoring",done:false},{id:6,text:"Sign-off and handover",done:false}]},
    activityLog:[{id:1,date:"2024-12-05",type:"Call",note:"Ahmed frustrated with API delays. Escalated internally."},{id:2,date:"2024-11-20",type:"Email",note:"Layla raised concerns about timeline again."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"CES declining 3 months straight. Ticket backlog growing. Renewal in 60 days â€” urgent." },
  { id:3, name:"Careem", industry:"Mobility", plan:"Enterprise", arr:210000, renewalDate:"2026-11-30", nps:68, ces:3.8,
    cesHistory:[{date:"2024-09-01",value:3.5},{date:"2024-10-01",value:3.6},{date:"2024-11-01",value:3.8},{date:"2024-12-01",value:3.8}],
    lastContact:"2024-12-20", openTickets:1, productUsage:79, archived:false, nextAction:"Schedule QBR for Q1 â€” expansion discussion with Priya",
    stakeholders:[{id:1,name:"Priya Mehta",title:"Director of Partnerships",role:"Champion",sentiment:"Positive",lastTouch:"2024-12-20"},{id:2,name:"Omar Shaikh",title:"CTO",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-11-15"},{id:3,name:"Dana Al-Farsi",title:"Finance Lead",role:"Neutral",sentiment:"Positive",lastTouch:"2024-12-01"}],
    successPlan:{goal:"Expand to 3 new city operations",milestones:[{id:1,text:"City feasibility assessment",done:true},{id:2,text:"Onboard city ops team",done:true},{id:3,text:"Pilot launch in City 1",done:false},{id:4,text:"Evaluate pilot results",done:false},{id:5,text:"Scale to cities 2 & 3",done:false}]},
    activityLog:[{id:1,date:"2024-12-20",type:"Meeting",note:"QBR completed. Priya confirmed expansion budget approved."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Expansion potential. Budget cycle Q1." },
  { id:4, name:"Anghami", industry:"Music Streaming", plan:"Starter", arr:28000, renewalDate:"2026-02-14", nps:55, ces:3.5,
    cesHistory:[{date:"2024-09-01",value:3.5},{date:"2024-10-01",value:3.5},{date:"2024-11-01",value:3.5},{date:"2024-12-01",value:3.5}],
    lastContact:"2024-11-10", openTickets:0, productUsage:61, archived:false, nextAction:"Re-engage Fadi â€” send personalised check-in email today",
    stakeholders:[{id:1,name:"Fadi Bishara",title:"Product Manager",role:"Neutral",sentiment:"Neutral",lastTouch:"2024-11-10"}],
    successPlan:{goal:"Launch branded playlist feature",milestones:[{id:1,text:"Define feature requirements",done:true},{id:2,text:"Design review with product team",done:false},{id:3,text:"Beta launch",done:false}]},
    activityLog:[{id:1,date:"2024-11-10",type:"Email",note:"Sent feature update. No response yet."}],
    activePlaybookId:null, activePlaybookSteps:{}, snoozedPlaybooks:[], prepNotes:"", notes:"Gone quiet. Last contact 7 weeks ago. Renewal in ~45 days." },
];

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STAGE_CFG = {
  "Healthy":         { color:"var(--emerald)", bg:"var(--emerald-dim)", border:"rgba(5,150,105,0.25)"  },
  "Stable":          { color:"var(--sky)",     bg:"var(--sky-dim)",     border:"rgba(2,132,199,0.25)"  },
  "Needs Attention": { color:"var(--amber)",   bg:"var(--amber-dim)",   border:"rgba(217,119,6,0.25)"  },
  "At Risk":         { color:"var(--rose)",    bg:"var(--rose-dim)",    border:"rgba(225,29,72,0.35)"  },
};
const ROLE_CFG = {
  Champion:  { color:"var(--emerald)", bg:"var(--emerald-dim)" },
  Neutral:   { color:"var(--indigo)",  bg:"var(--indigo-dim)"  },
  Detractor: { color:"var(--amber)",   bg:"var(--amber-dim)"   },
  Blocker:   { color:"var(--rose)",    bg:"var(--rose-dim)"    },
};
const ACT_TYPES  = ["Call","Email","Meeting","Note"];
const ACT_ICONS  = { Call:"Ph", Email:"Em", Meeting:"Mx", Note:"Nt" };
const ACT_COLORS = { Call:"var(--emerald)", Email:"var(--indigo)", Meeting:"var(--violet)", Note:"var(--amber)" };

// â”€â”€â”€ Health engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const calcHealth = (a) => {
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

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const hColor   = s => s>=70?"var(--emerald)":s>=45?"var(--amber)":"var(--rose)";
const fmtMoney = n => n>=1000?`$${(n/1000).toFixed(0)}k`:`$${n}`;
const ago      = d => Math.floor((new Date()-new Date(d))/86400000);
const until    = d => Math.ceil((new Date(d)-new Date())/86400000);
const todayStr = () => new Date().toISOString().split("T")[0];
const sentIcon = s => s==="Positive"?"â†‘":s==="Negative"?"â†“":"â†’";
const initials = name => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const hue      = name => { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))%360; return h; };

// â”€â”€â”€ Data layer â€” API-first, localStorage fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// If VITE_API_URL is set, all reads/writes go to the backend.
// If not set (local dev without backend), falls back to localStorage silently.

const load = () => {
  try {
    const s = localStorage.getItem("pulse_v4");
    return s ? JSON.parse(s) : SEED;
  } catch { return SEED; }
};
const save = a => {
  try { localStorage.setItem("pulse_v4", JSON.stringify(a)); } catch {}
};

// â”€â”€â”€ Primitives â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// SVG icon system â€” replaces all emoji in functional UI contexts
const Ic = ({ n, size=16, color="currentColor", style={} }) => {
  const icons = {
    // Navigation
    portfolio:  <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    tasks:      <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    pipeline:   <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    playbooks:  <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
    briefing:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
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
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,...style}}>
      {icons[n]||icons.note}
    </svg>
  );
};

// Scenario badge â€” colored abbr pill, replaces emoji scenario indicators
const ScenarioBadge = ({ scenario, small }) => {
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
const Sparkline = ({ data, color }) => {
  const vals=data.map(d=>d.value);
  const min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;
  const w=60,h=24;
  const pts=vals.map((v,i)=>`${(i/(vals.length-1))*w},${h-((v-min)/range)*(h-4)-2}`).join(" ");
  const last=pts.split(" ").pop().split(",");
  return (
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color}/>
    </svg>
  );
};

const Ring = ({ score, size=48 }) => {
  const r=(size-6)/2,circ=2*Math.PI*r,dash=(score/100)*circ,color=hColor(score);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeOpacity=".15" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray .6s ease"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{transform:`rotate(90deg)`,transformOrigin:`${size/2}px ${size/2}px`,
          fill:color,fontSize:"11px",fontFamily:"var(--font-mono)",fontWeight:500}}>
        {score}
      </text>
    </svg>
  );
};

const Bar = ({ value, color="var(--indigo)", thin }) => (
  <div style={{height:thin?3:5,background:"var(--bg4)",borderRadius:99,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(100,value)}%`,background:color,borderRadius:99,transition:"width .7s ease"}}/>
  </div>
);

const Badge = ({ label, color, bg, small }) => (
  <span style={{fontSize:small?10:11,fontFamily:"var(--font-mono)",fontWeight:500,
    padding:small?"2px 7px":"3px 10px",borderRadius:"var(--r-sm)",color,background:bg,
    display:"inline-block",whiteSpace:"nowrap",letterSpacing:".02em"}}>
    {label}
  </span>
);

const Avatar = ({ name, size=36 }) => {
  const h=hue(name);
  return (
    <div style={{width:size,height:size,borderRadius:"var(--r)",flexShrink:0,display:"flex",
      alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.33,
      background:`hsl(${h},55%,91%)`,color:`hsl(${h},45%,32%)`,fontFamily:"var(--font-display)",
      letterSpacing:"-.01em"}}>
      {initials(name)}
    </div>
  );
};

const Inp = (p) => (
  <input {...p} style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
    borderRadius:"var(--r)",padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",
    fontSize:13,outline:"none",transition:"border-color .15s,box-shadow .15s",...p.style}}/>
);
const Slct = (p) => (
  <select {...p} style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
    borderRadius:"var(--r)",padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",
    fontSize:13,outline:"none",cursor:"pointer",...p.style}}/>
);
const Fld = ({ label, children }) => (
  <div style={{marginBottom:14}}>
    <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
      textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{label}</div>
    {children}
  </div>
);
const Btn = ({ children, variant="primary", onClick, style={}, ...rest }) => {
  const styles = {
    primary: { background:"var(--indigo)",   color:"white",       boxShadow:"0 2px 10px var(--indigo-glow)" },
    ghost:   { background:"var(--bg3)",      color:"var(--text2)", boxShadow:"none" },
    danger:  { background:"var(--rose-dim)", color:"var(--rose)", boxShadow:"none" },
  };
  return (
    <button onClick={onClick} {...rest}
      style={{border:"none",borderRadius:"var(--r)",padding:"10px 18px",
        fontFamily:"var(--font-display)",fontWeight:600,fontSize:13,
        cursor:"pointer",transition:"opacity .12s,filter .12s",
        ...styles[variant],...style}}
      onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.93)"}
      onMouseLeave={e=>e.currentTarget.style.filter="none"}>
      {children}
    </button>
  );
};

const ToastBar = ({ toasts }) => (
  <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
    display:"flex",flexDirection:"column",gap:8,zIndex:9999,alignItems:"center",pointerEvents:"none"}}>
    {toasts.map(t=>(
      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,
        background:t.type==="error"?"#dc2626":t.type==="success"?"#059669":"var(--indigo)",
        color:"white",padding:"10px 18px",borderRadius:"var(--r-lg)",
        boxShadow:"var(--shadow-lg)",fontSize:13,fontWeight:600,
        animation:"toastIn .2s ease",maxWidth:380,letterSpacing:"-.01em"}}>
        <Ic n={t.type==="error"?"dismiss":t.type==="success"?"check":"info"} size={15} color="white"/>
        {t.message}
      </div>
    ))}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",backdropFilter:"blur(6px)",
        display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"var(--bg2)",borderRadius:"var(--r-2xl)",width:"100%",maxWidth:wide?800:560,
        maxHeight:"90vh",overflow:"auto",boxShadow:"var(--shadow-lg)",animation:"scaleIn .2s ease"}}>
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

const Confirm = ({ msg, onConfirm, onCancel }) => {
  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onCancel();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onCancel]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",
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

// â”€â”€â”€ PLAYBOOK LIBRARY PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PlaybookStepView = ({ step, done, onToggle, expanded, onExpand }) => {
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
        <span style={{fontSize:11,color:"var(--text3)",flexShrink:0}}>{expanded?"â–²":"â–¼"}</span>
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

const PlaybookDetailView = ({ playbook, onBack, activeSteps={}, onStepToggle }) => {
  const [expandedStep, setExpandedStep] = useState(null);
  const sc = SCENARIO_CFG[playbook.scenario]||SCENARIO_CFG["Onboarding"];
  const pc = getPriorityConfig(playbook.priority);
  const completedCount = playbook.steps.filter(s=>activeSteps[s.id]).length;
  const progress = Math.round((completedCount/playbook.steps.length)*100);

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      <button onClick={onBack}
        style={{background:"none",border:"none",color:"var(--indigo)",cursor:"pointer",
          fontSize:13,fontWeight:600,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>
        â† Back to library
      </button>

      <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
        padding:24,marginBottom:20,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:24}}>{sc.abbr||""}</span>
          <div>
            <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>{playbook.name}</div>
            <div style={{display:"flex",gap:8}}>
              <Badge label={playbook.scenario} color={sc.color} bg={sc.bg}/>
              <Badge label={pc.label} color={pc.color} bg={pc.bg}/>
            </div>
          </div>
        </div>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.7,marginBottom:16}}>
          {playbook.summary}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Trigger</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>{playbook.trigger}</div>
          </div>
          <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 14px"}}>
            <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",
              textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Success metric</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>{playbook.successMetric}</div>
          </div>
        </div>
      </div>

      {completedCount > 0 && (
        <div style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
          padding:"14px 18px",marginBottom:20,boxShadow:"var(--shadow-sm)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600}}>Progress</span>
            <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--indigo)",fontWeight:600}}>
              {completedCount}/{playbook.steps.length} steps Â· {progress}%
            </span>
          </div>
          <Bar value={progress} color={progress===100?"var(--emerald)":"var(--indigo)"}/>
        </div>
      )}

      <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
        textTransform:"uppercase",letterSpacing:".08em",marginBottom:12}}>
        {playbook.steps.length} steps â€” click to expand
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

const PlaybookLibraryPage = ({ accounts, onUpdate }) => {
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [filterScenario,   setFilterScenario]   = useState("All");
  const [filterPriority,   setFilterPriority]   = useState("All");
  const [search,           setSearch]           = useState("");

  const scenarios  = ["All","Onboarding","Churn Risk","Renewal","Executive"];
  const priorities = ["All","Critical","High","Medium"];

  const filtered = PLAYBOOK_LIBRARY.filter(pb => {
    if (filterScenario !== "All" && pb.scenario !== filterScenario) return false;
    if (filterPriority !== "All" && pb.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = pb.name.toLowerCase().includes(q)
        || pb.scenario.toLowerCase().includes(q)
        || pb.summary.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Count active playbooks across all accounts
  const activeCountByPb = {};
  accounts.forEach(a=>{
    if(a.activePlaybookId) activeCountByPb[a.activePlaybookId] = (activeCountByPb[a.activePlaybookId]||0)+1;
  });

  if (selectedPlaybook) {
    return (
      <PlaybookDetailView
        playbook={selectedPlaybook}
        onBack={()=>setSelectedPlaybook(null)}
        activeSteps={{}}
        onStepToggle={null}
      />
    );
  }

  return (
    <div style={{animation:"fadeUp .2s ease"}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Playbook Library</h1>
        <div style={{fontSize:13,color:"var(--text3)"}}>
          {PLAYBOOK_LIBRARY.length} world-class plays Â· sourced from Gainsight, ChurnZero, Totango & CS leaders
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Total Plays",  value:PLAYBOOK_LIBRARY.length,                                        color:"var(--indigo)" },
          {label:"Scenarios",    value:4,                                                               color:"var(--teal)"   },
          {label:"Active Now",   value:accounts.filter(a=>a.activePlaybookId).length,                  color:"var(--emerald)"},
          {label:"Need Attention",value:accounts.filter(a=>getTriggeredPlaybooks(a).length>0).length,  color:"var(--amber)"  },
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
            borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:26,color:s.color,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:6}}>
          {scenarios.map(s=>{
            const cfg=SCENARIO_CFG[s];
            const active=filterScenario===s;
            return (
              <button key={s} onClick={()=>setFilterScenario(s)} className="pill-btn"
                style={{padding:"6px 12px",borderRadius:99,fontSize:11,cursor:"pointer",
                  fontFamily:"var(--font-mono)",fontWeight:active?600:400,
                  border:`1.5px solid ${active?(cfg?.color||"var(--indigo)"):"var(--border)"}`,
                  background:active?(cfg?.bg||"var(--indigo-dim)"):"var(--bg2)",
                  color:active?(cfg?.color||"var(--indigo)"):"var(--text2)"}}>
                {s!=="All"&&<span style={{marginRight:4}}>{cfg?.icon}</span>}{s}
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          {priorities.map(p=>{
            const pc=getPriorityConfig(p);
            const active=filterPriority===p;
            return (
              <button key={p} onClick={()=>setFilterPriority(p)} className="pill-btn"
                style={{padding:"6px 12px",borderRadius:99,fontSize:11,cursor:"pointer",
                  fontFamily:"var(--font-mono)",fontWeight:active?600:400,
                  border:`1.5px solid ${active?pc.color:"var(--border)"}`,
                  background:active?pc.bg:"var(--bg2)",
                  color:active?pc.color:"var(--text2)"}}>
                {p}
              </button>
            );
          })}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search playbooksâ€¦"
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
              <span style={{fontSize:18}}>{sc.abbr||""}</span>
              <span style={{fontWeight:700,fontSize:16,color:sc.color}}>{scenario}</span>
              <span style={{fontSize:12,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>
                {scenarioPbs.length} play{scenarioPbs.length!==1?"s":""}
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
              {scenarioPbs.map(pb=>{
                const pc=getPriorityConfig(pb.priority);
                const activeCount=activeCountByPb[pb.id]||0;
                return (
                  <div key={pb.id} onClick={()=>setSelectedPlaybook(pb)}
                    className="card-hover"
                    style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",
                      padding:"18px 20px",cursor:"pointer",boxShadow:"var(--shadow-sm)",
                      position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                      background:`linear-gradient(90deg,${pc.color},transparent)`,opacity:0.7}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{fontWeight:700,fontSize:14}}>{pb.name}</div>
                      <Badge label={pc.label} color={pc.color} bg={pc.bg} small/>
                    </div>
                    <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6,marginBottom:12}}>
                      {pb.summary.slice(0,100)}â€¦
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:8}}>
                        <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text3)"}}>
                          {pb.steps.length} steps
                        </span>
                        {activeCount>0&&(
                          <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--emerald)",
                            background:"var(--emerald-dim)",padding:"1px 7px",borderRadius:99}}>
                            Active on {activeCount} account{activeCount!==1?"s":""}
                          </span>
                        )}
                      </div>
                      <span style={{fontSize:11,color:"var(--indigo)",fontWeight:600}}>View â†’</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:13}}>
          No playbooks match your filters
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ Active playbook in Detail panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          â† Back to account
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
                  {completedCount}/{activePb.steps.length} Â· {progress}%
                </span>
              </div>
              <Bar value={progress} color={sc.color}/>
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",
          textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>
          Steps â€” click to expand template
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

  // No active playbook â€” show suggestions
  const snoozed = account.snoozedPlaybooks||[];
  const unsnoozedTriggered = triggered.filter(pb=>!snoozed.includes(pb.id));
  return (
    <div>
      {unsnoozedTriggered.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>ðŸŽ¯ Suggested for this account</div>
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
                          fontSize:14,padding:"0 2px",lineHeight:1}}>Ã—</button>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"var(--text2)",marginBottom:10,lineHeight:1.5}}>
                    {pb.summary.slice(0,120)}â€¦
                  </div>
                  <Btn onClick={()=>activatePlaybook(pb)} style={{width:"100%",padding:"8px",fontSize:12}}>
                    Activate â€” {pb.steps.length} steps
                  </Btn>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Healthy account â€” no triggers */}
      {unsnoozedTriggered.length===0&&(
        <div style={{background:"var(--emerald-dim)",border:"1.5px solid rgba(5,150,105,0.2)",
          borderRadius:"var(--r-lg)",padding:"20px 18px",marginBottom:16,textAlign:"center"}}>
          <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><Ic n="success" size={36} color="var(--emerald)"/></div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--emerald)",marginBottom:6}}>
            This account looks healthy
          </div>
          <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
            No playbooks are currently triggered based on this account's signals. Keep up the great work â€” or browse the library to run a proactive play.
          </div>
        </div>
      )}

      <button onClick={()=>setShowLibrary(true)}
        style={{width:"100%",background:"transparent",color:"var(--indigo)",
          border:"1.5px dashed var(--border2)",borderRadius:"var(--r)",padding:"12px",
          fontFamily:"var(--font-mono)",fontSize:12,cursor:"pointer"}}>
        Browse all {PLAYBOOK_LIBRARY.length} playbooks â†’
      </button>
    </div>
  );
};

// â”€â”€â”€ Stakeholder guide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Stakeholder modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    <Modal title={`Stakeholder Map â€” ${account.name}`} onClose={onClose} wide>
      {silent.length>0&&(
        <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.2)",borderRadius:"var(--r)",
          padding:"12px 16px",marginBottom:20,display:"flex",gap:10}}>
          <Ic n="alert" size={16} color="var(--rose)"/>
          <div style={{fontSize:13,color:"var(--rose)"}}>
            <strong>Silent Champion alert:</strong> {silent.map(s=>s.name).join(", ")} â€” no contact in 30+ days.
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
                      <button onClick={()=>startEdit(s)} className="icon-btn"
                        style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",
                          padding:"4px",borderRadius:"var(--r-xs)",display:"flex",alignItems:"center"}}>
                        <Ic n="edit" size={13} color="var(--indigo)"/>
                      </button>
                      <button onClick={()=>startEdit(s)} className="icon-btn" style={{background:"none",border:"none",cursor:"pointer",padding:"4px",borderRadius:"var(--r-xs)",display:"flex",alignItems:"center"}}><Ic n="edit" size={13} color="var(--indigo)"/></button>
              <button onClick={()=>startEdit(s)} className="icon-btn" style={{background:"none",border:"none",cursor:"pointer",padding:"4px",borderRadius:"var(--r-xs)",display:"flex",alignItems:"center"}}><Ic n="edit" size={13} color="var(--indigo)"/></button>
              <button onClick={()=>remove(s.id)} className="icon-btn"
                        style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",
                          padding:"4px",borderRadius:"var(--r-xs)",display:"flex",alignItems:"center"}}>
                        <Ic n="close" size={13} color="var(--rose)"/>
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

// â”€â”€â”€ Account form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AccountForm = ({ onClose, onSave, existing, toast }) => {
  const init = existing
    ? { name:existing.name, industry:existing.industry, plan:existing.plan, arr:existing.arr,
        renewalDate:existing.renewalDate, nps:existing.nps, ces:existing.ces,
        productUsage:existing.productUsage, openTickets:existing.openTickets,
        notes:existing.notes, nextAction:existing.nextAction||"" }
    : { name:"",industry:"",plan:"Starter",arr:"",renewalDate:"",nps:"",ces:"",productUsage:"",openTickets:"",notes:"",nextAction:"" };
  const [f,setF] = useState(init);
  const s = k => e => setF(p=>({...p,[k]:e.target.value}));
  const preview = calcHealth({ nps:parseInt(f.nps)||50, ces:parseFloat(f.ces)||3.5, productUsage:parseInt(f.productUsage)||60, openTickets:parseInt(f.openTickets)||0 });
  const sc = STAGE_CFG[preview.stage]||STAGE_CFG["Stable"];

  const submit = () => {
    if(!f.name.trim()) return;
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
    <Modal title={existing?`Edit â€” ${existing.name}`:"Add New Account"} onClose={onClose}>
      <div style={{background:"var(--bg3)",border:`1.5px solid ${sc.border}`,borderRadius:"var(--r)",
        padding:"12px 16px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:"var(--text2)",fontWeight:500}}>Live health preview</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:20,color:hColor(preview.total)}}>{preview.total}</span>
          <Badge label={preview.stage} color={sc.color} bg={sc.bg}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <div style={{gridColumn:"1/-1"}}><Fld label="Company Name"><Inp value={f.name} onChange={s("name")} placeholder="e.g. Noon E-Commerce"/></Fld></div>
        <Fld label="Industry"><Inp value={f.industry} onChange={s("industry")} placeholder="E-Commerce"/></Fld>
        <Fld label="Plan"><Slct value={f.plan} onChange={s("plan")}>{["Starter","Growth","Enterprise"].map(p=><option key={p}>{p}</option>)}</Slct></Fld>
        <Fld label="ARR ($)"><Inp type="number" value={f.arr} onChange={s("arr")} placeholder="84000"/></Fld>
        <Fld label="Renewal Date"><Inp type="date" value={f.renewalDate} onChange={s("renewalDate")}/></Fld>
        <Fld label="NPS (0â€“100)"><Inp type="number" value={f.nps} onChange={s("nps")} placeholder="65"/></Fld>
        <Fld label="CES (1â€“5)"><Inp type="number" step=".1" value={f.ces} onChange={s("ces")} placeholder="3.8"/></Fld>
        <Fld label="Product Usage (%)"><Inp type="number" value={f.productUsage} onChange={s("productUsage")} placeholder="75"/></Fld>
        <Fld label="Open Tickets"><Inp type="number" value={f.openTickets} onChange={s("openTickets")} placeholder="2"/></Fld>
        <div style={{gridColumn:"1/-1"}}><Fld label="ðŸŽ¯ Next Action"><Inp value={f.nextAction} onChange={s("nextAction")} placeholder="e.g. Send renewal proposal to Sara by Jan 15"/></Fld></div>
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

// â”€â”€â”€ Log CES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LogCES = ({ account, onClose, onUpdate, toast }) => {
  const [val,setVal] = useState("");
  const [dt,setDt]   = useState(todayStr());
  const submit = () => {
    const ces=parseFloat(val);
    if(!ces||ces<1||ces>5) return;
    const hist=[...account.cesHistory,{date:dt,value:ces}];
    const {total,stage}=calcHealth({...account,ces});
    onUpdate(account.id,{ces,cesHistory:hist,healthScore:total,churnRisk:100-total,stage});
    toast("CES reading logged","success");
    onClose();
  };
  return (
    <Modal title={`Log CES â€” ${account.name}`} onClose={onClose}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6,marginBottom:16}}>
          Add a new Customer Effort Score reading. Updates the trend line and health score automatically.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
          <Fld label="CES Score (1â€“5)"><Inp type="number" step=".1" min="1" max="5" value={val} onChange={e=>setVal(e.target.value)} placeholder="3.8"/></Fld>
          <Fld label="Date"><Inp type="date" value={dt} onChange={e=>setDt(e.target.value)}/></Fld>
        </div>
        <div style={{background:"var(--bg3)",borderRadius:"var(--r)",padding:"12px 14px",marginTop:4}}>
          <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",marginBottom:8,textTransform:"uppercase",letterSpacing:".08em"}}>CES Reference</div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            {[["1â€“2","High Friction","var(--rose)"],["2.5â€“3.4","Moderate","var(--amber)"],["3.5â€“5","Low Effort","var(--emerald)"]].map(([r,l,c])=>(
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

// â”€â”€â”€ Call / Meeting Prep Sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CallPrepModal = ({ account, onClose, onSaveNotes, toast }) => {
  const [notes, setNotes] = useState(account.prepNotes||"");
  const [copied, setCopied] = useState(false);

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

  const copyBrief = () => {
    const lines = [
      `CALL PREP â€” ${account.name}`,
      `Date: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}`,
      ``,
      `ACCOUNT SNAPSHOT`,
      `Health: ${account.healthScore}/100  Stage: ${account.stage}  Churn Risk: ${account.churnRisk}%`,
      `ARR: ${fmtMoney(account.arr)}  Plan: ${account.plan}  CES: ${account.ces.toFixed(1)}/5`,
      `Renewal: ${account.renewalDate ? `${rdays > 0 ? rdays+"d away" : "Overdue"} (${account.renewalDate})` : "â€”"}`,
      ``,
      `LAST TOUCHPOINT`,
      lastActivity
        ? `${lastActivity.type} on ${lastActivity.date}: ${lastActivity.note}`
        : "No activity logged yet",
      `Last contact: ${contactLabel}  Open tickets: ${account.openTickets}`,
      ``,
      `STAKEHOLDERS`,
      stakeholders.length > 0
        ? stakeholders.map(s=>`${s.name} (${s.title}) â€” ${s.role} â€” ${s.sentiment}`).join("\n")
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
                Pre-call brief Â· {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
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
              {label:"Health",    value:account.healthScore, unit:"/100", color:hColor(account.healthScore)},
              {label:"Churn Risk",value:`${account.churnRisk}%`, unit:"", color:account.churnRisk>=60?"var(--rose)":account.churnRisk>=35?"var(--amber)":"var(--emerald)"},
              {label:"CES",       value:account.ces.toFixed(1), unit:"/5", color:account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"},
              {label:"Tickets",   value:account.openTickets, unit:" open", color:account.openTickets>4?"var(--rose)":"var(--text)"},
              {label:"Renewal",   value:rdays>0?`${rdays}d`:"Overdue", unit:"", color:rdays<=30&&rdays>0?"var(--rose)":rdays<=60&&rdays>0?"var(--amber)":"var(--text3)"},
            ].map(m=>(
              <div key={m.label} style={{background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:17,color:m.color,lineHeight:1}}>
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
                <div style={{fontSize:13,color:"var(--text3)"}}>No activity logged yet</div>
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
                <div style={{fontSize:13,color:"var(--text3)"}}>No stakeholders mapped yet</div>
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
                        Next Â· {nextStep.timeline}
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
                <div style={{fontSize:13,color:"var(--text3)"}}>No active playbook</div>
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
                    color={account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"}/>
                  <span style={{fontSize:14,fontFamily:"var(--font-mono)",fontWeight:700,
                    color:account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"}}>
                    {account.ces.toFixed(1)}
                  </span>
                  <span style={{fontSize:12,color:cesTrend>0?"var(--emerald)":cesTrend<0?"var(--rose)":"var(--text3)"}}>
                    {cesTrend>0?"â†‘ Improving":cesTrend<0?"â†“ Declining":"â†’ Flat"}
                  </span>
                </div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>NPS</div>
                <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,
                  color:account.nps>=50?"var(--emerald)":account.nps>=30?"var(--amber)":"var(--rose)"}}>
                  {account.nps}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
                  textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>ARR</div>
                <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,color:"var(--indigo)"}}>
                  {fmtMoney(account.arr)}
                </div>
              </div>
            </div>
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

// â”€â”€â”€ Detail panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Detail = ({ account, onClose, onUpdate, onDelete, toast, manualTasks=[], onAddManual, onToggleManual, onDeleteManual }) => {
  const [showStk,setShowStk]     = useState(false);
  const [showEdit,setShowEdit]   = useState(false);
  const [showDel,setShowDel]     = useState(false);
  const [showCES,setShowCES]     = useState(false);
  const [showPrep,setShowPrep]   = useState(false);
  const [tab,setTab]             = useState("overview");
  const [logF,setLogF]           = useState({type:"Call",note:"",date:todayStr()});
  const [newMs,setNewMs]         = useState("");
  const [editGoal,setEditGoal]   = useState(false);
  const [goalDraft,setGoalDraft] = useState(account.successPlan.goal);
  const [editAct,setEditAct]     = useState(false);
  const [actDraft,setActDraft]   = useState(account.nextAction||"");

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const sc=STAGE_CFG[account.stage]||STAGE_CFG["Stable"];
  const days=ago(account.lastContact);
  const rdays=until(account.renewalDate);
  const cesVals=account.cesHistory.map(d=>d.value);
  const cesTrend=cesVals.length>1?cesVals.at(-1)-cesVals[0]:0;
  const doneMs=account.successPlan.milestones.filter(m=>m.done).length;
  const totalMs=account.successPlan.milestones.length;
  const planPct=totalMs>0?Math.round((doneMs/totalMs)*100):0;
  const triggeredPbs=getTriggeredPlaybooks(account);

  const logActivity=()=>{
    if(!logF.note.trim()) return;
    onUpdate(account.id,{activityLog:[{id:Date.now(),...logF},...account.activityLog],lastContact:logF.date});
    toast("Activity logged","success");
    setLogF({type:"Call",note:"",date:todayStr()});
  };
  const toggleMs=id=>{
    const upd=account.successPlan.milestones.map(m=>m.id===id?{...m,done:!m.done}:m);
    onUpdate(account.id,{successPlan:{...account.successPlan,milestones:upd}});
    toast(upd.find(m=>m.id===id).done?"Milestone completed âœ“":"Milestone re-opened","success");
  };
  const addMs=()=>{
    if(!newMs.trim()) return;
    onUpdate(account.id,{successPlan:{...account.successPlan,milestones:[...account.successPlan.milestones,{id:Date.now(),text:newMs.trim(),done:false}]}});
    toast("Milestone added","success"); setNewMs("");
  };
  const delMs=id=>onUpdate(account.id,{successPlan:{...account.successPlan,milestones:account.successPlan.milestones.filter(m=>m.id!==id)}});
  const saveGoal=()=>{ onUpdate(account.id,{successPlan:{...account.successPlan,goal:goalDraft}}); setEditGoal(false); toast("Goal saved","success"); };
  const saveAct=()=>{ onUpdate(account.id,{nextAction:actDraft}); setEditAct(false); toast("Next action saved","success"); };

  const TABS=["Overview","Tasks","Plan","Activity","Health","Playbook"];
  const taskAlertCount = [...generateAutoTasks([account]),...(manualTasks||[]).filter(t=>t.accountId===account.id)].filter(t=>!t.done).length;
  const tabHasAlert={
    Overview: rdays>0&&rdays<=60,
    Tasks: taskAlertCount>0,
    Plan: totalMs>0&&planPct<100,
    Activity: days>14,
    Health: account.healthScore<55,
    Playbook: triggeredPbs.length>0&&!account.activePlaybookId,
  };
  const tabKey=t=>t.toLowerCase();

  return (
    <>
      <div style={{position:"fixed",right:0,top:0,bottom:0,width:448,
        background:"var(--bg2)",borderLeft:"1px solid var(--border)",zIndex:500,
        overflow:"auto",boxShadow:"-12px 0 40px rgba(15,23,42,0.1)",animation:"slideRight .25s ease"}}>

        <div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)",
          position:"sticky",top:0,background:"var(--bg2)",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={account.name} size={38}/>
              <div>
                <div style={{fontWeight:800,fontSize:16,lineHeight:1.2}}>{account.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",marginTop:3}}>
                  <span style={{fontSize:11,color:"var(--text3)"}}>{account.industry}</span>
                  <span style={{fontSize:11,color:"var(--text3)"}}>Â·</span>
                  <span style={{fontSize:11,color:"var(--text3)"}}>{account.plan}</span>
                  <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setShowEdit(true)} className="icon-btn"
                style={{background:"var(--bg3)",border:"none",color:"var(--text2)",
                  cursor:"pointer",padding:"6px 12px",borderRadius:"var(--r-sm)",fontSize:12,fontWeight:600}}>Edit</button>
              <button onClick={()=>setShowDel(true)} className="icon-btn"
                style={{background:"var(--rose-dim)",border:"none",color:"var(--rose)",
                  cursor:"pointer",padding:"6px 10px",borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",gap:4}}><Ic n="trash" size={14} color="var(--rose)"/></button>
              <button onClick={onClose} className="icon-btn"
                style={{background:"var(--bg3)",border:"none",color:"var(--text2)",
                  cursor:"pointer",width:32,height:32,borderRadius:"var(--r-sm)",fontSize:18,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>Ã—</button>
            </div>
          </div>

          {/* Next action */}
          <div style={{background:account.nextAction?"var(--violet-dim)":"var(--bg3)",
            border:`1.5px solid ${account.nextAction?"rgba(124,58,237,0.2)":"var(--border)"}`,
            borderRadius:"var(--r)",padding:"10px 14px",marginBottom:12}}>
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
                    {account.nextAction||"No next action â€” click to add"}
                  </span>
                </div>
                <button onClick={()=>{setActDraft(account.nextAction||"");setEditAct(true);}}
                  style={{background:"none",border:"none",color:"var(--indigo)",fontSize:11,
                    cursor:"pointer",fontWeight:600,flexShrink:0}}>Edit</button>
              </div>
            )}
          </div>

          {/* Prep Call button */}
          <button onClick={()=>setShowPrep(true)}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:7,
              background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
              borderRadius:"var(--r)",padding:"8px 16px",fontWeight:600,fontSize:12,cursor:"pointer",
              fontFamily:"var(--font-display)",transition:"background .12s,border-color .12s",marginBottom:4}}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--bg4)";e.currentTarget.style.borderColor="var(--border2)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.borderColor="var(--border)";}}>
            <Ic n="prep" size={13} color="var(--text2)"/>
            Pre-Call Brief
          </button>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {TABS.map(t=>(
              <button key={t} onClick={()=>setTab(tabKey(t))}
                style={{position:"relative",padding:"6px 10px",borderRadius:"var(--r-sm)",fontSize:11,cursor:"pointer",
                  fontFamily:"var(--font-mono)",border:"none",
                  background:tab===tabKey(t)?"var(--indigo)":"transparent",
                  color:tab===tabKey(t)?"white":"var(--text3)",
                  fontWeight:600,transition:"all .15s"}}>
                {t}
                {tabHasAlert[t]&&tab!==tabKey(t)&&(
                  <span style={{position:"absolute",top:3,right:3,width:6,height:6,
                    borderRadius:"50%",background:"var(--rose)",display:"block"}}/>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>

          {/* OVERVIEW */}
          {tab==="overview"&&(<>
            {rdays>0&&rdays<=60&&(
              <div style={{background:"var(--rose-dim)",border:"1.5px solid rgba(225,29,72,0.25)",
                borderRadius:"var(--r)",padding:"12px 16px",display:"flex",gap:10,alignItems:"center",animation:"fadeUp .2s ease"}}>
                <Ic n="bell" size={20} color="var(--rose)"/>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--rose)"}}>Renewal in {rdays} days</div>
                  <div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>Start the conversation now â€” don't wait.</div>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[
                {label:"ARR",    value:fmtMoney(account.arr), color:"var(--indigo)"},
                {label:"NPS",    value:account.nps,           color:account.nps>=50?"var(--emerald)":"var(--amber)"},
                {label:"Tickets",value:account.openTickets,   color:account.openTickets>4?"var(--rose)":"var(--text)"},
              ].map(m=>(
                <div key={m.label} style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:20,color:m.color}}>{m.value}</div>
                  <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",marginTop:3,fontFamily:"var(--font-mono)"}}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Ring score={account.healthScore} size={52}/>
                  <div>
                    <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:2}}>Health Score</div>
                    <div style={{fontWeight:700,fontSize:14,color:hColor(account.healthScore)}}>
                      {account.healthScore>=70?"Strong":account.healthScore>=45?"Moderate":"Weak"}
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:2}}>Churn Risk</div>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:24,
                    color:account.churnRisk>=60?"var(--rose)":account.churnRisk>=35?"var(--amber)":"var(--emerald)"}}>
                    {account.churnRisk}%
                  </div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>Product Usage</span>
                <span style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text2)"}}>{account.productUsage}%</span>
              </div>
              <Bar value={account.productUsage} color={account.productUsage>=70?"var(--emerald)":account.productUsage>=45?"var(--amber)":"var(--rose)"}/>
              <button onClick={()=>setTab("health")}
                style={{marginTop:12,background:"none",border:"none",color:"var(--indigo)",fontSize:12,cursor:"pointer",fontWeight:600,padding:0}}>
                See full breakdown â†’
              </button>
            </div>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Customer Effort Score</div>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:28,
                    color:account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"}}>
                    {account.ces.toFixed(1)}<span style={{fontSize:14,color:"var(--text3)",fontWeight:400}}> / 5</span>
                  </div>
                  <div style={{fontSize:12,fontFamily:"var(--font-mono)",marginTop:4,
                    color:cesTrend>0?"var(--emerald)":cesTrend<0?"var(--rose)":"var(--text3)"}}>
                    {cesTrend>0?"â†‘ Improving":cesTrend<0?"â†“ Declining â€” investigate":"â†’ Flat"}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
                  <Sparkline data={account.cesHistory} color={account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"}/>
                  <button onClick={()=>setShowCES(true)}
                    style={{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--indigo)",
                      background:"var(--indigo-dim)",border:"none",borderRadius:"var(--r-sm)",
                      padding:"4px 10px",cursor:"pointer",fontWeight:600}}>+ Log CES</button>
                </div>
              </div>
            </div>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em"}}>Stakeholders</div>
                <button onClick={()=>setShowStk(true)} style={{fontSize:12,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Manage â†’</button>
              </div>
              {account.stakeholders.length===0
                ?<div style={{fontSize:13,color:"var(--text3)"}}>No stakeholders mapped yet</div>
                :account.stakeholders.map(s=>{
                  const rc=ROLE_CFG[s.role]||ROLE_CFG.Neutral;
                  return (
                    <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:28,height:28,borderRadius:"var(--r-sm)",background:`hsl(${hue(s.name)},60%,92%)`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,
                          fontWeight:700,color:`hsl(${hue(s.name)},50%,35%)`}}>{initials(s.name)}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                          <div style={{fontSize:11,color:"var(--text3)"}}>{s.title}</div>
                        </div>
                      </div>
                      <Badge label={`${sentIcon(s.sentiment)} ${s.role}`} color={rc.color} bg={rc.bg}/>
                    </div>
                  );
                })}
            </div>
            {account.notes&&(
              <div style={{background:"var(--amber-dim)",border:"1.5px solid rgba(217,119,6,0.2)",borderRadius:"var(--r-lg)",padding:16}}>
                <div style={{fontSize:11,color:"var(--amber)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Notes</div>
                <div style={{fontSize:13,color:"var(--text)",lineHeight:1.6}}>{account.notes}</div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:"var(--bg3)",border:`1.5px solid ${rdays<=60&&rdays>0?"rgba(225,29,72,.3)":"var(--border)"}`,borderRadius:"var(--r)",padding:14}}>
                <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Renewal</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:500}}>{account.renewalDate||"â€”"}</div>
                <div style={{fontSize:11,marginTop:2,fontFamily:"var(--font-mono)",color:rdays<=60&&rdays>0?"var(--rose)":"var(--text3)"}}>{rdays>0?`${rdays}d away`:"Overdue"}</div>
              </div>
              <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:14}}>
                <div style={{fontSize:10,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Last Contact</div>
                <div style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:500,color:days>30?"var(--rose)":days>14?"var(--amber)":"var(--text)"}}>{days}d ago</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{days>30?"Overdue":days>14?"Follow up soon":"Recent"}</div>
              </div>
            </div>
          </>)}

          {/* TASKS */}
          {tab==="tasks"&&(
            <AccountTasksTab
              account={account}
              accounts={[account]}
              manualTasks={manualTasks||[]}
              onAddManual={onAddManual}
              onToggleManual={onToggleManual}
              onDeleteManual={onDeleteManual}
            />
          )}

          {/* PLAN */}
          {tab==="plan"&&(<>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Customer Goal</div>
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
                    {account.successPlan.goal||"No goal defined yet â€” click Edit to add one"}
                  </div>
                  <button onClick={()=>{setGoalDraft(account.successPlan.goal);setEditGoal(true);}}
                    style={{fontSize:11,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>Edit</button>
                </div>
              )}
            </div>
            {totalMs>0&&(
              <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:12,color:"var(--text2)",fontWeight:600}}>Progress</span>
                  <span style={{fontSize:12,fontFamily:"var(--font-mono)",color:"var(--indigo)",fontWeight:600}}>{doneMs}/{totalMs} Â· {planPct}%</span>
                </div>
                <Bar value={planPct} color={planPct>=70?"var(--emerald)":planPct>=40?"var(--indigo)":"var(--amber)"}/>
              </div>
            )}
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Milestones</div>
              {account.successPlan.milestones.length===0&&<div style={{fontSize:13,color:"var(--text3)",marginBottom:14}}>No milestones yet.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {account.successPlan.milestones.map(m=>(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:"var(--r)",
                    padding:"10px 12px",boxShadow:"var(--shadow-sm)",transition:"opacity .15s",opacity:m.done?0.65:1}}>
                    <input type="checkbox" checked={m.done} onChange={()=>toggleMs(m.id)}
                      style={{width:16,height:16,cursor:"pointer",accentColor:"var(--indigo)",flexShrink:0}}/>
                    <span style={{fontSize:13,flex:1,color:m.done?"var(--text3)":"var(--text)",textDecoration:m.done?"line-through":"none"}}>{m.text}</span>
                    <button onClick={()=>delMs(m.id)}
                      style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",display:"flex",alignItems:"center",padding:"3px",borderRadius:"var(--r-xs)"}}>Ã—</button>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Inp value={newMs} onChange={e=>setNewMs(e.target.value)} placeholder="Add a milestoneâ€¦"
                  onKeyDown={e=>e.key==="Enter"&&addMs()} style={{flex:1,fontSize:13,padding:"8px 12px"}}/>
                <Btn onClick={addMs} style={{padding:"8px 16px",fontSize:13}}>+</Btn>
              </div>
            </div>
          </>)}

          {/* ACTIVITY */}
          {tab==="activity"&&(<>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14}}>Log Activity</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                <Fld label="Type"><Slct value={logF.type} onChange={e=>setLogF(f=>({...f,type:e.target.value}))}>{ACT_TYPES.map(t=><option key={t}>{t}</option>)}</Slct></Fld>
                <Fld label="Date"><Inp type="date" value={logF.date} onChange={e=>setLogF(f=>({...f,date:e.target.value}))}/></Fld>
              </div>
              <Fld label="Note">
                <textarea value={logF.note} onChange={e=>setLogF(f=>({...f,note:e.target.value}))}
                  placeholder="What happened? Key outcomes, follow-upsâ€¦"
                  style={{width:"100%",background:"white",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                    padding:"9px 12px",color:"var(--text)",fontFamily:"var(--font-display)",fontSize:14,
                    outline:"none",resize:"vertical",minHeight:70}}/>
              </Fld>
              <Btn onClick={logActivity} style={{width:"100%"}}>Log {logF.type}</Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {account.activityLog.length===0&&(
                <div style={{textAlign:"center",padding:"24px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:12}}>No activity logged yet</div>
              )}
              {account.activityLog.map(a=>(
                <div key={a.id} style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:700,
                        color:ACT_COLORS[a.type]||"var(--text2)",background:"var(--bg4)",
                        padding:"2px 8px",borderRadius:"var(--r-sm)"}}>{a.type}</span>
                    </div>
                    <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)"}}>{a.date}</span>
                  </div>
                  <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>{a.note}</div>
                </div>
              ))}
            </div>
          </>)}

          {/* HEALTH */}
          {tab==="health"&&(<>
            <div style={{background:"var(--bg3)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Overall Health</div>
                  <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:32,color:hColor(account.healthScore)}}>
                    {account.healthScore}<span style={{fontSize:16,color:"var(--text3)",fontWeight:400}}>/100</span>
                  </div>
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
                        <span style={{fontSize:12,fontFamily:"var(--font-mono)",fontWeight:600,
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
            <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(67,97,238,.15)",borderRadius:"var(--r)",padding:"14px 16px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--indigo)",marginBottom:6}}>Improvement opportunities</div>
              {calcHealth(account).parts.filter(p=>p.pts<p.max).map(p=>(
                <div key={p.label} style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>
                  â†’ <strong>{p.label}</strong>: {p.note} â€” +{p.max-p.pts} pts available
                </div>
              ))}
            </div>
          </>)}

          {/* PLAYBOOK */}
          {tab==="playbook"&&(
            <ActivePlaybookTab account={account} onUpdate={onUpdate}/>
          )}

        </div>
      </div>

      {showStk &&<StakeholderModal account={account} onClose={()=>setShowStk(false)} onUpdate={onUpdate} toast={toast}/>}
      {showEdit&&<AccountForm existing={account} onClose={()=>setShowEdit(false)} onSave={upd=>{onUpdate(account.id,upd);}} toast={toast}/>}
      {showCES &&<LogCES account={account} onClose={()=>setShowCES(false)} onUpdate={onUpdate} toast={toast}/>}
      {showPrep&&<CallPrepModal account={account} onClose={()=>setShowPrep(false)}
        onSaveNotes={(id,notes)=>onUpdate(id,{prepNotes:notes})} toast={toast}/>}
      {showDel &&<Confirm msg={`Permanently delete "${account.name}"? This cannot be undone.`}
        onConfirm={()=>{onDelete(account.id);setShowDel(false);toast("Account deleted","info");}}
        onCancel={()=>setShowDel(false)}/>}
    </>
  );
};

// â”€â”€â”€ Bulk upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TEMPLATE_FIELDS = [
  { key:"name",         label:"Company Name",      required:true,  hint:"e.g. Noon E-Commerce" },
  { key:"industry",     label:"Industry",          required:false, hint:"e.g. E-Commerce"       },
  { key:"plan",         label:"Plan",              required:false, hint:"Starter / Growth / Enterprise" },
  { key:"arr",          label:"ARR ($)",           required:false, hint:"e.g. 84000"             },
  { key:"renewalDate",  label:"Renewal Date",      required:false, hint:"YYYY-MM-DD"             },
  { key:"nps",          label:"NPS (0-100)",       required:false, hint:"e.g. 65"                },
  { key:"ces",          label:"CES (1-5)",         required:false, hint:"e.g. 3.8"               },
  { key:"productUsage", label:"Product Usage (%)", required:false, hint:"e.g. 75"                },
  { key:"openTickets",  label:"Open Tickets",      required:false, hint:"e.g. 2"                 },
  { key:"nextAction",   label:"Next Action",       required:false, hint:"e.g. Book QBR by Feb 1" },
  { key:"notes",        label:"Notes",             required:false, hint:"Key context, risksâ€¦"    },
];

const downloadTemplate = () => {
  const header  = TEMPLATE_FIELDS.map(f=>f.label).join(",");
  const example = ["Noon E-Commerce","E-Commerce","Enterprise","120000","2026-09-15","72","4.2","88","2","Send renewal proposal to Sara","Strong relationship with Sara"].join(",");
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
  if(r.nps&&(isNaN(Number(r.nps))||Number(r.nps)<0||Number(r.nps)>100)) errors.push("NPS must be 0â€“100");
  if(r.ces&&(isNaN(Number(r.ces))||Number(r.ces)<1||Number(r.ces)>5)) errors.push("CES must be 1â€“5");
  if(r.productUsage&&(isNaN(Number(r.productUsage))||Number(r.productUsage)<0||Number(r.productUsage)>100)) errors.push("Product Usage must be 0â€“100");
  if(r.openTickets&&isNaN(Number(r.openTickets))) errors.push("Open Tickets must be a number");
  if(r.renewalDate){
    const d=new Date(r.renewalDate);
    if(isNaN(d.getTime())) errors.push("Renewal Date must be YYYY-MM-DD");
    else if(d<new Date()) warnings.push("Renewal date is in the past");
  }
  const ces=parseFloat(r.ces)||3.5, nps=parseInt(r.nps)||50, usage=parseInt(r.productUsage)||60, tickets=parseInt(r.openTickets)||0;
  const {total,stage}=calcHealth({nps,ces,productUsage:usage,openTickets:tickets});
  const account={
    id:Date.now()+Math.random(), name:r.name, industry:r.industry||"", plan:r.plan,
    arr:parseInt(r.arr)||0, renewalDate:r.renewalDate||"", nps, ces,
    cesHistory:[{date:todayStr(),value:ces}], productUsage:usage, openTickets:tickets,
    healthScore:total, churnRisk:100-total, stage, lastContact:todayStr(), archived:false,
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
              {step===1?"Step 1 of 2 â€” Upload your CSV":step===2?`Step 2 of 2 â€” Review ${results.length} rows`:"Import complete"}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {[1,2].map(s=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"var(--font-mono)",
                    background:step>=s?"var(--indigo)":"var(--bg4)",color:step>=s?"white":"var(--text3)"}}>
                    {step>s?"âœ“":s}
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
                {[{num:1,icon:"â†“",title:"Download template",desc:"Pre-formatted CSV with all required and optional fields."},
                  {num:2,icon:"âœŽ",title:"Fill your data",desc:"One account per row. Example row included."},
                  {num:3,icon:"â†’",title:"Upload & review",desc:"Preview all rows, fix errors, then import."}].map(s=>(
                  <div key={s.num} style={{background:"var(--bg3)",borderRadius:"var(--r-lg)",padding:18,textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:10}}>{s.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{s.title}</div>
                    <div style={{fontSize:12,color:"var(--text3)",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(67,97,238,0.2)",
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
                  â†“ Download Template
                </button>
              </div>
              <div onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
                style={{border:`2px dashed ${dragging?"var(--indigo)":"var(--border2)"}`,
                  borderRadius:"var(--r-lg)",padding:"48px 32px",textAlign:"center",
                  background:dragging?"var(--indigo-dim)":"var(--bg3)",transition:"all .2s",cursor:"pointer"}}
                onClick={()=>document.getElementById("csv-input").click()}>
                <div style={{fontSize:40,marginBottom:12}}>"â†‘"</div>
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
                  <span>ðŸ’¡</span>
                  <span><strong>{errorRows.length} row{errorRows.length!==1?"s":""} have errors</strong> â€” deselected. You can import the {validRows.length} valid rows now.</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>selectAll(true)} style={{fontSize:12,color:"var(--indigo)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Select all valid ({validRows.length})</button>
                  <span style={{color:"var(--border2)"}}>Â·</span>
                  <button onClick={()=>selectAll(false)} style={{fontSize:12,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Deselect all</button>
                </div>
                <button onClick={()=>{setStep(1);setResults([]);}} style={{fontSize:12,color:"var(--text2)",background:"none",border:"none",cursor:"pointer"}}>â† Upload different file</button>
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
                        background:hasError?"rgba(225,29,72,0.03)":r.selected?"rgba(67,97,238,0.02)":"var(--bg2)",
                        opacity:hasError?0.6:1}}>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text3)"}}>{r.rowNum}</div>
                        <input type="checkbox" checked={r.selected} disabled={hasError} onChange={()=>toggleRow(i)}
                          style={{width:14,height:14,cursor:hasError?"not-allowed":"pointer",accentColor:"var(--indigo)"}}/>
                        <div style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>
                          {r.account.name||<span style={{color:"var(--rose)",fontStyle:"italic"}}>Missing</span>}
                        </div>
                        <div><Badge label={r.account.plan} color="var(--sky)" bg="var(--sky-dim)" small/></div>
                        <div style={{fontSize:12,color:"var(--text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.account.industry||"â€”"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12}}>{r.account.arr?fmtMoney(r.account.arr):"â€”"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:r.account.nps>=50?"var(--emerald)":"var(--amber)"}}>{r.account.nps||"â€”"}</div>
                        <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:r.account.ces>=3.5?"var(--emerald)":"var(--amber)"}}>{r.account.ces?.toFixed(1)||"â€”"}</div>
                        <div>
                          {hasError
                            ?<span title={r.errors.join("; ")} style={{cursor:"help"}}><Badge label={`âœ• ${r.errors.length}`} color="var(--rose)" bg="var(--rose-dim)" small/></span>
                            :hasWarn
                              ?<span title={r.warnings.join("; ")} style={{cursor:"help"}}><Badge label="âš  Warn" color="var(--amber)" bg="var(--amber-dim)" small/></span>
                              :<Badge label="âœ“ Ready" color="var(--emerald)" bg="var(--emerald-dim)" small/>}
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
                {importing?"Importingâ€¦":`Import ${selectedRows.length}`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// â”€â”€â”€ Account card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        border:`1.5px solid ${atRisk?"rgba(225,29,72,0.3)":urgent?"rgba(217,119,6,0.25)":"var(--border)"}`,
        borderRadius:"var(--r-lg)",padding:"20px 22px",cursor:"pointer",
        boxShadow:atRisk?"0 0 0 1px rgba(225,29,72,0.08),var(--shadow-sm)":"var(--shadow-sm)",
        animation:`fadeUp .3s ease ${index*0.05}s both`,position:"relative",overflow:"hidden"}}>

      <div style={{position:"absolute",top:0,left:0,right:0,height:3,
        background:`linear-gradient(90deg,${sc.color},transparent)`,opacity:0.7}}/>

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
            <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>{account.name}</div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              <span style={{fontSize:10,color:"var(--text3)"}}>{account.industry}</span>
              <span style={{fontSize:10,color:"var(--text3)"}}>Â·</span>
              <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
            </div>
          </div>
        </div>
        <Ring score={account.healthScore} size={46}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12,
        background:"var(--bg3)",borderRadius:"var(--r)",padding:"10px 8px"}}>
        {[
          {label:"ARR",  value:fmtMoney(account.arr)},
          {label:"NPS",  value:account.nps},
          {label:"CES",  value:account.ces.toFixed(1)},
          {label:"Risk", value:`${account.churnRisk}%`,
            color:account.churnRisk>=60?"var(--rose)":account.churnRisk>=35?"var(--amber)":"var(--emerald)"},
        ].map(m=>(
          <div key={m.label} style={{textAlign:"center"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:13,color:m.color||"var(--text)"}}>{m.value}</div>
            <div style={{fontSize:9,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",fontFamily:"var(--font-mono)",marginTop:2}}>{m.label}</div>
          </div>
        ))}
      </div>

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
          <Sparkline data={account.cesHistory} color={account.ces>=3.5?"var(--emerald)":account.ces>=2.5?"var(--amber)":"var(--rose)"}/>
        </div>
        <span style={{fontSize:10,fontFamily:"var(--font-mono)",
          color:days>30?"var(--rose)":days>14?"var(--amber)":"var(--text3)"}}>
          {days}d ago
        </span>
      </div>
    </div>
  );
};

// â”€â”€â”€ Stats bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,color:s.color,marginBottom:4,letterSpacing:"-.01em"}}>{s.value}</div>
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

// â”€â”€â”€ Task engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TASK_TYPE_CFG = {
  renewal:  { color:"var(--indigo)", bg:"var(--indigo-dim)", abbr:"RE", label:"Renewal"  },
  health:   { color:"var(--rose)",   bg:"var(--rose-dim)",   abbr:"HL", label:"Health"   },
  silent:   { color:"var(--amber)",  bg:"var(--amber-dim)",  abbr:"SI", label:"Silent"   },
  ces:      { color:"var(--amber)",  bg:"var(--amber-dim)",  abbr:"CE", label:"CES"      },
  playbook: { color:"var(--teal)",   bg:"var(--teal-dim)",   abbr:"PB", label:"Playbook" },
  manual:   { color:"var(--sky)",    bg:"var(--sky-dim)",    abbr:"MN", label:"Manual"   },
};

const generateAutoTasks = (accounts) => {
  const tasks = [];
  const today = new Date();

  accounts.forEach(account => {
    const rdays  = Math.ceil((new Date(account.renewalDate) - today) / 86400000);
    const silent = Math.floor((today - new Date(account.lastContact)) / 86400000);
    const cesVals = account.cesHistory.map(d=>d.value);
    const cesDeclining = cesVals.length >= 3
      && cesVals.at(-1) < cesVals.at(-2)
      && cesVals.at(-2) < cesVals.at(-3);

    // â”€â”€ Renewal tasks â”€â”€
    if (account.renewalDate) {
      if (rdays < 0) {
        tasks.push({ id:`renewal-overdue-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Renewal overdue â€” ${account.name}`,
          description:`Renewal was due ${Math.abs(rdays)} days ago. Immediate action required.`,
          dueDate: account.renewalDate });
      } else if (rdays <= 30 && account.healthScore < 60) {
        tasks.push({ id:`renewal-critical-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`At-risk renewal in ${rdays}d â€” ${account.name}`,
          description:`Renewal approaching with health score ${account.healthScore}. Activate at-risk renewal playbook now.`,
          dueDate: todayStr() });
      } else if (rdays <= 30) {
        tasks.push({ id:`renewal-30-${account.id}`, type:"renewal", priority:"High",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Renewal in ${rdays}d â€” finalise contract`,
          description:`Get verbal commit and send renewal paperwork for ${account.name}.`,
          dueDate: todayStr() });
      } else if (rdays <= 60 && account.healthScore < 55) {
        tasks.push({ id:`renewal-60risk-${account.id}`, type:"renewal", priority:"Critical",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`At-risk renewal in ${rdays}d â€” ${account.name}`,
          description:`Health score ${account.healthScore} with renewal in ${rdays} days. Start recovery conversation immediately.`,
          dueDate: todayStr() });
      } else if (rdays <= 90) {
        tasks.push({ id:`renewal-90-${account.id}`, type:"renewal", priority:"High",
          accountId:account.id, accountName:account.name, auto:true, done:false,
          title:`Start renewal prep â€” ${account.name}`,
          description:`Renewal in ${rdays} days. Prepare ROI summary and schedule planning call.`,
          dueDate: new Date(today.getTime() + 7*86400000).toISOString().split("T")[0] });
      }
    }

    // â”€â”€ Health tasks â”€â”€
    if (account.healthScore < 40) {
      tasks.push({ id:`health-critical-${account.id}`, type:"health", priority:"Critical",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`Critical health â€” activate recovery for ${account.name}`,
        description:`Health score ${account.healthScore}/100 â€” churn risk ${account.churnRisk}%. Escalate today.`,
        dueDate: todayStr() });
    } else if (account.healthScore < 55) {
      tasks.push({ id:`health-warn-${account.id}`, type:"health", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`Health declining â€” intervene on ${account.name}`,
        description:`Health score ${account.healthScore}/100. Diagnose root cause before it drops further.`,
        dueDate: todayStr() });
    }

    // â”€â”€ Silent account tasks â”€â”€
    if (silent >= 30) {
      tasks.push({ id:`silent-${account.id}`, type:"silent", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`No contact in ${silent}d â€” re-engage ${account.name}`,
        description:`Last contact was ${silent} days ago. Risk of disengagement is high.`,
        dueDate: todayStr() });
    }

    // â”€â”€ CES tasks â”€â”€
    if (cesDeclining) {
      tasks.push({ id:`ces-${account.id}`, type:"ces", priority:"High",
        accountId:account.id, accountName:account.name, auto:true, done:false,
        title:`CES declining 3 months â€” investigate ${account.name}`,
        description:`CES dropped from ${cesVals.at(-3).toFixed(1)} â†’ ${cesVals.at(-2).toFixed(1)} â†’ ${cesVals.at(-1).toFixed(1)}. Find the friction source.`,
        dueDate: todayStr() });
    }

    // â”€â”€ Active playbook next step â”€â”€
    if (account.activePlaybookId) {
      const pb = PLAYBOOK_LIBRARY.find(p=>p.id===account.activePlaybookId);
      if (pb) {
        const nextStep = pb.steps.find(s=>!(account.activePlaybookSteps||{})[s.id]);
        if (nextStep) {
          tasks.push({ id:`playbook-${account.id}-${nextStep.id}`, type:"playbook", priority:"Medium",
            accountId:account.id, accountName:account.name, auto:true, done:false,
            title:`${pb.name} â€” next step for ${account.name}`,
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

// â”€â”€â”€ Tasks Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TasksPage = ({ accounts, manualTasks, onAddManual, onToggleManual, onDeleteManual, onAccountClick }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask]         = useState({ title:"", description:"", accountId:"", priority:"High", dueDate:todayStr() });
  const [filterType, setFilterType]   = useState("All");
  const [filterDone, setFilterDone]   = useState(false);

  const autoTasks = generateAutoTasks(accounts);

  // Merge auto + manual, deduplicate by id
  const allTasks = [
    ...autoTasks,
    ...manualTasks.filter(mt => !autoTasks.find(at => at.id === mt.id)),
  ];

  const filtered = allTasks
    .filter(t => filterType === "All" || t.type === filterType)
    .filter(t => filterDone ? true : !t.done);

  // Group by section
  const overdue  = filtered.filter(t => t.dueDate < todayStr() && !t.done);
  const today2   = filtered.filter(t => t.dueDate === todayStr() && !t.done);
  const upcoming = filtered.filter(t => t.dueDate > todayStr() && !t.done);
  const done2    = filtered.filter(t => t.done);

  const criticalCount = allTasks.filter(t=>t.priority==="Critical"&&!t.done).length;
  const totalOpen     = allTasks.filter(t=>!t.done).length;

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
              background:tc.bg,padding:"2px 8px",borderRadius:"var(--r-xs)",letterSpacing:".03em"}}>{tc.abbr} Â· {tc.label}</span>
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
          <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Task List</h1>
          <div style={{fontSize:13,color:"var(--text3)"}}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </div>
        </div>
        <Btn onClick={()=>setShowAddForm(true)} style={{fontSize:14,padding:"11px 22px"}}>+ Add Task</Btn>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Open Tasks",    value:totalOpen,     color:"var(--indigo)" },
          {label:"Critical",      value:criticalCount, color:criticalCount>0?"var(--rose)":"var(--text3)" },
          {label:"Due Today",     value:today2.length, color:today2.length>0?"var(--amber)":"var(--text3)" },
          {label:"Overdue",       value:overdue.length,color:overdue.length>0?"var(--rose)":"var(--text3)" },
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg2)",border:"1.5px solid var(--border)",
            borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:600,fontSize:26,color:s.color,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--text2)"}}>{s.label}</div>
          </div>
        ))}
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
                  placeholder="Additional contextâ€¦"/>
              </Fld>
            </div>
            <Fld label="Account (optional)">
              <Slct value={newTask.accountId} onChange={e=>setNewTask(p=>({...p,accountId:e.target.value}))}>
                <option value="">â€” No account â€”</option>
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
              style={{padding:"5px 12px",borderRadius:99,fontSize:11,cursor:"pointer",
                fontFamily:"var(--font-mono)",fontWeight:active?600:400,
                border:`1.5px solid ${active?(tc?.color||"var(--indigo)"):"var(--border)"}`,
                background:active?(tc?.bg||"var(--indigo-dim)"):"var(--bg2)",
                color:active?(tc?.color||"var(--indigo)"):"var(--text2)"}}>
              {tc?`${tc.icon} ${tc.label}`:type}
            </button>
          );
        })}
        <button onClick={()=>setFilterDone(p=>!p)} className="pill-btn"
          style={{padding:"5px 12px",borderRadius:99,fontSize:11,cursor:"pointer",
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

// â”€â”€â”€ Account Tasks (detail panel tab) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <div style={{fontSize:24,marginBottom:8}}>âœ…</div>
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
              <input type="checkbox" checked={!!task.done} onChange={()=>isManual?onToggleManual(task.id):null}
                style={{width:15,height:15,marginTop:2,accentColor:"var(--emerald)",
                  cursor:isManual?"pointer":"default",flexShrink:0}}/>
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
                  style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:14,flexShrink:0}}>âœ•</button>
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

// â”€â”€â”€ Renewal Pipeline Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RenewalPipelinePage = ({ accounts, onAccountClick }) => {
  const today = new Date();

  const withRenewal = accounts
    .filter(a => a.renewalDate)
    .map(a => ({ ...a, rdays: Math.ceil((new Date(a.renewalDate) - today) / 86400000) }))
    .sort((a,b) => a.rdays - b.rdays);

  const BUCKETS = [
    { id:"overdue",    label:"Overdue",     color:"var(--rose)",   bg:"var(--rose-dim)",   filter: a => a.rdays < 0 },
    { id:"critical",   label:"â‰¤ 30 days",   color:"var(--rose)",   bg:"var(--rose-dim)",   filter: a => a.rdays >= 0 && a.rdays <= 30 },
    { id:"urgent",     label:"31â€“60 days",  color:"var(--amber)",  bg:"var(--amber-dim)",  filter: a => a.rdays > 30 && a.rdays <= 60 },
    { id:"upcoming",   label:"61â€“90 days",  color:"var(--indigo)", bg:"var(--indigo-dim)", filter: a => a.rdays > 60 && a.rdays <= 90 },
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
        <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Renewal Pipeline</h1>
        <div style={{fontSize:13,color:"var(--text3)"}}>
          {withRenewal.length} accounts Â· {fmtMoney(totalArr)} total ARR
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
                {bucket.accounts.length} account{bucket.accounts.length!==1?"s":""} Â· {fmtMoney(bucket.arr)} ARR
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
                        <span style={{fontSize:11,color:"var(--text3)"}}>Â·</span>
                        <span style={{fontSize:11,color:"var(--text3)"}}>{account.plan}</span>
                        <Badge label={account.stage} color={sc.color} bg={sc.bg} small/>
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
                          color:account.churnRisk>=60?"var(--rose)":account.churnRisk>=35?"var(--amber)":"var(--emerald)"}}>
                          {account.churnRisk}%
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

                    <span style={{fontSize:16,color:"var(--text3)",flexShrink:0}}>â†’</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {withRenewal.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)",fontFamily:"var(--font-mono)",fontSize:13}}>
          <div style={{fontSize:40,marginBottom:16}}>ðŸ“…</div>
          No accounts have renewal dates set. Add renewal dates to your accounts to see the pipeline.
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ CRM Integrations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CRM_CATALOG = [
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
      { key:"clientId",  label:"Client ID",     placeholder:"1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", type:"text"     },
      { key:"clientSecret", label:"Client Secret", placeholder:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type:"password" },
      { key:"orgId",     label:"Organisation ID", placeholder:"20099xxxxx",                          type:"text"     },
    ],
    docsUrl: "https://www.zoho.com/crm/developer/docs/api/",
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
    category: "CRM + FreshDesk",
    color: "#1a73e8",
    bg: "rgba(26,115,232,0.07)",
    description: "Sync deals from FreshSales CRM and ticket counts from FreshDesk.",
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
  // â”€â”€ Ticketing systems â”€â”€
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
    id: "jira",
    name: "Jira Service Management",
    category: "Ticketing",
    color: "#0052cc",
    bg: "rgba(0,82,204,0.07)",
    description: "Sync open issue counts and resolution times from Jira Service Management.",
    fields: [
      { crmKey:"project_name",      crmLabel:"Project / customer name", pulseField:"name"        },
      { crmKey:"open_issues",       crmLabel:"Open issues count",       pulseField:"openTickets" },
      { crmKey:"updated",           crmLabel:"Last issue update",       pulseField:"lastContact" },
    ],
    credentials: [
      { key:"domain",     label:"Atlassian Domain", placeholder:"yourcompany.atlassian.net",  type:"text"     },
      { key:"email",      label:"Account email",    placeholder:"admin@yourcompany.com",      type:"text"     },
      { key:"apiToken",   label:"API Token",        placeholder:"Your Atlassian API token",   type:"password" },
    ],
    docsUrl: "https://developer.atlassian.com/cloud/jira/service-desk/rest/intro/",
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
  { value:"__skip",      label:"â€” Skip this field â€”" },
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
  // Merge with any saved data â€” new connectors get defaults, existing ones keep their config
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

// â”€â”€ Connect / Edit credentials modal â”€â”€
const CRMConnectModal = ({ crm, config, onSave, onClose }) => {
  const [creds, setCreds] = useState({...config.credentials});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | "ok" | "fail"

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const testConnection = () => {
    const allFilled = crm.credentials.every(f => creds[f.key]?.trim());
    if (!allFilled) { setTestResult("fail"); return; }
    setTesting(true); setTestResult(null);
    // Simulate API test â€” in production this would hit a backend proxy
    setTimeout(()=>{
      setTesting(false);
      setTestResult("ok");
    }, 1400);
  };

  const save = () => {
    const allFilled = crm.credentials.every(f => creds[f.key]?.trim());
    if (!allFilled) return;
    onSave({ credentials: creds, connected: testResult==="ok", status: testResult==="ok"?"connected":"idle" });
    onClose();
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
                  ? "Connection successful â€” credentials verified"
                  : "Connection failed â€” check your credentials and try again"}
              </span>
            </div>
          )}

          {/* Docs link */}
          <div style={{fontSize:12,color:"var(--text3)",marginBottom:20}}>
            Need help finding your credentials?{" "}
            <a href={crm.docsUrl} target="_blank" rel="noreferrer"
              style={{color:"var(--indigo)",textDecoration:"none",fontWeight:600}}>
              {crm.name} API docs â†’
            </a>
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={testConnection} disabled={testing}
              style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                background:"var(--bg3)",color:"var(--text2)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"10px",fontWeight:600,fontSize:13,cursor:"pointer",
                fontFamily:"var(--font-display)"}}>
              {testing
                ? <><span style={{width:13,height:13,border:"2px solid var(--border2)",borderTopColor:"var(--indigo)",borderRadius:"50%",display:"inline-block",animation:"spin .7s linear infinite"}}/>Testingâ€¦</>
                : <><Ic n="activity" size={14} color="var(--text2)"/>Test connection</>}
            </button>
            <Btn onClick={save} style={{flex:1}} disabled={!crm.credentials.every(f=>creds[f.key]?.trim())}>
              {config.connected?"Save changes":"Connect"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Field mapping modal â”€â”€
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
            <div style={{fontWeight:700,fontSize:16}}>{crm.name} â€” Field Mapping</div>
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
              {/* CRM field â€” read only */}
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
              {/* Pulse field â€” dropdown */}
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

// â”€â”€ Sync modal â”€â”€
const CRMSyncModal = ({ crm, config, onSync, onClose }) => {
  const [phase, setPhase]     = useState("confirm"); // confirm | running | done
  const [progress, setProgress] = useState(0);
  const [log, setLog]         = useState([]);
  const [results, setResults] = useState(null);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&phase!=="running"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose,phase]);

  const runSync = () => {
    setPhase("running");
    setProgress(0);
    setLog([]);

    const steps = [
      { pct:10, msg:`Authenticating with ${crm.name}â€¦`            },
      { pct:25, msg:"Fetching account recordsâ€¦"                    },
      { pct:45, msg:"Applying field mappingâ€¦"                      },
      { pct:60, msg:"Checking for duplicate accountsâ€¦"             },
      { pct:78, msg:"Importing ticket and activity dataâ€¦"          },
      { pct:90, msg:"Calculating health scoresâ€¦"                   },
      { pct:100,msg:"Sync complete."                               },
    ];

    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        // Mock results
        const created  = Math.floor(Math.random()*8)+2;
        const updated  = Math.floor(Math.random()*5)+1;
        const skipped  = Math.floor(Math.random()*3);
        setResults({ created, updated, skipped, total: created+updated+skipped });
        setPhase("done");
        onSync({ created, updated, skipped });
        return;
      }
      setProgress(steps[i].pct);
      setLog(p=>[...p, steps[i].msg]);
      i++;
      setTimeout(tick, 420 + Math.random()*280);
    };
    setTimeout(tick, 300);
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
                <strong>Note:</strong> This sync is one-directional â€” from {crm.name} into Pulse. 
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
                  <span style={{fontSize:13,fontWeight:600}}>Syncingâ€¦</span>
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
                <div style={{fontSize:13,color:"var(--text3)"}}>
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
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Main integrations page â”€â”€
const IntegrationsPage = ({ onImport, toast }) => {
  const [configs, setConfigs]           = useState(loadIntegrations);
  const [showConnect, setShowConnect]   = useState(null);
  const [showFieldMap, setShowFieldMap] = useState(null);
  const [showSync, setShowSync]         = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(()=>{ saveIntegrations(configs); },[configs]);

  const updateConfig = (id, patch) => {
    setConfigs(p=>({...p,[id]:{...p[id],...patch}}));
  };

  const crm_by_id = id => CRM_CATALOG.find(c=>c.id===id);

  const handleSync = (id, results) => {
    const ts = new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    updateConfig(id,{
      lastSync: ts,
      syncCount: (configs[id].syncCount||0) + results.total,
    });
    toast(`${crm_by_id(id).name} sync complete â€” ${results.created} created, ${results.updated} updated`,"success");
  };

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
          <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Integrations</h1>
          <div style={{fontSize:13,color:"var(--text3)"}}>
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
      <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(67,97,238,0.15)",
        borderRadius:"var(--r-lg)",padding:"14px 18px",marginBottom:24,
        display:"flex",gap:12,alignItems:"flex-start"}}>
        <Ic n="info" size={16} color="var(--indigo)" style={{flexShrink:0,marginTop:1}}/>
        <div style={{fontSize:13,color:"var(--text2)",lineHeight:1.6}}>
          <strong>Phase A â€” Configuration & manual sync.</strong> Connect your tools, configure field mapping,
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
                  {/* CRM logo placeholder â€” colored abbr */}
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
                              {pf?.label||"â€”"}
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
            onSave={patch=>{ updateConfig(showConnect,patch); toast(`${crm.name} connected`,"success"); }}
            onClose={()=>setShowConnect(null)}
          />
        );
      })()}

      {showFieldMap&&(()=>{
        const crm = crm_by_id(showFieldMap);
        return (
          <CRMFieldMapModal
            crm={crm}
            config={configs[showFieldMap]}
            onSave={patch=>{ updateConfig(showFieldMap,patch); toast("Field mapping saved","success"); }}
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
            onSync={results=>handleSync(showSync,results)}
            onClose={()=>setShowSync(null)}
          />
        );
      })()}
    </div>
  );
};

// â”€â”€â”€ Surveys â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SURVEY_CFG = {
  NPS:  { color:"var(--indigo)", bg:"var(--indigo-dim)", label:"NPS",  full:"Net Promoter Score",    scale:"0 â€“ 10", min:0, max:10 },
  CES:  { color:"var(--teal)",   bg:"var(--teal-dim)",   label:"CES",  full:"Customer Effort Score",  scale:"1 â€“ 5",  min:1, max:5  },
  CSAT: { color:"var(--amber)",  bg:"var(--amber-dim)",  label:"CSAT", full:"Customer Satisfaction",  scale:"1 â€“ 5",  min:1, max:5  },
};

const npsColor = s => s >= 9 ? "var(--emerald)" : s >= 7 ? "var(--amber)" : "var(--rose)";
const npsLabel = s => s >= 9 ? "Promoter" : s >= 7 ? "Passive" : "Detractor";

// â”€â”€ Survey creation modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SurveyCreateModal = ({ accounts, onClose, onCreate, toast }) => {
  const [accountId,       setAccountId]       = useState("");
  const [type,            setType]            = useState("NPS");
  const [customQuestion,  setCustomQuestion]  = useState("");
  const [deadline,        setDeadline]        = useState("");
  const [loading,         setLoading]         = useState(false);

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  const selectedAccount = accounts.find(a=>a.id===accountId);

  const submit = async () => {
    if (!accountId) { toast("Please select an account","error"); return; }
    setLoading(true);
    try {
      await onCreate({
        accountId,
        accountName: selectedAccount?.name || "",
        type,
        customQuestion: customQuestion.trim() || null,
        deadline: deadline || null,
      });
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
          <Fld label="Account">
            <Slct value={accountId} onChange={e=>setAccountId(e.target.value)}>
              <option value="">â€” Select an account â€”</option>
              {accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </Slct>
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
            <strong>{sc.full}</strong> â€” {
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
                      animation:"spin .7s linear infinite"}}/>Creatingâ€¦
                  </span>
                : "Create survey"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Send survey email modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SurveySendModal = ({ survey, accounts, onClose, toast }) => {
  const [copied,       setCopied]       = useState(false);
  const [selectedStk,  setSelectedStk]  = useState("");
  const [manualEmail,  setManualEmail]  = useState("");
  const [manualName,   setManualName]   = useState("");
  const [customMsg,    setCustomMsg]    = useState("");

  useEffect(()=>{
    const h=e=>e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  // Find the account linked to this survey and get its stakeholders
  const linkedAccount = accounts.find(a=>a.id===survey.accountId);
  const stakeholders  = linkedAccount?.stakeholders||[];

  // When a stakeholder is selected, auto-fill their name
  // (email would come from stakeholder.email if we add it â€” for now use manual)
  const selectedStkObj = stakeholders.find(s=>s.id===selectedStk);

  useEffect(()=>{
    if (selectedStkObj) {
      setManualName(selectedStkObj.name);
      setManualEmail(selectedStkObj.email||"");
    }
  },[selectedStk]);

  const recipientEmail = manualEmail.trim();
  const recipientName  = manualName.trim() || (selectedStkObj?.name||"");

  const typeLabels = {
    NPS:  "Net Promoter Score survey",
    CES:  "Customer Effort Score survey",
    CSAT: "Customer Satisfaction survey",
  };

  const copyLink = () => {
    navigator.clipboard.writeText(survey.link).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false),2000);
    });
  };

  // Opens the user's own email client with everything pre-filled
  const openInMailClient = () => {
    if (!recipientEmail) { toast("Enter or select a recipient email","error"); return; }
    const greeting   = recipientName ? `Hi ${recipientName},` : "Hi,";
    const defaultMsg = customMsg.trim() ||
      `We'd love to hear your feedback on our work together. This quick survey takes less than 60 seconds.`;
    const body = `${greeting}\n\n${defaultMsg}\n\nClick here to take the survey:\n${survey.link}\n\nThank you for your time.\n`;
    const subject = encodeURIComponent(`Quick ${typeLabels[survey.type]} â€” ${survey.accountName}`);
    const bodyEnc = encodeURIComponent(body);
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${bodyEnc}`;
    toast("Email client opened â€” review and send","success");
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
          <div>
            <div style={{fontWeight:700,fontSize:16}}>Send Survey</div>
            <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>
              {survey.accountName} Â· {survey.type}
            </div>
          </div>
          <button onClick={onClose} className="icon-btn"
            style={{background:"var(--bg3)",border:"none",width:32,height:32,
              borderRadius:"var(--r-sm)",display:"flex",alignItems:"center",
              justifyContent:"center",cursor:"pointer"}}>
            <Ic n="close" size={14} color="var(--text2)"/>
          </button>
        </div>

        <div style={{padding:24}}>

          {/* Copy link */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--text3)",
              textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
              Survey link
            </div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"9px 12px",fontSize:12,
                color:"var(--text3)",fontFamily:"var(--font-mono)",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {survey.link}
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
            <div style={{fontSize:11,color:"var(--text3)",marginTop:6}}>
              Paste into WhatsApp, LinkedIn, or any message.
            </div>
          </div>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
            <span style={{fontSize:11,color:"var(--text3)",fontWeight:500}}>or send from your email</span>
            <div style={{flex:1,height:1,background:"var(--border)"}}/>
          </div>

          {/* Stakeholder picker â€” only shown if account has stakeholders */}
          {stakeholders.length>0&&(
            <Fld label="Pick a contact from this account">
              <Slct value={selectedStk} onChange={e=>setSelectedStk(e.target.value)}>
                <option value="">â€” Select a stakeholder â€”</option>
                {stakeholders.map(s=>(
                  <option key={s.id} value={s.id}>
                    {s.name}{s.title?` Â· ${s.title}`:""}
                  </option>
                ))}
              </Slct>
              {selectedStkObj&&!selectedStkObj.email&&(
                <div style={{fontSize:11,color:"var(--amber)",marginTop:5,
                  display:"flex",alignItems:"center",gap:5}}>
                  <Ic n="alert" size={11} color="var(--amber)"/>
                  No email saved for this contact â€” enter it below
                </div>
              )}
            </Fld>
          )}

          <Fld label="Recipient email">
            <Inp type="email" value={manualEmail}
              onChange={e=>setManualEmail(e.target.value)}
              placeholder="customer@company.com"/>
          </Fld>

          <Fld label="Recipient name (optional)">
            <Inp value={manualName}
              onChange={e=>setManualName(e.target.value)}
              placeholder="Ahmed Al-Mansouri"/>
          </Fld>

          <Fld label="Custom message (optional)">
            <textarea value={customMsg} onChange={e=>setCustomMsg(e.target.value)}
              placeholder="We'd love to hear your feedback on our recent work togetherâ€¦"
              style={{width:"100%",background:"var(--bg3)",border:"1.5px solid var(--border)",
                borderRadius:"var(--r)",padding:"9px 12px",color:"var(--text)",
                fontFamily:"var(--font-display)",fontSize:13,outline:"none",
                resize:"vertical",minHeight:72,lineHeight:1.6}}/>
          </Fld>

          {/* Info note */}
          <div style={{display:"flex",gap:8,alignItems:"flex-start",padding:"10px 12px",
            background:"var(--indigo-dim)",borderRadius:"var(--r)",marginBottom:16,
            border:"1.5px solid rgba(67,97,238,0.15)"}}>
            <Ic n="info" size={14} color="var(--indigo)" style={{flexShrink:0,marginTop:1}}/>
            <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.6}}>
              Clicking <strong>Open in email</strong> will open your Gmail, Outlook, or default 
              mail app with everything pre-filled. The email sends from <strong>your own address</strong>.
            </div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancel</Btn>
            <Btn onClick={openInMailClient} style={{flex:2}}>
              <span style={{display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}>
                <Ic n="note" size={13} color="white"/>Open in email
              </span>
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// â”€â”€ Surveys page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SurveysPage = ({ accounts, session, toast }) => {
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
    toast("Survey created â€” ready to send","success");
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
          <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Surveys</h1>
          <div style={{fontSize:13,color:"var(--text3)"}}>
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
            borderRadius:"var(--r-lg)",padding:"18px 20px",boxShadow:"var(--shadow-sm)"}}>
            <div style={{fontFamily:"var(--font-mono)",fontWeight:700,fontSize:22,
              color:s.color,marginBottom:4}}>{s.value}</div>
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
                            <span style={{fontSize:11,color:"var(--text3)"}}>Â·</span>
                            <span style={{fontSize:11,color:new Date(survey.deadline)<new Date()?"var(--rose)":"var(--text3)"}}>
                              Due {new Date(survey.deadline).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                            </span>
                          </>
                        )}
                        {survey.customQuestion&&(
                          <>
                            <span style={{fontSize:11,color:"var(--text3)"}}>Â·</span>
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
                          No responses yet â€” share the survey link to start collecting feedback.
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
      {showSend&&<SurveySendModal survey={showSend} accounts={accounts} onClose={()=>setShowSend(null)} toast={toast}/>}
    </div>
  );
};

// â”€â”€ Public survey response page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      .catch(()=>setError("Could not load survey â€” please check the link and try again"))
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
      setError(err.message || "Submission failed â€” please try again");
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
                <div style={{fontSize:13,color:"var(--text3)"}}>
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
                      {npsLabel(score)} â€” score {score}/10
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
                    placeholder="Your answerâ€¦"
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
                        animation:"spin .7s linear infinite"}}/>Submittingâ€¦
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

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ API client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const API_URL    = import.meta.env.VITE_API_URL    || "";
const API_SECRET = import.meta.env.VITE_API_SECRET || "";

const api = async (method, path, body, token) => {
  if (!API_URL) return null; // no backend configured â€” fall back to localStorage
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type":   "application/json",
      "x-pulse-secret": API_SECRET,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API error");
  }
  return res.json();
};

// Session helpers â€” store JWT in localStorage
const SESSION_KEY = "pulse_session_v1";
const loadSession = () => {
  try { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
};
const saveSession = s => {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
};
const clearSession = () => {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
};

// â”€â”€â”€ Auth screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      setError(err.message || "Something went wrong â€” please try again");
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
              <span style={{color:"white",fontSize:18,fontWeight:800,letterSpacing:"-.02em"}}>P</span>
            </div>
            <span style={{fontWeight:800,fontSize:22,letterSpacing:"-.03em"}}>Pulse</span>
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
                    placeholder="Microsoft, Noon, Talabatâ€¦"
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
                    animation:"spin .7s linear infinite"}}/> {mode==="login"?"Signing inâ€¦":"Creating accountâ€¦"}</>
                : mode === "login" ? "Sign in" : "Create account"
              }
            </Btn>

            <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"var(--text3)"}}>
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

export default function App() {
  const [session,      setSession]      = useState(loadSession);
  const [accounts,     setAccounts]     = useState([]);
  const [apiReady,     setApiReady]     = useState(false);
  const [migrating,    setMigrating]    = useState(false);
  const [migrateDone,  setMigrateDone]  = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [showBulk,     setShowBulk]     = useState(false);
  const [view,         setView]         = useState("portfolio");
  const [filter,       setFilter]       = useState("All");
  const [planFilter,   setPlanFilter]   = useState("All");
  const [search,       setSearch]       = useState("");
  const [sortBy,       setSortBy]       = useState("churnRisk");
  const [toasts,       setToasts]       = useState([]);
  const [manualTasks,  setManualTasks]  = useState(()=>{
    try { const s=localStorage.getItem("pulse_tasks_v1"); return s?JSON.parse(s):[]; } catch { return []; }
  });

  // â”€â”€ API call helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const call = useCallback(async (method, path, body) => {
    const token = session?.token;
    return api(method, path, body, token);
  }, [session]);

  // â”€â”€ Load accounts on mount / session change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!API_URL) {
      // No backend â€” use localStorage
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
        // Backend unreachable â€” fall back to localStorage cache
        setAccounts(load());
        setApiReady(true);
      });
  }, [session, call]);

  // â”€â”€ Persist to localStorage whenever accounts change (offline cache) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => { if (apiReady) save(accounts); }, [accounts, apiReady]);

  useEffect(() => {
    try { localStorage.setItem("pulse_tasks_v1", JSON.stringify(manualTasks)); } catch {}
  }, [manualTasks]);

  useEffect(() => {
    const h = e => { if (e.key==="Escape"&&selected&&!showAdd&&!showBulk) setSelected(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, showAdd, showBulk]);

  const addManualTask    = task => setManualTasks(p=>[...p,task]);
  const toggleManualTask = id   => setManualTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const deleteManualTask = id   => setManualTasks(p=>p.filter(t=>t.id!==id));

  const toast = useCallback((message, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 2800);
  }, []);

  // â”€â”€ CRUD â€” optimistic UI + backend sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const update = useCallback(async (id, patch) => {
    // Optimistic update â€” UI responds instantly
    setAccounts(p=>p.map(a=>a.id===id?{...a,...patch}:a));
    setSelected(p=>p?.id===id?{...p,...patch}:p);
    // Sync to backend if available
    if (API_URL && session?.token) {
      try { await call("PATCH", `/api/accounts/${id}`, patch); }
      catch { toast("Sync failed â€” changes saved locally","info"); }
    }
  }, [call, session, toast]);

  const del = useCallback(async id => {
    setAccounts(p=>p.filter(a=>a.id!==id));
    setSelected(null);
    if (API_URL && session?.token) {
      try { await call("DELETE", `/api/accounts/${id}`); }
      catch { toast("Sync failed â€” deletion saved locally","info"); }
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
        toast("Sync failed â€” account saved locally","info");
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
        toast("Sync failed â€” accounts saved locally","info");
      }
    }
    setAccounts(p=>[...p,...newAccounts]);
    toast(`${newAccounts.length} account${newAccounts.length!==1?"s":""} imported`, "success");
  }, [call, session, toast]);

  // â”€â”€ Load demo/seed data into the database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        toast("Could not reach backend â€” loading locally","info");
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
      toast("Migration failed â€” please try again","error");
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
  const playbookAlerts = active.filter(a=>getTriggeredPlaybooks(a).length>0&&!a.activePlaybookId).length;
  const allAutoTasks   = generateAutoTasks(active);
  const taskAlerts     = [...allAutoTasks,...manualTasks].filter(t=>!t.done&&t.dueDate<=todayStr()).length;

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

  // Auth gate â€” if backend is configured and no session, show login screen
  if (API_URL && !session) {
    return <AuthScreen onAuth={s => { if(s) setSession(s); }}/>;
  }

  // Survey response page â€” render if URL is /survey/:token
  const surveyToken = window.location.pathname.match(/^\/survey\/([a-f0-9]+)$/)?.[1];
  if (surveyToken) {
    return <SurveyResponsePage token={surveyToken}/>;
  }

  const logout = () => {
    clearSession();
    setSession(null);
    setAccounts([]); // clear data from memory on logout
  };

  const NAV = [
    { id:"portfolio",    icon:"portfolio",    label:"Portfolio",        active:true  },
    { id:"tasks",        icon:"tasks",        label:"Tasks",            active:true, badge:taskAlerts>0?taskAlerts:null },
    { id:"pipeline",     icon:"pipeline",     label:"Renewal Pipeline", active:true  },
    { id:"playbooks",    icon:"playbooks",    label:"Playbooks",        active:true, badge:playbookAlerts>0?playbookAlerts:null },
    { id:"surveys",      icon:"survey",       label:"Surveys",          active:true  },
    { id:"integrations", icon:"integrations", label:"Integrations",     active:true  },
    { id:"briefing",     icon:"briefing",     label:"Daily Briefing",   active:false, tip:"Phase 4" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",display:"flex",background:"var(--bg)"}}>

        {/* Sidebar */}
        <div style={{width:220,background:"var(--bg2)",borderRight:"1px solid var(--border)",
          display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
          <div style={{padding:"20px 16px 18px",borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:"var(--r)",background:"var(--indigo)",display:"flex",
                alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px var(--indigo-glow)",flexShrink:0}}>
                <span style={{color:"white",fontSize:14,fontWeight:800,letterSpacing:"-.02em"}}>P</span>
              </div>
              <span style={{fontWeight:800,fontSize:17,letterSpacing:"-.03em",color:"var(--text)"}}>Pulse</span>
            </div>
          </div>

          <div style={{padding:"12px 8px",flex:1}}>
            {NAV.map(n=>(
              <div key={n.id}
                title={n.tip||""}
                onClick={n.active?()=>{setView(n.id);setSelected(null);}:undefined}
                className={n.active?"nav-item":""}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"9px 10px",borderRadius:"var(--r)",marginBottom:2,
                  background:view===n.id?"var(--indigo-dim)":"none",
                  cursor:n.active?"pointer":"not-allowed",opacity:n.active?1:0.4}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <Ic n={n.id} size={15} color={view===n.id?"var(--indigo)":"var(--text3)"}/>
                  <span style={{fontSize:13,color:view===n.id?"var(--indigo)":"var(--text2)",fontWeight:view===n.id?600:400}}>{n.label}</span>
                </div>
                {n.badge&&(
                  <span style={{fontSize:10,fontFamily:"var(--font-mono)",color:"white",
                    background:"var(--rose)",padding:"1px 7px",borderRadius:99,fontWeight:700,
                    minWidth:18,textAlign:"center"}}>
                    {n.badge}
                  </span>
                )}
                {n.tip&&!n.badge&&(
                  <span style={{fontSize:9,fontFamily:"var(--font-mono)",color:"var(--text3)",
                    background:"var(--bg4)",padding:"2px 6px",borderRadius:"var(--r-xs)",letterSpacing:".04em"}}>
                    {n.tip}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{padding:"14px 16px",borderTop:"1px solid var(--border)"}}>
            {session?.user && (
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,
                padding:"8px 10px",background:"var(--bg3)",borderRadius:"var(--r)"}}>
                <Avatar name={session.user.fullName||session.user.email} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {session.user.fullName||session.user.email}
                  </div>
                  {session.user.company&&(
                    <div style={{fontSize:10,color:"var(--text3)",overflow:"hidden",
                      textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {session.user.company}
                    </div>
                  )}
                </div>
                <button onClick={logout} className="icon-btn"
                  title="Sign out"
                  style={{background:"none",border:"none",cursor:"pointer",
                    padding:4,borderRadius:"var(--r-xs)",flexShrink:0}}>
                  <Ic n="arrow_right" size={13} color="var(--text3)"/>
                </button>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,color:"var(--text3)",fontWeight:500}}>Build progress</span>
              <span style={{fontSize:11,color:"var(--indigo)",fontFamily:"var(--font-mono)",fontWeight:600}}>3 / 6</span>
            </div>
            <Bar value={50} thin/>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,overflow:"auto",padding:"32px"}}>

          {/* â”€â”€ SURVEYS VIEW â”€â”€ */}
          {view==="surveys"&&(
            <SurveysPage accounts={active} session={session} toast={toast}/>
          )}

          {/* â”€â”€ INTEGRATIONS VIEW â”€â”€ */}
          {view==="integrations"&&(
            <IntegrationsPage onImport={bulkImport} toast={toast}/>
          )}

          {/* â”€â”€ TASKS VIEW â”€â”€ */}
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

          {/* â”€â”€ PIPELINE VIEW â”€â”€ */}
          {view==="pipeline"&&(
            <RenewalPipelinePage
              accounts={active}
              onAccountClick={a=>{setSelected(a);setView("portfolio");}}
            />
          )}

          {/* â”€â”€ PLAYBOOKS VIEW â”€â”€ */}
          {view==="playbooks"&&(
            <PlaybookLibraryPage accounts={active} onUpdate={update}/>
          )}

          {/* â”€â”€ PORTFOLIO VIEW â”€â”€ */}
          {view==="portfolio"&&(<>
            {!apiReady&&API_URL&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",
                height:320,flexDirection:"column",gap:16}}>
                <div style={{width:32,height:32,border:"3px solid var(--border2)",
                  borderTopColor:"var(--indigo)",borderRadius:"50%",
                  animation:"spin .7s linear infinite"}}/>
                <div style={{fontSize:13,color:"var(--text3)"}}>Loading your portfolioâ€¦</div>
              </div>
            )}

            {/* Migration banner â€” shown when local data exists but DB is empty */}
            {apiReady&&API_URL&&accounts.length===0&&!migrateDone&&
              localStorage.getItem("pulse_v4")&&JSON.parse(localStorage.getItem("pulse_v4")||"[]").length>0&&(
              <div style={{background:"var(--indigo-dim)",border:"1.5px solid rgba(67,97,238,0.2)",
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
                        animation:"spin .7s linear infinite"}}/>Migratingâ€¦</>
                    : <><Ic n="upload" size={13} color="white"/>Migrate to database</>
                  }
                </button>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
              <div>
                <h1 style={{fontWeight:800,fontSize:24,letterSpacing:"-.03em",marginBottom:4}}>Account Portfolio</h1>
                <div style={{fontSize:13,color:"var(--text3)"}}>
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setShowBulk(true)}
                  style={{background:"var(--bg2)",color:"var(--indigo)",border:"1.5px solid rgba(67,97,238,0.3)",
                    borderRadius:"var(--r)",padding:"10px 18px",fontWeight:700,fontSize:14,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:7,fontFamily:"var(--font-display)",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--indigo-dim)"}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--bg2)"}>
                  â†‘ Import CSV
                </button>
                <Btn onClick={()=>setShowAdd(true)} style={{fontSize:14,padding:"11px 22px"}}>+ Add Account</Btn>
              </div>
            </div>

            <Stats accounts={filtered} isFiltered={isFiltered}/>

            {/* Filters */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"var(--text3)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:".08em",marginRight:4}}>Stage</span>
                  {["All","At Risk","Needs Attention","Stable","Healthy"].map(f=>{
                    const cfg=STAGE_CFG[f],active2=filter===f,count=stageCounts[f]??0;
                    return (
                      <button key={f} onClick={()=>setFilter(f)} className="pill-btn"
                        style={{padding:"5px 11px",borderRadius:99,fontSize:11,cursor:"pointer",
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
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--text3)",pointerEvents:"none"}}>ðŸ”</span>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search accountsâ€¦"
                      style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                        padding:"8px 14px 8px 34px",color:"var(--text)",fontFamily:"var(--font-display)",
                        fontSize:13,outline:"none",width:200}}/>
                  </div>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                    style={{background:"var(--bg2)",border:"1.5px solid var(--border)",borderRadius:"var(--r)",
                      padding:"8px 12px",color:"var(--text2)",fontFamily:"var(--font-mono)",fontSize:12,outline:"none",cursor:"pointer"}}>
                    <option value="churnRisk">Churn Risk â†‘</option>
                    <option value="renewal">Renewal Soon</option>
                    <option value="health">Health â†‘</option>
                    <option value="arr">ARR â†“</option>
                    <option value="ces">CES â†‘</option>
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
                      style={{padding:"5px 11px",borderRadius:99,fontSize:11,cursor:"pointer",
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
                    style={{padding:"5px 11px",borderRadius:99,fontSize:11,cursor:"pointer",
                      fontFamily:"var(--font-mono)",border:"1.5px solid var(--border)",
                      background:"var(--bg2)",color:"var(--text3)"}}>
                    Clear all Ã—
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
          </>)}
        </div>

        {/* Detail panel backdrop */}
        {selected&&(
          <div onClick={()=>setSelected(null)}
            style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.15)",zIndex:499,
              backdropFilter:"blur(1px)"}}/>
        )}

        {selected&&<Detail account={selected} onClose={()=>setSelected(null)} onUpdate={update} onDelete={del} toast={toast}
          manualTasks={manualTasks} onAddManual={addManualTask} onToggleManual={toggleManualTask} onDeleteManual={deleteManualTask}/>}
        {showAdd &&<AccountForm onClose={()=>setShowAdd(false)} onSave={add} toast={toast}/>}
        {showBulk&&<BulkUpload onClose={()=>setShowBulk(false)} onImport={bulkImport}
          existingNames={active.map(a=>a.name.toLowerCase().trim())} toast={toast}/>}
      </div>

      <ToastBar toasts={toasts}/>
    </>
  );
}
