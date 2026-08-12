"use server";

import { redirect } from "next/navigation";

import { criarClienteSupabase } from "@/lib/supabase/servidor";

/**
 * Entrar e criar conta.
 *
 * A senha vai do formulário direto para o servidor e daqui para o Supabase.
 * Ela nunca passa por código nosso rodando no navegador, e nunca é gravada em
 * lugar nenhum do nosso banco — quem guarda senha é o Supabase, com o cuidado
 * que isso exige.
 */

// Só tipos e funções assíncronas podem sair de um arquivo "use server" — todo
// export daqui vira um endereço que o navegador pode chamar, e um objeto não é
// chamável. O estado inicial do formulário mora na tela, junto de quem o usa.
export type EstadoConta = { erro: string | null; aviso: string | null };

/**
 * Só aceita voltar para dentro da própria loja.
 *
 * O endereço de volta chega pela barra do navegador, então é digitável por
 * qualquer pessoa. Sem esta checagem, um link montado com "?voltar=" apontando
 * para fora mandaria a cliente para outro site logo depois de ela digitar a
 * senha — que é o momento em que ela está mais disposta a confiar no que
 * aparece.
 */
function destinoSeguro(bruto: string | null): string {
  if (!bruto) return "/conta";
  if (!bruto.startsWith("/")) return "/conta";
  // "//outro-site.com" também é endereço de fora, e começa com barra.
  if (bruto.startsWith("//")) return "/conta";
  return bruto;
}

export async function entrarNaConta(
  _anterior: EstadoConta,
  formData: FormData,
): Promise<EstadoConta> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const destino = destinoSeguro(String(formData.get("voltar") ?? ""));

  if (!email || !senha) {
    return { erro: "Preencha o e-mail e a senha.", aviso: null };
  }

  const supabase = await criarClienteSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    // Genérica de propósito: dizer "este e-mail não existe" entrega para quem
    // está tentando adivinhar qual e-mail está cadastrado na loja.
    return { erro: "E-mail ou senha incorretos.", aviso: null };
  }

  redirect(destino);
}

export async function criarConta(
  _anterior: EstadoConta,
  formData: FormData,
): Promise<EstadoConta> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const destino = destinoSeguro(String(formData.get("voltar") ?? ""));

  if (!nome) return { erro: "Como podemos te chamar?", aviso: null };
  if (!email) return { erro: "Escreva seu e-mail.", aviso: null };

  // O Supabase recusa senha curta, mas a mensagem dele vem em inglês.
  if (senha.length < 6) {
    return { erro: "A senha precisa ter pelo menos 6 letras.", aviso: null };
  }

  const supabase = await criarClienteSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    // Fica junto do login, no Supabase. É o que a loja usa para chamar a
    // cliente pelo nome sem precisar de tabela nossa para isso.
    options: { data: { nome } },
  });

  if (error) {
    const jaExiste =
      error.message.toLowerCase().includes("already") ||
      error.code === "user_already_exists";

    return {
      erro: jaExiste
        ? "Já existe uma conta com esse e-mail. Tente entrar."
        : "Não consegui criar a conta agora. Tente de novo.",
      aviso: null,
    };
  }

  /*
    Quando a confirmação por e-mail está ligada no Supabase, o cadastro é
    aceito mas nenhuma sessão é criada — a pessoa ainda não entrou. Sem este
    aviso, a tela pareceria ter dado certo e ela ficaria sem entender por que
    continua deslogada.
  */
  if (!data.session) {
    return {
      erro: null,
      aviso: "Conta criada. Confirme pelo link que enviamos no seu e-mail.",
    };
  }

  redirect(destino);
}

export async function sair() {
  const supabase = await criarClienteSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
