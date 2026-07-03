import jwt from "jsonwebtoken";
import { config } from "./config.js";

export function signToken() {
  return jwt.sign({ sub: config.adminUser }, config.jwtSecret, { expiresIn: "30d" });
}

export function verifyToken(token) {
  try { return jwt.verify(token, config.jwtSecret); } catch { return null; }
}

export function authMiddleware(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token || !verifyToken(token)) return res.status(401).json({ error: "unauthorized" });
  next();
}
