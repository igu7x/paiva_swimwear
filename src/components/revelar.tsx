"use client";

import { useEffect } from "react";

/**
 * Faz o conteúdo revelar conforme entra na tela.
 *
 * É um observador só, para a página inteira, em vez de um componente de tela
 * por peça. A diferença importa: cada peça virando componente de tela mandaria
 * o React acompanhar dezenas de elementos, e isso pesa na rolagem justamente
 * no celular mais fraco.
 *
 * A ordem aqui também é proposital. A classe `js-pronto` é o que LIGA o estado
 * escondido no CSS — antes dela, nada está escondido. Se este arquivo falhar
 * ao carregar, a loja aparece inteira, sem animação. O contrário (esconder no
 * CSS e contar com o JS para mostrar) transformaria qualquer erro de script
 * numa vitrine em branco.
 */
export function Revelar() {
  useEffect(() => {
    const raiz = document.documentElement;

    // Quem pediu menos movimento no sistema não recebe nem o estado escondido.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    raiz.classList.add("js-pronto");

    const alvos = document.querySelectorAll("[data-revelar], [data-fio]");

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add("dentro");
          // Revelou, não precisa mais ser observado. Sem isto, o navegador
          // continuaria calculando posição de todo elemento a cada rolagem.
          observador.unobserve(entrada.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    for (const alvo of alvos) observador.observe(alvo);

    return () => {
      observador.disconnect();
      raiz.classList.remove("js-pronto");
    };
  }, []);

  return null;
}
