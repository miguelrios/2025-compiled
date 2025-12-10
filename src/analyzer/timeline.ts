/**
 * Claude Wrapped 2025 - Timeline Analyzer
 * Time-based analysis of usage patterns
 */

import type { Dataset, Timeline } from "../types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Build timeline analysis from dataset
 */
export function buildTimeline(dataset: Dataset): Timeline {
  const hourlyHeatmap: number[] = new Array(24).fill(0);
  const dailyActivity: Record<string, number> = {};
  const weekdayTotals: number[] = new Array(7).fill(0);
  const monthlyTrend: number[] = new Array(12).fill(0);

  let firstActivity = "";
  let lastActivity = "";
  let lateNightCount = 0;

  // Process all user entries (they represent activity timestamps)
  for (const entry of dataset.userEntries) {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const dateStr = date.toISOString().split("T")[0];

    // Hourly heatmap
    hourlyHeatmap[hour]++;

    // Daily activity
    dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;

    // Weekday totals
    weekdayTotals[dayOfWeek]++;

    // Monthly trend
    monthlyTrend[month]++;

    // Track first/last activity
    if (!firstActivity || dateStr < firstActivity) {
      firstActivity = dateStr;
    }
    if (!lastActivity || dateStr > lastActivity) {
      lastActivity = dateStr;
    }

    // Late night sessions (midnight to 5am)
    if (hour >= 0 && hour < 5) {
      lateNightCount++;
    }
  }

  // Find peak hour
  const maxHourActivity = Math.max(...hourlyHeatmap);
  const peakHour = hourlyHeatmap.indexOf(maxHourActivity);

  // Find peak day of week
  const maxDayActivity = Math.max(...weekdayTotals);
  const peakDayIndex = weekdayTotals.indexOf(maxDayActivity);
  const peakDay = WEEKDAYS[peakDayIndex];

  // Weekend warrior check (Saturday + Sunday > 40% of total)
  const totalActivity = weekdayTotals.reduce((a, b) => a + b, 0);
  const weekendActivity = weekdayTotals[0] + weekdayTotals[6]; // Sunday + Saturday
  const weekendWarrior = totalActivity > 0 && weekendActivity / totalActivity > 0.4;
  const weekendPercent = totalActivity > 0 ? (weekendActivity / totalActivity) * 100 : 0;

  return {
    hourlyHeatmap,
    dailyActivity,
    weekdayTotals,
    monthlyTrend,
    peakHour,
    peakDay,
    lateNightCount,
    weekendWarrior,
    weekendPercent,
    firstActivity: firstActivity || "Unknown",
    lastActivity: lastActivity || "Unknown",
  };
}

/**
 * Format hour for display (e.g., "2pm", "11am")
 */
export function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Get time of day description
 */
export function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 9) return "early morning";
  if (hour >= 9 && hour < 12) return "morning";
  if (hour >= 12 && hour < 14) return "lunch time";
  if (hour >= 14 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  if (hour >= 21 || hour < 1) return "night";
  return "late night";
}

/**
 * Get activity streak info
 */
export function getStreakInfo(timeline: Timeline): {
  totalActiveDays: number;
  averagePerDay: number;
} {
  const activeDays = Object.keys(timeline.dailyActivity).length;
  const totalPrompts = Object.values(timeline.dailyActivity).reduce((a, b) => a + b, 0);

  return {
    totalActiveDays: activeDays,
    averagePerDay: activeDays > 0 ? Math.round(totalPrompts / activeDays) : 0,
  };
}
