import crypto from 'crypto';
import cookieModule from 'cookie';
const { serialize, parse } = cookieModule;

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookies(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  
  const secretCookie = serialize('_csrfSecret', token, {
    httpOnly: true,
    secure: false, // Set to false temporarily to ensure localhost HTTP testing works
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  const tokenCookie = serialize('XSRF-TOKEN', token, {
    httpOnly: false, 
    secure: false, // Set to false temporarily to ensure localhost HTTP testing works
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });

  // Depending on existing headers, we might need to append.
  // In Vercel serverless, res.setHeader('Set-Cookie', [...]) handles multiple cookies.
  // But if there are existing cookies, we need to append them.
  const existingCookies = res.getHeader('Set-Cookie');
  let cookieHeader = [secretCookie, tokenCookie];
  
  if (existingCookies) {
    if (Array.isArray(existingCookies)) {
      cookieHeader = [...existingCookies, ...cookieHeader];
    } else {
      cookieHeader = [existingCookies, ...cookieHeader];
    }
  }

  res.setHeader('Set-Cookie', cookieHeader);
}

export function verifyCsrf(req) {
  // If no method or we want to protect all methods (including GET)
  const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
  
  const cookies = parse(req.headers.cookie || '');
  const secret = cookies._csrfSecret;

  if (!headerToken || !secret) {
    return false;
  }

  if (headerToken.length !== secret.length) {
    return false;
  }
  
  try {
    return crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(secret));
  } catch (e) {
    return false;
  }
}
