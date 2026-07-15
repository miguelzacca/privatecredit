import prisma from "../_lib/prisma.js";
import { applyRateLimit } from "../_lib/rateLimit.js";
import { verifyCsrf } from "../_lib/csrf.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import xss from "xss";

const MIN_NAME = 3;
const MAX_NAME = 60;

function validateName(name) {
  if (!name || typeof name !== "string") return "Nome é obrigatório";
  const t = name.trim();
  if (t.length < MIN_NAME) return `Nome deve ter no mínimo ${MIN_NAME} caracteres`;
  if (t.length > MAX_NAME) return `Nome deve ter no máximo ${MAX_NAME} caracteres`;
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== "string") return "E-mail é obrigatório";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return "E-mail inválido";
  return null;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function emailHtml({ name, magicUrl, isRegister }) {
  const greeting = isRegister ? `Olá, ${name}!` : "Olá!";
  const subject_body = isRegister
    ? "Confirme seu cadastro"
    : "Link de acesso à sua conta";
  const cta = isRegister ? "Confirmar e entrar" : "Acessar minha conta";
  const info = isRegister
    ? "Você solicitou criar uma conta na plataforma White Private Credit."
    : "Você solicitou um link de acesso à sua conta na plataforma White Private Credit.";

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
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#000000 0%,#333333 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">White <span style="color:#cccccc;">Private Credit</span></p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0d2342;">${greeting}</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">${info}</p>
              <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.6;">Clique no botão abaixo para ${isRegister ? "confirmar seu cadastro e" : ""} acessar a plataforma. O link é válido por <strong>15 minutos</strong>.</p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:#000000;border-radius:10px;">
                    <a href="${magicUrl}" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${cta} →</a>
                  </td>
                </tr>
              </table>
              <!-- Fallback URL -->
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Se o botão não funcionar, copie e cole este link no navegador:</p>
              <p style="margin:0;font-size:12px;color:#000000;word-break:break-all;">${magicUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
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
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyCsrf(req)) {
    return res.status(403).json({ error: "Token CSRF inválido ou ausente" });
  }

  const isAllowed = await applyRateLimit(req, res, { limit: 10, windowMs: 60000 });
  if (!isAllowed) {
    return res.status(429).json({ error: "Muitas tentativas. Tente novamente em um minuto." });
  }

  const { email, name, isRegister } = req.body;

  // Validate email
  const emailError = validateEmail(email);
  if (emailError) return res.status(400).json({ error: emailError });

  const normalizedEmail = email.trim().toLowerCase();

  let safeName = name;
  // Validate name only for registration
  if (isRegister) {
    safeName = xss(name || '');
    const nameError = validateName(safeName);
    if (nameError) return res.status(400).json({ error: nameError });
  }

  try {
    // For login: ensure user exists
    if (!isRegister) {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!existing) {
        return res.status(404).json({
          error: "Nenhuma conta encontrada com este e-mail. Crie uma conta primeiro.",
          code: "USER_NOT_FOUND",
        });
      }
    } else {
      // For register: check if email already has an account
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return res.status(409).json({
          error: "Este e-mail já está em uso. Faça login em vez de criar uma conta.",
          code: "USER_ALREADY_EXISTS",
        });
      }
    }

    // Cooldown check: prevent spamming the same email
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentToken = await prisma.magicToken.findFirst({
      where: {
        email: normalizedEmail,
        createdAt: { gte: thirtySecondsAgo }
      }
    });

    if (recentToken) {
      return res.status(429).json({
        error: "Aguarde 30 segundos antes de solicitar um novo link.",
        code: "COOLDOWN_ACTIVE"
      });
    }

    // Invalidate any previous unused tokens for this email
    await prisma.magicToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Create new token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.magicToken.create({
      data: {
        token,
        email: normalizedEmail,
        name: isRegister ? safeName.trim() : null,
        isRegister: !!isRegister,
        expiresAt,
      },
    });

    // Build magic URL
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const magicUrl = `${appUrl}/auth/verify?token=${token}`;

    // Send email
    const transporter = createTransporter();
    const subject = isRegister
      ? "Confirme seu cadastro — White Private Credit"
      : "Seu link de acesso — White Private Credit";

    await transporter.sendMail({
      from: `"White Private Credit" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject,
      html: emailHtml({ name: safeName?.trim() || "usuário", magicUrl, isRegister }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("magic-send error:", err);
    return res.status(500).json({ error: "Falha ao enviar o e-mail. Tente novamente." });
  }
}
