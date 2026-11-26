import { useEffect, useState } from "react";

export async function mediaRequest(options) {
  const result = await fetch("/api/admin?view=media",options);
  const body = await result.json().catch(()=>({}));
  if (!result.ok) throw Error(body.error || "The media library is unavailable.");
  return body;
}

export async function uploadAdminMedia(file, alt, transport) {
  if (!file?.size) throw Error("Choose a file first.");
  if (file.size > 3_000_000) throw Error("Choose a file smaller than 3 MB.");
  if (!["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type)) {
    throw Error("Choose a PDF, JPG, PNG, or WebP file.");
  }
  if (transport === "binary") return mediaRequest({
    method:"POST",headers:{"Content-Type":file.type,"X-Media-Name":encodeURIComponent(file.name),"X-Media-Alt":encodeURIComponent(alt)},
    body:file,
  });
  const data = await new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload=()=>resolve(reader.result.split(",")[1]);
    reader.onerror=()=>reject(Error("The file could not be read."));
    reader.readAsDataURL(file);
  });
  return mediaRequest({
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({data,type:file.type,name:file.name,alt}),
  });
}

export default function MediaPicker({value, type, onSelect, uploadTransport, initiallyOpen = false, label = "Choose or upload media"}) {
  const [open,setOpen] = useState(initiallyOpen);
  const [items,setItems] = useState([]);
  const [state,setState] = useState("");
  const [error,setError] = useState("");
  const [file,setFile] = useState(null);
  const [alt,setAlt] = useState("");
  const [selected,setSelected] = useState("");
  const [attached,setAttached] = useState(null);
  useEffect(()=>{
    if (!open) return;
    const controller = new AbortController();
    setState("Loading media…");setError("");
    mediaRequest({signal:controller.signal}).then(({records})=>{
      if (!controller.signal.aborted) {setItems(records);setState("");}
    }).catch(error=>{
      if (!controller.signal.aborted) {setError(error.message);setState("");}
    });
    return ()=>controller.abort();
  },[open]);
  const matched = items.filter((item)=>type === "image" ? item.type.startsWith("image/") : item.type === "application/pdf");
  const active = matched.find((item)=>item.url === selected);
  async function upload() {
    setError("");setState("Uploading…");
    try {
      const {item} = await uploadAdminMedia(file,alt,uploadTransport);
      setAttached({...item,size:file.size});
      onSelect(item);setOpen(false);setFile(null);setAlt("");
    } catch (error) {setError(error.message);}
    finally {setState("");}
  }
  return <div className="admin-media-picker">
    {value && <div className="admin-media-current">
      {type === "image" && <img src={value} alt="" />}
      <span>{type === "pdf" ? (attached?.url===value ? attached.name + " / " + Math.ceil(attached.size/1024) + " KB" : items.find(item=>item.url===value)?.name || value.split("/").at(-1)) : "Current image"}</span>
      <button type="button" className="admin-button" onClick={()=>{
        if (window.confirm("Remove this attachment from the content? The original stays in the media library.")) onSelect({url:"",alt:""});
      }}>Remove attachment</button>
    </div>}
    <button type="button" className="admin-button" aria-expanded={open} onClick={()=>setOpen(!open)}>
      {open ? "Close media picker" : value ? "Replace attachment" : label}
    </button>
    {open && <div className="admin-media-tools">
      <label className="admin-label">From the media library
        <select className="admin-input" value={selected} onChange={(event)=>setSelected(event.target.value)}>
          <option value="">Select a file</option>
          {matched.map(item=><option key={item.url} value={item.url}>{item.name}</option>)}
        </select>
      </label>
      {active && <div className="admin-media-current">
        {type==="image" && <img src={active.url} alt={active.alt || ""} />}
        <button type="button" className="admin-button" onClick={()=>{onSelect(active);setOpen(false);}}>Use selected file</button>
      </div>}
      <label className="admin-label">Upload {type==="image" ? "an image" : "a PDF"}
        <input className="admin-input" type="file" accept={type==="image" ? "image/png,image/jpeg,image/webp":"application/pdf"} onChange={event=>setFile(event.target.files?.[0] || null)} />
      </label>
      {file && <p>{file.name} · {Math.ceil(file.size/1024)} KB</p>}
      {type==="image" && <label className="admin-label">Alternative text<input className="admin-input" maxLength={300} value={alt} onChange={event=>setAlt(event.target.value)} /></label>}
      <button type="button" disabled={!file || !!state} className="admin-button" onClick={upload}>Upload and use</button>
      {state && <p role="status">{state}</p>}
      {error && <p role="alert">{error}</p>}
    </div>}
  </div>;
}
