-- BanBan Triggers and Functions
-- File: 2_triggers.sql
-- This file contains all triggers and functions for BanBan application

-- =============================================
-- Poll Triggers
-- =============================================

-- First, drop any existing functions and triggers to avoid conflicts
DROP TRIGGER IF EXISTS after_vote_insert_update ON public.votes;
DROP TRIGGER IF EXISTS update_stats_after_vote ON public.votes;
DROP TRIGGER IF EXISTS update_stats_after_comment ON public.comments;
DROP TRIGGER IF EXISTS refresh_stats_after_vote ON public.votes;
DROP TRIGGER IF EXISTS refresh_stats_after_comment ON public.comments;

DROP FUNCTION IF EXISTS count_poll_votes CASCADE;
DROP FUNCTION IF EXISTS update_poll_stats CASCADE;
DROP FUNCTION IF EXISTS refresh_poll_stats CASCADE;

-- Vote Counting Function
CREATE OR REPLACE FUNCTION count_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts and notify subscribers of real-time changes
  PERFORM pg_notify(
    'vote_update',
    json_build_object(
      'poll_id', NEW.poll_id,
      'option_id', NEW.option_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER after_vote_insert_update
AFTER INSERT OR UPDATE ON public.votes
FOR EACH ROW EXECUTE FUNCTION count_poll_votes();

-- Poll Stats Update Function
CREATE OR REPLACE FUNCTION update_poll_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert into poll_stats
  INSERT INTO poll_stats (poll_id, vote_count, comment_count)
  SELECT
    p.id AS poll_id,
    COUNT(DISTINCT v.id) AS vote_count,
    COUNT(DISTINCT c.id) AS comment_count
  FROM polls p
  LEFT JOIN votes v ON p.id = v.poll_id
  LEFT JOIN comments c ON p.id = c.poll_id AND c.is_deleted = FALSE
  WHERE p.id = COALESCE(NEW.poll_id, OLD.poll_id)
  GROUP BY p.id
  ON CONFLICT (poll_id) 
  DO UPDATE SET
    vote_count = EXCLUDED.vote_count,
    comment_count = EXCLUDED.comment_count;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stats updates
CREATE TRIGGER update_stats_after_vote
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION update_poll_stats();

CREATE TRIGGER update_stats_after_comment
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION update_poll_stats();

-- =============================================
-- Auth Triggers - Sync auth.users with public.users
-- =============================================

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS handle_user_update CASCADE;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, username, display_name, avatar_url, created_at, last_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NEW.created_at,
    NEW.last_sign_in_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update public user when auth user changes
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update public.users when auth.users changes
  UPDATE public.users SET
    username = COALESCE(NEW.email, users.username),
    last_login = NEW.last_sign_in_at,
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', users.avatar_url)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();