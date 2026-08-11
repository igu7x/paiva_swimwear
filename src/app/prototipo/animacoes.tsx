"use client";

import { useEffect } from "react";

/**
 * O movimento do protótipo.
 *
 * DUAS DECISÕES QUE MANDAM AQUI
 *
 * 1. SCRUB, NÃO GATILHO. O movimento é proporcional ao gesto: avança com o
 *    dedo e desfaz quando a pessoa rola de volta. Animação de gatilho é
 *    binária — aconteceu ou não — e é isso que faz parecer efeito colado por
 *    cima. Scrub é o que dá a sensação de estar mexendo numa coisa planejada.
 *
 * 2. O CONTEÚDO NUNCA DEPENDE DISTO. A página é inteira renderizada no
 *    servidor e legível com o JavaScript desligado. Este arquivo só ACRESCENTA
 *    movimento: ele marca a página com `animado` e, a partir daí, o CSS assume
 *    os estados de animação. Se o script falhar, nada some.
 *
 * O GSAP é carregado depois, sob demanda, para não disputar banda com a
 * primeira imagem — que é o que a cliente está esperando ver.
 */
export function Animacoes() {
  useEffect(() => {
    const raiz = document.querySelector(".prototipo");
    if (!raiz) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    let limpar: (() => void) | undefined;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }, { SplitText }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/SplitText"),
        ]);

      if (cancelado) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);
      raiz.classList.add("animado");

      const lenis = new Lenis({ lerp: 0.09, syncTouch: false });

      // A rolagem suave e o GSAP precisam andar no MESMO relógio. Cada um com
      // o seu, as animações ficam um quadro atrás da rolagem e o efeito
      // "desgruda" do dedo.
      lenis.on("scroll", ScrollTrigger.update);
      const passo = (tempo: number) => lenis.raf(tempo * 1000);
      gsap.ticker.add(passo);
      gsap.ticker.lagSmoothing(0);

      const contexto = gsap.context(() => {
        /* ---- letra a letra, mascarada ---- */
        for (const alvo of gsap.utils.toArray<HTMLElement>(".revelar-letras")) {
          // "words,chars" e não só "chars": partindo apenas em letras, cada
          // letra vira um bloco solto e o navegador passa a quebrar a linha no
          // meio da palavra ("é p / eça de vitrine"). Envolver as palavras
          // mantém a quebra onde ela deve acontecer.
          const partido = new SplitText(alvo, {
            type: "words,chars",
            mask: "chars",
          });
          gsap.set(alvo, { visibility: "visible" });

          gsap.from(partido.chars, {
            yPercent: 110,
            ease: "expo.out",
            stagger: 0.018,
            scrollTrigger: {
              trigger: alvo,
              start: "top 88%",
              end: "top 45%",
              scrub: 1,
            },
          });
        }

        /* ---- seção presa: a foto fica, o texto troca ---- */
        const presa = document.querySelector<HTMLElement>("[data-presa]");
        const blocos = gsap.utils.toArray<HTMLElement>("[data-presa] .blocos > *");

        if (presa && blocos.length > 1) {
          const total = blocos.length;
          gsap.set(blocos.slice(1), { autoAlpha: 0, yPercent: 14 });

          /*
            A troca é calculada, não encadeada.

            A primeira versão empilhava tweens numa linha do tempo com posições
            arbitrárias, e existiam faixas em que dois blocos ficavam quase
            opacos ao mesmo tempo — na tela, "Modelagem" e "Tecido" impressos um
            por cima do outro, ilegíveis.

            Aqui cada bloco tem uma faixa exclusiva do percurso, e a opacidade
            sai da distância até o centro dessa faixa. Dois blocos nunca podem
            estar cheios ao mesmo tempo, porque a conta não permite.
          */
          ScrollTrigger.create({
            trigger: presa,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
              const p = self.progress;

              blocos.forEach((bloco, i) => {
                const meio = (i + 0.5) / total;
                const meiaFaixa = 0.5 / total;
                let d = (p - meio) / meiaFaixa;

                // O primeiro fica firme antes de começar, e o último depois de
                // terminar: sem isto a cena abre e fecha em branco.
                if (i === 0 && d < 0) d = 0;
                if (i === total - 1 && d > 0) d = 0;

                const visivel = Math.min(1, Math.max(0, (1 - Math.abs(d)) * 2.4));
                gsap.set(bloco, {
                  autoAlpha: visivel,
                  yPercent: d * -12,
                });
              });
            },
          });

          /* ---- a foto respira dentro da moldura ---- */
          const foto = presa.querySelector("[data-foto]");
          if (foto) {
            gsap.fromTo(
              foto,
              { yPercent: -6 },
              {
                yPercent: 6,
                ease: "none",
                scrollTrigger: {
                  trigger: presa,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          }
        }
      }, raiz);

      limpar = () => {
        contexto.revert();
        gsap.ticker.remove(passo);
        lenis.destroy();
        raiz.classList.remove("animado");
      };
    })();

    return () => {
      cancelado = true;
      limpar?.();
    };
  }, []);

  return null;
}
