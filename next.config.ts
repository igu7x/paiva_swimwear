import type { NextConfig } from "next";

/**
 * O endereço do Supabase sai da variável de ambiente em vez de estar escrito
 * aqui. Se um dia o projeto mudar, muda num lugar só — e o mesmo arquivo serve
 * para a sua máquina e para a Vercel.
 */
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Sem esta lista, o Next recusa otimizar imagem que venha de fora do nosso
    // domínio. É uma trava proposital: sem ela, qualquer um poderia usar o
    // nosso servidor para redimensionar as imagens dele às nossas custas.
    remotePatterns: supabase
      ? [
          {
            protocol: "https",
            hostname: new URL(supabase).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
