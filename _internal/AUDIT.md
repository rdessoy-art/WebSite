# Site Audit — dessoyracing.com

**Date:** 2026-07-10 · **Scope:** full repository (53 HTML pages, shared JS, images, data feeds, docs, Claude tooling)

Each item has a checkbox so you can work through this over time. Priorities:
**P1** = user-visible or costing you now · **P2** = quality/maintainability, do soon · **P3** = polish/nice-to-have.

A theme runs through this whole audit: **every shared element is copy-pasted per page, and copies drift.** The Events-page nav bug you hit (missing Merchandise item) was one instance of that pattern. The same pattern exists today in the footer, the newsletter popup, the analytics snippet, and all page CSS. Items marked **[PATTERN]** below are instances of it.

---

## 1. Performance — P1

- [x] **P1 — Merchandise page loads ~49 MB of images.** ~~The product PNGs are enormous...~~ **Done 2026-07-10:** converted all 10 product/color-variant images to WebP via `cwebp` (`optimize-image` skill) — merchandise page image weight dropped from ~49 MB to ~455 KB. Old PNG/JPEG originals and their HEIC sources removed.
- [x] **P1 — Home page hero/background images are also heavy.** **Done 2026-07-10:** all three responsive hero backgrounds (`centered_wide_fade.png` 4.5 MB, `Cadwell win 1.JPEG` 3.0 MB, `Cadwellpodium.JPG` 2.3 MB) converted to WebP (86/135/64 KB). `Cadwell2.png` (4.9 MB) was unreferenced anywhere — deleted rather than converted.
- [ ] **P2 — No `loading="lazy"` on below-the-fold images** (sponsor grids, social feed cards, merch). One attribute per `<img>` defers most of the page weight.
- [ ] **P2 — No `width`/`height` attributes on most images**, so the page reflows as images load (layout shift). Add intrinsic dimensions or `aspect-ratio` CSS.
- [ ] **P3 — `.git` is 129 MB** — image/PDF history has accreted. Not urgent (clone speed only), but avoid re-committing large binaries repeatedly; consider Git LFS if merch photos churn each season.
- [ ] **P3 — Six sponsor-debrief PDFs (~10 MB) live in the repo root** and deploy with the site. Fine if they're meant to be public downloads; move to a `/debriefs/` folder for tidiness and confirm they're all meant to be publicly reachable.

## 2. Copy-paste drift — P1/P2 [PATTERN]

The nav is now centralized in `nav.js` (done this session). These are the remaining duplicated blocks, in order of drift risk:

- [ ] **P2 — Footer markup is duplicated in ~24 pages.** Adding the DessoyArt credit line meant editing 28 files — that's the cost of the pattern, every time. Extract to `footer.js` exactly like `nav.js` (a `renderFooter(pageType)` that handles the standard/sponsor/minimal variants). The inconsistencies below then fix themselves in one place.
- [ ] **P1 — Contact email is inconsistent:** 26 footers say `Robert@DessoyRacing.com`, index.html says `Harrison@dessoyracing.com`. Pick one (or intentionally differ) — right now it looks accidental.
- [ ] **P2 — Copyright years are inconsistent:** most pages say `© 2025`, three sponsor pages say `© 2026`. It's mid-2026 — either bump all to 2026 or render the year with JS so it never goes stale.
- [x] **P2 — Google Analytics snippet is missing from `behind-the-scenes.html`.** **Done 2026-07-10:** snippet added; `site-check.py` now reports zero GA failures site-wide.
- [ ] **P2 — Newsletter popup markup is pasted inline into 5+ pages** while `newsletter-popup.html` sits unused as a "reference copy". Either inject the modal from `newsletter-popup.js` (it already owns the behavior) or accept the duplication and delete the reference file — the half-way state is what breeds drift.
- [ ] **P3 — Each page carries its own full `<style>` block (6–33 KB, ~200 KB total duplicated CSS).** This is the root enabler of drift (the missing `nav a.active` rule on 3 pages was CSS drift). A single `site.css` for the shared tokens/header/footer/nav rules — keeping page-specific styles inline — would halve the problem without needing a build step.

## 3. HTML5 / semantics / accessibility — P2

