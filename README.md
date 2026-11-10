# Pitch على الماشي

The site is a static page for Pitch على الماشي, plus a link-in-bio page for Marwan's short videos.

- Homepage: `/`
- Video links: `/links` (also `/bio`, for an Instagram or TikTok bio)
- One video: `/links/video-slug` or `/bio/video-slug` (opens that video directly)

## Add a video to the link-in-bio page

Edit **`content/videos.json`**. No HTML changes. Put the newest video anywhere in the `videos` array — the page sorts by `date`, newest first.

Copy one of the objects marked `"example": true`, then replace it (those four items are placeholders).

```json
{
  "slug": "my-video-slug",
  "example": false,
  "title": "عنوان الفيديو بالعربي",
  "titleEn": "Optional English title",
  "thumbnail": "/links/thumbs/my-video.jpg",
  "date": "2026-11-10",
  "tags": ["ai", "tools"],
  "description": "جملة أو جملتين عن شو الفيديو بيحكي.",
  "descriptionEn": "Optional English description.",
  "url": "https://example.com",
  "prompt": "النص اللي بينسخه المشاهد. اتركه فاضي إذا ما في برومبت.",
  "videoUrl": "https://www.instagram.com/reel/...."
}
```

| Field | What it does |
| --- | --- |
| `slug` | Required. The shareable URL: `/links/my-video-slug`. Lowercase English letters, numbers, and hyphens. Must be unique. Don't use `thumbs`. |
| `title` | Required. Shown on the tile and in the detail sheet. Arabic is fine. |
| `titleEn` | Optional. Shown when the site is in English. If you leave it out, the Arabic title is used. |
| `thumbnail` | Image path in this repo (for example `/links/thumbs/my-video.jpg`) or a full `https://` URL. Square images look best. Drop the file in `links/thumbs/`. |
| `date` | Optional. `YYYY-MM-DD`. Newest date appears first. |
| `tags` | Optional. Short labels. Each one becomes a filter chip. Click a chip to filter, click it again to turn it off. |
| `description` | Optional. The short text inside the detail sheet. `descriptionEn` is the English version. |
| `url` | Optional. Turns on **Open link** and **Copy link**. Use the tool or site the video talks about. |
| `prompt` | Optional. Turns on **Copy prompt**. Line breaks are kept. `promptEn` is the English version. Leave `""` if there is nothing to copy. |
| `videoUrl` | Optional. **Watch** button back to the Instagram, TikTok, or YouTube video. |
| `example` | Set `true` only for placeholders. The tile gets an EXAMPLE mark. Real videos should be `false` or the field can be removed. |

Any mix of `url`, `prompt`, and `videoUrl` is fine. Leave a field as `""` to hide that button. Every video also gets **Copy page link**, which copies `/links/slug`.

The name, handle, photo, and bio at the top of the page are the `profile` object in the same file. `photo` is a path or URL, the same way as a thumbnail.

Arabic titles, descriptions, and prompts are shown right-to-left even when the rest of the page is in English.

The apply button uses the same Google Form as the homepage (`APPLY_URL` in `index.html`, and the apply links in `links/index.html`). If that form URL changes, update both.
