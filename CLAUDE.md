## Writing rules · STE-lite v1

Applies to: procedures, release and rollback steps, handoffs (HANDOFF, "等 Lee"), warnings, and notes for other sessions.

1. One action per step. Start with the verb. Put a condition first: "If …, do …".
2. Sentence length: at most 20 words in English, 40 characters in Chinese. Code, paths and commands do not count.
3. Give each step a success check: the expected output, status code or version. `healthy` or exit code 0 is not evidence unless the step says what it proves.
4. Write warnings as `> ⚠️`. First sentence: what to do or not do. Second: what happens if you don't. Then the reason. One hazard per warning.
5. Use active voice. Name the owner of each to-do.
6. One term, one meaning: use only the words in this repo's glossary. If a new word has two meanings, split it into two words first, then add them.
7. Date every value that can change: "measured 2026-10-03". Mark anything unchecked as "not verified" and say why. Never write a plan as done.
8. Keep steps, reasons and incident stories apart. An incident story never interrupts the steps.

Does not apply to:
- Explanations and reasons: no length limit, but lead with the conclusion.
- History logs (*-LOG.md, dated running entries): leave them as written.
- Product and brand copy in any language, App Store copy, AI prompts that visitors see.
- The format of "等 Lee" entries in handoff files: the global convention stands.
- TTS narration and voice-over scripts: never split sentences (qwen-tts measured 10 of 10 failures after splitting).
- Scripture, classical and cultural content.

Do not rewrite old docs in bulk. Tidy a section by these rules when you change it.

## Scope in this repo
- Applies to: `DEPLOYMENT.md`, `ADMIN_BLOG_WORKFLOW.md`, `HANDOFF.md`.
- Does not apply to: public site and blog copy (EN pages, `zh/` pages, blog posts). Site copy follows the EN↔zh translation glossary in `HANDOFF.md` §7, not the glossary below.

## Glossary
| Use | Meaning (one only) | Not |
|---|---|---|
| `main` branch | The default Git branch of the `pwe-finance` repo. GitHub Pages builds the public site from it. The blog publisher also commits to it, so never force-push it. | bare "main" |
| `<main>` landmark | The single `<main id="main">` element on every public page. The skip link targets it. | bare "main" |
| `pwe-finance` repo | The GitHub repository `kenshinice-ai/pwe-finance`. | bare `pwe-finance` (also the Cloudflare project name) |
| public site | The static EN and `zh/` pages that GitHub Pages serves at `https://kenshinice-ai.github.io/pwe-finance/`. | "public static website", "public production pages" |
| GitHub Pages | GitHub's static hosting for the public site. It redeploys on every push to the `main` branch. | bare "Pages" (could also mean Cloudflare Workers & Pages) |
| blog publisher | `admin.html` plus `functions/`, running in the Cloudflare Workers & Pages project `pwe-finance`. It commits new EN blog posts to the `main` branch. | "Admin/API layer", "admin system", "Cloudflare admin", "Cloudflare admin layer", "Cloudflare Function" |
| ACL number | The Australian Credit Licence number printed in every footer, EN and zh. It stays a placeholder (`XXXXXX`) until the owner supplies the real number (`HANDOFF.md` §6). Never invent one. | bare "ACL"; "Australian Credit Licence" when the number is meant |
| markup contract | `HANDOFF.md` §3: the exact motion hooks, skip link, content classes, FAQ and SEO head markup every page uses. | bare "contract" (also means §7) |
| bilingual contract | `HANDOFF.md` §7: the `zh/` mirror architecture, language toggle, hreflang lines and translation glossary. | bare "contract" (also means §3) |
| motion hook | One of the data attributes `data-reveal`, `data-reveal-group`, `data-count-to`, `data-count-suffix`. `js/main.js` reads them. | bare "hook" for a CSS class; "animation hooks" |
| content class | One of the CSS classes `.content-section`, `.content-narrow`, `.info-card-grid`, `.info-card`, `.section-cta` from the markup contract. | "contract classes", "contract content classes", "hook" |
