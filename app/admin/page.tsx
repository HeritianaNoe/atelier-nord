import { redirect } from "next/navigation";
import { homeFor } from "@/lib/permissions";
import { requireStaff } from "@/lib/session";

export default async function AdminIndex() {
  const staff = await requireStaff();
  redirect(homeFor(staff.role));
}
