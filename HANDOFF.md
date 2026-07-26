# PWE Finance — UI/UX Audit & Improvement Handoff

> Status: COMPLETE — 2026-07-27 audit round (ui-ux-pro-max); verified in browser, awaiting owner review/commit
> Branch: `claude/ui-ux-pro-max-audit-1ef23c`
> Design system reference: `design-system/pwe-finance/MASTER.md` (brand palette overrides below take precedence)

## 1. Audit findings (baseline)

| # | Severity | Finding |
|---|----------|---------|
| 1 | CRITICAL | `--light: #00AAE5` used as text/labels/links on white — ~2.5:1 contrast, fails WCAG AA (4.5:1). Also `.btn-primary` white-on-cyan fails. |
| 2 | HIGH | No visible `:focus-visible` styles for links/buttons; no skip-to-content link; no `<main>` landmark. |
| 3 | HIGH | No entrance/scroll animation at all; `scroll-behavior: smooth` not guarded by `prefers-reduced-motion`. |
| 4 | HIGH | Loan pages use heavy inline styles (unmaintainable, blocks animation hooks). |
| 5 | MEDIUM | Only 3 FAQs per page; no FAQPage/BreadcrumbList JSON-LD; no Open Graph/Twitter meta. |
| 6 | MEDIUM | Copy issues: "Common questions about first home buyer loan for melbourne buyers" (grammar/casing); footer content inconsistent between index and inner pages. |
| 7 | MEDIUM | `tel:04XX XXX XXX` placeholder is an invalid tel: URI (contains spaces/X). ABN/ACL are placeholders. **Do NOT invent real numbers** — keep placeholders, flag for owner (see §6). |
| 8 | LOW | Dropdown `role="menu"`/`menuitem` misused for nav links; `href="#"` on dropdown buttons. |

## 2. Design decisions (LOCKED — all agents follow)

- **Keep the existing brand** (navy `#222159`, cyan `#00AAE5`, pink `#C84B93`, Poppins). Do NOT repaint to the generic dark palette in MASTER.md; adopt its *principles*: WCAG AA contrast, trust-blue, visible focus, reduced motion.
- New/changed CSS tokens (Agent A implements in `:root`, everyone references by name):
  - `--brand-cyan: #00AAE5` (decorative only: icons, large graphics, borders, dark-bg accents)
  - `--brand-blue: #0077A8` (accessible blue for text links, section labels, small icons on white; must verify ≥4.5:1 on `#fff` and `#F1F5F8`)
  - `--brand-blue-hover: #005F87`
  - `--light` stays as alias of `--brand-cyan` (legacy selectors keep working); text usages switched to `--brand-blue`.
  - Buttons: `.btn-primary` background `--brand-blue` (white text ≥4.5:1), hover `--brand-blue-hover`. `.btn-secondary` (navy) unchanged. On dark backgrounds cyan accents are fine (contrast on navy is OK).
- **Motion tier: Standard (4/10)** — subtle, meaningful, cheap:
  - Scroll reveal via IntersectionObserver + CSS class. Duration 400–500ms, `ease-out`, translateY 16–24px + fade. Stagger 60–80ms within groups.
  - Stats count-up on homepage (optional nicety), 800ms, skipped under reduced motion.
  - Everything wrapped in `@media (prefers-reduced-motion: reduce)` → no transforms, content fully visible, `scroll-behavior: auto`.
  - No-JS fallback: content visible by default; hiding only applies under `html.reveal-ready` (class added at top of `main.js`).

## 3. Shared markup contract (agents must use these exact hooks)

**Reveal animation** (Agents B/C add attributes; Agent A implements behavior):
- `data-reveal` on any element to fade/slide in on scroll.
- `data-reveal-group` on a grid/list container → its direct children auto-stagger (children do NOT need their own `data-reveal`).
- `data-count-to="90"` (+ optional `data-count-suffix="+"`) on homepage `.stat-number` elements.
- Apply to at most 1–2 element groups per viewport; hero content, section headers, card grids. Never animate the header/nav/footer.

**Skip link + landmark** (Agents B/C on every page):
- `<a class="skip-link" href="#main">Skip to main content</a>` as first element inside `<body>`.
- Wrap page content between header and footer in `<main id="main">…</main>`.

**Content classes replacing inline styles** (Agent A defines; Agent C applies):
- `.content-section` — white section, `padding: 60px 0` (mobile-safe)
- `.content-narrow` — `max-width: 800px; margin: 0 auto`
- `.info-card-grid` — vertical grid, gap 24px
- `.info-card` — light-back card, radius-md, padding 28px; `h3` 1.15rem navy w/ icon; `p` muted
- `.info-card h3 i` — `color: var(--brand-blue); margin-right: 8px;`
- `.section-cta` — centered, margin-top 48px

**FAQ**: keep existing `.faq-item / .faq-question / .faq-answer` markup and JS. Target 5–6 FAQs per page (index + every loan page). Each FAQ page section gets a matching `FAQPage` JSON-LD script whose Q/A text mirrors the visible content exactly.

