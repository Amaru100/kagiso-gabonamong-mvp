import { useRef, useState } from "react";
import { sanitizeRichText } from "../richText.js";

const formats = [["Paragraph","p"],["Heading","h3"],["Quote","blockquote"],["Bold","strong"],["Emphasis","em"],["List","ul"],["Numbered list","ol"]];

export default function RichTextEditor({value,onChange}) {
  const field = useRef(null);
  const [preview,setPreview] = useState(false);
  function format(tag) {
    const {selectionStart:start,selectionEnd:end} = field.current;
    const text = value.slice(start,end);
    const inner = ["ul","ol"].includes(tag) ? text.split("\n").map((line)=>"<li>"+line+"</li>").join("") : text;
    onChange(value.slice(0,start)+"<"+tag+">"+inner+"</"+tag+">"+value.slice(end));
    field.current.focus();
  }
  return <div className="grid gap-2">
    <div className="flex flex-wrap gap-2">
      {formats.map(([label,tag])=><button type="button" className="admin-button" key={tag} onClick={()=>format(tag)}>{label}</button>)}
      <button type="button" className="admin-button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>Preview</button>
    </div>
    <textarea ref={field} aria-label="Rich article content" className="admin-input" rows={12} value={value} onChange={(event)=>onChange(event.target.value)} />
    {preview && <div className="m-rich" dangerouslySetInnerHTML={{__html:sanitizeRichText(value)}} />}
  </div>;
}
