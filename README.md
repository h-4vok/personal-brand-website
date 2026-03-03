# personal-brand-website

This repository contains the Hugo site for `christianguzman.uk`. It combines:

- site-level configuration in the repository root
- editorial content in Markdown and YAML
- a checked-in local theme at `themes/meghna-hugo`

The goal of this documentation is operational: make it easy to update content, homepage sections, styling, and production builds without reverse-engineering the repo every time.

## Overview

- Static site generator: Hugo
- Theme: local `meghna-hugo` theme stored in this repo
- Main content:
  - blog posts in `content/english/blog`
  - author data in `content/english/author`
  - homepage sections in `data/en/*.yml`
- Main config:
  - brand and site-level overrides in `hugo.toml`
  - theme defaults and multilingual defaults in `config/_default/*.toml`

Use this README as the entry point, then jump to the focused docs in `docs/`.

## Local development

### Prerequisites

Install these tools locally:

- Hugo Extended
- Go
- Dart Sass
- Node.js / npm

On Windows, the original workflow used Chocolatey:

```powershell
choco install hugo-extended
choco install sass
```

If `go`, `hugo`, or `sass` are not found after installation, restart the terminal or IDE so the updated `PATH` is picked up.

### Run locally

From the repo root:

```powershell
npm run dev
```

This runs:

```powershell
hugo server --buildDrafts
```

The local server includes draft content.

### Production build

From the repo root:

```powershell
npm run build
```

This generates a production-oriented static build into `public/`.

## Repository map

These are the main locations you will touch during normal maintenance:

- `hugo.toml`: site-level branding, metadata, navigation, footer, search, and output overrides
- `config/_default/hugo.toml`: theme-oriented defaults and lower-level Hugo settings
- `config/_default/languages.toml`: multilingual defaults, including `contentDir`
- `content/english/blog`: blog posts
- `content/english/author`: author profile content
- `data/en`: homepage sections and structured content blocks
- `static/images`: public files copied directly to the output
- `assets/images`: image assets processed by Hugo/theme pipelines
- `themes/meghna-hugo`: checked-in local theme, layouts, CSS, and theme tooling

See `docs/repository-map.md` for the full "what file changes what" guide.

## Editing content

### Blog posts

Create or edit posts in `content/english/blog`.

Use the existing front matter shape:

```yaml
---
title: "Post title"
date: "2026-02-17T21:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/example.jpg"
description: "Short summary for list pages and metadata."
categories:
  - "Leadership"
tags:
  - "Management"
slug: "post-slug"
---
```

Detailed authoring guidance lives in `docs/content-authoring.md`.

### Homepage sections

Homepage blocks are not hard-coded in one file. They are mostly driven from `data/en/*.yml`.

Examples:

- `data/en/banner.yml`: hero copy and hero background
- `data/en/about.yml`: about cards
- `data/en/funfacts.yml`: counters
- `data/en/team.yml`: the current "Lets Talk" block

See `docs/homepage-content.md`.

## Theme boundary

This repo has two layers:

- root site: content, data, site-level configuration, public assets
- local theme: layouts, styling system, theme defaults, CSS tooling

Do not assume every visual change belongs in the root repo. Many presentation changes belong under `themes/meghna-hugo`.

Use `docs/theme-boundary.md` before editing layout or CSS.

## Build and publishing

- `npm run dev`: local dev server with drafts
- `npm run build`: production-style static build into `public/`
- `npm run test`: production environment server with watch mode and extra diagnostics

Build and publish details are documented in `docs/build-and-publish.md`.

## Known quirks

- Configuration is split between `hugo.toml` and `config/_default/*`. Do not change one blindly without checking the other.
- The root `package.json` still contains `project-setup` and `theme-setup` scripts, but this repo does not currently contain a `scripts/` directory. They are not part of the recommended workflow.
- Some content files currently show encoding issues. Save edits as UTF-8 and review rendered output after content changes.
- The theme has its own README and CSS quality tooling under `themes/meghna-hugo`.

## Documentation index

- `docs/repository-map.md`
- `docs/content-authoring.md`
- `docs/homepage-content.md`
- `docs/configuration-source-of-truth.md`
- `docs/theme-boundary.md`
- `docs/build-and-publish.md`
- `docs/troubleshooting.md`
- `docs/editorial-conventions.md`
