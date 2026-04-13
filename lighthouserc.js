const fs = require("node:fs");

const windowsChromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const detectedChromePath =
  process.env.CHROME_PATH ||
  windowsChromeCandidates.find((candidate) => fs.existsSync(candidate));

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./public",
      numberOfRuns: 1,
      url: ["/", "/articles/", "/engineering-leadership-coaching/"],
      chromePath: detectedChromePath,
      settings: {
        chromeFlags:
          "--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage --user-data-dir=./.lighthouseci/chrome-profile",
      },
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 1 }],
        "categories:performance": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
