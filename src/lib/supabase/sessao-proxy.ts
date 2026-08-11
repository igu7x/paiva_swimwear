import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ambienteSupabase } from "./ambiente";
import { obterChavesPublicas } from "./chaves";

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
  //
  // Usa `getClaims` com a chave pública em mãos, e não `getUser`: o getUser
  // sairia pela rede até o Supabase a cada visita, e isso custava uns 160ms
  // aqui mais outro tanto no layout. O getClaims chama getSession() por dentro
  // — que é quem renova o cookie — e confere a assinatura na memória.
  await supabase.auth.getClaims(undefined, {
    jwks: await obterChavesPublicas(),
  });

  return resposta;
}
