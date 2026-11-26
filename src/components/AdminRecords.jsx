import { useEffect, useState } from "react";
import { uploadAdminMedia } from "./MediaPicker.jsx";

async function request(view, method = "GET", body) {
  const response = await fetch("/api/admin?view=" + view, {
    method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export default function AdminRecords({ role, uploadTransport, initialView = "enquiries" }) {
  const [view,setView] = useState(initialView);
  const [records,setRecords] = useState(null);
  const [query,setQuery] = useState("");
  const [error,setError] = useState("");
  const [type,setType] = useState("");
  const [version,setVersion] = useState(0);
  const [uploading,setUploading] = useState(false);
  useEffect(() => {
    let current = true;
    request(view).then(({records}) => {if(current) setRecords(records);}).catch((error) => {if(current) setError(error.message);});
    return () => {current = false;};
  },[view,version]);
  const select = (next) => {setError("");setRecords(null);setQuery("");setType("");setView(next);};
  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    setError("");
    setUploading(true);
    try {
      await uploadAdminMedia(file,formData.get("alt"),uploadTransport);
      form.reset();
      setVersion((value)=>value+1);
    } catch (error) {setError(error.message || "Upload failed.");}
    finally {setUploading(false);}
  }
  async function update(body) {
    setError("");
    try { await request(view,"PUT",body);setVersion((value)=>value+1); }
    catch (error) { setError(error.message); }
  }
  return <section className="admin-editor mt-8">
    <nav aria-label="Administration records" className="admin-tabs">
      <button aria-pressed={view === "enquiries"} onClick={()=>select("enquiries")}>Enquiries</button>
      <button aria-pressed={view === "media"} onClick={()=>select("media")}>Media library</button>
      {role === "super_admin" && <>
        <button aria-pressed={view === "activity"} onClick={()=>select("activity")}>Activity log</button>
        <button aria-pressed={view === "administrators"} onClick={()=>select("administrators")}>Administrators</button>
      </>}
    </nav>
    {error && <p role="alert">{error}</p>}
    {!records && !error && <p role="status">Loading records…</p>}
    {view === "administrators" && <>
      <ul>{records?.map((person)=><li key={person.user_id}>{person.user_id} · {person.role}</li>)}</ul>
      <form className="m-form" onSubmit={(event)=>{event.preventDefault();update(Object.fromEntries(new FormData(event.currentTarget)));}}>
        <label>Existing Supabase user ID<input className="admin-input" name="id" required /></label>
        <label>Role<select className="admin-input" name="role"><option value="content_admin">Content Admin</option><option value="super_admin">Super Admin</option><option value="revoked">Revoke access</option></select></label>
        <button className="admin-primary">Save access</button>
      </form>
    </>}
    {view === "media" && <>
      <form className="m-form" onSubmit={upload}><label>Image or PDF<input required className="admin-input" type="file" name="file" accept="application/pdf,image/png,image/jpeg,image/webp" /></label>
      <label>Alternative text<input className="admin-input" name="alt" maxLength={300} /></label>
      <button className="admin-primary" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button></form>
      <ul>{records?.map((item)=><li className="admin-media-current mt-4" key={item.path}>
        {item.type.startsWith("image/") && <img src={item.url} alt={item.alt || ""} loading="lazy" />}
        <a className="underline" href={item.url} target="_blank" rel="noreferrer">{item.name}</a>
      </li>)}</ul>
    </>}
    {view === "activity" && <ul>{records?.map((item)=><li key={item.id}>{new Date(item.created_at).toLocaleString()} · {item.actor} · {item.action} · {item.target}</li>)}</ul>}
    {view === "enquiries" && records && <>
      <h2>Enquiries · {records.filter((item)=>item.status === "new").length} unread in this view</h2>
      <label>Search enquiries<input className="admin-input" type="search" value={query} onChange={(event)=>setQuery(event.target.value)} /></label>
      <label>Type<select className="admin-input" value={type} onChange={(event)=>setType(event.target.value)}><option value="">All</option><option value="service">Service</option><option value="contact">General</option></select></label>
      {records.filter((item)=>(!type || item.type === type) && [item.name,item.email,item.subject,item.category,item.message].join(" ").toLowerCase().includes(query.toLowerCase())).map((item)=>
        <article key={item.id} className="mt-5">
          <h3>{item.subject}</h3><p>{item.name} · {item.email}</p><p>{new Date(item.created_at).toLocaleString()} · {item.category || "General enquiry"}</p>
          <p className="whitespace-pre-wrap">{item.message}</p>
          <label>Status<select className="admin-input" value={item.status} onChange={(event)=>update({id:item.id,status:event.target.value})}>
            <option value="new">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option>
          </select></label>
        </article>)}
    </>}
    {records?.length === 0 && <p>No records yet.</p>}
  </section>;
}
