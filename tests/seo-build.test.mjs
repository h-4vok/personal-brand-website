import fs from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { describe, it } from 'vitest';

const REPO_ROOT = process.cwd();
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const ROBOTS_TXT_PATH = path.join(PUBLIC_DIR, 'robots.txt');
const HUGO_CONFIG_PATH = path.join(REPO_ROOT, 'hugo.toml');
const NETLIFY_CONFIG_PATH = path.join(REPO_ROOT, 'netlify.toml');
const ARTICLE_SCHEMA_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const SERVICE_SCHEMA_TYPES = new Set(['Service']);
const LANGUAGE_HOME_SEGMENTS = new Set(['en', 'english', 'fr']);
const LEGACY_PUBLIC_SEGMENTS = ['/english/', '/en/', '/fr/'];

const { baseUrl, siteTitle, twitterSite, twitterCreator, ahrefsDataKey } = readHugoConfig(HUGO_CONFIG_PATH);
const netlifyConfig = fs.readFileSync(NETLIFY_CONFIG_PATH, 'utf8');
const htmlFiles = fs.existsSync(PUBLIC_DIR)
  ? walkHtmlFiles(PUBLIC_DIR)
      .map((absolutePath) => ({
        absolutePath,
        relativePath: toPosixPath(path.relative(PUBLIC_DIR, absolutePath)),
      }))
      .filter(
        ({ absolutePath, relativePath }) =>
          !shouldIgnoreHtml(relativePath) && !isAliasRedirectPage(absolutePath),
      )
      .sort((left, right) => left.relativePath.localeCompare(right.relativePath))
  : [];

