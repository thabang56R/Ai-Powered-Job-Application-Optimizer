import React from "react";
import { useParams } from "react-router-dom";
import http from "../api/http";

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = React.useState(null);
  const [evals, setEvals] = React.useState([]);
  const [audit, setAudit] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const load = async () => {
    setLoading(true);

    const list = await http.get("/candidates");
    const c = list.data.find((x) => x.id === id) ?? null;
    setCandidate(c);
    setNotes(c?.recruiterNotes ?? "");

    const ev = await http.get(`/evaluations/candidate/${id}`).catch(() => ({ data: [] }));
    setEvals(ev.data ?? []);

    const au = await http
      .get(`/audit?entityType=Candidate&entityId=${id}`)
      .catch(() => ({ data: [] }));
    setAudit(au.data ?? []);

    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, [id]);

  const parseJson = (s) => {
    try { return JSON.parse(s); } catch { return []; }
  };

  const saveNotes = async () => {
    if (!candidate) return;
    setMsg("");
    setSaving(true);
    try {
      await http.patch(`/candidates/${candidate.id}/status`, {
        status: candidate.status,
        recruiterNotes: notes,
      });
      setMsg("Saved ✅");
      await load(); // refresh audit trail too
    } catch (e) {
      setMsg(String(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  if (loading) return <div style={{ opacity: 0.7 }}>Loading...</div>;
  if (!candidate) return <div style={{ opacity: 0.7 }}>Candidate not found.</div>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>{candidate.fullName}</div>
        <div style={{ opacity: 0.75 }}>
          {candidate.email} • {candidate.phone} • <b>{candidate.status}</b>
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>Recruiter Notes</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{msg}</div>
        </div>

        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...input, marginTop: 10, fontFamily: "inherit" }}
          placeholder="Write internal notes about this candidate…"
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button style={btn} onClick={saveNotes} disabled={saving}>
            {saving ? "Saving..." : "Save Notes"}
          </button>
          <button style={btnGhost} onClick={load} disabled={saving}>
            Refresh
          </button>
        </div>
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>AI Evaluations</div>
        <div style={{ display: "grid", gap: 10 }}>
          {evals.map((e) => (
            <div key={e.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>Match: {e.matchScore}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(e.createdAtUtc).toLocaleString()}
                </div>
              </div>

              <SmallList title="Strengths" items={parseJson(e.strengthsJson)} />
              <SmallList title="Missing" items={parseJson(e.missingSkillsJson)} />
              <SmallList title="Risks" items={parseJson(e.risksJson)} />
            </div>
          ))}
          {evals.length === 0 && <div style={{ opacity: 0.7 }}>No evaluations yet.</div>}
        </div>
      </div>

      <div style={panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Audit Trail</div>
        <div style={{ display: "grid", gap: 10 }}>
          {audit.map((a) => (
            <div key={a.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900 }}>{a.action}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(a.createdAtUtc).toLocaleString()}
                </div>
              </div>
              <div style={{ opacity: 0.8, fontSize: 13, marginTop: 6 }}>
                Actor: <b>{a.actorEmail}</b>
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", opacity: 0.85 }}>Before / After</summary>
                <pre style={pre}>{a.beforeJson}</pre>
                <pre style={pre}>{a.afterJson}</pre>
              </details>
            </div>
          ))}
          {audit.length === 0 && <div style={{ opacity: 0.7 }}>No audit logs yet.</div>}
        </div>
      </div>
    </div>
  );
}

function SmallList({ title, items }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 900, fontSize: 13 }}>{title}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        {items.slice(0, 10).map((x, i) => (
          <span key={i} style={pill}>{x}</span>
        ))}
        {items.length === 0 && <span style={{ opacity: 0.7 }}>—</span>}
      </div>
    </div>
  );
}

const panel = { border: "1px solid #1f1f2a", borderRadius: 18, padding: 16, background: "#101018" };
const card = { border: "1px solid #1f1f2a", borderRadius: 16, padding: 14, background: "#0b0b0f" };
const pill = { padding: "6px 10px", borderRadius: 999, border: "1px solid #2a2a38", background: "#12121a", fontSize: 12 };
const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#0b0b0f", color: "white" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#1c1c28", color: "white", cursor: "pointer", fontWeight: 800 };
const btnGhost = { ...btn, background: "#12121a", fontWeight: 700 };
const pre = { marginTop: 8, padding: 10, borderRadius: 12, border: "1px solid #2a2a38", background: "#101018", overflowX: "auto", fontSize: 12 };