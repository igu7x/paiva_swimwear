import Image from "next/image";
import Link from "next/link";

import { MovimentoDaLoja } from "@/components/movimento-da-loja";
import { ATRIBUTOS, Sol } from "@/components/simbolos";
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
 * A VITRINE É UMA SEQUÊNCIA, NÃO UMA LISTA.
 *
 * As referências que o Igor apontou (icomat, abtc) não são páginas de catálogo
 * com animação por cima: são páginas onde CADA TELA TEM UMA IDEIA SÓ, e o
 * conteúdo se revela conforme a pessoa desce. Rolar é o que faz a história
 * avançar.
 *
 * Então a página deixou de ser "cabeçalho + grade + rodapé" e virou cenas:
 *
 *   1. a marca, ocupando a tela inteira
 *   2. o que a marca promete, em quatro símbolos
 *   3. uma cena por peça, com a foto revelada por uma cortina
 *   4. o rodapé, escuro, fechando a página
 *
 * Isso funciona melhor com POUCAS peças, que é o caso desta loja — dar uma
 * tela inteira para cada peça só é possível quando são dezenas, não milhares.
 */

/**
 * O que a marca promete, logo depois da capa.
 *
 * Aqui existia uma faixa correndo sem parar. Ela saiu: movimento que não
 * responde a nada é enfeite, e enfeite em loop cansa em segundos — a pessoa
 * não consegue nem ler porque o texto foge.
 *
 * No lugar, os quatro símbolos da própria arte da loja, parados. Mesmo espaço,
 * informação de verdade, e o olho consegue pousar.
 */
