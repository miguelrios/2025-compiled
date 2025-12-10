/**
 * Claude Wrapped 2025 - Type Definitions
 * All Zod schemas and TypeScript types for the pipeline
 */

import { z } from "zod";

// ============================================================================
// JSONL Entry Schemas (from Claude Code conversations)
// ============================================================================

export const UserEntrySchema = z.object({
  type: z.literal("user"),
  uuid: z.string(),
  timestamp: z.string(),
  parentUuid: z.string().nullable().optional(),
  sessionId: z.string().optional(),
  cwd: z.string().optional(),
  message: z.object({
    role: z.literal("user"),
    content: z.string(),
  }),
});
export type UserEntry = z.infer<typeof UserEntrySchema>;

export const ToolUseSchema = z.object({
  type: z.literal("tool_use"),
  id: z.string().optional(),
  name: z.string(),
  input: z.record(z.unknown()),
});
export type ToolUse = z.infer<typeof ToolUseSchema>;

export const TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});
export type TextContent = z.infer<typeof TextContentSchema>;

export const AssistantContentSchema = z.union([TextContentSchema, ToolUseSchema]);

export const AssistantEntrySchema = z.object({
  type: z.literal("assistant"),
  uuid: z.string(),
  timestamp: z.string(),
  parentUuid: z.string().nullable().optional(),
  sessionId: z.string().optional(),
  message: z.object({
    role: z.literal("assistant"),
    content: z.array(AssistantContentSchema),
    usage: z
      .object({
        input_tokens: z.number(),
        output_tokens: z.number(),
      })
      .optional(),
  }),
});
export type AssistantEntry = z.infer<typeof AssistantEntrySchema>;

export const SummaryEntrySchema = z.object({
  type: z.literal("summary"),
  summary: z.string(),
  leafUuid: z.string().optional(),
});
export type SummaryEntry = z.infer<typeof SummaryEntrySchema>;

export type Entry = UserEntry | AssistantEntry | SummaryEntry;

// ============================================================================
// Collector Types
// ============================================================================

export const ClaudeDirectorySchema = z.object({
  path: z.string(),
  projectName: z.string(),
  conversationCount: z.number(),
  totalSizeBytes: z.number(),
  isGlobal: z.boolean(),
});
export type ClaudeDirectory = z.infer<typeof ClaudeDirectorySchema>;

export interface Dataset {
  entries: Entry[];
  userEntries: UserEntry[];
  assistantEntries: AssistantEntry[];
  summaries: SummaryEntry[];
  totalFiles: number;
  directories: ClaudeDirectory[];
}

// ============================================================================
// Analyzer Types
// ============================================================================

export const WrappedMetricsSchema = z.object({
  // Volume stats
  totalPrompts: z.number(),
  totalResponses: z.number(),
  totalConversations: z.number(),
  totalTokensIn: z.number(),
  totalTokensOut: z.number(),

  // Code stats
  linesWritten: z.number(),
  linesEdited: z.number(),
  filesCreated: z.number(),
  filesModified: z.number(),
  languages: z.record(z.number()),

  // Tool usage
  toolCounts: z.record(z.number()),
  bashCommands: z.record(z.number()),

  // Time stats
  busiestDay: z.string(),
  busiestHour: z.number(),
  longestStreak: z.number(),
  totalSessions: z.number(),
  avgSessionMinutes: z.number(),

  // Character counts
  totalUserChars: z.number(),
  totalAssistantChars: z.number(),
  avgPromptLength: z.number(),
});
export type WrappedMetrics = z.infer<typeof WrappedMetricsSchema>;

export const PatternAnalysisSchema = z.object({
  claudePhrases: z.record(z.number()),
  userFrustration: z.record(z.number()),
  userStyle: z.record(z.record(z.number())).optional(), // NEW: detailed style breakdown
  longestPrompt: z.object({
    text: z.string(),
    length: z.number(),
  }),
  shortestPrompt: z.object({
    text: z.string(),
    length: z.number(),
  }),
  questionCount: z.number(),
  exclamationCount: z.number(),
  emojiCount: z.number().optional(),
  codeBlockCount: z.number().optional(),
  urlCount: z.number().optional(),
});
export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;

export const TimelineSchema = z.object({
  hourlyHeatmap: z.array(z.number()),
  dailyActivity: z.record(z.number()),
  weekdayTotals: z.array(z.number()),
  monthlyTrend: z.array(z.number()),
  peakHour: z.number(),
  peakDay: z.string(),
  lateNightCount: z.number(),
  weekendWarrior: z.boolean(),
  weekendPercent: z.number().optional(), // % of activity on weekends
  firstActivity: z.string(),
  lastActivity: z.string(),
});
export type Timeline = z.infer<typeof TimelineSchema>;

// ============================================================================
// Judge Types
// ============================================================================

export const PersonaResultSchema = z.object({
  persona: z.string(),
  confidence: z.number(),
  reasoning: z.string(),
  secondaryPersona: z.string().nullable(),
  roast: z.string(),
  compliment: z.string(),
});
export type PersonaResult = z.infer<typeof PersonaResultSchema>;

export interface PersonaDefinition {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  imagePrompt: string;
}

// ============================================================================
// Generator Types
// ============================================================================

export const WrappedReportSchema = z.object({
  // Identity
  persona: z.string(),
  personaEmoji: z.string(),
  personaName: z.string(),
  personaTagline: z.string(),
  personaDescription: z.string(),
  secondaryPersona: z.string().nullable(),
  roast: z.string(),
  compliment: z.string(),

  // Numbers
  metrics: WrappedMetricsSchema,
  patterns: PatternAnalysisSchema,
  timeline: TimelineSchema,

  // Narrative
  yearSummary: z.string(),
  summaries: z.array(z.string()),

  // Generated assets
  personaImagePath: z.string().nullable(),
  shareCardPath: z.string().nullable(),

  // Meta
  generatedAt: z.string(),
  version: z.string(),
});
export type WrappedReport = z.infer<typeof WrappedReportSchema>;

// ============================================================================
// Config Types
// ============================================================================

export interface Config {
  all: boolean;
  global: boolean;
  images: boolean;
  noJudge: boolean;
  yes: boolean;  // Skip confirmation prompts
  output: string;
}
