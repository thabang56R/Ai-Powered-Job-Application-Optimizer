import React from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("Recruiter");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      const res = await http.post("/auth/register", { fullName, email, password, role });
      login(res.data);
      nav("/dashboard");
    } catch (e2) {
      setErr(String(e2?.response?.data ?? e2.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Create account</div>
        <div style={{ opacity: 0.7, marginTop: 6 }}>Recruiter/Admin access</div>

        <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <input style={input} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select style={input} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>

          {err && <div style={{ color: "#ffb4b4", fontSize: 13 }}>{err}</div>}
          <button style={btn} disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        </form>

        <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
          Already have an account? <Link to="/login" style={{ color: "white" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b0f", color: "white", padding: 16 };
const card = { width: "min(420px, 100%)", border: "1px solid #1f1f2a", borderRadius: 18, padding: 18, background: "#101018" };
const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#0b0b0f", color: "white" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#1c1c28", color: "white", cursor: "pointer", fontWeight: 800 };