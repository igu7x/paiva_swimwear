"use client";

import { useLinkStatus } from "next/link";

/**
 * As peças de movimento reaproveitadas pelo painel.
 */

/** Aro girando. Entra dentro dos botões enquanto algo está sendo salvo. */
export function Girando({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-3.5 shrink-0 animate-girar rounded-full border-2 border-current border-t-transparent opacity-70 ${className}`}
    />
  );
}

/**
 * Bolinha que pulsa enquanto a tela de destino está sendo buscada.
 *
 * Precisa estar DENTRO de um <Link> — o `useLinkStatus` lê o estado do link em
 * volta, e é por isso que isto é um componente separado.
 *
 * Dois cuidados que o guia do Next levanta e que valem aqui:
 *
 * 1. Ela ocupa o espaço dela desde sempre, só invisível. Se aparecesse do nada,
 *    empurraria o texto do lado e a tela daria um pulinho no clique.
 *
 * 2. A animação só COMEÇA depois de 120ms. Em navegação rápida ninguém vê nada,
 *    que é o certo: piscar um indicador para algo que levou 40ms deixa a tela
 *    agitada à toa. Ele aparece só quando a espera é real.
 */
export function PistaDoLink() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`ml-1.5 inline-block size-1.5 shrink-0 rounded-full bg-current align-middle transition-opacity ${
        pending ? "animate-pulsar opacity-100 delay-[120ms]" : "opacity-0"
      }`}
    />
  );
}
