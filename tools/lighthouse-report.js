const { spawnSync } = require("node:child_process");
const path = require("node:path");

const fs = require("node:fs");
const { detectBrowserPath } = require("./lighthouse-browser");

const lighthouseCli = require.resolve("lighthouse/cli/index.js");
const outputPath = path.resolve(__dirname, "..", "seo-report.json");
const chromePath = detectBrowserPath();
const profilesDir = path.resolve(__dirname, "..", ".lighthouseci", "profiles");
const isCi = Boolean(process.env.CI);
const isVerbose = process.env.AUDIT_VERBOSE
  ? process.env.AUDIT_VERBOSE !== "0" && process.env.AUDIT_VERBOSE !== "false"
  : !isCi;

function log(message) {
  if (!isVerbose) return;
  process.stderr.write(`${message}\n`);
}

function createProfileDir() {
  fs.mkdirSync(profilesDir, { recursive: true });
  const profileDir = path.join(
    profilesDir,
    `report-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  fs.mkdirSync(profileDir, { recursive: true });
  return profileDir;
}

function cleanupProfileDir(profileDir) {
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  } catch {
    // Best-effort cleanup only.
  }
}

function summarizeFailure(stderr) {
  if (!stderr) return "";
  const lines = String(stderr).split(/\r?\n/).map((line) => line.trim());
  const interesting = lines.filter((line) => {
    if (!line) return false;
    return (
      line.startsWith("Runtime error encountered:") ||
      line.startsWith("Error:") ||
      line.includes("EPERM") ||
      line.includes("EACCES") ||
      line.includes("ChromeNotInstalledError") ||
      line.includes("No Chrome installations found") ||
      line.includes("Timed out") ||
      line.includes("Protocol error")
    );
  });

  if (interesting.length === 0) return "";
  return interesting.slice(-8).join("\n");
}

if (!chromePath) {
  console.error("No compatible Chrome/Chromium/Edge installation found. Set CHROME_PATH.");
  process.exit(1);
}

const profileDir = createProfileDir();
const chromeFlags = [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--no-default-browser-check",
];

log(`[audit:report] Browser: ${chromePath}`);
log(`[audit:report] URL: https://christianguzman.uk`);
log(`[audit:report] Output: ${outputPath}`);

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
    `--chrome-flags=${chromeFlags.join(" ")}`,
  ],
  {
    stdio: "pipe",
    encoding: "utf8",
    env: { ...process.env, CHROME_PATH: chromePath },
  },
);

cleanupProfileDir(profileDir);

if (fs.existsSync(outputPath)) {
  try {
    const report = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const seo = report.categories?.seo?.score;
    const perf = report.categories?.performance?.score;
    log(`[audit:report] Scores: seo=${seo} perf=${perf}`);
  } catch {
    // Ignore report parsing errors; Lighthouse output is still on stderr.
  }
}

if ((result.status ?? 1) !== 0 && fs.existsSync(outputPath)) {
  console.warn(
    "[audit:report] Lighthouse returned non-zero but seo-report.json was generated (known Windows cleanup issue).",
  );
  const summary = summarizeFailure(result.stderr);
  if (summary) {
    log(`[audit:report] Non-fatal Lighthouse stderr summary:\n${summary}`);
  }
  process.exit(0);
}

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

process.exit(result.status ?? 1);
