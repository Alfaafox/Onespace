"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell, ChevronDown, FileText, LogOut, Pencil,
  Plus, Search, Settings, Share2, X, Users,
  Moon, Sun, UserPlus, Check,
} from "lucide-react";

const LIGHT = {
  bg:"bg-[#f4f6fb]", sidebar:"bg-white", card:"bg-white", border:"border-[#e8edf3]",
  text:"text-[#111827]", muted:"text-[#64748b]", hint:"text-[#94a3b8]",
  hover:"hover:bg-[#f5f7fb]", input:"bg-[#f8fafc] border-[#e5e7eb] text-[#111827]",
  modal:"bg-white", topbar:"bg-white border-[#e8edf3]", searchbg:"bg-[#f8fafc]",
};
const DARK = {
  bg:"bg-[#0d0f18]", sidebar:"bg-[#12151f]", card:"bg-[#1a1d2e]", border:"border-[#252840]",
  text:"text-[#e2e8f0]", muted:"text-[#8892a4]", hint:"text-[#55607a]",
  hover:"hover:bg-[#1e2235]", input:"bg-[#1e2235] border-[#2d3348] text-[#e2e8f0]",
  modal:"bg-[#1a1d2e]", topbar:"bg-[#12151f] border-[#252840]", searchbg:"bg-[#1e2235]",
};

