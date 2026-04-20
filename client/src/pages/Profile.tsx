import TopBar, { type NavItem } from "@/components/TopBar";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/onboarding", label: "Onboarding" },
  { to: "/profile", label: "Profile", key: "profile" },
];

const Profile = () => (
  <>
    <TopBar links={links} activeKey="profile" />
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Profile</p>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>Ayesha Khan</h1>
          <p>
            <span>Both</span> • <span>Karachi</span>
          </p>
        </div>
      </section>
      <section className="profile-grid section">
        <div className="stack">
          <div className="panel">
            <p className="section-kicker">Public profile</p>
            <h2>Skills and reputation</h2>
            <div className="metric">
              <span>Trust score</span>
              <strong>92%</strong>
            </div>
            <div className="metric">
              <span>Contributions</span>
              <strong>31</strong>
            </div>
            <div className="stack">
              <div>
                <strong>Skills</strong>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  <span className="tag">Figma</span>
                  <span className="tag">UI/UX</span>
                  <span className="tag">HTML/CSS</span>
                  <span className="tag">Career Guidance</span>
                </div>
              </div>
              <div>
                <strong>Badges</strong>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  <span className="tag">Design Ally</span>
                  <span className="tag">Fast Responder</span>
                  <span className="tag">Top Mentor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form className="form-card stack" onSubmit={(e) => e.preventDefault()}>
          <p className="section-kicker">Edit profile</p>
          <h2>Update your identity</h2>
          <div className="profile-form">
            <div className="field">
              <label>Name</label>
              <input name="name" type="text" />
            </div>
            <div className="field">
              <label>Location</label>
              <input name="location" type="text" />
            </div>
            <div className="field-full">
              <label>Skills</label>
              <input name="skills" type="text" />
            </div>
            <div className="field-full">
              <label>Interests</label>
              <input name="interests" type="text" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Save profile
          </button>
        </form>
      </section>
    </main>
  </>
);

export default Profile;
