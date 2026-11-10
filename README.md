# Pitch على الماشي

The site is a static page for Pitch على الماشي, plus a link-in-bio page for Marwan's short videos.

- Homepage: `/`
- Video links: `/links` (also `/bio`, for an Instagram or TikTok bio)
- One video: `/links/video-slug` or `/bio/video-slug` (opens that video directly)

## Add a video to the link-in-bio page

Edit **`content/videos.json`**. No HTML changes. Put a new video anywhere in the `videos` array. When the page loads it sorts newest first, using `postedAt` when you set it, otherwise `date`. File order does not matter.

```json
{
  "slug": "my-video-slug",
  "title": "عنوان الفيديو بالعربي",
  "titleEn": "Optional English title",
  "thumbnail": "/links/thumbs/my-video.jpg",
  "date": "2026-11-10",
  "postedAt": "2026-11-10T19:41:13+03:00",
  "tags": ["AI", "Leads"],
  "description": "جملة أو جملتين عن شو الفيديو بيحكي.",
  "descriptionEn": "Optional English description.",
  "url": "https://example.com",
  "links": [
    { "label": "طريقة التركيب", "labelEn": "How to set it up", "url": "https://example.com/setup" }
  ],
  "prompt": "النص اللي بينسخه المشاهد.\nالسطر الثاني يبقى بسطر لحاله.",
  "videoUrl": "https://www.instagram.com/reel/...."
}
```

| Field | What it does |
| --- | --- |
| `slug` | Required. The shareable URL: `/links/my-video-slug`. Lowercase English letters, numbers, and hyphens. Must be unique. Don't use `thumbs`. |
| `title` | Required. Shown on the tile and in the detail sheet. Arabic is fine. |
| `titleEn` | Optional. Shown when the site is in English. If you leave it out, the Arabic title is used. |
| `thumbnail` | Image path in this repo (for example `/links/thumbs/my-video.jpg`) or a full `https://` URL. A 9:16 reel cover works best. The tile is a 3:4 portrait and crops from the top, so keep the face and the hook text in the upper part of the cover. Drop the file in `links/thumbs/`. |
| `date` | Optional. The day shown on the tile, `YYYY-MM-DD`. |
| `tags` | Optional. Short labels, Arabic or English. Each one becomes a filter chip. Click a chip to filter, click it again to turn it off. |
| `description` | Optional. The short text inside the detail sheet. `descriptionEn` is the English version. |
| `url` | Optional. Turns on **Open link** and **Copy link**. Use the tool or site the video talks about. |
| `links` | Optional. Extra buttons, each with `label`, optional `labelEn`, and `url`. Use this for a second destination, such as a setup guide. |
| `postedAt` | Optional. Full post time, such as `2026-11-10T19:41:13+03:00`. Used only to sort, including two videos from the same day. It is never shown. If you leave it out, `date` is used. |
| `prompt` | Optional. Turns on **Copy prompt** and shows the text. Line breaks are kept exactly. `promptEn` is the English version. Leave it out, or `""`, and the button stays hidden. |
| `videoUrl` | Optional. **Watch** button back to the Instagram, TikTok, or YouTube video. |
| `example` | Optional. Set `true` only while drafting. The tile gets an EXAMPLE mark. Leave it off for a real video. |

Any mix of `url`, `prompt`, and `videoUrl` is fine. Leave a field as `""` to hide that button. Every video also gets **Copy page link**, which copies `/links/slug`.

The name, handle, photo, and bio at the top of the page are the `profile` object in the same file. `photo` is a path or URL, the same way as a thumbnail.

Arabic titles, descriptions, and prompts are shown right-to-left even when the rest of the page is in English.

The apply button uses the same Google Form as the homepage (`APPLY_URL` in `index.html`, and the apply links in `links/index.html`). If that form URL changes, update both.
