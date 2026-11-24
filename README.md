# Meownly Fans 🐾

A cat appreciation network: give each cat a profile, post photos, and shower
other people's cats with paws (likes), comments and follows.

## Features

- Sign up / log in (email or username + password, secure session cookies)
- Cat profiles with photo, breed, age and bio; one owner can have many cats
- Photo posts (up to 6 photos each) with captions, tagged to a cat
- Feed tabs: **Latest**, **Top this week**, **Following** (cats you follow)
- Paw likes, comments with one level of replies, follow cats
- User profiles, profile settings, delete your own posts/comments/cats
- Mobile-friendly

## Stack

Next.js 16 (App Router, server actions) · React 19 · Prisma + PostgreSQL · Tailwind CSS 4

## Run it locally

You need Node 20+ and a PostgreSQL database (local, or a free one from Neon/Supabase).

```bash
cp .env.example .env        # then set DATABASE_URL
npm install
npm run db:push             # creates the tables
npm run dev                 # http://localhost:3000
```

## Photo storage

Browsers shrink photos before upload (longest side 1600px). The server then
checks each file's contents (JPEG/PNG/GIF/WebP, max 4 MB) and stores it in the
database (`StoredImage` table), served from `/uploads/...`. So the only thing
the app needs is `DATABASE_URL`, and it runs on Vercel or any other host. For
heavy traffic, swap the functions in `src/lib/storage.ts` for a cloud bucket.

## Deploy

**Vercel:** import the GitHub repo at vercel.com/new, add a `DATABASE_URL`
environment variable, and deploy. Create the tables once with `npm run db:push`
(run locally with `DATABASE_URL` pointing at the production database).

**Anywhere else:**

```bash
npm run build
npm run db:push
npm start                   # respects $PORT
```
