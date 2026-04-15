const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
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

const routes = ["/", "/articles/", "/engineering-leadership-coaching/"];
const thresholds = { seo: 1.0, performance: 0.9 };
const isVerbose = process.env.AUDIT_VERBOSE
  ? process.env.AUDIT_VERBOSE !== "0" && process.env.AUDIT_VERBOSE !== "false"
  : false;

function log(message) {
  if (!isVerbose) return;
  process.stderr.write(`${message}\n`);
}

if (!fs.existsSync(path.join(rootDir, "public"))) {
  console.error("Missing public/ directory. Run `npm run hugo:build` first.");
  process.exit(1);
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
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

(async () => {
  let server;
  try {
    let baseUrl = "";
    if (isWindowsEdge) {
      console.warn(
        "[audit] Windows + Edge detected. Using production URL fallback to avoid local Edge protocol instability.",
      );
      baseUrl = "https://christianguzman.uk";
    } else {
      const served = await createStaticServer(path.join(rootDir, "public"));
      server = served.server;
      baseUrl = `http://127.0.0.1:${served.port}`;
    }

    log(`[audit] Browser: ${chromePath}`);
    log(`[audit] Base URL: ${baseUrl}`);
    log(`[audit] Routes: ${routes.join(", ")}`);
    log(`[audit] Output dir: ${outputDir}`);

    let hasSeoFailure = false;
    let hasPerfWarning = false;

    for (const route of routes) {
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
        console.warn(
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
      if (seo < thresholds.seo) {
        hasSeoFailure = true;
        console.error(`[audit] SEO score for ${route} is ${seo}. Required: ${thresholds.seo}.`);
      }
      if (perf < thresholds.performance) {
        hasPerfWarning = true;
        console.warn(
          `[audit] Performance score for ${route} is ${perf}. Warning threshold: ${thresholds.performance}.`,
        );
      }
    }

    if (hasPerfWarning) {
      console.warn("[audit] Performance warnings detected.");
    }

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
