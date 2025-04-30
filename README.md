# BanBan - Poll Application

A voting/poll application built with Next.js 15 and Supabase, featuring real-time updates, internationalization, and a serverless architecture.

## Features

- Next.js 15 App Router with Edge Runtime capabilities
- Supabase for database, authentication, and real-time updates
- Multi-language support (Korean and English)
- Real-time poll results
- Commenting system with reactions
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- Supabase account and project

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/banban.git
cd banban
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file based on `.env.local.example` and add your Supabase credentials

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the application

## Database Setup

To set up the required database tables:

1. Navigate to your Supabase project SQL editor
2. Execute the SQL scripts in the following order:
   - `sql/schema.sql` - Creates all tables and RLS policies
   - `sql/triggers.sql` - Sets up triggers and functions
   - `sql/examples.sql` (optional) - Populates tables with example data

Alternatively, run the `sql/init.sql` script which includes all of the above.

## Project Structure

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
  /sql               # Database SQL scripts
    /schema.sql      # Table definitions and RLS policies
    /triggers.sql    # Triggers and functions
    /examples.sql    # Example data
    /init.sql        # Initialization script
```

## Technologies Used

- **Frontend & Backend**: Next.js 15 with App Router
- **Database & Authentication**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Type Safety**: TypeScript
- **Validation**: Zod

## Deployment

This application is configured for deployment on Vercel with Supabase as the backend.