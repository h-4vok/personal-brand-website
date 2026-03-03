# Editorial Conventions

These conventions are here to keep the site coherent and predictable during normal maintenance.

## Language

- Primary site language is currently English.
- Keep repo documentation and site content consistent unless there is a deliberate multilingual decision.

## Tone

The site voice is:

- direct
- reflective
- leadership-oriented
- focused on engineering, teams, and human systems

Prefer copy that sounds like a practiced operator, not generic marketing filler.

## Descriptions

For post `description` fields:

- keep them short
- aim for one sentence
- make them useful on cards, metadata, and previews

Avoid repeating the title verbatim.

## Categories vs tags

Use:

- categories for a small number of broad themes
- tags for specific concepts or lenses

Good category behavior:

- 1 or 2 per article
- reused across posts

Good tag behavior:

- 2 to 5 per article
- specific enough to support discovery and related content

## File naming

For blog posts:

- use `YYYY-MM-DD--slug.md` when possible
- keep the slug lowercase and hyphenated

For images:

- use lowercase kebab-case file names
- keep blog article images under `assets/images/blog/article`
- choose names that match the article topic rather than random stock naming

## Drafts, future posts, and date-sensitive content

Be explicit with dates. The current build includes future and expired content, so date alone is not a safe publishing guardrail in this repo.

Before shipping:

- verify whether any future-dated or expired content is still being included
- confirm the visible blog ordering is intentional

## Editing existing content

- preserve the current structure of front matter unless there is a reason to standardize it in code later
- when reusing old copy, clean encoding artifacts before publishing
- preview locally after changing smart quotes, apostrophes, or special symbols

## `OLD_HIGHLIGHTS.MD`

Treat `OLD_HIGHLIGHTS.MD` as archival/reference material, not as an active content source for the site.

If content is reused from it:

- rewrite it into the current tone
- fix encoding issues
- move the final copy into the real content or data files
