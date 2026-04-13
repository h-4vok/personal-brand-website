# SEO Content Normalization - Issue #22

## Scope Completed

- Audited all Markdown pages under `content/`.
- Normalized frontmatter SEO fields across all pages.
- Removed editorial placeholders that could leak into publication workflows.

## Inventory Results

- Total `.md` files in `content/`: 12
- Pages missing `keywords` before changes: 11
- Pages missing `keywords` after changes: 0
- Placeholder terms found (`lorem ipsum`, `new-temp`) after changes: 0

## Frontmatter Updates Applied

### Brand-Critical Pages

- `content/english/author/christian-guzman.md`
  - Updated title to branded SEO form.
  - Added `description` and `keywords`.
  - Updated GitHub social link to the real profile.

- `content/english/manifesto.md`
  - Added `keywords` aligned with manifesto intent and brand narrative.

- `content/english/blog/_index.md`
  - Added listing `description` and `keywords` for `/articles/`.

### Blog Articles

Added `keywords` arrays to all posts lacking them:

- `content/english/blog/2025-08-03--brilliant-jerk-hidden-tax.md`
- `content/english/blog/2025-08-24-hero-culture-is-a-bug-not-a-feature.md`
- `content/english/blog/2025-09-13-leaders-forced-to-break-moral-code.md`
- `content/english/blog/2025-09-21--the-politics-of-tech-debt.md`
- `content/english/blog/2025-10-05--your-words-your-authority.md`
- `content/english/blog/2025-12-28--vendor-selection-horror-story.md`
- `content/english/blog/2026-02-17--bring-your-own-solution.md`
- `content/english/blog/2026-03-31--new.md`

### Placeholder Cleanup

- `content/english/blog/2026-03-31--new.md`
  - Replaced `description: "lorem ipsum"` with a meaningful draft description.
  - Kept draft status intact.

## Editorial/SEO Rules Applied

- One primary intent per page, with 2-5 supporting keywords when natural.
- Keywords aligned to page topic, not repeated blindly across all pages.
- Kept narrative tone intact; avoided keyword stuffing.
- Prioritized brand/service vocabulary where relevant:
  - Engineering Leadership Coaching
  - Fractional CTO
  - Technical Debt Consulting
  - Engineering Mentor
  - Human Systems Architecture
  - Christian Guzman

## Validation

- `npm run build` passed.
- `npm run test:seo:assert` passed (`50/50`).
- Lint diagnostics on edited content returned no issues.
