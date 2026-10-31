// Pure module: safe for server and client code.
export type Gender = "MALE" | "FEMALE";

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Masculin",
  FEMALE: "Féminin",
};

/** Avatars par défaut (public/personnels) : 2 et 3 = féminin, 4 et 5 = masculin. */
export const DEFAULT_AVATARS: Record<Gender, readonly string[]> = {
  FEMALE: ["/personnels/avatar2.png", "/personnels/avatar3.png"],
  MALE: ["/personnels/avatar4.png", "/personnels/avatar5.png"],
};

/** Choix stable (même utilisateur = même avatar) parmi les deux avatars du sexe. */
function pick(gender: Gender, seed: string): string {
  const list = DEFAULT_AVATARS[gender] ?? DEFAULT_AVATARS.MALE;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/** Photo choisie par l'utilisateur, sinon avatar par défaut selon le sexe. */
export function avatarFor(user: { id: string; gender: Gender; photoUrl?: string | null }): string {
  return user.photoUrl?.trim() || pick(user.gender, user.id);
}

export function isDefaultAvatar(url: string): boolean {
  return [...DEFAULT_AVATARS.FEMALE, ...DEFAULT_AVATARS.MALE].includes(url);
}
