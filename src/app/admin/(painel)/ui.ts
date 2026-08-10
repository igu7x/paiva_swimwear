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
 */

/** A coluna de conteúdo. Mesma largura e mesma margem em todas as telas. */
export const pagina = "mx-auto w-full max-w-md px-5 pb-20 pt-8";

/** Bloco branco com borda de um fio. */
export const cartao =
  "rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-4";

/** Campo de texto. */
export const campo =
  "w-full rounded-xl border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-dourado)]";

/** Ação principal da tela. Uma por tela, no máximo. */
export const botaoPrincipal =
  "flex w-full items-center justify-center rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-sm font-medium text-white transition-opacity active:opacity-80 disabled:opacity-50";

/** Ação secundária. */
export const botaoContorno =
  "flex w-full items-center justify-center rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-sm transition-colors active:border-[var(--color-tinta)] disabled:opacity-50";

/** Ação discreta, sem moldura. */
export const botaoTexto =
  "w-full py-2 text-xs text-[var(--color-suave)] transition-opacity active:opacity-60 disabled:opacity-50";

/** Título da tela. */
export const titulo = "font-serif text-[1.75rem] leading-tight";

/** Linha de apoio embaixo do título. */
export const legenda = "text-sm text-[var(--color-suave)]";
