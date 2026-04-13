import fs from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { describe, it } from 'vitest';

const REPO_ROOT = process.cwd();
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const HUGO_CONFIG_PATH = path.join(REPO_ROOT, 'hugo.toml');
const ARTICLE_SCHEMA_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle']);
const LANGUAGE_HOME_SEGMENTS = new Set(['en', 'english', 'fr']);

const { baseUrl, siteTitle } = readHugoConfig(HUGO_CONFIG_PATH);
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

  for (const page of htmlFiles) {
    it(`validates ${page.relativePath}`, () => {
      const html = fs.readFileSync(page.absolutePath, 'utf8');
      const $ = load(html);
      const pageType = classifyPage(page.relativePath);

      const title = readRequiredText($, 'title', page.relativePath);
      assert(
        title.includes(siteTitle),
        `[${page.relativePath}] <title> must include the site brand "${siteTitle}". Actual value: "${title}".`,
      );

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
      assert(
        normalizeUrl(ogUrl) === normalizeUrl(canonicalUrl),
        `[${page.relativePath}] og:url must match the canonical URL. canonical="${canonicalUrl.href}" og:url="${ogUrl.href}".`,
      );

      const twitterTitle = readRequiredMeta($, 'twitter:title', page.relativePath);
      const twitterDescription = readRequiredMeta($, 'twitter:description', page.relativePath);
      readRequiredMeta($, 'twitter:card', page.relativePath);

      const ogImage = readOptionalMeta($, 'og:image');
      if (ogImage !== null) {
        assertResolvableAssetUrl(
          ogImage,
          baseUrl,
          `[${page.relativePath}] og:image must be absolute or root-relative. Actual value: "${ogImage}".`,
        );
      }

      const twitterImage = readOptionalMeta($, 'twitter:image');
      if (twitterImage !== null) {
        assertResolvableAssetUrl(
          twitterImage,
          baseUrl,
          `[${page.relativePath}] twitter:image must be absolute or root-relative. Actual value: "${twitterImage}".`,
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

      const schemas = readStructuredData($, page.relativePath);
      const schemaTypes = collectSchemaTypes(schemas);
      const hasArticleSchema = schemaTypes.some((type) => ARTICLE_SCHEMA_TYPES.has(type));

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
    });
  }
});

function readHugoConfig(configPath) {
  const config = fs.readFileSync(configPath, 'utf8');
  const baseUrlRaw = readTopLevelTomlString(config, 'baseURL');
  const siteTitle = readTopLevelTomlString(config, 'title');

  assert(baseUrlRaw, `Could not read baseURL from ${configPath}.`);
  assert(siteTitle, `Could not read title from ${configPath}.`);

  return {
    baseUrl: new URL(baseUrlRaw),
    siteTitle,
  };
}

function readTopLevelTomlString(config, key) {
  const match = config.match(new RegExp(`^${key}\\s*=\\s*["']([^"']+)["']`, 'm'));
  return match ? match[1].trim() : '';
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

function assertResolvableAssetUrl(value, baseUrl, message) {
  if (value.startsWith('/')) {
    new URL(value, baseUrl);
    return;
  }

  parseAbsoluteUrl(value, message);
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
