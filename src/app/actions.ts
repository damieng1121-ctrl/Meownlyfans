"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { saveImage, deleteImage, UploadError } from "@/lib/storage";
import { fail, safeNext, type FormState } from "@/lib/utils";

const MAX_PHOTOS = 6;

async function mustBeSignedIn() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

function firstIssue(err: z.ZodError) {
  return err.issues[0]?.message ?? "Please check the form.";
}

function getFile(fd: FormData, key: string) {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}

/* ---------------------------------- Auth ---------------------------------- */

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "Usernames are 3–20 letters, numbers or underscores."),
  displayName: z.string().trim().min(1, "Tell us your name.").max(50),
  email: z.string().trim().toLowerCase().pipe(z.email("That email doesn't look right.")),
  password: z.string().min(8, "Passwords need at least 8 characters.").max(200),
});

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(fd, firstIssue(parsed.error));
  const { username, displayName, email, password } = parsed.data;

  const taken = await db.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (taken) {
    return fail(fd, taken.username === username ? "That username is taken." : "That email already has an account.");
  }

  const user = await db.user.create({
    data: { username, displayName, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user.id);
  redirect("/cats/new?welcome=1");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const login = String(fd.get("login") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = await db.user.findFirst({ where: { OR: [{ email: login }, { username: login }] } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return fail(fd, "Wrong username/email or password.");
  }
  await createSession(user.id);
  redirect(safeNext(fd.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/* ---------------------------------- Posts --------------------------------- */

export async function createPost(_: FormState, fd: FormData): Promise<FormState> {
  const user = await mustBeSignedIn();
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 2000);
  const catId = String(fd.get("catId") ?? "") || null;
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return fail(fd, "Add at least one cat photo.");
  if (files.length > MAX_PHOTOS) return fail(fd, `You can add up to ${MAX_PHOTOS} photos per post.`);
  if (catId && !(await db.cat.findFirst({ where: { id: catId, ownerId: user.id } }))) {
    return fail(fd, "Pick one of your own cats.");
  }

  const urls: string[] = [];
  try {
    for (const f of files) urls.push(await saveImage(f, "posts"));
  } catch (e) {
    await Promise.all(urls.map(deleteImage));
    if (e instanceof UploadError) return fail(fd, e.message);
    throw e;
  }

  const post = await db.post.create({
    data: {
      authorId: user.id,
      catId,
      caption,
      images: { create: urls.map((url, position) => ({ url, position })) },
    },
  });
  revalidatePath("/");
  redirect(`/p/${post.id}`);
}

export async function deletePost(postId: string) {
  const user = await mustBeSignedIn();
  const post = await db.post.findFirst({ where: { id: postId, authorId: user.id }, include: { images: true } });
  if (!post) return;
  await db.post.delete({ where: { id: post.id } });
  await Promise.all(post.images.map((i) => deleteImage(i.url)));
  redirect(`/u/${user.username}`);
}

export async function toggleLike(postId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "signin" as const };
  const key = { userId_postId: { userId: user.id, postId } };
  const existing = await db.like.findUnique({ where: key });
  if (existing) await db.like.delete({ where: key });
  else await db.like.create({ data: { userId: user.id, postId } }).catch(() => {});
  const count = await db.like.count({ where: { postId } });
  return { liked: !existing, count };
}

/* -------------------------------- Comments -------------------------------- */

export async function addComment(_: FormState, fd: FormData): Promise<FormState> {
  const user = await mustBeSignedIn();
  const postId = String(fd.get("postId") ?? "");
  const parentId = String(fd.get("parentId") ?? "") || null;
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return fail(fd, "Write something first.");
  if (body.length > 1000) return fail(fd, "Comments can be up to 1000 characters.");

  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) return fail(fd, "That comment no longer exists.");
    // Keep threads one level deep: replies to replies attach to the top comment.
    await db.comment.create({ data: { postId, authorId: user.id, body, parentId: parent.parentId ?? parent.id } });
  } else {
    if (!(await db.post.findUnique({ where: { id: postId } }))) return fail(fd, "That post no longer exists.");
    await db.comment.create({ data: { postId, authorId: user.id, body } });
  }
  revalidatePath(`/p/${postId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const user = await mustBeSignedIn();
  const c = await db.comment.findUnique({ where: { id: commentId }, include: { post: true } });
  // Comment authors and the post's author can delete.
  if (!c || (c.authorId !== user.id && c.post.authorId !== user.id)) return;
  await db.comment.delete({ where: { id: c.id } });
  revalidatePath(`/p/${c.postId}`);
}

/* ---------------------------------- Cats ---------------------------------- */

const catSchema = z.object({
  name: z.string().trim().min(1, "Your cat needs a name!").max(40),
  breed: z.string().trim().max(60).default(""),
  age: z.string().trim().max(40).default(""),
  bio: z.string().trim().max(500).default(""),
});

export async function saveCat(_: FormState, fd: FormData): Promise<FormState> {
  const user = await mustBeSignedIn();
  const parsed = catSchema.safeParse({
    name: fd.get("name"),
    breed: fd.get("breed") ?? "",
    age: fd.get("age") ?? "",
    bio: fd.get("bio") ?? "",
  });
  if (!parsed.success) return fail(fd, firstIssue(parsed.error));

  const catId = String(fd.get("catId") ?? "") || null;
  const existing = catId ? await db.cat.findFirst({ where: { id: catId, ownerId: user.id } }) : null;
  if (catId && !existing) return fail(fd, "That cat isn't yours.");

  let avatarUrl = existing?.avatarUrl ?? null;
  const avatar = getFile(fd, "avatar");
  if (avatar) {
    try {
      avatarUrl = await saveImage(avatar, "avatars");
    } catch (e) {
      if (e instanceof UploadError) return fail(fd, e.message);
      throw e;
    }
    if (existing?.avatarUrl) await deleteImage(existing.avatarUrl);
  }

  const cat = existing
    ? await db.cat.update({ where: { id: existing.id }, data: { ...parsed.data, avatarUrl } })
    : await db.cat.create({ data: { ...parsed.data, avatarUrl, ownerId: user.id } });
  revalidatePath(`/c/${cat.id}`);
  redirect(`/c/${cat.id}`);
}

export async function deleteCat(catId: string) {
  const user = await mustBeSignedIn();
  const cat = await db.cat.findFirst({ where: { id: catId, ownerId: user.id } });
  if (!cat) return;
  await db.cat.delete({ where: { id: cat.id } });
  await deleteImage(cat.avatarUrl);
  redirect(`/u/${user.username}`);
}

export async function toggleFollow(catId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "signin" as const };
  const key = { userId_catId: { userId: user.id, catId } };
  const existing = await db.follow.findUnique({ where: key });
  if (existing) await db.follow.delete({ where: key });
  else await db.follow.create({ data: { userId: user.id, catId } }).catch(() => {});
  const count = await db.follow.count({ where: { catId } });
  return { following: !existing, count };
}

/* --------------------------------- Profile -------------------------------- */

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await mustBeSignedIn();
  const displayName = String(fd.get("displayName") ?? "").trim().slice(0, 50);
  const bio = String(fd.get("bio") ?? "").trim().slice(0, 300);
  if (!displayName) return fail(fd, "Your name can't be empty.");

  let avatarUrl = user.avatarUrl;
  const avatar = getFile(fd, "avatar");
  if (avatar) {
    try {
      avatarUrl = await saveImage(avatar, "avatars");
    } catch (e) {
      if (e instanceof UploadError) return fail(fd, e.message);
      throw e;
    }
    await deleteImage(user.avatarUrl);
  }
  await db.user.update({ where: { id: user.id }, data: { displayName, bio, avatarUrl } });
  revalidatePath("/", "layout");
  redirect(`/u/${user.username}`);
}
