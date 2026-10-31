import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "À propos" };

// TODO: remplacez ces informations par les vôtres.
const author = {
  name: "Notre démarche",
  role: "Développeur full-stack & fondateur d’Atelier Nord",
  photo: "https://picsum.photos/seed/author/600/700",
  bio: [
    "Bienvenue sur notre boutique en ligne. Issu d’un parcours de dix ans dans la conception de produits numériques, j’ai souhaité donner vie à un projet tangible : Atelier Nord. Ce site a été entièrement conçu et développé par nos soins – de l’architecture de la base de données à l’interface utilisateur – afin de garantir une expérience aussi fluide, sobre et fiable que les objets que nous proposons.",
    "Proposer une sélection restreinte mais rigoureuse de produits durables. Chaque article est fabriqué par des ateliers partenaires de confiance, conçus pour être réparés et faits pour traverser les années à vos côtés.",
  ],
  mission:
    "Proposer peu de produits, mais de bons : fabriqués par des ateliers qu’on connaît, réparables, et pensés pour rester dans une maison pendant des années.",
  stack: [
    { label: "Interface", value: "Next.js (App Router), React, TypeScript, Tailwind CSS" },
    { label: "Données", value: "PostgreSQL, Prisma ORM" },
    { label: "Back-office", value: "Server Actions, validation Zod" },
    { label: "Déploiement", value: "Vercel, Neon" },
  ],
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "X / Twitter", href: "https://x.com/" },
    { label: "bonjour@atelier-nord.com", href: "mailto:bonjour@atelier-nord.com" },
  ],
};

export default function AboutPage() {
  return (
    <div className="container-page py-12 md:py-20">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="relative aspect-[6/7] overflow-hidden rounded-md bg-mist">
            <Image src={author.photo} alt={`Portrait de ${author.name}`} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" priority />
          </div>
        </div>

        <div className="md:col-span-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{author.name}</h1>
          <p className="mt-2 text-lg text-slate">{author.role}</p>

          <div className="mt-8 max-w-prose space-y-4 text-lg leading-relaxed">
            {author.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <section className="mt-12" aria-labelledby="mission">
            <h2 id="mission" className="font-display text-2xl font-bold">Notre mission</h2>
            <p className="mt-3 max-w-prose text-lg leading-relaxed">{author.mission}</p>
          </section>

          <section className="mt-12" aria-labelledby="stack">
            <h2 id="stack" className="font-display text-2xl font-bold">Stack technique</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {author.stack.map((s) => (
                <div key={s.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-semibold">{s.label}</dt>
                  <dd className="text-slate">{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12" aria-labelledby="contact">
            <h2 id="contact" className="font-display text-2xl font-bold">Me retrouver</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {author.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="btn-ghost">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
