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

Uploads are checked by their file contents (JPEG/PNG/GIF/WebP, max 8 MB) and
saved to `UPLOAD_DIR` (default `./uploads`), served from `/uploads/...`.
This works on any host with a persistent disk (a VPS, Railway/Render/Fly with a
volume, Docker). For serverless hosts like Vercel, swap the two functions in
`src/lib/storage.ts` for a cloud bucket (S3, R2, Vercel Blob…); nothing else
touches the filesystem.

## Deploy

```bash
npm run build
npm run db:push
npm start                   # respects $PORT
```
