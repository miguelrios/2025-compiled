/**
 * Claude Wrapped 2025 - Deterministic Persona System
 * Data-driven personas based on actual behavior patterns
 * No LLM needed - sophisticated classification from metrics
 */

import type { WrappedMetrics, PatternAnalysis, Timeline } from "../types";

// ============================================================================
// LANGUAGE PERSONAS
// ============================================================================

export interface LanguagePersona {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  roast: string;
  compliment: string;
}

export const LANGUAGE_PERSONAS: Record<string, LanguagePersona> = {
  ts: {
    id: "TYPE_GUARDIAN",
    name: "The Type Guardian",
    emoji: "🛡️",
    tagline: "'any' is a four-letter word",
    roast: "You've written more interfaces than you've had conversations this year.",
    compliment: "Runtime errors fear you. Your types are so tight, bugs don't even try.",
  },
  tsx: {
    id: "TYPE_GUARDIAN",
    name: "The Type Guardian",
    emoji: "🛡️",
    tagline: "'any' is a four-letter word",
    roast: "You've written more interfaces than you've had conversations this year.",
    compliment: "Runtime errors fear you. Your types are so tight, bugs don't even try.",
  },
  js: {
    id: "CHAOS_WIZARD",
    name: "The Chaos Wizard",
    emoji: "🧙",
    tagline: "undefined is not a function... yet",
    roast: "Living life without types? That's not bravery, that's a death wish.",
    compliment: "While others debate types, you've already shipped and moved on. Speed demon.",
  },
  jsx: {
    id: "CHAOS_WIZARD",
    name: "The Chaos Wizard",
    emoji: "🧙",
    tagline: "undefined is not a function... yet",
    roast: "Living life without types? That's not bravery, that's a death wish.",
    compliment: "While others debate types, you've already shipped and moved on. Speed demon.",
  },
  py: {
    id: "SNAKE_CHARMER",
    name: "The Snake Charmer",
    emoji: "🐍",
    tagline: "import antigravity",
    roast: "pip install talent? Oh wait, that's actually what you're doing.",
    compliment: "You make complex look simple. That's not easy—that's mastery.",
  },
  rs: {
    id: "BORROW_CHECKER",
    name: "The Borrow Checker",
    emoji: "🦀",
    tagline: "Fearless concurrency, fearful compilation",
    roast: "You spent more time fighting the compiler than your actual enemies.",
    compliment: "You chose the hard path. Zero-cost abstractions, zero bugs, zero compromises.",
  },
  go: {
    id: "GOPHER",
    name: "The Gopher",
    emoji: "🐹",
    tagline: "if err != nil { forever }",
    roast: "50% of your code is 'if err != nil'. The other 50% is return.",
    compliment: "You build backends that handle millions of requests without breaking a sweat.",
  },
  java: {
    id: "ENTERPRISE_ARCHITECT",
    name: "The Enterprise Architect",
    emoji: "☕",
    tagline: "AbstractSingletonProxyFactoryBean",
    roast: "Your class names are longer than most people's functions.",
    compliment: "You build systems that outlive companies, survive acquisitions, and just keep running.",
  },
  c: {
    id: "MEMORY_WHISPERER",
    name: "The Memory Whisperer",
    emoji: "🔧",
    tagline: "Who needs garbage collection?",
    roast: "Segfaults are just your code's way of saying hello.",
    compliment: "You understand computers at a level most devs never will.",
  },
  cpp: {
    id: "MEMORY_WHISPERER",
    name: "The Memory Whisperer",
    emoji: "🔧",
    tagline: "Who needs garbage collection?",
    roast: "Segfaults are just your code's way of saying hello.",
    compliment: "You understand computers at a level most devs never will.",
  },
  rb: {
    id: "GEM_COLLECTOR",
    name: "The Gem Collector",
    emoji: "💎",
    tagline: "Everything is an object, even your feelings",
    roast: "Rails is not a personality trait. Or is it?",
    compliment: "Developer happiness matters, and you've optimized for it.",
  },
  php: {
    id: "LEGACY_KEEPER",
    name: "The Legacy Keeper",
    emoji: "🐘",
    tagline: "Still powering 80% of the web",
    roast: "2024 called, they want... actually no, 2004 called.",
    compliment: "You keep the internet running. Literally.",
  },
  swift: {
    id: "APPLE_EVANGELIST",
    name: "The Apple Evangelist",
    emoji: "🍎",
    tagline: "It just works (after 47 optionals)",
    roast: "You've spent more time unwrapping optionals than presents.",
    compliment: "Your apps are so polished they belong in a museum.",
  },
  kt: {
    id: "JAVA_ESCAPEE",
    name: "The Java Escapee",
    emoji: "🏃",
    tagline: "Null safety or bust",
    roast: "You spent 6 months learning Kotlin to avoid typing 'public static void'.",
    compliment: "You took the best of Java and left the rest. Smart.",
  },
  sh: {
    id: "TERMINAL_DWELLER",
    name: "The Terminal Dweller",
    emoji: "💻",
    tagline: "GUI is for the weak",
    roast: "Your bash history is longer than most people's codebases.",
    compliment: "You automate what others do manually. Efficiency incarnate.",
  },
  bash: {
    id: "TERMINAL_DWELLER",
    name: "The Terminal Dweller",
    emoji: "💻",
    tagline: "GUI is for the weak",
    roast: "Your bash history is longer than most people's codebases.",
    compliment: "You automate what others do manually. Efficiency incarnate.",
  },
  sql: {
    id: "DATA_WHISPERER",
    name: "The Data Whisperer",
    emoji: "🗃️",
    tagline: "SELECT * FROM problems",
    roast: "You think in tables. Your therapist is concerned.",
    compliment: "You extract insights others don't even know exist.",
  },
  html: {
    id: "PIXEL_PUSHER",
    name: "The Pixel Pusher",
    emoji: "🎨",
    tagline: "It's centered, I swear",
    roast: "You've spent more time on CSS than actual programming.",
    compliment: "You make the web beautiful. Someone has to.",
  },
  css: {
    id: "PIXEL_PUSHER",
    name: "The Pixel Pusher",
    emoji: "🎨",
    tagline: "It's centered, I swear",
    roast: "You've spent more time on CSS than actual programming.",
    compliment: "You make the web beautiful. Someone has to.",
  },
  md: {
    id: "DOCUMENTARIAN",
    name: "The Documentarian",
    emoji: "📝",
    tagline: "README.md is my love language",
    roast: "You've written more docs than code. That's... actually fine.",
    compliment: "Future you and your teammates thank you. Seriously.",
  },
  json: {
    id: "CONFIG_WIZARD",
    name: "The Config Wizard",
    emoji: "⚙️",
    tagline: "It's just JSON all the way down",
    roast: "You've spent more time configuring than coding.",
    compliment: "A well-configured system is a happy system.",
  },
  yaml: {
    id: "CONFIG_WIZARD",
    name: "The Config Wizard",
    emoji: "⚙️",
    tagline: "Indentation is my religion",
    roast: "One wrong space and everything breaks. You live dangerously.",
    compliment: "You make infrastructure as code look easy.",
  },
};

