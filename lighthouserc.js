const { detectBrowserPath } = require("./tools/lighthouse-browser");

const detectedChromePath = detectBrowserPath();

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./public",
      numberOfRuns: 1,
      url: ["/", "/articles/", "/engineering-leadership-coaching/"],
      chromePath: detectedChromePath,
      settings: {
        chromeFlags: [
          "--headless=new",
          "--disable-gpu",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--user-data-dir=./.lighthouseci/chrome-profile",
          "--no-first-run",
          "--no-default-browser-check",
        ],
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