describe('SEO build assertions', () => {
  it('finds generated HTML pages in public/', () => {
    assert(
      fs.existsSync(PUBLIC_DIR),
      `Missing generated site at ${PUBLIC_DIR}. Run "npm run build" before "npm run test:seo:assert", or use "npm run test:seo".`,
    );

    assert(
      htmlFiles.length > 0,
      `No HTML pages were found under ${PUBLIC_DIR}. Run "npm run build" before the SEO assertions.`,
    );
  });

  it('does not generate legacy language content trees', () => {
    for (const segment of ['english', 'en', 'fr']) {
      assert(
        !fs.existsSync(path.join(PUBLIC_DIR, segment)),
        `Unexpected language content tree found at ${path.join(PUBLIC_DIR, segment)}.`,
      );
    }
  });

  it('returns 410 Gone for legacy language routes on Netlify', () => {
    assert(
      hasNetlifyGoneRule(netlifyConfig, '/english/*'),
      'netlify.toml must declare a 410 Gone rule for /english/*.',
    );
    assert(
      hasNetlifyGoneRule(netlifyConfig, '/en/*'),
      'netlify.toml must declare a 410 Gone rule for /en/*.',
    );
    assert(
      hasNetlifyGoneRule(netlifyConfig, '/fr/*'),
      'netlify.toml must declare a 410 Gone rule for /fr/*.',
    );
  });

  it('emits robots.txt with canonical sitemap URL', () => {
    assert(fs.existsSync(ROBOTS_TXT_PATH), `Missing generated robots.txt at ${ROBOTS_TXT_PATH}.`);

    const robots = fs.readFileSync(ROBOTS_TXT_PATH, 'utf8');
    const expected = `Sitemap: ${baseUrl.origin}/sitemap.xml`;
    assert(
      robots.includes(expected),
      `robots.txt must include the canonical sitemap URL. Expected to find "${expected}".`,
    );
  });

  for (const page of htmlFiles) {
    it(`validates ${page.relativePath}`, () => {
      const html = fs.readFileSync(page.absolutePath, 'utf8');
      assert(
        !/\?v=\d{10,}/.test(html),
        `[${page.relativePath}] must not contain timestamp-based cache busting (?v=now.Unix style).`,
      );
      const $ = load(html);
      const pageType = classifyPage(page.relativePath);
      const h1Count = $('h1').length;

      if (page.relativePath === 'redirect/index.html') {
        const robots = $('meta[name="robots"]').attr('content')?.trim() ?? '';
        assert(
          robots === 'noindex,nofollow',
          `[${page.relativePath}] must include meta robots="noindex,nofollow". Actual value: "${robots || '(missing)'}".`,
        );

        assert(
          $('.redirect-spinner').length === 1,
          `[${page.relativePath}] must render exactly one redirect spinner (.redirect-spinner).`,
        );

        assert(
          $('#redirect-link').length === 1,
          `[${page.relativePath}] must render a fallback redirect link (#redirect-link).`,
        );
      }

      const title = readRequiredText($, 'title', page.relativePath);
      assert(
        title.includes(siteTitle),
        `[${page.relativePath}] <title> must include the site brand "${siteTitle}". Actual value: "${title}".`,
      );

      if (pageType === 'list' || pageType === 'blog-post') {
        assert(
          h1Count === 1,
          `[${page.relativePath}] must render exactly one <h1> for ${pageType} pages. Found ${h1Count}.`,
        );
      }

      readRequiredMeta($, 'description', page.relativePath);

      const canonicalHref = readCanonicalHref($, page.relativePath);
      const canonicalUrl = parseAbsoluteUrl(
        canonicalHref,
        `[${page.relativePath}] canonical href must be an absolute URL.`,
      );
      assertSameOrigin(
        canonicalUrl,
        baseUrl,
        `[${page.relativePath}] canonical href must use the canonical domain ${baseUrl.origin}. Actual value: "${canonicalHref}".`,
      );
      assertNoLegacySegments(
        canonicalUrl.pathname,
        `[${page.relativePath}] canonical href must not point to a retired language URL. Actual value: "${canonicalHref}".`,
      );

      const ogTitle = readRequiredMeta($, 'og:title', page.relativePath);
      const ogDescription = readRequiredMeta($, 'og:description', page.relativePath);
      const ogType = readRequiredMeta($, 'og:type', page.relativePath);
      const ogUrlContent = readRequiredMeta($, 'og:url', page.relativePath);
      const ogUrl = parseAbsoluteUrl(
        ogUrlContent,
        `[${page.relativePath}] og:url must be an absolute URL.`,
      );
      assertSameOrigin(
        ogUrl,
        baseUrl,
        `[${page.relativePath}] og:url must use the canonical domain ${baseUrl.origin}. Actual value: "${ogUrlContent}".`,
      );
      assertNoLegacySegments(
        ogUrl.pathname,
        `[${page.relativePath}] og:url must not point to a retired language URL. Actual value: "${ogUrlContent}".`,
      );
      assert(
        normalizeUrl(ogUrl) === normalizeUrl(canonicalUrl),
        `[${page.relativePath}] og:url must match the canonical URL. canonical="${canonicalUrl.href}" og:url="${ogUrl.href}".`,
      );

      const twitterTitle = readRequiredMeta($, 'twitter:title', page.relativePath);
      const twitterDescription = readRequiredMeta($, 'twitter:description', page.relativePath);
      readRequiredMeta($, 'twitter:card', page.relativePath);

      const criticalCss = $('style[data-critical-css="true"]');
      assert(
        criticalCss.length === 1,
        `[${page.relativePath}] must emit exactly one inline critical CSS block.`,
      );

      const preloadStyles = $('link[rel="preload"][as="style"]');
      assert(
        preloadStyles.length === 1,
        `[${page.relativePath}] must preload exactly one deferred stylesheet bundle.`,
      );
      const preloadHref = preloadStyles.first().attr('href')?.trim() ?? '';
      assert(
        preloadHref.includes('?v='),
        `[${page.relativePath}] deferred stylesheet preload must include a stable cache-busting query string.`,
      );

      const deferredStylesheet = $('link[rel="stylesheet"][href*="/css/site."]');
      assert(
        deferredStylesheet.length === 1,
        `[${page.relativePath}] must load the combined site stylesheet bundle.`,
      );
      const deferredHref = deferredStylesheet.attr('href')?.trim() ?? '';
      assert(
        deferredHref.includes('?v='),
        `[${page.relativePath}] combined site stylesheet must include a stable cache-busting query string.`,
      );
      assert(
        preloadHref === deferredHref,
        `[${page.relativePath}] deferred stylesheet preload and stylesheet href must match exactly.`,
      );

      const noScriptDeferredMatch = html.match(
        /<noscript>\s*<link rel=stylesheet href="([^"]*\/css\/site\.[^"]*)"/i,
      );
      assert(
        noScriptDeferredMatch,
        `[${page.relativePath}] must include a noscript fallback for the combined site stylesheet bundle.`,
      );
      const noScriptDeferredHref = noScriptDeferredMatch[1]?.trim() ?? '';
      assert(
        noScriptDeferredHref === deferredHref,
        `[${page.relativePath}] noscript stylesheet href must match the deferred stylesheet href exactly.`,
      );

      assert(
        $('link[rel="stylesheet"][href*="/css/vendor."]').length === 0,
        `[${page.relativePath}] must not emit a blocking vendor.css stylesheet link.`,
      );
      assert(
        $('link[rel="stylesheet"][href*="/css/custom.bundle."]').length === 0,
        `[${page.relativePath}] must not emit a blocking custom.bundle.css stylesheet link.`,
      );
      assert(
        $('link[rel="stylesheet"][href*="/css/style."]').length === 0,
        `[${page.relativePath}] must not emit a blocking style.css stylesheet link.`,
      );

      if (ahrefsDataKey) {
        const ahrefsScript = $(`script[data-key="${ahrefsDataKey}"]`);
        assert(
          ahrefsScript.length === 1,
          `[${page.relativePath}] must emit exactly one Ahrefs analytics script tag with the configured data-key.`,
        );

        const ahrefsSrc = ahrefsScript.attr('src')?.trim() ?? '';
        assert(
          ahrefsSrc && !ahrefsSrc.includes('analytics.ahrefs.com'),
          `[${page.relativePath}] Ahrefs analytics must be served from the local site, not analytics.ahrefs.com. Actual src: "${ahrefsSrc}".`,
        );
        assert(
          ahrefsSrc.includes('?v='),
          `[${page.relativePath}] Ahrefs analytics must include a stable cache-busting query string.`,
        );

        assertResolvableAssetUrl(
          ahrefsSrc,
          baseUrl,
          `[${page.relativePath}] Ahrefs analytics src must be absolute or root-relative. Actual value: "${ahrefsSrc}".`,
        );
        assertPublicAssetExists(
          ahrefsSrc,
          baseUrl,
          page.relativePath,
          'Ahrefs analytics script',
        );
      }

      if (twitterSite) {
        assert(
          readRequiredMeta($, 'twitter:site', page.relativePath) === twitterSite,
          `[${page.relativePath}] twitter:site must match hugo.toml params.seo.twitterSite. Expected "${twitterSite}".`,
        );
      } else {
        assert(
          readOptionalMeta($, 'twitter:site') === null,
          `[${page.relativePath}] twitter:site must not be emitted when params.seo.twitterSite is empty.`,
        );
      }

      if (twitterCreator) {
        assert(
          readRequiredMeta($, 'twitter:creator', page.relativePath) === twitterCreator,
          `[${page.relativePath}] twitter:creator must match hugo.toml params.seo.twitterCreator. Expected "${twitterCreator}".`,
        );
      } else if (twitterSite) {
        assert(
          readRequiredMeta($, 'twitter:creator', page.relativePath) === twitterSite,
          `[${page.relativePath}] twitter:creator must fall back to params.seo.twitterSite. Expected "${twitterSite}".`,
        );
      } else {
        assert(
          readOptionalMeta($, 'twitter:creator') === null,
          `[${page.relativePath}] twitter:creator must not be emitted when params.seo.twitterCreator and twitterSite are empty.`,
        );
      }

      const ogImage = readOptionalMeta($, 'og:image');
      if (ogImage !== null) {
        assertResolvableAssetUrl(
          ogImage,
          baseUrl,
          `[${page.relativePath}] og:image must be absolute or root-relative. Actual value: "${ogImage}".`,
        );
        assertPublicAssetExists(
          ogImage,
          baseUrl,
          page.relativePath,
          'og:image',
        );
      }

      const twitterImage = readOptionalMeta($, 'twitter:image');
      if (twitterImage !== null) {
        assertResolvableAssetUrl(
          twitterImage,
          baseUrl,
          `[${page.relativePath}] twitter:image must be absolute or root-relative. Actual value: "${twitterImage}".`,
        );
        assertPublicAssetExists(
          twitterImage,
          baseUrl,
          page.relativePath,
          'twitter:image',
        );
      }

      assert(
        title === ogTitle || ogTitle.includes(siteTitle),
        `[${page.relativePath}] og:title should stay aligned with the page title. title="${title}" og:title="${ogTitle}".`,
      );
      assert(
        twitterTitle === ogTitle,
        `[${page.relativePath}] twitter:title should match og:title. twitter:title="${twitterTitle}" og:title="${ogTitle}".`,
      );
      assert(
        twitterDescription === ogDescription,
        `[${page.relativePath}] twitter:description should match og:description.`,
      );

      const internalHrefs = readInternalHrefs($, baseUrl);
      for (const href of internalHrefs) {
        assertNoLegacySegments(
          href.pathname,
          `[${page.relativePath}] found internal link to a retired language URL: "${href.href}".`,
        );
      }

      const fingerprintedScripts = $('script[src*="/js/vendor."], script[src*="/js/script."]')
        .toArray()
        .map((scriptElement) => $(scriptElement).attr('src')?.trim() ?? '')
        .filter(Boolean);
      for (const scriptSrc of fingerprintedScripts) {
        assert(
          scriptSrc.includes('?v='),
          `[${page.relativePath}] fingerprinted script assets must include a stable cache-busting query string. Actual src: "${scriptSrc}".`,
        );
      }

      if (pageType === 'home' || pageType === 'list') {
        assertNoDuplicateArticleCards(
          $,
          `[${page.relativePath}] renders the same article more than once in a list context.`,
        );
      }

      if (page.relativePath === 'articles/index.html') {
        const articleImages = $('.media-wrapper img.img-blog').slice(0, 3);
        assert(
          articleImages.length === 3,
          `[${page.relativePath}] must render at least 3 article card images for the above-the-fold eager loading assertions.`,
        );

        articleImages.each((index, element) => {
          const img = $(element);
          const className = img.attr('class') ?? '';
          assert(
            !className.split(/\s+/).includes('lozad'),
            `[${page.relativePath}] above-the-fold article card image ${index + 1} must not include the \"lozad\" class.`,
          );
          const loading = img.attr('loading')?.trim() ?? '';
          assert(
            loading === 'eager',
            `[${page.relativePath}] above-the-fold article card image ${index + 1} must use loading=\"eager\". Actual value: \"${loading}\".`,
          );
        });

        const firstImage = articleImages.first();
        const fetchPriority = firstImage.attr('fetchpriority')?.trim() ?? '';
        assert(
          fetchPriority === 'high',
          `[${page.relativePath}] first above-the-fold article card image must use fetchpriority=\"high\". Actual value: \"${fetchPriority}\".`,
        );
      }

      const schemas = readStructuredData($, page.relativePath);
      const schemaTypes = collectSchemaTypes(schemas);
      const hasArticleSchema = schemaTypes.some((type) => ARTICLE_SCHEMA_TYPES.has(type));
      const hasServiceSchema = schemaTypes.some((type) => SERVICE_SCHEMA_TYPES.has(type));
      const isServiceLanding = page.relativePath === 'engineering-leadership-coaching/index.html';

      if (isServiceLanding) {
        const portrait = $('img.strategy-session-portrait');
        assert(
          portrait.length === 1,
          `[${page.relativePath}] must render exactly one strategy-session portrait image.`,
        );

        const loading = portrait.attr('loading')?.trim() ?? '';
        assert(
          loading === 'eager',
          `[${page.relativePath}] strategy-session portrait must use loading=\"eager\". Actual value: \"${loading}\".`,
        );

        const portraitSrc = portrait.attr('src')?.trim() ?? '';
        assert(
          portraitSrc && !portraitSrc.includes('images/avatar3.jpg'),
          `[${page.relativePath}] strategy-session portrait must not use the oversized static avatar3.jpg. Actual src: \"${portraitSrc}\".`,
        );
        assert(
          portraitSrc.includes('_hu_') || portraitSrc.endsWith('.webp'),
          `[${page.relativePath}] strategy-session portrait should be served from Hugo image processing output. Actual src: \"${portraitSrc}\".`,
        );

        const pictureSources = portrait
          .closest('picture')
          .find('source')
          .map((_, el) => $(el).attr('srcset')?.trim() ?? '')
          .get()
          .join(' ');

        assert(
          !pictureSources.includes('images/avatar3.jpg'),
          `[${page.relativePath}] strategy-session portrait sources must not reference the oversized static avatar3.jpg.`,
        );
      }

      if (pageType === 'blog-post') {
        assert(
          ogType === 'article',
          `[${page.relativePath}] blog posts must emit og:type="article". Actual value: "${ogType}".`,
        );
        assert(
          schemaTypes.includes('BlogPosting'),
          `[${page.relativePath}] blog posts must emit BlogPosting JSON-LD. Found schema types: ${formatList(schemaTypes)}.`,
        );
      } else {
        assert(
          !hasArticleSchema,
          `[${page.relativePath}] non-post pages must not emit article schema types. Found schema types: ${formatList(schemaTypes)}.`,
        );
      }

      if (page.relativePath === 'index.html') {
        assert(
          schemaTypes.includes('Person'),
          `[${page.relativePath}] home page must emit Person JSON-LD. Found schema types: ${formatList(schemaTypes)}.`,
        );
      }

      if (isServiceLanding) {
        assert(
          schemaTypes.includes('Person'),
          `[${page.relativePath}] service landing must emit Person JSON-LD. Found schema types: ${formatList(schemaTypes)}.`,
        );
        assert(
          schemaTypes.includes('Service'),
          `[${page.relativePath}] service landing must emit Service JSON-LD. Found schema types: ${formatList(schemaTypes)}.`,
        );
      } else {
        assert(
          !hasServiceSchema,
          `[${page.relativePath}] non-service pages must not emit Service schema types. Found schema types: ${formatList(schemaTypes)}.`,
        );
      }
    });
  }
});

