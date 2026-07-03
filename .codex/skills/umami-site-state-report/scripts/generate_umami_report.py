#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any


KNOWN_DEPTH_BUCKETS = ["25", "50", "75", "100"]
KNOWN_TIME_BUCKETS = ["10s", "20s", "30s", "40s", "50s", "1m", "2m", "3m", "5m", "10m", "+10m"]
LEGACY_TIME_BUCKET_ORDER = ["0-29", "30-59", "60-119", "120-179", "180-299", "300-599", "600+"]
RELATION_DEPTH_BUCKETS = ["<25", "25", "50", "75", "100"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate an HTML article-state report from Umami CSV exports.")
    parser.add_argument("--event-data", required=True, help="Path to event_data.csv")
    parser.add_argument("--website-event", required=True, help="Path to website_event.csv")
    parser.add_argument("--session-data", help="Optional path to session_data.csv")
    parser.add_argument("--output", required=True, help="Output HTML path")
    return parser.parse_args()


def none_if_null(value: str | None) -> str | None:
    if value is None:
        return None
    if value == r"\N":
        return None
    return value


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return [{key: none_if_null(value) for key, value in row.items()} for row in reader]


def normalize_slug(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip()
    if cleaned.startswith("/articles/"):
        cleaned = cleaned[len("/articles/") :]
    cleaned = cleaned.strip("/")
    return cleaned or None


def article_slug_from_row(row: dict[str, Any]) -> str | None:
    return normalize_slug(row.get("slug")) or normalize_slug(row.get("url_path"))


def is_article_path(path: str | None) -> bool:
    return bool(path and path.startswith("/articles/"))


def parse_number(value: str | None) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except ValueError:
        return None


def parse_date(value: str | None) -> tuple[str | None, str | None]:
    if not value:
        return None, None
    dt = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
    return dt.isoformat() + "Z", dt.date().isoformat()


def depth_bucket_label(number_value: float | None, string_value: str | None) -> str | None:
    if string_value and string_value.strip():
        if string_value.replace(".0000", "").isdigit():
            return str(int(float(string_value)))
    if number_value is not None:
        return str(int(round(number_value)))
    return None


def time_bucket_sort_key(bucket: str) -> tuple[int, int, str]:
    if bucket in KNOWN_TIME_BUCKETS:
        return (0, KNOWN_TIME_BUCKETS.index(bucket), bucket)
    if bucket in LEGACY_TIME_BUCKET_ORDER:
        return (1, LEGACY_TIME_BUCKET_ORDER.index(bucket), bucket)
    if bucket.endswith("s") and bucket[:-1].isdigit():
        return (2, int(bucket[:-1]), bucket)
    if bucket.endswith("m") and bucket[:-1].isdigit():
        return (3, int(bucket[:-1]) * 60, bucket)
    if bucket.startswith("+") and bucket.endswith("m") and bucket[1:-1].isdigit():
        return (4, int(bucket[1:-1]) * 60, bucket)
    return (5, 0, bucket)


def depth_sort_key(bucket: str) -> tuple[int, int, str]:
    if bucket in KNOWN_DEPTH_BUCKETS:
        return (0, KNOWN_DEPTH_BUCKETS.index(bucket), bucket)
    if bucket.isdigit():
        return (1, int(bucket), bucket)
    return (2, 0, bucket)


def relation_depth_bucket(max_depth: int | None) -> str:
    if max_depth is None or max_depth < 25:
        return "<25"
    if max_depth < 50:
        return "25"
    if max_depth < 75:
        return "50"
    if max_depth < 100:
        return "75"
    return "100"


def build_report_data(event_rows: list[dict[str, str]], website_rows: list[dict[str, str]], session_rows: list[dict[str, str]]) -> dict[str, Any]:
    website_by_event_id = {row["event_id"]: row for row in website_rows if row.get("event_id")}
    custom_events: dict[str, dict[str, Any]] = {}

    for row in event_rows:
        event_id = row.get("event_id")
        if not event_id:
            continue
        website_row = website_by_event_id.get(event_id, {})
        url_path = row.get("url_path") or website_row.get("url_path")
        if not is_article_path(url_path):
            continue

        event = custom_events.setdefault(
            event_id,
            {
                "event_id": event_id,
                "event_name": row.get("event_name"),
                "url_path": url_path,
                "slug": None,
                "title": None,
                "reading_time": None,
                "depth": None,
                "seconds": None,
                "seconds_bucket": None,
                "max_depth": None,
                "session_id": row.get("session_id"),
                "device": website_row.get("device") or "unknown",
                "browser": website_row.get("browser") or "unknown",
                "created_at": row.get("created_at"),
                "created_at_iso": None,
                "created_date": None,
            },
        )
        event["event_name"] = event["event_name"] or row.get("event_name")
        event["url_path"] = event["url_path"] or url_path
        event["device"] = event["device"] or website_row.get("device") or "unknown"
        event["browser"] = event["browser"] or website_row.get("browser") or "unknown"
        event["session_id"] = event["session_id"] or row.get("session_id")
        event["created_at"] = event["created_at"] or row.get("created_at")

        data_key = row.get("data_key")
        string_value = row.get("string_value")
        number_value = parse_number(row.get("number_value"))

        if data_key == "slug":
            event["slug"] = normalize_slug(string_value)
        elif data_key == "title":
            event["title"] = string_value
        elif data_key == "reading_time":
            event["reading_time"] = string_value
        elif data_key == "depth":
            event["depth"] = depth_bucket_label(number_value, string_value)
        elif data_key == "seconds":
            event["seconds"] = int(number_value) if number_value is not None else None
        elif data_key == "seconds_bucket":
            event["seconds_bucket"] = string_value
        elif data_key == "max_depth":
            event["max_depth"] = int(number_value) if number_value is not None else None

    events = []
    for event in custom_events.values():
        event["slug"] = event["slug"] or normalize_slug(event["url_path"])
        event["title"] = event["title"] or event["slug"] or event["url_path"]
        event["created_at_iso"], event["created_date"] = parse_date(event["created_at"])
        event["relation_depth_bucket"] = relation_depth_bucket(event.get("max_depth"))
        if not event["slug"]:
            continue
        events.append(event)

    article_pageviews = []
    for row in website_rows:
        event_type = row.get("event_type")
        url_path = row.get("url_path")
        if event_type != "1" or not is_article_path(url_path):
            continue
        slug = normalize_slug(url_path)
        if not slug:
            continue
        created_at_iso, created_date = parse_date(row.get("created_at"))
        article_pageviews.append(
            {
                "event_id": row.get("event_id"),
                "session_id": row.get("session_id"),
                "slug": slug,
                "url_path": url_path,
                "device": row.get("device") or "unknown",
                "browser": row.get("browser") or "unknown",
                "created_at": row.get("created_at"),
                "created_at_iso": created_at_iso,
                "created_date": created_date,
                "page_title": row.get("page_title") or slug,
            }
        )

    depth_buckets_seen = {event["depth"] for event in events if event.get("event_name") == "article_scroll_depth" and event.get("depth")}
    time_buckets_seen = {event["seconds_bucket"] for event in events if event.get("event_name") == "article_engaged_time" and event.get("seconds_bucket")}

    ordered_depth_buckets = KNOWN_DEPTH_BUCKETS + sorted(
        [bucket for bucket in depth_buckets_seen if bucket not in KNOWN_DEPTH_BUCKETS],
        key=depth_sort_key,
    )
    ordered_time_buckets = KNOWN_TIME_BUCKETS + sorted(
        [bucket for bucket in time_buckets_seen if bucket not in KNOWN_TIME_BUCKETS],
        key=time_bucket_sort_key,
    )

    slug_titles: dict[str, str] = {}
    for event in events:
        slug_titles.setdefault(event["slug"], event["title"])
    for pageview in article_pageviews:
        slug_titles.setdefault(pageview["slug"], pageview["page_title"].replace(" | Christian Guzman", ""))

    slug_metrics: dict[str, dict[str, Any]] = {}
    for slug in sorted(slug_titles):
        slug_metrics[slug] = {
            "slug": slug,
            "title": slug_titles[slug],
            "total_custom_events": 0,
            "scroll_counts": {bucket: 0 for bucket in ordered_depth_buckets},
            "engaged_counts": {bucket: 0 for bucket in ordered_time_buckets},
            "pageviews": 0,
            "devices": Counter(),
            "browsers": Counter(),
            "first_seen": None,
            "last_seen": None,
        }

    def update_range(metric: dict[str, Any], created_at: str | None) -> None:
        if not created_at:
            return
        first = metric["first_seen"]
        last = metric["last_seen"]
        if first is None or created_at < first:
            metric["first_seen"] = created_at
        if last is None or created_at > last:
            metric["last_seen"] = created_at

    for event in events:
        metric = slug_metrics[event["slug"]]
        metric["total_custom_events"] += 1
        metric["devices"][event["device"]] += 1
        metric["browsers"][event["browser"]] += 1
        update_range(metric, event["created_at"])
        if event["event_name"] == "article_scroll_depth" and event.get("depth"):
            metric["scroll_counts"].setdefault(event["depth"], 0)
            metric["scroll_counts"][event["depth"]] += 1
        if event["event_name"] == "article_engaged_time" and event.get("seconds_bucket"):
            metric["engaged_counts"].setdefault(event["seconds_bucket"], 0)
            metric["engaged_counts"][event["seconds_bucket"]] += 1

    for pageview in article_pageviews:
        metric = slug_metrics.setdefault(
            pageview["slug"],
            {
                "slug": pageview["slug"],
                "title": pageview["page_title"],
                "total_custom_events": 0,
                "scroll_counts": {bucket: 0 for bucket in ordered_depth_buckets},
                "engaged_counts": {bucket: 0 for bucket in ordered_time_buckets},
                "pageviews": 0,
                "devices": Counter(),
                "browsers": Counter(),
                "first_seen": None,
                "last_seen": None,
            },
        )
        metric["pageviews"] += 1
        metric["devices"][pageview["device"]] += 1
        metric["browsers"][pageview["browser"]] += 1
        update_range(metric, pageview["created_at"])

    all_dates = sorted({item["created_date"] for item in events + article_pageviews if item.get("created_date")})
    all_devices = sorted({(item.get("device") or "unknown") for item in events + article_pageviews})

    drilldown = []
    for slug, metric in slug_metrics.items():
        drilldown.append(
            {
                "slug": slug,
                "title": metric["title"],
                "pageviews": metric["pageviews"],
                "total_custom_events": metric["total_custom_events"],
                "scroll_counts": metric["scroll_counts"],
                "engaged_counts": metric["engaged_counts"],
                "devices": dict(metric["devices"].most_common()),
                "browsers": dict(metric["browsers"].most_common()),
                "first_seen": metric["first_seen"],
                "last_seen": metric["last_seen"],
            }
        )

    return {
        "generated_at": datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "inputs": {
            "event_data_rows": len(event_rows),
            "website_event_rows": len(website_rows),
            "session_data_rows": len(session_rows),
        },
        "filters": {
            "dates": all_dates,
            "devices": all_devices,
            "slugs": sorted(slug_metrics),
        },
        "bucket_order": {
            "depth": ordered_depth_buckets,
            "time": ordered_time_buckets,
            "relation_depth": RELATION_DEPTH_BUCKETS,
        },
        "events": events,
        "pageviews": article_pageviews,
        "slug_metrics": drilldown,
    }


def render_html(report_data: dict[str, Any]) -> str:
    data_json = json.dumps(report_data, ensure_ascii=False)
    title = escape("Umami Site State Report")
    template = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>__TITLE__</title>
  <style>
    :root {{
      --bg: #f4efe7;
      --surface: #fffaf3;
      --surface-strong: #f8ecd8;
      --ink: #1f2a2d;
      --muted: #6e756f;
      --accent: #b55631;
      --accent-soft: #e4b08d;
      --accent-alt: #2f6c63;
      --line: #ddcfbb;
      --shadow: 0 14px 40px rgba(62, 42, 18, 0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background:
        radial-gradient(circle at top left, rgba(181, 86, 49, 0.08), transparent 30%),
        radial-gradient(circle at top right, rgba(47, 108, 99, 0.08), transparent 25%),
        var(--bg);
      color: var(--ink);
    }}
    .shell {{
      width: min(1400px, calc(100vw - 32px));
      margin: 24px auto 48px;
    }}
    .hero, .panel {{
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 24px;
      box-shadow: var(--shadow);
    }}
    .hero {{
      padding: 28px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
    }}
    .eyebrow {{
      display: inline-block;
      font: 600 12px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 12px;
    }}
    h1, h2, h3 {{ margin: 0; }}
    h1 {{ font-size: clamp(32px, 4vw, 52px); line-height: 0.95; }}
    .hero p, .meta, .small {{ color: var(--muted); }}
    .meta {{
      display: grid;
      gap: 8px;
      padding: 20px;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(229, 210, 190, 0.45), rgba(248, 236, 216, 0.85));
    }}
    .meta strong {{ color: var(--ink); }}
    .filters {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }}
    .panel {{ padding: 20px; margin-bottom: 20px; }}
    .filter-card {{
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 14px;
    }}
    label {{
      display: block;
      font: 600 12px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 8px;
    }}
    select {{
      width: 100%;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: white;
      color: var(--ink);
    }}
    .summary-grid {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }}
    .stat {{
      padding: 16px;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(248, 236, 216, 0.9));
      border: 1px solid var(--line);
    }}
    .stat strong {{
      display: block;
      font-size: 28px;
      margin-top: 6px;
      color: var(--accent-alt);
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }}
    th, td {{
      text-align: left;
      padding: 10px 8px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }}
    th {{
      font: 600 12px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }}
    .table-wrap {{ overflow-x: auto; }}
    .viz-grid {{
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      align-items: start;
    }}
    .viz-stack {{
      display: grid;
      gap: 20px;
    }}
    .heatmap {{
      display: grid;
      gap: 6px;
    }}
    .heatmap-row {{
      display: grid;
      grid-template-columns: 120px repeat(var(--cols), minmax(0, 1fr));
      gap: 6px;
      align-items: stretch;
    }}
    .heatmap-label {{
      font: 600 12px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
      color: var(--muted);
      padding: 10px 0;
    }}
    .heat-cell {{
      min-height: 44px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: white;
    }}
    .bar-grid {{
      display: grid;
      gap: 10px;
    }}
    .bar-row {{
      display: grid;
      grid-template-columns: 180px 1fr auto;
      gap: 10px;
      align-items: center;
    }}
    .bar-track {{
      background: #f1e3d3;
      border-radius: 999px;
      overflow: hidden;
      min-height: 16px;
    }}
    .bar-fill {{
      min-height: 16px;
      background: linear-gradient(90deg, var(--accent), var(--accent-soft));
    }}
    .drilldown {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }}
    .card {{
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 16px;
      background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(248, 236, 216, 0.92));
    }}
    .kv {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 12px;
      margin-top: 14px;
    }}
    .chip-list {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }}
    .chip {{
      padding: 6px 10px;
      border-radius: 999px;
      background: var(--surface-strong);
      border: 1px solid var(--line);
      font-size: 12px;
    }}
    svg {{
      width: 100%;
      height: auto;
      display: block;
    }}
    .empty {{
      padding: 18px;
      border-radius: 16px;
      background: rgba(221, 207, 187, 0.35);
      color: var(--muted);
    }}
    @media (max-width: 980px) {{
      .hero, .viz-grid, .drilldown, .summary-grid, .filters {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero">
      <div>
        <span class="eyebrow">Umami Article State</span>
        <h1>Article depth and engaged-time report from raw CSV exports.</h1>
        <p>This report is generated from Umami exports and focuses on article URLs only. It normalizes slugs, keeps event counts as the main metric, and lets you slice by date, slug, and device.</p>
      </div>
      <div class="meta">
        <div><strong>Generated:</strong> <span id="generated-at"></span></div>
        <div><strong>event_data rows:</strong> <span id="event-data-rows"></span></div>
        <div><strong>website_event rows:</strong> <span id="website-event-rows"></span></div>
        <div><strong>session_data rows:</strong> <span id="session-data-rows"></span></div>
      </div>
    </section>

    <section class="filters">
      <div class="filter-card">
        <label for="start-date">Start date</label>
        <select id="start-date"></select>
      </div>
      <div class="filter-card">
        <label for="end-date">End date</label>
        <select id="end-date"></select>
      </div>
      <div class="filter-card">
        <label for="slug-filter">Slug</label>
        <select id="slug-filter"></select>
      </div>
      <div class="filter-card">
        <label for="device-filter">Device</label>
        <select id="device-filter"></select>
      </div>
    </section>

    <section class="panel">
      <span class="eyebrow">Executive Summary</span>
      <div id="summary" class="summary-grid"></div>
    </section>

    <section class="panel">
      <span class="eyebrow">Per Slug Table</span>
      <div class="table-wrap">
        <table>
          <thead id="slug-table-head"></thead>
          <tbody id="slug-table-body"></tbody>
        </table>
      </div>
    </section>

    <section class="viz-grid">
      <div class="viz-stack">
        <section class="panel">
          <span class="eyebrow">Heatmap</span>
          <div id="heatmap"></div>
        </section>
        <section class="panel">
          <span class="eyebrow">Crossed Bars</span>
          <div id="bar-chart"></div>
        </section>
      </div>
      <section class="panel">
        <span class="eyebrow">Sankey</span>
        <div id="sankey"></div>
      </section>
    </section>

    <section class="panel">
      <span class="eyebrow">Per Slug Drilldown</span>
      <div id="drilldown" class="drilldown"></div>
    </section>
  </div>

  <script>
    const REPORT_DATA = __DATA_JSON__;

    const state = {{
      startDate: 'all',
      endDate: 'all',
      slug: 'all',
      device: 'all',
    }};

    const generatedAt = document.getElementById('generated-at');
    const eventDataRows = document.getElementById('event-data-rows');
    const websiteEventRows = document.getElementById('website-event-rows');
    const sessionDataRows = document.getElementById('session-data-rows');

    generatedAt.textContent = REPORT_DATA.generated_at;
    eventDataRows.textContent = REPORT_DATA.inputs.event_data_rows;
    websiteEventRows.textContent = REPORT_DATA.inputs.website_event_rows;
    sessionDataRows.textContent = REPORT_DATA.inputs.session_data_rows;

    function setSelectOptions(select, values, includeAll = true) {{
      const previous = select.value;
      select.innerHTML = '';
      if (includeAll) {{
        const opt = document.createElement('option');
        opt.value = 'all';
        opt.textContent = 'All';
        select.appendChild(opt);
      }}
      values.forEach((value) => {{
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
      }});
      if ([...select.options].some((opt) => opt.value === previous)) {{
        select.value = previous;
      }}
    }}

    const startDateSelect = document.getElementById('start-date');
    const endDateSelect = document.getElementById('end-date');
    const slugFilter = document.getElementById('slug-filter');
    const deviceFilter = document.getElementById('device-filter');

    setSelectOptions(startDateSelect, REPORT_DATA.filters.dates);
    setSelectOptions(endDateSelect, REPORT_DATA.filters.dates);
    setSelectOptions(slugFilter, REPORT_DATA.filters.slugs);
    setSelectOptions(deviceFilter, REPORT_DATA.filters.devices);

    function inDateRange(value, start, end) {{
      if (!value) return false;
      if (start !== 'all' && value < start) return false;
      if (end !== 'all' && value > end) return false;
      return true;
    }}

    function filterItems(items) {{
      return items.filter((item) => {{
        if (!inDateRange(item.created_date, state.startDate, state.endDate)) return false;
        if (state.slug !== 'all' && item.slug !== state.slug) return false;
        if (state.device !== 'all' && (item.device || 'unknown') !== state.device) return false;
        return true;
      }});
    }}

    function aggregate(filteredEvents, filteredPageviews) {{
      const depthOrder = REPORT_DATA.bucket_order.depth;
      const timeOrder = REPORT_DATA.bucket_order.time;
      const relationDepthOrder = REPORT_DATA.bucket_order.relation_depth;
      const slugMap = new Map();

      function ensureSlug(slug, title) {{
        if (!slugMap.has(slug)) {{
          slugMap.set(slug, {{
            slug,
            title: title || slug,
            total_custom_events: 0,
            pageviews: 0,
            scroll_counts: Object.fromEntries(depthOrder.map((bucket) => [bucket, 0])),
            engaged_counts: Object.fromEntries(timeOrder.map((bucket) => [bucket, 0])),
            devices: {{}},
            browsers: {{}},
          }});
        }}
        return slugMap.get(slug);
      }}

      filteredEvents.forEach((event) => {{
        const metric = ensureSlug(event.slug, event.title);
        metric.total_custom_events += 1;
        metric.devices[event.device || 'unknown'] = (metric.devices[event.device || 'unknown'] || 0) + 1;
        metric.browsers[event.browser || 'unknown'] = (metric.browsers[event.browser || 'unknown'] || 0) + 1;
        if (event.event_name === 'article_scroll_depth' && event.depth) {{
          metric.scroll_counts[event.depth] = (metric.scroll_counts[event.depth] || 0) + 1;
        }}
        if (event.event_name === 'article_engaged_time' && event.seconds_bucket) {{
          metric.engaged_counts[event.seconds_bucket] = (metric.engaged_counts[event.seconds_bucket] || 0) + 1;
        }}
      }});

      filteredPageviews.forEach((pageview) => {{
        const metric = ensureSlug(pageview.slug, pageview.page_title);
        metric.pageviews += 1;
        metric.devices[pageview.device || 'unknown'] = (metric.devices[pageview.device || 'unknown'] || 0) + 1;
        metric.browsers[pageview.browser || 'unknown'] = (metric.browsers[pageview.browser || 'unknown'] || 0) + 1;
      }});

      const rows = [...slugMap.values()].sort((a, b) => b.total_custom_events - a.total_custom_events || a.slug.localeCompare(b.slug));
      const summary = {{
        totalCustomEvents: filteredEvents.length,
        totalPageviews: filteredPageviews.length,
        slugs: rows.length,
        scrollEvents: filteredEvents.filter((event) => event.event_name === 'article_scroll_depth').length,
        engagedEvents: filteredEvents.filter((event) => event.event_name === 'article_engaged_time').length,
      }};

      const heatmap = timeOrder.map((timeBucket) => {{
        const row = {{ timeBucket, cells: [] }};
        relationDepthOrder.forEach((depthBucket) => {{
          const count = filteredEvents.filter((event) =>
            event.event_name === 'article_engaged_time' &&
            event.seconds_bucket === timeBucket &&
            event.relation_depth_bucket === depthBucket
          ).length;
          row.cells.push({{ depthBucket, count }});
        }});
        return row;
      }});

      const depthTotals = Object.fromEntries(depthOrder.map((bucket) => [bucket, 0]));
      const timeTotals = Object.fromEntries(timeOrder.map((bucket) => [bucket, 0]));
      filteredEvents.forEach((event) => {{
        if (event.event_name === 'article_scroll_depth' && event.depth) {{
          depthTotals[event.depth] = (depthTotals[event.depth] || 0) + 1;
        }}
        if (event.event_name === 'article_engaged_time' && event.seconds_bucket) {{
          timeTotals[event.seconds_bucket] = (timeTotals[event.seconds_bucket] || 0) + 1;
        }}
      }});

      return {{ rows, summary, heatmap, depthTotals, timeTotals, depthOrder, timeOrder, relationDepthOrder }};
    }}

    function renderSummary(summary) {{
      const items = [
        ['Article slugs', summary.slugs],
        ['Custom events', summary.totalCustomEvents],
        ['Scroll-depth events', summary.scrollEvents],
        ['Engaged-time events', summary.engagedEvents],
      ];
      document.getElementById('summary').innerHTML = items.map(([label, value]) => `
        <div class="stat">
          <div class="small">${{label}}</div>
          <strong>${{value}}</strong>
        </div>
      `).join('');
    }}

    function renderTable(result) {{
      const depthOrder = result.depthOrder;
      const timeOrder = result.timeOrder;
      const head = document.getElementById('slug-table-head');
      const body = document.getElementById('slug-table-body');
      head.innerHTML = `
        <tr>
          <th>Slug</th>
          <th>Custom events</th>
          <th>Pageviews</th>
          <th>Depth</th>
          <th>Time</th>
          <th>Devices</th>
        </tr>
      `;
      if (!result.rows.length) {{
        body.innerHTML = `<tr><td colspan="6"><div class="empty">No article data matches the current filters.</div></td></tr>`;
        return;
      }}
      body.innerHTML = result.rows.map((row) => {{
        const depthText = depthOrder.map((bucket) => `${{bucket}}: ${{row.scroll_counts[bucket] || 0}}`).join('<br>');
        const timeText = timeOrder.map((bucket) => `${{bucket}}: ${{row.engaged_counts[bucket] || 0}}`).join('<br>');
        const devices = Object.entries(row.devices).sort((a,b) => b[1] - a[1]).map(([key, value]) => `${{key}}: ${{value}}`).join('<br>');
        return `
          <tr>
            <td><strong>${{row.slug}}</strong><br><span class="small">${{row.title}}</span></td>
            <td>${{row.total_custom_events}}</td>
            <td>${{row.pageviews}}</td>
            <td>${{depthText}}</td>
            <td>${{timeText}}</td>
            <td>${{devices || 'n/a'}}</td>
          </tr>
        `;
      }}).join('');
    }}

    function colorForIntensity(value, max) {{
      const ratio = max === 0 ? 0 : value / max;
      const alpha = 0.15 + ratio * 0.85;
      return `rgba(47, 108, 99, ${{alpha.toFixed(3)}})`;
    }}

    function renderHeatmap(result) {{
      const root = document.getElementById('heatmap');
      const max = Math.max(0, ...result.heatmap.flatMap((row) => row.cells.map((cell) => cell.count)));
      root.innerHTML = '';
      const header = document.createElement('div');
      header.className = 'heatmap heatmap-row';
      header.style.setProperty('--cols', result.relationDepthOrder.length);
      header.innerHTML = `
        <div class="heatmap-label"></div>
        ${result.relationDepthOrder.map((bucket) => `<div class="heatmap-label">${bucket}</div>`).join('')}
      `;
      root.appendChild(header);
      result.heatmap.forEach((row) => {{
        const rowEl = document.createElement('div');
        rowEl.className = 'heatmap-row';
        rowEl.style.setProperty('--cols', result.relationDepthOrder.length);
        rowEl.innerHTML = `<div class="heatmap-label">${{row.timeBucket}}</div>` + row.cells.map((cell) => `
          <div class="heat-cell" style="background:${{colorForIntensity(cell.count, max)}}">${{cell.count}}</div>
        `).join('');
        root.appendChild(rowEl);
      }});
    }}

    function renderBars(result) {{
      const root = document.getElementById('bar-chart');
      const depthMax = Math.max(0, ...Object.values(result.depthTotals));
      const timeMax = Math.max(0, ...Object.values(result.timeTotals));
      const depthRows = result.depthOrder.map((bucket) => ({{
        label: `Depth ${{bucket}}`,
        value: result.depthTotals[bucket] || 0,
        max: depthMax,
      }}));
      const timeRows = result.timeOrder.map((bucket) => ({{
        label: `Time ${{bucket}}`,
        value: result.timeTotals[bucket] || 0,
        max: timeMax,
      }}));
      root.innerHTML = `<div class="bar-grid">` + [...depthRows, ...timeRows].map((row) => `
        <div class="bar-row">
          <div>${{row.label}}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${{row.max ? (row.value / row.max) * 100 : 0}}%"></div></div>
          <div>${{row.value}}</div>
        </div>
      `).join('') + `</div>`;
    }}

    function renderSankey(result) {{
      const root = document.getElementById('sankey');
      const links = [];
      result.timeOrder.forEach((timeBucket) => {{
        result.relationDepthOrder.forEach((depthBucket) => {{
          const count = result.heatmap.find((row) => row.timeBucket === timeBucket)?.cells.find((cell) => cell.depthBucket === depthBucket)?.count || 0;
          if (count > 0) links.push({{ source: timeBucket, target: depthBucket, count }});
        }});
      }});
      if (!links.length) {{
        root.innerHTML = '<div class="empty">No engaged-time events match the current filters, so there is no time-to-depth flow to draw.</div>';
        return;
      }}
      const width = 760;
      const height = Math.max(360, Math.max(result.timeOrder.length, result.relationDepthOrder.length) * 36);
      const leftX = 110;
      const rightX = width - 110;
      const topMargin = 30;
      const leftGap = (height - topMargin * 2) / Math.max(result.timeOrder.length, 1);
      const rightGap = (height - topMargin * 2) / Math.max(result.relationDepthOrder.length, 1);
      const leftMap = Object.fromEntries(result.timeOrder.map((bucket, index) => [bucket, topMargin + index * leftGap + 10]));
      const rightMap = Object.fromEntries(result.relationDepthOrder.map((bucket, index) => [bucket, topMargin + index * rightGap + 10]));
      const maxCount = Math.max(...links.map((link) => link.count));
      const pathMarkup = links.map((link) => {{
        const strokeWidth = 2 + (link.count / maxCount) * 18;
        const y1 = leftMap[link.source];
        const y2 = rightMap[link.target];
        const c1 = leftX + 150;
        const c2 = rightX - 150;
        return `<path d="M ${{leftX}} ${{y1}} C ${{c1}} ${{y1}}, ${{c2}} ${{y2}}, ${{rightX}} ${{y2}}" fill="none" stroke="rgba(181,86,49,0.35)" stroke-width="${{strokeWidth}}" stroke-linecap="round"></path>`;
      }}).join('');
      const leftLabels = result.timeOrder.map((bucket) => `<text x="${{leftX - 16}}" y="${{leftMap[bucket] + 4}}" text-anchor="end" font-size="12" fill="#6e756f">${{bucket}}</text>`).join('');
      const rightLabels = result.relationDepthOrder.map((bucket) => `<text x="${{rightX + 16}}" y="${{rightMap[bucket] + 4}}" font-size="12" fill="#6e756f">${{bucket}}</text>`).join('');
      const leftNodes = result.timeOrder.map((bucket) => `<rect x="${{leftX - 8}}" y="${{leftMap[bucket] - 10}}" width="16" height="20" rx="8" fill="#2f6c63"></rect>`).join('');
      const rightNodes = result.relationDepthOrder.map((bucket) => `<rect x="${{rightX - 8}}" y="${{rightMap[bucket] - 10}}" width="16" height="20" rx="8" fill="#b55631"></rect>`).join('');
      root.innerHTML = `<svg viewBox="0 0 ${{width}} ${{height}}" role="img" aria-label="Time to depth sankey">${{pathMarkup}}${{leftNodes}}${{rightNodes}}${{leftLabels}}${{rightLabels}}</svg>`;
    }}

    function renderDrilldown(result) {{
      const root = document.getElementById('drilldown');
      if (!result.rows.length) {{
        root.innerHTML = '<div class="empty">No slug drilldown is available for the current filters.</div>';
        return;
      }}
      root.innerHTML = result.rows.map((row) => {{
        const depthChips = result.depthOrder.map((bucket) => `<span class="chip">${{bucket}}%: ${{row.scroll_counts[bucket] || 0}}</span>`).join('');
        const timeChips = result.timeOrder.map((bucket) => `<span class="chip">${{bucket}}: ${{row.engaged_counts[bucket] || 0}}</span>`).join('');
        const topDevices = Object.entries(row.devices).sort((a,b) => b[1] - a[1]).slice(0, 6).map(([key, value]) => `<span class="chip">${{key}}: ${{value}}</span>`).join('');
        return `
          <article class="card">
            <h3>${{row.slug}}</h3>
            <p class="small">${{row.title}}</p>
            <div class="kv">
              <div><strong>Custom events</strong><br>${{row.total_custom_events}}</div>
              <div><strong>Pageviews</strong><br>${{row.pageviews}}</div>
            </div>
            <div class="chip-list">${{depthChips}}</div>
            <div class="chip-list">${{timeChips}}</div>
            <div class="chip-list">${{topDevices}}</div>
          </article>
        `;
      }}).join('');
    }}

    function render() {{
      const filteredEvents = filterItems(REPORT_DATA.events);
      const filteredPageviews = filterItems(REPORT_DATA.pageviews);
      const result = aggregate(filteredEvents, filteredPageviews);
      renderSummary(result.summary);
      renderTable(result);
      renderHeatmap(result);
      renderBars(result);
      renderSankey(result);
      renderDrilldown(result);
    }}

    startDateSelect.addEventListener('change', (event) => {{
      state.startDate = event.target.value;
      render();
    }});
    endDateSelect.addEventListener('change', (event) => {{
      state.endDate = event.target.value;
      render();
    }});
    slugFilter.addEventListener('change', (event) => {{
      state.slug = event.target.value;
      render();
    }});
    deviceFilter.addEventListener('change', (event) => {{
      state.device = event.target.value;
      render();
    }});

    render();
  </script>
</body>
</html>
"""
    # The template was authored with doubled braces to make the CSS/JS blocks easier
    # to write safely. Collapse them before injecting the dynamic payload.
    template = template.replace("{{", "{").replace("}}", "}")
    return template.replace("__TITLE__", title).replace("__DATA_JSON__", data_json)


def write_html(output_path: Path, content: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")


def main() -> None:
    args = parse_args()
    event_path = Path(args.event_data)
    website_path = Path(args.website_event)
    session_path = Path(args.session_data) if args.session_data else None
    output_path = Path(args.output)

    event_rows = read_csv_rows(event_path)
    website_rows = read_csv_rows(website_path)
    session_rows = read_csv_rows(session_path) if session_path and session_path.exists() else []

    report_data = build_report_data(event_rows, website_rows, session_rows)
    html = render_html(report_data)
    write_html(output_path, html)
    print(f"Generated {output_path}")


if __name__ == "__main__":
    main()
