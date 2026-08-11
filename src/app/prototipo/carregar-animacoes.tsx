"use client";

import dynamic from "next/dynamic";

/**
 * Empurra o GSAP para fora do carregamento inicial.
 *
 * Só o `import()` dentro do useEffect não bastava: o Next continuava
 * anunciando o pedaço de código no HTML, e o navegador o baixava junto com a
 * página — antes da primeira foto, que é o que a cliente está esperando ver.
 *
 * Com `ssr: false` o pedaço vira um carregamento à parte, disparado depois que
 * a página já está de pé. A animação chega um instante depois do conteúdo, que
 * é a ordem certa: primeiro ela vê a peça, depois a página ganha movimento.
 */
const Animacoes = dynamic(
  () => import("./animacoes").then((m) => ({ default: m.Animacoes })),
  { ssr: false },
);

export function CarregarAnimacoes() {
  return <Animacoes />;
}
