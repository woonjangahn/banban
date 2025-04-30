# BanBan Technical Specification - Next.js 15 & Supabase

> **Implementation Status Legend**
> - ✅ Implemented
> - ⚠️ Partially implemented
> - 🔄 In progress
> - ❌ Not implemented yet

## System Architecture

### Overview
- **Application Type**: Next.js 15 Application with App Router ✅
- **Architecture Pattern**: Serverless with Edge Runtime capabilities ✅
- **Deployment Model**: Vercel platform with Supabase backend ⚠️ (Setup complete, but not deployed)
- **Scaling Strategy**: Automatic scaling via Vercel and Supabase infrastructure ❌

### Core Technologies
1. **Frontend & Backend**
    - Framework: Next.js 15 (App Router) ✅
    - Runtime: Edge Runtime where applicable for global performance ⚠️ (Setup, but not optimized)
    - State Management: React Server Components + Client Components with hooks ✅
    - Styling: Tailwind CSS with custom theme ✅
    - Internationalization: next-intl ✅

2. **Database & Authentication**
    - Platform: Supabase ✅
    - Database: PostgreSQL (managed by Supabase) ✅
    - Auth: Supabase Auth with JWT ✅
    - Storage: Supabase Storage for media ⚠️ (Implemented in profile settings)
    - Realtime: Supabase Realtime for live updates ✅

3. **Development Tooling**
    - TypeScript for type safety ✅
    - ESLint + Prettier for code quality ✅
    - Jest + Testing Library for unit testing ❌
    - Playwright for E2E testing ❌
    - Storybook for component documentation ❌

4. **Infrastructure**
    - Hosting: Vercel ❌
    - Database: Supabase ⚠️ (Setup, but not connected to live instance)
    - CDN: Vercel Edge Network ❌
    - Monitoring: Vercel Analytics + custom Supabase logging ❌
    - CI/CD: GitHub Actions + Vercel Integration ❌

## Data Models (Supabase Schema)

> **Note**: All SQL schemas are defined ✅, but require execution in a Supabase instance

### Users Table ✅
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" 
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE USING (auth.uid() = id);
```

### Polls Table ✅
```sql
CREATE TABLE public.polls (
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

-- RLS Policies
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls" 
  ON public.polls FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" 
  ON public.polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own polls" 
  ON public.polls FOR UPDATE USING (auth.uid() = created_by);
```

### Poll Options Table ✅
```sql
CREATE TABLE public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE (poll_id, position)
);

-- RLS Policies
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options" 
  ON public.poll_options FOR SELECT USING (true);

CREATE POLICY "Poll creators can manage options" 
  ON public.poll_options FOR ALL USING (
    auth.uid() IN (
      SELECT created_by FROM public.polls WHERE id = poll_id
    )
  );
```

### Votes Table ✅
```sql
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_fingerprint TEXT,
  
  -- Enforce one vote per user per poll
  UNIQUE (poll_id, user_id)
);

-- RLS Policies
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vote counts" 
  ON public.votes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" 
  ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can change their own votes" 
  ON public.votes FOR UPDATE USING (auth.uid() = user_id);
```

### Comments Table ✅
```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  parent_id UUID REFERENCES public.comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- RLS Policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted comments" 
  ON public.comments FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);
```

### Comment Reactions Table ✅
```sql
CREATE TABLE public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- One reaction type per comment per user
  UNIQUE (comment_id, user_id)
);

-- RLS Policies
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" 
  ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react" 
  ON public.comment_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can change own reactions" 
  ON public.comment_reactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" 
  ON public.comment_reactions FOR DELETE USING (auth.uid() = user_id);
```

## Database Functions and Triggers

### Vote Counting Function ❌
```sql
CREATE OR REPLACE FUNCTION count_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts in materialized view or cache
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

CREATE TRIGGER after_vote_insert_update
AFTER INSERT OR UPDATE ON public.votes
FOR EACH ROW EXECUTE FUNCTION count_poll_votes();
```

### Comment Count Materialized View ❌
```sql
CREATE MATERIALIZED VIEW poll_stats AS
SELECT
  p.id AS poll_id,
  COUNT(DISTINCT v.id) AS vote_count,
  COUNT(DISTINCT c.id) AS comment_count
FROM polls p
LEFT JOIN votes v ON p.id = v.poll_id
LEFT JOIN comments c ON p.id = c.poll_id AND c.is_deleted = FALSE
GROUP BY p.id;