- [ ] **P2 — NEW (found 2026-07-10) — `events.html` throws a JS error on every page load:** `document.getElementById('reportModal').addEventListener('click', ...)` runs before the `#reportModal` element (defined later in the body, line ~690) exists in the DOM, so `getElementById` returns `null` and the call throws `TypeError: Cannot read properties of null (reading 'addEventListener')`. Practical effect: clicking outside the report modal to close it silently doesn't work (whatever close button/mechanism exists may still work — not verified). Fix: wrap the three `reportModal` lines (~662–673) in a `DOMContentLoaded` listener, or move the script block below the modal's HTML.
- [ ] **P2 — The hamburger menu is a `<div onclick>`** on every page: not keyboard-focusable, not announced to screen readers, no state. Make it `<button type="button" aria-label="Menu" aria-expanded="false" aria-controls="nav">` and toggle `aria-expanded` in `toggleMenu()` (one change in each header + one line in `nav.js`).
- [ ] **P2 — 17 pages have no `<h1>`** (all 13 sponsor pages, events, fanclub, partnership-menu). They start at `<h2>`. Each page should have exactly one `<h1>` naming the page — good for SEO and screen-reader navigation.
- [ ] **P2 — ~45 `target="_blank"` links lack `rel="noopener"`** (events.html alone has 15). Mostly ticket/venue links. Mechanical fix; a one-line script can patch all files.
- [ ] **P3 — Internal links inconsistently open new tabs:** in the hero sponsor strip, `sponsor-martin-sheath.html` opens in a new tab while the other internal sponsor links don't. Internal navigation should stay in the same tab; reserve `target="_blank"` for external sites.
- [ ] **P3 — No "skip to content" link** for keyboard users; nav is re-tabbed on every page.
- [ ] **P3 — Inline `onclick=` handlers throughout** (index.html has 110 inline `style=` attributes too). Working, but hard to maintain and blocks any future CSP. Note as direction-of-travel rather than a task: new code should use `addEventListener`.
- [ ] **P3 — The old redirect stubs** (`2023/`, `2024/`, `about-me/`, UUID folders) lack `lang` and `viewport`. Harmless — users see them for milliseconds — skip unless bored.

## 4. SEO & sharing — P1/P2

- [x] **P1 — No favicon anywhere.** **Done 2026-07-10:** generated `favicon.ico` + 16/32px PNGs + apple-touch-icon from the HD55 mark, added `<link>` tags to all 28 real content pages.
- [x] **P1 — Zero `<meta name="description">` and zero Open Graph/Twitter tags** on index, events, merchandise, fanclub. **Done 2026-07-10:** added description + OG/Twitter tags to all four, each with a dedicated 1200×630 preview image cropped from existing site photos. (Correction: `card/index.html` already had full OG tags from commit `1180141` — the original note that this was "lost" was a mistake on my part; it was never missing.) Remaining pages (13 sponsor pages, success/cancel, etc.) still lack descriptions — tracked as ongoing warnings in `site-check.py`.
- [x] **P2 — `sitemap.xml` is out of sync** [PATTERN — same drift as the nav]. **Done 2026-07-10:** added the 4 missing sponsor pages; removed `success.html`/`cancel.html` (see next item). `card/` still not in the sitemap — it's a personal contact card, arguably shouldn't be indexed either; left out deliberately, revisit if that's wrong.
- [x] **P2 — `success.html` and `cancel.html` need `<meta name="robots" content="noindex">`.** **Done 2026-07-10:** noindex tag added to both, removed from sitemap.xml.
- [ ] **P3 — Policy pages are orphaned:** `policies/*.html` are linked from nowhere (the dev guide has flagged this since June). Add Privacy/Terms links to the shared footer — trivial once footer.js exists (§2).
- [ ] **P3 — The two emoji blog folders** (`cadwell-park-round-7-🏁` / `-✅`) work but produce Unicode-normalization noise in git on macOS and are fragile as URLs. They're legacy redirects; leave them, but don't create emoji paths again.

## 5. Dead code & cruft — P2/P3

- [ ] **P2 — `basket.js` is vestigial** (dev guide confirms): a full cart UI + localStorage basket with **no `addToBasket()` caller anywhere** — the basket can never gain an item. All purchases are direct `buy.stripe.com` links. Four pages load the script and carry hidden sidebar markup. Delete the basket machinery (keep `showNotification` if anything still uses it) — it's also the last `innerHTML` sink left on the site.
- [x] **P2 — The countdown timer in `index.html` targets November 23, 2025.** **Done 2026-07-10:** `updateCountdown()` and its orphaned CSS deleted (confirmed the `#days/#hours/#minutes/#seconds/#countdown` elements it referenced no longer exist in the HTML).
- [x] **P2 — `Next change` (stray notes file in the root) is fully done.** **Done 2026-07-10:** deleted.
- [x] **P3 — `data/mastodon.json`** is a stale duplicate of `data/mastodon/posts.json`. **Done 2026-07-10:** confirmed unreferenced by any page, confirmed stale (older `last_updated`), deleted.
- [x] **P3 — Six `.heic` originals in `/images/`** have PNG/JPEG equivalents. **Done 2026-07-10:** confirmed unreferenced, deleted (5.5 MB).
- [ ] **P3 — 21 image filenames contain spaces** (plus `Instagram logo(2).png` with parens, and mixed-case `.PNG`/`.JPEG` extensions). Works, but every reference needs URL-encoding and case must match exactly on the case-sensitive deploy host. Convention going forward: `lowercase-hyphenated.webp`.

## 6. Security — P2 (mostly done this session)

