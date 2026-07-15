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

  // GET: Fetch credit lines for the Marketplace
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      const whereClause = userId ? { userId } : {};

      const creditLines = await prisma.creditLine.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      // Format response exactly as Marketplace.jsx expects
      const formattedOffers = creditLines.map((line) => {
        let parsedSegments = [];
        let parsedGuarantees = [];
        
        try { parsedSegments = JSON.parse(line.segments); } catch (e) { parsedSegments = []; }
        try { parsedGuarantees = JSON.parse(line.guarantees); } catch (e) { parsedGuarantees = []; }

        const formatCurrency = (value) => 
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value).replace('R$', '').trim();

        return {
          id: line.id,
          investor: line.user?.name || 'Investidor Privado',
          rating: '5.0', // Fixed for demo
          maxAmount: formatCurrency(line.capital),
          rate: `${line.interestRate.toFixed(2)}% a.m.`,
          term: `Até ${line.duration}x`,
          volume: 'Novo',
          tags: parsedSegments.length > 0 ? parsedSegments : ['Diversos'],
          capital: line.capital,
          interestRate: line.interestRate,
          duration: line.duration,
          createdAt: line.createdAt,
        };
      });

      return res.status(200).json({ data: formattedOffers });
    } catch (error) {
      console.error('Error fetching credit lines:', error);
      return res.status(500).json({ error: 'Failed to fetch credit lines' });
    }
  }

  // POST: Create a new credit line
  if (req.method === 'POST') {
    // Require authentication
    const authData = verifyAuth(req);
    if (!authData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const {
        capital,
        interestRate,
        duration,
        amortization,
        negotiation,
        segments,
        guarantees,
      } = req.body;

      if (!capital || !interestRate || !duration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const creditLine = await prisma.creditLine.create({
        data: {
          capital: parseFloat(capital),
          interestRate: parseFloat(interestRate),
          duration: parseInt(duration, 10),
          amortization: Boolean(amortization),
          negotiation: Boolean(negotiation),
          segments: JSON.stringify(segments || []),
          guarantees: JSON.stringify(guarantees || []),
          userId: authData.userId,
        },
      });

      return res.status(201).json(creditLine);
    } catch (error) {
      console.error('Error creating credit line:', error);
      return res.status(500).json({ error: 'Failed to create credit line' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
