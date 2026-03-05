import React from "react";

const badge = (status) => {
  const base = { padding: "6px 10px", borderRadius: 999, fontSize: 12, border: "1px solid #2a2a38" };
  return (
    <span style={{ ...base, background: "#12121a" }}>
      {status}
    </span>
  );
};

export default function CandidateTable({ rows, onOpen, onStatusChange }) {
  return (
    <div style={{ border: "1px solid #1f1f2a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#101018" }}>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #1f1f2a" }}>
                <td style={td}>{c.fullName}</td>
                <td style={td}>{c.email}</td>
                <td style={td}>{c.phone}</td>
                <td style={td}>{badge(c.status)}</td>
                <td style={td}>
                  <button style={btn} onClick={() => onOpen(c)}>Open</button>
                  <select
                    value={c.status}
                    onChange={(e) => onStatusChange(c, e.target.value)}
                    style={select}
                  >
                    {["New", "Shortlisted", "Interview", "Rejected", "Hired"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td style={{ ...td, padding: 18, opacity: 0.7 }} colSpan={5}>
                  No candidates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: "left", padding: 14, fontSize: 12, opacity: 0.8, fontWeight: 700 };
const td = { padding: 14, fontSize: 14 };
const btn = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #2a2a38",
  background: "#12121a",
  color: "white",
  cursor: "pointer",
  marginRight: 10,
};
const select = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid #2a2a38",
  background: "#0b0b0f",
  color: "white",
};
