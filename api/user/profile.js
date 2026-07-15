import prisma from "../_lib/prisma.js";
import { verifyAuth } from "../_lib/auth.js";
import { applyRateLimit } from "../_lib/rateLimit.js";
import { verifyCsrf } from "../_lib/csrf.js";

export default async function handler(req, res) {
  // Apply a basic rate limit: max 20 requests per minute
  const isAllowed = await applyRateLimit(req, res, { limit: 20, windowMs: 60000 });
  if (!isAllowed) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  const authData = verifyAuth(req);
  if (!authData) return res.status(401).json({ error: 'Unauthorized' });

  const { profile } = req.body;
  if (!profile) return res.status(400).json({ error: 'Profile is required' });

  // Valid profiles matching the exact strings the user might send.
  const validProfiles = ['investidor', 'corretor', 'construtora', 'fornecedor', 'empresa'];
  if (!validProfiles.includes(profile.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid profile' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: String(authData.userId) },
      data: { profile: profile.toLowerCase() },
      select: { id: true, name: true, email: true, image: true, phone: true, cpf: true, profile: true }
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
