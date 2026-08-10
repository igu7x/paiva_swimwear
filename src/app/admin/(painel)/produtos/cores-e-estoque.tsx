"use client";

import { useOptimistic, useRef, useState } from "react";

import { TAMANHOS } from "@/lib/tamanhos";

import { adicionarCor, gravarEstoque, removerCor } from "./acoes";
import { botaoContorno, botaoTexto, campo, cartao } from "../ui";

/**
 * As cores da peça e o estoque de cada tamanho.
 *
 * A razão de este bloco ser um componente de tela (e não HTML servido pronto) é
 * o tempo de resposta. Toda ação aqui viaja até o servidor, e esperar essa
 * viagem antes de mexer na tela dá a sensação de travamento.
 *
 * Então a tela muda NA HORA e o servidor confirma por trás:
 *
 *   acrescentar cor  -> o bloco da cor aparece antes de o servidor responder
 *   remover cor      -> o bloco some no toque
 *   salvar estoque   -> o botão vira "Salvo" imediatamente
 *
 * Se o servidor recusar, a tela volta sozinha ao que era — o `useOptimistic`
 * descarta a mudança de mentira quando a resposta real chega. Ou seja: rápido,
 * mas sem mentir sobre o que foi gravado.
 */

type Estoque = { tamanho: string; quantidade: number };
type Variacao = { id: number; nome: string; estoque: Estoque[] };

type Mudanca =
  | { tipo: "acrescentar"; nome: string }
  | { tipo: "remover"; id: number };

export function CoresEEstoque({
  produtoId,
  variacoes,
}: {
  produtoId: number;
  variacoes: Variacao[];
}) {
  const [lista, aplicar] = useOptimistic(
    variacoes,
    (atual, mudanca: Mudanca) => {
      if (mudanca.tipo === "remover") {
        return atual.filter((v) => v.id !== mudanca.id);
      }
      return [
        ...atual,
        {
          // Número negativo para não colidir com id de verdade do banco. Ele
          // existe só até a resposta do servidor chegar com o id real.
          id: -Date.now(),
          nome: mudanca.nome,
          estoque: TAMANHOS.map((tamanho) => ({ tamanho, quantidade: 0 })),
        },
      ];
    },
  );

  const formularioNovaCor = useRef<HTMLFormElement>(null);

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl">Cores e estoque</h2>
      <p className="mt-1 text-sm text-[var(--color-suave)]">
        Quando um tamanho chega a zero, ele some da loja sozinho.
      </p>

      {lista.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--color-linha)] p-4 text-sm text-[var(--color-suave)]">
          Nenhuma cor ainda. Enquanto não tiver pelo menos uma, a peça não pode
          ser comprada no site.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {lista.map((variacao) => (
            <li key={variacao.id}>
              <BlocoDaCor
                produtoId={produtoId}
                variacao={variacao}
                aoRemover={() => aplicar({ tipo: "remover", id: variacao.id })}
              />
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formularioNovaCor}
        action={async (dados) => {
          const nome = String(dados.get("cor") ?? "").trim();
          if (!nome) return;

          // A ordem importa: mexer na tela primeiro, esperar o servidor depois.
          aplicar({ tipo: "acrescentar", nome });
          formularioNovaCor.current?.reset();

          await adicionarCor(dados);
        }}
        className={`${cartao} mt-3`}
      >
        <input type="hidden" name="produtoId" value={produtoId} />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm">Acrescentar cor</span>
          <input
            type="text"
            name="cor"
            required
            placeholder="Terracota"
            className={campo}
          />
        </label>
        <button type="submit" className={`${botaoContorno} mt-3`}>
          Acrescentar
        </button>
      </form>
    </section>
  );
}

function BlocoDaCor({
  produtoId,
  variacao,
  aoRemover,
}: {
  produtoId: number;
  variacao: Variacao;
  aoRemover: () => void;
}) {
  const [salvo, setSalvo] = useState(false);

  const porTamanho = new Map(
    variacao.estoque.map((e) => [e.tamanho, e.quantidade]),
  );

  return (
    <div className={cartao}>
      <form
        action={async (dados) => {
          setSalvo(true);
          await gravarEstoque(dados);
        }}
      >
        <input type="hidden" name="produtoId" value={produtoId} />
        <input type="hidden" name="variacaoId" value={variacao.id} />

        <span className="font-medium">{variacao.nome}</span>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {TAMANHOS.map((tamanho) => (
            <label key={tamanho} className="flex flex-col gap-1">
              <span className="text-center text-xs text-[var(--color-suave)]">
                {tamanho}
              </span>
              <input
                type="number"
                name={`quantidade-${tamanho}`}
                min={0}
                inputMode="numeric"
                defaultValue={porTamanho.get(tamanho) ?? 0}
                // Mexeu no número, o "Salvo" some: o botão volta a dizer que
                // existe coisa por gravar.
                onChange={() => setSalvo(false)}
                className="w-full rounded-xl border border-[var(--color-linha)] bg-[var(--color-creme)] px-2 py-2.5 text-center text-base outline-none transition-colors focus:border-[var(--color-dourado)]"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          className={`${botaoContorno} mt-3 ${salvo ? "text-[var(--color-suave)]" : ""}`}
        >
          {salvo ? "Salvo" : "Salvar estoque"}
        </button>
      </form>

      <form
        action={async (dados) => {
          aoRemover();
          await removerCor(dados);
        }}
      >
        <input type="hidden" name="produtoId" value={produtoId} />
        <input type="hidden" name="variacaoId" value={variacao.id} />
        <button type="submit" className={botaoTexto}>
          Remover {variacao.nome}
        </button>
      </form>
    </div>
  );
}
