import Image from "next/image";

import { capaDoProduto, listarVitrine } from "@/lib/db/produtos";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";

import { CarregarAnimacoes } from "./carregar-animacoes";
import "./prototipo.css";

export const revalidate = 60;

/**
 * Duas seções, para decidir o sistema antes de refazer a home.
 *
 * A fórmula que se repete em toda seção, tirada das três referências:
 *
 *     sobrancelha  +  título grande  +  corpo de texto real  +  link
 *
 * "Corpo de texto real" é a parte que faltava: as referências têm parágrafos
 * de três a cinco linhas dizendo alguma coisa, não frases soltas de efeito. É
 * densidade, e não silêncio, que faz parecer caro.
 */
export default async function Prototipo() {
  const catalogo = await listarVitrine().catch(() => []);
  const peca = catalogo.find((p) => capaDoProduto(p)) ?? catalogo[0] ?? null;
  const capa = peca ? capaDoProduto(peca) : null;

  return (
    <>
      <CarregarAnimacoes />

      {/* ================= 02 · MANIFESTO ================= */}
      <section className="bg-[var(--casca)] py-[16vh] text-[var(--leite)]">
        <div className="grade">
          <p className="sobrancelha col-span-12 text-[var(--sol)]">
            Nossa convicção
          </p>

          <h2 className="revelar-letras display col-span-12 mt-6 lg:col-span-9">
            Biquíni não é peça de vitrine.
          </h2>

          <div className="col-span-12 mt-10 lg:col-span-6 lg:col-start-7">
            <p className="corpo text-[var(--leite)]/75">
              É a roupa em que você passa oito horas no sol, entra na água,
              senta na areia molhada e levanta sem ajeitar nada. Se em algum
              momento você lembrar que está usando, ele falhou.
            </p>
            <p className="corpo mt-5 text-[var(--leite)]/75">
              Por isso a modelagem vem antes da estampa, e o tecido vem antes
              das duas. Cada peça é costurada em Goiânia, em quantidade pequena,
              e provada antes de entrar no catálogo.
            </p>

            <a
              href="#peca"
              className="sobrancelha mt-9 inline-flex items-center gap-3 border-b border-[var(--sol)] pb-2 text-[var(--leite)] transition-[gap] duration-300 hover:gap-6"
            >
              Ver como é feita
              <span aria-hidden className="text-[var(--sol)]">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= 03 · A PEÇA EM CENA ================= */}
      {/*
        O container tem 300vh de altura e o miolo fica preso no topo: a foto
        permanece na tela enquanto três blocos de texto passam por cima dela.
        A rolagem deixa de ser deslocamento e vira o controle da cena.
      */}
      <section id="peca" data-presa className="relative h-[300vh]">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          <div className="grade w-full items-center gap-y-10">
            {/* A foto sangra até a borda esquerda, sem canto arredondado.
                Canto arredondado em foto de produto é linguagem de aplicativo,
                não de editorial. */}
            <div className="col-span-12 h-[38svh] lg:col-span-6 lg:h-[78svh]">
              <div className="relative h-full w-full overflow-hidden bg-[var(--casca)]">
                {capa ? (
                  <div data-foto className="absolute inset-[-8%]">
                    <Image
                      src={enderecoDaFoto(capa)}
                      alt={peca?.nome ?? ""}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div
                    data-foto
                    className="absolute inset-[-8%] bg-gradient-to-br from-[#e8ab22] to-[#8a5a12]"
                  />
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 lg:col-start-8">
              <p className="sobrancelha text-[var(--sol)]">
                {peca?.nome ?? "A peça"}
              </p>

              <div className="blocos mt-7">
                <article>
                  <h3 className="display text-[clamp(1.9rem,4.5vw,3.4rem)]">
                    Modelagem
                  </h3>
                  <p className="corpo mt-4 text-[var(--tinta)]/70">
                    Calcinha asa delta, mais larga na lateral para o sol pegar
                    onde a marca costuma ficar. Cós que assenta no quadril sem
                    apertar, e viés com elástico embutido — o que impede a peça
                    de enrolar quando você senta.
                  </p>
                </article>

                <article>
                  <h3 className="display text-[clamp(1.9rem,4.5vw,3.4rem)]">
                    Tecido
                  </h3>
                  <p className="corpo mt-4 text-[var(--tinta)]/70">
                    Suplex poliéster com proteção UV. Seca no corpo em minutos,
                    não desbota com cloro nem com água salgada, e volta ao lugar
                    depois de esticado. É o mesmo tecido de roupa de treino.
                  </p>
                </article>

                <article>
                  <h3 className="display text-[clamp(1.9rem,4.5vw,3.4rem)]">
                    Caimento
                  </h3>
                  <p className="corpo mt-4 text-[var(--tinta)]/70">
                    Parte de cima cortininha, com abertura para você colocar
                    bojo se quiser — não vendemos com bojo. A costura é
                    embutida, então nada raspa na pele nas primeiras horas.
                  </p>
                </article>
              </div>

              <a
                href={peca ? `/${peca.slug}` : "/"}
                className="sobrancelha mt-10 inline-flex items-center gap-3 border-b border-[var(--sol)] pb-2 transition-[gap] duration-300 hover:gap-6"
              >
                Ver tamanhos e cores
                <span aria-hidden className="text-[var(--sol)]">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="grade py-16">
        <p className="sobrancelha col-span-12 text-[var(--tinta)]/45">
          Fim do protótipo — duas seções de nove
        </p>
      </div>
    </>
  );
}
