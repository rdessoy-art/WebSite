#!/usr/bin/env python3
"""Consistency checks for dessoyracing.com.

Run from the repo root:  python3 scripts/site-check.py

Every rule maps to a defect that actually shipped (see _internal/AUDIT.md):
GA missing from a page, pages absent from sitemap.xml, footer credit
missed, 8 MB product images, target=_blank without rel=noopener.

Exit code 0 = clean, 1 = failures found. Pre-existing failures are being
worked through via _internal/AUDIT.md — the bar for new changes is "don't add more".
"""

import glob
import os
import re
import sys

# Pages that are deliberately minimal and exempt from full-page rules.
EXEMPT_FULL_PAGE = {
    "newsletter-popup.html",   # reference snippet, not a page
    "portimao-test-report.html",  # fullscreen PDF viewer, no chrome by design
}

# Content pages that intentionally stay out of sitemap.xml.
EXEMPT_SITEMAP = EXEMPT_FULL_PAGE | {
    "success.html",            # checkout artifact — should be noindex
    "cancel.html",             # checkout artifact — should be noindex
    "partnership-menu.html",   # intentionally hidden from nav (future feature)
    "nft.html",                # soft-retired; only reachable from fanclub body
}

IMAGE_BUDGET_BYTES = 500 * 1024
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".jfif")

failures = []
warnings = []


def top_level_pages():
    return sorted(f for f in glob.glob("*.html") if f not in EXEMPT_FULL_PAGE)


def check_pages():
    sitemap = open("sitemap.xml", encoding="utf-8").read()
    for page in top_level_pages():
        html = open(page, encoding="utf-8").read()

        if "googletagmanager.com/gtag" not in html:
            failures.append(f"{page}: missing Google Analytics snippet")

        if "built by DessoyArt" not in html:
            failures.append(f"{page}: missing DessoyArt footer credit line")

        h1s = len(re.findall(r"<h1[\s>]", html))
        if h1s == 0:
            warnings.append(f"{page}: no <h1> (should have exactly one)")
        elif h1s > 1:
            warnings.append(f"{page}: {h1s} <h1> elements (should have exactly one)")

        if '<meta name="description"' not in html:
            warnings.append(f"{page}: no meta description")

        # index.html appears in the sitemap as the bare domain URL.
        in_sitemap = (
            re.search(r"<loc>https?://[^<]+/</loc>", sitemap) if page == "index.html"
            else f"/{page}</loc>" in sitemap
        )
        if page not in EXEMPT_SITEMAP and not in_sitemap:
            failures.append(f"{page}: not listed in sitemap.xml")

        blanks = re.findall(r'<a [^>]*target="_blank"[^>]*>', html)
        missing = sum(1 for a in blanks if "noopener" not in a)
        if missing:
            warnings.append(f'{page}: {missing} target="_blank" link(s) without rel="noopener"')

        # Hardcoded nav items defeat nav.js — the original drift bug.
        nav_block = re.search(r'<nav id="nav">(.*?)</nav>', html, re.S)
        if nav_block and "<li>" in nav_block.group(1):
            failures.append(f"{page}: hardcoded <li> items inside <nav id=\"nav\"> — menus must come from nav.js")


def check_sitemap_targets():
    sitemap = open("sitemap.xml", encoding="utf-8").read()
    for loc in re.findall(r"<loc>https?://[^/]+/([^<]*)</loc>", sitemap):
        path = loc or "index.html"
        if not os.path.exists(path):
            failures.append(f"sitemap.xml: lists {path} which does not exist")


def check_images():
    for root in ("images", "card", "data"):
        for path in glob.glob(f"{root}/**/*", recursive=True):
            if path.lower().endswith(IMAGE_EXTS) and os.path.isfile(path):
                size = os.path.getsize(path)
                if size > IMAGE_BUDGET_BYTES:
                    warnings.append(f"{path}: {size / 1048576:.1f} MB (budget {IMAGE_BUDGET_BYTES // 1024} KB — see optimize-image skill)")


def main():
    if not os.path.exists("sitemap.xml"):
        print("Run this from the repo root (sitemap.xml not found).")
        return 2

    check_pages()
    check_sitemap_targets()
    check_images()

    if failures:
        print(f"FAILURES ({len(failures)}):")
        for f in failures:
            print(f"  ✗ {f}")
    if warnings:
        print(f"\nWARNINGS ({len(warnings)}) — pre-existing ones tracked in _internal/AUDIT.md:")
        for w in warnings:
            print(f"  - {w}")
    if not failures and not warnings:
        print("All checks passed.")
    elif not failures:
        print("\nNo failures. Don't introduce new warnings.")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
