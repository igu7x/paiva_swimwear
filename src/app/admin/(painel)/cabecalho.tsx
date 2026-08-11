import Image from "next/image";
import Link from "next/link";

import { sair } from "./acoes";

/**
 * A faixa do topo, igual em todas as telas do painel.
 *
 * Ela resolve duas coisas que faltavam: a marca aparece (ela sabe onde está) e
 * existe um caminho de volta fixo, sempre no mesmo canto. Antes cada tela tinha
 * seu próprio link "Voltar" em posição diferente, e é isso que faz o painel
 * parecer desalinhado ao navegar.
 */
export function Cabecalho() {
  return (
    <header
      className="border-b border-[var(--color-linha)]"
      // Marca a faixa para ela ficar parada durante a troca de tela — é o
      // ponto de referência de quem está navegando. Ver globals.css.
      style={{ viewTransitionName: "cabecalho-painel" }}
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4 px-5 py-3">
        <Link
          href="/admin"
          aria-label="Início do painel"
          transitionTypes={["volta"]}
        >
          <Image
            src="/logo.png"
            alt="Paiva Swimwear"
            width={1024}
            height={622}
            className="h-7 w-auto"
          />
        </Link>

        <form action={sair}>
          <button
            type="submit"
            className="text-xs text-[var(--color-suave)] transition-opacity active:opacity-60"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
