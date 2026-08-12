import Image from "next/image";
import Link from "next/link";

import { sair } from "./acoes";

/**
 * A faixa do topo, igual em todas as telas do painel.
 *
 * ELA PRECISA DEVOLVER A VENDEDORA PARA A LOJA.
 *
 * O painel era um beco: entrando nele, não existia caminho de volta para o
 * site. A única saída era "Sair" — que desloga — ou digitar o endereço na mão.
 * E ela vive nos dois lados: cadastra uma peça e quer ver como ficou.
 *
 * Então são dois caminhos para o mesmo lugar, de propósito. O botão escrito,
 * porque é o que se procura quando se quer sair de uma tela; e a logo, porque
 * logo no topo é clicável em todo site do mundo e ela vai tentar isso primeiro.
 *
 * A logo também cresceu. Do tamanho anterior ela era um enfeite claro no canto
 * de um fundo claro — não dava para perceber que era um botão, nem que era a
 * marca da loja dela.
 */
export function Cabecalho() {
  return (
    <header
      className="border-b border-[var(--color-linha)] bg-[var(--color-areia)]"
      // Marca a faixa para ela ficar parada durante a troca de tela — é o
      // ponto de referência de quem está navegando. Ver globals.css.
      style={{ viewTransitionName: "cabecalho-painel" }}
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-2.5">
        <Link
          href="/"
          className="group flex shrink-0 touch-manipulation items-center gap-2 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] py-2 pl-3 pr-4 text-[0.6rem] uppercase tracking-[0.16em] transition-[transform,border-color] duration-200 active:scale-[0.97] hover:border-[var(--color-tinta)] active:border-[var(--color-tinta)]"
        >
          <span
            aria-hidden
            className="text-[var(--color-dourado)] transition-transform duration-300 group-hover:-translate-x-0.5"
          >
            ←
          </span>
          Loja
        </Link>

        <Link href="/" aria-label="Ver a loja" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Paiva Swimwear"
            width={1024}
            height={622}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <form action={sair} className="shrink-0">
          <button
            type="submit"
            className="touch-manipulation rounded-full px-2 py-2 text-xs text-[var(--color-suave)] transition-colors hover:text-[var(--color-tinta)] active:opacity-60"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
