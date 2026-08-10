/**
 * Converte centavos (como está guardado no banco) para "R$ 189,90".
 * Ver o comentário sobre dinheiro em src/lib/db/schema.ts.
 */
export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Lê um preço digitado por ela e devolve centavos. O caminho de volta do
 * `formatarReais`.
 *
 * Ela vai digitar de todo jeito: "99", "99,00", "R$ 99,00", "1.299,90". Todos
 * precisam funcionar — campo de preço que recusa o que a pessoa digitou é
 * campo que faz ela desistir e voltar pro caderno.
 *
 * Devolve `null` quando não dá para entender o que foi digitado.
 */
export function centavosDeTexto(texto: string): number | null {
  const limpo = texto.replace(/[^\d.,]/g, "").trim();
  if (!limpo) return null;

  let normalizado: string;

  if (limpo.includes(",")) {
    // Tem vírgula: é o formato brasileiro. O ponto só pode ser separador de
    // milhar ("1.299,90"), então some.
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (/\.\d{2}$/.test(limpo)) {
    // Sem vírgula, mas termina com ponto e dois dígitos: alguém digitou no
    // formato do teclado numérico ("99.90"). Trata o ponto como decimal.
    normalizado = limpo;
  } else {
    // Sem vírgula e sem decimal: é valor inteiro, e qualquer ponto ali é
    // separador de milhar ("1.299").
    normalizado = limpo.replace(/\./g, "");
  }

  const valor = Number(normalizado);
  if (!Number.isFinite(valor) || valor < 0) return null;

  // Arredonda para não sobrar centavo quebrado por imprecisão de decimal —
  // ver o comentário sobre dinheiro em src/lib/db/schema.ts.
  return Math.round(valor * 100);
}

/**
 * Monta o link de conversa no WhatsApp a partir de um telefone brasileiro
 * escrito de qualquer jeito ("(11) 91234-5678", "11912345678", ...).
 */
export function linkWhatsApp(telefone: string, mensagem?: string): string {
  const somenteNumeros = telefone.replace(/\D/g, "");
  const comPais = somenteNumeros.startsWith("55")
    ? somenteNumeros
    : `55${somenteNumeros}`;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${comPais}${texto}`;
}
