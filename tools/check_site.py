#!/usr/bin/env python3
"""Design-system guard for dessoyracing.com.

Fails (exit code 1) if it finds NEW problems of these kinds:
  1. image files over 200 KB outside images-src/ (and outside data/, which the
     external Publisher service writes)
  2. <img> tags missing alt, width or height
  3. hard-coded hex colours outside :root (use a token from css/tokens.css)

Problems that already existed when this script was added are recorded in
tools/check_site_baseline.json, so the check passes today and only fails when
something gets WORSE. Fix an old one and the count drops: run with
--update-baseline to lock in the improvement.

Usage:
    python3 tools/check_site.py                    # normal check
    python3 tools/check_site.py --strict           # ignore the baseline, list everything
    python3 tools/check_site.py --update-baseline  # record the current state

Optional pre-commit hook (runs this before every commit):
    cp tools/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

Scope: root *.html, root *.css and css/*.css (except css/tokens.css, the one
place hex colours belong). card/ and policies/ have their own deliberate
designs and are not checked.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

REPO = Path(__file__).resolve().parent.parent
BASELINE_FILE = REPO / "tools" / "check_site_baseline.json"
MAX_IMAGE_BYTES = 200 * 1024
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".jfif", ".png", ".webp", ".avif", ".gif"}
SKIP_IMAGE_DIRS = {"images-src", "data", ".git", "node_modules"}


@dataclass(frozen=True)
class Violation:
    """One problem: which rule, which file, and a human-readable detail."""
    rule: str
    path: str
    detail: str

    @property
    def key(self) -> str:
        """Baseline entries are counted per rule + file."""
        return f"{self.rule}|{self.path}"


class Check(Protocol):
    """Every check has a name and can scan the repo for violations."""
    name: str

    def run(self, repo: Path) -> list[Violation]: ...


def rel(path: Path, repo: Path) -> str:
    return path.relative_to(repo).as_posix()


def site_files(repo: Path, suffix: str) -> list[Path]:
    """The files this guard owns: root files plus css/*.css, minus tokens.css."""
    files = list(repo.glob(f"*{suffix}"))
    if suffix == ".css":
        files += [p for p in (repo / "css").glob("*.css") if p.name != "tokens.css"]
    return sorted(files)


class LargeImages:
    name = "image-over-200kb"

    def run(self, repo: Path) -> list[Violation]:
        found = []
        for path in sorted(repo.rglob("*")):
            parts = set(path.relative_to(repo).parts[:-1])
            if parts & SKIP_IMAGE_DIRS or path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            size = path.stat().st_size
            if size > MAX_IMAGE_BYTES:
                found.append(Violation(self.name, rel(path, repo), f"{size // 1024} KB"))
        return found


class ImgAttributes:
    name = "img-missing-attr"
    # A tag, allowing '>' inside quoted attribute values (e.g. onerror="...<div>...").
    TAG = re.compile(r"<img\b(?:[^>\"']|\"[^\"]*\"|'[^']*')*>", re.I)

    def run(self, repo: Path) -> list[Violation]:
        found = []
        for path in site_files(repo, ".html"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            for match in self.TAG.finditer(text):
                tag = match.group(0)
                missing = [a for a in ("alt", "width", "height")
                           if not re.search(rf"\s{a}\s*=", tag, re.I)]
                if missing:
                    line = text.count("\n", 0, match.start()) + 1
                    found.append(Violation(self.name, rel(path, repo),
                                           f"line {line}: missing {', '.join(missing)}"))
        return found


class HardCodedColours:
    name = "hex-colour-outside-root"
    HEX = re.compile(r"(?<![\w&#\"'-])#[0-9a-fA-F]{3,8}(?![\w-])")
    ROOT = re.compile(r":root\s*\{[^}]*\}")

    def _css_chunks(self, path: Path, text: str) -> list[str]:
        """Only the CSS parts of a file: <style> blocks and style="" attributes
        in HTML, or the whole file for .css. JavaScript is not checked."""
        if path.suffix == ".css":
            return [text]
        chunks = re.findall(r"<style\b[^>]*>(.*?)</style>", text, flags=re.S)
        chunks += re.findall(r"\sstyle=\"([^\"]*)\"", text)
        return chunks

    def run(self, repo: Path) -> list[Violation]:
        found = []
        for path in site_files(repo, ".html") + site_files(repo, ".css"):
            text = path.read_text(encoding="utf-8", errors="ignore")
            for chunk in self._css_chunks(path, text):
                for colour in self.HEX.findall(self.ROOT.sub("", chunk)):
                    found.append(Violation(self.name, rel(path, repo), colour))
        return found


class Baseline:
    """Reads and writes the allowed-existing-problems file."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def load(self) -> Counter[str]:
        if not self.path.exists():
            return Counter()
        return Counter(json.loads(self.path.read_text()))

    def save(self, violations: list[Violation]) -> None:
        counts = Counter(v.key for v in violations)
        self.path.write_text(json.dumps(dict(sorted(counts.items())), indent=1) + "\n")


class Guard:
    """Runs the checks and compares the result with the baseline."""

    def __init__(self, repo: Path, checks: list[Check], baseline: Baseline) -> None:
        self.repo, self.checks, self.baseline = repo, checks, baseline

    def collect(self) -> list[Violation]:
        return [v for check in self.checks for v in check.run(self.repo)]

    def new_violations(self, violations: list[Violation], strict: bool) -> list[Violation]:
        if strict:
            return violations
        allowed = self.baseline.load()
        seen: Counter[str] = Counter()
        new = []
        for v in violations:
            seen[v.key] += 1
            if seen[v.key] > allowed[v.key]:     # more than the baseline allows
                new.append(v)
        return new


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Design-system guard")
    parser.add_argument("--strict", action="store_true", help="ignore the baseline")
    parser.add_argument("--update-baseline", action="store_true", help="record current problems as allowed")
    args = parser.parse_args(argv)

    guard = Guard(REPO, [LargeImages(), ImgAttributes(), HardCodedColours()], Baseline(BASELINE_FILE))
    violations = guard.collect()

    if args.update_baseline:
        guard.baseline.save(violations)
        print(f"Baseline updated: {len(violations)} known problems recorded in {rel(BASELINE_FILE, REPO)}")
        return 0

    new = guard.new_violations(violations, args.strict)
    total = Counter(v.rule for v in violations)
    print("Problems found (including known ones): " + (", ".join(f"{r}={n}" for r, n in sorted(total.items())) or "none"))
    if new:
        print(f"\nFAIL: {len(new)} {'problem' if args.strict else 'NEW problem'}(s):")
        for v in new:
            print(f"  [{v.rule}] {v.path}: {v.detail}")
        return 1
    print("OK: no new problems.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
