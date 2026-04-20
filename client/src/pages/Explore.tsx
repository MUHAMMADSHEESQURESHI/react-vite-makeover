import { useState, useEffect } from "react";
import TopBar, { type NavItem } from "@/components/TopBar";
import { RequestCard, type RequestCardData } from "@/components/RequestCards";
import { helpRequestAPI } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore", key: "explore" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/notifications", label: "Notifications" },
];

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestCardData[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    urgency: "",
    skill: "",
    location: "",
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.category) params.category = filters.category.toLowerCase();
      if (filters.urgency) params.urgency = filters.urgency.toLowerCase();

      console.log('Fetching requests with params:', params);
      const result = await helpRequestAPI.getAll(params);

      console.log('Backend response:', result);

      if (result.success) {
        const mappedRequests: RequestCardData[] = result.data.map((req: any) => ({
          id: req._id,
          category: req.category || "Other",
          urgency: req.urgency || "Medium",
          status: req.status || "Open",
          statusVariant: req.status === "solved" ? "success" : "default",
          urgencyVariant: req.urgency === "high" ? "urgent" : "default",
          title: req.title,
          description: req.description,
          tags: req.tags || [],
          author: req.createdBy?.name || "Anonymous",
          meta: `${req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Recent"} • ${req.assignedTo ? "1 helper assigned" : "Open for help"}`,
        }));
        console.log('Mapped requests:', mappedRequests);
        setRequests(mappedRequests);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchRequests();
  };

  return (
    <>
      <TopBar links={links} activeKey="explore" />
      <main className="container">
        <section className="page-hero">
          <div className="panel">
            <p className="eyebrow">Explore / Feed</p>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
              Browse help requests with filterable community context.
            </h1>
            <p>
              Filter by category, urgency, skills, and location to find the
              best matches.
            </p>
          </div>
        </section>
        <section className="feed-grid section flex flex-col md:flex-row gap-8">
          <div className="sidebar w-64 md:w-1/4 bg-white/50 backdrop-blur rounded-xl p-4">
            <form
              className="panel stack"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
            <div>
              <p className="section-kicker">Filters</p>
              <h2>Refine the feed</h2>
            </div>
            <div className="field">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All categories</option>
                <option value="technical">Technical</option>
                <option value="academic">Academic</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
                <option value="emotional">Emotional</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Urgency</label>
              <select
                name="urgency"
                value={filters.urgency}
                onChange={(e) => handleFilterChange("urgency", e.target.value)}
              >
                <option value="">All urgency levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="field">
              <label>Skills</label>
              <input
                name="skill"
                type="text"
                value={filters.skill}
                onChange={(e) => handleFilterChange("skill", e.target.value)}
                placeholder="JavaScript, Figma, Git"
              />
            </div>
            <div className="field">
              
              <label>Location</label>
              <input
                name="location"
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                placeholder="Karachi, Lahore, Remote"
              />
             </div>
             <button className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors" type="submit">
               Apply Filters
             </button>
          </form>
          </div>
          <div className="stack flex-1">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="request-card fade-in">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
                <p className="text-center text-sm text-muted">Loading requests...</p>
              </div>
            )}
            {!loading && requests.length === 0 && (
              <p className="text-center">No help requests found.</p>
            )}
            {!loading &&
              requests.map((r) => <RequestCard key={r.id} r={r} />)}
          </div>
        </section>
      </main>
    </>
  );
};

export default Explore;
