import { Client } from "pg";

const TARGET_DB_NAME = "tanstack-jacked";
const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;

export async function setupIfNeeded() {
  const postgresUrl = process.env.POSTGRES;

  if (!postgresUrl) {
    throw new Error("POSTGRES environment variable is required.");
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
    }
  } finally {
    await client.end();
  }
}
