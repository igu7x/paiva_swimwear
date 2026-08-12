"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCarrinho } from "@/components/usar-carrinho";
import { Sacola as IconeSacola } from "@/components/simbolos";
import { formatarReais } from "@/lib/formato";
import { enderecoDaFoto } from "@/lib/supabase/armazenamento";
import type { ResumoDoCarrinho } from "@/lib/db/carrinho";

import { resumirCarrinho } from "./acoes";

/**
 * A SACOLA.
 *
 * A lista mora no navegador, mas quem descreve cada item é o servidor: preço,
 * nome, foto e estoque são buscados toda vez que esta tela abre. Ver o comentário
 * em src/lib/db/carrinho.ts.
 *
 * O fechamento do pedido ainda não existe — é a última etapa combinada. Então
 * esta tela termina dizendo isso, em vez de mostrar um botão que não leva a
 * lugar nenhum.
 */
export function Sacola({ frete }: { frete: { cidade: string } | null }) {
  const { itens, pronto, mudarQuantidade, remover } = useCarrinho();
  const [resumo, setResumo] = useState<ResumoDoCarrinho | null>(null);

  /*
    Busca a descrição de cada item toda vez que a lista muda — inclusive quando
    ela mexe na quantidade, porque o subtotal e o total são contas do servidor.

    Enquanto a resposta nova não chega, a tela continua mostrando a anterior em
    vez de voltar para "carregando". Piscar a lista inteira a cada toque no
    mais e no menos seria pior do que um número certo com meio segundo de
    atraso.
  */
  useEffect(() => {
    if (!pronto) return;

    let vivo = true;

    resumirCarrinho(itens)
      .then((dados) => {
        if (vivo) setResumo(dados);
      })
      .catch(() => {
        // Sem resposta do servidor não dá para mostrar preço nenhum, e mostrar
        // a sacola sem preço seria pior do que dizer que ela está vazia.
        if (vivo) setResumo({ linhas: [], sumiram: 0, totalCentavos: 0 });
      });

    return () => {
      vivo = false;
    };
  }, [itens, pronto]);

  if (!pronto || !resumo) {
    return (
      <p className="py-20 text-center text-sm text-[var(--color-suave)]">
        Abrindo sua sacola…
      </p>
    );
  }

  if (resumo.linhas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <IconeSacola className="h-10 w-10 text-[var(--color-dourado)]" />
        <p className="max-w-[17rem] text-sm leading-relaxed text-[var(--color-suave)]">
          Sua sacola está vazia. Escolha uma peça, o tamanho e a cor — ela fica
          guardada aqui.
        </p>
        <Link
          href="/"
          className="touch-manipulation rounded-full bg-[var(--color-tinta)] px-6 py-3.5 text-[0.62rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-200 hover:bg-[var(--color-tinta-viva)] active:scale-[0.97]"
        >
          Ver as peças
        </Link>
      </div>
    );
  }

  return (
    <div>
      {resumo.sumiram > 0 ? (
        <p
          role="status"
          className="mb-5 rounded-2xl border border-[var(--color-dourado)] bg-[var(--color-creme)] p-4 text-sm"
        >
          {resumo.sumiram === 1
            ? "Uma peça saiu da loja e foi tirada da sacola."
            : `${resumo.sumiram} peças saíram da loja e foram tiradas da sacola.`}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {resumo.linhas.map((linha) => {
          const esgotado = linha.emEstoque === 0;
          const demais = !esgotado && linha.quantidade > linha.emEstoque;

          return (
            <li
              key={`${linha.produtoId}:${linha.variacaoId}:${linha.tamanho}`}
              className="flex gap-3.5 rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-3"
            >
              <Link
                href={`/${linha.slug}`}
                className="relative aspect-[4/5] w-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--color-areia)]"
              >
                {linha.foto ? (
                  <Image
                    src={enderecoDaFoto(linha.foto)}
                    alt={linha.nome}
                    fill
                    sizes="88px"
                    className={`object-cover ${esgotado ? "opacity-50" : ""}`}
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/${linha.slug}`}
                  className="font-serif text-lg leading-tight"
                >
                  {linha.nome}
                </Link>
                <p className="mt-0.5 text-xs text-[var(--color-suave)]">
                  {linha.cor} · tamanho {linha.tamanho}
                </p>

                {esgotado ? (
                  <p className="mt-1.5 text-xs text-red-800">
                    Esgotado neste tamanho.
                  </p>
                ) : demais ? (
                  <p className="mt-1.5 text-xs text-red-800">
                    Só {linha.emEstoque} em estoque.
                  </p>
                ) : null}

                <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                  {/* Quantidade com dois botões, não com um campo de digitar:
                      no celular, teclado numérico para escrever "2" é trabalho
                      demais para o que quase sempre é um toque. */}
                  <div className="flex items-center gap-1 rounded-full border border-[var(--color-linha)] bg-[var(--color-areia)] p-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        mudarQuantidade(linha, linha.quantidade - 1)
                      }
                      aria-label="Tirar uma"
                      className="grid h-7 w-7 touch-manipulation place-items-center rounded-full text-sm transition-colors duration-150 hover:bg-[var(--color-creme)] active:bg-[var(--color-creme)]"
                    >
                      −
                    </button>
                    <span className="min-w-5 text-center text-sm tabular-nums">
                      {linha.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        mudarQuantidade(linha, linha.quantidade + 1)
                      }
                      disabled={linha.quantidade >= linha.emEstoque}
                      aria-label="Pôr mais uma"
                      className="grid h-7 w-7 touch-manipulation place-items-center rounded-full text-sm transition-colors duration-150 hover:bg-[var(--color-creme)] active:bg-[var(--color-creme)] disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm">
                    {formatarReais(linha.subtotalCentavos)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remover(linha)}
                aria-label={`Tirar ${linha.nome} da sacola`}
                className="self-start p-1 text-lg leading-none text-[var(--color-suave)] transition-colors hover:text-[var(--color-tinta)] active:opacity-50"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-7 border-t border-[var(--color-linha)] pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
            Total das peças
          </span>
          <span className="font-serif text-2xl">
            {formatarReais(resumo.totalCentavos)}
          </span>
        </div>

        {frete ? (
          <p className="mt-2 text-xs text-[var(--color-suave)]">
            A entrega em {frete.cidade} é combinada no fechamento do pedido.
          </p>
        ) : null}

        {/*
          Nenhum botão de pagar aqui, de propósito. O fechamento de pedido é a
          última etapa combinada, e um botão que não leva a lugar nenhum é pior
          do que não ter botão: ela toca, não acontece nada, e conclui que o
          site está quebrado.
        */}
        <p className="mt-6 rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] p-5 text-sm leading-relaxed">
          O fechamento do pedido pelo site é a próxima coisa a ficar pronta. Sua
          sacola fica guardada neste aparelho até lá.
        </p>

        <Link
          href="/"
          className="mt-6 flex touch-manipulation items-center justify-center gap-3 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-6 py-3.5 text-[0.62rem] uppercase tracking-[0.2em] transition-transform duration-200 active:scale-[0.98]"
        >
          <span aria-hidden className="text-[var(--color-dourado)]">
            ←
          </span>
          Continuar escolhendo
        </Link>
      </div>
    </div>
  );
}
