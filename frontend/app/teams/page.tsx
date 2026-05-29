"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Plus, X, Users, Search, Trash2, Moon, Sun } from "lucide-react";

const DARK = { bg:"#0d0f18", card:"#1a1d2e", border:"#252840", text:"#e2e8f0", muted:"#8892a4", hint:"#55607a", input:"#1e2235", sidebar:"#12151f" };
const LIGHT = { bg:"#f4f6fb", card:"#ffffff", border:"#e8edf3", text:"#111827", muted:"#64748b", hint:"#94a3b8", input:"#f8fafc", sidebar:"#ffffff" };

interface Team { id:number; name:string; description:string; member_count:number; workspace_count:number; }
interface Member { id:number; username:string; email:string; role:string; }
interface Workspace { id:number; name:string; description:string; permission?:string; }
interface UserResult { id:number; username:string; email:string; }

export default function TeamsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const C = isDark ? DARK : LIGHT;

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [teamWorkspaces, setTeamWorkspaces] = useState<Workspace[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
  const [tab, setTab] = useState<"members"|"spaces">("members");
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<UserResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [addingMember, setAddingMember] = useState(false);

  const [selectedWorkspaceToAdd, setSelectedWorkspaceToAdd] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("viewer");
  const [addingWorkspace, setAddingWorkspace] = useState(false);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    const token = localStorage.getItem("token");
    if (token) document.cookie = `auth_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
    fetchTeams();
    fetchAllWorkspaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/teams", { headers: authHeaders() });
      setTeams(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAllWorkspaces = async () => {
    try {
      const res = await axios.get("http://localhost:5000/workspaces", { headers: authHeaders() });
      setAllWorkspaces(res.data);
    } catch {}
  };

  const selectTeam = async (team: Team) => {
    setSelectedTeam(team); setTab("members");
    const [membRes, wsRes] = await Promise.all([
      axios.get(`http://localhost:5000/teams/${team.id}/members`, { headers: authHeaders() }),
      axios.get(`http://localhost:5000/teams/${team.id}/workspaces`, { headers: authHeaders() }),
    ]);
    setMembers(membRes.data);
    setTeamWorkspaces(wsRes.data);
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      setCreating(true);
      await axios.post("http://localhost:5000/teams", { name: newTeamName.trim(), description: newTeamDesc.trim() }, { headers: authHeaders() });
      setShowCreateModal(false); setNewTeamName(""); setNewTeamDesc("");
      fetchTeams();
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to create team"); }
    finally { setCreating(false); }
  };

  const deleteTeam = async (teamId: number) => {
    if (!window.confirm("Delete this team? Members will lose access to team spaces.")) return;
    try {
      await axios.delete(`http://localhost:5000/teams/${teamId}`, { headers: authHeaders() });
      setTeams(p => p.filter(t => t.id !== teamId));
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to delete team"); }
  };

  const searchUsers = (q: string) => {
    setMemberSearch(q);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!q.trim()) { setMemberResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
        setMemberResults(res.data);
      } catch {}
    }, 300);
    setSearchTimeout(t);
  };

  const addMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      setAddingMember(true);
      await axios.post(`http://localhost:5000/teams/${selectedTeam.id}/members`, { userId, role: "member" }, { headers: authHeaders() });
      setMemberSearch(""); setMemberResults([]);
      const res = await axios.get(`http://localhost:5000/teams/${selectedTeam.id}/members`, { headers: authHeaders() });
      setMembers(res.data);
      fetchTeams();
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to add member"); }
    finally { setAddingMember(false); }
  };

  const removeMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      await axios.delete(`http://localhost:5000/teams/${selectedTeam.id}/members/${userId}`, { headers: authHeaders() });
      setMembers(p => p.filter(m => m.id !== userId));
      fetchTeams();
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to remove member"); }
  };

  const addWorkspace = async () => {
    if (!selectedTeam || !selectedWorkspaceToAdd) return;
    try {
      setAddingWorkspace(true);
      await axios.post(`http://localhost:5000/teams/${selectedTeam.id}/workspaces`,
        { workspaceId: parseInt(selectedWorkspaceToAdd), permission: selectedPermission },
        { headers: authHeaders() }
      );
      const res = await axios.get(`http://localhost:5000/teams/${selectedTeam.id}/workspaces`, { headers: authHeaders() });
      setTeamWorkspaces(res.data);
      setSelectedWorkspaceToAdd(""); fetchTeams();
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to add workspace"); }
    finally { setAddingWorkspace(false); }
  };

  const removeWorkspace = async (workspaceId: number) => {
    if (!selectedTeam) return;
    try {
      await axios.delete(`http://localhost:5000/teams/${selectedTeam.id}/workspaces/${workspaceId}`, { headers: authHeaders() });
      setTeamWorkspaces(p => p.filter(w => w.id !== workspaceId));
      fetchTeams();
    } catch {}
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background:C.sidebar, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", height:"62px", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <button onClick={() => router.push("/dashboard")}
              style={{ display:"flex", alignItems:"center", gap:"6px", color:C.muted, background:"none", border:"none", cursor:"pointer", fontSize:"13px" }}>
              <ArrowLeft size={14}/> Dashboard
            </button>
            <span style={{ color:C.border }}>|</span>
            <h1 style={{ color:C.text, fontSize:"16px", fontWeight:700, margin:0 }}>Teams</h1>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => setIsDark(d => { localStorage.setItem("theme",!d?"dark":"light"); return !d; })}
              style={{ width:"32px", height:"32px", borderRadius:"8px", border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:"14px" }}>
              {isDark?"☀️":"🌙"}
            </button>
            <button onClick={() => setShowCreateModal(true)}
              style={{ height:"36px", padding:"0 16px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, display:"flex", alignItems:"center", gap:"6px" }}>
              <Plus size={13}/> New Team
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"24px", display:"flex", gap:"20px" }}>

        {/* Teams list */}
        <div style={{ width:"280px", flexShrink:0 }}>
          <p style={{ color:C.hint, fontSize:"11px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>
            {teams.length} team{teams.length !== 1?"s":""}
          </p>
          {loading ? (
            <div style={{ color:C.hint, fontSize:"13px", textAlign:"center", padding:"32px 0" }}>Loading…</div>
          ) : teams.length === 0 ? (
            <div style={{ background:C.card, border:`2px dashed ${C.border}`, borderRadius:"16px", padding:"32px 20px", textAlign:"center" }}>
              <Users size={28} style={{ color:C.hint, margin:"0 auto 10px", display:"block" }}/>
              <p style={{ color:C.muted, fontSize:"13px", margin:"0 0 12px" }}>No teams yet</p>
              <button onClick={() => setShowCreateModal(true)}
                style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", borderRadius:"8px", padding:"8px 16px", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                Create first team
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {teams.map(team => (
                <div key={team.id}
                  style={{ background:selectedTeam?.id===team.id?(isDark?"#1e2235":"#f0eeff"):C.card, border:`1px solid ${selectedTeam?.id===team.id?"#7c3aed":C.border}`, borderRadius:"14px", padding:"12px 14px", cursor:"pointer", transition:"all 0.15s" }}
                  onClick={() => selectTeam(team)}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                    <span style={{ color:C.text, fontSize:"13.5px", fontWeight:600 }}>{team.name}</span>
                    <button onClick={e => { e.stopPropagation(); deleteTeam(team.id); }}
                      style={{ width:"22px", height:"22px", borderRadius:"6px", background:"none", border:"none", cursor:"pointer", color:C.hint, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                  {team.description && <p style={{ color:C.muted, fontSize:"11.5px", margin:"0 0 6px", lineHeight:1.4 }}>{team.description}</p>}
                  <div style={{ display:"flex", gap:"10px" }}>
                    <span style={{ color:C.hint, fontSize:"11px" }}>👥 {team.member_count} members</span>
                    <span style={{ color:C.hint, fontSize:"11px" }}>📁 {team.workspace_count} spaces</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team detail */}
        <div style={{ flex:1, minWidth:0 }}>
          {!selectedTeam ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", padding:"60px 40px", textAlign:"center" }}>
              <Users size={40} style={{ color:C.hint, margin:"0 auto 12px", display:"block" }}/>
              <h3 style={{ color:C.text, fontSize:"16px", fontWeight:600, margin:"0 0 6px" }}>Select a team</h3>
              <p style={{ color:C.muted, fontSize:"13px", margin:0 }}>Choose a team from the left to manage members and space access</p>
            </div>
          ) : (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", overflow:"hidden" }}>
              {/* Team header */}
              <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <h2 style={{ color:C.text, fontSize:"18px", fontWeight:700, margin:"0 0 2px" }}>{selectedTeam.name}</h2>
                  {selectedTeam.description && <p style={{ color:C.muted, fontSize:"13px", margin:0 }}>{selectedTeam.description}</p>}
                </div>
                <div style={{ display:"flex", gap:"6px" }}>
                  <span style={{ background:isDark?"rgba(124,58,237,0.15)":"rgba(124,58,237,0.08)", color:"#7c3aed", borderRadius:"8px", padding:"4px 12px", fontSize:"12px", fontWeight:600 }}>
                    {members.length} members
                  </span>
                  <span style={{ background:isDark?"rgba(16,185,129,0.15)":"rgba(16,185,129,0.08)", color:"#10b981", borderRadius:"8px", padding:"4px 12px", fontSize:"12px", fontWeight:600 }}>
                    {teamWorkspaces.length} spaces
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
                {(["members","spaces"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"12px 20px", border:"none", background:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, color:tab===t?"#7c3aed":C.muted, borderBottom:tab===t?"2px solid #7c3aed":"2px solid transparent", marginBottom:"-1px" }}>
                    {t === "members" ? "👥 Members" : "📁 Spaces"}
                  </button>
                ))}
              </div>

              <div style={{ padding:"20px 24px" }}>
                {tab === "members" && (
                  <>
                    {/* Add member search */}
                    <div style={{ marginBottom:"16px" }}>
                      <label style={{ display:"block", color:C.muted, fontSize:"12px", fontWeight:600, marginBottom:"6px" }}>Add member</label>
                      <div style={{ position:"relative" }}>
                        <Search size={14} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:C.hint }}/>
                        <input value={memberSearch} onChange={e => searchUsers(e.target.value)} placeholder="Search by name or email…"
                          style={{ width:"100%", height:"40px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.input, color:C.text, paddingLeft:"36px", paddingRight:"14px", fontSize:"13px", outline:"none", boxSizing:"border-box" }}/>
                      </div>
                      {memberResults.length > 0 && (
                        <div style={{ marginTop:"4px", background:C.card, border:`1px solid ${C.border}`, borderRadius:"10px", overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.15)" }}>
                          {memberResults.map(u => (
                            <button key={u.id} onClick={() => addMember(u.id)} disabled={addingMember || members.some(m => m.id === u.id)}
                              style={{ width:"100%", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", borderBottom:`1px solid ${C.border}` }}>
                              <div style={{ textAlign:"left" }}>
                                <div style={{ color:C.text, fontSize:"13px", fontWeight:500 }}>{u.username}</div>
                                <div style={{ color:C.hint, fontSize:"11px" }}>{u.email}</div>
                              </div>
                              {members.some(m => m.id === u.id) ? (
                                <span style={{ color:C.hint, fontSize:"11px" }}>Already added</span>
                              ) : (
                                <span style={{ color:"#7c3aed", fontSize:"12px", fontWeight:600 }}>+ Add</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Member list */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                      {members.length === 0 ? (
                        <p style={{ color:C.hint, fontSize:"13px", textAlign:"center", padding:"24px 0" }}>No members yet. Search above to add someone.</p>
                      ) : (
                        members.map(m => (
                          <div key={m.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:isDark?"rgba(30,34,53,0.5)":"#fafafa", borderRadius:"10px", border:`1px solid ${C.border}` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                              <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"12px", fontWeight:700 }}>
                                {m.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ color:C.text, fontSize:"13px", fontWeight:500, margin:0 }}>{m.username}</p>
                                <p style={{ color:C.hint, fontSize:"11px", margin:0 }}>{m.email}</p>
                              </div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                              <span style={{ background:m.role==="admin"?(isDark?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.1)"):(isDark?"rgba(30,34,53,0.8)":"#f3f4f6"), color:m.role==="admin"?"#7c3aed":C.muted, borderRadius:"6px", padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>
                                {m.role}
                              </span>
                              <button onClick={() => removeMember(m.id)}
                                style={{ width:"26px", height:"26px", borderRadius:"6px", background:"none", border:`1px solid ${C.border}`, cursor:"pointer", color:C.hint, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <X size={12}/>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {tab === "spaces" && (
                  <>
                    {/* Add workspace */}
                    <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
                      <select value={selectedWorkspaceToAdd} onChange={e => setSelectedWorkspaceToAdd(e.target.value)}
                        style={{ flex:1, height:"40px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.input, color:C.text, padding:"0 12px", fontSize:"13px", outline:"none" }}>
                        <option value="">Select a space to add…</option>
                        {allWorkspaces.filter(ws => !teamWorkspaces.some(tw => tw.id === ws.id)).map(ws => (
                          <option key={ws.id} value={ws.id}>{ws.name}</option>
                        ))}
                      </select>
                      <select value={selectedPermission} onChange={e => setSelectedPermission(e.target.value)}
                        style={{ width:"110px", height:"40px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.input, color:C.text, padding:"0 10px", fontSize:"13px", outline:"none" }}>
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={addWorkspace} disabled={addingWorkspace || !selectedWorkspaceToAdd}
                        style={{ height:"40px", padding:"0 16px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, opacity:(!selectedWorkspaceToAdd||addingWorkspace)?0.5:1 }}>
                        {addingWorkspace?"Adding…":"Add"}
                      </button>
                    </div>

                    {/* Workspace list */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                      {teamWorkspaces.length === 0 ? (
                        <p style={{ color:C.hint, fontSize:"13px", textAlign:"center", padding:"24px 0" }}>No spaces assigned. Select a space above to grant access.</p>
                      ) : (
                        teamWorkspaces.map(ws => (
                          <div key={ws.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:isDark?"rgba(30,34,53,0.5)":"#fafafa", borderRadius:"10px", border:`1px solid ${C.border}` }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                              <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"14px" }}>
                                📁
                              </div>
                              <div>
                                <p style={{ color:C.text, fontSize:"13px", fontWeight:500, margin:0 }}>{ws.name}</p>
                                <p style={{ color:C.hint, fontSize:"11px", margin:0 }}>{ws.description}</p>
                              </div>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                              <span style={{ background:isDark?"rgba(16,185,129,0.15)":"rgba(16,185,129,0.1)", color:"#10b981", borderRadius:"6px", padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>
                                {ws.permission || "viewer"}
                              </span>
                              <button onClick={() => removeWorkspace(ws.id)}
                                style={{ width:"26px", height:"26px", borderRadius:"6px", background:"none", border:`1px solid ${C.border}`, cursor:"pointer", color:C.hint, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                <X size={12}/>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create team modal */}
      {showCreateModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:isDark?"#1a1d2e":"#ffffff", borderRadius:"20px", border:`1px solid ${C.border}`, padding:"24px", width:"100%", maxWidth:"420px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
              <h2 style={{ color:C.text, fontSize:"16px", fontWeight:700, margin:0 }}>Create Team</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:C.hint }}><X size={17}/></button>
            </div>
            <div style={{ marginBottom:"14px" }}>
              <label style={{ display:"block", color:C.muted, fontSize:"12px", fontWeight:600, marginBottom:"6px" }}>Team name</label>
              <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Engineering, Marketing"
                style={{ width:"100%", height:"44px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.input, color:C.text, padding:"0 14px", fontSize:"13.5px", outline:"none", boxSizing:"border-box" }}/>
            </div>
            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", color:C.muted, fontSize:"12px", fontWeight:600, marginBottom:"6px" }}>Description <span style={{ color:C.hint, fontWeight:400 }}>(optional)</span></label>
              <textarea value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} rows={3} placeholder="What does this team do?"
                style={{ width:"100%", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.input, color:C.text, padding:"10px 14px", fontSize:"13.5px", outline:"none", resize:"none", boxSizing:"border-box" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:"8px" }}>
              <button onClick={() => setShowCreateModal(false)}
                style={{ height:"38px", padding:"0 16px", borderRadius:"10px", border:`1px solid ${C.border}`, background:C.card, color:C.muted, cursor:"pointer", fontSize:"13px" }}>
                Cancel
              </button>
              <button onClick={createTeam} disabled={creating || !newTeamName.trim()}
                style={{ height:"38px", padding:"0 18px", borderRadius:"10px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, opacity:(!newTeamName.trim()||creating)?0.5:1 }}>
                {creating?"Creating…":"Create Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
