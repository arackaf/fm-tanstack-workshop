import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TARGET_DB_NAME = "tanstack-jacked";
const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;
const THIS_FILE_DIR = dirname(fileURLToPath(import.meta.url));
const SETUP_SQL_PATH = join(THIS_FILE_DIR, "setup.sql");

export async function setupIfNeeded() {
  const postgresUrl = process.env.POSTGRES;

  if (!postgresUrl) {
    throw new Error("\n\nPOSTGRES environment variable is required.\n\n");
  }

  const connectionString = `${postgresUrl}/postgres`;
  const client = new Client({ connectionString });

  try {
    await client.connect();

    const result = await client.query<{ exists: boolean }>('SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS "exists"', [
      TARGET_DB_NAME,
    ]);

    const exists = result.rows[0]?.exists ?? false;

    if (exists) {
      console.log(`Database "${TARGET_DB_NAME}" exists.`);
    } else {
      const targetDbIdentifier = quoteIdentifier(TARGET_DB_NAME);
      await client.query(`CREATE DATABASE ${targetDbIdentifier}`);
      console.log(`Database "${TARGET_DB_NAME}" did not exist and was created.`);

      const ddlSql = await readFile(SETUP_SQL_PATH, "utf8");
      const setupClient = new Client({ connectionString: `${postgresUrl}/${TARGET_DB_NAME}` });

      try {
        await setupClient.connect();
        await setupClient.query(ddlSql);
        console.log(`Ran DDL script at "${SETUP_SQL_PATH}".`);
      } finally {
        await setupClient.end();
      }
    }
  } catch (er) {
    console.log("=========================================================================");
    console.log("Unable to connect to the database. Do you have Docker running?");
    console.log("If not, please install Docker desktop, make sure it's running, and make");
    console.log("sure you have `npm run pg` running in a separate terminal.");
    console.log("=========================================================================");
  } finally {
    await client.end();
  }
}
