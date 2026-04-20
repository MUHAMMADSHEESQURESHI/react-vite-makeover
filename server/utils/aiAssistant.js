import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Analyze a help request description using Google Gemini
 * Returns JSON: { urgency, category, summary, tags }
 */
export async function analyzeRequest(description) {
  if (!description || typeof description !== "string") {
    return {
      urgency: "medium",
      category: "other",
      summary: "No description provided.",
      tags: [],
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this help request and return a JSON object with these fields:
- urgency: One of "high", "medium", or "low" based on how time-sensitive the request is
- category: One of "Technical", "Academic", "Health", "Financial", "Emotional", or "Other"
- summary: A single-line concise summary (max 10 words)
- tags: An array of 3-5 relevant keywords extracted from the description

Return ONLY valid JSON, no markdown fences or extra text.

Description: "${description}"

Example output:
{
  "urgency": "medium",
  "category": "Technical",
  "summary": "Need help debugging a React component.",
  "tags": ["react", "debugging", "component"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean potential markdown fences
    const jsonMatch = text.match(/```(?:json)?\n?([\s\S]*?)`/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text;

    const analysis = JSON.parse(jsonString);

    // Normalize values
    const urgency = ["high", "medium", "low"].includes(analysis.urgency?.toLowerCase())
      ? analysis.urgency.toLowerCase()
      : "medium";

    const categoryMap = {
      technical: "technical",
      academic: "academic",
      health: "health",
      financial: "financial",
      emotional: "emotional",
      other: "other",
    };

    const categoryRaw = analysis.category?.toLowerCase() || "other";
    const category = categoryMap[categoryRaw] || "other";

    return {
      urgency,
      category,
      summary: analysis.summary || "AI-generated summary",
      tags: Array.isArray(analysis.tags) ? analysis.tags.slice(0, 5) : [],
    };
  } catch (error) {
    console.error("Gemini AI analysis error:", error);
    // Fallback to simple heuristic analysis
    return fallbackAnalysis(description);
  }
}

/**
 * Fallback analysis using keyword matching if Gemini fails
 */
function fallbackAnalysis(text) {
  const lowerText = text.toLowerCase();

  // Urgency detection
  const highKeywords = ["emergency", "urgent", "immediately", "asap", "critical", "danger", "now", "deadline today"];
  const lowKeywords = ["when possible", "no rush", "whenever", "future planning", "not urgent"];

  let urgency = "medium";
  if (highKeywords.some((kw) => lowerText.includes(kw))) urgency = "high";
  else if (lowKeywords.some((kw) => lowerText.includes(kw))) urgency = "low";

  // Category detection
  const categoryKeywords = {
    technical: ["code", "programming", "bug", "software", "api", "database", "react", "javascript", "python", "server"],
    academic: ["assignment", "homework", "exam", "study", "lecture", "course", "university", "thesis"],
    health: ["doctor", "hospital", "medical", "illness", "pain", "symptoms", "health"],
    financial: ["money", "loan", "payment", "bills", "salary", "debt", "financial"],
    emotional: ["stress", "anxiety", "depression", "lonely", "emotional", "sad", "feelings"],
  };

  let category = "other";
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      category = cat;
      break;
    }
  }

  // Simple tag extraction (top 3 meaningful words)
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "to", "of",
    "in", "for", "on", "with", "at", "by", "from", "as", "into", "through",
    "during", "before", "after", "above", "below", "between", "under",
    "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "just", "and", "but", "if", "or", "because", "until", "while",
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
    "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
    "she", "her", "hers", "herself", "it", "its", "itself", "they", "them",
    "their", "theirs", "themselves", "what", "which", "who", "whom", "this",
    "that", "these", "those", "am", "about", "against", "over", "out", "up",
  ]);

  const words = lowerText
    .split(/\W+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
  const tags = [...new Set(words)].slice(0, 5);

  return {
    urgency,
    category,
    summary: `Help with ${category} issue`,
    tags,
  };
}
