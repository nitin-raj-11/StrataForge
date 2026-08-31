import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">((localStorage.getItem("theme") as "dark" | "light") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={`theme-control ${compact ? "compact" : ""}`}
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <SunIcon size={compact ? 14 : 15} />
      <span className="theme-slider" aria-hidden="true"><i className={theme === "light" ? "light" : ""} /></span>
      <MoonIcon size={compact ? 14 : 15} />
    </button>
  );
}
