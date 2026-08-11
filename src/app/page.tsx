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
 * A LARGURA É A DECISÃO MAIS IMPORTANTE DESTA PÁGINA.
 *
 * A direção aprovada foi desenhada numa coluna estreita, e é isso que a faz
 * funcionar: as peças ficam próximas, o desencontro entre elas é visível de
 * relance, e a tipografia parece grande em relação ao que está em volta.
 *
 * Espalhada por uma tela de 2000px, a MESMA composição vira outra coisa — as
 * peças se afastam, o desencontro some e o título fica boiando no vazio.
 * Editorial de moda é sobre densidade, não sobre ocupar a tela.
 *
 * Por isso a coluna é curta e continua curta no desktop. A tela grande ganha
 * margem, não conteúdo esticado.
 */
const COLUNA = "mx-auto w-full max-w-[44rem] px-4";

/**
 * As cores que ocupam a moldura enquanto a foto não existe.
 *
 * São tons reais do catálogo dela — amarelo escuro, terracota, verde bandeira,
 * vinho. Um quadro quase branco sobre fundo quase branco lê como buraco na
 * página; um bloco de cor cheio lê como escolha, e a vitrine já se sustenta
 * antes de existir foto.
 *
 * A cor sai do id da peça, não de sorteio: a mesma peça mostra sempre o mesmo
 * tom, então a página não muda de cara a cada visita.
 */
const TONS_DE_ESPERA = [
  "from-[#e8ab22] to-[#c98a12]",
  "from-[#c4653a] to-[#a04a26]",
  "from-[#33735a] to-[#245442]",
  "from-[#7a2b42] to-[#5b1c2e]",
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
    <div className="overflow-hidden py-4">
      {/* O conteúdo é duplicado e a faixa anda metade da largura: quando
          recomeça, a segunda cópia está exatamente onde a primeira estava. */}
      <div className="correndo flex w-max gap-10 whitespace-nowrap">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex gap-10" aria-hidden={copia === 1}>
            {frases.map((frase) => (
              <span
                key={frase}
                className="flex items-center gap-10 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-suave)]"
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

  /**
   * Quem tem foto vai na frente.
   *
   * Dentro de cada grupo a ordem alfabética é mantida, então a vitrine não
   * fica embaralhando sozinha a cada foto que ela sobe.
   */
  const pecas = [...catalogo].sort((a, b) => {
    const temA = capaDoProduto(a) ? 0 : 1;
    const temB = capaDoProduto(b) ? 0 : 1;
    return temA - temB || a.nome.localeCompare(b.nome, "pt-BR");
  });

  return (
    <div className="pb-4">
      <MovimentoDaLoja />

      {/* ---------------- capa ---------------- */}
      <div className={`${COLUNA} pt-4`}>
        <header className="luz-do-sol capa-recua overflow-hidden rounded-[1.75rem] px-6 pb-11 pt-14 text-center">
          <Image
            src="/logo.png"
            alt={config?.nomeLoja ?? "Paiva Swimwear"}
            width={1024}
            height={622}
            priority
            className="animate-entrada mx-auto h-auto w-36"
          />

          <h1 className="mt-9 font-serif text-[clamp(2.4rem,12vw,3.9rem)] leading-[0.94] tracking-[-0.02em]">
            {/* Cada linha sobe de trás de um corte, uma depois da outra. */}
            <span className="linha-corte">
              <span style={{ animationDelay: "140ms" }}>Feito para o sol.</span>
            </span>
            <span className="linha-corte">
              <span style={{ animationDelay: "280ms" }}>
                Feito para{" "}
                <em className="italic text-[var(--color-dourado)]">você</em>.
              </span>
            </span>
          </h1>
        </header>
      </div>

      <FaixaCorrendo />

      {/* ---------------- as peças ---------------- */}
      <main className={`${COLUNA} pb-16`}>
        {pecas.length === 0 ? (
          <p className="mx-auto max-w-xs py-16 text-center text-[var(--color-suave)]">
            O catálogo está sendo montado. Em breve você vê todas as peças por
            aqui, com os tamanhos disponíveis.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3.5 gap-y-5 sm:grid-cols-3">
            {pecas.map((peca, indice) => {
              const capa = capaDoProduto(peca);
              const esgotada = somarEstoque(peca) === 0;
              const cores = peca.variacoes.length;

              return (
                <li
                  key={peca.id}
                  data-revelar
                  // Uma sobe, a seguinte desce. É o desencontro que tira a cara
                  // de planilha e dá a de editorial — e só é visível porque as
                  // peças estão próximas.
                  className={indice % 2 === 1 ? "mt-11" : ""}
                  style={{ transitionDelay: `${(indice % 3) * 90}ms` }}
                >
                  <Link href={`/${peca.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-[var(--color-creme)]">
                      {capa ? (
                        <Image
                          src={enderecoDaFoto(capa)}
                          alt={peca.nome}
                          fill
                          sizes="(max-width: 640px) 50vw, 240px"
                          className="aproximar object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                        />
                      ) : (
                        /* O lugar da foto que ainda não existe: um bloco de
                           cor cheio, não um quadro vazio. */
                        <span
                          className={`absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br px-4 text-center text-white/90 ${
                            TONS_DE_ESPERA[peca.id % TONS_DE_ESPERA.length]
                          }`}
                        >
                          <Sol className="h-7 w-7 opacity-80" />
                          <span className="text-[0.54rem] uppercase tracking-[0.2em] opacity-80">
                            foto em breve
                          </span>
                        </span>
                      )}

                      {esgotada ? (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--color-areia)]/85 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.15em] text-[var(--color-suave)] backdrop-blur-sm">
                          esgotado
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between gap-2">
                      <h2 className="font-serif text-[1.05rem] leading-tight">
                        {peca.nome}
                      </h2>
                      <span className="shrink-0 text-[0.78rem] tabular-nums text-[var(--color-suave)]">
                        {formatarReais(peca.precoCentavos)}
                      </span>
                    </div>

                    {cores > 0 ? (
                      <p className="mt-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-[var(--color-suave)]">
                        {cores} {cores === 1 ? "cor" : "cores"}
                      </p>
                    ) : null}

                    {/* O fio se estende sozinho ao entrar na tela, e cresce
                        mais ao passar o mouse. */}
                    <span
                      data-fio
                      className="mt-2 block h-px w-[22%] origin-left bg-[var(--color-dourado)] transition-transform duration-700 ease-out group-hover:scale-x-[4]"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ---------------- atributos ---------------- */}
      <section className={`${COLUNA} border-t border-[var(--color-linha)] pt-12`}>
        <ul className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {ATRIBUTOS.map(({ Icone, texto }, i) => (
            <li
              key={texto}
              data-revelar
              style={{ transitionDelay: `${i * 90}ms` }}
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

      {/* ---------------- rodapé ---------------- */}
      <footer className={`${COLUNA} py-14 text-center`}>
        <Image
          src="/logo.png"
          alt=""
          width={1024}
          height={622}
          className="mx-auto h-auto w-24 opacity-70"
        />
        {config ? (
          <p className="mt-5 text-[0.58rem] uppercase tracking-[0.26em] text-[var(--color-suave)]">
            Entregas em {config.cidade}
          </p>
        ) : null}
      </footer>
    </div>
  );
}
