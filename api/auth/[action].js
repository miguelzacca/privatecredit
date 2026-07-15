import prisma from "../_lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieModule from "cookie";
const { serialize } = cookieModule;
import { JWT_SECRET, verifyAuth } from "../_lib/auth.js";
import { applyRateLimit } from "../_lib/rateLimit.js";
import { verifyCsrf, generateCsrfToken, setCsrfCookies } from "../_lib/csrf.js";
import xss from "xss";

export default async function handler(req, res) {
  const { action } = req.query;

  // Handle csrf generation directly without requiring a csrf token to generate a csrf token
  if (req.method === 'GET' && action === 'csrf') {
    const token = generateCsrfToken();
    setCsrfCookies(res, token);
    return res.status(200).json({ success: true, token });
  }

  if (req.method !== 'GET') {
    if (!verifyCsrf(req)) {
      return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
    }
  }

  // Apply a basic rate limit: max 20 requests per minute per IP for auth actions
  const isAllowed = await applyRateLimit(req, res, { limit: 20, windowMs: 60000 });
  if (!isAllowed) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }

  if (req.method === 'POST') {
    if (action === 'google') {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Token is required' });

      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!userInfoRes.ok) return res.status(401).json({ error: 'Token inválido ou expirado' });

        const userInfo = await userInfoRes.json();
        const { email, name, picture } = userInfo;
        
        const safeName = name ? xss(name) : 'Usuário';
        const safePicture = picture ? xss(picture) : null;

        if (!email) return res.status(400).json({ error: 'O Google não forneceu um e-mail' });

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: safeName,
              email,
              password: '',
              image: safePicture,
            }
          });
        } else if (safePicture && user.image !== safePicture) {
          user = await prisma.user.update({ where: { id: user.id }, data: { image: safePicture } });
        }

        const authToken = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        res.setHeader('Set-Cookie', serialize('auth_token', authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/'
        }));

        return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, image: user.image, phone: user.phone, cpf: user.cpf, profile: user.profile } });
      } catch (err) {
        console.error('Google Auth Error:', err);
        return res.status(500).json({ error: 'Falha na autenticação com o Google' });
      }
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: -1,
        path: '/'
      }));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed or action not supported' });
  }

  if (req.method === 'GET') {
    if (action === 'me') {
      const authData = verifyAuth(req);
      if (!authData) return res.status(401).json({ error: 'Unauthorized' });

      const user = await prisma.user.findUnique({ 
        where: { id: String(authData.userId) },
        select: { id: true, name: true, email: true, image: true, phone: true, cpf: true, profile: true }
      });

      if (!user) return res.status(401).json({ error: 'User not found' });

      return res.status(200).json({ user });
    }

    return res.status(405).json({ error: 'Method not allowed or action not supported' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
