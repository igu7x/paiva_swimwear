import type { Metadata, Viewport } from "next";

import "./globals.css";

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
