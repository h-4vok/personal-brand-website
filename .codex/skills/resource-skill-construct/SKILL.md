---
name: resource-skill-construct
description: Build or extend an independent Hugo landing page for an AI skill, plugin, developer tool, or tutorial in this repository's Resources section. Use when the user asks to create a resource site or product-specific landing under /resources/; not for ordinary blog posts or changes to the main homepage.
---

# Resource Skill Construct

Create a useful, source-backed resource page in this Hugo site. The Resources index belongs to Christian Guzman's main site; each individual resource landing gets its own visual identity and navigation.

## Before editing

1. Read [`docs/resource-sites.md`](../../../docs/resource-sites.md) as the implementation contract.
2. Inspect the relevant content, layouts, CSS, menu and current worktree. Preserve unrelated edits and work on the branch already selected for the task.
3. Identify the resource type, official source, creator, intended reader, search intent and requested visual direction. Verify changeable product facts against official sources. Verify any official repository or install URL before linking it. If a needed destination is missing or ambiguous, ask the user; do not guess or render an empty link. Do not invent features, authorship, license, results or claims.
4. Ask only for missing information that materially changes the page. Make reversible editorial and implementation choices with the context available.

## Build

- Set `draft = true` in each new resource page's front matter by default. Set `draft = false` only when the user explicitly asks to publish.
- Store resource imagery in `assets/images/resources/<slug>/` and publish it through Hugo Pipes. Never put draft-resource assets in `static/`, which is copied independently of page draft state.
- Add a real resource entry under `content/english/resources/<slug>/`; do not add placeholder cards or imply Christian created a third-party product.
- Keep `/resources/` in the Christian Guzman site identity and main theme. A resource detail page at `/resources/<slug>/` must have a distinct design, typography, navigation, footer and CSS from the main theme and from other resource landings.
- Reuse the Hugo resource shell and head/SEO infrastructure where suitable. Add only the page-specific layout and stylesheet needed. Shared resource tokens and font declarations are available; do not import the main theme stylesheet into a resource detail page.
- Give each landing its own navigation and a clear route back to the main site. Keep the main site's `AI Skills` menu pointed at `/resources/`.
- Write for the product's actual search intent: page title, specific description, relevant keywords, canonical URL, social image and alt text, and structured data supported by visible content. Separate product creator from guide author. Never promise ranking or fabricate ratings/reviews.
- Check official setup instructions for runtime and tool prerequisites. State what the user must provide or install versus what the product setup can install or configure; ask when responsibility or scope is unclear.
- Create or source original page imagery. Keep social-preview images legible at sharing sizes and provide meaningful alt text for informative images; use empty alt for purely decorative images.
- Preserve accessibility and responsive behavior: semantic headings, keyboard-visible focus, contrast, reduced-motion support, and a usable mobile layout.
- This site is currently English-only. Do not add localization files or translated variants unless requested.

## Verify and report

- Confirm draft cards/routes are absent from the production build and present through `npm run dev`, which enables `--buildDrafts`.
- Build the site and inspect generated HTML for the intended route, title, description, canonical, social image, schema and stylesheet. Confirm the main Resources index uses the main theme and the detail page does not load main theme CSS.
- Review the rendered index and landing on desktop and mobile, and check navigation, internal/external links, image loading and keyboard access. Run additional repository checks when requested or required by repository instructions.
- Summarize the route, design separation, SEO/attribution decisions, checks performed and any unverified production behavior. Do not commit or publish unless asked.
