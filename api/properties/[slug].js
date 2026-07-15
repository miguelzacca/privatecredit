import prisma from '../_lib/prisma.js'
import { verifyAuth } from '../_lib/auth.js'
import { verifyCsrf } from '../_lib/csrf.js'
import { applyRateLimit } from '../_lib/rateLimit.js'
import xss from 'xss'

import { v2 as cloudinary } from 'cloudinary'

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
    return res.status(403).json({ error: 'Token CSRF inválido ou ausente' })
  }

  const { slug } = req.query
  if (!slug) return res.status(400).json({ error: 'Missing slug or id' })

  const isNumeric = /^\d+$/.test(slug)
  const whereClause = isNumeric ? { id: parseInt(slug) } : { slug }

  if (req.method === 'GET') {
    // Edge Cache for 5 minutes for individual property details
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

    const user = verifyAuth(req)
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
    }

    const property = await prisma.property.findUnique({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            creci: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
      cacheStrategy: { swr: 300, ttl: 300 }, // Prisma Accelerate DB cache
    })
    if (!property) return res.status(404).json({ error: 'Property not found' })

    if (!user) {
      const payload = Buffer.from(JSON.stringify(property)).toString('base64')
      return res.status(200).json({ data: payload })
    }

    return res.status(200).json(property)
  }

  const authData = verifyAuth(req)
  if (!authData) return res.status(401).json({ error: 'Unauthorized' })

  // For PUT and DELETE, enforce complete profile
  if (req.method === 'PUT' || req.method === 'DELETE') {
    const dbUser = await prisma.user.findUnique({
      where: { id: String(authData.userId) },
    })
    if (!dbUser || !dbUser.phone || !dbUser.cpf) {
      return res.status(403).json({
        error:
          'Para gerenciar anúncios, é necessário validar seu telefone e CRECI.',
      })
    }
  }

  const user = authData

  if (req.method === 'PUT') {
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
      images,
    } = req.body

    const safeTitle = title ? xss(title) : undefined
    const safeDescription = description ? xss(description) : undefined
    const safeFeatures = features
      ? Array.isArray(features)
        ? features.map((f) => (typeof f === 'string' ? xss(f) : f))
        : []
      : undefined

    if (Array.isArray(images) && images.length > 10) {
      return res
        .status(400)
        .json({ error: 'Você pode enviar no máximo 10 imagens por anúncio.' })
    }

    try {
      // Check ownership
      const existing = await prisma.property.findUnique({ where: whereClause })
      if (!existing || existing.userId !== user.userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      let finalImages = existing.images ? JSON.parse(existing.images) : []
      if (images !== undefined && Array.isArray(images)) {
        finalImages = []
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

      const property = await prisma.property.update({
        where: whereClause,
        data: {
          title: safeTitle || existing.title,
          description: safeDescription || existing.description,
          price: price !== undefined ? parseFloat(price) : existing.price,
          features: safeFeatures
            ? JSON.stringify(safeFeatures)
            : existing.features,
          bedrooms:
            bedrooms !== undefined ? parseInt(bedrooms, 10) : existing.bedrooms,
          bathrooms:
            bathrooms !== undefined
              ? parseInt(bathrooms, 10)
              : existing.bathrooms,
          parkingSpaces:
            parkingSpaces !== undefined
              ? parseInt(parkingSpaces, 10)
              : existing.parkingSpaces,
          area: area !== undefined ? parseFloat(area) : existing.area,
          isFeatured:
            isFeatured !== undefined
              ? Boolean(isFeatured)
              : existing.isFeatured,
          images: JSON.stringify(finalImages),
        },
      })
      return res.status(200).json(property)
    } catch (err) {
      return res.status(500).json({ error: 'Error updating property' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const existing = await prisma.property.findUnique({ where: whereClause })
      if (!existing || existing.userId !== user.userId) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.property.delete({ where: whereClause })
      return res.status(204).end()
    } catch (err) {
      return res.status(500).json({ error: 'Error deleting property' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
