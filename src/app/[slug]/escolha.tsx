"use client";

import Image from "next/image";
import { useState } from "react";

import { enderecoDaFoto } from "@/lib/supabase/armazenamento";
import { MEDIDAS, TAMANHOS, type Tamanho } from "@/lib/tamanhos";

type Foto = { id: number; caminho: string; variacaoId: number | null };
type Variacao = {
  id: number;
  nome: string;
  estoque: { tamanho: string; quantidade: number }[];
};

/**
 * A escolha da cliente: cor e tamanho.
 *
 * O botão de fechar o pedido entra na etapa seguinte, junto com o carrinho e o
 * formulário de entrega. Até lá esta tela mostra o que existe e o que acabou,
 * que já é o que a loja não tinha.
 */
export function Escolha({
  nome,
  fotos,
  variacoes,
}: {
  nome: string;
  fotos: Foto[];
  variacoes: Variacao[];
}) {
  const [corId, setCorId] = useState<number | null>(variacoes[0]?.id ?? null);
  const [tamanho, setTamanho] = useState<Tamanho | null>(null);
  const [verMedidas, setVerMedidas] = useState(false);

  const cor = variacoes.find((v) => v.id === corId) ?? null;

  // Fotos da cor escolhida. Se aquela cor não tem foto própria, mostra as da
  // peça — melhor a foto genérica do que um espaço vazio.
  const daCor = fotos.filter((f) => f.variacaoId === corId);
  const daPeca = fotos.filter((f) => f.variacaoId === null);
  const galeria = daCor.length > 0 ? daCor : daPeca;

  const quantidadeDe = (t: string) =>
    cor?.estoque.find((e) => e.tamanho === t)?.quantidade ?? 0;

  const corEsgotada =
    cor !== null && cor.estoque.every((e) => e.quantidade === 0);

  return (
    <>
      {galeria.length > 0 ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1">
          {galeria.map((foto) => (
            <div
              key={foto.id}
              /*
                Cada foto ocupa 78% da largura para a seguinte aparecer pela
                borda — é assim que a cliente descobre que dá para arrastar.

                Com UMA foto só isso não é dica, é buraco: sobra um vazio à
                direita que parece defeito de layout. Nesse caso ela ocupa a
                largura inteira.
              */
              className={`relative aspect-[3/4] shrink-0 snap-center overflow-hidden rounded-2xl bg-[var(--color-creme)] ${
                galeria.length === 1 ? "w-full sm:w-[62%]" : "w-[78%] sm:w-[46%]"
              }`}
            >
              <Image
                src={enderecoDaFoto(foto.caminho)}
                alt={cor ? `${nome} na cor ${cor.nome}` : nome}
                fill
                sizes="(max-width: 640px) 78vw, 320px"
                className="object-cover"
                priority={foto === galeria[0]}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid aspect-[3/4] w-full place-items-center rounded-2xl bg-[var(--color-creme)] text-sm text-[var(--color-suave)]">
          Fotos em breve
        </div>
      )}

      {variacoes.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
            Cor
            {cor ? <span className="normal-case tracking-normal"> · {cor.nome}</span> : null}
          </h2>

          <ul className="mt-3 flex flex-wrap gap-2">
            {variacoes.map((v) => {
              const esgotada = v.estoque.every((e) => e.quantidade === 0);
              const escolhida = v.id === corId;

              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCorId(v.id);
                      setTamanho(null);
                    }}
                    className={`touch-manipulation rounded-full border px-4 py-2 text-sm transition-[transform,border-color,background-color] duration-150 active:scale-[0.97] ${
                      escolhida
                        ? "border-[var(--color-tinta)] bg-[var(--color-tinta)] text-white"
                        : "border-[var(--color-linha)] bg-[var(--color-creme)]"
                    } ${esgotada && !escolhida ? "text-[var(--color-suave)] line-through" : ""}`}
                  >
                    {v.nome}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {cor ? (
        <section className="mt-7">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-suave)]">
              Tamanho
            </h2>
            <button
              type="button"
              onClick={() => setVerMedidas((v) => !v)}
              className="touch-manipulation text-xs text-[var(--color-suave)] underline underline-offset-4 active:opacity-60"
            >
              {verMedidas ? "fechar medidas" : "qual é o meu?"}
            </button>
          </div>

          {verMedidas ? (
            <table className="mt-3 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[var(--color-suave)]">
                <tr>
                  <th className="py-1.5 font-normal">Tam.</th>
                  <th className="py-1.5 font-normal">Quadril</th>
                  <th className="py-1.5 font-normal">Busto</th>
                </tr>
              </thead>
              <tbody>
                {TAMANHOS.map((t) => (
                  <tr key={t} className="border-t border-[var(--color-linha)]">
                    <td className="py-1.5">{t}</td>
                    <td className="py-1.5">{MEDIDAS[t].quadril}</td>
                    <td className="py-1.5">{MEDIDAS[t].busto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          <ul className="mt-3 flex flex-wrap gap-2">
            {TAMANHOS.map((t) => {
              const disponivel = quantidadeDe(t) > 0;
              const escolhido = tamanho === t;

              return (
                <li key={t}>
                  <button
                    type="button"
                    disabled={!disponivel}
                    onClick={() => setTamanho(t)}
                    className={`min-w-12 touch-manipulation rounded-full border px-4 py-2 text-sm transition-[transform,border-color,background-color] duration-150 active:scale-[0.97] ${
                      escolhido
                        ? "border-[var(--color-tinta)] bg-[var(--color-tinta)] text-white"
                        : "border-[var(--color-linha)] bg-[var(--color-creme)]"
                    } ${!disponivel ? "cursor-not-allowed text-[var(--color-suave)] line-through opacity-60" : ""}`}
                  >
                    {t}
                  </button>
                </li>
              );
            })}
          </ul>

          {corEsgotada ? (
            <p className="mt-3 text-sm text-[var(--color-suave)]">
              {cor.nome} está esgotada no momento. Fale com a gente que avisamos
              quando voltar.
            </p>
          ) : null}

          <p className="mt-2 text-xs text-[var(--color-suave)]">
            O conjunto sai todo no mesmo tamanho.
          </p>
        </section>
      ) : null}

      {/*
        Aqui entra o botão de fechar o pedido, na Etapa 3. Enquanto ele não
        existe, a tela não finge que existe: mostrar um botão que não leva a
        lugar nenhum é pior do que não ter botão.
      */}
      {tamanho && cor ? (
        <p className="mt-9 rounded-2xl border border-[var(--color-linha)] bg-[var(--color-creme)] px-5 py-4 text-center text-sm">
          {nome} · {cor.nome} · tamanho {tamanho}
          <span className="mt-1 block text-xs text-[var(--color-suave)]">
            Em breve você fecha o pedido por aqui.
          </span>
        </p>
      ) : null}
    </>
  );
}
