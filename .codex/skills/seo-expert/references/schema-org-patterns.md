# Schema.org Patterns For Hugo

Use this file when adding or auditing structured data for the site.

## Purpose

Structured data helps search engines interpret what a page is, who it is about, and how it relates to the broader site. It complements metadata and on-page copy; it does not replace them.

Prefer JSON-LD emitted from Hugo templates or partials.

## Recommended Types

### `Person`

Use on pages whose main subject is Christian Guzman.

Common fields:

- `@context`
- `@type`
- `name`
- `url`
- `image`
- `jobTitle`
- `sameAs`
- `description`

Typical fit:

- home page
- about page
- manifesto page when strongly brand-defining

### `WebSite`

Use once at the site level when the goal is to describe the website itself.

Common fields:

- `@context`
- `@type`
- `name`
- `url`
- `description`

Typical fit:

- base template
- shared head partial

### `BlogPosting` or `Article`

Use for blog content with a clear title, publication date, author, and description.

Common fields:

- `@context`
- `@type`
- `headline`
- `description`
- `datePublished`
- `dateModified`
- `author`
- `mainEntityOfPage`
- `image`

Typical fit:

- `content/**/blog/*.md`
- single-post template

### Service-Oriented Pages

When a page clearly sells or describes a service, use an appropriate service-oriented type supported by the page content and site structure.

Typical fit:

- coaching page
- mentoring page
- consulting page
- fractional CTO offering

Rule:

- Only add service schema when the page clearly explains the offer.
- Do not invent pricing, reviews, or FAQs that are not present on the page.

## Hugo Implementation Guidance

- Prefer a partial such as `layouts/partials/schema.html`.
- Pull values from frontmatter first, then fall back to site params where appropriate.
- Keep schema consistent with visible text, metadata, and canonicals.
- Emit only the schema blocks relevant to the current page type.

## Validation Rules

- Make sure every schema field is truthful and supported by page content.
- Prefer fewer accurate fields over many speculative ones.
- If a needed value is missing, omit the field or note the gap in the audit.
