import jwt from "jsonwebtoken";
import { Router } from "express";
import { registerSchema } from "./auth.schemas.js";
import { loginSchema } from "./auth.schemas.js";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res
      .status(400)
      .json({ error: "Invalid input", issues: result.error.issues });
    return;
  }

  const { email, password, name } = result.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  res.status(201).json({
    data: { user: { id: user.id, email, name } },
  });
});

authRouter.post("/login", async (req, res) => {
  // check data
  const result = loginSchema.safeParse(req.body);

  // if wrong data,
  if (!result.success) {
    res
      .status(400)
      .json({ error: "Invalid input", issues: result.error.issues });
    return;
  }

  // if correct data, retrieve it
  const { email, password } = result.data;

  // if correct data, find user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // if user not found
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // compare password with hash
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // both correct
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, {
    expiresIn: "15 min",
  });

  res.json({
    data: { user: { id: user.id, name: user.name, email: user.email }, token },
  });
});
