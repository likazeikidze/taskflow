import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set");
}
const JWT_SECRET: string = secret;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization; // Bearer 71349187349187

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid token" });
    return;
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (typeof payload === "string" || !payload.sub) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.userId = payload.sub;
  next();
}