function readHugoConfig(configPath) {
  const config = fs.readFileSync(configPath, 'utf8');
  const baseUrlRaw = readTopLevelTomlString(config, 'baseURL');
  const siteTitle = readTopLevelTomlString(config, 'title');
  const twitterSite = readTomlSectionString(config, 'params.seo', 'twitterSite');
  const twitterCreator = readTomlSectionString(config, 'params.seo', 'twitterCreator');
  const ahrefsDataKey = readTomlSectionString(config, 'params.analytics.ahrefs', 'dataKey');

  assert(baseUrlRaw, `Could not read baseURL from ${configPath}.`);
  assert(siteTitle, `Could not read title from ${configPath}.`);

  return {
    baseUrl: new URL(baseUrlRaw),
    siteTitle,
    twitterSite,
    twitterCreator,
    ahrefsDataKey,
  };
}

function readTopLevelTomlString(config, key) {
  const match = config.match(new RegExp(`^${key}\\s*=\\s*["']([^"']+)["']`, 'm'));
  return match ? match[1].trim() : '';
}

function readTomlSectionString(config, section, key) {
  let currentSection = '';
  for (const rawLine of config.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).trim();
      continue;
    }

    if (currentSection !== section) {
      continue;
    }

    const match = rawLine.match(new RegExp(`^\\s*${key}\\s*=\\s*["']([^"']*)["']`));
    if (match) {
      return match[1].trim();
    }
  }

  return '';
}

function walkHtmlFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && absolutePath.endsWith('.html')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function shouldIgnoreHtml(relativePath) {
  return relativePath === '404.html' || relativePath.endsWith('/404.html');
}

function isAliasRedirectPage(absolutePath) {
  const html = fs.readFileSync(absolutePath, 'utf8');
  const $ = load(html);
  const refresh = $('meta[http-equiv="refresh"]').attr('content')?.trim() ?? '';
  const canonicalHref = $('link[rel="canonical"]').attr('href')?.trim() ?? '';
  const title = $('title').first().text().trim();

  return Boolean(refresh) && Boolean(canonicalHref) && title === canonicalHref;
}

function classifyPage(relativePath) {
  const segments = relativePath.split('/').filter(Boolean);

  if (segments.length === 1 && segments[0] === 'index.html') {
    return 'home';
  }

  if (
    segments.length === 2 &&
    segments[1] === 'index.html' &&
    LANGUAGE_HOME_SEGMENTS.has(segments[0])
  ) {
    return 'home';
  }

  const contentSegments = segments.slice(0, -1);
  const articleRootIndex = contentSegments.findIndex(
    (segment) => segment === 'articles' || segment === 'blog',
  );

  if (articleRootIndex >= 0) {
    const nextSegment = contentSegments[articleRootIndex + 1];
    if (nextSegment && nextSegment !== 'page') {
      return 'blog-post';
    }

    return 'list';
  }

  if (contentSegments.includes('page')) {
    return 'list';
  }

  if (
    contentSegments.length === 0 ||
    ['author', 'categories', 'tags'].includes(contentSegments[0])
  ) {
    return 'list';
  }

  return 'page';
}

