import Image from "next/image";
import Link from "next/link";

import { Revelar } from "@/components/revelar";
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

/**
 * O ritmo da grade.
 *
 * Esta é a diferença entre catálogo de fornecedor e editorial de moda. Grade
 * uniforme trata toda peça igual e o olho passa batido; aqui cada posição tem
 * largura, altura e recuo próprios, então a página tem respiração e o olho
 * para em lugares diferentes ao descer.
 *
 * Os vazios que sobram nas laterais são de propósito — é o espaço em volta da
 * peça que faz ela parecer cara.
 *
 * A grade é de 6 colunas e o padrão se repete a cada 5 peças:
 *
 *   1. largura inteira, deitada no desktop
 *   2. metade esquerda      3. metade direita, mais baixa
 *   4. larga, recuada da esquerda
 *   5. estreita, encostada à esquerda
 */
const RITMO = [
  { area: "col-span-6", forma: "aspect-[4/5] sm:aspect-[16/10]", recuo: "" },
  { area: "col-span-3", forma: "aspect-[3/4]", recuo: "" },
  { area: "col-span-3", forma: "aspect-[3/4]", recuo: "mt-10 sm:mt-20" },
  { area: "col-start-2 col-span-5", forma: "aspect-[16/11]", recuo: "mt-6" },
  { area: "col-span-4", forma: "aspect-[4/5]", recuo: "mt-8 sm:mt-14" },
] as const;

/** A faixa que corre sem parar, como no rodapé da arte da loja. */
function FaixaCorrendo() {
  const frases = [
    "Feito para o sol",
    "Feito para você",
    "Modelagem que valoriza o corpo",
    "Tecido premium",
  ];

  return (
    <div className="overflow-hidden border-y border-[var(--color-linha)] py-4">
      {/* O conteúdo é duplicado e a faixa anda metade da largura: quando
          recomeça, a segunda cópia está exatamente onde a primeira estava. */}
      <div className="correndo flex w-max gap-12 whitespace-nowrap">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex gap-12" aria-hidden={copia === 1}>
            {frases.map((frase) => (
              <span
                key={frase}
                className="flex items-center gap-12 text-[0.66rem] uppercase tracking-[0.3em] text-[var(--color-suave)]"
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

export default async function Home() {
  const [config, pecas] = await Promise.all([
    obterConfigLoja().catch(() => null),
    listarVitrine().catch(() => []),
  ]);

  return (
    <div>
      <Revelar />

      {/* ---------------- capa ---------------- */}
      <header className="luz-do-sol relative overflow-hidden px-6 pb-20 pt-14 text-center">
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          className="animate-entrada mx-auto h-auto w-44 sm:w-56"
        />

        <h1 className="mt-12 font-serif text-[2.9rem] leading-[0.95] tracking-[-0.02em] sm:text-[4.5rem]">
          {/* Cada linha sobe de trás de um corte, uma depois da outra. */}
          <span className="linha-corte">
            <span style={{ animationDelay: "120ms" }}>Feito para o sol.</span>
          </span>
          <span className="linha-corte">
            <span style={{ animationDelay: "260ms" }}>
              Feito para{" "}
              <em className="italic text-[var(--color-dourado)]">você</em>
              .
            </span>
          </span>
        </h1>

        <p className="animate-entrada mx-auto mt-8 max-w-xs text-sm leading-relaxed text-[var(--color-suave)] sm:max-w-md sm:text-base">
          Biquínis que realçam sua beleza natural e te acompanham nos seus
          melhores dias de sol.
        </p>

        {pecas.length > 0 ? (
          <a
            href="#pecas"
            className="animate-entrada mt-11 inline-flex touch-manipulation items-center rounded-full border border-[var(--color-tinta)] px-8 py-3.5 text-[0.68rem] uppercase tracking-[0.24em] transition-[transform,background-color,color] duration-300 hover:bg-[var(--color-tinta)] hover:text-white active:scale-[0.97]"
          >
            Ver as peças
          </a>
        ) : null}
      </header>

      <FaixaCorrendo />

      {/* ---------------- as peças ---------------- */}
      <main id="pecas" className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-28">
        {pecas.length === 0 ? (
          <p className="mx-auto max-w-xs text-center text-[var(--color-suave)]">
            O catálogo está sendo montado. Em breve você vê todas as peças por
            aqui, com os tamanhos disponíveis.
          </p>
        ) : (
          <ul className="grid grid-cols-6 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-20">
            {pecas.map((peca, indice) => {
              const lugar = RITMO[indice % RITMO.length];
              const capa = capaDoProduto(peca);
              const esgotada = somarEstoque(peca) === 0;
              const cores = peca.variacoes.length;

              return (
                <li
                  key={peca.id}
                  data-revelar
                  // Uma peça entra logo depois da outra, em cascata. Todas
                  // juntas parecem um piscar; em cascata parecem chegando.
                  style={{ transitionDelay: `${(indice % 3) * 90}ms` }}
                  className={`${lugar.area} ${lugar.recuo}`}
                >
                  <Link href={`/${peca.slug}`} className="group block">
                    <div
                      className={`relative ${lugar.forma} overflow-hidden rounded-[1.5rem] bg-[var(--color-creme)]`}
                    >
                      {capa ? (
                        <Image
                          src={enderecoDaFoto(capa)}
                          alt={peca.nome}
                          fill
                          sizes="(max-width: 640px) 100vw, 60vw"
                          className="aproximar object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-xs text-[var(--color-suave)]">
                          sem foto
                        </span>
                      )}

                      {esgotada ? (
                        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-areia)]/85 px-3 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-[var(--color-suave)] backdrop-blur-sm">
                          esgotado
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <h2 className="font-serif text-lg leading-tight sm:text-xl">
                        {peca.nome}
                      </h2>
                      <span className="shrink-0 text-sm tabular-nums text-[var(--color-suave)]">
                        {formatarReais(peca.precoCentavos)}
                      </span>
                    </div>

                    {cores > 0 ? (
                      <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-suave)]">
                        {cores} {cores === 1 ? "cor" : "cores"}
                      </p>
                    ) : null}

                    {/* O fio se estende sozinho ao entrar na tela, e cresce
                        mais ao passar o mouse. */}
                    <span
                      data-fio
                      className="mt-3 block h-px w-1/3 origin-left bg-[var(--color-dourado)] transition-transform duration-700 ease-out group-hover:scale-x-[3]"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ---------------- atributos ---------------- */}
      <section className="border-t border-[var(--color-linha)] px-5 py-16">
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-y-12 sm:grid-cols-4">
          {ATRIBUTOS.map(({ Icone, texto }, i) => (
            <li
              key={texto}
              data-revelar
              style={{ transitionDelay: `${i * 90}ms` }}
              className="flex flex-col items-center gap-3.5 px-3 text-center"
            >
              <Icone className="h-8 w-8 text-[var(--color-dourado)]" />
              <span className="text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-[var(--color-suave)]">
                {texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- rodapé ---------------- */}
      <footer className="luz-do-sol px-6 py-16 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={1024}
          height={622}
          className="mx-auto h-auto w-28 opacity-70"
        />
        {config ? (
          <p className="mt-6 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-suave)]">
            Entregas em {config.cidade}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