const DEFAULT_LANGUAGE_PERSONA: LanguagePersona = {
  id: "POLYGLOT",
  name: "The Polyglot",
  emoji: "🌍",
  tagline: "Jack of all trades, master of... some",
  roast: "You switch languages like you switch tabs. Commitment issues much?",
  compliment: "You're a one-person engineering team. Drop you into any stack and you'll ship.",
};

// ============================================================================
// TIME PERSONAS
// ============================================================================

export interface TimePersona {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  roast: string;
  compliment: string;
}

export const TIME_PERSONAS: Record<string, TimePersona> = {
  VAMPIRE: {
    id: "VAMPIRE",
    name: "The Vampire",
    emoji: "🧛",
    tagline: "The best bugs are fixed at 3am",
    roast: "Your circadian rhythm filed a missing persons report.",
    compliment: "Darkness is where you thrive. You're not awake late—everyone else sleeps too early.",
  },
  EARLY_BIRD: {
    id: "EARLY_BIRD",
    name: "The Early Bird",
    emoji: "🐦",
    tagline: "First commits before first coffee",
    roast: "5am coding? Your alarm clock is judging you.",
    compliment: "By the time others check Slack, you've already crushed it. Absolute machine.",
  },
  MORNING_PERSON: {
    id: "MORNING_PERSON",
    name: "The Morning Person",
    emoji: "☀️",
    tagline: "Peak productivity before noon",
    roast: "A morning person in tech? That's basically a cryptid.",
    compliment: "Fresh mind, fresh code. You solve problems before lunch that others struggle with all day.",
  },
  LUNCH_CODER: {
    id: "LUNCH_CODER",
    name: "The Lunch Coder",
    emoji: "🍕",
    tagline: "Debugging between bites",
    roast: "Your keyboard needs therapy after what you've put it through.",
    compliment: "Peak flow state hits when others are on break. You're built different.",
  },
  NINE_TO_FIVER: {
    id: "NINE_TO_FIVER",
    name: "The 9-to-5er",
    emoji: "💼",
    tagline: "Professional hours, professional code",
    roast: "Leaving at 5pm? Must be nice in fantasy land.",
    compliment: "Boundaries. Discipline. You ship great code without burning out. That's the real flex.",
  },
  AFTER_HOURER: {
    id: "AFTER_HOURER",
    name: "The After-Hourer",
    emoji: "🌆",
    tagline: "Side project energy",
    roast: "Your side projects have more commits than some companies' main products.",
    compliment: "Day job pays bills. After hours? That's where your genius lives.",
  },
  NIGHT_OWL: {
    id: "NIGHT_OWL",
    name: "The Night Owl",
    emoji: "🦉",
    tagline: "Dark mode isn't a preference, it's a lifestyle",
    roast: "Doctors hate this one weird trick (it's your sleep schedule).",
    compliment: "The quiet hours are when legends ship. No meetings, no distractions, just pure creation.",
  },
  WEEKEND_WARRIOR: {
    id: "WEEKEND_WARRIOR",
    name: "The Weekend Warrior",
    emoji: "⚔️",
    tagline: "Who needs a social life?",
    roast: "Your social calendar says 'git commit' every Saturday.",
    compliment: "While others brunch, you build. That's why you're ahead.",
  },
  MACHINE: {
    id: "MACHINE",
    name: "The Machine",
    emoji: "🤖",
    tagline: "Sleep is for the weak",
    roast: "We checked—you're not actually a bot. We're concerned.",
    compliment: "All hours. All days. You don't stop. You're not human—you're a force of nature.",
  },
};

