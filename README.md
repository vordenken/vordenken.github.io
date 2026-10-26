# vordenken's app workshop

A shared home for Silentio, CoreTamer, AutoPiP, ShortBlock, Varan, and stimmig. Built as a fast, bilingual static website, hosted on GitHub Pages.

**Website:** https://vordenken.github.io/

## Local development

Requires Node.js 22 or later. No dependencies to install.

```sh
npm run dev
```

Open the printed local URL. After changing content, rebuild with `npm run build` and refresh. To validate the generated pages:

```sh
npm run build
npm run check
```

## Structure

- `src/projects.json`: bilingual app copy, requirements, release status, and repository links.
- `scripts/build.mjs`: generates HTML, language variants, app entry points, sitemap, and 404 page.
- `public/assets/site.css`: the shared workshop design.
- `public/assets/site.js`: progressive enhancement for the three labeled interactive sketches.
- `public/assets/entry.js`: browser-language routing on the root and short app entry pages.
- `public/assets/icons/`: existing app icons.
- `public/assets/images/`: existing real app screenshots.
- `docs/media-plan.md`: planned product recordings and how to add them.

The generated `dist/` directory is ignored. GitHub Actions builds and checks it on every pull request. Pushes to `main` deploy the checked result through the `github-pages` environment. Configure **Settings → Pages → Source → GitHub Actions** for the initial setup.

## Stable links for repositories

Use `https://vordenken.github.io/autopip/`, or the corresponding app slug. On these short entry pages and the root, the first supported language in the browser's preference list determines the destination: German or English, with English as the fallback. Explicit `/de/` and `/en/` URLs are never redirected based on browser preferences. The language links switch between the same app under `/en/` and `/de/`.

GitHub Pages cannot choose a language on the server. The short entries therefore use a small local script with `location.replace`, preserving query strings and anchors. Without JavaScript, visitors can choose Deutsch or English on the entry page. No language preference is stored. All localized content and navigation remain rendered as HTML; direct links and the browser back button work without a client-side router.

The header keeps all six apps and the language controls visible while scrolling. On mobile it uses a compact text-only app list. The redundant related-app section at the bottom of app pages is omitted. Anchor scrolling accounts for the actual header height.

`SITE_URL` and `BASE_PATH` can be supplied to the build for another domain or a project-site preview. Defaults are `https://vordenken.github.io` and an empty base path.

## Media and project status

CoreTamer, Varan, and stimmig use real screenshots. AutoPiP, Silentio, and ShortBlock currently use clearly labeled, interactive functional sketches; they are not product recordings. Varan and stimmig remain marked as development previews and have no app-download buttons. stimmig's public repository is still empty, so its local implementation is described without publishing its source code here.

No analytics, external fonts, cookie banners, or runtime API requests. Fonts and images are served from this repository. GitHub Pages' own data processing is described on the site's privacy page.

## License

Website code: GPL-3.0-only; see `LICENSE`. App icons and screenshots remain part of their respective projects and retain their original licenses and ownership. Space Grotesk is distributed under the SIL Open Font License in `public/assets/fonts/OFL.txt`. See `ASSETS.md` for provenance.
