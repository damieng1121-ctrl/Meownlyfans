import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <div className="text-5xl">🙀</div>
      <h1 className="mt-4 text-2xl font-bold">This page wandered off</h1>
      <p className="mt-2 text-ink-soft">Like a cat at bath time, it&apos;s nowhere to be found.</p>
      <Link href="/" className="btn-primary mt-6">Back to the feed</Link>
    </div>
  );
}
