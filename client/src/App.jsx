import React, { useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowLeft, ArrowUpRight, Bell, Bot, CalendarDays, Check,
  ChevronDown, CircleAlert, Clock3, Command, Inbox, Mail, Menu,
  MoreHorizontal, Paperclip, Plus, RefreshCw, Search, Send, Settings2,
  Sparkles, Star, UserRound, Users, X, Zap
} from "lucide-react";
import { api } from "./api";

const responsibilityMeta = {
  "Assistant to Reply": { tone: "violet", icon: Bot, short: "Assistant" },
  "Client to Reply": { tone: "amber", icon: UserRound, short: "Client" },
  "No Reply Needed": { tone: "slate", icon: Check, short: "No reply" },
  "Review": { tone: "rose", icon: CircleAlert, short: "Review" }
};

const segments = [
  ["All mail", "all"],
  ["Assistant to Reply", "assistant"],
  ["Client to Reply", "client"],
  ["Action Required", "action"],
  ["Waiting for Response", "waiting"],
  ["Important", "important"],
  ["Meetings", "meetings"],
  ["No Reply Needed", "none"]
];

function App() {
  const [view, setView] = useState("assistant");
  const [emails, setEmails] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [segment, setSegment] = useState("all");
  const [query, setQuery] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [mail, acc] = await Promise.all([api.emails(), api.accounts()]);
      setEmails(mail.emails); setAccounts(acc.accounts);
      setSelected(current => current ? mail.emails.find(e => e.id === current.id) || null : null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = useMemo(() => ({
    total: emails.length,
    unread: emails.filter(e => e.unread).length,
    important: emails.filter(e => e.important).length,
    action: emails.filter(e => e.actionRequired).length,
    waiting: emails.filter(e => e.waiting).length,
    client: emails.filter(e => e.responsibility === "Client to Reply").length
  }), [emails]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emails.filter(e => {
      const hay = `${e.subject} ${e.sender} ${e.preview} ${e.summary}`.toLowerCase();
      const matchesQ = !q || hay.includes(q);
      let matchesSegment = true;
      if (segment === "assistant") matchesSegment = e.responsibility === "Assistant to Reply";
      if (segment === "client") matchesSegment = e.responsibility === "Client to Reply";
      if (segment === "action") matchesSegment = e.actionRequired;
      if (segment === "waiting") matchesSegment = e.waiting;
      if (segment === "important") matchesSegment = e.important;
      if (segment === "meetings") matchesSegment = e.category === "Meetings";
      if (segment === "none") matchesSegment = e.responsibility === "No Reply Needed";
      if (view === "client") matchesSegment = e.responsibility === "Client to Reply" && e.clientHandled !== true;
      return matchesQ && matchesSegment;
    });
  }, [emails, query, segment, view]);

  const notify = msg => setToast(msg);

  const updateEmail = async (id, body) => {
    try {
      const result = await api.updateEmail(id, body);
      setEmails(result.emails);
      setSelected(result.emails.find(e => e.id === id) || null);
      notify("Saved");
    } catch (e) { notify(e.message); }
  };

  const openEmail = (email) => {
    setSelected(email);
    if (email.unread) updateEmail(email.id, { unread: false });
  };

  const connect = async provider => {
    try {
      const result = await api.connect(provider);
      setAccounts(result.accounts);
      setShowConnect(false);
      notify(`${provider} connected · syncing sample inbox`);
      setTimeout(load, 650);
    } catch (e) { notify(e.message); }
  };

  const sync = async id => {
    try {
      const result = await api.sync(id);
      setAccounts(result.accounts);
      notify("Inbox synchronized");
    } catch (e) { notify(e.message); }
  };

  const generateSummary = async () => {
    if (!selected) return;
    setSummarizing(true);
    try {
      const result = await api.summarize(selected);
      setEmails(prev => prev.map(e => e.id === selected.id ? { ...e, summary: result.summary } : e));
      setSelected(prev => ({ ...prev, summary: result.summary }));
      notify("AI summary refreshed");
    } catch (e) { notify(e.message); }
    finally { setSummarizing(false); }
  };

  const generateDraft = async () => {
    if (!selected) return;
    setDrafting(true);
    try {
      const result = await api.draft(selected, "Write a concise, warm and professional reply. Do not invent facts.");
      setDraft(result.draft);
    } catch (e) { notify(e.message); }
    finally { setDrafting(false); }
  };

  if (view === "client") {
    return (
      <ClientView
        emails={visible}
        onBack={() => { setView("assistant"); setSegment("all"); }}
        onOpen={openEmail}
        onAction={(id, handled) => updateEmail(id, handled ? { clientHandled: true } : { responsibility: "Assistant to Reply", clientHandled: false })}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Sparkles size={17}/></div>
          <div><strong>clarity</strong><span>AI email workspace</span></div>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button>
        </div>

        <button className="new-btn" onClick={() => setShowConnect(true)}><Plus size={17}/> Connect inbox</button>

        <nav>
          <div className="nav-label">Workspace</div>
          {segments.map(([label, key]) => (
            <button key={key} className={`nav-item ${segment === key ? "active" : ""}`} onClick={() => { setSegment(key); setMobileNav(false); }}>
              {key === "all" ? <Inbox size={17}/> : key === "client" ? <UserRound size={17}/> : key === "assistant" ? <Bot size={17}/> : key === "action" ? <Zap size={17}/> : key === "waiting" ? <Clock3 size={17}/> : key === "important" ? <Star size={17}/> : key === "meetings" ? <CalendarDays size={17}/> : <Check size={17}/>}
              <span>{label}</span>
              {key === "client" && <b>{stats.client}</b>}
              {key === "action" && <b>{stats.action}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-label">Connected accounts</div>
          {accounts.map(a => (
            <div className="account-row" key={a.id}>
              <div className={`provider ${a.provider.toLowerCase()}`}>{a.provider === "Gmail" ? "G" : "O"}</div>
              <div className="account-copy"><strong>{a.provider}</strong><span>{a.email}</span></div>
              <span className="online-dot" />
            </div>
          ))}
          <button className="nav-item muted" onClick={() => notify("Settings are ready for the next iteration")}><Settings2 size={17}/> Settings</button>
        </div>
      </aside>

      {mobileNav && <div className="mobile-overlay" onClick={() => setMobileNav(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{segment === "all" ? "All mail" : segments.find(s => s[1] === segment)?.[0]}</strong></div>
          <div className="top-actions">
            <button className="view-switch" onClick={() => setView("client")}><UserRound size={15}/> Client view</button>
            <button className="icon-btn"><Bell size={18}/><i/></button>
            <div className="avatar">DR</div>
          </div>
        </header>

        <div className="content">
          <section className="hero-row">
            <div>
              <div className="eyebrow"><span className="pulse"/> INBOX HEALTH · LIVE</div>
              <h1>Good morning, Deepa.</h1>
              <p className="hero-sub">Here’s what needs your attention across the inbox.</p>
            </div>
            <div className="hero-tools">
              <button className="secondary-btn" onClick={load}><RefreshCw size={16}/> Sync now</button>
              <button className="primary-btn" onClick={() => setShowConnect(true)}><Plus size={16}/> Connect</button>
            </div>
          </section>

          <section className="stat-grid">
            <Stat label="Total emails" value={stats.total} hint="Across connected inboxes" icon={Mail}/>
            <Stat label="Unread" value={stats.unread} hint="Need a quick look" icon={Inbox} accent="violet"/>
            <Stat label="Action required" value={stats.action} hint="Follow-up or decision" icon={Zap} accent="amber"/>
            <Stat label="Client attention" value={stats.client} hint="AI routed to client" icon={UserRound} accent="rose"/>
          </section>

          <section className="workspace-card">
            <div className="workspace-head">
              <div>
                <h2>Conversations</h2>
                <p>{visible.length} conversation{visible.length === 1 ? "" : "s"} in this view</p>
              </div>
              <div className="search-wrap">
                <Search size={17}/>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations..." />
                <kbd><Command size={12}/> K</kbd>
              </div>
              <button className="filter-btn" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal size={18}/></button>
            </div>

            <div className="smart-banner">
              <div className="smart-icon"><Sparkles size={16}/></div>
              <div><strong>AI triage is active</strong><span>New conversations are classified automatically. You can always override the decision.</span></div>
              <span className="banner-status">Auto</span>
            </div>

            {loading ? <SkeletonList/> : error ? (
              <div className="state-card error-state"><CircleAlert size={28}/><h3>Couldn't load the inbox</h3><p>{error}</p><button className="secondary-btn" onClick={load}>Try again</button></div>
            ) : visible.length === 0 ? (
              <div className="state-card"><Search size={28}/><h3>No conversations found</h3><p>Try another search or choose a different segment.</p></div>
            ) : (
              <div className="email-list">
                {visible.map(email => <EmailRow key={email.id} email={email} onOpen={openEmail}/>)}
              </div>
            )}
          </section>

          <section className="bottom-grid">
            <div className="mini-card">
              <div className="mini-head"><div><span className="eyebrow">UPCOMING</span><h3>Meetings detected</h3></div><CalendarDays size={19}/></div>
              <div className="meeting">
                <div className="date-box"><strong>18</strong><span>NOV</span></div>
                <div><strong>Product review with Aisha</strong><span>10:30 AM · Google Meet</span></div>
                <ArrowUpRight size={17}/>
              </div>
              <div className="meeting">
                <div className="date-box"><strong>20</strong><span>NOV</span></div>
                <div><strong>Q4 planning — Northstar</strong><span>2:00 PM · Zoom</span></div>
                <ArrowUpRight size={17}/>
              </div>
            </div>
            <div className="mini-card">
              <div className="mini-head"><div><span className="eyebrow">AI OVERVIEW</span><h3>What changed today</h3></div><Sparkles size={19}/></div>
              <div className="ai-stat"><span>Client attention</span><strong>{stats.client} <small>threads</small></strong></div>
              <div className="ai-stat"><span>Waiting on others</span><strong>{stats.waiting} <small>threads</small></strong></div>
              <div className="ai-stat"><span>Low confidence</span><strong>{emails.filter(e => e.responsibility === "Review").length} <small>to review</small></strong></div>
            </div>
          </section>
        </div>
      </main>

      {selected && (
        <DetailPanel
          email={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateEmail}
          onSummary={generateSummary}
          summarizing={summarizing}
          onDraft={generateDraft}
          drafting={drafting}
          draft={draft}
          setDraft={setDraft}
          notify={notify}
        />
      )}

      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} onConnect={connect} />}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function Stat({label,value,hint,icon:Icon,accent}) {
  return <div className={`stat-card ${accent || ""}`}><div className="stat-icon"><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>
}

function EmailRow({email,onOpen}) {
  const meta = responsibilityMeta[email.responsibility] || responsibilityMeta.Review;
  const Icon = meta.icon;
  return (
    <button className={`email-row ${email.unread ? "unread" : ""}`} onClick={() => onOpen(email)}>
      <div className="sender-avatar">{email.sender.split(" ").map(x => x[0]).slice(0,2).join("")}</div>
      <div className="email-main">
        <div className="email-top"><strong>{email.sender}</strong><span>{email.date}</span></div>
        <div className="email-subject">{email.subject}</div>
        <p>{email.preview}</p>
        <div className="row-tags">
          <span className={`responsibility ${meta.tone}`}><Icon size={12}/>{meta.short}</span>
          {email.important && <span className="tag important"><Star size={11}/> Important</span>}
          {email.actionRequired && <span className="tag action"><Zap size={11}/> Action</span>}
          {email.attachments > 0 && <span className="tag"><Paperclip size={11}/>{email.attachments}</span>}
        </div>
      </div>
      {email.unread && <span className="unread-dot"/>}
    </button>
  );
}

function SkeletonList() {
  return <div className="skeleton-list">{[1,2,3,4].map(i => <div className="skeleton-row" key={i}><i/><div><b/><b/><b/></div></div>)}</div>
}

function DetailPanel({email,onClose,onUpdate,onSummary,summarizing,onDraft,drafting,draft,setDraft,notify}) {
  const meta = responsibilityMeta[email.responsibility] || responsibilityMeta.Review;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="detail-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head"><div><span className="eyebrow">CONVERSATION</span><h2>{email.subject}</h2></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
        <div className="drawer-scroll">
          <div className="detail-meta">
            <div className="sender-avatar big">{email.sender.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
            <div><strong>{email.sender}</strong><span>{email.email}</span></div>
            <span className={`responsibility ${meta.tone}`}><meta.icon size={12}/>{email.responsibility}</span>
          </div>

          <div className="ai-box">
            <div className="ai-box-head"><div className="smart-icon"><Sparkles size={15}/></div><strong>AI understanding</strong><span>{email.confidence}% confidence</span></div>
            <p>{email.summary}</p>
            <div className="reason"><strong>Why:</strong> {email.reason}</div>
            <div className="ai-actions"><button onClick={onSummary} disabled={summarizing}><Sparkles size={14}/>{summarizing ? "Refreshing..." : "Refresh summary"}</button></div>
          </div>

          <div className="conversation">
            {email.messages.map((m,i) => <div className={`message ${m.fromMe ? "mine" : ""}`} key={i}><div className="message-head"><strong>{m.name}</strong><span>{m.time}</span></div><p>{m.body}</p></div>)}
          </div>

          <div className="section-title"><span>Responsibility</span><span className="muted">Manual override</span></div>
          <div className="responsibility-grid">
            {Object.keys(responsibilityMeta).map(key => <button key={key} className={email.responsibility === key ? `selected ${responsibilityMeta[key].tone}` : ""} onClick={() => onUpdate(email.id,{responsibility:key})}>{key}</button>)}
          </div>

          {draft && <div className="draft-box"><div className="draft-head"><strong>AI draft · review before sending</strong><span>Editable</span></div><textarea value={draft} onChange={e => setDraft(e.target.value)} /><div className="draft-actions"><button className="secondary-btn" onClick={() => setDraft("")}>Discard</button><button className="primary-btn" onClick={() => notify("Draft approved — ready to send")}><Send size={15}/> Approve draft</button></div></div>}
        </div>
        <div className="drawer-footer">
          <button className="secondary-btn" onClick={() => onUpdate(email.id,{important:!email.important})}><Star size={15} fill={email.important ? "currentColor" : "none"}/> {email.important ? "Unimportant" : "Important"}</button>
          <button className="secondary-btn" onClick={() => onUpdate(email.id,{archived:true})}><Archive size={15}/> Archive</button>
          <button className="primary-btn" onClick={onDraft} disabled={drafting}><Sparkles size={15}/>{drafting ? "Drafting..." : "Draft reply"}</button>
        </div>
      </aside>
    </div>
  );
}

function ConnectModal({onClose,onConnect}) {
  return <div className="modal-backdrop" onClick={onClose}><div className="connect-modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-icon"><Sparkles size={20}/></div><button className="icon-btn modal-close" onClick={onClose}><X size={18}/></button>
    <span className="eyebrow">GET STARTED</span><h2>Connect an inbox</h2><p>Choose a provider. This prototype simulates authorization and syncs a safe sample inbox.</p>
    <button className="provider-btn" onClick={() => onConnect("Gmail")}><span className="provider gmail">G</span><div><strong>Google / Gmail</strong><small>OAuth connection · recommended</small></div><ArrowUpRight size={17}/></button>
    <button className="provider-btn" onClick={() => onConnect("Outlook")}><span className="provider outlook">O</span><div><strong>Microsoft Outlook</strong><small>Microsoft account connection</small></div><ArrowUpRight size={17}/></button>
    <div className="safe-note"><Check size={14}/> No real mailbox access is required for this demo.</div>
  </div></div>
}

function ClientView({emails,onBack,onOpen,onAction}) {
  return <div className="client-shell">
    <header className="client-top"><button className="client-brand"><div className="brand-mark"><Sparkles size={16}/></div><strong>clarity</strong></button><div className="client-top-right"><span><span className="online-dot"/> Personal inbox</span><div className="avatar">DR</div></div></header>
    <main className="client-main">
      <div className="client-hero"><div><span className="eyebrow">FOR YOU</span><h1>Things that need you.</h1><p>Your assistant has filtered the inbox down to the conversations that need a personal response.</p></div><button className="secondary-btn" onClick={onBack}><ArrowLeft size={15}/> Assistant view</button></div>
      {emails.length === 0 ? <div className="client-empty"><Check size={28}/><h3>You're all caught up</h3><p>No conversations currently need your personal attention.</p></div> :
      <div className="client-list">{emails.map(e => <article className="client-card" key={e.id}>
        <div className="client-card-top"><div className="sender-avatar">{e.sender.split(" ").map(x=>x[0]).slice(0,2).join("")}</div><div><strong>{e.sender}</strong><span>{e.date}</span></div><span className="responsibility amber"><UserRound size={12}/> Your reply</span></div>
        <h2>{e.subject}</h2><p className="client-summary">{e.summary}</p><div className="client-why"><strong>Why your input?</strong><span>{e.reason}</span></div>
        <div className="client-actions"><button className="secondary-btn" onClick={() => onOpen(e)}>Review conversation <ArrowUpRight size={15}/></button><button className="ghost-btn" onClick={() => onAction(e.id,false)}>Let assistant handle it</button><button className="primary-btn" onClick={() => onAction(e.id,true)}><Check size={15}/> I’ll handle this</button></div>
      </article>)}</div>}
    </main>
  </div>
}

export default App;
