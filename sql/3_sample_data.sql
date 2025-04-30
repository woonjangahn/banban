-- BanBan Sample Data
-- File: 3_sample_data.sql
-- This file adds example data for development and testing

-- For sample data to work properly with the auth.users foreign key,
-- we'll temporarily drop the constraint
DO $$
BEGIN
  -- Temporarily drop the foreign key constraint
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
END $$;

-- Generate a UUID for our sample user
DO $$
DECLARE
  user_id UUID := gen_random_uuid();
  poll_ids TEXT;
BEGIN
  -- Insert User
  INSERT INTO public.users (id, username, display_name, avatar_url, created_at, last_login, is_active, preferences)
  VALUES
    (user_id, 'example_user', 'Example User', 'https://randomuser.me/api/portraits/men/1.jpg', now() - interval '30 days', now(), true, '{"theme": "dark", "notifications": true}'::jsonb);

  -- Insert Polls
  WITH new_poll AS (
    INSERT INTO public.polls (id, title, description, category, created_at, end_at, created_by, is_active, is_featured)
    VALUES
      ('1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'Favorite Programming Language', 'What programming language do you prefer for web development?', 'technology', now() - interval '15 days', now() + interval '15 days', user_id, true, true),
      ('2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', 'Best Movie of 2023', 'Which movie released in 2023 was your favorite?', 'entertainment', now() - interval '10 days', now() + interval '20 days', user_id, true, false),
      ('3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'Remote Work vs Office', 'Do you prefer working remotely or in an office?', 'work', now() - interval '5 days', now() + interval '25 days', user_id, true, true)
    RETURNING id
  )
  SELECT string_agg(id::text, ', ') INTO poll_ids FROM new_poll;
  
  -- Log the created polls (using PERFORM for a SELECT in PL/pgSQL)
  RAISE NOTICE 'Created polls with IDs: %', poll_ids;

  -- Insert Poll Options
  INSERT INTO public.poll_options (id, poll_id, text, position)
  VALUES
    -- Programming Language Options
    ('a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'JavaScript', 1),
    ('b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'Python', 2),
    ('c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'TypeScript', 3),
    ('d4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'PHP', 4),
    
    -- Movie Options
    ('e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', 'Oppenheimer', 1),
    ('f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', 'Barbie', 2),
    ('a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', 'Spider-Man: Across the Spider-Verse', 3),
    ('b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', 'Guardians of the Galaxy Vol. 3', 4),
    
    -- Remote Work Options
    ('c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'Fully Remote', 1),
    ('d0e1f2a3-b4c5-d6e7-f8a9-b0c1d2e3f4a5', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'Hybrid (3 days remote, 2 days office)', 2),
    ('e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'Hybrid (2 days remote, 3 days office)', 3),
    ('f2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'Fully Office-based', 4);

  -- Insert Votes
  INSERT INTO public.votes (poll_id, option_id, user_id, created_at)
  VALUES
    -- User votes on Programming Languages poll
    ('1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', 'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', user_id, now() - interval '14 days'),
    
    -- User votes on Remote Work poll
    ('3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', 'c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4', user_id, now() - interval '4 days');

  -- Insert Comments
  INSERT INTO public.comments (id, poll_id, user_id, parent_id, content, created_at, updated_at, is_deleted)
  VALUES
    -- Root comments
    ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', user_id, NULL, 'TypeScript is great because it adds static typing to JavaScript!', now() - interval '12 days', NULL, false),
    ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', user_id, NULL, 'Barbie was surprisingly good, with great social commentary.', now() - interval '8 days', NULL, false),
    ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', user_id, NULL, 'Working fully remote has improved my work-life balance significantly.', now() - interval '4 days', NULL, false),
    
    -- Reply comments (all from the same user since we only have one)
    ('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', user_id, '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'I agree, but the learning curve can be steep for beginners.', now() - interval '11 days', NULL, false),
    ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '2f3e4d5c-6b7a-8c9d-0e1f-2a3b4c5d6e7f', user_id, '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'I preferred Oppenheimer, but Barbie was definitely entertaining!', now() - interval '7 days', NULL, false),
    ('6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', '3e4d5c6b-7a8f-9e0d-1c2b-3a4b5c6d7e8f', user_id, '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'I like hybrid better - I miss the social interaction of the office sometimes.', now() - interval '3 days', NULL, false);

  -- Insert Comment Reactions (all from the same user)
  INSERT INTO public.comment_reactions (comment_id, user_id, reaction_type, created_at)
  VALUES
    -- Self-upvotes for example purposes
    ('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', user_id, 'upvote', now() - interval '11 days'),
    ('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', user_id, 'upvote', now() - interval '7 days'),
    ('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', user_id, 'upvote', now() - interval '3 days');

  -- Update Poll Stats
  INSERT INTO poll_stats (poll_id, vote_count, comment_count)
  SELECT
    p.id AS poll_id,
    COUNT(DISTINCT v.id) AS vote_count,
    COUNT(DISTINCT c.id) AS comment_count
  FROM polls p
  LEFT JOIN votes v ON p.id = v.poll_id
  LEFT JOIN comments c ON p.id = c.poll_id AND c.is_deleted = FALSE
  GROUP BY p.id
  ON CONFLICT (poll_id) 
  DO UPDATE SET
    vote_count = EXCLUDED.vote_count,
    comment_count = EXCLUDED.comment_count;
    
  RAISE NOTICE 'Sample data created successfully using user ID: %', user_id;
END $$;

-- Re-add the constraint
DO $$
BEGIN
  ALTER TABLE public.users 
  ADD CONSTRAINT users_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  -- This will fail if you don't have matching auth.users records, but that's OK
  -- for sample data in development
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Foreign key constraint not added - this is expected for sample data';
END $$;