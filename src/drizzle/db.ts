import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import * as relations from "./relations";

const TARGET_DB_NAME = "tanstack-jacked";

const postgresUrl = process.env.POSTGRES;

if (!postgresUrl) {
  throw new Error("POSTGRES environment variable is required.");
}

const connectionString = `${postgresUrl}/${TARGET_DB_NAME}`;
const pool = new Pool({ connectionString });

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations,
  },
});
