import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda no terminal, fora do Next.js, então ele não enxerga o
// .env.local sozinho. Esta linha carrega o arquivo para os comandos db:*.
config({ path: ".env.local" });

export default defineConfig({
  // Onde as tabelas estão descritas em TypeScript.
  schema: "./src/lib/db/schema.ts",
  // Onde os arquivos .sql de migração são gravados.
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
