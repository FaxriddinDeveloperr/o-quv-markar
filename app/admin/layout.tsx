import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/admin-providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin panel — O'quv markazlar",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProviders>{children}</AdminProviders>;
}
