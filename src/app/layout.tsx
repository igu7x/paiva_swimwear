import type { Metadata, Viewport } from "next";
import { Jost, Playfair_Display } from "next/font/google";

import "./globals.css";

/**
 * As duas fontes da marca.
 *
 * A Playfair Display é serifada de contraste alto, o desenho mais próximo do
 * "PAIVA" da logo. A Jost é geométrica e aceita bem o espaçamento largo do
 * "SWIMWEAR".
 *
 * O next/font baixa as duas na hora de compilar e serve do nosso próprio
 * endereço. Isso importa por dois motivos: a página não fica esperando um
 * servidor de fora para desenhar o texto, e nenhum dado da cliente é enviado
 * para o Google quando ela abre a loja.
 */
const fonteTitulo = Playfair_Display({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

const fonteTexto = Jost({
  subsets: ["latin"],
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
