/**
 * Claude Wrapped 2025 - Data Aggregator
 * Combines and deduplicates data from multiple directories
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  ClaudeDirectory,
  Dataset,
  UserEntry,
  AssistantEntry,
  SummaryEntry,
  Entry,
} from "../types";
import { parseFile } from "./parser";

/**
 * Find all JSONL files in a directory recursively
 */
async function findJsonlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string): Promise<void> {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walk(dir);
  return files;
}

/**
 * Aggregate data from multiple Claude directories
 */
export async function aggregate(
  dirs: ClaudeDirectory[],
  onProgress?: (message: string) => void
): Promise<Dataset> {
  const allUserEntries: UserEntry[] = [];
  const allAssistantEntries: AssistantEntry[] = [];
  const allSummaries: SummaryEntry[] = [];
  const seenUuids = new Set<string>();
  let totalFiles = 0;

  for (const dir of dirs) {
    onProgress?.(`Scanning ${dir.projectName}...`);

    // Find all JSONL files in this directory
    const jsonlFiles = await findJsonlFiles(dir.path);
    totalFiles += jsonlFiles.length;

    onProgress?.(`  Found ${jsonlFiles.length} conversation files`);

    // Parse each file
    for (const file of jsonlFiles) {
      // Skip history.jsonl here - we handle it separately below
      if (file.endsWith("history.jsonl")) continue;

      const { userEntries, assistantEntries, summaries } = await parseFile(file);

      // Dedupe by UUID
      for (const entry of userEntries) {
        if (!seenUuids.has(entry.uuid)) {
          seenUuids.add(entry.uuid);
          allUserEntries.push(entry);
        }
      }

      for (const entry of assistantEntries) {
        if (!seenUuids.has(entry.uuid)) {
          seenUuids.add(entry.uuid);
          allAssistantEntries.push(entry);
        }
      }

      // Summaries might not have UUIDs, add all
      allSummaries.push(...summaries);
    }
  }

  // Sort entries by timestamp
  allUserEntries.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  allAssistantEntries.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Combine into entries array
  const entries: Entry[] = [
    ...allUserEntries,
    ...allAssistantEntries,
    ...allSummaries,
  ];

  onProgress?.(
    `Collected ${allUserEntries.length} prompts and ${allAssistantEntries.length} responses`
  );

  return {
    entries,
    userEntries: allUserEntries,
    assistantEntries: allAssistantEntries,
    summaries: allSummaries,
    totalFiles,
    directories: dirs,
  };
}
