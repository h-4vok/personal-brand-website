const { spawnSync } = require("node:child_process");
const path = require("node:path");

const fs = require("node:fs");
const { detectBrowserPath } = require("./lighthouse-browser");

const lighthouseCli = require.resolve("lighthouse/cli/index.js");
const outputPath = path.resolve(__dirname, "..", "seo-report.json");
const chromePath = detectBrowserPath();

if (!chromePath) {
  console.error("No compatible Chrome/Chromium/Edge installation found. Set CHROME_PATH.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    lighthouseCli,
    "https://christianguzman.uk",
    "--only-categories=seo,performance",
    "--output",
    "json",
    "--output-path",
    outputPath,
    "--chrome-flags=--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage",
  ],
  {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, CHROME_PATH: chromePath },
  },
);

if ((result.status ?? 1) !== 0 && fs.existsSync(outputPath)) {
  console.warn(
    "[audit:report] Lighthouse returned non-zero but seo-report.json was generated (known Windows cleanup issue).",
  );
  process.exit(0);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

process.exit(result.status ?? 1);
