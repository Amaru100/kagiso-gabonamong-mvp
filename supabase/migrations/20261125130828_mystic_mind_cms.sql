begin;

create table public.mystic_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin', 'content_admin'))
);
create table public.mystic_content (
  id integer primary key check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  revision uuid not null default gen_random_uuid()
);
create table public.mystic_activity (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);
create table public.mystic_enquiries (
  id uuid primary key,
  type text not null check (type in ('contact','service')),
  category text,
  name text not null check (length(name) between 1 and 120),
  email text not null check (length(email) between 3 and 254),
  subject text not null check (length(subject) between 1 and 200),
  message text not null check (length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now(),
  check ((type = 'contact' and category is null) or (type = 'service' and category is not null and category in ('Seminars','Webinars','Corporate talks','Workshops','One-on-one advisory/coaching')))
);
create table public.mystic_enquiry_rate (
  fingerprint text not null,
  attempted_at timestamptz not null default now()
);
create index mystic_enquiry_rate_window on public.mystic_enquiry_rate (fingerprint, attempted_at);
create index mystic_enquiry_rate_expiry on public.mystic_enquiry_rate (attempted_at);
create index mystic_enquiries_recent on public.mystic_enquiries (created_at desc);

alter table public.mystic_admins enable row level security;
alter table public.mystic_content enable row level security;
alter table public.mystic_activity enable row level security;
alter table public.mystic_enquiries enable row level security;
alter table public.mystic_enquiry_rate enable row level security;
revoke all on public.mystic_admins, public.mystic_content, public.mystic_activity, public.mystic_enquiries, public.mystic_enquiry_rate from public, anon, authenticated;
grant select, insert, update, delete on public.mystic_admins to service_role;
grant select, insert, update on public.mystic_content to service_role;
grant select, insert on public.mystic_activity to service_role;
grant select, insert, update on public.mystic_enquiries to service_role;
grant select, insert, delete on public.mystic_enquiry_rate to service_role;

create function public.mystic_save_content(next_content jsonb, expected_revision uuid, editor uuid)
returns uuid language plpgsql set search_path = '' as $$
declare result uuid;
begin
  if not exists (select from public.mystic_admins where user_id = editor) then
    raise exception 'Administrator required' using errcode = '42501';
  end if;
  update public.mystic_content set content = next_content, revision = gen_random_uuid()
    where id = 1 and revision = expected_revision returning revision into result;
  if result is not null then
    insert into public.mystic_activity (actor, action, target) values (editor, 'content_saved', result::text);
  end if;
  return result;
end;
$$;

create function public.mystic_set_role(editor uuid, target_user uuid, next_role text)
returns void language plpgsql set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(1938216072::bigint);
  if editor = target_user or not exists (select from public.mystic_admins where user_id = editor and role = 'super_admin') then
    raise exception 'Super Admin required' using errcode = '42501';
  end if;
  if next_role = 'revoked' then
    delete from public.mystic_admins where user_id = target_user;
  else
    insert into public.mystic_admins(user_id, role) values (target_user, next_role)
    on conflict (user_id) do update set role = excluded.role;
  end if;
  insert into public.mystic_activity(actor,action,target) values (editor,'role_' || next_role,target_user::text);
end;
$$;

create function public.mystic_submit_enquiry(entry jsonb, fingerprint text)
returns text language plpgsql set search_path = '' as $$
declare submitted_id uuid := (entry->>'id')::uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(fingerprint, 0));
  if exists (select from public.mystic_enquiries as enquiry where enquiry.id = submitted_id
    and enquiry.type = entry->>'type' and enquiry.email = entry->>'email'
    and enquiry.name = entry->>'name' and enquiry.subject = entry->>'subject' and enquiry.message = entry->>'message'
    and enquiry.category is not distinct from entry->>'category') then
    return 'duplicate';
  end if;
  if (select count(*) from public.mystic_enquiry_rate as rate
    where rate.fingerprint = mystic_submit_enquiry.fingerprint and rate.attempted_at > now() - interval '15 minutes') >= 5 then
    return 'limited';
  end if;
  delete from public.mystic_enquiry_rate where attempted_at < now() - interval '15 minutes';
  insert into public.mystic_enquiry_rate(fingerprint) values (mystic_submit_enquiry.fingerprint);
  insert into public.mystic_enquiries(id,type,category,name,email,subject,message)
  values(submitted_id,entry->>'type',entry->>'category',entry->>'name',entry->>'email',entry->>'subject',entry->>'message');
  return 'saved';
end;
$$;

revoke execute on function public.mystic_save_content(jsonb,uuid,uuid), public.mystic_set_role(uuid,uuid,text), public.mystic_submit_enquiry(jsonb,text) from public, anon, authenticated;
grant execute on function public.mystic_save_content(jsonb,uuid,uuid), public.mystic_set_role(uuid,uuid,text), public.mystic_submit_enquiry(jsonb,text) to service_role;

create table public.mystic_media (
  path text primary key,
  url text not null unique,
  type text not null,
  name text not null,
  alt text not null default '',
  actor uuid,
  created_at timestamptz not null default now()
);
alter table public.mystic_media enable row level security;
revoke all on public.mystic_media from public, anon, authenticated;
grant select, insert on public.mystic_media to service_role;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('mystic-media','mystic-media',false,3000000,array['application/pdf','image/png','image/jpeg','image/webp']);

commit;
