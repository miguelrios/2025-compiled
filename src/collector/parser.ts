/**
 * Claude Wrapped 2025 - JSONL Parser
 * Parses Claude Code conversation files
 */

import { readFile } from "node:fs/promises";
import {
  UserEntrySchema,
  AssistantEntrySchema,
  SummaryEntrySchema,
  type Entry,
  type UserEntry,
  type AssistantEntry,
  type SummaryEntry,
} from "../types";
import { YEAR } from "../config";

/**
 * Parse a single JSONL file and yield entries
 */
export async function* parseConversationFile(
  filePath: string
): AsyncGenerator<Entry> {
  let content: string;

  try {
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return;
  }

  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line);

      // Filter to current year only
      if (data.timestamp) {
        const date = new Date(data.timestamp);
        if (date.getFullYear() !== YEAR) continue;
      }

      // Parse based on type
      if (data.type === "user") {
        const parsed = UserEntrySchema.safeParse(data);
        if (parsed.success) {
          yield parsed.data;
        }
      } else if (data.type === "assistant") {
        const parsed = AssistantEntrySchema.safeParse(data);
        if (parsed.success) {
          yield parsed.data;
        }
      } else if (data.type === "summary") {
        const parsed = SummaryEntrySchema.safeParse(data);
        if (parsed.success) {
          yield parsed.data;
        }
      }
      // Skip other types (file-history-snapshot, etc.)
    } catch {
      // Skip malformed JSON lines
    }
  }
}

/**
 * Parse all entries from a file into arrays
 */
export async function parseFile(filePath: string): Promise<{
  userEntries: UserEntry[];
  assistantEntries: AssistantEntry[];
  summaries: SummaryEntry[];
}> {
  const userEntries: UserEntry[] = [];
  const assistantEntries: AssistantEntry[] = [];
  const summaries: SummaryEntry[] = [];

  for await (const entry of parseConversationFile(filePath)) {
    if (entry.type === "user") {
      userEntries.push(entry as UserEntry);
    } else if (entry.type === "assistant") {
      assistantEntries.push(entry as AssistantEntry);
    } else if (entry.type === "summary") {
      summaries.push(entry as SummaryEntry);
    }
  }

  return { userEntries, assistantEntries, summaries };
}

/**
 * Extract text content from assistant message
 */
export function getAssistantText(entry: AssistantEntry): string {
  return entry.message.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("\n");
}

/**
 * Extract tool uses from assistant message
 */
export function getToolUses(
  entry: AssistantEntry
): Array<{ name: string; input: Record<string, unknown> }> {
  return entry.message.content
    .filter((c) => c.type === "tool_use")
    .map((c) => {
      const toolUse = c as { type: "tool_use"; name: string; input: Record<string, unknown> };
      return { name: toolUse.name, input: toolUse.input };
    });
}

/**
 * History entry from ~/.claude/history.jsonl
 * Has a different format than conversation files
 */
export interface HistoryEntry {
  display: string;
  timestamp: number; // Unix ms
  project?: string;
}

/**
 * Parse history.jsonl file (user prompts with Unix timestamps)
 * Returns simplified UserEntry objects for the heatmap
 */
export async function parseHistoryFile(filePath: string): Promise<UserEntry[]> {
  let content: string;
  const entries: UserEntry[] = [];

  try {
    content = await readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`Failed to read history file ${filePath}:`, error);
    return entries;
  }

  const lines = content.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line) as HistoryEntry;

      // Must have timestamp and display
      if (!data.timestamp || !data.display) continue;

      // Convert Unix ms to Date and filter to current year
      const date = new Date(data.timestamp);
      if (date.getFullYear() !== YEAR) continue;

      // Create a synthetic UserEntry for counting purposes
      const entry: UserEntry = {
        type: "user",
        uuid: `history-${data.timestamp}`, // Synthetic UUID
        timestamp: date.toISOString(),
        message: {
          role: "user",
          content: data.display,
        },
        sessionId: "history",
        cwd: data.project,
      };

      entries.push(entry);
    } catch {
      // Skip malformed lines
    }
  }

  return entries;
}
