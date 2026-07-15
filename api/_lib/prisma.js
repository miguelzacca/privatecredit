import { PrismaClient } from "@prisma/client";
import pg from "pg";
const { Pool } = pg;
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis;

const connectionString = "postgres://b19c4df734496508faecc0664b58d8d8f3b2c391ed2fdd4af8278b706e0e6deb:sk_I0rVW7QGkljD-Psrkmp1v@db.prisma.io:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
