export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-2xl bg-heart/10 px-4 py-2.5 text-sm font-medium text-heart">
      {error}
    </p>
  );
}
