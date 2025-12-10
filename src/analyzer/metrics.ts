/**
 * Claude Wrapped 2025 - Metrics Calculator
 * Computes statistics from conversation data
 */

import { extname } from "node:path";
import type { Dataset, WrappedMetrics } from "../types";
import { getToolUses } from "../collector";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Get file extension from path
 */
function getExtension(filePath: string): string {
  const ext = extname(filePath).toLowerCase().slice(1);
  return ext || "unknown";
}

/**
 * Extract bash command from Bash tool input
 */
function getBashCommand(input: Record<string, unknown>): string | null {
  const command = input.command;
  if (typeof command !== "string") return null;

  // Get first word (the actual command)
  const firstWord = command.trim().split(/\s+/)[0];
  if (!firstWord) return null;

  // Clean up common prefixes
  if (firstWord.includes("=")) {
    // Environment variable like GEMINI_API_KEY=xxx python
    const parts = command.split(/\s+/);
    for (const part of parts) {
      if (!part.includes("=")) return part;
    }
  }

  return firstWord;
}

/**
 * Calculate all metrics from the dataset
 */
export function calculateMetrics(dataset: Dataset): WrappedMetrics {
  const metrics: WrappedMetrics = {
    totalPrompts: dataset.userEntries.length,
    totalResponses: dataset.assistantEntries.length,
    totalConversations: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    linesWritten: 0,
    linesEdited: 0,
    filesCreated: 0,
    filesModified: 0,
    languages: {},
    toolCounts: {},
    bashCommands: {},
    busiestDay: "",
    busiestHour: 0,
    longestStreak: 0,
    totalSessions: 0,
    avgSessionMinutes: 0,
    totalUserChars: 0,
    totalAssistantChars: 0,
    avgPromptLength: 0,
  };

  // Track unique sessions and days
  const sessions = new Set<string>();
  const activeDays = new Set<string>();
  const hourCounts: number[] = new Array(24).fill(0);
  const dayCounts: Record<string, number> = {};

  // Process user entries
  for (const entry of dataset.userEntries) {
    // Count sessions
    if (entry.sessionId) {
      sessions.add(entry.sessionId);
    }

    // Character count
    const text = entry.message.content;
    metrics.totalUserChars += text.length;

    // Time tracking
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split("T")[0];
    const hour = date.getHours();

    activeDays.add(dateStr);
    hourCounts[hour]++;
    dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
  }

  // Process assistant entries
  for (const entry of dataset.assistantEntries) {
    // Token counts
    if (entry.message.usage) {
      metrics.totalTokensIn += entry.message.usage.input_tokens;
      metrics.totalTokensOut += entry.message.usage.output_tokens;
    }

    // Process content
    for (const content of entry.message.content) {
      if (content.type === "text") {
        metrics.totalAssistantChars += content.text.length;
      }
    }

    // Extract tool uses
    const toolUses = getToolUses(entry);

    for (const tool of toolUses) {
      // Count tool usage
      metrics.toolCounts[tool.name] = (metrics.toolCounts[tool.name] || 0) + 1;

      // Process specific tools
      if (tool.name === "Write") {
        const content = tool.input.content;
        if (typeof content === "string") {
          metrics.linesWritten += content.split("\n").length;
          metrics.filesCreated++;

          // Track language
          const filePath = tool.input.file_path;
          if (typeof filePath === "string") {
            const ext = getExtension(filePath);
            metrics.languages[ext] = (metrics.languages[ext] || 0) + 1;
          }
        }
      } else if (tool.name === "Edit") {
        const newString = tool.input.new_string;
        if (typeof newString === "string") {
          metrics.linesEdited += newString.split("\n").length;
          metrics.filesModified++;

          // Track language
          const filePath = tool.input.file_path;
          if (typeof filePath === "string") {
            const ext = getExtension(filePath);
            metrics.languages[ext] = (metrics.languages[ext] || 0) + 1;
          }
        }
      } else if (tool.name === "Bash") {
        const cmd = getBashCommand(tool.input);
        if (cmd) {
          metrics.bashCommands[cmd] = (metrics.bashCommands[cmd] || 0) + 1;
        }
      }
    }
  }

  // Calculate derived metrics
  metrics.totalSessions = sessions.size;
  metrics.totalConversations = sessions.size;
  metrics.avgPromptLength =
    metrics.totalPrompts > 0 ? Math.round(metrics.totalUserChars / metrics.totalPrompts) : 0;

  // Find busiest hour
  const maxHourCount = Math.max(...hourCounts);
  metrics.busiestHour = hourCounts.indexOf(maxHourCount);

  // Find busiest day of week
  const weekdayCounts: number[] = new Array(7).fill(0);
  for (const entry of dataset.userEntries) {
    const date = new Date(entry.timestamp);
    weekdayCounts[date.getDay()]++;
  }
  const maxWeekdayCount = Math.max(...weekdayCounts);
  metrics.busiestDay = WEEKDAYS[weekdayCounts.indexOf(maxWeekdayCount)];

  // Calculate longest streak
  const sortedDays = Array.from(activeDays).sort();
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  metrics.longestStreak = maxStreak;

  return metrics;
}
