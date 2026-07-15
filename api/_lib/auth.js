import jwt from "jsonwebtoken";
import cookieModule from 'cookie';
const { parse } = cookieModule;

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-local-key';

function verifyAuth(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const cookies = parse(cookieHeader);
  const token = cookies.auth_token;
  
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export { verifyAuth, JWT_SECRET };
