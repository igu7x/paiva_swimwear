import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import { gerarSlug } from "@/lib/slug";

import { obterDb } from "./index";
import { estoque, fotos, produtos, variacoes } from "./schema";

/**
 * Tudo que o painel precisa saber sobre os produtos.
 *
 * As telas nunca falam com o banco direto: elas chamam estas funções. Assim a
 * regra de "como um produto é lido e gravado" mora num lugar só, e quando a
 * loja crescer, mudar aqui conserta o sistema inteiro.
 */

/** Um produto com as cores e o estoque de cada tamanho, já ordenados. */
export async function obterProduto(id: number) {
  return obterDb().query.produtos.findFirst({
    where: eq(produtos.id, id),
    with: {
      fotos: { orderBy: [asc(fotos.posicao), asc(fotos.id)] },
      variacoes: {
        orderBy: [asc(variacoes.posicao), asc(variacoes.id)],
        with: { estoque: true },
      },
    },
  });
}

/** O mesmo, mas achando pelo endereço — é como a vitrine vai buscar. */
export async function obterProdutoPorSlug(slug: string) {
  return obterDb().query.produtos.findFirst({
    where: eq(produtos.slug, slug),
    with: {
      fotos: { orderBy: [asc(fotos.posicao), asc(fotos.id)] },
      variacoes: {
        orderBy: [asc(variacoes.posicao), asc(variacoes.id)],
        with: { estoque: true },
      },
    },
  });
}

/** A lista do painel: os produtos com as cores e o estoque para somar. */
export async function listarProdutos() {
  return obterDb().query.produtos.findMany({
    orderBy: [asc(produtos.nome)],
    with: { variacoes: { with: { estoque: true } } },
  });
}

/**
 * O que a vitrine mostra: só as peças que ela deixou visíveis.
 *
 * Peça sem estoque continua aparecendo, de propósito. Sumir do nada é pior:
 * a cliente que recebeu o link no WhatsApp cairia numa página inexistente. Ela
 * aparece marcada como esgotada, e a conversa continua possível.
 */
export async function listarVitrine() {
  return obterDb().query.produtos.findMany({
    where: eq(produtos.ativo, true),
    orderBy: [asc(produtos.nome)],
    with: {
      fotos: { orderBy: [asc(fotos.posicao), asc(fotos.id)] },
      variacoes: {
        orderBy: [asc(variacoes.posicao), asc(variacoes.id)],
        with: { estoque: true },
      },
    },
  });
}

type ComFotos = {
  fotos: { caminho: string; variacaoId: number | null }[];
};

/**
 * A foto que representa a peça na vitrine.
 *
 * Primeiro a foto da peça (a capa, a arte com modelo). Se não houver, a
 * primeira foto de cor que existir — melhor mostrar a estampa errada do que
 * um quadrado vazio.
 */
export function capaDoProduto(produto: ComFotos): string | null {
  const daPeca = produto.fotos.find((f) => f.variacaoId === null);
  return (daPeca ?? produto.fotos[0])?.caminho ?? null;
}

/** Quantas unidades existem no total, somando todas as cores e tamanhos. */
export function somarEstoque(produto: {
  variacoes: { estoque: { quantidade: number }[] }[];
}): number {
  return produto.variacoes.reduce(
    (total, v) => total + v.estoque.reduce((s, e) => s + e.quantidade, 0),
    0,
  );
}

/**
 * Acha um endereço livre a partir do nome.
 *
 * Se ela cadastrar dois "Biquíni Fio Duplo", o segundo vira
 * "biquini-fio-duplo-2" em vez de estourar um erro de banco na cara dela. O
 * `ignorarId` existe para a edição: ao salvar o mesmo produto, o endereço que
 * ele já usa não conta como ocupado.
 */
async function slugLivre(nome: string, ignorarId?: number): Promise<string> {
  const base = gerarSlug(nome) || "peca";
  const db = obterDb();

  for (let tentativa = 1; tentativa < 100; tentativa++) {
    const candidato = tentativa === 1 ? base : `${base}-${tentativa}`;

    const existente = await db.query.produtos.findFirst({
      columns: { id: true },
      where: eq(produtos.slug, candidato),
    });

    if (!existente || existente.id === ignorarId) return candidato;
  }

  // Cem peças com o mesmo nome não vai acontecer, mas nunca devolva undefined.
  return `${base}-${Date.now()}`;
}

export type DadosProduto = {
  nome: string;
  descricao: string;
  precoCentavos: number;
  ativo: boolean;
};

