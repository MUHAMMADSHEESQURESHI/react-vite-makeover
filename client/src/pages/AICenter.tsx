import TopBar, { type NavItem } from "@/components/TopBar";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/ai", label: "AI Center", key: "ai" },
];

const AICenter = () => (
  <>
    <TopBar links={links} activeKey="ai" />
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">AI Center</p>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
            See what the platform intelligence is noticing.
          </h1>
          <p>
            AI-like insights summarize demand trends, helper readiness, urgency
            signals, and request recommendations.
          </p>
        </div>
      </section>
      <section className="stack section">
        <div className="mini-grid">
          <div className="stat-card">
            <p className="eyebrow">Trend pulse</p>
            <div className="stat-value">Web Development</div>
            <p>Most common support area based on active community requests.</p>
          </div>
          <div className="stat-card">
            <p className="eyebrow">Urgency watch</p>
            <div className="stat-value">1</div>
            <p>Requests currently flagged high priority by the urgency detector.</p>
          </div>
          <div className="stat-card">
            <p className="eyebrow">Mentor pool</p>
            <div className="stat-value">2</div>
            <p>Trusted helpers with strong response history and contribution signals.</p>
          </div>
        </div>
        <div className="panel">
          <p className="section-kicker">AI recommendations</p>
          <h2>Requests needing attention</h2>
          <div className="stack">
            <div className="timeline-item">
              <strong>Need help making my portfolio responsive before demo day</strong>
              <p>
                Responsive layout issue with a short deadline. Best helpers are
                frontend mentors comfortable with CSS grids and media queries.
              </p>
              <div className="tag-row">
                <span className="tag">Web Development</span>
                <span className="tag">High</span>
              </div>
            </div>
            <div className="timeline-item">
              <strong>Looking for Figma feedback on a volunteer event poster</strong>
              <p>
                A visual design critique request where feedback on hierarchy,
                spacing, and messaging would create the most value.
              </p>
              <div className="tag-row">
                <span className="tag">Design</span>
                <span className="tag">Medium</span>
              </div>
            </div>
            <div className="timeline-item">
              <strong>Need mock interview support for internship applications</strong>
              <p>
                Career coaching request focused on confidence-building, behavioral
                answers, and entry-level frontend interviews.
              </p>
              <div className="tag-row">
                <span className="tag">Career</span>
                <span className="tag">Low</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </>
);

export default AICenter;
