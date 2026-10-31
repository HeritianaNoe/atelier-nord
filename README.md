# Atelier Nord — E-commerce Next.js + Admin

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · PostgreSQL · Prisma

## Démarrage

```bash
npm install
cp .env.example .env        # renseignez DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET
npx prisma migrate dev --name init   # ou: npm run db:push
npm run db:seed
npm run dev
```
```bash rehefa manao update seed table
npx prisma db seed
npx prisma db push        # na: npx prisma migrate dev --name user_gender
npm run dev
```
- Boutique : http://localhost:3000
- Admin : http://localhost:3000/admin/products
  - email : `admin@atelier-nord.com`
  - mot de passe : valeur de `ADMIN_PASSWORD`

## Structure

```
prisma/            schema.prisma, seed.ts
lib/               prisma.ts (client singleton), data.ts (requêtes), auth.ts + session.ts (session signée HMAC)
middleware.ts      protège /admin/*
app/(shop)/        accueil (À la Une), /shop, /about, /cart
app/admin/         /login + (panel)/products : liste, new, [id]/edit, Server Actions
components/        Navbar, Footer, CartProvider, ShopCatalog, ProductForm, ...
```

## Notes

- Le panier est stocké côté client (localStorage) ; le paiement n’est pas implémenté.
- Chaque produit du seed a son image dans `public/products/` (SVG). Ajoutez vos photos dans ce dossier et référencez-les par `/products/nom.jpg`, ou collez une URL https dans l’admin.
- Personnalisez la page `/about` (objet `author` en haut du fichier).
- Toute Server Action admin appelle `requireAdmin()` : la protection ne dépend pas seulement du middleware.
"# atelier-nord" 
