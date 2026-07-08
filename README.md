# Garment Cost Calculator

Static mobile-first garment costing calculator.

Current build: `v2.18`

## Files

- `index.html` - app structure
- `style.css` - responsive styling
- `app.js` - calculations, Supabase auth, saves, exports, and UI state
- `assets/icons/` - v2 icon assets exported from Figma
- `supabase-schema.sql` - database table and row-level security setup for account saves

## Supabase Setup

Run `supabase-schema.sql` in the Supabase SQL editor before relying on cloud saves.
Until that table exists, signed-in users can still save costings on the current browser as a fallback.

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy To GitHub Pages

1. Push these files to a GitHub repository.
2. In GitHub, open the repository.
3. Go to Settings > Pages.
4. Under Build and deployment, set Source to "Deploy from a branch".
5. Set Branch to `main` and Folder to `/root`.
6. Save.
7. Wait for GitHub Pages to publish the site.

The finished URL will usually look like:

```txt
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```
