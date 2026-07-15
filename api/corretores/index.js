import prisma from "../_lib/prisma.js";
import { verifyAuth } from "../_lib/auth.js";
import { verifyCsrf } from "../_lib/csrf.js";

/**
 * GET /api/corretores
 * Lista pública de corretores (Usuários da plataforma) com campos seguros:
 *   { id, name, creci, image, phone, createdAt, propertiesCount }
 *
 * Proteção anti-scraping idêntica ao /api/properties: visitantes anônimos
 * precisam de um token Turnstile válido (usuários logados received 'bypass').
 *
 * Query params:
 *  - q:    busca por nome ou CRECI (contains, case-insensitive)
 *  - sort: "recentes" (padrão) | "imoveis" | "nome"
 */
export default async function handler(req, res) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyAuth(req);

  // Se o usuário não está logado, exige validação do Turnstile para evitar scraping público
  if (!user) {
    const turnstileToken = req.headers['x-turnstile-token'];
    if (!turnstileToken) {
      return res.status(403).json({ error: 'Turnstile token required' });
    }

    if (turnstileToken !== 'bypass' && turnstileToken !== 'bypass-trust') {
      const secretKey = process.env.TURNSTILE_SECRET_KEY || '';
      try {
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: secretKey, response: turnstileToken }),
        });
        const turnstileData = await turnstileRes.json();
        if (!turnstileData.success) {
          return res.status(403).json({ error: 'Turnstile verification failed' });
        }
      } catch (err) {
        return res.status(500).json({ error: 'Error verifying Turnstile' });
      }
    }
  }

  const { q, sort } = req.query;

  // Filtro de busca (nome ou CRECI)
  const where = q?.trim()
    ? {
        OR: [
          { name: { contains: q.trim(), mode: 'insensitive' } },
          { creci: { contains: q.trim(), mode: 'insensitive' } },
        ],
      }
    : {};

  // Ordenação
  let orderBy;
  switch (sort) {
    case 'imoveis':
      orderBy = [{ properties: { _count: 'desc' } }, { createdAt: 'desc' }];
      break;
    case 'nome':
      orderBy = [{ name: 'asc' }, { createdAt: 'desc' }];
      break;
    case 'recentes':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  try {
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        creci: true,
        image: true,
        phone: true,
        createdAt: true,
        _count: { select: { properties: true } },
      },
      orderBy,
    });

    const corretores = users.map((u) => ({
      id: u.id,
      name: u.name,
      creci: u.creci,
      image: u.image,
      phone: u.phone,
      createdAt: u.createdAt,
      propertiesCount: u._count.properties,
    }));

    return res.status(200).json(corretores);
  } catch (err) {
    console.error('List corretores error:', err);
    return res.status(500).json({ error: 'Error listing corretores' });
  }
}
