# AeroBridge — Aviation Maintenance Referral Website

A static, dependency-free marketing site for an aviation **maintenance referral service** —
a business that connects aircraft owners and operators with qualified maintenance
providers, and does **not** perform certificated maintenance itself.

Built with plain HTML, CSS, and JavaScript. No build step, no framework, no package
manager, no external requests.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire single-page site: header, hero, services, aircraft types, process, why-us, FAQ, request form, footer. |
| `styles.css` | All styling: design tokens, layout, components, scroll-reveal animation, responsive breakpoints, reduced-motion and print rules. |
| `script.js` | Scroll reveal, smooth scrolling, mobile nav, sticky-header state, FAQ accordion, form validation and submission. |
| `favicon.svg` | Inline-drawn navy/blue mark. No binary assets. |
| `robots.txt` | Allows all crawlers. |
| `vercel.json` | Vercel static config: clean URLs, security headers, long-lived asset caching. |
| `.gitignore` | Ignores OS/editor noise, `.vercel`, and the local `_backup/` folder. |

`_backup/old-index.html.bak` holds an unrelated pre-existing HVAC page that was in this
folder before the build. It is gitignored and not part of the site — delete it whenever
you like.

---

## Running it locally

No dependencies. Any static server works:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (Opening `index.html` directly by double-clicking
also works, since nothing is fetched over the network.)

---

## The referral disclaimer

The "we refer, we don't wrench" positioning appears in four places, deliberately:

1. A bordered callout directly under the hero CTA buttons.
2. The note under the Services grid (scope, pricing, and airworthiness sit with the provider).
3. The first FAQ answer, in full detail.
4. The footer legal block, as the strongest and most complete statement.

The site never claims to hold certificates, sign off maintenance, or approve aircraft
for return to service, and it states that the maintenance contract is between the owner
and the provider.

---

## The request form

Fields: **name, email, phone, aircraft type, tail number (optional), airport or location,
maintenance needed, urgency, additional details.** Plus an optional make/model field, a
consent checkbox, and a hidden honeypot for bots.

Validation runs in JavaScript (`novalidate` on the form) so error messages are consistent
across browsers, tied to inputs with `aria-describedby`, marked with `aria-invalid`, and
cleared as soon as the user starts correcting the field.

### Wiring it to a real backend

Out of the box the form runs in **demo mode**: it validates, shows the success panel, and
logs the payload to the console — it does not send anything anywhere. To make it live, set
the endpoint at the top of `script.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/yourid';
```

It posts JSON via `fetch`, so anything that accepts a JSON `POST` works: Formspree, Basin,
Getform, or your own Vercel serverless function at `/api/request`.

Until that constant is set, **no submitted information leaves the browser.**

---

## Motion and accessibility

- Scroll reveal is a 420 ms fade plus a 16 px upward slide, driven by `IntersectionObserver`,
  with a 55 ms-per-step stagger inside each group. Each element animates once, then releases
  its `will-change` hint.
- `prefers-reduced-motion: reduce` removes the slide, the transitions, the smooth scrolling,
  and the hover lifts — content simply appears. This is handled in both CSS and JS, and it
  responds if the setting is changed mid-session.
- With JavaScript disabled, the `no-js` class on `<html>` keeps every reveal element fully
  visible, so the page still reads normally.
- Skip link, visible focus rings, semantic landmarks, an accessible accordion
  (`aria-expanded` / `aria-controls`), a labelled radio group for urgency, and focus that
  follows in-page navigation.

---

## Responsive behaviour

Breakpoints at 1000px, 860px, 760px, and 440px. The 4-across grids step down to 2 and then
1, the process arrows disappear once the steps stack, the desktop nav becomes a toggled
overlay menu below 760px, the hero buttons go full-width, and the urgency selector collapses
from four columns to two to one.

---

## Deploying

### GitHub

```bash
git init
git add .
git commit -m "Add AeroBridge referral site"
```

Push to a repository as usual. GitHub Pages will serve it from the repo root with no
configuration, since `index.html` is at the top level.

### Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). Vercel detects a static
site — leave the framework preset as **Other**, with no build command and no output
directory. `vercel.json` handles headers and clean URLs. Or from the CLI:

```bash
vercel
```

---

## Customising

- **Brand name.** "AeroBridge" is a placeholder. It appears in the `<title>`, meta tags, the
  header and footer brand blocks, the hero disclaimer, the FAQ, and the footer legal text.
- **Contact details.** `dispatch@example.com` and `(555) 000-0000` in the footer, and the
  fallback email in the form's error message in `script.js`.
- **Colors.** Every color is a custom property in the `:root` block at the top of `styles.css`.
- **Copy.** Aircraft types, services, and FAQ answers are plain markup in `index.html`.

Before going live, have the disclaimer and FAQ language reviewed by counsel familiar with
your jurisdiction and with how you intend to describe the provider vetting you perform.
