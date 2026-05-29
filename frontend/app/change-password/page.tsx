"use client";

import { useState } from "react";
import axios from "axios";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = () => {
    if (newPassword.length === 0) return 0;
    if (newPassword.length < 6) return 1;
    if (newPassword.length < 10) return 2;
    return 3;
  };
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981"];
  const strengthLabels = ["", "Weak", "Medium", "Strong"];
  const ps = strength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://192.168.11.69:5000/users/change-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update password");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#08040f", fontFamily: "system-ui, sans-serif", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ background: "rgba(18,14,32,0.95)", border: "1px solid rgba(100,70,200,0.35)", borderRadius: "24px", padding: "40px", backdropFilter: "blur(20px)", boxShadow: "0 24px 80px rgba(80,40,180,0.2)" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <img src="/onespace.png" alt="OneSpace" style={{ height: "80px", display: "block", margin: "0 auto 14px", filter: "drop-shadow(0 0 14px rgba(140,80,255,0.5))" }}/>
            <h2 style={{ color: "#a78bfa", fontSize: "22px", fontWeight: 800, margin: "0 0 6px" }}>Set New Password</h2>
            <p style={{ color: "rgba(180,160,220,0.6)", fontSize: "13px", margin: 0 }}>
              Your account requires a new password before continuing.
            </p>
          </div>

          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: "0 auto 12px", display: "block" }}/>
              <h3 style={{ color: "#6ee7b7", fontSize: "16px", fontWeight: 700, margin: "0 0 6px" }}>Password Updated!</h3>
              <p style={{ color: "rgba(180,220,200,0.7)", fontSize: "13px", margin: 0 }}>Redirecting to dashboard…</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px" }}>
                  <p style={{ color: "#fca5a5", fontSize: "13px", margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ color: "rgba(200,180,255,0.8)", fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "rgba(130,100,200,0.6)" }}/>
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required
                      style={{ width: "100%", height: "46px", background: "rgba(30,20,60,0.8)", border: "1px solid rgba(100,70,200,0.4)", borderRadius: "12px", paddingLeft: "38px", paddingRight: "42px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}/>
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(130,100,200,0.6)", display: "flex" }}>
                      {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", marginBottom: "14px", alignItems: "center" }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= ps ? strengthColors[ps] : "rgba(100,70,200,0.2)", transition: "background 0.3s" }}/>
                    ))}
                    <span style={{ color: strengthColors[ps], fontSize: "11px", marginLeft: "6px", whiteSpace: "nowrap" }}>{strengthLabels[ps]}</span>
                  </div>
                )}

                {/* Confirm Password */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ color: "rgba(200,180,255,0.8)", fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "8px" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "rgba(130,100,200,0.6)" }}/>
                    <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password" required
                      style={{ width: "100%", height: "46px", background: "rgba(30,20,60,0.8)", border: `1px solid ${confirm && confirm !== newPassword ? "rgba(239,68,68,0.5)" : confirm && confirm === newPassword ? "rgba(16,185,129,0.5)" : "rgba(100,70,200,0.4)"}`, borderRadius: "12px", paddingLeft: "38px", paddingRight: "42px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}/>
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(130,100,200,0.6)", display: "flex" }}>
                      {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: "100%", height: "48px", background: "linear-gradient(135deg,#5b21b6,#7c3aed)", border: "none", borderRadius: "12px", color: "white", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Updating…" : <><span>Set New Password</span><ArrowRight size={17}/></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
