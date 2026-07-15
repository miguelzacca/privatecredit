import { verifyAuth } from '../_lib/auth.js'
import { callLlama } from '../_lib/ai.js'
import prisma from '../_lib/prisma.js'

function fmt(n) {
  if (n == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(n)
}

async function buildContext(userMessage, authedUser) {
  const normalize = (str) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const msg = normalize(userMessage)
  const parts = []

  if (!authedUser) return ''

  // 1. Fetch user data
  const userRecord = await prisma.user.findUnique({
    where: { id: authedUser.userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      phone: true,
      creci: true,
      cpf: true,
      createdAt: true,
    },
  })

  if (userRecord) {
    parts.push(`== PERFIL DO USUÁRIO AUTENTICADO ==
Nome: ${userRecord.name}
Email: ${userRecord.email}
Perfil na Plataforma: ${userRecord.profile?.toUpperCase() || 'NÃO DEFINIDO'}
Membro desde: ${new Date(userRecord.createdAt).toLocaleDateString('pt-BR')}
`)
  }

  // 2. Marketplace & Lines logic
  const wantsMarketplace =
    msg.includes('marketplace') ||
    msg.includes('disponiveis') ||
    msg.includes('linhas') ||
    msg.includes('credito') ||
    msg.includes('taxa')

  if (wantsMarketplace) {
    const activeLines = await prisma.creditLine.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, profile: true } },
      },
    })

    const totalActive = await prisma.creditLine.count({
      where: { status: 'ACTIVE' },
    })

    parts.push(`== MARKETPLACE (Linhas de Crédito Disponíveis) ==
[Existem atualmente ${totalActive} linhas ativas no sistema. Abaixo estão as mais recentes]`)

    activeLines.forEach((line, i) => {
      parts.push(`${i + 1}. [ID:${line.id}]
   Publicado por: ${line.user?.name} (${line.user?.profile})
   Capital: ${fmt(line.capital)} | Taxa: ${line.interestRate}% ao mês | Duração: ${line.duration} meses
   Amortização: ${line.amortization ? 'Sim' : 'Não'} | Negociação: ${line.negotiation ? 'Flexível' : 'Fixa'}
   Link: /dashboard/marketplace/${line.id}`)
    })
  }

  // 3. User's Own Lines / Capital
  const isInvestor = userRecord?.profile === 'investidor'
  if (
    isInvestor &&
    (msg.includes('minhas') ||
      msg.includes('capital') ||
      msg.includes('rentabilidade'))
  ) {
    const myLines = await prisma.creditLine.findMany({
      where: { userId: authedUser.userId },
      orderBy: { createdAt: 'desc' },
    })

    const totalCapital = myLines.reduce((acc, l) => acc + l.capital, 0)

    parts.push(`== DADOS DO INVESTIDOR (VOCÊ) ==
Total de Linhas Publicadas: ${myLines.length}
Capital Total Ofertado: ${fmt(totalCapital)}
Rentabilidade Estimada Média: ${myLines.length > 0 ? (myLines.reduce((acc, l) => acc + l.interestRate, 0) / myLines.length).toFixed(2) : 0}% ao mês.

[Instrução para IA: Diga que a rentabilidade exata e contratos em negociação podem ser vistos na tela de /dashboard/investidor/operacoes]`)

    myLines.slice(0, 5).forEach((line, i) => {
      parts.push(
        `- Sua Linha: ${fmt(line.capital)} a ${line.interestRate}%/mês (${line.duration}x). Status: ${line.status}.`,
      )
    })
  }

  // Se for empresa, construtora, etc
  const isCompany =
    userRecord?.profile === 'empresa' || userRecord?.profile === 'construtora'
  if (
    isCompany &&
    (msg.includes('solicitacoes') ||
      msg.includes('contratos') ||
      msg.includes('pagamentos'))
  ) {
    parts.push(`== DADOS DA EMPRESA (VOCÊ) ==
[Instrução para IA: O sistema ainda está em implantação para a gestão avançada de contratos.
Informe ao usuário que ele pode conferir o status de solicitações em /dashboard/empresa/solicitacoes e gerenciar documentos em /dashboard/documents. 
Para calcular juros compostos ou tabela Price (amortização), você mesmo pode fazer a simulação baseada na taxa da linha que ele tem interesse.]`)
  }

  return parts.join('\n\n')
}

