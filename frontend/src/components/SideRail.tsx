import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import CurrencyToggle from "./CurrencyToggle";
import {
  BoltIcon,
  ChartIcon,
  ClockIcon,
  CompareIcon,
  SaveIcon,
  UserIcon,
} from "./Icons";
import BrandMark from "./BrandMark";

const items = [
  ["/build", "Build", BoltIcon],
  ["/results", "Latest Result", ChartIcon],
  ["/history", "Result History", ClockIcon],
  ["/compare", "Compare", CompareIcon],
  ["/saved", "Saved Strategies", SaveIcon],
] as const;

export default function SideRail({
                                   userEmail,
                                   userName,
                                   userImageUrl,
                                   onLogout,
                                 }: {
  userEmail: string;
  userName?: string;
  userImageUrl?: string;
  onLogout: () => void;
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (userName || userEmail || "SF")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((v) => v[0])
      .join("")
      .toUpperCase();

  const closeMobileMenu = () => setMobileOpen(false);

  return (
      <>
        <div className="mobile-app-header">
          <button
              type="button"
              className={`mobile-rail-toggle ${mobileOpen ? "open" : ""}`}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <Link to="/build" className="mobile-app-brand">
          <span className="mobile-app-brand-mark">
            <BrandMark size={24} />
          </span>
            <span>StrataForge</span>
          </Link>

          <div className="mobile-app-currency">
            <CurrencyToggle compact />
          </div>
        </div>

        {mobileOpen && (
            <button
                type="button"
                className="mobile-rail-backdrop"
                aria-label="Close navigation"
                onClick={closeMobileMenu}
            />
        )}

        <aside className={`side-rail ${mobileOpen ? "mobile-open" : ""}`}>
          <div className="rail-top">
            <Link
                to="/build"
                className="rail-brand"
                onClick={closeMobileMenu}
            >
            <span className="rail-mark">
              <BrandMark size={28} />
            </span>
              <span>StrataForge</span>
            </Link>

            <div className="rail-section">Research</div>

            <nav aria-label="Primary">
              {items.map(([path, label, Icon]) => (
                  <Link
                      to={path}
                      key={path}
                      className={`rail-link ${
                          location.pathname === path ? "active" : ""
                      }`}
                      onClick={closeMobileMenu}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
              ))}
            </nav>
          </div>

          <div className="rail-footer">
            <div className="rail-desktop-controls">
              <CurrencyToggle compact />
              <ThemeToggle compact />
            </div>

            <Link
                to="/profile"
                className={`rail-profile ${
                    location.pathname === "/profile" ? "active" : ""
                }`}
                aria-label="Open profile"
                onClick={closeMobileMenu}
            >
              {userImageUrl ? (
                  <img
                      src={userImageUrl}
                      alt=""
                      className="rail-avatar"
                  />
              ) : (
                  <span className="rail-avatar rail-avatar-fallback">
                {initials}
              </span>
              )}

              <span className="rail-profile-copy">
              <strong>{userName || "Your profile"}</strong>
              <small>{userEmail}</small>
            </span>

              <UserIcon size={16} />
            </Link>

            <div className="rail-mobile-theme">
              <ThemeToggle compact />
            </div>

            <button
                className="button button-secondary compact rail-logout"
                onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </aside>
      </>
  );
}