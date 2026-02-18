import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://docker:docker@localhost:5432/tanstack-jacked",
  },
  out: "./src/drizzle",
});
