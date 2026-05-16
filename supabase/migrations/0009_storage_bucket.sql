insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
    and policyname = 'videos_auth_upload'
  ) then
    execute $p$
      create policy "videos_auth_upload" on storage.objects
        for insert to authenticated
        with check (
          bucket_id = 'videos'
          and (storage.foldername(name))[1] = auth.uid()::text
        );
    $p$;
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
    and policyname = 'videos_public_read'
  ) then
    execute $p$
      create policy "videos_public_read" on storage.objects
        for select to public
        using (bucket_id = 'videos');
    $p$;
  end if;
end $$;
