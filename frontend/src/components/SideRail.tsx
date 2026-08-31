import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import CurrencyToggle from "./CurrencyToggle";
import { BoltIcon, ChartIcon, ClockIcon, CompareIcon, SaveIcon, UserIcon } from "./Icons";
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
  const initials = (userName || userEmail || "SF").split(/\s+/).filter(Boolean).slice(0, 2).map((v) => v[0]).join("").toUpperCase();

  return (
    <aside className="side-rail">
      <div className="rail-top">
        <Link to="/build" className="rail-brand"><span className="rail-mark"><BrandMark size={28} /></span><span>StrataForge</span></Link>
        <div className="rail-section">Research</div>
        <nav aria-label="Primary">
          {items.map(([path, label, Icon]) => (
            <Link to={path} key={path} className={`rail-link ${location.pathname === path ? "active" : ""}`}>
              <Icon size={17} />{label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="rail-footer">
        <CurrencyToggle compact />
        <ThemeToggle compact />
        <Link to="/profile" className={`rail-profile ${location.pathname === "/profile" ? "active" : ""}`} aria-label="Open profile">
          {userImageUrl ? <img src={userImageUrl} alt="" className="rail-avatar" /> : <span className="rail-avatar rail-avatar-fallback">{initials}</span>}
          <span className="rail-profile-copy">
            <strong>{userName || "Your profile"}</strong>
            <small>{userEmail}</small>
          </span>
          <UserIcon size={16}/>
        </Link>
        <button className="button button-secondary compact rail-logout" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}
