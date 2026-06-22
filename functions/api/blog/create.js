import { jsonResponse, requireAdmin } from "../../_lib/admin-auth.js";

const DEFAULT_OWNER = "kenshinice-ai";
const DEFAULT_REPO = "pwe-finance";
const DEFAULT_BRANCH = "main";
const DEFAULT_SITE_BASE = "https://kenshinice-ai.github.io/pwe-finance";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatMonthYear(dateValue) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-AU", { month: "long", year: "numeric", timeZone: "UTC" });
}

function validatePost(input) {
  const errors = [];
  const title = String(input.title || "").trim();
  const slug = slugify(input.slug || title);
  const category = String(input.category || "Mortgage Insights").trim();
  const date = String(input.date || "").trim();
  const summary = String(input.summary || "").trim();
  const heroIntro = String(input.heroIntro || summary).trim();
  const metaTitle = String(input.metaTitle || title).trim();
  const metaDescription = String(input.metaDescription || summary).trim();
  const content = String(input.content || "").trim();
  const status = input.status === "draft" ? "draft" : "published";

  if (title.length < 8) errors.push("Title must be at least 8 characters.");
  if (!slug) errors.push("Slug is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("Date must use YYYY-MM-DD format.");
  if (summary.length < 30) errors.push("Summary must be at least 30 characters.");
  if (metaDescription.length < 50) errors.push("Meta description must be at least 50 characters.");
  if (content.length < 120) errors.push("Main content must be at least 120 characters.");

  return {
    ok: errors.length === 0,
    errors,
    post: { title, slug, category, date, summary, heroIntro, metaTitle, metaDescription, content, status },
  };
}

function contentToHtml(content) {
  const blocks = String(content)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    if (block.startsWith("### ")) return `<h3>${escapeHtml(block.slice(4))}</h3>`;
    if (block.startsWith("## ")) return `<h2>${escapeHtml(block.slice(3))}</h2>`;
    if (block.startsWith("> ")) return `<blockquote>${escapeHtml(block.slice(2))}</blockquote>`;
    if (/^- /m.test(block)) {
      const items = block.split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => `      <li>${escapeHtml(line.slice(2))}</li>`)
        .join("\n");
      return `<ul>\n${items}\n    </ul>`;
    }
    return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
  }).join("\n\n    ");
}

