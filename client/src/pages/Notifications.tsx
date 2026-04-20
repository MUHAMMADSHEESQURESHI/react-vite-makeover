import { useState } from "react";
import TopBar, { type NavItem } from "@/components/TopBar";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/notifications", label: "Notifications", key: "notifications" },
];

type NoteState = { id: string; title: string; meta: string; read: boolean };

const initial: NoteState[] = [
  {
    id: "note-1",
    title: "New helper matched to your responsive portfolio request",
    meta: "Match • 12 min ago",
    read: false,
  },
  {
    id: "note-2",
    title: "Your trust score increased after a solved request",
    meta: "Reputation • 1 hr ago",
    read: false,
  },
  {
    id: "note-3",
    title: "AI Center detected rising demand for interview prep",
    meta: "Insight • Today",
    read: true,
  },
];

const Notifications = () => {
  const [notes, setNotes] = useState(initial);
  const toggle = (id: string) =>
    setNotes((ns) => ns.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <>
      <TopBar links={links} activeKey="notifications" />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Notifications</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Stay updated on requests, helpers, and trust signals.
            </h1>
            <p>
              Track new matches, solved items, AI insights, and reputation
              changes in one place.
            </p>
          </div>
        </section>
        <section className="section">
          <div className="panel">
            <p className="section-kicker">Live updates</p>
            <h2>Notification feed</h2>
            <div className="notif-list">
              {notes.map((n) => (
                <div className="notif-item" key={n.id}>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.meta}</p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => toggle(n.id)}
                  >
                    {n.read ? "Read" : "Unread"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Notifications;
