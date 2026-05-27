"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setNeedsVerification(false);
    try {
      setLoading(true);
      const res = await axios.post("http://192.168.11.69:5000/login", { email, password });
      const token = res.data.token;
      localStorage.setItem("token", token);
      const maxAge = 7 * 24 * 60 * 60;
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      // If admin created this account, force password change first
      if (res.data.forcePasswordChange) {
        window.location.href = "/change-password";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Login failed";
      setError(msg);
      if (err?.response?.data?.needsVerification) setNeedsVerification(true);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setResendLoading(true);
      await axios.post("http://192.168.11.69:5000/resend-verification", { email });
      setResendDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to resend");
    } finally { setResendLoading(false); }
  };

  const FindocLogo = () => (
    <svg width="148" height="34" viewBox="0 0 148 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="30" height="34" rx="6" fill="#7c3aed"/>
      <path d="M19 0 L30 11 L19 11 Z" fill="rgba(0,0,0,0.22)"/>
      <rect x="6" y="7"  width="10" height="3" rx="1.5" fill="white"/>
      <rect x="6" y="14" width="13" height="3" rx="1.5" fill="white"/>
      <rect x="6" y="21" width="10" height="3" rx="1.5" fill="white"/>
      <text x="38" y="25" fontFamily="Arial,Helvetica,sans-serif" fontSize="22" fontWeight="800" fill="white" letterSpacing="1">FINDOC</text>
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#08040f", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.8} }
        .float-logo { animation: float 4s ease-in-out infinite; }
        .ring { animation: pulse-ring 2.5s ease-out infinite; }
        .ring-2 { animation: pulse-ring 2.5s ease-out infinite 0.8s; }
        .star { animation: twinkle 3s ease-in-out infinite; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: "520px", flexShrink: 0, position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg,#0d0720 0%,#1a0a3c 40%,#0e0520 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px",
      }}>
        <div style={{ position:"absolute", top:"-80px", left:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(110,40,220,0.35),transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"80px", right:"-60px", width:"320px", height:"320px", borderRadius:"50%", background:"radial-gradient(circle,rgba(80,20,180,0.4),transparent 70%)", pointerEvents:"none" }}/>
        {[[20,15],[80,30],[60,10],[90,70],[10,80],[70,55],[30,90],[50,40]].map(([l,t],i) => (
          <div key={i} className="star" style={{ position:"absolute", left:`${l}%`, top:`${t}%`, width:"3px", height:"3px", borderRadius:"50%", background:"rgba(180,140,255,0.8)", animationDelay:`${i*0.4}s` }}/>
        ))}

        {/* FINDOC logo top left */}
        <div style={{ position:"relative", zIndex:10 }}>
          <FindocLogo />
          <p style={{ color:"rgba(180,150,255,0.5)", fontSize:"12px", margin:"6px 0 0 2px", letterSpacing:"0.04em" }}>
            Digital Intelligence Platform
          </p>
        </div>

        {/* Center visual */}
        <div style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"center", alignItems:"center", flex:1, padding:"20px 0" }}>
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="ring" style={{ position:"absolute", width:"200px", height:"200px", borderRadius:"50%", border:"1px solid rgba(130,80,220,0.4)" }}/>
            <div className="ring-2" style={{ position:"absolute", width:"160px", height:"160px", borderRadius:"50%", border:"1px solid rgba(100,60,200,0.5)" }}/>
            <div className="float-logo" style={{ width:"130px", height:"130px", borderRadius:"28px", background:"linear-gradient(135deg,#2d1a6e,#5b21b6)", boxShadow:"0 0 60px rgba(120,60,220,0.6),0 0 120px rgba(90,30,180,0.3)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(150,100,255,0.3)" }}>
              <img src="/onespace.png" alt="OneSpace" style={{ height:"70px", filter:"brightness(10)" }}/>
            </div>
            {[{top:"-30px",left:"-40px",icon:"👥"},{top:"-20px",right:"-50px",icon:"📄"},{bottom:"-20px",left:"-30px",icon:"🛡️"}].map((item,i) => (
              <div key={i} style={{ position:"absolute", ...(item.top?{top:item.top}:{}), ...(item.left?{left:item.left}:{}), ...((item as any).right?{right:(item as any).right}:{}), ...((item as any).bottom?{bottom:(item as any).bottom}:{}), width:"44px", height:"44px", borderRadius:"12px", background:"rgba(60,20,120,0.7)", backdropFilter:"blur(8px)", border:"1px solid rgba(130,80,220,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", animation:`float ${3+i*0.5}s ease-in-out infinite ${i*0.6}s` }}>
                {item.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position:"relative", zIndex:10 }}>
          <h1 style={{ color:"#a78bfa", fontSize:"36px", fontWeight:800, margin:"0 0 8px", letterSpacing:"-0.5px" }}>OneSpace</h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"16px", margin:"0 0 24px", lineHeight:1.5 }}>Your workspace for ideas,<br/>documents and collaboration.</p>
          <div style={{ width:"40px", height:"2px", background:"linear-gradient(90deg,#7c3aed,#a855f7)", marginBottom:"28px", borderRadius:"2px" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
            {[
              { icon:"🛡️", title:"Secure",       desc:"Enterprise-grade security" },
              { icon:"👥", title:"Collaborative", desc:"Real-time team collaboration" },
              { icon:"☁️", title:"Accessible",    desc:"Access from any device" },
            ].map(f => (
              <div key={f.title}>
                <div style={{ fontSize:"20px", marginBottom:"6px" }}>{f.icon}</div>
                <p style={{ color:"rgba(200,180,255,0.9)", fontSize:"13px", fontWeight:600, margin:"0 0 3px" }}>{f.title}</p>
                <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"11px", margin:0, lineHeight:1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>
          <div style={{ background:"rgba(18,14,32,0.95)", border:"1px solid rgba(100,70,200,0.35)", borderRadius:"24px", padding:"40px", backdropFilter:"blur(20px)", boxShadow:"0 24px 80px rgba(80,40,180,0.2)" }}>

            {/* Logo only — no text */}
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <img
                src="/onespace.png"
                alt="OneSpace"
                style={{ height:"100px", display:"block", margin:"0 auto 16px", filter:"drop-shadow(0 0 18px rgba(140,80,255,0.55))" }}
              />
              <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"14px", margin:0 }}>
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"12px 16px", marginBottom:"16px" }}>
                <p style={{ color:"#fca5a5", fontSize:"13px", margin:"0 0 4px" }}>{error}</p>
                {needsVerification && (
                  <button onClick={resendVerification} disabled={resendLoading || resendDone}
                    style={{ color:"#a78bfa", background:"none", border:"none", cursor:"pointer", fontSize:"12px", padding:0, textDecoration:"underline" }}>
                    {resendDone ? "✓ Sent!" : resendLoading ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"13px", fontWeight:500, display:"block", marginBottom:"8px" }}>Email</label>
                <div style={{ position:"relative" }}>
                  <Mail size={16} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email" required
                    style={{ width:"100%", height:"48px", background:"rgba(30,20,60,0.8)", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"12px", paddingLeft:"42px", paddingRight:"16px", color:"white", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom:"20px" }}>
                <label style={{ color:"rgba(200,180,255,0.8)", fontSize:"13px", fontWeight:500, display:"block", marginBottom:"8px" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"rgba(130,100,200,0.6)" }}/>
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    style={{ width:"100%", height:"48px", background:"rgba(30,20,60,0.8)", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"12px", paddingLeft:"42px", paddingRight:"46px", color:"white", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(130,100,200,0.6)", padding:0, display:"flex" }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
                <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
                  <div onClick={() => setRemember(!remember)}
                    style={{ width:"18px", height:"18px", borderRadius:"5px", border:"1px solid rgba(100,70,200,0.5)", background:remember?"#7c3aed":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                    {remember && <span style={{ color:"white", fontSize:"11px" }}>✓</span>}
                  </div>
                  <span style={{ color:"rgba(180,160,220,0.7)", fontSize:"13px" }}>Remember me</span>
                </label>
                <span style={{ color:"#7c3aed", fontSize:"13px", cursor:"pointer" }}>Forgot password?</span>
              </div>

              {/* Sign In button */}
              <button type="submit" disabled={loading}
                style={{ width:"100%", height:"50px", background:"linear-gradient(135deg,#5b21b6,#7c3aed)", border:"none", borderRadius:"12px", color:"white", fontSize:"15px", fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:loading?0.7:1, transition:"opacity 0.2s" }}>
                {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={18}/></>}
              </button>
            </form>

            {/* Register link */}
            <div style={{ marginTop:"24px", paddingTop:"20px", borderTop:"1px solid rgba(100,70,200,0.2)", textAlign:"center" }}>
              <p style={{ color:"rgba(180,160,220,0.6)", fontSize:"13px", margin:0 }}>
                Don&apos;t have an account?{" "}
                <a href="/register" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Create account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
