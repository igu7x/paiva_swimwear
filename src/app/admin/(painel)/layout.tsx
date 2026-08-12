import { redirect } from "next/navigation";

import { obterSessao } from "@/lib/autorizacao";

import { Cabecalho } from "./cabecalho";

/**
 * Trava do painel.
 *
 * Tudo que estiver dentro da pasta (painel) passa por aqui antes de aparecer.
 * Os parênteses no nome da pasta são um recurso do Next.js: eles agrupam
 * páginas sob um mesmo layout sem virar um pedaço do endereço. Ou seja, a
 * página em (painel)/page.tsx continua sendo o endereço /admin.
 *
 * A tela de login fica FORA desse grupo, em /admin/login — senão ela também
 * exigiria estar logado, e ninguém conseguiria entrar nunca.
 */

// Nada dentro do painel pode ser gerado uma vez e reaproveitado: toda visita
// precisa checar quem está logado naquele momento. Sem isto, o Next.js tenta
// congelar a tela na hora do build — e painel congelado é painel aparecendo
// para quem não deveria ver.
export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  const sessao = await obterSessao();

  /*
    Estar logada não basta mais: a cliente também tem login agora, e ela entra
    pelo mesmo Supabase. Quem passa daqui é só quem está na lista de vendedoras
    (ver src/lib/autorizacao.ts).

    Cliente logada que digitar /admin volta para a loja, e não para a tela de
    login: mandá-la para o login sugeriria que existe uma senha que resolve, e
    não existe.
  */
  if (!sessao) redirect("/admin/login");
  if (!sessao.vendedora) redirect("/");

  return (
    <>
      <Cabecalho />
      {children}
    </>
  );
}
