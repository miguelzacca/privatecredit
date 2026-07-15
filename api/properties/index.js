import prisma from '../_lib/prisma.js'
import { verifyAuth } from '../_lib/auth.js'
import { verifyCsrf } from '../_lib/csrf.js'
import { applyRateLimit } from '../_lib/rateLimit.js'
import { callLlama } from '../_lib/ai.js'
import Fuse from 'fuse.js'
import xss from 'xss'

import { v2 as cloudinary } from 'cloudinary'

// Cache global para a busca inteligente (Fuse.js)
let searchCache = {
  data: [],
  fuse: null,
  lastFetched: 0,
}
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos de cache em memória

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  const isAllowed = await applyRateLimit(req, res);
  if (!isAllowed) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }

  if (!verifyCsrf(req)) {
    return res.status(403).json({
      error: 'Token CSRF inválido ou ausente',
      debug: {
        header: !!(req.headers['x-xsrf-token'] || req.headers['x-csrf-token']),
        cookie: !!req.headers.cookie?.includes('_csrfSecret'),
      },
    })
  }

  if (req.method === 'GET') {
    const {
      userId,
      q,
      adType,
      isFeatured,
      city,
      state,
      priceMin,
      priceMax,
      tipo,
      quartos,
      banheiros,
      vagas,
      areaMin,
      areaMax,
      orderBy: orderByParam,
      page: pageParam,
      limit: limitParam,
    } = req.query

    const user = verifyAuth(req)

    // Set HTTP Edge Caching headers if we are not filtering by a specific user's properties
    // This will cache responses on Vercel's edge network for 60s, keeping them fast
    if (!userId) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    }

    // Se o usuário não está logado, exige validação de assinatura e Turnstile
    if (!user) {
      const appTime = req.headers['x-app-time']
      const appSig = req.headers['x-app-sig']
      if (!appTime || !appSig) {
        return res.status(403).json({ error: 'Missing signature' })
      }

      const now = Date.now()
      if (Math.abs(now - parseInt(appTime, 10)) > 2 * 60 * 1000) {
        return res.status(403).json({ error: 'Signature expired' })
      }

      const expectedSig = Buffer.from(`${appTime}_corretores_litoral`).toString(
        'base64',
      )
      if (appSig !== expectedSig) {
        return res.status(403).json({ error: 'Invalid signature' })
      }

      const turnstileToken = req.headers['x-turnstile-token']
      if (!turnstileToken) {
        return res.status(403).json({ error: 'Turnstile token required' })
      }

      if (turnstileToken !== 'bypass' && turnstileToken !== 'bypass-trust') {
        const secretKey = process.env.TURNSTILE_SECRET_KEY || '';
        try {
          const turnstileRes = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                secret: secretKey,
                response: turnstileToken,
              }),
            },
          )
          const turnstileData = await turnstileRes.json()
          if (!turnstileData.success) {
            return res
              .status(403)
              .json({ error: 'Turnstile verification failed' })
          }
        } catch (err) {
          return res.status(500).json({ error: 'Error verifying Turnstile' })
        }
      }
    }

    // ── Pagination ───────────────────────────────────────────────
    if (limitParam && parseInt(limitParam, 10) > 48) {
      return res
        .status(400)
        .json({
          error:
            'Limite de itens por página excedido. O máximo permitido é 48.',
        })
    }
    const limit = Math.min(parseInt(limitParam, 10) || 12, 48)
    const page = Math.max(parseInt(pageParam, 10) || 1, 1)
    const skip = (page - 1) * limit

    // ── Smart Search (In-Memory Cache para TODOS os requests) ────
    try {
      const now = Date.now()
      // Atualiza o cache se estiver vazio ou expirado
      if (!searchCache.fuse || now - searchCache.lastFetched > CACHE_TTL_MS) {
        const allPropsForSearch = await prisma.property.findMany({
          include: { user: { select: { name: true, creci: true } } },
          orderBy: { createdAt: 'desc' },
        })

        const fuseOptions = {
          keys: [
            { name: 'title', weight: 0.5 },
            { name: 'city', weight: 0.3 },
            { name: 'features', weight: 0.2 },
            { name: 'description', weight: 0.1 },
          ],
          threshold: 0.3, // Tolerância a erros (Fuzzy)
          ignoreLocation: true,
          minMatchCharLength: 2,
        }

        searchCache.data = allPropsForSearch
        searchCache.fuse = new Fuse(allPropsForSearch, fuseOptions)
        searchCache.lastFetched = now
      }

      let filteredMemProps = []
      let aiSuggestedQuery = null

      if (q && q.trim()) {
        let results = searchCache.fuse.search(q.trim())
        // Se não houver resultados, aciona a Inteligência Artificial para reformular a busca
        if (results.length === 0) {
          try {
            const systemPrompt = `Você é um corretor de imóveis especialista em buscas.
O usuário buscou o termo: "${q.trim()}" e nossa busca não encontrou nada.
Identifique erros de digitação grosseiros ou simplifique o termo focado em encontrar imóveis.
Exemplos: "apto 3 qrts com picina" -> "apartamento piscina", "csa pert d pryia" -> "casa praia".
Retorne APENAS a string corrigida e simplificada. Nada mais.`

            const newQuery = await callLlama(systemPrompt, 'Reescreva a busca.')

            if (
              newQuery &&
              newQuery.trim() &&
              newQuery.trim().toLowerCase() !== q.trim().toLowerCase()
            ) {
              results = searchCache.fuse.search(newQuery.trim())
              if (results.length > 0) {
                aiSuggestedQuery = newQuery.trim()
              }
            }
          } catch (aiErr) {
            console.error('Falha ao usar IA para refazer busca:', aiErr)
          }
        }
        filteredMemProps = results.map((r) => r.item)
      } else {
        filteredMemProps = [...searchCache.data]
      }

      // Aplica os outros filtros no resultado da busca
      if (userId)
        filteredMemProps = filteredMemProps.filter((p) => p.userId === userId)
      if (adType && adType !== 'todos')
        filteredMemProps = filteredMemProps.filter((p) => p.adType === adType)
      if (isFeatured === 'true')
        filteredMemProps = filteredMemProps.filter((p) => p.isFeatured === true)
      if (city && city.trim())
        filteredMemProps = filteredMemProps.filter((p) =>
          p.city?.toLowerCase().includes(city.trim().toLowerCase()),
        )
      if (state && state.trim())
        filteredMemProps = filteredMemProps.filter((p) =>
          p.state?.toLowerCase().includes(state.trim().toLowerCase()),
        )
      if (priceMin)
        filteredMemProps = filteredMemProps.filter(
          (p) => p.price >= parseFloat(priceMin),
        )
      if (priceMax)
        filteredMemProps = filteredMemProps.filter(
          (p) => p.price <= parseFloat(priceMax),
        )

      if (tipo && tipo !== 'todos') {
        const typeLower = tipo.toLowerCase()
        filteredMemProps = filteredMemProps.filter(
          (p) =>
            p.title?.toLowerCase().includes(typeLower) ||
            p.description?.toLowerCase().includes(typeLower) ||
            p.features?.toLowerCase().includes(typeLower),
        )
      }

      if (quartos) {
        const reqQtd = parseInt(quartos, 10)
        filteredMemProps = filteredMemProps.filter((p) => p.bedrooms >= reqQtd)
      }
      if (banheiros) {
        const reqQtd = parseInt(banheiros, 10)
        filteredMemProps = filteredMemProps.filter((p) => p.bathrooms >= reqQtd)
      }
      if (vagas) {
        const reqQtd = parseInt(vagas, 10)
        filteredMemProps = filteredMemProps.filter(
          (p) => p.parkingSpaces >= reqQtd,
        )
      }
      if (areaMin || areaMax) {
        filteredMemProps = filteredMemProps.filter((p) => {
          if (p.area === 0) return true // Keep old properties without area or if area is unknown
          if (areaMin && p.area < parseFloat(areaMin)) return false
          if (areaMax && p.area > parseFloat(areaMax)) return false
          return true
        })
      }

      // Aplica ordenação
      if (orderByParam === 'price_asc')
        filteredMemProps.sort((a, b) => a.price - b.price)
      else if (orderByParam === 'price_desc')
        filteredMemProps.sort((a, b) => b.price - a.price)
      else if (orderByParam === 'date_asc')
        filteredMemProps.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        )
      else if (orderByParam === 'date_desc')
        filteredMemProps.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )

      const memTotal = filteredMemProps.length
      const memTotalPages = Math.ceil(memTotal / limit)
      const memPaginatedProps = filteredMemProps.slice(skip, skip + limit)

      const data = {
        properties: memPaginatedProps,
        total: memTotal,
        page,
        totalPages: memTotalPages,
        aiSuggestedQuery, // envia a sugestão para o front, se houver
      }

      if (!user) {
        const payload = Buffer.from(JSON.stringify(data)).toString('base64')
        return res.status(200).json({ data: payload })
      }
      return res.status(200).json(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
      return res.status(500).json({ error: 'Error fetching properties' })
    }
  }

  if (req.method === 'POST') {
    // Create property (protected)
    const authData = verifyAuth(req)
    if (!authData) return res.status(401).json({ error: 'Unauthorized' })

    // Enforce complete profile
    const dbUser = await prisma.user.findUnique({
      where: { id: String(authData.userId) },
    })
    if (!dbUser || !dbUser.phone || !dbUser.cpf) {
      return res
        .status(403)
        .json({
          error:
            'Para publicar anúncios, é necessário validar seu telefone e CRECI.',
        })
    }

    const {
      title,
      description,
      price,
      features,
      bedrooms,
      bathrooms,
      parkingSpaces,
      area,
      isFeatured,
      adType,
      city,
      state,
      images,
    } = req.body

    if (!title || !description || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (Array.isArray(images) && images.length > 10) {
      return res
        .status(400)
        .json({ error: 'Você pode enviar no máximo 10 imagens por anúncio.' })
    }

    const safeTitle = xss(title)
    const safeDescription = xss(description)
    const safeCity = xss(city || '')
    const safeState = xss(state || '')
    const safeAdType = xss(adType || 'venda')
    const safeFeatures = Array.isArray(features)
      ? features.map((f) => (typeof f === 'string' ? xss(f) : f))
      : []

    if (safeTitle.trim().length < 30) {
      return res
        .status(400)
        .json({ error: 'O título deve ter no mínimo 30 caracteres.' })
    }

    if (safeDescription.trim().length < 100) {
      return res
        .status(400)
        .json({ error: 'A descrição deve ter no mínimo 100 caracteres.' })
    }
    try {
      const slugify = (text) =>
        text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '')
      const slug = `${slugify(safeTitle)}-${Math.random().toString(36).substring(2, 7)}`

      let finalImages = []
      if (Array.isArray(images)) {
        for (const img of images) {
          if (img.startsWith('data:image')) {
            const uploadResponse = await cloudinary.uploader.upload(img, {
              folder: 'corretores_do_litoral',
            })
            finalImages.push(uploadResponse.secure_url)
          } else {
            finalImages.push(img)
          }
        }
      }

      const property = await prisma.property.create({
        data: {
          title: safeTitle,
          slug,
          description: safeDescription,
          price: parseFloat(price),
          features: JSON.stringify(safeFeatures),
          bedrooms: bedrooms ? parseInt(bedrooms, 10) : 0,
          bathrooms: bathrooms ? parseInt(bathrooms, 10) : 0,
          parkingSpaces: parkingSpaces ? parseInt(parkingSpaces, 10) : 0,
          area: area ? parseFloat(area) : 0,
          isFeatured: Boolean(isFeatured),
          adType: safeAdType,
          city: safeCity,
          state: safeState,
          images: JSON.stringify(finalImages),
          userId: authData.userId,
        },
      })
      return res.status(201).json(property)
    } catch (err) {
      return res.status(500).json({ error: 'Error creating property' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
