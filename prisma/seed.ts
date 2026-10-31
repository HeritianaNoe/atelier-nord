import { Gender, PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/password"; // Na araka izay toerana misy azy

const prisma = new PrismaClient();

const INITIAL_STOCK = 10; // chaque article démarre avec 10 unités

// Chaque produit a son image dans public/products/<seed>.svg
const img = (seed: string) => `/products/${seed}.svg`;

const catalog: Record<
  string,
  { title: string; description: string; price: number; seed: string; isFeatured?: boolean }[]
> = {
  Maison: [
    { title: "Vase en grès fumé", description: "Tourné à la main, émail mat gris fumée. Hauteur 24 cm.", price: 48, seed: "vase", isFeatured: true },
    { title: "Bougie cire de colza", description: "Parfum bois de cèdre et figuier, 40 h de combustion.", price: 26, seed: "candle" },
    { title: "Miroir rond en chêne", description: "Cadre en chêne massif huilé, diamètre 60 cm.", price: 129, seed: "mirror" },
    { title: "Horloge murale minimale", description: "Cadran en béton lissé, aiguilles en laiton silencieuses.", price: 65, seed: "clock" },
    { title: "Coussin de sol en velours", description: "Rembourrage coton, toucher doux, diamètre 50 cm.", price: 42, seed: "floor-cushion" },
    { title: "Cache-pot en terre cuite", description: "Argile naturelle striée à la main, drainant.", price: 32, seed: "pot" }
  ],
  Cuisine: [
    { title: "Planche à découper noyer", description: "Noyer français, finition huile alimentaire. 40 × 25 cm.", price: 59, seed: "board", isFeatured: true },
    { title: "Set de 4 bols en céramique", description: "Compatibles lave-vaisselle et micro-ondes.", price: 64, seed: "bowls" },
    { title: "Couteau de chef 20 cm", description: "Acier inoxydable, manche en bois de hêtre.", price: 89, seed: "knife", isFeatured: true },
    { title: "Moulin à poivre en font", description: "Mécanisme en acier moulé, réglage de la mouture.", price: 45, seed: "grinder" },
    { title: "Cafetière à piston 800 ml", description: "Verre borosilicate résistant, armature inox.", price: 38, seed: "press" },
    { title: "Boîtes hermétiques inox (lot de 3)", description: "Couvercles en silicone alimentaire sans BPA.", price: 49, seed: "containers" }
  ],
  Textile: [
    { title: "Plaid en laine mérinos", description: "Tissé en Europe, 130 × 180 cm, coloris brume.", price: 115, seed: "blanket", isFeatured: true },
    { title: "Housse de coussin en lin", description: "Lin lavé, fermeture cachée, 45 × 45 cm.", price: 34, seed: "cushion" },
    { title: "Torchons en coton (lot de 3)", description: "Coton bio, tissage nid d'abeille.", price: 22, seed: "towels" },
    { title: "Nappe en lin lavé", description: "Finition surpiquée, 150 × 250 cm, coloris terracotta.", price: 85, seed: "tablecloth" },
    { title: "Tapis de bain gaufré", description: "100% coton très absorbant, 50 × 80 cm.", price: 28, seed: "mat" },
    { title: "Drap de lit en chanvre", description: "Thermorégulateur et respirant, 240 × 260 cm.", price: 145, seed: "bedsheet" }
  ],
  Bureau: [
    { title: "Lampe de bureau articulée", description: "Métal laqué, ampoule LED incluse, câble textile.", price: 79, seed: "lamp", isFeatured: true },
    { title: "Carnet cousu main A5", description: "Papier 120 g, 192 pages, couverture en toile.", price: 18, seed: "notebook" },
    { title: "Range-câbles en liège", description: "Organise jusqu'à six câbles, fixation adhésive.", price: 15, seed: "cork" },
    { title: "Pot à crayons en céramique", description: "Design épuré, base antidérapante en liège.", price: 21, seed: "pen-holder" },
    { title: "Support d'ordinateur en bois", description: "Ergonomique, contreplaqué de bouleau surélevé.", price: 49, seed: "laptop-stand" },
    { title: "Sous-main en cuir végétal", description: "Surface lisse et confortable, 80 × 40 cm.", price: 39, seed: "desk-pad" }
  ],
  Jardin: [
    { title: "Sécateur d'ergonomie en acier", description: "Lames en acier carboné, poignée antidérapante.", price: 29, seed: "secateur", isFeatured: true },
    { title: "Arrosoir en zinc 5L", description: "Finition brossée, pomme d'arrosage amovible.", price: 38, seed: "wateringcan" },
    { title: "Gants de jardinage en cuir", description: "Protection renforcée, cuir souple et respirant.", price: 19, seed: "gloves" },
    { title: "Transplanteur gradué", description: "Inox robuste avec manche en frêne certifié FSC.", price: 16, seed: "trowel" },
    { title: "Nichoir à oiseaux en bois", description: "Conçu pour petits oiseaux, toit en zinc étanche.", price: 34, seed: "birdhouse" },
    { title: "Lanterne solaire d'extérieur", description: "Structure métal ajouré, allumage automatique.", price: 45, seed: "lantern" }
  ]
};

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD (8 caractères minimum) est requis dans .env pour créer le compte admin.");
  }
  const passwordHash = await hashPassword(adminPassword);

  const users = [
    {
      name: 'Heritiana',
      email: 'rasolomananaheritiana@gmail.com',
      passwordHash: passwordHash,
      role: Role.ADMIN,
      gender: Gender.MALE,
    },
    {
      name: 'Tiana',
      email: 'tiana@gmail.com',
      passwordHash: passwordHash,
      role: Role.STOCK,
      gender: Gender.MALE,
    },
    {
      name: 'Hery',
      email: 'hery@gmail.com',
      passwordHash: passwordHash,
      role: Role.STOCK,
      gender: Gender.MALE,
    },
    {
      name: 'Jean',
      email: 'jean@gmail.com',
      passwordHash: passwordHash,
      role: Role.VENTE,
      gender: Gender.MALE,
    },
    {
      name: 'Navalona',
      email: 'navalona@gmail.com',
      passwordHash: passwordHash,
      role: Role.VENTE,
      gender: Gender.FEMALE,
    },
  ];

  let adminId: string | undefined;

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    if (userData.role === Role.ADMIN) {
      adminId = user.id;
    }
    console.log(`Voatazona / Noforonina ny mpampiasa: ${user.email} (Role: ${user.role})`);
  }

  // Repart d'un catalogue propre : supprime aussi les ventes et l'historique de stock de démonstration.
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  for (const [name, products] of Object.entries(catalog)) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { 
        name, 
        createdById: adminId, 
        updatedById: adminId 
      },
    });

    for (const p of products) {
      await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          imageUrl: img(p.seed),
          isFeatured: p.isFeatured ?? false,
          categoryId: category.id,
          stock: INITIAL_STOCK,
          movements: {
            create: { type: "IN", quantity: INITIAL_STOCK, stockAfter: INITIAL_STOCK, note: "Stock initial" },
          },
        },
      });
    }
  }

  console.log("Seed terminé : catégories, produits (stock 10 chacun) et compte admin créés.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());