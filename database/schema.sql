create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  plan text not null default 'Free',
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  attachment jsonb,
  created_at timestamptz not null default now()
);

create index conversations_user_id_idx on public.conversations(user_id);
create index messages_conversation_id_idx on public.messages(conversation_id);
