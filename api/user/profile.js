import { verifyAuth } from "../_lib/auth.js";
import prisma from "../_lib/prisma.js";
import { verifyCsrf } from "../_lib/csrf.js";
import xss from "xss";

export default async function handler(req, res) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const authData = verifyAuth(req);
  if (!authData) return res.status(401).json({ error: 'Unauthorized' });

  const { name, phone, cpf } = req.body || {};
  const trimmed = xss((name || '').trim());
  const trimmedPhone = xss((phone || '').trim());
  const trimmedCpf = xss((cpf || '').trim());

  const updateData = {};
  if (trimmed) {
    if (trimmed.length < 2) {
      return res.status(422).json({ error: 'O nome deve ter pelo menos 2 caracteres.' });
    }
    if (trimmed.length > 60) {
      return res.status(422).json({ error: 'O nome deve ter no máximo 60 caracteres.' });
    }
    updateData.name = trimmed;
  }
  
  if (trimmedPhone) {
    // Regex for basic validation of Brazilian mobile numbers
    const phoneRegex = /^\(\d{2}\)\s?9\d{4}-\d{4}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return res.status(422).json({ error: 'O telefone deve estar no formato (XX) 9XXXX-XXXX.' });
    }
    updateData.phone = trimmedPhone;
  }

  if (trimmedCpf) {
    // Validate CPF format and digits
    const cpfDigits = trimmedCpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      return res.status(422).json({ error: 'CPF deve ter 11 dígitos.' });
    }
    // Check for all same digits (invalid CPFs like 000.000.000-00)
    if (/^(\d)\1+$/.test(cpfDigits)) {
      return res.status(422).json({ error: 'CPF inválido.' });
    }
    // Validate check digits
    const calcDigit = (cpfArr, len) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += parseInt(cpfArr[i]) * (len + 1 - i);
      const rest = (sum * 10) % 11;
      return rest === 10 || rest === 11 ? 0 : rest;
    };
    const cpfArr = cpfDigits.split('');
    if (calcDigit(cpfArr, 9) !== parseInt(cpfArr[9]) || calcDigit(cpfArr, 10) !== parseInt(cpfArr[10])) {
      return res.status(422).json({ error: 'CPF inválido. Por favor, verifique os dígitos.' });
    }
    updateData.cpf = cpfDigits;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'Nenhum dado para atualizar.' });
  }

  if (updateData.cpf) {
    const existingCpfUser = await prisma.user.findFirst({
      where: {
        cpf: updateData.cpf,
        id: { not: String(authData.userId) },
      }
    });

    if (existingCpfUser) {
      return res.status(409).json({ error: 'Este CPF já está cadastrado em outra conta.' });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: String(authData.userId) },
      data: updateData,
      select: { id: true, name: true, email: true, image: true, phone: true, cpf: true },
    });

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Não foi possível atualizar seu perfil.' });
  }
}
