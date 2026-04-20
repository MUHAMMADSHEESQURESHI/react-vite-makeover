import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar, { type NavItem } from "@/components/TopBar";
import { userAPI, type UserData } from "@/lib/api";
import { toast } from "sonner";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/notifications", label: "Notifications" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    skills: "",
    role: "both" as UserData["role"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData: UserData = {
        name: formData.name,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        role: formData.role,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const result = await userAPI.onboard(userData);

      if (result.success) {
        const userData = {
          userId: result.data._id,
          userName: result.data.name,
          email: result.data.email,
          role: result.data.role,
          skills: result.data.skills,
        };
        console.log('User data saved:', userData);
        localStorage.setItem("userId", result.data._id);
        localStorage.setItem("userName", result.data.name);
        localStorage.setItem("userEmail", result.data.email);
        localStorage.setItem("userRole", result.data.role);
        localStorage.setItem("userSkills", JSON.stringify(result.data.skills));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Profile saved successfully!");
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar links={links} />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Onboarding</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Shape your support identity with AI suggestions.
            </h1>
            <p>
              Name your strengths, interests, and location so the system can
              recommend where you can help and where you may need backup.
            </p>
          </div>
        </section>
        <section className="two-col section">
          <form className="form-card stack" onSubmit={handleSubmit}>
            <div className="field">
              <label>Select Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserData["role"] })
                }
              >
                <option value="need-help">Need Help</option>
                <option value="can-help">Can Help</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div className="field">
                <label>Location</label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Karachi, Lahore, Remote"
                />
              </div>
              <div className="field-full">
                <label>Skills</label>
                <input
                  name="skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="JavaScript, UI/UX, Git, Python (comma separated)"
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
          <aside className="panel stack">
            <div>
              <p className="section-kicker">AI suggestions</p>
              <h2>Your likely contribution map</h2>
            </div>
            <div>
              <div className="metric">
                <span>You can likely help with</span>
                <strong>HTML/CSS, UI/UX, Career Guidance, Figma</strong>
              </div>
              <div className="metric">
                <span>You may want support in</span>
                <strong>JavaScript, React, Node.js, Python</strong>
              </div>
              <div className="metric">
                <span>Suggested role fit</span>
                <strong>Both</strong>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
};

export default Onboarding;
