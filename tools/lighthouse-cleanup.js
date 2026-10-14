const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const lighthouseDir = path.join(rootDir, ".lighthouseci");

// These directories contain browser state or temporary Lighthouse data, not reports.
const runtimeDirectories = [
  "chrome-profile",
  "chrome-profile-local",
  "edge-test-profile",
  "tmp",
];

function cleanupLighthouseRuntimeArtifacts() {
  for (const name of runtimeDirectories) {
    const target = path.join(lighthouseDir, name);
    try {
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
    } catch {
      // Cleanup is best-effort; report generation should remain the primary result.
    }
  }

  // Remove the generated parent only when every run has already removed its own profile.
  try {
    fs.rmdirSync(path.join(lighthouseDir, "profiles"));
  } catch {
    // Keep it if another Lighthouse run still has a profile inside.
  }
}

module.exports = { cleanupLighthouseRuntimeArtifacts };
