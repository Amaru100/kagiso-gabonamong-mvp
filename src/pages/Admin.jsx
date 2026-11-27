import { useEffect, useState } from "react";
import AdminRecords from "../components/AdminRecords.jsx";
import MediaPicker from "../components/MediaPicker.jsx";
import RichTextEditor, { paragraphsFromText } from "../components/RichTextEditor.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Save,
  Trash2,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useContent } from "../context/ContentContext.jsx";
const sections = {
  overview: "Overview",
  articles: "Writings",
  books: "Recommended books",
  events: "Events",
  resources: "Resources",
  products: "Guides",
  testimonials: "Testimonials",
  author: "Site and author",
  settings: "Settings",
  mission: "Mission",
  enquiries: "Enquiries",
  media: "Media library",
  administrators: "Administrator management",
};
const fields = {
  mission: [["missionHtml","Mission statement","rich"]],
  testimonials: [["title","Name"],["id","ID"],["description","Professional description"],["image","Photograph URL"],["quote","Complete quotation","body"]],
  books: [
    ["title", "Title"],
    ["id", "ID"],
    ["author", "Author"],
    ["kind", "Book type", "bookType"],
    ["cover", "Book cover URL"],
    ["coverAlt", "Cover alt text"],
    ["description", "Why recommend it / book description", "textarea"],
    ["url", "Book details URL (optional)"],
  ],
  articles: [
    ["title", "Title"],
    ["id", "URL ID"],
    ["category", "Category"],
    ["readingTime", "Reading time"],
    ["author", "Author attribution"],
    ["date", "Publication date"],
    ["excerpt", "Short introduction", "textarea"],
    ["image", "Cover image URL"],
    ["bodyHtml","Article text","rich"],
    ["seoTitle","SEO title"],
    ["seoDescription","SEO description","textarea"],
  ],
  events: [
    ["title", "Title"],
    ["id", "ID"],
    ["kind", "Event format"],
    ["date", "Date / schedule"],
    ["location", "Location"],
    ["url", "Registration URL"],
    ["description", "Description", "textarea"],
  ],
  resources: [
    ["title", "Title"],
    ["id", "ID"],
    ["author","Author"],
    ["pages","PDF page count"],
    ["format", "File format"],
    ["cover", "Featured artwork URL"],
    ["description", "Description", "textarea"],
    ["url", "Download URL (HTTPS)"],
  ],
  products: [
    ["title", "Title"],
    ["id", "ID"],
    ["category", "Category"],
    ["description", "Description", "textarea"],
  ],
  author: [
    ["authorName", "Author name"],
    ["authorBioHtml", "Author biography", "rich"],
    ["authorPhoto", "Author photograph URL"],
    ["heroTitle", "Homepage heading", "textarea"],
    ["heroDescription", "Homepage introduction", "textarea"],
    ["heroThought","Homepage philosophical statement","textarea"],
  ],
  settings: [
    ["siteName","Site name"],
    ["seoDescription","Default SEO description","textarea"],

    ["instagram","Instagram URL"],
    ["x","X URL"],
    ["email", "Contact email"],
    ["newsletterUrl", "Newsletter signup URL"],
    ["recommendationsDescription", "Recommended books introduction", "textarea"],
    ["phone", "Phone number"],
    ["location", "Location"],
  ],
};
async function request(method = "GET", data, view) {
  const response = await fetch("/api/admin" + (view ? "?view=" + view : ""), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json().catch(() => ({
    error:
      "Owner access is unavailable. Run the site with npm run dev or deploy to Vercel.",
  }));
  if (!response.ok)
    throw Object.assign(new Error(result.error || "Request failed."), {
      status: response.status, mode:result.mode, recoveryEnabled:result.recoveryEnabled,
    });
  return result;
}
export default function Admin() {
  const navigate = useNavigate();
  const {pathname,state} = useLocation();
  const [mode,setMode] = useState("");
  const [recoveryAvailable,setRecoveryAvailable] = useState(false);
  const [recovering,setRecovering] = useState(false);
  const [recoveryRequested,setRecoveryRequested] = useState(false);
  const [role,setRole] = useState("");
  const [uploadTransport,setUploadTransport] = useState("");
  const [email,setEmail] = useState("");
  const { setContent } = useContent();
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState("");
  const [section, setSection] = useState("overview");
  const [selected, setSelected] = useState(0);
  const settingsSection = ["settings","mission","author"].includes(section);
  const [overview,setOverview] = useState(null);
  const [account,setAccount] = useState("");
  const [baseline,setBaseline] = useState(null);
  const [backupKey,setBackupKey] = useState("");
  const [saved,setSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(true);
  const [dirty, setDirty] = useState(false);
  useEffect(()=>{
    if (section === "overview" && role) request("GET",undefined,"overview").then(setOverview).catch(()=>setOverview(null));
  }, [section,role]);
  const load = async () => {
    const result = await request();
    const content = {...result.content, books:result.content.books || [], testimonials:result.content.testimonials || []};
    const key = "mystic-draft:" + (result.accountId || "local");
    let backup;
    try { backup = JSON.parse(localStorage.getItem(key)); } catch { /* Storage is optional. */ }
    setBaseline(content); setDraft(backup?.content || content);
    setRevision(backup?.revision || result.revision); setBackupKey(key);
    setDirty(Boolean(backup?.content)); setSaved(Boolean(backup?.content));
    if (backup?.content && backup.revision !== result.revision) setError("The website has changed. Copy the edits you need, then discard this draft to reload.");
    setAccount(result.email || "");
    if (result.role) setMode("supabase");
    setRecoveryAvailable(result.recoveryEnabled === true);
    setRole(result.role || "");
    setUploadTransport(result.uploadTransport || "");
    if (pathname === "/admin/login") navigate("/admin", {replace:true});
  };
  useEffect(() => {
    load()
      .catch((e) => {
        if (e.mode) setMode(e.mode);
        setRecoveryAvailable(e.recoveryEnabled === true);
        if (e.status === 401 && pathname !== "/admin/login") navigate("/admin/login",{replace:true,state});
        if (e.status !== 401 || e.message.includes("setup"))
          setError(e.message);
      })
      .finally(() => setBusy(false));
  }, []);
  useEffect(() => {
    const warn = (event) => {
      if (dirty && !saved) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty,saved]);
  function saveDraft() {
    try {localStorage.setItem(backupKey,JSON.stringify({content:draft,revision}));setSaved(true);}
    catch {setError("This browser could not save your draft. Keep this page open and copy your changes.");}
  }
  useEffect(()=>{
    if (!dirty || saved || !backupKey) return;
    const timer=setTimeout(saveDraft,700);
    return ()=>clearTimeout(timer);
  },[dirty,saved,backupKey,draft,revision]);
  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("POST", { password, email });
      setPassword("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const publish = async () => {
    setBusy(true);
    setError("");
    setStatus("Publishing changes...");
    try {
      const result = await request("PUT", { content: draft, revision });
      setRevision(result.revision);
      setDraft(result.content);
      setBaseline(result.content);
      try { localStorage.removeItem(backupKey); } catch { /* Already saved on the server. */ }
      setContent(result.content);
      setDirty(false);
      setStatus(
        "Published. Your changes are saved and available on the website.",
      );
    } catch (e) {
      setStatus("");
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const change = (field, value, additional = {}) => {
    setDirty(true);
    setSaved(false);
    setStatus("");
    setDraft((current) =>
      settingsSection
        ? { ...current, settings: { ...current.settings, [field]: value, ...additional } }
        : {
            ...current,
            [section]: current[section].map((item, index) =>
              index === selected ? {
                ...item,
                [field]: value,
                ...additional,
                ...(field === "bodyHtml" && !value ? {body:""} : {}),
                ...articleSlug(section,field,value,item,current.articles,baseline.articles),
              } : item,
            ),
          },
    );
  };
  const add = () => {
    const item = Object.fromEntries(fields[section].map(([key]) => [key, ""]));
    Object.assign(item, {
      id: `new-${crypto.randomUUID().slice(0, 8)}`,
      title: "Untitled",
      published: false,
    });
    if (section === "articles")
      Object.assign(item, {
        image: "/sketches/eye.svg",
        readingTime: "4 min read",
      });
    if (section === "books")
      Object.assign(item, { kind: "recommended", sample: false });
    setDraft({ ...draft, [section]: [...draft[section], item] });
    setSelected(draft[section].length);
    setDirty(true);
    setSaved(false);
    setStatus("");
  };
  const remove = () => {
    if (
      !window.confirm(
        `Remove “${draft[section][selected].title}”? This takes effect when you publish.`,
      )
    )
      return;
    setDraft({
      ...draft,
      [section]: draft[section].filter((_, index) => index !== selected),
    });
    setSelected(0);
    setDirty(true);
    setSaved(false);
    setStatus("");
  };
  const move = (direction) => {
    const items = [...draft[section]];
    const target = selected + direction;
    if (target < 0 || target >= items.length) return;
    [items[selected], items[target]] = [items[target], items[selected]];
    setDraft({ ...draft, [section]: items });
    setSelected(target);
    setDirty(true);
    setSaved(false);
    setStatus("");
  };
  const logout = async () => {
    if (dirty && !saved && !window.confirm("Sign out before your changes are saved in this browser?"))
      return;
    try {
      await request("DELETE");
      setDraft(null);
      setSection("overview");
      setSelected(0);
      navigate("/admin/login",{replace:true});
      setDirty(false);
      setStatus("");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  if (!draft)
    return (
      <main className="admin-login">
        <Link to="/" className="eyebrow">
          ← Back to website
        </Link>
        <p className="eyebrow mt-16">Kagiso Gabonamong / Private workspace</p>
        <h1 className="display-heading mt-4">Owner login</h1>
        {state?.passwordSetupComplete && <p role="status" className="admin-success mt-5">Password saved. Sign in with your new password.</p>}
        <p className="mt-5 leading-7 text-[#bbc6bf]">
          Add and edit writings, books, events, resources, and author details.
        </p>
        {recovering ? <form className="mt-8 grid gap-4" onSubmit={async event=>{
          event.preventDefault();
          setError("");setRecoveryRequested(false);setBusy(true);
          try {await request("POST",{email},"recover");setRecoveryRequested(true);}
          catch (error) {setError(error.message);}
          finally {setBusy(false);}
        }}>
          <label className="admin-label">Administrator email<input type="email" required maxLength={254} autoComplete="email" className="admin-input" value={email} onChange={event=>setEmail(event.target.value)} /></label>
          <button disabled={busy} className="admin-primary">Send reset link</button>
          {recoveryRequested && <p role="status">If that address can receive a reset email, look for a link in your inbox or spam folder.</p>}
        </form> : <form onSubmit={signIn} className="mt-8 grid gap-4">
          {mode === "supabase" && <label className="admin-label">Email<input type="email" required autoComplete="username" className="admin-input" value={email} onChange={(event)=>setEmail(event.target.value)} /></label>}
          <label className="admin-label">
            Owner password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="admin-input"
            />
          </label>
          <button disabled={busy} className="admin-primary">
            {busy ? "Connecting…" : "Sign in"}
          </button>
        </form>}
        {recoveryAvailable && <button className="admin-button mt-4" disabled={busy} onClick={()=>{
          setRecovering(!recovering);setError("");setRecoveryRequested(false);
        }}>{recovering ? "Back to sign in" : "Forgot password?"}</button>}
        {error && (
          <p role="alert" className="admin-error mt-5">
            {error}
          </p>
        )}
      </main>
    );
  const item =
    settingsSection ? draft.settings : draft[section]?.[selected];
  return (
    <main className="admin-shell">
      <header className="admin-topbar mm-admin-header">
        <img src="/brand/logo-white.svg" width="124" alt="Mystic Mind" />
        <div className="flex flex-wrap items-center gap-3">
          {account && <span className="mm-account">{account} / {role === "super_admin" ? "Super Admin" : "Content Admin"}</span>}
          <a href="/" className="admin-button" target="_blank" rel="noreferrer"><ExternalLink size={16} /> View website</a>
          <button className="admin-button" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </header>
      <div className="mm-admin-layout">
        <details className="mm-admin-nav" open>
          <summary>Workspace menu</summary>
          <nav aria-label="Content sections">
            {Object.entries(sections).filter(([key])=>key==="administrators" ? role==="super_admin" : !["enquiries","media"].includes(key) || role).map(([key,label])=>
              <button key={key} className="admin-button" aria-pressed={section===key} onClick={()=>{setSection(key);setSelected(0);}}>{label}</button>)}
          </nav>
        </details>
        <fieldset disabled={busy} className="min-w-0">
          <h1 className="text-2xl font-semibold mb-5">{section==="overview" ? "Manage the website" : sections[section]}</h1>
          {dirty && <div className="flex flex-wrap items-center gap-3 mb-5">
            <span>{saved ? "Draft saved in this browser. Changes are unpublished." : "You have unsaved changes."}</span>
            <button className="admin-button" onClick={saveDraft}>Save draft</button>
            <button className="admin-primary" onClick={publish}><Save size={16} /> {busy ? "Publishing?" : "Publish changes"}</button>
            <button className="admin-button" onClick={()=>{
              if (!window.confirm("Discard this draft?")) return;
              try {localStorage.removeItem(backupKey);} catch { /* Storage is optional. */ }
              setError("");load().catch(error=>setError(error.message));
            }}>Discard draft</button>
          </div>}
          {error && <p role="alert" className="admin-error mb-5">{error}</p>}
          {status && <p role="status" className="admin-success mb-5">{status}</p>}
          {section==="overview" && <Overview content={baseline} overview={overview} role={role} go={setSection} />}
          {["enquiries","media","administrators"].includes(section) && <AdminRecords key={section} initialView={section} role={role} uploadTransport={uploadTransport} />}
          {section==="settings" && account && <PasswordChange onSuccess={()=>{setDraft(null);navigate("/admin/login",{replace:true});setError("Password changed. Sign in with your new password.");}} />}
          {fields[section] && (
        <div
          className={`admin-layout ${settingsSection ? "settings-layout" : ""}`}
        >
          {!settingsSection && (
            <aside>
              <button className="admin-button mb-4 w-full" onClick={add}>
                <Plus size={17} /> Add{" "}
                {section === "articles"
                  ? "writing"
                  : section === "books" ? "book"
                  : sections[section].toLowerCase().replace(/s$/, "")}
              </button>
              <div className="admin-list">
                {draft[section].map((entry, index) => (
                  <button
                    key={index}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    <span>{entry.title || "Untitled"}</span>
                    <small>
                      {entry.published === false ? "Draft" : "Published"}
                    </small>
                  </button>
                ))}
              </div>
            </aside>
          )}
          <section
            className="admin-editor"
            aria-label={`${sections[section]} editor`}
          >
            {item ? (
              <>
                <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold">
                    {section === "settings"
                      ? sections[section] + " details"
                      : "Edit " +
                        (section === "articles"
                          ? "writing"
                          : section === "events"
                            ? "event"
                            : section === "books"
                              ? "book"
                              : "resource")}
                  </h2>
                  {!settingsSection && (
                    <div className="flex gap-2">
                      <button
                        aria-label="Move up"
                        disabled={selected === 0}
                        className="admin-button"
                        onClick={() => move(-1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        aria-label="Move down"
                        disabled={selected === draft[section].length - 1}
                        className="admin-button"
                        onClick={() => move(1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button className="admin-button" onClick={remove}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  )}
                </div>
                {!settingsSection && (
                  <label className="mb-7 flex min-h-11 items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.published !== false}
                      onChange={(event) =>
                        change("published", event.target.checked)
                      }
                    />{" "}
                    Visible on website
                  </label>
                )}
                <div className="grid gap-5">
                  {section === "books" && (
                    <label className="mb-2 flex min-h-11 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={item.sample === true}
                        onChange={(event) =>
                          change("sample", event.target.checked)
                        }
                      />{" "}
                      Sample selection, awaiting approval
                    </label>
                  )}
                  {["books", "resources"].includes(section) && (section !== "books" || item.kind !== "own") && <label><input type="checkbox" checked={item.featured === true} onChange={(event) => change("featured", event.target.checked)} /> Featured on homepage</label>}
                  {fields[section].map(([key,label,type])=>{
                    const pdf = section==="resources" && key==="url";
                    const image = ["cover","image","authorPhoto"].includes(key);
                    if (type==="rich") return <RichTextEditor key={key+selected} label={label}
                      value={item[key] ?? paragraphsFromText(section==="articles" ? item.body : section==="mission" ? item.mission : item.authorBio)}
                      onChange={(value,words)=>change(key,value,key==="bodyHtml" ? {readingTime:words ? Math.ceil(words/220) + " min read" : ""} : {})}
                      mediaEnabled={!!role} uploadTransport={uploadTransport} />;
                    if (role && (pdf || image)) return <div key={key}><p>{label.replace(/ URL.*$/, "")}</p>
                      <MediaPicker type={pdf ? "pdf" : "image"} label={pdf ? "Choose PDF" : "Choose image"} value={item[key] || ""}
                        onSelect={media=>change(key,media.url, section==="books" && key==="cover" && media.alt ? {coverAlt:media.alt} : {})} uploadTransport={uploadTransport} />
                    </div>;
                    const field = (
                    <label key={key} className="admin-label">
                      {label}
                      {type === "bookType" ? (
                        <select
                          className="admin-input"
                          value={item[key] || "recommended"}
                          onChange={(event) => change(key, event.target.value)}
                        >
                          <option value="recommended">Recommended book</option>
                          <option value="own">Kagiso's own book</option>
                        </select>
                      ) : type ? (
                        <textarea
                          aria-label={label}
                          rows={type === "body" ? 14 : 3}
                          className="admin-input"
                          value={item[key] || ""}
                          onChange={(event) => change(key, event.target.value)}
                        />
                      ) : (
                        <input
                          className="admin-input"
                          value={item[key] || ""}
                          readOnly={section==="articles" && key==="id" && baseline.articles.some(entry=>entry.id===item.id && entry.published!==false)}
                          onChange={(event) => change(key, event.target.value)}
                        />
                      )}
                    </label>
                    );
                    return section==="articles" && ["id","seoTitle","seoDescription"].includes(key) ? <details key={key}><summary>{label} (advanced)</summary>{field}</details> : field;
                  })}
                </div>
                {section === "books" && (
                  <div className="mt-7">
                    <p className="text-sm leading-7 text-[#a5b9ac]">
                      Recommended books appear after the writings on the
                      homepage. Choose “Kagiso's own book” for future
                      publications; that section appears only when you publish
                      one. Cover and details links can use hosted HTTPS URLs.
                      Remove the sample flag after Kagiso approves a selection.
                    </p>
                    <label className="admin-label mt-4">Select a local cover
                      <select className="admin-input" value={["/books/atomic-habits.jpg", "/books/deep-work.jpg", "/books/meditations.jpg"].includes(item.cover) ? item.cover : ""} onChange={(event) => { if (event.target.value) change("cover", event.target.value); }}>
                        <option value="">Choose a matching cover</option>
                        <option value="/books/atomic-habits.jpg">Atomic Habits</option>
                        <option value="/books/deep-work.jpg">Deep Work</option>
                        <option value="/books/meditations.jpg">Meditations</option>
                      </select>
                    </label>
                    {item.cover && (
                      <img
                        src={item.cover}
                        alt="Book cover preview"
                        className="mt-5 max-h-52 max-w-40 object-contain"
                      />
                    )}
                  </div>
                )}
                {section === "articles" && (
                  <div className="mt-7">
                    <p className="admin-label mb-3">Choose a pencil illustration</p>
                    <div className="cover-picker">
                      {["eye", "book", "lightbulb"].map((number) => (
                        <button
                          key={number}
                          aria-label={`Choose cover ${number}`}
                          aria-pressed={
                            item.image === `/sketches/${number}.svg`
                          }
                          onClick={() =>
                            change("image", `/sketches/${number}.svg`)
                          }
                        >
                          <img src={`/sketches/${number}.svg`} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="py-12 text-[#bbc6bf]">
                No entries yet. Add your first one to get started.
              </p>
            )}
          </section>
        </div>
      )}
      </fieldset>
      </div>
    </main>
  );
}

function articleSlug(section,field,value,item,articles,baseline) {
  if (section!=="articles" || field!=="title" || baseline.some(entry=>entry.id===item.id)) return {};
  const slug = title=>title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80).replace(/-$/,"");
  const id=slug(value);
  return id && (item.id.startsWith("new-") || item.id===slug(item.title)) &&
    !articles.some(entry=>entry!==item && entry.id===id) ? {id} : {};
}

function Overview({content,overview,role,go}) {
  const cards=[
    ["Published writings",content.articles.filter(item=>item.published!==false).length,"articles"],
    ["Draft writings",content.articles.filter(item=>item.published===false).length,"articles"],
    ["Resources",content.resources.length,"resources"],
    ["Recommended books",content.books.filter(item=>item.kind!=="own" && !item.sample).length,"books"],
    ["Testimonials",content.testimonials.length,"testimonials"],
    ["Unread enquiries",overview?.unread ?? "Unavailable","enquiries"],
  ];
  return <>
    <div className="mm-admin-summary" aria-label="Content overview">{cards.map(([label,count,key])=>
      <button disabled={!role && key==="enquiries"} className="admin-editor" key={label} onClick={()=>go(key)}><strong>{count}</strong>{label}</button>)}</div>
    <button className="admin-button mt-5" onClick={()=>go("articles")}>Manage writings</button>
    {role==="super_admin" && <section className="admin-editor mt-5">
      <h2>Recent administrative activity</h2>
      {overview?.activity?.length ? <ul>{overview.activity.map(item=><li key={item.id}>{new Date(item.created_at).toLocaleString()} / {item.action} / {item.target}</li>)}</ul> : <p>{overview ? "No recent administrative activity." : "Activity unavailable."}</p>}
    </section>}
  </>;
}

function PasswordChange({onSuccess}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event) {
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    if (data.get("next")!==data.get("confirm")) {setError("The new passwords must match.");return;}
    setBusy(true);setError("");
    try {
      await request("POST",{currentPassword:data.get("current"),newPassword:data.get("next")},"password");
      form.reset();onSuccess();
    } catch (error) {setError(error.message);}
    finally {setBusy(false);}
  }
  return <details className="admin-editor mb-5"><summary>Change password</summary>
    <form className="grid gap-4 mt-4" onSubmit={submit}>
      <label className="admin-label">Current password<input className="admin-input" type="password" name="current" autoComplete="current-password" required maxLength={512} /></label>
      <label className="admin-label">New password<input className="admin-input" type="password" name="next" autoComplete="new-password" required minLength={12} maxLength={72} /></label>
      <label className="admin-label">Confirm new password<input className="admin-input" type="password" name="confirm" autoComplete="new-password" required minLength={12} maxLength={72} /></label>
      <button className="admin-primary" disabled={busy}>{busy ? "Updating password..." : "Update password"}</button>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </form>
  </details>;
}
