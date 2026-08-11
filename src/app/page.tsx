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
 *   2. a frase da marca, acendendo palavra por palavra
 *   3. uma cena por peça, com a foto revelada por uma cortina
 *   4. o que a marca promete
 *   5. o fim
 *
 * Isso funciona melhor com POUCAS peças, que é o caso desta loja — dar uma
 * tela inteira para cada peça só é possível quando são dezenas, não milhares.
 */

/** Quebra a frase em palavras para cada uma acender na sua vez. */
function FraseQueAcende({ texto, className }: { texto: string; className?: string }) {
  return (
    <p className={className}>
      {texto.split(" ").map((palavra, i) => (
        <span
          key={`${palavra}-${i}`}
          className="palavra inline-block"
          // A posição da palavra desloca a faixa de rolagem em que ela acende.
          style={{ "--i": i } as React.CSSProperties}
        >
          {palavra}
          {i < texto.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

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
                className="flex items-center gap-12 text-[0.62rem] uppercase tracking-[0.3em] text-[var(--color-suave)]"
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
          className="animate-entrada h-auto w-44 sm:w-56"
        />

        <h1 className="mt-12 font-serif text-[clamp(2.6rem,11vw,5.5rem)] leading-[0.92] tracking-[-0.025em]">
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

        <span className="animate-entrada mt-16 text-[0.58rem] uppercase tracking-[0.35em] text-[var(--color-suave)]">
          role
        </span>
      </section>

      {/* ============ 2. a frase, acendendo ============ */}
      <section className="mx-auto max-w-3xl px-6 py-[22vh]">
        <FraseQueAcende
          texto="Biquínis que realçam sua beleza natural e te acompanham nos seus melhores dias de sol."
          className="text-center font-serif text-[clamp(1.6rem,5.5vw,2.9rem)] leading-[1.25] tracking-[-0.01em]"
        />
      </section>

      <FaixaCorrendo />

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

      {/* ============ 4. o que a marca promete ============ */}
      <section className="border-t border-[var(--color-linha)] bg-[var(--color-areia-funda)] px-6 py-20">
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-y-14 sm:grid-cols-4">
          {ATRIBUTOS.map(({ Icone, texto }, i) => (
            <li
              key={texto}
              data-revelar
              style={{ transitionDelay: `${i * 110}ms` }}
              className="flex flex-col items-center gap-4 px-3 text-center"
            >
              <Icone className="h-9 w-9 text-[var(--color-dourado)]" />
              <span className="text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-[var(--color-suave)]">
                {texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ 5. o fim ============ */}
      <footer className="luz-do-sol flex min-h-[45svh] flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={1024}
          height={622}
          className="h-auto w-32 opacity-80"
        />
        {config ? (
          <p className="mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-suave)]">
            Entregas em {config.cidade}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
