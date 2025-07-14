# Supabase Environment Configuration

To set up Supabase for your prescription system, you need to create a `.env.local` file in your project root with the following environment variables:

## Required Environment Variables

Create a file named `.env.local` in your project root and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Demo Mode (set to "true" to enable demo mode without real database)
# NEXT_PUBLIC_DEMO_MODE=false
```

## How to Get Your Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Create a new project** or select an existing one
3. **Go to Settings > API** in your project dashboard
4. **Copy the following values:**
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup

After setting up your Supabase project, run the SQL scripts in the `scripts/` folder:

1. **Run `scripts/create-prescription-tables.sql`** to create the database schema
2. **Run `scripts/update-prescription-schema.sql`** to update the schema for optional fields

## Example .env.local file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdG5wdmJqYWJqYWJqYWJqYWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjUwNjI0MDAsImV4cCI6MTk0MDYzODQwMH0.your_actual_key_here
```

## Important Notes

- The `.env.local` file is automatically ignored by git (as per `.gitignore`)
- Never commit your actual Supabase keys to version control
- The `NEXT_PUBLIC_` prefix makes these variables available in the browser
- Restart your development server after adding environment variables 