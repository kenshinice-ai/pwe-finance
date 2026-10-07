# PWE Finance — UI/UX Audit & Improvement Handoff

> Status (updated 2026-10-07): Both 2026-07-27 rounds are on the `main` branch. Audit round: 83a6f63. Bilingual round: 0d5445a.
> The public site is live on GitHub Pages with placeholder phone, ABN and ACL number. Launch blockers: `DEPLOYMENT.md` §2.
> 2026-10-07: every public page footer now carries the ABN / ACL number line. `404.html` has no footer, so it has none.
> Branch: `main`. The audit branch `claude/ui-ux-pro-max-audit-1ef23c` is merged into it.
> Design system reference: `design-system/pwe-finance/MASTER.md` (brand palette overrides below take precedence)

## 等 Lee

- **[给料] 真实的 ACL（Australian Credit Licence）号码** — 页脚仍是 XXXXXX 占位符，DEPLOYMENT.md:63 要求上线前换成真实号码 · 不给则站点不能正式上线 · 自 2026-10-07

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
- Optional: add a "(中文)" marker to the Formspree hidden `_subject` value in `zh/contact.html` to flag Chinese-speaking leads.
- Launch blockers consolidated in `DEPLOYMENT.md` §2.

## 7. Bilingual (EN/中文) contract — 2026-07-27 round 2

**Architecture (LOCKED):** mirrored static pages under `zh/` (e.g. `zh/index.html`, `zh/first-home-loans.html`). No JS-swap i18n, no auto-redirect. Toggle is a plain link between equivalents. Simplified Chinese (`html lang="zh-CN"`), audience: Melbourne Chinese-speaking home buyers/investors.

**Fonts:** zh pages load Poppins + Noto Sans SC (weights 400;500;600;700, `display=swap`) in ONE `<link>`:
`https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap`
CSS already scopes `html[lang="zh-CN"]` overrides (font stack, letter-spacing, line-height) — zh pages need NO extra CSS.

**Language toggle (exact markup):**
- EN pages, inside `.header-actions`, immediately BEFORE the hamburger button:
  `<a href="zh/<same-file>.html" class="lang-toggle" lang="zh-CN" hreflang="zh" aria-label="切换到中文版">中文</a>`
  (index.html → `zh/index.html`)
- zh pages, same position:
  `<a href="../<same-file>.html" class="lang-toggle" lang="en" hreflang="en" aria-label="Switch to English">EN</a>`
- Legal pages both link to their translated counterpart the same way. No toggle on admin.html.

**hreflang (both sides, in `<head>` after canonical):**
```
<link rel="alternate" hreflang="en" href="https://kenshinice-ai.github.io/pwe-finance/<file>.html">
<link rel="alternate" hreflang="zh" href="https://kenshinice-ai.github.io/pwe-finance/zh/<file>.html">
<link rel="alternate" hreflang="x-default" href="https://kenshinice-ai.github.io/pwe-finance/<file>.html">
```
(index uses `…/pwe-finance/` and `…/pwe-finance/zh/index.html`). zh pages: canonical = the zh URL; keep the same 3 hreflang lines; `og:url` mirrors zh canonical; add `<meta property="og:locale" content="zh_CN">`.

**zh page requirements:**
- Asset paths gain `../` (`../css/style.css`, `../js/main.js`, `../icons/...`). Internal nav/footer/CTA links point to sibling zh pages (`contact.html` → `contact.html` within zh/). `tel:`/`mailto:` unchanged.
- `<html lang="zh-CN">`; translate `<title>`/meta description (Melbourne SEO keywords in Chinese, e.g. 墨尔本贷款经纪); JSON-LD translated to match visible zh text exactly, keep same @type structure.
- Keep ALL structural markup, classes, ids, `data-reveal`/`data-reveal-group`/`data-count-to` hooks identical to the EN source. Only text content, lang, head meta, and link targets change.
- Calculators: translate visible labels AND user-facing strings inside the inline `<script>` (result labels, units like "/month" → "/月") WITHOUT touching logic, ids, or math. If a string's role is ambiguous, leave it in English rather than break the calculator.
- Legal pages (privacy/terms): translate, and append one line at the top of the content: 「本页面为英文版本的翻译，仅供参考。如中英文版本存在歧义，以<a href="../privacy-policy.html">英文版本</a>为准。」(adjust link per page).

