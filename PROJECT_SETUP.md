# FutureScaping SiteView Project Setup

Use this checklist each time you create a client SiteView portal.

## 1. Duplicate The Template

Copy this whole folder and rename it for the client or site.

Example names:

- `SiteView-Demo-A`
- `SiteView-Client-Property`
- `SiteView-Demo-Planning-Pack`

Keep one clean copy as the master template.

## 2. Add The Project Assets

Put exported files into these folders:

- `public/assets/images/` for main image, height colours, contour lines and other image layers
- `public/assets/panoramas/` for 360 panoramas
- `public/assets/drawings/` for scaled PDF drawings
- `public/assets/downloads/` for ZIP files and other supporting downloads

Use simple filenames with no spaces where possible, for example:

- `main-image.jpg`
- `height-colours.png`
- `contour-lines.png`
- `site-panorama.jpg`
- `drawing-pack.zip`

## 3. Generate The Config

Run:

```bash
npm run new-project
```

Answer the prompts. This writes:

```text
public/config/project.json
```

The app reads this file at runtime, so project names, asset paths, 360 view, model links and downloads should live there rather than in React components.

## 4. Preview Locally

Run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually:

```text
http://127.0.0.1:5173/
```

Check:

- Main image loads
- Slider mode compares layers correctly
- Transparency mode toggles and blends layers
- 360 button only appears when a panorama is configured
- 3D model button only appears when a model URL is configured
- Downloads open/download the original files
- Scaled drawings show the print-at-actual-size note

## 5. Build For Netlify

Run:

```bash
npm run build
```

Upload the generated `dist` folder to Netlify.

## Fast Manual Edit

If you do not want to use the setup script, copy:

```text
public/config/project.example.json
```

Then edit it and save it as:

```text
public/config/project.json
```
