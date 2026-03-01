import React from "react";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    const raw = localStorage.getItem("hirelens_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [token, setToken] = React.useState(() => localStorage.getItem("hirelens_token"));

  const login = ({ token, user }) => {
    localStorage.setItem("hirelens_token", token);
    localStorage.setItem("hirelens_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("hirelens_token");
    localStorage.removeItem("hirelens_user");
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, isAuthed: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}