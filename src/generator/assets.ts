/**
 * Claude Wrapped 2025 - Asset Generator
 * Optional image generation using Canal's imagine.py
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import type { WrappedReport, PersonaDefinition } from "../types";
import { getPersona } from "../judge";

// Get the path to Canal's imagine.py
const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGINE_SCRIPT = resolve(__dirname, "../../../../tools/imagine.py");

/**
 * Check if image generation is available
 */
export function isImageGenerationAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Generate persona backdrop image
 */
export async function generatePersonaImage(
  persona: PersonaDefinition,
  outputDir: string
): Promise<string | null> {
  if (!isImageGenerationAvailable()) {
    console.log("  Skipping persona image (no GEMINI_API_KEY)");
    return null;
  }

  const imagesDir = resolve(outputDir, "images");
  await mkdir(imagesDir, { recursive: true });

  try {
    const proc = Bun.spawn(["python", IMAGINE_SCRIPT, persona.imagePrompt, "--output", imagesDir], {
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      },
      stdout: "inherit",
      stderr: "inherit",
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      console.error("  Persona image generation failed");
      return null;
    }

    // Find the generated file (most recent .png in output dir)
    const glob = new Bun.Glob("*.png");
    const files = await Array.fromAsync(glob.scan(imagesDir));

    if (files.length > 0) {
      // Sort by name (which includes timestamp) and get the last one
      files.sort();
      return resolve(imagesDir, files[files.length - 1]);
    }

    return null;
  } catch (error) {
    console.error("  Error generating persona image:", error);
    return null;
  }
}

/**
 * Generate shareable social card
 */
export async function generateShareCard(
  report: WrappedReport,
  outputDir: string
): Promise<string | null> {
  if (!isImageGenerationAvailable()) {
    console.log("  Skipping share card (no GEMINI_API_KEY)");
    return null;
  }

  const shareDir = resolve(outputDir, "share");
  await mkdir(shareDir, { recursive: true });

  const persona = getPersona(report.persona);

  const prompt = `
    Brutalist minimalist social share card for social media.
    White background, black monospace text.
    Large bold text "${persona.name.toUpperCase()}" centered at top.
    Below it in smaller text: "${report.metrics.linesWritten.toLocaleString()} lines of code"
    At bottom: "CLAUDE WRAPPED 2025"
    Thin decorative red and green border lines at edges for Christmas aesthetic.
    Sharp 90-degree corners only, absolutely no rounded edges, no gradients.
    Stark high contrast, clean minimal design.
    Social card 1200x630 aspect ratio.
  `.trim().replace(/\s+/g, ' ');

  try {
    const proc = Bun.spawn(["python", IMAGINE_SCRIPT, prompt, "--output", shareDir], {
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      },
      stdout: "inherit",
      stderr: "inherit",
    });

    await proc.exited;

    if (proc.exitCode !== 0) {
      console.error("  Share card generation failed");
      return null;
    }

    // Find the generated file
    const glob = new Bun.Glob("*.png");
    const files = await Array.fromAsync(glob.scan(shareDir));

    if (files.length > 0) {
      files.sort();
      return resolve(shareDir, files[files.length - 1]);
    }

    return null;
  } catch (error) {
    console.error("  Error generating share card:", error);
    return null;
  }
}

/**
 * Generate all assets for the report
 */
export async function generateAssets(
  report: WrappedReport,
  outputDir: string
): Promise<{ personaImagePath: string | null; shareCardPath: string | null }> {
  if (!isImageGenerationAvailable()) {
    return { personaImagePath: null, shareCardPath: null };
  }

  console.log("Generating images...");

  const persona = getPersona(report.persona);

  const [personaImagePath, shareCardPath] = await Promise.all([
    generatePersonaImage(persona, outputDir),
    generateShareCard(report, outputDir),
  ]);

  return { personaImagePath, shareCardPath };
}
