-- BanBan Schema
-- File: 1_schema.sql
-- This file defines the database structure for BanBan application

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" 
  ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Polls Table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies for Polls
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view polls" ON public.polls;
CREATE POLICY "Anyone can view polls" 
  ON public.polls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create polls" ON public.polls;
CREATE POLICY "Authenticated users can create polls" 
  ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own polls" ON public.polls;
CREATE POLICY "Users can update own polls" 
  ON public.polls FOR UPDATE USING (auth.uid() = created_by);

-- Poll Options Table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE (poll_id, position)
);

-- RLS Policies for Poll Options
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view poll options" ON public.poll_options;
CREATE POLICY "Anyone can view poll options" 
  ON public.poll_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Poll creators can manage options" ON public.poll_options;
CREATE POLICY "Poll creators can manage options" 
  ON public.poll_options FOR ALL USING (
    auth.uid() IN (
      SELECT created_by FROM public.polls WHERE id = poll_id
    )
  );

-- Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_fingerprint TEXT,
  
  -- Enforce one vote per user per poll
  UNIQUE (poll_id, user_id)
);

-- RLS Policies for Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view vote counts" ON public.votes;
CREATE POLICY "Anyone can view vote counts" 
  ON public.votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Authenticated users can vote" 
  ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can change their own votes" ON public.votes;
CREATE POLICY "Users can change their own votes" 
  ON public.votes FOR UPDATE USING (auth.uid() = user_id);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  parent_id UUID REFERENCES public.comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- RLS Policies for Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view non-deleted comments" ON public.comments;
CREATE POLICY "Anyone can view non-deleted comments" 
  ON public.comments FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);

-- Comment Reactions Table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- One reaction type per comment per user
  UNIQUE (comment_id, user_id)
);

-- RLS Policies for Comment Reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reactions" ON public.comment_reactions;
CREATE POLICY "Anyone can view reactions" 
  ON public.comment_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can react" ON public.comment_reactions;
CREATE POLICY "Authenticated users can react" 
  ON public.comment_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can change own reactions" ON public.comment_reactions;
CREATE POLICY "Users can change own reactions" 
  ON public.comment_reactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.comment_reactions;
CREATE POLICY "Users can delete own reactions" 
  ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);

-- Poll Stats Table
CREATE TABLE IF NOT EXISTS public.poll_stats (
  poll_id UUID PRIMARY KEY REFERENCES public.polls(id) ON DELETE CASCADE,
  vote_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0
);