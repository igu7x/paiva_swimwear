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
