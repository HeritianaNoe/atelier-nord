"use server";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_AVATARS } from "@/lib/avatars";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";

// Ces actions ne touchent QUE le compte connecté (jamais un id venant du formulaire)
// et ne modifient jamais le rôle, l'email ou le sexe.

export type ProfileFormState = { ok?: string; error?: string; fieldErrors?: Record<string, string> };

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
// Hors de public/ : Next ne sert pas les fichiers ajoutés après le build. Servis par app/api/avatars/[file].
const UPLOAD_DIR = path.join(process.cwd(), "storage", "avatars");
const UPLOAD_URL = "/api/avatars";

/** Détecte le vrai type d'image via les premiers octets (ne fait pas confiance au nom ni au Content-Type). */
function sniffImage(buf: Buffer): "png" | "jpg" | "webp" | null {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

async function removeOldUpload(userId: string, photoUrl: string | null) {
  if (!photoUrl?.startsWith(`${UPLOAD_URL}/${userId}-`)) return;
  const file = path.join(UPLOAD_DIR, path.basename(photoUrl));
  await unlink(file).catch(() => {});
}

const passwordSchema = z.object({
  current: z.string().min(1, "Saisissez votre mot de passe actuel."),
  next: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères.").max(128, "128 caractères maximum."),
  confirm: z.string(),
});

export async function changeMyPassword(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const me = await requireStaff();

  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        ...(f.current?.[0] ? { current: f.current[0] } : {}),
        ...(f.next?.[0] ? { next: f.next[0] } : {}),
      },
    };
  }
  const { current, next, confirm } = parsed.data;
  if (next !== confirm) return { fieldErrors: { confirm: "La confirmation ne correspond pas." } };
  if (next === current) return { fieldErrors: { next: "Le nouveau mot de passe doit être différent de l’actuel." } };

  if (!(await verifyPassword(current, me.passwordHash))) {
    return { fieldErrors: { current: "Mot de passe actuel incorrect." } };
  }

  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: "Mot de passe modifié." };
}

export async function changeMyPhoto(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const me = await requireStaff();
  const file = formData.get("photo");
  const choice = String(formData.get("choice") ?? "");

  // 1) Nouvelle photo téléversée
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_PHOTO_BYTES) return { error: "Image trop lourde (2 Mo maximum)." };
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = sniffImage(buf);
    if (!ext) return { error: "Format non supporté : utilisez une image PNG, JPG ou WEBP." };

    const name = `${me.id}-${randomBytes(6).toString("hex")}.${ext}`;
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      await writeFile(path.join(UPLOAD_DIR, name), buf);
    } catch {
      return { error: "Impossible d’enregistrer l’image sur le serveur." };
    }
    await prisma.user.update({ where: { id: me.id }, data: { photoUrl: `${UPLOAD_URL}/${name}` } });
    await removeOldUpload(me.id, me.photoUrl);
  }
  // 2) Retour à l'avatar par défaut (automatique selon le sexe)
  else if (choice === "default") {
    await prisma.user.update({ where: { id: me.id }, data: { photoUrl: null } });
    await removeOldUpload(me.id, me.photoUrl);
  }
  // 3) Un des avatars proposés pour son sexe
  else if ((DEFAULT_AVATARS[me.gender] as readonly string[]).includes(choice)) {
    await prisma.user.update({ where: { id: me.id }, data: { photoUrl: choice } });
    await removeOldUpload(me.id, me.photoUrl);
  } else {
    return { error: "Choisissez un avatar ou une image à téléverser." };
  }

  revalidatePath("/admin", "layout");
  return { ok: "Photo mise à jour." };
}
