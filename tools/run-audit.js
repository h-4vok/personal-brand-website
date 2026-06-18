const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const { performance } = require("node:perf_hooks");
const path = require("node:path");

const {
  classifyLighthouseResult,
} = require("./lighthouse-audit");
const { detectBrowserPath } = require("./lighthouse-browser");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, ".lighthouseci", "local");
const profilesDir = path.join(rootDir, ".lighthouseci", "profiles");
const lighthouseCli = require.resolve("lighthouse/cli/index.js");
const chromePath = detectBrowserPath();

const defaultRoutes = ["/", "/articles/", "/engineering-leadership-coaching/"];
const routes = (process.env.LIGHTHOUSE_ROUTES || "")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const auditRoutes = routes.length > 0 ? routes : defaultRoutes;
const categories = (process.env.LIGHTHOUSE_CATEGORIES || "seo,performance")
  .split(",")
  .map((category) => category.trim())
  .filter(Boolean);
const thresholds = {
  seo: Number(process.env.LIGHTHOUSE_SEO_THRESHOLD || 1.0),
  performance: Number(process.env.LIGHTHOUSE_PERF_THRESHOLD || 0.9),
};
const isVerbose = process.env.AUDIT_VERBOSE
  ? process.env.AUDIT_VERBOSE !== "0" && process.env.AUDIT_VERBOSE !== "false"
  : false;

function log(message) {
  if (!isVerbose) return;
  process.stderr.write(`${message}\n`);
}

if (!chromePath) {
  console.error("No compatible Chrome/Chromium/Edge installation found. Set CHROME_PATH.");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(profilesDir, { recursive: true });

function slugForRoute(route) {
  if (route === "/") return "home";
  return route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
}

function createProfileDir(slug) {
  const profileDir = path.join(
    profilesDir,
    `${slug}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
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

function runLighthouse(url, outputPath) {
  const profileDir = createProfileDir(path.basename(outputPath, ".json"));
  const chromeFlags = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
  ];

  log(`[audit] Running Lighthouse for ${url}`);
  const result = spawnSync(
    process.execPath,
    [
      lighthouseCli,
      url,
      `--only-categories=${categories.join(",")}`,
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
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

(async () => {
  const auditStart = performance.now();
  try {
    const baseUrl = process.env.LIGHTHOUSE_BASE_URL || "https://christianguzman.uk";

    log(`[audit] Browser: ${chromePath}`);
    log(`[audit] Base URL: ${baseUrl}`);
    log(`[audit] Categories: ${categories.join(", ")}`);
    log(`[audit] Routes: ${auditRoutes.join(", ")}`);
    log(`[audit] Output dir: ${outputDir}`);

    let hasSeoFailure = false;
    let hasPerfWarning = false;

    for (const route of auditRoutes) {
      const routeStart = performance.now();
      const url = `${baseUrl}${route}`;
      const reportPath = path.join(outputDir, `${slugForRoute(route)}.json`);
      const result = runLighthouse(url, reportPath);
      const hasReport = fs.existsSync(reportPath);
      const classification = classifyLighthouseResult({
        status: result.status,
        hasReport,
        stderr: result.stderr,
      });

      if (classification.kind === "fatal-no-report") {
        hasSeoFailure = true;
        console.error(`[audit] Lighthouse failed and no report was produced for ${route}.`);
        if (result.stdout) process.stderr.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        continue;
      }

      if (classification.kind === "cleanup-noise") {
        log(
          `[audit] Lighthouse returned non-zero for ${route}, but report was produced (known Windows cleanup noise).`,
        );
        if (classification.summary) {
          log(`[audit] Non-fatal Lighthouse stderr summary:\n${classification.summary}`);
        }
      }

      if (classification.kind === "fatal-with-report") {
        hasSeoFailure = true;
        console.error(`[audit] Lighthouse failed for ${route} even though report was produced.`);
        if (result.stdout) process.stderr.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        continue;
      }

      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      const seo = report.categories?.seo?.score ?? 0;
      const perf = report.categories?.performance?.score ?? 0;

      log(`[audit] Scores for ${route}: seo=${seo} perf=${perf}`);
      log(`[audit] Route ${route} completed in ${((performance.now() - routeStart) / 1000).toFixed(2)}s`);
      if (categories.includes("seo") && seo < thresholds.seo) {
        hasSeoFailure = true;
        console.error(`[audit] SEO score for ${route} is ${seo}. Required: ${thresholds.seo}.`);
      }
      if (categories.includes("performance") && perf < thresholds.performance) {
        hasPerfWarning = true;
        console.warn(
          `[audit] Performance score for ${route} is ${perf}. Warning threshold: ${thresholds.performance}.`,
        );
      }
    }

    if (hasPerfWarning) {
      console.warn("[audit] Performance warnings detected.");
    }

    log(`[audit] Total audit time: ${((performance.now() - auditStart) / 1000).toFixed(2)}s`);
    process.exit(hasSeoFailure ? 1 : 0);
  } catch (error) {
    console.error(`[audit] ${error.message}`);
    process.exit(1);
  }
})();
