create table if not exists users(
  id bigserial primary key,
  email text unique not null,
  password_hash text not null,
  minecraft_uuid uuid unique,
  minecraft_username text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists player_stats(
  user_id bigint primary key references users(id) on delete cascade,
  rank_name text not null default 'default',
  money numeric(18,2) not null default 0,
  shards bigint not null default 0,
  kills bigint not null default 0,
  deaths bigint not null default 0,
  playtime_seconds bigint not null default 0,
  team_name text,
  updated_at timestamptz not null default now()
);
