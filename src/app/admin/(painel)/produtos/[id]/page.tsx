import Link from "next/link";
import { notFound } from "next/navigation";

import { obterProduto } from "@/lib/db/produtos";

import { removerProduto } from "../acoes";
import { CoresEEstoque } from "../cores-e-estoque";
import { Fotos } from "../fotos";
import { FormularioProduto } from "../formulario-produto";
import { Transicao } from "../../transicao";
import { botaoTexto, legenda, pagina, titulo } from "../../ui";

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
    <Transicao>
      <main className={pagina}>
      <Link
        href="/admin/produtos"
        transitionTypes={["volta"]}
        prefetch
        className="text-sm text-[var(--color-suave)]"
      >
        ← Peças
      </Link>

      <h1 className={`${titulo} mt-3`}>{produto.nome}</h1>
      <p className={`${legenda} mt-1`}>
        Link da peça: <span className="text-[var(--color-tinta)]">/{produto.slug}</span>
      </p>

      <div className="mt-8">
        <FormularioProduto produto={produto} />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl">Fotos da peça</h2>
        <p className="mt-1 mb-4 text-sm text-[var(--color-suave)]">
          As que valem para qualquer cor: a capa, a foto com modelo, o detalhe
          do tecido. A primeira é a que aparece na vitrine.
        </p>

        <Fotos
          produtoId={produto.id}
          fotos={produto.fotos.filter((f) => f.variacaoId === null)}
          vazio="Sem fotos ainda. A peça aparece sem imagem na vitrine."
        />
      </section>

      <CoresEEstoque
        produtoId={produto.id}
        variacoes={produto.variacoes}
        fotos={produto.fotos}
      />

      <section className="mt-14 border-t border-[var(--color-linha)] pt-5">
        <form action={removerProduto}>
          <input type="hidden" name="id" value={produto.id} />
          <button type="submit" className={`${botaoTexto} text-red-800`}>
            Apagar esta peça
          </button>
        </form>
        <p className="mt-1 text-center text-xs text-[var(--color-suave)]">
          Apaga as cores, o estoque e as fotos junto. Para só tirar da loja,
          desmarque &ldquo;Aparecer na loja&rdquo; ali em cima.
        </p>
      </section>
      </main>
    </Transicao>
  );
}
