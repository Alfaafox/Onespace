"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Clock, Download, ExternalLink, FileText,
  Pencil, Upload, X, User, Calendar, ChevronDown,
  ChevronUp, Trash2, AlertCircle,
} from "lucide-react";

const RichTextEditor = dynamic(() => import("../../../components/RichTextEditor"), { ssr: false });

const DARK = { bg:"#0d0f18", card:"#1a1d2e", border:"#252840", text:"#e2e8f0", muted:"#8892a4", hint:"#55607a", input:"#1e2235", topbar:"#12151f" };
const LIGHT = { bg:"#f4f6fb", card:"#ffffff", border:"#e8edf3", text:"#111827", muted:"#64748b", hint:"#94a3b8", input:"#f8fafc", topbar:"#ffffff" };

interface PageData {
  id:number; title:string; content:string; workspace_id:number;
  created_at:string; updated_at:string; creator_name:string;
}
interface Attachment {
  id:number; file_name:string; file_path:string; file_type:string; uploaded_at:string;
}

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g,"").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });
}

function renderContent(content: string): string {
  if (!content) return "<p style='color:#94a3b8;font-style:italic;'>No content yet. Click Edit Page to add content.</p>";
  if (content.trim().startsWith("<")) return content;
  return content.split("\n\n").map(p => `<p>${p.replace(/\n/g,"<br/>")}</p>`).join("");
}

const fileIcon = (type: string) => {
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("text")) return "📝";
  if (type.includes("zip")||type.includes("archive")) return "📦";
  if (type.includes("spreadsheet")||type.includes("excel")) return "📊";
  return "📎";
};