CREATE UNIQUE INDEX ON poll_stats (poll_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_poll_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY poll_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for votes and comments
CREATE TRIGGER refresh_stats_after_vote
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH STATEMENT EXECUTE FUNCTION refresh_poll_stats();

CREATE TRIGGER refresh_stats_after_comment
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH STATEMENT EXECUTE FUNCTION refresh_poll_stats();
```

## Next.js App Router Structure ✅

```
/app
  /[locale]
    /layout.tsx       # Root layout with providers
    /page.tsx         # Homepage
    /(auth)
      /login/page.tsx
      /register/page.tsx
    /polls
      /page.tsx       # Polls listing
      /[id]
        /page.tsx     # Poll detail page
        /vote/route.ts  # API route for voting
        /comments/route.ts  # API route for comments
    /profile
      /page.tsx       # User profile
      /settings/page.tsx  # User settings
    /api
      /webhooks/route.ts  # Supabase webhooks
  /lib
    /supabase
      /client.ts      # Supabase client
      /server.ts      # Supabase server client
    /utils
    /hooks
  /components
    /ui              # Reusable UI components
    /polls           # Poll-specific components
    /comments        # Comment-specific components
    /layout          # Layout components
```

## API Routes & Data Fetching

### Server Components (RSC) ✅
```typescript
// app/[locale]/polls/[id]/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function PollPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  
  // Fetch poll data
  const { data: poll } = await supabase
    .from('polls')
    .select(`
      *,
      options:poll_options(*),
      creator:users(username, avatar_url),
      stats:poll_stats(vote_count, comment_count)
    `)
    .eq('id', params.id)
    .single();
    
  // Fetch comments with pagination
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(username, avatar_url),
      reactions:comment_reactions(reaction_type, count)
    `)
    .eq('poll_id', params.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);
    
  return (
    <div>
      <PollDetail poll={poll} />
      <CommentSection comments={comments} pollId={params.id} />
    </div>
  );
}
```

### Route Handlers ✅
```typescript
// app/[locale]/polls/[id]/vote/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { optionId } = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', params.id)
    .eq('user_id', user.id)
    .single();
    
  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from('votes')
      .update({ option_id: optionId })
      .eq('id', existingVote.id);
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  } else {
    // Create new vote
    const { error } = await supabase
      .from('votes')
      .insert({
        poll_id: params.id,
        option_id: optionId,
        user_id: user.id
      });
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  }
  
  return NextResponse.json({ success: true });
}
```

## Authentication Flow ✅

### Authentication Hooks
```typescript
// lib/hooks/useAuth.ts
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.refresh();
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;
      
      router.refresh();
      router.push('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };
  
  return {
    signIn,
    signUp,
    signOut,
    isLoading,
    error
  };
}
```

## Realtime Updates ✅

### Realtime Poll Results
```typescript
// components/polls/PollResults.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Poll, PollOption } from '@/types';

export function PollResults({ 
  poll, 
  initialOptions 
}: { 
  poll: Poll, 
  initialOptions: PollOption[]
}) {
  const [options, setOptions] = useState(initialOptions);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    // Subscribe to realtime votes
    const channel = supabase
      .channel(`poll:${poll.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${poll.id}`
        },
        (payload) => {
          // Update the vote count for the option
          setOptions(currentOptions => 
            currentOptions.map(option => 
              option.id === payload.new.option_id
                ? { ...option, votes: option.votes + 1 }
                : option
            )
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll.id, supabase]);
  
  // Calculate total votes
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  // Render component...
}
```

## Internationalization ✅

### Configuration
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// next.config.js
const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...other config
};

module.exports = withNextIntl(nextConfig);
```

### Messages
```typescript
// messages/ko.json
{
  "common": {
    "home": "홈으로",
    "polls": "여론조사",
    "login": "로그인",
    "register": "회원가입",
    "profile": "프로필"
  },
  "poll": {
    "vote": "투표하기",
    "results": "결과 보기",
    "comments": "댓글",
    "for": "찬성",
    "against": "반대",
    "totalVotes": "총 {count}명 참여"
  }
}
```

## Performance Optimizations ⚠️

### Next.js Server Components ✅
- Use Server Components for data-fetching to reduce client-side JavaScript
- Implement streaming for large comment sections
- Use Edge Runtime for global low-latency responses

### Image Optimization ✅
```typescript
// components/ui/Avatar.tsx
import Image from 'next/image';

export function Avatar({ 
  url, 
  username 
}: { 
  url: string | null, 
  username: string 
}) {
  return (
    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
      {url ? (
        <Image
          src={url}
          alt={`${username}'s avatar`}
          width={40}
          height={40}
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600">
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
```

### Database Optimizations ❌
- Use Supabase RLS policies effectively to reduce data transfer
- Implement materialized views for frequently accessed statistics
- Use database functions for complex operations

## Security Considerations ⚠️

### Authentication ✅
- Secure authentication flow with Supabase Auth
- JWT tokens with short expiration time
- RLS policies to protect data access

### Data Validation ✅
```typescript
// lib/validations/poll.ts
import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  options: z.array(
    z.object({
      text: z.string().min(1).max(200),
      position: z.number().int().min(0)
    })
  ).min(2).max(5)
});

// In the route handler
const result = createPollSchema.safeParse(await request.json());
if (!result.success) {
  return NextResponse.json(
    { error: 'Invalid poll data', details: result.error.format() },
    { status: 400 }
  );
}
```

## Deployment ❌

### Vercel Deployment ❌
- Set up Vercel project linked to GitHub repository
- Configure environment variables for Supabase connection
- Set up automatic preview deployments for pull requests

### Supabase Setup ⚠️
- Create Supabase project
- Set up database schema with tables, functions, and policies
- Configure authentication providers (email, social login)
- Set up Supabase storage buckets for user avatars

## Analytics and Monitoring ❌

### Custom Analytics ❌
```typescript
// lib/analytics.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function trackEvent(name: string, properties?: Record<string, any>) {
  const supabase = createClientComponentClient();
  
  await supabase
    .from('analytics_events')
    .insert({
      event_name: name,
      properties,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      session_id: localStorage.getItem('session_id') || crypto.randomUUID()
    });
}

// Usage in component
trackEvent('poll_view', { poll_id: poll.id });
```

### Error Monitoring ❌
```typescript
// components/ErrorBoundary.tsx
'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Supabase
    const logError = async () => {
      const supabase = createClientComponentClient();
      await supabase
        .from('error_logs')
        .insert({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
        });
    };
    
    logError();
  }, [error]);
  
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-medium text-red-800">
        Something went wrong
      </h2>
      <p className="mt-1 text-sm text-red-700">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
