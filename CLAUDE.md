# 2025 Compiled - Development Instructions

## Release Process

**IMPORTANT: Every push must include updated checksums.**

### Before Every Push

1. **Update SHA256 checksums** after any source file changes:
   ```bash
   find src -name "*.ts" -type f | sort | xargs shasum -a 256 > SHA256SUMS.txt
   ```

2. **Verify checksums work**:
   ```bash
   ./verify.sh
   ```

3. **Build and test**:
   ```bash
   bun run build
   bun run src/index.ts --help
   ```

4. **Commit with checksums**:
   ```bash
   git add -A
   git commit -m "Your message"
   git push origin main
   ```

### Creating a Release

When ready to tag a release:

1. **Update version** in `package.json`

2. **Regenerate checksums**:
   ```bash
   find src -name "*.ts" -type f | sort | xargs shasum -a 256 > SHA256SUMS.txt
   ```

3. **Commit version bump**:
   ```bash
   git add -A
   git commit -m "Release vX.Y.Z"
   ```

4. **Create signed tag** (if GPG configured):
   ```bash
   git tag -s vX.Y.Z -m "Release vX.Y.Z - Brief description"
   # Or unsigned:
   git tag -a vX.Y.Z -m "Release vX.Y.Z - Brief description"
   ```

5. **Push with tags**:
   ```bash
   git push origin main --tags
   ```

6. **Create GitHub release**:
   ```bash
   gh release create vX.Y.Z \
     --title "vX.Y.Z" \
     --notes "Release notes here"
   ```

## Security Checklist

Before any release, verify:

- [ ] No secrets/API keys in code
- [ ] `sanitizePrompt()` redacts sensitive data before API calls
- [ ] Path traversal protection in `scanner.ts` and `config.ts`
- [ ] Output path validation prevents writes to system directories
- [ ] SHA256SUMS.txt is up to date

## File Structure

```
src/
├── index.ts           # CLI entry point
├── config.ts          # Args parsing, path validation
├── types.ts           # Zod schemas
├── collector/         # Find and parse .claude directories
├── analyzer/          # Calculate metrics, patterns, timeline
├── judge/             # Persona detection (deterministic + LLM)
└── generator/         # HTML report generation
```

## Testing Locally

```bash
# Run directly
bun run src/index.ts

# With flags
bun run src/index.ts --all
bun run src/index.ts --with-llm  # Requires ANTHROPIC_API_KEY

# Build and run dist
bun run build
node dist/index.js
```
