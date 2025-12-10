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
const baseUrl = 'https://blog.parcha.dev/static/2025-compiled';
const localUrl = 'file://' + path.join(__dirname, 'index.html');

console.log('\n📊 Data size:');
console.log(`   Raw JSON: ${JSON.stringify(data).length} bytes`);
console.log(`   Compressed: ${compressed.length} bytes`);
console.log(`   Base64: ${encoded.length} bytes`);

console.log('\n🔗 Share URLs:\n');
console.log(`Production: ${baseUrl}?d=${encoded}`);
console.log(`\nLocal test: ${localUrl}?d=${encoded}`);

// Also output just the encoded data for copy/paste
console.log('\n📋 Encoded data (for manual URL building):');
console.log(encoded);
