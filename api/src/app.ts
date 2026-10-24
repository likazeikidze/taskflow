import express from "express";
import { prisma } from "./lib/prisma.js";

export const app = express();

app.use(express.json());

app.get("health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);

    res.status(503).json({ status: "error", database: "disconnected" });
  }
});
