import type { CSSProperties } from "react";

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--ink)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--paper)",
  fontSize: 15
};

export const buttonStyle: CSSProperties = {
  width: "100%",
  marginTop: 24,
  padding: "12px",
  background: "var(--amber)",
  color: "var(--ink)",
  border: "none",
  borderRadius: "var(--radius)",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 15
};
