import Image from "next/image";
import Link from "next/link";

import { MovimentoDaLoja } from "@/components/movimento-da-loja";
import { Ondas } from "@/components/ondas";
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
      {/*
        A ABERTURA, em três tempos: o sol abre, a logo chega, as linhas sobem
        uma depois da outra. Os atrasos abaixo são a partitura disso.
      */}
      <section className="luz-do-sol capa-recua relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <Image
          src="/logo.png"
          alt={config?.nomeLoja ?? "Paiva Swimwear"}
          width={1024}
          height={622}
          priority
          data-abertura
          className="relative h-auto w-64 sm:w-[26rem]"
        />

        <h1 className="relative mt-12 font-serif text-[clamp(2.05rem,8vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
          {/* Cada linha é observada por conta própria: elas sobem em cascata ao
              entrar e descem ao sair, toda vez — não só na primeira visita. */}
          <span className="linha-corte" data-linha>
            <span>Feito para o sol.</span>
          </span>
          <span className="linha-corte" data-linha>
            <span>
              Feito para{" "}
              <em className="italic text-[var(--color-dourado)]">você</em>.
            </span>
          </span>
        </h1>
      </section>

      <OQuePrometemos />

      {/* ============ 3. uma cena por peça ============ */}
      <main className="fundo-agua">
        {/* O véu desfoca a praia atrás e emenda as bordas da seção. */}
        <div
          aria-hidden
          className="veu-agua pointer-events-none absolute inset-0 z-0"
        />

        {/* As ondas fluem com a rolagem. Ficam acima do véu e abaixo das
            peças, então nunca cobrem nome nem preço. */}
        <div className="pointer-events-none absolute inset-0 z-[5]">
          <Ondas posicao="topo" />
          <Ondas posicao="base" />
        </div>

        <div className="relative z-10">
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
              /*
                NO CELULAR A CENA É UMA SÓ, NÃO DOIS BLOCOS.

                Medido em 390px de largura: cada peça ocupava 925px de altura,
                com 118px de vazio em cima e outros 118 embaixo. A foto e a
                placa ficavam soltas uma da outra, e o olho lia duas coisas
                separadas em vez de uma composição.

                Agora a placa SOBE POR CIMA da foto e fica recuada nas
                laterais. As duas viram uma peça só, e a cena cabe na tela sem
                a pessoa precisar rolar no meio dela.

                No desktop nada disso vale: lá elas ficam lado a lado, e o
                recuo e a sobreposição são zerados.
              */
              <section
                key={peca.id}
                className="mx-auto flex max-w-5xl flex-col items-center gap-0 px-4 py-14 sm:flex-row sm:gap-16 sm:px-6 sm:py-[14vh]"
              >
                <div
                  className={`w-[70%] sm:w-1/2 ${
                    espelhada
                      ? "self-end sm:order-2 sm:self-auto"
                      : "self-start sm:self-auto"
                  }`}
                >
                  <Link href={`/${peca.slug}`} className="group block">
                    {/* A sombra tira a peça do fundo. Sem ela, a foto encosta
                        na praia e as duas viram a mesma superfície — foi a
                        queixa de que a peça se mistura com o fundo. */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[var(--color-creme)] shadow-[0_30px_70px_-30px_rgba(58,40,26,0.75)]">
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

                {/*
                  O texto fica sobre uma placa clara, com desfoque atrás.

                  Sem ela o nome e o preço pousavam direto na areia: mesma cor,
                  mesmo brilho, e o olho não sabia onde parar. A placa devolve
                  uma superfície de leitura sem esconder a praia, porque o que
                  está atrás continua aparecendo desfocado.
                */}
                {/*
                  A placa vem do lado OPOSTO ao da foto, e sobe por cima dela.

                  A foto sozinha, ocupando a largura toda, tapava a praia — e
                  aí o fundo que a gente escolheu com tanto cuidado deixava de
                  existir. Com as duas ocupando 70% e 78%, cada uma de um lado,
                  sobra praia em volta e a cena ganha diagonal.

                  No desktop tudo isso é desligado: lá elas ficam lado a lado.
                */}
                <div
                  className={`-mt-14 w-[78%] sm:mt-0 sm:w-1/2 ${
                    espelhada
                      ? "self-start sm:order-1 sm:self-auto"
                      : "self-end sm:self-auto"
                  }`}
                >
                  <div
                    data-revelar
                    className={`rounded-[1.25rem] border border-white/40 bg-[var(--color-areia)]/85 p-5 shadow-[0_24px_60px_-28px_rgba(58,40,26,0.7)] backdrop-blur-md sm:rounded-[1.5rem] sm:p-8 ${
                      espelhada ? "sm:text-right" : ""
                    }`}
                  >
                    <p className="text-[0.56rem] uppercase tracking-[0.28em] text-[var(--color-dourado)]">
                      {esgotada
                        ? "esgotado"
                        : `${cores} ${cores === 1 ? "cor" : "cores"}`}
                    </p>

                    <h2 className="mt-2 font-serif text-[clamp(1.6rem,5.5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] text-[var(--color-tinta)]">
                      {peca.nome}
                    </h2>

                    {/* Preço na cor do texto, não na apagada: é a segunda
                        informação que a cliente procura, depois do nome. */}
                    <p className="mt-1.5 text-xl text-[var(--color-tinta)] sm:mt-3 sm:text-2xl">
                      {formatarReais(peca.precoCentavos)}
                    </p>

                    <Link
                      href={`/${peca.slug}`}
                      className="mt-5 inline-flex touch-manipulation items-center gap-3 rounded-full bg-[var(--color-tinta)] px-5 py-2.5 text-[0.6rem] uppercase tracking-[0.22em] text-white transition-[transform,gap] duration-300 hover:gap-5 active:scale-[0.97] sm:mt-7 sm:px-6 sm:py-3"
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
        </div>
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
