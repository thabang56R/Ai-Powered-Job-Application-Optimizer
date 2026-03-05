import React from "react";
import http from "../api/http";

export default function EvalModal({ open, onClose, candidate, jobs }) {
  const safeCandidate = candidate ?? { id: "", fullName: "Unknown" };
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const [jobId, setJobId] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [latestResume, setLatestResume] = React.useState(null);

  const [loadingUpload, setLoadingUpload] = React.useState(false);
  const [loadingEval, setLoadingEval] = React.useState(false);

  const [result, setResult] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open) return;

    setJobId("");
    setFile(null);
    setResult(null);
    setErr("");
    setLatestResume(null);

    // fetch latest resume if candidate id exists
    (async () => {
      if (!safeCandidate.id) return;
      try {
        const res = await http.get(`/resumes/latest/${safeCandidate.id}`);
        setLatestResume(res.data);
      } catch (e) {
        
        setLatestResume(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, safeCandidate.id]);

  if (!open) return null;

  const uploadPdf = async () => {
    setErr("");

    if (!safeCandidate.id) return setErr("Candidate is missing (no candidateId). Close and retry.");
    if (!file) return setErr("Choose a PDF file first.");

    const form = new FormData();
    form.append("candidateId", safeCandidate.id);
    form.append("file", file);

    try {
      setLoadingUpload(true);
      const res = await http.post("/resumes/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLatestResume(res.data);
      setErr("");
    } catch (e) {
      setErr(formatErr(e));
    } finally {
      setLoadingUpload(false);
    }
  };

  const runEval = async () => {
    setErr("");
    setResult(null);

    if (!safeCandidate.id) return setErr("Candidate is missing (no candidateId). Close and retry.");
    if (!jobId) return setErr("Choose a job first.");
    if (!latestResume) return setErr("Upload a resume PDF first (or extraction failed).");

    try {
      setLoadingEval(true);
      const res = await http.post("/evaluations", {
        candidateId: safeCandidate.id,
        jobPostingId: jobId,
        resumeTextOverride: null,
      });
      setResult(res.data);
    } catch (e) {
      setErr(formatErr(e));
    } finally {
      setLoadingEval(false);
    }
  };

  const parseJson = (maybeJson) => {
    try { return JSON.parse(maybeJson); } catch { return []; }
  };

  const strengths = result ? parseJson(result.strengthsJson) : [];
  const missing = result ? parseJson(result.missingSkillsJson) : [];
  const risks = result ? parseJson(result.risksJson) : [];
  const suggestions = result ? parseJson(result.suggestionsJson) : [];
  const evidence = result ? parseJson(result.evidenceJson) : [];

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>AI Evaluation</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {safeCandidate.fullName} • {safeCandidate.id || "no-id"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Jobs loaded: {safeJobs.length}
            </div>
          </div>
          <button style={xBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <label style={label}>Job</label>
          <select value={jobId} onChange={(e) => setJobId(e.target.value)} style={input}>
            <option value="">Select a job…</option>
            {safeJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} @ {j.company}
              </option>
            ))}
          </select>

          <div style={row}>
            <div style={{ flex: 1 }}>
              <label style={label}>Upload Resume PDF</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ marginTop: 8, color: "white" }}
              />
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                {latestResume
                  ? `Latest: ${latestResume.fileName} (${latestResume.extractedChars} chars)`
                  : "No resume uploaded yet."}
              </div>
            </div>

            <button style={btn} onClick={uploadPdf} disabled={loadingUpload}>
              {loadingUpload ? "Uploading..." : "Upload"}
            </button>
          </div>

          {err && (
            <div style={errBox}>
              <b>Request failed:</b>
              <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
            </div>
          )}

          <button style={primaryBtn} onClick={runEval} disabled={loadingEval}>
            {loadingEval ? "Evaluating..." : "Run Evaluation"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 18, borderTop: "1px solid #1f1f2a", paddingTop: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>{result.matchScore}</div>
              <div style={{ opacity: 0.7 }}>Match Score</div>
            </div>

            <Section title="Strengths" items={strengths} />
            <Section title="Missing Skills" items={missing} />
            <Section title="Risks" items={risks} />
            <Section title="Suggestions" items={suggestions} />

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Evidence</div>
              <div style={{ display: "grid", gap: 8 }}>
                {evidence.map((ev, idx) => (
                  <div key={idx} style={card}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{ev.skill}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>{ev.snippet}</div>
                  </div>
                ))}
                {evidence.length === 0 && <div style={{ opacity: 0.7, fontSize: 13 }}>No evidence returned.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatErr(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (status) return `HTTP ${status}\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`;
  return String(e?.message ?? e);
}

function Section({ title, items }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((x, i) => (
          <span key={i} style={pill}>{x}</span>
        ))}
        {items.length === 0 && <span style={{ opacity: 0.7, fontSize: 13 }}>—</span>}
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "grid",
  placeItems: "center",
  padding: 16,
  zIndex: 9999, 
};

const modal = {
  width: "min(860px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  background: "#0b0b0f",
  border: "1px solid #1f1f2a",
  borderRadius: 18,
  padding: 16,
};

const xBtn = {
  border: "1px solid #2a2a38",
  background: "#12121a",
  color: "white",
  borderRadius: 12,
  padding: "8px 10px",
  cursor: "pointer",
};

const label = { fontSize: 12, opacity: 0.75, fontWeight: 700 };

const input = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #2a2a38",
  background: "#101018",
  color: "white",
};

const row = { display: "flex", gap: 12, alignItems: "end" };

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #2a2a38",
  background: "#12121a",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  height: 42,
};

const primaryBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #2a2a38",
  background: "#1c1c28",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const pill = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #2a2a38",
  background: "#12121a",
  fontSize: 12,
};

const card = {
  border: "1px solid #1f1f2a",
  borderRadius: 14,
  padding: 12,
  background: "#101018",
};

const errBox = {
  border: "1px solid #5a2a2a",
  background: "#1a0f0f",
  padding: 12,
  borderRadius: 12,
  color: "#ffb4b4",
  fontSize: 13,
};
