import prisma from '../_lib/prisma.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieModule from 'cookie'
const { serialize } = cookieModule
import { JWT_SECRET, verifyAuth } from '../_lib/auth.js'
import { applyRateLimit } from '../_lib/rateLimit.js'
import { verifyCsrf, generateCsrfToken, setCsrfCookies } from '../_lib/csrf.js'
import xss from 'xss'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const MIN_NAME = 3
const MAX_NAME = 60

function validateName(name) {
  if (!name || typeof name !== 'string') return 'Nome é obrigatório'
  const t = name.trim()
  if (t.length < MIN_NAME)
    return `Nome deve ter no mínimo ${MIN_NAME} caracteres`
  if (t.length > MAX_NAME)
    return `Nome deve ter no máximo ${MAX_NAME} caracteres`
  return null
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'E-mail é obrigatório'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email.trim())) return 'E-mail inválido'
  return null
}

async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // bypass if no secret configured
  if (!token) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    })
    const data = await res.json()
    return data.success
  } catch (err) {
    console.error('Turnstile verification error:', err)
    return false
  }
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function emailHtml({ name, magicUrl, isRegister }) {
  const greeting = isRegister ? `Olá, ${name}!` : 'Olá!'
  const subject_body = isRegister
    ? 'Confirme seu cadastro'
    : 'Link de acesso à sua conta'
  const cta = isRegister ? 'Confirmar e entrar' : 'Acessar minha conta'
  const info = isRegister
    ? 'Você solicitou criar uma conta na plataforma Private Credit.'
    : 'Você solicitou um link de acesso à sua conta na plataforma Private Credit.'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject_body}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#000000 0%,#333333 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">White <span style="color:#cccccc;">Private Credit</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0d2342;">${greeting}</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">${info}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.6;">Clique no botão abaixo para ${isRegister ? 'confirmar seu cadastro e' : ''} acessar a plataforma. O link é válido por <strong>15 minutos</strong>.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:#000000;border-radius:10px;">
                    <a href="${magicUrl}" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${cta} →</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Se o botão não funcionar, copie e cole este link no navegador:</p>
              <p style="margin:0;font-size:12px;color:#000000;word-break:break-all;">${magicUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Se você não solicitou este acesso, ignore este e-mail. Nenhuma ação é necessária.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export default async function handler(req, res) {
  const { action } = req.query

  if (req.method === 'GET' && action === 'csrf') {
    const token = generateCsrfToken()
    setCsrfCookies(res, token)
    return res.status(200).json({ success: true, token })
  }

  // Handle magic-verify logic
  if (req.method === 'GET' && action === 'magic-verify') {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: 'Token ausente' })

    try {
      const record = await prisma.magicToken.findUnique({ where: { token } })

      if (!record)
        return res
          .status(400)
          .json({
            error: 'Link inválido ou já utilizado.',
            code: 'INVALID_TOKEN',
          })
      if (record.used)
        return res
          .status(400)
          .json({
            error: 'Este link já foi utilizado. Solicite um novo.',
            code: 'ALREADY_USED',
          })
      if (new Date() > record.expiresAt) {
        await prisma.magicToken.update({
          where: { token },
          data: { used: true },
        })
        return res
          .status(400)
          .json({
            error: 'Link expirado. Solicite um novo link de acesso.',
            code: 'EXPIRED',
          })
      }

      await prisma.magicToken.update({ where: { token }, data: { used: true } })

      let user
      if (record.isRegister) {
        user = await prisma.user.findUnique({ where: { email: record.email } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: record.name || 'Usuário',
              email: record.email,
              password: '',
            },
          })
        }
      } else {
        user = await prisma.user.findUnique({ where: { email: record.email } })
        if (!user) {
          return res
            .status(404)
            .json({
              error: 'Conta não encontrada. Crie uma conta primeiro.',
              code: 'USER_NOT_FOUND',
            })
        }
      }

      const authToken = jwt.sign(
        { userId: user.id, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' },
      )

      res.setHeader(
        'Set-Cookie',
        serialize('auth_token', authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        }),
      )

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          phone: user.phone,
          cpf: user.cpf,
        },
      })
    } catch (err) {
      console.error('magic-verify error:', err)
      return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
    }
  }

  if (req.method !== 'GET') {
    if (!verifyCsrf(req)) {
      return res.status(403).json({ error: 'Token CSRF inválido ou ausente' })
    }
  }

  const isAllowed = await applyRateLimit(req, res, {
    limit: 20,
    windowMs: 60000,
  })
  if (!isAllowed) {
    return res
      .status(429)
      .json({ error: 'Muitas requisições. Tente novamente mais tarde.' })
  }

  if (req.method === 'POST') {
    if (action === 'magic-send') {
      const { email, name, isRegister, turnstileToken } = req.body
      
      const isTurnstileValid = await verifyTurnstile(turnstileToken)
      if (!isTurnstileValid) {
        return res.status(400).json({ error: 'Falha na verificação de segurança. Tente novamente.' })
      }

      const emailError = validateEmail(email)
      if (emailError) return res.status(400).json({ error: emailError })

      const normalizedEmail = email.trim().toLowerCase()
      let safeName = name
      if (isRegister) {
        safeName = xss(name || '')
        const nameError = validateName(safeName)
        if (nameError) return res.status(400).json({ error: nameError })
      }

      try {
        if (!isRegister) {
          const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })
          if (!existing) {
            return res
              .status(404)
              .json({
                error:
                  'Nenhuma conta encontrada com este e-mail. Crie uma conta primeiro.',
                code: 'USER_NOT_FOUND',
              })
          }
        } else {
          const existing = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })
          if (existing) {
            return res
              .status(409)
              .json({
                error:
                  'Este e-mail já está em uso. Faça login em vez de criar uma conta.',
                code: 'USER_ALREADY_EXISTS',
              })
          }
        }

        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
        const recentToken = await prisma.magicToken.findFirst({
          where: {
            email: normalizedEmail,
            createdAt: { gte: thirtySecondsAgo },
          },
        })

        if (recentToken) {
          return res
            .status(429)
            .json({
              error: 'Aguarde 30 segundos antes de solicitar um novo link.',
              code: 'COOLDOWN_ACTIVE',
            })
        }

        await prisma.magicToken.updateMany({
          where: { email: normalizedEmail, used: false },
          data: { used: true },
        })

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

        await prisma.magicToken.create({
          data: {
            token,
            email: normalizedEmail,
            name: isRegister ? safeName.trim() : null,
            isRegister: !!isRegister,
            expiresAt,
          },
        })

        const appUrl = process.env.APP_URL || 'http://localhost:3000'
        const magicUrl = `${appUrl}/auth/verify?token=${token}`
        const transporter = createTransporter()
        const subject = isRegister
          ? 'Confirme seu cadastro — Private Credit'
          : 'Seu link de acesso — Private Credit'

        await transporter.sendMail({
          from: `"Private Credit" <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject,
          html: emailHtml({
            name: safeName?.trim() || 'usuário',
            magicUrl,
            isRegister,
          }),
        })

        return res.status(200).json({ success: true })
      } catch (err) {
        console.error('magic-send error:', err)
        return res
          .status(500)
          .json({ error: 'Falha ao enviar o e-mail. Tente novamente.' })
      }
    }

    if (action === 'google') {
      const { token, turnstileToken } = req.body
      if (!token) return res.status(400).json({ error: 'Token is required' })

      const isTurnstileValid = await verifyTurnstile(turnstileToken)
      if (!isTurnstileValid) {
        return res.status(400).json({ error: 'Falha na verificação de segurança. Tente novamente.' })
      }

      try {
        const userInfoRes = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (!userInfoRes.ok)
          return res.status(401).json({ error: 'Token inválido ou expirado' })

        const userInfo = await userInfoRes.json()
        const { email, name, picture } = userInfo

        const safeName = name ? xss(name) : 'Usuário'
        const safePicture = picture ? xss(picture) : null

        if (!email)
          return res
            .status(400)
            .json({ error: 'O Google não forneceu um e-mail' })

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: safeName,
              email,
              password: '',
              image: safePicture,
            },
          })
        } else if (safePicture && user.image !== safePicture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { image: safePicture },
          })
        }

        const authToken = jwt.sign(
          { userId: user.id, name: user.name },
          JWT_SECRET,
          { expiresIn: '7d' },
        )

        res.setHeader(
          'Set-Cookie',
          serialize('auth_token', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          }),
        )

        return res
          .status(200)
          .json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              phone: user.phone,
              cpf: user.cpf,
              profile: user.profile,
            },
          })
      } catch (err) {
        console.error('Google Auth Error:', err)
        return res
          .status(500)
          .json({ error: 'Falha na autenticação com o Google' })
      }
    }

    if (action === 'logout') {
      res.setHeader(
        'Set-Cookie',
        serialize('auth_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: -1,
          path: '/',
        }),
      )
      return res.status(200).json({ success: true })
    }

    return res
      .status(405)
      .json({ error: 'Method not allowed or action not supported' })
  }

  if (req.method === 'GET') {
    if (action === 'me') {
      const authData = verifyAuth(req)
      if (!authData) return res.status(401).json({ error: 'Unauthorized' })

      const user = await prisma.user.findUnique({
        where: { id: String(authData.userId) },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          cpf: true,
          profile: true,
          investorProfileCompleted: true,
        },
      })

      if (!user) return res.status(401).json({ error: 'User not found' })

      return res.status(200).json({ user })
    }

    return res
      .status(405)
      .json({ error: 'Method not allowed or action not supported' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
