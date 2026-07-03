---
name: umami-site-state-report
description: Generate a local HTML site-state report from Umami CSV exports when the user wants article analytics summarized from `event_data.csv`, `website_event.csv`, and optional `session_data.csv`. Use for reusable reporting on article scroll-depth buckets, engaged-time buckets, slug-level drilldown, and time-vs-depth visualizations from Umami exports.
---

Generate one autosufficient HTML report from Umami CSV exports.

Input:
- Expect `event_data.csv`.
- Expect `website_event.csv`.
- Accept `session_data.csv` as optional; ignore it safely if it is empty or not useful.

Workflow:
1. Run `scripts/generate_umami_report.py`.
2. Pass explicit paths for:
   - `--event-data`
   - `--website-event`
   - `--session-data` when available
   - `--output`
3. Open the generated HTML locally to verify it renders.

Report rules:
- Focus the main report on article URLs under `/articles/...`.
- Normalize article grouping to slug short form, not full path.
- Use event counts as the main metric.
- Show scroll-depth counts for `25`, `50`, `75`, `100`, with fallback for unexpected depth values.
- Show engaged-time counts for `10s`, `20s`, `30s`, `40s`, `50s`, `1m`, `2m`, `3m`, `5m`, `10m`, `+10m`, with fallback for unexpected buckets.
- Include:
  - executive summary
  - filters for date, slug, and device
  - main table by slug
  - per-slug drilldown
  - heatmap
  - sankey
  - crossed bar comparison

Output rules:
- Generate a single local `.html` file with inline CSS and JS.
- Do not depend on external CDNs or remote assets.
- Keep the HTML reusable: readable as a static file and suitable for later migration into a dedicated repo/app.

Example:
```powershell
python .codex/skills/umami-site-state-report/scripts/generate_umami_report.py `
  --event-data C:\Users\harro\Desktop\event_data.csv `
  --website-event C:\Users\harro\Desktop\website_event.csv `
  --session-data C:\Users\harro\Desktop\session_data.csv `
  --output C:\Users\harro\Desktop\umami-site-state-report.html
```
