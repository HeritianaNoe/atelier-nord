import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

const heroImages = [
  { src: "/products/vase.svg", alt: "Vase en grès posé sur une table en bois", className: "col-span-3 row-span-2" },
  { src: "/products/blanket.svg", alt: "Plaid plié sur un fauteuil", className: "col-span-2 mt-10" },
  { src: "/products/board.svg", alt: "Planche à découper et couteau", className: "col-span-2" },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-14 md:grid-cols-12 md:py-24">
        <div className="md:col-span-6">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Des objets faits pour rester.
          </h1>
          <p className="mt-6 max-w-md text-lg text-slate">
            Grès, noyer, lin et laine : une sélection courte de pièces durables pour la maison, la cuisine et le bureau.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary px-7 py-3 text-base">
              Découvrir la boutique
            </Link>
            <Link href="/about" className="btn-ghost px-7 py-3 text-base">
              Notre démarche
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 md:col-span-6">
          {heroImages.map((img) => (
            <div key={img.src} className={`relative overflow-hidden rounded-md bg-mist ${img.className}`}>
              <div className="relative aspect-[4/5]">
                <Image src={img.src} alt={img.alt} fill priority sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* À la Une */}
      <section className="container-page py-8" aria-labelledby="featured-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="featured-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            À la Une
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-cobalt hover:underline">
            Voir toute la boutique
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="rounded-md border border-dashed border-line p-10 text-center text-slate">
            Aucun produit à la une pour le moment. Marquez un produit comme « à la une » depuis l’administration.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
