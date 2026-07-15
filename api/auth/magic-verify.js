import prisma from "../_lib/prisma.js";
import { JWT_SECRET } from "../_lib/auth.js";
import jwt from "jsonwebtoken";
import cookieModule from "cookie";
const { serialize } = cookieModule;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Token ausente" });
  }

  try {
    const record = await prisma.magicToken.findUnique({ where: { token } });

    if (!record) {
      return res.status(400).json({ error: "Link inválido ou já utilizado.", code: "INVALID_TOKEN" });
    }

    if (record.used) {
      return res.status(400).json({ error: "Este link já foi utilizado. Solicite um novo.", code: "ALREADY_USED" });
    }

    if (new Date() > record.expiresAt) {
      // Mark as used/expired
      await prisma.magicToken.update({ where: { token }, data: { used: true } });
      return res.status(400).json({ error: "Link expirado. Solicite um novo link de acesso.", code: "EXPIRED" });
    }

    // Mark as used
    await prisma.magicToken.update({ where: { token }, data: { used: true } });

    let user;

    if (record.isRegister) {
      // Upsert: if email already exists (e.g. Google user), just log them in
      user = await prisma.user.findUnique({ where: { email: record.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: record.name || "Usuário",
            email: record.email,
            password: "", // passwordless
          },
        });
      }
    } else {
      // Login: user must exist
      user = await prisma.user.findUnique({ where: { email: record.email } });
      if (!user) {
        return res.status(404).json({ error: "Conta não encontrada. Crie uma conta primeiro.", code: "USER_NOT_FOUND" });
      }
    }

    // Issue JWT cookie
    const authToken = jwt.sign({ userId: user.id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.setHeader("Set-Cookie", serialize("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }));

    return res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, image: user.image, phone: user.phone, cpf: user.cpf },
    });
  } catch (err) {
    console.error("magic-verify error:", err);
    return res.status(500).json({ error: "Erro interno. Tente novamente." });
  }
}
