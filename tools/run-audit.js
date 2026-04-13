const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const { detectBrowserPath } = require("./lighthouse-browser");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, ".lighthouseci", "local");
const lighthouseCli = require.resolve("lighthouse/cli/index.js");
const chromePath = detectBrowserPath();
const isWindowsEdge = process.platform === "win32" && /msedge\.exe$/i.test(chromePath);

const routes = ["/", "/articles/", "/engineering-leadership-coaching/"];
const thresholds = { seo: 1.0, performance: 0.9 };

if (process.platform !== "win32") {
  const lhciCli = require.resolve("@lhci/cli/src/cli.js");
  const result = spawnSync(process.execPath, [lhciCli, "autorun"], { stdio: "inherit" });
  process.exit(result.status ?? 1);
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

function createStaticServer(baseDir) {
  const server = http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(baseDir, reqPath);
    if (reqPath.endsWith("/")) filePath = path.join(filePath, "index.html");
    if (!path.extname(filePath)) filePath = `${filePath}.html`;

    if (!filePath.startsWith(baseDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
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

function runLighthouse(url, outputPath) {
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
      "--chrome-flags=--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage",
    ],
    {
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env, CHROME_PATH: chromePath },
    },
  );
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

    let hasSeoFailure = false;
    let hasPerfWarning = false;

    for (const route of routes) {
      const url = `${baseUrl}${route}`;
      const reportPath = path.join(outputDir, `${slugForRoute(route)}.json`);
      const result = runLighthouse(url, reportPath);
      const hasReport = fs.existsSync(reportPath);

      if (result.status !== 0 && !hasReport) {
        hasSeoFailure = true;
        console.error(`[audit] Lighthouse failed and no report was produced for ${route}.`);
        if (result.stdout) process.stderr.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        continue;
      }

      if (result.status !== 0 && hasReport) {
        console.warn(
          `[audit] Lighthouse returned non-zero for ${route}, but report was produced (known Windows EPERM cleanup issue).`,
        );
      }

      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      const seo = report.categories?.seo?.score ?? 0;
      const perf = report.categories?.performance?.score ?? 0;

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
