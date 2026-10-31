import { prisma } from "@/lib/prisma";
import type { CategoryDTO, ProductDTO } from "@/lib/types";

const withCategory = { category: { select: { name: true } } } as const;

function toDTO(p: {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isFeatured: boolean;
  stock: number;
  categoryId: string;
  category: { name: string };
}): ProductDTO {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: p.category.name,
  };
}

export async function getFeaturedProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { isFeatured: true },
    include: withCategory,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function getAllProducts(): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    include: withCategory,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDTO);
}

export async function getCategories(): Promise<CategoryDTO[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
