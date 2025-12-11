---
description: Generate your 2025 Compiled year-in-review
argument-hint: [--all]
allowed-tools: Bash(*), Read(*), Write(*), Glob(*), Grep(*), Edit(*)
---

# 2025 Compiled

Generate a personalized year-in-review of your Claude Code usage.

## Arguments
- `--all`: Analyze all found .claude directories without prompting

User args: $ARGUMENTS

## Instructions

1. Find the plugin directory, ensure Bun is installed, install dependencies, and run the analysis (ALL IN ONE COMMAND):
   ```bash
   /bin/bash -c 'PKG=$(find ~/.claude/plugins -type f -name "package.json" -path "*cache*" -path "*2025-compiled*" ! -path "*/node_modules/*" 2>/dev/null | head -1) && PLUGIN_DIR=$(dirname "$PKG") && [ -d "$PLUGIN_DIR" ] && echo "PLUGIN_DIR=$PLUGIN_DIR" && (command -v bun >/dev/null || { curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH"; }) && cd "$PLUGIN_DIR" && bun install && bun run src/index.ts --no-judge '"$ARGUMENTS"''
   ```

2. Use the Read tool to read `$PLUGIN_DIR/output/wrapped-2025/data.json` - this contains all the user's stats (prompts, lines, languages, etc).

3. Use the Read tool to read `$PLUGIN_DIR/output/wrapped-2025/sample_prompts.txt` - this contains 200 RANDOMIZED sample prompts showing the user's REAL communication style, frustrations, and personality.

4. **CRITICAL: Analyze the user's ACTUAL prompts and generate ALL personalized content.**

   Read sample_prompts.txt CAREFULLY. These are REAL messages from this specific user. Look for:
   - Their catchphrases and repeated expressions
   - How they communicate (polite? demanding? curious? frustrated?)
   - Specific projects, tools, or technologies they mention
   - Their frustrations and what makes them excited
   - Unique quirks in how they write

   **Generate the following pieces - each must be UNIQUE to this user:**

   ---

   ### A) VIBE (Communication Style)

   Based on their prompts, what's their communication vibe? Create a fun label.

   - **VIBE_EMOJI**: A single emoji that captures their style (e.g., ⚔️, 🔥, 🤔, 🎩, 💨, 🚀)
   - **VIBE_NAME**: A short title in ALL CAPS (e.g., "THE COMMANDER", "THE CURIOUS ONE", "THE SPEEDRUNNER", "NO BS ZONE")
   - **VIBE_DESCRIPTION**: One sentence describing how they talk to Claude (reference specific patterns you see)

   Examples of GOOD vibes (based on real patterns):
   - If they use lots of caps and curse words: 🔥 "THE FIREBREATHER" - "You don't ask, you demand. And usually in ALL CAPS."
   - If they're super polite: 🎩 "THE DIPLOMAT" - "Please and thank you, even when the code is on fire."
   - If they're terse and direct: 💨 "THE MINIMALIST" - "fix it. ship it. next."
   - If they ask lots of questions: 🤔 "THE CURIOUS ONE" - "Why? How? What if? Your favorite words."

   ---

   ### A2) HOW THEY TALK (4 Phrases)

   Write 4 short, punchy phrases describing HOW this user communicates. Each should be specific to their actual style.

   - **TALK_STYLE_1**: First observation (e.g., "Commands, not questions")
   - **TALK_STYLE_2**: Second observation (e.g., "ALL CAPS when frustrated")
   - **TALK_STYLE_3**: Third observation (e.g., "Drops f-bombs like semicolons")
   - **TALK_STYLE_4**: Fourth observation (e.g., "Never says please, always says 'dope'")

   Make these SPECIFIC to the user's actual prompts. Generic phrases are boring.

   ---

   ### B) PERSONA (Overall Identity)

   Based on EVERYTHING - their projects, schedule, languages, communication style - who are they as a developer?

   - **PERSONA_EMOJI**: A single emoji for their developer identity
   - **PERSONA_NAME**: Their title in ALL CAPS (e.g., "THE ARCHITECT", "THE NIGHT BUILDER", "THE FULL STACK WARRIOR")
   - **PERSONA_TAGLINE**: A short punchy tagline in quotes (e.g., "No fluff. Execute.", "Sleep is for the weak.", "If it compiles, ship it.")
   - **PERSONA_DESCRIPTION**: 2-3 sentences describing WHO they are as a developer. Reference SPECIFIC things from their prompts - projects they built, their workflow, their energy.

   ---

   ### C) ROAST (2-3 sentences)

   A FUNNY jab at the user. Use ACTUAL QUOTES or patterns from their prompts!

   - Quote their catchphrases or funny moments
   - Reference their ALL CAPS outbursts if they have them
   - Poke fun at specific frustrations you see
   - BE SPECIFIC - generic roasts are boring

   ---

   ### D) HYPE (2-3 sentences)

   Genuine praise. Reference SPECIFIC accomplishments from their prompts.

   - What did they build? (Name actual projects/features)
   - What's impressive about their output? (Use the numbers from data.json)
   - What makes them unique?

   ---

   ### E) SUMMARY (2-4 sentences)

   Tell THEIR story. Use quotes and specifics.

   - What defined their year?
   - What frustrated them and what excited them?
   - Include at least one direct quote from their prompts
   - End with something memorable

   ---

