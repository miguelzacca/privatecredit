import prisma from '../_lib/prisma.js'
import { verifyAuth } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Ensure user is authenticated
  const authData = verifyAuth(req)
  if (!authData) return res.status(401).json({ error: 'Unauthorized' })

  const {
    cpf, fullName, birthDate, gender, motherName, rg, statusRFB,
    cep, number, complement, street, neighborhood, city, state,
    bank, agency, account, accountType, pix,
    acceptedTerms, signature
  } = req.body

  if (!cpf || !fullName || !acceptedTerms) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando.' })
  }

  try {
    const userId = String(authData.userId)

    // UPSERT InvestorProfile
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
    })

    // Update User model
    await prisma.user.update({
      where: { id: userId },
      data: { investorProfileCompleted: true }
    })

    return res.status(200).json({ success: true, profile })
  } catch (error) {
    console.error('InvestorProfile Error:', error)
    return res.status(500).json({ 
      error: 'Erro ao salvar o perfil do investidor.', 
      details: error.message 
    })
  }
}