export default function PageView() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id;

  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState<PageData | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachOpen, setAttachOpen] = useState(true);
  const [deletingAttachId, setDeletingAttachId] = useState<number | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const C = isDark ? DARK : LIGHT;

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    const token = localStorage.getItem("token");
    if (token) document.cookie = `auth_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
    if (pageId) { fetchPage(); fetchAttachments(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  useEffect(() => {
    if (page) { setEditTitle(page.title || ""); setEditContent(page.content || ""); }
  }, [page]);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const fetchPage = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/pages/${pageId}`, { headers: authHeaders() });
      setPage(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAttachments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/attachments/page/${pageId}`, { headers: authHeaders() });
      setAttachments(res.data);
    } catch (err) { console.error(err); }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/uploads/${filePath}`,
        {
          responseType: "blob",
          headers: authHeaders(),
        }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
    e.target.value = "";
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      setUploadProgress(0);
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("page_id", String(pageId));
        await axios.post("http://localhost:5000/attachments/upload", formData, {
          headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
        });
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      setSelectedFiles([]);
      setUploadProgress(0);
      fetchAttachments();
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const deleteAttachment = async (id: number, fileName: string) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      setDeletingAttachId(id);
      await axios.delete(`http://localhost:5000/attachments/${id}`, { headers: authHeaders() });
      setAttachments(p => p.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to delete file");
    } finally { setDeletingAttachId(null); }
  };

  const savePage = async () => {
    if (!pageId) return;
    try {
      setSavingPage(true);
      await axios.put(`http://localhost:5000/pages/${pageId}`,
        { title: editTitle.trim() || page?.title, content: editContent },
        { headers: authHeaders() }
      );
      setPage(prev => prev ? { ...prev, title: editTitle.trim() || prev.title, content: editContent } : prev);
      setShowEditModal(false);
    } catch (err) { console.error(err); }
    finally { setSavingPage(false); }
  };

  const deletePage = async () => {
    if (!pageId) return;
    try {
      setDeletingPage(true);
      const res = await axios.delete(`http://localhost:5000/pages/${pageId}`, { headers: authHeaders() });
      router.push(`/dashboard?workspace=${res.data.workspace_id || page?.workspace_id}`);
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to delete page");
      setDeletingPage(false);
    }
  };

  const readTime = page ? estimateReadTime(page.content) : 0;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui, sans-serif", transition:"background 0.2s,color 0.2s" }}>
      <style>{`
        .page-content h1{font-size:1.9rem;font-weight:800;margin:1.2rem 0 0.5rem;line-height:1.2;color:${C.text}}
        .page-content h2{font-size:1.45rem;font-weight:700;margin:1rem 0 0.4rem;line-height:1.3;color:${C.text}}
        .page-content h3{font-size:1.2rem;font-weight:600;margin:0.8rem 0 0.35rem;color:${C.text}}
        .page-content p{margin:0 0 0.7rem;line-height:1.75;color:${C.text}}
        .page-content ul{list-style:disc;padding-left:1.5rem;margin-bottom:0.7rem;color:${C.text}}
        .page-content ol{list-style:decimal;padding-left:1.5rem;margin-bottom:0.7rem;color:${C.text}}
        .page-content li{margin-bottom:0.25rem;line-height:1.65}
        .page-content code:not(pre code){background:rgba(124,58,237,0.12);color:#7c3aed;padding:0.15em 0.4em;border-radius:4px;font-family:monospace;font-size:0.875em}
        .page-content pre{background:#1e1e2e;color:#cdd6f4;padding:1.2rem;border-radius:12px;overflow-x:auto;margin:0.75rem 0;font-family:monospace;font-size:0.875em;line-height:1.65}
        .page-content pre code{background:none;color:inherit;padding:0}
        .page-content blockquote{border-left:3px solid #7c3aed;padding:0.3rem 0 0.3rem 1.2rem;color:${C.muted};font-style:italic;margin:0.6rem 0}
        .page-content hr{border:none;border-top:1px solid ${C.border};margin:1.2rem 0}
        .page-content img{max-width:100%;border-radius:10px;margin:0.6rem 0;display:block;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
        .page-content table{border-collapse:collapse;width:100%;margin:0.75rem 0}
        .page-content table td,.page-content table th{border:1px solid ${C.border};padding:10px 14px;font-size:0.9rem}
        .page-content table th{background:${isDark?"#1e2235":"#f3f4f6"};font-weight:600;color:${isDark?"#a5b4fc":"#374151"}}
        .page-content a{color:#7c3aed;text-decoration:underline}
        .attach-row:hover{border-color:rgba(124,58,237,0.4) !important;background:${isDark?"rgba(30,34,53,0.8)":"#f5f3ff"} !important;}
      `}</style>

      {/* Topbar */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.topbar, borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", height:"60px", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => router.push("/dashboard")}
            style={{ display:"flex", alignItems:"center", gap:"6px", color:C.muted, background:"none", border:"none", cursor:"pointer", fontSize:"13.5px", padding:0 }}>
            <ArrowLeft size={15}/> Back to Dashboard
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <button onClick={() => setIsDark(d => { localStorage.setItem("theme",!d?"dark":"light"); return !d; })}
              style={{ width:"32px", height:"32px", borderRadius:"8px", border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>
              {isDark?"☀️":"🌙"}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ height:"36px", padding:"0 14px", borderRadius:"10px", border:"1px solid rgba(239,68,68,0.3)", background:isDark?"rgba(239,68,68,0.1)":"rgba(239,68,68,0.05)", color:"#ef4444", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", gap:"5px" }}>
              <Trash2 size={13}/> Delete Page
            </button>
            <button onClick={() => setShowEditModal(true)}
              style={{ height:"36px", padding:"0 16px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"6px" }}>
              <Pencil size={13}/> Edit Page
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 24px", display:"flex", gap:"24px", alignItems:"flex-start" }}>

        {/* Content column */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Page header */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", padding:"32px 36px", marginBottom:"20px" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(124,58,237,0.1)", color:"#7c3aed", borderRadius:"20px", padding:"4px 12px", fontSize:"11px", fontWeight:700, letterSpacing:"0.05em", marginBottom:"16px" }}>
              <FileText size={11}/> DOCUMENT SPACE
            </div>
            <h1 style={{ fontSize:"28px", fontWeight:800, color:isDark?"#a78bfa":C.text, margin:"0 0 20px", textAlign:"center", letterSpacing:"-0.5px", lineHeight:1.2 }}>
              {page?.title || "Loading…"}
            </h1>
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:"16px", color:C.muted, fontSize:"13px", paddingTop:"16px", borderTop:`1px solid ${C.border}` }}>
              <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <User size={13}/>{page?.creator_name ? `By ${page.creator_name}` : "OneSpace User"}
              </span>
              <span style={{ color:C.hint }}>•</span>
              <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <Calendar size={13}/>Created {formatDate(page?.created_at || "")}
              </span>
              {page?.updated_at && page.updated_at !== page.created_at && (
                <>
                  <span style={{ color:C.hint }}>•</span>
                  <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <Clock size={13}/>Edited {formatDate(page.updated_at)}
                  </span>
                </>
              )}
              <span style={{ color:C.hint }}>•</span>
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", padding:"32px 36px", minHeight:"300px" }}>
            <div className="page-content" dangerouslySetInnerHTML={{ __html: renderContent(page?.content || "") }}/>
          </div>
        </div>

        {/* ── ATTACHMENTS SIDEBAR ── */}
        <div style={{ width:"300px", flexShrink:0, position:"sticky", top:"80px" }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", overflow:"hidden" }}>

            {/* Header */}
            <button onClick={() => setAttachOpen(!attachOpen)}
              style={{ width:"100%", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", borderBottom:attachOpen?`1px solid ${C.border}`:"none", cursor:"pointer", color:C.text }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"14px" }}>📎</span>
                <span style={{ fontSize:"14px", fontWeight:600 }}>Attachments</span>
                <span style={{ background:"rgba(124,58,237,0.1)", color:"#7c3aed", borderRadius:"10px", padding:"1px 8px", fontSize:"11px", fontWeight:600 }}>
                  {attachments.length}
                </span>
              </div>
              {attachOpen ? <ChevronUp size={15} style={{ color:C.hint }}/> : <ChevronDown size={15} style={{ color:C.hint }}/>} 
            </button>

            {attachOpen && (
              <div style={{ padding:"16px" }}>

                {/* ── UPLOAD SECTION — multiple files ── */}
                <div style={{ marginBottom:"14px" }}>
                  <div
                    style={{ border:`1.5px dashed ${selectedFiles.length > 0 ? "#7c3aed" : C.border}`, borderRadius:"12px", padding:"14px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:selectedFiles.length > 0 ? (isDark?"rgba(124,58,237,0.08)":"rgba(124,58,237,0.04)") : "transparent" }}
                    onClick={() => document.getElementById("file-input-multi")?.click()}>
                    <Upload size={20} style={{ color:selectedFiles.length > 0 ? "#7c3aed" : C.hint, margin:"0 auto 6px", display:"block" }}/>
                    {selectedFiles.length === 0 ? (
                      <>
                        <p style={{ color:C.muted, fontSize:"12px", margin:"0 0 2px", fontWeight:500 }}>Click to choose files</p>
                        <p style={{ color:C.hint, fontSize:"11px", margin:0 }}>Multiple files supported</p>
                      </>
                    ) : (
                      <>
                        <p style={{ color:"#7c3aed", fontSize:"12px", margin:"0 0 2px", fontWeight:600 }}>
                          {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                        <p style={{ color:C.hint, fontSize:"11px", margin:0 }}>
                          {selectedFiles.map(f => f.name).join(", ").substring(0, 50)}{selectedFiles.map(f => f.name).join(", ").length > 50 ? "…" : ""}
                        </p>
                      </>
                    )}
                    <input
                      id="file-input-multi"
                      type="file"
                      multiple
                      style={{ display:"none" }}
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Upload progress */}
                  {uploading && (
                    <div style={{ marginTop:"8px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                        <span style={{ color:C.muted, fontSize:"11px" }}>Uploading…</span>
                        <span style={{ color:"#7c3aed", fontSize:"11px", fontWeight:600 }}>{uploadProgress}%</span>
                      </div>
                      <div style={{ height:"4px", background:isDark?"#252840":"#e5e7eb", borderRadius:"2px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${uploadProgress}%`, background:"linear-gradient(90deg,#4f46e5,#7c3aed)", borderRadius:"2px", transition:"width 0.3s" }}/>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {selectedFiles.length > 0 && !uploading && (
                    <div style={{ display:"flex", gap:"6px", marginTop:"8px" }}>
                      <button onClick={uploadFiles}
                        style={{ flex:1, height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600 }}>
                        Upload {selectedFiles.length > 1 ? `${selectedFiles.length} files` : "file"}
                      </button>
                      <button onClick={() => setSelectedFiles([])}
                        style={{ width:"32px", height:"32px", borderRadius:"8px", border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>
                        <X size={13}/>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── FILE LIST ── */}
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {attachments.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"20px 0", color:C.hint, fontSize:"12px" }}>
                      No attachments yet
                    </div>
                  ) : (
                    attachments.map(file => (
                      <div key={file.id} className="attach-row"
                        style={{ background:isDark?"rgba(30,34,53,0.5)":"#fafafa", border:`1px solid ${C.border}`, borderRadius:"10px", padding:"10px 12px", transition:"all 0.15s" }}>
                        {/* File info */}
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                          <span style={{ fontSize:"18px", flexShrink:0 }}>{fileIcon(file.file_type)}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ color:C.text, fontSize:"12px", fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{file.file_name}</p>
                            <p style={{ color:C.hint, fontSize:"10.5px", margin:0 }}>{file.file_type.split("/")[1]?.toUpperCase()}</p>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div style={{ display:"flex", gap:"4px" }}>
                          <a href={`http://localhost:5000/uploads/${file.file_path}`} target="_blank" rel="noreferrer"
                            style={{ flex:1, height:"26px", borderRadius:"6px", border:`1px solid ${C.border}`, background:C.card, color:C.muted, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px", fontSize:"11px" }}>
                            <ExternalLink size={10}/> Open
                          </a>
                          <button
                            onClick={() => downloadFile(file.file_path, file.file_name)}
                            style={{ flex:1, height:"26px", borderRadius:"6px", border:"none", background:"rgba(124,58,237,0.12)", color:"#7c3aed", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"4px", fontSize:"11px", fontWeight:600 }}>
                            <Download size={10}/> Save
                            </button>
                          <button
                            onClick={() => deleteAttachment(file.id, file.file_name)}
                            disabled={deletingAttachId === file.id}
                            style={{ width:"26px", height:"26px", borderRadius:"6px", border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.05)", color:"#ef4444", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:deletingAttachId===file.id?0.5:1 }}>
                            <Trash2 size={10}/>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {showEditModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", zIndex:60, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px", overflowY:"auto" }}>
          <div style={{ background:isDark?"#12151f":"#ffffff", borderRadius:"20px", border:`1px solid ${C.border}`, width:"100%", maxWidth:"860px", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.4)" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ color:C.text, fontSize:"17px", fontWeight:700, margin:0 }}>Edit Page</h3>
              <button onClick={() => setShowEditModal(false)}
                style={{ width:"32px", height:"32px", borderRadius:"8px", border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>
                <X size={15}/>
              </button>
            </div>
            <div style={{ padding:"24px" }}>
              <div style={{ marginBottom:"16px" }}>
                <label style={{ display:"block", fontSize:"12.5px", fontWeight:600, color:C.muted, marginBottom:"6px" }}>Page Title</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  style={{ width:"100%", height:"44px", borderRadius:"10px", border:`1px solid ${C.border}`, background:isDark?"#1e2235":C.input, color:C.text, fontSize:"15px", padding:"0 14px", outline:"none", boxSizing:"border-box", fontWeight:600 }}/>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"12.5px", fontWeight:600, color:C.muted, marginBottom:"8px" }}>Content</label>
                <RichTextEditor content={editContent} onChange={setEditContent} isDark={isDark} minHeight="380px"/>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"20px" }}>
                <button onClick={() => setShowEditModal(false)}
                  style={{ height:"40px", padding:"0 18px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.card, color:C.muted, cursor:"pointer", fontSize:"13px" }}>
                  Cancel
                </button>
                <button onClick={savePage} disabled={savingPage}
                  style={{ height:"40px", padding:"0 20px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, opacity:savingPage?0.6:1 }}>
                  {savingPage?"Saving…":"Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE PAGE CONFIRM ── */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", zIndex:60, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:isDark?"#1a1d2e":"#ffffff", borderRadius:"20px", border:`1px solid ${C.border}`, padding:"28px", maxWidth:"400px", width:"100%", textAlign:"center" }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"rgba(239,68,68,0.15)", border:"2px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Trash2 size={22} color="#ef4444"/>
            </div>
            <h3 style={{ color:C.text, fontSize:"17px", fontWeight:700, margin:"0 0 8px" }}>Delete Page?</h3>
            <p style={{ color:C.muted, fontSize:"13px", margin:"0 0 24px", lineHeight:1.5 }}>
              This will permanently delete &ldquo;{page?.title}&rdquo; and all its attachments. This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ height:"40px", padding:"0 20px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.card, color:C.muted, cursor:"pointer", fontSize:"13px" }}>
                Cancel
              </button>
              <button onClick={deletePage} disabled={deletingPage}
                style={{ height:"40px", padding:"0 20px", borderRadius:"10px", background:"#ef4444", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, opacity:deletingPage?0.6:1 }}>
                {deletingPage?"Deleting…":"Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
