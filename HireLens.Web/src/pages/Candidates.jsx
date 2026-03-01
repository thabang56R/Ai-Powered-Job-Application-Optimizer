import React from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import CandidateTable from "../components/CandidateTable";
import EvalModal from "../components/EvalModal";

export default function Candidates() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [showEval, setShowEval] = React.useState(false);
  const [activeCandidate, setActiveCandidate] = React.useState(null);

  const [form, setForm] = React.useState({ fullName: "", email: "", phone: "" });
  const [err, setErr] = React.useState("");

  const load = async () => {
    setLoading(true);
    const cRes = await http.get("/api/candidates");
    setRows(cRes.data);

    // You may not have a JobsController GET endpoint yet — we’ll add if missing.
    const jRes = await http.get("/api/jobs").catch(() => ({ data: [] }));
    setJobs(jRes.data ?? []);
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  const createCandidate = async () => {
    setErr("");
    try {
      await http.post("/api/candidates", form);
      setForm({ fullName: "", email: "", phone: "" });
      await load();
    } catch (e) {
      setErr(String(e?.response?.data ?? e.message));
    }
  };

  const updateStatus = async (candidate, status) => {
    await http.patch(`/api/candidates/${candidate.id}/status`, { status, recruiterNotes: candidate.recruiterNotes ?? null });
    await load();
  };

  const openCandidate = (c) => nav(`/candidates/${c.id}`);

  const openEval = (c) => {
    setActiveCandidate(c);
    setShowEval(true);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Candidates</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>Workflow + audit trail lives in your API</div>
        </div>
        <div style={{ opacity: 0.7, fontSize: 13 }}>{loading ? "Loading..." : `${rows.length} total`}</div>
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Add Candidate</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr auto", gap: 10 }}>
          <input style={input} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input style={input} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input style={input} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button style={btn} onClick={createCandidate}>Create</button>
        </div>
        {err && <div style={{ color: "#ffb4b4", fontSize: 13, marginTop: 10 }}>{err}</div>}
      </div>

      <CandidateTable
        rows={rows}
        onOpen={openCandidate}
        onStatusChange={updateStatus}
      />

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Run AI Evaluation</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {rows.slice(0, 6).map((c) => (
            <button key={c.id} style={btnGhost} onClick={() => openEval(c)}>
              Evaluate {c.fullName}
            </button>
          ))}
          {rows.length === 0 && <div style={{ opacity: 0.7 }}>Create a candidate first.</div>}
        </div>
      </div>

      <EvalModal
        open={showEval}
        onClose={() => setShowEval(false)}
        candidate={activeCandidate ?? { id: "", fullName: "" }}
        jobs={jobs}
      />
    </div>
  );
}

const panel = { border: "1px solid #1f1f2a", borderRadius: 18, padding: 16, background: "#101018" };
const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#0b0b0f", color: "white" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#1c1c28", color: "white", cursor: "pointer", fontWeight: 800 };
const btnGhost = { ...btn, background: "#12121a", fontWeight: 700 };