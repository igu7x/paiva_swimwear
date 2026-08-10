import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

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

/* ---------------------------------------------------------------------------
 * CATÁLOGO
 *
 * O desenho é uma árvore de três níveis:
 *
 *     Produto "Biquíni Marina"          ← nome, descrição, PREÇO
 *     └── Variação "Onda Preta"         ← as fotos ficam aqui
 *         └── Estoque tamanho M: 2      ← a quantidade fica aqui
 *
 * Duas decisões que valem explicar, porque não são óbvias:
 *
 * O PREÇO FICA NO PRODUTO, não na variação. Ou seja: todas as estampas de uma
 * mesma peça custam igual. É o caso hoje, e um preço por variação dobraria os
 * campos do cadastro para resolver um problema que ainda não existe. Se um dia
 * precisar, é uma coluna nova em `variacoes` — mudança pequena.
 *
 * AS FOTOS PENDURAM NA VARIAÇÃO, não no produto. Essa é a razão de a variação
 * existir: a cliente precisa ver a estampa Coral quando escolhe Coral. Foto no
 * produto obrigaria a mostrar a estampa errada.
 * ------------------------------------------------------------------------- */

/**
 * Uma peça do catálogo.
 *
 * O `slug` é o pedaço do endereço que vai no link do WhatsApp:
 * `/biquini-marina` em vez de `/produto/7`. Link legível dá mais confiança a
 * quem recebe, e é isto que ela vai colar na conversa dezenas de vezes por dia.
 *
 * O `ativo` existe para ela conseguir tirar uma peça do ar sem apagar. Apagar
 * levaria junto o histórico, e um pedido antigo precisa continuar sabendo o que
 * foi vendido.
 */
export const produtos = pgTable(
  "produtos",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    nome: text("nome").notNull(),
    slug: text("slug").notNull().unique(),
    descricao: text("descricao").notNull().default(""),
    precoCentavos: integer("preco_centavos").notNull(),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Biquíni de graça não existe: o banco recusa preço zero ou negativo.
    check("produtos_preco_positivo", sql`${t.precoCentavos} > 0`),
  ],
).enableRLS();

/**
 * Como a peça aparece: uma estampa ou uma cor. O campo é de texto livre porque
 * "Preto" e "Onda Coral" são a mesma ideia para quem compra — o jeito que a
 * peça se parece — e separar em dois campos só encompridaria o cadastro.
 *
 * `posicao` decide a ordem em que as variações aparecem na página. Ela arrasta,
 * o número muda.
 */
export const variacoes = pgTable(
  "variacoes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    produtoId: integer("produto_id")
      .notNull()
      // Apagou o produto, some tudo que pendura nele. Sem isso o banco encheria
      // de variação órfã apontando para produto que não existe mais.
      .references(() => produtos.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    posicao: integer("posicao").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Duas cores "Terracota" no mesmo produto seria erro de digitação dela.
    unique("variacoes_nome_por_produto").on(t.produtoId, t.nome),
    // Só existe para a tabela `fotos` conseguir apontar para o par
    // (variação, produto) de uma vez. Ver o comentário lá embaixo.
    unique("variacoes_id_com_produto").on(t.id, t.produtoId),
  ],
).enableRLS();

/**
 * As fotos.
 *
 * Toda foto pertence a um produto. Ela PODE pertencer também a uma cor:
 *
 *   variacao_id preenchido  → foto daquela cor (o "Terracota" no cabide)
 *   variacao_id vazio       → foto do produto inteiro: a capa, a arte com
 *                             modelo, a foto de detalhe do tecido
 *
 * Essa segunda linha veio das artes reais da loja: a capa do Asa Delta é uma
 * foto azul, e azul nem está entre as cores à venda. Uma foto assim não teria
 * onde morar se toda foto fosse obrigada a ter dono entre as cores.
 *
 * `caminho` não é o endereço completo da imagem, é o caminho dentro do
 * armazenamento do Supabase (algo como `produtos/asa-delta/terracota-1.jpg`).
 * Guardar o caminho em vez da URL inteira é o que permite trocar de provedor de
 * imagem um dia sem reescrever todas as linhas da tabela.
 *
 * A foto de `posicao` 0 é a capa: é ela que aparece na vitrine e na prévia do
 * link mandado no WhatsApp.
 */
