/**
 * Claude Wrapped 2025 - LLM Judge Evaluator
 * Uses Claude to evaluate persona and generate summaries
 * Focus on USER COMMUNICATION STYLE, not tools
 */

import Anthropic from "@anthropic-ai/sdk";
import { PersonaResultSchema, type PersonaResult, type WrappedMetrics, type PatternAnalysis, type Timeline } from "../types";
import { PERSONA_JUDGE_PROMPT, YEAR_SUMMARY_PROMPT, fillTemplate } from "./prompts";
import { formatHour } from "../analyzer";

/**
 * Get communication style counts from patterns
 */
function getStyleCounts(patterns: PatternAnalysis) {
  const style = patterns.userStyle || {};

  return {
    yellCount: Object.values(style.yelling || {}).reduce((a, b) => a + b, 0),
    politeCount: Object.values(style.polite || {}).reduce((a, b) => a + b, 0),
    nitpickCount: Object.values(style.nitpicky || {}).reduce((a, b) => a + b, 0),
    commandCount: Object.values(style.commanding || {}).reduce((a, b) => a + b, 0),
    curiousCount: Object.values(style.curious || {}).reduce((a, b) => a + b, 0),
  };
}

/**
 * Security: Sanitize prompt before sending to API
 * Redacts potential secrets, API keys, tokens, passwords
 */
function sanitizePrompt(prompt: string): string {
  return prompt
    // API keys and tokens (various formats)
    .replace(/sk-[a-zA-Z0-9]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/sk_[a-zA-Z0-9]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/AIza[a-zA-Z0-9_-]{35}/g, "[REDACTED_GOOGLE_KEY]")
    .replace(/ghp_[a-zA-Z0-9]{36}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/gho_[a-zA-Z0-9]{36}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/xox[baprs]-[a-zA-Z0-9-]{10,}/g, "[REDACTED_SLACK_TOKEN]")
    // Generic long hex/base64 strings that look like secrets
    .replace(/[0-9a-f]{32,}/gi, "[REDACTED_HEX]")
    .replace(/[A-Za-z0-9+\/]{40,}={0,2}/g, "[REDACTED_BASE64]")
    // Password patterns
    .replace(/password\s*[=:]\s*\S+/gi, "password=[REDACTED]")
    .replace(/passwd\s*[=:]\s*\S+/gi, "passwd=[REDACTED]")
    .replace(/secret\s*[=:]\s*\S+/gi, "secret=[REDACTED]")
    .replace(/token\s*[=:]\s*\S+/gi, "token=[REDACTED]")
    .replace(/api_key\s*[=:]\s*\S+/gi, "api_key=[REDACTED]")
    .replace(/apikey\s*[=:]\s*\S+/gi, "apikey=[REDACTED]")
    // AWS keys
    .replace(/AKIA[A-Z0-9]{16}/g, "[REDACTED_AWS_KEY]")
    // Private keys
    .replace(/-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]")
    // Truncate to 300 chars
    .slice(0, 300);
}

/**
 * LLM Judge Evaluator class
 */
export class JudgeEvaluator {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Evaluate the user's persona based on their metrics
   */
  async evaluatePersona(
    metrics: WrappedMetrics,
    patterns: PatternAnalysis,
    timeline: Timeline,
    samplePrompts: string[]
  ): Promise<PersonaResult> {
    // Get communication style counts
    const styleCounts = getStyleCounts(patterns);

    // Prepare languages string
    const languages = Object.entries(metrics.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ext, count]) => `- .${ext}: ${count} files`)
      .join("\n");

    // Prepare sample prompts (sanitized for security) - THESE ARE KEY
    // Send up to 500 prompts for rich context
    const truncatedPrompts = samplePrompts
      .slice(0, 500)
      .map((p, i) => `${i + 1}. "${sanitizePrompt(p)}"`)
      .join("\n");

    // Fill the template with communication-focused data
    const prompt = fillTemplate(PERSONA_JUDGE_PROMPT, {
      totalPrompts: metrics.totalPrompts,
      avgPromptLength: metrics.avgPromptLength,
      linesWritten: metrics.linesWritten,
      filesCreated: metrics.filesCreated,
      yellCount: styleCounts.yellCount,
      politeCount: styleCounts.politeCount,
      nitpickCount: styleCounts.nitpickCount,
      questionCount: patterns.questionCount,
      languages: languages || "None recorded",
      busiestHour: formatHour(timeline.peakHour),
      busiestDay: timeline.peakDay,
      lateNightCount: timeline.lateNightCount,
      longestStreak: metrics.longestStreak,
      samplePrompts: truncatedPrompts || "No samples available",
    });

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    // Extract text from response
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse persona result from LLM response");
    }

    const json = JSON.parse(jsonMatch[0]);
    return PersonaResultSchema.parse(json);
  }

  /**
   * Generate a personalized year summary
   */
  async generateSummary(
    metrics: WrappedMetrics,
    timeline: Timeline,
    persona: string,
    summaries: string[],
    patterns: PatternAnalysis
  ): Promise<string> {
    // Get top language
    const topLanguage =
      Object.entries(metrics.languages).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "various";

    // Get communication style counts
    const styleCounts = getStyleCounts(patterns);

    // Prepare summaries string (top 10)
    const summariesStr = summaries
      .slice(0, 10)
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");

    const prompt = fillTemplate(YEAR_SUMMARY_PROMPT, {
      totalPrompts: metrics.totalPrompts,
      linesWritten: metrics.linesWritten,
      filesCreated: metrics.filesCreated,
      topLanguage: `.${topLanguage}`,
      busiestDay: timeline.peakDay,
      persona,
      yellCount: styleCounts.yellCount,
      politeCount: styleCounts.politeCount,
      nitpickCount: styleCounts.nitpickCount,
      questionCount: patterns.questionCount,
      summaries: summariesStr || "No summaries available",
    });

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content[0].type === "text"
      ? response.content[0].text.trim()
      : "Your year with Claude was one for the books.";
  }
}

