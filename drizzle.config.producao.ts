import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * Configuração de migração APONTANDO PARA O BANCO DE PRODUÇÃO.
 *
 * Existe um arquivo separado, e não uma variável de ambiente, de propósito:
 * mexer na loja de verdade tem que ser um ato explícito, com um comando
 * diferente. Ninguém migra produção sem querer.
 *
 * Ela lê o `.env.producao.local`, que guarda só a conexão de produção e nunca
 * vai para o Git. O `.env.local` — o do dia a dia — aponta para o Postgres da
 * sua máquina.
 *
 * Use com:  npm run db:migrate:prod
 */
config({ path: ".env.producao.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
