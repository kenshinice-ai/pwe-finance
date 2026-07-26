# PWE Finance Website

Static multi-page website for PWE Finance, a Melbourne mortgage broking and finance service. The site is designed to be hosted directly on GitHub Pages or any static hosting provider.

## Pages

- `index.html` - Homepage
- `home-loans.html` - Home loans overview
- `first-home-loans.html` - First home buyer loans
- `next-home-loans.html` - Next home loans
- `investment-loans.html` - Investment loans
- `refinancing.html` - Refinancing
- `other-loans.html` - Other loans overview
- `commercial-business-loans.html` - Commercial and business loans
- `construction-loans.html` - Construction loans
- `smsf-loans.html` - SMSF loans
- `calculators.html` - Loan repayment and borrowing capacity calculators
- `about.html` - About and team page
- `blog.html` - Blog listing
- `blog-post-1.html`, `blog-post-2.html`, `blog-post-3.html` - Blog articles
- `contact.html` - Contact and enquiry form
- `privacy-policy.html` - Privacy policy
- `terms-and-conditions.html` - Terms and conditions

## Folder Structure

```text
.
├── *.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── icons/
│   ├── site.webmanifest
│   └── favicon and app icon files
└── README.md
```

## Local Preview

Because this is a static site, you can open `index.html` directly in a browser.

For a more realistic local preview, run a simple static server from the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages Deployment

1. Create a GitHub repository.
2. Commit and push the full project folder.
3. In GitHub, open `Settings` > `Pages`.
4. Set the source to the main branch and root folder.
5. Save and wait for GitHub Pages to publish the site.

The site entry point is `index.html`.

## Design System & Accessibility (2026-07 audit)

The site went through a UI/UX audit in July 2026. Key conventions now in place:

- **Design tokens** — brand palette and rules live in `design-system/pwe-finance/MASTER.md` (brand overrides in `HANDOFF.md` §2 take precedence). Cyan `#00AAE5` (`--brand-cyan`/`--light`) is decorative-only (dark backgrounds, gradients, borders); all text/UI on light backgrounds uses the WCAG AA–compliant `--brand-blue: #0077A8` (hover `--brand-blue-hover: #005F87`).
- **Accessibility** — every page has a skip link + a single `<main id="main">` landmark; keyboard focus uses visible `:focus-visible` outlines; animations fully respect `prefers-reduced-motion`.
- **Motion** — scroll-reveal via IntersectionObserver: add `data-reveal` to an element or `data-reveal-group` to a grid (children auto-stagger). Stats can count up with `data-count-to` / `data-count-suffix`. No JS or reduced motion → content simply shows.
- **Content classes** — loan-page sections use `.content-section`, `.content-narrow`, `.info-card-grid`, `.info-card`, `.section-cta` instead of inline styles.
- **SEO** — all public pages carry Open Graph/Twitter meta and canonical links; FAQ sections have matching `FAQPage` JSON-LD, loan pages have `BreadcrumbList`, the homepage has `FinancialService`, blog posts have `Article`.
- **Compliance** — copy follows the guardrails in `HANDOFF.md` §4 (general information only, no outcome promises, no invented numbers). Keep new copy consistent with these.

See `HANDOFF.md` for the full audit findings, agent handoff log, and the owner TODO list.

## Pre-Launch Checklist

- Confirm all navigation links work across desktop and mobile.
- Confirm footer links point to `privacy-policy.html` and `terms-and-conditions.html`.
- Confirm `icons/site.webmanifest` loads correctly.
- Replace placeholder phone number `04XX XXX XXX` with the real number.
- Replace placeholder ABN and Australian Credit Licence values before public launch.
- Confirm the contact form behaviour is suitable for production (client-side validation + Formspree submission).
- Review blog articles for current accuracy before publishing.
- Verify the "over 15 years" experience claim on the About page and the numeric figures kept in blog posts and loan pages (see `HANDOFF.md` §6).
- Confirm social media links are updated from `#` placeholders if they should be active.

## Maintenance Notes

- Shared site styling lives in `css/style.css`.
- Shared navigation, mobile menu, back-to-top, FAQ and contact form behaviour lives in `js/main.js`.
- If a new page is added, update the navigation and footer links where needed.
- Keep every public page to one primary `h1` for cleaner page structure.
- Avoid committing local system files such as `.DS_Store`.

