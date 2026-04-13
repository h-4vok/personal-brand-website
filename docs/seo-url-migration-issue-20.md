# SEO URL Migration - Issue #20

## Scope

- Canonical blog route stays on `/articles/`.
- Commercial landing moves from `/strategy-session/` to `/engineering-leadership-coaching/`.
- Public URL changes ship only with equivalent redirects.

## URL Inventory and Prioritization

High impact:

- `/strategy-session/` -> `/engineering-leadership-coaching/` (service page with commercial intent).
- Main navigation blog route alignment to `/articles/`.

Medium impact:

- Existing blog post slugs that could be more query-aligned, for future iteration:
  - `/articles/the-ethical-crucible/`
  - `/articles/bring-me-problems-not-just-solutions/`

Low impact:

- Draft-only slug improved for future publish readiness:
  - `content/english/blog/2026-03-31--new.md` slug `new-temp` -> `leadership-systems-manifesto-teaser`.

## Redirect Strategy

Implemented in Netlify as permanent redirects (`301`):

- `/strategy-session/` -> `/engineering-leadership-coaching/`
- `/strategy-session` -> `/engineering-leadership-coaching/`
- `/posts/*` -> `/articles/:splat`

Hugo alias fallback:

- `content/english/strategy-session/index.md` includes:
  - `url = "/engineering-leadership-coaching/"`
  - `aliases = ["/strategy-session/"]`

## Routes Kept vs Changed

Kept:

- `/articles/` remains the canonical listing route.
- Existing article permalink pattern remains `/articles/:slug/`.

Changed:

- Service landing public URL changed to `/engineering-leadership-coaching/` to better match search intent.
- Legacy `/posts/*` route now permanently redirected to `/articles/*` for consistency and link equity retention.

## Validation Checklist

- Canonical uses `.Permalink` in `layouts/partials/head.html`.
- `og:url` uses `.Permalink` in `layouts/partials/head.html`.
- Main nav/footer/internal CTA links updated to new service URL.
- Redirect coverage added before publishing URL changes.

## Follow-up Opportunities

- Add a dedicated redirect/assertion test that verifies required `301` rules in `netlify.toml`.
- Plan second-pass optimization for medium-priority article slugs with one-by-one aliases.
- Run Search Console checks after deploy for coverage, redirect indexing, and soft-404 signals.