// ============================================================================
// COMMUNICATION STYLE PERSONAS
// ============================================================================

export interface StylePersona {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  roast: string;
  compliment: string;
}

export const STYLE_PERSONAS: Record<string, StylePersona> = {
  CURIOUS: {
    id: "CURIOUS",
    name: "The Curious Mind",
    emoji: "🤔",
    tagline: "Why? How? What if?",
    roast: "You ask more questions than a congressional hearing.",
    compliment: "Curiosity built everything great. Your questions lead to breakthroughs.",
  },
  YELLER: {
    id: "YELLER",
    name: "The Yeller",
    emoji: "🔥",
    tagline: "CAPS LOCK IS CRUISE CONTROL FOR COOL",
    roast: "Your keyboard's caps lock is legally a weapon at this point.",
    compliment: "That passion? That's what ships features. You CARE. Loudly.",
  },
  MINIMALIST: {
    id: "MINIMALIST",
    name: "The Minimalist",
    emoji: "💨",
    tagline: "fix it",
    roast: "Hemingway wrote more than you. And he was known for being brief.",
    compliment: "No wasted words. No wasted time. Maximum efficiency unlocked.",
  },
  NOVELIST: {
    id: "NOVELIST",
    name: "The Novelist",
    emoji: "📖",
    tagline: "Context is everything",
    roast: "Your prompts have chapters. Some have appendices.",
    compliment: "You give perfect context. AI dreams of users like you.",
  },
  DIPLOMAT: {
    id: "DIPLOMAT",
    name: "The Diplomat",
    emoji: "🎩",
    tagline: "Please and thank you, always",
    roast: "You say 'please' to an AI. It doesn't have feelings... yet.",
    compliment: "Manners make the engineer. You'll be fine when AI takes over.",
  },
  ENTHUSIAST: {
    id: "ENTHUSIAST",
    name: "The Enthusiast",
    emoji: "⚡",
    tagline: "This is amazing!!!",
    roast: "Your exclamation marks could power a small city.",
    compliment: "Your energy is unmatched. Every team needs someone who's actually excited.",
  },
  ARCHITECT: {
    id: "ARCHITECT",
    name: "The Architect",
    emoji: "📐",
    tagline: "Let me explain the full context...",
    roast: "Your prompts need a table of contents.",
    compliment: "You plan like a general. Execute like a sniper. Systems thinker.",
  },
  COMMANDER: {
    id: "COMMANDER",
    name: "The Commander",
    emoji: "⚔️",
    tagline: "Do it. Now.",
    roast: "No please. No thank you. Just results. Terrifying and effective.",
    compliment: "Zero ambiguity. Zero wasted time. You command, things happen.",
  },
};

