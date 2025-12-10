/**
 * Claude Wrapped 2025 - HTML Generator
 * BRUTALIST Instagram Stories style - harsh, raw, industrial
 * Focus on USER COMMUNICATION STYLE, not tools
 */

import type { WrappedReport } from "../types";
import { formatNumber } from "./report";
import { formatHour, getTimeOfDay } from "../analyzer";

/**
 * Generate 24-hour clock heatmap HTML
 * Creates a circular clock visualization of hourly activity
 */
function generate24HourClockHTML(hourlyHeatmap: number[], peakHour: number): string {
  const maxActivity = Math.max(...hourlyHeatmap, 1);

  // Create SVG-based circular clock with padding for labels
  const size = 240;
  const center = size / 2;
  const outerRadius = 85;
  const innerRadius = 50;

  const segments: string[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const activity = hourlyHeatmap[hour] || 0;
    const intensity = activity / maxActivity;

    // Calculate opacity based on intensity
    const opacity = activity === 0 ? 0.1 : 0.2 + (intensity * 0.8);
    const isPeak = hour === peakHour;

    // Angle calculation: 0 hour at top, clockwise
    // Each hour = 15 degrees (360/24)
    const startAngle = (hour * 15 - 90) * (Math.PI / 180);
    const endAngle = ((hour + 1) * 15 - 90) * (Math.PI / 180);

    // Calculate arc points
    const x1Outer = center + outerRadius * Math.cos(startAngle);
    const y1Outer = center + outerRadius * Math.sin(startAngle);
    const x2Outer = center + outerRadius * Math.cos(endAngle);
    const y2Outer = center + outerRadius * Math.sin(endAngle);

    const x1Inner = center + innerRadius * Math.cos(endAngle);
    const y1Inner = center + innerRadius * Math.sin(endAngle);
    const x2Inner = center + innerRadius * Math.cos(startAngle);
    const y2Inner = center + innerRadius * Math.sin(startAngle);

    // Create arc path
    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 0 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 0 0 ${x2Inner} ${y2Inner}`,
      'Z'
    ].join(' ');

    const fillColor = isPeak ? 'white' : 'white';
    const strokeColor = isPeak ? 'white' : 'rgba(255,255,255,0.3)';

    segments.push(
      `<path d="${path}" fill="${fillColor}" fill-opacity="${isPeak ? 1 : opacity}" stroke="${strokeColor}" stroke-width="1"/>`
    );

    // Add hour labels for key hours (0, 6, 12, 18)
    if (hour % 6 === 0) {
      const labelRadius = outerRadius + 12;
      const midAngle = (hour * 15 - 90) * (Math.PI / 180);
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      const label = hour === 0 ? '12A' : hour === 6 ? '6A' : hour === 12 ? '12P' : '6P';

      segments.push(
        `<text x="${labelX}" y="${labelY}" fill="white" fill-opacity="0.6" font-size="10" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono">${label}</text>`
      );
    }
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" class="w-32 h-32 lg:w-44 lg:h-44">
      ${segments.join('')}
    </svg>
  `;
}

/**
 * Generate GitHub-style heatmap calendar HTML
 * Shows LAST 30 DAYS only (honest representation of available data)
 */
function generateHeatmapHTML(dailyActivity: Record<string, number>): string {
  // Get max activity for scaling
  const values = Object.values(dailyActivity);
  const maxActivity = Math.max(...values, 1);

  // Last 30 days from today
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29); // 30 days including today

  // Build days array (30 days, displayed as ~5 weeks)
  const days: string[] = [];
  let currentDate = new Date(startDate);

  // Find what day of week we start on
  const startDayOfWeek = startDate.getDay();

  // Add empty cells for days before start
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(`<div class="w-4 h-4 lg:w-6 lg:h-6"></div>`);
  }

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const activity = dailyActivity[dateStr] || 0;

    // Calculate intensity level (0-4)
    let level = 0;
    if (activity > 0) {
      const ratio = activity / maxActivity;
      if (ratio < 0.25) level = 1;
      else if (ratio < 0.5) level = 2;
      else if (ratio < 0.75) level = 3;
      else level = 4;
    }

    const opacityClasses = [
      'bg-white/10',  // 0 - empty
      'bg-white/30',  // 1 - low
      'bg-white/50',  // 2 - medium-low
      'bg-white/75',  // 3 - medium-high
      'bg-white',     // 4 - high
    ];

    const dayNum = currentDate.getDate();
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' });

    days.push(
      `<div class="w-4 h-4 lg:w-6 lg:h-6 ${opacityClasses[level]} flex items-center justify-center text-[6px] lg:text-[8px] ${level > 2 ? 'text-brutal-black' : 'text-white/50'}" title="${month} ${dayNum}: ${activity} prompts">${dayNum}</div>`
    );

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days.join('');
}

/**
 * Map persona ID to image filename
 */
function getPersonaImageFile(personaId: string): string {
  const map: Record<string, string> = {
    THE_ARCHITECT: "architect.jpg",
    THE_SPEEDRUNNER: "speedrunner.jpg",
    THE_PERFECTIONIST: "perfectionist.jpg",
    THE_EXPLORER: "explorer.jpg",
    THE_NIGHT_OWL: "night_owl.jpg",
    THE_EARLY_BIRD: "early_bird.jpg",
    THE_MARATHON_RUNNER: "marathon_runner.jpg",
    THE_SPRINTER: "sprinter.jpg",
    THE_POLYGLOT: "polyglot.jpg",
    THE_SPECIALIST: "specialist.jpg",
    THE_CONVERSATIONALIST: "conversationalist.jpg",
    THE_COMMANDER: "commander.jpg",
    THE_DEBUGGER: "debugger.jpg",
    THE_BUILDER: "builder.jpg",
    THE_REFACTORER: "refactorer.jpg",
  };
  return map[personaId] || "builder.jpg";
}

/**
 * Day of week personas - fun names for each day
 */
const DAY_PERSONAS: Record<number, { name: string; emoji: string; tagline: string }> = {
  0: { name: "THE SUNDAY SCARIES", emoji: "😰", tagline: "Prepping for Monday, one commit at a time" },
  1: { name: "THE MONDAY MANIAC", emoji: "💪", tagline: "Fresh week, fresh bugs to squash" },
  2: { name: "THE TUESDAY GRINDER", emoji: "⚙️", tagline: "Head down, code flowing" },
  3: { name: "THE HUMP DAY HERO", emoji: "🐪", tagline: "Halfway there, still shipping" },
  4: { name: "THE THURSDAY THRASHER", emoji: "🎸", tagline: "Almost Friday energy" },
  5: { name: "THE FRIDAY DEPLOYER", emoji: "🔥", tagline: "YOLO deploying to prod" },
  6: { name: "THE SATURDAY HACKER", emoji: "🌙", tagline: "Side projects don't build themselves" },
};

/**
 * Get day of week stats and persona
 */
function getDayOfWeekStats(weekdayTotals: number[]) {
  const total = weekdayTotals.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...weekdayTotals);
  const peakDayIndex = weekdayTotals.indexOf(maxCount);

  // Calculate percentages for each day
  const dayStats = weekdayTotals.map((count, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    fullDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
    count,
    percent: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  // Weekend percentage
  const weekendCount = weekdayTotals[0] + weekdayTotals[6];
  const weekendPercent = total > 0 ? Math.round((weekendCount / total) * 100) : 0;

  return {
    dayStats,
    peakDayIndex,
    peakDay: dayStats[peakDayIndex],
    persona: DAY_PERSONAS[peakDayIndex],
    weekendPercent,
    isWeekendWarrior: weekendPercent > 40,
  };
}


/**
 * Generate the complete HTML page - BRUTALIST Stories style
 */
export function generateHTML(report: WrappedReport): string {
  const topLanguage =
    Object.entries(report.metrics.languages).sort((a, b) => b[1] - a[1])[0]?.[0] || "code";

  const youreRightCount = report.patterns.claudePhrases.youreRight || 0;

  // Get top 3 languages with percentages
  const langEntries = Object.entries(report.metrics.languages).sort((a, b) => b[1] - a[1]);
  const totalLangCount = langEntries.reduce((sum, [_, count]) => sum + count, 0);
  const topLangs = langEntries.slice(0, 3).map(([lang, count]) => ({
    lang,
    count,
    percent: totalLangCount > 0 ? Math.round((count / totalLangCount) * 100) : 0,
  }));


  // Get day of week stats
  const dayStats = getDayOfWeekStats(report.timeline.weekdayTotals);

  // Get persona-specific background image
  const personaImage = getPersonaImageFile(report.persona);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>2025 COMPILED</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            brutal: {
              black: '#0A0A0A',
              red: '#CC0000',
              green: '#004400',
            }
          }
        }
      }
    }
  </script>
  <style>${getStyles()}</style>
</head>
<body class="font-mono bg-brutal-black text-white min-h-screen overflow-hidden select-none">
  <!-- Progress bar - full width -->
  <div class="fixed top-0 left-0 right-0 h-2 bg-white/10 z-50">
    <div class="h-full bg-white transition-all duration-200" id="progress" style="width: 0%"></div>
  </div>

  <!-- Story indicators -->
  <div class="fixed top-6 left-8 right-8 lg:left-16 lg:right-16 flex gap-1 z-50" id="indicators"></div>

  <!-- Stories container - FULLSCREEN -->
  <div class="stories fixed inset-0" id="stories">

    <!-- STORY 1: Intro with christmas Claudio -->
    <div class="story active absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-90" style="background-image: url('images/personas/christmas.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-10">COMPILED</div>
        <h1 class="text-[25vw] lg:text-[20vw] font-extrabold leading-none tracking-tight">2025</h1>
        <div class="text-sm lg:text-lg tracking-[0.3em] opacity-50 animate-pulse mt-8 lg:mt-12">TAP OR CLICK →</div>
      </div>
    </div>

    <!-- STORY 2: Prompts with festive messages bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-60" style="background-image: url('images/festive/prompts.jpg');"></div>
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-8">PAST 30 DAYS</div>
        <div class="text-[18vw] lg:text-[15vw] font-extrabold leading-none">${formatNumber(report.metrics.totalPrompts)}</div>
        <div class="text-xl lg:text-4xl font-extrabold tracking-[0.2em] mt-2 lg:mt-6">PROMPTS</div>
        <div class="text-sm lg:text-xl opacity-60 mt-4 lg:mt-8">to Claude</div>
      </div>
    </div>

    <!-- STORY 3: Lines of Code with festive building bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-70" style="background-image: url('images/festive/building.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-8">CLAUDE WROTE</div>
        <div class="text-[15vw] lg:text-[12vw] font-extrabold leading-none">${formatNumber(report.metrics.linesWritten)}</div>
        <div class="text-xl lg:text-4xl font-extrabold tracking-[0.2em] mt-2 lg:mt-6">LINES</div>
        <div class="text-sm lg:text-xl opacity-70 mt-4 lg:mt-8">of code for you</div>
      </div>
    </div>

    <!-- STORY 4: Top Language with festive languages bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-60" style="background-image: url('images/festive/languages.jpg');"></div>
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-8">YOUR STACK</div>
        <div class="text-[22vw] lg:text-[18vw] font-extrabold leading-none">.${topLanguage}</div>
        <div class="mt-6 lg:mt-12 max-w-[280px] lg:max-w-[500px] mx-auto">
          ${topLangs.map((item, i) => `
            <div class="flex items-center gap-3 lg:gap-6 mb-2 lg:mb-4">
              <span class="w-7 h-7 lg:w-12 lg:h-12 bg-white text-brutal-black flex items-center justify-center font-extrabold text-sm lg:text-xl">${i + 1}</span>
              <span class="w-14 lg:w-24 font-bold text-sm lg:text-xl">.${item.lang}</span>
              <span class="flex-1 h-1.5 lg:h-3 bg-white/30"><span class="block h-full bg-white" style="width: ${item.percent}%"></span></span>
              <span class="text-sm lg:text-xl font-bold">${item.percent}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- STORY 5: You're Absolutely Right with festive chat bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-red overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('images/festive/chat.jpg');"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-8">CLAUDE SAID</div>
        <div class="text-lg lg:text-3xl italic mb-4 lg:mb-8 max-w-[260px] lg:max-w-[500px] mx-auto">"You're absolutely right"</div>
        <div class="text-[20vw] lg:text-[15vw] font-extrabold leading-none">${youreRightCount}</div>
        <div class="text-xl lg:text-4xl font-extrabold tracking-[0.2em] mt-2 lg:mt-6">TIMES</div>
      </div>
    </div>

    <!-- STORY 6: Communication Style with festive vibe bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/vibe.jpg');"></div>
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-8">YOUR VIBE</div>
        <div class="text-6xl lg:text-9xl mb-2 lg:mb-6" id="vibe-emoji">{{VIBE_EMOJI}}</div>
        <div class="text-[9vw] lg:text-[7vw] font-extrabold leading-tight" id="vibe-name">{{VIBE_NAME}}</div>
        <div class="text-sm lg:text-2xl opacity-60 mt-4 lg:mt-8 max-w-[280px] lg:max-w-[600px] mx-auto" id="vibe-desc">{{VIBE_DESCRIPTION}}</div>
      </div>
    </div>

    <!-- STORY 7: Communication Breakdown with festive commander bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/commander.jpg');"></div>
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-12">HOW YOU TALK</div>
        <div class="max-w-[300px] lg:max-w-[600px] mx-auto space-y-4 lg:space-y-6">
          <div class="text-base lg:text-2xl font-medium" id="talk-style-1">{{TALK_STYLE_1}}</div>
          <div class="text-base lg:text-2xl font-medium" id="talk-style-2">{{TALK_STYLE_2}}</div>
          <div class="text-base lg:text-2xl font-medium" id="talk-style-3">{{TALK_STYLE_3}}</div>
          <div class="text-base lg:text-2xl font-medium" id="talk-style-4">{{TALK_STYLE_4}}</div>
        </div>
      </div>
    </div>

    <!-- STORY 8: Peak Time with festive night bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-70" style="background-image: url('images/festive/night.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-6">PEAK HOUR</div>
        <div class="text-[15vw] lg:text-[12vw] font-extrabold leading-none">${formatHour(report.timeline.peakHour)}</div>
        <div class="text-base lg:text-2xl opacity-70 mt-2 lg:mt-4">${getTimeOfDay(report.timeline.peakHour)}</div>

        <!-- 24-hour clock heatmap -->
        <div class="mt-6 lg:mt-8 flex justify-center">
          ${generate24HourClockHTML(report.timeline.hourlyHeatmap, report.timeline.peakHour)}
        </div>

      </div>
    </div>

    <!-- STORY 9: Day of Week with festive calendar bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/calendar.jpg');"></div>
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-6">YOUR DAY</div>
        <div class="text-5xl lg:text-8xl mb-2 lg:mb-4">${dayStats.persona.emoji}</div>
        <div class="text-[7vw] lg:text-[5vw] font-extrabold leading-tight mb-2 lg:mb-4">${dayStats.persona.name}</div>
        <div class="text-sm lg:text-xl opacity-60 mb-6 lg:mb-10">${dayStats.persona.tagline}</div>

        <!-- Day of week bar chart -->
        <div class="flex items-end justify-center gap-2 lg:gap-4 h-24 lg:h-32 max-w-[350px] lg:max-w-[500px] mx-auto">
          ${dayStats.dayStats.map((d, i) => `
            <div class="flex flex-col items-center gap-1 flex-1">
              <div class="w-full bg-white/80 transition-all" style="height: ${Math.max(8, d.percent * 1.2)}px; ${i === dayStats.peakDayIndex ? 'background: white;' : 'opacity: 0.4;'}"></div>
              <span class="text-[10px] lg:text-sm ${i === dayStats.peakDayIndex ? 'font-bold' : 'opacity-50'}">${d.day}</span>
              <span class="text-[9px] lg:text-xs ${i === dayStats.peakDayIndex ? 'font-bold' : 'opacity-40'}">${d.percent}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- STORY 10: Streak with festive streak bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-green overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/streak.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
      <div class="relative z-10 text-center px-4 lg:px-8 w-full max-w-md lg:max-w-xl">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-4 lg:mb-6">LONGEST STREAK</div>
        <div class="text-[18vw] lg:text-[12vw] font-extrabold leading-none">${report.metrics.longestStreak}</div>
        <div class="text-lg lg:text-3xl font-extrabold tracking-[0.2em] mt-1 lg:mt-4">DAYS</div>
        <div class="text-xs lg:text-lg opacity-70 mt-2 lg:mt-4 mb-4 lg:mb-6">straight with Claude</div>

        <!-- 30-day heatmap calendar -->
        <div class="text-[10px] lg:text-xs opacity-60 mb-2 tracking-wider">LAST 30 DAYS</div>
        <div class="grid grid-cols-7 gap-1 lg:gap-1.5 max-w-[280px] lg:max-w-[350px] mx-auto">
          <!-- Day labels -->
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">S</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">M</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">T</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">W</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">T</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">F</div>
          <div class="text-[8px] lg:text-[10px] opacity-40 text-center">S</div>
          ${generateHeatmapHTML(report.timeline.dailyActivity)}
        </div>
        <!-- Legend -->
        <div class="flex items-center justify-center gap-2 lg:gap-3 mt-4 lg:mt-6 text-[8px] lg:text-xs opacity-60">
          <span>Less</span>
          <span class="w-3 h-3 lg:w-4 lg:h-4 bg-white/10"></span>
          <span class="w-3 h-3 lg:w-4 lg:h-4 bg-white/30"></span>
          <span class="w-3 h-3 lg:w-4 lg:h-4 bg-white/50"></span>
          <span class="w-3 h-3 lg:w-4 lg:h-4 bg-white/75"></span>
          <span class="w-3 h-3 lg:w-4 lg:h-4 bg-white"></span>
          <span>More</span>
        </div>
      </div>
    </div>

    <!-- STORY 11: Persona Reveal - THE BIG ONE -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-90" style="background-image: url('images/personas/${personaImage}');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
      <div class="relative z-10 text-center px-8 animate-persona">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-10">YOU ARE</div>
        <div class="text-7xl lg:text-[150px] mb-4 lg:mb-8" id="persona-emoji">{{PERSONA_EMOJI}}</div>
        <div class="text-[11vw] lg:text-[9vw] font-extrabold leading-none" id="persona-name">{{PERSONA_NAME}}</div>
      </div>
    </div>

    <!-- STORY 12: Persona Description with festive description bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/description.jpg');"></div>
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative z-10 text-center px-8">
        <div class="text-5xl lg:text-8xl mb-3 lg:mb-6" id="persona-emoji-2">{{PERSONA_EMOJI}}</div>
        <div class="inline-block bg-white text-brutal-black px-3 py-1.5 lg:px-6 lg:py-3 text-xs lg:text-base tracking-[0.3em] font-bold mb-3 lg:mb-6" id="persona-name-2">{{PERSONA_NAME}}</div>
        <div class="text-lg lg:text-3xl italic mb-3 lg:mb-6 opacity-90" id="persona-tagline">"{{PERSONA_TAGLINE}}"</div>
        <div class="text-sm lg:text-xl leading-relaxed max-w-[300px] lg:max-w-[600px] mx-auto opacity-80" id="persona-description">{{PERSONA_DESCRIPTION}}</div>
      </div>
    </div>

    <!-- STORY 13: Roast with festive roast bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-red overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('images/festive/roast.jpg');"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-10">ROAST</div>
        <div class="text-lg lg:text-3xl leading-relaxed max-w-[320px] lg:max-w-[700px] mx-auto font-medium" id="roast-text">{{ROAST_PLACEHOLDER}}</div>
      </div>
    </div>

    <!-- STORY 14: Compliment with festive gift bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-green overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/gift.jpg');"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-10">BUT ALSO</div>
        <div class="text-lg lg:text-3xl leading-relaxed max-w-[320px] lg:max-w-[700px] mx-auto font-medium" id="hype-text">{{HYPE_PLACEHOLDER}}</div>
      </div>
    </div>

    <!-- STORY 15: Stats Grid with festive stats bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-50" style="background-image: url('images/festive/stats.jpg');"></div>
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-2 lg:mb-4">PAST 30 DAYS</div>
        <div class="text-sm lg:text-lg opacity-60 mb-4 lg:mb-8">by the numbers</div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-0.5 lg:gap-1 bg-white max-w-[300px] lg:max-w-[800px] mx-auto">
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${formatNumber(report.metrics.totalPrompts)}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">PROMPTS</div>
          </div>
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${formatNumber(report.metrics.totalResponses)}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">RESPONSES</div>
          </div>
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${formatNumber(report.metrics.linesWritten)}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">LINES</div>
          </div>
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${formatNumber(report.metrics.filesCreated)}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">FILES</div>
          </div>
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${formatNumber(report.metrics.totalSessions)}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">SESSIONS</div>
          </div>
          <div class="bg-brutal-black p-3 lg:p-8 text-center">
            <div class="text-xl lg:text-5xl font-extrabold">${report.metrics.longestStreak}</div>
            <div class="text-[9px] lg:text-sm tracking-wider opacity-60 mt-1 lg:mt-3">DAY STREAK</div>
          </div>
        </div>
      </div>
    </div>

    <!-- STORY 16: Summary with festive reflection bg -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('images/festive/summary.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      <div class="relative z-10 text-center px-6 lg:px-16 py-12 max-h-[85vh] overflow-y-auto">
        <div class="mb-8 lg:mb-12">
          <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold">YOUR 2025</div>
        </div>
        <div class="max-w-[600px] lg:max-w-[800px] mx-auto">
          <div class="text-lg lg:text-2xl leading-loose lg:leading-loose text-center font-medium" id="summary-text">{{SUMMARY_PLACEHOLDER}}</div>
        </div>
      </div>
    </div>

    <!-- STORY 17: End with Claudio family goodbye -->
    <div class="story absolute inset-0 flex items-center justify-center bg-brutal-black overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center opacity-90" style="background-image: url('images/personas/goodbye.jpg');"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
      <div class="relative z-10 text-center px-8">
        <div class="inline-block bg-white text-brutal-black px-4 py-2 lg:px-8 lg:py-4 text-xs lg:text-base tracking-[0.3em] font-bold mb-6 lg:mb-10">COMPILED</div>
        <div class="text-[20vw] lg:text-[18vw] font-extrabold leading-none">2025</div>
        <div class="text-sm lg:text-2xl opacity-70 mt-4 lg:mt-8">See you next year</div>
        <button class="mt-8 lg:mt-12 bg-white text-brutal-black px-8 py-4 lg:px-12 lg:py-6 font-extrabold text-base lg:text-xl tracking-wider hover:bg-brutal-red hover:text-white transition-colors cursor-pointer" onclick="shareStory()">SHARE</button>
      </div>
    </div>

  </div>

  <script>${getScripts()}</script>
</body>
</html>`;
}

/**
 * Get CSS styles - minimal, Tailwind handles most
 */
function getStyles(): string {
  return `
    * {
      -webkit-tap-highlight-color: transparent;
    }

    .story {
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease;
    }

    .story.active {
      opacity: 1;
      visibility: visible;
    }

    .indicator {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.2);
    }

    .indicator.active {
      background: rgba(255,255,255,0.5);
    }

    .indicator.complete {
      background: white;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes persona {
      0% { opacity: 0; transform: scale(0.5); }
      60% { transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.5s ease forwards;
    }

    .animate-persona {
      animation: persona 0.8s ease forwards;
    }

    /* Desktop constraints for indicators */
    @media (min-width: 768px) {
      #indicators {
        max-width: 430px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  `;
}

/**
 * Get JavaScript for Stories interaction
 */
function getScripts(): string {
  return `
    const stories = document.querySelectorAll('.story');
    const progress = document.getElementById('progress');
    const indicatorsContainer = document.getElementById('indicators');
    let currentIndex = 0;
    const totalStories = stories.length;

    // Create indicators
    stories.forEach((_, i) => {
      const indicator = document.createElement('div');
      indicator.className = 'indicator' + (i === 0 ? ' active' : '');
      indicatorsContainer.appendChild(indicator);
    });
    const indicators = document.querySelectorAll('.indicator');

    function updateProgress() {
      const percent = ((currentIndex + 1) / totalStories) * 100;
      progress.style.width = percent + '%';

      indicators.forEach((ind, i) => {
        ind.classList.remove('active', 'complete');
        if (i < currentIndex) ind.classList.add('complete');
        if (i === currentIndex) ind.classList.add('active');
      });
    }

    function goToStory(index) {
      if (index < 0 || index >= totalStories) return;

      stories[currentIndex].classList.remove('active');
      currentIndex = index;
      stories[currentIndex].classList.add('active');

      // Re-trigger animation
      const content = stories[currentIndex].querySelector('.story-content');
      if (content) {
        content.style.animation = 'none';
        content.offsetHeight; // Trigger reflow
        content.style.animation = '';
      }

      updateProgress();
    }

    function nextStory() {
      if (currentIndex < totalStories - 1) {
        goToStory(currentIndex + 1);
      }
    }

    function prevStory() {
      if (currentIndex > 0) {
        goToStory(currentIndex - 1);
      }
    }

    // Click/tap navigation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.share-btn')) return;

      const x = e.clientX;
      const width = window.innerWidth;

      if (x < width * 0.3) {
        prevStory();
      } else {
        nextStory();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStory();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStory();
      }
    });

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Only trigger if horizontal swipe is dominant
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextStory();
        } else {
          prevStory();
        }
      }
    });

    // Share function
    function shareStory() {
      if (navigator.share) {
        navigator.share({
          title: 'My Claude Wrapped 2025',
          text: 'Check out my year coding with Claude!',
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    }

    // Initialize
    updateProgress();
  `;
}
