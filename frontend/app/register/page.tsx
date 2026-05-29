"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devLink, setDevLink] = useState("");

  useEffect(() => {
    // Pre-fill email from invite link
    const params = new URLSearchParams(window.location.search);
    const inviteEmail = params.get("email");
    if (inviteEmail) setEmail(decodeURIComponent(inviteEmail));
  }, []);

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Weak", "Medium", "Strong"];
  const ps = passwordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      const res = await axios.post("http://192.168.11.69:5000/register", { username, email, password });
      setSuccess(res.data.message);
      if (res.data.verifyUrl) setDevLink(res.data.verifyUrl);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#08040f", fontFamily:"system-ui, sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.8} }
        .float-logo { animation: float 4s ease-in-out infinite; }
        .ring { animation: pulse-ring 2.5s ease-out infinite; }
        .ring-2 { animation: pulse-ring 2.5s ease-out infinite 0.8s; }
        .star { animation: twinkle 3s ease-in-out infinite; }
      `}</style>

      {/* Left panel — same as login */}
      <div style={{ width:"520px", flexShrink:0, position:"relative", overflow:"hidden", background:"linear-gradient(160deg,#0d0720 0%,#1a0a3c 40%,#0e0520 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px" }}>
        <div style={{ position:"absolute", top:"-80px", left:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(110,40,220,0.35),transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"80px", right:"-60px", width:"320px", height:"320px", borderRadius:"50%", background:"radial-gradient(circle,rgba(80,20,180,0.4),transparent 70%)", pointerEvents:"none" }}/>
        {[[20,15],[80,30],[60,10],[90,70],[10,80],[70,55]].map(([l,t],i) => (
          <div key={i} className="star" style={{ position:"absolute", left:`${l}%`, top:`${t}%`, width:"3px", height:"3px", borderRadius:"50%", background:"rgba(180,140,255,0.8)", animationDelay:`${i*0.4}s` }}/>
        ))}
        <div style={{ position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <img src="/onespace.png" alt="OneSpace" style={{ height:"28px", filter:"brightness(10) saturate(0.5) hue-rotate(240deg)" }}/>
            <span style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:500, letterSpacing:"0.05em" }}>ONESPACE</span>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"center", alignItems:"center", flex:1, padding:"20px 0" }}>
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="ring" style={{ position:"absolute", width:"200px", height:"200px", borderRadius:"50%", border:"1px solid rgba(130,80,220,0.4)" }}/>
            <div className="ring-2" style={{ position:"absolute", width:"160px", height:"160px", borderRadius:"50%", border:"1px solid rgba(100,60,200,0.5)" }}/>
            <div className="float-logo" style={{ width:"130px", height:"130px", borderRadius:"28px", background:"linear-gradient(135deg,#2d1a6e,#5b21b6)", boxShadow:"0 0 60px rgba(120,60,220,0.6)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(150,100,255,0.3)" }}>
              <img src="/onespace.png" alt="OneSpace" style={{ height:"70px", filter:"brightness(10)" }}/>
            </div>
          </div>
        </div>
        <div style={{ position:"relative", zIndex:10 }}>
          <h1 style={{ color:"#a78bfa", fontSize:"36px", fontWeight:800, margin:"0 0 8px" }}>Join OneSpace</h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"16px", margin:"0 0 24px", lineHeight:1.5 }}>Create your account and start<br/>collaborating with your team.</p>
          <div style={{ width:"40px", height:"2px", background:"linear-gradient(90deg,#7c3aed,#a855f7)", marginBottom:"28px", borderRadius:"2px" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
            {[{icon:"⚡",title:"Quick Setup",desc:"Get started in under 60 seconds"},{icon:"🔐",title:"Secure",desc:"Your data is always protected"},{icon:"🌐",title:"Accessible",desc:"Works from any device"}].map(f => (
              <div key={f.title}>
                <div style={{ fontSize:"20px", marginBottom:"6px" }}>{f.icon}</div>
                <p style={{ color:"rgba(200,180,255,0.9)", fontSize:"13px", fontWeight:600, margin:"0 0 3px" }}>{f.title}</p>
                <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"11px", margin:0, lineHeight:1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>
          <div style={{ background:"rgba(18,14,32,0.95)", border:"1px solid rgba(100,70,200,0.35)", borderRadius:"24px", padding:"36px", backdropFilter:"blur(20px)", boxShadow:"0 24px 80px rgba(80,40,180,0.2)" }}>

            <div style={{ textAlign:"center", marginBottom:"20px" }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"52px", height:"52px", borderRadius:"14px", background:"linear-gradient(135deg,#2d1a6e,#5b21b6)", marginBottom:"10px" }}>
                <img src="/onespace.png" alt="OneSpace" style={{ height:"28px", filter:"brightness(10)" }}/>
              </div>
              <h2 style={{ color:"#a78bfa", fontSize:"24px", fontWeight:800, margin:"0 0 4px" }}>Create account</h2>
              <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"13px", margin:0 }}>Fill in your details to get started</p>
            </div>

            {success ? (
              <div style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"16px", padding:"24px", textAlign:"center" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(16,185,129,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                  <Check size={24} color="#10b981"/>
                </div>
                <h3 style={{ color:"#6ee7b7", fontSize:"16px", fontWeight:700, margin:"0 0 8px" }}>Account created!</h3>
                <p style={{ color:"rgba(180,220,200,0.7)", fontSize:"13px", margin:"0 0 16px", lineHeight:1.5 }}>{success}</p>
                {devLink && (
                  <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:"8px", padding:"10px", marginBottom:"12px" }}>
                    <p style={{ color:"#f59e0b", fontSize:"11px", margin:"0 0 4px" }}>⚠️ DEV MODE — SMTP not configured. Use this link:</p>
                    <a href={devLink} style={{ color:"#a78bfa", fontSize:"11px", wordBreak:"break-all" }}>{devLink}</a>
                  </div>
                )}
                <a href="/login" style={{ display:"inline-block", background:"linear-gradient(135deg,#5b21b6,#7c3aed)", color:"white", textDecoration:"none", padding:"10px 24px", borderRadius:"10px", fontSize:"13px", fontWeight:600 }}>
                  Go to Sign In
                </a>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"10px 14px", marginBottom:"14px" }}>
                    <p style={{ color:"#fca5a5", fontSize:"13px", margin:0 }}>{error}</p>
                  </div>
                )}
                <form onSubmit={handleRegister}>
                  {/* Full name */}
                  <div style={{ marginBottom:"12px" }}>
                    <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"12.5px", fontWeight:500, display:"block", marginBottom:"6px" }}>Full name</label>
                    <div style={{ position:"relative" }}>
                      <User size={15} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                      <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your full name" required
                        style={{ width:"100%", height:"44px", background:"rgba(30,20,60,0.8)", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"10px", paddingLeft:"38px", paddingRight:"14px", color:"white", fontSize:"13.5px", outline:"none", boxSizing:"border-box" }}/>
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom:"12px" }}>
                    <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"12.5px", fontWeight:500, display:"block", marginBottom:"6px" }}>Email address</label>
                    <div style={{ position:"relative" }}>
                      <Mail size={15} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" required
                        style={{ width:"100%", height:"44px", background:"rgba(30,20,60,0.8)", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"10px", paddingLeft:"38px", paddingRight:"14px", color:"white", fontSize:"13.5px", outline:"none", boxSizing:"border-box" }}/>
                    </div>
                  </div>
                  {/* Password */}
                  <div style={{ marginBottom:"6px" }}>
                    <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"12.5px", fontWeight:500, display:"block", marginBottom:"6px" }}>Password</label>
                    <div style={{ position:"relative" }}>
                      <Lock size={15} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                      <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 6 characters" required
                        style={{ width:"100%", height:"44px", background:"rgba(30,20,60,0.8)", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"10px", paddingLeft:"38px", paddingRight:"40px", color:"white", fontSize:"13.5px", outline:"none", boxSizing:"border-box" }}/>
                      <button type="button" onClick={()=>setShowPass(!showPass)}
                        style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(130,100,200,0.6)", padding:0, display:"flex" }}>
                        {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div style={{ display:"flex", gap:"4px", marginBottom:"12px" }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background: i <= ps ? strengthColors[ps] : "rgba(100,70,200,0.2)", transition:"background 0.3s" }}/>
                      ))}
                      <span style={{ color:strengthColors[ps], fontSize:"11px", marginLeft:"4px", whiteSpace:"nowrap" }}>{strengthLabels[ps]}</span>
                    </div>
                  )}
                  {/* Confirm */}
                  <div style={{ marginBottom:"20px" }}>
                    <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"12.5px", fontWeight:500, display:"block", marginBottom:"6px" }}>Confirm password</label>
                    <div style={{ position:"relative" }}>
                      <Lock size={15} style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                      <input type={showConfirm?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" required
                        style={{ width:"100%", height:"44px", background:"rgba(30,20,60,0.8)", border:`1px solid ${confirm&&confirm!==password?"rgba(239,68,68,0.5)":confirm&&confirm===password?"rgba(16,185,129,0.5)":"rgba(100,70,200,0.4)"}`, borderRadius:"10px", paddingLeft:"38px", paddingRight:"40px", color:"white", fontSize:"13.5px", outline:"none", boxSizing:"border-box" }}/>
                      <button type="button" onClick={()=>setShowConfirm(!showConfirm)}
                        style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(130,100,200,0.6)", padding:0, display:"flex" }}>
                        {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ width:"100%", height:"48px", background:"linear-gradient(135deg,#5b21b6,#7c3aed)", border:"none", borderRadius:"12px", color:"white", fontSize:"15px", fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:loading?0.7:1 }}>
                    {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={17}/></>}
                  </button>
                </form>
                <div style={{ marginTop:"20px", paddingTop:"16px", borderTop:"1px solid rgba(100,70,200,0.2)", textAlign:"center" }}>
                  <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"13px", margin:0 }}>
                    Already have an account?{" "}
                    <a href="/login" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Sign in</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
