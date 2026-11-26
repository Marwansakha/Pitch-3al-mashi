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

The `kk` page does not use `metricsImage`. Its `insights` object drives the interactive section (followers, reach, audience, countries, cities, languages) and the dashboard screenshots `rates/insights/insight-1.webp` through `insight-9.webp`. To refresh a screenshot, replace that file, crop the phone status bar off first, and keep the alt text in `rates.json` free of any brand name. Then run the build again.

`screenshotsTaken` on an `insights` object, such as `"26 Nov 2026"`, prints “Screenshots taken the morning of 26 Nov 2026” beside the gallery.

## Live headline numbers

The page embeds the numbers from `rates.json` and shows those if nothing newer is available. A refresh replaces them without editing the page.

`GET /.netlify/functions/creator-metrics` reads the Netlify Blobs store `creator-metrics`, key `latest`. The response is cached for about five minutes (`Cache-Control: public, max-age=300`). A missing blob returns 404, and the page keeps the embedded numbers.

The JSON shape is:

```json
{
  "updatedAt": "2026-11-26T05:30:00.000Z",
  "metrics": {
    "views": 1820375,
    "viewers": 723107,
    "nonFollowerViews": 1547301,
    "followerViews": 272124,
    "reelsViews": "1.3M",
    "storiesViews": "84K",
    "reelsInteractions": "66K",
    "profileVisits": "22K",
    "bioLinkTaps": 746,
    "followers": 78936,
    "growthPct": 12.2,
    "netFollowers": 7517,
    "gender": [
      { "label": "Men", "value": 69.9 },
      { "label": "Women", "value": 30.1 }
    ],
    "age": [
      { "label": "18–24", "value": 10.4 },
      { "label": "25–34", "value": 37.1 },
      { "label": "35–44", "value": 30.8 },
      { "label": "45–54", "value": 14.4 },
      { "label": "55–64", "value": 4.8 }
    ],
    "countries": [
      { "label": "Jordan", "value": 28.5 },
      { "label": "Saudi Arabia", "value": 16.1 },
      { "label": "UAE", "value": 9.3 },
      { "label": "Egypt", "value": 4.2 },
      { "label": "Palestine", "value": 3.9 }
    ],
    "cities": [
      { "label": "Amman", "value": 21.7 },
      { "label": "Riyadh", "value": 7.6 },
      { "label": "Jeddah", "value": 3.8 },
      { "label": "Dubai", "value": 3.6 },
      { "label": "Abu Dhabi", "value": 2.6 }
    ],
    "languages": [
      { "label": "Arabic", "value": 78.7 },
      { "label": "English", "value": 16.1 }
    ]
  }
}
```

| Key | What it shows |
| --- | --- |
| `updatedAt` | ISO time. The page prints it as “Live numbers updated … (Amman time)”. The headline range is the 30 days ending on that instant in Amman, for example “last 30 days (27 Oct – 26 Nov 2026)”. Optional `windowStart` and `windowEnd` ISO strings, on the object or inside `metrics`, override that window. |
| `views` | Views in the last 30 days. Integer, shown with commas. |
| `viewers` | Viewers. Integer. |
| `nonFollowerViews` | Views from non-followers. Integer. |
| `followerViews` | Views from followers. Integer. |
| `reelsViews` | Reel views. A number, or Instagram’s rounded string such as `"1.3M"`. |
| `storiesViews` | Story views. A number, or a string such as `"84K"`. |
| `reelsInteractions` | Reel interactions. A number, or a string such as `"66K"`. |
| `profileVisits` | Profile visits. A number, or a string such as `"22K"`. |
| `bioLinkTaps` | Bio link taps. Integer. |
| `followers` | Followers. Integer. |
| `growthPct` | Growth since the comparison date. Number, shown as `+12.2%`. |
| `netFollowers` | Net new followers. Integer, shown as `+7,517`. |
| `gender`, `age`, `countries`, `cities`, `languages` | Audience splits. Each is a list of `{ "label", "value" }`. `value` is a percentage such as `28.5`. Labels must match the ones already on the page. |

A headline the live object does not include is hidden, so an old embedded figure is not shown beside fresh ones. The screenshot gallery, and the follower-growth line marked as from the screenshots, stay.

Write a file in that shape, then update the blob. This is the refresh, meant to run about every 12 hours. It needs `NETLIFY_AUTH_TOKEN` in the environment and does not print that token. The site id is `c065d51a-130f-4cc6-9c4c-cbb863bd2e9f`. Set `NETLIFY_SITE_ID` to use a different site.

```bash
node scripts/update-creator-metrics.mjs path/to/metrics.json
```
