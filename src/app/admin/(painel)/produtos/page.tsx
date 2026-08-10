import Link from "next/link";

import { listarProdutos, somarEstoque } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";

/**
 * A lista de peças do painel.
 *
 * O que ela precisa enxergar de relance é quanto tem em estoque e o que está
 * escondido da loja — o resto é detalhe que cabe na tela da peça.
 */
export default async function ProdutosPage() {
  const produtos = await listarProdutos();

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl">Peças</h1>
        <Link href="/admin" className="text-sm text-[var(--color-suave)]">
          Voltar
        </Link>
      </div>

      <Link
        href="/admin/produtos/nova"
        className="mt-6 block rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-center text-sm font-medium text-white"
      >
        Cadastrar peça
      </Link>

      {produtos.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-suave)]">
          Nenhuma peça cadastrada ainda. Comece pela primeira — depois é só
          mandar o link dela no WhatsApp.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {produtos.map((produto) => {
            const total = somarEstoque(produto);

            return (
              <li key={produto.id}>
                <Link
                  href={`/admin/produtos/${produto.id}`}
                  className="block rounded-2xl border border-[var(--color-linha)] bg-white p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{produto.nome}</span>
                    <span className="shrink-0 text-sm">
                      {formatarReais(produto.precoCentavos)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-[var(--color-suave)]">
                    {produto.variacoes.length}{" "}
                    {produto.variacoes.length === 1 ? "cor" : "cores"} ·{" "}
                    {total} {total === 1 ? "peça" : "peças"} em estoque
                    {produto.ativo ? "" : " · escondida da loja"}
                  </p>

                  {total === 0 ? (
                    <p className="mt-2 text-xs text-red-700">
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
