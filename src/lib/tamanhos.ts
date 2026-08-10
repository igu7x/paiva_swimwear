/**
 * Os tamanhos que a loja trabalha, na ordem em que devem aparecer na tela.
 *
 * Estes valores vêm da tabela de tamanhos oficial da marca, não são chute.
 *
 * A lista vive aqui e não no banco de propósito. No cadastro, ela marca os
 * tamanhos numa fileira de botões em vez de digitar — menos passos, menos erro
 * de digitação ("M" e "m" viram tamanhos diferentes num campo livre). E quando
 * um tamanho novo precisar existir, é acrescentar nesta linha: nada de migração
 * de banco, nada de deploy diferente.
 *
 * A coluna `tamanho` no banco continua sendo texto. Isso é de propósito também:
 * se um dia a lista mudar, os pedidos antigos continuam mostrando o tamanho que
 * foi vendido na época, mesmo que ele não seja mais oferecido.
 */
export const TAMANHOS = ["P", "M", "G", "GG"] as const;

export type Tamanho = (typeof TAMANHOS)[number];

/**
 * As medidas de cada tamanho, para a tela de "qual é o meu tamanho?".
 *
 * A compra é no celular e sem poder provar, então esta tabela é o que evita a
 * troca depois — e a pergunta "qual tamanho eu peço?" que hoje ela responde uma
 * por uma no WhatsApp.
 */
export const MEDIDAS: Record<Tamanho, { quadril: string; busto: string }> = {
  P: { quadril: "34-36", busto: "34-36" },
  M: { quadril: "38-40", busto: "38-40" },
  G: { quadril: "42", busto: "42" },
  GG: { quadril: "44", busto: "44" },
};

/**
 * Regra da loja, que aparece na tabela oficial: o conjunto sai todo no mesmo
 * tamanho. Não existe vender top P com calcinha M.
 *
 * É por isso que o estoque é por (cor, tamanho) e não por peça separada — e é
 * o que responde a dúvida que tinha ficado em aberto lá na fundação.
 */
export const CONJUNTO_TAMANHO_UNICO = true;

/**
 * Ordena tamanhos vindos do banco na ordem de TAMANHOS ("P" antes de "GG"),
 * e não em ordem alfabética, que colocaria "G" antes de "M".
 *
 * Tamanho que não está mais na lista vai para o fim em vez de sumir — pedido
 * antigo continua legível.
 */
export function ordenarTamanhos<T extends { tamanho: string }>(itens: T[]): T[] {
  const posicao = (t: string) => {
    const i = TAMANHOS.indexOf(t as Tamanho);
    return i === -1 ? TAMANHOS.length : i;
  };
  return [...itens].sort((a, b) => posicao(a.tamanho) - posicao(b.tamanho));
}
