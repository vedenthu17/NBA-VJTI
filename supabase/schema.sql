-- NBA Accreditation Faculty Information System schema
-- Run this file in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  email text unique not null,
  role text not null check (role in ('admin', 'faculty', 'viewer')) default 'viewer',
  created_at timestamptz not null default now()
);

create table if not exists public.faculty (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  designation text not null,
  department text not null,
  email text not null,
  phone text not null,
  photo_url text,
  cv_url text,
  linkedin_url text,
  github_url text,
  google_scholar_url text,
  website_url text,
  research_area text,
  bio text,
  experience_teaching int default 0,
  experience_industry int default 0,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faculty add column if not exists linkedin_url text;
alter table public.faculty add column if not exists github_url text;
alter table public.faculty add column if not exists google_scholar_url text;
alter table public.faculty add column if not exists website_url text;
alter table public.faculty add column if not exists cv_url text;

create table if not exists public.qualifications (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  degree text not null,
  specialization text,
  institute text not null,
  year int,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  authors text,
  journal text,
  year int,
  doi text,
  type text,
  indexed text,
  reference_url text,
  pdf_url text,
  scopus boolean default false,
  wos boolean default false,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.publications add column if not exists reference_url text;
alter table public.publications add column if not exists pdf_url text;

create table if not exists public.fdp (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  role text,
  duration text,
  start_date date,
  end_date date,
  organized_by text,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  funding_agency text,
  amount numeric(12,2) default 0,
  year int,
  status text,
  reference_url text,
  pdf_url text,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists reference_url text;
alter table public.projects add column if not exists pdf_url text;

create table if not exists public.consultancy (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  company text,
  amount numeric(12,2) default 0,
  year int,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patents (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  status text,
  year int,
  number text,
  reference_url text,
  pdf_url text,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patents add column if not exists reference_url text;
alter table public.patents add column if not exists pdf_url text;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  publisher text,
  isbn text,
  year int,
  reference_url text,
  pdf_url text,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.books add column if not exists reference_url text;
alter table public.books add column if not exists pdf_url text;

create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  organization text,
  country text,
  role text,
  start_year int,
  end_year int,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.miscellaneous_items (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  description text,
  reference_url text,
  pdf_url text,
  custom_fields jsonb not null default '{}'::jsonb,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.miscellaneous_items add column if not exists description text;
alter table public.miscellaneous_items add column if not exists reference_url text;
alter table public.miscellaneous_items add column if not exists pdf_url text;
alter table public.miscellaneous_items add column if not exists custom_fields jsonb not null default '{}'::jsonb;

create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  membership text,
  honors text,
  contributions text,
  year int,
  description text,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.awards add column if not exists membership text;
alter table public.awards add column if not exists honors text;
alter table public.awards add column if not exists contributions text;
alter table public.awards add column if not exists description text;

create table if not exists public.moocs (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  course text not null,
  platform text,
  grade text,
  year int,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_proofs (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null references public.faculty(id) on delete cascade,
  title text not null,
  proof_url text not null,
  description text,
  year int,
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  table_name text not null,
  row_id uuid,
  action text not null,
  changed_by uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.latest_achievements (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid references public.faculty(id) on delete set null,
  title text not null,
  summary text,
  media_type text not null check (media_type in ('image', 'pdf', 'youtube', 'link')),
  media_url text not null,
  thumbnail_url text,
  display_order int not null default 0,
  is_published boolean not null default true,
  published_from timestamptz,
  published_to timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.audit_row_changes()
returns trigger as $$
begin
  insert into public.audit_log(table_name, row_id, action, changed_by, old_data, new_data)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    coalesce(new.updated_by, new.created_by, old.updated_by, old.created_by),
    to_jsonb(old),
    to_jsonb(new)
  );

  return coalesce(new, old);
end;
$$ language plpgsql;

create or replace procedure public.attach_triggers(target_table text)
language plpgsql
as $$
begin
  execute format('drop trigger if exists trg_set_updated_at on public.%I', target_table);
  execute format('drop trigger if exists trg_audit on public.%I', target_table);

  execute format('create trigger trg_set_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', target_table);
  execute format('create trigger trg_audit after insert or update or delete on public.%I for each row execute procedure public.audit_row_changes()', target_table);
end;
$$;

call public.attach_triggers('faculty');
call public.attach_triggers('qualifications');
call public.attach_triggers('publications');
call public.attach_triggers('fdp');
call public.attach_triggers('projects');
call public.attach_triggers('consultancy');
call public.attach_triggers('patents');
call public.attach_triggers('books');
call public.attach_triggers('collaborations');
call public.attach_triggers('awards');
call public.attach_triggers('moocs');
call public.attach_triggers('research_proofs');
call public.attach_triggers('miscellaneous_items');
call public.attach_triggers('notifications');
call public.attach_triggers('latest_achievements');

create index if not exists idx_faculty_is_approved on public.faculty(is_approved);
create index if not exists idx_publications_faculty on public.publications(faculty_id, is_approved);
create index if not exists idx_fdp_faculty on public.fdp(faculty_id, is_approved);
create index if not exists idx_projects_faculty on public.projects(faculty_id, is_approved);

alter table public.users enable row level security;
alter table public.faculty enable row level security;
alter table public.publications enable row level security;
alter table public.fdp enable row level security;
alter table public.projects enable row level security;
alter table public.consultancy enable row level security;
alter table public.patents enable row level security;
alter table public.books enable row level security;
alter table public.collaborations enable row level security;
alter table public.awards enable row level security;
alter table public.moocs enable row level security;
alter table public.qualifications enable row level security;
alter table public.research_proofs enable row level security;
alter table public.miscellaneous_items enable row level security;
alter table public.notifications enable row level security;
alter table public.latest_achievements enable row level security;

-- Public read only approved data
drop policy if exists faculty_public_read on public.faculty;
create policy faculty_public_read on public.faculty for select using (is_approved = true);

drop policy if exists publications_public_read on public.publications;
create policy publications_public_read on public.publications for select using (is_approved = true);

drop policy if exists fdp_public_read on public.fdp;
create policy fdp_public_read on public.fdp for select using (is_approved = true);

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (is_approved = true);

drop policy if exists consultancy_public_read on public.consultancy;
create policy consultancy_public_read on public.consultancy for select using (is_approved = true);

drop policy if exists patents_public_read on public.patents;
create policy patents_public_read on public.patents for select using (is_approved = true);

drop policy if exists books_public_read on public.books;
create policy books_public_read on public.books for select using (is_approved = true);

drop policy if exists collaborations_public_read on public.collaborations;
create policy collaborations_public_read on public.collaborations for select using (is_approved = true);

drop policy if exists awards_public_read on public.awards;
create policy awards_public_read on public.awards for select using (is_approved = true);

drop policy if exists moocs_public_read on public.moocs;
create policy moocs_public_read on public.moocs for select using (is_approved = true);

drop policy if exists qualifications_public_read on public.qualifications;
create policy qualifications_public_read on public.qualifications for select using (is_approved = true);

drop policy if exists research_proofs_public_read on public.research_proofs;
create policy research_proofs_public_read on public.research_proofs for select using (is_approved = true);

drop policy if exists miscellaneous_items_public_read on public.miscellaneous_items;
create policy miscellaneous_items_public_read on public.miscellaneous_items for select using (is_approved = true);

drop policy if exists latest_achievements_public_read on public.latest_achievements;
create policy latest_achievements_public_read on public.latest_achievements for select using (is_published = true);

-- Publishable-key backend mode policies.
-- These allow backend API writes with anon key; role safety is enforced in backend JWT middleware.
drop policy if exists users_anon_backend_all on public.users;
create policy users_anon_backend_all on public.users for all to anon using (true) with check (true);

drop policy if exists faculty_anon_backend_all on public.faculty;
create policy faculty_anon_backend_all on public.faculty for all to anon using (true) with check (true);

drop policy if exists qualifications_anon_backend_all on public.qualifications;
create policy qualifications_anon_backend_all on public.qualifications for all to anon using (true) with check (true);

drop policy if exists publications_anon_backend_all on public.publications;
create policy publications_anon_backend_all on public.publications for all to anon using (true) with check (true);

drop policy if exists fdp_anon_backend_all on public.fdp;
create policy fdp_anon_backend_all on public.fdp for all to anon using (true) with check (true);

drop policy if exists projects_anon_backend_all on public.projects;
create policy projects_anon_backend_all on public.projects for all to anon using (true) with check (true);

drop policy if exists consultancy_anon_backend_all on public.consultancy;
create policy consultancy_anon_backend_all on public.consultancy for all to anon using (true) with check (true);

drop policy if exists patents_anon_backend_all on public.patents;
create policy patents_anon_backend_all on public.patents for all to anon using (true) with check (true);

drop policy if exists books_anon_backend_all on public.books;
create policy books_anon_backend_all on public.books for all to anon using (true) with check (true);

drop policy if exists collaborations_anon_backend_all on public.collaborations;
create policy collaborations_anon_backend_all on public.collaborations for all to anon using (true) with check (true);

drop policy if exists awards_anon_backend_all on public.awards;
create policy awards_anon_backend_all on public.awards for all to anon using (true) with check (true);

drop policy if exists moocs_anon_backend_all on public.moocs;
create policy moocs_anon_backend_all on public.moocs for all to anon using (true) with check (true);

drop policy if exists research_proofs_anon_backend_all on public.research_proofs;
create policy research_proofs_anon_backend_all on public.research_proofs for all to anon using (true) with check (true);

drop policy if exists miscellaneous_items_anon_backend_all on public.miscellaneous_items;
create policy miscellaneous_items_anon_backend_all on public.miscellaneous_items for all to anon using (true) with check (true);

drop policy if exists notifications_anon_backend_all on public.notifications;
create policy notifications_anon_backend_all on public.notifications for all to anon using (true) with check (true);

drop policy if exists latest_achievements_anon_backend_all on public.latest_achievements;
create policy latest_achievements_anon_backend_all on public.latest_achievements for all to anon using (true) with check (true);

-- Storage buckets for faculty media
insert into storage.buckets (id, name, public)
values ('faculty-photos', 'faculty-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('faculty-cv', 'faculty-cv', false)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists faculty_photos_public_read on storage.objects;
create policy faculty_photos_public_read
on storage.objects
for select
using (bucket_id = 'faculty-photos');

drop policy if exists faculty_photos_auth_upload on storage.objects;
create policy faculty_photos_auth_upload
on storage.objects
for insert
to authenticated
with check (bucket_id = 'faculty-photos');

drop policy if exists faculty_photos_anon_backend_upload on storage.objects;
create policy faculty_photos_anon_backend_upload
on storage.objects
for insert
to anon
with check (bucket_id = 'faculty-photos');

drop policy if exists faculty_photos_auth_update on storage.objects;
create policy faculty_photos_auth_update
on storage.objects
for update
to authenticated
using (bucket_id = 'faculty-photos')
with check (bucket_id = 'faculty-photos');

drop policy if exists faculty_photos_anon_backend_update on storage.objects;
create policy faculty_photos_anon_backend_update
on storage.objects
for update
to anon
using (bucket_id = 'faculty-photos')
with check (bucket_id = 'faculty-photos');

drop policy if exists faculty_cv_owner_read on storage.objects;
create policy faculty_cv_owner_read
on storage.objects
for select
to authenticated
using (bucket_id = 'faculty-cv');

drop policy if exists faculty_cv_auth_upload on storage.objects;
create policy faculty_cv_auth_upload
on storage.objects
for insert
to authenticated
with check (bucket_id = 'faculty-cv');
