/**
 * DE "TERRACOTA" PARA UMA COR NA TELA.
 *
 * A vendedora escreve o nome da cor à mão, em texto livre — é assim desde o
 * começo, e é o certo: "Preto" e "Onda Coral" são a mesma ideia para quem
 * compra, e obrigar a escolher num seletor de cores travaria o cadastro dela
 * por causa de uma peça estampada.
 *
 * O preço disso é que o sistema recebe uma palavra, não uma cor. Este arquivo
 * faz a tradução: procura no nome uma cor que a gente conheça e devolve o tom.
 *
 * TRÊS COMPORTAMENTOS, nesta ordem:
 *
 *   "Marrom"          -> um tom  -> o botão fica marrom
 *   "Preto e Branco"  -> dois    -> o botão fica meio a meio
 *   "Onda Coral"      -> coral   -> achou "coral" no meio do nome
 *   "Estampa Folhas"  -> nada    -> a tela usa a foto da cor como amostra
 *
 * O último caso é o que faz isto ser seguro de usar: quando não sabemos, não
 * chutamos. Chutar cinza para uma estampa seria pior do que não colorir nada.
 */

/*
  A tabela. Escrita sem acento porque a comparação também tira os acentos —
  assim "lilás" e "lilas" caem no mesmo lugar.

  A ordem importa: nomes compostos vêm antes dos simples, porque "azul marinho"
  precisa ser testado antes de "azul", senão todo azul marinho vira azul comum.
*/
const TABELA: [nome: string, hex: string][] = [
  // compostos primeiro
  ["azul marinho", "#1f3159"],
  ["azul petroleo", "#1d5a66"],
  ["azul bebe", "#a9cbe8"],
  ["azul claro", "#7fb6dd"],
  ["azul escuro", "#1c3563"],
  ["verde agua", "#9ed3c4"],
  ["verde militar", "#4c5a35"],
  ["verde oliva", "#6b6a35"],
  ["verde limao", "#b7d64a"],
  ["verde escuro", "#20543a"],
  ["rosa bebe", "#f2b9cd"],
  ["rosa claro", "#f3c2d2"],
  ["rosa antigo", "#c98a95"],
  ["off white", "#efe9df"],
  ["branco gelo", "#f0eee9"],
  ["cinza chumbo", "#55585e"],

  // simples
  ["preto", "#1c1c1c"],
  ["branco", "#f7f4ef"],
  ["cru", "#e8dfd0"],
  ["creme", "#f2e7d5"],
  ["bege", "#e0cdb4"],
  ["nude", "#dfc0a8"],
  ["areia", "#e3d3ba"],
  ["caramelo", "#b5722f"],
  ["chocolate", "#4b2e1c"],
  ["marrom", "#6b4526"],
  ["cafe", "#5a3a26"],
  ["terracota", "#b45a37"],
  ["telha", "#b4502e"],
  ["ferrugem", "#9c4a22"],
  ["laranja", "#e8792a"],
  ["pessego", "#f5b98f"],
  ["coral", "#f0714f"],
  ["salmao", "#f0917a"],
  ["fucsia", "#d2249a"],
  ["pink", "#e2367f"],
  ["rosa", "#e77ea1"],
  ["vermelho", "#c22b2b"],
  ["bordo", "#6b1f2b"],
  ["vinho", "#6e1f2c"],
  ["uva", "#5b2a68"],
  ["roxo", "#6c3a8f"],
  ["lilas", "#b79bd6"],
  ["lavanda", "#c3b3e0"],
  ["turquesa", "#2bb3b5"],
  ["tiffany", "#7fd8ce"],
  ["jeans", "#4a6b96"],
  ["azul", "#2c62a5"],
  ["verde", "#2f7d4f"],
  ["mostarda", "#d4a01c"],
  ["amarelo", "#f0c22c"],
  ["dourado", "#d4a53a"],
  ["prata", "#c3c6cb"],
  ["grafite", "#4a4d52"],
  ["chumbo", "#55585e"],
  ["cinza", "#8d8f92"],
];

/** Tira acentos e caixa, para "Lilás" e "lilas" chegarem no mesmo lugar. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * O quanto uma cor é clara, de 0 a 1.
 *
 * Serve para uma decisão só: escrever por cima em branco ou em tinta escura.
 * A fórmula pesa o verde mais que o vermelho e o vermelho mais que o azul
 * porque é assim que o olho humano funciona — um amarelo puro parece muito
 * mais claro que um azul puro, mesmo os dois sendo "cheios".
 */
function luminancia(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export type TomDaCor = {
  /** Um tom, ou dois quando o nome cita duas cores ("Preto e Branco"). */
  tons: string[];
  /** Se o fundo é claro, o texto por cima precisa ser escuro. */
  claro: boolean;
};

/**
 * Descobre a cor a partir do nome. Devolve null quando não reconhece — e aí
 * quem chamou usa a foto da peça como amostra, que é sempre mais fiel do que
 * qualquer aproximação nossa.
 */
export function tomDaCor(nome: string): TomDaCor | null {
  const limpo = normalizar(nome);
  const achados: { hex: string; onde: number }[] = [];

  for (const [chave, hex] of TABELA) {
    const onde = limpo.indexOf(chave);
    if (onde === -1) continue;

    // "azul marinho" já casou; não deixa "azul" casar de novo em cima dele.
    const sobreposto = achados.some(
      (a) => Math.abs(a.onde - onde) < Math.max(chave.length, 4),
    );
    if (sobreposto) continue;

    achados.push({ hex, onde });
    if (achados.length === 2) break;
  }

  if (achados.length === 0) return null;

  // Na ordem em que aparecem no nome: "Preto e Branco" começa preto.
  achados.sort((a, b) => a.onde - b.onde);
  const tons = achados.map((a) => a.hex);

  // Com dois tons, quem manda no contraste é o mais claro dos dois: é sobre
  // ele que o texto corre mais risco de sumir.
  const maisClaro = Math.max(...tons.map(luminancia));

  return { tons, claro: maisClaro > 0.62 };
}

/** O `background` de CSS para pintar a amostra ou o botão inteiro. */
export function fundoDaCor(tom: TomDaCor): string {
  if (tom.tons.length === 1) return tom.tons[0];
  return `linear-gradient(120deg, ${tom.tons[0]} 0 50%, ${tom.tons[1]} 50% 100%)`;
}
