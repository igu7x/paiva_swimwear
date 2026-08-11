import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Revelar } from "@/components/revelar";
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
      <Revelar />

      <header className="sticky top-0 z-20 border-b border-[var(--color-linha)] bg-[var(--color-areia)]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Ver todas as peças">
            <Image
              src="/logo.png"
              alt={config?.nomeLoja ?? "Paiva Swimwear"}
              width={1024}
              height={622}
              className="h-6 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-suave)] transition-opacity active:opacity-60"
          >
            ver tudo
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
        />

        {caracteristicas.length > 0 ? (
          <section
            data-revelar
            className="mt-14 border-t border-[var(--color-linha)] pt-8"
          >
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
        ) : null}

        {config ? (
          <p className="mt-10 text-center text-xs text-[var(--color-suave)]">
            Entregas em {config.cidade}.
          </p>
        ) : null}
      </main>
    </div>
  );
}
