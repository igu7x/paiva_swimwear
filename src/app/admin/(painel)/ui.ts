/**
 * As classes compartilhadas das telas do painel.
 *
 * Existe para as telas não irem se afastando: sem um lugar só, cada tela ganha
 * seu próprio tamanho de botão e sua própria borda, e o painel vira uma colcha
 * de retalhos. Mudar o visual passa a ser mudar aqui.
 *
 * As decisões por trás dos números:
 *
 * - Um só tamanho de canto (2xl nos blocos, cheio nos botões).
 * - Bordas de um fio, sem sombra. Sombra pesa e briga com o fundo areia.
 * - Alvo de toque nunca menor que 44px de altura: é o mínimo para o dedo
 *   acertar no celular sem errar.
 * - Campos com texto de 16px. Abaixo disso o iPhone dá zoom sozinho ao tocar,
 *   e a tela "pula".
 *
 * SOBRE O MOVIMENTO. Todo alvo de toque encolhe um pouco enquanto está
 * pressionado (`active:scale-`). Isso não é enfeite: é o que confirma o toque
 * antes de a resposta chegar do servidor. Sem isso, ela toca, nada muda por
 * 300ms, e ela toca de novo.
 *
 * O `touch-manipulation` tira o atraso de ~300ms que o navegador do celular
 * segura esperando para ver se o toque vira um duplo-toque de zoom.
 */

/** Retorno de toque. Vai em tudo que é clicável. */
const toque =
  "touch-manipulation transition-[transform,opacity,border-color,background-color] duration-150 ease-out active:scale-[0.98]";

/** A coluna de conteúdo. Mesma largura e mesma margem em todas as telas. */
export const pagina =
  "mx-auto w-full max-w-md px-5 pb-20 pt-8 animate-entrada";

/** Bloco branco com borda de um fio. */
export const cartao =
  "rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-4";

/** Bloco branco que também é um link ou botão. */
export const cartaoClicavel = `${cartao} ${toque} block active:border-[var(--color-tinta)]`;

/** Campo de texto. */
export const campo =
  "w-full rounded-xl border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-base outline-none transition-colors duration-150 focus:border-[var(--color-dourado)]";

/** Ação principal da tela. Uma por tela, no máximo. */
export const botaoPrincipal = `${toque} flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-sm font-medium text-white active:opacity-90 disabled:pointer-events-none disabled:opacity-60`;

/** Ação secundária. */
export const botaoContorno = `${toque} flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-sm active:border-[var(--color-tinta)] disabled:pointer-events-none disabled:opacity-60`;

/** Ação discreta, sem moldura. */
export const botaoTexto = `${toque} w-full py-2 text-xs text-[var(--color-suave)] active:opacity-60 disabled:opacity-60`;

/** Título da tela. */
export const titulo = "font-serif text-[1.75rem] leading-tight";

/** Linha de apoio embaixo do título. */
export const legenda = "text-sm text-[var(--color-suave)]";
