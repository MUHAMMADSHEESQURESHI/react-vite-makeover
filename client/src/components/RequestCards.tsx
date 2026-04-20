import { Link } from "react-router-dom";

export type RequestCardData = {
  id: string;
  category: string;
  urgency: string;
  status: string;
  statusVariant?: "success" | "default";
  urgencyVariant?: "urgent" | "default";
  title: string;
  description: string;
  tags: string[];
  author: string;
  meta: string;
};

export const sampleRequests: RequestCardData[] = [
  {
    id: "req-1",
    category: "Web Development",
    urgency: "High",
    urgencyVariant: "urgent",
    status: "Open",
    title: "Need help making my portfolio responsive before demo day",
    description:
      "My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.",
    tags: ["HTML/CSS", "Responsive", "Portfolio"],
    author: "Sara Noor",
    meta: "Karachi • 1 helper interested",
  },
  {
    id: "req-2",
    category: "Design",
    urgency: "Medium",
    status: "Open",
    title: "Looking for Figma feedback on a volunteer event poster",
    description:
      "I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.",
    tags: ["Figma", "Poster", "Design Review"],
    author: "Ayesha Khan",
    meta: "Lahore • 1 helper interested",
  },
  {
    id: "req-3",
    category: "Career",
    urgency: "Low",
    status: "Solved",
    statusVariant: "success",
    title: "Need mock interview support for internship applications",
    description:
      "Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.",
    tags: ["Interview Prep", "Career", "Frontend"],
    author: "Sara Noor",
    meta: "Remote • 2 helpers interested",
  },
];

export const RequestCard = ({ r }: { r: RequestCardData }) => (
  <article className="request-card fade-in">
    <div className="card-meta">
      <span className="tag">{r.category}</span>
      <span className={`tag${r.urgencyVariant === "urgent" ? " urgent" : ""}`}>
        {r.urgency}
      </span>
      <span className={`tag${r.statusVariant === "success" ? " success" : ""}`}>
        {r.status}
      </span>
    </div>
    <h3>{r.title}</h3>
    <p>{r.description}</p>
    <div className="tag-row">
      {r.tags.map((t) => (
        <span className="tag" key={t}>
          {t}
        </span>
      ))}
    </div>
    <div className="list-item" style={{ paddingBottom: 0, borderBottom: 0 }}>
      <div>
        <strong>{r.author}</strong>
        <p>{r.meta}</p>
      </div>
      <Link className="btn btn-secondary" to={`/requests/${r.id}`}>
        Open details
      </Link>
    </div>
  </article>
);
