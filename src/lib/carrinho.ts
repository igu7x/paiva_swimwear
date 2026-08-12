/**
 * O CARRINHO MORA NO NAVEGADOR DA CLIENTE.
 *
 * Não existe carrinho no banco, e isso é decisão, não atalho.
 *
 * A cliente não tem cadastro obrigatório. Um carrinho no servidor precisaria de
 * alguma identidade para saber de quem ele é — cookie de sessão anônima, tabela
 * de carrinhos, limpeza dos abandonados. Isso é infraestrutura de marketplace
 * para uma loja com dezenas de pedidos por mês.
 *
 * E tem a regra do projeto: "a peça só sai do estoque quando o pagamento é
 * confirmado". Carrinho não reserva nada. Se ele não reserva nada, ele não
 * precisa existir para o servidor — é um rascunho da cliente.
 *
 * O QUE ELE GUARDA É SÓ IDENTIFICAÇÃO: qual peça, qual cor, qual tamanho,
 * quantas. Nunca preço, nunca nome, nunca foto. Preço vindo do navegador é
 * exatamente o que a regra "preço é sempre decidido pelo servidor" proíbe — e
 * nome e foto guardados aqui ficariam velhos assim que ela editasse a peça.
 * Tudo isso é buscado no servidor toda vez que o carrinho é mostrado.
 */

export type ItemDoCarrinho = {
  produtoId: number;
  variacaoId: number;
  tamanho: string;
  quantidade: number;
};

export const CHAVE_CARRINHO = "paiva.carrinho.v1";

/** Identifica um item: a mesma peça em tamanhos diferentes são duas linhas. */
export function chaveDoItem(item: {
  produtoId: number;
  variacaoId: number;
  tamanho: string;
}): string {
  return `${item.produtoId}:${item.variacaoId}:${item.tamanho}`;
}

/**
 * Lê o carrinho do armazenamento do navegador.
 *
 * Confere cada campo em vez de confiar no que estava gravado. O conteúdo do
 * localStorage é editável pela pessoa e sobrevive a mudanças do nosso código —
 * uma versão antiga com outro formato viraria tela quebrada em vez de carrinho
 * vazio.
 */
export function lerCarrinho(bruto: string | null): ItemDoCarrinho[] {
  if (!bruto) return [];

  try {
    const dados: unknown = JSON.parse(bruto);
    if (!Array.isArray(dados)) return [];

    return dados.flatMap((linha): ItemDoCarrinho[] => {
      if (typeof linha !== "object" || linha === null) return [];
      const i = linha as Record<string, unknown>;

      const produtoId = Number(i.produtoId);
      const variacaoId = Number(i.variacaoId);
      const tamanho = typeof i.tamanho === "string" ? i.tamanho : "";
      const quantidade = Number(i.quantidade);

      if (!Number.isInteger(produtoId) || produtoId <= 0) return [];
      if (!Number.isInteger(variacaoId) || variacaoId <= 0) return [];
      if (!tamanho) return [];
      if (!Number.isInteger(quantidade) || quantidade <= 0) return [];

      return [{ produtoId, variacaoId, tamanho, quantidade: Math.min(quantidade, 99) }];
    });
  } catch {
    return [];
  }
}

/** Quantas peças no total — é o número da bolinha em cima da sacola. */
export function totalDePecas(itens: ItemDoCarrinho[]): number {
  return itens.reduce((soma, item) => soma + item.quantidade, 0);
}
