import { Providers } from "@/components/providers";
import { BottomNav } from "@/components/bottom-nav";

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="mx-auto min-h-screen w-full max-w-md pb-20">
        {children}
      </div>
      <BottomNav />
    </Providers>
  );
}
