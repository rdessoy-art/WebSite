# Feed Rendering Security Changes

**Date:** 2026-07-10
**Affects:** `DessoyRacing` (this repo, the static website) and `Publisher` (the service that generates the `data/*.json` feed files)

---

## 1. Background — what the problem is

The homepage (`index.html`) loads JSON files that Publisher commits into `data/`:

| File | Rendered by | Fields inserted into the page |
|---|---|---|
| `data/campaigns.json` | `loadCampaigns()` | `subject`, `title`, `archive_url` |
| `data/Instagram/instagram.json` | `renderFeedSection()` | `caption`, `permalink`, `image_path`, `likes`, `comments` |
| `data/facebook/posts.json` | `renderFeedSection()` | `text`, `permalink`, `image_path`, `likes`, `comments`, `shares` |
| `data/mastodon/posts.json` | `renderFeedSection()` | `text`, `permalink`, `image_path`, `likes`, `comments`, `shares` |

Both functions build HTML strings from these values and assign them with
`innerHTML`, **without escaping**. That means anything that looks like HTML in a
post caption, newsletter subject, or URL becomes live markup on
dessoyracing.com.

**Attack path:** these values originate from third-party platforms (Instagram,
Facebook, Mastodon, Mailchimp). If any one of those accounts is compromised,
the attacker posts a caption like:

```
Great race! <img src=x onerror="/* attacker JavaScript */">
```

Publisher syncs it within the hour, and the script then runs in the browser of
every site visitor (stored XSS). URL fields (`permalink`, `archive_url`) have
the same issue via `javascript:` links, and `image_path` via CSS-string
breakout.

---

## 2. What does NOT need to change

Confirming the assumptions in the request:

- **File locations: unchanged.** Publisher keeps writing to `data/campaigns.json`,
  `data/Instagram/instagram.json`, `data/facebook/posts.json`,
  `data/mastodon/posts.json` and the image files alongside them.
- **JSON schema: unchanged.** Same files, same field names, same types. Text
  fields stay **plain text** — Publisher must *not* start HTML-encoding values
  (no `&amp;`, `&lt;` in the JSON). The website escapes at render time, so
  pre-encoded values would display as literal `&amp;` on the page
  (double-escaping).

The website fix (section 3) is the **mandatory** change — the browser code can
never trust the JSON, whatever Publisher does. The Publisher changes
(section 4) are **recommended defence-in-depth** so a malicious payload never
even reaches the repo.

---

## 3. DessoyRacing repo — required changes (`index.html`)

All changes are inside the `<script>` block at the bottom of `index.html`
(functions `loadCampaigns`, `renderFeedSection`).

### 3.1 Add two helpers

```javascript
// Escape a value for safe interpolation into HTML.
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// Allow only http(s) URLs; anything else falls back to '#'.
function safeUrl(value) {
    try {
        const url = new URL(value);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
            return escapeHtml(url.href);
        }
    } catch (e) { /* not a valid absolute URL */ }
    return '#';
}
```

### 3.2 `loadCampaigns()` — around line 2141

Escape the subject/title and validate the archive link:

```javascript
return `
    <a href="${safeUrl(campaign.archive_url)}" target="_blank" rel="noopener" style="...">
        <span style="...">${formattedDate}</span>
        <span style="...">${escapeHtml(campaign.subject || campaign.title)}</span>
        <span style="...">Read →</span>
    </a>
`;
```

(`formattedDate` is produced by `toLocaleDateString` from a `Date`, so it is
safe as-is.)

### 3.3 `renderFeedSection()` — around lines 2163–2200

Apply the helpers to every feed-supplied value:

```javascript
const text = post.caption || post.text || '';
const truncated = escapeHtml(text.length > 150 ? text.substring(0, 150) + '...' : text);

const stats = [
    post.likes    != null ? `❤️ ${escapeHtml(post.likes)}`    : null,
    post.comments != null ? `💬 ${escapeHtml(post.comments)}` : null,
    post.shares   != null ? `🔁 ${escapeHtml(post.shares)}`   : null,
].filter(Boolean).join(' ');

// image_path must be a plain relative path into data/ — reject anything else
const imagePathOk = typeof post.image_path === 'string'
    && /^data\/[\w .\/-]+$/.test(post.image_path);
const imageStyle = imagePathOk
    ? `background-image: url('${escapeHtml(post.image_path)}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);`;
```

and in the card template use `href="${safeUrl(post.permalink)}"`.

### 3.4 Verification

1. Open the site locally and confirm newsletters and all three social feeds
   still render identically (captions with `&`, quotes and emoji display
   correctly — no visible `&amp;`).
2. Temporarily edit a caption in `data/mastodon/posts.json` to
   `<img src=x onerror="alert(1)">`, reload: the tag must appear **as text**
   on the card, and no alert fires.
3. Temporarily set a `permalink` to `javascript:alert(1)`: the card link must
   render as `href="#"`.
4. Revert the test edits.

---

## 4. Publisher repo — recommended changes (defence-in-depth)

Publisher keeps writing the same files to the same locations. The changes are
to sanitize **values** before writing the JSON:

### 4.1 Text fields (`caption`, `text`, `title`, `subject`, `preview_text`)

- Store **plain text only**. Strip any HTML markup from platform APIs before
  writing. This matters most for Mastodon, whose API returns post `content`
  as HTML — convert it to plain text (e.g. parse and take the text content),
  don't write the raw HTML string.
- Do **not** HTML-encode (`&` must stay `&`, not become `&amp;`) — the website
  now escapes at render time, and pre-encoding would double-escape.
- Reasonable extra hardening: strip control characters and cap length (the
  site only shows the first 150 characters anyway).

### 4.2 URL fields (`permalink`, `archive_url`, `profile_url`)

- Validate before writing: must parse as an absolute URL with scheme
  `https://` (or `http://` for legacy eepurl links; prefer upgrading those to
  `https://`).
- Optionally pin to the expected hosts per feed
  (`instagram.com`, `facebook.com`, `mastodon.social`, `eepurl.com` /
  `mailchimp.com`) and drop the post with a logged warning if the host is
  unexpected.

### 4.3 `image_path` / `image_filename`

- Publisher already generates these names itself (e.g.
  `mastodon_116569499670707819.jpg`). Keep it that way: **never** derive the
  filename from platform-supplied strings. Enforce that the written value
  matches `^[A-Za-z0-9_.-]+$` for `image_filename` and that `image_path` is
  the corresponding `data/<folder>/<filename>` relative path — no `..`, no
  absolute paths, no URLs.

### 4.4 Numeric fields (`likes`, `comments`, `shares`, `emails_sent`)

- Write them as JSON numbers (or `null`), never as strings taken verbatim
  from an API response.

### 4.5 Verification

Add a unit test to Publisher's sync that feeds a mock post containing
`<script>`, a `javascript:` permalink, and a `../` image path, and asserts the
written JSON contains the stripped text, no post entry (or `#`-safe URL), and
a conforming image path.

---

## 5. Rollout order

1. Ship the **website** change first — it is self-contained and immediately
   closes the vulnerability regardless of Publisher's state.
2. Ship the Publisher sanitization afterwards at leisure; no coordination
   needed because the JSON contract is unchanged.
