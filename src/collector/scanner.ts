/**
 * Claude Wrapped 2025 - Directory Scanner
 * Finds all .claude directories across the system
 */

import { readdir, stat, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { join, basename, dirname, resolve } from "node:path";
import type { ClaudeDirectory } from "../types";

const HOME = homedir();

/**
 * Security: Validate path is safe (within home directory, no traversal)
 */
async function isPathSafe(path: string): Promise<boolean> {
  try {
    // Resolve any symlinks and normalize the path
    const resolved = await realpath(resolve(path));
    // Must be within home directory (check resolved path, not raw)
    if (!resolved.startsWith(HOME)) {
      return false;
    }
    // Block traversal attempts in resolved path
    if (resolved.includes("..")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable project name from path
 */
function getProjectName(path: string): string {
  if (path === join(HOME, ".claude")) {
    return "Global (~/.claude)";
  }

  const parent = dirname(path);
  const projectDir = basename(parent);

  // Clean up path-encoded names like "-Users-name-project"
  if (projectDir.startsWith("-")) {
    const parts = projectDir.split("-").filter(Boolean);
    // Return last meaningful part
    return parts[parts.length - 1] || projectDir;
  }

  return projectDir;
}

/**
 * Count JSONL files in a directory
 */
async function countJsonlFiles(dir: string): Promise<number> {
  let count = 0;

  async function walkDir(currentPath: string): Promise<void> {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
          count++;
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);
  return count;
}

/**
 * Calculate total size of a directory
 */
async function getDirSize(dir: string): Promise<number> {
  let size = 0;

  async function walkDir(currentPath: string): Promise<void> {
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          await walkDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          size += stats.size;
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await walkDir(dir);
  return size;
}

/**
 * Analyze a .claude directory
 */
async function analyzeClaudeDir(
  path: string,
  isGlobal: boolean
): Promise<ClaudeDirectory | null> {
  // Security: Validate path before processing
  if (!(await isPathSafe(path))) {
    console.warn(`Skipping unsafe path: ${path}`);
    return null;
  }

  const [conversationCount, totalSizeBytes] = await Promise.all([
    countJsonlFiles(path),
    getDirSize(path),
  ]);

  return {
    path,
    projectName: getProjectName(path),
    conversationCount,
    totalSizeBytes,
    isGlobal,
  };
}

/**
 * Scan for .claude directories in common locations
 */
export async function scanForClaudeDirs(options?: {
  globalOnly?: boolean;
  searchPaths?: string[];
}): Promise<ClaudeDirectory[]> {
  const dirs: ClaudeDirectory[] = [];
  const seen = new Set<string>();

  // 1. Always check global ~/.claude
  const globalDir = join(HOME, ".claude");
  try {
    const stats = await stat(globalDir);
    if (stats.isDirectory()) {
      const info = await analyzeClaudeDir(globalDir, true);
      if (info) {
        dirs.push(info);
        seen.add(globalDir);
      }
    }
  } catch {
    // Global dir doesn't exist
  }

  if (options?.globalOnly) {
    return dirs;
  }

  // 2. Scan home directory subdirs for .claude
  const searchPaths = options?.searchPaths || [HOME];

  for (const searchPath of searchPaths) {
    try {
      const entries = await readdir(searchPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith(".")) continue;

        const claudeDir = join(searchPath, entry.name, ".claude");

        if (seen.has(claudeDir)) continue;

        try {
          const stats = await stat(claudeDir);
          if (stats.isDirectory()) {
            const info = await analyzeClaudeDir(claudeDir, false);
            if (info && info.conversationCount > 0) {
              dirs.push(info);
              seen.add(claudeDir);
            }
          }
        } catch {
          // .claude doesn't exist in this dir
        }
      }
    } catch {
      // Can't read search path
    }
  }

  // Sort by conversation count (most active first), global always first
  dirs.sort((a, b) => {
    if (a.isGlobal) return -1;
    if (b.isGlobal) return 1;
    return b.conversationCount - a.conversationCount;
  });

  return dirs;
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
