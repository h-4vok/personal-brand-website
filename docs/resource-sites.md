# Resources and AI Skills

## Purpose and context

**Resources** is Christian Guzman's collection of practical guides to AI skills, plugins, developer tools and related tutorials. It explains what a resource does, how to use it, and when it may help. Listing a resource does not imply that Christian created or owns it.

**AI Skills** is the current collection shown in the Resources index. The index remains part of the Christian Guzman site, with its normal navigation, footer and visual theme. Each card opens a product-specific page at `/resources/<slug>/`. That page works as a small subsitio: its own visual direction, typography, navigation and footer, plus a clear path back to the main site. Its style should be recognizably different from the main site and from other resource pages.

The resource creator and the author of Christian's guide are separate facts. Keep that distinction in page copy, metadata and structured data. The collection can include third-party tools as well as resources authored by Christian; describe ownership accurately.

## Architecture and conventions

1. **Scope and resource types.** Use this system for an AI skill, plugin, developer tool or tutorial that benefits from a focused guide and standalone landing page. The term *resource* is the umbrella; do not assume every entry is an AI skill or open source. The blog and homepage remain separate content types.

2. **Content model and routes.** The section index lives at `content/english/resources/_index.md`, producing `/resources/`. Each resource gets `content/english/resources/<slug>/index.md`, producing `/resources/<slug>/`. Use lowercase, descriptive, hyphen-separated slugs. Avoid placeholder cards and do not change an established URL without considering redirects.

3. **Resource metadata.** Provide a specific `title`, `description`, `keywords`, `author`, social `image`, and `image_alt`; set `resource_style` to the matching page stylesheet. The `[resource]` data should identify `name`, `kind`, `creator`, and official `url`; add `creator_url`, `repository` and `license` when verified and relevant. `author` describes the guide; `resource.creator` describes the product. Do not fill unknown fields with guesses.

4. **Hugo layouts.** `layouts/resources/baseof.html` selects the main-site shell for the section index and the isolated resource shell for individual pages. `layouts/resources/list.html` renders the card collection. Use a page-specific layout such as `layouts/resources/<slug>/single.html` for a bespoke landing. Reuse shared Hugo head and SEO handling instead of copying metadata tags into each layout.

5. **Index identity.** `/resources/` belongs to Christian Guzman's main site. It uses the site's regular navigation, footer, scripts, fonts and stylesheet bundle; the main `AI Skills` navigation item points here. Cards should be populated from resource metadata and link to their own landing. Do not apply a resource's dark/custom theme to this index.

6. **Independent page design.** Every resource detail page needs a distinct art direction, page-specific navigation and footer, and its own layout/CSS. A resource landing can share necessary data and small design primitives, but must not become a reskin of the main site or reuse another product's full visual system. Include a clear “Back to Home” route to the main site. Page-specific CSS belongs in `assets/css/resources/<style>.css` and should be loaded as its own fingerprinted bundle.

7. **CSS and shared tokens.** Resource detail pages deliberately skip the main theme and main-site custom stylesheet bundle. `assets/css/resources/tokens.css` holds tokens shared among resource pages; `assets/css/custom/00-fonts.css` provides the font-face declarations. Share only the variables, fonts or other primitives that are useful and safe. Do not import global CSS with unrelated selectors or side effects just to reuse a color or font. Scope selectors to the resource page. The section index is not part of this isolated CSS system.

8. **SEO and product attribution.** For each resource, write a search-specific title and description; select a human-readable slug; use accurate keywords, canonical URL, Open Graph/Twitter image and alt text; and add structured data only when the page and verified metadata support it. The current `layouts/partials/resource-schema.html` models the guide as a `WebPage` about a `CreativeWork`, with separate creator and guide author. Do not add fake prices, ratings, reviews, feature claims or schema fields to chase rich results. Technical SEO helps discovery but cannot guarantee ranking or a rich result.

9. **Sources, images and experience.** Use official product documentation/repositories for current facts, attribution, license, install instructions and claims. Link to sources near relevant guidance; distinguish paraphrase from the original. Create or commission original hero/social imagery, set useful alt text, and keep social previews legible at common sharing dimensions. Preserve semantic headings, keyboard navigation, visible focus, contrast, reduced-motion support and responsive layouts. The site is English-only unless localization is requested.

10. **Creation and maintenance workflow.** Inspect the current branch/worktree, section content, templates, `head.html`, resource schema, menu, fonts, CSS and build conventions before editing. Confirm the resource's audience, search intent, creator and requested style; ask only for material gaps. Add the content, product-specific layout/style/assets and index card; then build and inspect the generated SEO HTML and rendered desktop/mobile pages. Check internal links, image loading, attribution, stylesheet isolation and keyboard use. Follow current repository instructions for any additional checks; do not commit or publish unless asked.

## Current implementation notes

- Clarity is the first individual resource landing and design example; its layout and style are not a template to duplicate visually.
- The index currently has a hard-coded `AI Skill · Open Source` card label in `layouts/resources/list.html`. Before adding a plugin, closed-source product or tutorial, make the card type/status reflect the new resource's verified `kind` instead of reusing that label.
- The shared resource stylesheet selector in `layouts/partials/head.html` uses each page's `resource_style`. Add a matching CSS file for every new style value.
- The current section index uses the main site bundle; resource detail pages use the isolated resource bundle. Preserve that boundary when updating templates or metadata handling.

## Draft lifecycle

The project-local `resource-skill-construct` skill adds `draft = true` to each new resource page. Clarity is also `draft = true`: it is a test page and design archetype, not a published resource. Set `draft = false` only when publication is intentional. Hugo excludes draft pages from normal builds and page collections, so their route and Resources card stay out of production.

Only `npm run dev` passes `--buildDrafts`, so draft pages and cards appear during local design. `npm run test`, production build commands, and Netlify deploy contexts omit that flag. Production build commands use `--cleanDestinationDir` to remove old output if a previously published route becomes a draft; otherwise Hugo may leave stale files in `public/`.

Store resource images in `assets/images/resources/<slug>/` and emit them through Hugo Pipes. Hugo copies files in `static/` independently of page draft state, so draft assets there could remain directly accessible. Assets in the pipeline are emitted only when a rendered page or visible card references them. See Hugo's [draft behavior](https://gohugo.io/methods/page/draft/) and [build workflow](https://gohugo.io/getting-started/usage/#draft-future-and-expired-content).
