"use client";

import { useFormStatus } from "react-dom";

/**
 * Botão que sabe que o formulário dele está sendo enviado.
 *
 * O `useFormStatus` lê o estado do formulário em volta — por isso este botão
 * precisa ser um componente separado, e não parte da página: ele só enxerga o
 * envio se estiver DENTRO do <form>, num componente próprio.
 *
 * Existe por um motivo prático: ela vai usar isso no celular, com internet de
 * loja. Sem retorno visual, o botão parece não ter funcionado, ela toca de novo,
 * e o mesmo estoque é salvo duas vezes.
 */
export function BotaoEnviar({
  children,
  enviando,
  variante = "contorno",
}: {
  children: React.ReactNode;
  /** O texto enquanto salva. Ex.: "Salvando..." */
  enviando: string;
  variante?: "contorno" | "texto";
}) {
  const { pending } = useFormStatus();

  const estilo =
    variante === "contorno"
      ? "w-full rounded-full border border-[var(--color-tinta)] px-4 py-2.5 text-sm"
      : "w-full py-1 text-xs text-[var(--color-suave)]";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${estilo} transition-opacity disabled:opacity-50`}
    >
      {pending ? enviando : children}
    </button>
  );
}
