/**
 * Claude Wrapped 2025 - Configuration
 * CLI argument parsing and environment setup
 */

import { homedir } from "node:os";
import { resolve } from "node:path";
import type { Config } from "./types";

const HOME = homedir();

export function parseArgs(args: string[]): Config {
  const config: Config = {
    all: false,
    global: false,
    images: false,
    noJudge: false,
    yes: false,
    output: "./output/wrapped-2025",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--all":
      case "-a":
        config.all = true;
        break;
      case "--global":
      case "-g":
        config.global = true;
        break;
      case "--images":
      case "-i":
        config.images = true;
        break;
      case "--no-judge":
        config.noJudge = true;
        break;
      case "--yes":
      case "-y":
        config.yes = true;
        break;
      case "--output":
      case "-o":
        if (args[i + 1] && !args[i + 1].startsWith("-")) {
          config.output = args[++i];
        }
        break;
    }
  }

  return config;
}

/**
 * Security: Validate output path is safe (within home or cwd, no traversal)
 */
export function validateOutputPath(outputPath: string): { valid: boolean; resolved: string; error?: string } {
  const resolved = resolve(outputPath);
  const cwd = process.cwd();

  // Block obvious traversal attempts
  if (outputPath.includes("..")) {
    return { valid: false, resolved, error: "Path traversal (..) not allowed in output path" };
  }

  // Must be within home directory or current working directory
  if (!resolved.startsWith(HOME) && !resolved.startsWith(cwd)) {
    return { valid: false, resolved, error: "Output path must be within home directory or current directory" };
  }

  // Block sensitive directories
  const sensitivePatterns = ["/etc", "/usr", "/var", "/bin", "/sbin", "/root", "/System", "/Library"];
  for (const pattern of sensitivePatterns) {
    if (resolved.startsWith(pattern)) {
      return { valid: false, resolved, error: `Cannot write to system directory: ${pattern}` };
    }
  }

  return { valid: true, resolved };
}

export function checkEnvironment(): { anthropicKey: boolean; geminiKey: boolean } {
  return {
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    geminiKey: !!process.env.GEMINI_API_KEY,
  };
}

export const VERSION = "1.0.0";
export const YEAR = 2025;
