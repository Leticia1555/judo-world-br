/* =====================================================
   JUDÔ WORLD BR
   BANCO DE DADOS - SUPABASE
   PostgreSQL

   SENHAS:
   As senhas NÃO são armazenadas nesta tabela.
   O Supabase Auth é responsável por armazená-las
   com segurança.

   CONFIRMAR SENHA:
   É usada somente no cadastro para validação.
===================================================== */


/* =====================================================
   EXTENSÃO UUID
===================================================== */

create extension if not exists pgcrypto;


/* =====================================================
   USUÁRIOS
===================================================== */

create table if not exists public.usuarios (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    nome text not null,

    email text not null unique,

    telefone text default '',

    tipo text not null default 'aluno'
        check (
            tipo in (
                'aluno',
                'vendedor'
            )
        ),

    /* Faixa do aluno */
    faixa text default '',

    criado_em timestamptz
        not null default now(),

    atualizado_em timestamptz
        not null default now()
);


/* =====================================================
   LOJAS
===================================================== */

create table if not exists public.lojas (

    id uuid primary key
        default gen_random_uuid(),

    vendedor_id uuid not null unique

        references public.usuarios(id)
        on delete cascade,

    nome text not null,

    descricao text default '',

    logo text,

    /* Categoria principal da loja */
    categoria text default '',

    criado_em timestamptz
        not null default now(),

    atualizado_em timestamptz
        not null default now()
        ALTER TABLE public.lojas
ADD COLUMN IF NOT EXISTS categoria text;
);


/* =====================================================
   PRODUTOS
===================================================== */

create table if not exists public.produtos (

    id uuid primary key
        default gen_random_uuid(),

    loja_id uuid not null

        references public.lojas(id)
        on delete cascade,

    nome text not null,

    descricao text default '',

    categoria text not null default '',

    preco numeric(10,2) not null
        check (preco >= 0),

    imagem text,

    estoque integer not null default 0
        check (estoque >= 0),

    ativo boolean not null default true,

    criado_em timestamptz
        not null default now(),

    atualizado_em timestamptz
        not null default now()
);


/* =====================================================
   PEDIDOS
===================================================== */

create table if not exists public.pedidos (

    id uuid primary key
        default gen_random_uuid(),

    usuario_id uuid not null

        references public.usuarios(id)
        on delete restrict,

    total numeric(10,2) not null default 0
        check (total >= 0),

    status text not null default 'pendente'

        check (
            status in (
                'pendente',
                'pago',
                'enviado',
                'entregue',
                'cancelado'
            )
        ),

    criado_em timestamptz
        not null default now()
);


/* =====================================================
   ITENS DO PEDIDO
===================================================== */

create table if not exists public.itens_pedido (

    id uuid primary key
        default gen_random_uuid(),

    pedido_id uuid not null

        references public.pedidos(id)
        on delete cascade,

    produto_id uuid not null

        references public.produtos(id)
        on delete restrict,

    quantidade integer not null
        check (quantidade > 0),

    preco numeric(10,2) not null
        check (preco >= 0)
);


/* =====================================================
   ÍNDICES
===================================================== */

create index if not exists idx_produtos_loja
on public.produtos(loja_id);

create index if not exists idx_produtos_ativo
on public.produtos(ativo);

create index if not exists idx_produtos_categoria
on public.produtos(categoria);

create index if not exists idx_pedidos_usuario
on public.pedidos(usuario_id);

create index if not exists idx_itens_pedido
on public.itens_pedido(pedido_id);


/* =====================================================
   ROW LEVEL SECURITY
===================================================== */

alter table public.usuarios
enable row level security;

alter table public.lojas
enable row level security;

alter table public.produtos
enable row level security;

alter table public.pedidos
enable row level security;

alter table public.itens_pedido
enable row level security;


/* =====================================================
   USUÁRIOS
===================================================== */


/* Ver próprio perfil */

drop policy if exists
"usuario pode ver seu perfil"
on public.usuarios;

create policy
"usuario pode ver seu perfil"

on public.usuarios

for select

to authenticated

using (
    id = auth.uid()
);


/* Atualizar próprio perfil */

drop policy if exists
"usuario pode atualizar seu perfil"
on public.usuarios;

create policy
"usuario pode atualizar seu perfil"

on public.usuarios

for update

to authenticated

using (
    id = auth.uid()
)

with check (
    id = auth.uid()
);


/* =====================================================
   LOJAS
===================================================== */


/* Todos os usuários logados podem visualizar lojas */

drop policy if exists
"todos podem ver lojas"
on public.lojas;

create policy
"todos podem ver lojas"

on public.lojas

for select

to authenticated

using (
    true
);


/* Vendedor pode criar a própria loja */

drop policy if exists
"vendedor pode criar sua loja"
on public.lojas;

create policy
"vendedor pode criar sua loja"

on public.lojas

for insert

to authenticated

with check (

    vendedor_id = auth.uid()

    and exists (

        select 1

        from public.usuarios

        where usuarios.id = auth.uid()

        and usuarios.tipo = 'vendedor'

    )
);


/* Vendedor pode editar sua loja */

drop policy if exists
"vendedor pode editar sua loja"
on public.lojas;

create policy
"vendedor pode editar sua loja"

on public.lojas

for update

to authenticated

using (
    vendedor_id = auth.uid()
)

with check (
    vendedor_id = auth.uid()
);


