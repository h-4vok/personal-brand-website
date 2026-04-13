import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import purgecssModule from '@fullhuman/postcss-purgecss';
import cssnano from 'cssnano';

const REPO_ROOT = process.cwd();
const HUGO_STATS_PATH = path.join(REPO_ROOT, 'hugo_stats.json');
const BOOTSTRAP_INPUT_PATH = path.join(
  REPO_ROOT,
  'themes',
  'meghna-hugo',
  'static',
  'plugins',
  'bootstrap',
  'bootstrap.min.css',
);
const BOOTSTRAP_OUTPUT_PATH = path.join(
  REPO_ROOT,
  'static',
  'plugins',
  'bootstrap',
  'bootstrap.min.css',
);

if (!fs.existsSync(HUGO_STATS_PATH)) {
  throw new Error(`Missing ${HUGO_STATS_PATH}. Run a Hugo build that writes hugo_stats.json first.`);
}

if (!fs.existsSync(BOOTSTRAP_INPUT_PATH)) {
  throw new Error(`Missing Bootstrap input CSS at ${BOOTSTRAP_INPUT_PATH}.`);
}

const stats = JSON.parse(fs.readFileSync(HUGO_STATS_PATH, 'utf8'));
const usedClasses = Array.isArray(stats?.htmlElements?.classes) ? stats.htmlElements.classes : [];

const dynamicBootstrapClasses = [
  'active',
  'show',
  'collapsing',
  'dropdown',
  'dropdown-menu',
  'dropdown-item',
  'dropdown-toggle',
  'modal',
  'fade',
  'disabled',
  'sr-only',
  'sr-only-focusable',
];

const allClasses = Array.from(new Set([...usedClasses, ...dynamicBootstrapClasses])).filter(Boolean);
const syntheticHtml = `<div class="${allClasses.join(' ')}"></div>`;

const inputCss = fs.readFileSync(BOOTSTRAP_INPUT_PATH, 'utf8');

const purgecss =
  purgecssModule?.purgeCSSPlugin ??
  purgecssModule?.default?.purgeCSSPlugin ??
  purgecssModule?.default ??
  purgecssModule;

const result = await postcss([
  purgecss({
    content: [{ raw: syntheticHtml, extension: 'html' }],
    safelist: {
      standard: dynamicBootstrapClasses,
      greedy: [/^col-/, /^row$/, /^container/, /^btn/, /^navbar/, /^nav/, /^breadcrumb/, /^text-/, /^bg-/],
    },
  }),
  cssnano({ preset: 'default' }),
]).process(inputCss, { from: BOOTSTRAP_INPUT_PATH, to: BOOTSTRAP_OUTPUT_PATH });

fs.mkdirSync(path.dirname(BOOTSTRAP_OUTPUT_PATH), { recursive: true });
fs.writeFileSync(BOOTSTRAP_OUTPUT_PATH, result.css);

process.stderr.write(`[purge-bootstrap] Wrote ${BOOTSTRAP_OUTPUT_PATH} (${Buffer.byteLength(result.css)} bytes)\n`);