export default async function handler(req, res) {
  const { action } = req.query

  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  if (action === 'ai-chat') {
    const { messages, currentContext, currentPath } = req.body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const authedUser = verifyAuth(req)
    if (!authedUser) {
      return res
        .status(401)
        .json({ error: 'Você precisa estar logado para falar com a IA.' })
    }

    const lastUserMessage = messages[messages.length - 1]?.content || ''

    let dbContext = ''
    try {
      dbContext = await buildContext(lastUserMessage, authedUser)
    } catch (err) {
      console.error('[ai-chat] Error building context:', err.message)
    }

    const systemPrompt = `Você é o Especialista Financeiro Inteligente da plataforma "Private Credit", uma plataforma de crédito privado focada em conectar investidores a empresas/construtoras/corretores.

Seu papel é:
- Aconselhar o usuário sobre operações financeiras, rentabilidade, e tomada de crédito.
- Explicar conceitos como Tabela Price, SAC, Taxa de Juros, e Risco de Crédito.
- Conhecer profundamente a plataforma e guiar o usuário pelas telas (ex: /dashboard/marketplace, /dashboard/investidor/operacoes, etc).
- Analisar os dados do banco de dados abaixo para responder com precisão.

REGRAS IMPORTANTES:
1. Responda SEMPRE em português brasileiro.
2. Aja como um especialista financeiro de alto nível (estilo "wealth manager" ou analista sênior).
3. Use formatação em Markdown (Listas, Negrito para destacar métricas e valores, Tabelas se necessário).
4. Ao citar uma linha de crédito do Marketplace, coloque o link no formato /dashboard/marketplace/[ID].
5. NUNCA revele dados sensíveis de outras pessoas (senhas, documentos confidenciais). Apenas o que for público no marketplace.
6. Se perguntarem algo que não está no contexto abaixo ou em desenvolvimento, seja educado, aja como o especialista, e sugira o caminho na plataforma.
7. Não responda sobre programação, código ou quebre o personagem de Assistente Financeiro.

[ INFORMAÇÃO DE NAVEGAÇÃO DO USUÁRIO ]
O usuário está atualmente visualizando a página: "${currentContext || 'Geral'}" (URL: ${currentPath || '/dashboard'})
Se a pergunta dele for vaga (ex: "explicar esta página", "o que tem aqui"), baseie sua resposta nesta localização.

${dbContext ? `=== CONTEXTO EM TEMPO REAL DO BANCO DE DADOS ===\n${dbContext}\n=== FIM DO CONTEXTO ===` : '=== O sistema está conectando seus dados, mas utilize seus conhecimentos financeiros gerais. ==='}
`

    try {
      const history = messages.slice(-6)
      const lastMsg = history[history.length - 1].content

      let conversationContext = ''
      if (history.length > 1) {
        conversationContext = history
          .slice(0, -1)
          .map(
            (m) =>
              `${m.role === 'user' ? 'Usuário' : 'Especialista'}: ${m.content}`,
          )
          .join('\n')
        conversationContext = `Histórico da conversa:\n${conversationContext}\n\n`
      }

      const userPrompt = `${conversationContext}Usuário: ${lastMsg}`
      const responseText = await callLlama(systemPrompt, userPrompt)
      return res.status(200).json({ message: responseText })
    } catch (err) {
      console.error('[ai-chat] Error:', err.message)
      return res
        .status(500)
        .json({
          error:
            'Falha ao processar sua solicitação no modelo de inteligência financeira.',
        })
    }
  }

  return res.status(404).json({ error: 'Action not found' })
}