function readRequiredText($, selector, relativePath) {
  const value = $(selector).first().text().trim();
  assert(value, `[${relativePath}] missing required text for selector "${selector}".`);
  return value;
}

function readRequiredMeta($, key, relativePath) {
  const selector = `meta[name="${key}"], meta[property="${key}"]`;
  const value = $(selector).first().attr('content')?.trim() ?? '';
  assert(value, `[${relativePath}] missing required meta tag "${key}".`);
  return value;
}

function readOptionalMeta($, key) {
  const selector = `meta[name="${key}"], meta[property="${key}"]`;
  const value = $(selector).first().attr('content');

  if (value === undefined) {
    return null;
  }

  const trimmedValue = value.trim();
  assert(trimmedValue, `Meta tag "${key}" is present but empty.`);
  return trimmedValue;
}

function readCanonicalHref($, relativePath) {
  const href = $('link[rel="canonical"]').first().attr('href')?.trim() ?? '';
  assert(href, `[${relativePath}] missing canonical link tag.`);
  return href;
}

function readStructuredData($, relativePath) {
  return $('script[type="application/ld+json"]')
    .toArray()
    .map((scriptElement, index) => {
      const rawJson = $(scriptElement).html()?.trim() ?? '';
      assert(rawJson, `[${relativePath}] JSON-LD script #${index + 1} is empty.`);

      try {
        return JSON.parse(rawJson);
      } catch (error) {
        throw new Error(
          `[${relativePath}] JSON-LD script #${index + 1} is invalid JSON: ${error.message}`,
        );
      }
    });
}

