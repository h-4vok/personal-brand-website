# christianguzman.uk

Personal website built with **Hugo** and the `meghna-hugo` theme as a **git submodule**.

## What this repo does

- Defines website content (posts, data files, translations, config).
- Builds a static site into `public/`.
- Deploys on Netlify using `npm run build`.
- Keeps the theme isolated in `themes/meghna-hugo` so it can be updated independently.

## How it works

- Engine: Hugo (`hugo.toml`).
- Theme: git submodule at `themes/meghna-hugo`.
- Main content:
  - `content/english/` (posts and pages)
  - `data/en/` (home blocks and section data)
  - `i18n/` (theme translation strings)
- Custom styles:
  - `assets/` and `static/`
- Build output:
  - `public/`

## Requirements

- Hugo Extended (this project uses `0.150.0`).
- Node + npm (Node LTS 18+ recommended).
- Git (with submodule support).
- Go (only needed if you run Hugo Modules commands such as `update-modules`).

## Initial setup

```bash
git clone <repo-url>
cd personal-brand-website
git submodule update --init --recursive
npm install
```

Note: `npm install` runs `prepare`, which installs Husky hooks.

## Repository commands

### Development and build

```bash
npm run dev
npm run build
npm run test
```

- `dev`: local server with drafts enabled.
- `build`: production build with minification and cleanup.
- `test`: server with production-oriented flags and watch mode.

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

### CSS quality (Stylelint + Prettier)

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

Pre-commit runs `lint-staged` automatically on staged files in:

- `assets/**/*.{css,scss,sass}`
- `static/**/*.{css,scss,sass}`

Tasks executed:

- `stylelint --fix`
- `prettier --write`

## Deployment (Netlify)

- Configured in `netlify.toml`:
  - command: `npm run build`
  - publish: `public`
  - Hugo version: `0.150.0`

## Theme submodule notes

Initialize if missing:

```bash
git submodule update --init --recursive
```

Update the theme to the latest remote revision:

```bash
git submodule update --remote --merge themes/meghna-hugo
```

Then commit the updated submodule pointer in this repository.
