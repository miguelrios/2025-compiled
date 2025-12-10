/**
 * Claude Wrapped 2025 - Persona Definitions
 * 15 coding personas with descriptions and image prompts
 */

import type { PersonaDefinition } from "../types";

export const PERSONAS: Record<string, PersonaDefinition> = {
  THE_ARCHITECT: {
    id: "THE_ARCHITECT",
    name: "The Architect",
    emoji: "📐",
    tagline: "You don't just code, you orchestrate.",
    description:
      "Your prompts read like blueprints. Every task is planned, every detail considered. You see the big picture before writing a single line.",
    imagePrompt:
      "Abstract brutalist architectural blueprint, white background, thin black precise lines forming geometric building structures, isometric grid, technical drawing aesthetic, minimalist, no text, sharp 90-degree angles only",
  },

  THE_SPEEDRUNNER: {
    id: "THE_SPEEDRUNNER",
    name: "The Speedrunner",
    emoji: "⚡",
    tagline: "Why use 10 words when 3 will do?",
    description:
      "You treat Claude like a Unix pipe. Short, direct, efficient. You're here to ship, not to chat.",
    imagePrompt:
      "Abstract motion blur lines, white background, black streaks suggesting velocity, minimal geometric shapes in motion, brutalist speed aesthetic, sharp edges, no curves, high contrast",
  },

  THE_PERFECTIONIST: {
    id: "THE_PERFECTIONIST",
    name: "The Perfectionist",
    emoji: "🎯",
    tagline: "Close enough is never close enough.",
    description:
      "One more edit. Just one more. Your code isn't done until it's exactly right. Every semicolon matters.",
    imagePrompt:
      "Geometric precision pattern, white background, perfectly aligned black grid lines, mathematical accuracy, brutalist minimalism, sharp 90-degree corners, no imperfections",
  },

  THE_EXPLORER: {
    id: "THE_EXPLORER",
    name: "The Explorer",
    emoji: "🔍",
    tagline: "Let's see what this codebase is hiding.",
    description:
      "Read. Grep. Search. You understand before you change. Every modification starts with investigation.",
    imagePrompt:
      "Abstract maze pattern, white background, black labyrinth lines, geometric exploration paths, brutalist search aesthetic, sharp corners, minimalist discovery theme",
  },

  THE_NIGHT_OWL: {
    id: "THE_NIGHT_OWL",
    name: "The Night Owl",
    emoji: "🦉",
    tagline: "The best code is written after midnight.",
    description:
      "While others sleep, you ship. The quiet hours are your domain. Darkness is your IDE theme and your lifestyle.",
    imagePrompt:
      "Minimal moon and stars, white background, black geometric owl silhouette, stark nighttime aesthetic, brutalist, sharp angular shapes only, no curves",
  },

  THE_EARLY_BIRD: {
    id: "THE_EARLY_BIRD",
    name: "The Early Bird",
    emoji: "🌅",
    tagline: "First commits before first coffee.",
    description:
      "You catch bugs while others catch Zs. Morning productivity is your superpower. By lunch, you've shipped a feature.",
    imagePrompt:
      "Abstract sunrise lines, white background, geometric sun rays in black, horizontal stripes suggesting dawn, brutalist morning aesthetic, sharp edges",
  },

  THE_MARATHON_RUNNER: {
    id: "THE_MARATHON_RUNNER",
    name: "The Marathon Runner",
    emoji: "🏃",
    tagline: "Deep work, deeper focus.",
    description:
      "Hours disappear when you code. Your sessions are legendary. You enter flow state and emerge with features.",
    imagePrompt:
      "Long horizontal lines, white background, parallel black tracks extending to infinity, geometric endurance pattern, brutalist persistence theme, minimalist",
  },

  THE_SPRINTER: {
    id: "THE_SPRINTER",
    name: "The Sprinter",
    emoji: "💨",
    tagline: "Quick wins, quick iterations.",
    description:
      "Many sessions, many commits. You work in bursts of brilliant productivity. Context switching is your cardio.",
    imagePrompt:
      "Multiple short parallel lines, white background, scattered geometric dashes, staccato pattern, brutalist burst aesthetic, sharp edges, high energy",
  },

  THE_POLYGLOT: {
    id: "THE_POLYGLOT",
    name: "The Polyglot",
    emoji: "🌐",
    tagline: "Any language, any stack, any time.",
    description:
      "Python today, TypeScript tomorrow, Rust next week. Your versatility knows no bounds. Languages are just tools.",
    imagePrompt:
      "Multiple geometric shapes, white background, black squares circles triangles, diverse patterns, brutalist variety theme, sharp 90-degree corners, minimalist diversity",
  },

  THE_SPECIALIST: {
    id: "THE_SPECIALIST",
    name: "The Specialist",
    emoji: "🎓",
    tagline: "Master of one, master of much.",
    description:
      "Deep expertise in your domain. You know every edge case, every pattern. Specialists ship reliable code.",
    imagePrompt:
      "Single bold geometric shape, white background, one large black square, focused precision, brutalist simplicity, absolute minimalism, stark contrast",
  },

  THE_CONVERSATIONALIST: {
    id: "THE_CONVERSATIONALIST",
    name: "The Conversationalist",
    emoji: "💬",
    tagline: "Code is a dialogue.",
    description:
      "You think out loud with Claude. Questions lead to answers lead to better questions. Collaboration is creation.",
    imagePrompt:
      "Speech bubble shapes, white background, geometric quote marks, angular dialogue pattern, brutalist conversation aesthetic, sharp corners, black on white",
  },

  THE_COMMANDER: {
    id: "THE_COMMANDER",
    name: "The Commander",
    emoji: "⚔️",
    tagline: "No fluff. Execute.",
    description:
      "Terse. Direct. Effective. You know what you want and you say it clearly. Claude executes your orders.",
    imagePrompt:
      "Military-inspired geometric pattern, white background, bold angular black chevrons, command aesthetic, brutalist authority, sharp precise shapes",
  },

  THE_DEBUGGER: {
    id: "THE_DEBUGGER",
    name: "The Debugger",
    emoji: "🐛",
    tagline: "Bugs fear you.",
    description:
      "Stack traces are your bedtime reading. Error messages are clues. You don't just fix bugs, you hunt them.",
    imagePrompt:
      "Circuit board pattern, white background, thin black traces, geometric bug shapes integrated, technical brutalist aesthetic, sharp corners, detective pattern",
  },

  THE_BUILDER: {
    id: "THE_BUILDER",
    name: "The Builder",
    emoji: "🏗️",
    tagline: "From zero to deployed.",
    description:
      "Greenfield is your happy place. You create more than you modify. New projects, new possibilities.",
    imagePrompt:
      "Construction crane geometric shape, white background, angular black lines forming structure, building pattern, brutalist creation aesthetic, sharp edges",
  },

  THE_REFACTORER: {
    id: "THE_REFACTORER",
    name: "The Refactorer",
    emoji: "♻️",
    tagline: "Make it work, then make it right.",
    description:
      "Good code becomes great code in your hands. You improve what exists. Technical debt doesn't stand a chance.",
    imagePrompt:
      "Transformation pattern, white background, geometric shapes morphing, angular recycling aesthetic, brutalist improvement theme, sharp 90-degree corners",
  },
};

/**
 * Get persona by ID with fallback
 */
export function getPersona(id: string): PersonaDefinition {
  return PERSONAS[id] || PERSONAS.THE_BUILDER;
}

/**
 * Get all persona IDs
 */
export function getAllPersonaIds(): string[] {
  return Object.keys(PERSONAS);
}
