# Known Gaps, Enhancements and Defects

The single register of **what is outstanding** on dessoyracing.com. If something is known to be
wrong, known to be missing, or deliberately deferred, it is recorded here and nowhere else.

## Scope, and why this is separate

`CLAUDE.md`, `DESIGN.md` and `CLAUDE_CODE_GUIDE.md` describe **how the site works today and why**,
including decisions already taken. They deliberately do **not** carry outstanding work, because a
reference document that mixes "this is how it behaves" with "this is broken" leaves a reader
unable to tell which is which.

| Content | Home |
|---|---|
| How it works, and why (including rejected alternatives) | `CLAUDE.md`, `DESIGN.md`, `CLAUDE_CODE_GUIDE.md` |
| What is known-wrong, known-missing, or deferred | **this file** |
| What changed, and when | git history and the PR that made the change |

A **closed decision stays in the reference doc**, next to the code it governs, for example the
newsletter popup's 7-day dismissal (`NEWSLETTER_POPUP_README.md`). It is not outstanding work.

`AUDIT.md` is the older, checkbox-style audit from July 2026. Its remaining open P3 items stay
there and are not copied here. New findings go in this file.

## How to use this file

- **Cite the ID** in commits and PRs (`Closes D-1`), so the trail from problem to fix survives.
- **Close items in the same change that fixes them**: move the entry to *Resolved* with the date
  and PR number. A register nobody prunes becomes a register nobody trusts.
- **Verify before believing.** Entries can go stale. Check the claim against the source before
  acting on it.
- `python3 tools/check_site.py` lists the oversized images, missing `<img>` attributes and
  hard-coded colours it already knows about (`tools/check_site_baseline.json`). When you fix one,
  rerun it with `--update-baseline` so the baseline shrinks.

Last reviewed against the source: **1 November 2026**.

---

# Defects

Something behaves incorrectly, or is fragile in a way that will eventually bite.

### D-1 · The PHR Performance logo is stretched on its sponsor page

`sponsor-phr-performance.html` (line 287) gives the logo `width="1024" height="414"` but the inline
style only sets `max-width: 400px`, with no `height: auto`. The browser shrinks the width to 400 px
and keeps the 414 px height, so the logo is squashed sideways.

*Why still open:* found during the image work (Nov 2026), and it was there before it. Not touched
because it was outside that brief.
*Fix:* add `height: auto` to the style. Check the other sponsor pages for the same pattern.

### D-2 · The YouTube footer icon is distorted

`footer.js` (line 34) renders `images/Youtube_logo.png` (640×443) at a forced `width="50" height="50"`,
so it is squashed into a square.
*Why still open:* pre-existing, reported but not fixed.
*Fix:* give the icon its real aspect ratio, or swap in a square icon like the other social icons.
`footer.js` is shared, so fix it once there.

### D-3 · Eleven `<img>` tags have no `width`/`height` (one has no `alt` either)

`events.html` (1), `index.html` line 37 (also no `alt`), `merchandise.html` (6),
`sponsor-grayers-graphics.html` (3). Missing dimensions cause layout shift as images load.
*Why still open:* they are baseline-listed. Merch and events images are swapped in by JavaScript, so
the real size needs checking first.
*Detail:* `python3 tools/check_site.py --strict` prints each line.

---

# Gaps

Something that is missing, or deliberately not done yet.

### G-1 · Instagram feed images are not optimised

`data/Instagram/` is about 37 MB (single files of 1 to 2.4 MB) and is the largest remaining weight on
the home page. The external Publisher service writes these files and auto-commits them.

*Why still open:* a separate job by decision (Phase 1, Oct 2026). Optimising them in this repo would
be undone by the next Publisher commit.
*Fix:* resize and compress at write time in the Publisher, then regenerate the existing files.
*Related:* `FEED_SECURITY_CHANGES.md` (the Publisher writes these files).

### G-2 · Publisher-side sanitisation is still pending

The website escapes everything from `data/*.json`, which closes the hole, but the Publisher does not
yet strip HTML from Mastodon content or validate URLs and hosts. See `FEED_SECURITY_CHANGES.md` §4 and
`AUDIT.md`. Defence in depth, not urgent.

### G-3 · Only `index.html` has the Phase 2 polish

The fixed blurred header, hero overlay and scroll fade-in are on the home page only. Other pages share
the tokens and the font but keep their simpler static header (`DESIGN.md` §8).
*Why still open:* a deliberate scope limit so the home page could be judged first.

### G-4 · Seven large legacy photos sit in `images/` unreferenced

`IMG_9233`, `IMG_9259`, `IMG_9418`, `hall-bends`, `donington-mcleans`, `hd55-welcome-photo` and
`Drawing`. No page uses them (Phase 0 audit), and they are the biggest baseline entries (up to 4.3 MB).
*Why still open:* the brief says to ask before moving or deleting files, and that has not been asked yet.
*Fix:* confirm none are linked from an old external page, then move them to `images-src/` or delete.

### G-5 · Three generated Assen photos are over 200 KB

The 1600 px copies of the Assen race photos (207 to 313 KB). The optimiser steps quality down to its
floor and these still exceed the budget. They are baseline-listed.
*Fix:* drop the 1600 px rung for those photos, or accept a higher limit for them.

### G-6 · Merchandise and events images are outside the optimiser flow

They were already WebP and are swapped in by JavaScript, so Phase 1 left them alone.
*Fix:* run them through `tools/optimise_images.py` and switch to `<picture>` where practical.

### G-7 · Five hard-coded hex colours remain

`index.html` (`#e8e8e8`, `#e5e7eb`, `#e0e0e0`), `partnership-menu.html` (`#4a90e2`),
`portimao-test-report.html` (`#0a0a0a`). They are not brand colours and have no token yet.

---

# Enhancements

Worth doing, but nothing is broken without it.

### E-1 · Light and dark versions of the other sponsor logos

Rock Cameras now has both (`images-src/RockCameras_Logo.avif` and `RockCameras_Logo_Dark.avif`). The
other sponsors have one version each, so the dark tile option (`.sponsor-logo--dark`) cannot be used
for them, and any logo that needs a dark hero background would be unreadable.
*How:* make the versions with Apple creator tools, then follow "Light and dark logo pairs" in `DESIGN.md`.

### E-2 · Self-hosted web font (Inter)

Option B from Phase 3. The site uses the system font stack today (no download, no cost). Switching is
one token plus an `@font-face`.
*Why still open:* needs an explicit decision before anything is downloaded.

### E-3 · Install the pre-commit hook

`tools/pre-commit` runs `tools/check_site.py` before each commit. It is written but not installed.
*How:* `cp tools/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`.

### E-4 · Delete stale branches

`claude/dad-website-updates`, `claude/create-partnership-menu-0dcJ7`, `claude/hide-partnership-menu-4BNfQ`,
`claude/remove-keyring-fan-section-Yk9ud`, `claude/update-home-email-qJ6ID`,
`claude/update-merchandise-images-XaSpz`, `general-debrief-report-label`. Keep `events-json-sync`
(probably the Publisher's).
*Why still open:* waiting for confirmation, because deleting a branch is hard to undo.

---

# Resolved

Nothing yet. Move entries here with the date and PR number when they are fixed.
