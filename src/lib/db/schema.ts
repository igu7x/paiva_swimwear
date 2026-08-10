import { sql } from "drizzle-orm";
import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Este arquivo é a descrição das tabelas do banco em TypeScript.
 *
 * Ele é a fonte da verdade: você muda aqui, roda `npm run db:generate` e o
 * Drizzle escreve o arquivo .sql com a mudança. Depois `npm run db:migrate`
 * aplica esse .sql no banco de verdade. Nunca mexa nas tabelas na mão pelo
 * painel do Supabase — se fizer isso, o código e o banco saem de sincronia.
 *
 * Duas convenções que valem para o projeto inteiro:
 *
 * 1. DINHEIRO É SEMPRE INTEIRO, EM CENTAVOS. R$ 189,90 vira 18990. Número com
 *    casa decimal em computador não é exato (0.1 + 0.2 não dá exatamente 0.3),
 *    e isso vira centavo faltando na conta do pedido. Formatar para "R$ 189,90"
 *    é trabalho da tela, não do banco.
 *
 * 2. TODA TABELA LIGA RLS (`.enableRLS()`). O Supabase publica as tabelas numa
 *    API pública automaticamente. Ligar RLS sem criar nenhuma política significa
 *    "ninguém acessa por fora" — só o nosso servidor, que entra pela conexão
 *    direta do Postgres com o DATABASE_URL. É a diferença entre o catálogo ser
 *    lido pelo nosso código e o banco inteiro ficar aberto na internet.
 */

/**
 * Configurações da loja: uma única linha, com os valores que a vendedora
 * precisa poder mudar sem ninguém mexer no código.
 *
 * O `check` na última linha faz o próprio banco recusar uma segunda linha.
 * É mais seguro do que confiar que o código nunca vai inserir duas.
 */
export const configLoja = pgTable(
  "config_loja",
  {
    id: integer("id").primaryKey().default(1),
    nomeLoja: text("nome_loja").notNull(),
    cidade: text("cidade").notNull(),
    whatsapp: text("whatsapp").notNull(),
    freteCentavos: integer("frete_centavos").notNull().default(0),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check("config_loja_linha_unica", sql`${t.id} = 1`)],
).enableRLS();

/** O formato de uma linha de config_loja, para usar nos tipos das telas. */
export type ConfigLoja = typeof configLoja.$inferSelect;
