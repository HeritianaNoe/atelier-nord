import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { can, canWrite, homeFor, type Section } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/** Logged-in staff member (every account is staff) or null. Re-checks the account in the database. */
export async function getStaff() {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return prisma.user.findUnique({ where: { email: session.email } });
}

export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

/**
 * Use at the top of EVERY admin page and Server Action.
 * (A layout is not a guard: Next renders layout and page in parallel.)
 */
export async function requireAccess(section: Section) {
  const staff = await requireStaff();
  if (!can(staff.role, section)) redirect(homeFor(staff.role));
  return staff;
}

/**
 * Like requireAccess, but for creating / editing / deleting. Use it in every Server Action and form page
 * that modifies data: a read-only role (e.g. VENTE on products) is sent back to the list.
 */
export async function requireWrite(section: Section) {
  const staff = await requireAccess(section);
  if (!canWrite(staff.role, section)) redirect(`/admin/${section}`);
  return staff;
}

/** Users management: ADMIN only. */
export const requireAdmin = () => requireAccess("users");
