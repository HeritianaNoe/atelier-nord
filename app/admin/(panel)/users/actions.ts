"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const photoUrlRule = z
  .string()
  .trim()
  .refine(
    (u) => u === "" || /^https?:\/\/\S+$/.test(u) || /^\/[\w\-./]+$/.test(u),
    "Utilisez une URL https://… ou un chemin comme /avatars/moi.jpg",
  );

const userSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(80, "80 caractères maximum."),
  email: z.string().trim().toLowerCase().email("Adresse email invalide.").max(160),
  role: z.enum(["ADMIN", "VENTE", "STOCK"], { errorMap: () => ({ message: "Rôle invalide." }) }),
  gender: z.enum(["MALE", "FEMALE"], { errorMap: () => ({ message: "Sexe invalide." }) }),
  photoUrl: photoUrlRule.optional(),
});

const passwordRule = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "128 caractères maximum.");

export type UserFormState = {
  errors?: Partial<Record<"name" | "email" | "role" | "gender" | "password" | "photoUrl", string[]>> & { form?: string[] };
  /** Never contains the password: the user must retype it after an error. */
  values?: Record<string, string>;
};

function refresh() {
  revalidatePath("/admin/users");
}

function validate(
  formData: FormData,
  opts: { passwordRequired: boolean; forced?: { email?: string; role?: string } },
) {
  const photoUrlRaw = String(formData.get("photoUrl") ?? "").trim();
  const values = {
    name: String(formData.get("name") ?? ""),
    email: opts.forced?.email ?? String(formData.get("email") ?? ""),
    role: opts.forced?.role ?? String(formData.get("role") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    photoUrl: photoUrlRaw,
  };
  const password = String(formData.get("password") ?? "");

  const base = userSchema.safeParse(values);
  const errors: NonNullable<UserFormState["errors"]> = base.success ? {} : { ...base.error.flatten().fieldErrors };

  if (opts.passwordRequired || password.length > 0) {
    const pw = passwordRule.safeParse(password);
    if (!pw.success) errors.password = pw.error.flatten().formErrors;
  }

  const ok = base.success && !errors.password;
  return { ok, data: base.success ? base.data : undefined, password, errors, values };
}

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireAdmin();
  const v = validate(formData, { passwordRequired: true });
  if (!v.ok || !v.data) return { errors: v.errors, values: v.values };

  const existing = await prisma.user.findUnique({ where: { email: v.data.email } });
  if (existing) return { errors: { email: ["Un utilisateur avec cet email existe déjà."] }, values: v.values };

  try {
    await prisma.user.create({
      data: {
        name: v.data.name,
        email: v.data.email,
        role: v.data.role,
        gender: v.data.gender,
        photoUrl: v.data.photoUrl || null,
        passwordHash: await hashPassword(v.password),
      },
    });
  } catch {
    return { errors: { form: ["Impossible de créer l’utilisateur."] }, values: v.values };
  }
  refresh();
  redirect("/admin/users");
}

export async function updateUser(id: string, _prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const admin = await requireAdmin();
  const isSelf = admin.id === id;

  // You cannot change your own email (it is the session identity) nor demote yourself.
  const v = validate(formData, {
    passwordRequired: false,
    forced: isSelf ? { email: admin.email, role: "ADMIN" } : undefined,
  });
  if (!v.ok || !v.data) return { errors: v.errors, values: v.values };

  const clash = await prisma.user.findUnique({ where: { email: v.data.email } });
  if (clash && clash.id !== id) return { errors: { email: ["Un utilisateur avec cet email existe déjà."] }, values: v.values };

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: v.data.name,
        email: v.data.email,
        role: v.data.role,
        gender: v.data.gender,
        photoUrl: v.data.photoUrl || null,
        // Empty password field = keep the current password.
        ...(v.password ? { passwordHash: await hashPassword(v.password) } : {}),
      },
    });
  } catch {
    return { errors: { form: ["Cet utilisateur n’existe plus."] }, values: v.values };
  }
  refresh();
  redirect("/admin/users");
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (admin.id === id) return { error: "Vous ne pouvez pas supprimer votre propre compte." };

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    // Already deleted: nothing to do.
  }
  refresh();
  return {};
}