/**
 * Create a fallback persona result when LLM is unavailable
 * Uses the sophisticated deterministic persona system
 */
export function createFallbackPersona(
  metrics: WrappedMetrics,
  timeline: Timeline,
  patterns?: PatternAnalysis
): PersonaResult {
  // Import and use the deterministic system
  const { detectAllPersonas } = require("./deterministic");

  // Default patterns if not provided
  const safePatterns: PatternAnalysis = patterns || {
    claudePhrases: {},
    userFrustration: {},
    userStyle: {},
    longestPrompt: { text: "", length: 0 },
    shortestPrompt: { text: "", length: 0 },
    questionCount: 0,
    exclamationCount: 0,
  };

  // Detect all personas using the sophisticated system
  const personas = detectAllPersonas(metrics, safePatterns, timeline);
  const primary = personas.primary;

  // Map the deterministic persona to a classic persona ID for image lookup
  const personaIdMap: Record<string, string> = {
    TYPE_GUARDIAN: "THE_ARCHITECT",
    CHAOS_WIZARD: "THE_SPEEDRUNNER",
    SNAKE_CHARMER: "THE_EXPLORER",
    BORROW_CHECKER: "THE_PERFECTIONIST",
    GOPHER: "THE_BUILDER",
    ENTERPRISE_ARCHITECT: "THE_ARCHITECT",
    MEMORY_WHISPERER: "THE_DEBUGGER",
    GEM_COLLECTOR: "THE_REFACTORER",
    LEGACY_KEEPER: "THE_MARATHON_RUNNER",
    APPLE_EVANGELIST: "THE_SPECIALIST",
    JAVA_ESCAPEE: "THE_SPEEDRUNNER",
    TERMINAL_DWELLER: "THE_COMMANDER",
    DATA_WHISPERER: "THE_EXPLORER",
    PIXEL_PUSHER: "THE_BUILDER",
    DOCUMENTARIAN: "THE_CONVERSATIONALIST",
    CONFIG_WIZARD: "THE_ARCHITECT",
    POLYGLOT: "THE_POLYGLOT",
    VAMPIRE: "THE_NIGHT_OWL",
    EARLY_BIRD: "THE_EARLY_BIRD",
    MORNING_PERSON: "THE_EARLY_BIRD",
    LUNCH_CODER: "THE_BUILDER",
    NINE_TO_FIVER: "THE_BUILDER",
    AFTER_HOURER: "THE_MARATHON_RUNNER",
    NIGHT_OWL: "THE_NIGHT_OWL",
    WEEKEND_WARRIOR: "THE_MARATHON_RUNNER",
    MACHINE: "THE_SPEEDRUNNER",
    CURIOUS: "THE_EXPLORER",
    YELLER: "THE_COMMANDER",
    MINIMALIST: "THE_SPEEDRUNNER",
    NOVELIST: "THE_ARCHITECT",
    DIPLOMAT: "THE_CONVERSATIONALIST",
    ENTHUSIAST: "THE_BUILDER",
    ARCHITECT: "THE_ARCHITECT",
    COMMANDER: "THE_COMMANDER",
    EXPLORER: "THE_EXPLORER",
    BUILDER: "THE_BUILDER",
    REFACTORER: "THE_REFACTORER",
    TERMINAL_LORD: "THE_COMMANDER",
    DETECTIVE: "THE_DEBUGGER",
    FULL_STACK: "THE_POLYGLOT",
  };

  const mappedPersona = personaIdMap[primary.id] || "THE_BUILDER";

  // Build reasoning from all personas
  const reasoning = `Language: ${personas.language.name}, Time: ${personas.time.name}, Style: ${personas.style.name}, Workflow: ${personas.workflow.name}`;

  return {
    persona: mappedPersona,
    confidence: 0.85,
    reasoning,
    secondaryPersona: null,
    roast: personas.combinedRoast,
    compliment: personas.combinedCompliment,
  };
}
