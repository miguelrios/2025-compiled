#!/usr/bin/env node
/**
 * Generate a shareable URL from 2025 Compiled data
 * Usage: node generate-url.js [data.json]
 */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Get input file
const inputFile = process.argv[2] || path.join(__dirname, 'test-data.json');

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  console.log('\nUsage: node generate-url.js [data.json]');
  console.log('\nExpected JSON structure:');
  console.log(JSON.stringify({
    metrics: {
      totalPrompts: 7803,
      linesWritten: 1200000,
      totalResponses: 5000,
      filesCreated: 500,
      totalSessions: 889,
      longestStreak: 31,
      languages: { py: 32, tsx: 20, md: 17 },
      youreRight: 672
    },
    timeline: {
      peakHour: 15,
      hourlyHeatmap: [/* 24 values */],
      weekdayTotals: [/* 7 values Sun-Sat */],
      dailyActivity: { "2025-12-01": 100 }
    },
    claude: {
      vibeEmoji: "🔥",
      vibeName: "THE FIREBREATHER",
      vibeDesc: "You don't ask, you demand.",
      talkStyle1: "Style 1",
      talkStyle2: "Style 2",
      talkStyle3: "Style 3",
      talkStyle4: "Style 4",
      personaEmoji: "🚀",
      personaName: "THE AGENT BUILDER",
      personaTagline: "Ship it.",
      personaDesc: "Description here.",
      roast: "Roast text.",
      hype: "Hype text.",
      summary: "Summary text."
    }
  }, null, 2));
  process.exit(1);
}

// Read and parse data
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Compress with gzip
const compressed = zlib.gzipSync(JSON.stringify(data));

// Base64 encode (URL-safe: replace + with -, / with _, remove =)
const encoded = compressed.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

// Generate URL
const isLocal = process.argv.includes('--local');
const baseUrl = isLocal ? 'http://localhost:8025' : 'https://2025compiled.com/shared';
const shareUrl = `${baseUrl}?d=${encoded}`;

// Open directly in browser
try {
  const { execSync } = require('child_process');
  const platform = process.platform;
  if (platform === 'darwin') {
    execSync(`open "${shareUrl}"`);
  } else if (platform === 'win32') {
    execSync(`start "" "${shareUrl}"`);
  } else {
    execSync(`xdg-open "${shareUrl}"`);
  }
  console.log(isLocal ? '\n🔧 Opening local preview...' : '\n🎄 Opening your 2025 Compiled in browser...');
} catch (e) {
  console.log('\n🔗 Share URL:');
  console.log(shareUrl);
}
