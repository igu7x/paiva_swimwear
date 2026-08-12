"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/*
  ABRIU PÁGINA NOVA, COMEÇA NO TOPO.

  A rolagem com inércia guarda por dentro a posição em que ela acha que a
  página está, e vai escrevendo esse número na tela a cada quadro. Quando a
  cliente troca de página, o Next manda a rolagem para o topo — mas a inércia
  da página ANTIGA ainda pode estar rodando por um ou dois quadros e escrever a
  posição velha de volta. A página nova nasce rolada.

  É uma corrida, então acontece às vezes e não sempre — que foi exatamente
  como o problema apareceu.

  Este trecho garante o topo, com uma exceção: o "voltar" do navegador. Aí a
  pessoa quer encontrar a vitrine onde ela parou, não recomeçar do alto. A
  marca abaixo vive fora do componente de propósito — ela precisa sobreviver à
  troca de página, e tudo que está dentro do componente é jogado fora nela.
*/
let voltouPeloNavegador = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    voltouPeloNavegador = true;
  });
}

/**
 * O movimento da parte que a cliente vê: rolagem com inércia e revelações.
 *
 * POR QUE ROLAGEM COM INÉRCIA
 *
 * A rolagem do navegador é seca: para no instante em que o dedo solta. Com
 * inércia ela desacelera como se a página tivesse peso, e é isso — mais do que
 * qualquer animação de elemento — que dá a sensação de site caro. É a técnica
 * que o icomat.co.uk usa, um dos sites que o Igor apontou como referência.
 *
 * Custa 8 KB comprimidos. Foi a única biblioteca que entrou no projeto, e
 * entrou porque o efeito é o pedido, não um enfeite que eu escolhi.
 *
 * SÓ NA LOJA, NUNCA NO PAINEL. No painel ela vai preencher formulário e
 * conferir estoque; rolagem com inércia atrapalha quem está trabalhando, e
 * ajuda quem está passeando.
 *
 * Um laço de animação só, compartilhado: a rolagem e as revelações andam no
 * mesmo quadro. Dois laços disputando o mesmo quadro é o que faz página
 * animada engasgar no celular fraco.
 */
export function MovimentoDaLoja() {
  useEffect(() => {
    const raiz = document.documentElement;

    // Quem pediu menos movimento no sistema não recebe nada disto: nem a
    // rolagem com inércia, nem o estado escondido das revelações.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Mas continua precisando começar no topo. Sem inércia não há como
      // subir animado, então aqui é direto — que é justamente o que essa
      // pessoa pediu ao ligar "reduzir movimento".
      if (!voltouPeloNavegador) window.scrollTo(0, 0);
      voltouPeloNavegador = false;
      return;
    }

    raiz.classList.add("js-pronto");

    /*
      A abertura é encenada uma vez só.

      A classe `abrindo` entra antes da primeira pintura (ver o script no
      layout) e carrega os atrasos longos da partitura. Se ela ficasse, quem
      rolasse para baixo e voltasse ao topo esperaria quase um segundo pelo
      título — deixa de ser encenação e vira travamento, que foi exatamente a
      queixa.

      2,2s cobre a última linha (880ms de atraso + 1,15s de percurso).
    */
    const fimDaAbertura = setTimeout(() => {
      raiz.classList.remove("abrindo");
    }, 2200);

    const lenis = new Lenis({
      // Quanto a rolagem "escorrega" depois do gesto. Acima de 0.12 fica
      // escorregadio a ponto de a pessoa perder o controle do que está lendo.
      lerp: 0.09,
      // No celular a rolagem continua sendo a do sistema. O toque tem inércia
      // própria do aparelho, e sobrepor a nossa por cima dá a sensação de
      // atraso — o oposto do que queremos.
      syncTouch: false,
    });

    /*
      A posição da rolagem vira uma variável que o CSS lê.

      É assim que as ondas fluem com o dedo: elas não têm animação de relógio,
      só leem este número. Parou a rolagem, parou a onda; voltou, a onda volta.

      Escrever uma variável no documento é barato — o navegador recalcula só
      quem depende dela. Bem mais barato do que mexer no estilo de cada faixa.
    */
    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      raiz.style.setProperty("--rolagem", String(Math.round(scroll)));
    });

    /*
      Chegou por um link: a página começa no topo.

      COMO ELA CHEGA LÁ DEPENDE DE ONDE ELA ESTAVA.

      Os links da loja pedem ao Next para NÃO mexer na rolagem (`scroll={false}`),
      e é por isso que este trecho existe. Sem aquilo, o Next zerava a rolagem
      sozinho, de uma vez, antes mesmo deste código rodar — era esse o salto
      seco, e não havia como animar o que já tinha acontecido.

      Com a decisão nas nossas mãos, a página nova nasce onde a anterior
      estava e SOBE até o topo: a curva desacelera no fim, então ela parece
      assentar no alto em vez de ser arrancada até lá.

      Meio segundo é o teto disso. Acima, a pessoa fica esperando uma viagem
      que ela não pediu — ela clicou para ver uma peça, não para assistir a
      página subir.
    */
    if (!voltouPeloNavegador && window.scrollY > 0) {
      lenis.scrollTo(0, {
        duration: 0.5,
        // easeOutCubic: sai rápido, chega devagar.
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
    }

    voltouPeloNavegador = false;

    let quadro = 0;
    const passo = (tempo: number) => {
      lenis.raf(tempo);
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);

    /*
      A revelação é reversível: desce e aparece, sobe e some.

      Antes cada elemento era revelado uma vez e deixava de ser observado. Isso
      economizava trabalho, mas fazia a página só animar na primeira passagem —
      quem rolasse de volta encontrava tudo parado, e a página perdia a
      sensação de responder ao gesto.

      Agora o observador continua acompanhando todos, e a classe entra e sai.
      Como a animação é uma transição de CSS, o próprio navegador cuida de
      inverter o caminho quando o elemento sai.
    */
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          entrada.target.classList.toggle("dentro", entrada.isIntersecting);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    for (const alvo of document.querySelectorAll("[data-revelar], [data-fio], [data-linha], [data-abertura]")) {
      observador.observe(alvo);
    }

    return () => {
      clearTimeout(fimDaAbertura);
      cancelAnimationFrame(quadro);
      observador.disconnect();
      // Para antes de destruir: assim esta página não escreve mais nenhuma
      // posição de rolagem enquanto a página seguinte está nascendo.
      lenis.stop();
      lenis.destroy();
      raiz.classList.remove("js-pronto", "abrindo");
    };
  }, []);

  return null;
}
