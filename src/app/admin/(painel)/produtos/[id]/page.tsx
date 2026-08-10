import Link from "next/link";
import { notFound } from "next/navigation";

import { obterProduto } from "@/lib/db/produtos";
import { TAMANHOS } from "@/lib/tamanhos";

import { adicionarCor, gravarEstoque, removerCor, removerProduto } from "../acoes";
import { FormularioProduto } from "../formulario-produto";

const campo =
  "rounded-xl border border-[var(--color-linha)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--color-dourado)]";

/**
 * A tela de uma peça: dados, cores e estoque.
 *
 * O estoque é uma grade de cor por tamanho. Cada cor salva sozinha, com o
 * próprio botão: ela ajusta o que vendeu de uma cor e grava, sem precisar
 * conferir a peça inteira antes de conseguir salvar.
 */
export default async function PecaPage({
  params,
}: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const produto = await obterProduto(Number(id));

  if (!produto) notFound();

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl">{produto.nome}</h1>
        <Link
          href="/admin/produtos"
          className="shrink-0 text-sm text-[var(--color-suave)]"
        >
          Voltar
        </Link>
      </div>

      <p className="mt-1 text-xs text-[var(--color-suave)]">
        Link da peça: /{produto.slug}
      </p>

      <section className="mt-8">
        <FormularioProduto produto={produto} />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl">Cores e estoque</h2>
        <p className="mt-1 text-sm text-[var(--color-suave)]">
          Quando um tamanho chega a zero, ele some da loja sozinho.
        </p>

        {produto.variacoes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-[var(--color-linha)] p-4 text-sm text-[var(--color-suave)]">
            Nenhuma cor ainda. Enquanto não tiver pelo menos uma, a peça não
            pode ser comprada no site.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {produto.variacoes.map((variacao) => {
              // O estoque vem do banco sem ordem garantida. Esta tabela deixa a
              // grade sempre na ordem P, M, G, GG.
              const porTamanho = new Map(
                variacao.estoque.map((e) => [e.tamanho, e.quantidade]),
              );

              return (
                <li
                  key={variacao.id}
                  className="rounded-2xl border border-[var(--color-linha)] bg-white p-4"
                >
                  <form action={gravarEstoque}>
                    <input type="hidden" name="produtoId" value={produto.id} />
                    <input type="hidden" name="variacaoId" value={variacao.id} />

                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{variacao.nome}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {TAMANHOS.map((tamanho) => (
                        <label key={tamanho} className="flex flex-col gap-1">
                          <span className="text-center text-xs text-[var(--color-suave)]">
                            {tamanho}
                          </span>
                          <input
                            type="number"
                            name={`quantidade-${tamanho}`}
                            min={0}
                            inputMode="numeric"
                            defaultValue={porTamanho.get(tamanho) ?? 0}
                            className="w-full rounded-xl border border-[var(--color-linha)] bg-white px-2 py-2.5 text-center text-base outline-none focus:border-[var(--color-dourado)]"
                          />
                        </label>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="mt-4 w-full rounded-full border border-[var(--color-tinta)] px-4 py-2.5 text-sm"
                    >
                      Salvar estoque de {variacao.nome}
                    </button>
                  </form>

                  <form action={removerCor} className="mt-2">
                    <input type="hidden" name="produtoId" value={produto.id} />
                    <input type="hidden" name="variacaoId" value={variacao.id} />
                    <button
                      type="submit"
                      className="w-full py-1 text-xs text-[var(--color-suave)]"
                    >
                      Remover a cor {variacao.nome}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <form
          action={adicionarCor}
          className="mt-6 rounded-2xl border border-[var(--color-linha)] bg-white p-4"
        >
          <input type="hidden" name="produtoId" value={produto.id} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm">Acrescentar cor</span>
            <input
              type="text"
              name="cor"
              required
              placeholder="Terracota"
              className={campo}
            />
          </label>
          <button
            type="submit"
            className="mt-3 w-full rounded-full border border-[var(--color-tinta)] px-4 py-2.5 text-sm"
          >
            Acrescentar
          </button>
        </form>
      </section>

      <section className="mt-16 border-t border-[var(--color-linha)] pt-6">
        <form action={removerProduto}>
          <input type="hidden" name="id" value={produto.id} />
          <button type="submit" className="text-sm text-red-700">
            Apagar esta peça
          </button>
        </form>
        <p className="mt-1.5 text-xs text-[var(--color-suave)]">
          Apaga as cores, o estoque e as fotos junto. Para só tirar da loja,
          desmarque &ldquo;Aparecer na loja&rdquo; ali em cima.
        </p>
      </section>
    </main>
  );
}