function OQuePrometemos() {
  return (
    <section className="border-y border-[var(--color-linha)] px-5 py-10">
      <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
        {ATRIBUTOS.map(({ Icone, texto }, i) => (
          <li
            key={texto}
            data-revelar
            style={{ transitionDelay: `${i * 100}ms` }}
            className="flex flex-col items-center gap-3 px-2 text-center"
          >
            <Icone className="h-7 w-7 text-[var(--color-dourado)]" />
            <span className="text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-[var(--color-suave)]">
              {texto}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Home() {
  const [config, catalogo] = await Promise.all([
    obterConfigLoja().catch(() => null),
    listarVitrine().catch(() => []),
  ]);

  const pecas = [...catalogo].sort((a, b) => {
    const temA = capaDoProduto(a) ? 0 : 1;
    const temB = capaDoProduto(b) ? 0 : 1;
    return temA - temB || a.nome.localeCompare(b.nome, "pt-BR");
  });

  return (
    <div>
      <MovimentoDaLoja />

      {/* Fio de progresso: mostra o quanto da loja já foi percorrido. */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent"
      >
        <div className="progresso h-full w-full origin-left bg-[var(--color-dourado)]" />
      </div>

      {/* ============ 1. a marca ============ */}
      <section className="luz-do-sol capa-recua flex min-h-[92svh] flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          className="animate-entrada h-auto w-64 sm:w-[26rem]"
        />

        <h1 className="mt-12 font-serif text-[clamp(2.05rem,8vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
          <span className="linha-corte">
            <span style={{ animationDelay: "140ms" }}>Feito para o sol.</span>
          </span>
          <span className="linha-corte">
            <span style={{ animationDelay: "300ms" }}>
              Feito para{" "}
              <em className="italic text-[var(--color-dourado)]">você</em>.
            </span>
          </span>
        </h1>
      </section>

      <OQuePrometemos />

      {/* ============ 3. uma cena por peça ============ */}
      <main>
        {pecas.length === 0 ? (
          <p className="mx-auto max-w-xs px-6 py-32 text-center text-[var(--color-suave)]">
            O catálogo está sendo montado. Em breve você vê todas as peças por
            aqui, com os tamanhos disponíveis.
          </p>
        ) : (
          pecas.map((peca, indice) => {
            const capa = capaDoProduto(peca);
            const esgotada = somarEstoque(peca) === 0;
            const cores = peca.variacoes.length;
            // Alterna o lado da foto. Duas cenas seguidas iguais viram lista.
            const espelhada = indice % 2 === 1;

            return (
              <section
                key={peca.id}
                className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-[14vh] sm:flex-row sm:gap-16"
              >
                <div
                  className={`w-full sm:w-1/2 ${espelhada ? "sm:order-2" : ""}`}
                >
                  <Link href={`/${peca.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[var(--color-creme)]">
                      {capa ? (
                        // A cortina sobe revelando a foto conforme ela entra.
                        <div className="cortina absolute inset-0">
                          <Image
                            src={enderecoDaFoto(capa)}
                            alt={peca.nome}
                            fill
                            sizes="(max-width: 640px) 92vw, 42vw"
                            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                      ) : (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-[#e8ab22] to-[#c98a12] text-white/90">
                          <Sol className="h-8 w-8 opacity-80" />
                          <span className="text-[0.54rem] uppercase tracking-[0.2em] opacity-80">
                            foto em breve
                          </span>
                        </span>
                      )}
                    </div>
                  </Link>
                </div>

                <div
                  className={`w-full sm:w-1/2 ${espelhada ? "sm:order-1 sm:text-right" : ""}`}
                >
                  <p
                    data-revelar
                    className="text-[0.58rem] uppercase tracking-[0.3em] text-[var(--color-suave)]"
                  >
                    {esgotada
                      ? "esgotado"
                      : `${cores} ${cores === 1 ? "cor" : "cores"}`}
                  </p>

                  <h2
                    data-revelar
                    style={{ transitionDelay: "80ms" }}
                    className="mt-3 font-serif text-[clamp(2rem,6vw,3.2rem)] leading-[1.02] tracking-[-0.02em]"
                  >
                    {peca.nome}
                  </h2>

                  <p
                    data-revelar
                    style={{ transitionDelay: "160ms" }}
                    className="mt-3 text-lg text-[var(--color-suave)]"
                  >
                    {formatarReais(peca.precoCentavos)}
                  </p>

                  <div data-revelar style={{ transitionDelay: "240ms" }}>
                    <Link
                      href={`/${peca.slug}`}
                      className={`mt-8 inline-flex touch-manipulation items-center gap-3 border-b border-[var(--color-dourado)] pb-1.5 text-[0.66rem] uppercase tracking-[0.28em] transition-[gap,opacity] duration-300 hover:gap-5 active:opacity-60`}
                    >
                      Ver a peça
                      <span aria-hidden className="text-[var(--color-dourado)]">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ============ 4. rodapé ============ */}
      {/*
        O rodapé anterior era uma logo centralizada num bloco vazio de meia
        tela. Rodapé vazio lê como site inacabado — é o último lugar da página,
        e terminar em nada faz parecer que faltou coisa.

        Este é escuro, e isso resolve duas coisas de uma vez: fecha a página com
        contraste em vez de dissolvê-la no mesmo areia, e dá um fim visual claro
        à rolagem.

        Alinhado à esquerda, como o resto: centralizar é o que fazia ele não
        encaixar com nada.
      */}
      <footer className="bg-[var(--color-tinta)] px-5 pb-10 pt-16 text-[var(--color-areia)]">
        <div className="mx-auto w-full max-w-[44rem]">
          <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <Image
                src="/logo.png"
                alt={config?.nomeLoja ?? "Paiva Swimwear"}
                width={1024}
                height={622}
                className="h-auto w-32"
              />
              <p className="mt-5 text-sm leading-relaxed text-[var(--color-areia)]/60">
                Biquínis costurados em quantidade pequena, para o sol de{" "}
                {config?.cidade ?? "Goiânia"}.
              </p>
            </div>

            <div className="flex gap-12 sm:gap-16">
              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[var(--color-dourado)]">
                  Loja
                </p>
                <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="text-[var(--color-areia)]/80 transition-colors hover:text-[var(--color-areia)]"
                    >
                      Todas as peças
                    </Link>
                  </li>
                  {pecas.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/${p.slug}`}
                        className="text-[var(--color-areia)]/80 transition-colors hover:text-[var(--color-areia)]"
                      >
                        {p.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[var(--color-dourado)]">
                  Entrega
                </p>
                <ul className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--color-areia)]/80">
                  <li>Somente em {config?.cidade ?? "Goiânia"}</li>
                  <li>Entrega feita pela loja</li>
                  <li>Tamanhos P ao GG</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-[var(--color-areia)]/15 pt-6 text-[0.58rem] uppercase tracking-[0.2em] text-[var(--color-areia)]/40 sm:flex-row sm:justify-between">
            <span>{config?.nomeLoja ?? "Paiva Swimwear"}</span>
            <span>Feito para o sol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
