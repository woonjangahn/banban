# BanBan SQL Files

This directory contains all SQL files needed to set up and maintain the BanBan application database.

## File Structure

The SQL files are organized in numbered sequence for clear dependency ordering:

1. **0_reset.sql** - Drops all tables and triggers to start fresh
2. **1_schema.sql** - Creates tables and RLS policies
3. **2_triggers.sql** - Sets up all triggers and functions (for polls and auth)
4. **3_sample_data.sql** - Populates tables with example data (for development only)

## Key Features

### Auth Integration

The setup automatically syncs Supabase Auth with public profiles:

- When a user signs up, a corresponding record is created in public.users
- When user data changes in auth.users, it's reflected in public.users
- Triggers handle all the synchronization automatically

### Real-time Support

The database includes triggers for real-time updates:

- Vote updates trigger notifications for real-time feedback
- Statistics are automatically updated when votes or comments change

## Using These Files

### Initial Setup

For a complete database setup from scratch:

```bash
# Connect to your Supabase PostgreSQL database
PGPASSWORD=your_password psql -h your_host -p 5432 -U your_user -d postgres -f sql/init.sql
```

This will create all tables, set up triggers, and load sample data.

### Reset Database

To reset the database and start fresh:

1. Edit `init.sql` to uncomment the line with `0_reset.sql`
2. Run the init script:

```bash
PGPASSWORD=your_password psql -h your_host -p 5432 -U your_user -d postgres -f sql/init.sql
```

### Production Setup

For production environments:

1. Edit `init.sql` to comment out the line with `3_sample_data.sql`
2. Run the init script

```bash
PGPASSWORD=your_password psql -h your_host -p 5432 -U your_user -d postgres -f sql/init.sql
```

### All-in-One Option

If you prefer to use a single SQL file:

```bash
PGPASSWORD=your_password psql -h your_host -p 5432 -U your_user -d postgres -f sql/all_in_one.sql
```

## Table Structure

- **users** - User profiles (linked to auth.users)
- **polls** - Poll questions and metadata
- **poll_options** - Options for each poll
- **votes** - User votes on polls
- **comments** - Comments on polls (threaded)
- **comment_reactions** - Reactions to comments (upvotes/downvotes)
- **poll_stats** - Cached statistics about polls
