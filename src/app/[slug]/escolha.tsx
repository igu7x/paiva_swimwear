"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { createPortal } from "react-dom";

import { useCarrinho } from "@/components/usar-carrinho";
import { fundoDaCor, tomDaCor } from "@/lib/cores";
import { formatarReais } from "@/lib/formato";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";
import { MEDIDAS, TAMANHOS, type Tamanho } from "@/lib/tamanhos";

type Foto = { id: number; caminho: string; variacaoId: number | null };
type Variacao = {
  id: number;
  nome: string;
  estoque: { tamanho: string; quantidade: number }[];
};

/**
 * A PÁGINA DA PEÇA.
 *
 * A foto manda. Tudo aqui é organizado em volta disso: ela abre a página, ocupa
 * a largura toda, e é a única coisa que dá para tocar e ver maior.
 *
 * AS FOTOS QUE APARECEM.
 *
 * Antes: se a cor tinha foto, a galeria virava só as fotos daquela cor, e a
 * foto da vitrine — a arte com modelo, a que a loja usa para se apresentar —
 * simplesmente sumia da página. Era o que parecia "a foto da vitrine está sendo
 * substituída pela foto das cores".
 *
 * Agora a galeria é as duas coisas, nesta ordem:
 *
 *     [fotos da peça] + [fotos da cor escolhida]
 *
 * Trocar de cor não apaga nada: só troca a segunda metade e leva a galeria até
 * a primeira foto daquela cor, para a cliente ver na hora o que ela escolheu.
 */
