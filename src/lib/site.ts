import "server-only";

/**
 * O endereço público do site.
 *
 * Serve para montar links absolutos — a prévia do WhatsApp e a mensagem que a
 * cliente manda precisam do endereço completo, não do caminho.
 *
 * A Vercel preenche `VERCEL_PROJECT_PRODUCTION_URL` sozinha com o domínio de
 * produção, mesmo quando o código está rodando numa publicação de teste. Isso é
 * o que queremos: o link mandado no WhatsApp aponta para a loja de verdade.
 *
 * Quando você registrar o domínio próprio, é aqui que ele entra — ou pela
 * variável NEXT_PUBLIC_SITE_URL, sem mexer no código.
 */
export function enderecoDoSite(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return "http://localhost:3000";
}
