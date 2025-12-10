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
 *   --images    Generate images with /imagine
 *   --no-judge  Skip LLM persona evaluation
 *   --output    Output directory (default: ./output/wrapped-2025)
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { parseArgs, checkEnvironment, validateOutputPath, YEAR } from "./config";
import { scanForClaudeDirs, formatBytes, aggregate } from "./collector";
import { calculateMetrics, analyzePatterns, buildTimeline } from "./analyzer";
import { JudgeEvaluator, createFallbackPersona, getPersona } from "./judge";
import { buildReport, generateHTML, generateAssets, saveReportJson } from "./generator";
import type { ClaudeDirectory } from "./types";

async function main() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);
  const env = checkEnvironment();

  // Header
  console.log();
  console.log(chalk.bold("╔═══════════════════════════════════════════╗"));
  console.log(chalk.bold("║") + chalk.red("           ") + chalk.green(YEAR) + chalk.red(" COMPILED") + chalk.bold("              ║"));
  console.log(chalk.bold("╚═══════════════════════════════════════════╝"));
  console.log();

  // Start interactive prompts
  p.intro(chalk.inverse(" Your year in code "));

  // Step 1: Scan for directories
  const scanSpinner = p.spinner();
  scanSpinner.start("Scanning for Claude directories...");

  let dirs: ClaudeDirectory[];
  try {
    dirs = await scanForClaudeDirs({
      globalOnly: config.global,
    });
  } catch (error) {
    scanSpinner.stop("Failed to scan directories");
    p.log.error(String(error));
    process.exit(1);
  }

  if (dirs.length === 0) {
    scanSpinner.stop("No Claude directories found");
    p.log.error("Could not find any .claude directories with conversations.");
    p.log.info("Searched in:");
    p.log.info(`  - ${process.env.HOME}/.claude (global)`);
    p.log.info(`  - ${process.env.HOME}/*/.claude (project directories)`);
    p.log.info("Make sure you have used Claude Code in 2025.");
    process.exit(1);
  }

  scanSpinner.stop(`Found ${dirs.length} Claude director${dirs.length === 1 ? "y" : "ies"}`);

  // Step 2: Select directories (unless --all or --global)
  let selectedDirs: ClaudeDirectory[];

  if (config.all || config.global || dirs.length === 1) {
    selectedDirs = dirs;
    p.log.info(
      `Analyzing ${selectedDirs.length} director${selectedDirs.length === 1 ? "y" : "ies"}`
    );
  } else {
    // Interactive selection
    const options = dirs.map((d) => ({
      value: d.path,
      label: d.projectName,
      hint: `${d.conversationCount} convos | ${formatBytes(d.totalSizeBytes)}`,
    }));

    const selected = await p.multiselect({
      message: "Select directories to analyze:",
      options,
      initialValues: dirs.filter((d) => d.isGlobal).map((d) => d.path),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    // Type guard: after isCancel check, selected is string[]
    const selectedPaths = selected as string[];
    selectedDirs = dirs.filter((d) => selectedPaths.includes(d.path));
  }

  // Step 3: Aggregate data
  const aggregateSpinner = p.spinner();
  aggregateSpinner.start("Reading conversations...");

  let dataset;
  try {
    dataset = await aggregate(selectedDirs, (msg) => {
      aggregateSpinner.message(msg);
    });
  } catch (error) {
    aggregateSpinner.stop("Failed to read conversations");
    p.log.error(String(error));
    process.exit(1);
  }

  if (dataset.userEntries.length === 0) {
    aggregateSpinner.stop("No conversations found for 2025");
    p.log.error(`No conversations found for ${YEAR}.`);
    process.exit(1);
  }

  aggregateSpinner.stop(
    `Found ${dataset.userEntries.length} prompts and ${dataset.assistantEntries.length} responses`
  );

  // Step 4: Analyze
  const analyzeSpinner = p.spinner();
  analyzeSpinner.start("Analyzing your year...");

  const metrics = calculateMetrics(dataset);
  const patterns = analyzePatterns(dataset);
  const timeline = buildTimeline(dataset);

  analyzeSpinner.stop("Analysis complete");

  // Step 5: LLM Judge (unless --no-judge)
  let personaResult;
  let yearSummary = "Your year with Claude was one for the books.";

  if (config.noJudge || !env.anthropicKey) {
    if (!env.anthropicKey) {
      p.log.warn("ANTHROPIC_API_KEY not set - using fallback persona");
    }
    personaResult = createFallbackPersona(metrics, timeline, patterns);
  } else {
    // Security: Warn user that sample prompts will be sent to Anthropic
    let proceed = config.yes; // Auto-confirm if --yes flag
    if (!config.yes) {
      p.log.warn("⚠️  Sample prompts will be sent to Anthropic API for persona analysis");
      const confirmed = await p.confirm({
        message: "Continue with LLM analysis?",
        initialValue: true,
      });
      proceed = !p.isCancel(confirmed) && confirmed;
    }

    if (!proceed) {
      p.log.info("Using deterministic persona instead");
      personaResult = createFallbackPersona(metrics, timeline, patterns);
    } else {
    const judgeSpinner = p.spinner();
    judgeSpinner.start("Claude is judging you...");

    try {
      const evaluator = new JudgeEvaluator();

      // Get sample prompts for the judge - send 500 for rich context
      const samplePrompts = dataset.userEntries
        .filter((e) => e.message.content.length > 20) // Skip very short ones
        .slice(0, 500)
        .map((e) => e.message.content);

      personaResult = await evaluator.evaluatePersona(
        metrics,
        patterns,
        timeline,
        samplePrompts
      );

      // Generate year summary with patterns for communication style
      const summaries = dataset.summaries.map((s) => s.summary);
      yearSummary = await evaluator.generateSummary(
        metrics,
        timeline,
        personaResult.persona,
        summaries,
        patterns
      );

      judgeSpinner.stop("Judgment complete");
    } catch (error) {
      judgeSpinner.stop("LLM judge failed - using fallback");
      p.log.warn(String(error));
      personaResult = createFallbackPersona(metrics, timeline, patterns);
    }
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

  // Step 7: Generate output (with path validation)
  const outputValidation = validateOutputPath(config.output);
  if (!outputValidation.valid) {
    p.log.error(`Invalid output path: ${outputValidation.error}`);
    process.exit(1);
  }
  const outputDir = outputValidation.resolved;
  await mkdir(outputDir, { recursive: true });

  const generateSpinner = p.spinner();
  generateSpinner.start("Generating your wrapped...");

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

  // Save sample prompts for Claude Code to analyze (if not using LLM judge)
  // Filter out noise: system messages, XML tags, continuation summaries
  // RANDOMIZE to get variety each time
  const samplePromptsPath = resolve(outputDir, "sample_prompts.txt");
  const filteredPrompts = dataset.userEntries
    .filter((e) => {
      const content = e.message.content;
      // Skip short messages
      if (content.length < 30) return false;
      // Skip system/XML noise
      if (content.startsWith("<command-") || content.startsWith("<local-command")) return false;
      if (content.startsWith("Caveat:")) return false;
      if (content.startsWith("This session is being continued")) return false;
      if (content.includes("<system-reminder>")) return false;
      // Keep real user messages
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
    generateSpinner.message("Generating images...");
    const assets = await generateAssets(report, outputDir);
    report.personaImagePath = assets.personaImagePath;
    report.shareCardPath = assets.shareCardPath;
  }

  generateSpinner.stop("Generation complete");

  // Summary
  const persona = getPersona(report.persona);

  console.log();
  console.log(chalk.bold("═══════════════════════════════════════════"));
  console.log();
  console.log(`  ${persona.emoji} You are ${chalk.bold(persona.name.toUpperCase())}`);
  console.log(`  ${chalk.dim(persona.tagline)}`);
  console.log();
  console.log(`  ${chalk.red("Prompts:")} ${metrics.totalPrompts.toLocaleString()}`);
  console.log(`  ${chalk.green("Lines of code:")} ${metrics.linesWritten.toLocaleString()}`);
  console.log(`  ${chalk.dim("You're absolutely right:")} ${patterns.claudePhrases.youreRight || 0}`);
  console.log();
  console.log(chalk.bold("═══════════════════════════════════════════"));
  console.log();

  p.outro(`Open ${chalk.cyan(htmlPath)} to see your full wrapped!`);

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

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
