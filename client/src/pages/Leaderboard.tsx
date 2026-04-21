import { useState, useEffect } from "react";
import TopBar, { type NavItem } from "@/components/TopBar";
import { leaderboardAPI, type LeaderboardEntry } from "@/lib/api";
import { toast } from "sonner";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/leaderboard", label: "Leaderboard", key: "leaderboard" },
];

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await leaderboardAPI.get(10, roleFilter || undefined);
      if (result.success) {
        setLeaderboard(result.data || []);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (err: any) {
      console.error("Leaderboard error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load leaderboard";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await leaderboardAPI.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err: any) {
      console.error("Stats error:", err);
      // Don't show toast for stats - it's optional
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [roleFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarClass = (index: number) => {
    const classes = ["teal", "dark", ""];
    return classes[index % classes.length];
  };

  return (
    <>
      <TopBar links={links} activeKey="leaderboard" />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Leaderboard</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Recognize the people who keep the community moving.
            </h1>
            <p>
              Trust score, contribution count, and badges create visible momentum
              for reliable helpers.
            </p>
          </div>
        </section>

        {/* Community Stats */}
        {stats && (
          <section className="section">
            <div className="panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div className="metric">
                <span>Total Members</span>
                <strong>{stats.totalUsers}</strong>
              </div>
              <div className="metric">
                <span>Help Requests</span>
                <strong>{stats.totalRequests}</strong>
              </div>
              <div className="metric">
                <span>Solved</span>
                <strong>{stats.solvedRequests}</strong>
              </div>
              <div className="metric">
                <span>Success Rate</span>
                <strong>{stats.successRate}%</strong>
              </div>
              <div className="metric">
                <span>Avg Trust Score</span>
                <strong>{stats.averageTrustScore}</strong>
              </div>
            </div>
          </section>
        )}

        <section className="leader-grid section">
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <p className="section-kicker">Top helpers</p>
                <h2>Rankings</h2>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border)" }}
              >
                <option value="">All Roles</option>
                <option value="can-help">Can Help</option>
                <option value="both">Both</option>
              </select>
            </div>

            {loading && <p className="text-center text-muted">Loading leaderboard...</p>}

            {!loading && error && (
              <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-muted mt-2">Make sure the backend server is running and connected to the database.</p>
              </div>
            )}

            {!loading && !error && leaderboard.length === 0 && (
              <div className="panel" style={{ textAlign: "center", padding: "2rem" }}>
                <p className="text-muted">No helpers found. Be the first to help!</p>
                <Link className="btn btn-primary mt-4" to="/onboarding">
                  Join the community
                </Link>
              </div>
            )}

            {!loading && !error && leaderboard.length > 0 && (
              <div className="rank-list">
                {leaderboard.map((entry, index) => (
                  <div className="rank-item" key={entry.user.id}>
                    <div className="user-line">
                      <div className={`avatar ${getAvatarClass(index)}`}>
                        {getInitials(entry.user.name)}
                      </div>
                      <div>
                        <strong>#{entry.rank} {entry.user.name}</strong>
                        <p>{entry.user.skills?.join(", ") || "No skills listed"}</p>
                      </div>
                    </div>
                    <div className="center">
                      <strong>{entry.stats.trustScore}%</strong>
                      <p>{entry.stats.solvedRequests} solved</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <p className="section-kicker">Trust & Achievement</p>
            <h2>How trust scores work</h2>
            <div className="stack">
              <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                Trust scores increase when you help others and decrease when
                requests you accepted go unresolved. Start at 100% and build
                your reputation.
              </p>
              <div className="metric">
                <span>✓ Help someone</span>
                <strong>+5 points</strong>
              </div>
              <div className="metric">
                <span>✗ Unresolved request</span>
                <strong>-10 points</strong>
              </div>
              <div className="metric">
                <span>🏆 Top 3 helper</span>
                <strong>Badge earned</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Leaderboard;
