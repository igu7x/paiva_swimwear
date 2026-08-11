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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteTitulo.variable} ${fonteTexto.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
