const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/opt/google/chrome/chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

function detectBrowserPath() {
  return browserCandidates.find((candidate) => candidate && fs.existsSync(candidate)) || "";
}

function waitForPort(port, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket
        .once("connect", () => {
          socket.destroy();
          resolve();
        })
        .once("error", () => {
          socket.destroy();
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error(`Timed out waiting for browser debug port ${port}.`));
            return;
          }
          setTimeout(tryConnect, 300);
        })
        .once("timeout", () => {
          socket.destroy();
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error(`Timed out waiting for browser debug port ${port}.`));
            return;
          }
          setTimeout(tryConnect, 300);
        })
        .connect(port, "127.0.0.1");
    };

    tryConnect();
  });
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address.port;
      server.close(() => resolve(port));
    });
    server.once("error", reject);
  });
}

async function launchDebugBrowser({ port, userDataDir }) {
  const browserPath = detectBrowserPath();
  if (!browserPath) {
    throw new Error(
      "No compatible Chrome/Chromium/Edge installation found. Set CHROME_PATH to a browser binary.",
    );
  }

  fs.mkdirSync(userDataDir, { recursive: true });

  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${path.resolve(userDataDir)}`,
    "about:blank",
  ];

  const proc = spawn(browserPath, args, {
    stdio: "ignore",
    windowsHide: true,
  });

  await waitForPort(port);
  return proc;
}

function killProcess(proc) {
  if (!proc || proc.killed) return;
  try {
    proc.kill("SIGKILL");
  } catch {
    // no-op
  }
}

module.exports = {
  detectBrowserPath,
  getAvailablePort,
  launchDebugBrowser,
  killProcess,
};
