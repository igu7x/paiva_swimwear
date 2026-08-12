"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CHAVE_CARRINHO,
  chaveDoItem,
  lerCarrinho,
  totalDePecas,
  type ItemDoCarrinho,
} from "@/lib/carrinho";

/**
 * O CARRINHO, DISPONÍVEL EM QUALQUER TELA DA LOJA.
 *
 * Ele vive no armazenamento do navegador — ver src/lib/carrinho.ts para o
 * porquê. Este arquivo é a única porta de entrada: nenhuma tela fala com o
 * localStorage direto.
 *
 * NÃO EXISTE PROVEDOR ENVOLVENDO O SITE, e isso é de propósito. O carrinho não
 * é estado do React: ele já existe fora dele, no navegador. O React só precisa
 * ficar sabendo quando ele muda.
 *
 * `useSyncExternalStore` é exatamente a ferramenta para isso — a mesma que o
 * React usa por dentro para acompanhar coisas de fora dele. As vantagens em
 * relação a guardar tudo num contexto:
 *
 *   - a leitura do armazenamento acontece uma vez, não uma por tela
 *   - não precisa envolver o site num componente de tela
 *   - duas abas abertas continuam combinando entre si
 *
 * SOBRE A PRIMEIRA PINTURA: o servidor desenha a página sem saber o que tem no
 * carrinho — ele não tem acesso ao navegador da cliente. Por isso o retrato do
 * servidor é sempre "vazio e não sei ainda" (`pronto: false`), e quem mostra
 * contagem não mostra nada até saber. É um piscar de olhos, e é honesto.
 */

type Retrato = { itens: ItemDoCarrinho[]; pronto: boolean };

const VAZIO: Retrato = { itens: [], pronto: false };

/*
  O retrato precisa ser SEMPRE O MESMO OBJETO enquanto nada mudar. Se ele fosse
  montado a cada leitura, o React veria um objeto novo toda vez, concluiria que
  o carrinho mudou e redesenharia sem parar.
*/
let retrato: Retrato = VAZIO;
const ouvintes = new Set<() => void>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function carregar() {
  retrato = {
    itens: lerCarrinho(window.localStorage.getItem(CHAVE_CARRINHO)),
    pronto: true,
  };
}

/*
  Duas abas na mesma loja acontece: ela manda o link para a amiga, a amiga abre,
  volta, abre de novo. O evento `storage` avisa esta aba quando a outra mexeu.
*/
function aoMudarNoutraAba(evento: StorageEvent) {
  if (evento.key !== CHAVE_CARRINHO) return;
  retrato = { itens: lerCarrinho(evento.newValue), pronto: true };
  avisar();
}

function assinar(ouvinte: () => void) {
  // A primeira assinatura é o momento em que o navegador com certeza existe.
  if (!retrato.pronto) {
    carregar();
    window.addEventListener("storage", aoMudarNoutraAba);
  }

  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

const instantaneo = () => retrato;
const instantaneoNoServidor = () => VAZIO;

function gravar(novos: ItemDoCarrinho[]) {
  retrato = { itens: novos, pronto: true };

  try {
    window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(novos));
  } catch {
    // Navegador anônimo com armazenamento bloqueado. A sacola continua
    // funcionando nesta visita, só não sobrevive a um F5 — melhor do que a
    // loja inteira parar de responder.
  }

  avisar();
}

export function useCarrinho() {
  const { itens, pronto } = useSyncExternalStore(
    assinar,
    instantaneo,
    instantaneoNoServidor,
  );

  const acrescentar = useCallback((item: ItemDoCarrinho) => {
    const chave = chaveDoItem(item);
    const atual = retrato.itens;
    const existente = atual.find((i) => chaveDoItem(i) === chave);

    // Mesma peça, mesma cor, mesmo tamanho: soma na linha que já existe em vez
    // de criar uma segunda igual.
    gravar(
      existente
        ? atual.map((i) =>
            chaveDoItem(i) === chave
              ? { ...i, quantidade: Math.min(i.quantidade + item.quantidade, 99) }
              : i,
          )
        : [...atual, item],
    );
  }, []);

  const mudarQuantidade = useCallback(
    (
      item: { produtoId: number; variacaoId: number; tamanho: string },
      quantidade: number,
    ) => {
      const chave = chaveDoItem(item);
      const atual = retrato.itens;

      gravar(
        quantidade <= 0
          ? atual.filter((i) => chaveDoItem(i) !== chave)
          : atual.map((i) =>
              chaveDoItem(i) === chave
                ? { ...i, quantidade: Math.min(quantidade, 99) }
                : i,
            ),
      );
    },
    [],
  );

  const remover = useCallback(
    (item: { produtoId: number; variacaoId: number; tamanho: string }) => {
      const chave = chaveDoItem(item);
      gravar(retrato.itens.filter((i) => chaveDoItem(i) !== chave));
    },
    [],
  );

  const esvaziar = useCallback(() => gravar([]), []);

  return {
    itens,
    pronto,
    total: totalDePecas(itens),
    acrescentar,
    mudarQuantidade,
    remover,
    esvaziar,
  };
}
