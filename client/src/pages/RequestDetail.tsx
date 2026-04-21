import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar, { type NavItem } from "@/components/TopBar";
import { helpRequestAPI } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const links: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/explore", label: "Explore" },
  { to: "/leaderboard", label: "Leaderboard" },
];

const urgencyColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-300",
  solved: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const categoryIcons: Record<string, string> = {
  technical: "💻",
  academic: "📚",
  health: "🏥",
  financial: "💰",
  emotional: "💙",
  other: "📌",
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await helpRequestAPI.getById(id);

        if (result.success) {
          setRequest(result.data);
        } else {
          toast.error("Request not found");
          navigate("/explore");
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        const status = error.response?.status;
        if (status === 404 || status === 400) {
          toast.error("Request not found or invalid ID");
        } else {
          toast.error(error.response?.data?.message || "Failed to load request details");
        }
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  if (loading) {
    return (
      <>
        <TopBar links={links} activeKey="explore" />
        <main className="container">
          <div className="panel stack space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!request) {
    return null;
  }

  const author = request.createdBy;
  const urgencyVariant = request.urgency || "medium";
  const statusVariant = request.status || "open";
  const categoryKey = request.category?.toLowerCase() || "other";

  return (
    <>
      <TopBar links={links} activeKey="explore" />
      <main className="container">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="panel">
            <button
              onClick={() => navigate("/explore")}
              className="text-sm text-muted hover:text-foreground mb-4 flex items-center gap-2"
            >
              ← Back to Explore
            </button>
            <p className="eyebrow">Request Details</p>
            <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
              {request.title}
            </h1>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="detail-grid section" style={{ gridTemplateColumns: "2fr 1fr" }}>
          {/* Left Column - Main Details */}
          <Card className="form-card stack">
            <CardContent className="space-y-6">
              {/* Category & Urgency Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  {categoryIcons[categoryKey] || "📌"} {request.category || "Other"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-sm ${urgencyColors[urgencyVariant] || urgencyColors.medium}`}
                >
                  {urgencyVariant.charAt(0).toUpperCase() + urgencyVariant.slice(1)} Urgency
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-sm ${statusColors[statusVariant] || statusColors.open}`}
                >
                  {statusVariant.charAt(0).toUpperCase() + statusVariant.slice(1)}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {request.description}
                </p>
              </div>

              {/* Tags */}
              {request.tags && request.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {request.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary Section */}
              {request.aiSummary && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    ✨ AI Summary
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {request.aiSummary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Author Info & Meta */}
          <div className="stack">
            {/* Author Card */}
            <Card className="form-card">
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">Posted By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                    {author?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="font-medium">{author?.name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">
                      {author?.role || "Member"}
                    </p>
                  </div>
                </div>
                {author?.trustScore && (
                  <div className="metric">
                    <span>Trust Score</span>
                    <strong className="text-emerald-600">{author.trustScore}</strong>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meta Info Card */}
            <Card className="form-card">
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">Request Info</h3>
                <div className="metric">
                  <span>Posted</span>
                  <strong>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently"}
                  </strong>
                </div>
                {request.assignedTo && (
                  <div className="metric">
                    <span>Assigned Helper</span>
                    <strong>{request.assignedTo.name || "Assigned"}</strong>
                  </div>
                )}
                {!request.assignedTo && statusVariant === "open" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-800 font-medium">
                      Open for help
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Button */}
            {statusVariant === "open" && !request.assignedTo && (
              <button
                className="btn btn-primary bg-[#13ac9c] w-full"
                onClick={() => {
                  toast.success("Help offer sent! (Demo)");
                }}
              >
                Offer Help
              </button>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default RequestDetail;
