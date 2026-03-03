# Build and Publish

This repo is a static Hugo site. The root workflow is intentionally simple: serve locally, then build to `public/`.

## Core commands

From the repo root:

```powershell
npm run dev
```

Runs:

```powershell
hugo server --buildDrafts
```

Use this for day-to-day editing.

For a production-style build:

```powershell
npm run build
```

Runs:

```powershell
hugo --gc --minify --templateMetrics --templateMetricsHints --buildExpired --buildFuture --forceSyncStatic
```

For a production-environment local server with watch mode:

```powershell
npm run test
```

## What `public/` contains

After `npm run build`, Hugo writes the generated static site to `public/`.

That folder is the publishable artifact:

- HTML
- CSS
- JS
- copied static assets
- generated feeds or other outputs

Do not hand-edit `public/`; regenerate it from source.

## Why the current build flags matter

- `--gc`: removes unused cache files from Hugo's generated resources
- `--minify`: minifies output for production
- `--templateMetrics` and `--templateMetricsHints`: useful when templates are slow or unexpectedly expensive
- `--buildExpired`: includes expired content
- `--buildFuture`: includes future-dated content
- `--forceSyncStatic`: forces static file sync during build

Important implication:

The current root production build includes future and expired content. That is not a Hugo default, so do not assume date-based exclusion is protecting production output.

## Local verification flow

Recommended check before publishing:

1. Run `npm run dev` while editing content.
2. Run `npm run build` before publishing.
3. Inspect the generated `public/` output if the rendered result looks wrong in the browser.
4. Verify article URLs, homepage sections, and asset paths.

## Publishing procedure

The repo does not currently document an automated deployment target. The safe documented assumption is:

1. Generate a fresh build with `npm run build`.
2. Publish the contents of `public/` to the static hosting target used for `christianguzman.uk`.
3. Verify the live site after upload.

If an external deployment pipeline exists, add it here rather than leaving it as tribal knowledge.

## Checks for dated content

Because the build includes both future and expired content:

- future-dated posts can appear in output
- expired posts can also appear in output

Before publishing, explicitly review:

- newest blog card ordering
- any recently drafted or scheduled post
- any content that was meant to be hidden by date only

## If the build output looks wrong

Check these first:

- asset path is correct
- you edited the right layer: root vs theme
- content file saved in UTF-8
- conflicting config exists in `hugo.toml` and `config/_default/*`
- stale browser cache or generated resources are masking your change