5. **CREATE THE SHARE DATA JSON**: Use the Write tool to create `$PLUGIN_DIR/output/wrapped-2025/share-data.json` with this structure (fill in from data.json + your generated content):

   ```json
   {
     "metrics": {
       "totalPrompts": <from data.json>,
       "linesWritten": <from data.json>,
       "totalResponses": <from data.json>,
       "filesCreated": <from data.json>,
       "totalSessions": <from data.json>,
       "longestStreak": <from data.json>,
       "languages": <from data.json - the full languages object>,
       "youreRight": <from data.json patterns.claudePhrases.youreRight>
     },
     "timeline": {
       "peakHour": <from data.json>,
       "hourlyHeatmap": <from data.json - array of 24 numbers>,
       "weekdayTotals": <from data.json - array of 7 numbers>,
       "dailyActivity": <from data.json - object with date keys>
     },
     "claude": {
       "vibeEmoji": "<your VIBE_EMOJI>",
       "vibeName": "<your VIBE_NAME>",
       "vibeDesc": "<your VIBE_DESCRIPTION>",
       "talkStyle1": "<your TALK_STYLE_1>",
       "talkStyle2": "<your TALK_STYLE_2>",
       "talkStyle3": "<your TALK_STYLE_3>",
       "talkStyle4": "<your TALK_STYLE_4>",
       "personaEmoji": "<your PERSONA_EMOJI>",
       "personaName": "<your PERSONA_NAME>",
       "personaTagline": "<your PERSONA_TAGLINE>",
       "personaDesc": "<your PERSONA_DESCRIPTION>",
       "roast": "<your ROAST>",
       "hype": "<your HYPE>",
       "summary": "<your SUMMARY>"
     }
   }
   ```

6. **OPEN IN BROWSER**: Generate the share URL and open it directly:
   ```bash
   /bin/bash -c 'PKG=$(find ~/.claude/plugins -type f -name "package.json" -path "*cache*" -path "*2025-compiled*" ! -path "*/node_modules/*" 2>/dev/null | head -1) && PLUGIN_DIR=$(dirname "$PKG") && cd "$PLUGIN_DIR" && node static/generate-url.cjs output/wrapped-2025/share-data.json'
   ```

   This opens `https://2025compiled.com/shared?d=...` directly in the browser.

   **For local development only** (use `--local` flag): If the user passes `--local`, start a local server instead:
   ```bash
   /bin/bash -c 'PKG=$(find ~/.claude/plugins -type f -name "package.json" -path "*cache*" -path "*2025-compiled*" ! -path "*/node_modules/*" 2>/dev/null | head -1) && PLUGIN_DIR=$(dirname "$PKG") && cd "$PLUGIN_DIR/static" && pkill -f "python3 -m http.server 8025" 2>/dev/null; python3 -m http.server 8025 &>/dev/null & sleep 1 && cd "$PLUGIN_DIR" && node static/generate-url.cjs output/wrapped-2025/share-data.json --local'
   ```

7. **SHARE WITH THE USER**:
   - Show their vibe, a funny quote from their prompts, and one impressive stat
   - Tell them: "Share this URL with friends - it works anywhere, no login needed!"
