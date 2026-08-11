"use client";

import { useActionState } from "react";

import { salvarProduto, type EstadoProduto } from "./acoes";
import { Girando } from "../movimento";
import { botaoPrincipal, campo } from "../ui";

const estadoInicial: EstadoProduto = { erro: null };

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  precoCentavos: number;
  ativo: boolean;
};

/**
 * Formulário da peça, usado nas duas telas: cadastro e edição.
 *
 * A diferença entre as duas é só o campo escondido `id`. Com ele, o servidor
 * atualiza; sem ele, cria. Um formulário só evita as duas telas irem se
 * afastando com o tempo.
 */
export function FormularioProduto({ produto }: { produto?: Produto }) {
  const [estado, acao, enviando] = useActionState(salvarProduto, estadoInicial);

  // O preço vai para a tela como "99,00" — do jeito que ela escreveria.
  const precoInicial = produto
    ? (produto.precoCentavos / 100).toFixed(2).replace(".", ",")
    : "";

  return (
    <form action={acao} className="flex flex-col gap-5">
      {produto ? <input type="hidden" name="id" value={produto.id} /> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm">Nome da peça</span>
        <input
          type="text"
          name="nome"
          required
          defaultValue={produto?.nome}
          placeholder="Biquíni Asa Delta"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm">Preço</span>
        <input
          type="text"
          name="preco"
          required
          inputMode="decimal"
          defaultValue={precoInicial}
          placeholder="99,00"
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm">Descrição</span>
        <textarea
          name="descricao"
          rows={5}
          defaultValue={produto?.descricao}
          placeholder={
            "Parte de cima cortininha, com abertura para bojo\nCostura embutida e viés com elástico\nTecido suplex com proteção UV"
          }
          className={campo}
        />
        <span className="text-xs text-[var(--color-suave)]">
          Uma linha para cada característica. Elas viram lista na página da peça.
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={produto ? produto.ativo : true}
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-dourado)]"
        />
        <span className="text-sm">
          Aparecer na loja
          <span className="mt-0.5 block text-xs text-[var(--color-suave)]">
            Desmarque para esconder sem apagar a peça.
          </span>
        </span>
      </label>

      {estado.erro ? (
        <p role="alert" className="text-sm text-red-800">
          {estado.erro}
        </p>
      ) : null}

      <button type="submit" disabled={enviando} className={botaoPrincipal}>
        {enviando ? <Girando /> : null}
        {enviando
          ? "Salvando"
          : produto
            ? "Salvar alterações"
            : "Cadastrar peça"}
      </button>
    </form>
  );
}
