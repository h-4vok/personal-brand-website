# Content Authoring

This repo uses Markdown posts under `content/english/blog`. The current workflow is closer to "copy an existing successful post shape" than "use Hugo defaults", so document the actual pattern and stick to it.

## Where posts live

- Folder: `content/english/blog`
- Naming pattern in current repo: `YYYY-MM-DD--slug.md` or `YYYY-MM-DD-slug.md`

Recommendation:

- keep the date prefix in the filename
- use lowercase kebab-case after the date
- prefer the double-dash pattern already used by most posts

Example:

```text
2026-03-01--example-post-title.md
```

## Front matter template

Use this as the default post template:

```yaml
---
title: "Example Title"
date: "2026-03-01T09:00:00Z"
author: "Christian Guzman"
image: "images/blog/article/example-image.jpg"
description: "One-sentence summary used for cards, metadata, and previews."
categories:
  - "Leadership"
tags:
  - "Management"
  - "Team Dynamics"
slug: "example-post-title"
---
```

## Field meanings

- `title`: reader-facing article title
- `date`: publication date and time in ISO format; Hugo uses this for ordering and publish timing
- `author`: current posts use `Christian Guzman`
- `image`: path used by the theme for article visuals
- `description`: short summary for previews and metadata
- `categories`: broad buckets; current posts use a small set of high-level labels
- `tags`: narrower descriptors for discovery and related content
- `slug`: final URL segment

## Image location

Current posts reference images like:

```text
images/blog/article/bring-me-solutions.jpg
```

The matching source files currently live in:

```text
assets/images/blog/article/
```

Use that folder for new article images unless you intentionally need a different asset path.

## Categories and tags

Use categories sparingly. In this repo, they work best as broad themes such as:

- `Leadership`
- `Human Systems`

Use tags for narrower ideas such as:

- `Management`
- `Team Dynamics`
- `Autonomy`
- `Mentorship`

Rule of thumb:

- categories = 1 or 2 broad buckets
- tags = 2 to 5 specific concepts

## Example based on an existing post

The post `2026-02-17--bring-your-own-solution.md` is a good reference for the current structure:

- strong title and concise description
- one feature image
- a small category set
- several specific tags
- a URL slug that is cleaner than the filename

When creating a new article, mirror that structure rather than using `hugo new` defaults blindly.

## Validation workflow

1. Add or edit the Markdown file in `content/english/blog`.
2. Add the matching image under `assets/images/blog/article` if needed.
3. Run `npm run dev`.
4. Open the post locally and verify:
   - title renders correctly
   - hero/cover image resolves
   - description looks reasonable in list pages
   - tags and categories are correct
   - slug is the one you expect

If the post should simulate production behavior, also run:

```powershell
npm run build
```

## Pre-publish checklist

- Filename follows the repo naming convention.
- `date` is correct and intentional.
- `slug` is final.
- `description` is short and clear.
- Image exists and matches the front matter path.
- Categories are broad and limited.
- Tags are specific and useful.
- The post renders correctly in local preview.
- The post list page still looks balanced after adding the new item.
