# Theme Boundary

This repo includes the theme at `themes/meghna-hugo` as a git submodule. That is convenient, but it also makes it easy to edit the wrong layer or forget that the theme has its own Git history.

Use this rule first:

- change content and site metadata in the repo root
- change layout and shared presentation in the theme

## What belongs in the repo root

Edit the root project when you are changing:

- blog post content
- author information
- homepage section data in `data/en/*.yml`
- site-level metadata and menu definitions
- public images under `static/`
- site-specific configuration in `hugo.toml`

Typical root-owned paths:

- `content/english/blog`
- `content/english/author`
- `data/en`
- `static/images`
- `hugo.toml`

## What belongs in `themes/meghna-hugo`

Edit the theme when you are changing:

- section markup
- HTML layout structure
- partials
- CSS behavior
- theme-owned assets
- theme-level build or lint tooling

Typical theme-owned paths:

- `themes/meghna-hugo/layouts`
- `themes/meghna-hugo/assets/css`
- `themes/meghna-hugo/static`
- `themes/meghna-hugo/package.json`
- `themes/meghna-hugo/README.md`

## When a change may need both layers

Some changes naturally cross the boundary:

- new homepage block:
  - root: section data
  - theme: layout/markup/CSS
- new visual treatment for an existing section:
  - root: maybe different copy or images
  - theme: template and styling changes
- new author/contact pattern:
  - root: content and links
  - theme: section structure or classes

## Updating the theme safely

Because the theme is attached as a submodule, treat it as a customized dependency with its own lifecycle, not a disposable folder.

Before changing it:

- check whether the change is really theme-wide or just site content
- read `themes/meghna-hugo/README.md` for theme-specific workflow
- if touching CSS, use the theme's own lint/format scripts where relevant

When syncing with upstream or another source of the theme:

- compare layouts and CSS carefully
- assume local customizations matter
- avoid overwriting theme files blindly

## CSS ownership

The theme currently contains:

- `themes/meghna-hugo/assets/css/style.css`
- `themes/meghna-hugo/assets/css/custom.css`

If a visual fix is not achievable through content or data alone, the theme CSS is the next place to inspect.

## Decision rule

Ask this before editing:

"Am I changing what the site says, or how the theme renders it?"

- what the site says -> root repo
- how the theme renders it -> `themes/meghna-hugo`
