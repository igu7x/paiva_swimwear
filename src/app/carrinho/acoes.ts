"use server";

import { detalharCarrinho, type ResumoDoCarrinho } from "@/lib/db/carrinho";
import type { ItemDoCarrinho } from "@/lib/carrinho";

/**
 * A ponte entre a sacola do navegador e o catálogo de verdade.
 *
 * A tela manda a lista que está guardada no navegador da cliente e recebe de
 * volta nome, preço, foto e estoque — tudo do servidor.
 *
 * A CONFERÊNCIA DE CADA CAMPO ABAIXO NÃO É EXCESSO. Esta função é um endereço
 * público: qualquer pessoa pode chamá-la com o que quiser dentro. O que chega
 * aqui é texto vindo de fora até ser provado o contrário.
 */
export async function resumirCarrinho(
  bruto: unknown,
): Promise<ResumoDoCarrinho> {
  if (!Array.isArray(bruto)) {
    return { linhas: [], sumiram: 0, totalCentavos: 0 };
  }

  const itens = bruto.flatMap((linha): ItemDoCarrinho[] => {
    if (typeof linha !== "object" || linha === null) return [];
    const i = linha as Record<string, unknown>;

    const produtoId = Number(i.produtoId);
    const variacaoId = Number(i.variacaoId);
    const tamanho = typeof i.tamanho === "string" ? i.tamanho.slice(0, 8) : "";
    const quantidade = Number(i.quantidade);

    if (!Number.isInteger(produtoId) || produtoId <= 0) return [];
    if (!Number.isInteger(variacaoId) || variacaoId <= 0) return [];
    if (!tamanho) return [];
    if (!Number.isInteger(quantidade) || quantidade <= 0) return [];

    return [
      { produtoId, variacaoId, tamanho, quantidade: Math.min(quantidade, 99) },
    ];
  });

  return detalharCarrinho(itens);
}
