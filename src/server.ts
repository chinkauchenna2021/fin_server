import express, { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();   // Prisma Client

const app: Express = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});