import { ViewTransition } from "react";

/**
 * Anima a troca entre as telas do painel.
 *
 * Envolve o conteúdo de CADA tela — e não o layout. Layout não é recriado ao
 * navegar, então uma animação de entrada e saída ali nunca dispararia.
 *
 * Os nomes "ida" e "volta" vêm do `transitionTypes` de cada link. O
 * `default: "none"` faz o resto não animar: voltar pelo botão do navegador,
 * recarregar, atualizar dados na mesma tela. Sem isso, qualquer mudança na
 * página dispararia um deslize, e a tela viveria escorregando.
 */
export function Transicao({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ ida: "ida", volta: "volta", default: "none" }}
      exit={{ ida: "ida", volta: "volta", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
