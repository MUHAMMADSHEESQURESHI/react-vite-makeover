import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Training data for urgency detection
const urgencyTrainingData = [
  // High urgency keywords
  { text: 'emergency urgent immediately asap critical danger help now', label: 'high' },
  { text: 'life threatening crisis emergency room hospital ambulance', label: 'high' },
  { text: 'deadline today tonight right away rush priority', label: 'high' },
  { text: 'desperate need urgent help required immediately', label: 'high' },

  // Medium urgency
  { text: 'soon quickly fast needed tomorrow this week', label: 'medium' },
  { text: 'important matter needs attention fairly urgent', label: 'medium' },
  { text: 'would like help as soon as possible', label: 'medium' },
  { text: 'need assistance within few days', label: 'medium' },

  // Low urgency
  { text: 'when possible whenever convenient no rush', label: 'low' },
  { text: 'general inquiry looking for information', label: 'low' },
  { text: 'future planning not time sensitive', label: 'low' },
  { text: 'casual question can wait', label: 'low' },
];

// Training data for category detection
const categoryTrainingData = [
  { text: 'code programming bug error software development api database', label: 'technical' },
  { text: 'computer laptop phone device not working broken technical', label: 'technical' },
  { text: 'assignment homework exam study lecture notes academic', label: 'academic' },
  { text: 'course curriculum learning education university college', label: 'academic' },
  { text: 'doctor hospital health medical illness pain symptoms', label: 'health' },
  { text: 'medicine therapy treatment wellness mental health', label: 'health' },
  { text: 'money loan payment bills salary financial issue', label: 'financial' },
  { text: 'budget expense investment debt funding finance', label: 'financial' },
  { text: 'stress anxiety depression lonely sad emotional support', label: 'emotional' },
  { text: 'counseling therapy talk mental wellness feelings', label: 'emotional' },
];

// Initialize and train the classifier
function initializeClassifier() {
  // Train urgency classifier
  urgencyTrainingData.forEach(({ text, label }) => {
    classifier.addDocument(text, label);
  });

  // Train category classifier
  const categoryClassifier = new natural.BayesClassifier();
  categoryTrainingData.forEach(({ text, label }) => {
    categoryClassifier.addDocument(text, label);
  });
  categoryClassifier.train();

  classifier.train();

  return categoryClassifier;
}

const categoryClassifier = initializeClassifier();

/**
 * Detect urgency level from text description
 * @param {string} text - The description text to analyze
 * @returns {string} - Detected urgency level: 'low', 'medium', or 'high'
 */
export function detectUrgency(text) {
  if (!text || typeof text !== 'string') {
    return 'medium';
  }

  const tokens = tokenizer.tokenize(text.toLowerCase());
  if (tokens.length === 0) {
    return 'medium';
  }

  const classifications = classifier.getClassifications(text.toLowerCase());

  if (classifications.length > 0 && classifications[0].value > 0.3) {
    return classifications[0].label;
  }

  // Fallback: keyword-based detection
  const lowerText = text.toLowerCase();
  const highKeywords = ['emergency', 'urgent', 'immediately', 'asap', 'critical', 'danger', 'now'];
  const lowKeywords = ['when possible', 'convenient', 'no rush', 'whenever', 'future'];

  if (highKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  }
  if (lowKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'low';
  }

  return 'medium';
}

/**
 * Auto-categorize request based on description
 * @param {string} text - The description text to analyze
 * @returns {string} - Detected category
 */
export function detectCategory(text) {
  if (!text || typeof text !== 'string') {
    return 'other';
  }

  const classifications = categoryClassifier.getClassifications(text.toLowerCase());

  if (classifications.length > 0 && classifications[0].value > 0.2) {
    return classifications[0].label;
  }

  // Fallback: keyword-based detection
  const lowerText = text.toLowerCase();
  const categoryKeywords = {
    technical: ['code', 'programming', 'software', 'computer', 'api', 'bug'],
    academic: ['assignment', 'homework', 'exam', 'study', 'course', 'notes'],
    health: ['doctor', 'health', 'medical', 'hospital', 'medicine', 'pain'],
    financial: ['money', 'loan', 'payment', 'bills', 'financial', 'debt'],
    emotional: ['stress', 'anxiety', 'depression', 'lonely', 'emotional', 'sad'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Extract potential tags from description
 * @param {string} text - The description text
 * @returns {string[]} - Array of extracted tags
 */
export function extractTags(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
    'because', 'until', 'while', 'although', 'though', 'after', 'before',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'about', 'against', 'over', 'out', 'up'
  ]);

  const tokens = tokenizer.tokenize(text.toLowerCase());
  const tags = tokens
    .filter(token => token.length > 3 && !stopWords.has(token))
    .slice(0, 5);

  return [...new Set(tags)];
}

/**
 * Full AI analysis of a help request
 * @param {string} description - The request description
 * @returns {Object} - Object containing urgency, category, and tags
 */
export function analyzeRequest(description) {
  return {
    urgency: detectUrgency(description),
    category: detectCategory(description),
    tags: extractTags(description),
  };
}
