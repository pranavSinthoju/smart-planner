import { PrismaClient } from "@prisma/client";

// A single shared client, cached on globalThis so `tsx watch`'s hot reload
// doesn't open a new connection pool on every file save.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
