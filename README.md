# Elepay Documentation

[![Deployment](https://img.shields.io/badge/docs-live-green.svg)](https://docs.elepay.link/@elepay/docs)

> Technical documentation for elepay multi-platform mobile payment service

## Overview

This repository provides comprehensive integration guides and API references for elepay iOS and Android SDKs.

Documentation includes:

- iOS SDK - Integration guides, API references, payment method implementations
- Android SDK - Integration guides, API references, payment method implementations

## Tech Stack

- Framework: [Fumadocs](https://fumadocs.vercel.app/) (Next.js based)
- Runtime: Bun
- Styling: Tailwind CSS
- Content: MDX

## Development

### Prerequisites

- Bun (recommended) or Node.js 18+

### Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Development server runs at http://localhost:3000

## Building Static Site

The project is configured for static export using Fumadocs and Next.js.

To build the static version:

```bash
# Install dependencies (if not already done)
bun install

# Build the static site
bun run build
```

The output will be in the `out/` directory, ready for deployment to any static hosting service.

Also, can use `npx serve@latest out` to preview it locally.

## Project Structure

```
app/                   # Next.js App Router
content/docs/           # Documentation content (MDX)
├── ios/               # iOS SDK documentation
└── android/           # Android SDK documentation
public/docs/           # Static assets (images, etc.)
```

## Adding/Editing Documentation

1. Create MDX files in `content/docs/`
2. Update navigation in corresponding `meta.json` files
3. Place images in `public/docs/`

---

Related Links:

- [elepay Official Website](https://www.elepay.io/)
- [Fumadocs Documentation](https://fumadocs.vercel.app/)
