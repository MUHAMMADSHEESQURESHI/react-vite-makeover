import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export type NavItem = { to: string; label: string; key?: string };

interface TopBarProps {
  links: NavItem[];
  activeKey?: string;
  actions?: ReactNode;
}

const Brand = () => (
  <Link className="brand" to="/">
    <span className="brand-badge">H</span>
    <span>HelpHub AI</span>
  </Link>
);

const TopBar = ({ links, activeKey, actions }: TopBarProps) => {
  return (
    <header className="topbar">
      <div className="container nav">
        <Brand />
        <nav className="nav-links">
          {links.map((l) => {
            const isActive = activeKey ? l.key === activeKey : false;
            return (
              <NavLink
                key={l.to + l.label}
                to={l.to}
                className={isActive ? "active" : undefined}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>
        {actions ? <div className="nav-actions">{actions}</div> : null}
      </div>
    </header>
  );
};

export default TopBar;
