import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "storage", "avatars");
const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

// Photos de profil téléversées. Le nom est strictement validé (pas de "../").
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^[\w-]+\.(png|jpg|webp)$/.exec(file);
  if (!m) return new NextResponse("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(DIR, file));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[m[1]],
        // Le nom change à chaque nouvelle photo : cache long sans risque.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
