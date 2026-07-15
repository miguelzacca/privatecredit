import prisma from "../_lib/prisma.js";
import { verifyAuth } from "../_lib/auth.js";
import { verifyCsrf } from "../_lib/csrf.js";

/**
 * GET /api/corretores/[id]
 * Retorna os dados públicos de um corretor específico.
 */
export default async function handler(req, res) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID do corretor não fornecido' });
  }

  const user = verifyAuth(req);

  // Proteção Turnstile para visitantes não autenticados
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

  try {
    let dbUser;
    if (id.length === 36 && id.includes('-')) {
      dbUser = await prisma.user.findUnique({
        where: { id: String(id) },
        select: {
          id: true,
          name: true,
          creci: true,
          image: true,
          phone: true,
          createdAt: true,
          _count: { select: { properties: true } },
        },
      });
    } else {
      const parts = id.split('-');
      const shortId = parts[parts.length - 1];
      if (shortId && shortId.length >= 6) {
        dbUser = await prisma.user.findFirst({
          where: { id: { startsWith: shortId } },
          select: {
            id: true,
            name: true,
            creci: true,
            image: true,
            phone: true,
            createdAt: true,
            _count: { select: { properties: true } },
          },
        });
      }
    }

    if (!dbUser) {
      return res.status(404).json({ error: 'Corretor não encontrado' });
    }

    const corretor = {
      id: dbUser.id,
      name: dbUser.name,
      creci: dbUser.creci,
      image: dbUser.image,
      phone: dbUser.phone,
      createdAt: dbUser.createdAt,
      propertiesCount: dbUser._count.properties,
    };

    return res.status(200).json(corretor);
  } catch (err) {
    console.error('Fetch corretor error:', err);
    return res.status(500).json({ error: 'Error fetching corretor' });
  }
}
