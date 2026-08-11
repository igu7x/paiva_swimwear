"use client";

import Image from "next/image";
import { useActionState, useRef } from "react";

import { enderecoDaFoto } from "@/lib/supabase/armazenamento";

import { enviarFotos, removerFoto, type EstadoFotos } from "./acoes-fotos";
import { Girando } from "../movimento";

const inicial: EstadoFotos = { erro: null, enviadas: 0 };

type Foto = { id: number; caminho: string };

/**
 * As fotos de uma peça, ou de uma cor dela.
 *
 * Escolher os arquivos já envia — sem botão "confirmar" depois. Ela vai fazer
 * isso no celular, e cada toque a mais é um motivo a mais para voltar ao
 * caderno.
 *
 * A primeira foto é a capa: é ela que aparece na vitrine e na prévia do link
 * mandado no WhatsApp. Por isso vem marcada, senão ela não teria como saber.
 *
 * A lista de fotos fica FORA do formulário de envio: cada botão de remover é um
 * formulário próprio, e formulário dentro de formulário o navegador desmonta em
 * silêncio.
 */
export function Fotos({
  produtoId,
  variacaoId,
  fotos,
  vazio,
}: {
  produtoId: number;
  variacaoId?: number;
  fotos: Foto[];
  vazio: string;
}) {
  const [estado, acao, enviando] = useActionState(enviarFotos, inicial);
  const formulario = useRef<HTMLFormElement>(null);

  return (
    <div>
      {fotos.length > 0 ? (
        <ul className="mb-3 grid grid-cols-3 gap-2">
          {fotos.map((foto, indice) => (
            <li key={foto.id}>
              <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--color-linha)] bg-[var(--color-areia)]">
                <Image
                  src={enderecoDaFoto(foto.caminho)}
                  alt=""
                  fill
                  sizes="(max-width: 448px) 30vw, 130px"
                  className="object-cover"
                />

                {indice === 0 && !variacaoId ? (
                  <span className="absolute left-1 top-1 rounded-full bg-[var(--color-tinta)] px-2 py-0.5 text-[10px] text-white">
                    capa
                  </span>
                ) : null}
              </div>

              <form action={removerFoto} className="mt-1">
                <input type="hidden" name="produtoId" value={produtoId} />
                <input type="hidden" name="fotoId" value={foto.id} />
                <button
                  type="submit"
                  className="w-full touch-manipulation py-1 text-[11px] text-[var(--color-suave)] transition-opacity active:opacity-60"
                >
                  remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-[var(--color-suave)]">{vazio}</p>
      )}

      <form ref={formulario} action={acao}>
        <input type="hidden" name="produtoId" value={produtoId} />
        {variacaoId ? (
          <input type="hidden" name="variacaoId" value={variacaoId} />
        ) : null}

        <label
          className={`flex w-full touch-manipulation items-center justify-center gap-2 rounded-full border border-[var(--color-linha)] bg-[var(--color-creme)] px-4 py-3 text-sm transition-[transform,border-color] duration-150 active:scale-[0.98] active:border-[var(--color-tinta)] ${
            enviando ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {enviando ? <Girando /> : null}
          {enviando ? "Enviando" : "Escolher fotos"}
          <input
            type="file"
            name="fotos"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={enviando}
            // Envia assim que ela escolhe, sem um segundo toque para confirmar.
            onChange={(evento) => {
              if (evento.target.files?.length) {
                formulario.current?.requestSubmit();
              }
            }}
            className="sr-only"
          />
        </label>

        {estado.erro ? (
          <p role="alert" className="mt-2 text-xs text-red-800">
            {estado.erro}
          </p>
        ) : null}
      </form>
    </div>
  );
}