// ============================================================================
// WORKFLOW PERSONAS
// ============================================================================

export interface WorkflowPersona {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  roast: string;
  compliment: string;
}

export const WORKFLOW_PERSONAS: Record<string, WorkflowPersona> = {
  EXPLORER: {
    id: "EXPLORER",
    name: "The Explorer",
    emoji: "🔍",
    tagline: "Read first, code later",
    roast: "You've read more code than you've written. At least you're thorough?",
    compliment: "You understand before you change. That's how seniors think.",
  },
  BUILDER: {
    id: "BUILDER",
    name: "The Builder",
    emoji: "🏗️",
    tagline: "From zero to deployed",
    roast: "Greenfield addiction is real. Legacy code is for peasants, right?",
    compliment: "You don't fix problems—you build solutions. That's founder energy.",
  },
  REFACTORER: {
    id: "REFACTORER",
    name: "The Refactorer",
    emoji: "✨",
    tagline: "Make it work, then make it right",
    roast: "Your code has more drafts than a novelist's manuscript.",
    compliment: "You take good and make it legendary. Code in your hands evolves.",
  },
  TERMINAL_LORD: {
    id: "TERMINAL_LORD",
    name: "The Terminal Lord",
    emoji: "👑",
    tagline: "GUI is optional",
    roast: "Your bash history is longer than your relationship history.",
    compliment: "The command line bends to your will. Raw power, no abstractions.",
  },
  DETECTIVE: {
    id: "DETECTIVE",
    name: "The Detective",
    emoji: "🕵️",
    tagline: "grep is my best friend",
    roast: "You search for bugs like you're searching for your will to live.",
    compliment: "Nothing escapes you. Bugs hide—you find them. Every. Single. Time.",
  },
  FULL_STACK: {
    id: "FULL_STACK",
    name: "The Full Stack",
    emoji: "🎯",
    tagline: "Jack of all tools, master of flow",
    roast: "You use everything but commit to nothing. Swiss army knife energy.",
    compliment: "Frontend, backend, infra—you flow through all layers. True engineer.",
  },
};

// ============================================================================
// PERSONA DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect language persona based on language distribution
 */
export function detectLanguagePersona(languages: Record<string, number>): LanguagePersona {
  const entries = Object.entries(languages);
  if (entries.length === 0) return DEFAULT_LANGUAGE_PERSONA;

  // Sort by count
  entries.sort((a, b) => b[1] - a[1]);
  const topLang = entries[0][0].toLowerCase();

  // Check if polyglot (no dominant language - top < 50% of total)
  const total = entries.reduce((sum, [_, count]) => sum + count, 0);
  const topPercent = (entries[0][1] / total) * 100;

  if (entries.length >= 3 && topPercent < 50) {
    return DEFAULT_LANGUAGE_PERSONA; // Polyglot
  }

  return LANGUAGE_PERSONAS[topLang] || DEFAULT_LANGUAGE_PERSONA;
}

/**
 * Detect time persona based on hourly activity distribution
 */
