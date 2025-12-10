/**
 * Claude Wrapped 2025 - Pattern Analyzer
 * Detects phrases, habits, and behavioral patterns
 * Focus on HOW THE USER COMMUNICATES with Claude
 */

import type { Dataset, PatternAnalysis } from "../types";
import { getAssistantText } from "../collector";

// Claude's characteristic phrases
const CLAUDE_PHRASES = [
  { pattern: /you'?re\s+(absolutely\s+)?right/gi, key: "youreRight" },
  { pattern: /let me/gi, key: "letMe" },
  { pattern: /I apologize/gi, key: "apologize" },
  { pattern: /great question/gi, key: "greatQuestion" },
  { pattern: /I'?d be happy to/gi, key: "happyTo" },
  { pattern: /certainly/gi, key: "certainly" },
  { pattern: /I understand/gi, key: "understand" },
  { pattern: /that'?s a great/gi, key: "thatsGreat" },
];

// User communication style patterns - THE FUN STUFF
const USER_PATTERNS = {
  // Frustration / Yelling
  yelling: [
    { pattern: /!!+/g, key: "multiExclaim" },
    { pattern: /\?\?+/g, key: "multiQuestion" },
    { pattern: /[A-Z]{4,}/g, key: "allCaps" }, // YELLING IN CAPS
    { pattern: /\b(NO|WRONG|FIX|BROKEN|BUG|ERROR|FAIL|SHIT|FUCK|DAMN|WTF|UGH)\b/gi, key: "frustrationWords" },
    { pattern: /please\s+just/gi, key: "pleaseJust" },
    { pattern: /why\s+(isn'?t|doesn'?t|won'?t|can'?t|didn'?t)/gi, key: "whyNot" },
    { pattern: /this\s+(is\s+)?(still|doesn'?t|isn'?t|won'?t)/gi, key: "stillBroken" },
    { pattern: /again\b/gi, key: "again" },
    { pattern: /already told you/gi, key: "alreadyTold" },
  ],

  // Politeness / Gratitude
  polite: [
    { pattern: /\bplease\b/gi, key: "please" },
    { pattern: /\bthank(s| you)\b/gi, key: "thanks" },
    { pattern: /\bsorry\b/gi, key: "sorry" },
    { pattern: /\bappreciate\b/gi, key: "appreciate" },
    { pattern: /\bgreat job\b/gi, key: "greatJob" },
    { pattern: /\bperfect\b/gi, key: "perfect" },
    { pattern: /\bawesome\b/gi, key: "awesome" },
    { pattern: /\bnice\b/gi, key: "nice" },
  ],

  // Impatience / Speed
  impatient: [
    { pattern: /\bjust\b/gi, key: "just" },
    { pattern: /\bquick(ly)?\b/gi, key: "quick" },
    { pattern: /\basap\b/gi, key: "asap" },
    { pattern: /\bnow\b/gi, key: "now" },
    { pattern: /\bhurry\b/gi, key: "hurry" },
    { pattern: /\bfast(er)?\b/gi, key: "fast" },
  ],

  // Nitpicking / Perfectionism
  nitpicky: [
    { pattern: /\bactually\b/gi, key: "actually" },
    { pattern: /\bspecifically\b/gi, key: "specifically" },
    { pattern: /\bexactly\b/gi, key: "exactly" },
    { pattern: /\bprecisely\b/gi, key: "precisely" },
    { pattern: /not\s+quite/gi, key: "notQuite" },
    { pattern: /almost\s+but/gi, key: "almostBut" },
    { pattern: /close\s+but/gi, key: "closeBut" },
    { pattern: /\bminor\b/gi, key: "minor" },
    { pattern: /\btweak\b/gi, key: "tweak" },
    { pattern: /\badjust\b/gi, key: "adjust" },
    { pattern: /\binstead\b/gi, key: "instead" },
    { pattern: /\brather\b/gi, key: "rather" },
  ],

  // Vague / Low effort
  vague: [
    { pattern: /^.{1,15}$/gm, key: "shortPrompt" }, // Very short prompts
    { pattern: /\bdo it\b/gi, key: "doIt" },
    { pattern: /\bfix it\b/gi, key: "fixIt" },
    { pattern: /\bmake it work\b/gi, key: "makeItWork" },
    { pattern: /\bidk\b/gi, key: "idk" },
    { pattern: /\bwhatever\b/gi, key: "whatever" },
    { pattern: /\byou know what i mean\b/gi, key: "youKnow" },
    { pattern: /\betc\.?\b/gi, key: "etc" },
  ],

  // Detailed / Thorough
  detailed: [
    { pattern: /\bcontext\b/gi, key: "context" },
    { pattern: /\bbackground\b/gi, key: "background" },
    { pattern: /\brequirements?\b/gi, key: "requirements" },
    { pattern: /\bspecification\b/gi, key: "specification" },
    { pattern: /step\s*\d/gi, key: "steps" },
    { pattern: /\d\.\s+\w/g, key: "numberedList" },
    { pattern: /\b(first|second|third|finally)\b/gi, key: "ordering" },
  ],

  // Questioning / Curious
  curious: [
    { pattern: /\bwhy\b/gi, key: "why" },
    { pattern: /\bhow\b/gi, key: "how" },
    { pattern: /\bwhat if\b/gi, key: "whatIf" },
    { pattern: /\bcould you explain\b/gi, key: "explain" },
    { pattern: /\bwhat'?s the\b/gi, key: "whatsThe" },
    { pattern: /\bis (it|this|that) (possible|okay|correct)/gi, key: "isItPossible" },
  ],

  // Commands / Direct
  commanding: [
    { pattern: /^(do|make|create|build|write|fix|add|remove|delete|change|update)\b/gim, key: "imperative" },
    { pattern: /\bnow\s+(do|make|fix|add)/gi, key: "nowDo" },
    { pattern: /\bi need\b/gi, key: "iNeed" },
    { pattern: /\bi want\b/gi, key: "iWant" },
  ],
};

/**
 * Count pattern matches in text
 */
function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

/**
 * Analyze patterns in the dataset
 */
export function analyzePatterns(dataset: Dataset): PatternAnalysis {
  const claudePhrases: Record<string, number> = {};
  const userFrustration: Record<string, number> = {};
  const userStyle: Record<string, Record<string, number>> = {
    yelling: {},
    polite: {},
    impatient: {},
    nitpicky: {},
    vague: {},
    detailed: {},
    curious: {},
    commanding: {},
  };

  // Initialize counters
  for (const phrase of CLAUDE_PHRASES) {
    claudePhrases[phrase.key] = 0;
  }

  // Initialize user style counters
  for (const [category, patterns] of Object.entries(USER_PATTERNS)) {
    for (const p of patterns) {
      userStyle[category][p.key] = 0;
    }
  }

  let longestPrompt = { text: "", length: 0 };
  let shortestPrompt = { text: "", length: Number.POSITIVE_INFINITY };
  let questionCount = 0;
  let exclamationCount = 0;
  let emojiCount = 0;
  let codeBlockCount = 0;
  let urlCount = 0;

  // Analyze user entries
  for (const entry of dataset.userEntries) {
    const text = entry.message.content;
    const length = text.length;

    // Track longest/shortest (only meaningful ones)
    if (length > longestPrompt.length) {
      longestPrompt = { text: text.slice(0, 500), length };
    }
    if (length > 10 && length < shortestPrompt.length) {
      shortestPrompt = { text, length };
    }

    // Count basic patterns
    questionCount += countMatches(text, /\?/g);
    exclamationCount += countMatches(text, /!/g);
    emojiCount += countMatches(text, /[\u{1F300}-\u{1F9FF}]/gu);
    codeBlockCount += countMatches(text, /```/g);
    urlCount += countMatches(text, /https?:\/\//g);

    // Check all user style patterns
    for (const [category, patterns] of Object.entries(USER_PATTERNS)) {
      for (const p of patterns) {
        userStyle[category][p.key] += countMatches(text, p.pattern);
      }
    }
  }

  // Analyze assistant entries for Claude phrases
  for (const entry of dataset.assistantEntries) {
    const text = getAssistantText(entry);

    for (const phrase of CLAUDE_PHRASES) {
      claudePhrases[phrase.key] += countMatches(text, phrase.pattern);
    }
  }

  // Calculate category totals for userFrustration (backwards compat)
  for (const [key, val] of Object.entries(userStyle.yelling)) {
    userFrustration[key] = val;
  }

  // Handle edge case where no prompts exist
  if (shortestPrompt.length === Number.POSITIVE_INFINITY) {
    shortestPrompt = { text: "", length: 0 };
  }

  return {
    claudePhrases,
    userFrustration,
    userStyle,
    longestPrompt,
    shortestPrompt,
    questionCount,
    exclamationCount,
    emojiCount,
    codeBlockCount,
    urlCount,
  };
}

/**
 * Get dominant communication style
 */
export function getDominantStyle(patterns: PatternAnalysis): {
  style: string;
  score: number;
  description: string;
} {
  const styleTotals: Record<string, number> = {};

  for (const [category, counts] of Object.entries(patterns.userStyle || {})) {
    styleTotals[category] = Object.values(counts).reduce((a, b) => a + b, 0);
  }

  const sorted = Object.entries(styleTotals).sort((a, b) => b[1] - a[1]);
  const [topStyle, topScore] = sorted[0] || ["neutral", 0];

  const descriptions: Record<string, string> = {
    yelling: "You're... passionate. Very passionate.",
    polite: "A true gentleman/lady of the terminal.",
    impatient: "Time is code. Code is money. HURRY.",
    nitpicky: "Every pixel matters. Every character counts.",
    vague: "Brief but... mysterious?",
    detailed: "You write prompts like technical specs.",
    curious: "Always asking 'but why?' like a 5-year-old.",
    commanding: "You don't ask. You command.",
  };

  return {
    style: topStyle,
    score: topScore,
    description: descriptions[topStyle] || "Your style is unique.",
  };
}

/**
 * Get communication stats for display
 */
export function getCommunicationStats(patterns: PatternAnalysis): {
  yellCount: number;
  politeCount: number;
  nitpickCount: number;
  vagueCount: number;
  questionRatio: number;
} {
  const yellCount = Object.values(patterns.userStyle?.yelling || {}).reduce((a, b) => a + b, 0);
  const politeCount = Object.values(patterns.userStyle?.polite || {}).reduce((a, b) => a + b, 0);
  const nitpickCount = Object.values(patterns.userStyle?.nitpicky || {}).reduce((a, b) => a + b, 0);
  const vagueCount = Object.values(patterns.userStyle?.vague || {}).reduce((a, b) => a + b, 0);

  return {
    yellCount,
    politeCount,
    nitpickCount,
    vagueCount,
    questionRatio: patterns.questionCount,
  };
}

/**
 * Get the most common Claude phrase
 */
export function getMostCommonClaudePhrase(patterns: PatternAnalysis): string {
  const entries = Object.entries(patterns.claudePhrases);
  if (entries.length === 0) return "None";

  entries.sort((a, b) => b[1] - a[1]);
  const [key, count] = entries[0];

  if (count === 0) return "None";

  const phraseNames: Record<string, string> = {
    youreRight: '"You\'re absolutely right"',
    letMe: '"Let me..."',
    apologize: '"I apologize"',
    greatQuestion: '"Great question!"',
    happyTo: '"I\'d be happy to"',
    certainly: '"Certainly"',
    understand: '"I understand"',
    thatsGreat: '"That\'s a great..."',
  };

  return phraseNames[key] || key;
}

/**
 * Calculate frustration score (0-100)
 */
export function getFrustrationScore(patterns: PatternAnalysis): number {
  const total = Object.values(patterns.userFrustration).reduce((a, b) => a + b, 0);
  // Normalize to 0-100 scale (assuming 100+ signals is max frustration)
  return Math.min(100, Math.round(total));
}
