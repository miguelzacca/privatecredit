import prisma from '../_lib/prisma.js';
import { verifyAuth } from '../_lib/auth.js';
import { verifyCsrf } from '../_lib/csrf.js';

export default async function handler(req, res) {
  // Validate CSRF token
  if (!verifyCsrf(req)) {
    return res.status(403).json({
      error: 'Token CSRF inválido ou ausente',
    });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const creditLine = await prisma.creditLine.findUnique({
        where: { id },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      if (!creditLine) {
        return res.status(404).json({ error: 'Credit line not found' });
      }

      let parsedSegments = [];
      let parsedGuarantees = [];
      
      try { parsedSegments = JSON.parse(creditLine.segments); } catch (e) { parsedSegments = []; }
      try { parsedGuarantees = JSON.parse(creditLine.guarantees); } catch (e) { parsedGuarantees = []; }

      const formatCurrency = (value) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value).replace('R$', '').trim();

      const formatted = {
        id: creditLine.id,
        investor: creditLine.user?.name || 'Investidor Privado',
        rating: '5.0', // Fixed for demo
        maxAmount: formatCurrency(creditLine.capital),
        rate: `${creditLine.interestRate.toFixed(2)}% a.m.`,
        term: `Até ${creditLine.duration}x`,
        volume: 'Novo',
        tags: parsedSegments.length > 0 ? parsedSegments : ['Diversos'],
        capital: creditLine.capital,
        interestRate: creditLine.interestRate,
        duration: creditLine.duration,
        createdAt: creditLine.createdAt,
        amortization: creditLine.amortization,
        negotiation: creditLine.negotiation,
        rawSegments: parsedSegments,
        rawGuarantees: parsedGuarantees,
        userId: creditLine.userId,
      };

      return res.status(200).json({ data: formatted });
    } catch (error) {
      console.error('Error fetching credit line:', error);
      return res.status(500).json({ error: 'Failed to fetch credit line' });
    }
  }

  if (req.method === 'DELETE') {
    const authData = verifyAuth(req);
    if (!authData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Check if it belongs to user
      const creditLine = await prisma.creditLine.findUnique({
        where: { id }
      });

      if (!creditLine) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (creditLine.userId !== authData.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.creditLine.delete({
        where: { id }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting credit line:', error);
      return res.status(500).json({ error: 'Failed to delete' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
