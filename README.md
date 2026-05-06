# Supabase Auth Setup (Frontend + Backend)

This workspace now has:
- `kc103` as a Vite + React frontend with Supabase auth client
- `backend` as an Express API that validates Supabase bearer tokens

## 1) Install dependencies

```bash
cd backend && npm install
cd ../kc103 && npm install
```

## 2) Configure env files

Create these files by copying each example:
- `backend/.env` from `backend/.env.example`
- `kc103/.env` from `kc103/.env.example`

The Supabase URL and publishable key are already prefilled.

## 3) Run both apps

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd kc103 && npm run dev
```

## Implemented API endpoints

- `POST /api/auth/signup` - create user
- `POST /api/auth/signin` - sign in user
- `GET /api/auth/me` - return authenticated user
- `GET /api/protected` - sample protected route
- `GET /api/profile` - fetch user profile from Supabase
- `PUT /api/profile` - upsert user profile (`full_name`)

## Supabase MCP changes applied

Created `public.profiles` table with RLS policies allowing users to read/insert/update only their own profile rows.