function collectSchemaTypes(nodes) {
  const collected = new Set();

  visitNode(nodes, (node) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    const rawType = node['@type'];
    if (typeof rawType === 'string') {
      collected.add(rawType);
    } else if (Array.isArray(rawType)) {
      for (const value of rawType) {
        if (typeof value === 'string' && value.trim()) {
          collected.add(value.trim());
        }
      }
    }
  });

  return Array.from(collected).sort();
}

function hasNetlifyGoneRule(config, fromPath) {
  const escapedPath = escapeRegExp(fromPath);
  const pattern = new RegExp(
    String.raw`\[\[redirects\]\][\s\S]*?from\s*=\s*"${escapedPath}"[\s\S]*?to\s*=\s*"/404\.html"[\s\S]*?status\s*=\s*410[\s\S]*?force\s*=\s*true`,
    'm',
  );

  return pattern.test(config);
}

function visitNode(node, callback) {
  if (Array.isArray(node)) {
    for (const item of node) {
      visitNode(item, callback);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  callback(node);

  for (const value of Object.values(node)) {
    visitNode(value, callback);
  }
}

function readInternalHrefs($, baseUrl) {
  return $('a[href]')
    .toArray()
    .map((anchor) => $(anchor).attr('href')?.trim() ?? '')
    .filter(Boolean)
    .map((href) => parseInternalHref(href, baseUrl))
    .filter(Boolean);
}

function parseInternalHref(href, baseUrl) {
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  if (href.startsWith('/')) {
    return new URL(href, baseUrl);
  }

  try {
    const absoluteUrl = new URL(href);
    return absoluteUrl.origin === baseUrl.origin ? absoluteUrl : null;
  } catch {
    return null;
  }
}

function assertNoLegacySegments(pathname, message) {
  assert(!LEGACY_PUBLIC_SEGMENTS.some((segment) => pathname.includes(segment)), message);
}

function assertNoDuplicateArticleCards($, message) {
  const seen = new Set();

  for (const article of $('article').toArray()) {
    const hrefs = $(article)
      .find('a[href]')
      .toArray()
      .map((anchor) => $(anchor).attr('href')?.trim() ?? '')
      .filter(Boolean);

    const articlePaths = Array.from(
      new Set(
        hrefs
          .map((href) => {
            try {
              return readArticlePath(new URL(href, 'https://example.com').pathname);
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      ),
    );

    if (articlePaths.length === 0) {
      continue;
    }

    assert(
      articlePaths.length === 1,
      `${message} Article card should only target one canonical article path. Found: ${articlePaths.join(', ')}.`,
    );

    const [articlePath] = articlePaths;
    assert(!seen.has(articlePath), `${message} Duplicate article path: "${articlePath}".`);
    seen.add(articlePath);
  }
}

function readArticlePath(pathname) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const match = normalized.match(/^\/articles\/([^/]+)\/$/);
  return match ? `/articles/${match[1]}/` : null;
}

function assertResolvableAssetUrl(value, baseUrl, message) {
  if (value.startsWith('/')) {
    new URL(value, baseUrl);
    return;
  }

  parseAbsoluteUrl(value, message);
}

function assertPublicAssetExists(value, baseUrl, relativePath, key) {
  let url;
  try {
    url = value.startsWith('/') ? new URL(value, baseUrl) : new URL(value);
  } catch {
    throw new Error(`[${relativePath}] ${key} must be a valid URL. Actual value: "${value}".`);
  }

  if (url.origin !== baseUrl.origin) {
    return;
  }

  const pathname = url.pathname.replace(/^\/+/, '');
  const diskPath = path.join(PUBLIC_DIR, ...pathname.split('/'));
  assert(
    fs.existsSync(diskPath),
    `[${relativePath}] ${key} points to a missing asset under public/. url="${url.href}" expected="${diskPath}".`,
  );
}

function parseAbsoluteUrl(value, message) {
  try {
    const url = new URL(value);
    assert(
      url.protocol === 'https:' || url.protocol === 'http:',
      `${message} Unsupported protocol "${url.protocol}".`,
    );
    return url;
  } catch {
    throw new Error(message);
  }
}

function assertSameOrigin(actualUrl, expectedUrl, message) {
  assert(actualUrl.origin === expectedUrl.origin, message);
}

function normalizeUrl(url) {
  return `${url.origin}${url.pathname}${url.search}`;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function formatList(values) {
  return values.length ? values.join(', ') : '(none)';
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
