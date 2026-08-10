import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ambienteSupabase } from "./ambiente";

/**
 * Renova o login da vendedora a cada requisição.
 *
 * O cookie de sessão do Supabase expira de tempos em tempos. Esta função roda
 * antes de qualquer página (chamada pelo src/proxy.ts), pede um cookie novo se
 * o antigo está vencendo, e devolve a resposta já com ele. Sem isso, ela seria
 * deslogada do painel sozinha no meio do dia.
 *
 * Repare que aqui NÃO existe nenhuma decisão de "pode ou não pode entrar".
 * Isso é de propósito. O proxy roda antes da aplicação e já teve falha de
 * segurança conhecida no Next.js justamente por gente ter colocado a trava de
 * acesso só nele. Quem barra o acesso é o layout do painel, dentro da
 * aplicação, onde não tem como desviar.
 */
export async function atualizarSessao(request: NextRequest) {
  const { url, chavePublica } = ambienteSupabase();

  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(url, chavePublica, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar) {
        for (const { name, value } of cookiesParaGravar) {
          request.cookies.set(name, value);
        }
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of cookiesParaGravar) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  // É esta chamada que dispara a renovação do cookie, quando necessário.
  await supabase.auth.getUser();

  return resposta;
}
