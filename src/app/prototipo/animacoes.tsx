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
          const partido = new SplitText(alvo, { type: "chars", mask: "chars" });
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
          gsap.set(blocos.slice(1), { autoAlpha: 0, yPercent: 14 });

          const linha = gsap.timeline({
            scrollTrigger: {
              trigger: presa,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
            },
          });

          blocos.forEach((bloco, i) => {
            if (i > 0) {
              linha.to(bloco, { autoAlpha: 1, yPercent: 0, ease: "none" }, i);
            }
            if (i < blocos.length - 1) {
              linha.to(
                bloco,
                { autoAlpha: 0, yPercent: -14, ease: "none" },
                i + 0.72,
              );
            }
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
