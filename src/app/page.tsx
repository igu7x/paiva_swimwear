import Image from "next/image";
import Link from "next/link";

import { ATRIBUTOS } from "@/components/simbolos";
import { obterConfigLoja } from "@/lib/db/config-loja";
import { capaDoProduto, listarVitrine, somarEstoque } from "@/lib/db/produtos";
import { formatarReais } from "@/lib/formato";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";

/**
 * A página fica guardada pronta e é servida sem consultar o banco. Ver o
 * histórico em NOTAS.md: antes ela custava ~400ms de tela parada por visita.
 */
export const revalidate = 60;

/** A faixa que corre sem parar, como no rodapé da arte da loja. */
function FaixaCorrendo() {
  const frases = [
    "Feito para o sol",
    "Feito para você",
    "Modelagem que valoriza o corpo",
    "Tecido premium",
    "Entrega em Goiânia",
  ];

  return (
    <div className="overflow-hidden border-y border-[var(--color-linha)] py-3.5">
      {/* O conteúdo é duplicado e a faixa anda metade da largura: quando
          recomeça, a segunda cópia está exatamente onde a primeira estava. */}
      <div className="correndo flex w-max gap-10 whitespace-nowrap">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex gap-10" aria-hidden={copia === 1}>
            {frases.map((frase) => (
              <span
                key={frase}
                className="flex items-center gap-10 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-suave)]"
              >
                {frase}
                <span className="text-[var(--color-dourado)]">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A vitrine.
 *
 * O desenho segue a arte da própria marca: fundo areia com o sol por trás,
 * serifada grande, dourado só no detalhe. A grade é desencontrada — uma peça
 * sobe, a seguinte desce — porque grade perfeitamente alinhada parece catálogo
 * de fornecedor, e desencontrada parece editorial de revista.
 *
 * Nenhuma biblioteca de animação: as revelações são comandadas pela rolagem,
 * em CSS. A cliente está no 4G e cada quilobyte atrasa a primeira foto.
 */
export default async function Home() {
  const [config, pecas] = await Promise.all([
    obterConfigLoja().catch(() => null),
    listarVitrine().catch(() => []),
  ]);

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      <header className="luz-do-sol relative overflow-hidden px-6 pb-16 pt-16 text-center">
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          className="animate-entrada mx-auto h-auto w-48 sm:w-56"
        />

        <h1 className="animate-entrada mt-10 font-serif text-[2.6rem] leading-[1.05] sm:text-6xl">
          Feito para o sol.
          <span className="mt-1 block">
            Feito para{" "}
            <span className="italic text-[var(--color-dourado)]">você</span>.
          </span>
        </h1>

        <p className="animate-entrada mx-auto mt-6 max-w-xs text-sm leading-relaxed text-[var(--color-suave)] sm:max-w-sm sm:text-base">
          Biquínis que realçam sua beleza natural e te acompanham nos seus
          melhores dias de sol.
        </p>

        {pecas.length > 0 ? (
          <a
            href="#pecas"
            className="animate-entrada mt-10 inline-flex touch-manipulation items-center gap-2 rounded-full border border-[var(--color-tinta)] px-7 py-3 text-xs uppercase tracking-[0.2em] transition-[transform,background-color,color] duration-200 active:scale-[0.97] hover:bg-[var(--color-tinta)] hover:text-white"
          >
            Ver as peças
          </a>
        ) : null}
      </header>

      <FaixaCorrendo />

      {/* ---------------------------------------------------------------- */}
      <main id="pecas" className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-24">
        {pecas.length === 0 ? (
          <p className="mx-auto max-w-xs text-center text-[var(--color-suave)]">
            O catálogo está sendo montado. Em breve você vê todas as peças por
            aqui, com os tamanhos disponíveis.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-8 lg:grid-cols-3">
            {pecas.map((peca, indice) => {
              const capa = capaDoProduto(peca);
              const esgotada = somarEstoque(peca) === 0;
              // Uma sobe, a seguinte desce. É o desencontro que tira a cara de
              // planilha e dá a de editorial.
              const descolada = indice % 2 === 1;

              return (
                <li
                  key={peca.id}
                  className={`revelar ${descolada ? "sm:mt-16" : ""}`}
                >
                  <Link href={`/${peca.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-[var(--color-creme)]">
                      {capa ? (
                        <Image
                          src={enderecoDaFoto(capa)}
                          alt={peca.nome}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 30vw"
                          className="aproximar object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-xs text-[var(--color-suave)]">
                          sem foto
                        </span>
                      )}

                      {esgotada ? (
                        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-areia)]/85 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-[var(--color-suave)] backdrop-blur-sm">
                          esgotado
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <h2 className="font-serif text-lg leading-snug">
                        {peca.nome}
                      </h2>
                      <span className="shrink-0 text-sm tabular-nums text-[var(--color-suave)]">
                        {formatarReais(peca.precoCentavos)}
                      </span>
                    </div>

                    {/* Fio dourado que corre da esquerda ao passar o mouse. No
                        celular ele fica visível pela metade, marcando o item. */}
                    <span className="mt-2 block h-px w-1/4 origin-left bg-[var(--color-dourado)] transition-transform duration-500 ease-out group-hover:scale-x-[4]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-[var(--color-linha)] px-5 py-14">
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-y-10 sm:grid-cols-4">
          {ATRIBUTOS.map(({ Icone, texto }) => (
            <li
              key={texto}
              className="revelar flex flex-col items-center gap-3 px-3 text-center"
            >
              <Icone className="h-7 w-7 text-[var(--color-dourado)]" />
              <span className="text-[0.62rem] uppercase leading-relaxed tracking-[0.16em] text-[var(--color-suave)]">
                {texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      <footer className="luz-do-sol px-6 py-14 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={1024}
          height={622}
          className="mx-auto h-auto w-28 opacity-70"
        />
        {config ? (
          <p className="mt-5 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--color-suave)]">
            Entregas em {config.cidade}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
