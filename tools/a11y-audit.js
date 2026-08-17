const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const outputDir = path.join(rootDir, ".lighthouseci", "a11y");
const reportScript = path.join(__dirname, "lighthouse-report.js");
const reportBaseName = "a11y-report";
const isProd = process.argv.includes("--prod");

function ensureBuild() {
  if (isProd) return;
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawnSync(npmCommand, ["run", "hugo:build"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (build.error) {
    console.error(`[a11y] Unable to start local build: ${build.error.message}`);
    process.exit(1);
  }
  if ((build.status ?? 1) !== 0) {
    console.error(`[a11y] Local build failed with exit code ${build.status ?? 1}.`);
    process.exit(build.status ?? 1);
  }
}

function startStaticServer(dir) {
  const server = http.createServer((req, res) => {
    const urlPath = (req.url || "/").split("?")[0];
    let filePath = path.join(dir, urlPath);
    if (urlPath.endsWith("/")) {
      filePath = path.join(filePath, "index.html");
    } else if (!path.extname(filePath)) {
      const withHtml = `${filePath}.html`;
      filePath = fs.existsSync(withHtml) ? withHtml : path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : ext === ".js"
            ? "application/javascript; charset=utf-8"
            : ext === ".json"
              ? "application/json; charset=utf-8"
              : "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function runReport(baseUrl) {
  const env = {
    ...process.env,
    LIGHTHOUSE_BASE_URL: baseUrl,
    LIGHTHOUSE_REPORT_URL: baseUrl,
    LIGHTHOUSE_REPORT_BASENAME: reportBaseName,
    LIGHTHOUSE_CATEGORIES: "accessibility",
  };
  const result = spawnSync(process.execPath, [reportScript], {
    cwd: rootDir,
    env,
    stdio: "inherit",
  });
  return result.status ?? 1;
}

function moveReportArtifacts() {
  fs.mkdirSync(outputDir, { recursive: true });
  const htmlSource = path.join(rootDir, `${reportBaseName}.report.html`);
  const jsonSource = path.join(rootDir, `${reportBaseName}.report.json`);
  const htmlTarget = path.join(outputDir, `${reportBaseName}.report.html`);
  const jsonTarget = path.join(outputDir, `${reportBaseName}.report.json`);

  if (fs.existsSync(htmlSource)) fs.copyFileSync(htmlSource, htmlTarget);
  if (fs.existsSync(jsonSource)) fs.copyFileSync(jsonSource, jsonTarget);
  if (fs.existsSync(jsonTarget)) {
    const report = JSON.parse(fs.readFileSync(jsonTarget, "utf8"));
    const accessibility = report.categories?.accessibility;
    fs.writeFileSync(
      path.join(outputDir, `${reportBaseName}.summary.json`),
      JSON.stringify(
        {
          mode: report.requestedUrl?.startsWith("https://") ? "prod" : "local",
          url: report.finalUrl || report.requestedUrl || "",
          score: accessibility?.score ?? 0,
        },
        null,
        2,
      ),
    );
    printFindings(report);
  }
}

function printFindings(report) {
  const category = report.categories?.accessibility;
  const audits = report.audits || {};
  const refs = category?.auditRefs || [];
  const findings = refs
    .map((ref) => {
      const audit = audits[ref.id];
      const score = audit?.score;
      const mode = audit?.scoreDisplayMode;
      if (score !== 0) return null;
      return {
        id: ref.id,
        title: audit?.title || ref.id,
        score,
        mode,
      };
    })
    .filter(Boolean);

  console.log("");
  console.log("[a11y] Findings");
  if (findings.length === 0) {
    console.log("[a11y] No accessibility violations were reported.");
  } else {
    for (const finding of findings) {
      console.log(`[a11y] ${finding.id}: ${finding.title}`);
    }
  }
  console.log(`[a11y] Accessibility score: ${category?.score ?? 0}`);
  console.log("");
}

async function main() {
  ensureBuild();

  if (isProd) {
    const status = runReport("https://christianguzman.uk");
    moveReportArtifacts();
    const jsonPath = path.join(outputDir, `${reportBaseName}.report.json`);
    return status !== 0 && fs.existsSync(jsonPath) ? 0 : status;
  }

  const server = await startStaticServer(publicDir);
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const status = runReport(baseUrl);
    moveReportArtifacts();
    const jsonPath = path.join(outputDir, `${reportBaseName}.report.json`);
    return status !== 0 && fs.existsSync(jsonPath) ? 0 : status;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main()
  .then((status) => process.exit(status ?? 1))
  .catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
