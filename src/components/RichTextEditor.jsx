import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { sanitizeRichText } from "../richText.js";
import MediaPicker from "./MediaPicker.jsx";

const LibraryImage = Image.extend({
  parseHTML() {
    return [{ tag: 'img[src^="/media/"]' }];
  },
});
const extensions = [
  StarterKit.configure({ code: false, codeBlock: false, link: {
    openOnClick: false,
    defaultProtocol: "https",
    isAllowedUri: (url) => /^https:\/\/[^\s<>"]+$/i.test(url),
  } }),
  LibraryImage,
];

export function paragraphsFromText(value) {
  const escape = (text) => text.replace(/[&<>]/g, (symbol) => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[symbol]));
  return value ? value.split(/\n\s*\n/).map((paragraph) => "<p>" + escape(paragraph).replaceAll("\n","<br>") + "</p>").join("") : "";
}

export default function RichTextEditor({ value, onChange, label = "Article text", uploadTransport, mediaEnabled }) {
  const latest = useRef(value);
  const [preview, setPreview] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [image, setImage] = useState(false);
  const editor = useEditor({
    extensions,
    content: value,
    editorProps: { attributes: { class: "admin-rich-document m-rich", role: "textbox", "aria-label": label, "aria-multiline": "true" } },
    onUpdate({editor}) {
      latest.current = editor.isEmpty ? "" : editor.getHTML();
      const words = editor.getText().trim().split(/\s+/u).filter(Boolean).length;
      onChange(latest.current, words);
    },
  });
  useEffect(() => {
    if (editor && latest.current !== value) {
      latest.current = value;
      editor.commands.setContent(value, {emitUpdate:false});
    }
  }, [editor, value]);
  const state = useEditorState({editor,selector:({editor}) => {
    if (!editor) return null;
    return {
      words: editor.getText().trim().split(/\s+/u).filter(Boolean).length,
      heading: [1,2,3,4,5,6].find((level)=>editor.isActive("heading",{level})) || 0,
      marks: ["bold","italic","underline","bulletList","orderedList","blockquote"].map((mark)=>editor.isActive(mark)),
      undo:editor.can().undo(), redo:editor.can().redo(),
    };
  }});
  if (!editor || !state) return <p>Loading editor…</p>;
  const formats = [["Bold","toggleBold"],["Italic","toggleItalic"],["Underline","toggleUnderline"],
    ["Bullet list","toggleBulletList"],["Numbered list","toggleOrderedList"],["Quote","toggleBlockquote"]];
  function saveLink() {
    const address = link.trim();
    if (address && !/^https:\/\/[^\s<>"]+$/i.test(address)) {
      setLinkError("Enter a full link starting with https://.");
      return;
    }
    const chain = editor.chain().focus().extendMarkRange("link");
    if (address) chain.setLink({href:address}).run(); else chain.unsetLink().run();
    setEditingLink(false);
  }
  return <div className="admin-rich-editor">
    <div className="admin-rich-toolbar" role="group" aria-label="Text formatting">
      <select className="admin-button" aria-label="Paragraph style" value={state.heading} onChange={(event)=>{
        const level = Number(event.target.value);
        const chain = editor.chain().focus();
        if (level) chain.setHeading({level}).run(); else chain.setParagraph().run();
      }}>
        <option value="0">Paragraph</option>
        {[1,2,3,4,5,6].map((level)=><option key={level} value={level}>Heading {level}</option>)}
      </select>
      {formats.map(([name,method],index)=><button type="button" key={name} className="admin-button" aria-pressed={state.marks[index]} onClick={()=>editor.chain().focus()[method]().run()}>{name}</button>)}
      <button type="button" className="admin-button" onClick={()=>{
        setLink(editor.getAttributes("link").href || "");setLinkError("");setEditingLink(!editingLink);
      }}>Link</button>
      {mediaEnabled && <button type="button" className="admin-button" onClick={()=>setImage(!image)}>Insert image</button>}
      <button type="button" className="admin-button" disabled={!state.undo} onClick={()=>editor.chain().focus().undo().run()}>Undo</button>
      <button type="button" className="admin-button" disabled={!state.redo} onClick={()=>editor.chain().focus().redo().run()}>Redo</button>
      <button type="button" className="admin-button" onClick={()=>editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear formatting</button>
      <button type="button" className="admin-button" aria-pressed={preview} onClick={()=>setPreview(!preview)}>Preview</button>
    </div>
    {editingLink && <div className="admin-inline-tools">
      <label className="admin-label">Link address<input type="url" className="admin-input" value={link} onChange={(event)=>setLink(event.target.value)} /></label>
      <button type="button" className="admin-button" onClick={saveLink}>Apply link</button>
      {linkError && <p role="alert">{linkError}</p>}
    </div>}
    {image && <MediaPicker type="image" uploadTransport={uploadTransport} onSelect={(item)=>{
      editor.chain().focus().setImage({src:item.url,alt:item.alt || ""}).run();
      setImage(false);
    }} initiallyOpen />}
    {preview ? <div aria-label="Article preview" className="admin-rich-document m-rich" dangerouslySetInnerHTML={{__html:sanitizeRichText(value)}} /> : <EditorContent editor={editor} />}
    <div className="admin-rich-count">{state.words} {state.words === 1 ? "word" : "words"} · {state.words ? Math.ceil(state.words/220) : 0} min read</div>
  </div>;
}
