import { verifyAuth } from "../_lib/auth.js";
import { callLlama } from "../_lib/ai.js";
import { verifyCsrf } from "../_lib/csrf.js";
import { applyRateLimit } from "../_lib/rateLimit.js";
import prisma from "../_lib/prisma.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function safeJson(str, fallback = []) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// ─── Query Router ────────────────────────────────────────────────────────────
// Decides what DB data to fetch based on the user's latest message.
// Returns a context string to inject into the systemPrompt.

async function buildContext(userMessage, authedUser) {
  const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const msg = normalize(userMessage);
  const parts = [];

  // ── Keywords that signal interest in the authenticated user's own data ──
  const myDataKw = ['meu imovel', 'meus imoveis', 'minha propriedade', 'minhas propriedades',
    'meu anuncio', 'meus anuncios', 'meu perfil', 'minha conta', 'meu cadastro',
    'minha senha', 'meu creci', 'meu telefone', 'meu nome', 'meu email',
    'quantos imoveis', 'minhas fotos', 'meu plano', 'quantos tenho'];

  const wantsMyData = authedUser && myDataKw.some(kw => msg.includes(kw));

  if (wantsMyData) {
    // Fetch user profile (never include password)
    const userRecord = await prisma.user.findUnique({
      where: { id: authedUser.userId },
      select: { id: true, name: true, email: true, phone: true, creci: true, createdAt: true }
    });

    if (userRecord) {
      parts.push(`== PERFIL DO USUÁRIO AUTENTICADO ==
Nome: ${userRecord.name}
Email: ${userRecord.email}
Telefone: ${userRecord.phone || 'não informado'}
CRECI: ${userRecord.creci || 'não informado'}
Membro desde: ${new Date(userRecord.createdAt).toLocaleDateString('pt-BR')}
`);
    }

    // Fetch user's own properties — get real count AND list
    const [myProps, myPropsTotal] = await Promise.all([
      prisma.property.findMany({
        where: { userId: authedUser.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true, title: true, price: true, adType: true, city: true, state: true,
          isFeatured: true, features: true, description: true, createdAt: true, slug: true
        }
      }),
      prisma.property.count({ where: { userId: authedUser.userId } })
    ]);

    if (myPropsTotal > 0) {
      parts.push(`== IMÓVEIS DO USUÁRIO ==
[INSTRUÇÃO PARA VOCÊ, IA: O usuário possui EXATAMENTE ${myPropsTotal} imóveis cadastrados no total. Se ele perguntar quantos imóveis tem, responda "${myPropsTotal}". Estamos listando abaixo apenas os ${myProps.length} mais recentes.]`);
      myProps.forEach((p, i) => {
        const feats = safeJson(p.features).join(', ') || 'não informado';
        parts.push(`${i + 1}. [ID:${p.id}] "${p.title}"
   Tipo: ${p.adType} | Preço: ${fmt(p.price)} | Cidade: ${p.city || '?'}, ${p.state || '?'}
   Destaque: ${p.isFeatured ? 'Sim' : 'Não'} | Características: ${feats}
   Slug: /property/${p.slug}
   Cadastrado em: ${new Date(p.createdAt).toLocaleDateString('pt-BR')}`);
      });
      if (myPropsTotal > myProps.length) {
        parts.push(`(Mostrando os ${myProps.length} mais recentes de ${myPropsTotal} total)`);
      }
    } else {
      parts.push('O usuário ainda não possui imóveis cadastrados.');
    }
  }

  // ── Keywords that signal interest in public property listings ──
  const publicKw = ['imovel', 'imoveis', 'casa', 'apartamento', 'terreno', 'chacara', 'sitio',
    'cobertura', 'sala', 'loja', 'galpao', 'studio', 'kitnet', 'mansao',
    'comprar', 'alugar', 'venda', 'aluguel', 'disponivel', 'disponiveis',
    'preco', 'valor', 'cidade', 'bairro', 'litoral', 'praia', 'quartos', 'suites',
    'encontrar', 'buscar', 'procurar', 'quanto custa', 'tem algum', 'existe',
    'corretores do litoral', 'portal'];

  const wantsPublic = publicKw.some(kw => msg.includes(kw));

  if (wantsPublic && !wantsMyData) {
    // Build dynamic filters from the message
    const where = {};

    if (msg.includes('aluguel') || msg.includes('alugar')) where.adType = 'aluguel';
    else if (msg.includes('venda') || msg.includes('comprar')) where.adType = 'venda';

    if (msg.includes('destaque') || msg.includes('featured')) where.isFeatured = true;

    // City/location extraction (common coastal cities in SC)
    const cities = ['itajaí', 'balneário camboriú', 'camboriú', 'itapema', 'porto belo',
      'bombinhas', 'navegantes', 'penha', 'piçarras', 'barra velha',
      'florianópolis', 'floripa', 'são josé', 'palhoça', 'biguaçu',
      'tijucas', 'governador celso ramos', 'garopaba', 'imbituba'];

    for (const city of cities) {
      if (msg.includes(city)) {
        where.city = { contains: city, mode: 'insensitive' };
        break;
      }
    }

    // Price filters from message patterns like "até 500 mil", "acima de 1 milhão"
    const ateMatch = msg.match(/até\s+([\d.,]+)\s*(mil|milhão|milhões|reais|k|m)?/i);
    const acimaMatch = msg.match(/acima\s+de\s+([\d.,]+)\s*(mil|milhão|milhões|reais|k|m)?/i);

    const parsePrice = (num, unit) => {
      const n = parseFloat(num.replace(',', '.'));
      if (!unit) return n;
      if (unit.startsWith('mil') || unit === 'k') return n * 1000;
      if (unit.startsWith('mil') || unit === 'm') return n * 1000;
      if (unit.startsWith('milhão') || unit.startsWith('milhões')) return n * 1000000;
      return n;
    };

    if (ateMatch) {
      where.price = { ...where.price, lte: parsePrice(ateMatch[1], ateMatch[2]) };
    }
    if (acimaMatch) {
      where.price = { ...where.price, gte: parsePrice(acimaMatch[1], acimaMatch[2]) };
    }

    // Keyword search
    const searchKw = ['quartos', 'suítes', 'vagas', 'piscina', 'churrasqueira', 'varanda'];
    const foundKw = searchKw.filter(k => msg.includes(k));
    if (foundKw.length > 0) {
      where.OR = foundKw.map(k => ({
        OR: [
          { title: { contains: k, mode: 'insensitive' } },
          { description: { contains: k, mode: 'insensitive' } },
          { features: { contains: k, mode: 'insensitive' } }
        ]
      }));
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, title: true, price: true, adType: true, city: true, state: true,
        isFeatured: true, features: true, slug: true, createdAt: true,
        // Include broker name (public info) but NEVER email/cpf/password
        user: { select: { name: true, creci: true } }
      }
    });

    const total = await prisma.property.count({ where });

    parts.push(`== IMÓVEIS DISPONÍVEIS NO PORTAL (${total} total, mostrando ${properties.length}) ==`);

    if (properties.length === 0) {
      parts.push('Nenhum imóvel encontrado para os filtros aplicados.');
    } else {
      properties.forEach((p, i) => {
        const feats = safeJson(p.features).join(', ') || 'sem características listadas';
        parts.push(`${i + 1}. "${p.title}"
   Tipo: ${p.adType} | Preço: ${fmt(p.price)} | ${p.city || '?'}, ${p.state || '?'}
   Destaque: ${p.isFeatured ? '⭐ Sim' : 'Não'} | Corretor: ${p.user?.name || 'não informado'}
   Características: ${feats}
   Link: /property/${p.slug}`);
      });
    }
  }

  // ── Stats / general portal info ──
  if (msg.includes('quantos') || msg.includes('total') || msg.includes('estatística') || msg.includes('estatisticas')) {
    const [totalProps, totalVenda, totalAluguel, totalFeatured] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { adType: 'venda' } }),
      prisma.property.count({ where: { adType: 'aluguel' } }),
      prisma.property.count({ where: { isFeatured: true } }),
    ]);

    parts.push(`== ESTATÍSTICAS DO PORTAL ==
Total de imóveis: ${totalProps}
Para venda: ${totalVenda}
Para aluguel: ${totalAluguel}
Anúncios em destaque: ${totalFeatured}
`);
  }

  return parts.join('\n\n');
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
  }

  const { action } = req.query;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── AI Chat (smart, DB-aware) ────────────────────────────────────────────
  if (action === 'ai-chat') {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Optional auth — logged in users get access to their private data
    const authedUser = verifyAuth(req);

    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Build DB context
    let dbContext = '';
    try {
      dbContext = await buildContext(lastUserMessage, authedUser);
    } catch (err) {
      console.error('[ai-chat] Error building context:', err.message);
      // Don't fail the request — just proceed without DB context
    }

    const userSection = authedUser
      ? `O usuário está autenticado como: ${authedUser.name || authedUser.email || 'usuário'}.`
      : 'O usuário NÃO está autenticado (visitante).';

    const systemPrompt = `Você é o assistente virtual inteligente do portal "Corretores do Litoral", um marketplace de imóveis especializado no litoral de Santa Catarina.

${userSection}

Seu papel é:
- Ajudar visitantes a encontrar imóveis que correspondam ao que procuram
- Ajudar corretores cadastrados com dúvidas sobre seus anúncios, cadastro e perfil
- Responder perguntas sobre o portal e o processo de compra/venda/aluguel de imóveis

REGRAS IMPORTANTES:
1. Responda SEMPRE em português brasileiro, de forma educada, clara e profissional.
2. Seja conciso mas completo. Use formatação com listas quando listar imóveis.
3. Se o usuário perguntar sobre imóveis específicos de outras pessoas, você NÃO tem e NÃO pode compartilhar essas informações (email, CPF, senha, dados privados de outros usuários).
4. Baseie suas respostas nos dados fornecidos abaixo. Se não houver dados relevantes, diga isso honestamente.
5. Ao mencionar imóveis, sempre inclua o link no formato /property/[slug] para o usuário poder acessar.
6. Para ações como cadastrar, editar ou excluir imóveis, direcione o usuário ao painel em /dashboard.
7. Não invente preços, endereços ou características de imóveis que não estejam nos dados fornecidos.

${dbContext ? `=== DADOS DO BANCO DE DADOS (use estes para responder) ===\n${dbContext}\n=== FIM DOS DADOS ===` : '=== Nenhum dado específico do banco foi carregado para esta consulta. Responda de forma geral. ==='}

Caso o usuário pergunte algo que exija login e ele não esteja autenticado, sugira que ele faça login em /login para ter acesso a informações personalizadas.`;

    try {
      // Build conversation history (last 6 turns to keep context manageable)
      const history = messages.slice(-6);
      const lastMsg = history[history.length - 1].content;

      // Build a multi-turn context string for the user prompt
      let conversationContext = '';
      if (history.length > 1) {
        conversationContext = history.slice(0, -1)
          .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
          .join('\n');
        conversationContext = `Histórico da conversa:\n${conversationContext}\n\n`;
      }

      const userPrompt = `${conversationContext}Usuário: ${lastMsg}`;
      const responseText = await callLlama(systemPrompt, userPrompt);
      return res.status(200).json({ message: responseText });
    } catch (err) {
      console.error('[ai-chat] Error:', err.message);
      return res.status(500).json({ error: 'Falha ao processar sua mensagem. Tente novamente.' });
    }
  }

  // ── Legacy chat (kept for backwards compat) ──────────────────────────────
  if (action === 'chat') {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array is required' });

    const systemPrompt = `Você é o assistente virtual do portal 'Corretores do Litoral'. Seu papel é ajudar corretores com dúvidas sobre cadastro, publicação de anúncios, e também auxiliar visitantes que procuram imóveis. Seja educado, conciso e profissional.`;

    try {
      const lastUserMessage = messages[messages.length - 1].content;
      const responseText = await callLlama(systemPrompt, lastUserMessage);
      return res.status(200).json({ message: responseText });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to chat' });
    }
  }

  // ── Smart Search: NL → structured filters (guests allowed, CSRF-gated) ────
  if (action === 'parse-search') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body || {};
    const cleanText = (typeof text === 'string' ? text : '').trim();
    if (!cleanText) return res.status(400).json({ error: 'Texto da busca é obrigatório.' });
    if (cleanText.length > 400) return res.status(400).json({ error: 'Texto muito longo.' });

    // Rate limit (LLM calls custam)
    const isAllowed = applyRateLimit(req, res, { limit: 15, windowMs: 60000 });
    if (!isAllowed) return res.status(429).json({ error: 'Muitas buscas inteligentes. Aguarde um minuto.' });

    const systemPrompt = `Você é o motor de "busca inteligente" do portal de imóveis "Corretores do Litoral" (litoral de Santa Catarina). Receba um pedido em linguagem natural do usuário e converta-o em filtros estruturados para a página de imóveis.

Responda ESTRITAMENTE com um objeto JSON válido (sem texto extra, sem blocos de código markdown, sem aspas envolvendo o JSON), seguindo EXATAMENTE este schema:
{
  "q": "string — palavras-chave para busca fuzzy de texto (ex: 'piscina varanda gourmet mar'). Vazio '' se não houver termo extra.",
  "tipo": "Apartamento" | "Casa" | "Cobertura" | "Sala Comercial" | "Terreno" | "Sobrado" | "Flat / Studio" | "Chácara" | "",
  "adType": "venda" | "aluguel" | "todos",
  "cidade": "string — nome da cidade normalizado (ex: 'Balneário Camboriú'). Vazio '' se não mencionado.",
  "precoMin": number | null,
  "precoMax": number | null,
  "quartos": "1" | "2" | "3" | "4" | "",
  "banheiros": "1" | "2" | "3" | "4" | "",
  "vagas": "1" | "2" | "3" | "4" | "",
  "areaMin": number | null,
  "areaMax": number | null,
  "destaque": true | false,
  "ordem": "date_desc" | "date_asc" | "price_asc" | "price_desc",
  "summary": "string — UMA frase curta em português brasileiro, natural, resumindo o que o usuário procura (ex: 'Apartamento à venda em Balneário Camboriú até R$ 500 mil com 3 quartos')."
}

REGRAS IMPORTANTES:
1. Preços devem ser números crus em BRL (use 500000 para 500 mil; 1200000 para 1,2 milhão). Inclua só o valor que o usuário citou. Se não citar faixa, deixe null.
2. "tipo" deve ser escolhido APENAS da lista canônica acima. Se o usuário disser "apto"/"apart", use "Apartamento"; "sala"/"salão", use "Sala Comercial"; "sobrado", "Sobrado"; etc. Se não souber, use "".
3. adType (Venda/Aluguel): Se o usuário NÃO disser explicitamente se quer "comprar", "venda", "alugar" ou "aluguel", OBRIGATORIAMENTE retorne "todos". NÃO adivinhe se é venda ou aluguel.
4. cidade: EXATAMENTE como foi mencionada. Se não houver nome explícito da cidade no texto (ex: se mencionar apenas bairro), OBRIGATORIAMENTE deixe a cidade VAZIA (""). NÃO adivinhe a cidade sob nenhuma hipótese.
5. quartos/banheiros/vagas: número MÍNIMO pedido. Use "4" se disser "4 ou mais". Vazio "" se não mencionar.
6. areaMin/areaMax: em m², número cru.
7. destaque: true APENAS se o usuário explicitamente pedir "destaque"/"destaques"/"em destaque".
8. ordem: se o usuário disser "mais barato"/"menor preço" → price_asc; "mais caro"/"maior preço" → price_desc; "mais antigo" → date_asc; padrão se nada citado → date_desc.
9. q: capture APENAS qualificadores extras (piscina, varanda, frente mar, mobiliado). SE toda a informação (ex: "apto 2 quartos até 5000") já foi capturada nos campos (tipo, quartos, precoMax), deixe "q" VAZIO (""). NUNCA repita em "q" o que já está nos outros filtros.
10. summary: sempre preenchido, frase curta e natural.
11. REGRA DE OURO (SEM ALUCINAÇÃO): NÃO invente, presuma ou adivinhe valores que o usuário não forneceu explicitamente. Se o usuário não falou a cidade, o tipo, ou qualquer outro detalhe, você DEVE deixar o campo vazio/null (ou "todos" para adType).

Retorne SOMENTE o JSON.`;

    try {
      const responseText = await callLlama(systemPrompt, cleanText);

      // Parse robusto
      let parsed = null;
      let parseErr = null;
      try {
        let clean = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        // Tenta extrair o primeiro objeto JSON { ... } caso venha texto junto
        const first = clean.indexOf('{');
        const last = clean.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          clean = clean.slice(first, last + 1);
        }
        parsed = JSON.parse(clean);
      } catch (e) {
        parseErr = e;
      }

      // Fallback: nunca deixa o fluxo quebrar — busca por palavras-chave
      if (!parsed || typeof parsed !== 'object') {
        return res.status(200).json({
          filters: { q: cleanText },
          summary: cleanText,
          fallback: true,
        });
      }

      // Normalização leve
      const str = (v, def = '') => (v == null ? def : String(v));
      const numOrNull = (v) => {
        if (v == null || v === '') return null;
        const n = Number(String(v).replace(/[^\d.]/g, ''));
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const adType = ['venda', 'aluguel', 'todos'].includes(parsed.adType)
        ? parsed.adType : 'todos';
      const TIPOS_VALIDOS = ['Apartamento', 'Casa', 'Cobertura', 'Sala Comercial', 'Terreno', 'Sobrado', 'Flat / Studio', 'Chácara'];
      const tipo = str(parsed.tipo);
      const tipoFinal = TIPOS_VALIDOS.includes(tipo) ? tipo : '';
      const ordem = ['date_desc', 'date_asc', 'price_asc', 'price_desc'].includes(parsed.ordem)
        ? parsed.ordem : 'date_desc';

      const filters = {
        q: str(parsed.q),
        tipo: tipoFinal,
        adType,
        cidade: str(parsed.cidade),
        precoMin: numOrNull(parsed.precoMin),
        precoMax: numOrNull(parsed.precoMax),
        quartos: ['1', '2', '3', '4'].includes(str(parsed.quartos)) ? str(parsed.quartos) : '',
        banheiros: ['1', '2', '3', '4'].includes(str(parsed.banheiros)) ? str(parsed.banheiros) : '',
        vagas: ['1', '2', '3', '4'].includes(str(parsed.vagas)) ? str(parsed.vagas) : '',
        areaMin: numOrNull(parsed.areaMin),
        areaMax: numOrNull(parsed.areaMax),
        destaque: parsed.destaque === true,
        ordem,
      };

      const summary = (str(parsed.summary) || cleanText).slice(0, 160);

      return res.status(200).json({ filters, summary, fallback: false });
    } catch (err) {
      console.error('[parse-search] Error:', err.message);
      // Fallback em caso de falha do LLM
      return res.status(200).json({
        filters: { q: cleanText },
        summary: cleanText,
        fallback: true,
      });
    }
  }

  // All other actions require auth
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (action === 'enhance-text') {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const systemPrompt = `Você é um especialista em marketing imobiliário. Seu objetivo é pegar uma descrição básica de um imóvel e transformá-la em um texto altamente persuasivo, atraente e profissional para anúncios, destacando os pontos fortes, a localização (se informada) e o estilo de vida que a propriedade oferece. O texto deve ser formatado de forma limpa e estar pronto para uso, sem introduções ou saudações da IA.`;

    try {
      const enhancedText = await callLlama(systemPrompt, `Melhore o seguinte texto do anúncio de imóvel:\n\n${text}`);
      return res.status(200).json({ text: enhancedText });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to enhance text' });
    }
  }

  if (action === 'enhance-title') {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const systemPrompt = `Você é um copywriter especialista em alta conversão no mercado imobiliário. Seu objetivo é pegar o título básico de um anúncio de imóvel e transformá-lo em um título profissional, atrativo e focado em vendas (SEO e conversão).
Regras:
1. MANTENHA todas as informações vitais fornecidas (ex: número de quartos/suítes, "mobiliado", "frente mar", localização).
2. NÃO use frases poéticas, abstratas ou cafonas (ex: "Viver em Praia, sem sair de casa"). O título deve ser objetivo e direto.
3. Exemplo do que fazer: se a entrada for "apartamento 3 suites mobiliado na meia praia", converta para algo como "Lindo Apartamento Mobiliado com 3 Suítes na Meia Praia" ou "Apartamento mobiliado com 3 Suítes na Meia Praia".
4. Retorne APENAS o título sugerido, sem aspas, sem pontuação no final e sem introduções ou saudações.`;

    try {
      const enhancedTitle = await callLlama(systemPrompt, `Melhore o seguinte título de anúncio de imóvel:\n\n${title}`);
      return res.status(200).json({ title: enhancedTitle.trim() });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to enhance title' });
    }
  }

  if (action === 'extract-features') {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const systemPrompt = `Você é um extrator de dados de propriedades imobiliárias. Dado um texto descritivo sobre um imóvel, você deve extrair as principais características estruturais (ex: número de quartos, vagas, tamanho, amenidades como piscina, etc.). 
A sua resposta DEVE ser estritamente um array JSON válido de strings curtas e diretas. Não inclua mais nada na sua resposta além do array JSON (nem aspas markdown).
Exemplo: ["3 quartos", "2 vagas", "Piscina", "Varanda gourmet"]`;

    try {
      const featuresJsonText = await callLlama(systemPrompt, `Extraia as características deste texto:\n\n${text}`);
      let cleanJson = featuresJsonText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const features = JSON.parse(cleanJson);
      return res.status(200).json({ features });
    } catch (err) {
      console.error('Failed to extract features', err);
      return res.status(500).json({ error: 'Failed to extract features' });
    }
  }

  if (action === 'moderate-content') {
    const { title, description } = req.body;
    if (!title && !description) return res.status(400).json({ error: 'Title or description is required' });

    const systemPrompt = `Você é um moderador de conteúdo de uma plataforma de anúncios de imóveis. O seu objetivo é analisar o título e a descrição de um anúncio e verificar se há qualquer tipo de violação das regras da comunidade.
Regras:
1. Bloqueie palavrões, xingamentos, linguagem obscena ou ofensiva.
2. Bloqueie piadas de mau gosto (zueira), linguagem pejorativa ou discriminatória.
3. Se o texto estiver limpo e adequado para um site profissional de imóveis, aprove-o.
4. Responda ESTRITAMENTE num formato JSON válido sem explicações adicionais nem blocos de código (markdown).
Exemplo 1 (Aprovado):
{"approved": true}
Exemplo 2 (Reprovado):
{"approved": false, "reason": "O título contém um termo de baixo calão inapropriado."}`;

    try {
      const promptText = `Analise este anúncio:\n\nTítulo: ${title || ''}\nDescrição: ${description || ''}`;
      const responseText = await callLlama(systemPrompt, promptText);
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const result = JSON.parse(cleanJson);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Failed to moderate content', err);
      return res.status(500).json({ error: 'Failed to moderate content' });
    }
  }

  if (action === 'moderate-name') {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const systemPrompt = `Você é um moderador de conteúdo de uma plataforma profissional de anúncios de imóveis. O seu objetivo é analisar o nome de usuário (perfil) e verificar se há qualquer tipo de violação das regras da comunidade.
Regras:
1. Bloqueie palavrões, xingamentos, linguagem obscena ou ofensiva.
2. Bloqueie piadas de mau gosto (zueira), linguagem pejorativa, discriminatória ou nomes claramente falsos de caráter jocoso.
3. Se o nome estiver aceitável e adequado para um ambiente profissional, aprove-o.
4. Responda ESTRITAMENTE num formato JSON válido sem explicações adicionais nem blocos de código (markdown).
Exemplo 1 (Aprovado):
{"approved": true}
Exemplo 2 (Reprovado):
{"approved": false, "reason": "O nome contém termos inapropriados ou ofensivos."}`;

    try {
      const promptText = `Analise este nome de usuário:\n\nNome: ${name}`;
      const responseText = await callLlama(systemPrompt, promptText);
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const result = JSON.parse(cleanJson);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Failed to moderate name', err);
      return res.status(500).json({ error: 'Failed to moderate name' });
    }
  }

  return res.status(404).json({ error: 'Action not found' });
}
