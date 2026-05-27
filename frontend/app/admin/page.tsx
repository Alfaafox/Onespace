"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Search, Trash2, Shield, Users, FileText, CheckCircle, XCircle } from "lucide-react";

const DARK = { bg:"#0d0f18", card:"#1a1d2e", border:"#252840", text:"#e2e8f0", muted:"#8892a4", hint:"#55607a", input:"#1e2235", topbar:"#12151f" };
const LIGHT = { bg:"#f4f6fb", card:"#ffffff", border:"#e8edf3", text:"#111827", muted:"#64748b", hint:"#94a3b8", input:"#f8fafc", topbar:"#ffffff" };

interface User { id:number; username:string; email:string; role:string; verified:boolean; created_at:string; space_count:number; }
interface Stats { users:number; spaces:number; pages:number; unverified:number; }

export default function AdminPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const C = isDark ? DARK : LIGHT;

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
    const token = localStorage.getItem("token");
    if (token) document.cookie = `auth_token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get("http://192.168.11.69:5000/admin/users", { headers: authHeaders() }),
        axios.get("http://192.168.11.69:5000/admin/stats", { headers: authHeaders() }),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      if (err?.response?.status === 403) setUnauthorized(true);
    } finally { setLoading(false); }
  };

  const updateUser = async (userId: number, updates: Partial<{ role: string; verified: boolean }>) => {
    try {
      const res = await axios.put(`http://192.168.11.69:5000/admin/users/${userId}`, updates, { headers: authHeaders() });
      setUsers(p => p.map(u => u.id === userId ? { ...u, ...res.data } : u));
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to update user"); }
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`http://192.168.11.69:5000/admin/users/${userId}`, { headers: authHeaders() });
      setUsers(p => p.filter(u => u.id !== userId));
      if (stats) setStats({ ...stats, users: stats.users - 1 });
    } catch (err: any) { alert(err?.response?.data?.error || "Failed to delete user"); }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });

  if (unauthorized) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <Shield size={40} style={{ color:"#ef4444", margin:"0 auto 12px", display:"block" }}/>
          <h2 style={{ color:C.text, fontSize:"18px", fontWeight:700, margin:"0 0 8px" }}>Admin Access Required</h2>
          <p style={{ color:C.muted, fontSize:"14px", margin:"0 0 20px" }}>You don&apos;t have permission to access this page.</p>
          <button onClick={() => router.push("/dashboard")}
            style={{ background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"white", border:"none", borderRadius:"10px", padding:"10px 24px", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background:C.topbar, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", height:"62px", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <button onClick={() => router.push("/dashboard")}
              style={{ display:"flex", alignItems:"center", gap:"6px", color:C.muted, background:"none", border:"none", cursor:"pointer", fontSize:"13px" }}>
              <ArrowLeft size={14}/> Dashboard
            </button>
            <span style={{ color:C.border }}>|</span>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <Shield size={15} color="#7c3aed"/>
              <h1 style={{ color:C.text, fontSize:"16px", fontWeight:700, margin:0 }}>Admin Panel</h1>
            </div>
          </div>
          <button onClick={() => setIsDark(d => { localStorage.setItem("theme",!d?"dark":"light"); return !d; })}
            style={{ width:"32px", height:"32px", borderRadius:"8px", border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:"14px" }}>
            {isDark?"☀️":"🌙"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"24px" }}>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"24px" }}>
            {[
              { label:"Total Users", value:stats.users, icon:<Users size={18}/>, color:"#7c3aed", bg:isDark?"rgba(124,58,237,0.15)":"rgba(124,58,237,0.08)" },
              { label:"Total Spaces", value:stats.spaces, icon:<span style={{fontSize:"16px"}}>📁</span>, color:"#0ea5e9", bg:isDark?"rgba(14,165,233,0.15)":"rgba(14,165,233,0.08)" },
              { label:"Total Pages", value:stats.pages, icon:<FileText size={18}/>, color:"#10b981", bg:isDark?"rgba(16,185,129,0.15)":"rgba(16,185,129,0.08)" },
              { label:"Unverified", value:stats.unverified, icon:<XCircle size={18}/>, color:"#f59e0b", bg:isDark?"rgba(245,158,11,0.15)":"rgba(245,158,11,0.08)" },
            ].map(stat => (
              <div key={stat.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"18px 20px", display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:stat.bg, display:"flex", alignItems:"center", justifyContent:"center", color:stat.color, flexShrink:0 }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ color:C.text, fontSize:"22px", fontWeight:800, margin:0, lineHeight:1 }}>{stat.value}</p>
                  <p style={{ color:C.muted, fontSize:"12px", margin:"3px 0 0" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users table */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"20px", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <h2 style={{ color:C.text, fontSize:"15px", fontWeight:700, margin:0 }}>Users</h2>
            <div style={{ position:"relative", flex:1, maxWidth:"300px" }}>
              <Search size={13} style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", color:C.hint }}/>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users…"
                style={{ width:"100%", height:"36px", borderRadius:"9px", border:`1px solid ${C.border}`, background:C.input, color:C.text, paddingLeft:"30px", paddingRight:"12px", fontSize:"13px", outline:"none", boxSizing:"border-box" }}/>
            </div>
          </div>

          {loading ? (
            <div style={{ padding:"48px", textAlign:"center", color:C.hint }}>Loading users…</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                    {["User","Email","Role","Verified","Spaces","Joined","Actions"].map(h => (
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:C.hint, fontSize:"11.5px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr key={user.id} style={{ borderBottom:i<filteredUsers.length-1?`1px solid ${C.border}`:"none" }}>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                          <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"linear-gradient(135deg,#4f46e5,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"12px", fontWeight:700, flexShrink:0 }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color:C.text, fontSize:"13px", fontWeight:500 }}>{user.username}</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ color:C.muted, fontSize:"12.5px" }}>{user.email}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <select value={user.role} onChange={e => updateUser(user.id, { role: e.target.value })}
                          style={{ height:"28px", borderRadius:"7px", border:`1px solid ${C.border}`, background:user.role==="admin"?(isDark?"rgba(124,58,237,0.2)":"rgba(124,58,237,0.1)"):(isDark?"#1e2235":"#f9fafb"), color:user.role==="admin"?"#7c3aed":C.text, padding:"0 8px", fontSize:"12px", cursor:"pointer", outline:"none" }}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <button onClick={() => updateUser(user.id, { verified: !user.verified })}
                          style={{ display:"flex", alignItems:"center", gap:"5px", background:"none", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600, color:user.verified?"#10b981":"#f59e0b" }}>
                          {user.verified ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                          {user.verified ? "Verified" : "Unverified"}
                        </button>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ color:C.muted, fontSize:"12.5px" }}>{user.space_count}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ color:C.muted, fontSize:"12px" }}>{formatDate(user.created_at)}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <button onClick={() => deleteUser(user.id, user.username)}
                          style={{ width:"28px", height:"28px", borderRadius:"7px", background:"none", border:`1px solid rgba(239,68,68,0.3)`, cursor:"pointer", color:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Trash2 size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding:"40px", textAlign:"center", color:C.hint, fontSize:"13px" }}>
                        No users match your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
