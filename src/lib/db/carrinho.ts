import "server-only";

import { asc, inArray } from "drizzle-orm";

import type { ItemDoCarrinho } from "@/lib/carrinho";

import { obterDb } from "./index";
import { fotos, produtos, variacoes } from "./schema";

/**
 * O QUE A SACOLA TEM DE VERDADE.
 *
 * O navegador da cliente manda só identificação: peça, cor, tamanho, quantas.
 * Tudo o mais — nome, preço, foto, se ainda tem no estoque — é buscado aqui.
 *
 * Isso não é preciosismo, é a regra número um do projeto: "preço é sempre
 * decidido pelo servidor, nunca aceito do que veio da tela da cliente". Se o
 * preço viesse junto do carrinho, bastaria editar o armazenamento do navegador
 * para comprar um biquíni por um real.
 *
 * O efeito colateral é bom: um carrinho aberto ontem mostra o preço de hoje, e
 * a peça que esgotou aparece marcada em vez de seguir para o pagamento.
 */

export type LinhaDoCarrinho = {
  produtoId: number;
  variacaoId: number;
  tamanho: string;
  quantidade: number;

  nome: string;
  slug: string;
  cor: string;
  precoCentavos: number;
  foto: string | null;

  /** Quantas unidades existem daquele tamanho naquela cor, agora. */
  emEstoque: number;
  subtotalCentavos: number;
};

export type ResumoDoCarrinho = {
  linhas: LinhaDoCarrinho[];
  /** Itens que sumiram do catálogo: peça apagada, cor removida, peça oculta. */
  sumiram: number;
  totalCentavos: number;
};

/** Quantas linhas diferentes aceitamos de uma vez. */
const LIMITE = 50;

export async function detalharCarrinho(
  itens: ItemDoCarrinho[],
): Promise<ResumoDoCarrinho> {
  const pedidos = itens.slice(0, LIMITE);

  if (pedidos.length === 0) {
    return { linhas: [], sumiram: 0, totalCentavos: 0 };
  }

  const ids = [...new Set(pedidos.map((i) => i.produtoId))];

  const encontrados = await obterDb().query.produtos.findMany({
    where: inArray(produtos.id, ids),
    with: {
      fotos: { orderBy: [asc(fotos.posicao), asc(fotos.id)] },
      variacoes: {
        orderBy: [asc(variacoes.posicao), asc(variacoes.id)],
        with: { estoque: true },
      },
    },
  });

  const porId = new Map(encontrados.map((p) => [p.id, p]));
  const linhas: LinhaDoCarrinho[] = [];
  let sumiram = 0;

  for (const item of pedidos) {
    const peca = porId.get(item.produtoId);
    const cor = peca?.variacoes.find((v) => v.id === item.variacaoId);

    // Peça apagada, tirada da loja, ou cor removida enquanto a sacola esperava.
    // A linha some e a cliente é avisada — melhor do que ela descobrir isso na
    // hora de pagar.
    if (!peca || !peca.ativo || !cor) {
      sumiram++;
      continue;
    }

    const emEstoque =
      cor.estoque.find((e) => e.tamanho === item.tamanho)?.quantidade ?? 0;

    // A foto da cor, e só depois a da peça — na sacola a cliente precisa
    // reconhecer o que ela escolheu, não a arte da vitrine.
    const foto =
      peca.fotos.find((f) => f.variacaoId === cor.id) ??
      peca.fotos.find((f) => f.variacaoId === null) ??
      peca.fotos[0];

    linhas.push({
      produtoId: peca.id,
      variacaoId: cor.id,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      nome: peca.nome,
      slug: peca.slug,
      cor: cor.nome,
      precoCentavos: peca.precoCentavos,
      foto: foto?.caminho ?? null,
      emEstoque,
      subtotalCentavos: peca.precoCentavos * item.quantidade,
    });
  }

  /*
    O total soma só o que dá para comprar. Somar o que está esgotado daria um
    número que ninguém vai pagar, e o susto viria depois — no momento errado.
  */
  const totalCentavos = linhas
    .filter((l) => l.emEstoque > 0)
    .reduce(
      (soma, l) => soma + l.precoCentavos * Math.min(l.quantidade, l.emEstoque),
      0,
    );

  return { linhas, sumiram, totalCentavos };
}
