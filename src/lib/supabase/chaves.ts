import type { JWK } from "@supabase/supabase-js";

import { ambienteSupabase } from "./ambiente";

/**
 * A chave pública que confere a assinatura do login.
 *
 * POR QUE ISTO EXISTE
 *
 * Perguntar "esse login ainda vale?" ao Supabase é uma viagem de rede, e o
 * painel fazia isso duas vezes por tela. Medido em produção: cada tela do
 * painel gastava uns 320ms nisso antes de desenhar qualquer coisa — inclusive
 * a tela de cadastro, que nem toca no banco.
 *
 * O login do projeto é assinado com ES256, que é assinatura assimétrica: existe
 * uma chave privada, que só o Supabase tem e usa para assinar, e uma chave
 * pública, que qualquer um pode pegar e usar para CONFERIR. Com a chave pública
 * em mãos, o nosso servidor confere a assinatura sozinho, na memória, sem sair
 * pela rede.
 *
 * Isso não é afrouxar a checagem: a assinatura é conferida de verdade, com
 * criptografia. Um cookie adulterado não passa.
 *
 * O QUE MUDA NA PRÁTICA
 *
 * Uma sessão encerrada continua sendo aceita até o token vencer, no máximo uma
 * hora — porque o nosso servidor deixa de perguntar ao Supabase a cada visita.
 * Para um painel de uma pessoa só, isso é aceitável. Se um dia entrar mais
 * gente, ou dado mais sensível, vale rever.
 */

// Guardado fora da função de propósito: assim ele sobrevive entre uma
// requisição e outra, enquanto o servidor estiver de pé. É o que faz a busca
// acontecer uma vez, e não a cada visita.
let chavesEmMemoria: { keys: JWK[] } | null = null;
let buscadasEm = 0;

const VALIDADE_MS = 10 * 60 * 1000;

/** Busca (e reaproveita) as chaves públicas do projeto. */
export async function obterChavesPublicas(): Promise<{ keys: JWK[] }> {
  const agora = Date.now();

  if (chavesEmMemoria && agora - buscadasEm < VALIDADE_MS) {
    return chavesEmMemoria;
  }

  const { url, chavePublica } = ambienteSupabase();

  try {
    const resposta = await fetch(`${url}/auth/v1/.well-known/jwks.json`, {
      headers: { apikey: chavePublica },
      // Cache do próprio Next, que vale entre servidores diferentes. O cache em
      // memória acima só vale dentro de um servidor.
      next: { revalidate: 600 },
    });

    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = (await resposta.json()) as { keys?: JWK[] };
    chavesEmMemoria = { keys: dados.keys ?? [] };
    buscadasEm = agora;
    return chavesEmMemoria;
  } catch (erro) {
    console.error("Não consegui buscar a chave pública do login.", erro);
    // Devolver vazio faz o Supabase cair no caminho antigo (perguntar pela
    // rede). Mais lento, porém correto — melhor lento do que deixar entrar
    // quem não devia.
    return { keys: [] };
  }
}
