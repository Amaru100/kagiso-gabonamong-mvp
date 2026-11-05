import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  articles: "Writings",
  events: "Events",
  resources: "Resources",
  products: "Guides",
  settings: "Site & author",
};
const fields = {
  articles: [
    ["title", "Title"],
    ["id", "URL ID"],
    ["category", "Category"],
    ["readingTime", "Reading time"],
    ["excerpt", "Short introduction", "textarea"],
    ["image", "Cover image URL"],
    ["body", "Full writing (separate paragraphs with a blank line)", "body"],
  ],
  events: [
    ["title", "Title"],
    ["id", "ID"],
    ["kind", "Event format"],
    ["date", "Date / schedule"],
    ["location", "Location"],
    ["description", "Description", "textarea"],
  ],
  resources: [
    ["title", "Title"],
    ["id", "ID"],
    ["format", "File format"],
    ["description", "Description", "textarea"],
    ["url", "Download URL (HTTPS)"],
  ],
  products: [
    ["title", "Title"],
    ["id", "ID"],
    ["category", "Category"],
    ["description", "Description", "textarea"],
  ],
  settings: [
    ["authorName", "Author name"],
    ["authorBio", "Author biography", "body"],
    ["authorPhoto", "Author photograph URL"],
    ["heroTitle", "Homepage heading"],
    ["heroDescription", "Homepage introduction", "textarea"],
    ["email", "Contact email"],
    ["phone", "Phone number"],
    ["location", "Location"],
  ],
};
async function request(method = "GET", data) {
  const response = await fetch("/api/admin", {
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
      status: response.status,
    });
  return result;
}
export default function Admin() {
  const { setContent } = useContent();
  const [draft, setDraft] = useState(null);
  const [revision, setRevision] = useState("");
  const [section, setSection] = useState("articles");
  const [selected, setSelected] = useState(0);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(true);
  const [dirty, setDirty] = useState(false);
  const load = async () => {
    const result = await request();
    setDraft(result.content);
    setRevision(result.revision);
    setDirty(false);
  };
  useEffect(() => {
    load()
      .catch((e) => {
        if (e.status !== 401 || e.message.includes("setup"))
          setError(e.message);
      })
      .finally(() => setBusy(false));
  }, []);
  useEffect(() => {
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("POST", { password });
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
    setStatus("");
    try {
      const result = await request("PUT", { content: draft, revision });
      setRevision(result.revision);
      setDraft(result.content);
      setContent(result.content);
      setDirty(false);
      setStatus(
        "Published. Your changes are saved and available on the website.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const change = (field, value) => {
    setDirty(true);
    setStatus("");
    setDraft((current) =>
      section === "settings"
        ? { ...current, settings: { ...current.settings, [field]: value } }
        : {
            ...current,
            [section]: current[section].map((item, index) =>
              index === selected ? { ...item, [field]: value } : item,
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
        image: "/art/cover-1.svg",
        readingTime: "4 min read",
      });
    setDraft({ ...draft, [section]: [...draft[section], item] });
    setSelected(draft[section].length);
    setDirty(true);
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
    setStatus("");
  };
  const logout = async () => {
    if (dirty && !window.confirm("Discard unpublished changes and sign out?"))
      return;
    try {
      await request("DELETE");
      setDraft(null);
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
        <h1 className="display-heading mt-4">Make it yours.</h1>
        <p className="mt-5 leading-7 text-[#bbc6bf]">
          Manage your writings, events, resources, and author details.
        </p>
        <form onSubmit={signIn} className="mt-8 grid gap-4">
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
        </form>
        {error && (
          <p role="alert" className="admin-error mt-5">
            {error}
          </p>
        )}
      </main>
    );
  const item =
    section === "settings" ? draft.settings : draft[section][selected];
  return (
    <main className="admin-shell">
      <fieldset disabled={busy} className="min-w-0">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Owner workspace</p>
            <h1 className="mt-2 text-2xl font-semibold">
              Your words. Your space.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-button"
            >
              <ExternalLink size={16} /> View site
            </a>
            <button className="admin-button" onClick={logout}>
              <LogOut size={16} /> Sign out
            </button>
            <button
              disabled={busy || !dirty}
              className="admin-primary"
              onClick={publish}
            >
              <Save size={16} />
              {busy ? "Publishing…" : "Publish changes"}
            </button>
          </div>
        </header>
        <p className="mb-5 text-sm text-[#a5b9ac]">
          {dirty ? "You have unpublished changes." : "Everything is saved."} New
          entries start as drafts. Turn on “Visible on website” when ready.
        </p>
        {error && (
          <p role="alert" className="admin-error mb-5">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="admin-success mb-5">
            {status}
          </p>
        )}
        <nav aria-label="Content sections" className="admin-tabs">
          {Object.entries(sections).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={section === key}
              onClick={() => {
                setSection(key);
                setSelected(0);
              }}
            >
              {label}
              {key !== "settings" && <span>{draft[key].length}</span>}
            </button>
          ))}
        </nav>
        <div
          className={`admin-layout ${section === "settings" ? "settings-layout" : ""}`}
        >
          {section !== "settings" && (
            <aside>
              <button className="admin-button mb-4 w-full" onClick={add}>
                <Plus size={17} /> Add{" "}
                {section === "articles"
                  ? "writing"
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
                      ? "Site & author details"
                      : "Edit " +
                        (section === "articles"
                          ? "writing"
                          : section === "events"
                            ? "event"
                            : "resource")}
                  </h2>
                  {section !== "settings" && (
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
                {section !== "settings" && (
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
                  {fields[section].map(([key, label, type]) => (
                    <label key={key} className="admin-label">
                      {label}
                      {type ? (
                        <textarea
                          rows={type === "body" ? 14 : 3}
                          className="admin-input"
                          value={item[key] || ""}
                          onChange={(event) => change(key, event.target.value)}
                        />
                      ) : (
                        <input
                          className="admin-input"
                          value={item[key] || ""}
                          onChange={(event) => change(key, event.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
                {section === "articles" && (
                  <div className="mt-7">
                    <p className="admin-label mb-3">Choose a temporary cover</p>
                    <div className="cover-picker">
                      {[1, 2, 3, 4, 5, 6].map((number) => (
                        <button
                          key={number}
                          aria-label={`Choose cover ${number}`}
                          aria-pressed={
                            item.image === `/art/cover-${number}.svg`
                          }
                          onClick={() =>
                            change("image", `/art/cover-${number}.svg`)
                          }
                        >
                          <img src={`/art/cover-${number}.svg`} alt="" />
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-[#a5b9ac]">
                      Use a hosted HTTPS image URL to replace these covers
                      later. Writings use plain text; blank lines create
                      paragraphs.
                    </p>
                  </div>
                )}
                {section === "settings" && (
                  <p className="mt-6 text-sm text-[#a5b9ac]">
                    Leave the biography and photograph blank until the real
                    story and images are ready. Use a hosted HTTPS image URL for
                    the portrait.
                  </p>
                )}
              </>
            ) : (
              <p className="py-12 text-[#bbc6bf]">
                No entries yet. Add your first one to get started.
              </p>
            )}
          </section>
        </div>
      </fieldset>
    </main>
  );
}
