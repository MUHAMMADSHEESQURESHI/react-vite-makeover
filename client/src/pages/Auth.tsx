import { Link, useNavigate } from "react-router-dom";
import TopBar, { type NavItem } from "@/components/TopBar";
import { toast } from "sonner";

const links: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/leaderboard", label: "Leaderboard" },
];

const Auth = () => {
  const navigate = useNavigate();

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userSelect = document.getElementById('auth-user') as HTMLSelectElement;
    const roleSelect = document.getElementById('auth-role') as HTMLSelectElement;
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;

    const selectedUser = userSelect.options[userSelect.selectedIndex].text;
    const selectedValue = userSelect.value;
    const selectedRole = roleSelect.value;
    const email = emailInput.value;

    // Use consistent user IDs for demo users (for messaging to work)
    const userIdMap: Record<string, string> = {
      "user-1": "demo-user-ayesha",
      "user-2": "demo-user-hassan",
      "user-3": "demo-user-sara",
    };

    // Simulate demo login - save user data to localStorage
    const userData = {
      userId: userIdMap[selectedValue] || `demo-${Date.now()}`,
      userName: selectedUser,
      email: email,
      role: selectedRole.toLowerCase().replace(/\s+/g, '-') as 'need-help' | 'can-help' | 'both',
      skills: [],
    };

    console.log('Demo user logged in:', userData);
    localStorage.setItem("userId", userData.userId);
    localStorage.setItem("userName", selectedUser);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("user", JSON.stringify(userData));

    toast.success(`Welcome, ${selectedUser}!`);
    navigate('/dashboard');
  };

  return (
    <>
      <TopBar links={links} />
      <main className="auth-layout container">
        <div className="auth-wrap">
          <section className="auth-side fade-in">
            <p className="eyebrow">Community access</p>
            <h1 style={{ fontSize: "clamp(2.4rem, 4vw, 4rem)" }}>
              Enter the support network.
            </h1>
            <p>
              Choose a demo identity, set your role, and jump into a multi-page
              product flow designed for asking, offering, and tracking help with a
              premium interface.
            </p>
            <ul>
              <li>Role-based entry for Need Help, Can Help, or Both</li>
              <li>
                Direct path into dashboard, requests, AI Center, and community feed
              </li>
              <li>Persistent demo session powered by LocalStorage</li>
            </ul>
          </section>
          <section className="auth-card fade-in">
            <p className="section-kicker">Login / Signup</p>
            <h2>Authenticate your community profile</h2>
            <form className="stack" onSubmit={handleDemoLogin}>
              <div className="field">
                <label htmlFor="auth-user">Select demo user</label>
                <select id="auth-user" defaultValue="user-1">
                  <option value="user-1">Ayesha Khan</option>
                  <option value="user-2">Hassan Ali</option>
                  <option value="user-3">Sara Noor</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="auth-role">Role selection</label>
                <select id="auth-role" defaultValue="need-help">
                  <option value="need-help">Need Help</option>
                  <option value="can-help">Can Help</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="auth-grid">
                <div className="field">
                  <label>Email</label>
                  <input type="email" defaultValue="community@helphub.ai" />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" defaultValue="demo1234" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary bg-[#13ac9c]">
                Continue to dashboard
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
};

export default Auth;
