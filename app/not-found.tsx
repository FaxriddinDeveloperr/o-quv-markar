import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="gradient-text text-6xl font-extrabold">404</div>
      <p className="text-muted-foreground">
        Sahifa topilmadi · Страница не найдена
      </p>
      <Link
        href="/"
        className="gradient-primary rounded-xl px-5 py-2.5 text-sm font-medium text-white"
      >
        Bosh sahifa
      </Link>
    </div>
  );
}
