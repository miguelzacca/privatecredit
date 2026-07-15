import prisma from "./_lib/prisma.js";
import { applyRateLimit } from "./_lib/rateLimit.js";

export default async function handler(req, res) {
  const isAllowed = await applyRateLimit(req, res);
  if (!isAllowed) {
    return res.status(429).send('Muitas requisições. Tente novamente mais tarde.');
  }

  try {
    // Busca os slugs de todos os imóveis para gerar o sitemap
    const properties = await prisma.property.findMany({
      select: { slug: true, id: true, createdAt: true },
      // Em um app muito grande, poderíamos usar paginação/skip/take aqui, mas para um sitemap inicial 10k linhas é ok.
    });

    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/imoveis</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/corretores</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Dynamic Property Pages -->
`;

    properties.forEach(prop => {
      const propSlug = prop.slug || prop.id;
      // YYYY-MM-DD format
      const lastMod = new Date(prop.createdAt).toISOString().split('T')[0];
      xml += `  <url>
    <loc>${baseUrl}/property/${propSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache on Edge for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);

  } catch (error) {
    console.error("Erro ao gerar sitemap:", error);
    res.status(500).end();
  }
}
