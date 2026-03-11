# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Company website for Big Picture Bio, a biotech startup using multi-agent AI to design combination therapies. Hosted on GitHub Pages at bigpicturebio.com.

## Architecture

This is a **static single-page site** with no build system, bundler, or framework.

- **`index.html`** — The entire site: HTML structure, inline `<style>` CSS, and inline `<script>` JavaScript (~1800 lines total)
- **`img/`** — Team photos, favicon, and OG image
- **`CNAME`** — Custom domain config for GitHub Pages
- **`robots.txt` / `sitemap.xml`** — SEO files

### Page Sections (in order)

`nav` → `#hero` → `#problem` → `#solution` → `#validation` → `#approach` → `#team` → `footer`

### Key Visual Features

- **Bio canvas** (`#networkCanvas`): A `<canvas>`-based animated background using simplex noise that renders biological cells with organelles, receptors, and inter-cell signalling. Scroll-driven — complexity increases as user scrolls, fades out past the problem section.
- **Design system** uses CSS custom properties (`:root` vars): `--bg-deep`, `--amber`, `--beige`, `--purple-*`, etc.
- **Fonts**: Fraunces (serif, headings) and DM Sans (body) via Google Fonts.
- **Scroll animations**: `.reveal` class with IntersectionObserver for fade-in effects.
- **Mobile**: Responsive with hamburger nav, CSS media queries at 900px and 600px breakpoints.

## Development

No build step. To preview locally, serve the directory with any static file server:

```
python3 -m http.server 8000
# or
npx serve .
```

## Deployment

Pushes to `main` deploy automatically via GitHub Pages. The `CNAME` file maps to `bigpicturebio.com`.

## SEO

Open Graph and Twitter Card meta tags, structured data (JSON-LD for Organization schema), canonical URL, favicon — all in `<head>`. Update `sitemap.xml` `<lastmod>` when content changes.
