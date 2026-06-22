# PWE Finance Admin Blog Workflow

This site uses a linked workflow:

- Public static website: GitHub repository `kenshinice-ai/pwe-finance`
- Public production pages: GitHub Pages at `https://kenshinice-ai.github.io/pwe-finance/`
- Admin/API layer: Cloudflare Workers & Pages project `pwe-finance`

The public website remains static HTML. The admin system runs on Cloudflare because GitHub Pages cannot safely store passwords, restrict IPs, or write files.

## How Publishing Works

1. Admin opens the Cloudflare-hosted admin page:
   `https://pwe-finance.lee-liu-melbourne.workers.dev/admin.html`
2. Admin logs in with `ADMIN_PASSWORD`.
3. Admin writes a blog post and clicks `Publish to GitHub`.
4. Cloudflare Function validates the session and optional IP allowlist.
5. Cloudflare Function uses `GITHUB_TOKEN` server-side to commit:
   - a new `blog-post-{slug}.html`
   - an updated `blog.html`
   - an updated `sitemap.xml`
6. GitHub Pages redeploys automatically from the updated `main` branch.

## Required Cloudflare Variables

Set these in Cloudflare:

`Workers & Pages` -> `pwe-finance` -> `Settings` -> `Variables and Secrets`

Required:

```text
ADMIN_PASSWORD
GITHUB_TOKEN
```

Recommended:

```text
SESSION_SECRET
```

Optional:

```text
ALLOWED_ADMIN_IPS
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH
PUBLIC_SITE_BASE
```

Suggested values:

```text
GITHUB_OWNER=kenshinice-ai
GITHUB_REPO=pwe-finance
GITHUB_BRANCH=main
PUBLIC_SITE_BASE=https://kenshinice-ai.github.io/pwe-finance
```

`ALLOWED_ADMIN_IPS` is comma-separated:

```text
ALLOWED_ADMIN_IPS=123.123.123.123,111.111.111.111
```

Leave it empty if your IP changes frequently.

## GitHub Token Permissions

Use a fine-grained GitHub token scoped only to:

```text
Repository: kenshinice-ai/pwe-finance
Permissions:
- Contents: Read and write
- Metadata: Read
```

Do not put this token in `admin.html`.

## Daily Update Flow

For ordinary page edits:

```bash
cd "/Users/llmacbookpro/Documents/websitelmg-lee"
git status
git add .
git commit -m "Update website"
git push
```

For new blog posts:

1. Use Cloudflare admin page.
2. Publish the post.
3. Check GitHub commits.
4. Wait for GitHub Pages to update.

## Hosting Decision

Keep the current linked model:

- GitHub hosts the source and public static site.
- Cloudflare hosts admin-only APIs and can also serve the same static files.
- The admin page should be used from the Cloudflare URL, because GitHub Pages does not run `/api/*` functions.

This is safer than pure GitHub Pages admin because secrets stay inside Cloudflare.

## Notes

- Draft posts create a blog post file but do not update `blog.html` or `sitemap.xml`.
- Published posts update both `blog.html` and `sitemap.xml`.
- Slugs must be unique. If `blog-post-{slug}.html` exists, publishing is rejected.
- The generated article uses the same header, footer, typography, content note, and CTA style as the existing blog pages.
