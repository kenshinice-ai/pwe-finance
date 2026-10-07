# PWE Finance — Deployment Plan & Checklist

> Last updated: 2026-07-27 (bilingual EN/中文 release). Companion docs: `README.md` (conventions), `HANDOFF.md` (audit log + contracts), `ADMIN_BLOG_WORKFLOW.md` (Cloudflare admin publishing).

## 1. Architecture

| Layer | Platform | Source |
|-------|----------|--------|
| Public site (EN, 19 pages + 404) | GitHub Pages, project site | repo `kenshinice-ai/pwe-finance`, branch `main`, root folder |
| Public site (中文, 19 pages) | Same — served from `zh/` subfolder | same repo/branch |
| Admin blog publisher + API | Cloudflare Workers & Pages project `pwe-finance` | `admin.html`, `functions/` |
| Contact form backend | Formspree (client-side POST) | `contact.html` / `zh/contact.html` form `action` |

Production base URL (canonical everywhere): `https://kenshinice-ai.github.io/pwe-finance/`

## 2. Launch blockers (must be fixed BEFORE public launch)

These values are placeholders on purpose. The repo deploys as-is to the public site on GitHub Pages. It is live there now with the placeholders (checked 2026-10-07). There is no separate staging environment. Do not launch to real customers until you replace every item below:

1. **Phone number** — `04XX XXX XXX` appears in the header/footer/contact of every page (EN + zh). Replace display text AND `tel:` hrefs (`tel:` value must be digits only, e.g. `tel:0412345678`). Site-wide find & replace: `04XX XXX XXX`.
2. **ABN + Australian Credit Licence** — footer line `ABN XX XXX XXX XXX | Australian Credit Licence XXXXXX` (and zh equivalent). Displaying a real ACL number is a regulatory requirement for credit assistance advertising (NCCP Act); do not launch without it.
3. **Feedback & Complaints link** — currently `href="#"`. Point to a complaints page or `mailto:`. Credit licensees must have an internal dispute resolution path and AFCA membership; the page/text should state both.
4. **Formspree endpoint** — confirm the form `action` URL in `contact.html` and `zh/contact.html` points to the live Formspree form (JS falls back to a visible "not configured" error otherwise).
5. **Verify factual claims** — "over 15 years" (about page), "90+ lenders on panel", rate/grant figures in blog posts (flagged in `HANDOFF.md` §6).
6. **Social links** — footer Facebook/Instagram/LinkedIn are `#` placeholders; fill or remove.

## 3. Deploy procedure (public site)

GitHub Pages redeploys automatically on push to `main`:

```bash
git push origin main
```

1. Merge/push the release to `main` (worktree branch → `main` fast-forward, as done for previous releases).
2. Wait for the `pages-build-deployment` workflow to finish (repo → Actions tab, typically < 2 min).
3. Run the post-deploy verification (§5).

Rollback: `git revert <bad-commit> && git push origin main` (Pages redeploys the revert). Never force-push `main` — the Cloudflare blog publisher commits to it too.

## 4. Cloudflare admin layer (one-time setup / unchanged by this release)

Per `ADMIN_BLOG_WORKFLOW.md`: project `pwe-finance` with secrets `ADMIN_PASSWORD`, `GITHUB_TOKEN` (+ recommended `SESSION_SECRET`, optional IP allowlist and `GITHUB_*`/`PUBLIC_SITE_BASE` vars). No changes needed for the bilingual release, but note the **known limitation**: the publisher creates EN blog posts only (`blog-post-{slug}.html` + `blog.html` + `sitemap.xml`); it does not create a `zh/` translation. Translate new posts manually (follow `HANDOFF.md` §7 glossary) or accept EN-only new posts — the zh blog index will simply not list them until translated.

## 5. Post-deploy verification checklist

Technical:
- [ ] `https://kenshinice-ai.github.io/pwe-finance/` and `/zh/index.html` both load; language toggle round-trips EN↔中文 on at least: index, first-home-loans, calculators, contact.
- [ ] `/robots.txt` reachable; `/sitemap.xml` valid and lists 38 URLs; `/404.html` renders for a bogus URL (e.g. `/pwe-finance/nope`).
- [ ] Contact form: submit a test enquiry on the EN and zh pages; confirm Formspree receipt and the success message in the matching language.
- [ ] Calculators work on `/zh/calculators.html` (repayment + borrowing tabs) — inline JS was translated, so spot-check the math renders.
- [ ] No mixed-content/console errors (fonts + Font Awesome are the only third-party origins).
- [ ] Mobile pass at 375px: header fits (phone number hides ≤480px by design), nav toggle, FAQ accordion, reduced-motion honored (OS setting).

SEO (once live):
- [ ] Google Search Console: add property, submit `sitemap.xml`.
- [ ] URL Inspection on index + one loan page + one zh page — confirm canonical + hreflang pairs are read as intended (`en` ↔ `zh` + `x-default`).
- [ ] Rich Results Test on index (FinancialService + FAQPage), a loan page (FAQPage + BreadcrumbList), a blog post (Article).
- [ ] Lighthouse (or PageSpeed Insights) on index EN + zh: expect ≥90 on Accessibility/SEO/Best Practices; Performance dominated by webfonts — acceptable for a static site.
- [ ] Bing Webmaster Tools (optional) — same sitemap.

Compliance (Australian credit):
- [ ] Real ACL number displayed in footer of every page (EN + zh).
- [ ] Disclaimers render on every page incl. zh (仅供一般参考 wording).
- [ ] No page promises approval/outcomes (audited 2026-07-27; re-check any copy added since).
- [ ] Privacy policy + complaints path linked from every footer; zh legal pages show the "English version prevails" note.

## 6. Custom domain migration (when ready, e.g. `pwefinance.com.au`)

The canonical base URL is hard-coded in: every page's `<link rel="canonical">`, the 3 hreflang lines, `og:url`, all JSON-LD `url`/`item` fields, `sitemap.xml`, `robots.txt` (Sitemap line), `404.html` links, and Cloudflare `PUBLIC_SITE_BASE`. Migration steps:

1. DNS: `CNAME www → kenshinice-ai.github.io`; apex via ALIAS/ANAME or A records to GitHub Pages IPs.
2. Repo → Settings → Pages → Custom domain (creates `CNAME` file); enforce HTTPS after cert issuance.
3. Site-wide replace `https://kenshinice-ai.github.io/pwe-finance` → `https://www.pwefinance.com.au` (39 HTML files + sitemap + robots + 404). Note the path prefix `/pwe-finance/` disappears — hrefs are already relative so only absolute URLs change.
4. Update Cloudflare `PUBLIC_SITE_BASE`; re-verify admin publishing.
5. Search Console: add the new property, submit sitemap, use Change of Address.

## 7. Ongoing maintenance

- Keep EN and zh page pairs in sync — any copy change on one side must be mirrored (glossary + style guide in `HANDOFF.md` §7). JSON-LD must always mirror visible text.
- New pages: add EN + zh versions, toggle links both ways, hreflang trio, sitemap entries (both URLs), nav/footer links on both sides.
- Design changes: respect `HANDOFF.md` §2 tokens (brand-blue for text on light backgrounds) and reduced-motion guarantees.
- Blog publishing via admin creates EN-only artifacts (see §4).
