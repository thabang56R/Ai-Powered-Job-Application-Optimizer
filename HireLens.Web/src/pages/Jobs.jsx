import React from "react";
import http from "../api/http";

export default function Jobs() {
  const [jobs, setJobs] = React.useState([]);
  const [form, setForm] = React.useState({ title: "", company: "", descriptionText: "" });
  const [err, setErr] = React.useState("");

  const load = async () => {
    const res = await http.get("/jobs").catch(() => ({ data: [] }));
    setJobs(res.data ?? []);
  };

  React.useEffect(() => { load(); }, []);

  const createJob = async () => {
    setErr("");
    try {
      await http.post("/evaluations/jobs", form); 
      setForm({ title: "", company: "", descriptionText: "" });
      await load();
    } catch (e) {
      setErr(String(e?.response?.data ?? e.message));
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>Jobs</div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Create Job</div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input style={input} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <textarea
            rows={8}
            style={{ ...input, fontFamily: "inherit" }}
            placeholder="Job description text"
            value={form.descriptionText}
            onChange={(e) => setForm({ ...form, descriptionText: e.target.value })}
          />
          {err && <div style={{ color: "#ffb4b4", fontSize: 13 }}>{err}</div>}
          <button style={btn} onClick={createJob}>Create Job</button>
        </div>
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Existing Jobs</div>
        <div style={{ display: "grid", gap: 10 }}>
          {jobs.map((j) => (
            <div key={j.id} style={card}>
              <div style={{ fontWeight: 900 }}>{j.title} <span style={{ opacity: 0.7 }}>@ {j.company}</span></div>
              <div style={{ opacity: 0.75, fontSize: 13, marginTop: 6, whiteSpace: "pre-wrap" }}>
                {String(j.descriptionText ?? "").slice(0, 240)}{(j.descriptionText ?? "").length > 240 ? "..." : ""}
              </div>
            </div>
          ))}
          {jobs.length === 0 && <div style={{ opacity: 0.7 }}>No jobs yet.</div>}
        </div>
      </div>
    </div>
  );
}

const panel = { border: "1px solid #1f1f2a", borderRadius: 18, padding: 16, background: "#101018" };
const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#0b0b0f", color: "white" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#1c1c28", color: "white", cursor: "pointer", fontWeight: 800 };
const card = { border: "1px solid #1f1f2a", borderRadius: 16, padding: 14, background: "#0b0b0f" };