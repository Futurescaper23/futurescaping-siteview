# FutureScaping SiteView

Reusable React/Vite client portal template for FutureScaping drone and site visualisation projects.

## Run locally

```bash
npm install
npm run dev
```

## Configure a new project

All client and project data lives in `public/config/project.json`.

For the easiest repeatable workflow, run:

```bash
npm run new-project
```

That guided setup creates `public/config/project.json` from prompts. See `PROJECT_SETUP.md` for the full client-project checklist.

Update the JSON to change:

- Project title, client name, site name and subtitle
- Layer images in `public/assets/images`
- 360 panorama file in `public/assets/panoramas`
- External 3D model links
- Drawing, PDF, ZIP and image downloads

React components should not contain project-specific titles, paths or URLs.

## Download files

Put original exported drawing files in `public/assets/drawings` or `public/assets/downloads`, then reference them from the config. The app uses normal file links, so scaled PDFs are downloaded unchanged.

For scaled drawings, include `paperSize` and/or `scale` in the config item. The app will show the print note:

> To preserve scale, print at 100% / Actual Size. Do not use Fit to Page.

## Deploy

Build static files with:

```bash
npm run build
```

Deploy the generated `dist` folder to Netlify or any static host.