**Translation style guide (精准度红线):**
- 简体中文，书面但不生硬；称呼用「您」；禁止机翻腔（no word-for-word English syntax）。公司名恒为 "PWE Finance"；Melbourne → 墨尔本；Victoria/VIC → 维多利亚州。
- 数字、百分比、货币保留阿拉伯数字与 $ 符号；日期用 2026年6月15日 格式。
- 澳洲特有术语首次出现用「中文（英文缩写）」，之后可用缩写。
- 合规语气对等翻译：may → 可能/或可，"general information only" → 仅供一般参考，不构成个人建议。绝不把条件句translate成承诺句。
- 中文标点（，。、「」）用于中文句子；专有名词内保留英文标点。

**Glossary (BINDING — use exactly these renderings):**
| EN | 中文 |
|----|------|
| mortgage broker | 按揭贷款经纪人（broker） |
| lender / lender panel | 贷款机构 / 合作贷款机构 |
| First Home Loans | 首次置业贷款 |
| Next Home Loans | 换房贷款 |
| Investment Loans | 投资房贷款 |
| Refinancing | 转贷（Refinance） |
| Commercial & Business Loans | 商业与企业贷款 |
| Construction Loans | 建筑贷款 |
| SMSF Loans | 自管养老金（SMSF）贷款 |
| deposit | 首付 |
| pre-approval | 预批（Pre-approval） |
| borrowing capacity | 借贷能力 |
| settlement | 交割 |
| Lender's Mortgage Insurance (LMI) | 贷款机构抵押保险（LMI） |
| stamp duty | 印花税 |
| First Home Owner Grant | 首次置业补贴（FHOG） |
| State Revenue Office of Victoria | 维多利亚州税务局（SRO） |
| LVR (loan-to-value ratio) | 贷款价值比（LVR） |
| equity | 房屋净值 |
| offset account | 对冲账户 |
| comparison rate | 比较利率 |
| guarantor | 担保人 |
| bridging finance | 过桥贷款 |
| progressive drawdown | 分阶段放款 |
| variable / fixed rate | 浮动利率 / 固定利率 |
| repayments | 还款 |
| free assessment | 免费评估 |
| Australian Credit Licence | 澳大利亚信贷牌照 |
| capital gains tax (CGT) | 资本利得税（CGT） |
| Book a Free Assessment | 预约免费评估 |
| Contact Us | 联系我们 |
| Calculators | 贷款计算器 |
| Blog | 博客 |
| About | 关于我们 |
| Skip to main content | 跳转到主要内容 |

**File ownership (round 2):**
| Agent | Files |
|-------|-------|
| Coordinator | `css/style.css`, `js/main.js` (lang overrides, toggle style, form-message i18n), `HANDOFF.md`, `README.md`, `sitemap.xml` |
| D — zh-core | CREATE `zh/index.html`, `zh/about.html`, `zh/contact.html`, `zh/calculators.html`, `zh/blog.html`, `zh/blog-post-1/2/3.html` |
| E — zh-loans | CREATE `zh/home-loans.html`, `zh/first-home-loans.html`, `zh/next-home-loans.html`, `zh/investment-loans.html`, `zh/refinancing.html`, `zh/other-loans.html`, `zh/commercial-business-loans.html`, `zh/construction-loans.html`, `zh/smsf-loans.html`, `zh/privacy-policy.html`, `zh/terms-and-conditions.html` |
| F — en-toggle | EDIT all 19 EN pages: add `.lang-toggle` link + 3 hreflang lines ONLY (no other changes) |

## 8. Handoff log

