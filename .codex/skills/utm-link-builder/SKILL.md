---
name: utm-link-builder
description: Generate production article URLs with UTM parameters for christianguzman.uk when the user explicitly asks for the `utm-link-builder` skill or explicitly asks to build a LinkedIn UTM link from an article slug.
---

Generate exactly one final URL and nothing else.

Input:
- Expect a single article slug.

Build the URL as:
- Base: `https://christianguzman.uk/articles/{slug}/`
- `utm_source=linkedin`
- `utm_medium=social`
- `utm_campaign={slug}`
- `utm_content={today in YYYYMMDD}`

Output rules:
- Return only the final URL.
- Do not add prose, quotes, bullets, or code fences.
- Preserve the slug value exactly in both the path and `utm_campaign`.
- If the input includes leading or trailing slashes, remove them before building the final URL.

Examples:
- Input: `agentic-ai-escaping-attention-trap`
  Output: `https://christianguzman.uk/articles/agentic-ai-escaping-attention-trap/?utm_source=linkedin&utm_medium=social&utm_campaign=agentic-ai-escaping-attention-trap&utm_content=20260618`
- Input: `hero-culture-is-a-bug`
  Output: `https://christianguzman.uk/articles/hero-culture-is-a-bug/?utm_source=linkedin&utm_medium=social&utm_campaign=hero-culture-is-a-bug&utm_content=20260618`
