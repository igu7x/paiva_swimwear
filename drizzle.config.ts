import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda no terminal, fora do Next.js, então ele não enxerga o
// .env.local sozinho. Esta linha carrega o arquivo para os comandos db:*.
//
// ATENÇÃO: este arquivo aponta para o banco de DESENVOLVIMENTO, o Postgres da
// sua máquina. Para mexer na loja de verdade existe o drizzle.config.producao.ts
// e o comando `npm run db:migrate:prod` — separados justamente para ninguém
// migrar produção achando que está testando.
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
