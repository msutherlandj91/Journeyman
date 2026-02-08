# Supabase Setup Guide for Journeyman Calculator

## Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon) → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the public API key)

## Step 2: Create Environment Variables

Create a file called `.env` in the `woodworking-calc/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Important:** The `.env` file is already in `.gitignore` so your keys won't be committed to git.

## Step 3: Create Database Table

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `woodworking-calc/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

This creates:
- `calculations` table with proper structure
- Row Level Security policies (users can only access their own data)
- Performance indexes

## Step 4: Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **Google** and enable it
   - Paste your Client ID and Client Secret
   - Save

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name:** Journeyman Calculator
   - **Homepage URL:** `https://msutherlandj91.github.io/Journeyman/`
   - **Authorization callback URL:**
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Find **GitHub** and enable it
   - Paste your Client ID and Client Secret
   - Save

## Step 5: Test Locally

```bash
cd woodworking-calc
npm run dev
```

Open the app and try:
1. Click "Sign in with Google" or "Sign in with GitHub"
2. Complete OAuth flow
3. Try saving a calculation
4. Check Supabase Dashboard → **Table Editor** → `calculations` to see the data

## Step 6: Deploy to GitHub Pages

### Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/msutherlandj91/Journeyman
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:
   - Name: `VITE_SUPABASE_URL`, Value: your Supabase project URL
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: your anon key

### Update GitHub Actions Workflow

The workflow needs to inject environment variables during build. Update `.github/workflows/deploy.yml`:

```yaml
- name: Build app
  run: cd woodworking-calc && npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### Push to Deploy

```bash
git add -A
git commit -m "Migrate from Firebase to Supabase"
git push origin main
```

GitHub Actions will build and deploy automatically.

## Troubleshooting

### "Missing Supabase environment variables" in console

- Make sure `.env` file exists in `woodworking-calc/` directory
- Check that variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating `.env`

### OAuth redirect fails

- Check that redirect URI in Google/GitHub exactly matches: `https://your-project.supabase.co/auth/v1/callback`
- Make sure OAuth providers are enabled in Supabase Dashboard

### Can't save calculations

- Verify database schema was created successfully
- Check Supabase Dashboard → **Table Editor** → verify `calculations` table exists
- Check browser console for detailed error messages
- Verify Row Level Security policies are active

### Data not showing after sign-in

- Check that `user_id` column in calculations table matches your auth user ID
- View Supabase Dashboard → **Authentication** → **Users** to see your user ID
- Compare with **Table Editor** → `calculations` → check `user_id` values

## Notes

- **Free tier limitation:** Project pauses after 7 days of inactivity. Upgrade to Pro ($25/month) to keep it always active.
- **Security:** The anon key is safe to expose publicly — Row Level Security ensures users can only access their own data.
- **Costs:** Free tier includes 50,000 monthly active users, 500 MB database, unlimited API requests.
