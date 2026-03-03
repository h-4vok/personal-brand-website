# Repository Map

Use this file when the question is "what file should I edit for this change?"

## Content and structure

| Change you want | Primary location | Notes |
| --- | --- | --- |
| Add or edit a blog post | `content/english/blog` | Markdown content plus front matter |
| Edit the author profile | `content/english/author/christian-guzman.md` | Author name, social links, tagline |
| Change homepage hero | `data/en/banner.yml` | Main headline, short copy, hero image |
| Change about cards | `data/en/about.yml` | Three-card intro section |
| Change counters / metrics | `data/en/funfacts.yml` | Uses Themify icons and count values |
| Change the "Lets Talk" section | `data/en/team.yml` | This repo uses the theme's team section as a contact/profile block |
| Change other homepage sections | `data/en/*.yml` | Most homepage blocks are data-driven |

## Configuration

| Concern | Primary location | Notes |
| --- | --- | --- |
| Branding, title, footer, search, menus, social links | `hugo.toml` | Treat this as the main site-level override file |
| Theme defaults, cache, plugins, base multilingual defaults | `config/_default/hugo.toml` | Keep aligned with theme behavior unless deliberately overridden |
| Language definitions and `contentDir` | `config/_default/languages.toml` | Current site content points to `content/english` |
| Hugo module settings | `config/_default/module.toml` | Rarely needed during normal content maintenance |

## Styling and layout

| Change you want | Primary location | Notes |
| --- | --- | --- |
| Layout or section markup | `themes/meghna-hugo/layouts` | Theme-owned HTML templates |
| Theme CSS or visual overrides | `themes/meghna-hugo/assets/css` | Includes `style.css` and `custom.css` |
| Theme static assets | `themes/meghna-hugo/static` | Plugins and theme-level public assets |

## Images and media

| Asset type | Primary location | Notes |
| --- | --- | --- |
| Public images copied as-is | `static/images` | Best for direct public paths such as avatars and icons |
| Hugo/theme processed images | `assets/images` | Used by theme sections and Hugo asset pipeline |
| Blog article images | `assets/images/blog/article` | Referenced from post front matter as `images/blog/article/...` |
| Misc working assets | `misc` | Reference material, not part of normal site rendering |

## Operational files

| File | Purpose |
| --- | --- |
| `package.json` | Root site scripts for serving and building |
| `README.md` | Main operational entry point |
| `OLD_HIGHLIGHTS.MD` | Archive/reference material, not an active content source |
| `public/` | Generated output after a build |
| `resources/` | Hugo-generated cache and processed artifacts |

## Fast rules

- If you are changing copy or structured content, start in the repo root, not the theme.
- If you are changing markup, classes, or CSS behavior, inspect `themes/meghna-hugo` first.
- If a setting seems duplicated, check both `hugo.toml` and `config/_default/*` before deciding where to edit it.
