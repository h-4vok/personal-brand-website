# Configuration Source of Truth

This repo has configuration in more than one place. That is workable, but only if the ownership of each file is explicit.

## The short version

- `hugo.toml` is the primary site-level override file.
- `config/_default/*` holds theme-oriented defaults and lower-level Hugo configuration.
- If a setting appears in both places, treat the root `hugo.toml` as the intentional override unless you are deliberately re-baselining theme defaults.

## File responsibilities

### `hugo.toml`

Treat this as the source of truth for:

- `baseURL`
- theme selection
- site title and brand metadata
- author box details
- header and footer behavior
- search settings
- homepage profile/post settings
- social links
- analytics and SEO overrides
- menu definitions
- markup overrides
- pagination overrides
- related content tuning
- site outputs defined specifically for this site

This file reads like the site's identity layer and should be the first place checked for branding or behavior that is unique to `christianguzman.uk`.

### `config/_default/hugo.toml`

Treat this as the source of truth for:

- theme defaults inherited from `meghna-hugo`
- plugin asset declarations
- build caches and cachebusters
- imaging defaults
- lower-level Hugo defaults that support the theme
- multilingual defaults that came from the theme structure

It also contains some content and language settings, but those should be treated cautiously because the root `hugo.toml` already overrides several top-level concerns.

### `config/_default/languages.toml`

Treat this as the source of truth for:

- language definitions
- `contentDir`
- language weights
- language-specific labels such as `home` and `copyright`

Current effective intent:

- English is the active language
- content lives in `content/english`

## Current duplication to watch

These areas deserve extra care because they are easy to change in the wrong file:

- language definitions
- outputs
- site title/branding metadata
- params blocks
- pagination

## Recommended decision rule

When you need to change configuration, use this order:

1. Check `hugo.toml` first for an existing site-level override.
2. If the setting is not there, inspect `config/_default/hugo.toml` or `config/_default/languages.toml`.
3. If the setting is site-specific, prefer adding or changing it in `hugo.toml`.
4. If the setting is theme-default infrastructure, keep it in `config/_default/*`.

## Defaults chosen for this repo

Use these documentation defaults going forward:

- `hugo.toml` owns branding, SEO, global navigation, and site-specific behavior.
- `config/_default/*` preserves theme defaults unless there is a deliberate reason to override them.
- `config/_default/languages.toml` remains the canonical place for language and `contentDir` settings.

## Practical examples

### Change the site title or footer text

Edit `hugo.toml`.

### Change where English content is loaded from

Edit `config/_default/languages.toml` and verify related language settings in `config/_default/hugo.toml`.

### Change plugin assets or imaging defaults

Edit `config/_default/hugo.toml`.

### Change menus or social links

Edit `hugo.toml`.

## Rule to avoid confusion

Do not "clean up duplication" casually while making an unrelated change. First confirm which value is actually intended for production, then document that choice in the same commit if the split remains non-obvious.
