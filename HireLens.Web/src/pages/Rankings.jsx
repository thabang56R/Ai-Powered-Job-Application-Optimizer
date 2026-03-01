import React from "react";
import http from "../api/http";

export default function Rankings() {
  const [jobs, setJobs] = React.useState([]);
  const [jobId, setJobId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");

  // Explain modal state
  const [openExplain, setOpenExplain] = React.useState(false);
  const [explainLoading, setExplainLoading] = React.useState(false);
  const [explainErr, setExplainErr] = React.useState("");
  const [explainData, setExplainData] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/api/jobs");
        setJobs(res.data ?? []);
      } catch (e) {
        setErr(String(e?.response?.data ?? e.message));
      }
    })();
  }, []);

  const run = async () => {
    setErr("");
    setData(null);

    if (!jobId) {
      setErr("Select a job first.");
      return;
    }

    try {
      setLoading(true);
      const res = await http.get(`/api/rankings/jobs/${jobId}/candidates`);
      setData(res.data);
    } catch (e) {
      setErr(String(e?.response?.data ?? e.message));
    } finally {
      setLoading(false);
    }
  };

  const openWhy = async (candidateId) => {
    setExplainErr("");
    setExplainData(null);
    setOpenExplain(true);

    try {
      setExplainLoading(true);
      const res = await http.get(`/api/rankings/jobs/${jobId}/candidates/${candidateId}/explain`);
      setExplainData(res.data);
    } catch (e) {
      setExplainErr(String(e?.response?.data ?? e.message));
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>Semantic Rankings</div>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          Embeddings score + evidence-based “Why” panel.
        </div>
      </div>

      <div style={panel}>
        <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
          <div style={{ minWidth: 320, flex: 1 }}>
            <div style={label}>Job</div>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)} style={input}>
              <option value="">Select a job…</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Jobs loaded: {jobs.length}
            </div>
          </div>

          <button style={btn} onClick={run} disabled={loading}>
            {loading ? "Ranking..." : "Rank Candidates"}
          </button>
        </div>

        {err && (
          <div style={errBox}>
            <b>Error:</b>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
          </div>
        )}
      </div>

      {data && (
        <div style={panel}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>
            Results: {data.jobTitle} @ {data.company}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#101018" }}>
                <tr>
                  <th style={th}>Rank</th>
                  <th style={th}>Candidate</th>
                  <th style={th}>Email</th>
                  <th style={th}>Status</th>
                  <th style={th}>Semantic Score</th>
                  <th style={th}>Why</th>
                </tr>
              </thead>
              <tbody>
                {data.ranked.map((c, idx) => (
                  <tr key={c.candidateId} style={{ borderTop: "1px solid #1f1f2a" }}>
                    <td style={td}>#{idx + 1}</td>
                    <td style={td}>{c.fullName}</td>
                    <td style={td}>{c.email}</td>
                    <td style={td}>{c.status}</td>
                    <td style={td}>
                      <span style={scorePill}><b>{c.semanticScore}</b></span>
                    </td>
                    <td style={td}>
                      <button style={btnGhost} onClick={() => openWhy(c.candidateId)}>
                        Explain
                      </button>
                    </td>
                  </tr>
                ))}

                {data.ranked.length === 0 && (
                  <tr>
                    <td style={{ ...td, opacity: 0.7 }} colSpan={6}>
                      No candidates with resumes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Tip: “Explain” shows matched/missing job terms with evidence snippets from the resume.
          </div>
        </div>
      )}

      <ExplainModal
        open={openExplain}
        onClose={() => setOpenExplain(false)}
        loading={explainLoading}
        err={explainErr}
        data={explainData}
      />
    </div>
  );
}

function ExplainModal({ open, onClose, loading, err, data }) {
  if (!open) return null;

  return (
    <div style={backdrop} onMouseDown={onClose}>
      <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Why this score?</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {data?.candidateName ?? "Candidate"}
              {typeof data?.semanticScore === "number" ? ` • Semantic: ${data.semanticScore}` : ""}
            </div>
          </div>
          <button style={xBtn} onClick={onClose}>✕</button>
        </div>

        {loading && <div style={{ marginTop: 14, opacity: 0.8 }}>Loading explanation…</div>}

        {err && (
          <div style={{ ...errBox, marginTop: 14 }}>
            <b>Error:</b>
            <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{err}</div>
          </div>
        )}

        {data && !loading && !err && (
          <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
            <div style={card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Matched job terms</div>
              <div style={chips}>
                {(data.matchedTerms ?? []).map((t, i) => <span key={i} style={pill}>{t}</span>)}
                {(data.matchedTerms ?? []).length === 0 && <span style={{ opacity: 0.7 }}>—</span>}
              </div>
            </div>

            <div style={card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Missing job terms</div>
              <div style={chips}>
                {(data.missingTerms ?? []).map((t, i) => <span key={i} style={pillGhost}>{t}</span>)}
                {(data.missingTerms ?? []).length === 0 && <span style={{ opacity: 0.7 }}>—</span>}
              </div>
            </div>

            <div style={card}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Evidence snippets</div>
              <div style={{ display: "grid", gap: 10 }}>
                {(data.evidence ?? []).map((e, i) => (
                  <div key={i} style={evidenceCard}>
                    <div style={{ fontWeight: 900, fontSize: 13 }}>{e.term}</div>
                    <div style={{ opacity: 0.85, fontSize: 13 }}>{e.snippet}</div>
                  </div>
                ))}
                {(data.evidence ?? []).length === 0 && <div style={{ opacity: 0.7 }}>No snippets found.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const panel = { border: "1px solid #1f1f2a", borderRadius: 18, padding: 16, background: "#101018" };
const label = { fontSize: 12, opacity: 0.75, fontWeight: 700, marginBottom: 6 };
const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#0b0b0f", color: "white", width: "100%" };
const btn = { padding: "10px 12px", borderRadius: 12, border: "1px solid #2a2a38", background: "#1c1c28", color: "white", cursor: "pointer", fontWeight: 800, height: 42 };
const btnGhost = { padding: "8px 10px", borderRadius: 12, border: "1px solid #2a2a38", background: "#12121a", color: "white", cursor: "pointer", fontWeight: 800 };

const th = { textAlign: "left", padding: 14, fontSize: 12, opacity: 0.8, fontWeight: 700 };
const td = { padding: 14, fontSize: 14 };

const scorePill = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #2a2a38",
  background: "#0b0b0f",
};

const errBox = {
  marginTop: 12,
  border: "1px solid #5a2a2a",
  background: "#1a0f0f",
  padding: 12,
  borderRadius: 12,
  color: "#ffb4b4",
  fontSize: 13,
};

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
  width: "min(920px, 100%)",
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

const card = { border: "1px solid #1f1f2a", borderRadius: 16, padding: 14, background: "#101018" };
const chips = { display: "flex", flexWrap: "wrap", gap: 8 };
const pill = { padding: "6px 10px", borderRadius: 999, border: "1px solid #2a2a38", background: "#12121a", fontSize: 12 };
const pillGhost = { ...pill, background: "#0b0b0f", opacity: 0.85 };
const evidenceCard = { border: "1px solid #2a2a38", borderRadius: 14, padding: 12, background: "#0b0b0f" };