/**
 * Transforma o nome da peça no pedaço do endereço que vai no link do WhatsApp.
 *
 *     "Biquíni Asa Delta"  ->  "biquini-asa-delta"
 *
 * O link fica legível para quem recebe, e é isso que ela vai colar na conversa
 * dezenas de vezes por dia. `/biquini-asa-delta` dá mais confiança do que
 * `/produto/7`.
 */
export function gerarSlug(texto: string): string {
  return (
    texto
      // Separa a letra do acento ("í" vira "i" + um acento solto)...
      .normalize("NFD")
      // ...e joga fora os acentos soltos. ̀-ͯ é a faixa deles na
      // tabela Unicode. É o jeito de "Biquíni" virar "biquini" sem precisar
      // de uma tabela de-para letra por letra.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      // Tudo que não é letra ou número vira hífen: espaço, ponto, barra.
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  );
}
