"use server";

import { redirect } from "next/navigation";

import { criarClienteSupabase } from "@/lib/supabase/servidor";

export type EstadoLogin = { erro: string | null };

/**
 * Faz o login da vendedora.
 *
 * "use server" no topo do arquivo significa que esta função roda no servidor,
 * mesmo sendo chamada por um formulário na tela. A senha vai direto do
 * formulário para o servidor; ela nunca passa por código JavaScript do
 * navegador que a gente tenha escrito.
 */
export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha." };
  }

  const supabase = await criarClienteSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Mensagem genérica de propósito: dizer "esse e-mail não existe" entrega
    // para quem está tentando adivinhar qual e-mail é o certo.
    return { erro: "E-mail ou senha incorretos." };
  }

  // O redirect funciona lançando um erro que o Next.js entende. Por isso ele
  // fica fora de qualquer try/catch — senão seria engolido como se fosse falha.
  redirect("/admin");
}