function buildBlogPostHtml(post, filename, siteBase) {
  const canonical = `${siteBase}/${filename}`;
  const monthYear = formatMonthYear(post.date);
  const bodyHtml = contentToHtml(post.content);
  const updateNote = post.status === "draft"
    ? "<p class=\"content-note\"><strong>Draft note:</strong> This article is marked as draft in the repository. Review before promoting it publicly.</p>"
    : "<p class=\"content-note\"><strong>Update note:</strong> Policy settings, rates and lender offers can change. Treat this article as general information and confirm current details before making a finance decision.</p>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(post.metaDescription)}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" type="image/svg+xml" href="icons/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png">
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
  <link rel="manifest" href="icons/site.webmanifest">
  <meta name="theme-color" content="#222159">
</head>
<body>

<header class="header"><div class="container header-inner">
  <a href="index.html" class="logo"><span class="logo-main">PWE</span><span class="logo-sub">FINANCE</span></a>
  <nav class="nav" id="mainNav" aria-label="Main navigation">
    <ul class="nav-menu">
      <li class="nav-item"><a href="index.html">Home</a></li>
      <li class="nav-item dropdown-parent"><a href="#" class="nav-dropdown-btn">Home Loans <i class="fa-solid fa-chevron-down dropdown-arrow"></i></a><div class="dropdown-menu"><a href="first-home-loans.html"><i class="fa-solid fa-house-chimney"></i> First Home Loans</a><a href="next-home-loans.html"><i class="fa-solid fa-arrow-right-arrow-left"></i> Next Home Loans</a><a href="investment-loans.html"><i class="fa-solid fa-chart-line"></i> Investment Loans</a><a href="refinancing.html"><i class="fa-solid fa-rotate"></i> Refinancing</a></div></li>
      <li class="nav-item dropdown-parent"><a href="#" class="nav-dropdown-btn">Other Loans <i class="fa-solid fa-chevron-down dropdown-arrow"></i></a><div class="dropdown-menu"><a href="commercial-business-loans.html"><i class="fa-solid fa-building"></i> Commercial & Business</a><a href="construction-loans.html"><i class="fa-solid fa-hard-hat"></i> Construction Loans</a><a href="smsf-loans.html"><i class="fa-solid fa-piggy-bank"></i> SMSF Loans</a></div></li>
      <li class="nav-item"><a href="calculators.html">Calculators</a></li>
      <li class="nav-item"><a href="about.html">About</a></li>
      <li class="nav-item active"><a href="blog.html">Blog</a></li>
      <li class="nav-item"><a href="contact.html" class="nav-cta-mobile nav-cta">Contact Us</a></li>
    </ul>
  </nav>
  <div class="header-actions">
    <a href="tel:04XX XXX XXX" class="header-phone"><i class="fa-solid fa-phone"></i> 04XX XXX XXX</a>
    <button class="hamburger" id="hamburger" aria-label="Toggle navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</div></header>

<section class="page-hero">
  <div class="page-hero-bg"></div>
  <div class="container page-hero-content">
    <h1>${escapeHtml(post.title)}</h1>
    <p>${escapeHtml(post.heroIntro)}</p>
  </div>
</section>

<section class="breadcrumb-section">
  <div class="container"><div class="breadcrumb-inner">
    <a href="index.html">Home</a><span class="breadcrumb-sep">/</span><a href="blog.html">Blog</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-current">${escapeHtml(post.category)}</span>
  </div></div>
</section>

<div class="blog-post-container">
  <div class="blog-post-meta">
    <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(post.date)}</span>
    <span><i class="fa-solid fa-tag"></i> ${escapeHtml(post.category)}</span>
  </div>

  <div class="blog-post-body">
    ${updateNote}

    ${bodyHtml}
  </div>

  <div style="text-align:center;margin-top:48px;padding-top:32px;border-top:1px solid #e0e5ec;">
    <a href="contact.html" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Get Your Free Assessment</a>
  </div>
</div>

<footer class="footer"><div class="container footer-grid">
  <div class="footer-col"><a href="index.html" class="logo logo-white"><span class="logo-main">PWE</span><span class="logo-sub">FINANCE</span></a><p>Your local mortgage broking team.</p></div>
  <div class="footer-col"><h4>Quick Links</h4><ul><li><a href="index.html">Home</a></li><li><a href="about.html">About Us</a></li><li><a href="blog.html">Blog</a></li><li><a href="contact.html">Contact</a></li></ul></div>
  <div class="footer-col"><h4>Loans</h4><ul><li><a href="first-home-loans.html">First Home Loans</a></li><li><a href="investment-loans.html">Investment Loans</a></li><li><a href="refinancing.html">Refinancing</a></li><li><a href="commercial-business-loans.html">Commercial & Business</a></li></ul></div>
  <div class="footer-col"><h4>Contact Us</h4><ul class="footer-contact"><li><i class="fa-solid fa-phone"></i> <a href="tel:04XX XXX XXX">04XX XXX XXX</a></li><li><i class="fa-solid fa-envelope"></i> <a href="mailto:info@pwefinance.com.au">info@pwefinance.com.au</a></li><li><i class="fa-solid fa-location-dot"></i> Melbourne VIC 3000</li></ul><div class="footer-socials"><a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a></div></div>
</div>
<div class="footer-bottom"><div class="container footer-bottom-inner"><p>&copy; 2026 PWE Finance. All rights reserved.</p><div class="footer-bottom-links"><a href="privacy-policy.html">Privacy Policy</a><a href="terms-and-conditions.html">Terms & Conditions</a></div></div></div>
<div class="footer-disclaimer"><div class="container"><p>The information provided on this site is for illustrative and discussion purposes only. Normal lending criteria apply.</p></div></div>
</footer>

