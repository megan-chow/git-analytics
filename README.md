# Git Analytics

A web application for visualizing per-contributor statistics across GitHub repositories. Supports public repositories without login, and private repositories via GitHub OAuth.

## Features

- Per-contributor breakdown of commits
- Activity timeline showing commits and PR events grouped by date
- Expandable commit view with file-level diffs
- Public repo access with no login required
- Private repo access via GitHub OAuth

## Getting Started

### Installation
```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GITHUB_TOKEN=ghp_your_personal_access_token
ENCRYPTION_KEY=your-32-byte-hex-key
```

Generate an encryption key with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Supabase Setup

Run the following in your Supabase SQL Editor:
```sql
create table profiles (
  id uuid references auth.users(id) primary key,
  github_token text
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

```

### GitHub OAuth Setup

1. Go to [github.com/settings/developers](https://github.com/settings/developers) and create a new OAuth App
2. Set the callback URL to `https://your-project.supabase.co/auth/v1/callback`
3. Enable the `repo` scope for private repository access
4. Paste the Client ID and Secret into Supabase under **Authentication → Providers → GitHub**

### Running Locally
```bash
npm run dev
```

## Security

- GitHub OAuth tokens are encrypted at rest using AES-256 before being stored in the database
- Postgres row-level security ensures users can only access their own credentials

## Planned Features

- Pull request analytics
- Response caching to reduce GitHub API usage and improve load times
- Date range filtering to scope analytics to a specific time period
- GitLab and Bitbucket support
