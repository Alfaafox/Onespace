"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface Props {
  content: string;
  onChange: (html: string) => void;
  isDark?: boolean;
  minHeight?: string;
}

export default function RichTextEditor({ content, onChange, isDark = false, minHeight = "300px" }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const border = isDark ? "#252840" : "#e5e7eb";
  const bg = isDark ? "#1a1d2e" : "#ffffff";
  const toolbarBg = isDark ? "#12151f" : "#f9fafb";
  const textColor = isDark ? "#e2e8f0" : "#111827";
  const mutedColor = isDark ? "#55607a" : "#9ca3af";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Image.configure({ inline: false, allowBase64: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content",
        style: `min-height:${minHeight};outline:none;padding:16px 20px;color:${textColor};`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content || "", false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = ev => {
      editor.chain().focus().setImage({ src: ev.target?.result as string }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const TB = ({ onClick, active, title, children }: { onClick:()=>void; active?:boolean; title?:string; children:React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title}
      style={{ width:"28px", height:"28px", borderRadius:"6px", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:600, transition:"all 0.15s",
        background: active ? "#7c3aed" : "transparent",
        color: active ? "white" : isDark ? "#8892a4" : "#6b7280",
      }}
      onMouseEnter={e=>{if(!active)(e.target as HTMLElement).style.background=isDark?"#2d3348":"#f3f4f6"}}
      onMouseLeave={e=>{if(!active)(e.target as HTMLElement).style.background="transparent"}}>
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        .rte-content h1{font-size:1.8rem;font-weight:700;margin:0.8rem 0 0.4rem;line-height:1.2}
        .rte-content h2{font-size:1.4rem;font-weight:700;margin:0.7rem 0 0.35rem;line-height:1.3}
        .rte-content h3{font-size:1.15rem;font-weight:600;margin:0.6rem 0 0.3rem;line-height:1.3}
        .rte-content p{margin:0 0 0.6rem;line-height:1.7}
        .rte-content ul{list-style:disc;padding-left:1.5rem;margin-bottom:0.6rem}
        .rte-content ol{list-style:decimal;padding-left:1.5rem;margin-bottom:0.6rem}
        .rte-content li{margin-bottom:0.2rem;line-height:1.6}
        .rte-content code:not(pre code){background:rgba(124,58,237,0.12);color:#7c3aed;padding:0.15em 0.4em;border-radius:4px;font-family:monospace;font-size:0.875em}
        .rte-content pre{background:#1e1e2e;color:#cdd6f4;padding:1rem;border-radius:10px;overflow-x:auto;margin:0.6rem 0;font-family:'Fira Code',monospace;font-size:0.875em;line-height:1.6}
        .rte-content pre code{background:none;color:inherit;padding:0}
        .rte-content blockquote{border-left:3px solid #7c3aed;padding:0.2rem 0 0.2rem 1rem;color:${isDark?"#8892a4":"#6b7280"};font-style:italic;margin:0.5rem 0}
        .rte-content hr{border:none;border-top:1px solid ${isDark?"#252840":"#e5e7eb"};margin:1rem 0}
        .rte-content img{max-width:100%;border-radius:8px;margin:0.5rem 0;display:block}
        .rte-content table{border-collapse:collapse;width:100%;margin:0.6rem 0}
        .rte-content table td,.rte-content table th{border:1px solid ${isDark?"#2d3348":"#e5e7eb"};padding:8px 12px;font-size:0.9rem}
        .rte-content table th{background:${isDark?"#1e2235":"#f3f4f6"};font-weight:600;color:${isDark?"#a5b4fc":"#374151"}}
        .rte-content .selectedCell:after{background:rgba(124,58,237,0.15);content:"";position:absolute;inset:0;pointer-events:none;z-index:2}
        .hljs-keyword,.hljs-selector-tag{color:#cba6f7}
        .hljs-string,.hljs-attr{color:#a6e3a1}
        .hljs-number{color:#fab387}
        .hljs-comment{color:#6c7086;font-style:italic}
        .hljs-title,.hljs-function{color:#89b4fa}
        .hljs-variable,.hljs-params{color:#cdd6f4}
        .hljs-built_in{color:#f38ba8}
        .hljs-tag{color:#f38ba8}
        .hljs-attribute{color:#89dceb}
        .hljs-meta{color:#f9e2af}
      `}</style>

      <div style={{ borderRadius:"12px", overflow:"hidden", border:`1px solid ${border}` }}>
        {/* Toolbar */}
        <div style={{ background:toolbarBg, borderBottom:`1px solid ${border}`, padding:"6px 8px", display:"flex", flexWrap:"wrap", alignItems:"center", gap:"2px" }}>

          {/* Heading select */}
          <select onChange={e=>{
            const v = e.target.value;
            if(v==="p") editor?.chain().focus().setParagraph().run();
            else editor?.chain().focus().setHeading({level:parseInt(v) as 1|2|3}).run();
            e.target.value="p";
          }} style={{ height:"26px", borderRadius:"6px", border:`1px solid ${border}`, background:toolbarBg, color:isDark?"#8892a4":"#6b7280", fontSize:"12px", cursor:"pointer", padding:"0 6px", marginRight:"4px", outline:"none" }}>
            <option value="p">Normal</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          <TB onClick={()=>editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold"><strong>B</strong></TB>
          <TB onClick={()=>editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic"><em>I</em></TB>
          <TB onClick={()=>editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Strikethrough"><span style={{textDecoration:"line-through"}}>S</span></TB>
          <TB onClick={()=>editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} title="Inline code"><span style={{fontFamily:"monospace"}}>`</span></TB>

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          <TB onClick={()=>editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">• ≡</TB>
          <TB onClick={()=>editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Numbered list">1≡</TB>

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          <TB onClick={()=>editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote">❝</TB>
          <TB onClick={()=>editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive("codeBlock")} title="Code block">
            <span style={{fontFamily:"monospace",fontSize:"11px"}}>{`</>`}</span>
          </TB>
          <TB onClick={()=>editor?.chain().focus().setHorizontalRule().run()} title="Divider">—</TB>

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          {/* Table */}
          <TB onClick={()=>editor?.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()} title="Insert table">⊞</TB>
          {editor?.isActive("table") && (
            <>
              <TB onClick={()=>editor.chain().focus().addColumnAfter().run()} title="Add column">+col</TB>
              <TB onClick={()=>editor.chain().focus().addRowAfter().run()} title="Add row">+row</TB>
              <TB onClick={()=>editor.chain().focus().deleteColumn().run()} title="Delete column">-col</TB>
              <TB onClick={()=>editor.chain().focus().deleteRow().run()} title="Delete row">-row</TB>
              <TB onClick={()=>editor.chain().focus().deleteTable().run()} title="Delete table">🗑</TB>
            </>
          )}

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          {/* Image */}
          <TB onClick={()=>imageInputRef.current?.click()} title="Insert image">🖼</TB>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFile} style={{display:"none"}}/>

          <div style={{ width:"1px", height:"20px", background:border, margin:"0 4px" }}/>

          {/* Undo/Redo */}
          <TB onClick={()=>editor?.chain().focus().undo().run()} title="Undo">↩</TB>
          <TB onClick={()=>editor?.chain().focus().redo().run()} title="Redo">↪</TB>
        </div>

        {/* Editor content */}
        <div style={{ background:bg }}>
          <EditorContent editor={editor}/>
        </div>
      </div>
    </>
  );
}
