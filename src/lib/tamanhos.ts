/**
 * Os tamanhos que a loja trabalha, na ordem em que devem aparecer na tela.
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
export const TAMANHOS = ["PP", "P", "M", "G", "GG"] as const;

export type Tamanho = (typeof TAMANHOS)[number];

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