export function Escolha({
  produtoId,
  nome,
  precoCentavos,
  fotos,
  variacoes,
  sobreAPeca,
}: {
  produtoId: number;
  nome: string;
  precoCentavos: number;
  fotos: Foto[];
  variacoes: Variacao[];
  /*
    O texto sobre a peça vem de fora porque é conteúdo do servidor — este
    componente é de tela, e não deveria carregar texto que não muda.
  */
  sobreAPeca?: React.ReactNode;
}) {
  const [corId, setCorId] = useState<number | null>(variacoes[0]?.id ?? null);
  const [tamanho, setTamanho] = useState<Tamanho | null>(null);
  const [verMedidas, setVerMedidas] = useState(false);
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const [ativa, setAtiva] = useState(0);
  const [guardado, setGuardado] = useState(false);

  const carrossel = useRef<HTMLDivElement>(null);
  const { acrescentar } = useCarrinho();

  const cor = variacoes.find((v) => v.id === corId) ?? null;

  const daPeca = fotos.filter((f) => f.variacaoId === null);
  const daCor = fotos.filter((f) => f.variacaoId === corId);
  const galeria = [...daPeca, ...daCor];

  const quantidadeDe = (t: string) =>
    cor?.estoque.find((e) => e.tamanho === t)?.quantidade ?? 0;

  const corEsgotada =
    cor !== null && cor.estoque.every((e) => e.quantidade === 0);

  /** Leva a galeria até uma foto. */
  const irPara = useCallback((indice: number, suave = true) => {
    const trilho = carrossel.current;
    if (!trilho) return;

    const alvo = trilho.children[indice] as HTMLElement | undefined;
    if (!alvo) return;

    trilho.scrollTo({
      left: alvo.offsetLeft - trilho.offsetLeft,
      behavior: suave ? "smooth" : "auto",
    });
  }, []);

  /*
    Qual foto está na frente agora — alimenta os traços embaixo da galeria.

    A conta é "qual foto está mais perto de onde o trilho parou", e não uma
    divisão pela largura da tela. A divisão só funcionava enquanto cada foto
    ocupava o trilho inteiro; no celular ela passou a ocupar 82%, com espaço
    entre uma e outra, e a partir daí a divisão apontava para a foto errada.

    Medir a distância de cada uma continua certo em qualquer largura — inclusive
    na última foto, que nunca chega a encostar na esquerda porque a rolagem
    acaba antes.
  */
  useEffect(() => {
    const trilho = carrossel.current;
    if (!trilho) return;

    const aoRolar = () => {
      let maisPerto = 0;
      let menorDistancia = Infinity;

      for (const [indice, filho] of [...trilho.children].entries()) {
        const posicao = (filho as HTMLElement).offsetLeft - trilho.offsetLeft;
        const distancia = Math.abs(posicao - trilho.scrollLeft);

        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          maisPerto = indice;
        }
      }

      setAtiva(maisPerto);
    };

    trilho.addEventListener("scroll", aoRolar, { passive: true });
    return () => trilho.removeEventListener("scroll", aoRolar);
  }, []);

  function escolherCor(id: number) {
    setCorId(id);
    setTamanho(null);

    // Mostra a cor escolhida na hora. Se ela não tem foto própria, a galeria
    // fica onde está — voltar para o começo à toa seria movimento sem motivo.
    const temFoto = fotos.some((f) => f.variacaoId === id);
    if (temFoto) irPara(daPeca.length);
  }

  function guardarNaSacola() {
    if (!cor || !tamanho) return;

    acrescentar({
      produtoId,
      variacaoId: cor.id,
      tamanho,
      quantidade: 1,
    });

    setGuardado(true);
  }

  // O aviso de "guardado" some sozinho: ele é uma confirmação, não um estado.
  useEffect(() => {
    if (!guardado) return;
    const relogio = setTimeout(() => setGuardado(false), 6000);
    return () => clearTimeout(relogio);
  }, [guardado]);

  const disponivel = tamanho ? quantidadeDe(tamanho) > 0 : false;

  return (
    /*
      DUAS COLUNAS NA TELA LARGA, uma no celular.

      No celular a página é uma coluna e a foto vem primeiro — é o que a
      cliente quer ver, e ela chegou aqui pelo celular.

      Na tela larga isso ficaria absurdo: uma coluna de 450px no meio de um
      monitor, com a foto pequena e metros de vazio dos dois lados. Então a
      foto vai para a esquerda, ocupa mais da metade e FICA PARADA enquanto o
      resto rola — a peça continua à vista enquanto ela escolhe cor e tamanho.
    */
    <div className="sm:grid sm:grid-cols-[1.08fr_1fr] sm:items-start sm:gap-12">
      <div className="sm:sticky sm:top-[4.6rem]">
        {/* ---------------- a foto ---------------- */}
        {galeria.length > 0 ? (
          <section>
            <div className="relative">
              {/*
              Sangra até as bordas da tela no celular. Uma foto com margem dos
              dois lados vira "imagem dentro de um documento"; sem margem, ela
              vira a tela. É a diferença entre olhar uma foto e estar diante da
              peça.

              SEM SOMBRA embaixo da foto. Ela existiu e saiu.

              Na vitrine a sombra tem função: lá a foto flutua sobre a praia, e
              sem ela as duas viram a mesma superfície. Aqui o fundo é liso, e
              sobre fundo liso a sombra não vira profundidade — vira uma mancha
              cinza de canto quase reto colada embaixo da foto. O canto
              arredondado sozinho já separa a foto da página.
            */}
              <div
                ref={carrossel}
                className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {galeria.map((foto, indice) => {
                  const quadro = (
                    <button
                      type="button"
                      onClick={() => setAmpliada(indice)}
                      aria-label="Ver a foto maior"
                      /*
                        `cursor-zoom-in` diz o que este clique faz antes de a
                        pessoa clicar: a foto abre em tela cheia. Uma mãozinha
                        comum diria só "dá para clicar", e ela clicaria sem
                        saber no que estava se metendo.

                        NO CELULAR A FOTO NÃO OCUPA A LARGURA INTEIRA. Ela
                        ocupa 82%, e isso faz duas coisas: sobra areia dos dois
                        lados, então a peça respira em vez de encher a tela; e
                        com mais de uma foto, a seguinte aparece pela borda —
                        que é como a pessoa descobre, sem ninguém explicar, que
                        dá para arrastar.

                        Com uma foto só ela vai para o meio, senão sobraria um
                        vazio de um lado só, que lê como defeito de layout.
                      */
                      className={`group relative aspect-[4/5] w-[82%] max-w-[320px] shrink-0 cursor-zoom-in snap-start touch-manipulation overflow-hidden rounded-[1.5rem] bg-[var(--color-creme)] sm:mx-0 sm:w-full sm:max-w-none ${
                        galeria.length === 1 ? "mx-auto" : ""
                      }`}
                    >
                      <Image
                        src={enderecoDaFoto(foto.caminho)}
                        alt={
                          foto.variacaoId && cor
                            ? `${nome} na cor ${cor.nome}`
                            : nome
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, 460px"
                        // A foto se aproxima devagar sob o mouse. É o retorno
                        // de "isto responde" sem pôr moldura por cima dela.
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                        priority={indice === 0}
                      />
                    </button>
                  );

                  /*
                    A PRIMEIRA FOTO CARREGA O NOME DA TROCA DE TELA.

                    É o mesmo nome que a foto desta peça tem na vitrine. O
                    navegador reconhece que são a mesma coisa em dois lugares e
                    faz uma viajar até a outra, crescendo — em vez de uma sumir
                    e a outra aparecer do nada.

                    Só a primeira: o nome precisa ser único na página, e a
                    primeira é justamente a capa, que é o que a vitrine mostra.
                  */
                  return indice === 0 ? (
                    <ViewTransition key={foto.id} name={`peca-${produtoId}`}>
                      {quadro}
                    </ViewTransition>
                  ) : (
                    <Fragment key={foto.id}>{quadro}</Fragment>
                  );
                })}
              </div>

              {/*
              As setas.

              No celular arrastar já funciona, mas nem todo mundo descobre isso
              sozinho — e no computador não existe arrastar. Elas ficam POR CIMA
              das bordas da foto, e não fora dela: assim não roubam largura da
              foto, que é a coisa mais importante desta página.

              Nas pontas elas apagam em vez de sumir. Botão que desaparece muda
              o lugar do outro, e a mão vai no lugar errado no toque seguinte.
            */}
              {galeria.length > 1 ? (
                <>
                  <SetaDaGaleria
                    lado="esquerda"
                    desligada={ativa === 0}
                    aoTocar={() => irPara(ativa - 1)}
                  />
                  <SetaDaGaleria
                    lado="direita"
                    desligada={ativa >= galeria.length - 1}
                    aoTocar={() => irPara(ativa + 1)}
                  />
                </>
              ) : null}
            </div>

            {/*
            Os traços embaixo. Um risco por foto, o da vez em dourado: diz
            quantas existem e onde ela está, e serve de atalho para pular
            direto. Ponto redondo some numa tela clara; traço não.
          */}
            {galeria.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {galeria.map((foto, indice) => (
                  <button
                    key={foto.id}
                    type="button"
                    onClick={() => irPara(indice)}
                    aria-label={`Foto ${indice + 1} de ${galeria.length}`}
                    className="h-4 touch-manipulation px-0.5"
                  >
                    <span
                      className={`block h-[2px] rounded-full transition-all duration-300 ${
                        indice === ativa
                          ? "w-7 bg-[var(--color-dourado)]"
                          : "w-3.5 bg-[var(--color-linha)]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center rounded-[1.5rem] bg-[var(--color-creme)] text-sm text-[var(--color-suave)]">
            Fotos em breve
          </div>
        )}
      </div>

      <div>
        {/* ---------------- nome e preço ---------------- */}
        <h1 className="mt-7 font-serif text-[2.1rem] leading-[1.05] sm:mt-0 sm:text-[2.6rem]">
          {nome}
        </h1>
        <p className="mt-1.5 text-lg text-[var(--color-suave)]">
          {formatarReais(precoCentavos)}
        </p>

        {sobreAPeca}

        {/* ---------------- cor ---------------- */}
        {variacoes.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
              Cor
              {cor ? (
                <span className="normal-case tracking-normal">
                  {" "}
                  · {cor.nome}
                </span>
              ) : null}
            </h2>

            <ul className="mt-3 flex flex-wrap gap-2.5">
              {variacoes.map((v) => (
                <li key={v.id}>
                  <BotaoDeCor
                    nome={v.nome}
                    escolhida={v.id === corId}
                    esgotada={v.estoque.every((e) => e.quantidade === 0)}
                    foto={fotos.find((f) => f.variacaoId === v.id)?.caminho}
                    aoEscolher={() => escolherCor(v.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------------- tamanho ---------------- */}
        {cor ? (
          <section className="mt-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
                Tamanho
              </h2>
              <button
                type="button"
                onClick={() => setVerMedidas((v) => !v)}
                className="touch-manipulation text-xs text-[var(--color-suave)] underline underline-offset-4 hover:text-[var(--color-tinta)] active:opacity-60"
              >
                {verMedidas ? "fechar medidas" : "qual é o meu?"}
              </button>
            </div>

            {verMedidas ? (
              <table className="mt-3 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-[var(--color-suave)]">
                  <tr>
                    <th className="py-1.5 font-normal">Tam.</th>
                    <th className="py-1.5 font-normal">Quadril</th>
                    <th className="py-1.5 font-normal">Busto</th>
                  </tr>
                </thead>
                <tbody>
                  {TAMANHOS.map((t) => (
                    <tr
                      key={t}
                      className="border-t border-[var(--color-linha)]"
                    >
                      <td className="py-1.5">{t}</td>
                      <td className="py-1.5">{MEDIDAS[t].quadril}</td>
                      <td className="py-1.5">{MEDIDAS[t].busto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            <ul className="mt-3 flex flex-wrap gap-2">
              {TAMANHOS.map((t) => {
                const temNoEstoque = quantidadeDe(t) > 0;
                const escolhido = tamanho === t;

                return (
                  <li key={t}>
                    <button
                      type="button"
                      disabled={!temNoEstoque}
                      onClick={() => setTamanho(t)}
                      className={`min-w-12 touch-manipulation rounded-full border px-4 py-2.5 text-sm transition-[transform,border-color,background-color] duration-150 hover:border-[var(--color-tinta)] active:scale-[0.97] ${
                        escolhido
                          ? "border-[var(--color-tinta)] bg-[var(--color-tinta)] text-white"
                          : "border-[var(--color-linha)] bg-[var(--color-creme)]"
                      } ${!temNoEstoque ? "cursor-not-allowed text-[var(--color-suave)] line-through opacity-60" : ""}`}
                    >
                      {t}
                    </button>
                  </li>
                );
              })}
            </ul>

            {corEsgotada ? (
              <p className="mt-3 text-sm text-[var(--color-suave)]">
                {cor.nome} está esgotada no momento.
              </p>
            ) : null}

            <p className="mt-2 text-xs text-[var(--color-suave)]">
              O conjunto sai todo no mesmo tamanho.
            </p>
          </section>
        ) : null}

        {/* ---------------- guardar na sacola ---------------- */}
        {/*
        A barra fica colada no pé da tela.

        No celular, o botão de comprar no meio da página some assim que a
        cliente rola para ver a foto de novo — e ela rola, porque a foto é o
        motivo de ela estar aqui. Colado embaixo, ele está sempre a um toque,
        sem tirar espaço da foto.
      */}
        {variacoes.length > 0 ? (
          <div className="sticky bottom-0 z-20 -mx-5 mt-10 border-t border-[var(--color-linha)] bg-[var(--color-areia)]/92 px-5 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none">
            {guardado ? (
              <div className="mb-2.5 flex items-center justify-between gap-3 rounded-full border border-[var(--color-dourado)] bg-[var(--color-creme)] py-2 pl-4 pr-2 text-sm">
                <span>Guardado na sacola.</span>
                <Link
                  href="/carrinho"
                  className="touch-manipulation rounded-full bg-[var(--color-tinta)] px-4 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-[var(--color-tinta-viva)]"
                >
                  Ver sacola
                </Link>
              </div>
            ) : null}

            <button
              type="button"
              onClick={guardarNaSacola}
              disabled={!cor || !tamanho || !disponivel}
              className="flex w-full touch-manipulation items-center justify-center gap-3 rounded-full bg-[var(--color-tinta)] px-6 py-4 text-[0.66rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-200 hover:bg-[var(--color-tinta-viva)] active:scale-[0.98] disabled:bg-[var(--color-creme)] disabled:text-[var(--color-suave)]"
            >
              {!cor
                ? "Indisponível"
                : corEsgotada
                  ? "Esgotado nesta cor"
                  : !tamanho
                    ? "Escolha o tamanho"
                    : "Adicionar à sacola"}

              {cor && tamanho && disponivel ? (
                <span aria-hidden className="text-[var(--color-dourado)]">
                  {formatarReais(precoCentavos)}
                </span>
              ) : null}
            </button>
          </div>
        ) : null}
      </div>

      {/* ---------------- a foto em tela cheia ---------------- */}
      {ampliada !== null && galeria[ampliada] ? (
        <FotoAmpliada
          fotos={galeria}
          indice={ampliada}
          nome={nome}
          aoTrocar={setAmpliada}
          aoFechar={() => setAmpliada(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * Uma seta da galeria.
 *
 * O fundo é claro com desfoque atrás em vez de sólido: a foto continua
 * aparecendo por trás dela, e a seta não vira um adesivo colado por cima da
 * peça. Numa foto clara ela ainda se destaca por causa da borda.
 */
function SetaDaGaleria({
  lado,
  desligada,
  aoTocar,
}: {
  lado: "esquerda" | "direita";
  desligada: boolean;
  aoTocar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={aoTocar}
      disabled={desligada}
      aria-label={lado === "esquerda" ? "Foto anterior" : "Próxima foto"}
      className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-[var(--color-linha)] bg-[var(--color-areia)]/80 text-[var(--color-tinta)] backdrop-blur-sm transition-[opacity,transform,border-color] duration-200 hover:border-[var(--color-tinta)] active:scale-[0.92] disabled:opacity-35 ${
        lado === "esquerda" ? "left-2 sm:left-3" : "right-2 sm:right-3"
      }`}
    >
      {lado === "esquerda" ? "←" : "→"}
    </button>
  );
}

/**
 * O botão de uma cor, PINTADO DA COR.
 *
 * A vendedora escreve "Marrom" e o botão fica marrom; escreve "Estampa Folhas"
 * e ele mostra a foto daquela cor como amostra. A tradução de nome para tom
 * está em src/lib/cores.ts.
 *
 * Um detalhe que parece bobo e não é: o anel de escolhida fica FORA do botão,
 * separado por uma folga da cor do fundo. Se ele encostasse na cor, um botão
 * preto e um anel escuro virariam a mesma mancha e ninguém saberia qual está
 * escolhido.
 */
function BotaoDeCor({
  nome,
  escolhida,
  esgotada,
  foto,
  aoEscolher,
}: {
  nome: string;
  escolhida: boolean;
  esgotada: boolean;
  foto?: string;
  aoEscolher: () => void;
}) {
  const tom = tomDaCor(nome);

  return (
    <button
      type="button"
      onClick={aoEscolher}
      aria-pressed={escolhida}
      className={`flex touch-manipulation items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-[transform,box-shadow,border-color] duration-200 hover:border-[var(--color-tinta)] active:scale-[0.97] ${
        escolhida
          ? "border-[var(--color-tinta)] shadow-[0_0_0_3px_var(--color-areia),0_0_0_4px_var(--color-tinta)]"
          : "border-[var(--color-linha)]"
      } ${esgotada ? "opacity-55" : ""}`}
      style={{ backgroundColor: "var(--color-creme)" }}
    >
      <span
        aria-hidden
        className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-black/10"
        style={tom ? { background: fundoDaCor(tom) } : undefined}
      >
        {/* Sem cor reconhecida, a foto da própria peça vira a amostra — é
            sempre mais fiel do que qualquer aproximação que a gente chutasse. */}
        {!tom && foto ? (
          <Image
            src={enderecoDaFoto(foto)}
            alt=""
            fill
            sizes="28px"
            className="object-cover"
          />
        ) : null}
      </span>

      <span className={esgotada ? "line-through" : ""}>{nome}</span>
    </button>
  );
}

/**
 * A foto em tela cheia.
 *
 * `object-contain` e não `object-cover`: aqui a peça inteira precisa caber. Na
 * galeria o corte é enquadramento; aqui ele seria esconder justamente o que a
 * cliente abriu para ver.
 */
function FotoAmpliada({
  fotos,
  indice,
  nome,
  aoTrocar,
  aoFechar,
}: {
  fotos: Foto[];
  indice: number;
  nome: string;
  aoTrocar: (i: number) => void;
  aoFechar: () => void;
}) {
  // Esc fecha, setas passam. É de graça para quem está no computador e não
  // atrapalha ninguém no celular.
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
      if (evento.key === "ArrowRight") aoTrocar((indice + 1) % fotos.length);
      if (evento.key === "ArrowLeft")
        aoTrocar((indice - 1 + fotos.length) % fotos.length);
    }

    window.addEventListener("keydown", aoTeclar);

    // Trava a rolagem do fundo enquanto a foto está aberta: sem isso, arrastar
    // na foto rola a página atrás dela.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = antes;
    };
  }, [indice, fotos.length, aoTrocar, aoFechar]);

  /*
    O visor é desenhado FORA da página, direto no corpo do documento.

    Um `position: fixed` só é preso à janela enquanto nenhum antepassado dele
    tiver `transform`, `filter` ou `perspective` — basta um, em qualquer altura
    da árvore, para o "fixo" passar a valer em relação àquele elemento. A
    página da peça tem animação de entrada, os cartões têm desfoque; qualquer
    um desses transformaria o visor num retângulo do tamanho da página.

    Tirando ele da árvore, isso deixa de ser uma preocupação para sempre.
  */
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${nome} — foto ${indice + 1} de ${fotos.length}`}
      onClick={aoFechar}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--color-tinta)]/95 backdrop-blur-sm"
    >
      <div className="flex justify-end p-3">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="grid h-11 w-11 touch-manipulation place-items-center rounded-full border border-white/25 transition-colors duration-200 hover:border-white/70 text-lg text-white/90"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1">
        <Image
          src={enderecoDaFoto(fotos[indice].caminho)}
          alt={nome}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {fotos.length > 1 ? (
        <div
          // O clique nos botões não pode fechar a tela junto.
          onClick={(evento) => evento.stopPropagation()}
          /*
            A FOLGA GRANDE EMBAIXO É NO CELULAR, e serve para duas coisas ao
            mesmo tempo.

            A primeira: os navegadores de celular escondem e mostram a barra de
            endereço conforme a pessoa mexe na tela. Encostado no pé, o botão
            ficava debaixo dela em metade das vezes.

            A segunda é consequência: como esta faixa ocupa mais espaço, sobra
            menos para a foto — e a foto sobe junto, saindo de baixo do polegar
            de quem está segurando o aparelho.

            No computador nada disso existe, e a folga volta ao normal.
          */
          className="flex items-center justify-center gap-6 p-6 pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            onClick={() => aoTrocar((indice - 1 + fotos.length) % fotos.length)}
            aria-label="Foto anterior"
            className="grid h-11 w-11 touch-manipulation place-items-center rounded-full border border-white/25 transition-colors duration-200 hover:border-white/70 text-white/90"
          >
            ←
          </button>

          <span className="text-xs tracking-[0.2em] text-white/70">
            {indice + 1} / {fotos.length}
          </span>

          <button
            type="button"
            onClick={() => aoTrocar((indice + 1) % fotos.length)}
            aria-label="Próxima foto"
            className="grid h-11 w-11 touch-manipulation place-items-center rounded-full border border-white/25 transition-colors duration-200 hover:border-white/70 text-white/90"
          >
            →
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