- 2026-07-27 — Coordinator: audit complete, design system persisted (`design-system/pwe-finance/MASTER.md`), contract locked, agents A/B/C dispatched.
- 2026-07-27 — **Agent A (design-motion) DONE**: `--brand-blue: #0077A8` (5.0:1 on #fff, 4.56:1 on #F1F5F8, white-on-blue 5.0:1); ~20 text/UI selectors switched from cyan to brand-blue (incl. `.btn-primary`, nav underline, `.calc-tab-btn.active`, back-to-top); `.skip-link` + `:focus-visible` outlines; reveal system (`html.reveal-ready` guard, IO threshold 0.15, 70ms stagger cap 420ms, `.is-visible`), count-up for `[data-count-to]`, full `prefers-reduced-motion` fallbacks; contract content classes added. Cyan kept on dark navy (5.51:1) and decorative gradients.
- 2026-07-27 — **Agent B (core-content) DONE**: 8 files — skip-link/`<main>`/OG+twitter meta everywhere; index FAQ 3→6 + FAQPage & FinancialService JSON-LD; contact gained 4-question FAQ + JSON-LD; Article JSON-LD on 3 blog posts (dates from visible page content); missing canonicals added (about, contact, blog); calculators' inner `<main class="calc-app">` demoted to `<div>` (single landmark, class-selector safe); compliance softening across about/contact/blog (incl. "Floating"→"Fixed Rate Borrowers" heading fix, "VicRevenue"→"State Revenue Office of Victoria", grant-eligibility verify-with-authority wording).
- 2026-07-27 — **Agent C (loan-pages) DONE**: 11 files — inline styles fully replaced with contract classes on 9 loan pages; FAQ 5–6 per page with grammar-fixed headings; FAQPage + BreadcrumbList JSON-LD (programmatically mirrored); footers unified with index (placeholders kept); missing canonicals (other-loans, privacy, terms); breadcrumb added to home-loans; FAQ section added to other-loans; compliance rewrites (CGT main-residence error fixed on next-home, SMSF lease-back wording, "secure/we'll find" → compare/help language).
### Round 2 — Bilingual (EN/中文)

- 2026-07-27 — Coordinator: bilingual contract locked (§7: zh/ mirror architecture, glossary, toggle/hreflang specs); css/style.css gained `.lang-toggle` + `html[lang="zh-CN"]` typography overrides (Noto Sans SC stack, tightened letter-spacing, CJK line-heights); js/main.js form messages now bilingual via `FORM_MSG` keyed off page lang; sitemap 19→38 URLs; agents D/E/F dispatched.
- 2026-07-27 — **Agent F (en-toggle) DONE**: all 19 EN pages +4 lines each (3 hreflang alternates after canonical + 「中文」toggle before hamburger); per-file verification table clean.
- 2026-07-27 — **Agent E (zh-loans) DONE**: 11 zh loan/legal pages; glossary extended (负扣税、只还利息、贷款转移、有限追索借款安排（LRBA）等); legal pages translated clause-for-clause with English-prevails note; compliance conditional language preserved throughout.
- 2026-07-27 — **Agent D (zh-core) DONE**: 8 zh core pages; calculator inline JS translated data-only (node --check + diff verified; separate localStorage key `lee_calc_standalone_zh`); browser-tested zh calculator ($500k/6%/30y → $2,997.75/月) and zh form validation; JSON-LD all zh-mirrored with inLanguage zh-CN.
- 2026-07-27 — **Coordinator verification (round 2)**: 19/19 EN↔zh pairs match; every zh page passes main/skip/hreflang/og:locale/toggle-back/css-path/JSON-LD checks; every EN toggle targets an existing zh file; browser walkthrough of zh/index + zh/first-home-loans (Noto Sans SC rendering, FAQ accordion in Chinese, compliant zh disclaimer). Round-2 SEO/deploy additions: 404.html (bilingual, noindex), robots.txt Disallow /functions/, `DEPLOYMENT.md` created (architecture, launch blockers, deploy/rollback, post-deploy checks, custom-domain migration).

### Round 1 — Audit

- 2026-07-27 — **Coordinator verification**: all 19 pages pass automated checks (1× skip-link, 1× `<main id="main">`, ≥5 OG tags, all JSON-LD parses); browser walkthrough of index + first-home-loans (reveal/stagger, count-up, FAQ accordion aria-sync all working; zero console errors); fixed 2 remaining white-bg cyan links in privacy-policy.html → `var(--brand-blue)`; sitemap lastmod bumped to 2026-07-27. Note: IntersectionObserver reveal correctly pauses in hidden/background tabs (browser throttling — expected). Skip-link `:focus` couldn't be simulated in the headless pane (document lacks OS focus) — CSS rule verified present/correct; re-check manually with Tab key.
