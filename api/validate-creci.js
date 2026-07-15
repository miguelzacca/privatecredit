import { verifyAuth } from './_lib/auth.js';
import { validateCreciByCpf } from './_lib/creci.js';
import { verifyCsrf } from './_lib/csrf.js';

export default async function handler(req, res) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Must be authenticated
  const authData = verifyAuth(req);
  if (!authData) return res.status(401).json({ error: 'Unauthorized' });

  const { cpf } = req.body || {};
  if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório.' });

  // Basic CPF format validation
  const cpfDigits = String(cpf).replace(/\D/g, '');
  if (cpfDigits.length !== 11) {
    return res.status(422).json({ error: 'CPF deve ter 11 dígitos.' });
  }

  try {
    const result = await validateCreciByCpf(cpfDigits);

    if (!result.active) {
      const statusCode = result.error.includes('Muitas requisições') ? 429 : 403;
      return res.status(statusCode).json({ error: result.error });
    }

    return res.status(200).json({ name: result.name, active: true });
  } catch (err) {
    console.error('CRECI validation error:', err);
    return res.status(500).json({ error: 'Erro ao consultar o CRECI. Tente novamente em instantes.' });
  }
}
