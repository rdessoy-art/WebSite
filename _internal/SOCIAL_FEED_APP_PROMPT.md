# Prompt: Social Feed Data Generator

Use this prompt when asking Claude Code CLI to build or fix the application that fetches social media posts and writes data into the dessoyracing website repo.

---

## Prompt

You are building a data-sync application for the dessoyracing.com website. The website is a static HTML site hosted from the repo at `/Users/robertdessoy/dev/dessoyracing`. It displays social media posts dynamically by reading JSON files from a `data/` folder. Your job is to fetch posts from social platforms and write the correct files into that folder so the website can display them.

---

### How the website reads data

The website fetches `data/manifest.json` first to discover which platforms to show. It then fetches `data/{folder}/posts.json` (or the filename specified in `manifest.json`) for each platform. The page renders a card for each post — image, date, caption, and stats.

---

### manifest.json

Location: `data/manifest.json`

This file must be kept up to date. Every platform folder must have an entry here. When you add a new platform folder, add a new entry to this file.

```json
{
  "feeds": [
    {
      "folder": "Instagram",
      "file": "instagram.json",
      "label": "Latest from Instagram",
      "profile_url": "https://www.instagram.com/harrison_dessoy55/"
    },
    {
      "folder": "facebook",
      "label": "Latest from Facebook",
      "profile_url": "https://www.facebook.com/HarrisonDessoy"
    },
    {
      "folder": "mastodon",
      "label": "Latest from Mastodon",
      "profile_url": "https://mastodon.social/@harrison_dessoy55"
    }
  ]
}
```

Rules:
- `folder` — the subfolder name inside `data/`
- `file` — optional. The JSON filename inside the folder. Defaults to `posts.json` if omitted. Only needed when the filename differs (e.g. Instagram uses `instagram.json`)
- `label` — displayed as the section heading on the website
- `profile_url` — the platform profile link
- Order of entries controls the display order on the website

---

### posts.json schema (required for every platform)

Every platform folder must contain a JSON file with this structure:

```json
{
  "last_updated": "2026-06-06T16:55:04.766788+00:00",
  "platform": "mastodon",
  "post_count": 3,
  "posts": [
    {
      "id": "116569499670707819",
      "text": "Post caption or body text goes here",
      "timestamp": "2026-05-13T21:56:46.600000+00:00",
      "permalink": "https://mastodon.social/@harrison_dessoy55/116569499670707819",
      "platform": "mastodon",
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "image_filename": "mastodon_116569499670707819.jpg",
      "image_path": "data/mastodon/mastodon_116569499670707819.jpg"
    }
  ]
}
```

**Field rules:**

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Yes | Platform's native post ID |
| `text` or `caption` | Yes | Post body text. Use `caption` for Instagram, `text` for all others. The website handles both. |
| `timestamp` | Yes | ISO 8601 format |
| `permalink` | Yes | Direct URL to the post |
| `platform` | Yes | Lowercase platform name |
| `likes` | Yes | Integer. Use `0` if none, not `null` |
| `comments` | Yes | Integer. Use `0` if none, not `null` |
| `shares` | Yes | Integer. Use `0` if none or platform doesn't support shares |
| `image_filename` | Yes | Just the filename, e.g. `mastodon_116569499670707819.jpg` |
| `image_path` | Yes | Relative path from site root: `data/{folder}/{image_filename}` |

**Critical:** `image_filename` and `image_path` must never be `null`. If a post has an image, download it and set these fields. If a post genuinely has no image (text-only post), set both to `null` — the website will show a branded gradient background instead.

---

### Image handling

- Download the first/primary image from each post
- Save it to `data/{folder}/` alongside the JSON file
- Name it: `{platform}_{post_id}.jpg` (convert to jpg where possible)
- Set `image_filename` to just the filename
- Set `image_path` to `data/{folder}/{image_filename}`

Example for Mastodon post ID `116569499670707819`:
- Save to: `data/mastodon/mastodon_116569499670707819.jpg`
- `"image_filename": "mastodon_116569499670707819.jpg"`
- `"image_path": "data/mastodon/mastodon_116569499670707819.jpg"`

---

### Current issue to fix: Mastodon

The existing `data/mastodon/posts.json` has `"image_filename": null` and `"image_path": null` for all posts, even though the posts have images on Mastodon. Fix this by:

1. Reading the current `data/mastodon/posts.json`
2. For each post, fetch the post from Mastodon and download its attached image
3. Save the image to `data/mastodon/`
4. Update `image_filename` and `image_path` in the JSON
5. Write the corrected `posts.json` back

---

### Adding a new platform

When adding support for a new platform (e.g. X/Twitter, YouTube, LinkedIn):

1. Create the folder: `data/{platform_name}/`
2. Fetch recent posts and download images
3. Write `data/{platform_name}/posts.json` following the schema above
4. Add the new entry to `data/manifest.json`
5. Commit both the JSON file, the images, and the updated `manifest.json` to the repo

The website will pick up the new platform automatically on next page load — no changes to the website code are needed.

---

### Existing platforms for reference

- `data/Instagram/instagram.json` — uses `caption` field, 3 posts, images present and working
- `data/facebook/posts.json` — uses `text` field, 3 posts, images present and working
- `data/mastodon/posts.json` — uses `text` field, 3 posts, **images missing (needs fix)**
