"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { CenterForm } from "@/components/admin/center-form";

export default function NewCenterPage() {
  return (
    <AdminShell title="Yangi markaz">
      <CenterForm />
    </AdminShell>
  );
}
