import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
 */
export async function obterUsuarioLogado() {
  const supabase = await criarClienteSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
