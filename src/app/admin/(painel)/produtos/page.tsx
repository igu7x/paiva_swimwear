import Link from "next/link";

import { listarProdutos, somarEstoque } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";

import { botaoPrincipal, cartao, legenda, pagina, titulo } from "../ui";

/**
 * A lista de peças do painel.
 *
 * O que ela precisa enxergar de relance é quanto tem em estoque e o que está
 * escondido da loja — o resto é detalhe que cabe na tela da peça.
 */
export default async function ProdutosPage() {
  const produtos = await listarProdutos();

  return (
    <main className={pagina}>
      <h1 className={titulo}>Peças</h1>
      <p className={`${legenda} mt-1`}>
        {produtos.length === 0
          ? "Nenhuma peça cadastrada"
          : `${produtos.length} ${produtos.length === 1 ? "peça" : "peças"} no catálogo`}
      </p>

      <Link href="/admin/produtos/nova" className={`${botaoPrincipal} mt-6`}>
        Cadastrar peça
      </Link>

      {produtos.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-suave)]">
          Comece pela primeira — depois é só mandar o link dela no WhatsApp.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {produtos.map((produto) => {
            const total = somarEstoque(produto);

            return (
              <li key={produto.id}>
                <Link
                  href={`/admin/produtos/${produto.id}`}
                  className={`${cartao} block transition-colors active:border-[var(--color-tinta)]`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{produto.nome}</span>
                    <span className="shrink-0 text-sm tabular-nums">
                      {formatarReais(produto.precoCentavos)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[var(--color-suave)]">
                    {produto.variacoes.length}{" "}
                    {produto.variacoes.length === 1 ? "cor" : "cores"} ·{" "}
                    {total} em estoque
                    {produto.ativo ? "" : " · escondida"}
                  </p>

                  {total === 0 ? (
                    <p className="mt-2 text-xs text-red-800">
                      Sem estoque: não dá para comprar no site.
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