export const fotos = pgTable(
  "fotos",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    produtoId: integer("produto_id")
      .notNull()
      .references(() => produtos.id, { onDelete: "cascade" }),
    // Sem `.notNull()`: vazio significa "foto do produto, não de uma cor".
    variacaoId: integer("variacao_id"),
    caminho: text("caminho").notNull(),
    posicao: integer("posicao").notNull().default(0),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Aponta para as DUAS colunas ao mesmo tempo, e não só para variacao_id.
    // Assim o banco garante que a cor da foto pertence ao mesmo produto da
    // foto — sem isso, um defeito no código poderia pendurar a foto do Asa
    // Delta numa cor do Fio Duplo, e a cliente veria a peça errada.
    //
    // Quando variacao_id está vazio, o Postgres não checa nada — que é
    // exatamente o que queremos para as fotos de capa.
    foreignKey({
      columns: [t.variacaoId, t.produtoId],
      foreignColumns: [variacoes.id, variacoes.produtoId],
      name: "fotos_variacao_do_mesmo_produto",
    }).onDelete("cascade"),
  ],
).enableRLS();

/**
 * O estoque de verdade: quantas unidades existem de cada tamanho, dentro de
 * cada variação. Esta é a tabela que mais importa para ela — é a que impede de
 * vender o que já acabou.
 *
 * `tamanho` é texto, mas as telas oferecem a lista fixa de TAMANHOS (ver
 * `src/lib/tamanhos.ts`). Texto no banco com lista fixa na tela dá o melhor dos
 * dois: o cadastro fica sendo clique em vez de digitação, e acrescentar um
 * tamanho novo no futuro é mexer numa linha de código, não migrar o banco.
 */
export const estoque = pgTable(
  "estoque",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    variacaoId: integer("variacao_id")
      .notNull()
      .references(() => variacoes.id, { onDelete: "cascade" }),
    tamanho: text("tamanho").notNull(),
    quantidade: integer("quantidade").notNull().default(0),
  },
  (t) => [
    // Uma linha por tamanho dentro da variação. Sem isto, dois cadastros do
    // tamanho M criariam duas linhas e a conta do estoque ficaria errada.
    unique("estoque_tamanho_por_variacao").on(t.variacaoId, t.tamanho),
    // Estoque negativo é sempre defeito nosso, não situação real. O banco
    // recusando é a última rede de proteção quando o pedido baixar a
    // quantidade, lá na etapa do pagamento.
    check("estoque_quantidade_nao_negativa", sql`${t.quantidade} >= 0`),
  ],
).enableRLS();

/* ---------------------------------------------------------------------------
 * Ligações entre as tabelas.
 *
 * Isto não muda nada no banco — é o que permite pedir "o produto com as
 * variações, e as fotos de cada uma" numa consulta só, em vez de quatro
 * consultas costuradas na mão.
 * ------------------------------------------------------------------------- */

export const produtosRelacoes = relations(produtos, ({ many }) => ({
  variacoes: many(variacoes),
  fotos: many(fotos),
}));

export const variacoesRelacoes = relations(variacoes, ({ one, many }) => ({
  produto: one(produtos, {
    fields: [variacoes.produtoId],
    references: [produtos.id],
  }),
  fotos: many(fotos),
  estoque: many(estoque),
}));

export const fotosRelacoes = relations(fotos, ({ one }) => ({
  produto: one(produtos, {
    fields: [fotos.produtoId],
    references: [produtos.id],
  }),
  variacao: one(variacoes, {
    fields: [fotos.variacaoId],
    references: [variacoes.id],
  }),
}));

export const estoqueRelacoes = relations(estoque, ({ one }) => ({
  variacao: one(variacoes, {
    fields: [estoque.variacaoId],
    references: [variacoes.id],
  }),
}));

/** Formatos das linhas, para usar nos tipos das telas. */
export type Produto = typeof produtos.$inferSelect;
export type Variacao = typeof variacoes.$inferSelect;
export type Foto = typeof fotos.$inferSelect;
export type Estoque = typeof estoque.$inferSelect;