/* Vendedor pode excluir sua loja */

drop policy if exists
"vendedor pode excluir sua loja"
on public.lojas;

create policy
"vendedor pode excluir sua loja"

on public.lojas

for delete

to authenticated

using (
    vendedor_id = auth.uid()
);


/* =====================================================
   PRODUTOS
===================================================== */


/* Usuários podem visualizar produtos ativos */

drop policy if exists
"todos podem ver produtos ativos"
on public.produtos;

create policy
"todos podem ver produtos ativos"

on public.produtos

for select

to authenticated

using (

    ativo = true

    or exists (

        select 1

        from public.lojas

        where lojas.id = produtos.loja_id

        and lojas.vendedor_id = auth.uid()

    )
);


/* Vendedor pode criar produto na própria loja */

drop policy if exists
"vendedor pode criar produtos"
on public.produtos;

create policy
"vendedor pode criar produtos"

on public.produtos

for insert

to authenticated

with check (

    exists (

        select 1

        from public.lojas

        where lojas.id = produtos.loja_id

        and lojas.vendedor_id = auth.uid()

    )
);


/* Vendedor pode editar produtos */

drop policy if exists
"vendedor pode editar produtos"
on public.produtos;

create policy
"vendedor pode editar produtos"

on public.produtos

for update

to authenticated

using (

    exists (

        select 1

        from public.lojas

        where lojas.id = produtos.loja_id

        and lojas.vendedor_id = auth.uid()

    )
)

with check (

    exists (

        select 1

        from public.lojas

        where lojas.id = produtos.loja_id

        and lojas.vendedor_id = auth.uid()

    )
);


/* Vendedor pode excluir produtos */

drop policy if exists
"vendedor pode excluir produtos"
on public.produtos;

create policy
"vendedor pode excluir produtos"

on public.produtos

for delete

to authenticated

using (

    exists (

        select 1

        from public.lojas

        where lojas.id = produtos.loja_id

        and lojas.vendedor_id = auth.uid()

    )
);


/* =====================================================
   PEDIDOS
===================================================== */


/* Usuário vê somente seus pedidos */

drop policy if exists
"usuario pode ver seus pedidos"
on public.pedidos;

create policy
"usuario pode ver seus pedidos"

on public.pedidos

for select

to authenticated

using (
    usuario_id = auth.uid()
);


/* Usuário pode criar seu próprio pedido */

drop policy if exists
"usuario pode criar pedidos"
on public.pedidos;

create policy
"usuario pode criar pedidos"

on public.pedidos

for insert

to authenticated

with check (
    usuario_id = auth.uid()
);


/* =====================================================
   ITENS DO PEDIDO
===================================================== */


/* Usuário vê itens dos próprios pedidos */

drop policy if exists
"usuario pode ver itens dos seus pedidos"
on public.itens_pedido;

create policy
"usuario pode ver itens dos seus pedidos"

on public.itens_pedido

for select

to authenticated

using (

    exists (

        select 1

        from public.pedidos

        where pedidos.id =
              itens_pedido.pedido_id

        and pedidos.usuario_id =
            auth.uid()

    )
);


/* =====================================================
   FUNÇÃO - CRIAR PERFIL AUTOMATICAMENTE
===================================================== */

create or replace function
public.criar_perfil_usuario()

returns trigger

language plpgsql

security definer

set search_path = public

as $$

begin

    insert into public.usuarios (

        id,
        nome,
        email,
        telefone,
        tipo,
        faixa

    )

    values (

        new.id,

        coalesce(
            new.raw_user_meta_data->>'nome',
            'Usuário'
        ),

        new.email,

        coalesce(
            new.raw_user_meta_data->>'telefone',
            ''
        ),

        coalesce(
            new.raw_user_meta_data->>'tipo',
            'aluno'
        ),

        coalesce(
            new.raw_user_meta_data->>'faixa',
            ''
        )

    )

    on conflict (id)
    do nothing;

    return new;

end;

$$;


/* =====================================================
   TRIGGER
===================================================== */

drop trigger if exists
trigger_criar_perfil
on auth.users;


create trigger
trigger_criar_perfil

after insert on auth.users

for each row

execute function
public.criar_perfil_usuario();


/* =====================================================
   FINAL
=====================================================

   ALUNO

   Nome
   Email
   Telefone
   Faixa
   Senha → Supabase Auth
   Confirmar senha → somente formulário


   VENDEDOR

   Nome
   Email
   Telefone
   Nome da loja
   Categoria de produtos
   Senha → Supabase Auth
   Confirmar senha → somente formulário


   VENDEDOR PODE:

   ✓ Criar loja
   ✓ Editar loja
   ✓ Excluir loja
   ✓ Criar produtos
   ✓ Editar produtos
   ✓ Excluir produtos


   ALUNO PODE:

   ✓ Ver lojas
   ✓ Ver produtos
   ✓ Pesquisar produtos
   ✓ Comprar produtos
   ✓ Criar pedidos


===================================================== */
/* =====================================================
   CAMPOS EXTRAS DOS USUÁRIOS
===================================================== */

ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS telefone text DEFAULT '';

ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS faixa text DEFAULT '';


/* =====================================================
   CAMPOS EXTRAS DAS LOJAS
===================================================== */

ALTER TABLE public.lojas
ADD COLUMN IF NOT EXISTS categoria text DEFAULT '';
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS telefone text;

ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS faixa text;