import type { NextRequest } from "next/server";

import { atualizarSessao } from "@/lib/supabase/sessao-proxy";

/**
 * Roda antes de toda página. A única função dele aqui é manter o login da
 * vendedora vivo — ver o comentário em src/lib/supabase/sessao-proxy.ts.
 *
 * (No Next.js 16 este arquivo se chamava "middleware.ts". Foi renomeado para
 * "proxy.ts"; o comportamento é o mesmo.)
 */
export async function proxy(request: NextRequest) {
  return atualizarSessao(request);
}

export const config = {
  /**
   * Só o painel.
   *
   * Antes isto rodava em TODA página do site. A conta era ruim: a cliente não
   * tem login nenhum para renovar, e mesmo assim cada visita à vitrine passava
   * por aqui antes de qualquer coisa acontecer.
   *
   * Quem tem sessão para renovar é a vendedora, e ela só existe dentro de
   * /admin. A tela de login entra na conta de propósito: é lá que o cookie é
   * criado.
   *
   * Isso não afrouxa segurança nenhuma: quem barra o acesso ao painel é o
   * layout em (painel)/layout.tsx, dentro da aplicação, não este arquivo.
   */
  matcher: ["/admin/:path*"],
};
