import React from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

export default function Dashboard() {
  const [candidates, setCandidates] = React.useState([]);
  const [jobs, setJobs] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const [cRes, jRes] = await Promise.all([
        http.get("/api/candidates"),
        http.get("/api/jobs").catch(() => ({ data: [] })), // in case you haven't created jobs endpoint yet
      ]);
      setCandidates(cRes.data);
      setJobs(jRes.data ?? []);
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>Dashboard</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
        <Card title="Candidates" value={candidates.length} href="/candidates" />
        <Card title="Jobs" value={jobs.length} href="/jobs" />
        <Card title="AI Evaluations" value="—" href="/candidates" />
      </div>

      <div style={{ opacity: 0.75 }}>
        Welcome to AI Job Application Optimizer System . A One stop for Recruiters and Job Seekers.
      </div>
    </div>
  );
}

function Card({ title, value, href }) {
  return (
    <Link to={href} style={{ textDecoration: "none", color: "white" }}>
      <div style={{ border: "1px solid #1f1f2a", borderRadius: 18, padding: 16, background: "#101018" }}>
        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
      </div>
    </Link>
  );
}