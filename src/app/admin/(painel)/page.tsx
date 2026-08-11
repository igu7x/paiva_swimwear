import Link from "next/link";

import { obterConfigLoja } from "@/lib/db/config-loja";
import { listarProdutos, somarEstoque } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";
import { obterUsuarioLogado } from "@/lib/supabase/servidor";

import { PistaDoLink } from "./movimento";
import { Transicao } from "./transicao";
import { cartao, cartaoClicavel, legenda, pagina, titulo } from "./ui";

/**
 * Painel da vendedora.
 *
 * A tela existe para responder duas perguntas em um olhar: o que precisa de
 * atenção hoje, e por onde entro para resolver. Por isso o aviso de estoque
 * vem antes da lista, e a configuração fica por último.
 */
export default async function PainelPage() {
  const [usuario, config, produtos] = await Promise.all([
    obterUsuarioLogado(),
    obterConfigLoja(),
    listarProdutos(),
  ]);

  const semEstoque = produtos.filter((p) => somarEstoque(p) === 0);

  return (
    <Transicao>
      <main className={pagina}>
      <h1 className={titulo}>Painel</h1>
      <p className={`${legenda} mt-1`}>{usuario?.email}</p>

      {semEstoque.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-[var(--color-dourado)] bg-[var(--color-creme)] p-4">
          <p className="text-sm font-medium">
            {semEstoque.length === 1
              ? "1 peça está sem estoque"
              : `${semEstoque.length} peças estão sem estoque`}
          </p>
          <p className="mt-1 text-xs text-[var(--color-suave)]">
            {semEstoque.map((p) => p.nome).join(", ")} — ninguém consegue
            comprar enquanto estiver assim.
          </p>
        </div>
      ) : null}

      <Link
        href="/admin/produtos"
        transitionTypes={["ida"]}
        // Busca a tela inteira antes do clique, e não só o esqueleto de
        // carregamento. É o que faz a troca ser imediata em vez de esperar o
        // servidor no momento do toque.
        prefetch
        className={`${cartaoClicavel} mt-4`}
      >
        <span className="font-medium">
          Peças
          <PistaDoLink />
        </span>
        <span className="mt-0.5 block text-sm text-[var(--color-suave)]">
          {produtos.length === 0
            ? "Cadastrar a primeira"
            : `${produtos.length} ${produtos.length === 1 ? "peça cadastrada" : "peças cadastradas"}`}
        </span>
      </Link>

      <section className={`${cartao} mt-3`}>
        <h2 className="text-sm font-medium">Configurações da loja</h2>

        {config ? (
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            {[
              ["Nome", config.nomeLoja],
              ["Cidade", config.cidade],
              ["WhatsApp", config.whatsapp],
              [
                "Entrega",
                config.freteCentavos === 0
                  ? "a combinar"
                  : formatarReais(config.freteCentavos),
              ],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="flex justify-between gap-4">
                <dt className="text-[var(--color-suave)]">{rotulo}</dt>
                <dd className="text-right">{valor}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-suave)]">
            Nenhuma configuração encontrada. Rode <code>npm run db:migrate</code>.
          </p>
        )}

        <p className="mt-4 border-t border-[var(--color-linha)] pt-3 text-xs text-[var(--color-suave)]">
          A tela para você editar estes valores entra junto com os pedidos.
        </p>
      </section>
      </main>
    </Transicao>
  );
}
