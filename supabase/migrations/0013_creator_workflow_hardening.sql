-- 0013_creator_workflow_hardening.sql
-- Fix video_tickers public exposure and move community counters to DB triggers.

-- Remove overly permissive policy introduced in 0010.
drop policy if exists "video_tickers_select_public" on public.video_tickers;

-- Re-create canonical select policy so public reads are limited to public-ready videos.
drop policy if exists "video_tickers_select" on public.video_tickers;
create policy "video_tickers_select"
on public.video_tickers for select
using (
  exists (
    select 1
    from public.videos v
    where v.id = video_tickers.video_id
      and (
        (v.status = 'ready' and v.visibility = 'public')
        or v.creator_id = auth.uid()
      )
  )
);

create or replace function public.sync_community_post_vote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set upvote_count = (
      select count(*)::int
      from public.community_post_votes
      where post_id = new.post_id
    )
    where id = new.post_id;
    return new;
  end if;

  update public.community_posts
  set upvote_count = (
    select count(*)::int
    from public.community_post_votes
    where post_id = old.post_id
  )
  where id = old.post_id;
  return old;
end;
$$;

create or replace function public.sync_community_post_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set save_count = (
      select count(*)::int
      from public.community_post_saves
      where post_id = new.post_id
    )
    where id = new.post_id;
    return new;
  end if;

  update public.community_posts
  set save_count = (
    select count(*)::int
    from public.community_post_saves
    where post_id = old.post_id
  )
  where id = old.post_id;
  return old;
end;
$$;

create or replace function public.sync_community_comment_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set comment_count = (
      select count(*)::int
      from public.community_comments
      where post_id = new.post_id
    )
    where id = new.post_id;

    if new.parent_id is not null then
      update public.community_comments
      set reply_count = (
        select count(*)::int
        from public.community_comments
        where parent_id = new.parent_id
      )
      where id = new.parent_id;
    end if;
    return new;
  end if;

  update public.community_posts
  set comment_count = (
    select count(*)::int
    from public.community_comments
    where post_id = old.post_id
  )
  where id = old.post_id;

  if old.parent_id is not null then
    update public.community_comments
    set reply_count = (
      select count(*)::int
      from public.community_comments
      where parent_id = old.parent_id
    )
    where id = old.parent_id;
  end if;
  return old;
end;
$$;

create or replace function public.sync_community_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_comments
    set like_count = (
      select count(*)::int
      from public.community_comment_likes
      where comment_id = new.comment_id
    )
    where id = new.comment_id;
    return new;
  end if;

  update public.community_comments
  set like_count = (
    select count(*)::int
    from public.community_comment_likes
    where comment_id = old.comment_id
  )
  where id = old.comment_id;
  return old;
end;
$$;

drop trigger if exists sync_community_post_vote_count_insert on public.community_post_votes;
drop trigger if exists sync_community_post_vote_count_delete on public.community_post_votes;
create trigger sync_community_post_vote_count_insert
after insert on public.community_post_votes
for each row execute function public.sync_community_post_vote_count();
create trigger sync_community_post_vote_count_delete
after delete on public.community_post_votes
for each row execute function public.sync_community_post_vote_count();

drop trigger if exists sync_community_post_save_count_insert on public.community_post_saves;
drop trigger if exists sync_community_post_save_count_delete on public.community_post_saves;
create trigger sync_community_post_save_count_insert
after insert on public.community_post_saves
for each row execute function public.sync_community_post_save_count();
create trigger sync_community_post_save_count_delete
after delete on public.community_post_saves
for each row execute function public.sync_community_post_save_count();

drop trigger if exists sync_community_comment_counts_insert on public.community_comments;
drop trigger if exists sync_community_comment_counts_delete on public.community_comments;
create trigger sync_community_comment_counts_insert
after insert on public.community_comments
for each row execute function public.sync_community_comment_counts();
create trigger sync_community_comment_counts_delete
after delete on public.community_comments
for each row execute function public.sync_community_comment_counts();

drop trigger if exists sync_community_comment_like_count_insert on public.community_comment_likes;
drop trigger if exists sync_community_comment_like_count_delete on public.community_comment_likes;
create trigger sync_community_comment_like_count_insert
after insert on public.community_comment_likes
for each row execute function public.sync_community_comment_like_count();
create trigger sync_community_comment_like_count_delete
after delete on public.community_comment_likes
for each row execute function public.sync_community_comment_like_count();

-- Backfill counters to match current rows.
update public.community_posts cp
set upvote_count = (
  select count(*)::int
  from public.community_post_votes cpv
  where cpv.post_id = cp.id
);

update public.community_posts cp
set save_count = (
  select count(*)::int
  from public.community_post_saves cps
  where cps.post_id = cp.id
);

update public.community_posts cp
set comment_count = (
  select count(*)::int
  from public.community_comments cc
  where cc.post_id = cp.id
);

update public.community_comments cc
set reply_count = (
  select count(*)::int
  from public.community_comments child
  where child.parent_id = cc.id
);

update public.community_comments cc
set like_count = (
  select count(*)::int
  from public.community_comment_likes ccl
  where ccl.comment_id = cc.id
);
