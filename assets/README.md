# assets

## hero-runway.jpg

The hero looks for a photograph at `assets/hero-runway.jpg`.

Save the sunset landing shot here with exactly that filename and it renders
automatically — no code change needed. Nothing else in the project references
this folder.

### What happens when you add it

`script.js` probes for the file on load and puts either `has-hero-photo` or
`no-hero-photo` on `<html>`. That switch matters, because the hero also contains a
*drawn* CSS runway (amber dashed centerline, angled slab seams) so the page works
with no image at all. Layered over a photo that already shows a runway, those
markings would double up — so when the photo loads they hide themselves, the
synthetic sun glow drops to 35%, and the scrim takes over the legibility work.

**Until the file exists**, the browser logs one harmless 404 and the drawn runway
carries the hero on its own.

### Tuning for this photo

The hero is currently set up for the sunset approach shot:

- `background-position: center 44%` — biased above centre so the aircraft and the
  horizon survive the crop on a wide, short hero.
- `opacity: .72` under a navy scrim, so it reads as a photograph rather than a
  flat wash.
- The scrim is heavier on the left (95% → 46% across) to protect the headline
  against the bright sky, while leaving the right side open enough to still read
  as a sunset.

Both live in the `.hero-photo` and `.has-hero-photo .hero-scrim` rules in
`../styles.css`. If the headline looks strained against the sky, raise the first
stop of the 95deg gradient; if the photo feels washed out, raise the opacity.

### File requirements

- **Landscape, at least 2560px wide** — ideally 3840px if you want it crisp on 4K
  displays. It is the only binary asset on the site.
- **Compress it.** A full-resolution JPEG can easily hit several MB, which is a
  poor trade for a background. Aim for under ~500KB at quality ~80; consider also
  saving a `.webp` if you want to get stricter about it.
- **Check the licence** before deploying. If this came from a stock library, make
  sure the licence covers commercial use on a public site.