/** Cadastra a peça e devolve o id, para a tela já abrir nela. */
export async function criarProduto(dados: DadosProduto): Promise<number> {
  const [criado] = await obterDb()
    .insert(produtos)
    .values({ ...dados, slug: await slugLivre(dados.nome) })
    .returning({ id: produtos.id });

  return criado.id;
}

/**
 * Salva as alterações da peça.
 *
 * O endereço acompanha o nome: se ela corrigir "Biquini" para "Biquíni", o
 * link muda junto. Vale a pena enquanto ninguém está divulgando link ainda —
 * quando a loja estiver rodando, isso vira uma decisão a rever, porque link
 * já mandado no WhatsApp pararia de funcionar.
 */
export async function atualizarProduto(id: number, dados: DadosProduto) {
  await obterDb()
    .update(produtos)
    .set({
      ...dados,
      slug: await slugLivre(dados.nome, id),
      atualizadoEm: new Date(),
    })
    .where(eq(produtos.id, id));
}

export async function apagarProduto(id: number) {
  // As cores, as fotos e o estoque somem junto, por causa do "cascade"
  // declarado no schema.
  await obterDb().delete(produtos).where(eq(produtos.id, id));
}

/**
 * Acrescenta uma cor à peça, já com uma linha de estoque zerada para cada
 * tamanho.
 *
 * Criar as linhas zeradas agora, e não quando ela digitar a quantidade, é o que
 * deixa a tela de estoque ser uma grade fixa: todo tamanho sempre tem onde
 * escrever. Sem isso, a tela teria que decidir a cada campo se cria ou atualiza.
 */
export async function criarVariacao(
  produtoId: number,
  nome: string,
  tamanhos: readonly string[],
) {
  const db = obterDb();

  const [posicaoAtual] = await db
    .select({ maior: sql<number>`coalesce(max(${variacoes.posicao}), -1)` })
    .from(variacoes)
    .where(eq(variacoes.produtoId, produtoId));

  const [variacao] = await db
    .insert(variacoes)
    .values({ produtoId, nome, posicao: posicaoAtual.maior + 1 })
    .returning({ id: variacoes.id });

  await db
    .insert(estoque)
    .values(tamanhos.map((tamanho) => ({ variacaoId: variacao.id, tamanho })));

  return variacao.id;
}

/**
 * Apaga uma cor. Só funciona se ela for do produto informado — a tela manda os
 * dois, e o banco confere. Sem essa checagem, um id trocado na requisição
 * apagaria a cor de outra peça.
 */
export async function apagarVariacao(produtoId: number, variacaoId: number) {
  await obterDb()
    .delete(variacoes)
    .where(
      and(eq(variacoes.id, variacaoId), eq(variacoes.produtoId, produtoId)),
    );
}

/**
 * Registra uma foto já enviada para o Storage.
 *
 * `variacaoId` vazio significa foto do produto (a capa, a arte com modelo).
 * A trava no banco garante que a cor informada pertence a este produto.
 */
export async function registrarFoto(
  produtoId: number,
  variacaoId: number | null,
  caminho: string,
) {
  const db = obterDb();

  const [ultima] = await db
    .select({ maior: sql<number>`coalesce(max(${fotos.posicao}), -1)` })
    .from(fotos)
    .where(eq(fotos.produtoId, produtoId));

  const [criada] = await db
    .insert(fotos)
    .values({ produtoId, variacaoId, caminho, posicao: ultima.maior + 1 })
    .returning({ id: fotos.id });

  return criada.id;
}

/**
 * Apaga o registro da foto e devolve o caminho dela, para quem chamou remover
 * o arquivo do Storage também.
 *
 * Confere o produto junto com o id da foto: sem isso, um id trocado na
 * requisição apagaria a foto de outra peça.
 */
export async function apagarFoto(produtoId: number, fotoId: number) {
  const [apagada] = await obterDb()
    .delete(fotos)
    .where(and(eq(fotos.id, fotoId), eq(fotos.produtoId, produtoId)))
    .returning({ caminho: fotos.caminho });

  return apagada?.caminho ?? null;
}

/** Grava as quantidades de uma cor, um tamanho por vez. */
export async function salvarEstoque(
  variacaoId: number,
  quantidades: { tamanho: string; quantidade: number }[],
) {
  const db = obterDb();

  for (const { tamanho, quantidade } of quantidades) {
    await db
      .insert(estoque)
      .values({ variacaoId, tamanho, quantidade })
      // Se a linha já existe (o caso normal), atualiza em vez de estourar erro
      // de duplicidade. É o "estoque_tamanho_por_variacao" do schema agindo a
      // nosso favor.
      .onConflictDoUpdate({
        target: [estoque.variacaoId, estoque.tamanho],
        set: { quantidade },
      });
  }
}