<a href="#" class="back-to-top" id="backToTop" aria-label="Back to top"><i class="fa-solid fa-chevron-up"></i></a>
<script src="js/main.js"></script>
</body>
</html>
`;
}

function buildBlogCard(post, filename) {
  const monthYear = formatMonthYear(post.date);
  return `      <a href="${escapeHtml(filename)}" class="blog-card">
        <div class="blog-image" style="background:linear-gradient(135deg,#00AAE5 0%,#222159 100%);"></div>
        <div class="blog-content">
          <span style="font-size:0.78rem;color:var(--light);font-weight:600;">${escapeHtml(monthYear || post.date)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.summary)}</p>
          <span class="read-more">Read more <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </a>

`;
}

function insertBlogCard(blogHtml, cardHtml, filename) {
  if (blogHtml.includes(`href="${filename}"`)) return blogHtml;
  const marker = '<div class="blog-grid"';
  const gridStart = blogHtml.indexOf(marker);
  if (gridStart === -1) throw new Error("Could not find blog grid in blog.html");
  const insertAt = blogHtml.indexOf(">", gridStart) + 1;
  return `${blogHtml.slice(0, insertAt)}\n${cardHtml}${blogHtml.slice(insertAt)}`;
}

function insertSitemapUrl(sitemapXml, filename, siteBase, date) {
  const loc = `${siteBase}/${filename}`;
  if (sitemapXml.includes(`<loc>${loc}</loc>`)) return sitemapXml;
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  return sitemapXml.replace("</urlset>", `${entry}</urlset>`);
}

async function githubRequest(env, path, options = {}) {
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not configured");
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "pwe-finance-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  return response.json();
}

async function getTextFile(env, owner, repo, branch, path) {
  const data = await githubRequest(env, `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
  const binary = atob(data.content.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function fileExists(env, owner, repo, branch, path) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "pwe-finance-admin",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return true;
}

async function createGitHubCommit(env, owner, repo, branch, files, message) {
  const ref = await githubRequest(env, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const commit = await githubRequest(env, `/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);

  const treeItems = await Promise.all(files.map(async (file) => {
    const blob = await githubRequest(env, `/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
    });
    return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const tree = await githubRequest(env, `/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: treeItems }),
  });

  const newCommit = await githubRequest(env, `/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }),
  });

  await githubRequest(env, `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  return newCommit;
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  let input;
  try {
    input = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON request." }, 400);
  }

  const validation = validatePost(input);
  if (!validation.ok) {
    return jsonResponse({ ok: false, errors: validation.errors }, 400);
  }

  const owner = env.GITHUB_OWNER || DEFAULT_OWNER;
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const siteBase = (env.PUBLIC_SITE_BASE || DEFAULT_SITE_BASE).replace(/\/+$/, "");
  const post = validation.post;
  const filename = `blog-post-${post.slug}.html`;

  try {
    if (await fileExists(env, owner, repo, branch, filename)) {
      return jsonResponse({ ok: false, error: `A post already exists at ${filename}. Use a different slug.` }, 409);
    }

    const [blogHtml, sitemapXml] = await Promise.all([
      getTextFile(env, owner, repo, branch, "blog.html"),
      getTextFile(env, owner, repo, branch, "sitemap.xml"),
    ]);

    const postHtml = buildBlogPostHtml(post, filename, siteBase);
    const updatedBlogHtml = post.status === "published"
      ? insertBlogCard(blogHtml, buildBlogCard(post, filename), filename)
      : blogHtml;
    const updatedSitemapXml = post.status === "published"
      ? insertSitemapUrl(sitemapXml, filename, siteBase, post.date)
      : sitemapXml;

    const files = [
      { path: filename, content: postHtml },
      { path: "blog.html", content: updatedBlogHtml },
      { path: "sitemap.xml", content: updatedSitemapXml },
    ];

    const commit = await createGitHubCommit(
      env,
      owner,
      repo,
      branch,
      files,
      `${post.status === "draft" ? "Add draft blog post" : "Add blog post"}: ${post.title}`
    );

    return jsonResponse({
      ok: true,
      filename,
      url: `${siteBase}/${filename}`,
      commit: commit.sha,
      status: post.status,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || "Could not publish blog post." }, 500);
  }
}
