import axios from 'axios'
import { verifyAuth } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Ensure user is authenticated
  const authData = verifyAuth(req)
  if (!authData) return res.status(401).json({ error: 'Unauthorized' })

  const { cpf } = req.body

  if (!cpf) {
    return res.status(400).json({ error: 'CPF é obrigatório' })
  }

  try {
    const token = process.env.APIFULL_TOKEN || 'TOKEN_DA_API'
    
    const response = await axios.post(
      'https://api.apifull.com.br/api/pf-dadosbasicos',
      {
        cpf,
        link: 'pf-dadosbasicos'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      }
    )

    return res.status(200).json(response.data)
  } catch (error) {
    console.error('APIFull Error:', error.response?.data || error.message)
    return res.status(500).json({ 
      error: 'Erro ao consultar a APIFull', 
      details: error.response?.data || error.message 
    })
  }
}
