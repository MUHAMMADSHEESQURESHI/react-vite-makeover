import { Link } from "react-router-dom";
import TopBar, { type NavItem } from "@/components/TopBar";
import { RequestCard, sampleRequests } from "@/components/RequestCards";
import { useEffect, useState } from "react";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", key: "dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/create-request", label: "Create Request" },
  { to: "/messages", label: "Messages" },
  { to: "/profile", label: "Profile" },
];

const Dashboard = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    setUserName(storedName || "there");
  }, []);

  return (
    <div className="site-shell">
      <TopBar
        links={links}
        activeKey="dashboard"
        actions={
          <>
            <Link className="pill" to="/notifications">
              Notifications
            </Link>
            <Link className="btn btn-primary" to="/ai">
              Open AI Center
            </Link>
          </>
        }
      />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Dashboard</p>
            <h1 style={{ fontSize: "clamp(2.3rem, 4vw, 4.2rem)" }}>
              Welcome back, <span>{userName}</span>.
            </h1>
            <p>
              Your command center for requests, AI insights, helper momentum, and
              live community activity.
            </p>
          </div>
        </section>

      <section className="mini-grid section">
        <div className="stat-card">
          <p className="eyebrow">Trust score</p>
          <div className="stat-value">92%</div>
          <p>Driven by solved requests and consistent support.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Helping</p>
          <div className="stat-value">2</div>
          <p>Requests where you are currently listed as a helper.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Open requests</p>
          <div className="stat-value">2</div>
          <p>Community requests currently active across the feed.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">AI pulse</p>
          <div className="stat-value">1 trends</div>
          <p>Trend count detected in the latest request activity.</p>
        </div>
      </section>

      <section className="dashboard-grid section">
        <div className="stack">
          <div className="section-head">
            <div>
              <p className="section-kicker">Recent requests</p>
              <h2>What the community needs right now</h2>
            </div>
            <Link className="btn btn-secondary" to="/explore">
              Go to feed
            </Link>
          </div>
          <div className="stack">
            {sampleRequests.map((r) => (
              <RequestCard key={r.id} r={r} />
            ))}
          </div>
        </div>
        <div className="stack">
          <div className="panel">
            <p className="section-kicker">AI insights</p>
            <h3>Suggested actions for you</h3>
            <div>
              <div className="metric">
                <span>Most requested category</span>
                <strong>Web Development</strong>
              </div>
              <div className="metric">
                <span>Your strongest trust driver</span>
                <strong>Design Ally</strong>
              </div>
              <div className="metric">
                <span>AI says you can mentor in</span>
                <strong>HTML/CSS, UI/UX, Career Guidance, Figma</strong>
              </div>
              <div className="metric">
                <span>Your active requests</span>
                <strong>1</strong>
              </div>
            </div>
          </div>
          <div className="panel">
            <p className="section-kicker">Notifications</p>
            <h3>Latest updates</h3>
            <div className="notif-list">
              <div className="notif-item">
                <div>
                  <strong>
                    New helper matched to your responsive portfolio request
                  </strong>
                  <p>Match • 12 min ago</p>
                </div>
                <span className="tag urgent">Unread</span>
              </div>
              <div className="notif-item">
                <div>
                  <strong>
                    Your trust score increased after a solved request
                  </strong>
                  <p>Reputation • 1 hr ago</p>
                </div>
                <span className="tag urgent">Unread</span>
              </div>
              <div className="notif-item">
                <div>
                  <strong>
                    AI Center detected rising demand for interview prep
                  </strong>
                  <p>Insight • Today</p>
                </div>
                <span className="tag">Read</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
  );
};

export default Dashboard;
