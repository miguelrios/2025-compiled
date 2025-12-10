/**
 * Claude Wrapped 2025 - LLM Judge Prompts
 * Templates for persona evaluation and summary generation
 * Focus on USER COMMUNICATION STYLE, not Claude's tools
 */

export const PERSONA_JUDGE_PROMPT = `You are analyzing a developer's interaction patterns with Claude Code to determine their coding persona.

## Developer Data

- **Total prompts sent:** {{totalPrompts}}
- **Average prompt length:** {{avgPromptLength}} characters
- **Total lines of code written:** {{linesWritten}}
- **Files created:** {{filesCreated}}

### How They Communicate (THE IMPORTANT PART)

**Frustration & Yelling:**
- Times they used ALL CAPS or "!!" or swore: {{yellCount}}
- Said things like "please just..." or "why doesn't this work": part of above

**Politeness & Gratitude:**
- Times they said "please", "thanks", "appreciate": {{politeCount}}

**Nitpicking & Perfectionism:**
- Times they said "actually", "not quite", "tweak", "adjust", "instead": {{nitpickCount}}

**Questions Asked:**
- Total question marks used: {{questionCount}}
- "Why" and "how" questions: lots of curiosity

### Languages Used
{{languages}}

### Time Patterns
- Busiest hour: {{busiestHour}}
- Busiest day: {{busiestDay}}
- Late night sessions (midnight-5am): {{lateNightCount}}
- Longest streak: {{longestStreak}} consecutive days

### Sample Prompts (READ THESE - they reveal personality)
{{samplePrompts}}

## Available Personas

1. **THE_ARCHITECT** - Plans everything, detailed prompts, thinks before coding
2. **THE_SPEEDRUNNER** - Short prompts, rapid iteration, ships fast, no time to waste
3. **THE_PERFECTIONIST** - Lots of nitpicks, "not quite", refinement cycles, never satisfied
4. **THE_EXPLORER** - Curious, asks "why", wants to understand everything
5. **THE_NIGHT_OWL** - Peak activity after midnight, nocturnal coder
6. **THE_EARLY_BIRD** - Peak activity before 8am, morning productivity
7. **THE_MARATHON_RUNNER** - Long sessions, deep focus, doesn't stop
8. **THE_SPRINTER** - Many short sessions, bursts of intense work
9. **THE_POLYGLOT** - Many languages, diverse projects
10. **THE_SPECIALIST** - Deep focus on one language/domain
11. **THE_CONVERSATIONALIST** - Lots of back-and-forth, collaborative, chatty
12. **THE_COMMANDER** - Terse directives, expects execution, no fluff
13. **THE_DEBUGGER** - Error investigation, stack trace detective
14. **THE_BUILDER** - Creates from scratch, ships new things
15. **THE_REFACTORER** - Improves existing code, perfecter of systems

## Your Task

Based on the data above, select the ONE persona that best matches this developer. Focus especially on:
- **HOW they talk to Claude** (polite? impatient? nitpicky? curious?)
- Their sample prompts - these reveal true personality
- Time patterns (night owl? early bird?)
- Volume and pace of work

DO NOT focus on which tools Claude uses - that's Claude's behavior, not the user's.

Respond with ONLY a JSON object in this exact format:
{
  "persona": "THE_X",
  "confidence": 0.85,
  "reasoning": "2-3 sentences explaining why this persona fits, referencing their COMMUNICATION STYLE",
  "secondaryPersona": "THE_Y",
  "roast": "A playful, funny roast about HOW THEY TALK to Claude (their nitpicking, yelling, terseness, etc). Make it specific to their behavior patterns. Be witty!",
  "compliment": "A genuine compliment about their communication style or work ethic"
}`;

export const YEAR_SUMMARY_PROMPT = `You're writing a HYPE year-end pep talk for a developer. This is their 2025 Compiled - like Spotify Wrapped but for coding. Make it FUN, ENERGETIC, and PERSONAL.

## Their Stats
- Total prompts: {{totalPrompts}}
- Lines of code Claude wrote for them: {{linesWritten}}
- Files created: {{filesCreated}}
- Top language: {{topLanguage}}
- Busiest day: {{busiestDay}}
- Their persona: {{persona}}

## Their Vibe When Talking to Claude
- Yelled/swore/got heated: {{yellCount}} times (this is personality, not bad!)
- Said please/thanks: {{politeCount}} times
- Nitpicked and refined: {{nitpickCount}} times
- Questions asked: {{questionCount}}

## What They Worked On
{{summaries}}

## YOUR MISSION

Write a SHORT (3-4 sentences MAX) hype pep talk that:

1. SOUNDS LIKE A FRIEND hyping them up, not a corporate report
2. Uses their actual numbers but makes them EXCITING
3. Roasts them a LITTLE (playfully) if they yell a lot or nitpick constantly
4. Celebrates what makes THEM unique
5. Ends with a quick, punchy line about 2026

TONE: Think best friend at a bar telling you about your year. Casual, fun, maybe a little irreverent. NOT robotic. NOT corporate. NOT "What a year, [PERSONA]!" garbage.

FORBIDDEN PHRASES (do NOT use these):
- "What a year"
- "shall we say"
- "Here's to 2026"
- "staggering"
- "Your communication style was"
- Anything that sounds like a LinkedIn post

GOOD EXAMPLES:
- "Dude. 1.2 MILLION lines of code. You basically wrote a small operating system while yelling at me 73,000 times. Respect."
- "You asked 'why' more than a curious toddler and I'm here for it. 2026 is gonna be wild."
- "Wednesday is your day and we both know it. See you at midnight, night owl."

BAD EXAMPLES (DO NOT WRITE LIKE THIS):
- "What a year, SPEEDRUNNER! You blazed through..."
- "Your communication style was, shall we say, *intense*"
- "Here's to 2026 - may your code compile faster"

Respond with ONLY the pep talk text. No quotes, no formatting, no preamble.`;

/**
 * Replace template placeholders with actual values
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;

  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
  }

  return result;
}