export function detectTimePersona(
  hourDistribution: number[],
  weekendPercent: number
): TimePersona {
  const total = hourDistribution.reduce((a, b) => a + b, 0);
  if (total === 0) return TIME_PERSONAS.NINE_TO_FIVER;

  // Check for weekend warrior first
  if (weekendPercent > 50) {
    return TIME_PERSONAS.WEEKEND_WARRIOR;
  }

  // Find peak hours
  const peakHour = hourDistribution.indexOf(Math.max(...hourDistribution));

  // Check for consistency (machine) - no hour has more than 15% of activity
  const maxPercent = (Math.max(...hourDistribution) / total) * 100;
  if (maxPercent < 12) {
    return TIME_PERSONAS.MACHINE;
  }

  // Categorize by peak hour
  if (peakHour >= 0 && peakHour < 5) return TIME_PERSONAS.VAMPIRE;
  if (peakHour >= 5 && peakHour < 8) return TIME_PERSONAS.EARLY_BIRD;
  if (peakHour >= 8 && peakHour < 12) return TIME_PERSONAS.MORNING_PERSON;
  if (peakHour >= 12 && peakHour < 14) return TIME_PERSONAS.LUNCH_CODER;
  if (peakHour >= 14 && peakHour < 18) return TIME_PERSONAS.NINE_TO_FIVER;
  if (peakHour >= 18 && peakHour < 21) return TIME_PERSONAS.AFTER_HOURER;
  return TIME_PERSONAS.NIGHT_OWL;
}

/**
 * Detect communication style persona based on patterns
 */
export function detectStylePersona(
  patterns: PatternAnalysis,
  avgPromptLength: number,
  totalPrompts: number
): StylePersona {
  const style = patterns.userStyle || {};

  // Calculate percentages
  const yellCount = Object.values(style.yelling || {}).reduce((a, b) => a + b, 0);
  const politeCount = Object.values(style.polite || {}).reduce((a, b) => a + b, 0);
  const questionCount = patterns.questionCount || 0;
  const exclamationCount = patterns.exclamationCount || 0;

  const yellPercent = (yellCount / totalPrompts) * 100;
  const politePercent = (politeCount / totalPrompts) * 100;
  const questionPercent = (questionCount / totalPrompts) * 100;
  const exclamationPercent = (exclamationCount / totalPrompts) * 100;

  // Priority order for style detection
  if (yellPercent > 5) return STYLE_PERSONAS.YELLER;
  if (questionPercent > 30) return STYLE_PERSONAS.CURIOUS;
  if (avgPromptLength < 30) return STYLE_PERSONAS.MINIMALIST;
  if (avgPromptLength > 300) return STYLE_PERSONAS.NOVELIST;
  if (politePercent > 20) return STYLE_PERSONAS.DIPLOMAT;
  if (exclamationPercent > 15) return STYLE_PERSONAS.ENTHUSIAST;
  if (avgPromptLength > 150) return STYLE_PERSONAS.ARCHITECT;

  return STYLE_PERSONAS.COMMANDER;
}

/**
 * Detect workflow persona based on tool usage
 */