```

## Mobile Responsiveness ✅

- Implement responsive layouts with Tailwind CSS
- Use `useMediaQuery` hook for adaptive components
- Optimize touch interactions for mobile users

## Testing Strategy ❌

### Unit Tests ❌
```typescript
// __tests__/components/PollOption.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PollOption } from '@/components/polls/PollOption';

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      })
    }
  })
}));

describe('PollOption', () => {
  it('renders the option text', () => {
    render(
      <PollOption
        option={{ id: 'test-id', text: 'Test Option', position: 0 }}
        pollId="poll-id"
        onVote={jest.fn()}
        selected={false}
        disabled={false}
      />
    );
    
    expect(screen.getByText('Test Option')).toBeInTheDocument();
  });
  
  it('calls onVote when clicked', () => {
    const onVote = jest.fn();
    
    render(
      <PollOption
        option={{ id: 'test-id', text: 'Test Option', position: 0 }}
        pollId="poll-id"
        onVote={onVote}
        selected={false}
        disabled={false}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onVote).toHaveBeenCalledWith('test-id');
  });
});
```

## Accessibility ⚠️

- Implement proper semantic HTML structure
- Ensure keyboard navigation support
- Add appropriate ARIA attributes
- Test with screen readers

## Implemented Features Summary

### Core Features ✅
- **Authentication** - Login, registration, and user management
- **Polls** - Creation, listing, viewing, and voting
- **Comments** - Adding comments, replies, and reactions
- **Realtime Updates** - Live poll results and comment feed
- **Internationalization** - Multi-language support (English and Korean)
- **Profile Management** - User profile views and settings

### UI Components ✅
- Responsive layout with Tailwind CSS
- Reusable UI components (Avatar, Button, etc.)
- Poll-specific components
- Comment system components
- Navigation and footer

### Additional Features Implemented ✅
- Mobile-responsive design
- Form validation with Zod
- Supabase storage integration for avatars
- Poll creation with multiple options

## Future Expansion Considerations

1. **Enhanced Analytics Dashboard** ❌
    - Detailed user demographics for polls
    - Trend analysis for opinions over time
    - Geographic distribution of votes

2. **Advanced Commenting Features** ⚠️
    - Comment threading and sorting options (partially implemented)
    - Rich text formatting
    - Comment moderation tools

3. **Social Features** ❌
    - User following system
    - Activity feed
    - Poll sharing capabilities

4. **Mobile App** ❌
    - React Native mobile application
    - Push notifications
    - Offline voting capability

5. **Monetization Options** ❌
    - Premium polls with advanced features
    - Sponsored polls for businesses
    - Subscription tiers for power users

6. **Additional Feature Ideas** ❌
    - Advanced poll types (ranked choice, multiple choice)
    - Poll templates and categories
    - Data visualization enhancements
    - Export/import polls and results
    - User badges and reputation system
    - Admin dashboard for moderation
    - Email notifications for poll activities
    - Poll expiration and scheduling
    - Integration with social media platforms
    - Search and filtering capabilities