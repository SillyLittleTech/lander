# TreeDirect

Branching Tree website @sillylittle.tech and Redirect tool @kiya.party
# KR_Tree (template)

A tiny, static link-tree + redirect template intended to be forked and customized.

Overview
- `grow/` — Link-tree style static site (pure HTML/CSS/JS). Theme toggling uses `data-theme` on `<html>` and is persisted in `localStorage` (`/grow/script.js`). Edit `/grow/index.html`, `/grow/style.css` and `/grow/script.js` to customize.
- `_redirects` — Short link redirects for Cloudflare Pages, declared using the Cloudflare `_redirects` format at the root level. These redirects apply globally across the entire site.
- `magic/` — Contains a human-readable listing of available redirects (`/magic/index.html`).
- Root `index.html` automatically redirects to `/grow/`. There is no build system — this is plain static content.

Why use this as a template
- Minimal, easy-to-edit structure for personal link pages and short redirects.
- Keeps redirects and the public-facing listing together so site owners can update links in a single repo.

Quick start (local)
1. Clone or fork this repository.
2. Serve the repo locally to browse the pages:

```bash
# from repo root
python3 -m http.server 8000
```

Open `http://localhost:8000/` and click through `grow/` and `magic/`.

Note: Local static servers will not process `_redirects` the way Cloudflare Pages does; `/magic/index.html` is a human-readable listing of redirects for local testing.

Customizing the Grow link tree
- Edit `/grow/index.html` to change the profile, avatar, bio and link list. Preserve the `.links` container and `.link-button` markup.
   - Example: add a link inside the `.links` container:

```html
<a href="https://example.com" class="link-button">
   <span class="link-title">Example</span>
</a>
```

- Theme variables live in `/grow/style.css`. The JS in `/grow/script.js` sets `data-theme` on `<html>` and saves the selection to `localStorage`. If you rename variables in CSS, update the JS behavior accordingly.

Managing short links (Magic)
- Add redirects to `/_redirects` (in the root directory) using Cloudflare's format:

```
/CODE https://destination-url.com 301
```

- Fields: `source destination [status]`. The status is optional (e.g. `301` permanent, `302` temporary).
- Example already present in `/_redirects`: `/GH https://github.com/kiyarose 301`. The `/magic/index.html` file lists examples for humans.

Deploying to Cloudflare Pages
1. Connect the repository to Cloudflare Pages.
2. In Pages build settings set:
    - Build command: (none)
    - Build output directory: `/` (root directory)
3. Deploy. Cloudflare will process `/_redirects` in the root and create the short links that work globally across the site.

short.io integration (optional)
If you want to use a custom short domain (like `go.example.com`) instead of Cloudflare Pages path redirects, consider short.io (or a similar short-link provider). Typical steps:

1. Register an account on short.io and add your domain (e.g. `go.example.com`).
2. In your DNS provider, add the records short.io requires (usually a CNAME pointing `go` to `c.short.io` or similar — follow short.io docs). Do NOT commit secrets or API keys to this repo.
3. Configure short.io to forward short codes to your destination URLs. short.io provides a dashboard and API for creating/updating short links programmatically.

Notes about choosing short.io vs Cloudflare redirects
- Cloudflare Pages `_redirects` is simple (source -> destination) and lives in the repo; it's ideal for static repo-driven redirects.
- short.io gives you a branded short domain and analytics, and an API to create links dynamically (useful if you want programmatic short link creation outside the Pages workflow).

Contributing & conventions
- Keep changes minimal and static — avoid adding build tools without a clear reason.
- When editing links, prefer updating `grow/index.html` and `/magic/_redirects` together so the human-facing list and redirect behavior stay in sync.
- Prefer inline SVGs for icons (the repo uses inline SVGs in the HTML); adding an external icon library is unnecessary for this small template.

Checklist before merging link/redirect changes
- Update `/grow/index.html` (UI) if you add or remove short codes.
- Update `/_redirects` for the actual redirect mapping.
- Preview locally (open files or run a static server) and double-check HTML/CSS.

License
- BSD 3-Clause (see `LICENSE`).
