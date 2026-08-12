import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

/**
 * As duas fontes do site.
 *
 * A Playfair Display saiu daqui de propósito. Ela é tecnicamente boa, mas
 * virou a serifada padrão que toda ferramenta de IA escolhe quando o pedido é
 * "elegante" — e é justamente por isso que uma página com ela parece template
 * mesmo bem executada. A Zodiak tem contraste alto igual, com desenho próprio.
 *
 * A Satoshi substitui a Jost nos textos: grotesca neutra, bem desenhada, sem a
 * geometria datada da Jost em texto corrido.
 *
 * As duas são servidas do nosso próprio endereço. A página não espera servidor
 * de fora para desenhar o texto, e nada da cliente vai para terceiros.
 */
const fonteTitulo = localFont({
  src: [
    { path: "../fontes/zodiak-400.woff2", weight: "400", style: "normal" },
    { path: "../fontes/zodiak-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-titulo",
  display: "swap",
});

const fonteTexto = localFont({
  src: [
    { path: "../fontes/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../fontes/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../fontes/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paiva Swimwear",
  description: "Biquínis feitos para o seu verão.",
};

export const viewport: Viewport = {
  // A loja é pensada para o celular: a tela ocupa a largura do aparelho e a
  // cliente pode dar zoom na foto da peça se quiser ver o detalhe do tecido.
  width: "device-width",
  initialScale: 1,

  /*
    O fundo entra embaixo da barra de status e da ilha do iPhone.

    Sem isto, o iOS reserva essa faixa e pinta nela a cor do CORPO da página —
    que é o areia liso. Como a capa tem um degradê, aparecia uma emenda reta
    logo abaixo do relógio, com dois tons diferentes de creme.

    Com a tela inteira liberada, a capa vai até o topo do aparelho. Nada de
    conteúdo fica escondido: o miolo da capa é centralizado e sobra folga de
    sobra em cima.
  */
  viewportFit: "cover",

  /*
    A cor que o navegador do celular usa na faixa da barra de status.

    É o mesmo areia do corpo da página, de propósito: assim aquela faixa deixa
    de ser um retângulo de cor diferente por cima do site e passa a ser
    continuação dele.
  */
  themeColor: "#faf4ea",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTitulo.variable} ${fonteTexto.variable}`}
      /*
        O script logo abaixo acrescenta classes a este elemento ANTES de o
        React assumir a página. O React então compara o que veio do servidor
        com o que está na tela, encontra as classes a mais e reclama.

        Este aviso diz ao React para não comparar os atributos DESTE elemento —
        e só dele, não dos filhos. É a solução usada por qualquer site que
        precisa decidir tema ou animação antes da primeira pintura: sem isso, a
        alternativa seria esperar o React montar, e aí a abertura aconteceria
        fora da vista, que foi o problema que este script veio resolver.
      */
      suppressHydrationWarning
    >
      <body>
        {/*
          Marca o documento ANTES da primeira pintura.

          O estado escondido das animações depende da classe `js-pronto`. Se ela
          só chegasse depois que o React monta, o navegador já teria pintado o
          conteúdo inteiro — e a abertura aconteceria fora da vista, ou nem
          aconteceria. Era exatamente o que estava ocorrendo.

          Este script roda antes de o corpo da página ser desenhado, então a
          página já nasce no estado inicial da animação.

          As duas condições que ele respeita, iguais às do resto:
          - sem JavaScript, a classe nunca entra e nada fica escondido
          - com "reduzir movimento" ligado, idem — porque nesse caso o
            observador não roda, e sem ele o que fosse escondido ficaria assim
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-pronto','abrindo')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
