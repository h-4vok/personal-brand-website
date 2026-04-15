const cleanupNoiseIndicators = [
  "EPERM",
  "EACCES",
  "Permission denied",
];

const fatalNoiseIndicators = [
  "ChromeNotInstalledError",
  "No Chrome installations found",
  "Timed out",
  "Protocol error",
];

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

function hasKnownCleanupNoise(stderr) {
  if (!stderr) return false;
  return cleanupNoiseIndicators.some((indicator) => String(stderr).includes(indicator));
}

function hasFatalNoise(stderr) {
  if (!stderr) return false;
  return fatalNoiseIndicators.some((indicator) => String(stderr).includes(indicator));
}

function classifyLighthouseResult({ status, hasReport, stderr }) {
  const exitStatus = status ?? 1;

  if (!hasReport) {
    return {
      kind: "fatal-no-report",
      exitStatus: exitStatus === 0 ? 1 : exitStatus,
      hasCleanupNoise: hasKnownCleanupNoise(stderr),
      summary: summarizeFailure(stderr),
    };
  }

  if (exitStatus === 0) {
    return {
      kind: "success",
      exitStatus: 0,
      hasCleanupNoise: false,
      summary: "",
    };
  }

  const hasCleanupNoise = hasKnownCleanupNoise(stderr);

  if (hasCleanupNoise && !hasFatalNoise(stderr)) {
    return {
      kind: "cleanup-noise",
      exitStatus: 0,
      hasCleanupNoise: true,
      summary: summarizeFailure(stderr),
    };
  }

  return {
    kind: "fatal-with-report",
    exitStatus,
    hasCleanupNoise: false,
    summary: summarizeFailure(stderr),
  };
}

module.exports = {
  classifyLighthouseResult,
  hasFatalNoise,
  hasKnownCleanupNoise,
  summarizeFailure,
};
