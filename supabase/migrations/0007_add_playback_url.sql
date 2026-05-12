alter table public.videos
  add column if not exists playback_url text;

alter table public.videos
  add column if not exists storage_path text;
