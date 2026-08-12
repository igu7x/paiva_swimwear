import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BarraDaLoja } from "@/components/barra-da-loja";
import { MovimentoDaLoja } from "@/components/movimento-da-loja";
import { obterConfigLoja } from "@/lib/db/config-loja";
import { capaDoProduto, obterProdutoPorSlug } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";
import { enderecoDoSite } from "@/lib/site";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";

import { Escolha } from "./escolha";

export const revalidate = 60;

/**
 * A prévia que aparece quando ela cola o link no WhatsApp.
 *
 * Isto é metade do valor desta etapa. Sem isto, o link chega como um endereço
 * cru e a cliente precisa clicar no escuro. Com isto, chega com a foto, o nome
 * e o preço — praticamente a foto que ela mandava antes, só que clicável e
 * sempre atualizada.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const peca = await obterProdutoPorSlug(slug).catch(() => null);

  if (!peca) return { title: "Peça não encontrada" };

  const capa = capaDoProduto(peca);
  const descricao =
    peca.descricao.split("\n").filter(Boolean)[0] ??
    `${peca.nome} por ${formatarReais(peca.precoCentavos)}.`;

  return {
    title: `${peca.nome} — ${formatarReais(peca.precoCentavos)}`,
    description: descricao,
    openGraph: {
      title: peca.nome,
      description: `${formatarReais(peca.precoCentavos)} · ${descricao}`,
      url: `${enderecoDoSite()}/${peca.slug}`,
      images: capa ? [{ url: enderecoDaFoto(capa) }] : [],
      type: "website",
    },
  };
}

/**
 * A página de uma peça.
 *
 * A foto ocupa o alto da tela porque é ela que vende. Nome, preço e escolhas
 * vêm logo abaixo, e a descrição fica por último — quem quer detalhe de tecido
 * rola até lá, quem já decidiu não precisa passar por ela.
 */
export default async function PecaPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;

  const [peca, config] = await Promise.all([
    obterProdutoPorSlug(slug).catch(() => null),
    obterConfigLoja().catch(() => null),
  ]);

  if (!peca || !peca.ativo) notFound();

  // Cada linha da descrição vira um item da lista — é assim que ela escreve nas
  // artes da loja: costura, tecido, formato da calcinha, um por linha.
  const caracteristicas = peca.descricao
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    /*
      A ANIMAÇÃO DE ENTRADA NÃO PODE ENVOLVER A BARRA.

      `animate-entrada` anima `transform`, e enquanto uma animação dessas está
      valendo o elemento vira o ponto de referência de tudo que for
      `position: fixed` lá dentro — em vez da janela.

      Com a página inteira envolvida, a barra do topo deixava de ficar presa na
      tela e a foto em tela cheia era desenhada do tamanho da PÁGINA, não da
      janela: por isso ela aparecia jogada para baixo no celular.

      A animação continua existindo, só que aplicada ao conteúdo, com a barra
      do lado de fora.
    */
    <>
      <MovimentoDaLoja />

      {/*
        A mesma barra da vitrine: voltar de um lado, conta e sacola do outro.
        Era um cabeçalho próprio desta página; virou o de todas, porque a
        sacola precisa estar a um toque em qualquer tela da loja.
      */}
      <BarraDaLoja />

      {/*
        A foto começa logo abaixo da barra, sem título antes dela.

        Nome e preço passaram para DEPOIS da foto de propósito: quem chega por
        um link já sabe o nome da peça, foi por ele que clicou. O que ela ainda
        não viu é a peça.
      */}
      <main className="animate-entrada mx-auto w-full max-w-md px-5 pb-16 pt-[4.4rem] sm:max-w-4xl sm:px-8 sm:pt-24">
        <Escolha
          produtoId={peca.id}
          nome={peca.nome}
          precoCentavos={peca.precoCentavos}
          fotos={peca.fotos}
          variacoes={peca.variacoes}
          sobreAPeca={
            caracteristicas.length > 0 ? (
              <section className="mt-8 rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-5">
                <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
                  Sobre a peça
                </h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
                  {caracteristicas.map((linha, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden className="text-[var(--color-dourado)]">
                        ·
                      </span>
                      <span>{linha}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          }
        />

        {/* Fecho da página: onde entrega e um caminho de volta que não obriga a
            pessoa a subir até o topo para achar o botão. */}
        <footer className="mt-14 border-t border-[var(--color-linha)] pt-7 text-center">
          {config ? (
            <p className="text-xs text-[var(--color-suave)]">
              Entregas em {config.cidade}.
            </p>
          ) : null}

          <Link
            href="/"
            className="mt-5 inline-flex touch-manipulation items-center gap-3 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-6 py-3 text-[0.62rem] uppercase tracking-[0.2em] transition-[transform,border-color] duration-200 active:scale-[0.97] hover:border-[var(--color-tinta)] active:border-[var(--color-tinta)]"
          >
            <span aria-hidden className="text-[var(--color-dourado)]">
              ←
            </span>
            Ver todas as peças
          </Link>
        </footer>
      </main>
    </>
  );
}
