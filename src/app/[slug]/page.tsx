import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <div className="animate-entrada">
      <MovimentoDaLoja />

      {/*
        O cabeçalho tem três trabalhos: dizer onde a pessoa está, deixar voltar,
        e não sumir quando ela rola.

        O botão de voltar é um BOTÃO, com moldura e seta, não um texto discreto
        no canto. Numa página de produto ele é o caminho mais usado — a cliente
        entra por um link, olha, e quer ver o resto. Texto pequeno sem moldura
        não é percebido como algo em que se pode tocar.
      */}
      <header className="sticky top-0 z-20 border-b border-[var(--color-linha)] bg-[var(--color-areia)]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-2.5">
          <Link
            href="/"
            className="group flex touch-manipulation items-center gap-2 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] py-2 pl-3 pr-4 text-[0.62rem] uppercase tracking-[0.18em] transition-[transform,border-color] duration-200 active:scale-[0.97] active:border-[var(--color-tinta)]"
          >
            <span
              aria-hidden
              className="text-[var(--color-dourado)] transition-transform duration-300 group-hover:-translate-x-0.5"
            >
              ←
            </span>
            Voltar
          </Link>

          <Link href="/" aria-label="Início">
            <Image
              src="/logo.png"
              alt={config?.nomeLoja ?? "Paiva Swimwear"}
              width={1024}
              height={622}
              className="h-9 w-auto sm:h-10"
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-7">
        <h1 className="font-serif text-[2.1rem] leading-[1.1]">{peca.nome}</h1>
        <p className="mt-2 mb-7 text-lg text-[var(--color-suave)]">
          {formatarReais(peca.precoCentavos)}
        </p>

        <Escolha
          nome={peca.nome}
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
            className="mt-5 inline-flex touch-manipulation items-center gap-3 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-6 py-3 text-[0.62rem] uppercase tracking-[0.2em] transition-[transform,border-color] duration-200 active:scale-[0.97] active:border-[var(--color-tinta)]"
          >
            <span aria-hidden className="text-[var(--color-dourado)]">
              ←
            </span>
            Ver todas as peças
          </Link>
        </footer>
      </main>
    </div>
  );
}
