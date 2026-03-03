# christianguzman.uk

Personal website built with Hugo and the `meghna-hugo` theme as a git submodule.

This repository contains:

- site-level configuration in the repository root
- editorial content in Markdown and YAML
- a theme dependency at `themes/meghna-hugo`
- deployment config for Netlify

The goal of this documentation is operational: make it easy to update content, homepage sections, styling, theme integration, and production builds without reverse-engineering the repo every time.

## Overview

- Static site generator: Hugo
- Theme: `themes/meghna-hugo` git submodule
- Main content:
  - `content/english/blog`
  - `content/english/author`
  - `data/en/*.yml`
  - `i18n/`
- Main config:
  - site-level overrides in `hugo.toml`
  - theme defaults and multilingual defaults in `config/_default/*.toml`
- Build output: `public/`
- Deploy target: Netlify via `netlify.toml`

Use this README as the entry point, then jump to the focused docs in `docs/`.

## Requirements

- Hugo Extended
- Node.js / npm
- Git with submodule support
- Go if you run Hugo Modules commands such as `update-modules`
- Dart Sass may still be useful locally depending on theme workflow

The remote config pins Hugo `0.150.0` in Netlify.

On Windows, the original local setup used Chocolatey:

```powershell
choco install hugo-extended
choco install sass
```

If `go`, `hugo`, or `sass` are not found after installation, restart the terminal or IDE so the updated `PATH` is picked up.

## Initial setup

Recommended clone flow:

```bash
git clone --recurse-submodules <repo-url>
cd personal-brand-website
npm install
```

If the repo is already cloned without submodules:

```bash
git submodule update --init --recursive
npm install
```

Quick checks:

```bash
hugo version
node -v
npm -v
```

`npm install` runs `prepare`, which installs Husky hooks.

## Repository commands

### Development and build

```bash
npm run dev
npm run build
npm run test
```

- `dev`: local server with drafts enabled
- `build`: production-style build into `public/`
- `test`: production-oriented server with watch mode and extra diagnostics

### Theme / example commands

```bash
npm run dev:example
npm run build:example
npm run test:example
```

### Modules and utility setup

```bash
npm run update-modules
npm run project-setup
npm run theme-setup
```

Note: the root `package.json` still exposes `project-setup` and `theme-setup`, but this repo currently does not contain a root `scripts/` directory. Treat those commands as non-operational until they are restored or removed.

### CSS quality

```bash
npm run lint:css
npm run lint:css:fix
npm run format:check
npm run format
```

### Pre-commit hooks

```bash
npm run prepare
```

Pre-commit runs `lint-staged` automatically on staged CSS/Sass files.

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
- `themes/meghna-hugo`: theme submodule, layouts, CSS, and theme tooling

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

Homepage blocks are mostly driven from `data/en/*.yml`.

Examples:

- `data/en/banner.yml`: hero copy and hero background
- `data/en/about.yml`: about cards
- `data/en/funfacts.yml`: counters
- `data/en/team.yml`: the current "Lets Talk" block

See `docs/homepage-content.md`.

## Theme boundary

This repo has two layers:

- root site: content, data, site-level configuration, public assets
- theme submodule: layouts, styling system, theme defaults, CSS tooling

Do not assume every visual change belongs in the root repo. Many presentation changes belong under `themes/meghna-hugo`.

Use `docs/theme-boundary.md` before editing layout or CSS.

## Build and publishing

- Local build command: `npm run build`
- Publish directory: `public/`
- Netlify configuration lives in `netlify.toml`

Netlify currently uses:

- command: `npm run build`
- publish directory: `public`
- Hugo version: `0.150.0`

Build and publish details are documented in `docs/build-and-publish.md`.

## Cache busting and deploy behavior

The remote setup introduces a two-layer cache strategy:

- fingerprinted Hugo pipeline assets in theme partials
- versioned local plugin assets with a deploy-time query param

Netlify headers are configured so:

- HTML is revalidated
- static assets under `/css`, `/js`, `/images`, and `/plugins` are long-lived

If a deploy seems stale, review `netlify.toml` and the theme partials that fingerprint CSS/JS assets.

## Theme submodule notes

Initialize if missing:

```bash
git submodule update --init --recursive
```

Sync submodules after pulling:

```bash
git pull
git submodule update --init --recursive
```

Update the theme pointer from its remote:

```bash
git submodule update --remote --merge themes/meghna-hugo
```

Then commit the updated submodule pointer in this repository.

If you edit files inside `themes/meghna-hugo`, remember there are two Git histories involved: the theme repo and this site repo.

## Known quirks

- Configuration is split between `hugo.toml` and `config/_default/*`. Do not change one blindly without checking the other.
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
