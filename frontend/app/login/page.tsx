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
      if (res.data.forcePasswordChange) {
        window.location.href = "/change-password";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Login failed";
      setError(msg);
      if (err?.response?.data?.needsVerification) setNeedsVerification(true);
    } finally { setLoading(false); }
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

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#1e1458", fontFamily:"system-ui, sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.7} }
        .float-logo { animation: float 4s ease-in-out infinite; }
        .ring { animation: pulse-ring 2.5s ease-out infinite; }
        .ring-2 { animation: pulse-ring 2.5s ease-out infinite 0.8s; }
        .star { animation: twinkle 3s ease-in-out infinite; }
        input::placeholder { color: rgba(0,0,0,0.35); }
      `}</style>

      {/* LEFT PANEL — deep purple like Findoc.com */}
      <div style={{
        width:"520px", flexShrink:0, position:"relative", overflow:"hidden",
        background:"linear-gradient(160deg,#1a1050 0%,#2d1b69 40%,#1a1050 100%)",
        display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px",
      }}>
        {/* Purple glow orbs */}
        <div style={{ position:"absolute", top:"-80px", left:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.15),transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"80px", right:"-60px", width:"320px", height:"320px", borderRadius:"50%", background:"radial-gradient(circle,rgba(249,115,22,0.1),transparent 70%)", pointerEvents:"none" }}/>

        {/* Stars — orange like Findoc accent */}
        {[[20,15],[80,30],[60,10],[90,70],[10,80],[70,55],[30,90],[50,40]].map(([l,t],i) => (
          <div key={i} className="star" style={{ position:"absolute", left:`${l}%`, top:`${t}%`, width:"3px", height:"3px", borderRadius:"50%", background:"rgba(249,115,22,0.8)", animationDelay:`${i*0.4}s` }}/>
        ))}

        {/* FINDOC logo — orange+white like Findoc.com */}
        <div style={{ position:"relative", zIndex:10 }}>
          <img src="/findoclogo.png" alt="FINDOC" style={{ height:"48px", width:"auto", objectFit:"contain", filter:"brightness(0) invert(1)" }}/>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"12px", margin:"8px 0 0 2px", letterSpacing:"0.04em" }}>
            Digital Intelligence Platform
          </p>
        </div>

        {/* Center visual */}
        <div style={{ position:"relative", zIndex:10, display:"flex", justifyContent:"center", alignItems:"center", flex:1, padding:"20px 0" }}>
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div className="ring" style={{ position:"absolute", width:"200px", height:"200px", borderRadius:"50%", border:"1.5px solid rgba(249,115,22,0.4)" }}/>
            <div className="ring-2" style={{ position:"absolute", width:"160px", height:"160px", borderRadius:"50%", border:"1.5px solid rgba(249,115,22,0.3)" }}/>
            {/* Floating card — orange glow on purple */}
            <div className="float-logo" style={{ width:"130px", height:"130px", borderRadius:"28px", background:"linear-gradient(135deg,#2d1b69,#3d1e8a)", boxShadow:"0 0 60px rgba(249,115,22,0.35),0 0 120px rgba(45,27,105,0.5)", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(249,115,22,0.3)" }}>
              <img src="/onespace-icon.png" alt="OneSpace" style={{ height:"75px", filter:"brightness(0) invert(1)" }}/>
            </div>
            {[{top:"-30px",left:"-40px",icon:"👥"},{top:"-20px",right:"-50px",icon:"📄"},{bottom:"-20px",left:"-30px",icon:"🛡️"}].map((item,i) => (
              <div key={i} style={{ position:"absolute", ...(item.top?{top:item.top}:{}), ...(item.left?{left:item.left}:{}), ...((item as any).right?{right:(item as any).right}:{}), ...((item as any).bottom?{bottom:(item as any).bottom}:{}), width:"44px", height:"44px", borderRadius:"12px", background:"rgba(45,27,105,0.8)", backdropFilter:"blur(8px)", border:"1px solid rgba(249,115,22,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", animation:`float ${3+i*0.5}s ease-in-out infinite ${i*0.6}s` }}>
                {item.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div style={{ position:"relative", zIndex:10 }}>
          <h1 style={{ color:"#ffffff", fontSize:"36px", fontWeight:800, margin:"0 0 8px", letterSpacing:"-0.5px" }}>
            One<span style={{ color:"#f97316" }}>Space</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"16px", margin:"0 0 24px", lineHeight:1.5 }}>Your workspace for ideas,<br/>documents and collaboration.</p>
          <div style={{ width:"40px", height:"2px", background:"linear-gradient(90deg,#f97316,#ffffff)", marginBottom:"28px", borderRadius:"2px" }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
            {[
              { icon:"🛡️", title:"Secure",       desc:"Enterprise-grade security" },
              { icon:"👥", title:"Collaborative", desc:"Real-time team collaboration" },
              { icon:"☁️", title:"Accessible",    desc:"Access from any device" },
            ].map(f => (
              <div key={f.title}>
                <div style={{ fontSize:"20px", marginBottom:"6px" }}>{f.icon}</div>
                <p style={{ color:"#ffffff", fontSize:"13px", fontWeight:600, margin:"0 0 3px" }}>{f.title}</p>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"11px", margin:0, lineHeight:1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — WHITE card for the 30% white feel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", background:"linear-gradient(135deg,#2d1b69 0%,#1e1458 100%)" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>
          <div style={{ background:"#ffffff", border:"none", borderRadius:"24px", padding:"40px", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

            {/* Logos on white background */}
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <img
                src="/onespace-icon.png"
                alt="OneSpace Icon"
                style={{ height:"90px", width:"auto", display:"block", margin:"0 auto 12px", objectFit:"contain" }}
              />
              <img
                src="/onespace-text.png"
                alt="OneSpace"
                style={{ height:"36px", width:"auto", display:"block", margin:"0 auto 14px", objectFit:"contain" }}
              />
              <p style={{ color:"rgba(0,0,0,0.4)", fontSize:"14px", margin:0 }}>
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"12px 16px", marginBottom:"16px" }}>
                <p style={{ color:"#dc2626", fontSize:"13px", margin:"0 0 4px" }}>{error}</p>
                {needsVerification && (
                  <button onClick={resendVerification} disabled={resendLoading||resendDone}
                    style={{ color:"#f97316", background:"none", border:"none", cursor:"pointer", fontSize:"12px", padding:0, textDecoration:"underline" }}>
                    {resendDone?"✓ Sent!":resendLoading?"Sending...":"Resend verification email"}
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom:"16px" }}>
                <label style={{ color:"rgba(0,0,0,0.65)", fontSize:"13px", fontWeight:600, display:"block", marginBottom:"8px" }}>Email</label>
                <div style={{ position:"relative" }}>
                  <Mail size={16} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"rgba(0,0,0,0.3)" }}/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    placeholder="Enter your email" required
                    style={{ width:"100%", height:"48px", background:"#f5f5f5", border:"1px solid rgba(0,0,0,0.1)", borderRadius:"12px", paddingLeft:"42px", paddingRight:"16px", color:"#111", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom:"20px" }}>
                <label style={{ color:"rgba(0,0,0,0.65)", fontSize:"13px", fontWeight:600, display:"block", marginBottom:"8px" }}>Password</label>
                <div style={{ position:"relative" }}>
                  <Lock size={16} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"rgba(0,0,0,0.3)" }}/>
                  <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    style={{ width:"100%", height:"48px", background:"#f5f5f5", border:"1px solid rgba(0,0,0,0.1)", borderRadius:"12px", paddingLeft:"42px", paddingRight:"46px", color:"#111", fontSize:"14px", outline:"none", boxSizing:"border-box" }}/>
                  <button type="button" onClick={()=>setShowPass(!showPass)}
                    style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(0,0,0,0.3)", padding:0, display:"flex" }}>
                    {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
                <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
                  <div onClick={()=>setRemember(!remember)}
                    style={{ width:"18px", height:"18px", borderRadius:"5px", border:"1px solid rgba(249,115,22,0.6)", background:remember?"#f97316":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                    {remember&&<span style={{ color:"white", fontSize:"11px" }}>✓</span>}
                  </div>
                  <span style={{ color:"rgba(0,0,0,0.55)", fontSize:"13px" }}>Remember me</span>
                </label>
                <span style={{ color:"#f97316", fontSize:"13px", cursor:"pointer", fontWeight:500 }}>Forgot password?</span>
              </div>

              {/* Sign In button — untouched */}
              <button type="submit" disabled={loading}
                style={{ width:"100%", height:"50px", background:"linear-gradient(90deg,#ff6414,#a855f7)", border:"none", borderRadius:"12px", color:"white", fontSize:"15px", fontWeight:700, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", opacity:loading?0.7:1, transition:"opacity 0.2s" }}>
                {loading?"Signing in…":<><span>Sign In</span><ArrowRight size={18}/></>}
              </button>
            </form>

            {/* Register */}
            <div style={{ marginTop:"24px", paddingTop:"20px", borderTop:"1px solid rgba(0,0,0,0.08)", textAlign:"center" }}>
              <p style={{ color:"rgba(0,0,0,0.4)", fontSize:"13px", margin:0 }}>
                Don&apos;t have an account?{" "}
                <a href="/register" style={{ color:"#f97316", textDecoration:"none", fontWeight:600 }}>Create account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
