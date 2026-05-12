-- Allow authenticated users to insert topic tags for their own videos
create policy "video_tickers_insert_own" on public.video_tickers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.videos
      where id = video_tickers.video_id
      and creator_id = auth.uid()
    )
  );

-- Allow public read of video_tickers
create policy "video_tickers_select_public" on public.video_tickers
  for select to public
  using (true);

-- Allow owners to delete their own video tags
create policy "video_tickers_delete_own" on public.video_tickers
  for delete to authenticated
  using (
    exists (
      select 1 from public.videos
      where id = video_tickers.video_id
      and creator_id = auth.uid()
    )
  );
