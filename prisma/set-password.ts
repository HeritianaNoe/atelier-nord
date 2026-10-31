/**
 * Usage:
 *   npx tsx prisma/set-password.ts <email> '<nouveau mot de passe>' [--admin]
 *
 * Réinitialise le mot de passe d'un utilisateur existant (et, avec --admin, lui donne le rôle ADMIN).
 * Met le mot de passe entre quotes simples pour que le terminal n'interprète pas $, !, etc.
 */
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword, verifyPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const [emailArg, password, flag] = process.argv.slice(2);
  if (!emailArg || !password) {
    console.error("Usage : npx tsx prisma/set-password.ts <email> '<mot de passe>' [--admin]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Le mot de passe doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Aucun utilisateur avec l'email ${email}.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash, ...(flag === "--admin" ? { role: Role.ADMIN } : {}) },
  });

  const check = await verifyPassword(password, updated.passwordHash);
  console.log(`OK : mot de passe de ${updated.email} mis à jour (rôle : ${updated.role}, vérification : ${check}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
