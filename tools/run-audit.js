const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
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
const isWindowsEdge = process.platform === "win32" && /msedge\.exe$/i.test(chromePath);

const defaultRoutes = ["/", "/articles/", "/engineering-leadership-coaching/"];
const defaultBuildMarkerName = process.env.LIGHTHOUSE_BUILD_MARKER_NAME || "x-build-commit";
const expectedBuildSha = (process.env.LIGHTHOUSE_EXPECTED_BUILD_SHA || "").trim().toLowerCase();
const buildWaitTimeoutMs = Number(process.env.LIGHTHOUSE_BUILD_TIMEOUT_MS || 600000);
const buildPollIntervalMs = Number(process.env.LIGHTHOUSE_BUILD_POLL_INTERVAL_MS || 10000);
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

function toSafeBaseDir(filePath) {
  const resolved = path.resolve(filePath);
  return resolved.endsWith(path.sep) ? resolved : `${resolved}${path.sep}`;
}

function readContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".json":
    case ".map":
      return "application/json; charset=utf-8";
    case ".xml":
      return "application/xml; charset=utf-8";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    case ".woff":
      return "font/woff";
    case ".woff2":
      return "font/woff2";
    case ".ttf":
      return "font/ttf";
    case ".otf":
      return "font/otf";
    case ".webmanifest":
      return "application/manifest+json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function createStaticServer(baseDir) {
  const safeBaseDir = toSafeBaseDir(baseDir);

  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const requested = reqPath.startsWith("/") ? reqPath.slice(1) : reqPath;
    let filePath = path.join(baseDir, requested);

    if (reqPath.endsWith("/")) filePath = path.join(filePath, "index.html");
    if (!path.extname(filePath)) filePath = `${filePath}.html`;

    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(safeBaseDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(resolvedPath, (statError, stat) => {
      if (statError || !stat.isFile()) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const contentType = readContentType(resolvedPath);
      res.writeHead(200, { "Content-Type": contentType, "Content-Length": stat.size });
      fs.createReadStream(resolvedPath).pipe(res);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
    server.once("error", reject);
  });
}

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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBuildMarker(html, markerName) {
  const escapedName = markerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const metaPattern = new RegExp(
    `<meta[^>]+name=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = String(html).match(metaPattern);
  return (match?.[1] || "").trim();
}

async function fetchBuildMarker(baseUrl, markerName) {
  const requestUrl = new URL("/", baseUrl);
  requestUrl.searchParams.set("__build_marker", Date.now().toString());
  const response = await fetch(requestUrl, {
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    redirect: "follow",
  });

  const body = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    marker: parseBuildMarker(body, markerName),
  };
}

async function waitForExpectedBuild(baseUrl, markerName, expectedSha) {
  const startedAt = Date.now();
  let attempts = 0;
  let lastObserved = "";
  let lastStatus = 0;
  let lastError = "";

  while (Date.now() - startedAt < buildWaitTimeoutMs) {
    attempts += 1;
    try {
      const result = await fetchBuildMarker(baseUrl, markerName);
      lastStatus = result.status;
      lastObserved = result.marker;

      if (result.ok && result.marker.toLowerCase() === expectedSha) {
        log(
          `[audit] Preview build marker ${markerName} matched expected SHA ${expectedSha} after ${attempts} attempt(s).`,
        );
        return;
      }

      log(
        `[audit] Waiting for preview build marker ${markerName}. HTTP ${result.status}; observed="${result.marker || "<missing>"}"; expected="${expectedSha}".`,
      );
    } catch (error) {
      lastError = error.message;
      log(`[audit] Waiting for preview build marker ${markerName}. Request failed: ${error.message}`);
    }

    await delay(buildPollIntervalMs);
  }

  const timeoutSeconds = (buildWaitTimeoutMs / 1000).toFixed(0);
  const statusSuffix = lastStatus ? ` Last HTTP status: ${lastStatus}.` : "";
  const markerSuffix = lastObserved
    ? ` Last observed marker: ${lastObserved}.`
    : " Marker was missing from the response.";
  const errorSuffix = lastError ? ` Last request error: ${lastError}.` : "";
  throw new Error(
    `Timed out after ${timeoutSeconds}s waiting for preview ${baseUrl} to serve ${markerName}=${expectedSha}.${statusSuffix}${markerSuffix}${errorSuffix}`,
  );
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
  let server;
  const auditStart = performance.now();
  try {
    let baseUrl = "";
    if (process.env.LIGHTHOUSE_BASE_URL) {
      baseUrl = process.env.LIGHTHOUSE_BASE_URL;
    } else if (isWindowsEdge) {
      log(
        "[audit] Windows + Edge detected. Using production URL fallback to avoid local Edge protocol instability.",
      );
      baseUrl = "https://christianguzman.uk";
    } else {
      const served = await createStaticServer(path.join(rootDir, "public"));
      server = served.server;
      baseUrl = `http://127.0.0.1:${served.port}`;
    }

    if (!process.env.LIGHTHOUSE_BASE_URL && !fs.existsSync(path.join(rootDir, "public"))) {
      console.error("Missing public/ directory. Run `npm run hugo:build` first.");
      process.exit(1);
    }

    if (expectedBuildSha) {
      await waitForExpectedBuild(baseUrl, defaultBuildMarkerName, expectedBuildSha);
    }

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
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
})();
