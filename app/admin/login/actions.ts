"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/auth";
import { homeFor } from "@/lib/permissions";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  // Always run one hash verification, even for unknown emails, to keep timing uniform.
  const validPassword = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !validPassword) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(user.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(homeFor(user.role));
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
