# assets

## hero-runway.jpg

The hero looks for a photograph at `assets/hero-runway.jpg`.

Save the aerial runway shot here with exactly that filename and it renders
automatically — no code change needed. Nothing else in the project references
this folder.

**Until the file exists**, the browser logs one harmless 404 for it and the hero
falls back to the CSS runway (asphalt gradient, amber slab seams, dashed
centerline, warm top-right sun wash), which is designed to stand on its own.

If you decide against a photo entirely, delete the `background-image` line in the
`.hero-photo` rule in `../styles.css` and the 404 goes away.

### What works well here

- **Landscape, wide.** It is cropped to `cover` at `center 38%`, so the subject
  should sit slightly above the middle.
- **At least 2000px wide** for sharpness on large displays.
- **Dark and low-contrast in the upper left**, where the headline sits. The scrim
  layer darkens that side, but a busy photo there still costs legibility.
- **Compress it.** Aim under ~400KB; this is a decorative background and it is the
  only binary asset on the page.

The photo renders at `opacity: .58` beneath a navy scrim, so it reads as texture
rather than as a picture. If yours comes out too dim or too loud, adjust that
opacity in the `.hero-photo` rule.
