"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Pessoa, Sacola } from "@/components/simbolos";
import { useCarrinho } from "@/components/usar-carrinho";

/**
 * A BARRA QUE FICA POR CIMA DA LOJA INTEIRA.
 *
 * São dois botões e nada mais: a conta e a sacola. É deliberado — a loja tem
 * poucas peças e a vitrine é uma sequência que se percorre rolando, então um
 * menu com categorias seria mobília para uma casa que não existe.
 *
 * NÃO EXISTE FAIXA ATRÁS DELES. Os botões flutuam soltos sobre a página.
 *
 * Aqui existia uma faixa clara que aparecia ao rolar. Ela era redundante: cada
 * botão já tem fundo creme e borda próprios, então já se destaca de qualquer
 * coisa por baixo. A faixa só acrescentava um retângulo atravessado no alto da
 * tela, cortando a foto que estava passando atrás.
 *
 * Com ela fora, sumiu junto a lógica de "ficar sólida depois de descer" — um
 * ouvinte de rolagem a menos rodando o tempo todo.
 */

type Sessao = { entrou: boolean; nome: string | null; vendedora: boolean };

export function BarraDaLoja({
  variante = "pagina",
}: {
  /** "capa" é a vitrine, onde a barra começa transparente. */
  variante?: "capa" | "pagina";
}) {
  const caminho = usePathname();
  const { total, pronto } = useCarrinho();
  const [sessao, setSessao] = useState<Sessao | null>(null);

  /*
    Pergunta quem está logado depois que a tela existe — ver o comentário em
    src/app/api/sessao/route.ts. Enquanto a resposta não chega, o ícone da
    conta fica neutro em vez de chutar.
  */
  useEffect(() => {
    let vivo = true;

    fetch("/api/sessao")
      .then((r) => (r.ok ? r.json() : null))
      .then((dados: Sessao | null) => {
        if (vivo && dados) setSessao(dados);
      })
      .catch(() => {
        // Sem resposta, a barra continua funcionando como se ninguém estivesse
        // logado. O pior caso é a cliente clicar em entrar e já estar dentro.
      });

    return () => {
      vivo = false;
    };
  }, [caminho]);

  const destinoDaConta = sessao?.entrou
    ? "/conta"
    : `/entrar?voltar=${encodeURIComponent(caminho)}`;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/*
        A faixa não recebe cliques; só os botões dentro dela recebem. Sem isto,
        um retângulo invisível atravessaria o alto da página inteira e comeria
        o toque de qualquer coisa que passasse por baixo.
      */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-3 py-2.5 [&_a]:pointer-events-auto [&_button]:pointer-events-auto sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {variante === "pagina" ? (
            <>
              <Link
                href="/"
                className="group flex touch-manipulation items-center gap-2 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] py-2 pl-3 pr-4 text-[0.6rem] uppercase tracking-[0.18em] transition-[transform,border-color] duration-200 active:scale-[0.97] hover:border-[var(--color-tinta)] active:border-[var(--color-tinta)]"
              >
                <span
                  aria-hidden
                  className="text-[var(--color-dourado)] transition-transform duration-300 group-hover:-translate-x-0.5"
                >
                  ←
                </span>
                Voltar
              </Link>

              <Link href="/" aria-label="Início" className="hidden sm:block">
                <Image
                  src="/logo.png"
                  alt="Paiva Swimwear"
                  width={1024}
                  height={622}
                  className="h-9 w-auto"
                />
              </Link>
            </>
          ) : null}
        </div>

        <nav className="flex items-center gap-2">
          {/*
            O atalho do painel só existe para ela, e só depois que a resposta
            do servidor chegou. Ele fica escrito, e não como mais um ícone: são
            dois toques por dia, e um terceiro desenho na barra confundiria a
            cliente sem ajudar ninguém.
          */}
          {sessao?.vendedora ? (
            <Link
              href="/admin"
              className="hidden touch-manipulation rounded-full border border-[var(--color-dourado)] bg-[var(--color-creme)] px-4 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-[var(--color-tinta)] transition-transform duration-200 active:scale-[0.97] sm:block"
            >
              Painel
            </Link>
          ) : null}

          <Link
            href={destinoDaConta}
            aria-label={sessao?.entrou ? "Minha conta" : "Entrar"}
            className="relative grid h-10 w-10 touch-manipulation place-items-center rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] transition-[transform,border-color] duration-200 active:scale-[0.94] hover:border-[var(--color-tinta)] active:border-[var(--color-tinta)]"
          >
            <Pessoa className="h-[1.15rem] w-[1.15rem] text-[var(--color-tinta)]" />

            {/* Um ponto dourado no canto diz "você está logada" sem precisar
                de mais um desenho nem de texto. */}
            {sessao?.entrou ? (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--color-areia)] bg-[var(--color-dourado)]"
              />
            ) : null}
          </Link>

          <Link
            href="/carrinho"
            aria-label={
              pronto && total > 0 ? `Sacola com ${total} peças` : "Sacola"
            }
            className="relative grid h-10 w-10 touch-manipulation place-items-center rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] transition-[transform,border-color] duration-200 active:scale-[0.94] hover:border-[var(--color-tinta)] active:border-[var(--color-tinta)]"
          >
            <Sacola className="h-[1.15rem] w-[1.15rem] text-[var(--color-tinta)]" />

            {pronto && total > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-[var(--color-tinta)] px-1 text-[0.6rem] leading-none text-white">
                {total}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