- [x] Stored XSS in feed rendering — **fixed** (`escapeHtml`/`safeUrl` in index.html).
- [ ] **P2 — Publisher-side sanitization** is still pending — see `FEED_SECURITY_CHANGES.md` §4 (strip HTML from Mastodon content, validate URLs/hosts, keep generating image filenames itself). Defense-in-depth; the website fix already closes the hole.
- [ ] **P3 — `basket.js` `innerHTML` sink** goes away with the dead-code removal in §5.

## 7. Documentation drift — P2

- [ ] **P2 — `STRIPE_SETUP.md` describes a flow that no longer exists:** it instructs replacing `STRIPE_PUBLISHABLE_KEY` on "line 9 of basket.js" — there is no such line, and checkout uses hosted payment links, not Stripe.js sessions. Rewrite to describe the real flow (payment links per product/size), or reduce it to "how to create a new payment link and wire a button".
- [ ] **P2 — `_internal/CLAUDE_CODE_GUIDE.md` is good but stale** (last reviewed 2026-06-06): says 11 sponsor pages (now 13), "GA on all 22 pages" (behind-the-scenes is missing it), references the removed `STRIPE_PUBLISHABLE_KEY`/`addToBasket()`, predates `nav.js`, `card/`, the footer credit, and `FEED_SECURITY_CHANGES.md`. Refresh it — it's the map future sessions navigate by (see §8 for making it load automatically).
- [ ] **P3 — `SITEMAP_MAINTENANCE.md`** — re-check after fixing the sitemap gaps so doc and file agree.

## 8. Claude Code setup — recommendations

The single highest-leverage change: **you have a genuinely useful dev guide that Claude never sees.**

*(All items in this section were implemented on 2026-07-10.)*

- [x] **P1 — Create `CLAUDE.md` in the repo root.** `_internal/CLAUDE_CODE_GUIDE.md` opens with "Read this before making any changes" — but only `CLAUDE.md` is loaded automatically into every session. Recommended shape: a concise `CLAUDE.md` (~40 lines) with the invariants — no build system; nav lives in `nav.js`, never hardcode menus; footer conventions; add GA + sitemap entry + footer credit to every new page; escape anything rendered from `data/*.json`; image budget ("WebP, ≤300 KB, lowercase-hyphenated names"); update the docs it touches — plus a pointer to the full guide for detail. Keeping the deep guide separate and the auto-loaded file short is the right split.

- [x] **P2 — Write project skills** in `.claude/skills/` for the recurring workflows. Each encodes a multi-file checklist that is exactly the kind of thing that drifted before:
  - **`new-sponsor-page`** — the highest-value one. Scaffold `sponsor-<name>.html` from the current pattern, then do the four side-updates people forget: card in the index "Our Partners" grid, logo in the hero strip, `sitemap.xml` entry, GA snippet + footer credit. (Four of the sitemap gaps in §4 exist precisely because these steps were manual.)
  - **`new-page`** — same idea for general pages: GA, footer, nav integration (`renderNav`), sitemap, "linked from at least one page" check.
  - **`add-product`** — merchandise flow: optimize image to WebP (see next item), add product card, wire the `buy.stripe.com` link, verify on mobile width.
  - **`verify-site`** (project verify skill) — start `python3 -m http.server`, click through Home/Events/Merch/Fan Club, check nav + footer render, console clean, feeds load. We effectively performed this by hand four times this session; make it a skill so it's one command.
  - **`optimize-image`** — take a source image, emit resized WebP under a size budget with a lowercase-hyphenated name. Directly prevents the 8 MB-PNG problem from recurring next season's merch drop.

- [x] **P3 — Add a lightweight pre-commit consistency check** (implemented as `scripts/site-check.py`) (script the skills can call, or a hook): every top-level `*.html` has GA + footer credit + `<h1>`; every content page is in `sitemap.xml`; no committed image over ~500 KB. Each rule maps to a real defect found in this audit, so the check earns its keep immediately.

- [x] **P3 — Tidy `.claude/settings.local.json`.** The allowlist has accumulated one-off entries (specific curl URLs, `md5` of a single file) alongside broad ones (`Bash(git *)`, `Bash(python3 *)`, `Bash(cd *)`) that make the specific ones redundant. Run `/fewer-permission-prompts` or hand-prune to a short generic list.

---

## Suggested working order

1. ~~**Quick wins, big impact (one sitting):** favicon · merch image WebP conversion · meta description/OG on the 5 key pages · sitemap fix + noindex on success/cancel · delete `Next change`, countdown, `data/mastodon.json`, HEICs.~~ **Done 2026-07-10** — also fixed the GA gap on behind-the-scenes.html while in there (site-check.py now reports zero FAILURES, only tracked warnings). One new bug surfaced during verification and was logged rather than fixed inline: the `events.html` `reportModal` null-reference error in §3.
2. **Foundation (one sitting):** `CLAUDE.md` (done) · footer.js extraction (fixes email/year/policy-links in one go) · basket.js removal.
3. **Rolling:** hamburger a11y + h1s + noopener sweep · the new `reportModal` bug · skills as you next need each workflow · doc refresh.
