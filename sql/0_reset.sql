-- BanBan Database Reset
-- File: 0_reset.sql
-- This file drops all tables and triggers to start with a clean database

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS after_vote_insert_update ON public.votes;
DROP TRIGGER IF EXISTS update_stats_after_vote ON public.votes;
DROP TRIGGER IF EXISTS update_stats_after_comment ON public.comments;
DROP TRIGGER IF EXISTS refresh_stats_after_vote ON public.votes;
DROP TRIGGER IF EXISTS refresh_stats_after_comment ON public.comments;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS handle_user_update CASCADE;
DROP FUNCTION IF EXISTS count_poll_votes CASCADE;
DROP FUNCTION IF EXISTS update_poll_stats CASCADE;
DROP FUNCTION IF EXISTS refresh_poll_stats CASCADE;

-- Drop tables in correct order
DROP TABLE IF EXISTS public.poll_stats;
DROP TABLE IF EXISTS public.comment_reactions;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.votes;
DROP TABLE IF EXISTS public.poll_options;
DROP TABLE IF EXISTS public.polls;
DROP TABLE IF EXISTS public.users;

-- Confirm drop
SELECT 'All BanBan tables have been dropped. Ready for fresh installation.' as status;