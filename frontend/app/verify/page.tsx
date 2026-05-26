"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }

    axios.get(`http://192.168.11.69:5000/verify?token=${token}`)
      .then(res => { setStatus("success"); setMessage(res.data.message); })
      .catch(err => { setStatus("error"); setMessage(err?.response?.data?.error || "Verification failed."); });
  }, []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#08040f", fontFamily:"system-ui, sans-serif" }}>
      <div style={{ background:"rgba(18,14,32,0.95)", border:"1px solid rgba(100,70,200,0.35)", borderRadius:"24px", padding:"48px 40px", textAlign:"center", maxWidth:"420px", width:"100%", margin:"24px" }}>

        <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"64px", height:"64px", borderRadius:"16px", background:"linear-gradient(135deg,#2d1a6e,#5b21b6)", marginBottom:"16px" }}>
          <img src="/onespace.png" alt="OneSpace" style={{ height:"36px", filter:"brightness(10)" }}/>
        </div>

        <h1 style={{ color:"#a78bfa", fontSize:"24px", fontWeight:800, margin:"0 0 8px" }}>OneSpace</h1>

        {status === "loading" && (
          <>
            <div style={{ width:"40px", height:"40px", borderRadius:"50%", border:"3px solid rgba(124,58,237,0.3)", borderTopColor:"#7c3aed", margin:"24px auto", animation:"spin 0.8s linear infinite" }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color:"rgba(180,160,220,0.7)", fontSize:"14px", margin:0 }}>Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(16,185,129,0.15)", border:"2px solid rgba(16,185,129,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"20px auto 16px" }}>
              <span style={{ fontSize:"24px" }}>✓</span>
            </div>
            <h2 style={{ color:"#6ee7b7", fontSize:"18px", fontWeight:700, margin:"0 0 8px" }}>Email Verified!</h2>
            <p style={{ color:"rgba(180,220,200,0.7)", fontSize:"14px", margin:"0 0 24px", lineHeight:1.5 }}>{message}</p>
            <a href="/login" style={{ display:"inline-block", background:"linear-gradient(135deg,#5b21b6,#7c3aed)", color:"white", textDecoration:"none", padding:"12px 32px", borderRadius:"12px", fontSize:"14px", fontWeight:600 }}>
              Sign In Now
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(239,68,68,0.15)", border:"2px solid rgba(239,68,68,0.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"20px auto 16px" }}>
              <span style={{ fontSize:"24px" }}>✕</span>
            </div>
            <h2 style={{ color:"#fca5a5", fontSize:"18px", fontWeight:700, margin:"0 0 8px" }}>Verification Failed</h2>
            <p style={{ color:"rgba(220,180,180,0.7)", fontSize:"14px", margin:"0 0 24px", lineHeight:1.5 }}>{message}</p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
              <a href="/login" style={{ color:"#a78bfa", textDecoration:"none", fontSize:"13px", padding:"10px 20px", border:"1px solid rgba(100,70,200,0.4)", borderRadius:"10px" }}>Back to Login</a>
              <a href="/register" style={{ background:"linear-gradient(135deg,#5b21b6,#7c3aed)", color:"white", textDecoration:"none", fontSize:"13px", padding:"10px 20px", borderRadius:"10px", fontWeight:600 }}>Register Again</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
