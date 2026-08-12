"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ehVendedora } from "@/lib/autorizacao";
import {
  apagarProduto,
  apagarVariacao,
  atualizarProduto,
  criarProduto,
  criarVariacao,
  salvarEstoque,
  type DadosProduto,
} from "@/lib/db/produtos";
import { centavosDeTexto } from "@/lib/formato";
import { TAMANHOS } from "@/lib/tamanhos";

/**
 * As ações do cadastro de produtos.
 *
 * Tudo aqui roda no servidor. Nenhuma validação de tela substitui estas: o
 * campo do formulário pode ser burlado, o servidor não. É a mesma ideia da
 * regra "preço é sempre decidido pelo servidor".
 *
 * TODA função deste arquivo começa checando `ehVendedora()`.
 *
 * Antes nenhuma checava, e isso era um buraco de verdade: cada função aqui é um
 * endereço que aceita POST, e o Next.js não exige passar pela tela do painel
 * para chegar nele. Ou seja, apagar uma peça da loja não pedia login nenhum.
 * O layout do painel nunca protegeu isto — ele decide o que é desenhado.
 */

export type EstadoProduto = { erro: string | null };

type Leitura =
  | { ok: true; dados: DadosProduto }
  | { ok: false; erro: string };

function lerDadosDoFormulario(formData: FormData): Leitura {
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const precoTexto = String(formData.get("preco") ?? "");
  const ativo = formData.get("ativo") === "on";

  if (!nome) return { ok: false, erro: "Dê um nome para a peça." };

  const precoCentavos = centavosDeTexto(precoTexto);
  if (precoCentavos === null) {
    return { ok: false, erro: "Preço inválido. Escreva assim: 99,00" };
  }
  if (precoCentavos <= 0) {
    return { ok: false, erro: "O preço precisa ser maior que zero." };
  }

  return { ok: true, dados: { nome, descricao, precoCentavos, ativo } };
}

/** Cadastra uma peça nova, ou salva as alterações de uma existente. */
export async function salvarProduto(
  _estadoAnterior: EstadoProduto,
  formData: FormData,
): Promise<EstadoProduto> {
  if (!(await ehVendedora())) {
    return { erro: "Seu login expirou. Entre de novo." };
  }

  const idTexto = String(formData.get("id") ?? "");
  const lido = lerDadosDoFormulario(formData);

  if (!lido.ok) return { erro: lido.erro };

  let destino: string;

  if (idTexto) {
    const id = Number(idTexto);
    await atualizarProduto(id, lido.dados);
    destino = `/admin/produtos/${id}`;
  } else {
    const id = await criarProduto(lido.dados);
    // Manda direto para a tela da peça: o próximo passo dela é cadastrar as
    // cores, e obrigar a procurar a peça na lista seria um passo à toa.
    destino = `/admin/produtos/${id}`;
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");

  // Fora de try/catch de propósito — o redirect funciona lançando um erro que
  // o Next.js entende.
  redirect(destino);
}

/** Acrescenta uma cor à peça, já com a grade de tamanhos zerada. */
export async function adicionarCor(formData: FormData) {
  if (!(await ehVendedora())) return;

  const produtoId = Number(formData.get("produtoId"));
  const nome = String(formData.get("cor") ?? "").trim();

  if (!produtoId || !nome) return;

  await criarVariacao(produtoId, nome, TAMANHOS);

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");
}

export async function removerCor(formData: FormData) {
  const produtoId = Number(formData.get("produtoId"));
  const variacaoId = Number(formData.get("variacaoId"));

  if (!produtoId || !variacaoId) return;
  if (!(await ehVendedora())) return;

  await apagarVariacao(produtoId, variacaoId);

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");
}

/**
 * Grava as quantidades de uma cor.
 *
 * Quantidade vazia vira zero, e negativo vira zero também — o banco recusaria
 * de qualquer jeito, mas é melhor a tela nem chegar lá.
 */
export async function gravarEstoque(formData: FormData) {
  const produtoId = Number(formData.get("produtoId"));
  const variacaoId = Number(formData.get("variacaoId"));

  if (!produtoId || !variacaoId) return;
  if (!(await ehVendedora())) return;

  const quantidades = TAMANHOS.map((tamanho) => {
    const bruto = Number(formData.get(`quantidade-${tamanho}`));
    const quantidade = Number.isFinite(bruto) ? Math.max(0, Math.trunc(bruto)) : 0;
    return { tamanho, quantidade };
  });

  await salvarEstoque(variacaoId, quantidades);

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/");
}

export async function removerProduto(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  if (!(await ehVendedora())) return;

  await apagarProduto(id);

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  redirect("/admin/produtos");
}
