import prisma from "./_lib/prisma.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve os arquivos de assets do Vite a partir do manifest.json gerado no build.
 * Em dev (sem manifest), retorna src apontando para /src/main.jsx diretamente.
 */
function resolveViteAssets(req) {
  const host = (req && req.headers && req.headers.host) || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || process.env.NODE_ENV === "development";
  
  if (isLocal) {
    return {
      cssLinks: "",
      scriptTag: `<script type="module" src="/src/main.jsx"></script>`,
      isDev: true,
    };
  }
  try {
    // O manifest fica em dist/.vite/manifest.json após `vite build`
    const manifestPath = join(__dirname, "..", "dist", ".vite", "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

    // Vite usa "index.html" como chave de entrada quando o entry point é o index.html raiz
    const entry =
      manifest["index.html"] ||
      manifest["src/main.jsx"] ||
      Object.values(manifest).find((v) => v.isEntry);
    if (!entry) throw new Error("Entry not found in manifest");

    const scriptFile = entry.file; // ex: "assets/index-abc123.js"
    const cssFiles = entry.css || []; // ex: ["assets/index-xyz.css"]

    const cssLinks = cssFiles
      .map((f) => `<link rel="stylesheet" crossorigin href="/${f}" />`)
      .join("\n    ");

    const scriptTag = `<script type="module" crossorigin src="/${scriptFile}"></script>`;

    return { cssLinks, scriptTag, isDev: false };
  } catch {
    // Fallback para desenvolvimento local (sem build)
    return {
      cssLinks: "",
      scriptTag: `<script type="module" src="/src/main.jsx"></script>`,
      isDev: true,
    };
  }
}

/**
 * Gera o HTML completo com Open Graph / Twitter Card meta tags.
 */
function buildHtml({ title, description, image, url, cssLinks, scriptTag }) {
  const safeTitle = title.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDesc = description.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeImage = image.replace(/"/g, "&quot;");
  const safeUrl = url.replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="/window-logo.png" type="image/png" />
    <meta name="google-site-verification" content="IYy_16hb1sGAdpnns07JnpSUtq9HmuZoXNqc-LgfTno" />

    <!-- SEO básico -->
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${safeUrl}" />

    <!-- Open Graph (Facebook, WhatsApp, LinkedIn, Telegram) -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="og:site_name" content="Corretores do Litoral" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    <meta name="twitter:image:alt" content="${safeTitle}" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

    <!-- Vite assets -->
    ${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    ${scriptTag}
  </body>
</html>`;
}

export default async function handler(req, res) {
  let { slug, type } = req.query;

  // Fallbacks de extração
  if (!slug || slug === "$slug" || slug === "$1") {
    const rawUrl = req.url || "";
    const qMatch = rawUrl.match(/[?&]slug=([^&]+)/);
    if (qMatch) slug = decodeURIComponent(qMatch[1]);

    if (!slug || slug === "$slug" || slug === "$1") {
      const originalPath = req.headers["x-matched-path"] || req.headers["x-invoke-path"] || "";
      const pathMatch = originalPath.match(/\/(property|corretor)\/(.+)/);
      if (pathMatch) {
        if (!type) type = pathMatch[1];
        slug = decodeURIComponent(pathMatch[2]);
      }
    }
  }
  
  if (!type && req.url) {
    if (req.url.includes('type=property') || req.url.includes('/property/')) type = 'property';
    else if (req.url.includes('type=corretor') || req.url.includes('/corretor/')) type = 'corretor';
  }

  console.log(`[render] type=${type} | slug=${slug} | req.url=${req.url}`);

  if (!slug || slug === "$slug" || slug === "$1") {
    return res.status(400).send("Missing slug");
  }
  
  if (type === 'property' && (slug === "new" || slug.startsWith("edit"))) {
    return res.redirect(302, `/property/${slug}`);
  }

  const host = req.headers.host || "corretoresdolitoral.com.br";
  const proto = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  let title = "Corretores do Litoral";
  let description = "O portal de imóveis de parceria no litoral.";
  let image = `${baseUrl}/window-logo.png`;
  const url = `${baseUrl}/${type === 'property' ? 'property' : 'corretor'}/${slug}`;

  try {
    if (type === 'property') {
      title = "Imóvel | Corretores do Litoral";
      description = "O portal de imóveis de parceria. Encontre o imóvel ideal e faça negócios no litoral.";
      
      const isNumeric = /^\d+$/.test(slug);
      const whereClause = isNumeric ? { id: parseInt(slug, 10) } : { slug };

      const property = await prisma.property.findUnique({
        where: whereClause,
        select: { title: true, description: true, images: true, slug: true },
        cacheStrategy: { swr: 300, ttl: 300 }
      });

      if (property) {
        title = `${property.title} | Corretores do Litoral`;
        if (property.description) {
          description = property.description.replace(/\n+/g, " ").trim().substring(0, 160);
        }
        if (property.images) {
          try {
            const imgs = JSON.parse(property.images);
            if (Array.isArray(imgs) && imgs.length > 0) {
              image = imgs[0].startsWith("/") ? `${baseUrl}${imgs[0]}` : imgs[0];
            }
          } catch {}
        }
      }
    } else if (type === 'corretor') {
      title = "Corretor | Corretores do Litoral";
      description = "Conheça este corretor parceiro no portal Corretores do Litoral. Encontre imóveis e faça negócios.";
      
      let dbUser;
      if (slug.length === 36 && slug.includes('-')) {
        dbUser = await prisma.user.findUnique({
          where: { id: slug },
          select: { name: true, image: true, creci: true },
          cacheStrategy: { swr: 300, ttl: 300 }
        });
      } else {
        const parts = slug.split('-');
        const shortId = parts[parts.length - 1];
        if (shortId && shortId.length >= 6) {
          dbUser = await prisma.user.findFirst({
            where: { id: { startsWith: shortId } },
            select: { name: true, image: true, creci: true },
            cacheStrategy: { swr: 300, ttl: 300 }
          });
        }
      }

      if (dbUser) {
        title = `${dbUser.name} - Corretor de Imóveis | Corretores do Litoral`;
        description = dbUser.creci 
          ? `Conheça os imóveis do corretor parceiro ${dbUser.name} (CRECI: ${dbUser.creci}) no litoral.`
          : `Conheça os imóveis do corretor parceiro ${dbUser.name} no litoral.`;
        if (dbUser.image) {
          image = dbUser.image.startsWith("/") ? `${baseUrl}${dbUser.image}` : dbUser.image;
        }
      }
    }
  } catch (err) {
    console.error(`[render] Erro ao buscar ${type}:`, err);
  }

  const { cssLinks, scriptTag } = resolveViteAssets(req);
  const html = buildHtml({ title, description, image, url, cssLinks, scriptTag });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  }
  return res.send(html);
}
