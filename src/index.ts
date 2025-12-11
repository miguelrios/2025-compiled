#!/usr/bin/env bun
/**
 * Claude Wrapped 2025
 * Your year in review with Claude Code
 *
 * Usage:
 *   bun run src/index.ts [options]
 *
 * Options:
 *   --all       Analyze all found directories (no prompt)
 *   --global    Only analyze ~/.claude
 *   --no-judge  Skip LLM persona evaluation
 *   --output    Output directory (default: ./output/wrapped-2025)
 */

import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { parseArgs, checkEnvironment, validateOutputPath, YEAR } from "./config";
import { scanForClaudeDirs, formatBytes, aggregate } from "./collector";
import { calculateMetrics, analyzePatterns, buildTimeline } from "./analyzer";
import { JudgeEvaluator, createFallbackPersona, getPersona } from "./judge";
import { buildReport, generateHTML, generateAssets, saveReportJson } from "./generator";
import type { ClaudeDirectory } from "./types";

function log(msg: string) {
  console.log(`[2025-compiled] ${msg}`);
}

function error(msg: string) {
  console.error(`[2025-compiled] ERROR: ${msg}`);
}

async function main() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);
  const env = checkEnvironment();

  console.log();
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║           " + YEAR + " COMPILED              ║");
  console.log("╚═══════════════════════════════════════════╝");
  console.log();

  // Step 1: Scan for directories
  log("Scanning for Claude directories...");

  let dirs: ClaudeDirectory[];
  try {
    dirs = await scanForClaudeDirs({
      globalOnly: config.global,
    });
  } catch (err) {
    error(`Failed to scan directories: ${err}`);
    process.exit(1);
  }

  if (dirs.length === 0) {
    error("No Claude directories found");
    console.log("Searched in:");
    console.log(`  - ${process.env.HOME}/.claude (global)`);
    console.log(`  - ${process.env.HOME}/*/.claude (project directories)`);
    console.log("Make sure you have used Claude Code in 2025.");
    process.exit(1);
  }

  log(`Found ${dirs.length} Claude director${dirs.length === 1 ? "y" : "ies"}`);

  // Step 2: Select directories (--all or --global means use all found)
  const selectedDirs = dirs;
  log(`Analyzing ${selectedDirs.length} director${selectedDirs.length === 1 ? "y" : "ies"}`);

  // Step 3: Aggregate data
  log("Reading conversations...");

  let dataset;
  try {
    dataset = await aggregate(selectedDirs, (msg) => {
      // Progress callback - just log it
      log(msg);
    });
  } catch (err) {
    error(`Failed to read conversations: ${err}`);
    process.exit(1);
  }

  if (dataset.userEntries.length === 0) {
    error(`No conversations found for ${YEAR}.`);
    process.exit(1);
  }

  log(`Found ${dataset.userEntries.length} prompts and ${dataset.assistantEntries.length} responses`);

  // Step 4: Analyze
  log("Analyzing your year...");

  const metrics = calculateMetrics(dataset);
  const patterns = analyzePatterns(dataset);
  const timeline = buildTimeline(dataset);

  log("Analysis complete");

  // Step 5: LLM Judge (unless --no-judge)
  let personaResult;
  let yearSummary = "Your year with Claude was one for the books.";

  if (config.noJudge || !env.anthropicKey) {
    if (!env.anthropicKey && !config.noJudge) {
      log("ANTHROPIC_API_KEY not set - using fallback persona");
    }
    personaResult = createFallbackPersona(metrics, timeline, patterns);
  } else {
    log("Claude is judging you...");

    try {
      const evaluator = new JudgeEvaluator();

      const samplePrompts = dataset.userEntries
        .filter((e) => e.message.content.length > 20)
        .slice(0, 500)
        .map((e) => e.message.content);

      personaResult = await evaluator.evaluatePersona(
        metrics,
        patterns,
        timeline,
        samplePrompts
      );

      const summaries = dataset.summaries.map((s) => s.summary);
      yearSummary = await evaluator.generateSummary(
        metrics,
        timeline,
        personaResult.persona,
        summaries,
        patterns
      );

      log("Judgment complete");
    } catch (err) {
      log(`LLM judge failed - using fallback: ${err}`);
      personaResult = createFallbackPersona(metrics, timeline, patterns);
    }
  }

  // Step 6: Build report
  const summaries = dataset.summaries.map((s) => s.summary);
  const report = buildReport(
    metrics,
    patterns,
    timeline,
    personaResult,
    yearSummary,
    summaries
  );

  // Step 7: Generate output
  const outputValidation = validateOutputPath(config.output);
  if (!outputValidation.valid) {
    error(`Invalid output path: ${outputValidation.error}`);
    process.exit(1);
  }
  const outputDir = outputValidation.resolved;
  await mkdir(outputDir, { recursive: true });

  log("Generating your wrapped...");

  // Copy bundled images to output
  const assetsDir = resolve(import.meta.dir, "../assets");
  const imagesOutputDir = resolve(outputDir, "images");
  await mkdir(imagesOutputDir, { recursive: true });
  await Bun.spawn(["cp", "-r", assetsDir + "/festive", imagesOutputDir + "/festive"]).exited;
  await Bun.spawn(["cp", "-r", assetsDir + "/personas", imagesOutputDir + "/personas"]).exited;

  // Generate HTML
  const html = generateHTML(report);
  const htmlPath = resolve(outputDir, "index.html");
  await Bun.write(htmlPath, html);

  // Save JSON data
  const jsonPath = resolve(outputDir, "data.json");
  await saveReportJson(report, jsonPath);

  // Save sample prompts for Claude Code to analyze
  const samplePromptsPath = resolve(outputDir, "sample_prompts.txt");
  const filteredPrompts = dataset.userEntries
    .filter((e) => {
      const content = e.message.content;
      if (content.length < 30) return false;
      if (content.startsWith("<command-") || content.startsWith("<local-command")) return false;
      if (content.startsWith("Caveat:")) return false;
      if (content.startsWith("This session is being continued")) return false;
      if (content.includes("<system-reminder>")) return false;
      return true;
    });

  // Shuffle array to get random sample each time
  const shuffled = filteredPrompts.sort(() => Math.random() - 0.5);

  // Take 200 random prompts with longer content (500 chars)
  const cleanPrompts = shuffled
    .slice(0, 200)
    .map((e, i) => `${i + 1}. ${e.message.content.slice(0, 500).replace(/\n/g, " ").replace(/\s+/g, " ").trim()}`)
    .join("\n\n");
  await Bun.write(samplePromptsPath, cleanPrompts);

  // Optional: Generate images
  if (config.images) {
    log("Generating images...");
    const assets = await generateAssets(report, outputDir);
    report.personaImagePath = assets.personaImagePath;
    report.shareCardPath = assets.shareCardPath;
  }

  log("Generation complete");

  // Summary
  const persona = getPersona(report.persona);

  console.log();
  console.log("═══════════════════════════════════════════");
  console.log();
  console.log(`  ${persona.emoji} You are ${persona.name.toUpperCase()}`);
  console.log(`  ${persona.tagline}`);
  console.log();
  console.log(`  Prompts: ${metrics.totalPrompts.toLocaleString()}`);
  console.log(`  Lines of code: ${metrics.linesWritten.toLocaleString()}`);
  console.log(`  You're absolutely right: ${patterns.claudePhrases.youreRight || 0}`);
  console.log();
  console.log("═══════════════════════════════════════════");
  console.log();

  log(`Open ${htmlPath} to see your full wrapped!`);

  // Try to open in browser (skip if --no-judge since Claude Code will inject content first)
  if (!config.noJudge) {
    try {
      const openCommand = process.platform === "darwin" ? "open" : "xdg-open";
      Bun.spawn([openCommand, htmlPath]);
    } catch {
      // Silently fail if we can't open browser
    }
  }
}

main().catch((err) => {
  error(`Fatal error: ${err}`);
  process.exit(1);
});
