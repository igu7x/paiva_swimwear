"use server";

import { redirect } from "next/navigation";

import { criarClienteSupabase } from "@/lib/supabase/servidor";

/** Encerra a sessão da vendedora e volta para a tela de login. */
export async function sair() {
  const supabase = await criarClienteSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