const IMAGE_WALLPAPERS = [
  { id:"BlackSand",          name:"Black Sand",     style:{ backgroundImage:"url('/themes/BlackSand.png')",          backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Deepthought",        name:"Deep Thought",   style:{ backgroundImage:"url('/themes/Deepthought.png')",        backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Divingin",           name:"Diving In",      style:{ backgroundImage:"url('/themes/Divingin.png')",           backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Epic",               name:"Epic",           style:{ backgroundImage:"url('/themes/Epic.png')",               backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"longraod",           name:"Long Road",      style:{ backgroundImage:"url('/themes/longraod.png')",           backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"midconfusion",       name:"Mid Confusion",  style:{ backgroundImage:"url('/themes/midconfusion.png')",       backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Morningcool",        name:"Morning Cool",   style:{ backgroundImage:"url('/themes/Morningcool.png')",        backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Thoughtconsistency", name:"Consistency",    style:{ backgroundImage:"url('/themes/Thoughtconsistency.png')", backgroundSize:"cover", backgroundPosition:"center" } },
  { id:"Workedit",           name:"Work Edit",      style:{ backgroundImage:"url('/themes/Workedit.png')",           backgroundSize:"cover", backgroundPosition:"center" } },
];

const GRADIENT_WALLPAPERS = [
  { id:"mesh-violet",  name:"Violet Mesh",  style:{ background:"linear-gradient(135deg,#4f46e5 0%,#7c3aed 40%,#a855f7 100%)" } },
  { id:"ocean-blue",   name:"Ocean Blue",   style:{ background:"linear-gradient(135deg,#1e40af 0%,#0ea5e9 60%,#38bdf8 100%)" } },
  { id:"midnight",     name:"Midnight",     style:{ background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)" } },
  { id:"aurora",       name:"Aurora",       style:{ background:"linear-gradient(135deg,#0f766e 0%,#0891b2 50%,#6366f1 100%)" } },
  { id:"sunset",       name:"Sunset",       style:{ background:"linear-gradient(135deg,#dc2626 0%,#ea580c 40%,#f59e0b 100%)" } },
  { id:"rose-gold",    name:"Rose Gold",    style:{ background:"linear-gradient(135deg,#9f1239 0%,#e11d48 50%,#fb7185 100%)" } },
  { id:"forest",       name:"Forest",       style:{ background:"linear-gradient(135deg,#14532d 0%,#16a34a 50%,#4ade80 100%)" } },
  { id:"deep-space",   name:"Deep Space",   style:{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)" } },
  { id:"teal-cyan",    name:"Teal",         style:{ background:"linear-gradient(135deg,#134e4a 0%,#0d9488 50%,#2dd4bf 100%)" } },
  { id:"lavender",     name:"Lavender",     style:{ background:"linear-gradient(135deg,#5b21b6 0%,#8b5cf6 50%,#c4b5fd 100%)" } },
  { id:"coral",        name:"Coral",        style:{ background:"linear-gradient(135deg,#7f1d1d 0%,#ef4444 50%,#fb923c 100%)" } },
  { id:"peach",        name:"Peach",        style:{ background:"linear-gradient(135deg,#7c3aed 0%,#db2777 50%,#fb923c 100%)" } },
];

const ALL_WALLPAPERS = [...IMAGE_WALLPAPERS, ...GRADIENT_WALLPAPERS];

const getWallpaperStyle = (id: string) =>
  ALL_WALLPAPERS.find(w => w.id === id)?.style || GRADIENT_WALLPAPERS[0].style;

const SPACE_ICONS = [
  { emoji:"💻", label:"IT",           bg:"linear-gradient(135deg,#0284c7,#0ea5e9)" },
  { emoji:"🔄", label:"DevOps",       bg:"linear-gradient(135deg,#ea580c,#f59e0b)" },
  { emoji:"🛡️", label:"Compliance",  bg:"linear-gradient(135deg,#1d4ed8,#3b82f6)" },
  { emoji:"🎓", label:"L&D",          bg:"linear-gradient(135deg,#7c3aed,#a855f7)" },
  { emoji:"👥", label:"HR",           bg:"linear-gradient(135deg,#db2777,#f472b6)" },
  { emoji:"💹", label:"Finance",      bg:"linear-gradient(135deg,#15803d,#4ade80)" },
  { emoji:"📋", label:"RMS",          bg:"linear-gradient(135deg,#b45309,#f59e0b)" },
  { emoji:"👨‍💻", label:"Dev Team",   bg:"linear-gradient(135deg,#4f46e5,#818cf8)" },
  { emoji:"📣", label:"Marketing",    bg:"linear-gradient(135deg,#c2410c,#fb923c)" },
  { emoji:"🔮", label:"Product",      bg:"linear-gradient(135deg,#6d28d9,#c084fc)" },
  { emoji:"🎨", label:"Design",       bg:"linear-gradient(135deg,#be185d,#f9a8d4)" },
  { emoji:"⚙️", label:"Operations",  bg:"linear-gradient(135deg,#374151,#9ca3af)" },
  { emoji:"🔐", label:"Security",     bg:"linear-gradient(135deg,#1e3a5f,#2563eb)" },
  { emoji:"📊", label:"Analytics",    bg:"linear-gradient(135deg,#0e7490,#22d3ee)" },
  { emoji:"🏗️", label:"Infra",       bg:"linear-gradient(135deg,#78350f,#d97706)" },
  { emoji:"☁️", label:"Cloud",        bg:"linear-gradient(135deg,#1e40af,#60a5fa)" },
  { emoji:"📁", label:"General",      bg:"linear-gradient(135deg,#4f46e5,#7c3aed)" },
  { emoji:"🚀", label:"Launch",       bg:"linear-gradient(135deg,#0f172a,#4338ca)" },
  { emoji:"🧪", label:"R&D",          bg:"linear-gradient(135deg,#065f46,#10b981)" },
  { emoji:"🌐", label:"Global",       bg:"linear-gradient(135deg,#1d4ed8,#0891b2)" },
  { emoji:"📱", label:"Mobile",       bg:"linear-gradient(135deg,#7c3aed,#db2777)" },
  { emoji:"🔬", label:"Science",      bg:"linear-gradient(135deg,#0f766e,#14b8a6)" },
  { emoji:"💡", label:"Innovation",   bg:"linear-gradient(135deg,#b45309,#fbbf24)" },
  { emoji:"🎯", label:"Strategy",     bg:"linear-gradient(135deg,#991b1b,#ef4444)" },
];

interface Workspace { id: number; name: string; description: string; }
interface Page { id: number; title: string; content: string; workspace_id: number; }
interface WorkspaceRole { workspace_id: number; role: string; }
interface SpacePref { wallpaper: string; icon: string | null; iconBg: string | null; }

const getInitials = (name: string) =>
  name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDark, setIsDark] = useState(false);
  const T = isDark ? DARK : LIGHT;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [workspaceRoles, setWorkspaceRoles] = useState<WorkspaceRole[]>([]);
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<number | null>(null);
  const [workspacePages, setWorkspacePages] = useState<Record<number, Page[]>>({});
  const [spacePrefs, setSpacePrefs] = useState<Record<number, SpacePref>>({});

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [spaceSearch, setSpaceSearch] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [editSpaceName, setEditSpaceName] = useState("");
  const [editSpaceDescription, setEditSpaceDescription] = useState("");
  const [editWallpaper, setEditWallpaper] = useState(GRADIENT_WALLPAPERS[0].id);
  const [editIconIndex, setEditIconIndex] = useState<number | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [savingSpace, setSavingSpace] = useState(false);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const getSpacePref = (id: number): SpacePref => {
    if (spacePrefs[id]) return spacePrefs[id];
    try {
      const s = localStorage.getItem(`space_pref_${id}`);
      if (s) return JSON.parse(s);
    } catch {}
    return { wallpaper: GRADIENT_WALLPAPERS[0].id, icon: null, iconBg: null };
  };

  const saveSpacePref = (id: number, pref: SpacePref) => {
    localStorage.setItem(`space_pref_${id}`, JSON.stringify(pref));
    setSpacePrefs(p => ({ ...p, [id]: pref }));
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    fetchWorkspaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    setIsDark(d => { localStorage.setItem("theme", !d ? "dark" : "light"); return !d; });
  };

  useEffect(() => {
    if (!selectedWorkspace) return;
    const pref = getSpacePref(selectedWorkspace.id);
    setEditSpaceName(selectedWorkspace.name);
    setEditSpaceDescription(selectedWorkspace.description);
    setEditWallpaper(pref.wallpaper);
    const idx = pref.icon ? SPACE_ICONS.findIndex(i => i.emoji === pref.icon) : null;
    setEditIconIndex(idx !== null && idx >= 0 ? idx : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace]);

  const currentRole = useMemo(() => {
    if (!selectedWorkspace) return "viewer";
    return workspaceRoles.find(r => r.workspace_id === selectedWorkspace.id)?.role || "viewer";
  }, [selectedWorkspace, workspaceRoles]);

  const canEdit = currentRole === "admin" || currentRole === "editor";

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get("http://192.168.11.69:5000/workspaces", { headers: authHeaders() });
      setWorkspaces(res.data);
      setWorkspaceRoles(res.data.map((w: Workspace) => ({ workspace_id: w.id, role: "admin" })));
      const qWs = searchParams.get("workspace");
      const target = (qWs ? res.data.find((w: Workspace) => String(w.id) === qWs) : null) || (res.data[0] || null);
      if (target) { setSelectedWorkspace(target); setExpandedWorkspaceId(target.id); fetchPages(target.id); }
    } catch (err) { console.error(err); }
  };

  const fetchPages = async (workspaceId: number) => {
    try {
      const res = await axios.get(`http://192.168.11.69:5000/pages/workspace/${workspaceId}`, { headers: authHeaders() });
      const data = Array.isArray(res.data) ? res.data : [];
      setPages(data);
      setWorkspacePages(p => ({ ...p, [workspaceId]: data }));
    } catch { setPages([]); }
  };

  const selectWorkspace = async (ws: Workspace) => {
    setSelectedWorkspace(ws); setExpandedWorkspaceId(ws.id); setSpaceSearch("");
    await fetchPages(ws.id);
  };

  const toggleExpand = async (ws: Workspace) => {
    if (expandedWorkspaceId === ws.id) { setExpandedWorkspaceId(null); return; }
    setExpandedWorkspaceId(ws.id); setSelectedWorkspace(ws);
    await fetchPages(ws.id);
  };

  const createWorkspace = async () => {
    if (!spaceName.trim()) return;
    try {
      setCreatingSpace(true);
      await axios.post("http://192.168.11.69:5000/workspaces",
        { name: spaceName.trim(), description: spaceDescription.trim() },
        { headers: authHeaders() }
      );
      setShowCreateSpaceModal(false); setSpaceName(""); setSpaceDescription("");
      fetchWorkspaces();
    } catch (err) { console.error(err); } finally { setCreatingSpace(false); }
  };

  const createPage = async () => {
    if (!selectedWorkspace || !pageTitle.trim()) return;
    try {
      setCreatingPage(true);
      await axios.post("http://192.168.11.69:5000/pages",
        { title: pageTitle.trim(), content: pageContent.trim(), workspace_id: selectedWorkspace.id, parent_page_id: null },
        { headers: authHeaders() }
      );
      setShowCreatePageModal(false); setPageTitle(""); setPageContent("");
      fetchPages(selectedWorkspace.id);
    } catch (err) { console.error(err); } finally { setCreatingPage(false); }
  };

  const saveWorkspace = async () => {
    if (!selectedWorkspace) return;
    const nextName = editSpaceName.trim() || selectedWorkspace.name;
    const nextDesc = editSpaceDescription.trim();
    const iconData = editIconIndex !== null ? SPACE_ICONS[editIconIndex] : null;
    try {
      setSavingSpace(true);
      await axios.put(`http://192.168.11.69:5000/workspaces/${selectedWorkspace.id}`,
        { name: nextName, description: nextDesc },
        { headers: authHeaders() }
      );
      saveSpacePref(selectedWorkspace.id, {
        wallpaper: editWallpaper,
        icon: iconData?.emoji || null,
        iconBg: iconData?.bg || null,
      });
    } catch (err) { console.error(err); } finally {
      setWorkspaces(p => p.map(w => w.id === selectedWorkspace.id ? { ...w, name: nextName, description: nextDesc } : w));
      setSelectedWorkspace(p => p ? { ...p, name: nextName, description: nextDesc } : p);
      setShowEditSpaceModal(false); setSavingSpace(false);
    }
  };

  const shareWorkspace = async () => {
    if (!selectedWorkspace) return;
    const url = `${window.location.origin}/dashboard?workspace=${selectedWorkspace.id}`;
    try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }
    catch { window.alert(`Copy this link:\n${url}`); }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !selectedWorkspace) return;
    try {
      setInviteLoading(true);
      setInviteResult(null);
      const res = await axios.post(
        `http://192.168.11.69:5000/workspaces/${selectedWorkspace.id}/invite`,
        { email: inviteEmail.trim(), role: inviteRole },
        { headers: authHeaders() }
      );
      setInviteResult({ type: "success", message: res.data.message });
      setInviteEmail("");
    } catch (err: any) {
      setInviteResult({ type: "error", message: err?.response?.data?.error || "Invite failed" });
    } finally {
      setInviteLoading(false);
    }
  };

  const logout = () => { localStorage.removeItem("token"); router.push("/login"); };

  const allPages = useMemo(() => Object.values(workspacePages).flat(), [workspacePages]);

  const globalSearch = useMemo(() => {
    const q = searchTerm.trim().toLowerCase(); if (!q) return { spaces: [], pages: [] };
    return {
      spaces: workspaces.filter(w => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)),
      pages: allPages.filter(p => p.title.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)),
    };
  }, [searchTerm, workspaces, allPages]);

  const spaceFilteredPages = useMemo(() => {
    const q = spaceSearch.trim().toLowerCase(); if (!q) return pages;
    return pages.filter(p => p.title.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q));
  }, [spaceSearch, pages]);

  const currentPref = selectedWorkspace ? getSpacePref(selectedWorkspace.id) : null;
  const bannerStyle = currentPref ? getWallpaperStyle(currentPref.wallpaper) : GRADIENT_WALLPAPERS[0].style;

  return (
    <div className={`h-screen flex overflow-hidden ${T.bg} transition-colors duration-200`}>

      {/* ══ SIDEBAR ══ */}
      <div className={`w-[258px] ${T.sidebar} border-r ${T.border} flex flex-col shrink-0 transition-colors duration-200`}>

        <div className={`h-[62px] border-b ${T.border} flex items-center justify-center shrink-0 overflow-hidden`}>
          <img src="/onespace.png" alt="OneSpace" className="h-[62px] w-auto scale-[2.1] object-contain" />
        </div>

        <div className="p-3 relative">
          <button onClick={() => setShowCreateMenu(p => !p)}
            className="w-full h-[40px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] font-medium flex items-center justify-center gap-2 shadow hover:shadow-md transition-all">
            <Plus size={13} /> Create <ChevronDown size={12} />
          </button>
          {showCreateMenu && (
            <div className={`absolute top-[52px] left-3 right-3 ${T.modal} border ${T.border} rounded-xl shadow-2xl overflow-hidden z-30`}>
              <button onClick={() => { setShowCreateMenu(false); setShowCreateSpaceModal(true); }}
                className={`w-full px-4 py-2.5 text-left text-[13px] ${T.hover} transition flex items-center gap-2.5`}>
                <span className="text-base">🗂️</span><span className={T.text}>New Space</span>
              </button>
              <button onClick={() => { setShowCreateMenu(false); setShowCreatePageModal(true); }}
                className={`w-full px-4 py-2.5 text-left text-[13px] ${T.hover} transition flex items-center gap-2.5 border-t ${T.border}`}>
                <span className="text-base">📝</span><span className={T.text}>New Page</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-3 pb-1">
          {["Recent", "Starred"].map(label => (
            <button key={label} className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] ${T.muted} ${T.hover} transition`}>{label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className={`px-2 mb-2 mt-3 text-[10.5px] font-bold tracking-[2px] ${T.hint} uppercase`}>Spaces</div>
          <div className="space-y-0.5">
            {workspaces.map(ws => {
              const pref = getSpacePref(ws.id);
              const isSelected = selectedWorkspace?.id === ws.id;
              const isExpanded = expandedWorkspaceId === ws.id;
              const initials = getInitials(ws.name);
              return (
                <div key={ws.id}>
                  <button onClick={() => toggleExpand(ws)}
                    className={`w-full rounded-xl text-left px-2.5 py-2 transition-all flex items-center gap-2 ${
                      isSelected
                        ? (isDark ? "bg-[#1e2235] border border-[#3d4266]" : "bg-violet-50 border border-violet-200 shadow-sm")
                        : `border border-transparent ${T.hover}`
                    }`}>
                    {pref.icon ? (
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ background: pref.iconBg || "#4f46e5" }}>
                        {pref.icon}
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected ? (isDark ? "bg-indigo-700 text-white" : "bg-violet-600 text-white") : (isDark ? "bg-[#2d3348] text-[#8892a4]" : "bg-[#e8edf3] text-[#64748b]")
                      }`}>
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[12.5px] font-medium truncate block ${isSelected ? (isDark ? "text-indigo-300" : "text-violet-700") : T.text}`}>
                        {ws.name}
                      </span>
                    </div>
                    <ChevronDown size={12} className={`${T.hint} transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className={`ml-3 mt-0.5 border-l ${T.border} pl-3 space-y-0.5 mb-1`}>
                      {(workspacePages[ws.id] || []).map(p => (
                        <button key={p.id} onClick={() => router.push(`/page/${p.id}`)}
                          className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left ${T.hover} transition`}>
                          <FileText size={11} className={T.hint} />
                          <span className={`text-[11.5px] ${T.muted} truncate`}>{p.title}</span>
                        </button>
                      ))}
                      {(workspacePages[ws.id] || []).length === 0 && (
                        <p className={`text-[11px] ${T.hint} px-2 py-1`}>No pages yet</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-3 border-t ${T.border}`}>
          <button onClick={toggleTheme}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12.5px] ${T.muted} ${T.hover} transition`}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className={`h-[62px] ${T.topbar} border-b flex items-center px-5 gap-3 shrink-0 z-20 transition-colors duration-200`}>
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1 max-w-[440px]">
              <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${T.hint}`} />
              <input type="text" placeholder="Search everything…" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowSearchDropdown(e.target.value.trim().length > 0); }}
                onFocus={() => { if (searchTerm.trim()) setShowSearchDropdown(true); }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
                className={`w-full h-[38px] rounded-xl border pl-9 pr-4 text-[13px] focus:outline-none focus:border-violet-400 ${T.input} transition`} />
              {showSearchDropdown && (
                <div className={`absolute top-[44px] left-0 right-0 ${T.modal} border ${T.border} rounded-2xl shadow-2xl z-30 overflow-hidden max-h-[360px] overflow-y-auto`}>
                  {globalSearch.spaces.length > 0 && (
                    <>
                      <div className={`px-4 py-2 text-[10px] font-bold tracking-widest ${T.hint} uppercase ${T.searchbg}`}>Spaces</div>
                      {globalSearch.spaces.map(ws => {
                        const p = getSpacePref(ws.id);
                        return (
                          <button key={ws.id} onClick={() => { selectWorkspace(ws); setSearchTerm(""); setShowSearchDropdown(false); }}
                            className={`w-full px-4 py-2.5 text-left ${T.hover} transition flex items-center gap-3`}>
                            {p.icon ? (
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: p.iconBg || "#4f46e5" }}>{p.icon}</div>
                            ) : (
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${isDark ? "bg-[#2d3348] text-[#8892a4]" : "bg-[#e8edf3] text-[#64748b]"}`}>{getInitials(ws.name)}</div>
                            )}
                            <div className="min-w-0">
                              <div className={`text-[13px] font-medium ${T.text}`}>{ws.name}</div>
                              <div className={`text-[11px] ${T.hint} truncate`}>{ws.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                  {globalSearch.pages.length > 0 && (
                    <>
                      <div className={`px-4 py-2 text-[10px] font-bold tracking-widest ${T.hint} uppercase ${T.searchbg} border-t ${T.border}`}>Pages</div>
                      {globalSearch.pages.map(p => (
                        <button key={p.id} onClick={() => { router.push(`/page/${p.id}`); setSearchTerm(""); setShowSearchDropdown(false); }}
                          className={`w-full px-4 py-2.5 text-left ${T.hover} transition flex items-center gap-3`}>
                          <FileText size={14} className="text-violet-400 shrink-0" />
                          <div className="min-w-0">
                            <div className={`text-[13px] font-medium ${T.text}`}>{p.title}</div>
                            <div className={`text-[11px] ${T.hint} truncate`}>{p.content}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {!globalSearch.spaces.length && !globalSearch.pages.length && (
                    <div className={`px-4 py-6 text-center text-[13px] ${T.hint}`}>No results for &ldquo;{searchTerm}&rdquo;</div>
                  )}
                </div>
              )}
            </div>
            {selectedWorkspace && canEdit && (
              <button onClick={() => setShowCreatePageModal(true)}
                className="flex items-center gap-1.5 px-4 h-[38px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] font-medium hover:opacity-90 transition shrink-0 shadow">
                <Plus size={13} /> Create Page
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button className={`w-8 h-8 rounded-xl border ${T.border} ${T.modal} flex items-center justify-center ${T.hover} transition`}>
              <Bell size={14} className={T.muted} />
            </button>
            <button className={`w-8 h-8 rounded-xl border ${T.border} ${T.modal} flex items-center justify-center ${T.hover} transition`}>
              <Settings size={14} className={T.muted} />
            </button>
            <button onClick={logout}
              className={`w-8 h-8 rounded-xl border ${isDark ? "border-red-900 hover:bg-red-900/30" : "border-red-200 hover:bg-red-50"} ${T.modal} flex items-center justify-center transition`}>
              <LogOut size={14} className="text-red-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedWorkspace && currentPref ? (
            <div>
              {/* Banner */}
              <div className="w-full h-[165px] relative" style={bannerStyle}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.28))" }} />
              </div>

              {/* Space identity */}
              <div className="relative z-10 flex flex-col items-center -mt-[38px] pb-5 px-6">
                {currentPref.icon ? (
                  <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl shadow-xl border-[3px]"
                    style={{ background: currentPref.iconBg || "#4f46e5", borderColor: isDark ? "#1a1d2e" : "white" }}>
                    {currentPref.icon}
                  </div>
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-xl border-[3px] bg-gradient-to-br from-violet-600 to-indigo-700"
                    style={{ borderColor: isDark ? "#1a1d2e" : "white" }}>
                    <span className="text-white text-[22px] font-bold">{getInitials(selectedWorkspace.name)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 mt-3">
                  <h1 className={`text-[23px] font-bold tracking-tight ${T.text}`}>{selectedWorkspace.name}</h1>
                  <button onClick={() => { setShowInviteModal(true); setInviteResult(null); setInviteEmail(""); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border ${T.border} ${T.modal} ${T.muted} ${T.hover} transition shadow-sm`}>
                    <UserPlus size={11} /> Invite
                  </button>
                </div>

                <p className={`mt-1.5 text-[13px] ${T.muted} text-center max-w-lg leading-relaxed`}>
                  {selectedWorkspace.description || "No description — click Edit Space to add one."}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  {canEdit && (
                    <button onClick={() => setShowEditSpaceModal(true)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border ${T.border} ${T.modal} text-[12.5px] ${T.muted} ${T.hover} transition shadow-sm`}>
                      <Pencil size={12} /> Edit Space
                    </button>
                  )}
                  <button onClick={shareWorkspace}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border ${T.border} ${T.modal} text-[12.5px] ${T.muted} ${T.hover} transition shadow-sm`}>
                    <Share2 size={12} />{shareCopied ? "Copied!" : "Share"}
                  </button>
                </div>
              </div>

              <div className={`border-t ${T.border} mx-6`} />

              {/* Pages */}
              <div className="px-6 py-5 max-w-[860px] mx-auto w-full">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className={`text-[15px] font-semibold ${T.text} shrink-0`}>
                    Pages <span className={`text-[13px] font-normal ${T.hint} ml-1`}>{pages.length}</span>
                  </h2>
                  <div className="relative max-w-[260px] w-full">
                    <Search size={12} className={`absolute left-3 top-1/2 -translate-y-1/2 ${T.hint}`} />
                    <input type="text" placeholder={`Search in ${selectedWorkspace.name}…`}
                      value={spaceSearch} onChange={e => setSpaceSearch(e.target.value)}
                      className={`w-full h-[33px] rounded-xl border pl-8 pr-3 text-[12.5px] focus:outline-none focus:border-violet-400 ${T.input} transition`} />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {spaceFilteredPages.map(p => (
                    <button key={p.id} onClick={() => router.push(`/page/${p.id}`)}
                      className={`w-full ${T.card} border ${T.border} rounded-2xl px-5 py-3.5 text-left hover:border-violet-400 hover:shadow-md transition-all group`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-violet-900/40" : "bg-violet-50"}`}>
                          <FileText size={15} className="text-violet-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`text-[13.5px] font-semibold ${T.text} truncate group-hover:text-violet-500 transition`}>{p.title}</h3>
                          <p className={`mt-0.5 text-[12px] ${T.hint} line-clamp-1`}>{p.content?.replace(/<[^>]*>/g, "") || "No content yet"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {spaceFilteredPages.length === 0 && spaceSearch && (
                    <div className={`text-center py-12 ${T.hint}`}>
                      <Search size={26} className="mx-auto mb-3 opacity-30" />
                      <p className="text-[13px]">No pages match &ldquo;{spaceSearch}&rdquo;</p>
                    </div>
                  )}
                  {pages.length === 0 && !spaceSearch && (
                    <div className={`text-center py-14 ${T.hint}`}>
                      <FileText size={28} className="mx-auto mb-3 opacity-30" />
                      <p className="text-[13px] mb-3">No pages in this space yet</p>
                      {canEdit && (
                        <button onClick={() => setShowCreatePageModal(true)}
                          className="text-[13px] text-violet-500 hover:text-violet-600 font-medium transition">
                          + Create the first page
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Welcome screen */
            <div className="h-full flex flex-col">
              <div className="w-full h-[210px] relative flex items-end"
                style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 40%,#7c3aed 70%,#a855f7 100%)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 50%,rgba(99,102,241,0.35),transparent 70%)" }} />
                <div className="relative z-10 px-10 pb-8">
                  <h1 className="text-[30px] font-bold text-white leading-tight">Welcome to OneSpace 👋</h1>
                  <p className="text-[14px] text-indigo-200 mt-1">Your team knowledge, organised and accessible.</p>
                </div>
              </div>
              <div className="flex-1 px-10 py-7 max-w-[860px] mx-auto w-full">
                <p className={`text-[13.5px] ${T.muted} mb-5`}>Get started by creating your first space or ask an admin to invite you.</p>
                <div className="grid grid-cols-3 gap-4 mb-7">
                  {[
                    { icon: "🗂️", title: "Create Spaces", desc: "Organise work into focused spaces for each team or project.", action: () => setShowCreateSpaceModal(true), cta: "Create a Space" },
                    { icon: "📝", title: "Write Pages", desc: "Document processes, runbooks and knowledge with file attachments.", action: null, cta: null },
                    { icon: "👥", title: "Collaborate", desc: "Invite teammates, set roles and keep everyone on the same page.", action: null, cta: null },
                  ].map(card => (
                    <div key={card.title} className={`${T.card} border ${T.border} rounded-2xl p-5 flex flex-col gap-3`}>
                      <div className="text-3xl">{card.icon}</div>
                      <div>
                        <h3 className={`text-[14px] font-semibold ${T.text}`}>{card.title}</h3>
                        <p className={`text-[12.5px] ${T.muted} mt-1 leading-relaxed`}>{card.desc}</p>
                      </div>
                      {card.action && (
                        <button onClick={card.action} className="mt-auto text-[12.5px] font-medium text-violet-500 hover:text-violet-600 transition text-left">
                          {card.cta} →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowCreateSpaceModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13.5px] font-medium hover:opacity-90 transition shadow">
                    <Plus size={14} /> Create your first Space
                  </button>
                  <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border ${T.border} ${T.modal} text-[13.5px] ${T.muted} ${T.hover} transition`}>
                    <Users size={14} /> Join a Space
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ MODALS ══ */}

      {/* Create Space */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${T.modal} rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border ${T.border}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-[16px] font-semibold ${T.text}`}>Create Space</h2>
              <button onClick={() => setShowCreateSpaceModal(false)} className={T.hint}><X size={17} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Name</label>
                <input type="text" value={spaceName} onChange={e => setSpaceName(e.target.value)} placeholder="e.g. DevOps, HR, IT"
                  className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-violet-400 ${T.input}`} />
              </div>
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Description</label>
                <textarea value={spaceDescription} onChange={e => setSpaceDescription(e.target.value)} rows={3} placeholder="What is this space for?"
                  className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-violet-400 ${T.input} resize-none`} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => setShowCreateSpaceModal(false)}
                className={`px-4 py-2 text-[13px] ${T.muted} border ${T.border} rounded-xl ${T.hover} transition`}>Cancel</button>
              <button onClick={createWorkspace} disabled={creatingSpace}
                className="px-5 py-2 text-[13px] font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50">
                {creatingSpace ? "Creating…" : "Create Space"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Page */}
      {showCreatePageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${T.modal} rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border ${T.border}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-[16px] font-semibold ${T.text}`}>Create Page</h2>
              <button onClick={() => setShowCreatePageModal(false)} className={T.hint}><X size={17} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Title</label>
                <input type="text" value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="Page title"
                  className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-violet-400 ${T.input}`} />
              </div>
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Content <span className={`${T.hint} font-normal`}>(optional — you can add rich content after creating)</span></label>
                <textarea value={pageContent} onChange={e => setPageContent(e.target.value)} rows={3} placeholder="Brief description or leave blank…"
                  className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-violet-400 ${T.input} resize-none`} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => setShowCreatePageModal(false)}
                className={`px-4 py-2 text-[13px] ${T.muted} border ${T.border} rounded-xl ${T.hover} transition`}>Cancel</button>
              <button onClick={createPage} disabled={creatingPage}
                className="px-5 py-2 text-[13px] font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50">
                {creatingPage ? "Creating…" : "Create Page"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Space */}
      {showEditSpaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${T.modal} rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 border ${T.border} max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-[16px] font-semibold ${T.text}`}>Edit Space</h2>
              <button onClick={() => setShowEditSpaceModal(false)} className={T.hint}><X size={17} /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Name</label>
                  <input value={editSpaceName} onChange={e => setEditSpaceName(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2 text-[13px] focus:outline-none focus:border-violet-400 ${T.input}`} />
                </div>
                <div>
                  <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Description</label>
                  <input value={editSpaceDescription} onChange={e => setEditSpaceDescription(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2 text-[13px] focus:outline-none focus:border-violet-400 ${T.input}`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-[12px] font-medium ${T.muted}`}>Space Icon <span className={`${T.hint} font-normal`}>(optional)</span></label>
                  {editIconIndex !== null && (
                    <button onClick={() => setEditIconIndex(null)}
                      className={`text-[11px] ${T.hint} hover:text-red-400 transition flex items-center gap-1`}>
                      <X size={10} /> Remove icon
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {SPACE_ICONS.map((icon, i) => (
                    <button key={i} onClick={() => setEditIconIndex(editIconIndex === i ? null : i)} title={icon.label}
                      className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-base border-2 transition hover:scale-105 ${
                        editIconIndex === i ? "border-violet-500 scale-105 shadow-lg" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                      style={{ background: icon.bg }}>
                      <span>{icon.emoji}</span>
                      <span className="text-[7px] text-white/75 font-medium leading-none">{icon.label}</span>
                      {editIconIndex === i && <Check size={9} className="absolute top-0.5 right-0.5 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-2`}>
                  Banner <span className={`${T.hint} font-normal`}>— Photo or Gradient</span>
                </label>
                <p className={`text-[11px] ${T.hint} mb-1.5 uppercase tracking-wider font-semibold`}>Photos</p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {IMAGE_WALLPAPERS.map(wp => (
                    <button key={wp.id} onClick={() => setEditWallpaper(wp.id)} title={wp.name}
                      className={`h-14 rounded-xl border-2 transition overflow-hidden ${editWallpaper === wp.id ? "border-violet-500 scale-105 shadow-lg" : "border-transparent hover:scale-105"}`}
                      style={wp.style}>
                      {editWallpaper === wp.id && (
                        <div className="w-full h-full flex items-center justify-center bg-black/20">
                          <Check size={14} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className={`text-[11px] ${T.hint} mb-1.5 uppercase tracking-wider font-semibold`}>Gradients</p>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENT_WALLPAPERS.map(wp => (
                    <button key={wp.id} onClick={() => setEditWallpaper(wp.id)} title={wp.name}
                      className={`h-9 rounded-xl border-2 transition ${editWallpaper === wp.id ? "border-violet-500 scale-105 shadow-lg" : "border-transparent hover:scale-105"}`}
                      style={wp.style}>
                      {editWallpaper === wp.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Check size={12} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-2`}>Preview</label>
                <div className={`rounded-xl overflow-hidden border ${T.border}`}>
                  <div className="h-14 relative" style={getWallpaperStyle(editWallpaper)}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.28))" }} />
                  </div>
                  <div className={`px-4 py-3 ${T.card} flex items-center gap-3`}>
                    {editIconIndex !== null ? (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl -mt-6 shadow-lg border-2"
                        style={{ background: SPACE_ICONS[editIconIndex].bg, borderColor: isDark ? "#1a1d2e" : "white" }}>
                        {SPACE_ICONS[editIconIndex].emoji}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center -mt-6 shadow-lg border-2 bg-gradient-to-br from-violet-600 to-indigo-700"
                        style={{ borderColor: isDark ? "#1a1d2e" : "white" }}>
                        <span className="text-white text-sm font-bold">{getInitials(editSpaceName || "SP")}</span>
                      </div>
                    )}
                    <div className="mt-1">
                      <div className={`text-[13px] font-semibold ${T.text}`}>{editSpaceName || "Space Name"}</div>
                      <div className={`text-[11px] ${T.hint}`}>{editIconIndex !== null ? SPACE_ICONS[editIconIndex].label : "No icon selected"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => setShowEditSpaceModal(false)}
                className={`px-4 py-2 text-[13px] ${T.muted} border ${T.border} rounded-xl ${T.hover} transition`}>Cancel</button>
              <button onClick={saveWorkspace} disabled={savingSpace}
                className="px-5 py-2 text-[13px] font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50">
                {savingSpace ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal — with real API call */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`${T.modal} rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border ${T.border}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-[16px] font-semibold ${T.text}`}>Invite to {selectedWorkspace?.name}</h2>
                <p className={`text-[12px] ${T.hint} mt-0.5`}>An email invitation will be sent</p>
              </div>
              <button onClick={() => { setShowInviteModal(false); setInviteResult(null); }} className={T.hint}><X size={17} /></button>
            </div>

            {/* Result message */}
            {inviteResult && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-[13px] ${
                inviteResult.type === "success"
                  ? (isDark ? "bg-green-900/30 border border-green-700/40 text-green-300" : "bg-green-50 border border-green-200 text-green-700")
                  : (isDark ? "bg-red-900/30 border border-red-700/40 text-red-300" : "bg-red-50 border border-red-200 text-red-700")
              }`}>
                {inviteResult.type === "success" ? "✓ " : "✕ "}{inviteResult.message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-1.5`}>Email address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] focus:outline-none focus:border-violet-400 ${T.input}`} />
              </div>
              <div>
                <label className={`block text-[12px] font-medium ${T.muted} mb-2`}>Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "viewer", label: "Viewer", desc: "Can read" },
                    { value: "editor", label: "Editor", desc: "Can edit" },
                    { value: "admin", label: "Admin", desc: "Full access" },
                  ].map(r => (
                    <button key={r.value} onClick={() => setInviteRole(r.value)}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        inviteRole === r.value
                          ? "border-violet-500 " + (isDark ? "bg-violet-900/30" : "bg-violet-50")
                          : "border-transparent " + T.card + " " + T.hover
                      }`}>
                      <div className={`text-[12.5px] font-semibold ${T.text}`}>{r.label}</div>
                      <div className={`text-[11px] ${T.hint}`}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? "bg-blue-950/50 border border-blue-900/40" : "bg-blue-50 border border-blue-100"}`}>
                <p className={`text-[12px] ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                  💡 If they already have an account they will be added instantly. If not, they will receive a registration invite email.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5">
              <button onClick={() => { setShowInviteModal(false); setInviteResult(null); }}
                className={`px-4 py-2 text-[13px] ${T.muted} border ${T.border} rounded-xl ${T.hover} transition`}>
                {inviteResult?.type === "success" ? "Close" : "Cancel"}
              </button>
              {inviteResult?.type !== "success" && (
                <button onClick={sendInvite} disabled={inviteLoading || !inviteEmail.trim()}
                  className="px-5 py-2 text-[13px] font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                  <UserPlus size={13} />
                  {inviteLoading ? "Sending…" : "Send Invite"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-[#0d0f18]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-[13px] text-slate-400">Loading OneSpace…</p>
        </div>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}
