import { NextResponse } from "next/server";

import { obterSessao } from "@/lib/autorizacao";

/**
 * Quem está logado, para a barra da loja.
 *
 * POR QUE ISTO É UM ENDEREÇO SEPARADO, e não um dado que a página já traz:
 *
 * A vitrine e a página da peça são geradas uma vez e servidas prontas para
 * todo mundo — é o que faz elas abrirem em milissegundos em vez de esperarem o
 * banco a cada visita. Uma página assim não pode saber quem está do outro lado:
 * ela é a mesma para a cliente logada e para quem nunca entrou.
 *
 * Então a barra pergunta depois, por aqui, e se ajusta. O custo é o ícone da
 * conta ficar neutro por um instante; o ganho é a loja inteira continuar
 * instantânea.
 *
 * Nada sensível sai daqui: só se existe login, o primeiro nome e se é a
 * vendedora. Nem e-mail, nem id.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const sessao = await obterSessao();

  const corpo = sessao
    ? {
        entrou: true,
        nome: sessao.nome?.split(" ")[0] ?? null,
        vendedora: sessao.vendedora,
      }
    : { entrou: false, nome: null, vendedora: false };

  return NextResponse.json(corpo, {
    // Resposta de login nunca pode ficar guardada em cache nenhum: a de uma
    // pessoa apareceria para outra.
    headers: { "cache-control": "no-store, private" },
  });
}
