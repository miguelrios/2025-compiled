/**
 * Claude Wrapped 2025 - Report Generator
 * Assembles the final wrapped report
 */

import type {
  WrappedReport,
  WrappedMetrics,
  PatternAnalysis,
  Timeline,
  PersonaResult,
} from "../types";
import { getPersona } from "../judge";
import { VERSION } from "../config";

/**
 * Build the final wrapped report
 */
export function buildReport(
  metrics: WrappedMetrics,
  patterns: PatternAnalysis,
  timeline: Timeline,
  personaResult: PersonaResult,
  yearSummary: string,
  summaries: string[]
): WrappedReport {
  const persona = getPersona(personaResult.persona);

  return {
    // Identity
    persona: personaResult.persona,
    personaEmoji: persona.emoji,
    personaName: persona.name,
    personaTagline: persona.tagline,
    personaDescription: persona.description,
    secondaryPersona: personaResult.secondaryPersona,
    roast: personaResult.roast,
    compliment: personaResult.compliment,

    // Numbers
    metrics,
    patterns,
    timeline,

    // Narrative
    yearSummary,
    summaries: summaries.slice(0, 20), // Keep top 20 summaries

    // Generated assets (to be filled later)
    personaImagePath: null,
    shareCardPath: null,

    // Meta
    generatedAt: new Date().toISOString(),
    version: VERSION,
  };
}

/**
 * Save report as JSON
 */
export async function saveReportJson(
  report: WrappedReport,
  outputPath: string
): Promise<void> {
  await Bun.write(outputPath, JSON.stringify(report, null, 2));
}

/**
 * Format large numbers for display
 */
export function formatNumber(n: number): string {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

/**
 * Get fun fact about the user's stats
 */
export function getFunFact(report: WrappedReport): string {
  const facts: string[] = [];

  // Lines of code facts
  if (report.metrics.linesWritten > 100000) {
    facts.push(
      `You wrote enough code to fill ${Math.round(report.metrics.linesWritten / 50)} pages!`
    );
  } else if (report.metrics.linesWritten > 10000) {
    facts.push(
      `${report.metrics.linesWritten.toLocaleString()} lines is like writing a small novel in code.`
    );
  }

  // Late night facts
  if (report.timeline.lateNightCount > 100) {
    facts.push(`You coded past midnight ${report.timeline.lateNightCount} times. Sleep is for the weak!`);
  } else if (report.timeline.lateNightCount > 20) {
    facts.push(`${report.timeline.lateNightCount} late night sessions. The night owl life chose you.`);
  }

  // Tool facts
  const totalToolUses = Object.values(report.metrics.toolCounts).reduce((a, b) => a + b, 0);
  if (totalToolUses > 10000) {
    facts.push(`Claude used tools ${totalToolUses.toLocaleString()} times for you. That's dedication.`);
  }

  // You're absolutely right facts
  const rightCount = report.patterns.claudePhrases.youreRight || 0;
  if (rightCount > 100) {
    facts.push(`Claude agreed with you ${rightCount} times. You're basically always right.`);
  } else if (rightCount > 10) {
    facts.push(`"You're absolutely right" - Claude, ${rightCount} times this year.`);
  }

  // Pick a random fact or return default
  if (facts.length === 0) {
    return "You had a great year coding with Claude!";
  }

  return facts[Math.floor(Math.random() * facts.length)];
}
