# Rate card

`/rates` is the standard card (AED, effective Jan 2026). A private page for one brand is `/rates/<slug>`.

Every rate page, including `/rates` and `/rates/*`, sends `noindex` (a meta tag and an `X-Robots-Tag` header) and is left out of `sitemap.xml`. Do not link a private page from the homepage, the bio, the workshop, or the standard card. The brand name does not appear on the page: not in the title, headings, description, or alt text. The slug is the only identifier. Keep it neutral.

## Add a brand

Edit `rates/rates.json` and add an object to `pages`:

```json
{
  "slug": "acme",
  "currency": "JOD",
  "storiesIncluded": false,
  "metricsImage": "",
  "items": [
    {
      "title": "Advertising Reel",
      "detail": "Instagram",
      "description": "A dedicated reel built around your product or service.",
      "price": 1500,
      "channels": "Instagram"
    }
  ],
  "bundle": {
    "title": "1 reel + 2 stories",
    "detail": "booked together",
    "description": "One advertising reel and two stories, booked together.",
    "price": 3000
  }
}
```

| Field | What it does |
| --- | --- |
| `slug` | URL segment, `/rates/acme`. Lowercase letters, numbers, and hyphens. Not the brand name. |
| `currency` | Shown beside each price, the same way AED is shown on `/rates`. The intro line uses it too. |
| `storiesIncluded` | `true` keeps “Stories are included:” in the usage text. `false` removes that sentence and leaves the rest. |
| `items` | Line items. `detail` is the italic line under the title. `channels` is the small label under the price (`Each` for a per-story price). |
| `bundle` | Optional. Rendered as the last row. Leave it out when there is no bundle. |
| `metricsImage` | Optional path to one screenshot. Empty means the section is omitted. |
| `insights` | Optional interactive block. See below. |

Run:

```bash
node rates/build.mjs
```

Commit `rates/rates.json` and the generated `rates/<slug>/index.html`.

## Metrics image

Put the file in `rates/insights/` and set `metricsImage` to its public path, for example `/rates/insights/acme.webp`.

Name the file with the slug or another neutral word. The path is in the HTML, so the brand name cannot be in the filename. The image alt text is “Account insights”.

When `metricsImage` is empty and there is no `insights` object, visitors see no metrics section and no placeholder.

The `kk` page does not use `metricsImage`. Its `insights` object drives the interactive section (followers, reach, audience, countries, cities, languages) and the proof screenshots `rates/insights/insight-1.webp` through `insight-9.webp`. To refresh a screenshot, replace that file, crop the phone status bar off first, and keep the alt text in `rates.json` free of any brand name. Then run the build again.
