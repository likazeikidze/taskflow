import { Router } from "express";
import { registerSchema } from "./auth.schemas.js";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

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

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  res.status(201).json({
    data: { user: { id: user.id, email, name } },
  });
});
