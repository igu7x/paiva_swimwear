import "server-only";

import { obterUsuarioLogado } from "@/lib/supabase/servidor";

/**
 * QUEM É A VENDEDORA E QUEM É CLIENTE.
 *
 * Até agora existia uma conta só no sistema, então "estar logado" e "ser a dona
 * da loja" eram a mesma coisa. A partir do momento em que a cliente pode criar
 * conta, deixaram de ser: as duas entram pelo mesmo Supabase e recebem o mesmo
 * tipo de login. Sem uma separação explícita, qualquer pessoa que se cadastrasse
 * na loja passaria a enxergar o painel.
 *
 * A separação é uma LISTA DE E-MAILS numa variável de ambiente, não uma coluna
 * no banco. A razão é simples: é a única forma que ninguém consegue conceder a
 * si mesmo. Uma coluna `admin` no banco depende de nenhum caminho do código
 * gravar `true` nela por engano; uma lista que só existe na configuração do
 * servidor depende de ter acesso ao servidor.
 *
 * Para uma loja com UMA vendedora, isso é o suficiente e não custa tabela,
 * migração nem tela de gestão de permissão.
 */

function listaDeVendedoras(): string[] {
  return (process.env.EMAILS_ADMIN ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Devolve quem está logado, dizendo se é a vendedora.
 *
 * `vendedora` é `false` quando a lista está vazia — de propósito. Configuração
 * faltando tem que fechar a porta, não abrir: se ela abrisse, esquecer a
 * variável num deploy novo publicaria o painel para o mundo inteiro, e o erro
 * seria silencioso.
 */
export async function obterSessao() {
  const usuario = await obterUsuarioLogado();
  if (!usuario) return null;

  const permitidos = listaDeVendedoras();
  const email = usuario.email?.toLowerCase() ?? "";

  return { ...usuario, vendedora: email !== "" && permitidos.includes(email) };
}

/**
 * A trava das ações do painel.
 *
 * TODA server action que grava algo do catálogo precisa chamar isto antes de
 * tocar no banco. Não é redundância com o layout do painel: o layout decide o
 * que é DESENHADO, e uma server action é um endereço que aceita POST — dá para
 * chamá-la sem nunca ter aberto a tela que a mostra. Enquanto isso não existia,
 * apagar uma peça da loja não exigia estar logado.
 *
 * Devolve `false` em vez de estourar erro para quem chama poder responder uma
 * frase em português em vez de uma tela de erro.
 */
export async function ehVendedora(): Promise<boolean> {
  return (await obterSessao())?.vendedora === true;
}
