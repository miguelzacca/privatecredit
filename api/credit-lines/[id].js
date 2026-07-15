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
        status: creditLine.status,
        history: creditLine.history ? JSON.parse(creditLine.history) : [],
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

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const authData = verifyAuth(req);
    if (!authData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Check if it belongs to user
      const existingLine = await prisma.creditLine.findUnique({
        where: { id }
      });

      if (!existingLine) {
        return res.status(404).json({ error: 'Not found' });
      }

      if (existingLine.userId !== authData.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { 
        capital, 
        interestRate, 
        duration, 
        amortization, 
        negotiation, 
        segments, 
        guarantees,
        status,
        historyEvent
      } = req.body;

      // Prepare data
      const dataToUpdate = {};
      if (capital !== undefined) dataToUpdate.capital = capital;
      if (interestRate !== undefined) dataToUpdate.interestRate = interestRate;
      if (duration !== undefined) dataToUpdate.duration = duration;
      if (amortization !== undefined) dataToUpdate.amortization = amortization;
      if (negotiation !== undefined) dataToUpdate.negotiation = negotiation;
      if (segments !== undefined) dataToUpdate.segments = JSON.stringify(segments);
      if (guarantees !== undefined) dataToUpdate.guarantees = JSON.stringify(guarantees);
      if (status !== undefined) dataToUpdate.status = status;

      // Handle history
      if (historyEvent) {
        let currentHistory = [];
        if (existingLine.history) {
          try { currentHistory = JSON.parse(existingLine.history); } catch(e) {}
        }
        currentHistory.push({
          ...historyEvent,
          timestamp: new Date().toISOString()
        });
        dataToUpdate.history = JSON.stringify(currentHistory);
      }

      const updatedLine = await prisma.creditLine.update({
        where: { id },
        data: dataToUpdate
      });

      return res.status(200).json({ success: true, data: updatedLine });
    } catch (error) {
      console.error('Error updating credit line:', error);
      return res.status(500).json({ error: 'Failed to update credit line' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
