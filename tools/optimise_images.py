#!/usr/bin/env python3
"""Generate web-optimised copies of the site's images.

How it works (read this first if you are learning):
  * Original, full-size files live in  images-src/   and are NEVER changed.
  * This script reads them and writes smaller copies into  images/optimised/.
  * Photos get three widths (480, 960, 1600 px) in three formats (AVIF, WebP,
    JPEG).  The HTML uses <picture> so each browser downloads the best format
    it understands, at roughly the size it needs.
  * Logos get ONE small WebP file, sized to about 2x the largest place the logo
    is displayed (2x keeps it sharp on phone screens).
  * It is idempotent: running it twice does nothing the second time, because it
    skips any output that is already newer than its original.

Usage:
    python3 tools/optimise_images.py --dry-run     # show the plan, write nothing
    python3 tools/optimise_images.py               # generate everything
    python3 tools/optimise_images.py images-src/foo.jpg   # just one file
    python3 tools/optimise_images.py --force       # regenerate even if up to date

Needs Pillow (see requirements.txt):  pip install -r requirements.txt
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageOps

REPO = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------
# Settings.  Everything you might want to tweak is in this one section.
# --------------------------------------------------------------------------

# Logos: output name stem -> longest edge in pixels.  Anything in images-src/
# that is NOT listed here is treated as a photo.
# The default (800) is about 2x the biggest size a logo is shown on any page
# (sponsor pages show logos up to 400 px wide).  The header logo is only ever
# 50 px, so it gets a much smaller file.
LOGO_DEFAULT_EDGE = 800
LOGO_EDGES: dict[str, int] = {"hd55-white": 100}
LOGO_STEMS = {
    "hd55-white", "egr", "pro-bolt-logo", "rockcameras-logo",
    "arc-on-vector", "mwc-logo-black",
}
LOGO_BUDGET_BYTES = 60 * 1024  # "no logo over 60 KB"
FILE_BUDGET_BYTES = 450 * 1024  # stays under site-check.py's 500 KB image warning

PHOTO_WIDTHS = (480, 960, 1600)
QUALITY = {"avif": 58, "webp": 79, "jpeg": 82}
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".jfif", ".png", ".webp"}


# --------------------------------------------------------------------------
# Small data objects
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class Job:
    """One file to write: where it comes from, where it goes, and how."""
    source: Path
    target: Path
    fmt: str            # "avif" | "webp" | "jpeg" | "png"
    width: int          # photos: output width. logos: longest edge (aspect ratio is kept)
    kind: str           # "photo" | "logo"


@dataclass
class Result:
    """What happened to one output file, used for the summary table."""
    job: Job
    status: str         # "written" | "skipped" | "would write"
    size: int = 0


@dataclass
class Report:
    """Collects results and prints the before/after table."""
    results: list[Result] = field(default_factory=list)

    def add(self, result: Result) -> None:
        self.results.append(result)

    def print_table(self) -> None:
        sources = sorted({r.job.source for r in self.results})
        print(f"\n{'original':44}{'before':>10}{'after (all files)':>20}{'files':>7}")
        total_before = total_after = 0
        for src in sources:
            mine = [r for r in self.results if r.job.source == src]
            before = src.stat().st_size
            after = sum(r.size or (r.job.target.stat().st_size
                                   if r.job.target.exists() else 0) for r in mine)
            total_before += before
            total_after += after
            print(f"{src.name:44}{before / 1024:8.0f}KB{after / 1024:18.0f}KB{len(mine):7}")
        print(f"{'TOTAL':44}{total_before / 1024:8.0f}KB{total_after / 1024:18.0f}KB")
        print("(after = every generated width and format together; a visitor "
              "downloads just ONE of them)")


# --------------------------------------------------------------------------
# Naming and planning (no pixels touched here)
# --------------------------------------------------------------------------

def slug(name: str) -> str:
    """'PHR-48 Scaled_2.JPG' -> 'phr-48-scaled-2'  (lowercase, hyphens only)."""
    return re.sub(r"[^a-z0-9]+", "-", Path(name).stem.lower()).strip("-")


class Planner:
    """Decides which output files each original needs. Pure logic, no I/O writes."""

    def __init__(self, out_dir: Path, widths: tuple[int, ...] = PHOTO_WIDTHS) -> None:
        self.out_dir = out_dir
        self.widths = widths

    def plan(self, source: Path) -> list[Job]:
        stem = slug(source.name)
        with Image.open(source) as im:
            natural_w = ImageOps.exif_transpose(im).width
            # Does the picture have see-through areas? (JPEG cannot store those.)
            has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info

        if stem in LOGO_STEMS:
            edge = LOGO_EDGES.get(stem, LOGO_DEFAULT_EDGE)
            return [Job(source, self.out_dir / f"{stem}.webp", "webp", edge, "logo")]

        # Photos: use each standard width that is not bigger than the original
        # (never upscale).  If the original is smaller than the top rung, also
        # offer its own width so the biggest screens still get the best copy.
        widths = [w for w in self.widths if w <= natural_w]
        if not widths or natural_w < max(self.widths) and natural_w not in widths:
            widths.append(natural_w)
        widths = sorted(set(widths))

        fallback = "png" if has_alpha else "jpeg"   # JPEG cannot hold transparency
        jobs = []
        for w in widths:
            for fmt in ("avif", "webp", fallback):
                ext = "jpg" if fmt == "jpeg" else fmt
                jobs.append(Job(source, self.out_dir / f"{stem}-{w}.{ext}", fmt, w, "photo"))
        return jobs


# --------------------------------------------------------------------------
# Encoding (this is the part that touches pixels)
# --------------------------------------------------------------------------

class Encoder:
    """Resizes and saves one Job. Knows nothing about which jobs to run."""

    def encode(self, job: Job) -> int:
        with Image.open(job.source) as raw:
            im = ImageOps.exif_transpose(raw)       # honour camera rotation
            # thumbnail() only ever shrinks. Logos: longest edge <= job.width.
            # Photos: width <= job.width (height is left unbounded).
            is_logo = job.kind == "logo"
            box = (job.width, job.width) if is_logo else (job.width, 10**6)
            im.thumbnail(box, Image.Resampling.LANCZOS)
            job.target.parent.mkdir(parents=True, exist_ok=True)

            if is_logo:
                self._save_logo(im, job.target)
            elif job.fmt == "jpeg":
                self._save_jpeg(im.convert("RGB"), job.target)
            elif job.fmt == "png":
                im.save(job.target, "PNG", optimize=True)
            elif job.fmt == "webp":
                im.save(job.target, "WEBP", quality=QUALITY["webp"], method=6)
            elif job.fmt == "avif":
                im.save(job.target, "AVIF", quality=QUALITY["avif"], speed=4)
        return job.target.stat().st_size

    @staticmethod
    def _save_jpeg(im: Image.Image, target: Path) -> None:
        """JPEG is the oldest-browser fallback and the least efficient format, so
        the biggest widths can exceed the size budget. Lower the quality in small
        steps until the file fits (never below 60)."""
        for quality in range(QUALITY["jpeg"], 59, -4):
            im.save(target, "JPEG", quality=quality, optimize=True, progressive=True)
            if target.stat().st_size <= FILE_BUDGET_BYTES:
                return

    @staticmethod
    def _save_logo(im: Image.Image, target: Path) -> None:
        """Logos are flat colours with sharp edges: lossless WebP is crisp and
        usually tiny. If that is over budget (e.g. a noisy JPEG original) fall
        back to high-quality lossy WebP."""
        im.save(target, "WEBP", lossless=True, method=6)
        for quality in (90, 85, 80):
            if target.stat().st_size <= LOGO_BUDGET_BYTES:
                return
            im.save(target, "WEBP", quality=quality, method=6)


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------

class Optimiser:
    """Wires the planner and encoder together (dependencies are passed in)."""

    def __init__(self, planner: Planner, encoder: Encoder, dry_run: bool, force: bool) -> None:
        self.planner, self.encoder = planner, encoder
        self.dry_run, self.force = dry_run, force

    @staticmethod
    def _up_to_date(job: Job) -> bool:
        return job.target.exists() and job.target.stat().st_mtime >= job.source.stat().st_mtime

    def run(self, sources: list[Path]) -> Report:
        report = Report()
        for source in sources:
            for job in self.planner.plan(source):
                if not self.force and self._up_to_date(job):
                    report.add(Result(job, "skipped"))
                elif self.dry_run:
                    report.add(Result(job, "would write"))
                    print(f"  would write {job.target.relative_to(REPO)}")
                else:
                    size = self.encoder.encode(job)
                    report.add(Result(job, "written", size))
                    print(f"  wrote {job.target.relative_to(REPO)}  {size / 1024:.0f} KB")
        return report


def find_sources(src_dir: Path, explicit: list[str]) -> list[Path]:
    if explicit:
        return [Path(p).resolve() for p in explicit]
    return sorted(p for p in src_dir.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("files", nargs="*", help="specific originals (default: all of images-src/)")
    parser.add_argument("--dry-run", action="store_true", help="show the plan, write nothing")
    parser.add_argument("--force", action="store_true", help="regenerate even if up to date")
    parser.add_argument("--src", type=Path, default=REPO / "images-src")
    parser.add_argument("--out", type=Path, default=REPO / "images" / "optimised")
    args = parser.parse_args(argv)

    sources = find_sources(args.src, args.files)
    if not sources:
        print(f"No images found in {args.src}")
        return 1
    optimiser = Optimiser(Planner(args.out), Encoder(), args.dry_run, args.force)
    report = optimiser.run(sources)
    skipped = sum(r.status == "skipped" for r in report.results)
    print(f"\n{len(report.results)} outputs planned, {skipped} already up to date.")
    report.print_table()
    return 0


if __name__ == "__main__":
    sys.exit(main())
