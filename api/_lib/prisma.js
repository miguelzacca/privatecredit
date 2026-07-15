import { PrismaClient } from "@prisma/client";
import pg from "pg";
const { Pool } = pg;
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL + (process.env.DATABASE_URL.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1"
  : "";

const pool = globalForPrisma.pool || new Pool({ connectionString });

if (!globalForPrisma.pool) {
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });
}

const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

export default prisma;