**SEO head block** (Agents B/C, every public page): `og:title`, `og:description`, `og:type` (`website`/`article` for blog posts), `og:url` (mirror canonical), `og:site_name`, `twitter:card=summary`. No `og:image` (no real image asset — do not fabricate). Loan pages also get `BreadcrumbList` JSON-LD matching the visible breadcrumb. `index.html` gets one `FinancialService` JSON-LD (name, url, areaServed Melbourne VIC; omit phone/ABN — placeholders must not go into structured data).

## 4. Compliance guardrails (Australian credit — every content agent)

- General information only; never promise approval, savings, rates, or outcomes. Use "may", "can depend on", "subject to lender criteria".
- Keep/extend existing disclaimers; do not weaken them.
- Do not invent: phone numbers, ABN, ACL numbers, awards, lender names, statistics, testimonials, staff names.
- Grants/concessions wording: always "eligibility rules change — verify with the relevant authority".
- FAQ answers must stay generic-educational, not personal advice.

## 5. File ownership (no agent touches another's files)

| Agent | Files |
|-------|-------|
| A — design-motion | `css/style.css`, `js/main.js` |
| B — core-content | `index.html`, `about.html`, `contact.html`, `calculators.html`, `blog.html`, `blog-post-1/2/3.html` |
| C — loan-pages | `home-loans.html`, `first-home-loans.html`, `next-home-loans.html`, `investment-loans.html`, `refinancing.html`, `other-loans.html`, `commercial-business-loans.html`, `construction-loans.html`, `smsf-loans.html`, `privacy-policy.html`, `terms-and-conditions.html` |
| Coordinator | `HANDOFF.md`, `README.md`, `design-system/`, verification, `sitemap.xml` if pages change |
| Untouched | `admin.html`, `functions/`, `icons/`, `robots.txt` |

## 6. Owner TODO before launch (not for agents)

- Replace `04XX XXX XXX` with the real phone number (and fix `tel:` hrefs to digits-only).
- Replace ABN / Australian Credit Licence placeholders in the footer.
- Point `Feedback & Complaints` footer link at a real page or mailto.
- Confirm canonical domain (currently `kenshinice-ai.github.io/pwe-finance`).
- Verify the "over 15 years" experience claim on about.html (pre-existing copy; flagged by Agent B — HANDOFF §4 bans unverified stats).
- Pre-existing numeric content kept as-is (rate figures in blog-post-1, grant amounts in blog-post-2, deposit/LVR ranges on loan pages, "90+ lenders") — all carry disclaimers, but confirm they are current.

## 7. Handoff log

- 2026-07-27 — Coordinator: audit complete, design system persisted (`design-system/pwe-finance/MASTER.md`), contract locked, agents A/B/C dispatched.
- 2026-07-27 — **Agent A (design-motion) DONE**: `--brand-blue: #0077A8` (5.0:1 on #fff, 4.56:1 on #F1F5F8, white-on-blue 5.0:1); ~20 text/UI selectors switched from cyan to brand-blue (incl. `.btn-primary`, nav underline, `.calc-tab-btn.active`, back-to-top); `.skip-link` + `:focus-visible` outlines; reveal system (`html.reveal-ready` guard, IO threshold 0.15, 70ms stagger cap 420ms, `.is-visible`), count-up for `[data-count-to]`, full `prefers-reduced-motion` fallbacks; contract content classes added. Cyan kept on dark navy (5.51:1) and decorative gradients.
- 2026-07-27 — **Agent B (core-content) DONE**: 8 files — skip-link/`<main>`/OG+twitter meta everywhere; index FAQ 3→6 + FAQPage & FinancialService JSON-LD; contact gained 4-question FAQ + JSON-LD; Article JSON-LD on 3 blog posts (dates from visible page content); missing canonicals added (about, contact, blog); calculators' inner `<main class="calc-app">` demoted to `<div>` (single landmark, class-selector safe); compliance softening across about/contact/blog (incl. "Floating"→"Fixed Rate Borrowers" heading fix, "VicRevenue"→"State Revenue Office of Victoria", grant-eligibility verify-with-authority wording).
- 2026-07-27 — **Agent C (loan-pages) DONE**: 11 files — inline styles fully replaced with contract classes on 9 loan pages; FAQ 5–6 per page with grammar-fixed headings; FAQPage + BreadcrumbList JSON-LD (programmatically mirrored); footers unified with index (placeholders kept); missing canonicals (other-loans, privacy, terms); breadcrumb added to home-loans; FAQ section added to other-loans; compliance rewrites (CGT main-residence error fixed on next-home, SMSF lease-back wording, "secure/we'll find" → compare/help language).
- 2026-07-27 — **Coordinator verification**: all 19 pages pass automated checks (1× skip-link, 1× `<main id="main">`, ≥5 OG tags, all JSON-LD parses); browser walkthrough of index + first-home-loans (reveal/stagger, count-up, FAQ accordion aria-sync all working; zero console errors); fixed 2 remaining white-bg cyan links in privacy-policy.html → `var(--brand-blue)`; sitemap lastmod bumped to 2026-07-27. Note: IntersectionObserver reveal correctly pauses in hidden/background tabs (browser throttling — expected). Skip-link `:focus` couldn't be simulated in the headless pane (document lacks OS focus) — CSS rule verified present/correct; re-check manually with Tab key.
