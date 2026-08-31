import { useEffect } from "react";

export default function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return <div role="status" style={{
    position: "fixed", bottom: 24, right: 24, zIndex: 50, padding: "12px 20px",
    borderRadius: "var(--radius)", background: type === "success" ? "var(--signal-gain)" : "var(--signal-loss)",
    color: "var(--ink)", fontWeight: 600, boxShadow: "0 12px 32px rgba(0,0,0,.25)"
  }}>{message}</div>;
}
