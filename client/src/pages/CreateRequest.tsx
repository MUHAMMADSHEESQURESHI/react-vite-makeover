import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar, { type NavItem } from "@/components/TopBar";
import { helpRequestAPI } from "@/lib/api";
import { toast } from "sonner";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/create-request", label: "Create Request", key: "create" },
];

const categoryMap: Record<string, string> = {
  technical: "Technical",
  academic: "Academic",
  health: "Health",
  financial: "Financial",
  emotional: "Emotional",
  other: "Other",
};

const urgencyMap: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    category: "other",
    urgency: "medium",
  });
  const [aiSuggestions, setAiSuggestions] = useState<{
    category?: string;
    urgency?: string;
    tags?: string[];
  }>({});

  const handleAIAnalyze = async () => {
    if (!formData.description.trim()) {
      toast.error("Please enter a description first");
      return;
    }

    setAnalyzing(true);
    try {
      // Call backend AI analysis endpoint
      const result = await helpRequestAPI.analyzeRequest(formData.description);

      if (result.success) {
        setAiSuggestions({
          category: result.aiAnalysis?.category,
          urgency: result.aiAnalysis?.urgency,
          tags: result.aiAnalysis?.tags,
        });

        toast.success("AI analysis complete!");

        // Update form with AI suggestions
        setFormData((prev) => ({
          ...prev,
          category: result.aiAnalysis?.category || prev.category,
          urgency: result.aiAnalysis?.urgency || prev.urgency,
          tags: (result.aiAnalysis?.tags || []).join(", "),
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId") || "demo-user";
    const userName = localStorage.getItem("userName") || "Demo User";
    const userEmail = localStorage.getItem("userEmail") || "demo@example.com";

    const payload = {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      category: formData.category,
      urgency: formData.urgency as "low" | "medium" | "high",
      createdBy: userId,
      userName,
      userEmail,
    };

    console.log('Submitting request:', payload);
    console.log('User data from localStorage:', {
      userId,
      userName,
      userEmail,
      user: JSON.parse(localStorage.getItem("user") || "null"),
    });

    try {
      const result = await helpRequestAPI.create(payload);

      console.log('Server response:', result);

      if (result.success) {
        toast.success("Help request published!");
        // Reset form and redirect to explore page
        setFormData({
          title: "",
          description: "",
          tags: "",
          category: "other",
          urgency: "medium",
        });
        setAiSuggestions({});
        navigate('/explore');
      }
    } catch (error: any) {
      console.error('Create request error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar links={links} activeKey="create" />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Create request</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Turn a rough problem into a clear help request.
            </h1>
            <p>
              Use built-in AI suggestions for category, urgency, tags, and a
              stronger description rewrite.
            </p>
          </div>
        </section>
        <section className="detail-grid section">
          <form className="form-card stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="request-title">Title</label>
              <input
                id="request-title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Need review on my JavaScript quiz app before submission"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="request-description">Description</label>
              <textarea
                id="request-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful."
                required
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="request-tags">Tags</label>
                <input
                  id="request-tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="JavaScript, Debugging, Review"
                />
              </div>
              <div className="field">
                <label htmlFor="request-category">Category</label>
                <select
                  id="request-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="health">Health</option>
                  <option value="financial">Financial</option>
                  <option value="emotional">Emotional</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="request-urgency">Urgency</label>
                <select
                  id="request-urgency"
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency: e.target.value })
                  }
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="row">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleAIAnalyze}
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "✨ AI Suggest"}
              </button>
              <button
                className="btn btn-primary bg-[#13ac9c]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Request"}
              </button>
            </div>
          </form>
          <aside className="panel">
            <p className="section-kicker">AI assistant</p>
            <h2>Smart request guidance</h2>
            <div>
              <div className="metric">
                <span>Suggested category</span>
                <strong>
                  {aiSuggestions.category
                    ? categoryMap[aiSuggestions.category] || aiSuggestions.category
                    : "Enter description for AI suggestions"}
                </strong>
              </div>
              <div className="metric">
                <span>Detected urgency</span>
                <strong>
                  {aiSuggestions.urgency
                    ? urgencyMap[aiSuggestions.urgency] || aiSuggestions.urgency
                    : "Enter description for AI suggestions"}
                </strong>
              </div>
              <div className="metric">
                <span>Suggested tags</span>
                <strong>
                  {aiSuggestions.tags && aiSuggestions.tags.length > 0
                    ? aiSuggestions.tags.join(", ")
                    : "Enter description for AI suggestions"}
                </strong>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
};

export default CreateRequest;
