# Sidetrek Map — Update Workflows

Two types of updates, depending on what changed.

---

## Update A: Location counts changed (most common)

Use this when numbers change but no country flips between 0 and non-zero coverage.
No Mapbox re-upload needed.

1. Export both layers from QGIS as CSV (right-click layer → Export → Save As → CSV)
   - `csv-nations.csv`
   - `csv-subd.csv`
2. Put them in your Sidetrek folder
3. In VS Code terminal, run:
   ```
   python generate_loc_data.py csv-nations.csv csv-subd.csv
   ```
4. Check it worked — open `loc_data.json` and spot-check a few numbers
5. Test locally:
   ```
   python -m http.server 8000
   ```
   Open `http://localhost:8000`, click some countries/subdivisions, confirm popups show correct numbers
6. Push to GitHub:
   ```
   git add .
   git commit -m "Update location counts"
   git push
   ```

For quick manual tweaks (e.g. testing one subdivision), you can edit `loc_data.json` directly — the JS calculates country totals and world total dynamically from the subdivision numbers.

---

## Update B: A country's coverage status changes (rare)

Use this when a country goes from 0 locations to having coverage (e.g. Georgia gets Street View), or vice versa. The fill colours (amber vs grey) come from the tileset, so you need to re-upload.

1. Update `loc_count` in QGIS for both the nation and subdivision layers
2. Export both layers as GeoJSON:
   - `nation_final.geojson`
   - `subd_final.geojson`
3. Go to [studio.mapbox.com/tilesets](https://studio.mapbox.com/tilesets)
4. Upload `nation_final.geojson` as a new tileset — copy the tileset ID (e.g. `wolftrekker.abc12345`)
5. Upload `subd_final.geojson` as a new tileset — copy the tileset ID
6. Get the source layer names for both. Open these URLs in your browser (swap in the new tileset IDs):
   ```
   https://api.mapbox.com/v4/TILESET_ID.json?secure&access_token=pk.eyJ1Ijoid29sZnRyZWtrZXIiLCJhIjoiY21uZXF6ajFsMDJqaDJxcHhsczh6OHpsZyJ9.X2fgaX86Ppzrz8a8i6RUmA
   ```
   Look for `"id"` inside `"vector_layers"` — that's the source layer name
7. Update `script.js` — change these four lines at the top:
   ```js
   const TILESET_NATION = 'wolftrekker.NEW_ID';
   const TILESET_SUBD = 'wolftrekker.NEW_ID';
   const SOURCE_LAYER_NATION = 'new_source_layer_name';
   const SOURCE_LAYER_SUBD = 'new_source_layer_name';
   ```
8. Also update `loc_data.json` (follow Update A steps 1-4)
9. Test locally with `python -m http.server 8000`
10. Push:
    ```
    git add .
    git commit -m "Update tilesets and location counts"
    git push
    ```

---

## Quick reference

| What changed | What to do |
|---|---|
| Just numbers | Update A — regenerate JSON, push |
| Country gained/lost coverage | Update B — re-upload tilesets + regenerate JSON, push |
| Polygon boundaries changed | Update B |
| Basemap style tweaks | Edit in Mapbox Studio, publish — no code changes needed |

## Key URLs

- **Local testing:** `http://localhost:8000`
- **Live site:** `wolftrekker.github.io/sidetrek`
- **Mapbox tilesets:** `studio.mapbox.com/tilesets`
- **Mapbox account/token:** `account.mapbox.com`

## Current tileset IDs (update this when you re-upload)

- Nation: `wolftrekker.9w17zmgf` / source layer: `nations_final_v6-61z1fb`
- Subdivision: `wolftrekker.cpkdh9t8` / source layer: `subd_final_v5-66qr8b`
- Basemap style: `mapbox://styles/wolftrekker/cmnet941i003801sfcnnx9zpy`
- Public token: `pk.eyJ1Ijoid29sZnRyZWtrZXIiLCJhIjoiY21uZXF6ajFsMDJqaDJxcHhsczh6OHpsZyJ9.X2fgaX86Ppzrz8a8i6RUmA`
