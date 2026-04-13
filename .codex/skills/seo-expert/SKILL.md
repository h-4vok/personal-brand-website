---
name: seo-expert
description: Optimize Hugo-based static sites for branded SEO, metadata quality, semantic URLs, and content discoverability. Use when Codex needs to audit or improve `layouts/`, frontmatter in `content/**/*.md`, canonical tags, OpenGraph/Twitter metadata, title patterns, descriptions, keywords, or slug strategy for a personal brand site focused on Christian Guzman, Engineering Leadership, Coaching, Human Systems Architecture, Fractional CTO work, and technical mentoring.
---

# SEO Expert

## Overview

Audit and improve Hugo SEO end to end. Favor changes that strengthen the "Christian Guzman" personal brand while increasing relevance for niche service keywords such as Engineering Leadership Coaching, Technical Debt Consulting, Fractional CTO, Engineering Mentor, Coaching, and Human Systems Architecture.

Work directly in the repo. Inspect templates before editing content, and prefer site-wide fixes in layouts when the same issue would otherwise need to be repeated in many Markdown files.

Read `references/brand-keyword-map.md` when choosing keywords, rewriting titles, or deciding which service intent a page should target.

Read `references/schema-org-patterns.md` when adding or auditing structured data in Hugo templates.

## Audit Workflow

1. Inspect `layouts/partials/head.html` first.
2. Confirm how titles, descriptions, canonical links, OpenGraph tags, and Twitter cards are generated.
3. Review `hugo.toml` for SEO-critical site settings.
4. Run the Lighthouse loop and collect evidence before proposing changes.
5. Audit Markdown files under `content/` for frontmatter quality.
6. Review slugs from filenames and any `url` params.
7. Apply the smallest set of edits that improves consistency site-wide.
8. Re-run assertions and Lighthouse after edits.
9. Summarize SEO gains, unresolved gaps, and suggested follow-up opportunities.

## Lighthouse Workflow (Repo-native)

Use Lighthouse as an input to prioritize and validate SEO/performance fixes.

Primary commands:

- `npm run hugo:build`
- `npm run audit`
- `npm run audit:report`

Report locations:

- Local multi-page audit JSONs: `.lighthouseci/local/home.json`, `.lighthouseci/local/articles.json`, `.lighthouseci/local/engineering-leadership-coaching.json`
- Production report JSON: `seo-report.json`

How to use reports:

- Prioritize high-impact SEO/performance audits that map directly to editable templates/content.
- Cross-check Lighthouse findings with `head.html`, frontmatter, and rendered output before changing code.
- Treat Lighthouse as a guide, not a source of truth when a recommendation conflicts with business intent or accurate content representation.
- Always verify improvements by re-running `npm run audit` (and `npm run audit:report` when production-facing).

Windows runtime note:

- The repo includes safeguards for known Windows cleanup errors (`EPERM`) from Lighthouse/Chrome launcher.
- If report JSON is generated, treat the run as valid input even when Lighthouse exits non-zero due to cleanup.

## Metadata Rules

- Set the page title dynamically as `{{ .Title }} | {{ .Site.Title }}`.
- If a page-level description is missing, derive a fallback from the first 150 characters of rendered content with HTML stripped.
- Ensure OpenGraph metadata is populated at minimum for `og:title`, `og:description`, `og:type`, `og:url`, and a suitable image when the site supports one.
- Ensure Twitter card metadata is populated at minimum for `twitter:card`, `twitter:title`, `twitter:description`, and an image when available.
- Prefer reusable Hugo logic over copy-pasted page-specific hacks.

## Structured Data Rules

- Audit whether the site emits `schema.org` structured data, usually as JSON-LD in the document head or near the page footer.
- Prefer JSON-LD over microdata unless the site already has an established pattern.
- Add structured data only when the content supports it accurately.
- Favor reusable Hugo partials for schema output.
- Use `Person` for brand-defining pages about Christian Guzman.
- Use `WebSite` for site-level search and identity signals when appropriate.
- Use `BlogPosting` or `Article` for editorial content such as blog posts.
- Use a service-oriented type when a page clearly represents coaching, mentoring, consulting, or fractional CTO offerings.
- Keep schema fields aligned with visible page content. Do not add claims, ratings, FAQs, or organization details that the page does not actually support.
- If the site lacks stable data inputs for schema, note that as a follow-up rather than inventing placeholders.

## Hugo Config Rules

- Inspect `hugo.toml` before concluding the audit.
- Confirm `baseURL` is set correctly for the production domain.
- Check whether sitemap output is enabled and aligned with the site's canonical domain strategy.
- Review taxonomies, output formats, and permalink settings for SEO side effects.
- Flag any config that could create duplicate URLs, broken canonicals, or inconsistent production metadata.

## Frontmatter Rules

- Audit every `.md` file in `content/`.
- Ensure each page has a meaningful `keywords` array.
- Rewrite vague titles such as `Home`, `About`, or `New` into descriptive branded titles when appropriate.
- Prefer title patterns like `Christian Guzman | Engineering Leadership Coaching` or `Topic | Christian Guzman`.
- Use and adapt these focus keywords where relevant:
  - `Engineering Leadership Coaching`
  - `Technical Debt Consulting`
  - `Fractional CTO`
  - `Engineering Mentor`
  - `Human Systems Architecture`
  - `Coaching`
- Do not force the same keywords onto every page. Keep keywords aligned with the actual page topic.
- Preserve tone and meaning; improve discoverability without turning copy into spam.

## Slug And URL Rules

- Prefer lowercase, hyphen-separated, keyword-rich slugs.
- Check both filenames and explicit `url` frontmatter.
- Replace generic slugs with descriptive ones when the content supports it.
- Favor slugs that match search intent, for example `/engineering-leadership-coaching-session/` over `/strategy-session/`.
- Avoid changing URLs blindly on established pages unless redirects are also handled elsewhere in the site.

## Canonical Rules

- Ensure every page outputs a canonical link:
  - `<link rel="canonical" href="{{ .Permalink }}">`
- If the site already has a canonical helper or base template abstraction, reuse it rather than duplicating tags.
- Watch for list pages, multilingual variants, and custom output formats that may need different handling.

## Content Heuristics

- Keep descriptions human and specific. Write for both ranking and click-through.
- Prefer service-led phrasing over generic inspirational language when editing SEO-critical pages.
- Strengthen internal consistency around the Christian Guzman brand across home, manifesto, blog, service, and about pages.
- If a page targets a service keyword, make sure the title, description, slug, and keywords support the same intent.
- If a page is primarily narrative or editorial, optimize lightly and avoid over-commercializing it.

## Preferred Output

- Report findings grouped by:
  - template-level fixes
  - content/frontmatter fixes
  - URL or canonical risks
  - structured data opportunities or gaps
- Include Lighthouse-backed findings as a separate block:
  - failing or warning categories
  - impacted URLs
  - concrete fix path in repo
- When making edits, explain which pages were changed and which keyword intent each page now supports.
- Offer a short list of next SEO improvements after completing the requested work. Good examples include schema markup, sitemap refinement, image alt-text audits, internal linking, and redirect planning for slug changes.
