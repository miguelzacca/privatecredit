import prisma from '../_lib/prisma.js';
import { verifyAuth } from '../_lib/auth.js';
import { verifyCsrf } from '../_lib/csrf.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  const authData = verifyAuth(req);
  if (!authData) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Credit line ID is required' });
  }

  try {
    const existingLine = await prisma.creditLine.findUnique({
      where: { id }
    });

    if (!existingLine) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (existingLine.userId !== authData.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Duplicate line, set status to PAUSED
    const duplicatedLine = await prisma.creditLine.create({
      data: {
        capital: existingLine.capital,
        interestRate: existingLine.interestRate,
        duration: existingLine.duration,
        amortization: existingLine.amortization,
        negotiation: existingLine.negotiation,
        segments: existingLine.segments,
        guarantees: existingLine.guarantees,
        userId: authData.userId,
        status: 'PAUSED', // Duplicated lines start as paused
        history: JSON.stringify([{
          action: 'Linha Duplicada',
          description: `Cópia da linha original (ID: ${id})`,
          timestamp: new Date().toISOString()
        }])
      }
    });

    return res.status(200).json({ success: true, data: duplicatedLine });
  } catch (error) {
    console.error('Error duplicating credit line:', error);
    return res.status(500).json({ error: 'Failed to duplicate credit line' });
  }
}