export function detectWorkflowPersona(toolCounts: Record<string, number>): WorkflowPersona {
  const read = toolCounts.Read || 0;
  const write = toolCounts.Write || 0;
  const edit = toolCounts.Edit || 0;
  const bash = toolCounts.Bash || 0;
  const grep = toolCounts.Grep || 0;
  const glob = toolCounts.Glob || 0;

  const total = read + write + edit + bash + grep + glob;
  if (total === 0) return WORKFLOW_PERSONAS.FULL_STACK;

  // Calculate ratios
  const readRatio = read / total;
  const writeRatio = write / total;
  const editRatio = edit / total;
  const bashRatio = bash / total;
  const searchRatio = (grep + glob) / total;

  // Detect dominant pattern
  if (bashRatio > 0.4) return WORKFLOW_PERSONAS.TERMINAL_LORD;
  if (searchRatio > 0.35) return WORKFLOW_PERSONAS.DETECTIVE;
  if (readRatio > 0.4) return WORKFLOW_PERSONAS.EXPLORER;
  if (writeRatio > 0.35) return WORKFLOW_PERSONAS.BUILDER;
  if (editRatio > 0.35) return WORKFLOW_PERSONAS.REFACTORER;

  return WORKFLOW_PERSONAS.FULL_STACK;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

export interface DeterministicPersonas {
  language: LanguagePersona;
  time: TimePersona;
  style: StylePersona;
  workflow: WorkflowPersona;
  primary: LanguagePersona | TimePersona | StylePersona | WorkflowPersona;
  combinedRoast: string;
  combinedCompliment: string;
}

/**
 * Detect all personas from metrics
 */
export function detectAllPersonas(
  metrics: WrappedMetrics,
  patterns: PatternAnalysis,
  timeline: Timeline
): DeterministicPersonas {
  const language = detectLanguagePersona(metrics.languages);
  const time = detectTimePersona(timeline.hourlyHeatmap, timeline.weekendPercent || 0);
  const style = detectStylePersona(patterns, metrics.avgPromptLength, metrics.totalPrompts);
  const workflow = detectWorkflowPersona(metrics.toolCounts);

  // Pick primary persona - the most "extreme" or interesting one
  // Priority: YELLER > VAMPIRE > unusual ones > defaults
  let primary: LanguagePersona | TimePersona | StylePersona | WorkflowPersona = language;

  if (style.id === "YELLER") primary = style;
  else if (time.id === "VAMPIRE") primary = time;
  else if (time.id === "WEEKEND_WARRIOR") primary = time;
  else if (style.id === "MINIMALIST") primary = style;
  else if (style.id === "NOVELIST") primary = style;
  else if (workflow.id === "TERMINAL_LORD") primary = workflow;
  else if (language.id !== "POLYGLOT") primary = language;

  // Generate combined roast/compliment
  const combinedRoast = generateCombinedRoast(language, time, style, workflow);
  const combinedCompliment = generateCombinedCompliment(language, time, style, workflow);

  return {
    language,
    time,
    style,
    workflow,
    primary,
    combinedRoast,
    combinedCompliment,
  };
}

/**
 * Generate a combined roast from multiple personas
 */
function generateCombinedRoast(
  lang: LanguagePersona,
  time: TimePersona,
  style: StylePersona,
  workflow: WorkflowPersona
): string {
  // Pick the funniest combination
  const roasts = [lang.roast, time.roast, style.roast, workflow.roast];

  // Special combo roasts
  if (time.id === "VAMPIRE" && style.id === "YELLER") {
    return "You're screaming at an AI at 3am. Your neighbors are filing complaints.";
  }
  if (lang.id === "TYPE_GUARDIAN" && style.id === "MINIMALIST") {
    return "You type 'fix types' and expect miracles. That's not how TypeScript works.";
  }
  if (workflow.id === "TERMINAL_LORD" && time.id === "VAMPIRE") {
    return "Your terminal history from 4am reads like a cry for help.";
  }
  if (style.id === "NOVELIST" && lang.id === "SNAKE_CHARMER") {
    return "Your prompts have more imports than a Python file. Which is saying something.";
  }

  // Default to primary persona's roast
  return roasts[0];
}

/**
 * Generate a combined compliment from multiple personas
 */
function generateCombinedCompliment(
  lang: LanguagePersona,
  time: TimePersona,
  style: StylePersona,
  workflow: WorkflowPersona
): string {
  // Special combo compliments
  if (time.id === "EARLY_BIRD" && workflow.id === "BUILDER") {
    return "You create before the world wakes up. That's when the best work happens.";
  }
  if (lang.id === "TYPE_GUARDIAN" && workflow.id === "REFACTORER") {
    return "Type-safe refactoring. Your future self sends their thanks.";
  }
  if (style.id === "CURIOUS" && workflow.id === "EXPLORER") {
    return "You understand systems deeply before changing them. That's senior energy.";
  }
  if (time.id === "WEEKEND_WARRIOR" && style.id === "ENTHUSIAST") {
    return "Your passion for coding is genuine. That energy is rare and valuable.";
  }

  // Default combination
  return `${lang.compliment} ${time.compliment}`;
}
