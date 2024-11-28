-- supabase/migrations/001_initial.sql
create table incidents (
    id uuid default uuid_generate_v4() primary key,
    type text not null,
    coordinates float[] not null,
    description text,
    timestamp timestamptz not null
);

create table zones (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    geometry jsonb not null,
    description text,
    patrol_frequency float not null check (patrol_frequency >= 0 and patrol_frequency <= 1)
);

create table patrol_routes (
    id uuid default uuid_generate_v4() primary key,
    ranger_id uuid not null,
    coordinates float[][] not null,
    start_time timestamptz not null,
    end_time timestamptz
);