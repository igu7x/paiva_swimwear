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
  // Não roda em arquivos estáticos, imagens e ícone — só gastaria tempo.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
