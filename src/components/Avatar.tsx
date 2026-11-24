import clsx from "clsx";

const COLORS = ["#2f93c9", "#e0475a", "#f2a33a", "#5aa469", "#8e6bbf", "#0b1a22"];

export function Avatar({
  src,
  name,
  size = 40,
  cat = false,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  cat?: boolean;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  const cls = clsx("shrink-0 rounded-full border-2 border-white object-cover shadow-sm", className);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} style={style} className={cls} />;
  }
  const color = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <span
      aria-label={name}
      style={{ ...style, background: color }}
      className={clsx(cls, "inline-flex items-center justify-center font-bold text-white")}
    >
      {cat ? "🐱" : name.charAt(0).toUpperCase()}
    </span>
  );
}
