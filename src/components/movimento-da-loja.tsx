"use client";

import Lenis from "lenis";
import { useEffect } from "react";

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    raiz.classList.add("js-pronto");

    const lenis = new Lenis({
      // Quanto a rolagem "escorrega" depois do gesto. Acima de 0.12 fica
      // escorregadio a ponto de a pessoa perder o controle do que está lendo.
      lerp: 0.09,
      // No celular a rolagem continua sendo a do sistema. O toque tem inércia
      // própria do aparelho, e sobrepor a nossa por cima dá a sensação de
      // atraso — o oposto do que queremos.
      syncTouch: false,
    });

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

    for (const alvo of document.querySelectorAll("[data-revelar], [data-fio], [data-linha]")) {
      observador.observe(alvo);
    }

    return () => {
      cancelAnimationFrame(quadro);
      observador.disconnect();
      lenis.destroy();
      raiz.classList.remove("js-pronto");
    };
  }, []);

  return null;
}
