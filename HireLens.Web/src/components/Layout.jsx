import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navLinkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "white" : "#e6e6e6",
  background: isActive ? "#2b2b2b" : "transparent",
});

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", color: "white" }}>
      <div style={{ display: "flex" }}>
        <aside
          style={{
            width: 260,
            padding: 16,
            borderRight: "1px solid #1f1f2a",
            position: "sticky",
            top: 0,
            height: "100vh",
            background: "#0b0b0f",
          }}
        >
          <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.4 }}>
              HireLens
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>Recruiter Intelligence</div>
            </div>
          </Link>

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            <NavLink to="/dashboard" style={navLinkStyle}>Dashboard</NavLink>
            <NavLink to="/candidates" style={navLinkStyle}>Candidates</NavLink>
            <NavLink to="/jobs" style={navLinkStyle}>Jobs</NavLink>
            <NavLink to="/rankings" style={navLinkStyle}>Rankings</NavLink>
          </div>

          <div style={{ marginTop: 24, padding: 12, border: "1px solid #1f1f2a", borderRadius: 14 }}>
            <div style={{ fontWeight: 700 }}>{user?.fullName ?? "User"}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{user?.email}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Role: {user?.role}</div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #2a2a38",
                background: "#12121a",
                color: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 22 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}