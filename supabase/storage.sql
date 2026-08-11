-- ---------------------------------------------------------------------------
-- ONDE AS FOTOS FICAM GUARDADAS
--
-- Rode este arquivo UMA VEZ, no painel do Supabase:
--
--     SQL Editor  >  New query  >  cole tudo  >  Run
--
-- Ele não está junto das migrações do projeto de propósito. As migrações rodam
-- também no Postgres da sua máquina, e lá não existe o Storage do Supabase —
-- elas quebrariam. Isto aqui é configuração do serviço, não do nosso banco.
--
-- Rodar de novo não faz mal: tudo aqui é "se já existir, não faz nada".
-- ---------------------------------------------------------------------------


-- 1. O balde onde as imagens ficam.
--
-- `public = true` significa que QUEM TEM O ENDEREÇO consegue ver a imagem, sem
-- login. É o que precisamos: a cliente abre a página da peça e a foto aparece.
-- Não significa que qualquer um pode gravar — gravar é a regra nº 2 abaixo.
--
-- O limite de 8MB é a foto que sai do celular dela sem passar por edição. E a
-- lista de tipos recusa qualquer coisa que não seja imagem: sem isso, o campo
-- de foto vira um lugar para subir arquivo executável.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produtos',
  'produtos',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;


-- 2. Quem pode gravar, trocar e apagar: só quem está logado.
--
-- "authenticated" é qualquer pessoa com login válido no Supabase. Hoje isso é
-- só a vendedora — não existe cadastro de cliente neste projeto, e nem vai
-- existir. Se um dia existir, estas regras precisam ser revistas.
--
-- Repare que a checagem é feita PELO SUPABASE, não pelo nosso código. Mesmo que
-- alguém descubra o endereço da nossa API e tente subir arquivo por fora, sem
-- login válido o banco recusa.

drop policy if exists "vendedora envia fotos" on storage.objects;
create policy "vendedora envia fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produtos');

drop policy if exists "vendedora troca fotos" on storage.objects;
create policy "vendedora troca fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produtos');

drop policy if exists "vendedora apaga fotos" on storage.objects;
create policy "vendedora apaga fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produtos');


-- 3. Quem pode ver: qualquer um.
--
-- Necessário para a cliente enxergar a foto sem ter login nenhum.
drop policy if exists "qualquer um ve as fotos" on storage.objects;
create policy "qualquer um ve as fotos"
  on storage.objects for select
  to public
  using (bucket_id = 'produtos');


-- ---------------------------------------------------------------------------
-- Para conferir se deu certo, rode depois:
--
--   select id, public, file_size_limit from storage.buckets where id = 'produtos';
--   select policyname from pg_policies where tablename = 'objects';
-- ---------------------------------------------------------------------------
