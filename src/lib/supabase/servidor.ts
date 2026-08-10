import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

import { ambienteSupabase } from "./ambiente";

/**
 * Cliente do Supabase para usar no servidor (páginas, layouts e server actions).
 *
 * O login fica guardado num cookie do navegador. Este cliente sabe ler e
 * escrever esse cookie, então é por ele que a gente pergunta "quem está logado".
 */
export async function criarClienteSupabase() {
  const { url, chavePublica } = ambienteSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, chavePublica, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          for (const { name, value, options } of cookiesParaGravar) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Uma página que só lê dados não tem permissão de gravar cookie.
          // Tudo bem: quem renova a sessão é o proxy.ts, antes da página rodar.
        }
      },
    },
  });
}

/**
 * Devolve a vendedora logada, ou null.
 *
 * Usa `getUser()` de propósito, e não `getSession()`: o getUser pergunta ao
 * servidor do Supabase se o login ainda vale. O getSession só olha o cookie,
 * que é um dado que veio do navegador e portanto não serve para decidir
 * permissão.
 *
 * O `cache()` em volta é o que impede essa pergunta de ser feita várias vezes
 * na mesma visita. O layout do painel precisa dela para barrar quem não está
 * logado, e a tela precisa dela para mostrar o e-mail — sem isto, são duas
 * viagens até o Supabase para responder a mesma coisa, e cada viagem custa
 * uns 200ms de tela parada.
 *
 * O cache vale só enquanto aquela requisição está sendo respondida. A visita
 * seguinte pergunta de novo, como tem que ser: login expirado precisa ser
 * percebido.
 */
export const obterUsuarioLogado = cache(async () => {
  const supabase = await criarClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
