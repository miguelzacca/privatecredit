import prisma from "./_lib/prisma.js";
import { verifyAuth } from "./_lib/auth.js";
import { applyRateLimit } from "./_lib/rateLimit.js";
import { verifyCsrf } from "./_lib/csrf.js";
import { validateCreciByCpf } from "./_lib/creci.js";
import axios from "axios";

export default async function handler(req, res) {
  const isAllowed = await applyRateLimit(req, res, { limit: 20, windowMs: 60000 });
  if (!isAllowed) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }

  const { action } = req.query;

  // ---------------------------------------------------------
  // ACTION: profile
  // ---------------------------------------------------------
  if (action === 'profile') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!verifyCsrf(req)) return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });

    const authData = verifyAuth(req);
    if (!authData) return res.status(401).json({ error: 'Unauthorized' });

    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile is required' });

    const validProfiles = ['investidor', 'corretor', 'construtora', 'fornecedor', 'empresa'];
    if (!validProfiles.includes(profile.toLowerCase())) return res.status(400).json({ error: 'Invalid profile' });

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

  // ---------------------------------------------------------
  // ACTION: investor-profile
  // ---------------------------------------------------------
  if (action === 'investor-profile') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authData = verifyAuth(req);
    if (!authData) return res.status(401).json({ error: 'Unauthorized' });

    const {
      cpf, fullName, birthDate, gender, motherName, rg, statusRFB,
      cep, number, complement, street, neighborhood, city, state,
      bank, agency, account, accountType, pix,
      acceptedTerms, signature
    } = req.body;

    if (!cpf || !fullName || !acceptedTerms) {
      return res.status(400).json({ error: 'Dados obrigatórios faltando.' });
    }

    try {
      const userId = String(authData.userId);
      const profile = await prisma.investorProfile.upsert({
        where: { userId },
        update: {
          cpf, fullName, birthDate, gender, motherName, rg, statusRFB,
          cep, number, complement, street, neighborhood, city, state,
          bank, agency, account, accountType, pix,
          acceptedTerms, signature
        },
        create: {
          cpf, fullName, birthDate, gender, motherName, rg, statusRFB,
          cep, number, complement, street, neighborhood, city, state,
          bank, agency, account, accountType, pix,
          acceptedTerms, signature,
          userId
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { investorProfileCompleted: true }
      });

      return res.status(200).json({ success: true, profile });
    } catch (error) {
      console.error('InvestorProfile Error:', error);
      return res.status(500).json({ error: 'Erro ao salvar o perfil do investidor.', details: error.message });
    }
  }

  // ---------------------------------------------------------
  // ACTION: validate-creci
  // ---------------------------------------------------------
  if (action === 'validate-creci') {
    if (!verifyCsrf(req)) return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authData = verifyAuth(req);
    if (!authData) return res.status(401).json({ error: 'Unauthorized' });

    const { cpf } = req.body || {};
    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório.' });

    const cpfDigits = String(cpf).replace(/\D/g, '');
    if (cpfDigits.length !== 11) return res.status(422).json({ error: 'CPF deve ter 11 dígitos.' });

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

  // ---------------------------------------------------------
  // ACTION: apifull
  // ---------------------------------------------------------
  if (action === 'apifull') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authData = verifyAuth(req);
    if (!authData) return res.status(401).json({ error: 'Unauthorized' });

    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório' });

    try {
      let token = process.env.APIFULL_TOKEN || 'TOKEN_DA_API';
      token = token.replace(/^["']|["']$/g, '').trim();
      if (!token.startsWith('Bearer ')) token = `Bearer ${token}`;
      
      const response = await axios.post(
        'https://api.apifull.com.br/api/pf-dadosbasicos',
        { cpf, link: 'pf-dadosbasicos' },
        { headers: { 'Content-Type': 'application/json', 'Authorization': token } }
      );

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('APIFull Error:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Erro ao consultar a APIFull', details: error.response?.data || error.message });
    }
  }

  return res.status(404).json({ error: 'Action not found' });
}
